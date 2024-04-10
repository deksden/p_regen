import { REGEN_CONFIG } from '../const'
import { checkConfig, defaultConfig, loadConfig } from '../config'
import { doAuth, fetchServer } from '../server'
import _ from 'lodash'
import logger from '../logger'
import { writeFileSync } from 'fs'
import { postprocessAddComma, postprocessSplitByComma, postprocessSplitByNewline, SourceFile } from '../regen'


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

  // write new file from template
  const fileName = `${config.basePath}/src/resources/${_.kebabCase(modelName)}.js`
  logger.success(`Writing file "${fileName}"`)
  writeFileSync(fileName, res.body, `utf-8`)

  // загрузим новый шаблонный файл для обработки всех его фрагментов:
  const aFile = new SourceFile(fileName)

  // import-components:
  res = await fetchServer(config, `/codegen/model/${modelName}/import-components`,'GET', null)
  aFile.fragments['import-components'].currentValue = postprocessAddComma(postprocessSplitByComma(res.body))

  // field-defs:
  res = await fetchServer(config, `/codegen/model/${modelName}/field-defs`,'GET', null)
  aFile.fragments['field-defs'].currentValue = postprocessSplitByNewline(res.body)

  // list-fields:
  res = await fetchServer(config, `/codegen/model/${modelName}/list`,'GET', null)
  aFile.fragments['list-fields'].currentValue = postprocessSplitByNewline(res.body)

  // form-fields:
  res = await fetchServer(config, `/codegen/model/${modelName}/edit`,'GET', null)
  aFile.fragments['form-fields'].currentValue = postprocessSplitByNewline(res.body)

  // filter-fields:
  res = await fetchServer(config, `/codegen/model/${modelName}/filter`,'GET', null)
  aFile.fragments['filter-fields'].currentValue = postprocessSplitByNewline(res.body)

  aFile.processWriteFile()
  writeFileSync(fileName, aFile.file.join('\n'), `utf-8`)
}
