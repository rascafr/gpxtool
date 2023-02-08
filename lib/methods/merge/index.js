import { hourToHHmmss, msToH, parseGPXfile } from "../../util.js";

export function merge (filepath, options) {

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

    return { name: mergeName, type: mergeType, points: mergePoints };
}