import * as React from 'react';
import isPlainObject from 'lodash/isPlainObject';

function getTotalByColumns(columns, state) {
  let totalFlexGrow = 0;
  let totalWidth = 0;
  
  const count = items => {
    Array.from(items).forEach((column: any, index: number) => {
      const { dataIndex } = column.props;
      // @ts-ignore
      if (React.isValidElement(column)) {
        // @ts-ignore
        const { flexGrow, width = 0 } = column.props;
        totalFlexGrow += flexGrow || 0;
        totalWidth += flexGrow ? 0 : state[`${dataIndex}_${index}_width`] || width;
      } else if (Array.isArray(column)) {
        count(column);
      }
    });
  };

  if (Array.isArray(columns)) {
    count(columns);
  } else if (isPlainObject(columns)) {
    const { flexGrow, width = 0 } = columns.props;

    totalFlexGrow = flexGrow || 0;
    totalWidth = flexGrow ? 0 : width;
  }

  return {
    totalFlexGrow,
    totalWidth,
  };
}

export default getTotalByColumns;
