import React, { Key, ReactNode } from 'react';
import classNames from 'classnames';
import { action, computed, observable, runInAction, isArrayLike } from 'mobx';
import { observer } from 'mobx-react';
import isNil from 'lodash/isNil';
import Tree, { TreeProps } from 'choerodon-ui/lib/tree';
import { Size } from 'choerodon-ui/lib/_util/enum';
import Spin from '../spin';
import TreeNode from './TreeNode';
import { DISABLED_FIELD, isSearchTextEmpty, MORE_KEY, Select, SelectProps } from '../select/Select';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import normalizeTreeNodes from './normalizeTreeNodes';
import autobind from '../_util/autobind';
import isIE from '../_util/isIE';
import { defaultRenderer } from '../tree';
import { getTreeNodes } from '../tree/util';
import { preventDefault } from '../_util/EventManager';
import { CheckedStrategy } from '../data-set/enum';

export interface TreeSelectProps extends SelectProps {
  treeCheckable?: boolean;
  treeDefaultExpandAll?: boolean;
  treeDefaultExpandedKeys?: Key[];
  async?: boolean;
  loadData?: (node) => Promise<any>;
  showCheckedStrategy?: CheckedStrategy;
  /** checkable状态下节点选择完全受控（父子节点选中状态不再关联） */
  checkStrictly?: boolean;
}

function recordIsDisabled(record: Record): boolean {
  return record.get(DISABLED_FIELD) || (record.get('__treeNodeProps') && record.get('__treeNodeProps').disableCheckbox);
}

@observer
export default class TreeSelect extends Select<TreeSelectProps> {
  static displayName = 'TreeSelect';

  static defaultProps = {
    ...Select.defaultProps,
    suffixCls: 'tree-select',
    dropdownMatchSelectWidth: false,
    showCheckedStrategy: 'SHOW_ALL',
    reverse: false,
  };

  static TreeNode = TreeNode;

  @observable expandedKeys: string[] | undefined;

  @computed
  get parentField(): string {
    return this.getProp('parentField') || 'parentValue';
  }

  @computed
  get idField(): string {
    return this.getProp('idField') || this.valueField;
  }

  @computed
  get options(): DataSet {
    const {
      field,
      textField,
      valueField,
      idField,
      parentField,
      multiple,
      observableProps: { children, options },
      getContextConfig,
    } = this;
    return (
      options ||
      (field && field.getOptions(this.record)) ||
      normalizeTreeNodes({
        textField,
        valueField,
        disabledField: DISABLED_FIELD,
        parentField,
        idField,
        multiple,
        children,
        getConfig: getContextConfig as any,
      })
    );
  }

  @computed
  get treeData() {
    return this.optionsWithCombo.filter(r => !r.parent);
  }

  @computed
  get selectedKeys(): Key[] {
    const { idField } = this;
    return this.options.reduce<Key[]>((array, r) => this.isSelected(r) ? array.concat(String(r.get(idField))) : array, []);
  }

  get checkStrictly(): boolean | undefined {
    const { dataSet, checkStrictly } = this.props;
    if (dataSet && !isNil(dataSet.props.treeCheckStrictly)) {
      return dataSet.props.treeCheckStrictly;
    }
    return checkStrictly;
  }

  @action
  handleSearch(text?: string | string[] | undefined) {
    if (!isSearchTextEmpty(text)) {
      const { options } = this;
      const { idField } = options.props;
      this.expandedKeys = options.map((r) => String(r.get(idField)));
    }
  }

  @autobind
  @action
  handleExpand(keys) {
    this.expandedKeys = keys;
  }

  @computed
  get multiple(): boolean {
    return !!this.getProp('multiple') || !!this.props.treeCheckable;
  }

  @autobind
  handleTreeSelect(_e, { node }) {
    const { record, disabled, key } = node;
    if (key === MORE_KEY) {
      const { options } = this;
      runInAction(() => {
        this.moreQuerying = true;
        options.queryMore(options.currentPage + 1)
          .finally(() => {
            runInAction(() => this.moreQuerying = false);
          });
      });
    } else if (!disabled) {
      const { multiple } = this;
      if (multiple) {
        if (this.isSelected(record)) {
          this.unChoose(record);
        } else {
          this.choose(record);
        }
      } else {
        this.choose(record);
      }
    }
  }

