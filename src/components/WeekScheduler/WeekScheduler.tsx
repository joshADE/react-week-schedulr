/* eslint-disable prettier/prettier */
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  memo,
} from "react";
import moment from "moment";
import isEqual from 'date-fns/isEqual'
import invariant from 'invariant';
import styles from './WeekScheduler.module.css'
import { Cell } from "../Cell/Cell";
import { CellInfo, DateRange, Grid, OnChangeCallback } from "../../types";
import { createGrid } from "../../utils/createGrid";
import Schedule, { SharedScheduleProps } from "../Schedule/Schedule";
import { createMapDateRangeToCells } from "../../utils/createMapDateRangeToCells";
import {
  createMapCellInfoToRecurringTimeRange,
} from "../../utils/createMapCellInfoToRecurringTimeRange";
import { getSpan } from "../../utils/getSpan";
import { mergeEvents } from "../../utils/mergeEvents";
import isWithinInterval from "date-fns/isWithinInterval";
// import { useClickAndDrag } from "../../hooks/useClickAndDrag";
import Bounds from "../Bounds/Bounds";
import addHours from "date-fns/addHours";
import { getEarliestTimeRange } from "../../utils/getEarliestTimeRange";
import scrollIntoView from "scroll-into-view-if-needed";
import useComponentSize from "@rehooks/component-size";

export type Hours = {[id:number]: DateRange}
export type ClosedDaysTimes = DateRange[];

export type EventDetails = { range: DateRange; title?: string; desc?: string };
export type Events = { [id: string]: EventDetails };

interface WeekSchedulerProps {
  originDate?: Date;
  /**
   * The height of the container for the whole scheduler. If not set, it will be 100vh.
   */
  height?: string;
  /**
   * The width of the container for the whole scheduler. If not set, it will be 100%.
   */
  width?: string;
  /**
   * The cell height. If not set, it will be computed based on the available height.
   */
  cellHeight?: number;
  /**
   * The cell width. If not set, it will be computed based on the available width.
   */
  cellWidth?: number;
  /**
   * The visual grid increments in minutes.
   * @default 120
   */
  visualGridVerticalPrecision?: number;

  /**
   * The minimum number of minutes a created range can span
   * @default 15
   */
  verticalPrecision?: number;

  /**
   * The minimum number of minutes for an time block
   * created with a single click.
   * @default visualGridVerticalPrecision
   */
  cellClickPrecision?: number;

  /**
   * The maximum number of minutes a createed range could be span.
   * If not provided it will be the number of minutes in a day.
   */
   maxVerticalPrecision?: number;

  /**
   * Events that could be moved around
   */
  dynamicEvents: Events;
  /**
   * Events that can't be moved but take up space and prevent other events from moving to their location
   */
  staticEvents: Events;
  /**
   * The view will initially be scrolled to these hours.
   * Defaults to work hours (9-17).
   * @default [9, 17]
   */
  defaultHours?: [number, number];
  onChangeStaticEvents: (newEvents: Events) => void;
  onChangeDynamicEvents: (newEvents: Events) => void;
  onEventClick?: SharedScheduleProps['onClick'];
  newEventsAddedTo: "static" | "dynamic" | "none";
  eventsOverlap?: boolean;
  disableDelete?: boolean;
  eventContentComponent?: SharedScheduleProps['eventContentComponent'];
  eventRootComponent?: SharedScheduleProps['eventRootComponent'];
  generateEvent: (eventDetails: EventDetails) => Events;
  hours?: Hours;
  closedDaysTimes?: ClosedDaysTimes;
}

export const daysOfWeek = [0, 1, 2, 3, 4, 5, 6];
const NumberOfMinutesInADay = 24 * 60;
const horizontalPrecision = 1;
const toDay = (x: number): number => x * horizontalPrecision;
const toX = (days: number): number => days / horizontalPrecision;

