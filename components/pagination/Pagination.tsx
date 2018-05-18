import * as React from 'react';
import classNames from 'classnames';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import Select from '../select';
import MiniSelect from './MiniSelect';
import LargeSelect from './LargeSelect';
import RcPagination from '../rc-components/pagination';
import enUS from '../rc-components/pagination/locale/en_US';
import Button from '../button/button';

function getSelect(size?: string) {
  switch (size) {
    case 'small':
      return MiniSelect;
    case 'large':
      return LargeSelect;
    default:
      return Select;
  }
}

function getIcon(type: string) {
  switch (type) {
    case 'first':
      return 'first_page';
    case 'last':
      return 'last_page';
    case 'prev':
      return 'navigate_before';
    case 'next':
      return 'navigate_next';
    default:
      return;
  }
}

function itemRender(page: number, type: string, item: React.ReactNode, disabled: boolean, size?: any) {
  size = size === 'middle' ? 'default' : size;
  if (page !== undefined) {
    if (type === 'page' || type === 'jump-prev' || type === 'jump-next') {
      return <Button size={size} shape="circle">{item}</Button>;
    } else {
      return <Button size={size} shape="circle" icon={getIcon(type)} disabled={disabled} />;
    }
  }
}

export interface PaginationProps {
  total?: number;
  defaultCurrent?: number;
  current?: number;
  defaultPageSize?: number;
  pageSize?: number;
  onChange?: (page: number, pageSize?: number) => void;
  hideOnSinglePage?: boolean;
  showSizeChanger?: boolean;
  pageSizeOptions?: string[];
  onShowSizeChange?: (current: number, size: number) => void;
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => React.ReactNode;
  size?: string;
  simple?: boolean;
  style?: React.CSSProperties;
  locale?: Object;
  className?: string;
  prefixCls?: string;
  selectPrefixCls?: string;
  itemRender?: (page: number, type: 'page' | 'first' | 'last' | 'prev' | 'next' | 'jump-prev' | 'jump-next') => React.ReactNode;
}

export type PaginationLocale = any;

export default class Pagination extends React.Component<PaginationProps, {}> {
  static defaultProps = {
    prefixCls: 'ant-pagination',
    selectPrefixCls: 'ant-select',
    showSizeChanger: true,
    showSizeChangerLabel: true,
    tiny: true,
    pageSizeOptions: ['10', '30', '50', '100', '200'],
    showTotal: (total: number, range: number[]) => `${range[0]} - ${range[1]} / ${total}`,
    sizeChangerOptionText: (value: string) => value,
    itemRender,
  };

  renderPagination = (locale: PaginationLocale) => {
    const { className, size, prefixCls, ...restProps } = this.props;
    return (
      <RcPagination
        {...restProps}
        prefixCls={prefixCls}
        size={size}
        className={classNames(className, { [`${prefixCls}-${size}`]: size })}
        selectComponentClass={getSelect(size)}
        locale={locale}
      />
    );
  };

  render() {
    return (
      <LocaleReceiver
        componentName="Pagination"
        defaultLocale={enUS}
      >
        {this.renderPagination}
      </LocaleReceiver>
    );
  }
}
