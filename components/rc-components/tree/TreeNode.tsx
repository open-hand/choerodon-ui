import * as React from 'react';
import classNames from 'classnames';
import Icon from '../../icon';
import { TreeContext, TreeContextProps } from './contextTypes';
import { getDataAndAria } from './util';
import { DataNode, IconType, Key } from './interface';
import Indent from './Indent';
import { convertNodePropsToEventData } from './utils/treeUtil';
import { stopEvent } from '../../_util/EventManager';
import Ripple from '../../ripple';

const ICON_OPEN = 'open';
const ICON_CLOSE = 'close';

const defaultTitle = '---';

export interface TreeNodeProps {
  [key: string]: any;

  eventKey?: Key; // Pass by parent `cloneElement`
  prefixCls?: string;
  className?: string;
  style?: React.CSSProperties;

  // By parent
  expanded?: boolean;
  selected?: boolean;
  checked?: boolean;
  loaded?: boolean;
  loading?: boolean;
  halfChecked?: boolean;
  title?: React.ReactNode | ((data?: DataNode) => React.ReactNode);
  dragOver?: boolean;
  dragOverGapTop?: boolean;
  dragOverGapBottom?: boolean;
  pos?: string;
  domRef?: React.Ref<HTMLDivElement>;
  /** New added in Tree for easy data access */
  data?: DataNode;
  isStart?: boolean[];
  isEnd?: boolean[];
  active?: boolean;
  onMouseMove?: React.MouseEventHandler<HTMLDivElement>;

  // By user
  isLeaf?: boolean;
  checkable?: boolean;
  selectable?: boolean;
  disabled?: boolean;
  disableCheckbox?: boolean;
  ripple?: boolean;
  icon?: IconType;
  switcherIcon?: IconType;
  children?: React.ReactNode;
}

export interface InternalTreeNodeProps extends TreeNodeProps {
  context?: TreeContextProps;
}

export interface TreeNodeState {
  dragNodeHighlight: boolean;
}

class InternalTreeNode extends React.Component<InternalTreeNodeProps, TreeNodeState> {
  public state = {
    dragNodeHighlight: false,
  };

  public selectHandle: HTMLSpanElement;

  // Isomorphic needn't load data in server side
  componentDidMount() {
    this.syncLoadData(this.props);
  }

  componentDidUpdate() {
    this.syncLoadData(this.props);
  }

  onSelectorClick = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    // Click trigger before select/check operation

    const {
      context,
    } = this.props;
    const { onNodeClick } = context!;
    onNodeClick(e, convertNodePropsToEventData(this.props));

