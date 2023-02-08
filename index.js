import { runCommand } from './commands.js';

const [ command, filepath, ...options ] = process.argv.slice(2);
console.log('***** GPXTOOL *****');
console.log('Started using command <' + command + '>');
runCommand(command, filepath, options);
