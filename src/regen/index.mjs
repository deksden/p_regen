import { readFileSync, writeFileSync } from 'fs'
import _ from 'lodash'
import { checkConfig, defaultConfig, loadConfig } from '../config'
import { doAuth, fetchServer } from '../server'
import { REGEN_CONFIG } from '../const'
import logger from '../logger'

export const newModel = async (args, modelName) => {
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

export const loadFileAsStrings = (fileName) => {
  try {
    const contents = readFileSync(fileName, 'utf-8')
    return contents.split(/\r?\n/)
  } catch (err) {
    logger.error(err)
  }
}

/*
  Класс sourceFile: содержит свойство Fragments - массив объектов Fragment.
  Свойство fragments:
  У каждого Fragment есть id, currentValue, originalValue.
  Методы:
   loadFile
   replaceFragment
   getById

  Класс sourceFile:
    - метод loadFile - при загрузке обрабатывает на предмет фрагментов; фрагменты копируются в свойство
    fragments с ключом - идентификатор этого фрагмента;
    - метод countFragments
    - метод replaceFragment
    - свойства: currentValue, originalValue
*/

export class SourceFile {
  fragments
  file

  constructor (fileName) {
    this.file = loadFileAsStrings(fileName)

    // process file
    let ndx = 0
    let ndxFind = 0
    const isFragmentStart = (element) => {
      return _.startsWith(_.trim(element), '/** Fragment:')
    }

    const isFragmentEnd = (element) => {
      return _.startsWith(_.trim(element), '/** FragmentEnd')
    }

    const extractFragmentName = (element) => {
      const rx1 = new RegExp("Fragment:(.*?)[,|*/]")

      let res
      if (res = element.match(rx1)) {
        return _.trim(res[1])
      }
      return null
    }

    const extractModelName = (element) => {
      const rx1 = new RegExp("model:(.*?)[,|*/]")

      let res
      if (res = element.match(rx1)) {
        return _.trim(res[1])
      }
      return null
    }

    const countIdent = (line) => {
      let count = 0
      for (let ch of line) {
        if (ch === ' ') {
          count++
        } else {
          break
        }
      }
      return count
    }

    const makeIndent = (count) => {
      let str = '';
      for(let i= 0;i<count;i++) {
        str = str + ' '
      }
      return str
    }

    this.fragments = {}
    while((ndxFind = _.findIndex(this.file, isFragmentStart, ndx)) > 0) {
      let endIndex = _.findIndex(this.file, isFragmentEnd, ndxFind)
      if (endIndex === -1) {
        endIndex = this.file.length
      }
      const frLine = this.file[ndxFind]
      let fragmentName = extractFragmentName(frLine)
      this.fragments[fragmentName] = {}
      this.fragments[fragmentName].currentValue = this.file.slice(ndxFind+1, endIndex)
      this.fragments[fragmentName].originalValue = _.clone(this.fragments[fragmentName].currentValue)
      this.fragments[fragmentName].indexStart = ndxFind
      this.fragments[fragmentName].indexEnd = endIndex

      const mn = extractModelName(frLine)
      this.fragments[fragmentName].data = {}
      this.fragments[fragmentName].data.name = fragmentName
      this.fragments[fragmentName].data.modelName = mn
      const idt = countIdent(frLine)
      this.fragments[fragmentName].data.indentCount = idt
      this.fragments[fragmentName].data.indent = makeIndent(idt)

      ndx = ndxFind + 1
    }
    console.log(JSON.stringify(this.fragments))
  }

  count () {
    return (Object.keys(this.fragments)).length
  }

  byIndex(index) {
    const keys = Object.keys(this.fragments)
    return this.fragments[keys[index]]
  }
}

/**
 * Содержимое фрагмента
 * @typedef {Object} FragmentValue
 * @property {number} index индекс фрагмента в массиве строк
 * @property {string[]} value значение фрагмента
 */

/**
 * Объект для хранения данных о фрагменте
 * @typedef {Object} Fragment
 * @property {string} name
 * @property {FragmentValue} current текущее значение фрагмента
 * @property {FragmentValue} original оригинальное значение фрагмента
 */

/**
 * Найти следующий фрагмент от текущего
 * @param {string[]} stringArray массив строк, с которым мы работаем
 * @param {Fragment} [fragment] текущий фрагмент. Если null или не указан - то ищем первый фрагмент
 * @returns {?Fragment} найденный фрагмент; null если ничего не нашли
 */
export const findNextFragment = (stringArray, fragment) => {}

export const findFragmentByName = (stringArray, fragmentName) => {
}
