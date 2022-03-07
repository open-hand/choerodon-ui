import React from 'react';
import FilterSelect from './FilterSelect';
import ColumnFilter from './ColumnFilter';
import { ColumnProps, TableStateFilters } from './interface';

export interface FilterBarProps<T> {
  prefixCls?: string;
  placeholder?: string;
  dataSource?: T[];
  filters?: string[];
  columnFilters?: TableStateFilters<T>;
  multiple?: boolean;
  columns?: ColumnProps<T>[];
  onFilterSelectChange?: (filters?: any[]) => void;
  onFilterSelectClear?: () => void;
  onColumnFilterChange?: (columns?: ColumnProps<T>[]) => void;
  onFilter?: (column: ColumnProps<T>, nextFilters: string[]) => void;
  getPopupContainer?: (triggerNode?: Element) => HTMLElement;
}

export default function FilterBar<T>(props: FilterBarProps<T>) {
  const {
    prefixCls,
    columns,
    onColumnFilterChange,
    onFilterSelectChange,
    onFilterSelectClear,
    onFilter,
    dataSource,
    filters,
    columnFilters,
    placeholder,
    multiple,
    getPopupContainer,
  } = props;
  return (
    <div className={`${prefixCls}-filter-bar`}>
      <FilterSelect
        prefixCls={prefixCls}
        placeholder={placeholder}
        columns={columns}
        dataSource={dataSource}
        onChange={onFilterSelectChange}
        onClear={onFilterSelectClear}
        onFilter={onFilter}
        filters={filters}
        columnFilters={columnFilters}
        getPopupContainer={getPopupContainer}
        multiple={multiple}
      />
      <ColumnFilter
        prefixCls={prefixCls}
        columns={columns}
        onColumnFilterChange={onColumnFilterChange}
        getPopupContainer={getPopupContainer}
      />
    </div>
  );
}
