import { NextRequest, NextResponse } from 'next/server'
import { verificarToken } from '@/lib/token'
import { enviarEmailMedico } from '@/lib/mailer'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return html(paginaErro('Token não informado.'))

  try {
    const payload = verificarToken(token)
    const resultados: { medico: string; ok: boolean; erro?: string }[] = []

    for (const nota of payload.notas) {
      try {
        await enviarEmailMedico(nota.medico, nota.email, nota.mes, nota.valor, payload.clinicName)
        resultados.push({ medico: nota.medico, ok: true })
      } catch (e) {
        resultados.push({ medico: nota.medico, ok: false, erro: String(e) })
      }
    }

    const ok = resultados.filter(r => r.ok).length
    const fail = resultados.filter(r => !r.ok).length
    return html(paginaSucesso(resultados, ok, fail, payload.clinicName))
  } catch {
    return html(paginaErro('Link inválido ou expirado. Os links são válidos por 24 horas.'))
  }
}

function html(body: string) {
  return new NextResponse(body, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

function paginaSucesso(res: {medico:string;ok:boolean}[], ok: number, fail: number, clinic: string) {
  const linhas = res.map(r => `
    <div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #f1f5f9">
      <div style="width:32px;height:32px;border-radius:50%;background:${r.ok?'#dcfce7':'#fee2e2'};display:flex;align-items:center;justify-content:center;font-size:16px">${r.ok?'✓':'✗'}</div>
      <span style="color:#374151;flex:1">${r.medico}</span>
      <span style="font-size:13px;font-weight:600;color:${r.ok?'#16a34a':'#dc2626'}">${r.ok?'Enviado':'Falhou'}</span>
    </div>`).join('')

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
  <title>Emails Enviados</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>body{margin:0;padding:24px;background:#f8fafc;font-family:Inter,Arial,sans-serif}</style>
  </head><body>
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
    <div style="background:linear-gradient(135deg,#16a34a,#15803d);padding:32px;text-align:center">
      <div style="font-size:48px;margin-bottom:12px">🎉</div>
      <h1 style="color:#fff;margin:0;font-size:24px">Emails Enviados!</h1>
      <p style="color:#bbf7d0;margin:8px 0 0">${ok} enviado(s)${fail>0?` • ${fail} com falha`:''}</p>
    </div>
    <div style="padding:24px 32px">${linhas}</div>
    <div style="padding:16px 32px;text-align:center;border-top:1px solid #f1f5f9">
      <a href="/" style="color:#1d4ed8;text-decoration:none;font-size:14px">← Voltar ao ${clinic}</a>
    </div>
  </div></body></html>`
}

function paginaErro(msg: string) {
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Erro</title>
  <style>body{margin:0;padding:24px;background:#f8fafc;font-family:Inter,Arial,sans-serif}</style>
  </head><body>
  <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:16px;padding:40px;box-shadow:0 4px 24px rgba(0,0,0,.08);text-align:center">
    <div style="font-size:48px;margin-bottom:16px">❌</div>
    <h1 style="color:#dc2626;margin:0 0 12px">Erro</h1>
    <p style="color:#64748b">${msg}</p>
    <a href="/" style="color:#1d4ed8;text-decoration:none;font-size:14px">← Voltar ao sistema</a>
  </div></body></html>`
}
