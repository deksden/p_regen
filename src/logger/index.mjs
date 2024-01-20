import chalk from 'chalk'
import JSONChalkify from 'json-chalkify'

const chalkify = new JSONChalkify().chalkify

// console.log(chalkify({myThing: 42}))
const log = (...message) => write(...message)

const success = (...message) => write(chalk.green(...message))

const warning = (...message) => write(chalk.yellow(...message))

const info = (...message) => write(chalk.blue(...message))

const error = (...message) => write(chalk.red(...message))

const debug = (...message) =>
  process.env.APP_ENV === 'debug' ? write(chalk.whiteBright('🔧 [DEBUG]', ...message)) : undefined

const write = (...message) => {
  const shouldWrite = process.env.APP_ENV !== 'test'

  if (shouldWrite) {
    for (let msg of message) {
      if (typeof msg === 'object') {
        console.log(chalkify(msg))
      } else {
        console.log(msg)
      }
    }
    // console.log(...message);
  }
}

export default { success, warning, info, error, log, debug }