import fs from 'fs'
import path, { resolve } from 'path'

/**
 * Возвратить версию приложения из свойства `version` файла `package.json`
 * @return {string} строковое представление поля `.version`
 */
export const returnVersion = () => {
  return JSON.parse(fs.readFileSync(resolve(path.join(process.cwd(), 'package.json'))).toString()).version
}
