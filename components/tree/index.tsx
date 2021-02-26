import React, { cloneElement, Component, CSSProperties, DragEvent, MouseEvent, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import DirectoryTree from './DirectoryTree';
import animation from '../_util/openAnimation';
import RcTree, { TreeNode, TreeProps as RcTreeProps } from '../rc-components/tree';
import { TreeNodeProps } from '../rc-components/tree/TreeNode';
import Icon from '../icon';
import Progress from '../progress';
import { ProgressType } from '../progress/enum';
import { Size } from '../_util/enum';
import { getPrefixCls } from '../configure';
import { DataNode, EventDataNode, Key } from '../rc-components/tree/interface';

export { TreeNode };

export { EventDataNode, DataNode, TreeNodeProps };

export { ExpandAction as DirectoryTreeExpandAction, DirectoryTreeProps } from './DirectoryTree';


export interface C7ndTreeNodeAttribute {
  eventKey: string;
  prefixCls: string;
  className: string;
  expanded: boolean;
  selected: boolean;
  checked: boolean;
  halfChecked: boolean;
  children: ReactNode;
  title: ReactNode;
  pos: string;
  dragOver: boolean;
  dragOverGapTop: boolean;
  dragOverGapBottom: boolean;
  isLeaf: boolean;
  selectable: boolean;
  disabled: boolean;
  disableCheckbox: boolean;
}

export interface C7nTreeNodeProps {
  className?: string;
  checkable?: boolean;
  disabled?: boolean;
  disableCheckbox?: boolean;
  title?: string | ReactNode;
  key?: string;
  eventKey?: string;
  isLeaf?: boolean;
  checked?: boolean;
  expanded?: boolean;
  loading?: boolean;
  selected?: boolean;
  selectable?: boolean;
  icon?: ((treeNode: C7ndTreeNodeAttribute) => ReactNode) | ReactNode;
  children?: ReactNode;

  [customProp: string]: any;
}

export interface C7nTreeNode extends Component<C7nTreeNodeProps, {}> {
}

export interface C7nTreeNodeBaseEvent {
  node: C7nTreeNode;
  nativeEvent: MouseEvent;
}

export interface C7nTreeNodeCheckedEvent extends C7nTreeNodeBaseEvent {
  event: 'check';
  checked?: boolean;
  checkedNodes?: C7nTreeNode[];
}

export interface C7nTreeNodeSelectedEvent extends C7nTreeNodeBaseEvent {
  event: 'select';
  selected?: boolean;
  selectedNodes?: DataNode[];
}

export interface C7nTreeNodeExpandedEvent extends C7nTreeNodeBaseEvent {
  expanded?: boolean;
}

export interface C7nTreeNodeMouseEvent {
  node: C7nTreeNode;
  event: DragEvent<HTMLElement>;
}

export interface C7nTreeNodeDragEnterEvent extends C7nTreeNodeMouseEvent {
  expandedKeys: string[];
}

export interface C7nTreeNodeDropEvent {
  node: C7nTreeNode;
  dragNode: C7nTreeNode;
  dragNodesKeys: string[];
  dropPosition: number;
  dropToGap?: boolean;
  event: MouseEvent<HTMLElement>;
}

// [Legacy] Compatible for v3
export type TreeNodeNormal = DataNode;

export interface TreeProps extends Omit<RcTreeProps, 'prefixCls'> {
  showLine?: boolean;
  className?: string;
  /** 是否支持多选 */
  multiple?: boolean;
  /** 是否自动展开父节点 */
  autoExpandParent?: boolean;
  /** checkable状态下节点选择完全受控（父子节点选中状态不再关联） */
  checkStrictly?: boolean;
  /** 是否支持选中 */
  checkable?: boolean;
  /** 是否禁用树 */
  disabled?: boolean;
  /** 默认展开所有树节点 */
  defaultExpandAll?: boolean;
  /** 默认展开对应树节点 */
  defaultExpandParent?: boolean;
  /** 默认展开指定的树节点 */
  defaultExpandedKeys?: Key[];
  /** （受控）展开指定的树节点 */
  expandedKeys?: Key[];
  /** （受控）选中复选框的树节点 */
  checkedKeys?: Key[] | { checked: Key[]; halfChecked: Key[] };
  /** 默认选中复选框的树节点 */
  defaultCheckedKeys?: Key[];
  /** （受控）设置选中的树节点 */
  selectedKeys?: Key[];
  /** 默认选中的树节点 */
  defaultSelectedKeys?: Key[];
  selectable?: boolean;
  loadedKeys?: string[];
  /** 设置节点可拖拽（IE>8） */
  draggable?: boolean;
  style?: CSSProperties;
  showIcon?: boolean;
  icon?: ((nodeProps: C7ndTreeNodeAttribute) => ReactNode) | ReactNode;
  switcherIcon?: ReactElement<any>;
  prefixCls?: string;
  children?: ReactNode;
  blockNode?: boolean;
}

export default class Tree extends Component<TreeProps, any> {
  static displayName = 'Tree';

  static TreeNode = TreeNode;

  static DirectoryTree = DirectoryTree;

  static defaultProps = {
    checkable: false,
    showIcon: false,
    openAnimation: animation,
  };

  renderSwitcherIcon = ({ isLeaf, loading }: C7nTreeNodeProps) => {
    const { showLine, switcherIcon } = this.props;
    const prefixCls = this.getPrefixCls();
    if (loading) {
      return (
        <Progress
          type={ProgressType.loading}
          className={`${prefixCls}-switcher-loading-icon`}
          size={Size.small}
        />
      );
    }
    const switcherCls = `${prefixCls}-switcher-icon`;
    if (showLine) {
      if (isLeaf) {
        return <Icon type="note" className={`${prefixCls}-switcher-line-icon`} />;
      }
      return <Icon type="arrow_drop_down" className={switcherCls} />;
    }
    if (isLeaf) {
      return null;
    }
    if (switcherIcon) {
      const switcherOriginCls = switcherIcon.props.className || '';
      return cloneElement(switcherIcon, {
        className: [switcherOriginCls, switcherCls],
      });
    }
    return <Icon type="arrow_drop_down" className={switcherCls} />;
  };

  tree: any;

  setTreeRef = (node: any) => {
    this.tree = node;
  };

  getPrefixCls() {
    const { prefixCls } = this.props;
    return getPrefixCls('tree', prefixCls);
  }

  onKeyDown(e) {
    this.tree.onKeyDown(e);
    return true;
  }

  render() {
    const props = this.props;
    const { className, showIcon, children } = props;
    const { checkable } = props;
    const prefixCls = this.getPrefixCls();
    return (
      <RcTree
        itemHeight={20}
        ref={this.setTreeRef}
        {...props}
        className={classNames(!showIcon && `${prefixCls}-icon-hide`, className)}
        checkable={checkable ? <span className={`${prefixCls}-checkbox-inner`} /> : 0}
        switcherIcon={this.renderSwitcherIcon}
        prefixCls={prefixCls}
      >
        {children}
      </RcTree>
    );
  }
}
