# react-week-schedulr

> A weekly calendar component for React with scheduling capabilities. Based on @remotelock/react-week-scheduler with a few modifications.

[![NPM](https://img.shields.io/npm/v/react-week-schedulr.svg)](https://www.npmjs.com/package/react-week-schedulr) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-week-schedulr
```

## Usage

```tsx
import React, { useState } from 'react'

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

const originDate = new Date(2021, 8, 23)

const Example = () => {
  const [events, setEvents] = useState(initialDynamicEvents) // events that can be moved/deleted
  const [staticEvents, setStaticEvents] = useState<Events>(initialStaticEvents) // events that can't be move/deleted
  
    return <WeekScheduler
        // cellWidth={150}
        // width="100%"
        cellHeight={100}
        height='710px'
        dynamicEvents={events}
        onChangeDynamicEvents={setEvents}
        staticEvents={staticEvents}
        onChangeStaticEvents={setStaticEvents}
        newEventsAddedTo='dynamic'
        generateEvent={generateEvent} // generates the id for a new event
        cellClickPrecision={60}
        hours={hours}
        closedDaysTimes={closedDaysTimes}
        eventsOverlap
        maxVerticalPrecision={360}  // max time in minutes an event can span
        verticalPrecision={30} // min time in minutes an event can span
        visualGridVerticalPrecision={120} // grid incriments in minutes
        showVerticalPrecisionMarkers // show markers
        originDate={originDate}
      />

      // see example folder for a more detailed example with deleting events using the tippy library
  
}
```

## License

MIT © [joshADE](https://github.com/joshADE)
