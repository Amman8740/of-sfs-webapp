import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/utils/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = await createClient(); // ✅ FIXED
  const resolvedParams = await params;
  const shortCode = resolvedParams.slug;

  return NextResponse.json({
    error: "URL shortener not yet implemented. Please use direct promo link URLs.",
    shortCode: shortCode
  }, { status: 501 });
}
