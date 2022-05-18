import React, { Component, Key, MouseEventHandler, ReactElement } from 'react';
import { findDOMNode } from 'react-dom';
import Icon from '../icon';
import { ColumnProps, TableStateFilters } from './interface';
import Select, { LabeledValue, OptionProps } from '../select';
import { filterByInputValue, getColumnKey } from './util';
import Checkbox from '../checkbox/Checkbox';
import { SelectMode } from '../select/enum';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

const { Option, OptGroup } = Select;
const PAIR_SPLIT = ':';
const VALUE_SPLIT = '、';
const OPTION_OR = 'option-or';
export const VALUE_OR = 'OR';

function pairValue<T>(column: ColumnProps<T>, value = '') {
  const { filters } = column;
  const found = filters && filters.find(filter => String(filter.value) === value);
  return {
    key: `${getColumnKey(column)}${PAIR_SPLIT}${value}`,
    label: [column.filterTitle || column.title, PAIR_SPLIT, ' ', found ? found.text : value],
  };
}

function barPair(value: string, index: number) {
  return {
    key: `${value}${PAIR_SPLIT}${index}`,
    label: [value],
  };
}

export interface FilterSelectProps<T> {
  prefixCls?: string;
  placeholder?: string;
  dataSource?: T[];
  filters?: string[];
  columnFilters?: TableStateFilters<T>;
  columns?: ColumnProps<T>[];
  onFilter?: (column: ColumnProps<T>, nextFilters: string[]) => void;
  onChange?: (filters?: any[]) => void;
  onClear?: () => void;
  multiple?: boolean;
  getPopupContainer?: (triggerNode?: Element) => HTMLElement;
}

export interface FilterSelectState<T> {
  columns: ColumnProps<T>[];
  filters: string[];
  columnFilters: TableStateFilters<T>;
  selectColumn?: ColumnProps<T>;
  inputValue: string;
  checked: any[];
}

function removeDoubleOr(filters: LabeledValue[]): LabeledValue[] {
  return filters.filter(({ label }, index) => label !== VALUE_OR || label !== filters[index + 1]);
}

export default class FilterSelect<T> extends Component<FilterSelectProps<T>, FilterSelectState<T>> {
  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static displayName = 'FilterSelect';

  context: ConfigContextValue;

  constructor(props) {
    super(props);
    this.state = {
      columns: this.getColumnsWidthFilters(),
      filters: props.filters || [],
      columnFilters: props.columnFilters || {},
      inputValue: '',
      selectColumn: undefined,
      checked: [],
    };
  }

  state: FilterSelectState<T>;

  rcSelect: any;

  columnRefs: any = {};

  componentWillReceiveProps(nextProps: FilterSelectProps<T>) {
    this.setState({
      columns: this.getColumnsWidthFilters(nextProps),
    });
    if (nextProps.filters) {
      this.setState({
        filters: nextProps.filters,
      });
    }
    if (nextProps.columnFilters) {
      this.setState({
        columnFilters: nextProps.columnFilters,
      });
    }
  }

  getPrefixCls() {
    const { prefixCls } = this.props;
    return `${prefixCls}-filter-select`;
  }

  handleDropdownMouseDown: MouseEventHandler<any> = e => {
    e.preventDefault();
    this.rcSelect.focus();
  };

  render() {
    const { placeholder, getPopupContainer } = this.props;
    const { inputValue } = this.state;
    const prefixCls = this.getPrefixCls();
    const multiple = this.isMultiple();
    return (
      <div className={prefixCls}>
        <div className={`${prefixCls}-icon`}>
          <Icon type="filter_list" />
        </div>
        <Select
          ref={this.saveRef}
          mode={SelectMode.tags}
          filterOption={false}
          onChange={this.handleChange}
          onSelect={multiple ? this.handleSelect : undefined}
          onInput={this.handleInput}
          onInputKeyDown={this.handleInputKeyDown}
          onClear={this.handleClear}
          value={this.getValue()}
          placeholder={placeholder}
          notFoundContent={false}
          showNotFindInputItem={false}
          showNotFindSelectedItem={false}
          dropdownMatchSelectWidth={false}
          defaultActiveFirstOption={!inputValue}
          dropdownStyle={{ minWidth: 256 }}
          onDropdownMouseDown={this.handleDropdownMouseDown}
          dropdownClassName={`${prefixCls}-dropdown`}
          getRootDomNode={this.getRootDomNode}
          showCheckAll={false}
          onChoiceItemClick={this.handleChoiceItemClick}
          getPopupContainer={getPopupContainer}
          allowClear
          labelInValue
          blurChange
          border={false}
        >
          {this.getOptions()}
        </Select>
        <div className={`${prefixCls}-columns`}>{this.renderColumnsTitle()}</div>
      </div>
    );
  }