    if (this.isSelectable()) {
      this.onSelect(e);
    } else {
      this.onCheck(e);
    }
  };

  onSelectorDoubleClick = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {

    const {
      context,
    } = this.props;
    const { onNodeDoubleClick } = context!;
    onNodeDoubleClick(e, convertNodePropsToEventData(this.props));
  };

  onSelect = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    if (this.isDisabled()) return;

    const {
      context,
    } = this.props;
    const { onNodeSelect } = context!;
    e.preventDefault();
    onNodeSelect(e, convertNodePropsToEventData(this.props));
  };

  onCheck = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    if (this.isDisabled()) return;

    const { disableCheckbox } = this.props;

    if (!this.isCheckable() || disableCheckbox) return;

    const { checked, context } = this.props;
    const { onNodeCheck } = context!;
    stopEvent(e);
    const targetChecked = !checked;
    onNodeCheck(e, convertNodePropsToEventData(this.props), targetChecked);
  };

  onMouseEnter = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    const {
      context,
    } = this.props;
    const { onNodeMouseEnter } = context!;
    onNodeMouseEnter(e, convertNodePropsToEventData(this.props));
  };

  onMouseLeave = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    const {
      context,
    } = this.props;
    const { onNodeMouseLeave } = context!;
    onNodeMouseLeave(e, convertNodePropsToEventData(this.props));
  };

  onContextMenu = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    const {
      context,
    } = this.props;
    const { onNodeContextMenu } = context!;
    onNodeContextMenu(e, convertNodePropsToEventData(this.props));
  };

  onDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    const {
      context,
    } = this.props;
    const { onNodeDragStart } = context!;

    e.stopPropagation();
    this.setState({
      dragNodeHighlight: true,
    });
    onNodeDragStart(e, this);

    try {
      // ie throw error
      // firefox-need-it
      e.dataTransfer.setData('text/plain', '');
    } catch (error) {
      // empty
    }
  };

  onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    const {
      context,
    } = this.props;
    const { onNodeDragEnter } = context!;

    e.preventDefault();
    e.stopPropagation();
    onNodeDragEnter(e, this);
  };

  onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    const {
      context,
    } = this.props;
    const { onNodeDragOver } = context!;

    e.preventDefault();
    e.stopPropagation();
    onNodeDragOver(e, this);
  };

  onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    const {
      context,
    } = this.props;
    const { onNodeDragLeave } = context!;

    e.stopPropagation();
    onNodeDragLeave(e, this);
  };

  onDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    const {
      context,
    } = this.props;
    const { onNodeDragEnd } = context!;

    e.stopPropagation();
    this.setState({
      dragNodeHighlight: false,
    });
    onNodeDragEnd(e, this);
  };

  onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    const {
      context,
    } = this.props;
    const { onNodeDrop } = context!;

    e.preventDefault();
    e.stopPropagation();
    this.setState({
      dragNodeHighlight: false,
    });
    onNodeDrop(e, this);
  };

  // Disabled item still can be switch
  onExpand: React.MouseEventHandler<HTMLDivElement> = e => {
    stopEvent(e);
    const {
      loading,
      context,
    } = this.props;
    const { onNodeExpand } = context!;
    if (loading) return;
    onNodeExpand(e, convertNodePropsToEventData(this.props));
  };

  // Drag usage
  setSelectHandle = node => {
    this.selectHandle = node;
  };

  getNodeState = () => {
    const { expanded } = this.props;

    if (this.isLeaf()) {
      return null;
    }

    return expanded ? ICON_OPEN : ICON_CLOSE;
  };

  hasChildren = () => {
    const { eventKey, context } = this.props;
    const {
      keyEntities,
    } = context!;
    const { children } = keyEntities[eventKey!] || {};

    return !!(children || []).length;
  };

  isLeaf = () => {
    const { isLeaf, loaded, context } = this.props;
    const {
      loadData,
    } = context!;

    const hasChildren = this.hasChildren();

    if (isLeaf === false) {
      return false;
    }

    return isLeaf || (!loadData && !hasChildren) || (loadData && loaded && !hasChildren);
  };

  isDisabled = () => {
    const { disabled, context } = this.props;
    const {
      disabled: treeDisabled,
    } = context!;

    return !!(treeDisabled || disabled);
  };

  isCheckable = () => {
    const { checkable, context } = this.props;
    const {
      checkable: treeCheckable,
    } = context!;

    // Return false if tree or treeNode is not checkable
    if (!treeCheckable || checkable === false) return false;
    return treeCheckable;
  };

  // Load data to avoid default expanded tree without data
  syncLoadData = props => {
    const { expanded, loading, loaded, context } = props;
    const {
      loadData, onNodeLoad,
    } = context!;

    if (loading) return;

    // read from state to avoid loadData at same time
    if (loadData && expanded && !this.isLeaf()) {
      // We needn't reload data when has children in sync logic
      // It's only needed in node expanded
      if (!this.hasChildren() && !loaded) {
        onNodeLoad(convertNodePropsToEventData(this.props));
      }
    }
  };

  isSelectable() {
    const { selectable, context } = this.props;
    const {
      selectable: treeSelectable,
    } = context!;

    // Ignore when selectable is undefined or null
    if (typeof selectable === 'boolean') {
      return selectable;
    }

    return treeSelectable;
  }

  getMergedDraggable = (draggable, data) => {
    if (typeof draggable === 'function') {
      return draggable(data);
    }
    if (typeof draggable === 'object') {
      const { nodeDraggable = false } = draggable;
      return typeof nodeDraggable === 'function'
        ? nodeDraggable(data)
        : nodeDraggable;
    }
    return draggable;
  };

  // renderDraggableIcon
  renderDraggableIcon = () => {
    const { context } = this.props;
    const {
      prefixCls, draggable,
    } = context!;
    if (typeof draggable === 'object') {
      const { icon = false } = draggable;
      if (icon) {
        return (
          <span className={`${prefixCls}-draggable-icon`}>
            {React.isValidElement(icon) ? icon : <Icon type="baseline-drag_indicator" />}
          </span>
        );
      }
      return null;
    }
  };

  // Switcher
  renderSwitcher = () => {
    const { expanded, switcherIcon: switcherIconFromProps, context } = this.props;
    const {
      prefixCls, switcherIcon: switcherIconFromCtx,
    } = context!;

    const switcherIcon = switcherIconFromProps || switcherIconFromCtx;

    if (this.isLeaf()) {
      return (
        <span className={classNames(`${prefixCls}-switcher`, `${prefixCls}-switcher-noop`)}>
          {typeof switcherIcon === 'function'
            ? switcherIcon({ ...this.props, isLeaf: true })
            : switcherIcon}
        </span>
      );
    }

    const switcherCls = classNames(
      `${prefixCls}-switcher`,
      `${prefixCls}-switcher_${expanded ? ICON_OPEN : ICON_CLOSE}`,
    );
    return (
      <span onClick={this.onExpand} className={switcherCls}>
        {typeof switcherIcon === 'function'
          ? switcherIcon({ ...this.props, isLeaf: false })
          : switcherIcon}
      </span>
    );
  };

  // Checkbox
  renderCheckbox = () => {
    const { checked, halfChecked, disableCheckbox, context } = this.props;
    const {
      prefixCls,
    } = context!;
    const disabled = this.isDisabled();
    const checkable = this.isCheckable();

    if (!checkable) return null;

    // [Legacy] Custom element should be separate with `checkable` in future
    const $custom = typeof checkable !== 'boolean' ? checkable : null;

    return (
      <span
        className={classNames(
          `${prefixCls}-checkbox`,
          checked && `${prefixCls}-checkbox-checked`,
          !checked && halfChecked && `${prefixCls}-checkbox-indeterminate`,
          (disabled || disableCheckbox) && `${prefixCls}-checkbox-disabled`,
        )}
        onClick={this.onCheck}
      >
        {$custom}
      </span>
    );
  };

  renderIcon = () => {
    const { loading, context } = this.props;
    const {
      prefixCls,
    } = context!;

    return (
      <span
        className={classNames(
          `${prefixCls}-iconEle`,
          `${prefixCls}-icon__${this.getNodeState() || 'docu'}`,
          loading && `${prefixCls}-icon_loading`,
        )}
      />
    );
  };

  // Icon + Title
  renderSelector = () => {
    const { dragNodeHighlight } = this.state;
    const { title, selected, icon, loading, data, context } = this.props;
    const {
      prefixCls, showIcon, icon: treeIcon, draggable, loadData, titleRender,
    } = context!;
    const disabled = this.isDisabled();
    const mergedDraggable = this.getMergedDraggable(draggable, data);

    const wrapClass = `${prefixCls}-node-content-wrapper`;

    // Icon - Still show loading icon when loading without showIcon
    let $icon;

    if (showIcon) {
      const currentIcon = icon || treeIcon;

      $icon = currentIcon ? (
        <span className={classNames(`${prefixCls}-iconEle`, `${prefixCls}-icon__customize`)}>
          {typeof currentIcon === 'function' ? currentIcon(this.props) : currentIcon}
        </span>
      ) : (
        this.renderIcon()
      );
    } else if (loadData && loading) {
      $icon = this.renderIcon();
    }

    // Title
    let titleNode: React.ReactNode;
    if (typeof title === 'function') {
      titleNode = title(data);
    } else if (titleRender) {
      titleNode = titleRender(data);
    } else {
      titleNode = title;
    }

    const $title = <span className={`${prefixCls}-title`}>{titleNode}</span>;

    return (
      <span
        ref={this.setSelectHandle}
        title={typeof title === 'string' ? title : ''}
        className={classNames(
          `${wrapClass}`,
          `${wrapClass}-${this.getNodeState() || 'normal'}`,
          !disabled && (selected || dragNodeHighlight) && `${prefixCls}-node-selected`,
          !disabled && mergedDraggable && 'draggable',
        )}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        onContextMenu={this.onContextMenu}
      >
        {$icon}
        {$title}
        {this.renderDropIndicator()}
      </span>
    );
  };

  renderDropIndicator = () => {
    const { disabled, eventKey, context } = this.props;
    const {
      draggable,
      dropLevelOffset,
      dropPosition,
      prefixCls,
      indent,
      dropIndicatorRender,
      dragOverNodeKey,
      direction,
    } = context!;
    let isDraggable = draggable;
    if (typeof draggable === 'object') {
      const { nodeDraggable = false } = draggable;
      isDraggable = nodeDraggable;
    }
    const mergedDraggable = isDraggable !== false;
    // allowDrop is calculated in Tree.tsx, there is no need for calc it here
    const showIndicator = !disabled && mergedDraggable && dragOverNodeKey === eventKey;
    return showIndicator && dropIndicatorRender
      ? dropIndicatorRender({ dropPosition, dropLevelOffset, indent, prefixCls, direction })
      : null;
  };

  render() {
    const {
      eventKey,
      className,
      style,
      dragOver,
      dragOverGapTop,
      dragOverGapBottom,
      isLeaf,
      isStart = [],
      isEnd = [],
      expanded,
      selected,
      checked,
      halfChecked,
      loading,
      domRef,
      active,
      data,
      onMouseMove,
      context,
      ...otherProps
    } = this.props;
    const {
      prefixCls,
      filterTreeNode,
      draggable,
      keyEntities,
      dropContainerKey,
      dropTargetKey,
      ripple,
    } = context!;
    const disabled = this.isDisabled();
    const dataOrAriaAttributeProps = getDataAndAria(otherProps);
    const { level } = keyEntities[eventKey!] || {};
    const isEndNode = isEnd[isEnd.length - 1];
    const mergedDraggable = this.getMergedDraggable(draggable, data);
    const draggableWithoutDisabled = !disabled && mergedDraggable;

    return (
      <>
        <Ripple disabled={disabled || !ripple || !this.isSelectable()}>
          <div
            ref={domRef}
            className={classNames(className, `${prefixCls}-treenode`, {
              [`${prefixCls}-treenode-disabled`]: disabled,
              [`${prefixCls}-treenode-switcher-${expanded ? 'open' : 'close'}`]: !isLeaf,
              [`${prefixCls}-treenode-checkbox-checked`]: checked,
              [`${prefixCls}-treenode-checkbox-indeterminate`]: halfChecked,
              [`${prefixCls}-treenode-selected`]: selected,
              [`${prefixCls}-treenode-loading`]: loading,
              [`${prefixCls}-treenode-active`]: active,
              [`${prefixCls}-treenode-leaf-last`]: isEndNode,

              'drop-target': dropTargetKey === eventKey,
              'drop-container': dropContainerKey === eventKey,
              'drag-over': !disabled && dragOver,
              'drag-over-gap-top': !disabled && dragOverGapTop,
              'drag-over-gap-bottom': !disabled && dragOverGapBottom,
              'filter-node': filterTreeNode && filterTreeNode(convertNodePropsToEventData(this.props)),
            })}
            style={style}
            draggable={draggableWithoutDisabled}
            onDragStart={draggableWithoutDisabled ? this.onDragStart : undefined}
            onClick={this.onSelectorClick}
            onDoubleClick={this.onSelectorDoubleClick}
            onDragEnter={mergedDraggable ? this.onDragEnter : undefined}
            onDragOver={mergedDraggable ? this.onDragOver : undefined}
            onDragLeave={mergedDraggable ? this.onDragLeave : undefined}
            onDrop={mergedDraggable ? this.onDrop : undefined}
            onDragEnd={mergedDraggable ? this.onDragEnd : undefined}
            onMouseMove={onMouseMove}
            {...dataOrAriaAttributeProps}
          >
            <Indent prefixCls={prefixCls} level={level} isStart={isStart} isEnd={isEnd} />
            {this.renderDraggableIcon()}
            {this.renderSwitcher()}
            {this.renderCheckbox()}
            {this.renderSelector()}
          </div>
        </Ripple>
      </>
    );
  }
}

const ContextTreeNode: React.FC<TreeNodeProps> = props => (
  <TreeContext.Consumer>
    {context => <InternalTreeNode {...props} context={context} />}
  </TreeContext.Consumer>
);

ContextTreeNode.displayName = 'TreeNode';

ContextTreeNode.defaultProps = {
  // eslint-disable-next-line react/default-props-match-prop-types
  title: defaultTitle,
};

(ContextTreeNode as any).isTreeNode = 1;

export { InternalTreeNode };

export default ContextTreeNode;
