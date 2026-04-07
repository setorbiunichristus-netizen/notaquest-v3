import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function enviarEmailValidacao(
  adminEmail: string,
  notas: { medico: string; email: string; mes: string; valor: number }[],
  tokenLink: string,
  clinicName: string
) {
  const total = notas.reduce((s, n) => s + n.valor, 0)
  const linhas = notas.map(n => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9">${n.medico}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;color:#64748b">${n.mes}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;color:#64748b">${n.email}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:600;color:#1d4ed8">
        R$ ${n.valor.toLocaleString('pt-BR',{minimumFractionDigits:2})}
      </td>
    </tr>`).join('')

  const html = `<!DOCTYPE html><html lang="pt-BR">
  <head><meta charset="UTF-8"><title>Validação</title></head>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,Arial,sans-serif">
    <div style="max-width:700px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
      <div style="background:linear-gradient(135deg,#1d4ed8,#1e40af);padding:32px 40px;display:flex;align-items:center;gap:16px">
        <div style="width:48px;height:48px;background:rgba(255,255,255,.15);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px">📋</div>
        <div>
          <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700">${clinicName}</h1>
          <p style="color:#93c5fd;margin:4px 0 0;font-size:14px">Notas fiscais aguardando validação</p>
        </div>
      </div>
      <div style="padding:32px 40px">
        <p style="color:#374151;font-size:15px;margin:0 0 24px">As seguintes notas estão aguardando sua aprovação:</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0">
          <thead>
            <tr style="background:#eff6ff">
              <th style="padding:12px 16px;text-align:left;color:#1e40af;font-weight:600">Médico</th>
              <th style="padding:12px 16px;text-align:left;color:#1e40af;font-weight:600">Mês</th>
              <th style="padding:12px 16px;text-align:left;color:#1e40af;font-weight:600">Email</th>
              <th style="padding:12px 16px;text-align:right;color:#1e40af;font-weight:600">Valor</th>
            </tr>
          </thead>
          <tbody>${linhas}</tbody>
          <tfoot>
            <tr style="background:#f8fafc">
              <td colspan="3" style="padding:14px 16px;font-weight:700;color:#111827">Total geral</td>
              <td style="padding:14px 16px;text-align:right;font-weight:800;color:#ea580c;font-size:18px">
                R$ ${total.toLocaleString('pt-BR',{minimumFractionDigits:2})}
              </td>
            </tr>
          </tfoot>
        </table>
        <div style="margin:32px 0;text-align:center">
          <a href="${tokenLink}" style="display:inline-block;background:linear-gradient(135deg,#ea580c,#f97316);color:#fff;padding:16px 40px;border-radius:12px;text-decoration:none;font-size:16px;font-weight:700;letter-spacing:.3px">
            ✓ Confirmar e Disparar Emails
          </a>
        </div>
        <p style="color:#94a3b8;font-size:12px;text-align:center">Link válido por 24h • ${clinicName} — NotaQuest</p>
      </div>
    </div>
  </body></html>`

  await resend.emails.send({
    from: `${clinicName} <onboarding@resend.dev>`,
    to: adminEmail,
    subject: `[${clinicName}] ${notas.length} nota(s) aguardando validação — R$ ${total.toLocaleString('pt-BR',{minimumFractionDigits:2})}`,
    html,
  })
}

export async function enviarEmailMedico(
  medico: string, emailMedico: string, mes: string, valor: number, clinicName: string
) {
  const html = `<!DOCTYPE html><html lang="pt-BR">
  <head><meta charset="UTF-8"><title>Nota Validada</title></head>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,Arial,sans-serif">
    <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
      <div style="background:linear-gradient(135deg,#1d4ed8,#1e40af);padding:32px 40px">
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700">${clinicName}</h1>
        <p style="color:#93c5fd;margin:6px 0 0;font-size:14px">Confirmação de nota fiscal</p>
      </div>
      <div style="padding:32px 40px">
        <p style="color:#374151;font-size:16px;margin:0 0 8px">Olá, <strong>${medico}</strong>!</p>
        <p style="color:#64748b;font-size:14px;margin:0 0 28px;line-height:1.6">
          Sua nota fiscal do mês de <strong style="color:#1d4ed8">${mes}</strong> foi recebida e <strong style="color:#16a34a">validada</strong> pelo setor administrativo.
        </p>
        <div style="background:linear-gradient(135deg,#eff6ff,#dbeafe);border-radius:12px;padding:24px;text-align:center;margin:0 0 28px;border:1px solid #bfdbfe">
          <p style="color:#6b7280;font-size:13px;margin:0 0 8px;font-weight:500">VALOR VALIDADO</p>
          <p style="color:#1d4ed8;font-size:36px;font-weight:800;margin:0;letter-spacing:-1px">
            R$ ${valor.toLocaleString('pt-BR',{minimumFractionDigits:2})}
          </p>
          <p style="color:#94a3b8;font-size:12px;margin:8px 0 0">Competência: ${mes}</p>
        </div>
        <p style="color:#94a3b8;font-size:13px;margin:0">Dúvidas? Entre em contato com o setor administrativo.</p>
      </div>
      <div style="background:#f8fafc;padding:16px 40px;border-top:1px solid #e2e8f0;text-align:center">
        <p style="color:#cbd5e1;font-size:12px;margin:0">${clinicName} — Sistema NotaQuest</p>
      </div>
    </div>
  </body></html>`

  await resend.emails.send({
    from: `${clinicName} <onboarding@resend.dev>`,
    to: emailMedico,
    subject: `[${clinicName}] Nota de ${mes} validada — R$ ${valor.toLocaleString('pt-BR',{minimumFractionDigits:2})}`,
    html,
  })
}
