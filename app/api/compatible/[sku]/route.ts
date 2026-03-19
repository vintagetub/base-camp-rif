import { NextRequest, NextResponse } from "next/server";

const ORCA_BASE = "https://orca-ABG-Web-ops.replit.app";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sku: string }> }
) {
  const { sku } = await params;
  const searchParams = request.nextUrl.searchParams;
  const parentSku = searchParams.get("parent_sku") || "";
  const uniqueId = searchParams.get("unique_id") || "";

  try {
    const url = new URL(
      `/api/compatible/${encodeURIComponent(sku)}`,
      ORCA_BASE
    );
    if (parentSku) url.searchParams.set("parent_sku", parentSku);
    if (uniqueId) url.searchParams.set("unique_id", uniqueId);

    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Orca API error", status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to reach compatibility service" },
      { status: 502 }
    );
  }
}
