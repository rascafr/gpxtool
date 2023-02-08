import { hourToHHmmss, parseGPXfile, sToH, timeStringify } from "../../util.js";

export function join (filepath, options) {

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

    return { name: joinName, type: joinType, points: joinPoints };
}