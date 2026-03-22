"use client";

import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { QuoteDrawer } from "./QuoteDrawer";
import { ChatWidget } from "./ChatWidget";
import { ThemeProvider } from "./ThemeProvider";
import { AnnouncementBar } from "./AnnouncementBar";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-amber focus:text-navy focus:px-4 focus:py-2 focus:rounded-lg focus:font-medium"
      >
        Skip to main content
      </a>
      <AnnouncementBar />
      <Navbar />
      <main id="main-content" className="min-h-screen">{children}</main>
      <QuoteDrawer />
      <ChatWidget />
      <Footer />
    </ThemeProvider>
  );
}
