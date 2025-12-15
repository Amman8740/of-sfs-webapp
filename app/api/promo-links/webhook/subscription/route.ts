import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/utils/supabase/server";

export async function POST(req: NextRequest) {
  const secret = process.env.PROMO_WEBHOOK_SECRET;
  const incoming = req.headers.get("x-promo-webhook-secret");

  if (!secret || incoming !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const body = await req.json();
  const { short_code, event_type, amount, occurred_at } = body;

  const date = occurred_at
    ? occurred_at.slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  // 1️⃣ Get Promo Link
  const { data: promo, error: promoErr } = await supabase
    .from("promo_links")
    .select("id")
    .eq("short_code", short_code)
    .maybeSingle();

  if (promoErr || !promo) {
    console.error("❌ Promo lookup error:", promoErr);
    return NextResponse.json({ error: "Promo not found" }, { status: 404 });
  }

  // 2️⃣ Insert analytics WITHOUT amount
  const { error: analyticsErr } = await supabase
    .from("promo_link_analytics")
    .insert({
      promo_link_id: promo.id,
      event_type,
      occurred_at: date
    });

  if (analyticsErr) {
    console.error("❌ Analytics insert error:", analyticsErr);
  }

  // 3️⃣ Correct RPC arg names (your actual SQL functions)
  let rpcArgs: any = {
    p_promo_link_id: promo.id,
    p_day: date
  };

  if (event_type === "conversion") {
    rpcArgs.p_revenue = amount || 0;
  }

  const rpcMap: Record<string, string> = {
    new_fan: "increment_new_fan",
    renewal: "increment_renewal",
    conversion: "increment_conversion",
  };

  const rpcName = rpcMap[event_type];

  if (rpcName) {
    const { error: rpcErr } = await supabase.rpc(rpcName, rpcArgs);

    if (rpcErr) {
      console.error(`❌ RPC ${rpcName} failed:`, rpcErr);
    } else {
      console.log(`✅ RPC ${rpcName} executed`);
    }
  }

  return NextResponse.json({
    success: true,
    promo_link_id: promo.id,
    message: "Webhook processed"
  });
}
