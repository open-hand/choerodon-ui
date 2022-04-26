import React, { CSSProperties, FunctionComponent, ReactNode, useCallback, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { ColumnProps, defaultAggregationRenderer } from './Column';
import TableContext from './TableContext';
import { Group } from '../data-set/DataSet';
import ExpandIcon from './ExpandIcon';

export interface TableGroupCellInnerProps {
  column: ColumnProps;
  group: Group;
  rowSpan?: number;
  children?: ReactNode;
  isFixedRowHeight?: boolean;
}

const TableGroupCellInner: FunctionComponent<TableGroupCellInnerProps> = function TableGroupCellInner(props) {
  const { dataSet, rowHeight, indentSize, tableStore, prefixCls } = useContext(TableContext);
  const { column, group, children: aggregationList, rowSpan, isFixedRowHeight } = props;
  const { children } = group;
  const { renderer = defaultAggregationRenderer, __tableGroup } = column;
  const handleExpandChange = useCallback(() => {
    tableStore.setGroupExpanded(group, !tableStore.isGroupExpanded(group));
  }, [tableStore, group]);
  const record = group.totalRecords[0];
  const text = renderer({ text: aggregationList || group.value, rowGroup: group, dataSet, record });
  const hasExpandIcon = Boolean(__tableGroup && __tableGroup.parentField);
  const renderExpandIcon = () => {
    if (hasExpandIcon) {
      const expandable = !!children;
      const { expandIcon } = tableStore;
      const isExpanded = tableStore.isGroupExpanded(group);
      if (typeof expandIcon === 'function') {
        return expandIcon({
          prefixCls,
          expanded: isExpanded,
          expandable,
          needIndentSpaced: false,
          record,
          onExpand: handleExpandChange,
        });
      }
      return (
        <ExpandIcon
          prefixCls={prefixCls}
          expandable={expandable}
          onChange={handleExpandChange}
          expanded={isExpanded}
        />
      );
    }
  };
  const renderIndent = () => {
    if (hasExpandIcon) {
      return <span key="indent" style={{ paddingLeft: pxToRem(indentSize * group.level) }} />;
    }
  };
  const cellProps: { style?: CSSProperties, className: string } = {
    className: classNames(`${prefixCls}-cell-inner`, { [`${prefixCls}-cell-inner-row-height-fixed`]: rowHeight !== 'auto' }),
  };
  if (rowSpan === undefined && isFixedRowHeight && rowHeight !== 'auto') {
    cellProps.style = {
      height: pxToRem(rowHeight)!,
      lineHeight: pxToRem(rowHeight - 2)!,
    };
  }
  return (
    <span {...cellProps}>
      {renderIndent()}
      {renderExpandIcon()}
      {text}
    </span>
  );
};

TableGroupCellInner.displayName = 'TableGroupCellInner';

export default observer(TableGroupCellInner);
