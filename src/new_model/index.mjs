import { REGEN_CONFIG } from '../const'
import { checkConfig, defaultConfig, loadConfig } from '../config'
import { doAuth, fetchServer } from '../server'
import _ from 'lodash'
import logger from '../logger'
import { writeFileSync } from 'fs'
import { SourceFile } from '../regen'

export const newModel = async (args, modelName) => {
  /*
  Создать новую модель:
    * генерируем файл ресурса для клиентского приложения;
    * генерируем сниппеты для файла конфигурации про новые фрагменты;
   */
  const configName = args[REGEN_CONFIG] || defaultConfig()
  const config = loadConfig(configName)
  checkConfig(config)

  // auth on server
  const token = await doAuth(config)

  // get initial code from server
  let res = await fetchServer(config, `/codegen/model/${modelName}`,'GET', null)

  // write new file
  const fileName = `${config.basePath}/src/resources/${_.kebabCase(modelName)}.js`
  logger.success(`Writing file "${fileName}"`)
  writeFileSync(fileName, res.body, `utf-8`)

  const aFile = new SourceFile(fileName)
  logger.success('Fragments:')
  logger.success(JSON.stringify(aFile.fragments))
  /* expand all predefined fragments:
    import-components
    field-defs
    filter-fields
    list-fields
    form-fields
   */

  // import-components:
  res = await fetchServer(config, `/codegen/model/${modelName}/import-components`,'GET', null)
  aFile.fragments['import-components'].currentValue = res.body
  logger.info('import-components')
  logger.success(res.body)
}
