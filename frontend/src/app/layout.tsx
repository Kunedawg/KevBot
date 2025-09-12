import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { PlayBar } from "@/components/ui/play-bar";
import "./globals.css";

interface LayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <PlayBar />
        </ThemeProvider>
      </body>
    </html>
  );
}
