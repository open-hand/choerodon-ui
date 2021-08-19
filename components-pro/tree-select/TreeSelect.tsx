import React, { Key, ReactNode } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import Tree, { TreeProps } from 'choerodon-ui/lib/tree';
import TreeNode from './TreeNode';
import { DISABLED_FIELD, MORE_KEY, Select, SelectProps } from '../select/Select';
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
  loadData?: (node) => Promise<any>
  showCheckedStrategy?: CheckedStrategy;
}

@observer
export default class TreeSelect extends Select<TreeSelectProps> {
  static displayName = 'TreeSelect';

  static propTypes = {
    treeCheckable: PropTypes.bool,
    showCheckedStrategy: PropTypes.string,
    treeDefaultExpandAll: PropTypes.bool,
    treeDefaultExpandedKeys: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])),
    ...Select.propTypes,
  };

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
    } = this;
    return (
      options ||
      (field && field.options) ||
      normalizeTreeNodes({
        textField,
        valueField,
        disabledField: DISABLED_FIELD,
        parentField,
        idField,
        multiple,
        children,
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

  @action
  handleSearch(text) {
    if (text) {
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
    const { record, disabled, key } = node;
    const { valueField } = this;
    if (key === MORE_KEY) {
      const { options } = this;
      options.queryMore(options.currentPage + 1);
    } else if (!disabled) {
      const { multiple } = this;
      if (multiple) {
        const records = record.treeReduce((array, r) => this.isSelected(r) ? array : array.concat(r), []);
        const parents: Record[] = [];
        record.parents.every((parent, index) => {
          const { children } = parent;
          if (children && children.every(child => {
            return (index === 0 ? records.includes(child) : parents.includes(child)) || this.isSelected(child);
          })) {
            parents.push(parent);
            return true;
          }
          return false;
        });
        const showCheckedStrategy = this.getProp('showCheckedStrategy');
        if (showCheckedStrategy === CheckedStrategy.SHOW_ALL) {
          if (this.isSelected(record)) {
            const unChooseRecords = record.treeReduce((array, r) => this.isSelected(r) ? array.concat(r) : array, []);
            const unChooseParents = record.parents.filter(parent => this.isSelected(parent));
            this.unChoose(unChooseRecords.concat(unChooseParents));
          } else {
            this.choose(records.concat(parents));
          }
        } else if (showCheckedStrategy === CheckedStrategy.SHOW_PARENT) {
          if (this.isSelected(record) || record.parents.some(parent => this.isSelected(parent))) {
            const selectedRecords = this.options.filter(option => {
              if (key === option.get(valueField) || (option.children && option.children.includes(record))) {
                return false;
              }
              return !!((option.parent && option.children && record.parent && (option.parents.some(parent => this.isSelected(parent)) || this.isSelected(option)))
                ||
                (!option.children && option.parent!.children!.includes(record) && option.parents.some(parent => this.isSelected(parent)))
                ||
                (!option.children && option.parents.every(parent => !this.isSelected(parent)) && this.isSelected(option)));
            });
            this.setValue(selectedRecords.map(this.processRecordToObject, this));
          } else {
            const preSelected = this.options.filter(option => this.isSelected(option)).concat(record, parents);
            const selectedRecords = preSelected.filter((child) => {
              return !(child.parent && preSelected.includes(child.parent));
            });
            this.setValue(selectedRecords.map(this.processRecordToObject, this));
          }
        } else if (showCheckedStrategy === 'SHOW_CHILD') {
          if (!record.parent) {
            if (this.options.every(option => (!option.children && this.isSelected(option)) || !!option.children)) {
              this.unChooseAll();
            } else {
              this.choose(records.filter(childRecord => !childRecord.children));
            }
          }
          if (this.isSelected(record) && !record.children) {
            this.unChoose(record);
          } else if (!this.isSelected(record) && record.children && record.parent) {
            if (record.children.every(child => this.isSelected(child))) {
              this.unChoose(record.children);
            } else {
              this.choose(records.filter(chooseRecord => !chooseRecord.children));
            }
          } else {
            this.choose(records.filter(chooseRecord => !chooseRecord.children));
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
      const { idField, parentField } = dataSet.props;
      const { record } = event.props;
      if (idField && parentField && record && !record.children) {
        const id = record.get(idField);
        promises.push(dataSet.queryMore(-1, { [parentField]: id }));
      }
    }
    if (loadData) {
      promises.push(loadData(event));
    }
    return Promise.all(promises);
  }

  renderSelectAll() {
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
      props: {
        dropdownMenuStyle, optionRenderer = defaultRenderer, optionsFilter,
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
      // @ts-ignore
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
        {...props}
        {...menuProps}
      />
    );
  }

}
