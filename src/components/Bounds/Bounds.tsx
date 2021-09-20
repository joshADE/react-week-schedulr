/* eslint-disable prettier/prettier */
import React, { memo } from 'react'
import { CellInfo, DateRange, Grid } from '../../types';
import { ClosedDaysTimes, Hours } from '../WeekScheduler/WeekScheduler';
import styles from '../WeekScheduler/WeekScheduler.module.css'

interface BoundsProps {
    grid: Grid;
    dateRangeToCells: (range: DateRange) => CellInfo[];
    hours?: Hours;
    closedDaysTimes?: ClosedDaysTimes;
    startOfWeek: moment.Moment;
}

const Bounds: React.FC<BoundsProps> = ({
    grid,
    hours,
    closedDaysTimes,
    dateRangeToCells,
    startOfWeek
}) => {
    
    return (
        <div className={styles.bounds}>
            {closedDaysTimes && closedDaysTimes.map((cdt, cdtIndex) => (
            <span className={styles["closed-day-time-container"]} key={cdtIndex}>
            {dateRangeToCells(cdt).map((cell, cellIndex, cellArray) => {
                    const { left, top, width, height } = grid.getRectFromCell(cell);

                    return <div 
                        className={`${styles["bound-box"]} ${styles["closed-day-time"]}`} 
                        style={{left, top, width, height}}
                        key={`${cellIndex}.${cellArray.length}`}
                    />})}
            </span>)
            )}

            {hours && Object.entries(hours).map(h => (
            <span className={styles["hours-container"]} key={h[0]}>

            {dateRangeToCells([startOfWeek.clone().add(h[0], 'days').startOf('day').toDate(), startOfWeek.clone().add(h[0], 'days').set({'hour':h[1][0].getHours(), 'minute':h[1][0].getMinutes(), 'second':h[1][0].getSeconds()}).toDate()]).map((cell, cellIndex, cellArray) => {
                const { left, top, width, height } = grid.getRectFromCell(cell);

                return <div 
                    className={`${styles["bound-box"]} ${styles.hours}`}
                    style={{left, top, width, height}}
                    key={`start.${h[0]}.${cellIndex}.${cellArray.length}`}
                />})}
            {dateRangeToCells([startOfWeek.clone().add(h[0], 'days').set({'hour':h[1][1].getHours(), 'minute':h[1][1].getMinutes(), 'second':h[1][1].getSeconds()}).toDate(), startOfWeek.clone().add(h[0], 'days').endOf('day').toDate()]).map((cell, cellIndex, cellArray) => {
                const { left, top, width, height } = grid.getRectFromCell(cell);

                return <div 
                    className={`${styles["bound-box"]} ${styles.hours}`} 
                    style={{left, top, width, height}}
                    key={`end.${h[0]}.${cellIndex}.${cellArray.length}`}
                />})}
            
            </span>)
            )}
        </div>);
}

export default memo(Bounds);