  renderColumnsTitle() {
    const { columns } = this.state;
    this.columnRefs = {};
    return columns.map(col => {
      const key = getColumnKey(col);
      return (
        <span ref={this.saveColumnRef.bind(this, key)} key={key}>
          {col.filterTitle || col.title}
        </span>
      );
    });
  }

  isMultiple() {
    const { selectColumn } = this.state;
    if (selectColumn) {
      return selectColumn.filterMultiple;
    }
    return false;
  }

  saveRef = (node: any) => {
    if (node) {
      this.rcSelect = node.rcSelect;
    }
  };

  saveColumnRef = (key: Key, node: any) => {
    if (node) {
      this.columnRefs[key] = node;
    }
  };

  handleInputKeyDown = (e: any) => {
    const { value } = e.target;
    const { filters, columnFilters, selectColumn } = this.state;
    let filterText = value;
    if (selectColumn && value) {
      filterText = value.split(this.getColumnTitle(selectColumn)).slice(1);
    }
    if (e.keyCode === 13 && filterText[0]) {
      if (selectColumn) {
        const key = getColumnKey(selectColumn);
        if (key) {
          const { filters: columFilters } = selectColumn;
          columnFilters[key] = filterText;
          const found = columFilters && columFilters.find(filter => filter.text === filterText[0]);
          const filterValue = found ? String(found.value) : filterText[0];
          this.fireColumnFilterChange(key, [filterValue]);
        }
      } else {
        filters.push(value);
        this.fireChange(filters);
      }
      this.setState({
        inputValue: '',
        filters,
        columnFilters,
        selectColumn: undefined,
      });
      this.rcSelect.setState({
        inputValue: '',
      });
    }
  };

  handleInput = (value: string) => {
    let { selectColumn } = this.state;
    if (selectColumn) {
      if (value.indexOf(this.getColumnTitle(selectColumn)) === -1) {
        selectColumn = undefined;
      }
    }
    this.setState({
      selectColumn,
      inputValue: value,
    });
  };

  handleChoiceItemClick = ({ key }: LabeledValue) => {
    const pair = key.split(PAIR_SPLIT);
    if (pair.length > 1) {
      const columnKey = pair.shift();
      const selectColumn = this.findColumn(columnKey as string);
      if (selectColumn && selectColumn.filterMultiple) {
        const { filters } = selectColumn;
        const checked = pair
          .join(PAIR_SPLIT)
          .split(VALUE_SPLIT)
          .map(text => {
            const found = filters && filters.find(filter => filter.text === text);
            return found ? found.value : text;
          });
        this.setState({
          selectColumn,
          checked,
        });
      }
    }
  };

  handleSelect = ({ key }: LabeledValue) => {
    const { checked, selectColumn } = this.state;
    if (key === '__ok__') {
      this.handleMultiCheckConfirm();
    } else if (key !== `${selectColumn && selectColumn.title}:`) {
      const index = checked.indexOf(key);
      if (index === -1) {
        checked.push(key);
      } else {
        checked.splice(index, 1);
      }
      this.setState(
        {
          checked,
        },
        () => {
          if (selectColumn) {
            const { columnFilters } = this.state;
            const columnKey = getColumnKey(selectColumn);
            if (columnKey) {
              const filters = columnFilters[columnKey];
              if (!filters || !filters.length) {
                this.rcSelect.setState({
                  inputValue: this.getColumnTitle(selectColumn),
                });
              }
            }
          }
        },
      );
    }
    return false;
  };

  handleMultiCheckConfirm = () => {
    const { selectColumn, checked } = this.state;
    if (selectColumn) {
      const columnKey = getColumnKey(selectColumn);
      if (columnKey) {
        this.fireColumnFilterChange(columnKey, checked);
        this.setState({
          selectColumn: undefined,
          checked: [],
        });
        this.rcSelect.setState({
          inputValue: '',
        });
      }
    }
  };

  handleClear = () => {
    this.setState({ selectColumn: undefined });
  };

