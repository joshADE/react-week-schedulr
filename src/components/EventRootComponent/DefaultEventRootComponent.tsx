/* eslint-disable prettier/prettier */
import React from 'react';
import { EventRootProps } from '../../types';


export const DefaultEventRootComponent =  React.memo(
    React.forwardRef<any, EventRootProps>(function DefaultEventRootComponent(
    {
      isActive,
      handleDelete,
      id,
      cellIndex,
      rangeIndex,
      disableDelete,
      type,
      ...props
    },
    ref,
  ) {

    return <div ref={ref} {...props} />;
  }),
);


