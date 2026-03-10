/**
 * Stripe Payment Edge Function
 * Handles payment intents and checkout sessions for B2C account
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno"

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface PaymentRequest {
  action: "create_intent" | "create_checkout" | "get_payment_methods" | "attach_payment_method"
  amount?: number
  currency?: string
  appointmentId?: string
  paymentMethodId?: string
  returnUrl?: string
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

    // Get user profile for Stripe customer
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("email, first_name, last_name, stripe_customer_id")
      .eq("id", user.id)
      .single()

    const body: PaymentRequest = await req.json()
    let response: Record<string, unknown>

    switch (body.action) {
      case "create_intent": {
        if (!body.amount || !body.appointmentId) {
          throw new Error("Missing amount or appointmentId")
        }

        // Get or create Stripe customer
        let customerId = profile?.stripe_customer_id
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: profile?.email || user.email,
            name: `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim(),
            metadata: { supabase_user_id: user.id },
          })
          customerId = customer.id

          // Save customer ID to profile
          await supabaseClient
            .from("profiles")
            .update({ stripe_customer_id: customerId })
            .eq("id", user.id)
        }

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(body.amount * 100), // Convert to cents
          currency: body.currency || "eur",
          customer: customerId,
          metadata: {
            appointment_id: body.appointmentId,
            user_id: user.id,
          },
          automatic_payment_methods: { enabled: true },
        })

        response = {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        }
        break
      }

      case "create_checkout": {
        if (!body.amount || !body.appointmentId || !body.returnUrl) {
          throw new Error("Missing required parameters")
        }

        // Get or create customer
        let customerId = profile?.stripe_customer_id
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: profile?.email || user.email,
            metadata: { supabase_user_id: user.id },
          })
          customerId = customer.id
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          payment_method_types: ["card", "sepa_debit"],
          line_items: [{
            price_data: {
              currency: body.currency || "eur",
              product_data: { name: "Service Gomecano" },
              unit_amount: Math.round(body.amount * 100),
            },
            quantity: 1,
          }],
          mode: "payment",
          success_url: `${body.returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${body.returnUrl}?canceled=true`,
          metadata: {
            appointment_id: body.appointmentId,
            user_id: user.id,
          },
        })

        response = {
          sessionId: session.id,
          url: session.url,
        }
        break
      }

      case "get_payment_methods": {
        if (!profile?.stripe_customer_id) {
          response = { paymentMethods: [] }
          break
        }

        const paymentMethods = await stripe.paymentMethods.list({
          customer: profile.stripe_customer_id,
          type: "card",
        })

        response = {
          paymentMethods: paymentMethods.data.map((pm) => ({
            id: pm.id,
            type: pm.type,
            card: pm.card ? {
              brand: pm.card.brand,
              last4: pm.card.last4,
              expMonth: pm.card.exp_month,
              expYear: pm.card.exp_year,
            } : null,
          })),
        }
        break
      }

      case "attach_payment_method": {
        if (!body.paymentMethodId) {
          throw new Error("Missing paymentMethodId")
        }

        // Get or create customer
        let customerId = profile?.stripe_customer_id
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: profile?.email || user.email,
            metadata: { supabase_user_id: user.id },
          })
          customerId = customer.id

          await supabaseClient
            .from("profiles")
            .update({ stripe_customer_id: customerId })
            .eq("id", user.id)
        }

        // Attach payment method
        await stripe.paymentMethods.attach(body.paymentMethodId, {
          customer: customerId,
        })

        response = { success: true }
        break
      }

      default:
        throw new Error(`Unknown action: ${body.action}`)
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Stripe payment error:", error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