  handleChange = (changedValue: LabeledValue[]) => {
    const { state, rcSelect } = this;
    const { selectColumn, inputValue, columnFilters } = state;
    let { filters } = state;
    const all = this.getValue();
    let change = false;
    if (changedValue.length > all.length) {
      const value = changedValue.pop();
      if (inputValue && value && value.key === inputValue) {
        change = true;
        if (selectColumn && !selectColumn.filterMultiple && value) {
          const columnKey = getColumnKey(selectColumn);
          const columnTitle = this.getColumnTitle(selectColumn);
          const val = rcSelect.state.inputValue || value.key;
          if (columnKey) {
            this.fireColumnFilterChange(columnKey, [val.split(`${columnTitle}`)[1]]);
          }
        } else {
          filters.push(value.label as string);
        }
        this.setState({
          selectColumn: undefined,
          inputValue: '',
          filters,
        });
      } else if (value && value.label === OPTION_OR) {
        filters.push(VALUE_OR);
        change = true;
        this.setState({
          filters,
        });
      } else if (selectColumn) {
        if (!selectColumn.filterMultiple) {
          const columnKey = getColumnKey(selectColumn);
          if (rcSelect.state.inputValue && value && columnKey) {
            this.fireColumnFilterChange(columnKey, (selectColumn.filters && !selectColumn.filters.length && !inputValue) ? [] : [value.key]);
          }
          this.setState({
            selectColumn: undefined,
          });
        } else {
          this.setState({
            selectColumn: undefined,
            checked: [],
          });
          rcSelect.setState({
            inputValue: '',
          });
        }
      } else if (value) {
        const column = this.findColumn(value.key);
        const columnFilter = columnFilters[value.key];
        if (column && (!columnFilter || !columnFilter.length)) {
          rcSelect.setState({
            inputValue: this.getColumnTitle(column),
          });
        }
        this.setState({
          selectColumn: column,
        });
      }
    } else {
      filters = this.changeValue(changedValue, rcSelect.state.value);
      if (state.filters.length !== filters.length) {
        change = true;
      }
      this.setState({
        inputValue: '',
        filters,
      });
    }
    if (change) {
      this.fireChange(filters);
    }
  };

  fireChange(filters: any[]) {
    const { onChange } = this.props;
    if (typeof onChange === 'function') {
      onChange(filters);
    }
  }

  fireColumnFilterChange(columnKey: string | number, value: any[]) {
    const col = this.findColumn(columnKey);
    const { onFilter } = this.props;
    if (col && onFilter) {
      onFilter(col, value || null);
    }
  }

  changeValue(changedValue: LabeledValue[], oldValue: any[]): string[] {
    const { state } = this;
    const changedColumnKeys: any[] = [];
    const changedColumnFilters = state.columnFilters;
    const columnFiltersValues = this.getColumnFiltersValues();
    if (changedValue.length) {
      const len = columnFiltersValues.length;
      if (len > 0) {
        const index = oldValue.findIndex(
          (item, i) => item !== (changedValue[i] && changedValue[i].key),
        );
        if (index < columnFiltersValues.length) {
          const deleted = changedValue.splice(0, len - 1);
          if (deleted.length < 2 && changedValue[0] && changedValue[0].label === VALUE_OR) {
            changedValue.shift();
          }
          let value = columnFiltersValues[index];
          if (value === VALUE_OR) {
            value = columnFiltersValues[index + 1];
          }
          const columnKey = Object.keys(value)[0];
          const columnFilters = changedColumnFilters[columnKey].slice();
          const column = this.findColumn(columnKey);
          if (column) {
            const { filters } = column;
            value[columnKey].split(VALUE_SPLIT).forEach((text: string) => {
              const found = filters && filters.find(filter => filter.text === text);
              const filterIndex = columnFilters.indexOf(found ? found.value : text);
              if (filterIndex !== -1) {
                columnFilters.splice(filterIndex, 1);
                changedColumnFilters[columnKey] = columnFilters;
                if (changedColumnKeys.indexOf(columnKey) === -1) {
                  changedColumnKeys.push(columnKey);
                }
              }
            });
          }
        } else {
          changedValue.splice(0, len);
        }
      }
      changedColumnKeys.forEach(key => {
        this.fireColumnFilterChange(key, changedColumnFilters[key]);
      });
    } else {
      const { onClear } = this.props;
      if (onClear) {
        onClear();
      }
    }
    return removeDoubleOr(changedValue).map(item => {
      const label: any = item.label;
      if (label.constructor === Array) {
        return label && label[0];
      }
      return label;
    });
  }

