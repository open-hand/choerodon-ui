import React, { Component, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import omit from 'lodash/omit';
import { icons } from 'choerodon-ui-font';
import Icon from '../icon';
import Select, { SelectProps } from '../select';
import Pagination from '../pagination';
import Tooltip from '../tooltip';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

const Option = Select.Option;

export interface IconSelectProps extends SelectProps {
  prefixCls?: string;
  showAll?: boolean;
}

export interface IconSelectState {
  current: number;
  total: number;
  pageSize: number;
  filterValue: string;
  data: any;
}

export default class IconSelect extends Component<IconSelectProps, IconSelectState> {
  static displayName = 'IconSelect';

  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static defaultProps = {
    filter: true,
    showArrow: false,
    showCheckAll: false,
    showAll: false,
  };

  context: ConfigContextValue;

  icons: any;

  rcSelect: ReactNode | null;

  constructor(props: IconSelectProps, context: ConfigContextValue) {
    super(props, context);
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

  initIcon(current = 1, pageSize = 20, filterValue = '') {
    const { showAll } = this.props;
    const minIndex = (current - 1) * pageSize;
    const maxIndex = current * pageSize;
    let items;
    if (showAll) {
      items = icons.default;
      if (filterValue) {
        items = icons.favorite.filter(name => {
          return name.toLowerCase().indexOf(filterValue.toLowerCase()) !== -1;
        });
      }
    } else {
      items = icons.favorite;
      if (filterValue) {
        items = icons.favorite.filter(name => {
          return name.toLowerCase().indexOf(filterValue.toLowerCase()) !== -1;
        });
      }
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
            <Icon type={icon} />
            <span className="text">{icon}</span>
          </Tooltip>
        </Option>
      );
    });
  }

  handleRender = (label: ReactElement<any>) => {
    if (typeof label === 'string' && label) {
      return (
        <span>
          <Icon type={label} /> {label}
        </span>
      );
    }
    if (typeof label === 'object' && label.props) {
      const { children } = label.props;
      return children ? <span>{children}</span> : null;
    }
    return null;
  };

  handlePageChange = (current: number, pageSize: number) => {
    const { filterValue } = this.state;
    this.initIcon(current, pageSize, filterValue);
  };

  handleFilter = (value: string) => {
    this.initIcon(1, 20, value);
  };

  saveRef = (node: ReactNode) => {
    if (node) {
      this.rcSelect = node;
    }
  };

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
    const { className, prefixCls: customizePrefixCls, dropdownClassName } = this.props;
    const { filterValue } = this.state;
    const { getPrefixCls } = this.context;
    const prefixCls = getPrefixCls('icon-select', customizePrefixCls);
    const selectCls = classNames(className, prefixCls);
    const dropDownCls = classNames(dropdownClassName, `${prefixCls}-dropdown`);
    const selectProps = {
      ...this.props,
      className: selectCls,
      dropdownClassName: dropDownCls,
    };
    const otherProps = omit(selectProps, ['prefixCls']);
    return (
      <Select
        {...otherProps}
        footer={this.renderFooter()}
        onFilterChange={this.handleFilter}
        filterValue={filterValue}
        choiceRender={this.handleRender}
        filter
        ref={this.saveRef}
      >
        {this.renderOption()}
      </Select>
    );
  }
}
