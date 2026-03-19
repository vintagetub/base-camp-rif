"use client";

import { useState, useRef, useEffect, useCallback, Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Plus,
  Search,
  FileText,
  Accessibility,
  ArrowLeftRight,
  ChevronDown,
  Package,
  Sparkles,
  RotateCcw,
  Barcode,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuoteStore } from "@/lib/store";
import { CHANNEL } from "@/lib/channel";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface ChatAction {
  action: string;
  product?: {
    id: string;
    sku: string;
    name: string;
    brand: string;
    image: string;
    price: string;
  };
  quantity?: number;
  message?: string;
}

interface ProductCardData {
  id: string;
  name: string;
  sku: string;
  brand: string;
  price: string;
  image: string;
  category?: string;
}

interface ComparisonTableData {
  products: Array<{
    id: string;
    name: string;
    brand: string;
    price: string;
    specs: Record<string, string>;
  }>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const STORAGE_KEY = "abg-chat-messages";

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm the ABG Pro Sales Assistant, powered by **Claude**. I can help you:\n\n• **Find products** from 2,400+ bath products across all ABG brands\n• **Look up items** by UPC, Home Depot ID, or part number\n• **Compare options** side by side with detailed specs\n• **Build quotes** for your customers\n\nWhat can I help you with today?",
  timestamp: Date.now(),
};

const QUICK_ACTIONS = [
  {
    label: "Find products",
    icon: Search,
    prompt: "Help me find a product for my customer",
  },
  {
    label: "Build a quote",
    icon: FileText,
    prompt: "I need to build a quote for a bathroom remodel",
  },
  {
    label: "ADA options",
    icon: Accessibility,
    prompt: "Show me ADA-compliant bath products",
  },
  {
    label: "Compare products",
    icon: ArrowLeftRight,
    prompt: "I want to compare bathtub options",
  },
  {
    label: "Look up UPC",
    icon: Barcode,
    prompt: "I need to look up a product by UPC or Home Depot item number",
  },
  {
    label: "Brand overview",
    icon: Package,
    prompt: "Give me an overview of DreamLine's product lineup",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatPrice(price: string | number | undefined): string {
  if (!price) return "";
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(num)) return String(price);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

// ---------------------------------------------------------------------------
// Markdown-like text renderer
// ---------------------------------------------------------------------------
function RichText({ text }: { text: string }) {
  // Split into lines for list handling
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: { type: "ul" | "ol"; items: string[] } | null = null;
  let key = 0;

  const flushList = () => {
    if (!currentList) return;
    const items = currentList.items.map((item, i) => (
      <li key={i} className="ml-4">
        <InlineMarkdown text={item} />
      </li>
    ));
    if (currentList.type === "ul") {
      elements.push(
        <ul key={key++} className="list-disc space-y-0.5 my-1">
          {items}
        </ul>
      );
    } else {
      elements.push(
        <ol key={key++} className="list-decimal space-y-0.5 my-1">
          {items}
        </ol>
      );
    }
    currentList = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Bullet list: •, -, *
    const bulletMatch = line.match(/^\s*[•\-\*]\s+(.+)/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== "ul") {
        flushList();
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(bulletMatch[1]);
      continue;
    }

    // Numbered list: 1. 2. etc.
    const numMatch = line.match(/^\s*\d+[\.\)]\s+(.+)/);
    if (numMatch) {
      if (!currentList || currentList.type !== "ol") {
        flushList();
        currentList = { type: "ol", items: [] };
      }
      currentList.items.push(numMatch[1]);
      continue;
    }

    // Regular text line
    flushList();

    if (line.trim() === "") {
      // Empty line = paragraph break
      if (i > 0 && i < lines.length - 1) {
        elements.push(<div key={key++} className="h-2" />);
      }
    } else {
      elements.push(
        <p key={key++} className="leading-relaxed">
          <InlineMarkdown text={line} />
        </p>
      );
    }
  }

  flushList();

  return <>{elements}</>;
}

/** Render inline markdown: **bold**, *italic*, `code` */
function InlineMarkdown({ text }: { text: string }) {
  // Split on markdown patterns
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let partKey = 0;

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Code: `text`
    const codeMatch = remaining.match(/`(.+?)`/);
    // Italic: *text* (but not **)
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);

    // Find earliest match
    const matches = [
      boldMatch ? { type: "bold", match: boldMatch } : null,
      codeMatch ? { type: "code", match: codeMatch } : null,
      italicMatch ? { type: "italic", match: italicMatch } : null,
    ]
      .filter(Boolean)
      .sort((a, b) => (a!.match.index || 0) - (b!.match.index || 0));

    if (matches.length === 0) {
      parts.push(<Fragment key={partKey++}>{remaining}</Fragment>);
      break;
    }

    const first = matches[0]!;
    const idx = first.match.index || 0;

    // Text before the match
    if (idx > 0) {
      parts.push(
        <Fragment key={partKey++}>{remaining.slice(0, idx)}</Fragment>
      );
    }

    // The formatted text
    if (first.type === "bold") {
      parts.push(
        <strong key={partKey++} className="font-semibold">
          {first.match[1]}
        </strong>
      );
    } else if (first.type === "code") {
      parts.push(
        <code
          key={partKey++}
          className="bg-gray-200 text-gray-800 px-1 py-0.5 rounded text-[11px] font-mono"
        >
          {first.match[1]}
        </code>
      );
    } else {
      parts.push(
        <em key={partKey++} className="italic">
          {first.match[1]}
        </em>
      );
    }

    remaining = remaining.slice(idx + first.match[0].length);
  }

  return <>{parts}</>;
}

