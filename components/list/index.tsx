// @ts-nocheck
import React, { Children, cloneElement, Component, ReactElement, ReactNode, ReactText } from 'react';
import classNames from 'classnames';
import { action, observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import DataSet from 'choerodon-ui/pro/lib/data-set/DataSet';
import DsRecord from 'choerodon-ui/pro/lib/data-set/Record';
import Pagination from 'choerodon-ui/pro/lib/pagination';
import { TablePaginationConfig } from 'choerodon-ui/pro/lib/table/interface';
import ObserverCheckBox from 'choerodon-ui/pro/lib/check-box';
import { PaginationProps } from 'choerodon-ui/pro/lib/pagination/interface';
import autobind from 'choerodon-ui/pro/lib/_util/autobind';
import { BooleanValue, DataSetEvents } from 'choerodon-ui/pro/lib/data-set/enum';
import { equalTrueValue } from 'choerodon-ui/pro/lib/data-set/utils';
import { getKey } from 'choerodon-ui/pro/lib/tree/util';
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
  defaultSelectedRowKeys?: ReactText[];
  onChange?: (keys: ReactText[]) => void
}

export interface ListProps {
  bordered?: boolean;
  className?: string;
  children?: ReactNode;
  dataSource?: any;
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
  pagination?: TablePaginationConfig | boolean;
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
  rowSelection?: RowSelection | boolean;
}

export interface ListLocale {
  emptyText: string;
}