  @autobind
  handleTreeCheck(_e, { node }) {
    const { record, disabled, key, disableCheckbox } = node;
    const { checkStrictly } = this;
    if (key === MORE_KEY) {
      const { options } = this;
      runInAction(() => {
        this.moreQuerying = true;
        options.queryMore(options.currentPage + 1)
          .finally(() => {
            runInAction(() => this.moreQuerying = false);
          });
      });
    } else if (!disabled && !disableCheckbox) {
      const { multiple } = this;
      if (multiple) {
        if (checkStrictly) {
          if (this.isSelected(record)) {
            this.unChoose(record);
          } else {
            this.choose(record);
          }
          return;
        }
        const disabledChildRecords: Record[] = [];
        // 未选择且未禁用（祖先也未禁用，根祖先为record）的子节点（包含自己）
        const records = (record as Record).treeReduce((array, r) => {
          if (recordIsDisabled(r)) {
            disabledChildRecords.push(r);
            return array;
          }
          return this.isSelected(r) || r.parents.some(parent => disabledChildRecords.includes(parent)) ? array : array.concat(r);
        }, [] as Record[]);
        // 仅差一个子级未选择的祖先节点；或者是子级全部选择的祖先节点
        const parents: Record[] = [];
        (record as Record).parents.every((parent, index) => {
          if (recordIsDisabled(parent)) {
            return false;
          }
          const { children } = parent;
          if (children && children.every(child => {
            return recordIsDisabled(child) || (index === 0 ? records.includes(child) : parents.includes(child)) || this.isSelected(child);
          })) {
            parents.push(parent);
            return true;
          }
          return false;
        });
        const showCheckedStrategy = this.getProp('showCheckedStrategy');
        if (showCheckedStrategy === CheckedStrategy.SHOW_ALL) {
          if (this.isSelected(record)) {
            const unChooseRecords = (record as Record).treeReduce((array, r) => {
              return this.isSelected(r) && !recordIsDisabled(r) && r.parents.every(parent => !disabledChildRecords.includes(parent)) ? array.concat(r) : array;
            }, [] as Record[]);
            const disabledParentRecords: Record[] = [];
            const unChooseParents = (record as Record).parents.filter(parent => {
              if (recordIsDisabled(parent)) {
                disabledParentRecords.push(parent, ...parent.parents);
                return false;
              }
              return this.isSelected(parent) && !disabledParentRecords.includes(parent);
            });
            this.unChoose(unChooseRecords.concat(unChooseParents));
          } else {
            this.choose(records.concat(parents));
          }
        } else if (showCheckedStrategy === CheckedStrategy.SHOW_PARENT) {
          const disabledParentRecords: Record[] = [];
          let oldSelectedRecord: Record = record;
          if (this.isSelected(record) ||
            (record as Record).parents.some(parent => {
              if (recordIsDisabled(parent)) {
                disabledParentRecords.push(parent, ...parent.parents);
                return false;
              }
              const parentSelect = this.isSelected(parent) && !recordIsDisabled(parent) && !disabledParentRecords.includes(parent);
              if (parentSelect) {
                oldSelectedRecord = parent;
              }
              return parentSelect;
            })) {
            const selectedRecords = this.options.filter(option => {
              return option !== oldSelectedRecord && this.isSelected(option);
            });
            if (oldSelectedRecord.children) {
              oldSelectedRecord.children.forEach(child => {
                if (!recordIsDisabled(child) && !this.isSelected(record) &&
                  child !== record && (record as Record).parents.every(parent => child !== parent)) {
                  selectedRecords.push(child);
                }
              });
            }
            this.setValue(selectedRecords.map(this.processRecordToObject, this));
          } else {
            const preSelected = this.options.filter(option => this.isSelected(option)).concat(record, parents);
            const selectedRecords = preSelected.filter((child) => {
              return recordIsDisabled(child) || (child.parent && recordIsDisabled(child.parent)) || !(child.parent && preSelected.includes(child.parent));
            });
            this.setValue(selectedRecords.map(this.processRecordToObject, this));
          }
        } else if (showCheckedStrategy === 'SHOW_CHILD') {
          const allLeafChildren: Record[] = [];
          const selectedChildren: Record[] = [];
          (record as Record).treeReduce((_, r) => {
            if (!recordIsDisabled(r) &&
              r.parents.every(parent => !disabledChildRecords.includes(parent)) &&
              (!r.children || r.children.length === 0 || (r.children && r.children.every(recordChild => recordIsDisabled(recordChild))))) {
              allLeafChildren.push(r);
              if (this.isSelected(r)) {
                selectedChildren.push(r);
              }
            }
            return [];
          }, [] as Record[]);
          if (allLeafChildren.length === selectedChildren.length) {
            this.unChoose(selectedChildren);
          } else {
            this.choose(allLeafChildren.filter(leaf => selectedChildren.length === 0 || !selectedChildren.includes(leaf)));
          }
        }
      } else {
        this.choose(record);
      }
    }
  }

