import React, { FunctionComponent, useCallback, useContext } from 'react';
import { action } from 'mobx';
import { ClickParam } from 'choerodon-ui/lib/menu';
import Record from '../data-set/Record';
import TableContext from './TableContext';
import Dropdown from '../dropdown/Dropdown';
import Menu from '../menu';
import { $l } from '../locale-context';
import ColumnGroup from './ColumnGroup';

export interface AggregationButtonProps {
  expanded: boolean;
  record: Record;
  columnGroup: ColumnGroup;
}

const AggregationButton: FunctionComponent<AggregationButtonProps> = (props) => {
  const { expanded, record, columnGroup } = props;
  const { tableStore, prefixCls } = useContext(TableContext);
  const handleMenuClick = useCallback(action(({ key }: Partial<ClickParam>) => {
    switch (key) {
      case 'cell':
        tableStore.setAggregationCellExpanded(record, columnGroup.key, !expanded);
        break;
      case 'row':
        tableStore.columnGroups.allLeafs.forEach(({ column: col, key: columnKey }) => col.aggregation && tableStore.setAggregationCellExpanded(record, columnKey, !expanded));
        break;
      case 'column': {
        const { dataSet } = record;
        if (dataSet) {
          dataSet.forEach(r => tableStore.setAggregationCellExpanded(r, columnGroup.key, !expanded));
        }
        break;
      }
      default:
    }
  }), [tableStore, record, columnGroup, expanded]);
  const handleClick = useCallback(() => {
    handleMenuClick({ key: tableStore.aggregationExpandType });
  }, [handleMenuClick, tableStore]);
  const getOverlay = useCallback(() => (
    <Menu prefixCls={`${prefixCls}-dropdown-menu`} onClick={handleMenuClick}>
      <Menu.Item key="cell">{$l('Table', expanded ? 'collapse_cell' : 'expand_cell')}</Menu.Item>
      <Menu.Item key="row">{$l('Table', expanded ? 'collapse_row' : 'expand_row')}</Menu.Item>
      <Menu.Item key="column">{$l('Table', expanded ? 'collapse_column' : 'expand_column')}</Menu.Item>
    </Menu>
  ), [prefixCls, handleMenuClick, expanded]);
  return (
    <span className={`${prefixCls}-cell-expand`}>
      <button type="button" className={`${prefixCls}-cell-expand-btn`} onClick={handleClick}>
        {$l('Table', expanded ? 'collapse' : 'expand_button')}
      </button>
      <Dropdown overlay={getOverlay}>
        <span className={`${prefixCls}-cell-expand-menu-btn`} />
      </Dropdown>
    </span>
  );
};

export default AggregationButton;
