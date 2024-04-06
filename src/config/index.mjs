import fs, { existsSync } from 'fs'
import { join, resolve } from 'path'
import logger from '../logger'

export const loadConfig = (configFile) => {
  if (existsSync(configFile) === false) {
    throw new Error(`Config file "${configFile}" not found!`)
  }

  const cfg = JSON.parse(fs.readFileSync(configFile).toString())

  // process defaults:
  cfg.server = cfg.server || {}
  cfg.server.auth = cfg.server.auth || 'JWT'
  cfg.server.authPath = cfg.server.authPath || '/server/login'

  return cfg
}

export const checkConfig = (config) => {
  // verify config
  if (!config.server) {
    const err = 'No server specified in this config!'
    logger.error(err)
    throw new Error(err)
  }

  if (!config.server.url) {
    const err = 'No URL specified for server!'
    logger.error(err)
    throw new Error(err)
  }

  if (config.server.auth === 'JWT' && !(config.server.email && config.server.password && config.server.authPath)) {
    const err = 'Config for server with JWT server should specify "email" and "password" settings!'
    logger.error(err)
    throw new Error(err)
  }
}

export const defaultConfig = () => {
  return resolve(join(process.cwd(), '.p-regenrc'))
}