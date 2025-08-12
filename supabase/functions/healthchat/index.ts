// Supabase Edge Function: healthchat
// Proxies chat to Perplexity API with healthcare safety guardrails

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { ...corsHeaders } });
  }

  try {
    const { messages = [] } = await req.json().catch(() => ({ messages: [] }));
    const apiKey = Deno.env.get("PERPLEXITY_API_KEY");

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing Perplexity API key" }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 400,
      });
    }

    const system = {
      role: "system",
      content:
        "You are Serene, a healthcare assistant. Provide concise, empathetic, evidence-informed guidance. Include brief disclaimers when advice could impact safety. Never replace professional medical care. Encourage consulting a clinician when appropriate.",
    };

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [system, ...messages],
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 800,
        frequency_penalty: 1,
        presence_penalty: 0,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      return new Response(JSON.stringify({ error: "Upstream error", details: t }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 500,
      });
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content ?? "Sorry, I couldn't find an answer.";

    return new Response(JSON.stringify({ content: text }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Unexpected error", details: String(e) }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 500,
    });
  }
});
