import React, { cloneElement, Component, CSSProperties, MouseEventHandler, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import animation from '../_util/openAnimation';
import RcTree, { TreeNode, TreeNodeAttribute, TreeNodeProps } from '../rc-components/tree';
import { TreeEvent } from '../tree/enum';
import Icon from '../icon';
import Progress from '../progress';
import { ProgressType } from '../progress/enum';
import { Size } from '../_util/enum';
import { getPrefixCls } from '../configure';

export { TreeNode };

export interface TreeNodeEvent {
  event: TreeEvent;
  node: TreeNode;
  checked?: boolean;
  checkedNodes?: TreeNode[];
  selected?: boolean;
  selectedNodes?: TreeNode[];
}

export interface TreeNodeExpandEvent {
  node: TreeNode;
  expanded: boolean;
}

export interface TreeNodeMouseEvent {
  node: TreeNode;
  event: MouseEventHandler<any>;
}

export interface TreeProps {
  showLine?: boolean;
  className?: string;
  /** 是否支持多选 */
  multiple?: boolean;
  /** 是否自动展开父节点 */
  autoExpandParent?: boolean;
  /** checkable状态下节点选择完全受控（父子节点选中状态不再关联）*/
  checkStrictly?: boolean;
  /** 是否支持选中 */
  checkable?: boolean;
  /** 默认展开所有树节点 */
  defaultExpandAll?: boolean;
  /** 默认展开指定的树节点 */
  defaultExpandedKeys?: string[];
  /** （受控）展开指定的树节点 */
  expandedKeys?: string[];
  /** （受控）选中复选框的树节点 */
  checkedKeys?: string[] | { checked: string[], halfChecked: string[] };
  /** 默认选中复选框的树节点 */
  defaultCheckedKeys?: string[];
  /** （受控）设置选中的树节点 */
  selectedKeys?: string[];
  /** 默认选中的树节点 */
  defaultSelectedKeys?: string[];
  /** 展开/收起节点时触发 */
  onExpand?: (expandedKeys: string[], e: TreeNodeExpandEvent) => void | PromiseLike<any>;
  /** 点击复选框触发 */
  onCheck?: (checkedKeys: string[], e: TreeNodeEvent) => void;
  /** 点击树节点触发 */
  onSelect?: (selectedKeys: string[], e: TreeNodeEvent) => void;
  /** filter some AntTreeNodes as you need. it should return true */
  filterAntTreeNode?: (node: TreeNode) => boolean;
  /** 异步加载数据 */
  loadData?: (node: TreeNode) => PromiseLike<any>;
  /** 响应右键点击 */
  onRightClick?: (options: TreeNodeMouseEvent) => void;
  /** 设置节点可拖拽（IE>8）*/
  draggable?: boolean;
  /** 开始拖拽时调用 */
  onDragStart?: (options: TreeNodeMouseEvent) => void;
  /** dragenter 触发时调用 */
  onDragEnter?: (options: TreeNodeMouseEvent) => void;
  /** dragover 触发时调用 */
  onDragOver?: (options: TreeNodeMouseEvent) => void;
  /** dragleave 触发时调用 */
  onDragLeave?: (options: TreeNodeMouseEvent) => void;
  /** drop 触发时调用 */
  onDrop?: (options: TreeNodeMouseEvent) => void;
  style?: CSSProperties;
  showIcon?: boolean;
  icon?: (nodeProps: TreeNodeAttribute) => ReactNode;
  switcherIcon?: ReactElement<any>;
  prefixCls?: string;
  filterTreeNode?: (node: TreeNode) => boolean;
  focusable?: boolean;
  tabIndex?: string | number,
  openTransitionName?: string,
  openAnimation?: string | object,
  selectable?: boolean;
  defaultExpandParent?: boolean;
  children?: any;
}

export default class Tree extends Component<TreeProps, any> {
  static displayName = 'Tree';
  static TreeNode = TreeNode;

  static defaultProps = {
    checkable: false,
    showIcon: false,
    openAnimation: animation,
  };

  renderSwitcherIcon = ({ isLeaf, loading }: TreeNodeProps) => {
    const { showLine, switcherIcon } = this.props;
    const prefixCls = this.getPrefixCls();
    if (loading) {
      return <Progress type={ProgressType.loading} className={`${prefixCls}-switcher-loading-icon`} size={Size.small} />;
    }
    const switcherCls = `${prefixCls}-switcher-icon`;
    if (showLine) {
      if (isLeaf) {
        return <Icon type="note" className={`${prefixCls}-switcher-line-icon`} />;
      }
      return <Icon type="arrow_drop_down" className={switcherCls} />;
    } else {
      if (isLeaf) {
        return null;
      } else if (switcherIcon) {
        const switcherOriginCls = switcherIcon.props.className || '';
        return cloneElement(switcherIcon, {
          className: [switcherOriginCls, switcherCls],
        });
      } else {
        return <Icon type="arrow_drop_down" className={switcherCls} />;
      }
    }
  };

  getPrefixCls() {
    return getPrefixCls('tree', this.props.prefixCls);
  }

  render() {
    const props = this.props;
    const { className, showIcon, checkable } = props;
    const prefixCls = this.getPrefixCls();
    return (
      <RcTree
        {...props}
        className={classNames(!showIcon && `${prefixCls}-icon-hide`, className)}
        checkable={checkable ? <span className={`${prefixCls}-checkbox-inner`} /> : checkable}
        switcherIcon={this.renderSwitcherIcon}
        prefixCls={prefixCls}
      >
        {this.props.children}
      </RcTree>
    );
  }
}
