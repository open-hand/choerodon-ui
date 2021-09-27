import React, { CSSProperties, FunctionComponent, ReactNode, useContext } from 'react';
import { observer } from 'mobx-react';
import omit from 'lodash/omit';
import classNames from 'classnames';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { getConfig } from 'choerodon-ui/lib/configure';
import TableContext from './TableContext';
import { ElementProps } from '../core/ViewComponent';
import { getColumnLock, isStickySupport } from './utils';
import { ColumnAlign, ColumnLock } from './enum';
import ColumnGroup from './ColumnGroup';

export interface TableFooterCellProps extends ElementProps {
  columnGroup: ColumnGroup;
  colSpan?: number;
  right: number;
}

const TableFooterCell: FunctionComponent<TableFooterCellProps> = observer(function TableFooterCell(props) {
  const { columnGroup, style, className, colSpan, right } = props;
  const { rowHeight, dataSet, prefixCls, tableStore } = useContext(TableContext);
  const { column } = columnGroup;
  const { autoFootHeight } = tableStore;
  const { footer, footerClassName, footerStyle = {}, align, name, command, lock } = column;
  const columnLock = isStickySupport() && tableStore.overflowX && getColumnLock(lock);
  const classString = classNames(`${prefixCls}-cell`, {
    [`${prefixCls}-cell-fix-${columnLock}`]: columnLock,
  }, className, footerClassName);
  const innerClassNames = [`${prefixCls}-cell-inner`];
  const innerProps: any = {};
  if (rowHeight !== 'auto' && !autoFootHeight) {
    innerProps.style = {
      height: pxToRem(rowHeight),
    };
    innerClassNames.push(`${prefixCls}-cell-inner-row-height-fixed`);
  }
  const cellStyle: CSSProperties = {
    textAlign: align || (command ? ColumnAlign.center : getConfig('tableColumnAlign')(column, dataSet.getField(name))),
    ...footerStyle,
    ...style,
  };

  if (columnLock) {
    if (columnLock === ColumnLock.left) {
      cellStyle.left = pxToRem(columnGroup.left)!;
    } else if (columnLock === ColumnLock.right) {
      cellStyle.right = pxToRem(colSpan && colSpan > 1 ? right : columnGroup.right + right)!;
    }
  }
  const getFooter = (): ReactNode => {
    switch (typeof footer) {
    case 'function': {
      return footer(dataSet, column.name);
    }
    case 'string':
      return <span>{footer}</span>;
    default:
      return footer;
    }
  };
  return (
    <th className={classString} style={omit(cellStyle, ['width', 'height'])} colSpan={colSpan}>
      <div {...innerProps} className={innerClassNames.join(' ')}>{getFooter()}</div>
    </th>
  );
});

TableFooterCell.displayName = 'TableFooterCell';

export default TableFooterCell;
