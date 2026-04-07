import { NextRequest, NextResponse } from 'next/server'
import { getConfig } from '@/lib/kv'
import { fetchNotas } from '@/lib/sheets'
import { gerarToken } from '@/lib/token'
import { enviarEmailValidacao } from '@/lib/mailer'
import { registrarEnvio } from '@/lib/kv'

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const config = await getConfig()
    if (!config.cronAtivo) {
      return NextResponse.json({ ok: false, msg: 'Automação desativada' })
    }

    const now = new Date()
    const dia = now.getDate()
    const hora = now.getHours()

    // Verifica se é o dia e hora corretos
    if (dia !== config.cronDia || hora !== config.cronHora) {
      return NextResponse.json({ ok: false, msg: `Aguardando dia ${config.cronDia} às ${config.cronHora}h` })
    }

    const notas = await fetchNotas()
    if (notas.length === 0) {
      return NextResponse.json({ ok: false, msg: 'Nenhuma nota encontrada' })
    }

    const clinicName = config.clinicName
    const notasPayload = notas.map(n => ({ medico: n.medico, email: n.email, mes: n.mes, valor: n.valor }))
    const token = gerarToken({ notas: notasPayload, clinicName, criadoEm: Date.now() })
    const baseUrl = process.env.NEXT_PUBLIC_URL || ''
    const link = `${baseUrl}/api/confirm?token=${token}`

    const adminEmails = [...config.admins]
    if (process.env.ADMIN_EMAIL && !adminEmails.includes(process.env.ADMIN_EMAIL)) {
      adminEmails.push(process.env.ADMIN_EMAIL)
    }

    for (const email of adminEmails) {
      await enviarEmailValidacao(email, notasPayload, link, clinicName)
    }

    await registrarEnvio()
    return NextResponse.json({ ok: true, enviados: adminEmails.length })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
