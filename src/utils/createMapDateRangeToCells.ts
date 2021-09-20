/* eslint-disable prettier/prettier */
import moment from 'moment';
import { CellInfo, DateRange } from '../types';
import { getSpan } from './getSpan';
import { differenceInDays, differenceInMinutes, range } from './utility';

export const createMapDateRangeToCells = ({
  toX = (x: number) => x,
  toY,
  numVerticalCells,
  originDate,
}: {
  toX: (day: number) => number;
  toY: (min: number) => number;
  numHorizontalCells: number;
  numVerticalCells: number;
  originDate: Date;
}) => ([start, end]: DateRange): CellInfo[] => {
  const originOfThisDay = moment(start).startOf('day');
  // origin date will always be the start of the week

  // difference in days will always compare the start of the days at 12:00am
  const _startX = toX(differenceInDays(start, originDate));
  const _startY = toY(differenceInMinutes(start, originOfThisDay.toDate()));
  const _endX = toX(differenceInDays(end, originDate));
  const _endY = toY(differenceInMinutes(end, moment(end).startOf('day').toDate())) - 1;

  let cells = range(_startX, _endX + 1).map(i => {
    const startX = i;
    const endX = i;
    const atStart = i === _startX;
    const atEnd = i === _endX;
    const startY = !atStart ? 0 : _startY;
    const endY = !atEnd ? numVerticalCells - 1 : _endY;
    const spanX = getSpan(startX, endX);
    const spanY = getSpan(startY, endY);

    return {
      startX,
      startY,
      endX,
      endY,
      spanX,
      spanY,
    };
  });

  if (moment(end).isSame(moment(end).startOf('day'))) {
    cells.pop();
  }


  // filter the cells that are between the 0 days from the originDate (start of week) and 6 days
  cells = cells.filter(({ startX, endX }) => (startX >= 0 && startX <= 6) && (endX >= 0 && endX <= 6));

  return cells;
};
