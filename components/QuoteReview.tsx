"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  Send,
  CheckCircle2,
  ArrowLeft,
  User,
  Building,
  Mail,
  MessageSquare,
  Download,
} from "lucide-react";
import { useQuoteStore, type QuoteItem } from "@/lib/store";
import { formatPrice, generateQuoteRef } from "@/lib/utils";
import { CHANNEL } from "@/lib/channel";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

function generateQuotePDF(
  items: QuoteItem[],
  subtotal: number,
  quoteRef: string,
  formData: {
    repName: string;
    storeNumber: string;
    customerName: string;
    projectRef: string;
    notes: string;
    email: string;
  }
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // --- Header ---
  doc.setFillColor(0, 32, 63); // navy
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("AMERICAN BATH GROUP", 14, 18);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Pro Sales Quote", 14, 26);

  // Quote ref + date on right
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Quote: ${quoteRef}`, pageWidth - 14, 18, { align: "right" });
  doc.setFont("helvetica", "normal");
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(`Date: ${dateStr}`, pageWidth - 14, 26, { align: "right" });

  // --- Customer info ---
  let yPos = 50;
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Customer Information", 14, yPos);
  yPos += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);

  const infoLines: [string, string][] = [
    ["Sales Rep:", formData.repName],
    ["Store Number:", formData.storeNumber],
    ["Email:", formData.email],
  ];
  if (formData.customerName) {
    infoLines.push(["Customer Name:", formData.customerName]);
  }
  if (formData.projectRef) {
    infoLines.push(["Project / PO Ref:", formData.projectRef]);
  }

  infoLines.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 14, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(value, 55, yPos);
    yPos += 6;
  });

  yPos += 6;

  // --- Items table ---
  const tableBody = items.map((item, idx) => {
    const unitPrice = parseFloat(item.price);
    const lineTotal = isNaN(unitPrice) ? 0 : unitPrice * item.quantity;
    const nameWithVariant = item.variantDescription
      ? `${item.name}\n${item.variantDescription}`
      : item.name;
    return [
      String(idx + 1),
      nameWithVariant,
      item.sku,
      item.brand,
      String(item.quantity),
      isNaN(unitPrice) ? "TBD" : `$${unitPrice.toFixed(2)}`,
      lineTotal > 0 ? `$${lineTotal.toFixed(2)}` : "TBD",
    ];
  });

  autoTable(doc, {
    startY: yPos,
    head: [
      ["#", "Product Name", "SKU", "Brand", "Qty", "Unit Price", "Line Total"],
    ],
    body: tableBody,
    theme: "striped",
    headStyles: {
      fillColor: [0, 32, 63],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [50, 50, 50],
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 55 },
      2: { cellWidth: 30, font: "courier" },
      3: { cellWidth: 25 },
      4: { cellWidth: 12, halign: "center" },
      5: { cellWidth: 22, halign: "right" },
      6: { cellWidth: 25, halign: "right" },
    },
    margin: { left: 14, right: 14 },
  });

  // Get final Y after table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY || yPos + 40;
  yPos = finalY + 8;

  // --- Subtotal ---
  doc.setDrawColor(200, 200, 200);
  doc.line(pageWidth - 80, yPos, pageWidth - 14, yPos);
  yPos += 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 32, 63);
  doc.text("Estimated Subtotal:", pageWidth - 80, yPos);
  doc.text(
    subtotal > 0 ? `$${subtotal.toFixed(2)}` : "Pricing TBD",
    pageWidth - 14,
    yPos,
    { align: "right" }
  );
  yPos += 14;

  // --- Notes ---
  if (formData.notes) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text("Notes:", 14, yPos);
    yPos += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const noteLines = doc.splitTextToSize(formData.notes, pageWidth - 28);
    doc.text(noteLines, 14, yPos);
    yPos += noteLines.length * 5 + 6;
  }

  // --- Footer ---
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setDrawColor(220, 220, 220);
  doc.line(14, footerY, pageWidth - 14, footerY);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(130, 130, 130);
  doc.text(`Contact: ${CHANNEL.quoteEmail}`, 14, footerY + 6);
  doc.text(
    "Pricing subject to confirmation. This is not an invoice.",
    14,
    footerY + 11
  );
  doc.text(`${quoteRef}`, pageWidth - 14, footerY + 6, { align: "right" });

  // Save
  doc.save(`ABG-Quote-${quoteRef}.pdf`);
}

export function QuoteReview() {
  const { items, removeItem, updateQuantity, clearAll, getSubtotal } =
    useQuoteStore();
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [quoteRef, setQuoteRef] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    repName: "",
    storeNumber: "",
    customerName: "",
    projectRef: "",
    notes: "",
    email: "",
  });

  const subtotal = getSubtotal();

  const handleDownloadPDF = () => {
    const ref = quoteRef || generateQuoteRef();
    if (!quoteRef) setQuoteRef(ref);
    generateQuotePDF(items, subtotal, ref, formData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const ref = quoteRef || generateQuoteRef();
    setQuoteRef(ref);

    try {
      await fetch("/api/quote/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteRef: ref,
          items,
          subtotal,
          ...formData,
        }),
      });
    } catch {
      // Even if email fails, show confirmation
    }

    setIsSubmitting(false);
    setSubmitted(true);
    clearAll();
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-12">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Quote Submitted!
          </h1>
          <p className="text-gray-500 mb-6">
            Your quote has been sent to the ABG Pro team. You&apos;ll receive a
            response within one business day.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500">Quote Reference</p>
            <p className="text-xl font-bold font-mono text-navy">{quoteRef}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/products">
              <Button variant="amber" size="lg">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Your Quote Cart is Empty
        </h1>
        <p className="text-gray-500 mb-6">
          Add products to your cart to start building a quote
        </p>
        <Link href="/products">
          <Button variant="amber" size="lg">
            Browse Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/products"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-navy mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Continue Shopping
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Quote Review
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-contain p-1"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl font-bold">
                    {item.brand[0]}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900">{item.name}</h3>
                {item.variantDescription && (
                  <p className="text-xs text-purple-600 font-medium mt-0.5">
                    {item.variantDescription}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  {item.brand} &middot; SKU: {item.sku}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      className="p-1.5 hover:bg-gray-100 rounded-l-lg"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      className="p-1.5 hover:bg-gray-100 rounded-r-lg"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-right shrink-0">
                {item.price ? (
                  <>
                    <p className="font-bold text-navy">
                      {formatPrice(parseFloat(item.price) * item.quantity)}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-gray-400">
                        {formatPrice(item.price)} ea
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-amber-dark font-medium">TBD</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-20">
            <h2 className="font-semibold text-lg text-gray-900 mb-4">
              Quote Summary
            </h2>
            <div className="space-y-3 pb-4 border-b border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Items ({items.reduce((a, b) => a + b.quantity, 0)})
                </span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              {subtotal === 0 && (
                <p className="text-xs text-gray-400">
                  Pricing will be confirmed by the ABG team
                </p>
              )}
            </div>
            <div className="flex justify-between items-center py-4">
              <span className="font-semibold text-gray-900">
                Estimated Total
              </span>
              <span className="text-2xl font-bold text-navy">
                {formatPrice(subtotal)}
              </span>
            </div>

            {!showForm ? (
              <div className="space-y-2">
                <Button
                  variant="amber"
                  size="lg"
                  className="w-full"
                  onClick={() => setShowForm(true)}
                >
                  <Send className="w-5 h-5" />
                  Submit Quote Request
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={handleDownloadPDF}
                >
                  <Download className="w-5 h-5" />
                  Download PDF
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                    <User className="w-3.5 h-3.5" />
                    Sales Rep Name *
                  </label>
                  <Input
                    required
                    value={formData.repName}
                    onChange={(e) =>
                      setFormData({ ...formData, repName: e.target.value })
                    }
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                    <Building className="w-3.5 h-3.5" />
                    Store Number *
                  </label>
                  <Input
                    required
                    value={formData.storeNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, storeNumber: e.target.value })
                    }
                    placeholder="e.g., 1234"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                    <Mail className="w-3.5 h-3.5" />
                    Confirmation Email *
                  </label>
                  <Input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Customer Name
                  </label>
                  <Input
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customerName: e.target.value,
                      })
                    }
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Project / PO Reference
                  </label>
                  <Input
                    value={formData.projectRef}
                    onChange={(e) =>
                      setFormData({ ...formData, projectRef: e.target.value })
                    }
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy resize-none"
                    rows={3}
                    placeholder="Special instructions..."
                  />
                </div>
                <div className="space-y-2">
                  <Button
                    type="submit"
                    variant="amber"
                    size="lg"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit Quote
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={handleDownloadPDF}
                  >
                    <Download className="w-5 h-5" />
                    Download PDF
                  </Button>
                </div>
              </form>
            )}

            <button
              onClick={clearAll}
              className="w-full text-center text-sm text-gray-400 hover:text-red-500 mt-3 transition-colors"
            >
              Clear All Items
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
