import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      quoteRef,
      items,
      subtotal,
      repName,
      storeNumber,
      customerName,
      projectRef,
      notes,
      email,
    } = body;

    // Build email content
    const itemLines = items
      .map(
        (item: {
          sku: string;
          name: string;
          brand: string;
          quantity: number;
          price: string;
        }) =>
          `- ${item.name} (SKU: ${item.sku}) | Brand: ${item.brand} | Qty: ${item.quantity} | Price: ${item.price ? `$${item.price}` : "TBD"}`
      )
      .join("\n");

    const emailBody = `
NEW QUOTE REQUEST - ${quoteRef}
====================================

Sales Rep: ${repName}
Store Number: ${storeNumber}
Email: ${email}
${customerName ? `Customer: ${customerName}` : ""}
${projectRef ? `Project/PO: ${projectRef}` : ""}

Date: ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })}

LINE ITEMS:
${itemLines}

Estimated Total: $${subtotal.toFixed(2)}

${notes ? `NOTES:\n${notes}` : ""}
====================================
Submitted via ABG Pro Sales Portal
    `.trim();

    // Try to send email via Resend if API key exists
    if (process.env.RESEND_API_KEY) {
      try {
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "ABG Pro Sales <onboarding@resend.dev>",
            to: [process.env.QUOTE_EMAIL_TO || "iamgeorgekelly@gmail.com"],
            subject: `Quote Request ${quoteRef} - ${repName} (Store #${storeNumber})`,
            text: emailBody,
            reply_to: email,
          }),
        });

        if (!resendRes.ok) {
          console.error("Resend API error:", await resendRes.text());
        }
      } catch (emailErr) {
        console.error("Email send error:", emailErr);
      }
    } else {
      // Log to console for development
      console.log("=== QUOTE SUBMISSION ===");
      console.log(emailBody);
      console.log("========================");
    }

    return NextResponse.json({
      success: true,
      quoteRef,
      message: "Quote submitted successfully",
    });
  } catch (error) {
    console.error("Quote submission error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit quote" },
      { status: 500 }
    );
  }
}
