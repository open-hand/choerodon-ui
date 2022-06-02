import React, { Children, cloneElement, ReactElement, ReactNode, ReactText } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import omit from 'lodash/omit';
import DataSetComponent from 'choerodon-ui/pro/lib/data-set/DataSetComponent';
import DataSet from 'choerodon-ui/pro/lib/data-set/DataSet';
import DsRecord from 'choerodon-ui/pro/lib/data-set/Record';
import Pagination from 'choerodon-ui/pro/lib/pagination';
import { PaginationProps } from 'choerodon-ui/pro/lib/pagination/interface';
import Spin, { SpinProps } from '../spin';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import defaultLocale from '../locale-provider/default';
import { Size } from '../_util/enum';
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

export interface RowSelection {
  selectedRowKeys?: ReactText[];
  onChange?: (keys: ReactText[]) => void
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
  paginationProps?: PaginationProps & {
    current?: number,
    defaultCurrent?: number,
    defaultPageSize?: number,
    tiny?: boolean,
    size?: string,
    onShowSizeChange?: Function;
  };
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
  dataSet?: DataSet;
  rowSelection?: RowSelection;
}

export interface ListLocale {
  emptyText: string;
}

@observer
export default class List extends DataSetComponent<ListProps> {
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
    page: 1,
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

  selectionDataSet = new DataSet({
    fields: [
      { name: 'ckBox', multiple: true },
    ],
    data: [{ ckBox: [] }],
    events: {
      update: ({ value }) => {
        const { rowSelection } = this.props;
        if (rowSelection && rowSelection.onChange) {
          rowSelection.onChange(value);
          this.forceUpdate();
        }
      },
    },
  })

  componentDidMount(): void {
    const { rowSelection } = this.props;
    if (rowSelection && rowSelection.selectedRowKeys) {
      this.selectionDataSet.loadData([{ ckBox: [...rowSelection.selectedRowKeys] }])
    }
  }

  getContextValue() {
    const { grid, rowSelection } = this.props;
    const { getPrefixCls } = this.context;
    return {
      grid,
      rowSelection,
      getPrefixCls,
      selectionDataSet: rowSelection ? this.selectionDataSet : undefined,
    };
  }

  renderItem = (item: ReactElement<any> | DsRecord, index: number) => {
    const { dataSource, renderItem, rowKey, dataSet } = this.props;
    if (dataSet) {
      return renderItem({ dataSet, record: item, index });
    }
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
      dataSet,
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
      ...pagination || {},
      total: dataSet ? dataSet.totalCount : dataSource.length,
      page: (dataSet && dataSet.paging) ? dataSet.currentPage : paginationCurrent,
      pageSize: (dataSet && dataSet.paging) ? dataSet.pageSize : pagination.pageSize,
    };

    const largestPage = Math.ceil(
      paginationProps.total / paginationProps.pageSize,
    );
    if (paginationProps.page > largestPage) {
      paginationProps.page = largestPage;
    }
    const isDsPagination = (dataSet && dataSet.paging);
    const paginationContent = pagination ? (
      <div className={`${prefixCls}-pagination`}>
        <Pagination
          {...paginationProps}
          onChange={!isDsPagination ? this.defaultPaginationProps.onChange : paginationProps.onChange}
          dataSet={isDsPagination ? dataSet : undefined}
        />
      </div>
    ) : null;

    let splitDataSource = dataSet ? dataSet.records : [...dataSource];
    if (pagination) {
      if (
        !dataSet &&
        dataSource.length >
        (paginationProps.page - 1) * paginationProps.pageSize
      ) {
        splitDataSource = [...dataSource].splice(
          (paginationProps.page - 1) * paginationProps.pageSize,
          paginationProps.pageSize,
        );
      } else if (dataSet && !dataSet.paging) {
        splitDataSource = dataSet.slice(
          (paginationProps.page - 1) * paginationProps.pageSize,
          paginationProps.pageSize * paginationProps.page,
        )
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
