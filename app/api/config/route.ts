import { NextRequest, NextResponse } from 'next/server'
import { getConfig, saveConfig, addAdmin, removeAdmin } from '@/lib/kv'

function checkSenha(senha: string) {
  return senha === process.env.CONFIG_PASSWORD
}

export async function GET() {
  try {
    const config = await getConfig()
    return NextResponse.json(config)
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar configurações' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, senha, email, ...rest } = body

    if (!checkSenha(senha)) {
      return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })
    }

    let config
    if (action === 'addAdmin') {
      config = await addAdmin(email)
    } else if (action === 'removeAdmin') {
      config = await removeAdmin(email)
    } else if (action === 'saveConfig') {
      config = await saveConfig(rest)
    } else {
      return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
    }

    return NextResponse.json(config)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