  @autobind
  handleTreeNode(e) {
    const { onOption } = this.props;
    const props = onOption(e) || {};
    props.className = classNames(props.className, `${this.getMenuPrefixCls()}-item`);
    return props;
  }

  @autobind
  handleLoadData(event): Promise<any> {
    const { loadData } = this.props;
    const dataSet = this.options;
    const promises: Promise<any>[] = [];
    if (dataSet) {
      const { record } = event.props;
      promises.push(dataSet.queryMoreChild(record, dataSet.currentPage));
    }
    if (loadData) {
      promises.push(loadData(event));
    }
    return Promise.all(promises);
  }

  renderSelectAll() {
    // noop
  }

  @autobind
  getMenu(menuProps: object = {}): ReactNode {
    const {
      options,
    } = this;
    const menuPrefixCls = this.getMenuPrefixCls();
    const {
      disabled: menuDisabled,
      textField,
      selectedKeys,
      expandedKeys,
      multiple,
      searchText: text,
      checkStrictly,
      optionsFilter,
      idField,
      searchable,
      props: {
        dropdownMenuStyle, optionRenderer = defaultRenderer,
        treeDefaultExpandAll, treeDefaultExpandedKeys, treeCheckable,
        async, loadData,
      },
    } = this;
    /**
     * fixed when ie the scroll width would cover the item width
     */
    const IeMenuStyle = !this.dropdownMatchSelectWidth && isIE() ? { padding: '.08rem' } : {};
    const filterText = isArrayLike(text) ? text[0] : text;
    const treeData = getTreeNodes(
      options,
      this.treeData,
      optionRenderer,
      this.handleTreeNode,
      async || !!loadData,
      textField,
      optionsFilter,
      this.matchRecordBySearch,
      filterText,
    );
    const halfChecked: Key[] = [];
    if (!checkStrictly && treeCheckable && searchable && filterText && selectedKeys.length > 0) {
      selectedKeys.forEach(key => {
        const record = options.find(r => String(r.get(idField)) === key);
        if (record && record.parent && record.parent.children) {
          const parentChildren = record.parent.children;
          const parentNoCheck = parentChildren.some(r =>
            !selectedKeys.includes(String(r.get(idField))) &&
            !recordIsDisabled(r) &&
            (!optionsFilter || optionsFilter(r, parentChildren.indexOf(r), parentChildren)));
          if (parentNoCheck) {
            halfChecked.push(String(record.parent.get(idField)));
          }
        }
      });
    }
    const checkedKeys = halfChecked.length > 0 ? { checked: selectedKeys, halfChecked } : selectedKeys;
    const isAfterFilter = !!(!checkStrictly && searchable && filterText);
    if (!treeData || !treeData.length) {
      return (
        <div className={menuPrefixCls}>
          <div className={`${menuPrefixCls}-item ${menuPrefixCls}-item-disabled`}>
            {this.loading ? ' ' : this.getNotFoundContent()}
          </div>
        </div>
      );
    }
    if (options.paging && options.currentPage < options.totalPage) {
      treeData.push({
        key: MORE_KEY,
        eventKey: MORE_KEY,
        title: <Spin style={{ left: 0 }} size={Size.small} spinning={this.moreQuerying === true}>{this.getPagingOptionContent()}</Spin>,
        className: `${menuPrefixCls}-item ${menuPrefixCls}-item-more`,
        isLeaf: true,
        disabled: this.moreQuerying,
      });
    }
    const props: TreeProps = {};
    if (expandedKeys) {
      props.expandedKeys = expandedKeys.slice();
    }
    return (
      <Tree
        ref={this.saveMenu}
        ripple
        disabled={menuDisabled}
        onMouseDown={preventDefault}
        onSelect={treeCheckable ? this.handleTreeCheck : this.handleTreeSelect}
        onCheck={this.handleTreeCheck}
        onExpand={this.handleExpand}
        style={{ ...IeMenuStyle, ...dropdownMenuStyle }}
        selectable
        focusable={false}
        treeData={treeData}
        defaultExpandAll={treeDefaultExpandAll}
        defaultExpandedKeys={treeDefaultExpandedKeys}
        selectedKeys={selectedKeys}
        checkedKeys={checkedKeys}
        checkable={treeCheckable}
        className={menuPrefixCls}
        multiple={multiple}
        loadData={async ? this.handleLoadData : loadData}
        checkStrictly={checkStrictly}
        isAfterFilter={isAfterFilter}
        {...props}
        {...menuProps}
      />
    );
  }

}
