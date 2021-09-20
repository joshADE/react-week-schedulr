/* eslint-disable prettier/prettier */
import { EventDetails } from "./components/WeekScheduler/WeekScheduler";

export type OnChangeCallback = (
    newEventDetails: EventDetails | undefined,
    id: string,
) => void;

export type DateRange = [Date, Date];

export type EventType = 'dynamic' | 'static';

export type EventRootProps = {
    className?: string;
    style?: React.CSSProperties;
    rangeIndex: number;
    id: string;
    cellIndex: number;
    isActive: boolean;
    disableDelete?: boolean;
    handleDelete(): void;
    type: EventType;
  };

export type CellInfo = {
    spanX: number;
    spanY: number;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
};

export type Rect = {
    startX: number;
    endX: number;
    startY: number;
    endY: number;
    bottom: number;
    top: number;
    left: number;
    right: number;
    height: number;
    width: number;
};

export type Grid = {
    cellHeight: number;
    cellWidth: number;
    totalWidth: number;
    totalHeight: number;
    numVerticalCells: number;
    numHorizontalCells: number;
    maxRectHeight: number;
    getRectFromCell(cell: CellInfo): Rect;
    getCellFromRect(rect: Rect, dragging?: boolean): CellInfo;
};

export type MapCellInfoToDateRange = (
    options: MapCellInfoToDateRangeOptions,
) => (cellInfo: CellInfo) => DateRange[];
  
export type MapCellInfoToDateRangeOptions = {
    fromY: (y: number) => number;
    fromX: (x: number) => number;
    originDate: Date;
};