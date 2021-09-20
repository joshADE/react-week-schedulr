/* eslint-disable prettier/prettier */
import moment from "moment";


export const cellToDate = ({
    startX,
    startY,
    toMin,
    originDate,
}: {
    startX: number;
    startY: number;
    toMin: (y: number) => number;
    toDay: (x: number) => number;
    originDate: Date;
}) => moment(originDate).add(startX, 'days').add(toMin(startY), 'minutes');