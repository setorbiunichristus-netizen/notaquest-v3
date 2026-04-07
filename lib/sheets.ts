export interface NotaRow {
  mes: string
  mesNum: string
  data: string
  valor: number
  medico: string
  email: string
}

export interface NotaPorMedico {
  medico: string
  email: string
  notas: NotaRow[]
  total: number
}

function parseMes(val: string): string {
  if (!val) return ''
  // Tenta formato DD/MM/YYYY ou MM/YYYY ou número
  const s = val.trim()
  // formato data DD/MM/YYYY
  const dmatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (dmatch) {
    const meses = ['','Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
    const m = parseInt(dmatch[2])
    return `${meses[m] || dmatch[2]}/${dmatch[3]}`
  }
  // formato MM/YYYY
  const mmatch = s.match(/^(\d{1,2})\/(\d{4})$/)
  if (mmatch) {
    const meses = ['','Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
    const m = parseInt(mmatch[1])
    return `${meses[m] || mmatch[1]}/${mmatch[2]}`
  }
  // número puro (ex: 1, 2, 3)
  const nmatch = s.match(/^(\d{1,2})$/)
  if (nmatch) {
    const meses = ['','Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
    return meses[parseInt(nmatch[1])] || s
  }
  return s
}

function parseValor(val: string): number {
  if (!val) return 0
  return parseFloat(val.replace(/[R$\s.]/g,'').replace(',','.')) || 0
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') { inQuotes = !inQuotes }
    else if (c === ',' && !inQuotes) { result.push(current); current = '' }
    else { current += c }
  }
  result.push(current)
  return result
}

export async function fetchNotas(): Promise<NotaRow[]> {
  const url = process.env.SHEET_CSV_URL!
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error('Erro ao buscar planilha')
  const text = await res.text()
  const lines = text.trim().split('\n')
  const rows: NotaRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i])
    // A=0(mês col A), D=3(valor), F=5(data), H=7(médico), I=8(email)
    const mesColA  = cols[0]?.trim() || ''
    const valor    = parseValor(cols[3]?.trim() || '')
    const dataColF = cols[5]?.trim() || ''
    const medico   = cols[7]?.trim() || ''
    const email    = cols[8]?.trim() || ''

    // usa coluna F (data) para extrair mês, fallback para coluna A
    const mesFormatado = parseMes(dataColF) || parseMes(mesColA) || mesColA

    if (medico && valor > 0) {
      rows.push({ mes: mesFormatado, mesNum: mesColA, data: dataColF, valor, medico, email })
    }
  }
  return rows
}

export function agruparPorMedico(notas: NotaRow[]): NotaPorMedico[] {
  const map = new Map<string, NotaPorMedico>()
  for (const nota of notas) {
    if (!map.has(nota.medico)) {
      map.set(nota.medico, { medico: nota.medico, email: nota.email, notas: [], total: 0 })
    }
    const entry = map.get(nota.medico)!
    entry.notas.push(nota)
    entry.total += nota.valor
  }
  return Array.from(map.values())
}

export function getMesesUnicos(notas: NotaRow[]): string[] {
  const set = new Set<string>()
  notas.forEach(n => { if (n.mes) set.add(n.mes) })
  return Array.from(set)
}
