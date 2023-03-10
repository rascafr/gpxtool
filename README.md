# GPXtool

A multi-purpose tool that helps visualize and manipulate GPX files (from Garmin, Strava, Polar sport activities...).

Still in work in progress, only tested on *Garmin Watch*'s GPX files through *Garmin Connect* website.

### Before using it

- `merge` is useful if you have a sport session divided into many activities. Please note that this will not delete relative time between activities *(e.g. cycling between 8:00 and 8:30 then 10:00 to 11:00 would result in a 3 hours cycling session, with 1.5 hours of moving time)*

- `join` acts the same way as `merge`, plus removes the relative time between activities. Set the last parameters to 0 (seconds) to join all activities without any pause.

- `timechange` is a nice feature if you did a running workout at 3pm between two work meetings. Change it to 8:00, upload it to Strava, and your colleges won't call you a lazy person (nevertheless they might do the same). They might even admire your ability to have a real miracle morning.

- `speedchange` is an experimental feature. It's working properly but any platform such as Strava will be able to consider you're cheating if the duration between GPS points is reduced. Furthermore, your friends are likely to be surprised seen you running a 10km race in less than 40 minutes.

- `trim` removes all pauses from a given file. This means on platforms like Strava for instance, *elapsed time* would equal *moving time*.

## Installation

You'll just need **Node.js 18**.

It does not require any external dependencies.

Just clone the repository and you're done.

## Usage

The tool provides a CLI that explains everything by itself.

```
$ npm run start

***** GPXTOOL *****
Started using command <help>
Usage: npm start <command> <file> <option>
Available commands:
 - info 
 - trim 
 - merge <activity1.gpx> <activity2.gpx> ... <activityN.gpx>
 - join  <activity1.gpx> <activity2.gpx> ... <activityN.gpx> <joinDelay (seconds)>
 - timechange <HH:mm>
 - speedchange <1...1000 (%)>
 - help
```
