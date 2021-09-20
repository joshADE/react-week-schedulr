// import * as React from 'react'
// import styles from './styles.module.css'

// interface Props {
//   text: string
// }

// export const ExampleComponent = ({ text }: Props) => {
//   return <div className={styles.test}>Example Component: {text}</div>
// }

export { EventContentProps } from './components/EventContent/EventContent'

export { DefaultEventRootComponent } from './components/EventRootComponent/DefaultEventRootComponent'

export {
  default as WeekScheduler,
  Hours,
  ClosedDaysTimes,
  EventDetails,
  Events
} from './components/WeekScheduler/WeekScheduler'

export { DateRange, CellInfo, EventRootProps, EventType, Rect } from './types'

export { clamp, clampWrapInclusive } from './utils/utility'
