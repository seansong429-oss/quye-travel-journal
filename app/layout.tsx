import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://quye-travel-journal.songtienan21.chatgpt.site"),
  title: "去野｜发现下一段值得记录的旅程",
  description: "发现目的地、生成个性行程，收藏每一次旅行心动。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "去野｜发现下一段值得记录的旅程",
    description: "发现目的地、生成个性行程，也把每一次心动稳稳收藏。",
    images: [{ url: "/og-v2.png", width: 1736, height: 904, alt: "去野｜发现下一段值得记录的旅程" }],
  },
  twitter: { card: "summary_large_image", images: ["/og-v2.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
