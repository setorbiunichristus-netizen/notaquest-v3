import { NextResponse } from 'next/server'
import { fetchNotas, agruparPorMedico, getMesesUnicos } from '@/lib/sheets'

export async function GET() {
  try {
    const notas = await fetchNotas()
    const porMedico = agruparPorMedico(notas)
    const meses = getMesesUnicos(notas)
    return NextResponse.json({ notas, porMedico, meses })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
