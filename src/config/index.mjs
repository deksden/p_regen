import fs, { existsSync } from 'fs'
import { join, resolve } from 'path'

export const loadConfig = (configFile) => {
  if (existsSync(configFile) === false) {
    throw new Error(`Config file "${configFile}" not found!`)
  }

  return JSON.parse(fs.readFileSync(configFile).toString())
}

export const defaultConfig = () => {
  return resolve(join(process.cwd(), '.p-regenrc'))
}