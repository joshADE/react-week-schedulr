/* eslint-disable prettier/prettier */
import React, { memo } from 'react'
import { CellInfo, DateRange, EventType, Grid, OnChangeCallback } from '../../types';
import { EventContentProps } from '../EventContent/EventContent';
import RangeBox from '../RangeBox/RangeBox';
import { Events } from '../WeekScheduler/WeekScheduler';
import styles from '../WeekScheduler/WeekScheduler.module.css'

export interface SharedScheduleProps {
    onChange?: OnChangeCallback;
    grid: Grid;
    isResizable?: boolean;
    isDeletable?: boolean;
    isMovable?: boolean;
    moveAxis: 'none' | 'both' | 'x' | 'y';
    cellInfoToDateRange(cell: CellInfo): DateRange;
    checkValidDateRange(id: string, dateRange: DateRange): boolean;
    eventContentComponent?: (props: EventContentProps) => JSX.Element;
    eventRootComponent?: any;
    onActiveChange?(index: [string, number] | [null, null]): void;
    onClick?(index: [string, number] | [null, null]): void;
    getIsActive(indexes: { cellIndex: number; rangeId: string }): boolean;
    disableDelete?: boolean;
    type: EventType;
    className?: string;
}

interface ScheduleProps {
    events: Events;
    dateRangeToCells: (range: DateRange) => CellInfo[];
}

const Schedule: React.FC<ScheduleProps & SharedScheduleProps> = ({
    events,
    isMovable,
    dateRangeToCells,
    grid,
    onChange,
    moveAxis,
    cellInfoToDateRange,
    checkValidDateRange,
    isResizable,
    isDeletable,
    onActiveChange,
    onClick,
    getIsActive,
    disableDelete,
    eventRootComponent,
    eventContentComponent,
    type,
    className   
}) => {
        return (
        <div className={styles["range-boxes"]}>
            {
                Object.entries(events).map((e, entryIndex, entries) => (
                <span className={styles["schedule-range-group"]} key={e[0]}>
                    {dateRangeToCells(e[1].range).map((cell, cellIndex, cellArray) => 
                    <RangeBox 
                        key={`${entryIndex}.${entries.length}.${cellIndex}.${cellArray.length}`}
                        cell={cell}
                        grid={grid}
                        id={e[0]}
                        details={e[1]}
                        onChange={onChange}
                        moveAxis={moveAxis}
                        cellInfoToDateRange={cellInfoToDateRange}
                        checkValidDateRange={checkValidDateRange}
                        rangeIndex={entryIndex}
                        cellIndex={cellIndex}
                        cellArray={cellArray}
                        isResizable={isResizable}
                        isDeletable={isDeletable}
                        isMovable={isMovable}
                        onActiveChange={onActiveChange}
                        onClick={onClick}
                        getIsActive={getIsActive}
                        disableDelete={disableDelete}
                        eventContentComponent={eventContentComponent}
                        eventRootComponent={eventRootComponent}
                        type={type}
                        className={className}
                    />)}
                </span>))
            }
        </div>);
}

export default memo(Schedule)