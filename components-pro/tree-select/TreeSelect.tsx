import React, { Key, ReactNode } from 'react';
import classNames from 'classnames';
import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import isNil from 'lodash/isNil';
import Tree, { TreeProps } from 'choerodon-ui/lib/tree';
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
      options.queryMore(options.currentPage + 1);
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
    const { valueField, checkStrictly } = this;
    if (key === MORE_KEY) {
      const { options } = this;
      options.queryMore(options.currentPage + 1);
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
        const records = (record as Record).treeReduce((array, r) => {
          if (recordIsDisabled(r)) {
            disabledChildRecords.push(r);
            return array;
          }
          return this.isSelected(r) || r.parents.some(parent => disabledChildRecords.includes(parent)) ? array : array.concat(r);
        }, [] as Record[]);
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
          if (this.isSelected(record) ||
            (record as Record).parents.some(parent => {
              if (recordIsDisabled(parent)) {
                disabledParentRecords.push(parent, ...parent.parents);
              }
              return this.isSelected(parent) && !recordIsDisabled(parent) && !disabledParentRecords.includes(parent);
            })) {
            const recordFirstDisabledParent = (record as Record).parents.find(parent => recordIsDisabled(parent));
            const selectedRecords = this.options.filter(option => {
              if (recordIsDisabled(option)) {
                return this.isSelected(option);
              }
              if (key === option.get(valueField) || (option.children && option.children.includes(record))) {
                return false;
              }
              const firstDisabledParent = option.parents.find(parent => recordIsDisabled(parent));
              if ((firstDisabledParent && !(record as Record).parents.includes(firstDisabledParent)) ||
                (recordFirstDisabledParent && !option.parents.includes(recordFirstDisabledParent)) ||
                (firstDisabledParent && recordFirstDisabledParent &&
                  (firstDisabledParent.parents.includes(recordFirstDisabledParent) || recordFirstDisabledParent.parents.includes(firstDisabledParent)))) {
                return this.isSelected(option);
              }
              if (firstDisabledParent && recordFirstDisabledParent === firstDisabledParent) {
                if ((record as Record).parents.includes(option) || option.parents.includes(record)) {
                  return false;
                }
                if ((record as Record).parents.some(recordParent => recordParent === option.parent && recordParent.parents.includes(firstDisabledParent)) &&
                  (option.parents.some(parent => this.isSelected(parent) && parent.parents.includes(firstDisabledParent)) || this.isSelected(option))) {
                  return true;
                }
                if (option.parents.some(optionParent => (record as Record).parents.includes(optionParent) && optionParent.parents.includes(firstDisabledParent)) &&
                  this.isSelected(option)) {
                  return true;
                }
                return this.isSelected(option);
              }
              if ((record as Record).parents.includes(option) || option.parents.includes(record)) {
                return false;
              }
              if (option.parent && (record as Record).parents.includes(option.parent) && (option.parents.some(parent => this.isSelected(parent)) || this.isSelected(option))) {
                return true;
              }
              if (option.parents.some(optionParent => (record as Record).parents.includes(optionParent)) && this.isSelected(option)) {
                return true;
              }
              return false;
            });
            this.setValue(selectedRecords.map(this.processRecordToObject, this));
          } else {
            const preSelected = this.options.filter(option => this.isSelected(option)).concat(record, parents);
            const selectedRecords = preSelected.filter((child) => {
              return recordIsDisabled(child) || (child.parent && recordIsDisabled(child.parent)) || !(child.parent && preSelected.includes(child.parent));
            });
            this.setValue(selectedRecords.map(this.processRecordToObject, this));
          }
        } else if (showCheckedStrategy === 'SHOW_CHILD') {
          if (!record.parent) {
            const disabledRootRecords = this.options.filter(option => recordIsDisabled(option) && option.parents.every(optionParent => !recordIsDisabled(optionParent)));
            if (disabledRootRecords &&
              this.options.every(option => recordIsDisabled(option) || option.parents.some(optionParent => disabledRootRecords.includes(optionParent)) ||
                (this.isSelected(option) && (!option.children || (!!option.children && option.children.every(child => disabledRootRecords.includes(child))))) ||
                (!!option.children && option.children.some(optionChild => !recordIsDisabled(optionChild))))) {
              const unchooseRecords = this.options.filter(option => !recordIsDisabled(option) &&
                option.parents.every(optionParent => !recordIsDisabled(optionParent)) && this.isSelected(option));
              this.unChoose(unchooseRecords);
            }
            else if (!disabledRootRecords && this.options.every(option => (!option.children && this.isSelected(option)) || !!option.children)) {
              this.unChooseAll();
            } else {
              this.choose(records.filter(childRecord => !childRecord.children || childRecord.children.every(childChild => recordIsDisabled(childChild))));
            }
            return;
          }
          if (this.isSelected(record) && (!record.children || record.children.every(recordChild => recordIsDisabled(recordChild)))) {
            this.unChoose(record);
          } else if (!this.isSelected(record) && record.children && record.parent) {
            const allLeafChildren: Record[] = [];
            const selectedChildren: Record[] = [];
            (record as Record).treeReduce((_, r) => {
              if (r.parents.every(parent => !disabledChildRecords.includes(parent)) &&
                ((!recordIsDisabled(r) && !r.children) || (r.children && r.children.every(recordChild => recordIsDisabled(recordChild))))) {
                allLeafChildren.push(r);
                if (this.isSelected(r)) {
                  selectedChildren.push(r);
                }
              }
              return [];
            }, [] as Record[]);
            if (allLeafChildren.length === selectedChildren.length && selectedChildren.length !== 0) {
              this.unChoose(selectedChildren);
            } else {
              this.choose(records.filter(chooseRecord => !chooseRecord.children || chooseRecord.children.every(childChild => recordIsDisabled(childChild))));
            }
          } else {
            this.choose(records.filter(chooseRecord => !chooseRecord.children || chooseRecord.children.every(childChild => recordIsDisabled(childChild))));
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
      text,
      checkStrictly,
      optionsFilter,
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
    const treeData = getTreeNodes(
      options,
      this.treeData,
      optionRenderer,
      this.handleTreeNode,
      async || !!loadData,
      textField,
      optionsFilter,
      this.matchRecordBySearch,
      text,
    );
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
        title: this.getPagingOptionContent(),
        className: `${menuPrefixCls}-item ${menuPrefixCls}-item-more`,
        isLeaf: true,
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
        checkedKeys={selectedKeys}
        checkable={treeCheckable}
        className={menuPrefixCls}
        multiple={multiple}
        loadData={async ? this.handleLoadData : loadData}
        checkStrictly={checkStrictly}
        {...props}
        {...menuProps}
      />
    );
  }

}
