import { info } from "./methods/info/index.js";
import { join } from "./methods/join/index.js";
import { merge } from "./methods/merge/index.js";
import { speedchange } from "./methods/speedchange/index.js";
import { timechange } from "./methods/timechange/index.js";
import { trim } from "./methods/trim/index.js";
import { fileExists, parseGPXfile, pointsToGPXfile } from "./util.js";
import { NB_PARAMS_INFINITE, SPD_CHG_RANGE } from "./definitions.js";

const COMMANDS = {
    info: { usage: '' },
    trim: { usage: '' },
    merge: {
        usage: '<activity1.gpx> <activity2.gpx> ... <activityN.gpx>',
        nbParams: NB_PARAMS_INFINITE
    },
    join: {
        usage: ' <activity1.gpx> <activity2.gpx> ... <activityN.gpx> <joinDelay (seconds)>',
        nbParams: NB_PARAMS_INFINITE
    },
    timechange: {
        usage: '<HH:mm>',
        nbParams: 1
    },
    speedchange: {
        usage: `<${SPD_CHG_RANGE.min}...${SPD_CHG_RANGE.max} (%)>`,
        nbParams: 1
    },
    help: { usage: '' },
};

export function runCommand(command, filepath, options) {
    const fcn = FUNCTIONS[command];
    if (!fcn) {
        return FUNCTIONS['help']();
    } else {
        assertParams(filepath, options, COMMANDS[command]?.nbParams || 0);
        if (!fileExists(filepath)) {
            console.error('File', filepath, 'does not exists or cannot be opened.');
            return FUNCTIONS['help']();
        }
        return fcn(filepath, options);
    }
}

const FUNCTIONS = {

    /**
     * Displays stats about and activity without applying changes to it
     * @param {*} filepath
     */
    info: (filepath) => {
        info(parseGPXfile(filepath));
    },

    /**
     * Trims less than 2s dead times (pauses)
     * @param {*} filepath 
     */
    trim: (filepath) => {
        const { name, type, points } = trim(
            parseGPXfile(filepath)
        );
        pointsToGPXfile(filepath, name, type, points);
    },

    /**
     * Merges multiple GPX files into a single one
     * @param {*} filepath 
     * @param {*} options file1...fileN
     */
    merge: (filepath, options) => {
        const { name, type, points } = merge(filepath, options);
        pointsToGPXfile(filepath, name, type, points, 'merge-' + (options.length + 1) + '-');
    },

    /**
     * Join multiple GPX files into a single one, and remove relative time between activities
     * @param {*} filepath 
     * @param {*} options file1...fileN jointime
     */
    join: (filepath, options) => {
        const { name, type, points } = join(filepath, options);
        pointsToGPXfile(filepath, name, type, points, 'join-' + (options.length + 1) + '-');
    },

    /**
     * Changes time of activity start by the new one given (HH:mm)
     * @param {*} filepath 
     * @param {*} options [ HH:mm string ]
     */
    timechange: (filepath, [ option ]) => {
        const { name, type, points } = timechange(
            parseGPXfile(filepath), option
        );
        pointsToGPXfile(filepath, name, type, points);
    },

    /**
     * Changes the activity speed by a given factor percentage (1...1000%)
     * @param {*} filepath 
     * @param {*} options [ 1...1000% value ]
     */
    speedchange: (filepath, [ option ]) => {
        const { name, type, points } = speedchange(
            parseGPXfile(filepath), option
        );
        pointsToGPXfile(filepath, name, type, points);
    },

    /**
     * Displays help and available commands
     */
    help: () => {
        console.log('Usage: npm start <command> <file> <option>');
        console.log('Available commands:');
        Object.keys(COMMANDS).forEach(k => console.log(' -', k, COMMANDS[k].usage));
    }
}

function assertParams(filepath, options, nbRequiredParams) {

    // always check filepath
    if (!filepath) {
        runCommand(null);
        process.exit(-1);
    }

    // if nb params = MAX then options can be empty
    if (nbRequiredParams !== NB_PARAMS_INFINITE && nbRequiredParams !== options.length) {
        console.error('Command requires', nbRequiredParams, 'parameters, got', options.length);
        runCommand(null);
        process.exit(-1);
    }
}
