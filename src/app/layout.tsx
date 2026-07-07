import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Community Invest Voting",
  description: "Die Community stimmt ab, in welche Assets investiert wird.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Nav />
        <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8">{children}</main>
        <footer className="text-center text-sm py-6" style={{ color: "var(--muted)" }}>
          Community Invest Voting
        </footer>
      </body>
    </html>
  );
}
