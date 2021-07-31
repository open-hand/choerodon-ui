import React, { FunctionComponent, useCallback, useContext } from 'react';
import { action } from 'mobx';
import { ClickParam } from 'choerodon-ui/lib/menu';
import Record from '../data-set/Record';
import { ColumnProps } from './Column';
import TableContext from './TableContext';
import Dropdown from '../dropdown/Dropdown';
import Menu from '../menu';
import { $l } from '../locale-context';

export interface AggregationButtonProps {
  expanded: boolean;
  record: Record;
  column: ColumnProps;
}

const AggregationButton: FunctionComponent<AggregationButtonProps> = (props) => {
  const { expanded, record, column } = props;
  const { tableStore, prefixCls } = useContext(TableContext);
  const handleMenuClick = useCallback(action(({ key }: Partial<ClickParam>) => {
    switch (key) {
      case 'cell':
        tableStore.setAggregationCellExpanded(record, column, !expanded);
        break;
      case 'row':
        tableStore.leafAggregationColumns.forEach(col => tableStore.setAggregationCellExpanded(record, col, !expanded));
        break;
      case 'column': {
        const { dataSet } = record;
        if (dataSet) {
          dataSet.forEach(r => tableStore.setAggregationCellExpanded(r, column, !expanded));
        }
        break;
      }
      default:
    }
  }), [tableStore, record, column, expanded]);
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
