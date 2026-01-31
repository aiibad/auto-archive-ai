
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        <nav className="p-4 border-b bg-white font-bold">📂 Auto-Archive AI</nav>
        {children}
      </body>
    </html>
  );
}