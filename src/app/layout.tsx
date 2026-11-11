import type { Metadata, Viewport } from "next";
import { Caveat, Inter } from "next/font/google";
import "./globals.css";

const caveat = Caveat({ variable: "--font-hand", subsets: ["latin"], weight: ["500", "700"] });
const inter = Inter({ variable: "--font-body", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Four Nations Atlas",
  description:
    "An unofficial, non-commercial fan-made 3D atlas of the world of Avatar: The Last Airbender, episode by episode.",
};

export const viewport: Viewport = {
  themeColor: "#f4ecd8",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${caveat.variable} ${inter.variable} h-full antialiased`}>
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}
