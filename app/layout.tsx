import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { ToastProvider } from "@/components/ui/Toast";
import { QueryProvider } from "@/components/providers/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MyClawNote - 个人知识管理",
  description: "基于 OpenClaw 的个人专属知识管理工具",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
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
            {/* 移动端顶部标题栏 */}
            <MobileHeader />
            
            <div className="flex h-full overflow-hidden">
              {/* PC端侧边栏 */}
              <Sidebar />
              
              {/* 主内容区 */}
              <main className="flex-1 overflow-auto bg-gray-50 md:bg-gray-50">
                <div className="pb-16 md:pb-0 pt-12 md:pt-0">
                  {children}
                </div>
              </main>
            </div>
            
            {/* 移动端底部导航 */}
            <BottomNav />
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
