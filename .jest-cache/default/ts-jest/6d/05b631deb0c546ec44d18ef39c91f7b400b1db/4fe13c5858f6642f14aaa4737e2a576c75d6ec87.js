import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import Icon from '../icon';
import Select from '../select';
import { filterByInputValue, getColumnKey } from './util';
import Checkbox from '../checkbox/Checkbox';
import { getPrefixCls } from '../configure';
const { Option, OptGroup } = Select;
const PAIR_SPLIT = ':';
const VALUE_SPLIT = '、';
const OPTION_OR = 'option-or';
export const VALUE_OR = 'OR';
function pairValue(column, value = '') {
    const { filters } = column;
    const found = filters && filters.find(filter => String(filter.value) === value);
    return {
        key: `${getColumnKey(column)}${PAIR_SPLIT}${value}`,
        label: [column.filterTitle || column.title, PAIR_SPLIT, ' ', found ? found.text : value],
    };
}
function barPair(value, index) {
    return {
        key: `${value}${PAIR_SPLIT}${index}`,
        label: [value],
    };
}
function removeDoubleOr(filters) {
    return filters.filter(({ label }, index) => label !== VALUE_OR || label !== filters[index + 1]);
}
export default class FilterSelect extends Component {
    constructor(props) {
        super(props);
        this.columnRefs = {};
        this.handleDropdownMouseDown = e => {
            e.preventDefault();
            this.rcSelect.focus();
        };
        this.saveRef = (node) => {
            if (node) {
                this.rcSelect = node.rcSelect;
            }
        };
        this.saveColumnRef = (key, node) => {
            if (node) {
                this.columnRefs[key] = node;
            }
        };
        this.handleInputKeyDown = (e) => {
            const { value } = e.target;
            if (e.keyCode === 13 && !e.isDefaultPrevented() && value) {
                const { filters, columnFilters, selectColumn } = this.state;
                if (selectColumn) {
                    const key = getColumnKey(selectColumn);
                    if (key) {
                        const { filters: columFilters } = selectColumn;
                        const filterText = value.split(this.getColumnTitle(selectColumn)).slice(1);
                        columnFilters[key] = filterText;
                        const found = columFilters && columFilters.find(filter => filter.text === filterText[0]);
                        const filterValue = found ? String(found.value) : filterText[0];
                        this.fireColumnFilterChange(key, [filterValue]);
                    }
                }
                else {
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
        this.handleInput = (value) => {
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
        this.handleChoiceItemClick = ({ key }) => {
            const pair = key.split(PAIR_SPLIT);
            if (pair.length > 1) {
                const columnKey = pair.shift();
                const selectColumn = this.findColumn(columnKey);
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
        this.handleSelect = ({ key }) => {
            const { checked, selectColumn } = this.state;
            if (key === '__ok__') {
                this.handleMultiCheckConfirm();
            }
            else if (key !== `${selectColumn && selectColumn.title}:`) {
                const index = checked.indexOf(key);
                if (index === -1) {
                    checked.push(key);
                }
                else {
                    checked.splice(index, 1);
                }
                this.setState({
                    checked,
                }, () => {
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
                });
            }
            return false;
        };
        this.handleMultiCheckConfirm = () => {
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
        this.handleClear = () => {
            this.setState({ selectColumn: undefined });
        };
        this.handleChange = (changedValue) => {
            const { state, rcSelect } = this;
            const { selectColumn, inputValue, columnFilters } = state;
            let { filters } = state;
            const all = this.getValue();
            let change = false;
            if (changedValue.length > all.length) {
                const value = changedValue.pop();
                if (inputValue) {
                    if (rcSelect.state.inputValue && value) {
                        change = true;
                        filters.push(value.label);
                    }
                    this.setState({
                        selectColumn: undefined,
                        inputValue: '',
                        filters,
                    });
                }
                else if (value && value.label === OPTION_OR) {
                    filters.push(VALUE_OR);
                    change = true;
                    this.setState({
                        filters,
                    });
                }
                else if (selectColumn) {
                    if (!selectColumn.filterMultiple) {
                        const columnKey = getColumnKey(selectColumn);
                        if (rcSelect.state.inputValue && value && columnKey) {
                            this.fireColumnFilterChange(columnKey, [value.key]);
                        }
                        this.setState({
                            selectColumn: undefined,
                        });
                    }
                    else {
                        this.setState({
                            selectColumn: undefined,
                            checked: [],
                        });
                        rcSelect.setState({
                            inputValue: '',
                        });
                    }
                }
                else if (value) {
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
            }
            else {
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
        this.toValueString = (item) => {
            const key = Object.keys(item)[0];
            const col = this.findColumn(key);
            if (col) {
                return pairValue(col, item[key]);
            }
            return '';
        };
        this.getRootDomNode = () => {
            return findDOMNode(this).querySelector(`.${getPrefixCls('select')}-search__field`);
        };
        this.state = {
            columns: this.getColumnsWidthFilters(),
            filters: props.filters || [],
            columnFilters: props.columnFilters || {},
            inputValue: '',
            selectColumn: undefined,
            checked: [],
        };
    }
    componentWillReceiveProps(nextProps) {
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
    render() {
        const { placeholder, getPopupContainer } = this.props;
        const { inputValue } = this.state;
        const prefixCls = this.getPrefixCls();
        const multiple = this.isMultiple();
        return (React.createElement("div", { className: prefixCls },
            React.createElement("div", { className: `${prefixCls}-icon` },
                React.createElement(Icon, { type: "filter_list" })),
            React.createElement(Select, { ref: this.saveRef, mode: "tags" /* tags */, filterOption: false, onChange: this.handleChange, onSelect: multiple ? this.handleSelect : undefined, onInput: this.handleInput, onInputKeyDown: this.handleInputKeyDown, onClear: this.handleClear, value: this.getValue(), placeholder: placeholder, notFoundContent: false, showNotFindInputItem: false, showNotFindSelectedItem: false, dropdownMatchSelectWidth: false, defaultActiveFirstOption: !inputValue, dropdownStyle: { minWidth: 256 }, onDropdownMouseDown: this.handleDropdownMouseDown, dropdownClassName: `${prefixCls}-dropdown`, getRootDomNode: this.getRootDomNode, showCheckAll: false, onChoiceItemClick: this.handleChoiceItemClick, getPopupContainer: getPopupContainer, allowClear: true, labelInValue: true, blurChange: false, border: false }, this.getOptions()),
            React.createElement("div", { className: `${prefixCls}-columns` }, this.renderColumnsTitle())));
    }
    renderColumnsTitle() {
        const { columns } = this.state;
        this.columnRefs = {};
        return columns.map(col => {
            const key = getColumnKey(col);
            return (React.createElement("span", { ref: this.saveColumnRef.bind(this, key), key: key }, col.filterTitle || col.title));
        });
    }
    isMultiple() {
        const { selectColumn } = this.state;
        if (selectColumn) {
            return selectColumn.filterMultiple;
        }
        return false;
    }
    fireChange(filters) {
        const { onChange } = this.props;
        if (typeof onChange === 'function') {
            onChange(filters);
        }
    }
    fireColumnFilterChange(columnKey, value) {
        const col = this.findColumn(columnKey);
        const { onFilter } = this.props;
        if (col && onFilter) {
            onFilter(col, value || null);
        }
    }
    changeValue(changedValue, oldValue) {
        const { state } = this;
        const changedColumnKeys = [];
        const changedColumnFilters = state.columnFilters;
        const columnFiltersValues = this.getColumnFiltersValues();
        if (changedValue.length) {
            const len = columnFiltersValues.length;
            if (len > 0) {
                const index = oldValue.findIndex((item, i) => item !== (changedValue[i] && changedValue[i].key));
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
                        value[columnKey].split(VALUE_SPLIT).forEach((text) => {
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
                }
                else {
                    changedValue.splice(0, len);
                }
            }
            changedColumnKeys.forEach(key => {
                this.fireColumnFilterChange(key, changedColumnFilters[key]);
            });
        }
        else {
            const { onClear } = this.props;
            if (onClear) {
                onClear();
            }
        }
        return removeDoubleOr(changedValue).map(item => {
            const label = item.label;
            if (label.constructor === Array) {
                return label && label[0];
            }
            return label;
        });
    }
    getColumnFiltersValues() {
        const values = [];
        const { columnFilters } = this.state;
        Object.keys(columnFilters).forEach(c => {
            const filteredValue = columnFilters[c];
            const column = this.findColumn(c);
            if (filteredValue && filteredValue.length && column) {
                const { filters } = column;
                values.push({
                    [c]: filteredValue
                        .map(value => {
                        const found = filters && filters.find(filter => String(filter.value) === String(value));
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
    getInputFilterOptions(inputValue) {
        const { columns, dataSource } = this.props;
        const options = [];
        if (dataSource && columns) {
            const values = {};
            filterByInputValue(dataSource, columns, inputValue, (record, column) => {
                const { dataIndex } = column;
                if (dataIndex) {
                    const value = record[dataIndex].toString();
                    if (!values[value]) {
                        values[value] = true;
                        options.push(React.createElement(Option, { key: value, value: value }, value));
                    }
                }
            });
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
                    let text = filter.text;
                    if (filterMultiple && columnKey) {
                        let _checked = columnFilters[columnKey];
                        if (_checked && !checked.length) {
                            state.checked = _checked.slice();
                        }
                        else {
                            _checked = checked;
                        }
                        text = [
                            React.createElement(Checkbox, { key: "ck", className: "multiple", checked: _checked.indexOf(value) !== -1 }),
                            text,
                        ];
                    }
                    return (React.createElement(Option, { key: `filter-${String(i)}`, value: value }, text));
                })
                    .concat(filterMultiple ? (React.createElement(OptGroup, { key: "ok" },
                    React.createElement(Option, { value: "__ok__", className: `${this.getPrefixCls()}-ok-btn` }, "\u786E\u8BA4"))) : ([]));
            }
        }
        else if (inputValue) {
            return this.getInputFilterOptions(inputValue);
        }
        else {
            const { filters } = this.state;
            const { multiple } = this.props;
            const { length } = filters;
            const value = this.getColumnFiltersValues();
            const keys = value.map(item => Object.keys(item)[0]);
            const options = columns.reduce((opts, column, i) => {
                const key = getColumnKey(column, i);
                if (keys.indexOf(key) === -1 || column.filterMultiple) {
                    opts.push(React.createElement(Option, { key: `column-${key}`, value: key },
                        React.createElement("span", null, column.filterTitle || column.title)));
                }
                return opts;
            }, []);
            if (multiple && (length ? filters[length - 1] !== VALUE_OR : value.length)) {
                return [
                    React.createElement(OptGroup, { key: "or" },
                        React.createElement(Option, { value: OPTION_OR }, "OR")),
                    React.createElement(OptGroup, { key: "all" }, options),
                ];
            }
            return options;
        }
    }
    getColumnsWidthFilters(props = this.props) {
        return (props.columns || []).filter(column => column.filters instanceof Array);
    }
    findColumn(myKey) {
        const { columns } = this.state;
        return columns.find(c => getColumnKey(c) === myKey);
    }
    getColumnTitle(column) {
        const columnKey = getColumnKey(column);
        if (columnKey) {
            return `${this.columnRefs[columnKey].textContent}${PAIR_SPLIT}`;
        }
        return '';
    }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMvdGFibGUvRmlsdGVyU2VsZWN0LnRzeCIsIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEtBQUssRUFBRSxFQUFFLFNBQVMsRUFBd0MsTUFBTSxPQUFPLENBQUM7QUFDL0UsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUN4QyxPQUFPLElBQUksTUFBTSxTQUFTLENBQUM7QUFFM0IsT0FBTyxNQUFxQyxNQUFNLFdBQVcsQ0FBQztBQUM5RCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsWUFBWSxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBQzFELE9BQU8sUUFBUSxNQUFNLHNCQUFzQixDQUFDO0FBRTVDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFNUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLENBQUM7QUFDcEMsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDO0FBQ3ZCLE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQztBQUN4QixNQUFNLFNBQVMsR0FBRyxXQUFXLENBQUM7QUFDOUIsTUFBTSxDQUFDLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQztBQUU3QixTQUFTLFNBQVMsQ0FBSSxNQUFzQixFQUFFLFFBQWdCLEVBQUU7SUFDOUQsTUFBTSxFQUFFLE9BQU8sRUFBRSxHQUFHLE1BQU0sQ0FBQztJQUMzQixNQUFNLEtBQUssR0FBRyxPQUFPLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUM7SUFDaEYsT0FBTztRQUNMLEdBQUcsRUFBRSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsR0FBRyxVQUFVLEdBQUcsS0FBSyxFQUFFO1FBQ25ELEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLElBQUksTUFBTSxDQUFDLEtB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QUFLLEdBQUcsSUFBSSxDQUFDLEtBQUs7UUFDdkMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sWUFBWSxLQUFLLENBQUMsQ0FBQztJQUNqRixDQUFDO0lBRUQsVUFBVSxDQUFDLEtBQXNCO1FBQy9CLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQy9CLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBaUJELGNBQWMsQ0FBQyxNQUFzQjtRQUNuQyxNQUFNLFNBQVMsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdkMsSUFBSSxTQUFTLEVBQUU7WUFDYixPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxXQUFXLEdBQUcsVUFBVSxFQUFFLENBQUM7U0FDakU7UUFDRCxPQUFPLEVBQUUsQ0FBQztJQUNaLENBQUM7Q0FDRiIsIm5hbWVzIjpbXSwic291cmNlcyI6WyIvVXNlcnMvaHVpaHVhd2svRG9jdW1lbnRzL29wdC9jaG9lcm9kb24tdWkvY29tcG9uZW50cy90YWJsZS9GaWx0ZXJTZWxlY3QudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyBDb21wb25lbnQsIEtleSwgTW91c2VFdmVudEhhbmRsZXIsIFJlYWN0RWxlbWVudCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IGZpbmRET01Ob2RlIH0gZnJvbSAncmVhY3QtZG9tJztcbmltcG9ydCBJY29uIGZyb20gJy4uL2ljb24nO1xuaW1wb3J0IHsgQ29sdW1uUHJvcHMsIFRhYmxlU3RhdGVGaWx0ZXJzIH0gZnJvbSAnLi9pbnRlcmZhY2UnO1xuaW1wb3J0IFNlbGVjdCwgeyBMYWJlbGVkVmFsdWUsIE9wdGlvblByb3BzIH0gZnJvbSAnLi4vc2VsZWN0JztcbmltcG9ydCB7IGZpbHRlckJ5SW5wdXRWYWx1ZSwgZ2V0Q29sdW1uS2V5IH0gZnJvbSAnLi91dGlsJztcbmltcG9ydCBDaGVja2JveCBmcm9tICcuLi9jaGVja2JveC9DaGVja2JveCc7XG5pbXBvcnQgeyBTZWxlY3RNb2RlIH0gZnJvbSAnLi4vc2VsZWN0L2VudW0nO1xuaW1wb3J0IHsgZ2V0UHJlZml4Q2xzIH0gZnJvbSAnLi4vY29uZmlndXJlJztcblxuY29uc3QgeyBPcHRpb24sIE9wdEdyb3VwIH0gPSBTZWxlY3Q7XG5jb25zdCBQQUlSX1NQTElUID0gJzonO1xuY29uc3QgVkFMVUVfU1BMSVQgPSAn44CBJztcbmNvbnN0IE9QVElPTl9PUiA9ICdvcHRpb24tb3InO1xuZXhwb3J0IGNvbnN0IFZBTFVFX09SID0gJ09SJztcblxuZnVuY3Rpb24gcGFpclZhbHVlPFQ+KGNvbHVtbjogQ29sdW1uUHJvcHM8VD4sIHZhbHVlOiBzdHJpbmcgPSAnJykge1xuICBjb25zdCB7IGZpbHRlcnMgfSA9IGNvbHVtbjtcbiAgY29uc3QgZm91bmQgPSBmaWx0ZXJzICYmIGZpbHRlcnMuZmluZChmaWx0ZXIgPT4gU3RyaW5nKGZpbHRlci52YWx1ZSkgPT09IHZhbHVlKTtcbiAgcmV0dXJuIHtcbiAgICBrZXk6IGAke2dldENvbHVtbktleShjb2x1bW4pfSR7UEFJUl9TUExJVH0ke3ZhbHVlfWAsXG4gICAgbGFiZWw6IFtjb2x1bW4uZmlsdGVyVGl0bGUgfHwgY29sdW1uLnRpdGxlLCBQQUlSX1NQTElULCAnICcsIGZvdW5kID8gZm91bmQudGV4dCA6IHZhbHVlXSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gYmFyUGFpcih2YWx1ZTogc3RyaW5nLCBpbmRleDogbnVtYmVyKSB7XG4gIHJldHVybiB7XG4gICAga2V5OiBgJHt2YWx1ZX0ke1BBSVJfU1BMSVR9JHtpbmRleH1gLFxuICAgIGxhYmVsOiBbdmFsdWVdLFxuICB9O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEZpbHRlclNlbGVjdFByb3BzPFQ+IHtcbiAgcHJlZml4Q2xzPzogc3RyaW5nO1xuICBwbGFjZWhvbGRlcj86IHN0cmluZztcbiAgZGF0YVNvdXJjZT86IFRbXTtcbiAgZmlsdGVycz86IHN0cmluZ1tdO1xuICBjb2x1bW5GaWx0ZXJzPzogVGFibGVTdGF0ZUZpbHRlcnM7XG4gIGNvbHVtbnM/OiBDb2x1bW5Qcm9wczxUPltdO1xuICBvbkZpbHRlcj86IChjb2x1bW46IENvbHVtblByb3BzPFQ+LCBuZXh0RmlsdGVyczogc3RyaW5nW10pID0+IHZvaWQ7XG4gIG9uQ2hhbmdlPzogKGZpbHRlcnM/OiBhbnlbXSkgPT4gdm9pZDtcbiAgb25DbGVhcj86ICgpID0+IHZvaWQ7XG4gIG11bHRpcGxlPzogYm9vbGVhbjtcbiAgZ2V0UG9wdXBDb250YWluZXI/OiAodHJpZ2dlck5vZGU/OiBFbGVtZW50KSA9PiBIVE1MRWxlbWVudDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBGaWx0ZXJTZWxlY3RTdGF0ZTxUPiB7XG4gIGNvbHVtbnM6IENvbHVtblByb3BzPFQ+W107XG4gIGZpbHRlcnM6IHN0cmluZ1tdO1xuICBjb2x1bW5GaWx0ZXJzOiBUYWJsZVN0YXRlRmlsdGVycztcbiAgc2VsZWN0Q29sdW1uPzogQ29sdW1uUHJvcHM8VD47XG4gIGlucHV0VmFsdWU6IHN0cmluZztcbiAgY2hlY2tlZDogYW55W107XG59XG5cbmZ1bmN0aW9uIHJlbW92ZURvdWJsZU9yKGZpbHRlcnM6IExhYmVsZWRWYWx1ZVtdKTogTGFiZWxlZFZhbHVlW10ge1xuICByZXR1cm4gZmlsdGVycy5maWx0ZXIoKHsgbGFiZWwgfSwgaW5kZXgpID0+IGxhYmVsICE9PSBWQUxVRV9PUiB8fCBsYWJlbCAhPT0gZmlsdGVyc1tpbmRleCArIDFdKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmlsdGVyU2VsZWN0PFQ+IGV4dGVuZHMgQ29tcG9uZW50PEZpbHRlclNlbGVjdFByb3BzPFQ+LCBGaWx0ZXJTZWxlY3RTdGF0ZTxUPj4ge1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgY29sdW1uczogdGhpcy5nZXRDb2x1bW5zV2lkdGhGaWx0ZXJzKCksXG4gICAgICBmaWx0ZXJzOiBwcm9wcy5maWx0ZXJzIHx8IFtdLFxuICAgICAgY29sdW1uRmlsdGVyczogcHJvcHMuY29sdW1uRmlsdGVycyB8fCB7fSxcbiAgICAgIGlucHV0VmFsdWU6ICcnLFxuICAgICAgc2VsZWN0Q29sdW1uOiB1bmRlZmluZWQsXG4gICAgICBjaGVja2VkOiBbXSxcbiAgICB9O1xuICB9XG5cbiAgc3RhdGU6IEZpbHRlclNlbGVjdFN0YXRlPFQ+O1xuXG4gIHJjU2VsZWN0OiBhbnk7XG5cbiAgY29sdW1uUmVmczogYW55ID0ge307XG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHM6IEZpbHRlclNlbGVjdFByb3BzPFQ+KSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjb2x1bW5zOiB0aGlzLmdldENvbHVtbnNXaWR0aEZpbHRlcnMobmV4dFByb3BzKSxcbiAgICB9KTtcbiAgICBpZiAobmV4dFByb3BzLmZpbHRlcnMpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBmaWx0ZXJzOiBuZXh0UHJvcHMuZmlsdGVycyxcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAobmV4dFByb3BzLmNvbHVtbkZpbHRlcnMpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBjb2x1bW5GaWx0ZXJzOiBuZXh0UHJvcHMuY29sdW1uRmlsdGVycyxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGdldFByZWZpeENscygpIHtcbiAgICBjb25zdCB7IHByZWZpeENscyB9ID0gdGhpcy5wcm9wcztcbiAgICByZXR1cm4gYCR7cHJlZml4Q2xzfS1maWx0ZXItc2VsZWN0YDtcbiAgfVxuXG4gIGhhbmRsZURyb3Bkb3duTW91c2VEb3duOiBNb3VzZUV2ZW50SGFuZGxlcjxhbnk+ID0gZSA9PiB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHRoaXMucmNTZWxlY3QuZm9jdXMoKTtcbiAgfTtcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgeyBwbGFjZWhvbGRlciwgZ2V0UG9wdXBDb250YWluZXIgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgeyBpbnB1dFZhbHVlIH0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHByZWZpeENscyA9IHRoaXMuZ2V0UHJlZml4Q2xzKCk7XG4gICAgY29uc3QgbXVsdGlwbGUgPSB0aGlzLmlzTXVsdGlwbGUoKTtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9e3ByZWZpeENsc30+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LWljb25gfT5cbiAgICAgICAgICA8SWNvbiB0eXBlPVwiZmlsdGVyX2xpc3RcIiAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPFNlbGVjdFxuICAgICAgICAgIHJlZj17dGhpcy5zYXZlUmVmfVxuICAgICAgICAgIG1vZGU9e1NlbGVjdE1vZGUudGFnc31cbiAgICAgICAgICBmaWx0ZXJPcHRpb249e2ZhbHNlfVxuICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLmhhbmRsZUNoYW5nZX1cbiAgICAgICAgICBvblNlbGVjdD17bXVsdGlwbGUgPyB0aGlzLmhhbmRsZVNlbGVjdCA6IHVuZGVmaW5lZH1cbiAgICAgICAgICBvbklucHV0PXt0aGlzLmhhbmRsZUlucHV0fVxuICAgICAgICAgIG9uSW5wdXRLZXlEb3duPXt0aGlzLmhhbmRsZUlucHV0S2V5RG93bn1cbiAgICAgICAgICBvbkNsZWFyPXt0aGlzLmhhbmRsZUNsZWFyfVxuICAgICAgICAgIHZhbHVlPXt0aGlzLmdldFZhbHVlKCl9XG4gICAgICAgICAgcGxhY2Vob2xkZXI9e3BsYWNlaG9sZGVyfVxuICAgICAgICAgIG5vdEZvdW5kQ29udGVudD17ZmFsc2V9XG4gICAgICAgICAgc2hvd05vdEZpbmRJbnB1dEl0ZW09e2ZhbHNlfVxuICAgICAgICAgIHNob3dOb3RGaW5kU2VsZWN0ZWRJdGVtPXtmYWxzZX1cbiAgICAgICAgICBkcm9wZG93bk1hdGNoU2VsZWN0V2lkdGg9e2ZhbHNlfVxuICAgICAgICAgIGRlZmF1bHRBY3RpdmVGaXJzdE9wdGlvbj17IWlucHV0VmFsdWV9XG4gICAgICAgICAgZHJvcGRvd25TdHlsZT17eyBtaW5XaWR0aDogMjU2IH19XG4gICAgICAgICAgb25Ecm9wZG93bk1vdXNlRG93bj17dGhpcy5oYW5kbGVEcm9wZG93bk1vdXNlRG93bn1cbiAgICAgICAgICBkcm9wZG93bkNsYXNzTmFtZT17YCR7cHJlZml4Q2xzfS1kcm9wZG93bmB9XG4gICAgICAgICAgZ2V0Um9vdERvbU5vZGU9e3RoaXMuZ2V0Um9vdERvbU5vZGV9XG4gICAgICAgICAgc2hvd0NoZWNrQWxsPXtmYWxzZX1cbiAgICAgICAgICBvbkNob2ljZUl0ZW1DbGljaz17dGhpcy5oYW5kbGVDaG9pY2VJdGVtQ2xpY2t9XG4gICAgICAgICAgZ2V0UG9wdXBDb250YWluZXI9e2dldFBvcHVwQ29udGFpbmVyfVxuICAgICAgICAgIGFsbG93Q2xlYXJcbiAgICAgICAgICBsYWJlbEluVmFsdWVcbiAgICAgICAgICBibHVyQ2hhbmdlPXtmYWxzZX1cbiAgICAgICAgICBib3JkZXI9e2ZhbHNlfVxuICAgICAgICA+XG4gICAgICAgICAge3RoaXMuZ2V0T3B0aW9ucygpfVxuICAgICAgICA8L1NlbGVjdD5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2Ake3ByZWZpeENsc30tY29sdW1uc2B9Pnt0aGlzLnJlbmRlckNvbHVtbnNUaXRsZSgpfTwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIHJlbmRlckNvbHVtbnNUaXRsZSgpIHtcbiAgICBjb25zdCB7IGNvbHVtbnMgfSA9IHRoaXMuc3RhdGU7XG4gICAgdGhpcy5jb2x1bW5SZWZzID0ge307XG4gICAgcmV0dXJuIGNvbHVtbnMubWFwKGNvbCA9PiB7XG4gICAgICBjb25zdCBrZXkgPSBnZXRDb2x1bW5LZXkoY29sKTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxzcGFuIHJlZj17dGhpcy5zYXZlQ29sdW1uUmVmLmJpbmQodGhpcywga2V5KX0ga2V5PXtrZXl9PlxuICAgICAgICAgIHtjb2wuZmlsdGVyVGl0bGUgfHwgY29sLnRpdGxlfVxuICAgICAgICA8L3NwYW4+XG4gICAgICApO1xuICAgIH0pO1xuICB9XG5cbiAgaXNNdWx0aXBsZSgpIHtcbiAgICBjb25zdCB7IHNlbGVjdENvbHVtbiB9ID0gdGhpcy5zdGF0ZTtcbiAgICBpZiAoc2VsZWN0Q29sdW1uKSB7XG4gICAgICByZXR1cm4gc2VsZWN0Q29sdW1uLmZpbHRlck11bHRpcGxlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBzYXZlUmVmID0gKG5vZGU6IGFueSkgPT4ge1xuICAgIGlmIChub2RlKSB7XG4gICAgICB0aGlzLnJjU2VsZWN0ID0gbm9kZS5yY1NlbGVjdDtcbiAgICB9XG4gIH07XG5cbiAgc2F2ZUNvbHVtblJlZiA9IChrZXk6IEtleSwgbm9kZTogYW55KSA9PiB7XG4gICAgaWYgKG5vZGUpIHtcbiAgICAgIHRoaXMuY29sdW1uUmVmc1trZXldID0gbm9kZTtcbiAgICB9XG4gIH07XG5cbiAgaGFuZGxlSW5wdXRLZXlEb3duID0gKGU6IGFueSkgPT4ge1xuICAgIGNvbnN0IHsgdmFsdWUgfSA9IGUudGFyZ2V0O1xuICAgIGlmIChlLmtleUNvZGUgPT09IDEzICYmICFlLmlzRGVmYXVsdFByZXZlbnRlZCgpICYmIHZhbHVlKSB7XG4gICAgICBjb25zdCB7IGZpbHRlcnMsIGNvbHVtbkZpbHRlcnMsIHNlbGVjdENvbHVtbiB9ID0gdGhpcy5zdGF0ZTtcbiAgICAgIGlmIChzZWxlY3RDb2x1bW4pIHtcbiAgICAgICAgY29uc3Qga2V5ID0gZ2V0Q29sdW1uS2V5KHNlbGVjdENvbHVtbik7XG4gICAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgICBjb25zdCB7IGZpbHRlcnM6IGNvbHVtRmlsdGVycyB9ID0gc2VsZWN0Q29sdW1uO1xuICAgICAgICAgIGNvbnN0IGZpbHRlclRleHQgPSB2YWx1ZS5zcGxpdCh0aGlzLmdldENvbHVtblRpdGxlKHNlbGVjdENvbHVtbikpLnNsaWNlKDEpO1xuICAgICAgICAgIGNvbHVtbkZpbHRlcnNba2V5XSA9IGZpbHRlclRleHQ7XG4gICAgICAgICAgY29uc3QgZm91bmQgPSBjb2x1bUZpbHRlcnMgJiYgY29sdW1GaWx0ZXJzLmZpbmQoZmlsdGVyID0+IGZpbHRlci50ZXh0ID09PSBmaWx0ZXJUZXh0WzBdKTtcbiAgICAgICAgICBjb25zdCBmaWx0ZXJWYWx1ZSA9IGZvdW5kID8gU3RyaW5nKGZvdW5kLnZhbHVlKSA6IGZpbHRlclRleHRbMF07XG4gICAgICAgICAgdGhpcy5maXJlQ29sdW1uRmlsdGVyQ2hhbmdlKGtleSwgW2ZpbHRlclZhbHVlXSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZpbHRlcnMucHVzaCh2YWx1ZSk7XG4gICAgICAgIHRoaXMuZmlyZUNoYW5nZShmaWx0ZXJzKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBpbnB1dFZhbHVlOiAnJyxcbiAgICAgICAgZmlsdGVycyxcbiAgICAgICAgY29sdW1uRmlsdGVycyxcbiAgICAgICAgc2VsZWN0Q29sdW1uOiB1bmRlZmluZWQsXG4gICAgICB9KTtcbiAgICAgIHRoaXMucmNTZWxlY3Quc2V0U3RhdGUoe1xuICAgICAgICBpbnB1dFZhbHVlOiAnJyxcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBoYW5kbGVJbnB1dCA9ICh2YWx1ZTogc3RyaW5nKSA9PiB7XG4gICAgbGV0IHsgc2VsZWN0Q29sdW1uIH0gPSB0aGlzLnN0YXRlO1xuICAgIGlmIChzZWxlY3RDb2x1bW4pIHtcbiAgICAgIGlmICh2YWx1ZS5pbmRleE9mKHRoaXMuZ2V0Q29sdW1uVGl0bGUoc2VsZWN0Q29sdW1uKSkgPT09IC0xKSB7XG4gICAgICAgIHNlbGVjdENvbHVtbiA9IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBzZWxlY3RDb2x1bW4sXG4gICAgICBpbnB1dFZhbHVlOiB2YWx1ZSxcbiAgICB9KTtcbiAgfTtcblxuICBoYW5kbGVDaG9pY2VJdGVtQ2xpY2sgPSAoeyBrZXkgfTogTGFiZWxlZFZhbHVlKSA9PiB7XG4gICAgY29uc3QgcGFpciA9IGtleS5zcGxpdChQQUlSX1NQTElUKTtcbiAgICBpZiAocGFpci5sZW5ndGggPiAxKSB7XG4gICAgICBjb25zdCBjb2x1bW5LZXkgPSBwYWlyLnNoaWZ0KCk7XG4gICAgICBjb25zdCBzZWxlY3RDb2x1bW4gPSB0aGlzLmZpbmRDb2x1bW4oY29sdW1uS2V5IGFzIHN0cmluZyk7XG4gICAgICBpZiAoc2VsZWN0Q29sdW1uICYmIHNlbGVjdENvbHVtbi5maWx0ZXJNdWx0aXBsZSkge1xuICAgICAgICBjb25zdCB7IGZpbHRlcnMgfSA9IHNlbGVjdENvbHVtbjtcbiAgICAgICAgY29uc3QgY2hlY2tlZCA9IHBhaXJcbiAgICAgICAgICAuam9pbihQQUlSX1NQTElUKVxuICAgICAgICAgIC5zcGxpdChWQUxVRV9TUExJVClcbiAgICAgICAgICAubWFwKHRleHQgPT4ge1xuICAgICAgICAgICAgY29uc3QgZm91bmQgPSBmaWx0ZXJzICYmIGZpbHRlcnMuZmluZChmaWx0ZXIgPT4gZmlsdGVyLnRleHQgPT09IHRleHQpO1xuICAgICAgICAgICAgcmV0dXJuIGZvdW5kID8gZm91bmQudmFsdWUgOiB0ZXh0O1xuICAgICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBzZWxlY3RDb2x1bW4sXG4gICAgICAgICAgY2hlY2tlZCxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGhhbmRsZVNlbGVjdCA9ICh7IGtleSB9OiBMYWJlbGVkVmFsdWUpID0+IHtcbiAgICBjb25zdCB7IGNoZWNrZWQsIHNlbGVjdENvbHVtbiB9ID0gdGhpcy5zdGF0ZTtcbiAgICBpZiAoa2V5ID09PSAnX19va19fJykge1xuICAgICAgdGhpcy5oYW5kbGVNdWx0aUNoZWNrQ29uZmlybSgpO1xuICAgIH0gZWxzZSBpZiAoa2V5ICE9PSBgJHtzZWxlY3RDb2x1bW4gJiYgc2VsZWN0Q29sdW1uLnRpdGxlfTpgKSB7XG4gICAgICBjb25zdCBpbmRleCA9IGNoZWNrZWQuaW5kZXhPZihrZXkpO1xuICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICBjaGVja2VkLnB1c2goa2V5KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNoZWNrZWQuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0U3RhdGUoXG4gICAgICAgIHtcbiAgICAgICAgICBjaGVja2VkLFxuICAgICAgICB9LFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgaWYgKHNlbGVjdENvbHVtbikge1xuICAgICAgICAgICAgY29uc3QgeyBjb2x1bW5GaWx0ZXJzIH0gPSB0aGlzLnN0YXRlO1xuICAgICAgICAgICAgY29uc3QgY29sdW1uS2V5ID0gZ2V0Q29sdW1uS2V5KHNlbGVjdENvbHVtbik7XG4gICAgICAgICAgICBpZiAoY29sdW1uS2V5KSB7XG4gICAgICAgICAgICAgIGNvbnN0IGZpbHRlcnMgPSBjb2x1bW5GaWx0ZXJzW2NvbHVtbktleV07XG4gICAgICAgICAgICAgIGlmICghZmlsdGVycyB8fCAhZmlsdGVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJjU2VsZWN0LnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgIGlucHV0VmFsdWU6IHRoaXMuZ2V0Q29sdW1uVGl0bGUoc2VsZWN0Q29sdW1uKSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICBoYW5kbGVNdWx0aUNoZWNrQ29uZmlybSA9ICgpID0+IHtcbiAgICBjb25zdCB7IHNlbGVjdENvbHVtbiwgY2hlY2tlZCB9ID0gdGhpcy5zdGF0ZTtcbiAgICBpZiAoc2VsZWN0Q29sdW1uKSB7XG4gICAgICBjb25zdCBjb2x1bW5LZXkgPSBnZXRDb2x1bW5LZXkoc2VsZWN0Q29sdW1uKTtcbiAgICAgIGlmIChjb2x1bW5LZXkpIHtcbiAgICAgICAgdGhpcy5maXJlQ29sdW1uRmlsdGVyQ2hhbmdlKGNvbHVtbktleSwgY2hlY2tlZCk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIHNlbGVjdENvbHVtbjogdW5kZWZpbmVkLFxuICAgICAgICAgIGNoZWNrZWQ6IFtdLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5yY1NlbGVjdC5zZXRTdGF0ZSh7XG4gICAgICAgICAgaW5wdXRWYWx1ZTogJycsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICBoYW5kbGVDbGVhciA9ICgpID0+IHtcbiAgICB0aGlzLnNldFN0YXRlKHsgc2VsZWN0Q29sdW1uOiB1bmRlZmluZWQgfSk7XG4gIH07XG5cbiAgaGFuZGxlQ2hhbmdlID0gKGNoYW5nZWRWYWx1ZTogTGFiZWxlZFZhbHVlW10pID0+IHtcbiAgICBjb25zdCB7IHN0YXRlLCByY1NlbGVjdCB9ID0gdGhpcztcbiAgICBjb25zdCB7IHNlbGVjdENvbHVtbiwgaW5wdXRWYWx1ZSwgY29sdW1uRmlsdGVycyB9ID0gc3RhdGU7XG4gICAgbGV0IHsgZmlsdGVycyB9ID0gc3RhdGU7XG4gICAgY29uc3QgYWxsID0gdGhpcy5nZXRWYWx1ZSgpO1xuICAgIGxldCBjaGFuZ2UgPSBmYWxzZTtcbiAgICBpZiAoY2hhbmdlZFZhbHVlLmxlbmd0aCA+IGFsbC5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gY2hhbmdlZFZhbHVlLnBvcCgpO1xuICAgICAgaWYgKGlucHV0VmFsdWUpIHtcbiAgICAgICAgaWYgKHJjU2VsZWN0LnN0YXRlLmlucHV0VmFsdWUgJiYgdmFsdWUpIHtcbiAgICAgICAgICBjaGFuZ2UgPSB0cnVlO1xuICAgICAgICAgIGZpbHRlcnMucHVzaCh2YWx1ZS5sYWJlbCBhcyBzdHJpbmcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIHNlbGVjdENvbHVtbjogdW5kZWZpbmVkLFxuICAgICAgICAgIGlucHV0VmFsdWU6ICcnLFxuICAgICAgICAgIGZpbHRlcnMsXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmICh2YWx1ZSAmJiB2YWx1ZS5sYWJlbCA9PT0gT1BUSU9OX09SKSB7XG4gICAgICAgIGZpbHRlcnMucHVzaChWQUxVRV9PUik7XG4gICAgICAgIGNoYW5nZSA9IHRydWU7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIGZpbHRlcnMsXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmIChzZWxlY3RDb2x1bW4pIHtcbiAgICAgICAgaWYgKCFzZWxlY3RDb2x1bW4uZmlsdGVyTXVsdGlwbGUpIHtcbiAgICAgICAgICBjb25zdCBjb2x1bW5LZXkgPSBnZXRDb2x1bW5LZXkoc2VsZWN0Q29sdW1uKTtcbiAgICAgICAgICBpZiAocmNTZWxlY3Quc3RhdGUuaW5wdXRWYWx1ZSAmJiB2YWx1ZSAmJiBjb2x1bW5LZXkpIHtcbiAgICAgICAgICAgIHRoaXMuZmlyZUNvbHVtbkZpbHRlckNoYW5nZShjb2x1bW5LZXksIFt2YWx1ZS5rZXldKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzZWxlY3RDb2x1bW46IHVuZGVmaW5lZCxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHNlbGVjdENvbHVtbjogdW5kZWZpbmVkLFxuICAgICAgICAgICAgY2hlY2tlZDogW10sXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmNTZWxlY3Quc2V0U3RhdGUoe1xuICAgICAgICAgICAgaW5wdXRWYWx1ZTogJycsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodmFsdWUpIHtcbiAgICAgICAgY29uc3QgY29sdW1uID0gdGhpcy5maW5kQ29sdW1uKHZhbHVlLmtleSk7XG4gICAgICAgIGNvbnN0IGNvbHVtbkZpbHRlciA9IGNvbHVtbkZpbHRlcnNbdmFsdWUua2V5XTtcbiAgICAgICAgaWYgKGNvbHVtbiAmJiAoIWNvbHVtbkZpbHRlciB8fCAhY29sdW1uRmlsdGVyLmxlbmd0aCkpIHtcbiAgICAgICAgICByY1NlbGVjdC5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBpbnB1dFZhbHVlOiB0aGlzLmdldENvbHVtblRpdGxlKGNvbHVtbiksXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgc2VsZWN0Q29sdW1uOiBjb2x1bW4sXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmaWx0ZXJzID0gdGhpcy5jaGFuZ2VWYWx1ZShjaGFuZ2VkVmFsdWUsIHJjU2VsZWN0LnN0YXRlLnZhbHVlKTtcbiAgICAgIGlmIChzdGF0ZS5maWx0ZXJzLmxlbmd0aCAhPT0gZmlsdGVycy5sZW5ndGgpIHtcbiAgICAgICAgY2hhbmdlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBpbnB1dFZhbHVlOiAnJyxcbiAgICAgICAgZmlsdGVycyxcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoY2hhbmdlKSB7XG4gICAgICB0aGlzLmZpcmVDaGFuZ2UoZmlsdGVycyk7XG4gICAgfVxuICB9O1xuXG4gIGZpcmVDaGFuZ2UoZmlsdGVyczogYW55W10pIHtcbiAgICBjb25zdCB7IG9uQ2hhbmdlIH0gPSB0aGlzLnByb3BzO1xuICAgIGlmICh0eXBlb2Ygb25DaGFuZ2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIG9uQ2hhbmdlKGZpbHRlcnMpO1xuICAgIH1cbiAgfVxuXG4gIGZpcmVDb2x1bW5GaWx0ZXJDaGFuZ2UoY29sdW1uS2V5OiBzdHJpbmcgfCBudW1iZXIsIHZhbHVlOiBhbnlbXSkge1xuICAgIGNvbnN0IGNvbCA9IHRoaXMuZmluZENvbHVtbihjb2x1bW5LZXkpO1xuICAgIGNvbnN0IHsgb25GaWx0ZXIgfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKGNvbCAmJiBvbkZpbHRlcikge1xuICAgICAgb25GaWx0ZXIoY29sLCB2YWx1ZSB8fCBudWxsKTtcbiAgICB9XG4gIH1cblxuICBjaGFuZ2VWYWx1ZShjaGFuZ2VkVmFsdWU6IExhYmVsZWRWYWx1ZVtdLCBvbGRWYWx1ZTogYW55W10pOiBzdHJpbmdbXSB7XG4gICAgY29uc3QgeyBzdGF0ZSB9ID0gdGhpcztcbiAgICBjb25zdCBjaGFuZ2VkQ29sdW1uS2V5czogYW55W10gPSBbXTtcbiAgICBjb25zdCBjaGFuZ2VkQ29sdW1uRmlsdGVycyA9IHN0YXRlLmNvbHVtbkZpbHRlcnM7XG4gICAgY29uc3QgY29sdW1uRmlsdGVyc1ZhbHVlcyA9IHRoaXMuZ2V0Q29sdW1uRmlsdGVyc1ZhbHVlcygpO1xuICAgIGlmIChjaGFuZ2VkVmFsdWUubGVuZ3RoKSB7XG4gICAgICBjb25zdCBsZW4gPSBjb2x1bW5GaWx0ZXJzVmFsdWVzLmxlbmd0aDtcbiAgICAgIGlmIChsZW4gPiAwKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gb2xkVmFsdWUuZmluZEluZGV4KFxuICAgICAgICAgIChpdGVtLCBpKSA9PiBpdGVtICE9PSAoY2hhbmdlZFZhbHVlW2ldICYmIGNoYW5nZWRWYWx1ZVtpXS5rZXkpLFxuICAgICAgICApO1xuICAgICAgICBpZiAoaW5kZXggPCBjb2x1bW5GaWx0ZXJzVmFsdWVzLmxlbmd0aCkge1xuICAgICAgICAgIGNvbnN0IGRlbGV0ZWQgPSBjaGFuZ2VkVmFsdWUuc3BsaWNlKDAsIGxlbiAtIDEpO1xuICAgICAgICAgIGlmIChkZWxldGVkLmxlbmd0aCA8IDIgJiYgY2hhbmdlZFZhbHVlWzBdICYmIGNoYW5nZWRWYWx1ZVswXS5sYWJlbCA9PT0gVkFMVUVfT1IpIHtcbiAgICAgICAgICAgIGNoYW5nZWRWYWx1ZS5zaGlmdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBsZXQgdmFsdWUgPSBjb2x1bW5GaWx0ZXJzVmFsdWVzW2luZGV4XTtcbiAgICAgICAgICBpZiAodmFsdWUgPT09IFZBTFVFX09SKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IGNvbHVtbkZpbHRlcnNWYWx1ZXNbaW5kZXggKyAxXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgY29sdW1uS2V5ID0gT2JqZWN0LmtleXModmFsdWUpWzBdO1xuICAgICAgICAgIGNvbnN0IGNvbHVtbkZpbHRlcnMgPSBjaGFuZ2VkQ29sdW1uRmlsdGVyc1tjb2x1bW5LZXldLnNsaWNlKCk7XG4gICAgICAgICAgY29uc3QgY29sdW1uID0gdGhpcy5maW5kQ29sdW1uKGNvbHVtbktleSk7XG4gICAgICAgICAgaWYgKGNvbHVtbikge1xuICAgICAgICAgICAgY29uc3QgeyBmaWx0ZXJzIH0gPSBjb2x1bW47XG4gICAgICAgICAgICB2YWx1ZVtjb2x1bW5LZXldLnNwbGl0KFZBTFVFX1NQTElUKS5mb3JFYWNoKCh0ZXh0OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgZm91bmQgPSBmaWx0ZXJzICYmIGZpbHRlcnMuZmluZChmaWx0ZXIgPT4gZmlsdGVyLnRleHQgPT09IHRleHQpO1xuICAgICAgICAgICAgICBjb25zdCBmaWx0ZXJJbmRleCA9IGNvbHVtbkZpbHRlcnMuaW5kZXhPZihmb3VuZCA/IGZvdW5kLnZhbHVlIDogdGV4dCk7XG4gICAgICAgICAgICAgIGlmIChmaWx0ZXJJbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBjb2x1bW5GaWx0ZXJzLnNwbGljZShmaWx0ZXJJbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgY2hhbmdlZENvbHVtbkZpbHRlcnNbY29sdW1uS2V5XSA9IGNvbHVtbkZpbHRlcnM7XG4gICAgICAgICAgICAgICAgaWYgKGNoYW5nZWRDb2x1bW5LZXlzLmluZGV4T2YoY29sdW1uS2V5KSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgIGNoYW5nZWRDb2x1bW5LZXlzLnB1c2goY29sdW1uS2V5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjaGFuZ2VkVmFsdWUuc3BsaWNlKDAsIGxlbik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNoYW5nZWRDb2x1bW5LZXlzLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgdGhpcy5maXJlQ29sdW1uRmlsdGVyQ2hhbmdlKGtleSwgY2hhbmdlZENvbHVtbkZpbHRlcnNba2V5XSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgeyBvbkNsZWFyIH0gPSB0aGlzLnByb3BzO1xuICAgICAgaWYgKG9uQ2xlYXIpIHtcbiAgICAgICAgb25DbGVhcigpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVtb3ZlRG91YmxlT3IoY2hhbmdlZFZhbHVlKS5tYXAoaXRlbSA9PiB7XG4gICAgICBjb25zdCBsYWJlbDogYW55ID0gaXRlbS5sYWJlbDtcbiAgICAgIGlmIChsYWJlbC5jb25zdHJ1Y3RvciA9PT0gQXJyYXkpIHtcbiAgICAgICAgcmV0dXJuIGxhYmVsICYmIGxhYmVsWzBdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGxhYmVsO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0Q29sdW1uRmlsdGVyc1ZhbHVlcygpIHtcbiAgICBjb25zdCB2YWx1ZXM6IGFueVtdID0gW107XG4gICAgY29uc3QgeyBjb2x1bW5GaWx0ZXJzIH0gPSB0aGlzLnN0YXRlO1xuICAgIE9iamVjdC5rZXlzKGNvbHVtbkZpbHRlcnMpLmZvckVhY2goYyA9PiB7XG4gICAgICBjb25zdCBmaWx0ZXJlZFZhbHVlID0gY29sdW1uRmlsdGVyc1tjXTtcbiAgICAgIGNvbnN0IGNvbHVtbiA9IHRoaXMuZmluZENvbHVtbihjKTtcbiAgICAgIGlmIChmaWx0ZXJlZFZhbHVlICYmIGZpbHRlcmVkVmFsdWUubGVuZ3RoICYmIGNvbHVtbikge1xuICAgICAgICBjb25zdCB7IGZpbHRlcnMgfSA9IGNvbHVtbjtcbiAgICAgICAgdmFsdWVzLnB1c2goe1xuICAgICAgICAgIFtjXTogZmlsdGVyZWRWYWx1ZVxuICAgICAgICAgICAgLm1hcCh2YWx1ZSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGZvdW5kID1cbiAgICAgICAgICAgICAgICBmaWx0ZXJzICYmIGZpbHRlcnMuZmluZChmaWx0ZXIgPT4gU3RyaW5nKGZpbHRlci52YWx1ZSkgPT09IFN0cmluZyh2YWx1ZSkpO1xuICAgICAgICAgICAgICByZXR1cm4gZm91bmQgPyBmb3VuZC50ZXh0IDogdmFsdWU7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmpvaW4oVkFMVUVfU1BMSVQpLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gdmFsdWVzO1xuICB9XG5cbiAgZ2V0VmFsdWUoKSB7XG4gICAgY29uc3QgeyBmaWx0ZXJzIH0gPSB0aGlzLnN0YXRlO1xuICAgIHJldHVybiB0aGlzLmdldENvbHVtbkZpbHRlcnNWYWx1ZXMoKVxuICAgICAgLm1hcCh0aGlzLnRvVmFsdWVTdHJpbmcpXG4gICAgICAuY29uY2F0KGZpbHRlcnMubWFwKGJhclBhaXIpKTtcbiAgfVxuXG4gIGdldElucHV0RmlsdGVyT3B0aW9ucyhpbnB1dFZhbHVlOiBzdHJpbmcpIHtcbiAgICBjb25zdCB7IGNvbHVtbnMsIGRhdGFTb3VyY2UgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qgb3B0aW9uczogUmVhY3RFbGVtZW50PE9wdGlvblByb3BzPltdID0gW107XG4gICAgaWYgKGRhdGFTb3VyY2UgJiYgY29sdW1ucykge1xuICAgICAgY29uc3QgdmFsdWVzOiB7IFt4OiBzdHJpbmddOiBib29sZWFuIH0gPSB7fTtcbiAgICAgIGZpbHRlckJ5SW5wdXRWYWx1ZTxUPihcbiAgICAgICAgZGF0YVNvdXJjZSxcbiAgICAgICAgY29sdW1ucyxcbiAgICAgICAgaW5wdXRWYWx1ZSxcbiAgICAgICAgKHJlY29yZDogVCwgY29sdW1uOiBDb2x1bW5Qcm9wczxUPikgPT4ge1xuICAgICAgICAgIGNvbnN0IHsgZGF0YUluZGV4IH0gPSBjb2x1bW47XG4gICAgICAgICAgaWYgKGRhdGFJbmRleCkge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSAocmVjb3JkIGFzIGFueSlbZGF0YUluZGV4XS50b1N0cmluZygpO1xuICAgICAgICAgICAgaWYgKCF2YWx1ZXNbdmFsdWVdKSB7XG4gICAgICAgICAgICAgIHZhbHVlc1t2YWx1ZV0gPSB0cnVlO1xuICAgICAgICAgICAgICBvcHRpb25zLnB1c2goXG4gICAgICAgICAgICAgICAgPE9wdGlvbiBrZXk9e3ZhbHVlfSB2YWx1ZT17dmFsdWV9PlxuICAgICAgICAgICAgICAgICAge3ZhbHVlfVxuICAgICAgICAgICAgICAgIDwvT3B0aW9uPixcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gb3B0aW9ucztcbiAgfVxuXG4gIGdldE9wdGlvbnMoKSB7XG4gICAgY29uc3QgeyBzdGF0ZSB9ID0gdGhpcztcbiAgICBjb25zdCB7IHNlbGVjdENvbHVtbiwgaW5wdXRWYWx1ZSwgY29sdW1ucywgY2hlY2tlZCwgY29sdW1uRmlsdGVycyB9ID0gc3RhdGU7XG4gICAgaWYgKHNlbGVjdENvbHVtbikge1xuICAgICAgaWYgKGlucHV0VmFsdWUgJiYgaW5wdXRWYWx1ZS5zcGxpdChQQUlSX1NQTElUKVsxXSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHsgZmlsdGVycywgZmlsdGVyTXVsdGlwbGUgfSA9IHNlbGVjdENvbHVtbjtcbiAgICAgIGNvbnN0IGNvbHVtbktleSA9IGdldENvbHVtbktleShzZWxlY3RDb2x1bW4pO1xuICAgICAgaWYgKGZpbHRlcnMpIHtcbiAgICAgICAgcmV0dXJuIGZpbHRlcnNcbiAgICAgICAgICAuZmlsdGVyKGZpbHRlciA9PiAhZmlsdGVyLmNoaWxkcmVuKVxuICAgICAgICAgIC5tYXAoKGZpbHRlciwgaSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBTdHJpbmcoZmlsdGVyLnZhbHVlKTtcbiAgICAgICAgICAgIGxldCB0ZXh0OiBhbnkgPSBmaWx0ZXIudGV4dDtcbiAgICAgICAgICAgIGlmIChmaWx0ZXJNdWx0aXBsZSAmJiBjb2x1bW5LZXkpIHtcbiAgICAgICAgICAgICAgbGV0IF9jaGVja2VkID0gY29sdW1uRmlsdGVyc1tjb2x1bW5LZXldO1xuICAgICAgICAgICAgICBpZiAoX2NoZWNrZWQgJiYgIWNoZWNrZWQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgc3RhdGUuY2hlY2tlZCA9IF9jaGVja2VkLnNsaWNlKCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgX2NoZWNrZWQgPSBjaGVja2VkO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHRleHQgPSBbXG4gICAgICAgICAgICAgICAgPENoZWNrYm94IGtleT1cImNrXCIgY2xhc3NOYW1lPVwibXVsdGlwbGVcIiBjaGVja2VkPXtfY2hlY2tlZC5pbmRleE9mKHZhbHVlKSAhPT0gLTF9IC8+LFxuICAgICAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICA8T3B0aW9uIGtleT17YGZpbHRlci0ke1N0cmluZyhpKX1gfSB2YWx1ZT17dmFsdWV9PlxuICAgICAgICAgICAgICAgIHt0ZXh0fVxuICAgICAgICAgICAgICA8L09wdGlvbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY29uY2F0KFxuICAgICAgICAgICAgZmlsdGVyTXVsdGlwbGUgPyAoXG4gICAgICAgICAgICAgIDxPcHRHcm91cCBrZXk9XCJva1wiPlxuICAgICAgICAgICAgICAgIDxPcHRpb24gdmFsdWU9XCJfX29rX19cIiBjbGFzc05hbWU9e2Ake3RoaXMuZ2V0UHJlZml4Q2xzKCl9LW9rLWJ0bmB9PlxuICAgICAgICAgICAgICAgICAg56Gu6K6kXG4gICAgICAgICAgICAgICAgPC9PcHRpb24+XG4gICAgICAgICAgICAgIDwvT3B0R3JvdXA+XG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICBbXVxuICAgICAgICAgICAgKSxcbiAgICAgICAgICApO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaW5wdXRWYWx1ZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0SW5wdXRGaWx0ZXJPcHRpb25zKGlucHV0VmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB7IGZpbHRlcnMgfSA9IHRoaXMuc3RhdGU7XG4gICAgICBjb25zdCB7IG11bHRpcGxlIH0gPSB0aGlzLnByb3BzO1xuICAgICAgY29uc3QgeyBsZW5ndGggfSA9IGZpbHRlcnM7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuZ2V0Q29sdW1uRmlsdGVyc1ZhbHVlcygpO1xuICAgICAgY29uc3Qga2V5cyA9IHZhbHVlLm1hcChpdGVtID0+IE9iamVjdC5rZXlzKGl0ZW0pWzBdKTtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSBjb2x1bW5zLnJlZHVjZSgob3B0czogYW55W10sIGNvbHVtbiwgaSkgPT4ge1xuICAgICAgICBjb25zdCBrZXkgPSBnZXRDb2x1bW5LZXkoY29sdW1uLCBpKTtcbiAgICAgICAgaWYgKGtleXMuaW5kZXhPZihrZXkgYXMgc3RyaW5nKSA9PT0gLTEgfHwgY29sdW1uLmZpbHRlck11bHRpcGxlKSB7XG4gICAgICAgICAgb3B0cy5wdXNoKFxuICAgICAgICAgICAgPE9wdGlvbiBrZXk9e2Bjb2x1bW4tJHtrZXl9YH0gdmFsdWU9e2tleX0+XG4gICAgICAgICAgICAgIDxzcGFuPntjb2x1bW4uZmlsdGVyVGl0bGUgfHwgY29sdW1uLnRpdGxlfTwvc3Bhbj5cbiAgICAgICAgICAgIDwvT3B0aW9uPixcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvcHRzO1xuICAgICAgfSwgW10pO1xuICAgICAgaWYgKG11bHRpcGxlICYmIChsZW5ndGggPyBmaWx0ZXJzW2xlbmd0aCAtIDFdICE9PSBWQUxVRV9PUiA6IHZhbHVlLmxlbmd0aCkpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICA8T3B0R3JvdXAga2V5PVwib3JcIj5cbiAgICAgICAgICAgIDxPcHRpb24gdmFsdWU9e09QVElPTl9PUn0+T1I8L09wdGlvbj5cbiAgICAgICAgICA8L09wdEdyb3VwPixcbiAgICAgICAgICA8T3B0R3JvdXAga2V5PVwiYWxsXCI+e29wdGlvbnN9PC9PcHRHcm91cD4sXG4gICAgICAgIF07XG4gICAgICB9XG4gICAgICByZXR1cm4gb3B0aW9ucztcbiAgICB9XG4gIH1cblxuICBnZXRDb2x1bW5zV2lkdGhGaWx0ZXJzKHByb3BzID0gdGhpcy5wcm9wcykge1xuICAgIHJldHVybiAocHJvcHMuY29sdW1ucyB8fCBbXSkuZmlsdGVyKGNvbHVtbiA9PiBjb2x1bW4uZmlsdGVycyBpbnN0YW5jZW9mIEFycmF5KTtcbiAgfVxuXG4gIGZpbmRDb2x1bW4obXlLZXk6IHN0cmluZyB8IG51bWJlcikge1xuICAgIGNvbnN0IHsgY29sdW1ucyB9ID0gdGhpcy5zdGF0ZTtcbiAgICByZXR1cm4gY29sdW1ucy5maW5kKGMgPT4gZ2V0Q29sdW1uS2V5KGMpID09PSBteUtleSk7XG4gIH1cblxuICB0b1ZhbHVlU3RyaW5nID0gKGl0ZW06IGFueSkgPT4ge1xuICAgIGNvbnN0IGtleSA9IE9iamVjdC5rZXlzKGl0ZW0pWzBdO1xuICAgIGNvbnN0IGNvbCA9IHRoaXMuZmluZENvbHVtbihrZXkpO1xuICAgIGlmIChjb2wpIHtcbiAgICAgIHJldHVybiBwYWlyVmFsdWUoY29sLCBpdGVtW2tleV0pO1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG4gIH07XG5cbiAgZ2V0Um9vdERvbU5vZGUgPSAoKTogSFRNTEVsZW1lbnQgPT4ge1xuICAgIHJldHVybiAoZmluZERPTU5vZGUodGhpcykgYXMgSFRNTEVsZW1lbnQpLnF1ZXJ5U2VsZWN0b3IoXG4gICAgICBgLiR7Z2V0UHJlZml4Q2xzKCdzZWxlY3QnKX0tc2VhcmNoX19maWVsZGAsXG4gICAgKSBhcyBIVE1MRWxlbWVudDtcbiAgfTtcblxuICBnZXRDb2x1bW5UaXRsZShjb2x1bW46IENvbHVtblByb3BzPFQ+KSB7XG4gICAgY29uc3QgY29sdW1uS2V5ID0gZ2V0Q29sdW1uS2V5KGNvbHVtbik7XG4gICAgaWYgKGNvbHVtbktleSkge1xuICAgICAgcmV0dXJuIGAke3RoaXMuY29sdW1uUmVmc1tjb2x1bW5LZXldLnRleHRDb250ZW50fSR7UEFJUl9TUExJVH1gO1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG4gIH1cbn1cbiJdLCJ2ZXJzaW9uIjozfQ==