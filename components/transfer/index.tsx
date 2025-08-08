import React, { ChangeEvent, Component, CSSProperties, ReactNode, SyntheticEvent } from 'react';
import classNames from 'classnames';
import { computed } from 'mobx';
import noop from 'lodash/noop';
import scrollIntoView from 'scroll-into-view-if-needed';
import { arrayMove } from 'choerodon-ui/pro/lib/data-set/utils';
import List, { TransferListProps } from './list';
import Operation from './operation';
import SortButton from './SortButton';
import Search from './search';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import { getRuntimeLocale } from '../locale-provider/utils';
import { TransferDirection } from './enum';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';
import { ButtonProps } from '../button/Button';
import { InputProps } from '../input/Input';

export { TransferListProps } from './list';
export { TransferOperationProps } from './operation';
export { TransferSearchProps } from './search';
export { TransferDirection };

export interface TransferItem {
  key: string;
  title: string;
  description?: string;
  disabled?: boolean;
}

export interface TransferProps {
  prefixCls?: string;
  checkboxPrefixCls?: string;
  className?: string;
  dataSource: TransferItem[];
  targetKeys?: string[];
  selectedKeys?: string[];
  render?: (record: TransferItem) => ReactNode;
  onChange?: (targetKeys: string[], direction: string, moveKeys: any) => void;
  onSelectChange?: (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => void;
  style?: CSSProperties;
  listStyle?: CSSProperties;
  operationStyle?: CSSProperties;
  titles?: string[];
  operations?: string[] | ReactNode[];
  sortable?: boolean;
  sortOperations?: string[] | ReactNode[];
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
  inputProps?: InputProps;
  buttonProps?: ButtonProps;
}

export interface TransferLocale {
  titles: string[];
  notFoundContent: string;
  searchPlaceholder: string;
  itemUnit: string;
  itemsUnit: string;
}

export default class Transfer extends Component<TransferProps, any> {
  static get contextType(): typeof ConfigContext {
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

  context: ConfigContextValue;

  splitedDataSource: {
    leftDataSource: TransferItem[];
    rightDataSource: TransferItem[];
  } | null = null;

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
      // clear cached separated dataSource
      this.splitedDataSource = null;

      if (!nextProps.selectedKeys) {
        // clear key no longer existed
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

  @computed
  get computedRightDataSource(): TransferItem[] {
    const { filterOption } = this.props;
    const { rightFilter } = this.state;
    const { rightDataSource } = this.splitDataSource();
    if (filterOption && rightFilter) {
      return rightDataSource.filter(opt => filterOption(rightFilter, opt));
    }
    return rightDataSource;
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
    const to = direction === TransferDirection.up ? -1 : 1;
    const { rightDataSource } = this.splitDataSource();

    const mapRightKey = rightDataSource.map(x => x.key);

    const filterRightDataSource: TransferItem[] = this.computedRightDataSource;
    const filterCurrentIndex = filterRightDataSource.findIndex(x => x.key === highlightKey);
    const sourceIndex = rightDataSource.findIndex(x => x.key === highlightKey);
    const moveToOption = filterRightDataSource[filterCurrentIndex + to];
    const moveToIndex = rightDataSource.findIndex(x => x.key === moveToOption.key);

    arrayMove(mapRightKey, sourceIndex, moveToIndex);
    this.splitedDataSource = null;
    this.setState(
      {
        sortKeys: mapRightKey,
      },
      () => {
        // 向下移动位置，滚动条跟随
        if (this.transferRef) {
          const { getPrefixCls } = this.context;
          const prefixCls = getPrefixCls('transfer', customizePrefixCls);
          const selectedCls = `${prefixCls}-list-content-item-highlight`;
          const selectedDom = this.transferRef.getElementsByClassName(
            selectedCls,
          )[0] as HTMLDivElement;
          scrollIntoView(selectedDom, {
            block: 'end',
            behavior: 'smooth',
            scrollMode: 'if-needed',
            boundary: this.transferRef,
          });
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
    if (!onSelectChange) {
      return;
    }

    if (direction === TransferDirection.left) {
      const { targetSelectedKeys } = this.state;
      onSelectChange(holder, targetSelectedKeys);
    } else {
      const { sourceSelectedKeys } = this.state;
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
      sortable = false,
      sortOperations = [],
      showSearch,
      notFoundContent,
      searchPlaceholder,
      body,
      footer,
      style,
      listStyle,
      operationStyle,
      filterOption,
      render,
      lazy,
      buttonProps,
      inputProps,
      checkboxPrefixCls,
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

    const filterRightDataSource: TransferItem[] = this.computedRightDataSource;

    const mapRightKey = filterRightDataSource.map(x => x.key);
    const hasHighlight = !!highlightKey && mapRightKey.indexOf(highlightKey) > -1;
    const upActive = hasHighlight && mapRightKey.indexOf(highlightKey) !== 0;
    const downActive = hasHighlight && mapRightKey.indexOf(highlightKey) !== mapRightKey.length - 1;
    const cls = classNames(className, prefixCls);

    const titles = this.getTitles(locale);
    return (
      <div
        className={cls}
        style={style}
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
          inputProps={inputProps}
          checkboxPrefixCls={checkboxPrefixCls}
        />
        <Operation
          className={`${prefixCls}-operation`}
          rightActive={rightActive}
          rightArrowText={operations[0]}
          moveToRight={this.moveToRight}
          leftActive={leftActive}
          leftArrowText={operations[1]}
          moveToLeft={this.moveToLeft}
          buttonProps={buttonProps}
          style={operationStyle}
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
          inputProps={inputProps}
          checkboxPrefixCls={checkboxPrefixCls}
        />
        {!!sortable && (
          <SortButton
            className={`${prefixCls}-sort`}
            upActive={upActive}
            upArrowText={sortOperations[0]}
            moveToUp={this.moveToUp}
            downActive={downActive}
            downArrowText={sortOperations[1]}
            moveToDown={this.moveToDown}
          />
        )}
      </div>
    );
  };

  render() {
    return (
      <LocaleReceiver componentName="Transfer" defaultLocale={getRuntimeLocale().Transfer || {}}>
        {this.renderTransfer}
      </LocaleReceiver>
    );
  }
}
