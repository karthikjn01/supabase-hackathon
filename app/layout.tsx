import { GeistSans } from "geist/font/sans";
import "./globals.css";
import AuthButton from "@/components/AuthButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className="bg-background text-foreground">
        <main className="min-h-screen flex flex-col items-center gap-10">
          <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
            <div className="container flex justify-end items-center p-3 text-sm gap-3">
              <AuthButton />
              <Button asChild>
                <Link href={'/new'}>
                  New Question
                </Link>
              </Button>
            </div>
          </nav>
          {children}
        </main>
      </body>
    </html>
  );
}
