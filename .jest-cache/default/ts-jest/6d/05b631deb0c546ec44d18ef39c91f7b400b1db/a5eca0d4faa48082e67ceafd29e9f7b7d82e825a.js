/* eslint-disable */
// @ts-nocheck 
import * as React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
// @ts-ignore
import { polyfill } from 'react-lifecycles-compat';
import { TreeContext } from './contextTypes';
import { getDataAndAria } from './util';
import Indent from './Indent';
import { convertNodePropsToEventData } from './utils/treeUtil';
const ICON_OPEN = 'open';
const ICON_CLOSE = 'close';
const defaultTitle = '---';
class InternalTreeNode extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            dragNodeHighlight: false,
        };
        this.onSelectorClick = e => {
            // Click trigger before select/check operation
            const { context: { onNodeClick }, } = this.props;
            onNodeClick(e, convertNodePropsToEventData(this.props));
            if (this.isSelectable()) {
                this.onSelect(e);
            }
            else {
                this.onCheck(e);
            }
        };
        this.onSelectorDoubleClick = e => {
            const { context: { onNodeDoubleClick }, } = this.props;
            onNodeDoubleClick(e, convertNodePropsToEventData(this.props));
        };
        this.onSelect = e => {
            if (this.isDisabled())
                return;
            const { context: { onNodeSelect }, } = this.props;
            e.preventDefault();
            onNodeSelect(e, convertNodePropsToEventData(this.props));
        };
        this.onCheck = e => {
            if (this.isDisabled())
                return;
            const { disableCheckbox, checked } = this.props;
            const { context: { onNodeCheck }, } = this.props;
            if (!this.isCheckable() || disableCheckbox)
                return;
            e.preventDefault();
            const targetChecked = !checked;
            onNodeCheck(e, convertNodePropsToEventData(this.props), targetChecked);
        };
        this.onMouseEnter = e => {
            const { context: { onNodeMouseEnter }, } = this.props;
            onNodeMouseEnter(e, convertNodePropsToEventData(this.props));
        };
        this.onMouseLeave = e => {
            const { context: { onNodeMouseLeave }, } = this.props;
            onNodeMouseLeave(e, convertNodePropsToEventData(this.props));
        };
        this.onContextMenu = e => {
            const { context: { onNodeContextMenu }, } = this.props;
            onNodeContextMenu(e, convertNodePropsToEventData(this.props));
        };
        this.onDragStart = e => {
            const { context: { onNodeDragStart }, } = this.props;
            e.stopPropagation();
            this.setState({
                dragNodeHighlight: true,
            });
            onNodeDragStart(e, this);
            try {
                // ie throw error
                // firefox-need-it
                e.dataTransfer.setData('text/plain', '');
            }
            catch (error) {
                // empty
            }
        };
        this.onDragEnter = e => {
            const { context: { onNodeDragEnter }, } = this.props;
            e.preventDefault();
            e.stopPropagation();
            onNodeDragEnter(e, this);
        };
        this.onDragOver = e => {
            const { context: { onNodeDragOver }, } = this.props;
            e.preventDefault();
            e.stopPropagation();
            onNodeDragOver(e, this);
        };
        this.onDragLeave = e => {
            const { context: { onNodeDragLeave }, } = this.props;
            e.stopPropagation();
            onNodeDragLeave(e, this);
        };
        this.onDragEnd = e => {
            const { context: { onNodeDragEnd }, } = this.props;
            e.stopPropagation();
            this.setState({
                dragNodeHighlight: false,
            });
            onNodeDragEnd(e, this);
        };
        this.onDrop = e => {
            const { context: { onNodeDrop }, } = this.props;
            e.preventDefault();
            e.stopPropagation();
            this.setState({
                dragNodeHighlight: false,
            });
            onNodeDrop(e, this);
        };
        // Disabled item still can be switch
        this.onExpand = e => {
            const { context: { onNodeExpand }, } = this.props;
            onNodeExpand(e, convertNodePropsToEventData(this.props));
        };
        // Drag usage
        this.setSelectHandle = node => {
            this.selectHandle = node;
        };
        this.getNodeState = () => {
            const { expanded } = this.props;
            if (this.isLeaf()) {
                return null;
            }
            return expanded ? ICON_OPEN : ICON_CLOSE;
        };
        this.hasChildren = () => {
            const { eventKey } = this.props;
            const { context: { keyEntities }, } = this.props;
            const { node: { hasChildren, }, } = keyEntities[eventKey] || {};
            const { children } = keyEntities[eventKey] || {};
            return !!(children || []).length || hasChildren;
        };
        this.isLeaf = () => {
            const { isLeaf, loaded } = this.props;
            const { context: { loadData }, } = this.props;
            const hasChildren = this.hasChildren();
            if (isLeaf === false) {
                return false;
            }
            return isLeaf || (!loadData && !hasChildren) || (loadData && loaded && !hasChildren);
        };
        this.isDisabled = () => {
            const { disabled } = this.props;
            const { context: { disabled: treeDisabled }, } = this.props;
            return !!(treeDisabled || disabled);
        };
        this.isCheckable = () => {
            const { checkable } = this.props;
            const { context: { checkable: treeCheckable }, } = this.props;
            // Return false if tree or treeNode is not checkable
            if (!treeCheckable || checkable === false)
                return false;
            return treeCheckable;
        };
        // Load data to avoid default expanded tree without data
        this.syncLoadData = props => {
            const { expanded, loading, loaded } = props;
            const { context: { loadData, onNodeLoad }, } = this.props;
            if (loading)
                return;
            // read from state to avoid loadData at same time
            if (loadData && expanded && !this.isLeaf()) {
                // We needn't reload data when has children in sync logic
                // It's only needed in node expanded
                if (!this.hasChildren() && !loaded) {
                    onNodeLoad(convertNodePropsToEventData(this.props));
                }
            }
        };
        // Switcher
        this.renderSwitcher = () => {
            const { expanded, switcherIcon: switcherIconFromProps } = this.props;
            const { context: { prefixCls, switcherIcon: switcherIconFromCtx }, } = this.props;
            const switcherIcon = switcherIconFromProps || switcherIconFromCtx;
            if (this.isLeaf()) {
                return (React.createElement("span", { className: classNames(`${prefixCls}-switcher`, `${prefixCls}-switcher-noop`) }, typeof switcherIcon === 'function'
                    ? switcherIcon({ ...this.props, isLeaf: true })
                    : switcherIcon));
            }
            const switcherCls = classNames(`${prefixCls}-switcher`, `${prefixCls}-switcher_${expanded ? ICON_OPEN : ICON_CLOSE}`);
            return (React.createElement("span", { onClick: this.onExpand, className: switcherCls }, typeof switcherIcon === 'function'
                ? switcherIcon({ ...this.props, isLeaf: false })
                : switcherIcon));
        };
        // Checkbox
        this.renderCheckbox = () => {
            const { checked, halfChecked, disableCheckbox } = this.props;
            const { context: { prefixCls }, } = this.props;
            const disabled = this.isDisabled();
            const checkable = this.isCheckable();
            if (!checkable)
                return null;
            // [Legacy] Custom element should be separate with `checkable` in future
            const $custom = typeof checkable !== 'boolean' ? checkable : null;
            return (React.createElement("span", { className: classNames(`${prefixCls}-checkbox`, checked && `${prefixCls}-checkbox-checked`, !checked && halfChecked && `${prefixCls}-checkbox-indeterminate`, (disabled || disableCheckbox) && `${prefixCls}-checkbox-disabled`), onClick: this.onCheck }, $custom));
        };
        this.renderIcon = () => {
            const { loading } = this.props;
            const { context: { prefixCls }, } = this.props;
            return (React.createElement("span", { className: classNames(`${prefixCls}-iconEle`, `${prefixCls}-icon__${this.getNodeState() || 'docu'}`, loading && `${prefixCls}-icon_loading`) }));
        };
        // Icon + Title
        this.renderSelector = () => {
            const { dragNodeHighlight } = this.state;
            const { title, selected, icon, loading, data } = this.props;
            const { context: { prefixCls, showIcon, icon: treeIcon, draggable, loadData }, } = this.props;
            const disabled = this.isDisabled();
            const wrapClass = `${prefixCls}-node-content-wrapper`;
            // Icon - Still show loading icon when loading without showIcon
            let $icon;
            if (showIcon) {
                const currentIcon = icon || treeIcon;
                $icon = currentIcon ? (React.createElement("span", { className: classNames(`${prefixCls}-iconEle`, `${prefixCls}-icon__customize`) }, typeof currentIcon === 'function' ? currentIcon(this.props) : currentIcon)) : (this.renderIcon());
            }
            else if (loadData && loading) {
                $icon = this.renderIcon();
            }
            // Title
            const $title = (React.createElement("span", { className: `${prefixCls}-title` }, typeof title === 'function' ? title(data) : title));
            return (React.createElement("span", { ref: this.setSelectHandle, title: typeof title === 'string' ? title : '', className: classNames(`${wrapClass}`, `${wrapClass}-${this.getNodeState() || 'normal'}`, !disabled && (selected || dragNodeHighlight) && `${prefixCls}-node-selected`, !disabled && draggable && 'draggable'), draggable: (!disabled && draggable) || undefined, "aria-grabbed": (!disabled && draggable) || undefined, onMouseEnter: this.onMouseEnter, onMouseLeave: this.onMouseLeave, onContextMenu: this.onContextMenu, onClick: this.onSelectorClick, onDoubleClick: this.onSelectorDoubleClick, onDragStart: draggable ? this.onDragStart : undefined },
                $icon,
                $title));
        };
    }
    // Isomorphic needn't load data in server side
    componentDidMount() {
        this.syncLoadData(this.props);
    }
    componentDidUpdate() {
        this.syncLoadData(this.props);
    }
    isSelectable() {
        const { selectable } = this.props;
        const { context: { selectable: treeSelectable }, } = this.props;
        // Ignore when selectable is undefined or null
        if (typeof selectable === 'boolean') {
            return selectable;
        }
        return treeSelectable;
    }
    render() {
        const { eventKey, className, style, dragOver, dragOverGapTop, dragOverGapBottom, isLeaf, isStart, isEnd, expanded, selected, checked, halfChecked, loading, domRef, active, onMouseMove, ...otherProps } = this.props;
        const { context: { prefixCls, filterTreeNode, draggable, keyEntities }, } = this.props;
        const disabled = this.isDisabled();
        const dataOrAriaAttributeProps = getDataAndAria(otherProps);
        const { level } = keyEntities[eventKey] || {};
        return (React.createElement("div", Object.assign({ ref: domRef, className: classNames(className, `${prefixCls}-treenode`, {
                [`${prefixCls}-treenode-disabled`]: disabled,
                [`${prefixCls}-treenode-switcher-${expanded ? 'open' : 'close'}`]: !isLeaf,
                [`${prefixCls}-treenode-checkbox-checked`]: checked,
                [`${prefixCls}-treenode-checkbox-indeterminate`]: halfChecked,
                [`${prefixCls}-treenode-selected`]: selected,
                [`${prefixCls}-treenode-loading`]: loading,
                [`${prefixCls}-treenode-active`]: active,
                [`${prefixCls}-treenode-checkable`]: this.isCheckable(),
                'drag-over': !disabled && dragOver,
                'drag-over-gap-top': !disabled && dragOverGapTop,
                'drag-over-gap-bottom': !disabled && dragOverGapBottom,
                'filter-node': filterTreeNode && filterTreeNode(convertNodePropsToEventData(this.props)),
            }), style: style, onDragEnter: draggable ? this.onDragEnter : undefined, onDragOver: draggable ? this.onDragOver : undefined, onDragLeave: draggable ? this.onDragLeave : undefined, onDrop: draggable ? this.onDrop : undefined, onDragEnd: draggable ? this.onDragEnd : undefined, onMouseMove: onMouseMove }, dataOrAriaAttributeProps),
            React.createElement(Indent, { prefixCls: prefixCls, level: level, isStart: isStart, isEnd: isEnd }),
            this.renderSwitcher(),
            this.renderCheckbox(),
            this.renderSelector()));
    }
}
InternalTreeNode.propTypes = {
    prefixCls: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    onSelect: PropTypes.func,
    // By parent
    eventKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    expanded: PropTypes.bool,
    selected: PropTypes.bool,
    checked: PropTypes.bool,
    loaded: PropTypes.bool,
    loading: PropTypes.bool,
    halfChecked: PropTypes.bool,
    title: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    dragOver: PropTypes.bool,
    dragOverGapTop: PropTypes.bool,
    dragOverGapBottom: PropTypes.bool,
    pos: PropTypes.string,
    // By user
    isLeaf: PropTypes.bool,
    checkable: PropTypes.bool,
    selectable: PropTypes.bool,
    disabled: PropTypes.bool,
    disableCheckbox: PropTypes.bool,
    icon: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    switcherIcon: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};
