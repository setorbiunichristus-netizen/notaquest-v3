'use client'

import { useEffect, useState } from 'react'

interface NotaRow {
  mes: string; valor: number; medico: string; email: string
}
interface NotaPorMedico {
  medico: string; email: string; notas: NotaRow[]; total: number
}

export default function Dashboard() {
  const [notas, setNotas] = useState<NotaRow[]>([])
  const [porMedico, setPorMedico] = useState<NotaPorMedico[]>([])
  const [meses, setMeses] = useState<string[]>([])
  const [mesSel, setMesSel] = useState('')
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [msg, setMsg] = useState<{tipo:'ok'|'err', texto:string}|null>(null)

  useEffect(() => { buscar() }, [])

  async function buscar() {
    setLoading(true); setErro('')
    try {
      const r = await fetch('/api/sheets')
      const d = await r.json()
      if (d.error) throw new Error(d.error)
      setNotas(d.notas)
      setPorMedico(d.porMedico)
      setMeses(d.meses)
    } catch(e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar')
    } finally { setLoading(false) }
  }

  async function validar() {
    setEnviando(true); setMsg(null)
    try {
      const r = await fetch('/api/validate', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ mes: mesSel })
      })
      const d = await r.json()
      if (d.error) throw new Error(d.error)
      setMsg({ tipo:'ok', texto:`✅ Email enviado para ${d.enviados} administrador(es) com ${d.totalNotas} notas!` })
    } catch(e: unknown) {
      setMsg({ tipo:'err', texto: e instanceof Error ? e.message : 'Erro ao enviar' })
    } finally { setEnviando(false) }
  }

  const filtrados = mesSel
    ? porMedico.map(m => ({
        ...m,
        notas: m.notas.filter(n => n.mes === mesSel),
        total: m.notas.filter(n => n.mes === mesSel).reduce((s,n) => s+n.valor, 0)
      })).filter(m => m.notas.length > 0)
    : porMedico

  const totalGeral = filtrados.reduce((s,m) => s+m.total, 0)
  const totalNotas = filtrados.reduce((s,m) => s+m.notas.length, 0)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Visão geral das notas fiscais</p>
        </div>
        <button onClick={buscar} className="btn-secondary flex items-center gap-2 text-sm">
          <span>↺</span> Atualizar
        </button>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-500">Total de médicos</p>
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl">👨‍⚕️</div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{filtrados.length}</p>
          <p className="text-xs text-slate-400 mt-1">{mesSel || 'todos os meses'}</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-500">Total de notas</p>
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-xl">📋</div>
          </div>
          <p className="text-3xl font-bold text-slate-800">{totalNotas}</p>
          <p className="text-xs text-slate-400 mt-1">{mesSel || 'todos os meses'}</p>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-500">Valor total</p>
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-xl">💰</div>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            R$ {totalGeral.toLocaleString('pt-BR',{minimumFractionDigits:2})}
          </p>
          <p className="text-xs text-slate-400 mt-1">{mesSel || 'todos os meses'}</p>
        </div>
      </div>

      {/* Barra de ações */}
      <div className="card p-5 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-600">Filtrar por mês:</label>
          <select
            value={mesSel}
            onChange={e => setMesSel(e.target.value)}
            className="input w-52"
          >
            <option value="">Todos os meses</option>
            {meses.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <button
          onClick={validar}
          disabled={enviando}
          className="btn-primary flex items-center gap-2"
        >
          {enviando ? (
            <><span className="animate-spin">⏳</span> Enviando...</>
          ) : (
            <><span>📧</span> Enviar para Validação</>
          )}
        </button>
      </div>

      {/* Mensagem de retorno */}
      {msg && (
        <div className={`rounded-xl p-4 mb-6 text-sm font-medium flex items-center gap-2 ${
          msg.tipo === 'ok'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {msg.texto}
        </div>
      )}

      {/* Tabela */}
      {loading ? (
        <div className="card p-16 text-center">
          <div className="text-4xl mb-4 animate-pulse">📊</div>
          <p className="text-slate-400">Carregando dados da planilha...</p>
        </div>
      ) : erro ? (
        <div className="card p-8 text-center border-red-100">
          <p className="text-red-500">{erro}</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-slate-400">Nenhuma nota encontrada.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtrados.map(medico => (
            <div key={medico.medico} className="card overflow-hidden">
              {/* Header do card */}
              <div className="flex items-center justify-between px-6 py-4" style={{background:'linear-gradient(135deg,#eff6ff,#dbeafe)'}}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm"
                    style={{background:'linear-gradient(135deg,#1d4ed8,#1e40af)'}}>
                    {medico.medico.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{medico.medico}</p>
                    <p className="text-xs text-slate-500">{medico.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 mb-0.5">{medico.notas.length} nota(s)</p>
                  <p className="font-bold text-blue-700">
                    R$ {medico.total.toLocaleString('pt-BR',{minimumFractionDigits:2})}
                  </p>
                </div>
              </div>
              {/* Linhas */}
              <div className="divide-y divide-slate-50">
                {medico.notas.map((nota, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="badge badge-blue">{nota.mes}</span>
                    </div>
                    <span className="font-semibold text-slate-800 text-sm">
                      R$ {nota.valor.toLocaleString('pt-BR',{minimumFractionDigits:2})}
                    </span>
                  </div>
                ))}
              </div>
              {/* Total por médico */}
              <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-t border-slate-100">
                <span className="text-sm font-semibold text-slate-600">Total</span>
                <span className="font-bold text-orange-600">
                  R$ {medico.total.toLocaleString('pt-BR',{minimumFractionDigits:2})}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
