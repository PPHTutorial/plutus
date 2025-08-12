export interface SystemInfo {
  platform: NodeJS.Platform
  arch: NodeJS.Architecture
  version: string
  cpu: Array<{
    model: string
    speed: number
  }>
  memory: {
    total: number
    free: number
  }
  hostname: string
  userInfo: {
    username: string
    homedir: string
  }
} 