@observer
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

  @observable stateCheckedKeys: ReactText[];

  @observable paginationCurrent: number;

  defaultPaginationProps = {
    page: 1,
    pageSize: 10,
    onChange: (page: number, pageSize: number) => {
      const { pagination } = this.props;
      this.paginationCurrent = page;
      if (pagination && pagination.onChange) {
        pagination.onChange(page, pageSize);
      }
    },
    total: 0,
  };

  private keys: { [key: string]: string } = {};

  get rowSelectionKeys(): ReactText[] | undefined {
    const { rowSelection } = this.props;
    if (rowSelection && typeof rowSelection === 'object') {
      const { selectedRowKeys, defaultSelectedRowKeys} = rowSelection;
      return selectedRowKeys || defaultSelectedRowKeys;
    }
  }

  get checkedKeys(): ReactText[] {
    const { dataSet } = this.props;
    if (dataSet) {
      const { checkField, primaryKey } = dataSet.props;
      if (checkField) {
        const keys: string[] = [];
        const field = dataSet.getField(checkField);
        dataSet.forEach(record => {
          const key = getKey(record, primaryKey);
          if (equalTrueValue((field ? field.get(BooleanValue.trueValue, record) : true), record.get(checkField))) {
            keys.push(key);
          }
        });
        return keys;
      }
      return dataSet.selected.map(selected => String(primaryKey ? selected.get(primaryKey) : selected.id));
    }
    return this.rowSelectionKeys || this.stateCheckedKeys || [];
  }

  get paginationProps() {
    const { dataSet, dataSource, pagination } = this.props;
    const { pageSize, ...otherProps } = this.defaultPaginationProps;
    const paginationProps = {
      ...otherProps,
      ...pagination || {},
      total: dataSet ? dataSet.totalCount : dataSource.length,
      page: (dataSet && dataSet.paging) ? dataSet.currentPage : (this.paginationCurrent || 1),
      pageSize: (dataSet && dataSet.paging) ? dataSet.pageSize : (pagination && pagination.pageSize || pageSize),
    };
    return paginationProps;
  }

  componentWillMount() {
    this.handleDataSetLoad();
    this.processDataSetListener(true);
    runInAction(() => {
      this.stateCheckedKeys = [];
    })
  }

  componentWillUnmount() {
    this.processDataSetListener(false);
  }

  @autobind
  handleDataSetLoad() {
    this.initDefaultCheckRows();
  }

  processDataSetListener(flag: boolean) {
    const { dataSet } = this.props;
    if (dataSet) {
      const handler = flag ? dataSet.addEventListener : dataSet.removeEventListener;
      handler.call(dataSet, DataSetEvents.load, this.handleDataSetLoad);
    }
  }

  @action
  initDefaultCheckRows() {
    const {
      props: {
        dataSet,
      },
    } = this;
    if (dataSet && dataSet.selection) {
      const { checkField } = dataSet.props;
      if (checkField) {
        const field = dataSet.getField(checkField);
        dataSet.forEach(record => {
          if (equalTrueValue((field ? field.get(BooleanValue.trueValue, record) : true), record.get(checkField))) {
            record.isSelected = true;
          }
        });
      }
    }
  }

  getContextValue() {
    const { grid } = this.props;
    const { getPrefixCls } = this.context;
    return {
      grid,
      getPrefixCls,
    };
  }

  renderItem = (item: ReactElement<any> | DsRecord, index: number) => {
    const { renderItem, rowKey, dataSet } = this.props;
    let key;

    if (typeof rowKey === 'function') {
      key = rowKey(item);
    } else if (typeof rowKey === 'string') {
      key = dataSet ? (item as DsRecord).get(rowKey) : item[rowKey];
    } else {
      key = item.key;
    }

    if (!key) {
      key = `list-item-${index}`;
    }

    this.keys[index] = key;

    if (dataSet) {
      return renderItem({ dataSet, record: item, index: dataSet.indexOf(item as DsRecord) });
    }
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

  @action
  updateStateKey(value, key) {
    if (value && !this.stateCheckedKeys.includes(key!)) {
      this.stateCheckedKeys = [...this.stateCheckedKeys, key]
    } else if (!value) {
      this.stateCheckedKeys = this.stateCheckedKeys.filter(x => x !== key)
    }
    return this.stateCheckedKeys;
  }

  handleChange(value, key) {
    const { rowSelection, dataSet } = this.props;
    if (dataSet && dataSet.selection) {
      const { primaryKey } = dataSet.props;
      dataSet.forEach(record => {
        if (getKey(record, primaryKey) === key) {
          if (!record.isSelected) {
            dataSet.select(record);
          } else {
            dataSet.unSelect(record);
          }
        }
      });
      return;
    }
    if (rowSelection) {
      if (typeof rowSelection === 'object') {
        const { selectedRowKeys, onChange = noop } = rowSelection;
        let resultKeys: ReactText[] = []
        if (selectedRowKeys) {
          if (value && !selectedRowKeys.includes(key!)) {
            resultKeys = [...selectedRowKeys, key];
          } else if (!value) {
            resultKeys = selectedRowKeys.filter(x => x !== key);
          }
          onChange(resultKeys);
          return;
        }
        const newKeys = this.updateStateKey(value, key);
        onChange(newKeys);
        
      } else if (typeof rowSelection === 'boolean') {
        this.updateStateKey(value, key);
      }
    }
  }

  renderCheckBox(key) {
    const { rowSelection, dataSet } = this.props;

    const checkboxWrapper = () => {
      const isChecked = this.checkedKeys.includes(key);
      return {
        element: () => (
          <div className={`${this.getPrefixCls()}-selection-checkbox`}>
            <ObserverCheckBox
              name="ckBox"
              value={key}
              onChange={(val) => this.handleChange(val, key)}
              checked={isChecked}
            />
          </div>
        ),
        isChecked,
      }
    }

    if (dataSet) {
      if (dataSet.selection) {
        return checkboxWrapper();
      }
      return undefined;
    }
    if (rowSelection) {
      return checkboxWrapper();
    }
    return undefined;
  }

  render() {
    const {
      paginationProps: { pageSize, page, total, position, onChange = noop },
      props: {
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
      },
    } = this;
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

    
    const largestPage = Math.ceil(
      total / pageSize,
    );
    if (page > largestPage) {
      this.paginationProps.page = largestPage;
    }
    const isDsPagination = (dataSet && dataSet.paging);
    const paginationContent = pagination ? (
      <div className={`${prefixCls}-pagination`}>
        <Pagination
          {...this.paginationProps}
          onChange={onChange}
          dataSet={isDsPagination ? dataSet : undefined}
        />
      </div>
    ) : null;

    let splitDataSource = dataSet ? dataSet.records : [...dataSource];
    if (pagination && pageSize) {
      if (
        !dataSet &&
        dataSource.length > (page - 1) * pageSize
      ) {
        splitDataSource = [...dataSource].splice(
          (page - 1) * pageSize,
          pageSize,
        );
      } else if (dataSet && !dataSet.paging) {
        splitDataSource = dataSet.slice(
          (page - 1) * pageSize,
          pageSize * page,
        )
      }
    }

    let childrenContent;
    childrenContent = isLoading && <div style={{ minHeight: 53 }} />;
    if (splitDataSource.length > 0) {
      const items = splitDataSource.map((item: any, index: number) => this.renderItem(item, index));
      const childrenList = Children.map(items, (child: any, index) => {
        const recordKey = this.keys[index];
        return cloneElement(child, {
          key: recordKey,
          renderCheckBox: this.renderCheckBox(recordKey),
        });
      });

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

    const paginationPosition = position || 'bottom';

    const content = (
      <Spin prefixCls={spinPrefixCls} {...loadingProp}>
        {childrenContent}
        {children}
      </Spin>
    );

    return (
      <ListContextProvider {...this.getContextValue()}>
        <div className={classString} {...omit(rest, ['prefixCls', 'rowKey', 'renderItem', 'selectable', 'renderItem', 'locale', 'rowSelection'])}>
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
