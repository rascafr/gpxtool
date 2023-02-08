import { HHmmssStringify, hourToHHmmss, msToH } from "../../util.js";
import { info } from "../info/index.js";

const TRIM_THRESHOLD = 8000;

export function trim ({name, type, points}) {
    let lastTime = null;
    let rmTime = 0;

    points.forEach((p, pi) => {
        const { time } = p;
        if (lastTime) {
            const diff = time.getTime() - (lastTime.getTime() + rmTime);
            if (diff > TRIM_THRESHOLD) {
                rmTime += diff;
            }
        }
        p.time.setTime(p.time.getTime() - rmTime);
        lastTime = p.time;
    });

    const [h, m, s] = hourToHHmmss(msToH(rmTime));
    console.log('Pause duration removed:', h, 'hours,', m, 'minutes and', s, 'seconds');

    info({name, type, points});

    return { name, type, points };
}