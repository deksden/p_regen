import Table from 'cli-table'
import {
  REGEN_HELP_ROWS
} from '../const'


export const showHelp = () => {
  const table = new Table({
    head: ["Command", "Alias", "Description"],
    style: {
      head: new Array(3).fill("cyan"),
    },
  })

  table.push(...REGEN_HELP_ROWS)
  console.log(table.toString())
}