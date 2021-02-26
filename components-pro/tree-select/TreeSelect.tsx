import React, { Key, ReactNode } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { action, computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import Tree, { TreeProps } from 'choerodon-ui/lib/tree';
import TreeNode from './TreeNode';
import { disabledField, Select, SelectProps } from '../select/Select';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import normalizeTreeNodes from './normalizeTreeNodes';
import autobind from '../_util/autobind';
import isIE from '../_util/isIE';
import { defaultRenderer } from '../tree';
import { getTreeNodes } from '../tree/util';

export interface TreeSelectProps extends SelectProps {
  treeCheckable?: boolean;
  treeDefaultExpandAll?: boolean;
  treeDefaultExpandedKeys?: Key[];
}

@observer
export default class TreeSelect extends Select<TreeSelectProps> {
  static displayName = 'TreeSelect';

  static propTypes = {
    treeCheckable: PropTypes.bool,
    treeDefaultExpandAll: PropTypes.bool,
    treeDefaultExpandedKeys: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])),
    ...Select.propTypes,
  };

  static defaultProps = {
    ...Select.defaultProps,
    suffixCls: 'tree-select',
    dropdownMatchSelectWidth: false,
    reverse: false,
  };

  static TreeNode = TreeNode;

  @observable expandedKeys: string[] | undefined;

  stateForceRenderKeys: string[] = [];

  @computed
  get forceRenderKeys() {
    if (this.expandedKeys) {
      this.stateForceRenderKeys = [
        ...new Set<string>([...this.stateForceRenderKeys, ...this.expandedKeys]),
      ];
    }
    return this.stateForceRenderKeys;
  }

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
      normalizeTreeNodes({ textField, valueField, disabledField, parentField, idField, multiple, children })
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


  @autobind
  handleTreeSelect(_e, { node }) {
    const { record, disabled } = node;
    if (!disabled) {
      const { multiple } = this;
      if (multiple) {
        if (this.isSelected(record)) {
          const records = record.treeReduce((array, r) => this.isSelected(r) ? array.concat(r) : array, []);
          const parents = record.parents.filter(parent => this.isSelected(parent));
          this.unChoose(records.concat(parents));
        } else {
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
          this.choose(records.concat(parents));
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
  getMenu(menuProps: object = {}): ReactNode {
    const {
      options,
    } = this;
    const menuPrefixCls = this.getMenuPrefixCls();
    const {
      textField,
      selectedKeys,
      expandedKeys,
      multiple,
      forceRenderKeys,
      text,
      props: {
        dropdownMenuStyle, optionRenderer = defaultRenderer, optionsFilter,
        treeDefaultExpandAll, treeDefaultExpandedKeys, treeCheckable,
      },
    } = this;
    const menuDisabled = this.isDisabled();
    /**
     * fixed when ie the scroll width would cover the item width
     */
    const IeMenuStyle = !this.dropdownMatchSelectWidth && isIE() ? { padding: '.08rem' } : {};
    const treeData = getTreeNodes(
      options,
      this.treeData,
      [...forceRenderKeys.values()],
      optionRenderer,
      // @ts-ignore
      this.handleTreeNode,
      undefined,
      textField,
      treeDefaultExpandAll,
      optionsFilter,
      this.matchRecordBySearch,
      text,
    );
    if (!treeData.length) {
      return (
        <div className={menuPrefixCls}>
          <div className={`${menuPrefixCls}-item ${menuPrefixCls}-item-disabled`}>
            {this.loading ? ' ' : this.getNotFoundContent()}
          </div>
        </div>
      );
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
        onSelect={this.handleTreeSelect}
        onCheck={this.handleTreeSelect}
        onExpand={this.handleExpand}
        style={{ ...IeMenuStyle, ...dropdownMenuStyle }}
        selectable
        focusable={false}
        treeData={treeData}
        defaultExpandAll={treeDefaultExpandAll}
        defaultExpandedKeys={treeDefaultExpandedKeys}
        selectedKeys={selectedKeys}
        checkedKeys={selectedKeys}
        checkable={'treeCheckable' in this.props ? treeCheckable : multiple}
        className={menuPrefixCls}
        multiple={multiple}
        {...props}
        {...menuProps}
      />
    );
  }

}