// ---------------------------------------------------------------------------
// Parse segments from assistant messages
// ---------------------------------------------------------------------------
type Segment =
  | { type: "text"; content: string }
  | { type: "product-card"; data: ProductCardData }
  | { type: "comparison-table"; data: ComparisonTableData };

function parseMessageSegments(text: string): Segment[] {
  const segments: Segment[] = [];
  // Match both product-card and comparison-table blocks
  const regex = /:::(product-card|comparison-table)\s*\n?([\s\S]*?)\n?:::/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Text before this block
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index).trim();
      if (before) segments.push({ type: "text", content: before });
    }

    const blockType = match[1] as "product-card" | "comparison-table";

    try {
      const data = JSON.parse(match[2].trim());
      if (blockType === "product-card") {
        segments.push({ type: "product-card", data: data as ProductCardData });
      } else {
        segments.push({
          type: "comparison-table",
          data: data as ComparisonTableData,
        });
      }
    } catch {
      segments.push({ type: "text", content: match[0] });
    }

    lastIndex = regex.lastIndex;
  }

  // Remaining text
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex).trim();
    if (remaining) segments.push({ type: "text", content: remaining });
  }

  if (segments.length === 0 && text.trim()) {
    segments.push({ type: "text", content: text });
  }

  return segments;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Inline product card shown inside chat messages */
