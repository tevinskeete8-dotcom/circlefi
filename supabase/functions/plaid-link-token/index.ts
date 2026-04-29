import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-04-10",
});

Deno.serve(async (req) => {
  try {
    const authHeader = req.headers.get("Authorization")!;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { circle_id } = await req.json();
    if (!circle_id) {
      return new Response(JSON.stringify({ error: "Missing circle_id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get circle details
    const { data: circle, error: circleError } = await supabase
      .from("circles")
      .select("id, name, contribution_amount, organizer_id")
      .eq("id", circle_id)
      .single();

    if (circleError || !circle) {
      return new Response(JSON.stringify({ error: "Circle not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get organizer's Stripe account
    const { data: organizer } = await supabase
      .from("profiles")
      .select("stripe_account_id")
      .eq("id", circle.organizer_id)
      .single();

    if (!organizer?.stripe_account_id) {
      return new Response(
        JSON.stringify({ error: "Organizer has not completed Stripe onboarding" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get member's Plaid access token
    const { data: plaidConnection } = await supabase
      .from("plaid_connections")
      .select("access_token")
      .eq("user_id", user.id)
      .single();

    if (!plaidConnection?.access_token) {
      return new Response(
        JSON.stringify({ error: "No bank account connected" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get member's Stripe customer ID or create one
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    // Amount in cents
    const amountCents = Math.round(circle.contribution_amount * 100);
    // Pardna platform fee: 1%
    const platformFee = Math.round(amountCents * 0.01);

    // Create ACH payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      customer: customerId,
      payment_method_types: ["us_bank_account"],
      transfer_data: {
        destination: organizer.stripe_account_id,
      },
      application_fee_amount: platformFee,
      metadata: {
        circle_id,
        user_id: user.id,
        circle_name: circle.name,
      },
    });

    // Log contribution attempt
    await supabase.from("contributions").insert({
      circle_id,
      user_id: user.id,
      amount: circle.contribution_amount,
      payment_intent_id: paymentIntent.id,
      status: "pending",
    });

    return new Response(
      JSON.stringify({
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});