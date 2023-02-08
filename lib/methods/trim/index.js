import { hourToHHmmss, msToH } from "../../util.js";

export function trim ({name, type, points}) {
    console.log('Trimming');
    let lastTime = null;
    let pauseCounter = 0;
    points.forEach(({time}, pi) => {
        if (lastTime) {
            const diff = time.getTime() - lastTime.getTime();
            if (diff > 1000) {
                pauseCounter++;
                console.log(pauseCounter, hourToHHmmss(msToH(diff)));
            }
        }
        lastTime = time;
    })
}