/* eslint-disable prettier/prettier */
import React from "react";
import { Rect } from "../../types";
import styles from '../WeekScheduler/WeekScheduler.module.css'

interface CellProps {
  rect?: Rect;
  onClick?: React.MouseEventHandler;
  timeIndex: number;
  
}

export const Cell: React.FC<CellProps> = ({
  rect,
  onClick,
  children,
}) => {
  return (
    <div
      style={{
        top: rect?.top,
        left: rect?.left,
        width: rect?.width,
        height: rect?.height,
      }}
      className={styles.cell}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
