'use client'

import { useEffect, useState } from 'react'

interface Config {
  admins: string[]
  clinicName: string
  cronDia: number
  cronHora: number
  cronMinuto: number
  cronAtivo: boolean
  ultimoEnvio: string | null
}

export default function ConfigPage() {
  const [autenticado, setAutenticado] = useState(false)
  const [senhaInput, setSenhaInput] = useState('')
  const [senha, setSenha] = useState('')
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{tipo:'ok'|'err', texto:string}|null>(null)

  // Campos do formulário
  const [novoEmail, setNovoEmail] = useState('')
  const [clinicName, setClinicName] = useState('')
  const [cronDia, setCronDia] = useState(5)
  const [cronHora, setCronHora] = useState(8)
  const [cronMinuto, setCronMinuto] = useState(0)
  const [cronAtivo, setCronAtivo] = useState(false)

  async function autenticar() {
    if (!senhaInput.trim()) { setMsg({tipo:'err', texto:'Digite a senha.'}); return }
    setLoading(true)
    try {
      const r = await fetch('/api/config')
      const d: Config = await r.json()
      setSenha(senhaInput)
      setConfig(d)
      setClinicName(d.clinicName)
      setCronDia(d.cronDia)
      setCronHora(d.cronHora)
      setCronMinuto(d.cronMinuto)
      setCronAtivo(d.cronAtivo)
      setAutenticado(true)
      setMsg(null)
    } catch {
      setMsg({tipo:'err', texto:'Erro ao conectar. Tente novamente.'})
    } finally { setLoading(false) }
  }

  async function chamar(action: string, extra?: Record<string,unknown>) {
    const r = await fetch('/api/config', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ action, senha, ...extra })
    })
    const d = await r.json()
    if (d.error) throw new Error(d.error)
    return d as Config
  }

  async function adicionarEmail() {
    if (!novoEmail.includes('@')) { setMsg({tipo:'err', texto:'Email inválido.'}); return }
    setLoading(true)
    try {
      const d = await chamar('addAdmin', { email: novoEmail })
      setConfig(d); setNovoEmail('')
      setMsg({tipo:'ok', texto:`✅ Email ${novoEmail} adicionado!`})
    } catch(e:unknown) {
      setMsg({tipo:'err', texto: e instanceof Error ? e.message : 'Erro'})
    } finally { setLoading(false) }
  }

  async function removerEmail(email: string) {
    setLoading(true)
    try {
      const d = await chamar('removeAdmin', { email })
      setConfig(d)
      setMsg({tipo:'ok', texto:`✅ Email removido.`})
    } catch(e:unknown) {
      setMsg({tipo:'err', texto: e instanceof Error ? e.message : 'Erro'})
    } finally { setLoading(false) }
  }

  async function salvarConfig() {
    setLoading(true)
    try {
      const d = await chamar('saveConfig', { clinicName, cronDia, cronHora, cronMinuto, cronAtivo })
      setConfig(d)
      setMsg({tipo:'ok', texto:'✅ Configurações salvas com sucesso!'})
    } catch(e:unknown) {
      setMsg({tipo:'err', texto: e instanceof Error ? e.message : 'Erro'})
    } finally { setLoading(false) }
  }

  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

  if (!autenticado) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <div className="card p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">🔒</div>
            <h1 className="text-xl font-bold text-slate-800">Área Restrita</h1>
            <p className="text-slate-500 text-sm mt-1">Digite a senha para acessar as configurações</p>
          </div>
          <input
            type="password"
            placeholder="Senha de acesso"
            value={senhaInput}
            onChange={e => setSenhaInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && autenticar()}
            className="input mb-4"
          />
          <button onClick={autenticar} disabled={loading} className="btn-primary w-full justify-center flex">
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
          {msg && <p className="mt-3 text-sm text-red-500 text-center">{msg.texto}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Configurações</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie emails, agendamento e dados da clínica</p>
        </div>
        {config?.ultimoEnvio && (
          <div className="text-right">
            <p className="text-xs text-slate-400">Último envio</p>
            <p className="text-sm font-medium text-slate-600">
              {new Date(config.ultimoEnvio).toLocaleString('pt-BR')}
            </p>
          </div>
        )}
      </div>

      {msg && (
        <div className={`rounded-xl p-4 mb-6 text-sm font-medium ${
          msg.tipo === 'ok' ? 'bg-green-50 text-green-700 border border-green-200'
                           : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {msg.texto}
        </div>
      )}

      {/* Nome da clínica */}
      <div className="card p-6 mb-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">🏥</div>
          <h2 className="font-semibold text-slate-800">Nome da Clínica</h2>
        </div>
        <div className="flex gap-3">
          <input
            value={clinicName}
            onChange={e => setClinicName(e.target.value)}
            placeholder="Nome da clínica"
            className="input flex-1"
          />
          <button onClick={salvarConfig} disabled={loading} className="btn-primary">
            Salvar
          </button>
        </div>
      </div>

      {/* Emails administrativos */}
      <div className="card p-6 mb-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">📧</div>
          <div>
            <h2 className="font-semibold text-slate-800">Emails Administrativos</h2>
            <p className="text-xs text-slate-400">Recebem o link de validação das notas</p>
          </div>
        </div>

        {/* Adicionar */}
        <div className="flex gap-3 mb-5">
          <input
            type="email"
            placeholder="novo@email.com.br"
            value={novoEmail}
            onChange={e => setNovoEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && adicionarEmail()}
            className="input flex-1"
          />
          <button onClick={adicionarEmail} disabled={loading} className="btn-primary">
            + Adicionar
          </button>
        </div>

        {/* Lista */}
        {config && config.admins.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl">
            <p className="text-slate-400 text-sm">Nenhum email cadastrado ainda.</p>
            <p className="text-slate-400 text-xs mt-1">O email padrão definido nas variáveis será usado.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {config?.admins.map(email => (
              <div key={email} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">
                    {email.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-700 font-medium">{email}</span>
                </div>
                <button onClick={() => removerEmail(email)} className="btn-danger">
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Agendamento automático */}
      <div className="card p-6 mb-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">⏰</div>
            <div>
              <h2 className="font-semibold text-slate-800">Disparo Automático</h2>
              <p className="text-xs text-slate-400">Envia automaticamente na data e hora configuradas</p>
            </div>
          </div>
          {/* Toggle */}
          <button
            onClick={() => setCronAtivo(!cronAtivo)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${cronAtivo ? 'bg-green-500' : 'bg-slate-300'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${cronAtivo ? 'translate-x-7' : 'translate-x-1'}`}/>
          </button>
        </div>

        <div className={`space-y-4 ${!cronAtivo ? 'opacity-50 pointer-events-none' : ''}`}>
          {/* Dia do mês */}
          <div>
            <label className="text-sm font-medium text-slate-600 block mb-2">Dia do mês</label>
            <div className="grid grid-cols-7 gap-1.5">
              {[1,2,3,4,5,6,7,8,9,10,14,15,20,25,28].map(d => (
                <button
                  key={d}
                  onClick={() => setCronDia(d)}
                  className={`py-2 text-sm rounded-lg font-medium transition-all ${
                    cronDia === d
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <label className="text-xs text-slate-500">Ou digite:</label>
              <input
                type="number" min="1" max="28"
                value={cronDia}
                onChange={e => setCronDia(parseInt(e.target.value)||1)}
                className="input w-20 text-sm py-1.5"
              />
            </div>
          </div>

          {/* Hora */}
          <div>
            <label className="text-sm font-medium text-slate-600 block mb-2">Horário de envio</label>
            <div className="flex items-center gap-3">
              <select
                value={cronHora}
                onChange={e => setCronHora(parseInt(e.target.value))}
                className="input w-32"
              >
                {Array.from({length:24},(_,i)=>i).map(h => (
                  <option key={h} value={h}>{String(h).padStart(2,'0')}h</option>
                ))}
              </select>
              <span className="text-slate-400 font-medium">:</span>
              <select
                value={cronMinuto}
                onChange={e => setCronMinuto(parseInt(e.target.value))}
                className="input w-32"
              >
                {[0,15,30,45].map(m => (
                  <option key={m} value={m}>{String(m).padStart(2,'0')}min</option>
                ))}
              </select>
            </div>
          </div>

          {cronAtivo && (
            <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-700">
              📅 O sistema enviará automaticamente no dia <strong>{cronDia}</strong> de cada mês às <strong>{String(cronHora).padStart(2,'0')}:{String(cronMinuto).padStart(2,'0')}</strong>h
            </div>
          )}
        </div>

        <button onClick={salvarConfig} disabled={loading} className="btn-primary mt-5 w-full flex justify-center">
          {loading ? 'Salvando...' : '💾 Salvar Agendamento'}
        </button>
      </div>

      {/* Info planilha */}
      <div className="card p-6 border-blue-100" style={{background:'linear-gradient(135deg,#eff6ff,#f0f9ff)'}}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">📊</div>
          <h2 className="font-semibold text-blue-800">Planilha Conectada</h2>
        </div>
        <div className="space-y-2 text-sm text-blue-700">
          <div className="flex items-center gap-2">
            <span className="badge badge-blue">Coluna A</span>
            <span>Mês de referência</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-blue">Coluna D</span>
            <span>Valor da nota</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-orange">Coluna F</span>
            <span>Data (mês extraído automaticamente)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-blue">Coluna H</span>
            <span>Nome do médico</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-blue">Coluna I</span>
            <span>Email do médico</span>
          </div>
        </div>
      </div>
    </div>
  )
}
