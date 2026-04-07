import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'dev_secret'

export interface ValidacaoPayload {
  notas: { medico: string; email: string; mes: string; valor: number }[]
  clinicName: string
  criadoEm: number
}

export function gerarToken(payload: ValidacaoPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: '24h' })
}

export function verificarToken(token: string): ValidacaoPayload {
  return jwt.verify(token, SECRET) as ValidacaoPayload
}
