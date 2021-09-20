/* eslint-disable prettier/prettier */
import compareAsc from "date-fns/compareAsc";
import moment from "moment";
import { DateRange, MapCellInfoToDateRange } from "../types";
import { cellToDate } from "./cellToDate";
import { range } from "./utility";

export type RecurringTimeRange = DateRange[];

export const createMapCellInfoToRecurringTimeRange: MapCellInfoToDateRange = ({
  fromY: toMin,
  fromX: toDay,
  originDate,
}) => ({ startX, startY, endX, spanY }) => {
  const result = range(startX, endX + 1)
    .map(i => {
      const startDate = cellToDate({
        startX: i,
        startY,
        toMin,
        toDay,
        originDate,
      });
      const endDate = moment.min(
        moment(startDate).add(toMin(spanY), 'minutes'),
        moment(startDate).endOf('day'),
      );

      const range: DateRange = moment(startDate).isBefore(endDate)
        ? [startDate.toDate(), endDate.toDate()]
        : [endDate.toDate(), startDate.toDate()];

      return range;
    })
    .sort((range1, range2) =>  compareAsc(range1[0], range2[0]));

  return result;
};