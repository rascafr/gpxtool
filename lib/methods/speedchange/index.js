import { HHmmssStringify, hourToHHmmss, msToH } from "../../util.js";
import { SPD_CHG_RANGE } from "../../definitions.js";
import { info } from "../info/index.js";

export function speedchange ({name, type, points}, spdPercent) {
    const ratio = parseInt(spdPercent, 10) / 100; // 100 = same speed
    if (!(ratio >= SPD_CHG_RANGE.min / 100 && ratio <= SPD_CHG_RANGE.max / 100)) {
        console.error(`\`speedchange\` parameter must respect range ${SPD_CHG_RANGE.min}...${SPD_CHG_RANGE.max} (%)`);
        process.exit(-1);
    }

    info({name, type, points});

    // 100 = end - start in ms
    // 200 = 0.5 * duration
    // 50 = 2 * duration
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

    return { name, type, points };
}