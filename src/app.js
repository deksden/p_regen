#!/usr/bin/env node --experimental-specifier-resolution=node
import arg from 'arg'
import { checkConfig, defaultConfig, loadConfig } from './config'
import { REGEN_ARGS, REGEN_CONFIG, REGEN_HELP, REGEN_VERSION, REGEN_NEW_MODEL } from './const'
import { showHelp } from './help'
import { showVersion } from './version'
import { doAuth, fetchServer } from './server'
import { postprocessAddComma, postprocessSplitByComma, postprocessSplitByNewline, SourceFile } from './regen'
import { newModel } from './new_model'
import logger from './logger'
import mustache from 'mustache'
import { writeFileSync } from 'fs'
import path from 'path'

const main = async () => {
  const args = arg(REGEN_ARGS)

  logger.info('P Regen')

  // показать справку
  if (args[REGEN_HELP]) {
    showHelp(logger)
    return
  }

  // показать версию
  if (args[REGEN_VERSION]) {
    showVersion(logger)
    return
  }

  // сделать новую модель
  const modelName = args[REGEN_NEW_MODEL]
  if (modelName) {
    await newModel(args, modelName)
    return
  }

  // основной процесс:
  const configName = args[REGEN_CONFIG] || defaultConfig()
  const config = loadConfig(configName)
  checkConfig(config)

  // auth server:
  await doAuth(config)

  // обработать все файлы:
  for (const file of config.files) {
    logger.info(`Processing file "${file.name}"`)

    const fileName = path.join(config.basePath, file.name)
    logger.info(`Full path = "${fileName}`)
    const aFile = new SourceFile(fileName)

    // обработать все фрагменты
    for (const fragmentName of Object.keys(aFile.fragments)) {
      logger.info(`  = processing fragment "${fragmentName}"`)
      const fragment = aFile.fragments[fragmentName]
      const fragmentType = config['fragment-types'][fragmentName]
      if (!fragmentType) {
        throw new Error(`Fragment type ${fragmentName} not found in config file, "fragment-type" section!`)
      }

      // обработать и подготовить URL:
      const url = mustache.render(fragmentType.url, fragment.data)

      logger.info(`  - fetching server "${url}"`)
      let res = await fetchServer(config, url, 'GET', null)
      res = res.body

      // сделать все постобработки:
      const pp = fragmentType.postprocess.split(',')
      for (const process of pp) {
        logger.info(`  - postprocess "${process}"`)
        if (process === 'splitByComma') {
          res = postprocessSplitByComma(res)
        } else if (process === 'addComma') {
          res = postprocessAddComma(res)
        } else if (process === 'splitByNewline') {
          res = postprocessSplitByNewline(res)
        } else if (process) {
          throw new Error(`Unknown process "${process}"`)
        }
      }

      // обновить значение фрагмента:
      fragment.currentValue = res
    }

    logger.info('Write file with updated fragments')
    // записываем файл
    aFile.processWriteFile()
    writeFileSync(fileName, aFile.file.join('\n'), 'utf-8')
  }
}

await main()
