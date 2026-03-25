import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "@/components/ClientLayout";
import { CHANNEL } from "@/lib/channel";

export const metadata: Metadata = {
  title: CHANNEL.id !== "all"
    ? `${CHANNEL.portalName} | American Bath Group`
    : "ABG Pro Sales Portal | American Bath Group",
  description:
    CHANNEL.id !== "all"
      ? `${CHANNEL.name} product catalog and quote builder for inside sales teams. Browse bath products from ${CHANNEL.brands.join(", ")}.`
      : "Product catalog and quote builder for inside sales teams. Browse bath products from Aquatic, Bootz, Dreamline, MAAX, Swan, American Standard, and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased overflow-x-hidden">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
