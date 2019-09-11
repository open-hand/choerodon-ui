import React, { Component, CSSProperties, ReactNode } from 'react';
import classNames from 'classnames';
import { Size } from '../_util/enum';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import Select from '../select';
import MiniSelect from './MiniSelect';
import LargeSelect from './LargeSelect';
import RcPagination from '../rc-components/pagination';
import enUS from '../rc-components/pagination/locale/en_US';
import Button from '../button/Button';
import { getPrefixCls } from '../configure';

function getSelect(size?: Size) {
  switch (size) {
    case Size.small:
      return MiniSelect;
    case Size.large:
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
  }
}

function itemRender(page: number, type: string, item: ReactNode, disabled: boolean, size?: Size) {
  if (page !== undefined) {
    if (type === 'page' || type === 'jump-prev' || type === 'jump-next') {
      return (
        <Button size={size} shape="circle">
          {item}
        </Button>
      );
    }
    return <Button size={size} shape="circle" icon={getIcon(type)} disabled={disabled} />;
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
  showTotal?: (total: number, range: [number, number]) => ReactNode;
  size?: Size;
  simple?: boolean;
  style?: CSSProperties;
  locale?: Object;
  className?: string;
  prefixCls?: string;
  selectPrefixCls?: string;
  itemRender?: (
    page: number,
    type: 'page' | 'first' | 'last' | 'prev' | 'next' | 'jump-prev' | 'jump-next',
  ) => ReactNode;
}

export type PaginationLocale = any;

export default class Pagination extends Component<PaginationProps, {}> {
  static displayName = 'Pagination';

  static defaultProps = {
    showSizeChanger: true,
    showSizeChangerLabel: true,
    tiny: true,
    pageSizeOptions: ['10', '30', '50', '100', '200'],
    showTotal: (total: number, range: number[]) => `${range[0]} - ${range[1]} / ${total}`,
    sizeChangerOptionText: (value: string) => value,
    itemRender,
  };

  renderPagination = (locale: PaginationLocale) => {
    const {
      className,
      size,
      prefixCls: customizePrefixCls,
      selectPrefixCls: customizeSelectPrefixCls,
      ...restProps
    } = this.props;
    const prefixCls = getPrefixCls('pagination', customizePrefixCls);
    const selectPrefixCls = getPrefixCls('select', customizeSelectPrefixCls);
    return (
      <RcPagination
        {...restProps}
        selectPrefixCls={selectPrefixCls}
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
      <LocaleReceiver componentName="Pagination" defaultLocale={enUS}>
        {this.renderPagination}
      </LocaleReceiver>
    );
  }
}