const WeekScheduler: React.FC<WeekSchedulerProps> = ({
  originDate = new Date(),
  width,
  height,
  cellWidth,
  cellHeight,
  visualGridVerticalPrecision = 120,
  verticalPrecision = 15,
  defaultHours = [9, 17],
  maxVerticalPrecision = NumberOfMinutesInADay,
  cellClickPrecision = visualGridVerticalPrecision,
  dynamicEvents,
  staticEvents,
  onChangeStaticEvents,
  onChangeDynamicEvents,
  newEventsAddedTo,
  eventsOverlap,
  disableDelete,
  generateEvent,
  hours,
  closedDaysTimes,
  onEventClick,
  eventContentComponent,
  eventRootComponent,
}) => {


  
  const numVerticalCells = NumberOfMinutesInADay / verticalPrecision;
  const numHorizontalCells = 7 / horizontalPrecision;
  const numVisualVerticalCells =
    NumberOfMinutesInADay / visualGridVerticalPrecision;
  const times: number[] = [];
  const schedulerRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [[totalHeight, totalWidth], setDimensions] = useState([0, 0]);

  const size = useComponentSize(parentRef);

  // const {
  //   style: dragBoxStyle,
  //   box,
  //   isDragging,
  //   hasFinishedDragging,
  //   cancel,
  // } = useClickAndDrag(parentRef, newEventsAddedTo === 'none');

  const toMin = useCallback(
    (y: number) =>
      (y * verticalPrecision) /
      (verticalPrecision / visualGridVerticalPrecision),
    [verticalPrecision, visualGridVerticalPrecision]
  );
  const toY = useCallback(
    (mins: number): number =>
      (mins / verticalPrecision) *
      (verticalPrecision / visualGridVerticalPrecision),
    [verticalPrecision, visualGridVerticalPrecision]
  );



  // const [pendingCreation, setPendingCreation] =
  //   useState<Events | null>(null);


  for (let i = 0; i < numVisualVerticalCells; i++) {
    times.push(i);
  }



  useEffect(
    function updateGridDimensionsOnSizeOrCellCountChange() {
      if (!schedulerRef.current) {
        setDimensions([0, 0]);
        return;
      }

      setDimensions([schedulerRef.current.clientHeight, schedulerRef.current.clientWidth]);
    },
    [size, numVisualVerticalCells],
  );



  const startOfWeek = useMemo(
    () => moment(originDate).clone().startOf("week"),
    [originDate]
  );
  const endOfWeek = moment(originDate).clone().endOf("week");

  // originDate is set to the startOfWeek not just some arbitrary date passed by the user
  // this will make it easier to figure out the position of the date range horizontally
  // as originDate is mainly used to calculate the x position

  // numVerticalCells is set as the numVisualVeritcal cells because the ranges need to be
  // positioned relative to the visual vertical cells not the vertical cells
  const dateRangeToCells = useMemo(() => {
    return createMapDateRangeToCells({
      originDate: startOfWeek.toDate(),
      numVerticalCells: numVisualVerticalCells,
      numHorizontalCells,
      toX,
      toY,
    });
  }, [toY, numVisualVerticalCells, numHorizontalCells, startOfWeek]);

  const cellInfoToDateRanges = useMemo(() => {
    return createMapCellInfoToRecurringTimeRange({
      originDate: startOfWeek.toDate(),
      fromY: toMin,
      fromX: toDay,
    });
  }, [toMin, startOfWeek]);

  const cellInfoToSingleDateRange = useCallback(
    (cell: CellInfo): DateRange => {
      const [first, ...rest] = cellInfoToDateRanges(cell);
      invariant(
        rest.length === 0,
        `Expected "cellInfoToSingleDateRange" to return a single date range, found ${
          rest.length
        } additional ranges instead. ${JSON.stringify(first)} - ${JSON.stringify(rest)}`,
      );

      return first;
    },
    [cellInfoToDateRanges],
  );

 


  const maxRangeHeightSpan = useMemo(() => { 
    
    return toY(maxVerticalPrecision);
    
  }, [toY, maxVerticalPrecision]);


  const grid = useMemo<Grid | null>(() => {
    if (totalHeight === null || totalWidth === null) {
      return null;
    }

    return createGrid({
      totalHeight: cellHeight? cellHeight * numVisualVerticalCells: totalHeight,
      totalWidth: cellWidth? cellWidth * numHorizontalCells: totalWidth,
      numHorizontalCells,
      numVerticalCells,
      numVisualVerticalCells,
      maxRangeHeightSpan,
    });
  }, [totalHeight, totalWidth, numHorizontalCells, numVerticalCells, numVisualVerticalCells, maxRangeHeightSpan, cellHeight, cellWidth]);




  const checkValidDateRange = useCallback((id: string, dateRange: DateRange) => {
    console.log('checking valid date');
    // check if within hours
    const dayOfWeek = dateRange[0].getDay();

    if (hours && hours[dayOfWeek]){
      const start = hours[dayOfWeek][0];
      const end = hours[dayOfWeek][1];
      start.setFullYear(dateRange[0].getFullYear(), dateRange[0].getMonth(), dateRange[0].getDate());
      end.setFullYear(dateRange[0].getFullYear(), dateRange[0].getMonth(), dateRange[0].getDate());
      if (!isWithinInterval(dateRange[0], { start, end }) || !isWithinInterval(dateRange[1], { start, end })){
        return false;
      }
    }

    if (closedDaysTimes){
      for(let i = 0; i < closedDaysTimes.length; i++){
        const closedDayTime = closedDaysTimes[i];
        const start = closedDayTime[0];
        const end = closedDayTime[1];
        if (moment(dateRange[0]).isBetween(start, end, undefined, "()") ||
        moment(dateRange[1]).isBetween(start, end, undefined, "()")){
          return false;
        }
      }
    }

    if (!eventsOverlap){
      const allEvents : EventDetails[] = [];
      if (dynamicEvents){
       allEvents.push(...Object.entries(dynamicEvents).filter(value => value[0] !== id).map(value => value[1]));
      }
      if (staticEvents){
        allEvents.push(...Object.entries(staticEvents).filter(value => value[0] !== id).map(value => value[1]));
      }
      for(let i = 0; i < allEvents.length; i++){
        const { range:[start, end] } = allEvents[i];
        if (moment(dateRange[0]).isBetween(start, end, undefined, "()") ||
        moment(dateRange[1]).isBetween(start, end, undefined, "()")){
          return false;
        }
      }
    }

    return true;
  }, [hours, closedDaysTimes, dynamicEvents, staticEvents, eventsOverlap]);

  // useEffect(
  //   function updatePendingCreationOnDragBoxUpdate() {
  //     if (grid === null || box === null) {
  //       setPendingCreation(null);
  //       return;
  //     }
      
  //     const cell = grid.getCellFromRect(box, true);
      
  //     const dateRanges = cellInfoToDateRanges(cell);

  //     let events : Events = {};

  //     dateRanges.forEach(dateRange => { 
  //       if (checkValidDateRange("", dateRange))
  //         events = {...events, ...generateEvent({ range: dateRange })}
  //     });

  //     setPendingCreation(events);
  //   },
  //   [box, grid, cellInfoToDateRanges, toY, generateEvent, checkValidDateRange],
  // );

  const [[activeRangeId, activeCellIndex], setActive] = useState<
    [string, number] | [null, null]
  >([null, null]);

  // useEffect(
  //   function updateScheduleAfterDraggingFinished() {
  //     // if (newEventsAddedTo === 'none') { // for some reason when you change newEventsAddedTo to none this code makes all events disappear
  //     //   return;
  //     // }

  //     if (hasFinishedDragging) {
  //       if (newEventsAddedTo === 'dynamic')
  //         onChangeDynamicEvents(mergeEvents(dynamicEvents, pendingCreation));

  //       if (newEventsAddedTo === 'static')
  //         onChangeStaticEvents(mergeEvents(staticEvents, pendingCreation));
  //       setPendingCreation(null);
  //     }
  //   },
  //   [
  //     hasFinishedDragging,
  //     newEventsAddedTo,
  //     onChangeDynamicEvents,
  //     onChangeStaticEvents,
  //     setPendingCreation,
  //     pendingCreation,
  //     staticEvents,
  //     dynamicEvents
  //   ],
  // );

  // useEffect(
  //   function clearActiveBlockAfterCreation() {
  //     if (pendingCreation === null) {
  //       setActive([null, null]);
  //     }
  //   },
  //   [pendingCreation],
  // );

  const handleEventChange = useCallback<OnChangeCallback>(
    (newEventDetails, id) => {

      if (!dynamicEvents && newEventDetails) {
        onChangeDynamicEvents({[id]: newEventDetails});
        return;
      }

      const newEvents = {...dynamicEvents};

      if (!newEventDetails) {
        delete newEvents[id];
      } else {
        if (
          isEqual(newEventDetails.range[0], newEvents[id].range[0]) &&
          isEqual(newEventDetails.range[1], newEvents[id].range[1])
        ) {
          return;
        }
        newEvents[id] = newEventDetails;

      }

      onChangeDynamicEvents(newEvents);
    },
    [dynamicEvents, onChangeDynamicEvents],
  );

  const getIsActive = useCallback(
    ({ rangeId, cellIndex }) => {
      return rangeId === activeRangeId && cellIndex === activeCellIndex;
    },
    [activeCellIndex, activeRangeId],
  );


  // useEffect(
  //   function cancelPendingCreationOnSizeChange() {
  //     cancel();
  //   },
  //   [size, cancel],
  // );

  useEffect(
    function scrollToActiveTimeBlock() {
      if (!document.activeElement) {
        return;
      }

      if (!root.current || !root.current.contains(document.activeElement)) {
        return;
      }

      scrollIntoView(document.activeElement, {
        scrollMode: 'if-needed',
        block: 'nearest',
        inline: 'nearest',
      });
    },
    [staticEvents, dynamicEvents],
  );

  
  const [wasInitialScrollPerformed, setWasInitialScrollPerformed] = useState(
    false,
  );

  useEffect(
    function performInitialScroll() {
      if (wasInitialScrollPerformed || !root.current || !grid) {
        return;
      }

      const range = dateRangeToCells(
        getEarliestTimeRange({...dynamicEvents,...staticEvents}) || [
          addHours(originDate, defaultHours[0]),
          addHours(originDate, defaultHours[1]),
        ],
      );
      const rect = grid.getRectFromCell(range[0]);
      const { top, bottom } = rect;

      if (top === 0 && bottom === 0) {
        return;
      }

      // IE, Edge do not support it
      if (!('scrollBy' in root.current)) {
        return;
      }

      root.current.scrollBy(0, top);

      setWasInitialScrollPerformed(true);
    },
    [
      wasInitialScrollPerformed,
      grid,
      staticEvents,
      dynamicEvents,
      defaultHours,
      originDate,
      dateRangeToCells,
    ],
  );

  const handleBlur: React.FocusEventHandler = useCallback(
    event => {
      if (!event.target.contains(document.activeElement)) {
        setActive([null, null]);
      }
    },
    [setActive],
  );


  const handleCellClick = useCallback(
    (dayIndex: number, timeIndex: number) => (event: React.MouseEvent) => {
      if (!grid || newEventsAddedTo === "none") {
        return;
      }

      const spanY = toY(cellClickPrecision);
      const precisionedTimeIndex = timeIndex * (verticalPrecision / visualGridVerticalPrecision);
      const cell = {
        startX: dayIndex,
        startY: precisionedTimeIndex,
        endX: dayIndex,
        endY: spanY + precisionedTimeIndex,
        spanY,
        spanX: getSpan(dayIndex, dayIndex),
      };

      const dateRanges = cellInfoToDateRanges(cell);

      let events : Events = {};

      dateRanges.forEach(dateRange => { events = {...events, ...generateEvent({ range: dateRange })}});

      if (checkValidDateRange("", dateRanges[0])){
        // setPendingCreation(events);

        if (newEventsAddedTo === 'dynamic')
          onChangeDynamicEvents(mergeEvents(dynamicEvents, events));

        if (newEventsAddedTo === 'static')
          onChangeStaticEvents(mergeEvents(staticEvents, events));
      }

      event.stopPropagation();
      event.preventDefault();
    },
    [grid, newEventsAddedTo, toY, cellClickPrecision, cellInfoToDateRanges, generateEvent, checkValidDateRange, verticalPrecision, visualGridVerticalPrecision]
  );



  const baseRect = grid?.getRectFromCell({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    spanX: 1,
    spanY: 1,
  });

  return (
    <div className={styles.root} style={{ height, width}}>
      <div className={styles["scheduler-header"]}>
        <div className={styles["week-of-indicator"]}>
          Week of: {startOfWeek.format("L")} - {endOfWeek.format("L")}
        </div>
      </div>
      <div className={styles["scheduler-body"]} onBlur={handleBlur}>
        <div className={styles["scheduler-table"]} ref={root}>
          <div className={styles["layer-container"]} ref={schedulerRef}>
            
            {grid && (
              <Bounds 
                dateRangeToCells={dateRangeToCells}
                grid={grid}
                hours={hours}
                closedDaysTimes={closedDaysTimes}
                startOfWeek={startOfWeek}
              />)
            }
            {/* {isDragging && (
              <div className="drag-box" style={dragBoxStyle}>
                {hasFinishedDragging && <div className="popup" />}
              </div>
            )} */}
            {/* {grid && dynamicEvents && pendingCreation && (
              <Schedule
                events={newEventsAddedTo === 'dynamic' ? mergeEvents(dynamicEvents, pendingCreation): dynamicEvents}
                dateRangeToCells={dateRangeToCells}
                grid={grid}
                moveAxis="none"
                cellInfoToDateRange={cellInfoToSingleDateRange}
                checkValidDateRange={checkValidDateRange}
                getIsActive={getIsActive}
                eventContentComponent={eventContentComponent}
                type="dynamic"
                className="dynamic is-pending-creation"
              />
            )} */}
            {grid && dynamicEvents && (
              <Schedule
                events={dynamicEvents}
                isMovable
                dateRangeToCells={dateRangeToCells}
                grid={grid}
                moveAxis="both"
                isResizable
                isDeletable
                cellInfoToDateRange={cellInfoToSingleDateRange}
                onChange={handleEventChange}
                checkValidDateRange={checkValidDateRange}
                onActiveChange={setActive}
                onClick={onEventClick}
                getIsActive={getIsActive}
                disableDelete={disableDelete}
                eventContentComponent={eventContentComponent}
                eventRootComponent={eventRootComponent}
                type="dynamic"
                className={styles.dynamic}
              />
            )}
            {/* {grid && staticEvents && pendingCreation && (
              <Schedule
                events={newEventsAddedTo === 'static' ? mergeEvents(staticEvents, pendingCreation): staticEvents}
                dateRangeToCells={dateRangeToCells}
                grid={grid}
                moveAxis="none"
                cellInfoToDateRange={cellInfoToSingleDateRange}
                checkValidDateRange={checkValidDateRange}
                getIsActive={getIsActive}
                eventContentComponent={eventContentComponent}
                type="static"
                className="static is-pending-creation"
              />
            )} */}
            {grid && staticEvents && (
              <Schedule
                events={staticEvents}
                dateRangeToCells={dateRangeToCells}
                grid={grid}
                moveAxis="none"
                cellInfoToDateRange={cellInfoToSingleDateRange}
                checkValidDateRange={checkValidDateRange}
                onActiveChange={setActive}
                onClick={onEventClick}
                getIsActive={getIsActive}
                disableDelete={disableDelete}
                eventContentComponent={eventContentComponent}
                eventRootComponent={eventRootComponent}
                type="static"
                className={styles.static}
              />
            )}
            <div className={styles.calendar} ref={parentRef}>
              {daysOfWeek.map((dayOfWeek) => (
                <div key={dayOfWeek} className={styles["day-column"]}>
                  {times.map((timeIndex) => (
                    <Cell
                      rect={grid?.getRectFromCell({
                        startX: dayOfWeek,
                        startY: timeIndex,
                        endX: dayOfWeek + 1,
                        endY: timeIndex + 1,
                        spanX: 1,
                        spanY: 1,
                      })}
                      key={timeIndex}
                      onClick={handleCellClick(
                        dayOfWeek,
                        timeIndex *
                          (numVerticalCells / numVisualVerticalCells),
                      )}
                      timeIndex={timeIndex}
                    >
                      {/* {dayOfWeek}x{timeIndex} */}
                    </Cell>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className={`${styles.timeline} ${styles["sticky-left"]}`}>
            {times.map((timeIndex) => (
              <div
                className={styles["day-hour"]}
                style={{ height: baseRect?.height }}
                key={timeIndex}
              >
                <div className={styles["time-label"]}>
                  {moment()
                    .hours(0)
                    .minutes(timeIndex * visualGridVerticalPrecision)
                    .format("HH:mm")}
                </div>
              </div>
            ))}
          </div>

          <div className={`${styles["day-labels"]} ${styles["sticky-top"]}`}>
            <div className={styles.header}>
              <div className={styles["sticky-left"]} />

              {daysOfWeek.map((dayOfWeek) => (
                <div
                  key={dayOfWeek}
                  className={styles["day-column"]}
                  style={{ width: baseRect?.width }}
                >
                  {startOfWeek.clone().add(dayOfWeek, "d").format("ddd. DD")}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(WeekScheduler);
