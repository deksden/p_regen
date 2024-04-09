import { readFileSync, writeFileSync } from 'fs'
import _ from 'lodash'
import { checkConfig, defaultConfig, loadConfig } from '../config'
import { doAuth, fetchServer } from '../server'
import { REGEN_CONFIG } from '../const'
import logger from '../logger'

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

  /** является ли строка началом фрагмента?
   *
   * @param element {string} строка для обработки
   * @return {boolean} возвращает true если строка содержит токен начала фрагмента
   */
  isFragmentStart(element) {
    return _.startsWith(_.trim(element), '/** Fragment:')
  }

  /** является ли строка завершением фрагмента?
   *
   * @param element {string} строка для обработки
   * @return {boolean} возвращает true если строка содержит токен завершения фрагмента
   */
  isFragmentEnd(element) {
    return _.startsWith(_.trim(element), '/** FragmentEnd')
  }

  /** из начальной строки фрагмента выделяем имя фрагмента
   *
   * @param element {string} строка для обработки
   * @return {null|string} имя фрашмента или null, если в строке не найдено имя фрагмента
   */
  extractFragmentName(element) {
    const rx1 = new RegExp("Fragment:(.*?)[,|*/]")

    let res
    if (res = element.match(rx1)) {
      return _.trim(res[1])
    }
    return null
  }

  /** выделить имя модели из заголовка фрагмента
   *
   * @param element {string} строка для обработки
   * @return {null|string} возвращает имя модели или null если имени модели нет
   */
  extractModelName (element) {
    if (this.isFragmentStart(element) === false) {
      return null
    }

    const rx1 = new RegExp("model:(.*?)[,|*/]")

    let res
    if (res = element.match(rx1)) {
      return _.trim(res[1])
    }
    return null
  }

  /** вернуть количество отступов в этой строке
   *
   * @param line {string} строка для обработки
   * @return {number} количество пробелов в начале строки
   */
  countIdent (line) {
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

  /** сделать нужное количество пробелов
   *
   * @param count {number} сколько пробелов нужно сделать
   * @return {string} возвращает строку, состоящую из нужного количества пробелов (или пустую строку, если 0)
   */
  makeIndent (count) {
    let str = '';
    for(let i= 0;i<count;i++) {
      str = str + ' '
    }
    return str
  }

  processLoadFile () {
    // process file
    let ndx = 0
    let ndxFind = 0

    this.fragments = {}
    while((ndxFind = _.findIndex(this.file, this.isFragmentStart, ndx)) > 0) {
      let endIndex = _.findIndex(this.file, this.isFragmentEnd, ndxFind)
      if (endIndex === -1) {
        endIndex = this.file.length
      }
      const frLine = this.file[ndxFind]
      let fragmentName = this.extractFragmentName(frLine)
      this.fragments[fragmentName] = {}
      this.fragments[fragmentName].currentValue = this.file.splice(ndxFind+1, endIndex-(ndxFind+1))
      this.fragments[fragmentName].originalValue = _.clone(this.fragments[fragmentName].currentValue)
      this.fragments[fragmentName].currentValue = this.fragments[fragmentName].currentValue.map(itm => _.trim(itm))
      this.fragments[fragmentName].indexStart = ndxFind
      this.fragments[fragmentName].indexEnd = ndxFind+1

      const mn = this.extractModelName(frLine)
      this.fragments[fragmentName].data = {}
      this.fragments[fragmentName].data.name = fragmentName
      this.fragments[fragmentName].data.modelName = mn
      const idt = this.countIdent(frLine)
      this.fragments[fragmentName].data.indentCount = idt
      this.fragments[fragmentName].data.indent = this.makeIndent(idt)

      ndx = ndxFind + 2
    }
  }

  /** подготавливаем this.file к записи путем помещения текущих значений фрагментов в этот массив
   *
   */
  processWriteFile () {
    const fCount = this.count() // получаем количество фрагментов
    let offset = 0 // смещение индексов за счет уже вставленных фрагментов, для начала - ноль

    // обработаем каждый фрагмент:
    for (let ndx=0; ndx<fCount; ndx++) {
      const f = this.byIndex(ndx) // получим текущий фрагмент
      const fSize = f.currentValue.length // размер в строках текущего значения этого фрагмента
      f.currentValue = f.currentValue.map(itm => f.data.indent + itm)
      this.file.splice(f.indexStart+1+offset, 0, ...f.currentValue)
      offset += fSize
    }
  }

  /** конструктор - загрузить файл и обработать его
   *
   * @param fileName : string - путь к файлу, который будет загружен
   * @return: ничего не возвращает
   */
  constructor (fileName) {
    this.file = loadFileAsStrings(fileName)
    this.processLoadFile()
    console.log(JSON.stringify(this.fragments))
    this.processWriteFile()
  }

  /**
   * @return {number} возвращает количество фрагментов в файле
   */
  count () {
    return (Object.keys(this.fragments)).length
  }

  /** возвращает фрагмент с указанным индексом
   *
   * @param index {number} индекс фрагмента, считаем первый от 0
   * @return {*} фрагмент
   */
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
