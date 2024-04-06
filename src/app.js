#!/usr/bin/env node --experimental-specifier-resolution=node
import arg from 'arg'
import { checkConfig, defaultConfig, loadConfig } from './config'
import { REGEN_ARGS, REGEN_CONFIG, REGEN_HELP, REGEN_VERSION, REGEN_NEW_MODEL } from './const'
import { showHelp } from './help'
import { returnVersion } from './version'
import { doAuth } from './server'
import { newModel, SourceFile } from './regen'
import logger from './logger'

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

  const modelName = args[REGEN_NEW_MODEL]
  if (modelName) {
    await newModel(args, modelName)
    return
  }

  const configName = args[REGEN_CONFIG] || defaultConfig()
  logger.info(`Using config "${configName}"`)

  const config = loadConfig(configName)
  checkConfig(config)

  // connect to server:
  const token = await doAuth(config)
  logger.success(`Token received! "${token}"`)

  // for (const file of config.files) {
  //   logger.info(`Processing file "${file.name}"`)
  //   logger.info(`  we have ${file.fragments.length} fragments here.`)
  //   //
  // }

  const aFile = new SourceFile('/Users/deksden/Documents/GitHub/p_regen/src/code-template.txt')
  logger.info('File:')
  logger.info(aFile)
}

await main()
