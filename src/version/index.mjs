import fs from 'fs'
import path, { resolve } from 'path'
export const returnVersion = () => {
  return JSON.parse(fs.readFileSync(resolve(path.join(process.cwd(), 'package.json'))).toString()).version
}