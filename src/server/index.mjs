import logger from '../logger'
import got from 'got'

export const doAuth = async (config) => {
    if (config.server.auth === 'JWT') {
      const url = `${config.server.url}${config.server.authPath}`
      const opt = { json: { email: config.server.email, password: config.server.password } }
      logger.info(`Auth on server on "${url}"`)
      const data = await got.post(url, opt).json()
      if (!data.token) {
        const err = 'Hmmm... No token from server!'
        console.error(err)
        throw new Error(err)
      }
      config.token = data.token
      return data.token
    }
  }

export const fetchServer = async (config, apiPath, method, data) => {
  const url = `${config.server.url}${apiPath}`
  const opt = {
    headers: { Authorization: `Bearer ${config.token}` },
    method
  }
  if (data) {
    opt.json = data
  }
  return await got(url, opt)
}