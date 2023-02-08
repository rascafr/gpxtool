import { runCommand } from "./lib/commands.js";

const [ command, filepath, ...options ] = process.argv.slice(2);
console.log('***** GPXTOOL *****');
if (command) {
    console.log('Started using command <' + command + '>');
}
runCommand(command, filepath, options);
