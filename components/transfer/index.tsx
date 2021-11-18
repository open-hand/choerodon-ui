import React, { ChangeEvent, Component, CSSProperties, ReactNode, SyntheticEvent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import noop from 'lodash/noop';
import cloneDeep from 'lodash/cloneDeep';
import List, { TransferListProps } from './list';
import Operation from './operation';
import Sort from './sort';
import Search from './search';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import defaultLocale from '../locale-provider/default';
import { TransferDirection } from './enum';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

export { TransferListProps } from './list';
export { TransferOperationProps } from './operation';
export { TransferSearchProps } from './search';

export interface TransferItem {
  key: string;
  title: string;
  description?: string;
  disabled?: boolean;
}

export interface TransferProps {
  prefixCls?: string;
  className?: string;
  dataSource: TransferItem[];
  targetKeys?: string[];
  selectedKeys?: string[];
  render?: (record: TransferItem) => ReactNode;
  onChange?: (targetKeys: string[], direction: string, moveKeys: any) => void;
  onSelectChange?: (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => void;
  style?: CSSProperties;
  listStyle?: CSSProperties;
  titles?: string[];
  operations?: string[] | ReactNode[];
  showSort?: boolean;
  sorts?: string[] | ReactNode[];
  showSearch?: boolean;
  filterOption?: (inputValue: any, item: any) => boolean;
  searchPlaceholder?: string;
  notFoundContent?: ReactNode;
  footer?: (props: TransferListProps) => ReactNode;
  body?: (props: TransferListProps) => ReactNode;
  rowKey?: (record: TransferItem) => string;
  onSearchChange?: (direction: TransferDirection, e: ChangeEvent<HTMLInputElement>) => void;
  lazy?: {} | boolean;
  onScroll?: (direction: TransferDirection, e: SyntheticEvent<HTMLDivElement>) => void;
}

export interface TransferLocale {
  titles: string[];
  notFoundContent: string;
  searchPlaceholder: string;
  itemUnit: string;
  itemsUnit: string;
}

export default class Transfer extends Component<TransferProps, any> {
  static get contextType() {
    return ConfigContext;
  }

  static displayName = 'Transfer';

  static List = List;

  static Operation = Operation;

  static Search = Search;

  static defaultProps = {
    dataSource: [],
    render: noop,
    showSearch: false,
  };

  static propTypes = {
    prefixCls: PropTypes.string,
    dataSource: PropTypes.array,
    render: PropTypes.func,
    targetKeys: PropTypes.array,
    onChange: PropTypes.func,
    listStyle: PropTypes.object,
    className: PropTypes.string,
    titles: PropTypes.array,
    operations: PropTypes.array,
    showSort: PropTypes.bool,
    sorts: PropTypes.array,
    showSearch: PropTypes.bool,
    filterOption: PropTypes.func,
    searchPlaceholder: PropTypes.string,
    notFoundContent: PropTypes.node,
    body: PropTypes.func,
    footer: PropTypes.func,
    rowKey: PropTypes.func,
    lazy: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  };

  context: ConfigContextValue;

  splitedDataSource: {
    leftDataSource: TransferItem[];
    rightDataSource: TransferItem[];
  } | null;

  transferRef: HTMLElement | null = null;

  constructor(props: TransferProps) {
    super(props);

    const { selectedKeys = [], targetKeys = [] } = props;
    this.state = {
      leftFilter: '',
      rightFilter: '',
      sourceSelectedKeys: selectedKeys.filter(key => targetKeys.indexOf(key) === -1),
      targetSelectedKeys: selectedKeys.filter(key => targetKeys.indexOf(key) > -1),
      highlightKey: '',
      sortKeys: null,
    };
  }

  componentWillReceiveProps(nextProps: TransferProps) {
    const { sourceSelectedKeys, targetSelectedKeys } = this.state;
    const { props } = this;

    if (nextProps.targetKeys !== props.targetKeys || nextProps.dataSource !== props.dataSource) {
      // clear cached splited dataSource
      this.splitedDataSource = null;

      if (!nextProps.selectedKeys) {
        // clear key nolonger existed
        // clear checkedKeys according to targetKeys
        const { dataSource, targetKeys = [] } = nextProps;

        const newSourceSelectedKeys: string[] = [];
        const newTargetSelectedKeys: string[] = [];
        dataSource.forEach(({ key }) => {
          if (sourceSelectedKeys.includes(key) && !targetKeys.includes(key)) {
            newSourceSelectedKeys.push(key);
          }
          if (targetSelectedKeys.includes(key) && targetKeys.includes(key)) {
            newTargetSelectedKeys.push(key);
          }
        });
        this.setState({
          sourceSelectedKeys: newSourceSelectedKeys,
          targetSelectedKeys: newTargetSelectedKeys,
        });
      }
    }

    if (nextProps.selectedKeys) {
      const targetKeys = nextProps.targetKeys || [];
      this.setState({
        sourceSelectedKeys: nextProps.selectedKeys.filter(key => !targetKeys.includes(key)),
        targetSelectedKeys: nextProps.selectedKeys.filter(key => targetKeys.includes(key)),
      });
    }
  }

  splitDataSource(sortKeys?: Array<string>) {
    if (this.splitedDataSource) {
      return this.splitedDataSource;
    }

    const { dataSource, rowKey, targetKeys = [] } = this.props;

    const useKeys = sortKeys || targetKeys;

    const leftDataSource: TransferItem[] = [];
    const rightDataSource: TransferItem[] = new Array(useKeys.length);
    dataSource.forEach(record => {
      if (rowKey) {
        record.key = rowKey(record);
      }

      // rightDataSource should be ordered by targetKeys
      // leftDataSource should be ordered by dataSource
      const indexOfKey = useKeys.indexOf(record.key);
      if (indexOfKey !== -1) {
        rightDataSource[indexOfKey] = record;
      } else {
        leftDataSource.push(record);
      }
    });

    this.splitedDataSource = {
      leftDataSource,
      rightDataSource,
    };

    return this.splitedDataSource;
  }

  moveTo = (direction: TransferDirection) => {
    const { targetKeys = [], dataSource = [], onChange } = this.props;
    const { sourceSelectedKeys, targetSelectedKeys } = this.state;
    const moveKeys =
      direction === TransferDirection.right ? sourceSelectedKeys : targetSelectedKeys;
    // filter the disabled options
    const newMoveKeys = moveKeys.filter(
      (key: string) => !dataSource.some(data => !!(key === data.key && data.disabled)),
    );
    // move items to target box
    const newTargetKeys =
      direction === TransferDirection.right
        ? newMoveKeys.concat(targetKeys)
        : targetKeys.filter(targetKey => newMoveKeys.indexOf(targetKey) === -1);

    // empty checked keys
    const oppositeDirection =
      direction === TransferDirection.right ? TransferDirection.left : TransferDirection.right;
    this.setState({
      [this.getSelectedKeysName(oppositeDirection)]: [],
      sortKeys: null,
      highlightKey: '',
    });
    this.handleSelectChange(oppositeDirection, []);

    if (onChange) {
      onChange(newTargetKeys, direction, newMoveKeys);
    }
  };

  sortTo = (direction: TransferDirection) => {
    const { prefixCls: customizePrefixCls } = this.props;
    const { highlightKey } = this.state;
    const { rightDataSource } = this.splitDataSource();

    const mapRightKey = rightDataSource.map(x => x.key);

    const index = mapRightKey.indexOf(highlightKey);
    const cloneMapRightKey = cloneDeep(mapRightKey);

    cloneMapRightKey[index] = cloneMapRightKey.splice(
      index + (direction === TransferDirection.up ? -1 : 1),
      1,
      cloneMapRightKey[index],
    )[0];
    this.splitedDataSource = null;
    this.setState(
      {
        sortKeys: cloneMapRightKey,
      },
      () => {
        // 向下移动位置，滚动条跟随
        if (this.transferRef) {
          const { getPrefixCls } = this.context;
          const prefixCls = getPrefixCls('transfer', customizePrefixCls);
          const selectedCls = `${prefixCls}-list-content-item-highlight`;
          const contentCls = `${prefixCls}-list-content`;
          const selectedDom = this.transferRef.getElementsByClassName(
            selectedCls,
          )[0] as HTMLDivElement;
          const contentDom = this.transferRef.getElementsByClassName(
            contentCls,
          )[1] as HTMLDivElement;
          const offset = selectedDom.offsetTop + selectedDom.offsetHeight;
          if (offset > contentDom.offsetHeight && direction === TransferDirection.down) {
            contentDom.scrollTo({ top: offset - contentDom.offsetHeight });
          }
        }
      },
    );
  };

  moveToLeft = () => this.moveTo(TransferDirection.left);

  moveToRight = () => this.moveTo(TransferDirection.right);

  moveToUp = () => this.sortTo(TransferDirection.up);

  moveToDown = () => this.sortTo(TransferDirection.down);

  handleSelectChange(direction: TransferDirection, holder: string[]) {
    const { onSelectChange } = this.props;
    const { sourceSelectedKeys, targetSelectedKeys } = this.state;
    if (!onSelectChange) {
      return;
    }

    if (direction === TransferDirection.left) {
      onSelectChange(holder, targetSelectedKeys);
    } else {
      onSelectChange(sourceSelectedKeys, holder);
    }
  }

  handleSelectAll = (
    direction: TransferDirection,
    filteredDataSource: TransferItem[],
    checkAll: boolean,
  ) => {
    const {
      state,
      props: { selectedKeys },
    } = this;
    const originalSelectedKeys = state[this.getSelectedKeysName(direction)] || [];
    const currentKeys = filteredDataSource.map(item => item.key);
    // Only operate current keys from original selected keys
    const newKeys1 = originalSelectedKeys.filter((key: string) => currentKeys.indexOf(key) === -1);
    const newKeys2 = [...originalSelectedKeys];
    currentKeys.forEach(key => {
      if (newKeys2.indexOf(key) === -1) {
        newKeys2.push(key);
      }
    });
    const holder = checkAll ? newKeys1 : newKeys2;
    this.handleSelectChange(direction, holder);

    if (!selectedKeys) {
      this.setState({
        [this.getSelectedKeysName(direction)]: holder,
      });
    }
  };

  handleLeftSelectAll = (filteredDataSource: TransferItem[], checkAll: boolean) =>
    this.handleSelectAll(TransferDirection.left, filteredDataSource, checkAll);

  handleRightSelectAll = (filteredDataSource: TransferItem[], checkAll: boolean) =>
    this.handleSelectAll(TransferDirection.right, filteredDataSource, checkAll);

  handleFilter = (direction: TransferDirection, e: ChangeEvent<HTMLInputElement>) => {
    const { onSearchChange } = this.props;
    this.setState({
      // add filter
      [`${direction}Filter`]: e.target.value,
    });
    if (onSearchChange) {
      onSearchChange(direction, e);
    }
  };

  handleLeftFilter = (e: ChangeEvent<HTMLInputElement>) =>
    this.handleFilter(TransferDirection.left, e);

  handleRightFilter = (e: ChangeEvent<HTMLInputElement>) =>
    this.handleFilter(TransferDirection.right, e);

  handleClear = (direction: string) => {
    this.setState({
      [`${direction}Filter`]: '',
    });
  };

  handleLeftClear = () => this.handleClear(TransferDirection.left);

  handleRightClear = () => this.handleClear(TransferDirection.right);

  handleSelect = (direction: TransferDirection, selectedItem: TransferItem, checked: boolean) => {
    const { selectedKeys } = this.props;
    const { sourceSelectedKeys, targetSelectedKeys } = this.state;
    const holder =
      direction === TransferDirection.left ? [...sourceSelectedKeys] : [...targetSelectedKeys];
    const index = holder.indexOf(selectedItem.key);
    if (index > -1) {
      holder.splice(index, 1);
    }
    if (checked) {
      holder.push(selectedItem.key);
    }
    this.handleSelectChange(direction, holder);

    if (!selectedKeys) {
      this.setState({
        [this.getSelectedKeysName(direction)]: holder,
      });
    }
    if (direction === TransferDirection.right) {
      this.setState({
        highlightKey: selectedItem.key,
      });
    }
  };

  handleLeftSelect = (selectedItem: TransferItem, checked: boolean) => {
    return this.handleSelect(TransferDirection.left, selectedItem, checked);
  };

  handleRightSelect = (selectedItem: TransferItem, checked: boolean) => {
    return this.handleSelect(TransferDirection.right, selectedItem, checked);
  };

  handleScroll = (direction: TransferDirection, e: SyntheticEvent<HTMLDivElement>) => {
    const { onScroll } = this.props;
    if (onScroll) {
      onScroll(direction, e);
    }
  };

  handleLeftScroll = (e: SyntheticEvent<HTMLDivElement>) =>
    this.handleScroll(TransferDirection.left, e);

  handleRightScroll = (e: SyntheticEvent<HTMLDivElement>) =>
    this.handleScroll(TransferDirection.right, e);

  getTitles(transferLocale: TransferLocale): string[] {
    const { props } = this;
    if (props.titles) {
      return props.titles;
    }
    return transferLocale.titles;
  }

  getSelectedKeysName(direction: TransferDirection) {
    return direction === TransferDirection.left ? 'sourceSelectedKeys' : 'targetSelectedKeys';
  }

  renderTransfer = (locale: TransferLocale) => {
    const {
      prefixCls: customizePrefixCls,
      className,
      operations = [],
      showSort = false,
      sorts = [],
      showSearch,
      notFoundContent,
      searchPlaceholder,
      body,
      footer,
      listStyle,
      filterOption,
      render,
      lazy,
    } = this.props;
    const { getPrefixCls } = this.context;
    const prefixCls = getPrefixCls('transfer', customizePrefixCls);
    const {
      leftFilter,
      rightFilter,
      sourceSelectedKeys,
      targetSelectedKeys,
      highlightKey,
      sortKeys,
    } = this.state;

    const { leftDataSource, rightDataSource } = this.splitDataSource(sortKeys);
    const leftActive = targetSelectedKeys.length > 0;
    const rightActive = sourceSelectedKeys.length > 0;

    const mapRightKey = rightDataSource.map(x => x.key);
    const upActive = !!highlightKey && mapRightKey.indexOf(highlightKey) !== 0;
    const downActive =
      !!highlightKey && mapRightKey.indexOf(highlightKey) !== mapRightKey.length - 1;
    const cls = classNames(className, prefixCls);

    const titles = this.getTitles(locale);
    return (
      <div
        className={cls}
        ref={dom => {
          this.transferRef = dom;
        }}
      >
        <List
          prefixCls={`${prefixCls}-list`}
          titleText={titles[0]}
          dataSource={leftDataSource}
          filter={leftFilter}
          filterOption={filterOption}
          style={listStyle}
          checkedKeys={sourceSelectedKeys}
          handleFilter={this.handleLeftFilter}
          handleClear={this.handleLeftClear}
          handleSelect={this.handleLeftSelect}
          handleSelectAll={this.handleLeftSelectAll}
          render={render}
          showSearch={showSearch}
          searchPlaceholder={searchPlaceholder || locale.searchPlaceholder}
          notFoundContent={notFoundContent || locale.notFoundContent}
          itemUnit={locale.itemUnit}
          itemsUnit={locale.itemsUnit}
          body={body}
          footer={footer}
          lazy={lazy}
          onScroll={this.handleLeftScroll}
        />
        <Operation
          className={`${prefixCls}-operation`}
          rightActive={rightActive}
          rightArrowText={operations[0]}
          moveToRight={this.moveToRight}
          leftActive={leftActive}
          leftArrowText={operations[1]}
          moveToLeft={this.moveToLeft}
        />
        <List
          prefixCls={`${prefixCls}-list`}
          titleText={titles[1]}
          dataSource={rightDataSource}
          filter={rightFilter}
          filterOption={filterOption}
          style={listStyle}
          checkedKeys={targetSelectedKeys}
          highlightKey={highlightKey}
          handleFilter={this.handleRightFilter}
          handleClear={this.handleRightClear}
          handleSelect={this.handleRightSelect}
          handleSelectAll={this.handleRightSelectAll}
          render={render}
          showSearch={showSearch}
          searchPlaceholder={searchPlaceholder || locale.searchPlaceholder}
          notFoundContent={notFoundContent || locale.notFoundContent}
          itemUnit={locale.itemUnit}
          itemsUnit={locale.itemsUnit}
          body={body}
          footer={footer}
          lazy={lazy}
          onScroll={this.handleRightScroll}
        />
        {!!showSort && (
          <Sort
            className={`${prefixCls}-sort`}
            upActive={upActive}
            upArrowText={sorts[0]}
            moveToUp={this.moveToUp}
            downActive={downActive}
            downArrowText={sorts[1]}
            moveToDown={this.moveToDown}
          />
        )}
      </div>
    );
  };

  render() {
    return (
      <LocaleReceiver componentName="Transfer" defaultLocale={defaultLocale.Transfer}>
        {this.renderTransfer}
      </LocaleReceiver>
    );
  }
}
