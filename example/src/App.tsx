import Tippy from '@tippyjs/react'
import moment from 'moment'
import React, { useMemo, useState } from 'react'
import 'tippy.js/dist/tippy.css';
import './App.css'

import {
  clampWrapInclusive,
  ClosedDaysTimes,
  DefaultEventRootComponent,
  EventContentProps,
  EventDetails,
  EventRootProps,
  Events,
  Hours,
  WeekScheduler
} from 'react-week-schedulr'
import 'react-week-schedulr/dist/index.css'

const EventRoot = React.forwardRef<any, EventRootProps>(function EventRoot(
  { handleDelete, disableDelete, type, ...props },
  ref
) {
  return (
    <Tippy
      arrow
      interactive
      disabled={disableDelete || type === 'static'}
      hideOnClick={false}
      className='tooltip'
      content={
        <button disabled={disableDelete} onClick={handleDelete}>
          Delete
        </button>
      }
    >
      <DefaultEventRootComponent
        handleDelete={handleDelete}
        disableDelete={disableDelete}
        type={type}
        {...props}
        ref={ref}
      />
    </Tippy>
  )
})

const renderContent = ({ details, dateRange, type }: EventContentProps) => {
  return (
    <div className='event-content' style={{ textAlign: 'center' }}>
      {' '}
      {/* give className of event-content for padding */}
      {type === 'static' ? (
        <>Can't view details</>
      ) : (
        <>
          {details.title ? details.title : 'No Title'}
          <div>
            {moment(dateRange[0]).format('lll')} -{' '}
            {moment(dateRange[1]).format('lll')}
          </div>
        </>
      )}
    </div>
  )
}

const generateEvent = (eventDetails: EventDetails): Events => {
  const id = String(Math.random())
  return { [id]: { ...eventDetails, title: 'newEvent ' + id } }
}

const initialDynamicEvents: Events = {
  '1': { range: [new Date(2021, 8, 22, 12), new Date(2021, 8, 22, 13)] },
  '2': {
    range: [new Date(2021, 8, 23, 14), new Date(2021, 8, 24, 15)],
    title: 'work time'
  }
}

const initialStaticEvents: Events = {
  '3': {
    range: [new Date(2021, 8, 23, 3), new Date(2021, 8, 23, 5)],
    title: 'break time static'
  },
  '4': {
    range: [new Date(2021, 8, 23, 6), new Date(2021, 8, 23, 8)],
    title: 'work time static'
  }
}

const hours: Hours = {
  2: [new Date(2021, 7, 23, 3), new Date(2021, 7, 23, 16)]
}

const closedDaysTimes: ClosedDaysTimes = [
  [new Date(2021, 8, 20, 3), new Date(2021, 8, 20, 16)]
]

const weeks = [0, 1, 2, 3, 4]
const originDate = new Date(2021, 8, 23)

const App = () => {
  const [currentYear, setCurrentYear] = useState(originDate.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(originDate.getMonth())
  const [currentWeek, setCurrentWeek] = useState(
    Math.ceil(
      (originDate.getDate() + new Date(currentYear, currentMonth, 1).getDay()) /
        7
    ) - 1
  )

  const [events, setEvents] = useState(initialDynamicEvents)
  const [staticEvents, setStaticEvents] = useState<Events>(initialStaticEvents)

  const addMonth = (amount: 1 | -1) => {
    if (currentMonth === 11 && amount === 1)
      setCurrentYear((current) => current + 1)
    if (currentMonth === 0 && amount === -1)
      setCurrentYear((current) => current - 1)
    setCurrentMonth((current) => clampWrapInclusive(current + amount, 0, 11))
    setCurrentWeek(0)
  }

  const originDay = useMemo(() => {
    const startDayOfMonth = moment(new Date(currentYear, currentMonth, 1))
    return startDayOfMonth.add(currentWeek, 'w').toDate()
  }, [currentYear, currentMonth, currentWeek])
  return (
    <div className='App'>
      <div className='scheduler-year'>
        <button className='month-button' onClick={() => addMonth(-1)}>
          {' '}
          {'<'}{' '}
        </button>
        <span>
          {moment(new Date(currentYear, currentMonth)).format("MMM' YYYY")}
        </span>
        <button className='month-button' onClick={() => addMonth(1)}>
          {' '}
          {'>'}{' '}
        </button>
      </div>
      <div className='week-navigator'>
        {weeks.map((element, index) => (
          <button
            key={element}
            onClick={() => setCurrentWeek(index)}
            className={`week-indicator ${
              currentWeek === index ? 'current' : ''
            }`}
          />
        ))}
      </div>
      <WeekScheduler
        // cellWidth={150}
        // width="100%"
        cellHeight={100}
        height='710px'
        dynamicEvents={events}
        onChangeDynamicEvents={setEvents}
        staticEvents={staticEvents}
        onChangeStaticEvents={setStaticEvents}
        newEventsAddedTo='dynamic'
        generateEvent={generateEvent}
        cellClickPrecision={120}
        hours={hours}
        closedDaysTimes={closedDaysTimes}
        eventsOverlap
        eventRootComponent={EventRoot}
        eventContentComponent={renderContent}
        maxVerticalPrecision={360}
        verticalPrecision={5}
        visualGridVerticalPrecision={120}
        originDate={originDay}
      />
    </div>
  )
}

export default App
