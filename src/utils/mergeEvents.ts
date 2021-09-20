/* eslint-disable prettier/prettier */
import { Events } from '../components/WeekScheduler/WeekScheduler';

export function mergeEvents(
  event1: Events | undefined,
  event2: Events | null,
): Events {

  if (!event1) {
    return {};
  }

  if (event2 === null) {
    return event1;
  }

  return {...event1, ...event2 };
}