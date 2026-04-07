import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export interface Config {
  admins: string[]
  clinicName: string
  cronDia: number       // 1-28
  cronHora: number      // 0-23
  cronMinuto: number    // 0-59
  cronAtivo: boolean
  ultimoEnvio: string | null
}

const DEFAULT_CONFIG: Config = {
  admins: [],
  clinicName: 'Clínica NotaQuest',
  cronDia: 5,
  cronHora: 8,
  cronMinuto: 0,
  cronAtivo: false,
  ultimoEnvio: null,
}

export async function getConfig(): Promise<Config> {
  try {
    const data = await redis.get<Config>('notaquest:config')
    return { ...DEFAULT_CONFIG, ...data }
  } catch {
    return DEFAULT_CONFIG
  }
}

export async function saveConfig(config: Partial<Config>): Promise<Config> {
  const current = await getConfig()
  const updated = { ...current, ...config }
  await redis.set('notaquest:config', updated)
  return updated
}

export async function addAdmin(email: string): Promise<Config> {
  const config = await getConfig()
  if (!config.admins.includes(email)) {
    config.admins.push(email)
    await redis.set('notaquest:config', config)
  }
  return config
}

export async function removeAdmin(email: string): Promise<Config> {
  const config = await getConfig()
  config.admins = config.admins.filter(e => e !== email)
  await redis.set('notaquest:config', config)
  return config
}

export async function registrarEnvio(): Promise<void> {
  const config = await getConfig()
  config.ultimoEnvio = new Date().toISOString()
  await redis.set('notaquest:config', config)
}