polyfill(InternalTreeNode);
const ContextTreeNode = props => (React.createElement(TreeContext.Consumer, null, context => React.createElement(InternalTreeNode, Object.assign({}, props, { context: context }))));
ContextTreeNode.displayName = 'TreeNode';
ContextTreeNode.defaultProps = {
    title: defaultTitle,
};
ContextTreeNode.isTreeNode = 1;
export { InternalTreeNode };
export default ContextTreeNode;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMvcmMtY29tcG9uZW50cy90cmVlL1RyZWVOb2RlLnRzeCIsIm1hcHBpbmdzIjoiQUFBQSxvQkFBb0I7QUFDcEIsZUFBZTtBQUNmLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQy9CLE9BQU8sU0FBUyxNQUFNLFlBQVksQ0FBQztBQUNuQyxPQUFPLFVBQVUsTUFBTSxZQUFZLENBQUM7QUFDcEMsYUFBYTtBQUNiLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsV0FBVyxFQUFvQixNQUFNLGdCQUFnQixDQUFDO0FBQy9ELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFFeEMsT0FBTyxNQUFNLE1BQU0sVUFBVSxDQUFDO0FBQzlCLE9BQU8sRUFBRSwyQkFBMkIsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBSS9ELE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQztBQUN6QixNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUM7QUFFM0IsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDO0FBK0MzQixNQUFNLGdCQUFpQixTQUFRLEtBQUssQ0FBQyxTQUErQztJQUFwRjs7UUErQlMsVUFBSyxHQUFHO1lBQ2IsaUJBQWlCLEVBQUUsS0FBSztTQUN6QixDQUFDO1FBYUYsb0JBQWUsR0FBRyxDQUFDLENBQUMsRUFBRTtZQUNwQiw4Q0FBOEM7WUFDOUMsTUFBTSxFQUNKLE9BQU8sRUFBRSxFQUFFLFdBQVcsRUFBRSxHQUN6QixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDZixXQUFXLENBQUMsQ0FBQyxFQUFFLDJCQUEyQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBRXhELElBQUksSUFBSSxDQUFDLFlBQVksRUFBRSxFQUFFO2dCQUN2QixJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2xCO2lC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LElBQUk7SUFDOUIsaUJBQWlCLEVBQUUsU0FBUyxDQUFDLElBQUk7SUFDakMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxNQUFNO0lBRXJCLFVBQVU7SUFDVixNQUFNLEVBQUUsU0FBUyxDQUFDLElBQUk7SUFDdEIsU0FBUyxFQUFFLFNBQVMsQ0FBQyxJQUFJO0lBQ3pCLFVBQVUsRUFBRSxTQUFTLENBQUMsSUFBSTtJQUMxQixRQUFRLEVBQUUsU0FBUyxDQUFDLElBQUk7SUFDeEIsZUFBZSxFQUFFLFNBQVMsQ0FBQyxJQUFJO0lBQy9CLElBQUksRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDM0QsWUFBWSxFQUFFLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUNwRSxDQUFDO0FBZ2RKLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBRTNCLE1BQU0sZUFBZSxHQUE0QixLQUFLLENBQUMsRUFBRSxDQUFDLENBQ3hELG9CQUFDLFdBQVcsQ0FBQyxRQUFRLFFBQ2xCLE9BQU8sQ0FBQyxFQUFFLENBQUMsb0JBQUMsZ0JBQWdCLG9CQUFLLEtBQUssSUFBRSxPQUFPLEVBQUUsT0FBTyxJQUFJLENBQ3hDLENBQ3hCLENBQUM7QUFFRixlQUFlLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztBQUV6QyxlQUFlLENBQUMsWUFBWSxHQUFHO0lBQzdCLEtBQUssRUFBRSxZQUFZO0NBQ3BCLENBQUM7QUFFRCxlQUF1QixDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7QUFFeEMsT0FBTyxFQUFFLGdCQUFnQixFQUFFLENBQUM7QUFFNUIsZUFBZSxlQUFlLENBQUMiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMvcmMtY29tcG9uZW50cy90cmVlL1RyZWVOb2RlLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSAqL1xuLy8gQHRzLW5vY2hlY2sgXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IGNsYXNzTmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG4vLyBAdHMtaWdub3JlXG5pbXBvcnQgeyBwb2x5ZmlsbCB9IGZyb20gJ3JlYWN0LWxpZmVjeWNsZXMtY29tcGF0JztcbmltcG9ydCB7IFRyZWVDb250ZXh0LCBUcmVlQ29udGV4dFByb3BzIH0gZnJvbSAnLi9jb250ZXh0VHlwZXMnO1xuaW1wb3J0IHsgZ2V0RGF0YUFuZEFyaWEgfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHsgSWNvblR5cGUsIEtleSwgRGF0YU5vZGUgfSBmcm9tICcuL2ludGVyZmFjZSc7XG5pbXBvcnQgSW5kZW50IGZyb20gJy4vSW5kZW50JztcbmltcG9ydCB7IGNvbnZlcnROb2RlUHJvcHNUb0V2ZW50RGF0YSB9IGZyb20gJy4vdXRpbHMvdHJlZVV0aWwnO1xuXG5cblxuY29uc3QgSUNPTl9PUEVOID0gJ29wZW4nO1xuY29uc3QgSUNPTl9DTE9TRSA9ICdjbG9zZSc7XG5cbmNvbnN0IGRlZmF1bHRUaXRsZSA9ICctLS0nO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRyZWVOb2RlUHJvcHMge1xuICBldmVudEtleT86IEtleTsgLy8gUGFzcyBieSBwYXJlbnQgYGNsb25lRWxlbWVudGBcbiAgcHJlZml4Q2xzPzogc3RyaW5nO1xuICBjbGFzc05hbWU/OiBzdHJpbmc7XG4gIHN0eWxlPzogUmVhY3QuQ1NTUHJvcGVydGllcztcblxuICAvLyBCeSBwYXJlbnRcbiAgZXhwYW5kZWQ/OiBib29sZWFuO1xuICBzZWxlY3RlZD86IGJvb2xlYW47XG4gIGNoZWNrZWQ/OiBib29sZWFuO1xuICBsb2FkZWQ/OiBib29sZWFuO1xuICBsb2FkaW5nPzogYm9vbGVhbjtcbiAgaGFsZkNoZWNrZWQ/OiBib29sZWFuO1xuICB0aXRsZT86IFJlYWN0LlJlYWN0Tm9kZSB8ICgoZGF0YTogRGF0YU5vZGUpID0+IFJlYWN0LlJlYWN0Tm9kZSk7XG4gIGRyYWdPdmVyPzogYm9vbGVhbjtcbiAgZHJhZ092ZXJHYXBUb3A/OiBib29sZWFuO1xuICBkcmFnT3ZlckdhcEJvdHRvbT86IGJvb2xlYW47XG4gIHBvcz86IHN0cmluZztcbiAgZG9tUmVmPzogUmVhY3QuUmVmPEhUTUxEaXZFbGVtZW50PjtcbiAgLyoqIE5ldyBhZGRlZCBpbiBUcmVlIGZvciBlYXN5IGRhdGEgYWNjZXNzICovXG4gIGRhdGE/OiBEYXRhTm9kZTtcbiAgaXNTdGFydD86IGJvb2xlYW5bXTtcbiAgaXNFbmQ/OiBib29sZWFuW107XG4gIGFjdGl2ZT86IGJvb2xlYW47XG4gIG9uTW91c2VNb3ZlPzogUmVhY3QuTW91c2VFdmVudEhhbmRsZXI8SFRNTERpdkVsZW1lbnQ+O1xuXG4gIC8vIEJ5IHVzZXJcbiAgaXNMZWFmPzogYm9vbGVhbjtcbiAgY2hlY2thYmxlPzogYm9vbGVhbjtcbiAgc2VsZWN0YWJsZT86IGJvb2xlYW47XG4gIGRpc2FibGVkPzogYm9vbGVhbjtcbiAgZGlzYWJsZUNoZWNrYm94PzogYm9vbGVhbjtcbiAgaWNvbj86IEljb25UeXBlO1xuICBzd2l0Y2hlckljb24/OiBJY29uVHlwZTtcbiAgY2hpbGRyZW4/OiBSZWFjdC5SZWFjdE5vZGU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSW50ZXJuYWxUcmVlTm9kZVByb3BzIGV4dGVuZHMgVHJlZU5vZGVQcm9wcyB7XG4gIGNvbnRleHQ/OiBUcmVlQ29udGV4dFByb3BzO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFRyZWVOb2RlU3RhdGUge1xuICBkcmFnTm9kZUhpZ2hsaWdodDogYm9vbGVhbjtcbn1cblxuY2xhc3MgSW50ZXJuYWxUcmVlTm9kZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxJbnRlcm5hbFRyZWVOb2RlUHJvcHMsIFRyZWVOb2RlU3RhdGU+IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBwcmVmaXhDbHM6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgY2xhc3NOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIHN0eWxlOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIG9uU2VsZWN0OiBQcm9wVHlwZXMuZnVuYyxcblxuICAgIC8vIEJ5IHBhcmVudFxuICAgIGV2ZW50S2V5OiBQcm9wVHlwZXMub25lT2ZUeXBlKFtQcm9wVHlwZXMuc3RyaW5nLCBQcm9wVHlwZXMubnVtYmVyXSksXG4gICAgZXhwYW5kZWQ6IFByb3BUeXBlcy5ib29sLFxuICAgIHNlbGVjdGVkOiBQcm9wVHlwZXMuYm9vbCxcbiAgICBjaGVja2VkOiBQcm9wVHlwZXMuYm9vbCxcbiAgICBsb2FkZWQ6IFByb3BUeXBlcy5ib29sLFxuICAgIGxvYWRpbmc6IFByb3BUeXBlcy5ib29sLFxuICAgIGhhbGZDaGVja2VkOiBQcm9wVHlwZXMuYm9vbCxcbiAgICB0aXRsZTogUHJvcFR5cGVzLm9uZU9mVHlwZShbUHJvcFR5cGVzLm5vZGUsIFByb3BUeXBlcy5mdW5jXSksXG4gICAgZHJhZ092ZXI6IFByb3BUeXBlcy5ib29sLFxuICAgIGRyYWdPdmVyR2FwVG9wOiBQcm9wVHlwZXMuYm9vbCxcbiAgICBkcmFnT3ZlckdhcEJvdHRvbTogUHJvcFR5cGVzLmJvb2wsXG4gICAgcG9zOiBQcm9wVHlwZXMuc3RyaW5nLFxuXG4gICAgLy8gQnkgdXNlclxuICAgIGlzTGVhZjogUHJvcFR5cGVzLmJvb2wsXG4gICAgY2hlY2thYmxlOiBQcm9wVHlwZXMuYm9vbCxcbiAgICBzZWxlY3RhYmxlOiBQcm9wVHlwZXMuYm9vbCxcbiAgICBkaXNhYmxlZDogUHJvcFR5cGVzLmJvb2wsXG4gICAgZGlzYWJsZUNoZWNrYm94OiBQcm9wVHlwZXMuYm9vbCxcbiAgICBpY29uOiBQcm9wVHlwZXMub25lT2ZUeXBlKFtQcm9wVHlwZXMubm9kZSwgUHJvcFR5cGVzLmZ1bmNdKSxcbiAgICBzd2l0Y2hlckljb246IFByb3BUeXBlcy5vbmVPZlR5cGUoW1Byb3BUeXBlcy5ub2RlLCBQcm9wVHlwZXMuZnVuY10pLFxuICB9O1xuXG4gIHB1YmxpYyBzdGF0ZSA9IHtcbiAgICBkcmFnTm9kZUhpZ2hsaWdodDogZmFsc2UsXG4gIH07XG5cbiAgcHVibGljIHNlbGVjdEhhbmRsZTogSFRNTFNwYW5FbGVtZW50O1xuXG4gIC8vIElzb21vcnBoaWMgbmVlZG4ndCBsb2FkIGRhdGEgaW4gc2VydmVyIHNpZGVcbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdGhpcy5zeW5jTG9hZERhdGEodGhpcy5wcm9wcyk7XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgdGhpcy5zeW5jTG9hZERhdGEodGhpcy5wcm9wcyk7XG4gIH1cbiBcbiAgb25TZWxlY3RvckNsaWNrID0gZSA9PiB7XG4gICAgLy8gQ2xpY2sgdHJpZ2dlciBiZWZvcmUgc2VsZWN0L2NoZWNrIG9wZXJhdGlvblxuICAgIGNvbnN0IHtcbiAgICAgIGNvbnRleHQ6IHsgb25Ob2RlQ2xpY2sgfSxcbiAgICB9ID0gdGhpcy5wcm9wcztcbiAgICBvbk5vZGVDbGljayhlLCBjb252ZXJ0Tm9kZVByb3BzVG9FdmVudERhdGEodGhpcy5wcm9wcykpO1xuXG4gICAgaWYgKHRoaXMuaXNTZWxlY3RhYmxlKCkpIHtcbiAgICAgIHRoaXMub25TZWxlY3QoZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub25DaGVjayhlKTtcbiAgICB9XG4gIH07XG5cbiAgb25TZWxlY3RvckRvdWJsZUNsaWNrID0gZSA9PiB7XG4gICAgY29uc3Qge1xuICAgICAgY29udGV4dDogeyBvbk5vZGVEb3VibGVDbGljayB9LFxuICAgIH0gPSB0aGlzLnByb3BzO1xuICAgIG9uTm9kZURvdWJsZUNsaWNrKGUsIGNvbnZlcnROb2RlUHJvcHNUb0V2ZW50RGF0YSh0aGlzLnByb3BzKSk7XG4gIH07XG4gIFxuICBvblNlbGVjdCA9IGUgPT4ge1xuICAgIGlmICh0aGlzLmlzRGlzYWJsZWQoKSkgcmV0dXJuO1xuXG4gICAgY29uc3Qge1xuICAgICAgY29udGV4dDogeyBvbk5vZGVTZWxlY3QgfSxcbiAgICB9ID0gdGhpcy5wcm9wcztcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgb25Ob2RlU2VsZWN0KGUsIGNvbnZlcnROb2RlUHJvcHNUb0V2ZW50RGF0YSh0aGlzLnByb3BzKSk7XG4gIH07XG5cbiAgb25DaGVjayA9IGUgPT4ge1xuICAgIGlmICh0aGlzLmlzRGlzYWJsZWQoKSkgcmV0dXJuO1xuXG4gICAgY29uc3QgeyBkaXNhYmxlQ2hlY2tib3gsIGNoZWNrZWQgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge1xuICAgICAgY29udGV4dDogeyBvbk5vZGVDaGVjayB9LFxuICAgIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgaWYgKCF0aGlzLmlzQ2hlY2thYmxlKCkgfHwgZGlzYWJsZUNoZWNrYm94KSByZXR1cm47XG5cbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgY29uc3QgdGFyZ2V0Q2hlY2tlZCA9ICFjaGVja2VkO1xuICAgIG9uTm9kZUNoZWNrKGUsIGNvbnZlcnROb2RlUHJvcHNUb0V2ZW50RGF0YSh0aGlzLnByb3BzKSwgdGFyZ2V0Q2hlY2tlZCk7XG4gIH07XG5cbiAgb25Nb3VzZUVudGVyID0gZSA9PiB7XG4gICAgY29uc3Qge1xuICAgICAgY29udGV4dDogeyBvbk5vZGVNb3VzZUVudGVyIH0sXG4gICAgfSA9IHRoaXMucHJvcHM7XG4gICAgb25Ob2RlTW91c2VFbnRlcihlLCBjb252ZXJ0Tm9kZVByb3BzVG9FdmVudERhdGEodGhpcy5wcm9wcykpO1xuICB9O1xuXG4gIG9uTW91c2VMZWF2ZSA9IGUgPT4ge1xuICAgIGNvbnN0IHtcbiAgICAgIGNvbnRleHQ6IHsgb25Ob2RlTW91c2VMZWF2ZSB9LFxuICAgIH0gPSB0aGlzLnByb3BzO1xuICAgIG9uTm9kZU1vdXNlTGVhdmUoZSwgY29udmVydE5vZGVQcm9wc1RvRXZlbnREYXRhKHRoaXMucHJvcHMpKTtcbiAgfTtcblxuICBvbkNvbnRleHRNZW51ID0gZSA9PiB7XG4gICAgY29uc3Qge1xuICAgICAgY29udGV4dDogeyBvbk5vZGVDb250ZXh0TWVudSB9LFxuICAgIH0gPSB0aGlzLnByb3BzO1xuICAgIG9uTm9kZUNvbnRleHRNZW51KGUsIGNvbnZlcnROb2RlUHJvcHNUb0V2ZW50RGF0YSh0aGlzLnByb3BzKSk7XG4gIH07XG5cbiAgb25EcmFnU3RhcnQgPSBlID0+IHtcbiAgICBjb25zdCB7XG4gICAgICBjb250ZXh0OiB7IG9uTm9kZURyYWdTdGFydCB9LFxuICAgIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGRyYWdOb2RlSGlnaGxpZ2h0OiB0cnVlLFxuICAgIH0pO1xuICAgIG9uTm9kZURyYWdTdGFydChlLCB0aGlzKTtcblxuICAgIHRyeSB7XG4gICAgICAvLyBpZSB0aHJvdyBlcnJvclxuICAgICAgLy8gZmlyZWZveC1uZWVkLWl0XG4gICAgICBlLmRhdGFUcmFuc2Zlci5zZXREYXRhKCd0ZXh0L3BsYWluJywgJycpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAvLyBlbXB0eVxuICAgIH1cbiAgfTtcblxuICBvbkRyYWdFbnRlciA9IGUgPT4ge1xuICAgIGNvbnN0IHtcbiAgICAgIGNvbnRleHQ6IHsgb25Ob2RlRHJhZ0VudGVyIH0sXG4gICAgfSA9IHRoaXMucHJvcHM7XG5cbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBvbk5vZGVEcmFnRW50ZXIoZSwgdGhpcyk7XG4gIH07XG5cbiAgb25EcmFnT3ZlciA9IGUgPT4ge1xuICAgIGNvbnN0IHtcbiAgICAgIGNvbnRleHQ6IHsgb25Ob2RlRHJhZ092ZXIgfSxcbiAgICB9ID0gdGhpcy5wcm9wcztcblxuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIG9uTm9kZURyYWdPdmVyKGUsIHRoaXMpO1xuICB9O1xuXG4gIG9uRHJhZ0xlYXZlID0gZSA9PiB7XG4gICAgY29uc3Qge1xuICAgICAgY29udGV4dDogeyBvbk5vZGVEcmFnTGVhdmUgfSxcbiAgICB9ID0gdGhpcy5wcm9wcztcblxuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgb25Ob2RlRHJhZ0xlYXZlKGUsIHRoaXMpO1xuICB9O1xuXG4gIG9uRHJhZ0VuZCA9IGUgPT4ge1xuICAgIGNvbnN0IHtcbiAgICAgIGNvbnRleHQ6IHsgb25Ob2RlRHJhZ0VuZCB9LFxuICAgIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGRyYWdOb2RlSGlnaGxpZ2h0OiBmYWxzZSxcbiAgICB9KTtcbiAgICBvbk5vZGVEcmFnRW5kKGUsIHRoaXMpO1xuICB9O1xuXG4gIG9uRHJvcCA9IGUgPT4ge1xuICAgIGNvbnN0IHtcbiAgICAgIGNvbnRleHQ6IHsgb25Ob2RlRHJvcCB9LFxuICAgIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBkcmFnTm9kZUhpZ2hsaWdodDogZmFsc2UsXG4gICAgfSk7XG4gICAgb25Ob2RlRHJvcChlLCB0aGlzKTtcbiAgfTtcblxuICAvLyBEaXNhYmxlZCBpdGVtIHN0aWxsIGNhbiBiZSBzd2l0Y2hcbiAgb25FeHBhbmQ6IFJlYWN0Lk1vdXNlRXZlbnRIYW5kbGVyPEhUTUxEaXZFbGVtZW50PiA9IGUgPT4ge1xuICAgIGNvbnN0IHtcbiAgICAgIGNvbnRleHQ6IHsgb25Ob2RlRXhwYW5kIH0sXG4gICAgfSA9IHRoaXMucHJvcHM7XG4gICAgb25Ob2RlRXhwYW5kKGUsIGNvbnZlcnROb2RlUHJvcHNUb0V2ZW50RGF0YSh0aGlzLnByb3BzKSk7XG4gIH07XG5cbiAgLy8gRHJhZyB1c2FnZVxuICBzZXRTZWxlY3RIYW5kbGUgPSBub2RlID0+IHtcbiAgICB0aGlzLnNlbGVjdEhhbmRsZSA9IG5vZGU7XG4gIH07XG5cbiAgZ2V0Tm9kZVN0YXRlID0gKCkgPT4ge1xuICAgIGNvbnN0IHsgZXhwYW5kZWQgfSA9IHRoaXMucHJvcHM7XG5cbiAgICBpZiAodGhpcy5pc0xlYWYoKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIGV4cGFuZGVkID8gSUNPTl9PUEVOIDogSUNPTl9DTE9TRTtcbiAgfTtcblxuICBoYXNDaGlsZHJlbiA9ICgpID0+IHtcbiAgICBjb25zdCB7IGV2ZW50S2V5IH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHtcbiAgICAgIGNvbnRleHQ6IHsga2V5RW50aXRpZXMgfSxcbiAgICB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7XG4gICAgICBub2RlOntcbiAgICAgICAgaGFzQ2hpbGRyZW4sXG4gICAgICB9LFxuICAgIH0gPSBrZXlFbnRpdGllc1tldmVudEtleV0gfHwge31cbiAgICBjb25zdCB7IGNoaWxkcmVuIH0gPSBrZXlFbnRpdGllc1tldmVudEtleV0gfHwge307XG4gICAgcmV0dXJuICEhKGNoaWxkcmVuIHx8IFtdKS5sZW5ndGggfHwgaGFzQ2hpbGRyZW47XG4gIH07XG5cbiAgaXNMZWFmID0gKCkgPT4ge1xuICAgIGNvbnN0IHsgaXNMZWFmLCBsb2FkZWQgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge1xuICAgICAgY29udGV4dDogeyBsb2FkRGF0YSB9LFxuICAgIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgY29uc3QgaGFzQ2hpbGRyZW4gPSB0aGlzLmhhc0NoaWxkcmVuKCk7XG5cbiAgICBpZiAoaXNMZWFmID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiBpc0xlYWYgfHwgKCFsb2FkRGF0YSAmJiAhaGFzQ2hpbGRyZW4pIHx8IChsb2FkRGF0YSAmJiBsb2FkZWQgJiYgIWhhc0NoaWxkcmVuKTtcbiAgfTtcblxuICBpc0Rpc2FibGVkID0gKCkgPT4ge1xuICAgIGNvbnN0IHsgZGlzYWJsZWQgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge1xuICAgICAgY29udGV4dDogeyBkaXNhYmxlZDogdHJlZURpc2FibGVkIH0sXG4gICAgfSA9IHRoaXMucHJvcHM7XG5cbiAgICByZXR1cm4gISEodHJlZURpc2FibGVkIHx8IGRpc2FibGVkKTtcbiAgfTtcblxuICBpc0NoZWNrYWJsZSA9ICgpID0+IHtcbiAgICBjb25zdCB7IGNoZWNrYWJsZSB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7XG4gICAgICBjb250ZXh0OiB7IGNoZWNrYWJsZTogdHJlZUNoZWNrYWJsZSB9LFxuICAgIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgLy8gUmV0dXJuIGZhbHNlIGlmIHRyZWUgb3IgdHJlZU5vZGUgaXMgbm90IGNoZWNrYWJsZVxuICAgIGlmICghdHJlZUNoZWNrYWJsZSB8fCBjaGVja2FibGUgPT09IGZhbHNlKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRyZWVDaGVja2FibGU7XG4gIH07XG5cbiAgLy8gTG9hZCBkYXRhIHRvIGF2b2lkIGRlZmF1bHQgZXhwYW5kZWQgdHJlZSB3aXRob3V0IGRhdGFcbiAgc3luY0xvYWREYXRhID0gcHJvcHMgPT4ge1xuICAgIGNvbnN0IHsgZXhwYW5kZWQsIGxvYWRpbmcsIGxvYWRlZCB9ID0gcHJvcHM7XG4gICAgY29uc3Qge1xuICAgICAgY29udGV4dDogeyBsb2FkRGF0YSwgb25Ob2RlTG9hZCB9LFxuICAgIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgaWYgKGxvYWRpbmcpIHJldHVybjtcblxuICAgIC8vIHJlYWQgZnJvbSBzdGF0ZSB0byBhdm9pZCBsb2FkRGF0YSBhdCBzYW1lIHRpbWVcbiAgICBpZiAobG9hZERhdGEgJiYgZXhwYW5kZWQgJiYgIXRoaXMuaXNMZWFmKCkpIHtcbiAgICAgIC8vIFdlIG5lZWRuJ3QgcmVsb2FkIGRhdGEgd2hlbiBoYXMgY2hpbGRyZW4gaW4gc3luYyBsb2dpY1xuICAgICAgLy8gSXQncyBvbmx5IG5lZWRlZCBpbiBub2RlIGV4cGFuZGVkXG4gICAgICBpZiAoIXRoaXMuaGFzQ2hpbGRyZW4oKSAmJiAhbG9hZGVkKSB7XG4gICAgICAgIG9uTm9kZUxvYWQoY29udmVydE5vZGVQcm9wc1RvRXZlbnREYXRhKHRoaXMucHJvcHMpKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgaXNTZWxlY3RhYmxlKCkge1xuICAgIGNvbnN0IHsgc2VsZWN0YWJsZSB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7XG4gICAgICBjb250ZXh0OiB7IHNlbGVjdGFibGU6IHRyZWVTZWxlY3RhYmxlIH0sXG4gICAgfSA9IHRoaXMucHJvcHM7XG5cbiAgICAvLyBJZ25vcmUgd2hlbiBzZWxlY3RhYmxlIGlzIHVuZGVmaW5lZCBvciBudWxsXG4gICAgaWYgKHR5cGVvZiBzZWxlY3RhYmxlID09PSAnYm9vbGVhbicpIHtcbiAgICAgIHJldHVybiBzZWxlY3RhYmxlO1xuICAgIH1cblxuICAgIHJldHVybiB0cmVlU2VsZWN0YWJsZTtcbiAgfVxuXG4gICAgLy8gU3dpdGNoZXJcbiAgcmVuZGVyU3dpdGNoZXIgPSAoKSA9PiB7XG4gICAgICBjb25zdCB7IGV4cGFuZGVkLCBzd2l0Y2hlckljb246IHN3aXRjaGVySWNvbkZyb21Qcm9wcyB9ID0gdGhpcy5wcm9wcztcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgY29udGV4dDogeyBwcmVmaXhDbHMsIHN3aXRjaGVySWNvbjogc3dpdGNoZXJJY29uRnJvbUN0eCB9LFxuICAgICAgfSA9IHRoaXMucHJvcHM7XG4gIFxuICAgICAgY29uc3Qgc3dpdGNoZXJJY29uID0gc3dpdGNoZXJJY29uRnJvbVByb3BzIHx8IHN3aXRjaGVySWNvbkZyb21DdHg7XG4gIFxuICAgICAgaWYgKHRoaXMuaXNMZWFmKCkpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2NsYXNzTmFtZXMoYCR7cHJlZml4Q2xzfS1zd2l0Y2hlcmAsIGAke3ByZWZpeENsc30tc3dpdGNoZXItbm9vcGApfT5cbiAgICAgICAgICAgIHt0eXBlb2Ygc3dpdGNoZXJJY29uID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICAgID8gc3dpdGNoZXJJY29uKHsgLi4udGhpcy5wcm9wcywgaXNMZWFmOiB0cnVlIH0pXG4gICAgICAgICAgICAgIDogc3dpdGNoZXJJY29ufVxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgXG4gICAgICBjb25zdCBzd2l0Y2hlckNscyA9IGNsYXNzTmFtZXMoXG4gICAgICAgIGAke3ByZWZpeENsc30tc3dpdGNoZXJgLFxuICAgICAgICBgJHtwcmVmaXhDbHN9LXN3aXRjaGVyXyR7ZXhwYW5kZWQgPyBJQ09OX09QRU4gOiBJQ09OX0NMT1NFfWAsXG4gICAgICApO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPHNwYW4gb25DbGljaz17dGhpcy5vbkV4cGFuZH0gY2xhc3NOYW1lPXtzd2l0Y2hlckNsc30+XG4gICAgICAgICAge3R5cGVvZiBzd2l0Y2hlckljb24gPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgID8gc3dpdGNoZXJJY29uKHsgLi4udGhpcy5wcm9wcywgaXNMZWFmOiBmYWxzZSB9KVxuICAgICAgICAgICAgOiBzd2l0Y2hlckljb259XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgICk7XG4gIH07XG5cbiAgLy8gQ2hlY2tib3hcbiAgcmVuZGVyQ2hlY2tib3ggPSAoKSA9PiB7XG4gICAgY29uc3QgeyBjaGVja2VkLCBoYWxmQ2hlY2tlZCwgZGlzYWJsZUNoZWNrYm94IH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHtcbiAgICAgIGNvbnRleHQ6IHsgcHJlZml4Q2xzIH0sXG4gICAgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgZGlzYWJsZWQgPSB0aGlzLmlzRGlzYWJsZWQoKTtcbiAgICBjb25zdCBjaGVja2FibGUgPSB0aGlzLmlzQ2hlY2thYmxlKCk7XG5cbiAgICBpZiAoIWNoZWNrYWJsZSkgcmV0dXJuIG51bGw7XG5cbiAgICAvLyBbTGVnYWN5XSBDdXN0b20gZWxlbWVudCBzaG91bGQgYmUgc2VwYXJhdGUgd2l0aCBgY2hlY2thYmxlYCBpbiBmdXR1cmVcbiAgICBjb25zdCAkY3VzdG9tID0gdHlwZW9mIGNoZWNrYWJsZSAhPT0gJ2Jvb2xlYW4nID8gY2hlY2thYmxlIDogbnVsbDtcblxuICAgIHJldHVybiAoXG4gICAgICA8c3BhblxuICAgICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZXMoXG4gICAgICAgICAgYCR7cHJlZml4Q2xzfS1jaGVja2JveGAsXG4gICAgICAgICAgY2hlY2tlZCAmJiBgJHtwcmVmaXhDbHN9LWNoZWNrYm94LWNoZWNrZWRgLFxuICAgICAgICAgICFjaGVja2VkICYmIGhhbGZDaGVja2VkICYmIGAke3ByZWZpeENsc30tY2hlY2tib3gtaW5kZXRlcm1pbmF0ZWAsXG4gICAgICAgICAgKGRpc2FibGVkIHx8IGRpc2FibGVDaGVja2JveCkgJiYgYCR7cHJlZml4Q2xzfS1jaGVja2JveC1kaXNhYmxlZGAsXG4gICAgICAgICl9XG4gICAgICAgIG9uQ2xpY2s9e3RoaXMub25DaGVja31cbiAgICAgID5cbiAgICAgICAgeyRjdXN0b219XG4gICAgICA8L3NwYW4+XG4gICAgKTtcbiAgfTtcblxuICByZW5kZXJJY29uID0gKCkgPT4ge1xuICAgIGNvbnN0IHsgbG9hZGluZyB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7XG4gICAgICBjb250ZXh0OiB7IHByZWZpeENscyB9LFxuICAgIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxzcGFuXG4gICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhcbiAgICAgICAgICBgJHtwcmVmaXhDbHN9LWljb25FbGVgLFxuICAgICAgICAgIGAke3ByZWZpeENsc30taWNvbl9fJHt0aGlzLmdldE5vZGVTdGF0ZSgpIHx8ICdkb2N1J31gLFxuICAgICAgICAgIGxvYWRpbmcgJiYgYCR7cHJlZml4Q2xzfS1pY29uX2xvYWRpbmdgLFxuICAgICAgICApfVxuICAgICAgLz5cbiAgICApO1xuICB9O1xuXG4gIC8vIEljb24gKyBUaXRsZVxuICByZW5kZXJTZWxlY3RvciA9ICgpID0+IHtcbiAgICBjb25zdCB7IGRyYWdOb2RlSGlnaGxpZ2h0IH0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHsgdGl0bGUsIHNlbGVjdGVkLCBpY29uLCBsb2FkaW5nLCBkYXRhIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHtcbiAgICAgIGNvbnRleHQ6IHsgcHJlZml4Q2xzLCBzaG93SWNvbiwgaWNvbjogdHJlZUljb24sIGRyYWdnYWJsZSwgbG9hZERhdGEgfSxcbiAgICB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBkaXNhYmxlZCA9IHRoaXMuaXNEaXNhYmxlZCgpO1xuXG4gICAgY29uc3Qgd3JhcENsYXNzID0gYCR7cHJlZml4Q2xzfS1ub2RlLWNvbnRlbnQtd3JhcHBlcmA7XG5cbiAgICAvLyBJY29uIC0gU3RpbGwgc2hvdyBsb2FkaW5nIGljb24gd2hlbiBsb2FkaW5nIHdpdGhvdXQgc2hvd0ljb25cbiAgICBsZXQgJGljb247XG5cbiAgICBpZiAoc2hvd0ljb24pIHtcbiAgICAgIGNvbnN0IGN1cnJlbnRJY29uID0gaWNvbiB8fCB0cmVlSWNvbjtcblxuICAgICAgJGljb24gPSBjdXJyZW50SWNvbiA/IChcbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtjbGFzc05hbWVzKGAke3ByZWZpeENsc30taWNvbkVsZWAsIGAke3ByZWZpeENsc30taWNvbl9fY3VzdG9taXplYCl9PlxuICAgICAgICAgIHt0eXBlb2YgY3VycmVudEljb24gPT09ICdmdW5jdGlvbicgPyBjdXJyZW50SWNvbih0aGlzLnByb3BzKSA6IGN1cnJlbnRJY29ufVxuICAgICAgICA8L3NwYW4+XG4gICAgICApIDogKFxuICAgICAgICB0aGlzLnJlbmRlckljb24oKVxuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKGxvYWREYXRhICYmIGxvYWRpbmcpIHtcbiAgICAgICRpY29uID0gdGhpcy5yZW5kZXJJY29uKCk7XG4gICAgfVxuXG4gICAgLy8gVGl0bGVcbiAgICBjb25zdCAkdGl0bGUgPSAoXG4gICAgICA8c3BhbiBjbGFzc05hbWU9e2Ake3ByZWZpeENsc30tdGl0bGVgfT5cbiAgICAgICAge3R5cGVvZiB0aXRsZSA9PT0gJ2Z1bmN0aW9uJyA/IHRpdGxlKGRhdGEpIDogdGl0bGV9XG4gICAgICA8L3NwYW4+XG4gICAgKTtcblxuICAgIHJldHVybiAoXG4gICAgICA8c3BhblxuICAgICAgICByZWY9e3RoaXMuc2V0U2VsZWN0SGFuZGxlfVxuICAgICAgICB0aXRsZT17dHlwZW9mIHRpdGxlID09PSAnc3RyaW5nJyA/IHRpdGxlIDogJyd9XG4gICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhcbiAgICAgICAgICBgJHt3cmFwQ2xhc3N9YCxcbiAgICAgICAgICBgJHt3cmFwQ2xhc3N9LSR7dGhpcy5nZXROb2RlU3RhdGUoKSB8fCAnbm9ybWFsJ31gLFxuICAgICAgICAgICFkaXNhYmxlZCAmJiAoc2VsZWN0ZWQgfHwgZHJhZ05vZGVIaWdobGlnaHQpICYmIGAke3ByZWZpeENsc30tbm9kZS1zZWxlY3RlZGAsXG4gICAgICAgICAgIWRpc2FibGVkICYmIGRyYWdnYWJsZSAmJiAnZHJhZ2dhYmxlJyxcbiAgICAgICAgKX1cbiAgICAgICAgZHJhZ2dhYmxlPXsoIWRpc2FibGVkICYmIGRyYWdnYWJsZSkgfHwgdW5kZWZpbmVkfVxuICAgICAgICBhcmlhLWdyYWJiZWQ9eyghZGlzYWJsZWQgJiYgZHJhZ2dhYmxlKSB8fCB1bmRlZmluZWR9XG4gICAgICAgIG9uTW91c2VFbnRlcj17dGhpcy5vbk1vdXNlRW50ZXJ9XG4gICAgICAgIG9uTW91c2VMZWF2ZT17dGhpcy5vbk1vdXNlTGVhdmV9XG4gICAgICAgIG9uQ29udGV4dE1lbnU9e3RoaXMub25Db250ZXh0TWVudX1cbiAgICAgICAgb25DbGljaz17dGhpcy5vblNlbGVjdG9yQ2xpY2t9XG4gICAgICAgIG9uRG91YmxlQ2xpY2s9e3RoaXMub25TZWxlY3RvckRvdWJsZUNsaWNrfVxuICAgICAgICBvbkRyYWdTdGFydD17ZHJhZ2dhYmxlID8gdGhpcy5vbkRyYWdTdGFydCA6IHVuZGVmaW5lZH1cbiAgICAgID5cbiAgICAgICAgeyRpY29ufVxuICAgICAgICB7JHRpdGxlfVxuICAgICAgPC9zcGFuPlxuICAgICk7XG4gIH07XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHtcbiAgICAgIGV2ZW50S2V5LFxuICAgICAgY2xhc3NOYW1lLFxuICAgICAgc3R5bGUsXG4gICAgICBkcmFnT3ZlcixcbiAgICAgIGRyYWdPdmVyR2FwVG9wLFxuICAgICAgZHJhZ092ZXJHYXBCb3R0b20sXG4gICAgICBpc0xlYWYsXG4gICAgICBpc1N0YXJ0LFxuICAgICAgaXNFbmQsXG4gICAgICBleHBhbmRlZCxcbiAgICAgIHNlbGVjdGVkLFxuICAgICAgY2hlY2tlZCxcbiAgICAgIGhhbGZDaGVja2VkLFxuICAgICAgbG9hZGluZyxcbiAgICAgIGRvbVJlZixcbiAgICAgIGFjdGl2ZSxcbiAgICAgIG9uTW91c2VNb3ZlLFxuICAgICAgLi4ub3RoZXJQcm9wc1xuICAgIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHtcbiAgICAgIGNvbnRleHQ6IHsgcHJlZml4Q2xzLCBmaWx0ZXJUcmVlTm9kZSwgZHJhZ2dhYmxlLCBrZXlFbnRpdGllcyB9LFxuICAgIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IGRpc2FibGVkID0gdGhpcy5pc0Rpc2FibGVkKCk7XG4gICAgY29uc3QgZGF0YU9yQXJpYUF0dHJpYnV0ZVByb3BzID0gZ2V0RGF0YUFuZEFyaWEob3RoZXJQcm9wcyk7XG4gICAgY29uc3QgeyBsZXZlbCB9ID0ga2V5RW50aXRpZXNbZXZlbnRLZXldIHx8IHt9O1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXZcbiAgICAgICAgcmVmPXtkb21SZWZ9XG4gICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lcyhjbGFzc05hbWUsIGAke3ByZWZpeENsc30tdHJlZW5vZGVgLCB7XG4gICAgICAgICAgW2Ake3ByZWZpeENsc30tdHJlZW5vZGUtZGlzYWJsZWRgXTogZGlzYWJsZWQsXG4gICAgICAgICAgW2Ake3ByZWZpeENsc30tdHJlZW5vZGUtc3dpdGNoZXItJHtleHBhbmRlZCA/ICdvcGVuJyA6ICdjbG9zZSd9YF06ICFpc0xlYWYsXG4gICAgICAgICAgW2Ake3ByZWZpeENsc30tdHJlZW5vZGUtY2hlY2tib3gtY2hlY2tlZGBdOiBjaGVja2VkLFxuICAgICAgICAgIFtgJHtwcmVmaXhDbHN9LXRyZWVub2RlLWNoZWNrYm94LWluZGV0ZXJtaW5hdGVgXTogaGFsZkNoZWNrZWQsXG4gICAgICAgICAgW2Ake3ByZWZpeENsc30tdHJlZW5vZGUtc2VsZWN0ZWRgXTogc2VsZWN0ZWQsXG4gICAgICAgICAgW2Ake3ByZWZpeENsc30tdHJlZW5vZGUtbG9hZGluZ2BdOiBsb2FkaW5nLFxuICAgICAgICAgIFtgJHtwcmVmaXhDbHN9LXRyZWVub2RlLWFjdGl2ZWBdOiBhY3RpdmUsXG4gICAgICAgICAgW2Ake3ByZWZpeENsc30tdHJlZW5vZGUtY2hlY2thYmxlYF06dGhpcy5pc0NoZWNrYWJsZSgpLFxuICAgICAgICAgICdkcmFnLW92ZXInOiAhZGlzYWJsZWQgJiYgZHJhZ092ZXIsXG4gICAgICAgICAgJ2RyYWctb3Zlci1nYXAtdG9wJzogIWRpc2FibGVkICYmIGRyYWdPdmVyR2FwVG9wLFxuICAgICAgICAgICdkcmFnLW92ZXItZ2FwLWJvdHRvbSc6ICFkaXNhYmxlZCAmJiBkcmFnT3ZlckdhcEJvdHRvbSxcbiAgICAgICAgICAnZmlsdGVyLW5vZGUnOiBmaWx0ZXJUcmVlTm9kZSAmJiBmaWx0ZXJUcmVlTm9kZShjb252ZXJ0Tm9kZVByb3BzVG9FdmVudERhdGEodGhpcy5wcm9wcykpLFxuICAgICAgICB9KX1cbiAgICAgICAgc3R5bGU9e3N0eWxlfVxuICAgICAgICBvbkRyYWdFbnRlcj17ZHJhZ2dhYmxlID8gdGhpcy5vbkRyYWdFbnRlciA6IHVuZGVmaW5lZH1cbiAgICAgICAgb25EcmFnT3Zlcj17ZHJhZ2dhYmxlID8gdGhpcy5vbkRyYWdPdmVyIDogdW5kZWZpbmVkfVxuICAgICAgICBvbkRyYWdMZWF2ZT17ZHJhZ2dhYmxlID8gdGhpcy5vbkRyYWdMZWF2ZSA6IHVuZGVmaW5lZH1cbiAgICAgICAgb25Ecm9wPXtkcmFnZ2FibGUgPyB0aGlzLm9uRHJvcCA6IHVuZGVmaW5lZH1cbiAgICAgICAgb25EcmFnRW5kPXtkcmFnZ2FibGUgPyB0aGlzLm9uRHJhZ0VuZCA6IHVuZGVmaW5lZH1cbiAgICAgICAgb25Nb3VzZU1vdmU9e29uTW91c2VNb3ZlfVxuICAgICAgICB7Li4uZGF0YU9yQXJpYUF0dHJpYnV0ZVByb3BzfVxuICAgICAgPlxuICAgICAgICA8SW5kZW50IHByZWZpeENscz17cHJlZml4Q2xzfSBsZXZlbD17bGV2ZWx9IGlzU3RhcnQ9e2lzU3RhcnR9IGlzRW5kPXtpc0VuZH0gLz5cbiAgICAgICAge3RoaXMucmVuZGVyU3dpdGNoZXIoKX1cbiAgICAgICAge3RoaXMucmVuZGVyQ2hlY2tib3goKX1cbiAgICAgICAge3RoaXMucmVuZGVyU2VsZWN0b3IoKX1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cblxucG9seWZpbGwoSW50ZXJuYWxUcmVlTm9kZSk7XG5cbmNvbnN0IENvbnRleHRUcmVlTm9kZTogUmVhY3QuRkM8VHJlZU5vZGVQcm9wcz4gPSBwcm9wcyA9PiAoXG4gIDxUcmVlQ29udGV4dC5Db25zdW1lcj5cbiAgICB7Y29udGV4dCA9PiA8SW50ZXJuYWxUcmVlTm9kZSB7Li4ucHJvcHN9IGNvbnRleHQ9e2NvbnRleHR9IC8+fVxuICA8L1RyZWVDb250ZXh0LkNvbnN1bWVyPlxuKTtcblxuQ29udGV4dFRyZWVOb2RlLmRpc3BsYXlOYW1lID0gJ1RyZWVOb2RlJztcblxuQ29udGV4dFRyZWVOb2RlLmRlZmF1bHRQcm9wcyA9IHtcbiAgdGl0bGU6IGRlZmF1bHRUaXRsZSxcbn07XG5cbihDb250ZXh0VHJlZU5vZGUgYXMgYW55KS5pc1RyZWVOb2RlID0gMTtcblxuZXhwb3J0IHsgSW50ZXJuYWxUcmVlTm9kZSB9O1xuXG5leHBvcnQgZGVmYXVsdCBDb250ZXh0VHJlZU5vZGU7XG4iXSwidmVyc2lvbiI6M30=