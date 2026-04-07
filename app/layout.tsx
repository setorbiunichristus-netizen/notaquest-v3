import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'NotaQuest — Gestão de Notas Fiscais',
  description: 'Sistema de automação de notas fiscais médicas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50">
        {/* Sidebar */}
        <div className="flex min-h-screen">
          <aside className="w-64 bg-gradient-to-b from-navy-900 to-navy-800 text-white flex flex-col fixed h-full z-10" style={{background:'linear-gradient(180deg,#172554 0%,#1e3a8a 100%)'}}>
            {/* Logo */}
            <div className="px-6 py-6 border-b border-blue-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-lg font-bold">N</div>
                <div>
                  <p className="font-bold text-white text-sm leading-none">NotaQuest</p>
                  <p className="text-blue-300 text-xs mt-0.5">Gestão de Notas</p>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
              <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-100 hover:bg-blue-800 hover:text-white transition-all text-sm font-medium group">
                <span className="text-lg">📊</span>
                <span>Dashboard</span>
              </Link>
              <Link href="/notas" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-100 hover:bg-blue-800 hover:text-white transition-all text-sm font-medium">
                <span className="text-lg">📁</span>
                <span>Arquivo de Notas</span>
              </Link>
              <Link href="/configuracoes" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-100 hover:bg-blue-800 hover:text-white transition-all text-sm font-medium">
                <span className="text-lg">⚙️</span>
                <span>Configurações</span>
              </Link>
            </nav>

            {/* Footer sidebar */}
            <div className="px-6 py-4 border-t border-blue-800">
              <p className="text-blue-400 text-xs">NotaQuest © {new Date().getFullYear()}</p>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 ml-64 min-h-screen">
            {/* Top bar */}
            <header className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-500">Sistema online</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">Dados atualizados automaticamente</span>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">A</div>
              </div>
            </header>

            <div className="px-8 py-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}
