import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="nav">
          <div className="logo">AI Counsellor</div>
          <a href="/demo" className="btn-primary">Demo</a>
        </header>

        <main className="container">
          {children}
        </main>
      </body>
    </html>
  );
}
