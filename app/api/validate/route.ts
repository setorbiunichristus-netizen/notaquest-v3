import { NextRequest, NextResponse } from 'next/server'
import { fetchNotas } from '@/lib/sheets'
import { getConfig, registrarEnvio } from '@/lib/kv'
import { gerarToken } from '@/lib/token'
import { enviarEmailValidacao } from '@/lib/mailer'

export async function POST(req: NextRequest) {
  try {
    const { mes } = await req.json()
    const config = await getConfig()
    const clinicName = config.clinicName || 'Clínica'

    const todasNotas = await fetchNotas()
    const filtradas = mes ? todasNotas.filter(n => n.mes === mes) : todasNotas

    if (filtradas.length === 0) {
      return NextResponse.json({ error: 'Nenhuma nota encontrada' }, { status: 400 })
    }

    const notasPayload = filtradas.map(n => ({
      medico: n.medico, email: n.email, mes: n.mes, valor: n.valor
    }))

    const token = gerarToken({ notas: notasPayload, clinicName, criadoEm: Date.now() })
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
    const link = `${baseUrl}/api/confirm?token=${token}`

    const adminEmails = config.admins.length > 0 ? config.admins : []
    const envAdmin = process.env.ADMIN_EMAIL
    if (envAdmin && !adminEmails.includes(envAdmin)) adminEmails.push(envAdmin)

    if (adminEmails.length === 0) {
      return NextResponse.json({ error: 'Nenhum email administrativo configurado' }, { status: 400 })
    }

    for (const email of adminEmails) {
      await enviarEmailValidacao(email, notasPayload, link, clinicName)
    }

    await registrarEnvio()
    return NextResponse.json({ ok: true, enviados: adminEmails.length, totalNotas: filtradas.length })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
