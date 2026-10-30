import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-heading", display: "swap" });
const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-code", display: "swap" });

export const metadata: Metadata = {
  title: "Nithyasree A R | Java Backend Developer",
  description: "Portfolio of Nithyasree A R, Software Developer building backend systems with Java, Spring Boot, Python, FastAPI and PostgreSQL.",
  openGraph: { title: "Nithyasree A R | Software Developer", description: "Java backend development and full-stack projects.", type: "website" },
  icons: { icon: "/icon.svg" },
};
export const viewport: Viewport = { themeColor: "#071F1B" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${spaceGrotesk.variable} ${jetBrainsMono.variable}`}>{children}</body></html>;
}
