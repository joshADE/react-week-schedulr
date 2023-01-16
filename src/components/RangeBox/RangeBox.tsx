/* eslint-disable prettier/prettier */
import React, { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react'
import { CellInfo, Grid } from '../../types';
import { SharedScheduleProps } from '../Schedule/Schedule';
import { EventDetails } from '../WeekScheduler/WeekScheduler';
import { Resizable, ResizeCallback } from 're-resizable';
import Draggable, { DraggableEventHandler } from 'react-draggable';
import invariant from 'invariant';
import { DefaultEventRootComponent } from '../EventRootComponent/DefaultEventRootComponent';
import { EventContent, EventContentProps } from '../EventContent/EventContent';
import { clamp } from '../../utils/utility';
import styles from '../WeekScheduler/WeekScheduler.module.css'


interface RangeBoxProps {
    cell: CellInfo;
    grid: Grid;
    id: string;
    details: EventDetails;
    cellIndex: number;
    rangeIndex: number;
    cellArray: CellInfo[];
}
// memo at bottom of file
const RangeBox: React.FC<RangeBoxProps & SharedScheduleProps> = ({
    cell,
    grid,
    id,
    cellIndex,
    rangeIndex,
    details,
    moveAxis,
    cellInfoToDateRange,
    onChange,
    checkValidDateRange,
    cellArray,
    isResizable,
    isMovable,
    onActiveChange,
    onClick,
    getIsActive,
    disableDelete,
    type,
    className,
    eventRootComponent: EventRootComponent = DefaultEventRootComponent,
    eventContentComponent,
}) => {
    const ref = useRef(null);
    const [modifiedCell, setModifiedCell] = useState(cell);
    const [tempCell, setTempCell] = useState(modifiedCell);
    const [isModifying, setModifying] = useState(false);
    const originalRect = useMemo(() => grid.getRectFromCell(cell), [cell, grid]);
    const rect = useMemo(() => grid.getRectFromCell(modifiedCell), [
      modifiedCell,
      grid,
    ]);

   
    useEffect(() => {
      setModifiedCell(cell);
    }, [cell]);
  
    const modifiedDateRange = useMemo(() => cellInfoToDateRange(modifiedCell), [
      cellInfoToDateRange,
      modifiedCell,
    ]);

    const isActive = useMemo(() => getIsActive({ cellIndex, rangeId: id }), [
      cellIndex,
      id,
      getIsActive,
    ]);


      const handleStop = useCallback(() => {
        setModifying(false);
        if (!onChange) {
          return;
        }
        
          
  
          if (checkValidDateRange(id, cellInfoToDateRange(modifiedCell))){
            
            
            onChange({...details, range: cellInfoToDateRange(modifiedCell)}, id);
          }else{
            setModifiedCell(tempCell);
          }
  
        }, [tempCell, modifiedCell, setModifiedCell, id, details, cellInfoToDateRange, onChange, checkValidDateRange, setModifying]);
  
        const handleStart = useCallback(() => {
          
          
          setModifying(true);
          setTempCell(modifiedCell);
          
    
          }, [modifiedCell, setTempCell, setModifying]);
    

    const handleDrag: DraggableEventHandler = useCallback(
        (event, { y, x }) => {
          if (moveAxis === 'none') {
            return;
          }
    
          event.preventDefault();
          event.stopPropagation();
    
          const newRect = {
            ...rect,
          };
    
          if (moveAxis === 'both' || moveAxis === 'y') {
            const startOrEnd1 = y;
            const startOrEnd2 = startOrEnd1 + rect.height;
            const newTop = Math.min(startOrEnd1, startOrEnd2);
            const newBottom = newTop + rect.height;
            newRect.bottom = newBottom;
            newRect.top = newTop;
          }
    
          if (moveAxis === 'both' || moveAxis === 'x') {
            const startOrEnd1 = x;
            const startOrEnd2 = startOrEnd1 + rect.width;
            const newLeft = Math.min(startOrEnd1, startOrEnd2);
            const newRight = newLeft + rect.width;
            newRect.right = newRight;
            newRect.left = newLeft;
          }
    
          const { startY, startX } = grid.getCellFromRect(newRect);
    
          const newCell = {
            ...cell,
            startX: moveAxis === 'y' ? cell.startX : startX,
            endX: moveAxis === 'x' || moveAxis === 'both' ? startX + cell.spanX - 1 : cell.endX,
            startY: moveAxis === 'x' ? cell.startY : startY,
            endY: moveAxis === 'y' || moveAxis === 'both' ? startY + cell.spanY - 1 : cell.endY,
          };
    
          invariant(
            newCell.spanY === cell.spanY && newCell.spanX === cell.spanX,
            `Expected the dragged time cell to have the same dimensions`,
          );
    
          setModifiedCell(newCell);
          setModifying(true);
        },
        [grid, rect, moveAxis, cell, setModifiedCell, setModifying],
      );



      const handleResize: ResizeCallback = useCallback(
        (event, direction, _ref, delta) => {
          if (!isResizable) {
            return;
          }
    
          event.preventDefault();
          event.stopPropagation();
    
          if (delta.height === 0) {
            return;
          }

          const maxHeight = grid.maxRectHeight;
          const cellHeight = grid.cellHeight;
          const cellPrecisionHeight = grid.totalHeight / grid.numVerticalCells; // grid.minRectHeight;// grid.totalHeight / grid.numVerticalCells;
    
          // const scaleHeight = Math.max(0, Math.floor(grid.ratioVerticalToVisualVertical / 2)) * cellHeight;

          const newSize = {
            height: delta.height + rect.height,
            width: delta.width + rect.width,
          };
    
          const newRect = {
            ...originalRect,
            ...newSize,
          };

          let ratioStartOffset = 0;
          let ratioEndOffset = 0;
    
          if (direction.includes('top')) {
            // newRect.top -= delta.height;
            // this clamp is a temporary fix to solve a problem where if you 
            // rezise the top at max height it also moves the whole cell up instead
            // not needed for bottom position
            newRect.top = clamp(newRect.top - delta.height,newRect.bottom - maxHeight + cellHeight,newRect.bottom - cellPrecisionHeight + cellHeight);
          } else if (direction.includes('bottom')) {
            newRect.bottom += delta.height;
          }
          

          // account for the snapping behaviour when resizing that snaps to the nearest vertical precision mark
          // and skip the min height when the verticalPrecision > visualGrigVericalPrecision
          if (grid.ratioVerticalToVisualVertical > 1){
              const newStartY = Math.round(newRect.top / cellPrecisionHeight) * grid.ratioVerticalToVisualVertical;
              const newVisualStartY = Math.round(newRect.top / grid.cellHeight);
              if (newStartY - newVisualStartY !== 0){
                ratioStartOffset = newVisualStartY - newStartY;
                if (newRect.top <= 0){
                  ratioStartOffset = Math.max(0, ratioStartOffset);
                }
              } 
              const newEndY = Math.round(newRect.bottom / cellPrecisionHeight) * grid.ratioVerticalToVisualVertical;
              const newVisualEndY = Math.round(newRect.bottom / grid.cellHeight);
              if (newEndY - newVisualEndY !== 0){
                ratioEndOffset = newVisualEndY - newEndY;
                if (newRect.bottom >= grid.totalHeight - cellHeight){
                  ratioEndOffset = Math.min(0, ratioEndOffset);
                }
              } 
          }

    
          const { spanY, startY, endY } = grid.getCellFromRect(newRect, false, { startY: ratioStartOffset, endY: ratioEndOffset});
          const newCell = {
            ...cell,
            spanY,
            startY,
            endY,
          };
    
          
          setModifiedCell(newCell);
          
        },
        [grid, rect, setModifiedCell, isResizable, cell, originalRect],
      );

      const handleDelete = useCallback(() => {
        if (!onChange || disableDelete) {
          return;
        }
    
        onChange(undefined, id);
      }, [onChange, disableDelete, id]);

      const handleOnFocus = useCallback(() => {
        if (!onActiveChange) {
          return;
        }
    
        onActiveChange([id, cellIndex]);
      }, [onActiveChange, id, cellIndex]);
    
      const handleOnClick = useCallback(() => {
        if (!onClick || !isActive) {
          return;
        }
    
        onClick([id, cellIndex]);
      }, [onClick, id, isActive, cellIndex]);
      
  
    
    const { top, left, width, height } = rect;
    const eventContentProps: EventContentProps = { 
      width, 
      height, 
      dateRange: modifiedDateRange, 
      isStart: cellIndex === 0, 
      isEnd: cellIndex === cellArray.length - 1,
      id,
      cellIndex,
      details,
      type
    };
    const {top: originalTop, left: originalLeft, width: originalWidth, height: originalHeight} = originalRect;
        return (<div>
            <Draggable
                axis={moveAxis}
                bounds={{
                    top: 0,
                    bottom: grid.totalHeight - height,
                    left: 0,
                    right: grid.totalWidth - width,
                }}
                position={{ x: left, y: top }}
                onStart={handleStart}
                onDrag={handleDrag}
                onStop={handleStop}
                handle={`.${styles["handle-drag"]}`}
                // cancel=".handle, .handle.bottom, .handle.top"
            >
                  <EventRootComponent
                    tabIndex="0"
                    role="button" 
                    disableDelete={disableDelete}
                    onFocus={handleOnFocus}
                    onClick={handleOnClick}
                    handleDelete={handleDelete}
                    cellIndex={cellIndex}
                    rangeIndex={rangeIndex}
                    id={id}
                    isActive={isActive}
                    ref={ref}
                    className={`${styles["range-box"]} ${styles.event} ${isModifying? styles.modifying: ''} ${isActive? styles.active: ''} ${className}`} 
                    style={{ width, height}}
                    type={type}
                  >
                  {isMovable && <div className={styles["handle-drag"]} />}
                <Resizable
                  size={{width, height}}
                  key={`${rangeIndex}.${cellIndex}.${cellArray.length}.${originalRect.top}.${originalRect.left}`}
                  onResizeStart={handleStart}
                  onResize={handleResize}
                  onResizeStop={handleStop}
                  handleWrapperClass={styles["handle-wrapper"]}
                  enable={isResizable? { top: true, bottom: true}: {}}
                  handleClasses={{
                    bottom: `${styles.handle} ${styles.bottom}`,
                    bottomLeft: styles.handle,
                    bottomRight: styles.handle,
                    left: styles.handle,
                    right: styles.handle,
                    top: `${styles.handle} ${styles.top}`,
                    topLeft: styles.handle,
                    topRight: styles.handle
                  }}
                > 
                  {eventContentComponent ? 
                  eventContentComponent(eventContentProps) : 
                  <EventContent
                    {...eventContentProps}
                  />
                  }
                    </Resizable>
                </EventRootComponent>
            </Draggable>
            {isModifying && <div className={styles["original-range-box"]} style={{ top: originalTop, left: originalLeft, width: originalWidth, height: originalHeight}} />}
            </div>);
}

export default memo(RangeBox)