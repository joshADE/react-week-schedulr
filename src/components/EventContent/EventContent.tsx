/* eslint-disable prettier/prettier */
import moment from 'moment';
import React from 'react'
import { EventDetails } from '../WeekScheduler/WeekScheduler';
import styles from '../WeekScheduler/WeekScheduler.module.css'

export type EventContentProps = {
    width: number;
    height: number;
    dateRange: [Date, Date];
    isStart: boolean;
    isEnd: boolean;
    type: 'dynamic' | 'static';
    details: EventDetails;
    id: string;
    cellIndex: number;
};
  
export const EventContent = React.memo(function EventContent({
width,
height,
dateRange,
isStart,
isEnd,
}: EventContentProps) {


return (
    <div
    style={{ width, height }}
    className={styles["event-content"]}
    >
    <span aria-hidden className={styles.start}>
        {isStart && moment(dateRange[0]).format('lll')}
    </span>
    {isStart && isEnd && <span> - </span>}
    <span aria-hidden className={styles.end}>
        {isEnd && moment(dateRange[1]).format('lll')}
    </span>
    </div>
);
});
  