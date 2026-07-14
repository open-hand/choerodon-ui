import * as React from 'react';
import isNil from 'lodash/isNil';
import isPlainObject from 'lodash/isPlainObject';
import { ColumnProps } from '../Column';

interface ColumnCustomizedConfig {
  width?: number;
}

type CustomizedColumns = Record<string, ColumnCustomizedConfig> | undefined;

type ColumnWidthState = Record<string, number | undefined>;

interface ColumnWidthInfo {
  flexGrow: number;
  width: number;
}

interface TotalColumnWidthInfo {
  totalFlexGrow: number;
  totalWidth: number;
}

function getColumnWidthInfo(
  column: React.ReactElement<ColumnProps>,
  state: ColumnWidthState,
  index: number,
  customizedColumns?: CustomizedColumns,
): ColumnWidthInfo {
  const { dataIndex, flexGrow, width = 0 } = column.props;
  const columnKey = column.key || dataIndex;
  const customizedWidth = columnKey && customizedColumns
    ? customizedColumns[columnKey]?.width
    : undefined;
  const resizedWidth = state[`${dataIndex}_${index}_width`];
  const hasManualWidth = !isNil(resizedWidth) || !isNil(customizedWidth);
  const nextWidth = !isNil(resizedWidth) ? resizedWidth : width;
  const useFlexGrow = !!flexGrow && !hasManualWidth;

  return {
    flexGrow: useFlexGrow ? flexGrow : 0,
    width: useFlexGrow ? 0 : nextWidth,
  };
}

function getTotalByColumns(
  columns: React.ReactNodeArray | React.ReactElement<ColumnProps>,
  state: ColumnWidthState,
  customizedColumns?: CustomizedColumns,
): TotalColumnWidthInfo {
  let totalFlexGrow = 0;
  let totalWidth = 0;
  
  const count = (items: React.ReactNodeArray) => {
    Array.from(items).forEach((column, index: number) => {
      if (React.isValidElement<ColumnProps>(column)) {
        const { flexGrow, width } = getColumnWidthInfo(column, state, index, customizedColumns);
        totalFlexGrow += flexGrow;
        totalWidth += width;
      } else if (Array.isArray(column)) {
        count(column);
      }
    });
  };

  if (Array.isArray(columns)) {
    count(columns);
  } else if (isPlainObject(columns)) {
    const { flexGrow = 0, width = 0 } = columns.props;

    totalFlexGrow = flexGrow;
    totalWidth = width;
  }

  return {
    totalFlexGrow,
    totalWidth,
  };
}

export default getTotalByColumns;
