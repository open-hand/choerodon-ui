import React, { FunctionComponent, useContext, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { get } from 'mobx';
import isEqual from 'lodash/isEqual';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { ElementProps } from '../core/ViewComponent';
import TableContext from './TableContext';
import { ColumnProps, columnWidth, minColumnWidth } from './Column';

export interface TableColProps extends ElementProps {
  column: ColumnProps;
  last: boolean;
}

const TableCol: FunctionComponent<TableColProps> = function TableCol(props) {
  const { column, last } = props;
  const { tableStore, prefixCls } = useContext(TableContext);
  const { getLastEmptyWidthColumn: lastEmptyWidthColumn } = tableStore;
  let width = last && !tableStore.hasEmptyWidthColumn ? undefined : tableStore.overflowX ? columnWidth(column, tableStore) : get(column, 'width');
  const innerClassName: string[] = [];
  if (tableStore.isBuiltInColumn(column)) {
    innerClassName.push(get(column, 'headerClassName'));
  }
  if (tableStore.tableColumnResizeTransition) {
    innerClassName.push(`${prefixCls}-col`);
  }
  const minWidth = minColumnWidth(column, tableStore);
  if (lastEmptyWidthColumn && isEqual(column, lastEmptyWidthColumn)) {
    width = undefined;
  } else {
    width = pxToRem(width, true);
  }
  const style = useMemo(() => ({
    width,
    minWidth: pxToRem(minWidth, true),
  }), [width, minWidth]);
  return (
    <col
      className={innerClassName.join(' ')}
      style={style}
    />
  );
};

TableCol.displayName = 'TableCol';

export default observer(TableCol);