function InlineProductCard({ data }: { data: ProductCardData }) {
  const addItem = useQuoteStore((s) => s.addItem);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: data.id,
      sku: data.sku,
      name: data.name,
      brand: data.brand,
      image: data.image,
      price: data.price,
    });
  };

  const priceDisplay =
    data.price && data.price !== "Quote Required"
      ? formatPrice(data.price)
      : "Request Quote";

  return (
    <div className="my-2 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      <Link
        href={`/products/${data.id}`}
        className="flex items-center gap-3 p-3"
      >
        {/* Thumbnail */}
        <div className="w-16 h-16 rounded-lg bg-gray-50 flex-shrink-0 overflow-hidden">
          {data.image ? (
            <Image
              src={data.image}
              alt={data.name}
              width={64}
              height={64}
              className="w-full h-full object-contain p-1"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Package className="w-6 h-6" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide">
            {data.brand}
            {data.category && (
              <span className="text-gray-400 ml-1.5 normal-case font-normal">
                {data.category}
              </span>
            )}
          </p>
          <p className="text-sm font-medium text-gray-900 truncate leading-tight group-hover:text-navy transition-colors">
            {data.name}
          </p>
          <p className="text-[11px] text-gray-400 font-mono mt-0.5">
            {data.sku}
          </p>
        </div>

        {/* Price + Add */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="text-sm font-bold text-navy">{priceDisplay}</span>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1 rounded-lg bg-amber px-2.5 py-1 text-[11px] font-semibold text-navy hover:bg-amber-dark hover:text-white transition-colors"
          >
            <Plus className="w-3 h-3" />
            Quote
          </button>
        </div>
      </Link>
    </div>
  );
}

/** Comparison table rendered inline in chat */
function ComparisonTable({ data }: { data: ComparisonTableData }) {
  if (!data.products || data.products.length < 2) return null;

  // Collect all unique spec keys
  const allSpecs = new Set<string>();
  data.products.forEach((p) => {
    Object.keys(p.specs || {}).forEach((k) => allSpecs.add(k));
  });
  const specKeys = Array.from(allSpecs);

  return (
    <div className="my-3 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="bg-navy-50 px-3 py-2 border-b border-gray-200">
        <p className="text-xs font-semibold text-navy flex items-center gap-1.5">
          <ArrowLeftRight className="w-3.5 h-3.5" />
          Product Comparison
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left p-2 text-gray-500 font-medium w-24">
                Feature
              </th>
              {data.products.map((p) => (
                <th key={p.id} className="text-left p-2 font-semibold text-gray-800">
                  <Link
                    href={`/products/${p.id}`}
                    className="hover:text-navy transition-colors"
                  >
                    <span className="text-amber-600 text-[10px] block">
                      {p.brand}
                    </span>
                    {p.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Price row */}
            <tr className="border-b border-gray-50 bg-green-50/40">
              <td className="p-2 text-gray-500 font-medium">Price</td>
              {data.products.map((p) => (
                <td key={p.id} className="p-2 font-bold text-navy">
                  {p.price && p.price !== "Quote Required"
                    ? formatPrice(p.price)
                    : "Request Quote"}
                </td>
              ))}
            </tr>
            {/* Spec rows */}
            {specKeys.map((specKey, i) => (
              <tr
                key={specKey}
                className={cn(
                  "border-b border-gray-50",
                  i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                )}
              >
                <td className="p-2 text-gray-500 font-medium">{specKey}</td>
                {data.products.map((p) => (
                  <td key={p.id} className="p-2 text-gray-800">
                    {p.specs?.[specKey] || "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Message bubble with rich content rendering */
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex gap-2 flex-row-reverse animate-fade-in-up">
        <div className="w-7 h-7 rounded-full bg-navy flex items-center justify-center shrink-0 mt-0.5">
          <User className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-navy text-white px-4 py-2.5 text-sm">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  // Assistant message: parse for product cards and comparison tables
  const segments = parseMessageSegments(message.content);

  return (
    <div className="flex gap-2 flex-row animate-fade-in-up">
      <div className="w-7 h-7 rounded-full bg-navy-50 flex items-center justify-center shrink-0 mt-0.5">
        <Bot className="w-4 h-4 text-navy" />
      </div>
      <div className="max-w-[88%] space-y-1 min-w-0">
        {segments.map((seg, i) => {
          if (seg.type === "product-card") {
            return <InlineProductCard key={i} data={seg.data} />;
          }
          if (seg.type === "comparison-table") {
            return <ComparisonTable key={i} data={seg.data} />;
          }
          return (
            <div
              key={i}
              className="rounded-2xl rounded-bl-md bg-gray-100 text-gray-800 px-4 py-2.5 text-sm"
            >
              <RichText text={seg.content} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading Messages
// ---------------------------------------------------------------------------
const LOADING_MESSAGES = [
  "Thinking...",
  "Searching the catalog...",
  "Finding the best products...",
  "Checking specifications...",
  "Analyzing options...",
  "Comparing products...",
];

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Thinking...");
  const [showScrollButton, setShowScrollButton] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const addItem = useQuoteStore((s) => s.addItem);

  // ---------------------------------------------------------------------------
  // Persistence
  // ---------------------------------------------------------------------------
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Message[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (messages.length > 1 || messages[0]?.id !== "welcome") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch {
        // storage full
      }
    }
  }, [messages]);

  // ---------------------------------------------------------------------------
  // Auto-scroll
  // ---------------------------------------------------------------------------
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    setShowScrollButton(distanceFromBottom > 100);
  }, []);

  // ---------------------------------------------------------------------------
  // Loading text cycle
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isLoading) return;
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length;
      setLoadingText(LOADING_MESSAGES[i]);
    }, 2200);
    return () => clearInterval(interval);
  }, [isLoading]);

  // ---------------------------------------------------------------------------
  // Handle API actions (add_to_quote)
  // ---------------------------------------------------------------------------
  const handleActions = useCallback(
    (actions: ChatAction[]) => {
      for (const action of actions) {
        if (action.action === "add_to_quote" && action.product) {
          addItem({
            id: action.product.id,
            sku: action.product.sku,
            name: action.product.name,
            brand: action.product.brand,
            image: action.product.image,
            price: action.product.price,
          });
        }
      }
    },
    [addItem]
  );

  // ---------------------------------------------------------------------------
  // Send message
  // ---------------------------------------------------------------------------
  const sendMessage = useCallback(
    async (overrideInput?: string) => {
      const text = (overrideInput ?? input).trim();
      if (!text || isLoading) return;

      setInput("");

      const userMsg: Message = {
        id: generateId(),
        role: "user",
        content: text,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      setLoadingText("Thinking...");

      try {
        // Build API messages (role + content only)
        const apiMessages = [
          ...messages.filter((m) => m.id !== "welcome"),
          userMsg,
        ].map((m) => ({ role: m.role, content: m.content }));

        // Send quote items for context
        const quoteItems = useQuoteStore.getState().items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          sku: item.sku,
          brand: item.brand,
        }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages, quoteItems }),
        });

        if (!res.ok) throw new Error("Failed to get response");

        const data = await res.json();

        const assistantMsg: Message = {
          id: generateId(),
          role: "assistant",
          content:
            data.message ||
            "I had trouble generating a response. Please try again.",
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMsg]);

        if (data.actions && Array.isArray(data.actions)) {
          handleActions(data.actions);
        }
      } catch {
        const errorMsg: Message = {
          id: generateId(),
          role: "assistant",
          content:
            `Sorry, I'm having trouble connecting right now. Please try again or contact **${CHANNEL.quoteEmail}** for assistance.`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages, handleActions]
  );

  // ---------------------------------------------------------------------------
  // Quick action
  // ---------------------------------------------------------------------------
  const handleQuickAction = useCallback(
    (prompt: string) => {
      sendMessage(prompt);
    },
    [sendMessage]
  );

  // ---------------------------------------------------------------------------
  // State checks
  // ---------------------------------------------------------------------------
  const isConversationEmpty =
    messages.length === 1 && messages[0]?.id === "welcome";

  const clearConversation = useCallback(() => {
    setMessages([{ ...WELCOME_MESSAGE, timestamp: Date.now() }]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open chat assistant"}
        className={cn(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-navy/40 focus:ring-offset-2",
          isOpen
            ? "bg-gray-700 rotate-0"
            : "bg-navy animate-pulse-soft"
        )}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Chat Panel */}
      <div
        className={cn(
          "fixed z-50 bg-white flex flex-col transition-all duration-300 origin-bottom-right",
          "bottom-24 right-6 w-[440px] max-w-[calc(100vw-3rem)] rounded-2xl shadow-chat border border-gray-200",
          "max-[640px]:inset-0 max-[640px]:bottom-0 max-[640px]:right-0 max-[640px]:w-full max-[640px]:max-w-full max-[640px]:rounded-none max-[640px]:border-0",
          isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        )}
        style={{ height: "min(650px, calc(100vh - 8rem))" }}
      >
        {/* Header */}
        <div className="bg-navy text-white rounded-t-2xl max-[640px]:rounded-t-none px-4 py-3 flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm leading-tight">
              ABG Pro Sales Assistant
            </h3>
            <p className="text-[11px] text-white/50">
              Powered by Claude
            </p>
          </div>
          {/* Clear conversation */}
          {!isConversationEmpty && (
            <button
              onClick={clearConversation}
              className="text-white/40 hover:text-white/80 transition-colors p-1.5 rounded-lg hover:bg-white/10"
              title="New conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          {/* Close (mobile) */}
          <button
            onClick={() => setIsOpen(false)}
            className="min-[641px]:hidden w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
            aria-label="Close chat"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Messages Area */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {/* Quick action chips */}
          {isConversationEmpty && !isLoading && (
            <div className="flex flex-wrap gap-2 pt-2 animate-fade-in-up">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.prompt)}
                    className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-700 hover:border-navy/30 hover:bg-navy-50 hover:text-navy transition-all shadow-sm"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {action.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-2 animate-fade-in-up">
              <div className="w-7 h-7 rounded-full bg-navy-50 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-navy" />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-navy/50" />
                <span className="text-xs text-gray-500">{loadingText}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to bottom */}
        {showScrollButton && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
            <button
              onClick={scrollToBottom}
              className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Scroll to bottom"
            >
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 border-t border-gray-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about products, specs, UPCs, or quotes..."
              className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy transition-colors"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-navy text-white rounded-xl p-2.5 hover:bg-navy-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
