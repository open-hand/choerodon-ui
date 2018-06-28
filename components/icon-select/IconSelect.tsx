import * as React from 'react';
import Icon from '../icon';
import Select, { SelectProps } from '../select';
import Pagination from '../pagination';
import Tooltip from '../tooltip';
import classNames from 'classnames';
import omit from 'omit.js';

const Option = Select.Option;
const icons = Icon.icons;

export interface IconSelectProps extends SelectProps {
  prefix?: string;
}
export interface IconSelectState {
  current: number,
  total: number,
  pageSize: number,
  filterValue: string,
  data: any,
}
export default class IconSelect extends React.Component<IconSelectProps, IconSelectState> {
  static defaultProps = {
    prefix: 'ant-icon-select',
    filter: true,
    showArrow: false,
    showCheckAll: false,
  };
  icons: any;
  rcSelect: React.ReactNode | null;
  constructor(props: IconSelectProps) {
    super(props);
    this.state = {
      current: 1,
      total: 0,
      pageSize: 20,
      filterValue: '',
      data: [],
    };
  }

  componentDidMount() {
    this.initIcon();
  }

  initIcon(current: number = 1, pageSize: number = 20, filterValue: string = '') {
    const minIndex = (current - 1) * pageSize;
    const maxIndex = current * pageSize;
    let items = icons.default;
    if (filterValue) {
      items = icons.default.filter((name) => {
        return name.indexOf(filterValue) !== -1;
      });
    }
    const total = items.length || 0;
    const currentData = items.filter((name, index) => {
      return name && index >= minIndex && index < maxIndex;
    });
    this.setState({
      data: currentData,
      total,
      pageSize,
      current,
      filterValue,
    });
  }

  renderOption() {
    const { data } = this.state;
    return data.map((icon: string) => {
      return (
        <Option key={icon} value={icon}>
          <Tooltip placement="bottomLeft" title={icon}>
            <Icon type={icon} /> {icon}
          </Tooltip>
        </Option>
      );
    });
  }

  handleRender = (label: React.ReactElement<any>) => {
    if (typeof label === 'string' && label) {
      return <span><Icon type={label}/> {label}</span>;
    } else if (typeof label === 'object' && label.props) {
      const { children } = label.props;
      return children ? React.cloneElement(<span/>, {}, children) : null;
    } else {
      return null;
    }
  }

  handlePageChange = (current: number, pageSize: number) => {
    const { filterValue } = this.state;
    this.initIcon(current, pageSize, filterValue);
  }

  handleFilter = (value: string) => {
    this.initIcon(1, 20, value);
  }

  saveRef = (node: React.ReactNode) => {
     if (node) {
       this.rcSelect = node;
     }
  }

  renderFooter() {
    const { total, pageSize, current } = this.state;
    return (
      <Pagination
        total={total}
        onChange={this.handlePageChange}
        pageSizeOptions={['20', '40', '80']}
        pageSize={pageSize}
        onShowSizeChange={this.handlePageChange}
        current={current}
      />
    );
  }
  render() {
    const { className, prefix, dropdownClassName } = this.props;
    const selectCls = classNames(className, {
      [`${prefix}`]: true,
    });
    const dropDownCls = classNames(dropdownClassName, {
      [`${prefix}-dropdown`]: true,
    });
    const selectProps = {
      ...this.props,
      className: selectCls,
      dropdownClassName: dropDownCls,
    }
    const otherProps = omit(selectProps, ['prefix']);
    return (
      <Select
        {...otherProps}
        footer={this.renderFooter()}
        onFilterChange={this.handleFilter}
        filterValue={this.state.filterValue}
        choiceRender={this.handleRender}
        filter
        ref={this.saveRef}
      >
        {this.renderOption()}
      </Select>
    );
  }
}
