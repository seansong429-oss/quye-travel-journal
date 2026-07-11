import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "去野｜下一站，和喜欢的人一起出发",
  description: "为年轻自由行游客与情侣精选目的地，并生成专属双人旅行路线。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "去野｜下一站，和喜欢的人一起出发",
    description: "发现适合两个人的旅行灵感，30 秒生成专属路线。",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "去野旅行推荐" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
