export const REGEN_CONFIG = '--config'
export const REGEN_CONFIG_ALIAS = '-c'
export const REGEN_HELP = '--help'
export const REGEN_HELP_ALIAS = '-h'
export const REGEN_VERSION = '--version'
export const REGEN_VERSION_ALIAS = '-v'
export const REGEN_NEW_MODEL = `--new`
export const REGEN_NEW_MODEL_ALIAS = `-n`


export const REGEN_ARGS = {
  [REGEN_VERSION]: Boolean,
  [REGEN_HELP]: Boolean,
  [REGEN_CONFIG]: String,
  [REGEN_NEW_MODEL]: String,

  // aliases:
  [REGEN_VERSION_ALIAS]: REGEN_VERSION,
  [REGEN_HELP_ALIAS]: REGEN_HELP,
  [REGEN_CONFIG_ALIAS]: REGEN_CONFIG,
  [REGEN_NEW_MODEL_ALIAS]: REGEN_NEW_MODEL
}

export const REGEN_HELP_ROWS = [
    [REGEN_CONFIG, REGEN_CONFIG_ALIAS, 'Config file name'],
    [REGEN_VERSION, REGEN_VERSION_ALIAS, 'Show the current version of the app'],
    [REGEN_NEW_MODEL, REGEN_NEW_MODEL_ALIAS, 'Create client app files for new model in current working dir'],
    [REGEN_HELP, REGEN_HELP_ALIAS, 'Show this information']
  ]
