import React, { Children, cloneElement, Component, ReactElement, ReactNode } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import omit from 'lodash/omit';
import Spin, { SpinProps } from '../spin';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import defaultLocale from '../locale-provider/default';
import { Size } from '../_util/enum';
import Pagination from '../pagination';
import { Row } from '../grid';
import Item from './Item';
import { getPrefixCls } from '../configure';

export { ListItemProps, ListItemMetaProps } from './Item';

export type ColumnCount = 1 | 2 | 3 | 4 | 6 | 8 | 12 | 24;

export type ColumnType = 'gutter' | 'column' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export interface ListGridType {
  gutter?: number;
  column?: ColumnCount;
  xs?: ColumnCount;
  sm?: ColumnCount;
  md?: ColumnCount;
  lg?: ColumnCount;
  xl?: ColumnCount;
  xxl?: ColumnCount;
}

export interface ListProps {
  bordered?: boolean;
  className?: string;
  children?: ReactNode;
  dataSource: any;
  extra?: ReactNode;
  grid?: ListGridType;
  id?: string;
  itemLayout?: string;
  loading?: boolean | SpinProps;
  loadMore?: ReactNode;
  pagination?: any;
  prefixCls?: string;
  rowKey?: any;
  renderItem: any;
  size?: Size;
  split?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  empty?: ReactNode;
  locale?: Object;
}

export interface ListLocale {
  emptyText: string;
}

export default class List extends Component<ListProps> {
  static displayName = 'List';

  static Item: typeof Item = Item;

  static childContextTypes = {
    grid: PropTypes.any,
  };

  static defaultProps = {
    dataSource: [],
    bordered: false,
    split: true,
    loading: false,
    pagination: false,
  };

  private keys: { [key: string]: string } = {};

  getChildContext() {
    const { grid } = this.props;
    return {
      grid,
    };
  }

  renderItem = (item: ReactElement<any>, index: number) => {
    const { dataSource, renderItem, rowKey } = this.props;
    let key;

    if (typeof rowKey === 'function') {
      key = rowKey(dataSource[index]);
    } else if (typeof rowKey === 'string') {
      key = dataSource[rowKey];
    } else {
      key = dataSource.key;
    }

    if (!key) {
      key = `list-item-${index}`;
    }

    this.keys[index] = key;

    return renderItem(item, index);
  };

  isSomethingAfterLastTtem() {
    const { loadMore, pagination, footer } = this.props;
    return !!(loadMore || pagination || footer);
  }

  renderEmpty = (contextLocale: ListLocale) => {
    const { props } = this;
    const locale = { ...contextLocale, ...props.locale };
    return <div className={`${this.getPrefixCls()}-empty-text`}>{locale.emptyText}</div>;
  };

  getPrefixCls() {
    const { prefixCls } = this.props;
    return getPrefixCls('list', prefixCls);
  }

  render() {
    const {
      bordered,
      split,
      className,
      children,
      itemLayout,
      loadMore,
      pagination,
      grid,
      dataSource,
      size,
      header,
      footer,
      empty,
      loading,
      ...rest
    } = this.props;
    const prefixCls = this.getPrefixCls();
    let loadingProp = loading;
    if (typeof loadingProp === 'boolean') {
      loadingProp = {
        spinning: loadingProp,
      };
    }
    const isLoading = loadingProp && loadingProp.spinning;

    // large => lg
    // small => sm
    let sizeCls = '';
    switch (size) {
      case Size.large:
        sizeCls = 'lg';
        break;
      case Size.small:
        sizeCls = 'sm';
        break;
      default:
    }

    const classString = classNames(prefixCls, className, {
      [`${prefixCls}-vertical`]: itemLayout === 'vertical',
      [`${prefixCls}-${sizeCls}`]: sizeCls,
      [`${prefixCls}-split`]: split,
      [`${prefixCls}-bordered`]: bordered,
      [`${prefixCls}-loading`]: isLoading,
      [`${prefixCls}-grid`]: grid,
      [`${prefixCls}-something-after-last-item`]: this.isSomethingAfterLastTtem(),
    });

    const paginationContent = (
      <div className={`${prefixCls}-pagination`}>
        <Pagination {...pagination} />
      </div>
    );

    let childrenContent;
    childrenContent = isLoading && <div style={{ minHeight: 53 }} />;
    if (dataSource.length > 0) {
      const items = dataSource.map((item: any, index: number) => this.renderItem(item, index));
      const childrenList = Children.map(items, (child: any, index) =>
        cloneElement(child, {
          key: this.keys[index],
        }),
      );

      childrenContent = grid ? <Row gutter={grid.gutter}>{childrenList}</Row> : childrenList;
    } else if (!children && !isLoading && !empty) {
      childrenContent = (
        <LocaleReceiver componentName="Table" defaultLocale={defaultLocale.Table}>
          {this.renderEmpty}
        </LocaleReceiver>
      );
    } else {
      childrenContent = empty;
    }

    const content = (
      <div>
        <Spin {...loadingProp}>{childrenContent}</Spin>
        {loadMore}
        {!loadMore && pagination ? paginationContent : null}
      </div>
    );

    return (
      <div className={classString} {...omit(rest, ['prefixCls', 'rowKey', 'renderItem'])}>
        {header && <div className={`${prefixCls}-header`}>{header}</div>}
        {content}
        {children}
        {footer && <div className={`${prefixCls}-footer`}>{footer}</div>}
      </div>
    );
  }
}
