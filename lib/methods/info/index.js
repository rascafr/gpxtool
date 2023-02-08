import { HHmmssStringify, hourToHHmmss, msToH } from "../../util.js";

export function info ({name, type, points}) {
    const wasStarting = points[0].time.toTimeString().split(' ')[0];
    const wasFinished = points[points.length - 1].time.toTimeString().split(' ')[0];
    console.log('Activity', name, '(' + type + ')', 'started at', wasStarting, 'and finished at', wasFinished);
    const [h, m, s] = hourToHHmmss(msToH(points[points.length - 1].time - points[0].time));
    console.log('Total duration is', h, 'hours,', m, 'minutes and', s, 'seconds (' + HHmmssStringify([h, m, s]) + ')');
}