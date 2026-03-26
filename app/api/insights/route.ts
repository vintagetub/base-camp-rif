import { NextResponse } from "next/server";
import { getInsightsBuffer } from "@/lib/insights";

export async function GET() {
  const insights = getInsightsBuffer();
  return NextResponse.json({
    total: insights.length,
    insights: insights.slice(-100),
  });
}
