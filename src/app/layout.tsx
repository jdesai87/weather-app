import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Weather Forecast",
  description: "7-day weather forecast by zip code",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
