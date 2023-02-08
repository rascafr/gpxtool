import fs from 'fs';
import path from 'path';

export function fileExists(filepath) {
    return fs.existsSync(filepath);
}

export function pathResolve(filepath) {
    return path.parse(filepath);
}

export function isStrTimeWellFormatted(time) {
    return /[0-9]{1,2}:[0-9]{1,2}/.test(time);
}

export function HHmmToValues(time) {
    return time.split(':').map(x => parseInt(x, 10));
}

/**
 * Stringify into HH:mm:ss a [h, m, s] array
 * @param {*} timeElms as a [h, m, s] array
 */
export function HHmmssStringify(timeElms) {
    return timeElms.map(e => `${e}`.padStart(2, '0')).join(':');
}

export function timeStringify(time) {
    // time.constructor.name === Date
    return HHmmssStringify([
        time.getHours(),
        time.getMinutes(),
        time.getSeconds()
    ]);
}

export function msToH(ms) {
    return ms / 3600 / 1000;
}

export function sToH(s) {
    return s / 3600;
}

export function hourToHHmmss(duration) {
    const h = Math.floor(duration);
    const _m = (duration - h) * 60;
    const m = Math.floor(_m);
    const s = Math.floor((_m - m) * 60);
    return [h, m, s];
}

export function parseGPXfile(filePath) {
    const data = fs.readFileSync(filePath).toString();
    const rows = data.split('\n');

    let tmpObj = null;
    let points = [];
    let name = '';
    let type = '';
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        // name
        if (row.includes('name')) {
            name = row.match(/<name>(.+)<\/name>/)[1];
        }
        // type
        else if (row.includes('type')) {
            type = row.match(/<type>(.+)<\/type>/)[1];
        }
        // start or end tags
        else if (row.includes('trkpt')) {

            // start now
            if (!tmpObj) {
                const [ lat, lon ] = row.match(/lat="(\d+\.?\d*)" lon="(\d+\.?\d*)"/).slice(1, 3).map(d => parseFloat(d));
                tmpObj = { lat, lon };
            }
            // stop, push to stack
            else {
                points.push({...tmpObj});
                tmpObj = null;
            }

        }
        // other tags we'll add inside data
        else if (tmpObj && row.includes('ele')) {
            tmpObj.ele = row.match(/(\d+\.?\d*)/).slice(1, 2).map(d => parseFloat(d))[0];
        }
        else if (tmpObj && row.includes('time')) {
            tmpObj.time = new Date(row.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/).slice(1, 2)[0]);
        }
        else if (tmpObj && row.includes('atemp')) {
            tmpObj.atemp = parseFloat(row.match(/\d+.?\d+/)[0]);
        }
        else if (tmpObj && row.includes('hr')) {
            tmpObj.hr = parseInt(row.match(/hr>(\d+)/)[1]);
        }
    }

    return { name, type, points };
}

export function pointsToGPXfile(filepath, name, type, points, prefix = '') {

    const realPath = pathResolve(filepath);
    const outNewPath = path.resolve(realPath.dir, prefix + 'gpxt-' + realPath.base);
    console.log('Saving "' + name + '" (' + type + ') into', outNewPath);

    let content = 
`<?xml version="1.0" encoding="UTF-8"?>
<gpx creator="Garmin Connect" version="1.1"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/11.xsd"
  xmlns:ns3="http://www.garmin.com/xmlschemas/TrackPointExtension/v1"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ns2="http://www.garmin.com/xmlschemas/GpxExtensions/v3">
  <metadata>
    <link href="connect.garmin.com">
      <text>Garmin Connect</text>
    </link>
    <time>${points[0].time.toISOString()}</time>
  </metadata>
  <trk>
    <name>${name}</name>
    <type>${type}</type>
    <trkseg>
`;

    points.forEach(p => {
        content += 
`      <trkpt lat="${p.lat}" lon="${p.lon}">
        <ele>${p.ele}</ele>
        <time>${p.time.toISOString()}</time>
        <extensions>
          <ns3:TrackPointExtension>
            <ns3:atemp>${forceFloat(p.atemp)}</ns3:atemp>
            <ns3:hr>${p.hr}</ns3:hr>
          </ns3:TrackPointExtension>
        </extensions>
      </trkpt>
`
    });

    content += 
`    </trkseg>
  </trk>
</gpx>
`;

    fs.writeFileSync(outNewPath, content);
}

function forceFloat(n) {
    n = `${n}`;
    if (!n.includes('.')) n += '.0';
    return n;
}