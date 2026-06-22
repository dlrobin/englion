import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  icons: { icon: "/logo.png" },
  title: "工程狮 — 建筑领域AI应用",
  description: "分享建筑领域AI应用，赋能建筑业智能化转型",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-14 items-center justify-between">
              <a href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                  <img
                    src="/logo.png"
                    alt="EngLion"
                    className="h-5 w-5 object-contain"
                  />
                </div>
                <span className="text-lg font-semibold text-gray-900">工程狮</span>
              </a>
              <nav className="flex items-center gap-4 text-sm text-gray-500">
                <a href="/" className="hover:text-gray-900 transition-colors">Skills</a>
                <a href="https://github.com/dlrobin/EngLion" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">GitHub</a>
              </nav>
            </div>
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>

        <footer className="border-t border-gray-200 bg-white py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
              <span>© {new Date().getFullYear()} EngLion. All rights reserved.</span>
              <span className="flex items-center gap-1">
                Powered by
                <span className="inline-flex items-center gap-1 text-gray-500">
                  <span className="h-2 w-2 rounded-full bg-accent-400" />
                  englion.xyz
                </span>

              </span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
