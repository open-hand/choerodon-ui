import React, { Children, cloneElement, Component, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import omit from 'lodash/omit';
import Spin, { SpinProps } from '../spin';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import defaultLocale from '../locale-provider/default';
import { Size } from '../_util/enum';
import Pagination, { PaginationProps } from '../pagination';
import { Row } from '../grid';
import Item from './Item';
import { ListContextProvider } from './ListContext';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

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
  paginationProps?: PaginationProps;
  pagination?: any;
  prefixCls?: string;
  rowPrefixCls?: string;
  spinPrefixCls?: string;
  rowKey?: any;
  renderItem: any;
  size?: Size;
  split?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  empty?: ReactNode;
  locale?: Record<string, any>;
}

export interface ListLocale {
  emptyText: string;
}

export default class List extends Component<ListProps> {
  static displayName = 'List';

  static Item: typeof Item = Item;

  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static defaultProps = {
    dataSource: [],
    bordered: false,
    split: true,
    loading: false,
    pagination: false,
  };

  context: ConfigContextValue;

  state = {
    paginationCurrent: 1,
  };

  defaultPaginationProps = {
    current: 1,
    pageSize: 10,
    onChange: (page: number, pageSize: number) => {
      const { pagination } = this.props;
      this.setState({
        paginationCurrent: page,
      });
      if (pagination && pagination.onChange) {
        pagination.onChange(page, pageSize);
      }
    },
    total: 0,
  };

  private keys: { [key: string]: string } = {};

  getContextValue() {
    const { grid } = this.props;
    const { getPrefixCls } = this.context;
    return {
      grid,
      getPrefixCls,
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

  isSomethingAfterLastItem() {
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
    const { getPrefixCls } = this.context;
    return getPrefixCls('list', prefixCls);
  }

  render() {
    const { paginationCurrent } = this.state;
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
      rowPrefixCls,
      spinPrefixCls,
      paginationProps: propsPaginationProps,
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
      [`${prefixCls}-something-after-last-item`]: this.isSomethingAfterLastItem(),
    });

    const paginationProps = {
      ...this.defaultPaginationProps,
      ...propsPaginationProps,
      total: dataSource.length,
      current: paginationCurrent,
      ...pagination || {},
    };

    const largestPage = Math.ceil(
      paginationProps.total / paginationProps.pageSize,
    );
    if (paginationProps.current > largestPage) {
      paginationProps.current = largestPage;
    }
    const paginationContent = pagination ? (
      <div className={`${prefixCls}-pagination`}>
        <Pagination
          {...paginationProps}
          onChange={this.defaultPaginationProps.onChange}
        />
      </div>
    ) : null;

    let splitDataSource = [...dataSource];
    if (pagination) {
      if (
        dataSource.length >
        (paginationProps.current - 1) * paginationProps.pageSize
      ) {
        splitDataSource = [...dataSource].splice(
          (paginationProps.current - 1) * paginationProps.pageSize,
          paginationProps.pageSize,
        );
      }
    }

    let childrenContent;
    childrenContent = isLoading && <div style={{ minHeight: 53 }} />;
    if (splitDataSource.length > 0) {
      const items = splitDataSource.map((item: any, index: number) => this.renderItem(item, index));
      const childrenList = Children.map(items, (child: any, index) =>
        cloneElement(child, {
          key: this.keys[index],
        }),
      );

      childrenContent = grid ? <Row prefixCls={rowPrefixCls} gutter={grid.gutter}>{childrenList}</Row> : childrenList;
    } else if (!children && !isLoading && !empty) {
      childrenContent = (
        <LocaleReceiver componentName="Table" defaultLocale={defaultLocale.Table}>
          {this.renderEmpty}
        </LocaleReceiver>
      );
    } else {
      childrenContent = empty;
    }

    const paginationPosition = paginationProps.position || 'bottom';

    const content = (
      <Spin prefixCls={spinPrefixCls} {...loadingProp}>
        {childrenContent}
        {children}
      </Spin>
    );

    return (
      <ListContextProvider {...this.getContextValue()}>
        <div className={classString} {...omit(rest, ['prefixCls', 'rowKey', 'renderItem', 'selectable', 'rowKey', 'renderItem', 'locale'])}>
          {(paginationPosition === 'top' || paginationPosition === 'both') && paginationContent}
          {header && <div className={`${prefixCls}-header`}>{header}</div>}
          {content}
          {footer && <div className={`${prefixCls}-footer`}>{footer}</div>}
          {loadMore || (paginationPosition === 'bottom' || paginationPosition === 'both') && paginationContent}
        </div>
      </ListContextProvider>
    );
  }
}
