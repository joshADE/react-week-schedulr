/* eslint-disable prettier/prettier */
import compareAsc from 'date-fns/compareAsc';
import setDay from 'date-fns/setDay';
import { Events } from '../components/WeekScheduler/WeekScheduler';
import { DateRange } from '../types';

export function getEarliestTimeRange(
  events: Events,
): DateRange | undefined {
  return Object.values(events).map(ed => ed.range).sort(([startA], [startB]) =>
    compareAsc(setDay(startA, 0), setDay(startB, 0)),
  )[0];
}
