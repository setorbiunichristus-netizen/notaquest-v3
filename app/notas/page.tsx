'use client'

import { useEffect, useState } from 'react'

interface NotaRow { mes: string; valor: number; medico: string; email: string }
interface GrupoMes { mes: string; notas: NotaRow[]; total: number }
interface GrupoMedico { medico: string; email: string; meses: GrupoMes[]; totalGeral: number }

export default function NotasPage() {
  const [grupos, setGrupos] = useState<GrupoMedico[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [expandido, setExpandido] = useState<string|null>(null)

  useEffect(() => {
    fetch('/api/sheets').then(r => r.json()).then(d => {
      const notas: NotaRow[] = d.notas || []
      const map = new Map<string, Map<string, NotaRow[]>>()

      for (const n of notas) {
        if (!map.has(n.medico)) map.set(n.medico, new Map())
        const mm = map.get(n.medico)!
        if (!mm.has(n.mes)) mm.set(n.mes, [])
        mm.get(n.mes)!.push(n)
      }

      const result: GrupoMedico[] = []
      map.forEach((mm, medico) => {
        const meses: GrupoMes[] = []
        let totalGeral = 0
        mm.forEach((ns, mes) => {
          const total = ns.reduce((s,n) => s+n.valor, 0)
          totalGeral += total
          meses.push({ mes, notas: ns, total })
        })
        const email = meses[0]?.notas[0]?.email || ''
        result.push({ medico, email, meses, totalGeral })
      })
      setGrupos(result)
    }).finally(() => setLoading(false))
  }, [])

  const filtrado = grupos.filter(g =>
    g.medico.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Arquivo de Notas</h1>
          <p className="text-slate-500 text-sm mt-1">Histórico completo por médico e mês</p>
        </div>
        <div className="badge badge-blue text-sm px-3 py-1.5">
          {grupos.length} médico(s)
        </div>
      </div>

      {/* Busca */}
      <div className="card p-4 mb-6 flex items-center gap-3">
        <span className="text-slate-400">🔍</span>
        <input
          type="text"
          placeholder="Buscar médico..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="flex-1 text-sm outline-none bg-transparent text-slate-700 placeholder-slate-400"
        />
        {busca && (
          <button onClick={() => setBusca('')} className="text-slate-400 hover:text-slate-600 text-sm">✕</button>
        )}
      </div>

      {loading ? (
        <div className="card p-16 text-center">
          <div className="text-4xl mb-4 animate-pulse">📁</div>
          <p className="text-slate-400">Carregando arquivo...</p>
        </div>
      ) : filtrado.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-slate-400">Nenhum resultado para "{busca}"</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtrado.map(grupo => (
            <div key={grupo.medico} className="card overflow-hidden">
              {/* Header */}
              <button
                onClick={() => setExpandido(expandido === grupo.medico ? null : grupo.medico)}
                className="w-full flex items-center justify-between px-6 py-5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-lg"
                    style={{background:'linear-gradient(135deg,#1d4ed8,#ea580c)'}}>
                    {grupo.medico.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-800">{grupo.medico}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{grupo.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-slate-500">{grupo.meses.length} mês(es)</p>
                    <p className="font-bold text-blue-700">
                      R$ {grupo.totalGeral.toLocaleString('pt-BR',{minimumFractionDigits:2})}
                    </p>
                  </div>
                  <span className="text-slate-400 text-lg">
                    {expandido === grupo.medico ? '▲' : '▼'}
                  </span>
                </div>
              </button>

              {/* Meses expandidos */}
              {expandido === grupo.medico && (
                <div className="border-t border-slate-100">
                  {grupo.meses.map(mes => (
                    <div key={mes.mes} className="px-6 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="badge badge-orange">{mes.mes}</span>
                          <span className="text-xs text-slate-400">{mes.notas.length} nota(s)</span>
                        </div>
                        <span className="font-bold text-orange-600">
                          R$ {mes.total.toLocaleString('pt-BR',{minimumFractionDigits:2})}
                        </span>
                      </div>
                    </div>
                  ))}
                  {/* Total geral */}
                  <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-50 to-orange-50">
                    <span className="font-semibold text-slate-700 text-sm">Total geral</span>
                    <span className="font-bold text-blue-800 text-lg">
                      R$ {grupo.totalGeral.toLocaleString('pt-BR',{minimumFractionDigits:2})}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
