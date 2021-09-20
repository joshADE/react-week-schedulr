/* eslint-disable prettier/prettier */
import moment from "moment";

export function clamp(num: number, min: number, max: number) {
    return num <= min ? min : num >= max ? max : num;
}

export function clampWrapInclusive(val: number, min: number, max: number) {
    const N = Math.abs(max - min);
    let newval = 0;
    if (val < min)
        newval = (max + 1) - ((Math.abs(min - val) % (N + 1) !== 0) ? Math.abs(min - val) % (N + 1) : (N + 1));
    else if (val > max)
        newval = (min - 1) + ((Math.abs(max - val) % (N + 1) !== 0) ? Math.abs(max - val) % (N + 1) : (N + 1));
    else
        newval = val;
    return newval;
}

export function range(from: number, to: number){
    const result = [];
    for (let i = from; i < to; i++){
        result.push(i);
    }
    return result;
}

export function differenceInDays(end: Date, start: Date){
    const duration = moment.duration(moment(end).startOf('day').diff(moment(start).startOf('day')));
    const asDays = duration.asDays();
    return Math.trunc(asDays);
}

export function differenceInMinutes(end: Date, start: Date){
    const duration = moment.duration(moment(end).diff(moment(start)));
    return duration.asMinutes();
}