  getColumnFiltersValues() {
    const values: any[] = [];
    const { columnFilters } = this.state;
    Object.keys(columnFilters).forEach(c => {
      const filteredValue = columnFilters[c];
      const column = this.findColumn(c);
      if (filteredValue && filteredValue.length && column) {
        const { filters } = column;
        values.push({
          [c]: filteredValue
            .map(value => {
              const found =
                filters && filters.find(filter => String(filter.value) === String(value));
              return found ? found.text : value;
            })
            .join(VALUE_SPLIT),
        });
      }
    });
    return values;
  }

  getValue() {
    const { filters } = this.state;
    return this.getColumnFiltersValues()
      .map(this.toValueString)
      .concat(filters.map(barPair));
  }

  getInputFilterOptions(inputValue: string) {
    const { columns, dataSource } = this.props;
    const options: ReactElement<OptionProps>[] = [];
    if (dataSource && columns) {
      const values: { [x: string]: boolean } = {};
      filterByInputValue<T>(
        dataSource,
        columns,
        inputValue,
        (record: T, column: ColumnProps<T>) => {
          const { dataIndex } = column;
          if (dataIndex) {
            const value = (record as any)[dataIndex].toString();
            if (!values[value]) {
              values[value] = true;
              options.push(
                <Option key={value} value={value}>
                  {value}
                </Option>,
              );
            }
          }
        },
      );
    }
    return options;
  }

  getOptions() {
    const { state } = this;
    const { selectColumn, inputValue, columns, checked, columnFilters } = state;
    if (selectColumn) {
      if (inputValue && inputValue.split(PAIR_SPLIT)[1]) {
        return null;
      }
      const { filters, filterMultiple } = selectColumn;
      const columnKey = getColumnKey(selectColumn);
      if (filters) {
        return filters
          .filter(filter => !filter.children)
          .map((filter, i) => {
            const value = String(filter.value);
            let text: any = filter.text;
            if (filterMultiple && columnKey) {
              let _checked = columnFilters[columnKey];
              if (_checked && !checked.length) {
                state.checked = _checked.slice();
              } else {
                _checked = checked;
              }
              text = [
                <Checkbox key="ck" className="multiple" checked={_checked.indexOf(value) !== -1} />,
                text,
              ];
            }
            return (
              <Option key={`filter-${String(i)}`} value={value}>
                {text}
              </Option>
            );
          })
          .concat(
            filterMultiple ? (
              <OptGroup key="ok">
                <Option value="__ok__" className={`${this.getPrefixCls()}-ok-btn`}>
                  确认
                </Option>
              </OptGroup>
            ) : (
              []
            ),
          );
      }
    } else if (inputValue) {
      return this.getInputFilterOptions(inputValue);
    } else {
      const { filters } = this.state;
      const { multiple } = this.props;
      const { length } = filters;
      const value = this.getColumnFiltersValues();
      const keys = value.map(item => Object.keys(item)[0]);
      const options = columns.reduce((opts: any[], column, i) => {
        const key = getColumnKey(column, i);
        if (keys.indexOf(key as string) === -1 || column.filterMultiple) {
          opts.push(
            <Option key={`column-${key}`} value={key}>
              <span>{column.filterTitle || column.title}</span>
            </Option>,
          );
        }
        return opts;
      }, []);
      if (multiple && (length ? filters[length - 1] !== VALUE_OR : value.length)) {
        return [
          <OptGroup key="or">
            <Option value={OPTION_OR}>OR</Option>
          </OptGroup>,
          <OptGroup key="all">{options}</OptGroup>,
        ];
      }
      return options;
    }
  }

  getColumnsWidthFilters(props = this.props) {
    return (props.columns || []).filter(column => column.filters instanceof Array);
  }

  findColumn(myKey: string | number) {
    const { columns } = this.state;
    return columns.find(c => getColumnKey(c) === myKey);
  }

  toValueString = (item: any) => {
    const key = Object.keys(item)[0];
    const col = this.findColumn(key);
    if (col) {
      return pairValue(col, item[key]);
    }
    return '';
  };

  getRootDomNode = (): HTMLElement => {
    const { getPrefixCls } = this.context;
    return (findDOMNode(this) as HTMLElement).querySelector(
      `.${getPrefixCls('select')}-search__field`,
    ) as HTMLElement;
  };

  getColumnTitle(column: ColumnProps<T>) {
    const columnKey = getColumnKey(column);
    if (columnKey) {
      return `${this.columnRefs[columnKey].textContent}${PAIR_SPLIT}`;
    }
    return '';
  }
}
