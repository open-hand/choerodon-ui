import React, { ReactNode } from "react";
import Record from '../data-set/Record';

export interface CustomAreaProps {
  targetOption?: Record[];
  children: ReactNode
}

function CustomArea({ children }: CustomAreaProps) {
  return (
    <div>
      {children}
    </div>
  )
}

function areEqual(prevProps, nextProps) {
  if (prevProps.targetOption || nextProps.targetOption) {
    if (prevProps.targetOption.length !== nextProps.targetOption.length) {
      return false
    }
    const newTarget = nextProps.targetOption.map(record => record.id);
    const preTarget = prevProps.targetOption.map(record => record.id);

    return newTarget.every((v, i) => v === preTarget[i])
  }
  return true;
}

export default React.memo(CustomArea, areEqual)