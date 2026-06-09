import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Master registration keys preset in the database. Each key authenticates
// exactly one institute registration (uniqueness enforced on the column).
const MASTER_KEYS = new Set([
  "04040404",
  "03030303",
  "02020202",
  "01010101",
]);

function slugifyDomain(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 40);
  return `${slug || "institute"}.co.zw`;
}

serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Backend configuration is missing");
    }

    const body = await request.json();
    const {
      name,
      type,
      registration_key,
      phone,
      email,
      address,
      created_by,
    } = body ?? {};

    if (!name || !type || !registration_key || !created_by) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!MASTER_KEYS.has(String(registration_key).trim())) {
      return new Response(
        JSON.stringify({ error: "Invalid master registration key. Contact MedicalEasy to obtain a valid key." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Ensure key not already consumed
    const { data: existing } = await supabase
      .from("institutes")
      .select("id")
      .eq("registration_key", registration_key)
      .maybeSingle();
    if (existing) {
      return new Response(
        JSON.stringify({ error: "This master key has already been used to register an institute." }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build a unique domain
    let domain = slugifyDomain(name);
    let attempt = 0;
    while (attempt < 5) {
      const { data: clash } = await supabase
        .from("institutes")
        .select("id")
        .eq("domain", domain)
        .maybeSingle();
      if (!clash) break;
      attempt += 1;
      domain = slugifyDomain(`${name}${attempt}`);
    }

    const { data: inserted, error: insErr } = await supabase
      .from("institutes")
      .insert({
        name,
        type,
        registration_key,
        status: "approved",
        domain,
        phone: phone || null,
        email: email || null,
        address: address || null,
        created_by,
        approved_by: created_by,
      })
      .select("id, name, domain, status")
      .single();

    if (insErr) throw insErr;

    // Link the creator's profile to the institute and approve it
    await supabase
      .from("profiles")
      .update({
        institute_id: inserted.id,
        approval_status: "approved",
      })
      .eq("id", created_by);

    // Grant the creator a role: pharmacy institutes treat the admin as the pharmacist
    const role = type === "pharmacy" ? "pharmacist" : "admin";
    await supabase
      .from("user_roles")
      .upsert({ user_id: created_by, role }, { onConflict: "user_id,role" });

    return new Response(JSON.stringify({ institute: inserted }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Registration failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});