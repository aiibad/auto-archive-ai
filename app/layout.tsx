import "./globals.css"; // <-- ADD THIS LINE
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vault.ai",
  description: "Secure AI Document Management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F8FAFC] text-slate-900 antialiased">
        <nav className="p-4 border-b bg-white font-bold flex items-center gap-2">
          <span className="text-blue-600">📂</span> Vault.ai
        </nav>
        {children}
      </body>
    </html>
  );
}