import { HHmmToValues, isStrTimeWellFormatted } from "../../util.js";

export function timechange ({name, type, points}, newTime) {

    if (!isStrTimeWellFormatted(newTime)) {
        console.error('`timechange` parameter must respect HH:mm format.');
        process.exit(-1);
    }
    const [ newHour, newMinute ] = HHmmToValues(newTime);

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

    return { name, type, points };
}