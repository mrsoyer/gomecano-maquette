/**
 * Generate PDF Edge Function
 * Generates PDF documents (invoices, quotes, reports) for B2C account
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface PDFRequest {
  type: "invoice" | "quote" | "appointment_summary" | "vehicle_report"
  id: string
  locale?: string
}

interface InvoiceData {
  invoice_number: string
  created_at: string
  amount: number
  status: string
  client: {
    first_name: string
    last_name: string
    email: string
    address?: string
  }
  appointment: {
    scheduled_at: string
    service_name: string
    vehicle: string
  }
  line_items: Array<{
    description: string
    quantity: number
    unit_price: number
    total: number
  }>
}

// Simple HTML to PDF conversion using browser-like rendering
function generateInvoiceHTML(data: InvoiceData, locale: string): string {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  return `
    <!DOCTYPE html>
    <html lang="${locale}">
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
        .invoice-info { text-align: right; }
        .invoice-number { font-size: 20px; font-weight: bold; }
        .client-section { margin-bottom: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; }
        .section-title { font-size: 14px; color: #666; margin-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #2563eb; color: white; padding: 12px; text-align: left; }
        td { padding: 12px; border-bottom: 1px solid #eee; }
        .total-row { font-weight: bold; font-size: 18px; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">GOMECANO</div>
        <div class="invoice-info">
          <div class="invoice-number">Facture ${data.invoice_number}</div>
          <div>Date: ${formatDate(data.created_at)}</div>
          <div>Statut: ${data.status}</div>
        </div>
      </div>

      <div class="client-section">
        <div class="section-title">Client</div>
        <div><strong>${data.client.first_name} ${data.client.last_name}</strong></div>
        <div>${data.client.email}</div>
        ${data.client.address ? `<div>${data.client.address}</div>` : ""}
      </div>

      <div>
        <div class="section-title">Intervention</div>
        <div>Date: ${formatDate(data.appointment.scheduled_at)}</div>
        <div>Service: ${data.appointment.service_name}</div>
        <div>Véhicule: ${data.appointment.vehicle}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Quantité</th>
            <th>Prix unitaire</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${data.line_items.map((item) => `
            <tr>
              <td>${item.description}</td>
              <td>${item.quantity}</td>
              <td>${formatCurrency(item.unit_price)}</td>
              <td>${formatCurrency(item.total)}</td>
            </tr>
          `).join("")}
          <tr class="total-row">
            <td colspan="3" style="text-align: right;">Total TTC</td>
            <td>${formatCurrency(data.amount)}</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        <p>Gomecano SAS - SIRET: XXX XXX XXX XXXXX - TVA: FR XX XXXXXXXXX</p>
        <p>contact@gomecano.fr - www.gomecano.fr</p>
      </div>
    </body>
    </html>
  `
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      throw new Error("Missing authorization header")
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      throw new Error("Unauthorized")
    }

    const body: PDFRequest = await req.json()
    const locale = body.locale || "fr-FR"

    let htmlContent: string
    let fileName: string

    switch (body.type) {
      case "invoice": {
        // Fetch invoice data
        const { data: invoice, error: invoiceError } = await supabaseClient
          .from("invoices")
          .select(`
            *,
            client:profiles!client_id(first_name, last_name, email),
            appointment:appointments(
              scheduled_at,
              service:services(name),
              vehicle:vehicles(
                license_plate,
                make:vehicle_makes(name),
                model:vehicle_models(name)
              )
            )
          `)
          .eq("id", body.id)
          .eq("client_id", user.id)
          .single()

        if (invoiceError || !invoice) {
          throw new Error("Invoice not found or access denied")
        }

        const invoiceData: InvoiceData = {
          invoice_number: invoice.invoice_number,
          created_at: invoice.created_at,
          amount: invoice.amount,
          status: invoice.status,
          client: {
            first_name: invoice.client?.first_name || "",
            last_name: invoice.client?.last_name || "",
            email: invoice.client?.email || "",
          },
          appointment: {
            scheduled_at: invoice.appointment?.scheduled_at || "",
            service_name: invoice.appointment?.service?.name || "Service",
            vehicle: invoice.appointment?.vehicle
              ? `${invoice.appointment.vehicle.make?.name} ${invoice.appointment.vehicle.model?.name} - ${invoice.appointment.vehicle.license_plate}`
              : "N/A",
          },
          line_items: invoice.line_items || [{
            description: invoice.appointment?.service?.name || "Service mécanique",
            quantity: 1,
            unit_price: invoice.amount,
            total: invoice.amount,
          }],
        }

        htmlContent = generateInvoiceHTML(invoiceData, locale)
        fileName = `facture-${invoice.invoice_number}.pdf`
        break
      }

      case "quote": {
        // Fetch quote data
        const { data: quote, error: quoteError } = await supabaseClient
          .from("quotes")
          .select(`
            *,
            client:profiles!client_id(first_name, last_name, email),
            service:services(name)
          `)
          .eq("id", body.id)
          .eq("client_id", user.id)
          .single()

        if (quoteError || !quote) {
          throw new Error("Quote not found or access denied")
        }

        // Simple quote HTML
        htmlContent = `
          <!DOCTYPE html>
          <html><head><style>
            body { font-family: Arial; padding: 40px; }
            .header { margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
          </style></head>
          <body>
            <div class="header"><div class="logo">GOMECANO</div></div>
            <h1>Devis ${quote.quote_number}</h1>
            <p>Date: ${new Date(quote.created_at).toLocaleDateString(locale)}</p>
            <p>Service: ${quote.service?.name || "Service"}</p>
            <p>Montant: ${quote.total_amount}€</p>
            <p>Valide jusqu'au: ${new Date(quote.valid_until).toLocaleDateString(locale)}</p>
          </body></html>
        `
        fileName = `devis-${quote.quote_number}.pdf`
        break
      }

      case "appointment_summary": {
        // Fetch appointment data
        const { data: appointment, error: appointmentError } = await supabaseClient
          .from("appointments")
          .select(`
            *,
            service:services(name),
            vehicle:vehicles(license_plate, make:vehicle_makes(name), model:vehicle_models(name)),
            mechanic:mechanics(profile:profiles(first_name, last_name))
          `)
          .eq("id", body.id)
          .eq("client_id", user.id)
          .single()

        if (appointmentError || !appointment) {
          throw new Error("Appointment not found or access denied")
        }

        htmlContent = `
          <!DOCTYPE html>
          <html><head><style>
            body { font-family: Arial; padding: 40px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 30px; }
          </style></head>
          <body>
            <div class="logo">GOMECANO</div>
            <h1>Récapitulatif d'intervention</h1>
            <p>Date: ${new Date(appointment.scheduled_at).toLocaleDateString(locale)}</p>
            <p>Service: ${appointment.service?.name || "Service"}</p>
            <p>Véhicule: ${appointment.vehicle?.make?.name} ${appointment.vehicle?.model?.name} - ${appointment.vehicle?.license_plate}</p>
            <p>Statut: ${appointment.status}</p>
            ${appointment.mechanic ? `<p>Mécanicien: ${appointment.mechanic.profile?.first_name} ${appointment.mechanic.profile?.last_name}</p>` : ""}
          </body></html>
        `
        fileName = `intervention-${body.id.substring(0, 8)}.pdf`
        break
      }

      default:
        throw new Error(`Unknown document type: ${body.type}`)
    }

    // Return HTML for now - in production, use a PDF generation service
    // like Puppeteer, wkhtmltopdf, or a third-party API
    return new Response(
      JSON.stringify({
        html: htmlContent,
        fileName,
        message: "PDF generation requires a PDF service. HTML content provided for preview.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("PDF generation error:", error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
