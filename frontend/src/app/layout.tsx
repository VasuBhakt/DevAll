import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider, ThemeProvider } from "../providers";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { Footer, ClientOnly } from "@/components";
import { InteractiveBackground } from "@/components/InteractiveBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevAll | Developer Platform",
  description: "All-in-one platform for developers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative overflow-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <ClientOnly>
              <InteractiveBackground />
              <Navbar />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 flex flex-col bg-transparent overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-6 relative">
                    <div className="min-h-full flex flex-col">
                      <div className="flex-1 min-h-[400px]">{children}</div>
                      <Footer />
                    </div>
                  </div>
                </main>
              </div>
            </ClientOnly>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
