import "./globals.css";
import Navigation from "@/components/Navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="flex h-screen bg-slate-50 overflow-hidden">
        {/* Боковая панель всегда на месте */}
        <Navigation />
        
        {/* Основной контент, который меняется */}
        <main className="flex-1 h-full overflow-y-auto relative">
          {children}
        </main>
      </body>
    </html>
  );
}