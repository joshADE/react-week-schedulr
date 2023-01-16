/* eslint-disable prettier/prettier */
import { CellInfo, Grid, Rect } from "../types";
import { getSpan } from "./getSpan";
import { clamp } from "./utility";


export const createGrid = ({
    totalHeight,
    totalWidth,
    numVerticalCells,
    numHorizontalCells,
    numVisualVerticalCells,
    maxRangeHeightSpan,
    minRangeHeightSpan,
  }: {
    totalHeight: number;
    totalWidth: number;
    numVerticalCells: number;
    numHorizontalCells: number;
    numVisualVerticalCells: number;
    maxRangeHeightSpan: number;
    minRangeHeightSpan: number;
  }): Grid => {
    const cellHeight = totalHeight / numVisualVerticalCells;
    const cellWidth = totalWidth / numHorizontalCells;
    const cellPrecisionHeight = totalHeight / numVerticalCells;
    const ratioVerticalToVisualVertical = numVisualVerticalCells / numVerticalCells;
    return {
      totalHeight,
      totalWidth,
      numVerticalCells,
      numHorizontalCells,
      cellWidth,
      cellHeight,
      maxRectHeight: cellHeight * maxRangeHeightSpan,
      minRectHeight: cellHeight * minRangeHeightSpan,
      ratioVerticalToVisualVertical,
      getRectFromCell(data: CellInfo) {
        const { endX, startX, endY, startY, spanX, spanY } = data;
        const bottom = endY * this.cellHeight;
        const top = startY * this.cellHeight;
        const left = startX * this.cellWidth;
        const right = endX * this.cellWidth;
        const height = spanY * this.cellHeight;
        const width = spanX * this.cellWidth;
  
        return {
          bottom,
          top,
          left,
          right,
          height,
          width,
  
          // @TODO: check the math
          startX: startX * this.cellWidth,
          endX: endX * this.cellWidth,
          startY: startY * this.cellHeight,
          endY: endY * this.cellHeight,
        };
      },
  
      getCellFromRect(data: Rect, dragging = false, ratioOffset = {}) {

        // offset to allow setting the postion on resizes to points where the visual grid vertical precision allows
        // but not the vertical precision (for the case where vertical precision > visual grid vertical precision)
        const startYOffset = ratioOffset.startY === undefined ? 0 : ratioOffset.startY;
        const endYOffset = ratioOffset.endY === undefined ? 0 : ratioOffset.endY;
        let startX, startY, endX, endY;

        if (dragging){
          startX = clamp(
            Math.floor(data.left / this.cellWidth),
            0,
            numHorizontalCells - 1,
          );
          startY = 
            Math.floor(data.top / cellPrecisionHeight) 
            * (numVisualVerticalCells / numVerticalCells);
          endX = clamp(
            Math.floor(data.right / this.cellWidth),
            0,
            numHorizontalCells - 1,
          );
          endY = 
            Math.floor((data.bottom - cellHeight) / cellPrecisionHeight)
            * (numVisualVerticalCells / numVerticalCells);
        }else{
          startX = clamp(
            Math.round(data.left / this.cellWidth),
            0,
            numHorizontalCells - 1,
          );
          startY = 
          Math.round(data.top / cellPrecisionHeight)
          * (numVisualVerticalCells / numVerticalCells) + startYOffset;
          endX = clamp(
            Math.round(data.right / this.cellWidth),
            0,
            numHorizontalCells - 1,
          );
          endY = 
            Math.round(data.bottom / cellPrecisionHeight)
            * (numVisualVerticalCells / numVerticalCells) + endYOffset;
        }
        const spanX = clamp(getSpan(startX, endX), 1, numHorizontalCells);
        const spanY = clamp(getSpan(startY, endY), minRangeHeightSpan, maxRangeHeightSpan);

        return {
          spanX,
          spanY,
          startX,
          startY,
          endX,
          endY,
        };
      },
    };
  };