import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/common/Navbar";
import { PageTransition } from "@/components/common/PageTransition";

export const metadata: Metadata = {
  title: "CrowdQueue — Skip the Line. Not the Service.",
  description:
    "Real-time virtual queue management system. Join queues remotely, track your position live, and get notified when it's your turn.",
  keywords: ["queue management", "virtual queue", "skip the line", "real-time", "hospital queue", "government queue"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="font-sans antialiased bg-black text-white selection:bg-white/20"
      >
        <Providers>
          <Navbar />
          <main className="pt-20">
            <PageTransition>{children}</PageTransition>
          </main>
        </Providers>
      </body>
    </html>
  );
}
