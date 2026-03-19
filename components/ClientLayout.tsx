"use client";

import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { QuoteDrawer } from "./QuoteDrawer";
import { ChatWidget } from "./ChatWidget";
import { ThemeProvider } from "./ThemeProvider";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <QuoteDrawer />
      <ChatWidget />
      <Footer />
    </ThemeProvider>
  );
}
