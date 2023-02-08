import { fileExists, HHmmssStringify, HHmmToValues, hourToHHmmss, isStrTimeWellFormatted, msToH, parseGPXfile, pointsToGPXfile, sToH, timeStringify } from "./util.js";

const NB_PARAMS_INFINITE = Number.MAX_VALUE;
const SPD_CHG_RANGE = { // in %
    max: 1000, // x10
    min: 1     // x0.01
};

const COMMANDS = {
    info: { usage: '' },
    merge: {
        usage: 'activity1.gpx activity2.gpx ... activityN.gpx',
        nbParams: NB_PARAMS_INFINITE
    },
    join: {
        usage: 'activity1.gpx activity2.gpx ... activityN.gpx joinDelay (seconds)',
        nbParams: NB_PARAMS_INFINITE
    },
    timechange: {
        usage: 'HH:mm',
        nbParams: 1
    },
    speedchange: {
        usage: `${SPD_CHG_RANGE.min}...${SPD_CHG_RANGE.max} (%)`,
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
        const { name, type, points } = parseGPXfile(filepath);
        const wasStarting = points[0].time.toTimeString().split(' ')[0];
        const wasFinished = points[points.length - 1].time.toTimeString().split(' ')[0];
        console.log('Activity', name, '(' + type + ')', 'started at', wasStarting, 'and finished at', wasFinished);
        const [h, m, s] = hourToHHmmss(msToH(points[points.length - 1].time - points[0].time));
        console.log('Total duration is', h, 'hours,', m, 'minutes and', s, 'seconds (' + HHmmssStringify([h, m, s]) + ')');
    },

    /**
     * Merges multiple GPX files into a single one
     * @param {*} filepath 
     * @param {*} options
     */
    merge: (filepath, options) => {
        // filepath is the first file but we include the ones passed in options as well
        const filesToMerge = [filepath, ...options];
        let mergeName = null;
        let mergeType = null;
        const mergePoints = [];
        filesToMerge.forEach(file => {
            const { name, type, points } = parseGPXfile(file);

            // keep the first values as activity name and type
            if (!mergeName) {
                mergeName = name;
                mergeType = type;
            }

            console.log(' - Merging', '"' + name + '"', '(' + type + ')', 'with', points.length, 'points');
            mergePoints.push(...points);
        });
        console.log('Output will have', mergePoints.length, 'points');

        pointsToGPXfile(filepath, mergeName, mergeType, mergePoints, 'merge-' + filesToMerge.length + '-');
    },

    /**
     * Join multiple GPX files into a single one, and remove relative time between activities
     * @param {*} filepath 
     * @param {*} options file1..fileN jointime
     */
    join: (filepath, options) => {
        const joinTime = parseInt(options.pop(), 10);
        if (joinTime < 0 || isNaN(joinTime)) {
            console.error('`join` last parameter must be an integer in seconds greater than 0.');
            process.exit(-1);
        }

        const [h, _m, s] = hourToHHmmss(sToH(joinTime));
        const m = _m + h * 60;
        console.log('Duration between each activity will be', joinTime, 'seconds (', m, 'min and', s, 'sec )');

        // filepath is the first file but we include the ones passed in options as well
        const filesToJoin = [filepath, ...options];

        let joinName = null;
        let joinType = null;
        let lastEnded = null;
        const joinPoints = [];
        filesToJoin.forEach(file => {
            const { name, type, points } = parseGPXfile(file);

            if (lastEnded) {
                console.log('   Last activity finished at', timeStringify(lastEnded));
                const offsetByH = lastEnded.getHours() - points[0].time.getHours();
                const offsetByM = lastEnded.getMinutes() - points[0].time.getMinutes();
                const offsetByS = lastEnded.getSeconds() - points[0].time.getSeconds();

                points.forEach(p => {
                    p.time.setHours(p.time.getHours() + offsetByH);
                    p.time.setMinutes(p.time.getMinutes() + offsetByM);
                    p.time.setSeconds(p.time.getSeconds() + offsetByS + joinTime);
                });

                console.log('   New activity will start at', timeStringify(points[0].time));
            }
            lastEnded = points[points.length - 1].time;

            // keep the first values as activity name and type
            if (!joinName) {
                joinName = name;
                joinType = type;
            }

            console.log(' - Merging', '"' + name + '"', '(' + type + ')', 'with', points.length, 'points');
            joinPoints.push(...points);
        });
        console.log('Output will have', joinPoints.length, 'points');

        pointsToGPXfile(filepath, joinName, joinType, joinPoints, 'join-' + filesToJoin.length + '-');
    },

    /**
     * Changes time of activity start by the new one given (HH:mm)
     * @param {*} filepath 
     * @param {*} options 
     */
    timechange: (filepath, [ option ]) => {
        const { name, type, points } = parseGPXfile(filepath);  
        if (!isStrTimeWellFormatted(option)) {
            console.error('`timechange` parameter must respect HH:mm format.');
            process.exit(-1);
        }
        const [ newHour, newMinute ] = HHmmToValues(option);

        const wasStarting = points[0].time.toTimeString().split(' ')[0];
        const wasFinished = points[points.length - 1].time.toTimeString().split(' ')[0];
        console.log('Activity originally started at', wasStarting, 'and finished at', wasFinished);

        const offsetByH = newHour - points[0].time.getHours();
        const offsetByM = newMinute - points[0].time.getMinutes();

        points.forEach(p => {
            p.time.setHours(p.time.getHours() + offsetByH)
            p.time.setMinutes(p.time.getMinutes() + offsetByM)
        });

        const nowStarting = points[0].time.toTimeString().split(' ')[0];
        const nowFinished = points[points.length - 1].time.toTimeString().split(' ')[0];
        console.log('Activity now started at', nowStarting, 'and finished at', nowFinished);

        pointsToGPXfile(filepath, name, type, points);
    },

    /**
     * Changes the activity speed by a given factor percentage (1...1000%)
     * @param {*} filepath 
     * @param {*} options 
     */
    speedchange: (filepath, [ option ]) => {
        const { name, type, points } = parseGPXfile(filepath);
        const ratio = parseInt(option, 10) / 100; // 100 = same speed
        if (!(ratio >= SPD_CHG_RANGE.min / 100 && ratio <= SPD_CHG_RANGE.max / 100)) {
            console.error(`\`speedchange\` parameter must respect range ${SPD_CHG_RANGE.min}...${SPD_CHG_RANGE.max} (%)`);
            process.exit(-1);
        }

        // 100 = end - start in ms
        // 200 = 0.5 * duration
        // 50 = 2 * duration
        FUNCTIONS.info(filepath, option);

        const startTime = points[0].time.getTime();
        points.forEach((p, i) => {
            if (i > 0) {
                p.time.setTime(startTime + (p.time.getTime() - startTime) / ratio) 
            }
        });

        const nowStarting = points[0].time.toTimeString().split(' ')[0];
        const nowFinished = points[points.length - 1].time.toTimeString().split(' ')[0];
        console.log('Activity now started at', nowStarting, 'and finished at', nowFinished);
        const [h, m, s] = hourToHHmmss(msToH(points[points.length - 1].time - points[0].time));
        console.log('New duration is now', h, 'hours,', m, 'minutes and', s, 'seconds (' + HHmmssStringify([h, m, s]) + ')');

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
        runCommand(null);
        process.exit(-1);
    }
}
