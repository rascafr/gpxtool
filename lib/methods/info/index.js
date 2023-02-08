import { distance, HHmmssStringify, hourToHHmmss, msToH } from "../../util.js";

export function info ({name, type, points}, displayDistance = true) {
    const wasStarting = points[0].time.toTimeString().split(' ')[0];
    const wasFinished = points[points.length - 1].time.toTimeString().split(' ')[0];
    console.log('Activity', name, '(' + type + ')', 'started at', wasStarting, 'and finished at', wasFinished);
    const [h, m, s] = hourToHHmmss(msToH(points[points.length - 1].time - points[0].time));
    console.log('Total duration is', h, 'hours,', m, 'minutes and', s, 'seconds (' + HHmmssStringify([h, m, s]) + ')');
    if (displayDistance) {
        const totalDistance = points.reduce((stk, cur, idx) => stk + (idx > 0 ? distance(cur, points[idx - 1]) : 0), 0);
        console.log('Total distance is', (totalDistance / 1000).toFixed(2), 'km');
    }
}
