import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Invest Voting – Die Community entscheidet",
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
        <main className="w-full max-w-3xl mx-auto flex-1 px-4 py-8">{children}</main>
        <footer
          className="border-t py-6 text-center text-sm"
          style={{ color: "var(--faint)", borderColor: "var(--border)" }}
        >
          Invest Voting · Gemeinsam entscheiden, gemeinsam investieren
        </footer>
      </body>
    </html>
  );
}
