import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { ToastProvider } from "@/components/ui/Toast";
import { QueryProvider } from "@/components/providers/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyClawNote - 个人知识管理",
  description: "基于 OpenClaw 的个人专属知识管理工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className={`${inter.className} h-full`}>
        <QueryProvider>
          <ToastProvider>
            <div className="flex h-full overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-auto bg-gray-50">
                {children}
              </main>
            </div>
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
