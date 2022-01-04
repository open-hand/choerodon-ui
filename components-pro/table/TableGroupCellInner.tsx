import React, { FunctionComponent, ReactNode, useCallback, useContext } from 'react';
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
  children?: ReactNode;
}

const TableGroupCellInner: FunctionComponent<TableGroupCellInnerProps> = function TableGroupCellInner(props) {
  const { dataSet, rowHeight, indentSize, tableStore, prefixCls } = useContext(TableContext);
  const { column, group, children: aggregationList } = props;
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
  return (
    <span className={classNames(`${prefixCls}-cell-inner`, { [`${prefixCls}-cell-inner-row-height-fixed`]: rowHeight !== 'auto' })}>
      {renderIndent()}
      {renderExpandIcon()}
      {text}
    </span>
  );
};

TableGroupCellInner.displayName = 'TableGroupCellInner';

export default observer(TableGroupCellInner);
