#!/usr/bin/env node --experimental-specifier-resolution=node
import arg from 'arg'
import logger from './logger'
import { defaultConfig, loadConfig } from './config'
import { REGEN_ARGS, REGEN_CONFIG, REGEN_HELP, REGEN_VERSION } from './const'
import { showHelp } from './help'
import { returnVersion } from './version'

const main = async () => {
  const args = arg(REGEN_ARGS)

  logger.info('P-Regen')

  if (args[REGEN_HELP]) {
    showHelp()
    return
  }

  if (args[REGEN_VERSION]) {
    logger.log(returnVersion())
    return
  }

  const config = loadConfig(args[REGEN_CONFIG] || defaultConfig())
}

await main()
