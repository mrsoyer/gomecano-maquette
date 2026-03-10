/**
 * Send Notification Edge Function
 * Handles multi-channel notifications (push, email, SMS) for B2C account
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface NotificationRequest {
  userId: string
  type: "appointment_reminder" | "appointment_confirmed" | "appointment_completed" | "payment_received" | "loyalty_points" | "custom"
  channels: Array<"push" | "email" | "sms" | "in_app">
  data: {
    title?: string
    message: string
    appointmentId?: string
    amount?: number
    points?: number
    actionUrl?: string
    [key: string]: unknown
  }
}

interface SendGridEmail {
  to: string
  from: string
  subject: string
  html: string
}

interface TwilioSMS {
  to: string
  from: string
  body: string
}

// Email templates by notification type
const emailTemplates: Record<string, (data: NotificationRequest["data"], userName: string) => { subject: string; html: string }> = {
  appointment_reminder: (data, userName) => ({
    subject: "Rappel de votre rendez-vous Gomecano",
    html: `
      <h1>Bonjour ${userName},</h1>
      <p>${data.message}</p>
      <p><a href="${data.actionUrl || "https://gomecano.fr/account/appointments"}">Voir mon rendez-vous</a></p>
      <p>L'équipe Gomecano</p>
    `,
  }),
  appointment_confirmed: (data, userName) => ({
    subject: "Votre rendez-vous est confirmé !",
    html: `
      <h1>Bonjour ${userName},</h1>
      <p>Bonne nouvelle ! ${data.message}</p>
      <p><a href="${data.actionUrl || "https://gomecano.fr/account/appointments"}">Voir les détails</a></p>
      <p>L'équipe Gomecano</p>
    `,
  }),
  appointment_completed: (data, userName) => ({
    subject: "Intervention terminée",
    html: `
      <h1>Bonjour ${userName},</h1>
      <p>${data.message}</p>
      <p><a href="${data.actionUrl || "https://gomecano.fr/account/appointments"}">Laisser un avis</a></p>
      <p>L'équipe Gomecano</p>
    `,
  }),
  payment_received: (data, userName) => ({
    subject: "Paiement reçu - Gomecano",
    html: `
      <h1>Bonjour ${userName},</h1>
      <p>Nous avons bien reçu votre paiement de ${data.amount}€.</p>
      <p>${data.message}</p>
      <p><a href="${data.actionUrl || "https://gomecano.fr/account/payments"}">Voir mes factures</a></p>
      <p>L'équipe Gomecano</p>
    `,
  }),
  loyalty_points: (data, userName) => ({
    subject: `Vous avez gagné ${data.points} points fidélité !`,
    html: `
      <h1>Félicitations ${userName} !</h1>
      <p>${data.message}</p>
      <p>Vous avez maintenant ${data.points} points.</p>
      <p><a href="${data.actionUrl || "https://gomecano.fr/account/loyalty"}">Voir mes récompenses</a></p>
      <p>L'équipe Gomecano</p>
    `,
  }),
  custom: (data, userName) => ({
    subject: data.title || "Notification Gomecano",
    html: `
      <h1>Bonjour ${userName},</h1>
      <p>${data.message}</p>
      ${data.actionUrl ? `<p><a href="${data.actionUrl}">En savoir plus</a></p>` : ""}
      <p>L'équipe Gomecano</p>
    `,
  }),
}

async function sendEmail(email: SendGridEmail): Promise<boolean> {
  const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY")
  if (!sendgridApiKey) {
    console.warn("SendGrid API key not configured")
    return false
  }

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sendgridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: email.to }] }],
        from: { email: email.from },
        subject: email.subject,
        content: [{ type: "text/html", value: email.html }],
      }),
    })

    return response.ok
  } catch (error) {
    console.error("SendGrid error:", error)
    return false
  }
}

async function sendSMS(sms: TwilioSMS): Promise<boolean> {
  const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID")
  const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN")
  if (!twilioSid || !twilioToken) {
    console.warn("Twilio credentials not configured")
    return false
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${btoa(`${twilioSid}:${twilioToken}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: sms.to,
          From: sms.from,
          Body: sms.body,
        }),
      }
    )

    return response.ok
  } catch (error) {
    console.error("Twilio error:", error)
    return false
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // This function can be called internally (from triggers) or with service role
    const authHeader = req.headers.get("Authorization")

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    )

    const body: NotificationRequest = await req.json()

    // Fetch user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("email, phone, first_name, last_name, notification_preferences")
      .eq("id", body.userId)
      .single()

    if (profileError || !profile) {
      throw new Error("User not found")
    }

    const userName = `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Client"
    const results: Record<string, boolean> = {}

    // Get user notification preferences
    const prefs = profile.notification_preferences as Record<string, boolean> | null

    // Process each channel
    for (const channel of body.channels) {
      // Check if user has disabled this channel
      if (prefs && prefs[`${channel}_enabled`] === false) {
        results[channel] = false
        continue
      }

      switch (channel) {
        case "in_app": {
          // Create in-app notification
          const { error: insertError } = await supabaseAdmin
            .from("notifications")
            .insert({
              user_id: body.userId,
              type: body.type,
              title: body.data.title || emailTemplates[body.type]?.(body.data, userName).subject || "Notification",
              message: body.data.message,
              data: body.data,
            })

          results.in_app = !insertError
          break
        }

        case "email": {
          if (!profile.email) {
            results.email = false
            break
          }

          const template = emailTemplates[body.type]?.(body.data, userName) || emailTemplates.custom(body.data, userName)
          results.email = await sendEmail({
            to: profile.email,
            from: Deno.env.get("SENDGRID_FROM_EMAIL") || "noreply@gomecano.fr",
            subject: template.subject,
            html: template.html,
          })
          break
        }

        case "sms": {
          if (!profile.phone) {
            results.sms = false
            break
          }

          results.sms = await sendSMS({
            to: profile.phone,
            from: Deno.env.get("TWILIO_PHONE_NUMBER") || "",
            body: `Gomecano: ${body.data.message}`,
          })
          break
        }

        case "push": {
          // Push notifications would require Firebase/OneSignal integration
          // For now, log and mark as not implemented
          console.log("Push notification requested but not implemented:", body.data)
          results.push = false
          break
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        message: "Notifications processed",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Notification error:", error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
