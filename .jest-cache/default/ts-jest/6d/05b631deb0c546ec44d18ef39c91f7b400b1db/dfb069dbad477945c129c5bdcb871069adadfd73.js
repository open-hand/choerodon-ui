/* eslint-disable */
// TODO: https://www.w3.org/TR/2017/NOTE-wai-aria-practices-1.1-20171214/examples/treeview/treeview-2/treeview-2a.html
// Fully accessibility support
/**
 * most of it is move form the rc-tree ts lint pass the source code so there add the ts ignore
 */
// tslint:disable
// @ts-nocheck 
import * as React from 'react';
import PropTypes from 'prop-types';
import KeyCode from 'rc-util/lib/KeyCode';
import warning from '../../_util/warning';
import classNames from 'classnames';
import { polyfill } from 'react-lifecycles-compat';
import { TreeContext } from './contextTypes';
import { getDataAndAria, getDragNodesKeys, parseCheckedKeys, conductExpandParent, calcSelectedKeys, calcDropPosition, arrAdd, arrDel, posToArr, } from './util';
import { flattenTreeData, convertTreeToData, convertDataToEntities, warningWithoutKey, convertNodePropsToEventData, getTreeNodeProps, } from './utils/treeUtil';
import NodeList, { MOTION_KEY, MotionEntity } from './NodeList';
import TreeNode from './TreeNode';
import { conductCheck } from './utils/conductUtil';
const keyPropType = PropTypes.oneOfType([PropTypes.string, PropTypes.number]);
class Tree extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            keyEntities: {},
            selectedKeys: [],
            checkedKeys: [],
            halfCheckedKeys: [],
            loadedKeys: [],
            loadingKeys: [],
            expandedKeys: [],
            dragging: false,
            dragNodesKeys: [],
            dragOverNodeKey: null,
            dropPosition: null,
            treeData: [],
            flattenNodes: [],
            focused: false,
            activeKey: null,
            prevProps: null,
        };
        this.listRef = React.createRef();
        this.onNodeDragStart = (event, node) => {
            const { expandedKeys, keyEntities } = this.state;
            const { onDragStart } = this.props;
            const { eventKey } = node.props;
            this.dragNode = node;
            this.setState({
                dragging: true,
                dragNodesKeys: getDragNodesKeys(eventKey, keyEntities),
                expandedKeys: arrDel(expandedKeys, eventKey),
            });
            if (onDragStart) {
                onDragStart({ event, node: convertNodePropsToEventData(node.props) });
            }
        };
        /**
         * [Legacy] Select handler is less small than node,
         * so that this will trigger when drag enter node or select handler.
         * This is a little tricky if customize css without padding.
         * Better for use mouse move event to refresh drag state.
         * But let's just keep it to avoid event trigger logic change.
         */
        this.onNodeDragEnter = (event, node) => {
            const { expandedKeys, keyEntities } = this.state;
            const { onDragEnter } = this.props;
            const { pos, eventKey } = node.props;
            if (!this.dragNode)
                return;
            const dropPosition = calcDropPosition(event, node);
            // Skip if drag node is self
            if (this.dragNode.props.eventKey === eventKey && dropPosition === 0) {
                this.setState({
                    dragOverNodeKey: '',
                    dropPosition: null,
                });
                return;
            }
            // Ref: https://github.com/react-component/tree/issues/132
            // Add timeout to let onDragLevel fire before onDragEnter,
            // so that we can clean drag props for onDragLeave node.
            // Macro task for this:
            // https://html.spec.whatwg.org/multipage/webappapis.html#clean-up-after-running-script
            setTimeout(() => {
                // Update drag over node
                this.setState({
                    dragOverNodeKey: eventKey,
                    dropPosition,
                });
                // Side effect for delay drag
                if (!this.delayedDragEnterLogic) {
                    this.delayedDragEnterLogic = {};
                }
                Object.keys(this.delayedDragEnterLogic).forEach(key => {
                    clearTimeout(this.delayedDragEnterLogic[key]);
                });
                this.delayedDragEnterLogic[pos] = window.setTimeout(() => {
                    if (!this.state.dragging)
                        return;
                    let newExpandedKeys = [...expandedKeys];
                    const entity = keyEntities[eventKey];
                    if (entity && (entity.children || []).length) {
                        newExpandedKeys = arrAdd(expandedKeys, eventKey);
                    }
                    if (!('expandedKeys' in this.props)) {
                        this.setState({
                            expandedKeys: newExpandedKeys,
                        });
                    }
                    if (onDragEnter) {
                        onDragEnter({
                            event,
                            node: convertNodePropsToEventData(node.props),
                            expandedKeys: newExpandedKeys,
                        });
                    }
                }, 400);
            }, 0);
        };
        this.onNodeDragOver = (event, node) => {
            const { onDragOver } = this.props;
            const { eventKey } = node.props;
            // Update drag position
            if (this.dragNode && eventKey === this.state.dragOverNodeKey) {
                const dropPosition = calcDropPosition(event, node);
                if (dropPosition === this.state.dropPosition)
                    return;
                this.setState({
                    dropPosition,
                });
            }
            if (onDragOver) {
                onDragOver({ event, node: convertNodePropsToEventData(node.props) });
            }
        };
        this.onNodeDragLeave = (event, node) => {
            const { onDragLeave } = this.props;
            this.setState({
                dragOverNodeKey: '',
            });
            if (onDragLeave) {
                onDragLeave({ event, node: convertNodePropsToEventData(node.props) });
            }
        };
        this.onNodeDragEnd = (event, node) => {
            const { onDragEnd } = this.props;
            this.setState({
                dragOverNodeKey: '',
            });
            this.cleanDragState();
            if (onDragEnd) {
                onDragEnd({ event, node: convertNodePropsToEventData(node.props) });
            }
            this.dragNode = null;
        };
        this.onNodeDrop = (event, node) => {
            const { dragNodesKeys = [], dropPosition } = this.state;
            const { onDrop } = this.props;
            const { eventKey, pos } = node.props;
            this.setState({
                dragOverNodeKey: '',
            });
            this.cleanDragState();
            if (dragNodesKeys.indexOf(eventKey) !== -1) {
                warning(false, "Can not drop to dragNode(include it's children node)");
                return;
            }
            const posArr = posToArr(pos);
            const dropResult = {
                event,
                node: convertNodePropsToEventData(node.props),
                dragNode: convertNodePropsToEventData(this.dragNode.props),
                dragNodesKeys: dragNodesKeys.slice(),
                dropPosition: dropPosition + Number(posArr[posArr.length - 1]),
                dropToGap: false,
            };
            if (dropPosition !== 0) {
                dropResult.dropToGap = true;
            }
            if (onDrop) {
                onDrop(dropResult);
            }
            this.dragNode = null;
        };
        this.cleanDragState = () => {
            const { dragging } = this.state;
            if (dragging) {
                this.setState({
                    dragging: false,
                });
            }
        };
        this.onNodeClick = (e, treeNode) => {
            const { onClick } = this.props;
            if (onClick) {
                onClick(e, treeNode);
            }
        };
        this.onNodeDoubleClick = (e, treeNode) => {
            const { onDoubleClick } = this.props;
            if (onDoubleClick) {
                onDoubleClick(e, treeNode);
            }
        };
        this.onNodeSelect = (e, treeNode) => {
            let { selectedKeys } = this.state;
            const { keyEntities } = this.state;
            const { onSelect, multiple } = this.props;
            const { selected, key } = treeNode;
            const targetSelected = !selected;
            // Update selected keys
            if (!targetSelected) {
                selectedKeys = arrDel(selectedKeys, key);
            }
            else if (!multiple) {
                selectedKeys = [key];
            }
            else {
                selectedKeys = arrAdd(selectedKeys, key);
            }
            // [Legacy] Not found related usage in doc or upper libs
            const selectedNodes = selectedKeys
                .map(selectedKey => {
                const entity = keyEntities[selectedKey];
                if (!entity)
                    return null;
                return entity.node;
            })
                .filter(node => node);
            this.setUncontrolledState({ selectedKeys });
            if (onSelect) {
                onSelect(selectedKeys, {
                    event: 'select',
                    selected: targetSelected,
                    node: treeNode,
                    selectedNodes,
                    nativeEvent: e.nativeEvent,
                });
            }
        };
        this.onNodeCheck = (e, treeNode, checked) => {
            const { keyEntities, checkedKeys: oriCheckedKeys, halfCheckedKeys: oriHalfCheckedKeys, } = this.state;
            const { checkStrictly, onCheck } = this.props;
            const { key } = treeNode;
            // Prepare trigger arguments
            let checkedObj;
            const eventObj = {
                event: 'check',
                node: treeNode,
                checked,
                nativeEvent: e.nativeEvent,
            };
            if (checkStrictly) {
                const checkedKeys = checked
                    ? arrAdd(oriCheckedKeys, key)
                    : arrDel(oriCheckedKeys, key);
                const halfCheckedKeys = arrDel(oriHalfCheckedKeys, key);
                checkedObj = { checked: checkedKeys, halfChecked: halfCheckedKeys };
                eventObj.checkedNodes = checkedKeys
                    .map(checkedKey => keyEntities[checkedKey])
                    .filter(entity => entity)
                    .map(entity => entity.node);
                this.setUncontrolledState({ checkedKeys });
            }
            else {
                // Always fill first
                let { checkedKeys, halfCheckedKeys } = conductCheck([...oriCheckedKeys, key], true, keyEntities);
                // If remove, we do it again to correction
                if (!checked) {
                    const keySet = new Set(checkedKeys);
                    keySet.delete(key);
                    ({ checkedKeys, halfCheckedKeys } = conductCheck(Array.from(keySet), { checked: false, halfCheckedKeys }, keyEntities));
                }
                checkedObj = checkedKeys;
                // [Legacy] This is used for `rc-tree-select`
                eventObj.checkedNodes = [];
                eventObj.checkedNodesPositions = [];
                eventObj.halfCheckedKeys = halfCheckedKeys;
                checkedKeys.forEach(checkedKey => {
                    const entity = keyEntities[checkedKey];
                    if (!entity)
                        return;
                    const { node, pos } = entity;
                    eventObj.checkedNodes.push(node);
                    eventObj.checkedNodesPositions.push({ node, pos });
                });
                this.setUncontrolledState({
                    checkedKeys,
                    halfCheckedKeys,
                });
            }
            if (onCheck) {
                onCheck(checkedObj, eventObj);
            }
        };
        this.onNodeLoad = (treeNode) => new Promise(resolve => {
            // We need to get the latest state of loading/loaded keys
            this.setState(({ loadedKeys = [], loadingKeys = [] }) => {
                const { loadData, onLoad } = this.props;
                const { key } = treeNode;
                if (!loadData ||
                    loadedKeys.indexOf(key) !== -1 ||
                    loadingKeys.indexOf(key) !== -1) {
                    // react 15 will warn if return null
                    return {};
                }
                // Process load data
                const promise = loadData(treeNode);
                promise.then(() => {
                    const { loadedKeys: currentLoadedKeys, loadingKeys: currentLoadingKeys, } = this.state;
                    const newLoadedKeys = arrAdd(currentLoadedKeys, key);
                    const newLoadingKeys = arrDel(currentLoadingKeys, key);
                    // onLoad should trigger before internal setState to avoid `loadData` trigger twice.
                    // https://github.com/ant-design/ant-design/issues/12464
                    if (onLoad) {
                        onLoad(newLoadedKeys, {
                            event: 'load',
                            node: treeNode,
                        });
                    }
                    this.setUncontrolledState({
                        loadedKeys: newLoadedKeys,
                    });
                    this.setState({
                        loadingKeys: newLoadingKeys,
                    });
                    resolve();
                });
                return {
                    loadingKeys: arrAdd(loadingKeys, key),
                };
            });
        });
        this.onNodeExpand = (e, treeNode) => {
            let { expandedKeys } = this.state;
            const { treeData } = this.state;
            const { onExpand, loadData } = this.props;
            const { key, expanded } = treeNode;
            // Update selected keys
            const index = expandedKeys.indexOf(key);
            const targetExpanded = !expanded;
            warning((expanded && index !== -1) || (!expanded && index === -1), 'Expand state not sync with index check');
            if (targetExpanded) {
                expandedKeys = arrAdd(expandedKeys, key);
            }
            else {
                expandedKeys = arrDel(expandedKeys, key);
            }
            const flattenNodes = flattenTreeData(treeData, expandedKeys);
            this.setUncontrolledState({ expandedKeys, flattenNodes }, true);
            if (onExpand) {
                onExpand(expandedKeys, {
                    node: treeNode,
                    expanded: targetExpanded,
                    nativeEvent: e.nativeEvent,
                });
            }
            // Async Load data
            if (targetExpanded && loadData) {
                const loadPromise = this.onNodeLoad(treeNode);
                return loadPromise
                    ? loadPromise.then(() => {
                        // [Legacy] Refresh logic
                        const newFlattenTreeData = flattenTreeData(this.state.treeData, expandedKeys);
                        this.setUncontrolledState({ flattenNodes: newFlattenTreeData });
                    })
                    : null;
            }
            return null;
        };
        this.onNodeMouseEnter = (event, node) => {
            const { onMouseEnter } = this.props;
            if (onMouseEnter) {
                onMouseEnter({ event, node });
            }
        };
        this.onNodeMouseLeave = (event, node) => {
            const { onMouseLeave } = this.props;
            if (onMouseLeave) {
                onMouseLeave({ event, node });
            }
        };
        this.onNodeContextMenu = (event, node) => {
            const { onRightClick } = this.props;
            if (onRightClick) {
                event.preventDefault();
                onRightClick({ event, node });
            }
        };
        this.onFocus = (...args) => {
            const { onFocus } = this.props;
            this.setState({ focused: true });
            if (onFocus) {
                onFocus(...args);
            }
        };
        this.onBlur = (...args) => {
            const { onBlur } = this.props;
            this.setState({ focused: false });
            this.onActiveChange(null);
            if (onBlur) {
                onBlur(...args);
            }
        };
        this.getTreeNodeRequiredProps = () => {
            const { expandedKeys, selectedKeys, loadedKeys, loadingKeys, checkedKeys, halfCheckedKeys, dragOverNodeKey, dropPosition, keyEntities, } = this.state;
            return {
                expandedKeys: expandedKeys || [],
                selectedKeys: selectedKeys || [],
                loadedKeys: loadedKeys || [],
                loadingKeys: loadingKeys || [],
                checkedKeys: checkedKeys || [],
                halfCheckedKeys: halfCheckedKeys || [],
                dragOverNodeKey,
                dropPosition,
                keyEntities,
            };
        };
        // =========================== Keyboard ===========================
        this.onActiveChange = (activeKey) => {
            const { onActiveChange } = this.props;
            this.setState({ activeKey });
            if (activeKey !== null) {
                this.scrollTo({ key: activeKey });
            }
            if (onActiveChange) {
                onActiveChange(activeKey);
            }
        };
        this.getActiveItem = () => {
            const { activeKey, flattenNodes } = this.state;
            if (activeKey === null) {
                return null;
            }
            return flattenNodes.find(({ data: { key } }) => key === activeKey) || null;
        };
        this.offsetActiveKey = (offset) => {
            const { flattenNodes, activeKey } = this.state;
            let index = flattenNodes.findIndex(({ data: { key } }) => key === activeKey);
            // Align with index
            if (index === -1 && offset < 0) {
                index = flattenNodes.length;
            }
            index = (index + offset + flattenNodes.length) % flattenNodes.length;
            const item = flattenNodes[index];
            if (item) {
                const { key } = item.data;
                this.onActiveChange(key);
            }
            else {
                this.onActiveChange(null);
            }
        };
        this.onKeyDown = event => {
            const { activeKey, expandedKeys, checkedKeys } = this.state;
            const { onKeyDown, checkable, selectable } = this.props;
            // >>>>>>>>>> Direction
            switch (event.which) {
                case KeyCode.UP: {
                    this.offsetActiveKey(-1);
                    event.preventDefault();
                    break;
                }
                case KeyCode.DOWN: {
                    this.offsetActiveKey(1);
                    event.preventDefault();
                    break;
                }
            }
            // >>>>>>>>>> Expand & Selection
            const activeItem = this.getActiveItem();
            if (activeItem && activeItem.data) {
                const treeNodeRequiredProps = this.getTreeNodeRequiredProps();
                const expandable = activeItem.data.isLeaf === false ||
                    !!(activeItem.data.children || []).length;
                const eventNode = convertNodePropsToEventData({
                    ...getTreeNodeProps(activeKey, treeNodeRequiredProps),
                    data: activeItem.data,
                    active: true,
                });
                switch (event.which) {
                    // >>> Expand
                    case KeyCode.LEFT: {
                        // Collapse if possible
                        if (expandable && expandedKeys.includes(activeKey)) {
                            this.onNodeExpand({}, eventNode);
                        }
                        else if (activeItem.parent) {
                            this.onActiveChange(activeItem.parent.data.key);
                        }
                        event.preventDefault();
                        break;
                    }
                    case KeyCode.RIGHT: {
                        // Expand if possible
                        if (expandable && !expandedKeys.includes(activeKey)) {
                            this.onNodeExpand({}, eventNode);
                        }
                        else if (activeItem.children && activeItem.children.length) {
                            this.onActiveChange(activeItem.children[0].data.key);
                        }
                        event.preventDefault();
                        break;
                    }
                    // Selection
                    case KeyCode.ENTER:
                    case KeyCode.SPACE: {
                        if (checkable &&
                            !eventNode.disabled &&
                            eventNode.checkable !== false &&
                            !eventNode.disableCheckbox) {
                            this.onNodeCheck({}, eventNode, !checkedKeys.includes(activeKey));
                        }
                        else if (!checkable &&
                            selectable &&
                            !eventNode.disabled &&
                            eventNode.selectable !== false) {
                            this.onNodeSelect({}, eventNode);
                        }
                        break;
                    }
                }
            }
            if (onKeyDown) {
                onKeyDown(event);
            }
        };
        /**
         * Only update the value which is not in props
         */
        this.setUncontrolledState = (state, atomic = false) => {
            let needSync = false;
            let allPassed = true;
            const newState = {};
            Object.keys(state).forEach(name => {
                if (name in this.props) {
                    allPassed = false;
                    return;
                }
                needSync = true;
                newState[name] = state[name];
            });
            if (needSync && (!atomic || allPassed)) {
                this.setState(newState);
            }
        };
        this.scrollTo = scroll => {
            this.listRef.current.scrollTo(scroll);
        };
    }
    static getDerivedStateFromProps(props, prevState) {
        const { prevProps } = prevState;
        const newState = {
            prevProps: props,
        };
        function needSync(name) {
            return ((!prevProps && name in props) ||
                (prevProps && prevProps[name] !== props[name]));
        }
        // ================== Tree Node ==================
        let treeData;
        // Check if `treeData` or `children` changed and save into the state.
        if (needSync('treeData')) {
            ({ treeData } = props);
        }
        else if (needSync('children')) {
            /**
             * 后续可以考虑使用treeData 重构tree pro
             */
            // warning(
            //   false,
            //   '`children` of Tree is deprecated. Please use `treeData` instead.',
            // );
            treeData = convertTreeToData(props.children);
        }
        // Save flatten nodes info and convert `treeData` into keyEntities
        if (treeData) {
            newState.treeData = treeData;
            const entitiesMap = convertDataToEntities(treeData);
            newState.keyEntities = {
                [MOTION_KEY]: MotionEntity,
                ...entitiesMap.keyEntities,
            };
            // Warning if treeNode not provide key
            if (process.env.NODE_ENV !== 'production') {
                warningWithoutKey(treeData);
            }
        }
        const keyEntities = newState.keyEntities || prevState.keyEntities;
        // ================ expandedKeys =================
        if (needSync('expandedKeys') ||
            (prevProps && needSync('autoExpandParent'))) {
            newState.expandedKeys =
                props.autoExpandParent || (!prevProps && props.defaultExpandParent)
                    ? conductExpandParent(props.expandedKeys, keyEntities)
                    : props.expandedKeys;
        }
        else if (!prevProps && props.defaultExpandAll) {
            const cloneKeyEntities = { ...keyEntities };
            delete cloneKeyEntities[MOTION_KEY];
            newState.expandedKeys = Object.keys(cloneKeyEntities).map(key => cloneKeyEntities[key].key);
        }
        else if (!prevProps && props.defaultExpandedKeys) {
            newState.expandedKeys =
                props.autoExpandParent || props.defaultExpandParent
                    ? conductExpandParent(props.defaultExpandedKeys, keyEntities)
                    : props.defaultExpandedKeys;
        }
        if (!newState.expandedKeys) {
            delete newState.expandedKeys;
        }
        // ================ flattenNodes =================
        if (treeData || newState.expandedKeys) {
            const flattenNodes = flattenTreeData(treeData || prevState.treeData, newState.expandedKeys || prevState.expandedKeys);
            newState.flattenNodes = flattenNodes;
        }
        // ================ selectedKeys =================
        if (props.selectable) {
            if (needSync('selectedKeys')) {
                newState.selectedKeys = calcSelectedKeys(props.selectedKeys, props);
            }
            else if (!prevProps && props.defaultSelectedKeys) {
                newState.selectedKeys = calcSelectedKeys(props.defaultSelectedKeys, props);
            }
        }
        // ================= checkedKeys =================
        if (props.checkable) {
            let checkedKeyEntity;
            if (needSync('checkedKeys')) {
                checkedKeyEntity = parseCheckedKeys(props.checkedKeys) || {};
            }
            else if (!prevProps && props.defaultCheckedKeys) {
                checkedKeyEntity = parseCheckedKeys(props.defaultCheckedKeys) || {};
            }
            else if (treeData) {
                // If `treeData` changed, we also need check it
                checkedKeyEntity = parseCheckedKeys(props.checkedKeys) || {
                    checkedKeys: prevState.checkedKeys,
                    halfCheckedKeys: prevState.halfCheckedKeys,
                };
            }
            if (checkedKeyEntity) {
                let { checkedKeys = [], halfCheckedKeys = [] } = checkedKeyEntity;
                if (!props.checkStrictly) {
                    const conductKeys = conductCheck(checkedKeys, true, keyEntities);
                    ({ checkedKeys, halfCheckedKeys } = conductKeys);
                }
                newState.checkedKeys = checkedKeys;
                newState.halfCheckedKeys = halfCheckedKeys;
            }
        }
        // ================= loadedKeys ==================
        if (needSync('loadedKeys')) {
            newState.loadedKeys = props.loadedKeys;
        }
        return newState;
    }
    render() {
        const { focused, flattenNodes, keyEntities, dragging, activeKey, } = this.state;
        const { prefixCls, className, style, showLine, focusable, tabIndex = 0, selectable, showIcon, icon, switcherIcon, draggable, checkable, checkStrictly, disabled, motion, loadData, filterTreeNode, height, itemHeight, virtual, } = this.props;
        const domProps = getDataAndAria(this.props);
        return (React.createElement(TreeContext.Provider, { value: {
                prefixCls,
                selectable,
                showIcon,
                icon,
                switcherIcon,
                draggable,
                checkable,
                checkStrictly,
                disabled,
                keyEntities,
                loadData,
                filterTreeNode,
                onNodeClick: this.onNodeClick,
                onNodeDoubleClick: this.onNodeDoubleClick,
                onNodeExpand: this.onNodeExpand,
                onNodeSelect: this.onNodeSelect,
                onNodeCheck: this.onNodeCheck,
                onNodeLoad: this.onNodeLoad,
                onNodeMouseEnter: this.onNodeMouseEnter,
                onNodeMouseLeave: this.onNodeMouseLeave,
                onNodeContextMenu: this.onNodeContextMenu,
                onNodeDragStart: this.onNodeDragStart,
                onNodeDragEnter: this.onNodeDragEnter,
                onNodeDragOver: this.onNodeDragOver,
                onNodeDragLeave: this.onNodeDragLeave,
                onNodeDragEnd: this.onNodeDragEnd,
                onNodeDrop: this.onNodeDrop,
            } },
            React.createElement("div", { className: classNames(prefixCls, className, {
                    [`${prefixCls}-show-line`]: showLine,
                    [`${prefixCls}-focused`]: focused,
                    [`${prefixCls}-active-focused`]: activeKey !== null,
                }) },
                React.createElement(NodeList, Object.assign({ ref: this.listRef, prefixCls: prefixCls, style: style, data: flattenNodes, disabled: disabled, selectable: selectable, checkable: checkable ? 1 : 0, motion: motion, dragging: dragging, height: height, itemHeight: itemHeight, virtual: virtual, focusable: focusable, focused: focused, tabIndex: tabIndex, activeItem: this.getActiveItem(), onFocus: this.onFocus, onBlur: this.onBlur, onKeyDown: this.onKeyDown, onActiveChange: this.onActiveChange }, this.getTreeNodeRequiredProps(), domProps)))));
    }
}
Tree.propTypes = {
    prefixCls: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    tabIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    children: PropTypes.any,
    treeData: PropTypes.array,
    showLine: PropTypes.bool,
    showIcon: PropTypes.bool,
    icon: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    selectable: PropTypes.bool,
    disabled: PropTypes.bool,
    multiple: PropTypes.bool,
    checkable: PropTypes.oneOfType([PropTypes.bool, PropTypes.node]),
    checkStrictly: PropTypes.bool,
    draggable: PropTypes.bool,
    defaultExpandParent: PropTypes.bool,
    autoExpandParent: PropTypes.bool,
    defaultExpandAll: PropTypes.bool,
    defaultExpandedKeys: PropTypes.arrayOf(keyPropType),
    expandedKeys: PropTypes.arrayOf(keyPropType),
    defaultCheckedKeys: PropTypes.arrayOf(keyPropType),
    checkedKeys: PropTypes.oneOfType([
        PropTypes.arrayOf(keyPropType),
        PropTypes.object,
    ]),
    defaultSelectedKeys: PropTypes.arrayOf(keyPropType),
    selectedKeys: PropTypes.arrayOf(keyPropType),
    onClick: PropTypes.func,
    onDoubleClick: PropTypes.func,
    onExpand: PropTypes.func,
    onCheck: PropTypes.func,
    onSelect: PropTypes.func,
    onLoad: PropTypes.func,
    loadData: PropTypes.func,
    loadedKeys: PropTypes.arrayOf(keyPropType),
    onMouseEnter: PropTypes.func,
    onMouseLeave: PropTypes.func,
    onRightClick: PropTypes.func,
    onDragStart: PropTypes.func,
    onDragEnter: PropTypes.func,
    onDragOver: PropTypes.func,
    onDragLeave: PropTypes.func,
    onDragEnd: PropTypes.func,
    onDrop: PropTypes.func,
    filterTreeNode: PropTypes.func,
    motion: PropTypes.object,
    switcherIcon: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};
Tree.defaultProps = {
    prefixCls: 'rc-tree',
    showLine: false,
    showIcon: true,
    selectable: true,
    multiple: false,
    checkable: false,
    disabled: false,
    checkStrictly: false,
    draggable: false,
    defaultExpandParent: true,
    autoExpandParent: false,
    defaultExpandAll: false,
    defaultExpandedKeys: [],
    defaultCheckedKeys: [],
    defaultSelectedKeys: [],
};
Tree.TreeNode = TreeNode;
polyfill(Tree);
export default Tree;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMvcmMtY29tcG9uZW50cy90cmVlL1RyZWUudHN4IiwibWFwcGluZ3MiOiJBQUFBLG9CQUFvQjtBQUNwQixzSEFBc0g7QUFDdEgsOEJBQThCO0FBQzlCOztHQUVHO0FBR0gsaUJBQWlCO0FBQ2pCLGVBQWU7QUFFZixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMvQixPQUFPLFNBQVMsTUFBTSxZQUFZLENBQUM7QUFDbkMsT0FBTyxPQUFPLE1BQU0scUJBQXFCLENBQUM7QUFDMUMsT0FBTyxPQUFPLE1BQU0scUJBQXFCLENBQUM7QUFDMUMsT0FBTyxVQUFVLE1BQU0sWUFBWSxDQUFDO0FBQ3BDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVuRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDN0MsT0FBTyxFQUNMLGNBQWMsRUFDZCxnQkFBZ0IsRUFDaEIsZ0JBQWdCLEVBQ2hCLG1CQUFtQixFQUNuQixnQkFBZ0IsRUFDaEIsZ0JBQWdCLEVBQ2hCLE1BQU0sRUFDTixNQUFNLEVBQ04sUUFBUSxHQUNULE1BQU0sUUFBUSxDQUFDO0FBV2hCLE9BQU8sRUFDTCxlQUFlLEVBQ2YsaUJBQWlCLEVBQ2pCLHFCQUFxQixFQUNyQixpQkFBaUIsRUFDakIsMkJBQTJCLEVBQzNCLGdCQUFnQixHQUNqQixNQUFNLGtCQUFrQixDQUFDO0FBQzFCLE9BQU8sUUFBUSxFQUFFLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBZSxNQUFNLFlBQVksQ0FBQztBQUM3RSxPQUFPLFFBQVEsTUFBTSxZQUFZLENBQUM7QUFDbEMsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBb0puRCxNQUFNLFdBQVcsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FB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QU07SUFDeEIsWUFBWSxFQUFFLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUNwRSxDQUFDO0FBRUssaUJBQVksR0FBRztJQUNwQixTQUFTLEVBQUUsU0FBUztJQUNwQixRQUFRLEVBQUUsS0FBSztJQUNmLFFBQVEsRUFBRSxJQUFJO0lBQ2QsVUFBVSxFQUFFLElBQUk7SUFDaEIsUUFBUSxFQUFFLEtBQUs7SUFDZixTQUFTLEVBQUUsS0FBSztJQUNoQixRQUFRLEVBQUUsS0FBSztJQUNmLGFBQWEsRUFBRSxLQUFLO0lBQ3BCLFNBQVMsRUFBRSxLQUFLO0lBQ2hCLG1CQUFtQixFQUFFLElBQUk7SUFDekIsZ0JBQWdCLEVBQUUsS0FBSztJQUN2QixnQkFBZ0IsRUFBRSxLQUFLO0lBQ3ZCLG1CQUFtQixFQUFFLEVBQUU7SUFDdkIsa0JBQWtCLEVBQUUsRUFBRTtJQUN0QixtQkFBbUIsRUFBRSxFQUFFO0NBQ3hCLENBQUM7QUFFSyxhQUFRLEdBQUcsUUFBUSxDQUFDO0FBazhCN0IsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBRWYsZUFBZSxJQUFJLENBQUMiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMvcmMtY29tcG9uZW50cy90cmVlL1RyZWUudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qIGVzbGludC1kaXNhYmxlICovXG4vLyBUT0RPOiBodHRwczovL3d3dy53My5vcmcvVFIvMjAxNy9OT1RFLXdhaS1hcmlhLXByYWN0aWNlcy0xLjEtMjAxNzEyMTQvZXhhbXBsZXMvdHJlZXZpZXcvdHJlZXZpZXctMi90cmVldmlldy0yYS5odG1sXG4vLyBGdWxseSBhY2Nlc3NpYmlsaXR5IHN1cHBvcnRcbi8qKlxuICogbW9zdCBvZiBpdCBpcyBtb3ZlIGZvcm0gdGhlIHJjLXRyZWUgdHMgbGludCBwYXNzIHRoZSBzb3VyY2UgY29kZSBzbyB0aGVyZSBhZGQgdGhlIHRzIGlnbm9yZVxuICovXG5cblxuLy8gdHNsaW50OmRpc2FibGVcbi8vIEB0cy1ub2NoZWNrIFxuXG5pbXBvcnQgKiBhcyBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IEtleUNvZGUgZnJvbSAncmMtdXRpbC9saWIvS2V5Q29kZSc7XG5pbXBvcnQgd2FybmluZyBmcm9tICcuLi8uLi9fdXRpbC93YXJuaW5nJztcbmltcG9ydCBjbGFzc05hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHsgcG9seWZpbGwgfSBmcm9tICdyZWFjdC1saWZlY3ljbGVzLWNvbXBhdCc7XG5cbmltcG9ydCB7IFRyZWVDb250ZXh0IH0gZnJvbSAnLi9jb250ZXh0VHlwZXMnO1xuaW1wb3J0IHtcbiAgZ2V0RGF0YUFuZEFyaWEsXG4gIGdldERyYWdOb2Rlc0tleXMsXG4gIHBhcnNlQ2hlY2tlZEtleXMsXG4gIGNvbmR1Y3RFeHBhbmRQYXJlbnQsXG4gIGNhbGNTZWxlY3RlZEtleXMsXG4gIGNhbGNEcm9wUG9zaXRpb24sXG4gIGFyckFkZCxcbiAgYXJyRGVsLFxuICBwb3NUb0Fycixcbn0gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7XG4gIERhdGFOb2RlLFxuICBJY29uVHlwZSxcbiAgS2V5LFxuICBGbGF0dGVuTm9kZSxcbiAgRGF0YUVudGl0eSxcbiAgRXZlbnREYXRhTm9kZSxcbiAgTm9kZUluc3RhbmNlLFxuICBTY3JvbGxUbyxcbn0gZnJvbSAnLi9pbnRlcmZhY2UnO1xuaW1wb3J0IHtcbiAgZmxhdHRlblRyZWVEYXRhLFxuICBjb252ZXJ0VHJlZVRvRGF0YSxcbiAgY29udmVydERhdGFUb0VudGl0aWVzLFxuICB3YXJuaW5nV2l0aG91dEtleSxcbiAgY29udmVydE5vZGVQcm9wc1RvRXZlbnREYXRhLFxuICBnZXRUcmVlTm9kZVByb3BzLFxufSBmcm9tICcuL3V0aWxzL3RyZWVVdGlsJztcbmltcG9ydCBOb2RlTGlzdCwgeyBNT1RJT05fS0VZLCBNb3Rpb25FbnRpdHksIE5vZGVMaXN0UmVmIH0gZnJvbSAnLi9Ob2RlTGlzdCc7XG5pbXBvcnQgVHJlZU5vZGUgZnJvbSAnLi9UcmVlTm9kZSc7XG5pbXBvcnQgeyBjb25kdWN0Q2hlY2sgfSBmcm9tICcuL3V0aWxzL2NvbmR1Y3RVdGlsJztcblxuaW50ZXJmYWNlIENoZWNrSW5mbyB7XG4gIGV2ZW50OiAnY2hlY2snO1xuICBub2RlOiBFdmVudERhdGFOb2RlO1xuICBjaGVja2VkOiBib29sZWFuO1xuICBuYXRpdmVFdmVudDogTW91c2VFdmVudDtcbiAgY2hlY2tlZE5vZGVzOiBEYXRhTm9kZVtdO1xuICBjaGVja2VkTm9kZXNQb3NpdGlvbnM/OiB7IG5vZGU6IERhdGFOb2RlOyBwb3M6IHN0cmluZyB9W107XG4gIGhhbGZDaGVja2VkS2V5cz86IEtleVtdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFRyZWVQcm9wcyB7XG4gIHByZWZpeENsczogc3RyaW5nO1xuICBjbGFzc05hbWU/OiBzdHJpbmc7XG4gIHN0eWxlPzogUmVhY3QuQ1NTUHJvcGVydGllcztcbiAgZm9jdXNhYmxlPzogYm9vbGVhbjtcbiAgdGFiSW5kZXg/OiBudW1iZXI7XG4gIGNoaWxkcmVuPzogUmVhY3QuUmVhY3ROb2RlO1xuICB0cmVlRGF0YT86IERhdGFOb2RlW107IC8vIEdlbmVyYXRlIHRyZWVOb2RlIGJ5IGNoaWxkcmVuXG4gIHNob3dMaW5lPzogYm9vbGVhbjtcbiAgc2hvd0ljb24/OiBib29sZWFuO1xuICBpY29uPzogSWNvblR5cGU7XG4gIHNlbGVjdGFibGU/OiBib29sZWFuO1xuICBkaXNhYmxlZD86IGJvb2xlYW47XG4gIG11bHRpcGxlPzogYm9vbGVhbjtcbiAgY2hlY2thYmxlPzogYm9vbGVhbiB8IFJlYWN0LlJlYWN0Tm9kZTtcbiAgY2hlY2tTdHJpY3RseT86IGJvb2xlYW47XG4gIGRyYWdnYWJsZT86IGJvb2xlYW47XG4gIGRlZmF1bHRFeHBhbmRQYXJlbnQ/OiBib29sZWFuO1xuICBhdXRvRXhwYW5kUGFyZW50PzogYm9vbGVhbjtcbiAgZGVmYXVsdEV4cGFuZEFsbD86IGJvb2xlYW47XG4gIGRlZmF1bHRFeHBhbmRlZEtleXM/OiBLZXlbXTtcbiAgZXhwYW5kZWRLZXlzPzogS2V5W107XG4gIGRlZmF1bHRDaGVja2VkS2V5cz86IEtleVtdO1xuICBjaGVja2VkS2V5cz86IEtleVtdIHwgeyBjaGVja2VkOiBLZXlbXTsgaGFsZkNoZWNrZWQ6IEtleVtdIH07XG4gIGRlZmF1bHRTZWxlY3RlZEtleXM/OiBLZXlbXTtcbiAgc2VsZWN0ZWRLZXlzPzogS2V5W107XG4gIG9uRm9jdXM/OiBSZWFjdC5Gb2N1c0V2ZW50SGFuZGxlcjxIVE1MRGl2RWxlbWVudD47XG4gIG9uQmx1cj86IFJlYWN0LkZvY3VzRXZlbnRIYW5kbGVyPEhUTUxEaXZFbGVtZW50PjtcbiAgb25LZXlEb3duPzogUmVhY3QuS2V5Ym9hcmRFdmVudEhhbmRsZXI8SFRNTERpdkVsZW1lbnQ+O1xuICBvbkNsaWNrPzogKGU6IFJlYWN0Lk1vdXNlRXZlbnQsIHRyZWVOb2RlOiBFdmVudERhdGFOb2RlKSA9PiB2b2lkO1xuICBvbkRvdWJsZUNsaWNrPzogKGU6IFJlYWN0Lk1vdXNlRXZlbnQsIHRyZWVOb2RlOiBFdmVudERhdGFOb2RlKSA9PiB2b2lkO1xuICBvbkV4cGFuZD86IChcbiAgICBleHBhbmRlZEtleXM6IEtleVtdLFxuICAgIGluZm86IHtcbiAgICAgIG5vZGU6IEV2ZW50RGF0YU5vZGU7XG4gICAgICBleHBhbmRlZDogYm9vbGVhbjtcbiAgICAgIG5hdGl2ZUV2ZW50OiBNb3VzZUV2ZW50O1xuICAgIH0sXG4gICkgPT4gdm9pZDtcbiAgb25DaGVjaz86IChcbiAgICBjaGVja2VkOiB7IGNoZWNrZWQ6IEtleVtdOyBoYWxmQ2hlY2tlZDogS2V5W10gfSB8IEtleVtdLFxuICAgIGluZm86IENoZWNrSW5mbyxcbiAgKSA9PiB2b2lkO1xuICBvblNlbGVjdD86IChcbiAgICBzZWxlY3RlZEtleXM6IEtleVtdLFxuICAgIGluZm86IHtcbiAgICAgIGV2ZW50OiAnc2VsZWN0JztcbiAgICAgIHNlbGVjdGVkOiBib29sZWFuO1xuICAgICAgbm9kZTogRXZlbnREYXRhTm9kZTtcbiAgICAgIHNlbGVjdGVkTm9kZXM6IERhdGFOb2RlW107XG4gICAgICBuYXRpdmVFdmVudDogTW91c2VFdmVudDtcbiAgICB9LFxuICApID0+IHZvaWQ7XG4gIG9uTG9hZD86IChcbiAgICBsb2FkZWRLZXlzOiBLZXlbXSxcbiAgICBpbmZvOiB7XG4gICAgICBldmVudDogJ2xvYWQnO1xuICAgICAgbm9kZTogRXZlbnREYXRhTm9kZTtcbiAgICB9LFxuICApID0+IHZvaWQ7XG4gIGxvYWREYXRhPzogKHRyZWVOb2RlOiBFdmVudERhdGFOb2RlKSA9PiBQcm9taXNlPHZvaWQ+O1xuICBsb2FkZWRLZXlzPzogS2V5W107XG4gIG9uTW91c2VFbnRlcj86IChpbmZvOiB7XG4gICAgZXZlbnQ6IFJlYWN0Lk1vdXNlRXZlbnQ7XG4gICAgbm9kZTogRXZlbnREYXRhTm9kZTtcbiAgfSkgPT4gdm9pZDtcbiAgb25Nb3VzZUxlYXZlPzogKGluZm86IHtcbiAgICBldmVudDogUmVhY3QuTW91c2VFdmVudDtcbiAgICBub2RlOiBFdmVudERhdGFOb2RlO1xuICB9KSA9PiB2b2lkO1xuICBvblJpZ2h0Q2xpY2s/OiAoaW5mbzoge1xuICAgIGV2ZW50OiBSZWFjdC5Nb3VzZUV2ZW50O1xuICAgIG5vZGU6IEV2ZW50RGF0YU5vZGU7XG4gIH0pID0+IHZvaWQ7XG4gIG9uRHJhZ1N0YXJ0PzogKGluZm86IHtcbiAgICBldmVudDogUmVhY3QuTW91c2VFdmVudDtcbiAgICBub2RlOiBFdmVudERhdGFOb2RlO1xuICB9KSA9PiB2b2lkO1xuICBvbkRyYWdFbnRlcj86IChpbmZvOiB7XG4gICAgZXZlbnQ6IFJlYWN0Lk1vdXNlRXZlbnQ7XG4gICAgbm9kZTogRXZlbnREYXRhTm9kZTtcbiAgICBleHBhbmRlZEtleXM6IEtleVtdO1xuICB9KSA9PiB2b2lkO1xuICBvbkRyYWdPdmVyPzogKGluZm86IHsgZXZlbnQ6IFJlYWN0Lk1vdXNlRXZlbnQ7IG5vZGU6IEV2ZW50RGF0YU5vZGUgfSkgPT4gdm9pZDtcbiAgb25EcmFnTGVhdmU/OiAoaW5mbzoge1xuICAgIGV2ZW50OiBSZWFjdC5Nb3VzZUV2ZW50O1xuICAgIG5vZGU6IEV2ZW50RGF0YU5vZGU7XG4gIH0pID0+IHZvaWQ7XG4gIG9uRHJhZ0VuZD86IChpbmZvOiB7IGV2ZW50OiBSZWFjdC5Nb3VzZUV2ZW50OyBub2RlOiBFdmVudERhdGFOb2RlIH0pID0+IHZvaWQ7XG4gIG9uRHJvcD86IChpbmZvOiB7XG4gICAgZXZlbnQ6IFJlYWN0Lk1vdXNlRXZlbnQ7XG4gICAgbm9kZTogRXZlbnREYXRhTm9kZTtcbiAgICBkcmFnTm9kZTogRXZlbnREYXRhTm9kZTtcbiAgICBkcmFnTm9kZXNLZXlzOiBLZXlbXTtcbiAgICBkcm9wUG9zaXRpb246IG51bWJlcjtcbiAgICBkcm9wVG9HYXA6IGJvb2xlYW47XG4gIH0pID0+IHZvaWQ7XG4gIC8qKlxuICAgKiBVc2VkIGZvciBgcmMtdHJlZS1zZWxlY3RgIG9ubHkuXG4gICAqIERvIG5vdCB1c2UgaW4geW91ciBwcm9kdWN0aW9uIGNvZGUgZGlyZWN0bHkgc2luY2UgdGhpcyB3aWxsIGJlIHJlZmFjdG9yLlxuICAgKi9cbiAgb25BY3RpdmVDaGFuZ2U/OiAoa2V5OiBLZXkpID0+IHZvaWQ7XG4gIGZpbHRlclRyZWVOb2RlPzogKHRyZWVOb2RlOiBFdmVudERhdGFOb2RlKSA9PiBib29sZWFuO1xuICBtb3Rpb24/OiBhbnk7XG4gIHN3aXRjaGVySWNvbj86IEljb25UeXBlO1xuXG4gIC8vIFZpcnR1YWwgTGlzdFxuICBoZWlnaHQ/OiBudW1iZXI7XG4gIGl0ZW1IZWlnaHQ/OiBudW1iZXI7XG4gIHZpcnR1YWw/OiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgVHJlZVN0YXRlIHtcbiAga2V5RW50aXRpZXM6IFJlY29yZDxLZXksIERhdGFFbnRpdHk+O1xuXG4gIHNlbGVjdGVkS2V5czogS2V5W107XG4gIGNoZWNrZWRLZXlzOiBLZXlbXTtcbiAgaGFsZkNoZWNrZWRLZXlzOiBLZXlbXTtcbiAgbG9hZGVkS2V5czogS2V5W107XG4gIGxvYWRpbmdLZXlzOiBLZXlbXTtcbiAgZXhwYW5kZWRLZXlzOiBLZXlbXTtcblxuICBkcmFnZ2luZzogYm9vbGVhbjtcbiAgZHJhZ05vZGVzS2V5czogS2V5W107XG4gIGRyYWdPdmVyTm9kZUtleTogS2V5O1xuICBkcm9wUG9zaXRpb246IG51bWJlcjtcblxuICB0cmVlRGF0YTogRGF0YU5vZGVbXTtcbiAgZmxhdHRlbk5vZGVzOiBGbGF0dGVuTm9kZVtdO1xuXG4gIGZvY3VzZWQ6IGJvb2xlYW47XG4gIGFjdGl2ZUtleTogS2V5O1xuXG4gIHByZXZQcm9wczogVHJlZVByb3BzO1xufVxuXG5jb25zdCBrZXlQcm9wVHlwZSA9IFByb3BUeXBlcy5vbmVPZlR5cGUoW1Byb3BUeXBlcy5zdHJpbmcsIFByb3BUeXBlcy5udW1iZXJdKTtcblxuY2xhc3MgVHJlZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxUcmVlUHJvcHMsIFRyZWVTdGF0ZT4ge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIHByZWZpeENsczogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBjbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgc3R5bGU6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgdGFiSW5kZXg6IFByb3BUeXBlcy5vbmVPZlR5cGUoW1Byb3BUeXBlcy5zdHJpbmcsIFByb3BUeXBlcy5udW1iZXJdKSxcbiAgICBjaGlsZHJlbjogUHJvcFR5cGVzLmFueSxcbiAgICB0cmVlRGF0YTogUHJvcFR5cGVzLmFycmF5LCAvLyBHZW5lcmF0ZSB0cmVlTm9kZSBieSBjaGlsZHJlblxuICAgIHNob3dMaW5lOiBQcm9wVHlwZXMuYm9vbCxcbiAgICBzaG93SWNvbjogUHJvcFR5cGVzLmJvb2wsXG4gICAgaWNvbjogUHJvcFR5cGVzLm9uZU9mVHlwZShbUHJvcFR5cGVzLm5vZGUsIFByb3BUeXBlcy5mdW5jXSksXG4gICAgc2VsZWN0YWJsZTogUHJvcFR5cGVzLmJvb2wsXG4gICAgZGlzYWJsZWQ6IFByb3BUeXBlcy5ib29sLFxuICAgIG11bHRpcGxlOiBQcm9wVHlwZXMuYm9vbCxcbiAgICBjaGVja2FibGU6IFByb3BUeXBlcy5vbmVPZlR5cGUoW1Byb3BUeXBlcy5ib29sLCBQcm9wVHlwZXMubm9kZV0pLFxuICAgIGNoZWNrU3RyaWN0bHk6IFByb3BUeXBlcy5ib29sLFxuICAgIGRyYWdnYWJsZTogUHJvcFR5cGVzLmJvb2wsXG4gICAgZGVmYXVsdEV4cGFuZFBhcmVudDogUHJvcFR5cGVzLmJvb2wsXG4gICAgYXV0b0V4cGFuZFBhcmVudDogUHJvcFR5cGVzLmJvb2wsXG4gICAgZGVmYXVsdEV4cGFuZEFsbDogUHJvcFR5cGVzLmJvb2wsXG4gICAgZGVmYXVsdEV4cGFuZGVkS2V5czogUHJvcFR5cGVzLmFycmF5T2Yoa2V5UHJvcFR5cGUpLFxuICAgIGV4cGFuZGVkS2V5czogUHJvcFR5cGVzLmFycmF5T2Yoa2V5UHJvcFR5cGUpLFxuICAgIGRlZmF1bHRDaGVja2VkS2V5czogUHJvcFR5cGVzLmFycmF5T2Yoa2V5UHJvcFR5cGUpLFxuICAgIGNoZWNrZWRLZXlzOiBQcm9wVHlwZXMub25lT2ZUeXBlKFtcbiAgICAgIFByb3BUeXBlcy5hcnJheU9mKGtleVByb3BUeXBlKSxcbiAgICAgIFByb3BUeXBlcy5vYmplY3QsXG4gICAgXSksXG4gICAgZGVmYXVsdFNlbGVjdGVkS2V5czogUHJvcFR5cGVzLmFycmF5T2Yoa2V5UHJvcFR5cGUpLFxuICAgIHNlbGVjdGVkS2V5czogUHJvcFR5cGVzLmFycmF5T2Yoa2V5UHJvcFR5cGUpLFxuICAgIG9uQ2xpY2s6IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uRG91YmxlQ2xpY2s6IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uRXhwYW5kOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvbkNoZWNrOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvblNlbGVjdDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25Mb2FkOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBsb2FkRGF0YTogUHJvcFR5cGVzLmZ1bmMsXG4gICAgbG9hZGVkS2V5czogUHJvcFR5cGVzLmFycmF5T2Yoa2V5UHJvcFR5cGUpLFxuICAgIG9uTW91c2VFbnRlcjogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25Nb3VzZUxlYXZlOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvblJpZ2h0Q2xpY2s6IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uRHJhZ1N0YXJ0OiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvbkRyYWdFbnRlcjogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25EcmFnT3ZlcjogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25EcmFnTGVhdmU6IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uRHJhZ0VuZDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25Ecm9wOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBmaWx0ZXJUcmVlTm9kZTogUHJvcFR5cGVzLmZ1bmMsXG4gICAgbW90aW9uOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIHN3aXRjaGVySWNvbjogUHJvcFR5cGVzLm9uZU9mVHlwZShbUHJvcFR5cGVzLm5vZGUsIFByb3BUeXBlcy5mdW5jXSksXG4gIH07XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICBwcmVmaXhDbHM6ICdyYy10cmVlJyxcbiAgICBzaG93TGluZTogZmFsc2UsXG4gICAgc2hvd0ljb246IHRydWUsXG4gICAgc2VsZWN0YWJsZTogdHJ1ZSxcbiAgICBtdWx0aXBsZTogZmFsc2UsXG4gICAgY2hlY2thYmxlOiBmYWxzZSxcbiAgICBkaXNhYmxlZDogZmFsc2UsXG4gICAgY2hlY2tTdHJpY3RseTogZmFsc2UsXG4gICAgZHJhZ2dhYmxlOiBmYWxzZSxcbiAgICBkZWZhdWx0RXhwYW5kUGFyZW50OiB0cnVlLFxuICAgIGF1dG9FeHBhbmRQYXJlbnQ6IGZhbHNlLFxuICAgIGRlZmF1bHRFeHBhbmRBbGw6IGZhbHNlLFxuICAgIGRlZmF1bHRFeHBhbmRlZEtleXM6IFtdLFxuICAgIGRlZmF1bHRDaGVja2VkS2V5czogW10sXG4gICAgZGVmYXVsdFNlbGVjdGVkS2V5czogW10sXG4gIH07XG5cbiAgc3RhdGljIFRyZWVOb2RlID0gVHJlZU5vZGU7XG5cbiAgZGVsYXllZERyYWdFbnRlckxvZ2ljOiBSZWNvcmQ8S2V5LCBudW1iZXI+O1xuXG4gIHN0YXRlOiBUcmVlU3RhdGUgPSB7XG4gICAga2V5RW50aXRpZXM6IHt9LFxuXG4gICAgc2VsZWN0ZWRLZXlzOiBbXSxcbiAgICBjaGVja2VkS2V5czogW10sXG4gICAgaGFsZkNoZWNrZWRLZXlzOiBbXSxcbiAgICBsb2FkZWRLZXlzOiBbXSxcbiAgICBsb2FkaW5nS2V5czogW10sXG4gICAgZXhwYW5kZWRLZXlzOiBbXSxcblxuICAgIGRyYWdnaW5nOiBmYWxzZSxcbiAgICBkcmFnTm9kZXNLZXlzOiBbXSxcbiAgICBkcmFnT3Zlck5vZGVLZXk6IG51bGwsXG4gICAgZHJvcFBvc2l0aW9uOiBudWxsLFxuXG4gICAgdHJlZURhdGE6IFtdLFxuICAgIGZsYXR0ZW5Ob2RlczogW10sXG5cbiAgICBmb2N1c2VkOiBmYWxzZSxcbiAgICBhY3RpdmVLZXk6IG51bGwsXG5cbiAgICBwcmV2UHJvcHM6IG51bGwsXG4gIH07XG5cbiAgZHJhZ05vZGU6IE5vZGVJbnN0YW5jZTtcblxuICBsaXN0UmVmID0gUmVhY3QuY3JlYXRlUmVmPE5vZGVMaXN0UmVmPigpO1xuXG4gIHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMocHJvcHM6IFRyZWVQcm9wcywgcHJldlN0YXRlOiBUcmVlU3RhdGUpIHtcbiAgICBjb25zdCB7IHByZXZQcm9wcyB9ID0gcHJldlN0YXRlO1xuICAgIGNvbnN0IG5ld1N0YXRlOiBQYXJ0aWFsPFRyZWVTdGF0ZT4gPSB7XG4gICAgICBwcmV2UHJvcHM6IHByb3BzLFxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBuZWVkU3luYyhuYW1lOiBzdHJpbmcpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgICghcHJldlByb3BzICYmIG5hbWUgaW4gcHJvcHMpIHx8XG4gICAgICAgIChwcmV2UHJvcHMgJiYgcHJldlByb3BzW25hbWVdICE9PSBwcm9wc1tuYW1lXSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09IFRyZWUgTm9kZSA9PT09PT09PT09PT09PT09PT1cbiAgICBsZXQgdHJlZURhdGE6IERhdGFOb2RlW107XG5cbiAgICAvLyBDaGVjayBpZiBgdHJlZURhdGFgIG9yIGBjaGlsZHJlbmAgY2hhbmdlZCBhbmQgc2F2ZSBpbnRvIHRoZSBzdGF0ZS5cbiAgICBpZiAobmVlZFN5bmMoJ3RyZWVEYXRhJykpIHtcbiAgICAgICh7IHRyZWVEYXRhIH0gPSBwcm9wcyk7XG4gICAgfSBlbHNlIGlmIChuZWVkU3luYygnY2hpbGRyZW4nKSkge1xuICAgICAgLyoqXG4gICAgICAgKiDlkI7nu63lj6/ku6XogIPomZHkvb/nlKh0cmVlRGF0YSDph43mnoR0cmVlIHByb1xuICAgICAgICovXG4gICAgICAvLyB3YXJuaW5nKFxuICAgICAgLy8gICBmYWxzZSxcbiAgICAgIC8vICAgJ2BjaGlsZHJlbmAgb2YgVHJlZSBpcyBkZXByZWNhdGVkLiBQbGVhc2UgdXNlIGB0cmVlRGF0YWAgaW5zdGVhZC4nLFxuICAgICAgLy8gKTtcbiAgICAgIHRyZWVEYXRhID0gY29udmVydFRyZWVUb0RhdGEocHJvcHMuY2hpbGRyZW4pO1xuICAgIH1cblxuICAgIC8vIFNhdmUgZmxhdHRlbiBub2RlcyBpbmZvIGFuZCBjb252ZXJ0IGB0cmVlRGF0YWAgaW50byBrZXlFbnRpdGllc1xuICAgIGlmICh0cmVlRGF0YSkge1xuICAgICAgbmV3U3RhdGUudHJlZURhdGEgPSB0cmVlRGF0YTtcbiAgICAgIGNvbnN0IGVudGl0aWVzTWFwID0gY29udmVydERhdGFUb0VudGl0aWVzKHRyZWVEYXRhKTtcbiAgICAgIG5ld1N0YXRlLmtleUVudGl0aWVzID0ge1xuICAgICAgICBbTU9USU9OX0tFWV06IE1vdGlvbkVudGl0eSxcbiAgICAgICAgLi4uZW50aXRpZXNNYXAua2V5RW50aXRpZXMsXG4gICAgICB9O1xuXG4gICAgICAvLyBXYXJuaW5nIGlmIHRyZWVOb2RlIG5vdCBwcm92aWRlIGtleVxuICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgICAgd2FybmluZ1dpdGhvdXRLZXkodHJlZURhdGEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGtleUVudGl0aWVzID0gbmV3U3RhdGUua2V5RW50aXRpZXMgfHwgcHJldlN0YXRlLmtleUVudGl0aWVzO1xuXG4gICAgLy8gPT09PT09PT09PT09PT09PSBleHBhbmRlZEtleXMgPT09PT09PT09PT09PT09PT1cbiAgICBpZiAoXG4gICAgICBuZWVkU3luYygnZXhwYW5kZWRLZXlzJykgfHxcbiAgICAgIChwcmV2UHJvcHMgJiYgbmVlZFN5bmMoJ2F1dG9FeHBhbmRQYXJlbnQnKSlcbiAgICApIHtcbiAgICAgIG5ld1N0YXRlLmV4cGFuZGVkS2V5cyA9XG4gICAgICAgIHByb3BzLmF1dG9FeHBhbmRQYXJlbnQgfHwgKCFwcmV2UHJvcHMgJiYgcHJvcHMuZGVmYXVsdEV4cGFuZFBhcmVudClcbiAgICAgICAgICA/IGNvbmR1Y3RFeHBhbmRQYXJlbnQocHJvcHMuZXhwYW5kZWRLZXlzLCBrZXlFbnRpdGllcylcbiAgICAgICAgICA6IHByb3BzLmV4cGFuZGVkS2V5cztcbiAgICB9IGVsc2UgaWYgKCFwcmV2UHJvcHMgJiYgcHJvcHMuZGVmYXVsdEV4cGFuZEFsbCkge1xuICAgICAgY29uc3QgY2xvbmVLZXlFbnRpdGllcyA9IHsgLi4ua2V5RW50aXRpZXMgfTtcbiAgICAgIGRlbGV0ZSBjbG9uZUtleUVudGl0aWVzW01PVElPTl9LRVldO1xuICAgICAgbmV3U3RhdGUuZXhwYW5kZWRLZXlzID0gT2JqZWN0LmtleXMoY2xvbmVLZXlFbnRpdGllcykubWFwKFxuICAgICAgICBrZXkgPT4gY2xvbmVLZXlFbnRpdGllc1trZXldLmtleSxcbiAgICAgICk7XG4gICAgfSBlbHNlIGlmICghcHJldlByb3BzICYmIHByb3BzLmRlZmF1bHRFeHBhbmRlZEtleXMpIHtcbiAgICAgIG5ld1N0YXRlLmV4cGFuZGVkS2V5cyA9XG4gICAgICAgIHByb3BzLmF1dG9FeHBhbmRQYXJlbnQgfHwgcHJvcHMuZGVmYXVsdEV4cGFuZFBhcmVudFxuICAgICAgICAgID8gY29uZHVjdEV4cGFuZFBhcmVudChwcm9wcy5kZWZhdWx0RXhwYW5kZWRLZXlzLCBrZXlFbnRpdGllcylcbiAgICAgICAgICA6IHByb3BzLmRlZmF1bHRFeHBhbmRlZEtleXM7XG4gICAgfVxuXG4gICAgaWYgKCFuZXdTdGF0ZS5leHBhbmRlZEtleXMpIHtcbiAgICAgIGRlbGV0ZSBuZXdTdGF0ZS5leHBhbmRlZEtleXM7XG4gICAgfVxuXG4gICAgLy8gPT09PT09PT09PT09PT09PSBmbGF0dGVuTm9kZXMgPT09PT09PT09PT09PT09PT1cbiAgICBpZiAodHJlZURhdGEgfHwgbmV3U3RhdGUuZXhwYW5kZWRLZXlzKSB7XG4gICAgICBjb25zdCBmbGF0dGVuTm9kZXM6IEZsYXR0ZW5Ob2RlW10gPSBmbGF0dGVuVHJlZURhdGEoXG4gICAgICAgIHRyZWVEYXRhIHx8IHByZXZTdGF0ZS50cmVlRGF0YSxcbiAgICAgICAgbmV3U3RhdGUuZXhwYW5kZWRLZXlzIHx8IHByZXZTdGF0ZS5leHBhbmRlZEtleXMsXG4gICAgICApO1xuICAgICAgbmV3U3RhdGUuZmxhdHRlbk5vZGVzID0gZmxhdHRlbk5vZGVzO1xuICAgIH1cblxuICAgIC8vID09PT09PT09PT09PT09PT0gc2VsZWN0ZWRLZXlzID09PT09PT09PT09PT09PT09XG4gICAgaWYgKHByb3BzLnNlbGVjdGFibGUpIHtcbiAgICAgIGlmIChuZWVkU3luYygnc2VsZWN0ZWRLZXlzJykpIHtcbiAgICAgICAgbmV3U3RhdGUuc2VsZWN0ZWRLZXlzID0gY2FsY1NlbGVjdGVkS2V5cyhwcm9wcy5zZWxlY3RlZEtleXMsIHByb3BzKTtcbiAgICAgIH0gZWxzZSBpZiAoIXByZXZQcm9wcyAmJiBwcm9wcy5kZWZhdWx0U2VsZWN0ZWRLZXlzKSB7XG4gICAgICAgIG5ld1N0YXRlLnNlbGVjdGVkS2V5cyA9IGNhbGNTZWxlY3RlZEtleXMoXG4gICAgICAgICAgcHJvcHMuZGVmYXVsdFNlbGVjdGVkS2V5cyxcbiAgICAgICAgICBwcm9wcyxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PSBjaGVja2VkS2V5cyA9PT09PT09PT09PT09PT09PVxuICAgIGlmIChwcm9wcy5jaGVja2FibGUpIHtcbiAgICAgIGxldCBjaGVja2VkS2V5RW50aXR5O1xuXG4gICAgICBpZiAobmVlZFN5bmMoJ2NoZWNrZWRLZXlzJykpIHtcbiAgICAgICAgY2hlY2tlZEtleUVudGl0eSA9IHBhcnNlQ2hlY2tlZEtleXMocHJvcHMuY2hlY2tlZEtleXMpIHx8IHt9O1xuICAgICAgfSBlbHNlIGlmICghcHJldlByb3BzICYmIHByb3BzLmRlZmF1bHRDaGVja2VkS2V5cykge1xuICAgICAgICBjaGVja2VkS2V5RW50aXR5ID0gcGFyc2VDaGVja2VkS2V5cyhwcm9wcy5kZWZhdWx0Q2hlY2tlZEtleXMpIHx8IHt9O1xuICAgICAgfSBlbHNlIGlmICh0cmVlRGF0YSkge1xuICAgICAgICAvLyBJZiBgdHJlZURhdGFgIGNoYW5nZWQsIHdlIGFsc28gbmVlZCBjaGVjayBpdFxuICAgICAgICBjaGVja2VkS2V5RW50aXR5ID0gcGFyc2VDaGVja2VkS2V5cyhwcm9wcy5jaGVja2VkS2V5cykgfHwge1xuICAgICAgICAgIGNoZWNrZWRLZXlzOiBwcmV2U3RhdGUuY2hlY2tlZEtleXMsXG4gICAgICAgICAgaGFsZkNoZWNrZWRLZXlzOiBwcmV2U3RhdGUuaGFsZkNoZWNrZWRLZXlzLFxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBpZiAoY2hlY2tlZEtleUVudGl0eSkge1xuICAgICAgICBsZXQgeyBjaGVja2VkS2V5cyA9IFtdLCBoYWxmQ2hlY2tlZEtleXMgPSBbXSB9ID0gY2hlY2tlZEtleUVudGl0eTtcblxuICAgICAgICBpZiAoIXByb3BzLmNoZWNrU3RyaWN0bHkpIHtcbiAgICAgICAgICBjb25zdCBjb25kdWN0S2V5cyA9IGNvbmR1Y3RDaGVjayhjaGVja2VkS2V5cywgdHJ1ZSwga2V5RW50aXRpZXMpO1xuICAgICAgICAgICh7IGNoZWNrZWRLZXlzLCBoYWxmQ2hlY2tlZEtleXMgfSA9IGNvbmR1Y3RLZXlzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG5ld1N0YXRlLmNoZWNrZWRLZXlzID0gY2hlY2tlZEtleXM7XG4gICAgICAgIG5ld1N0YXRlLmhhbGZDaGVja2VkS2V5cyA9IGhhbGZDaGVja2VkS2V5cztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PSBsb2FkZWRLZXlzID09PT09PT09PT09PT09PT09PVxuICAgIGlmIChuZWVkU3luYygnbG9hZGVkS2V5cycpKSB7XG4gICAgICBuZXdTdGF0ZS5sb2FkZWRLZXlzID0gcHJvcHMubG9hZGVkS2V5cztcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3U3RhdGU7XG4gIH1cblxuICBvbk5vZGVEcmFnU3RhcnQgPSAoXG4gICAgZXZlbnQ6IFJlYWN0Lk1vdXNlRXZlbnQ8SFRNTERpdkVsZW1lbnQ+LFxuICAgIG5vZGU6IE5vZGVJbnN0YW5jZSxcbiAgKSA9PiB7XG4gICAgY29uc3QgeyBleHBhbmRlZEtleXMsIGtleUVudGl0aWVzIH0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHsgb25EcmFnU3RhcnQgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgeyBldmVudEtleSB9ID0gbm9kZS5wcm9wcztcblxuICAgIHRoaXMuZHJhZ05vZGUgPSBub2RlO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBkcmFnZ2luZzogdHJ1ZSxcbiAgICAgIGRyYWdOb2Rlc0tleXM6IGdldERyYWdOb2Rlc0tleXMoZXZlbnRLZXksIGtleUVudGl0aWVzKSxcbiAgICAgIGV4cGFuZGVkS2V5czogYXJyRGVsKGV4cGFuZGVkS2V5cywgZXZlbnRLZXkpLFxuICAgIH0pO1xuXG4gICAgaWYgKG9uRHJhZ1N0YXJ0KSB7XG4gICAgICBvbkRyYWdTdGFydCh7IGV2ZW50LCBub2RlOiBjb252ZXJ0Tm9kZVByb3BzVG9FdmVudERhdGEobm9kZS5wcm9wcykgfSk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBbTGVnYWN5XSBTZWxlY3QgaGFuZGxlciBpcyBsZXNzIHNtYWxsIHRoYW4gbm9kZSxcbiAgICogc28gdGhhdCB0aGlzIHdpbGwgdHJpZ2dlciB3aGVuIGRyYWcgZW50ZXIgbm9kZSBvciBzZWxlY3QgaGFuZGxlci5cbiAgICogVGhpcyBpcyBhIGxpdHRsZSB0cmlja3kgaWYgY3VzdG9taXplIGNzcyB3aXRob3V0IHBhZGRpbmcuXG4gICAqIEJldHRlciBmb3IgdXNlIG1vdXNlIG1vdmUgZXZlbnQgdG8gcmVmcmVzaCBkcmFnIHN0YXRlLlxuICAgKiBCdXQgbGV0J3MganVzdCBrZWVwIGl0IHRvIGF2b2lkIGV2ZW50IHRyaWdnZXIgbG9naWMgY2hhbmdlLlxuICAgKi9cbiAgb25Ob2RlRHJhZ0VudGVyID0gKFxuICAgIGV2ZW50OiBSZWFjdC5Nb3VzZUV2ZW50PEhUTUxEaXZFbGVtZW50PixcbiAgICBub2RlOiBOb2RlSW5zdGFuY2UsXG4gICkgPT4ge1xuICAgIGNvbnN0IHsgZXhwYW5kZWRLZXlzLCBrZXlFbnRpdGllcyB9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCB7IG9uRHJhZ0VudGVyIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHsgcG9zLCBldmVudEtleSB9ID0gbm9kZS5wcm9wcztcblxuICAgIGlmICghdGhpcy5kcmFnTm9kZSkgcmV0dXJuO1xuXG4gICAgY29uc3QgZHJvcFBvc2l0aW9uID0gY2FsY0Ryb3BQb3NpdGlvbihldmVudCwgbm9kZSk7XG5cbiAgICAvLyBTa2lwIGlmIGRyYWcgbm9kZSBpcyBzZWxmXG4gICAgaWYgKHRoaXMuZHJhZ05vZGUucHJvcHMuZXZlbnRLZXkgPT09IGV2ZW50S2V5ICYmIGRyb3BQb3NpdGlvbiA9PT0gMCkge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGRyYWdPdmVyTm9kZUtleTogJycsXG4gICAgICAgIGRyb3BQb3NpdGlvbjogbnVsbCxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFJlZjogaHR0cHM6Ly9naXRodWIuY29tL3JlYWN0LWNvbXBvbmVudC90cmVlL2lzc3Vlcy8xMzJcbiAgICAvLyBBZGQgdGltZW91dCB0byBsZXQgb25EcmFnTGV2ZWwgZmlyZSBiZWZvcmUgb25EcmFnRW50ZXIsXG4gICAgLy8gc28gdGhhdCB3ZSBjYW4gY2xlYW4gZHJhZyBwcm9wcyBmb3Igb25EcmFnTGVhdmUgbm9kZS5cbiAgICAvLyBNYWNybyB0YXNrIGZvciB0aGlzOlxuICAgIC8vIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3dlYmFwcGFwaXMuaHRtbCNjbGVhbi11cC1hZnRlci1ydW5uaW5nLXNjcmlwdFxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgLy8gVXBkYXRlIGRyYWcgb3ZlciBub2RlXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgZHJhZ092ZXJOb2RlS2V5OiBldmVudEtleSxcbiAgICAgICAgZHJvcFBvc2l0aW9uLFxuICAgICAgfSk7XG5cbiAgICAgIC8vIFNpZGUgZWZmZWN0IGZvciBkZWxheSBkcmFnXG4gICAgICBpZiAoIXRoaXMuZGVsYXllZERyYWdFbnRlckxvZ2ljKSB7XG4gICAgICAgIHRoaXMuZGVsYXllZERyYWdFbnRlckxvZ2ljID0ge307XG4gICAgICB9XG4gICAgICBPYmplY3Qua2V5cyh0aGlzLmRlbGF5ZWREcmFnRW50ZXJMb2dpYykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5kZWxheWVkRHJhZ0VudGVyTG9naWNba2V5XSk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuZGVsYXllZERyYWdFbnRlckxvZ2ljW3Bvc10gPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5kcmFnZ2luZykgcmV0dXJuO1xuXG4gICAgICAgIGxldCBuZXdFeHBhbmRlZEtleXMgPSBbLi4uZXhwYW5kZWRLZXlzXTtcbiAgICAgICAgY29uc3QgZW50aXR5ID0ga2V5RW50aXRpZXNbZXZlbnRLZXldO1xuXG4gICAgICAgIGlmIChlbnRpdHkgJiYgKGVudGl0eS5jaGlsZHJlbiB8fCBbXSkubGVuZ3RoKSB7XG4gICAgICAgICAgbmV3RXhwYW5kZWRLZXlzID0gYXJyQWRkKGV4cGFuZGVkS2V5cywgZXZlbnRLZXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCEoJ2V4cGFuZGVkS2V5cycgaW4gdGhpcy5wcm9wcykpIHtcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGV4cGFuZGVkS2V5czogbmV3RXhwYW5kZWRLZXlzLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9uRHJhZ0VudGVyKSB7XG4gICAgICAgICAgb25EcmFnRW50ZXIoe1xuICAgICAgICAgICAgZXZlbnQsXG4gICAgICAgICAgICBub2RlOiBjb252ZXJ0Tm9kZVByb3BzVG9FdmVudERhdGEobm9kZS5wcm9wcyksXG4gICAgICAgICAgICBleHBhbmRlZEtleXM6IG5ld0V4cGFuZGVkS2V5cyxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSwgNDAwKTtcbiAgICB9LCAwKTtcbiAgfTtcblxuICBvbk5vZGVEcmFnT3ZlciA9IChcbiAgICBldmVudDogUmVhY3QuTW91c2VFdmVudDxIVE1MRGl2RWxlbWVudD4sXG4gICAgbm9kZTogTm9kZUluc3RhbmNlLFxuICApID0+IHtcbiAgICBjb25zdCB7IG9uRHJhZ092ZXIgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgeyBldmVudEtleSB9ID0gbm9kZS5wcm9wcztcblxuICAgIC8vIFVwZGF0ZSBkcmFnIHBvc2l0aW9uXG4gICAgaWYgKHRoaXMuZHJhZ05vZGUgJiYgZXZlbnRLZXkgPT09IHRoaXMuc3RhdGUuZHJhZ092ZXJOb2RlS2V5KSB7XG4gICAgICBjb25zdCBkcm9wUG9zaXRpb24gPSBjYWxjRHJvcFBvc2l0aW9uKGV2ZW50LCBub2RlKTtcblxuICAgICAgaWYgKGRyb3BQb3NpdGlvbiA9PT0gdGhpcy5zdGF0ZS5kcm9wUG9zaXRpb24pIHJldHVybjtcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGRyb3BQb3NpdGlvbixcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChvbkRyYWdPdmVyKSB7XG4gICAgICBvbkRyYWdPdmVyKHsgZXZlbnQsIG5vZGU6IGNvbnZlcnROb2RlUHJvcHNUb0V2ZW50RGF0YShub2RlLnByb3BzKSB9KTtcbiAgICB9XG4gIH07XG5cbiAgb25Ob2RlRHJhZ0xlYXZlID0gKFxuICAgIGV2ZW50OiBSZWFjdC5Nb3VzZUV2ZW50PEhUTUxEaXZFbGVtZW50PixcbiAgICBub2RlOiBOb2RlSW5zdGFuY2UsXG4gICkgPT4ge1xuICAgIGNvbnN0IHsgb25EcmFnTGVhdmUgfSA9IHRoaXMucHJvcHM7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGRyYWdPdmVyTm9kZUtleTogJycsXG4gICAgfSk7XG5cbiAgICBpZiAob25EcmFnTGVhdmUpIHtcbiAgICAgIG9uRHJhZ0xlYXZlKHsgZXZlbnQsIG5vZGU6IGNvbnZlcnROb2RlUHJvcHNUb0V2ZW50RGF0YShub2RlLnByb3BzKSB9KTtcbiAgICB9XG4gIH07XG5cbiAgb25Ob2RlRHJhZ0VuZCA9IChcbiAgICBldmVudDogUmVhY3QuTW91c2VFdmVudDxIVE1MRGl2RWxlbWVudD4sXG4gICAgbm9kZTogTm9kZUluc3RhbmNlLFxuICApID0+IHtcbiAgICBjb25zdCB7IG9uRHJhZ0VuZCB9ID0gdGhpcy5wcm9wcztcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGRyYWdPdmVyTm9kZUtleTogJycsXG4gICAgfSk7XG4gICAgdGhpcy5jbGVhbkRyYWdTdGF0ZSgpO1xuXG4gICAgaWYgKG9uRHJhZ0VuZCkge1xuICAgICAgb25EcmFnRW5kKHsgZXZlbnQsIG5vZGU6IGNvbnZlcnROb2RlUHJvcHNUb0V2ZW50RGF0YShub2RlLnByb3BzKSB9KTtcbiAgICB9XG5cbiAgICB0aGlzLmRyYWdOb2RlID0gbnVsbDtcbiAgfTtcblxuICBvbk5vZGVEcm9wID0gKFxuICAgIGV2ZW50OiBSZWFjdC5Nb3VzZUV2ZW50PEhUTUxEaXZFbGVtZW50PixcbiAgICBub2RlOiBOb2RlSW5zdGFuY2UsXG4gICkgPT4ge1xuICAgIGNvbnN0IHsgZHJhZ05vZGVzS2V5cyA9IFtdLCBkcm9wUG9zaXRpb24gfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3QgeyBvbkRyb3AgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgeyBldmVudEtleSwgcG9zIH0gPSBub2RlLnByb3BzO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBkcmFnT3Zlck5vZGVLZXk6ICcnLFxuICAgIH0pO1xuICAgIHRoaXMuY2xlYW5EcmFnU3RhdGUoKTtcblxuICAgIGlmIChkcmFnTm9kZXNLZXlzLmluZGV4T2YoZXZlbnRLZXkpICE9PSAtMSkge1xuICAgICAgd2FybmluZyhmYWxzZSwgXCJDYW4gbm90IGRyb3AgdG8gZHJhZ05vZGUoaW5jbHVkZSBpdCdzIGNoaWxkcmVuIG5vZGUpXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBvc0FyciA9IHBvc1RvQXJyKHBvcyk7XG5cbiAgICBjb25zdCBkcm9wUmVzdWx0ID0ge1xuICAgICAgZXZlbnQsXG4gICAgICBub2RlOiBjb252ZXJ0Tm9kZVByb3BzVG9FdmVudERhdGEobm9kZS5wcm9wcyksXG4gICAgICBkcmFnTm9kZTogY29udmVydE5vZGVQcm9wc1RvRXZlbnREYXRhKHRoaXMuZHJhZ05vZGUucHJvcHMpLFxuICAgICAgZHJhZ05vZGVzS2V5czogZHJhZ05vZGVzS2V5cy5zbGljZSgpLFxuICAgICAgZHJvcFBvc2l0aW9uOiBkcm9wUG9zaXRpb24gKyBOdW1iZXIocG9zQXJyW3Bvc0Fyci5sZW5ndGggLSAxXSksXG4gICAgICBkcm9wVG9HYXA6IGZhbHNlLFxuICAgIH07XG5cbiAgICBpZiAoZHJvcFBvc2l0aW9uICE9PSAwKSB7XG4gICAgICBkcm9wUmVzdWx0LmRyb3BUb0dhcCA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKG9uRHJvcCkge1xuICAgICAgb25Ecm9wKGRyb3BSZXN1bHQpO1xuICAgIH1cblxuICAgIHRoaXMuZHJhZ05vZGUgPSBudWxsO1xuICB9O1xuXG4gIGNsZWFuRHJhZ1N0YXRlID0gKCkgPT4ge1xuICAgIGNvbnN0IHsgZHJhZ2dpbmcgfSA9IHRoaXMuc3RhdGU7XG4gICAgaWYgKGRyYWdnaW5nKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgZHJhZ2dpbmc6IGZhbHNlLFxuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIG9uTm9kZUNsaWNrID0gKFxuICAgIGU6IFJlYWN0Lk1vdXNlRXZlbnQ8SFRNTERpdkVsZW1lbnQ+LFxuICAgIHRyZWVOb2RlOiBFdmVudERhdGFOb2RlLFxuICApID0+IHtcbiAgICBjb25zdCB7IG9uQ2xpY2sgfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKG9uQ2xpY2spIHtcbiAgICAgIG9uQ2xpY2soZSwgdHJlZU5vZGUpO1xuICAgIH1cbiAgfTtcblxuICBvbk5vZGVEb3VibGVDbGljayA9IChcbiAgICBlOiBSZWFjdC5Nb3VzZUV2ZW50PEhUTUxEaXZFbGVtZW50PixcbiAgICB0cmVlTm9kZTogRXZlbnREYXRhTm9kZSxcbiAgKSA9PiB7XG4gICAgY29uc3QgeyBvbkRvdWJsZUNsaWNrIH0gPSB0aGlzLnByb3BzO1xuICAgIGlmIChvbkRvdWJsZUNsaWNrKSB7XG4gICAgICBvbkRvdWJsZUNsaWNrKGUsIHRyZWVOb2RlKTtcbiAgICB9XG4gIH07XG5cbiAgb25Ob2RlU2VsZWN0ID0gKFxuICAgIGU6IFJlYWN0Lk1vdXNlRXZlbnQ8SFRNTERpdkVsZW1lbnQ+LFxuICAgIHRyZWVOb2RlOiBFdmVudERhdGFOb2RlLFxuICApID0+IHtcbiAgICBsZXQgeyBzZWxlY3RlZEtleXMgfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3QgeyBrZXlFbnRpdGllcyB9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCB7IG9uU2VsZWN0LCBtdWx0aXBsZSB9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7IHNlbGVjdGVkLCBrZXkgfSA9IHRyZWVOb2RlO1xuICAgIGNvbnN0IHRhcmdldFNlbGVjdGVkID0gIXNlbGVjdGVkO1xuXG4gICAgLy8gVXBkYXRlIHNlbGVjdGVkIGtleXNcbiAgICBpZiAoIXRhcmdldFNlbGVjdGVkKSB7XG4gICAgICBzZWxlY3RlZEtleXMgPSBhcnJEZWwoc2VsZWN0ZWRLZXlzLCBrZXkpO1xuICAgIH0gZWxzZSBpZiAoIW11bHRpcGxlKSB7XG4gICAgICBzZWxlY3RlZEtleXMgPSBba2V5XTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZWN0ZWRLZXlzID0gYXJyQWRkKHNlbGVjdGVkS2V5cywga2V5KTtcbiAgICB9XG5cbiAgICAvLyBbTGVnYWN5XSBOb3QgZm91bmQgcmVsYXRlZCB1c2FnZSBpbiBkb2Mgb3IgdXBwZXIgbGlic1xuICAgIGNvbnN0IHNlbGVjdGVkTm9kZXMgPSBzZWxlY3RlZEtleXNcbiAgICAgIC5tYXAoc2VsZWN0ZWRLZXkgPT4ge1xuICAgICAgICBjb25zdCBlbnRpdHkgPSBrZXlFbnRpdGllc1tzZWxlY3RlZEtleV07XG4gICAgICAgIGlmICghZW50aXR5KSByZXR1cm4gbnVsbDtcblxuICAgICAgICByZXR1cm4gZW50aXR5Lm5vZGU7XG4gICAgICB9KVxuICAgICAgLmZpbHRlcihub2RlID0+IG5vZGUpO1xuXG4gICAgdGhpcy5zZXRVbmNvbnRyb2xsZWRTdGF0ZSh7IHNlbGVjdGVkS2V5cyB9KTtcblxuICAgIGlmIChvblNlbGVjdCkge1xuICAgICAgb25TZWxlY3Qoc2VsZWN0ZWRLZXlzLCB7XG4gICAgICAgIGV2ZW50OiAnc2VsZWN0JyxcbiAgICAgICAgc2VsZWN0ZWQ6IHRhcmdldFNlbGVjdGVkLFxuICAgICAgICBub2RlOiB0cmVlTm9kZSxcbiAgICAgICAgc2VsZWN0ZWROb2RlcyxcbiAgICAgICAgbmF0aXZlRXZlbnQ6IGUubmF0aXZlRXZlbnQsXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgb25Ob2RlQ2hlY2sgPSAoXG4gICAgZTogUmVhY3QuTW91c2VFdmVudDxIVE1MRGl2RWxlbWVudD4sXG4gICAgdHJlZU5vZGU6IEV2ZW50RGF0YU5vZGUsXG4gICAgY2hlY2tlZDogYm9vbGVhbixcbiAgKSA9PiB7XG4gICAgY29uc3Qge1xuICAgICAga2V5RW50aXRpZXMsXG4gICAgICBjaGVja2VkS2V5czogb3JpQ2hlY2tlZEtleXMsXG4gICAgICBoYWxmQ2hlY2tlZEtleXM6IG9yaUhhbGZDaGVja2VkS2V5cyxcbiAgICB9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCB7IGNoZWNrU3RyaWN0bHksIG9uQ2hlY2sgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgeyBrZXkgfSA9IHRyZWVOb2RlO1xuXG4gICAgLy8gUHJlcGFyZSB0cmlnZ2VyIGFyZ3VtZW50c1xuICAgIGxldCBjaGVja2VkT2JqO1xuICAgIGNvbnN0IGV2ZW50T2JqOiBQYXJ0aWFsPENoZWNrSW5mbz4gPSB7XG4gICAgICBldmVudDogJ2NoZWNrJyxcbiAgICAgIG5vZGU6IHRyZWVOb2RlLFxuICAgICAgY2hlY2tlZCxcbiAgICAgIG5hdGl2ZUV2ZW50OiBlLm5hdGl2ZUV2ZW50LFxuICAgIH07XG5cbiAgICBpZiAoY2hlY2tTdHJpY3RseSkge1xuICAgICAgY29uc3QgY2hlY2tlZEtleXMgPSBjaGVja2VkXG4gICAgICAgID8gYXJyQWRkKG9yaUNoZWNrZWRLZXlzLCBrZXkpXG4gICAgICAgIDogYXJyRGVsKG9yaUNoZWNrZWRLZXlzLCBrZXkpO1xuICAgICAgY29uc3QgaGFsZkNoZWNrZWRLZXlzID0gYXJyRGVsKG9yaUhhbGZDaGVja2VkS2V5cywga2V5KTtcbiAgICAgIGNoZWNrZWRPYmogPSB7IGNoZWNrZWQ6IGNoZWNrZWRLZXlzLCBoYWxmQ2hlY2tlZDogaGFsZkNoZWNrZWRLZXlzIH07XG5cbiAgICAgIGV2ZW50T2JqLmNoZWNrZWROb2RlcyA9IGNoZWNrZWRLZXlzXG4gICAgICAgIC5tYXAoY2hlY2tlZEtleSA9PiBrZXlFbnRpdGllc1tjaGVja2VkS2V5XSlcbiAgICAgICAgLmZpbHRlcihlbnRpdHkgPT4gZW50aXR5KVxuICAgICAgICAubWFwKGVudGl0eSA9PiBlbnRpdHkubm9kZSk7XG5cbiAgICAgIHRoaXMuc2V0VW5jb250cm9sbGVkU3RhdGUoeyBjaGVja2VkS2V5cyB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQWx3YXlzIGZpbGwgZmlyc3RcbiAgICAgIGxldCB7IGNoZWNrZWRLZXlzLCBoYWxmQ2hlY2tlZEtleXMgfSA9IGNvbmR1Y3RDaGVjayhcbiAgICAgICAgWy4uLm9yaUNoZWNrZWRLZXlzLCBrZXldLFxuICAgICAgICB0cnVlLFxuICAgICAgICBrZXlFbnRpdGllcyxcbiAgICAgICk7XG5cbiAgICAgIC8vIElmIHJlbW92ZSwgd2UgZG8gaXQgYWdhaW4gdG8gY29ycmVjdGlvblxuICAgICAgaWYgKCFjaGVja2VkKSB7XG4gICAgICAgIGNvbnN0IGtleVNldCA9IG5ldyBTZXQoY2hlY2tlZEtleXMpO1xuICAgICAgICBrZXlTZXQuZGVsZXRlKGtleSk7XG4gICAgICAgICh7IGNoZWNrZWRLZXlzLCBoYWxmQ2hlY2tlZEtleXMgfSA9IGNvbmR1Y3RDaGVjayhcbiAgICAgICAgICBBcnJheS5mcm9tKGtleVNldCksXG4gICAgICAgICAgeyBjaGVja2VkOiBmYWxzZSwgaGFsZkNoZWNrZWRLZXlzIH0sXG4gICAgICAgICAga2V5RW50aXRpZXMsXG4gICAgICAgICkpO1xuICAgICAgfVxuXG4gICAgICBjaGVja2VkT2JqID0gY2hlY2tlZEtleXM7XG5cbiAgICAgIC8vIFtMZWdhY3ldIFRoaXMgaXMgdXNlZCBmb3IgYHJjLXRyZWUtc2VsZWN0YFxuICAgICAgZXZlbnRPYmouY2hlY2tlZE5vZGVzID0gW107XG4gICAgICBldmVudE9iai5jaGVja2VkTm9kZXNQb3NpdGlvbnMgPSBbXTtcbiAgICAgIGV2ZW50T2JqLmhhbGZDaGVja2VkS2V5cyA9IGhhbGZDaGVja2VkS2V5cztcblxuICAgICAgY2hlY2tlZEtleXMuZm9yRWFjaChjaGVja2VkS2V5ID0+IHtcbiAgICAgICAgY29uc3QgZW50aXR5ID0ga2V5RW50aXRpZXNbY2hlY2tlZEtleV07XG4gICAgICAgIGlmICghZW50aXR5KSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgeyBub2RlLCBwb3MgfSA9IGVudGl0eTtcblxuICAgICAgICBldmVudE9iai5jaGVja2VkTm9kZXMucHVzaChub2RlKTtcbiAgICAgICAgZXZlbnRPYmouY2hlY2tlZE5vZGVzUG9zaXRpb25zLnB1c2goeyBub2RlLCBwb3MgfSk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5zZXRVbmNvbnRyb2xsZWRTdGF0ZSh7XG4gICAgICAgIGNoZWNrZWRLZXlzLFxuICAgICAgICBoYWxmQ2hlY2tlZEtleXMsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAob25DaGVjaykge1xuICAgICAgb25DaGVjayhjaGVja2VkT2JqLCBldmVudE9iaiBhcyBDaGVja0luZm8pO1xuICAgIH1cbiAgfTtcblxuICBvbk5vZGVMb2FkID0gKHRyZWVOb2RlOiBFdmVudERhdGFOb2RlKSA9PlxuICAgIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgLy8gV2UgbmVlZCB0byBnZXQgdGhlIGxhdGVzdCBzdGF0ZSBvZiBsb2FkaW5nL2xvYWRlZCBrZXlzXG4gICAgICB0aGlzLnNldFN0YXRlKCh7IGxvYWRlZEtleXMgPSBbXSwgbG9hZGluZ0tleXMgPSBbXSB9KTogYW55ID0+IHtcbiAgICAgICAgY29uc3QgeyBsb2FkRGF0YSwgb25Mb2FkIH0gPSB0aGlzLnByb3BzO1xuICAgICAgICBjb25zdCB7IGtleSB9ID0gdHJlZU5vZGU7XG5cbiAgICAgICAgaWYgKFxuICAgICAgICAgICFsb2FkRGF0YSB8fFxuICAgICAgICAgIGxvYWRlZEtleXMuaW5kZXhPZihrZXkpICE9PSAtMSB8fFxuICAgICAgICAgIGxvYWRpbmdLZXlzLmluZGV4T2Yoa2V5KSAhPT0gLTFcbiAgICAgICAgKSB7XG4gICAgICAgICAgLy8gcmVhY3QgMTUgd2lsbCB3YXJuIGlmIHJldHVybiBudWxsXG4gICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUHJvY2VzcyBsb2FkIGRhdGFcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IGxvYWREYXRhKHRyZWVOb2RlKTtcbiAgICAgICAgcHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgICAgICBjb25zdCB7XG4gICAgICAgICAgICBsb2FkZWRLZXlzOiBjdXJyZW50TG9hZGVkS2V5cyxcbiAgICAgICAgICAgIGxvYWRpbmdLZXlzOiBjdXJyZW50TG9hZGluZ0tleXMsXG4gICAgICAgICAgfSA9IHRoaXMuc3RhdGU7XG4gICAgICAgICAgY29uc3QgbmV3TG9hZGVkS2V5cyA9IGFyckFkZChjdXJyZW50TG9hZGVkS2V5cywga2V5KTtcbiAgICAgICAgICBjb25zdCBuZXdMb2FkaW5nS2V5cyA9IGFyckRlbChjdXJyZW50TG9hZGluZ0tleXMsIGtleSk7XG5cbiAgICAgICAgICAvLyBvbkxvYWQgc2hvdWxkIHRyaWdnZXIgYmVmb3JlIGludGVybmFsIHNldFN0YXRlIHRvIGF2b2lkIGBsb2FkRGF0YWAgdHJpZ2dlciB0d2ljZS5cbiAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW50LWRlc2lnbi9hbnQtZGVzaWduL2lzc3Vlcy8xMjQ2NFxuICAgICAgICAgIGlmIChvbkxvYWQpIHtcbiAgICAgICAgICAgIG9uTG9hZChuZXdMb2FkZWRLZXlzLCB7XG4gICAgICAgICAgICAgIGV2ZW50OiAnbG9hZCcsXG4gICAgICAgICAgICAgIG5vZGU6IHRyZWVOb2RlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5zZXRVbmNvbnRyb2xsZWRTdGF0ZSh7XG4gICAgICAgICAgICBsb2FkZWRLZXlzOiBuZXdMb2FkZWRLZXlzLFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgbG9hZGluZ0tleXM6IG5ld0xvYWRpbmdLZXlzLFxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxvYWRpbmdLZXlzOiBhcnJBZGQobG9hZGluZ0tleXMsIGtleSksXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9KTtcblxuICBvbk5vZGVFeHBhbmQgPSAoXG4gICAgZTogUmVhY3QuTW91c2VFdmVudDxIVE1MRGl2RWxlbWVudD4sXG4gICAgdHJlZU5vZGU6IEV2ZW50RGF0YU5vZGUsXG4gICkgPT4ge1xuICAgIGxldCB7IGV4cGFuZGVkS2V5cyB9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCB7IHRyZWVEYXRhIH0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHsgb25FeHBhbmQsIGxvYWREYXRhIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHsga2V5LCBleHBhbmRlZCB9ID0gdHJlZU5vZGU7XG5cbiAgICAvLyBVcGRhdGUgc2VsZWN0ZWQga2V5c1xuICAgIGNvbnN0IGluZGV4ID0gZXhwYW5kZWRLZXlzLmluZGV4T2Yoa2V5KTtcbiAgICBjb25zdCB0YXJnZXRFeHBhbmRlZCA9ICFleHBhbmRlZDtcblxuICAgIHdhcm5pbmcoXG4gICAgICAoZXhwYW5kZWQgJiYgaW5kZXggIT09IC0xKSB8fCAoIWV4cGFuZGVkICYmIGluZGV4ID09PSAtMSksXG4gICAgICAnRXhwYW5kIHN0YXRlIG5vdCBzeW5jIHdpdGggaW5kZXggY2hlY2snLFxuICAgICk7XG5cbiAgICBpZiAodGFyZ2V0RXhwYW5kZWQpIHtcbiAgICAgIGV4cGFuZGVkS2V5cyA9IGFyckFkZChleHBhbmRlZEtleXMsIGtleSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV4cGFuZGVkS2V5cyA9IGFyckRlbChleHBhbmRlZEtleXMsIGtleSk7XG4gICAgfVxuXG4gICAgY29uc3QgZmxhdHRlbk5vZGVzOiBGbGF0dGVuTm9kZVtdID0gZmxhdHRlblRyZWVEYXRhKHRyZWVEYXRhLCBleHBhbmRlZEtleXMpO1xuICAgIHRoaXMuc2V0VW5jb250cm9sbGVkU3RhdGUoeyBleHBhbmRlZEtleXMsIGZsYXR0ZW5Ob2RlcyB9LCB0cnVlKTtcblxuICAgIGlmIChvbkV4cGFuZCkge1xuICAgICAgb25FeHBhbmQoZXhwYW5kZWRLZXlzLCB7XG4gICAgICAgIG5vZGU6IHRyZWVOb2RlLFxuICAgICAgICBleHBhbmRlZDogdGFyZ2V0RXhwYW5kZWQsXG4gICAgICAgIG5hdGl2ZUV2ZW50OiBlLm5hdGl2ZUV2ZW50LFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQXN5bmMgTG9hZCBkYXRhXG4gICAgaWYgKHRhcmdldEV4cGFuZGVkICYmIGxvYWREYXRhKSB7XG4gICAgICBjb25zdCBsb2FkUHJvbWlzZSA9IHRoaXMub25Ob2RlTG9hZCh0cmVlTm9kZSk7XG4gICAgICByZXR1cm4gbG9hZFByb21pc2VcbiAgICAgICAgPyBsb2FkUHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vIFtMZWdhY3ldIFJlZnJlc2ggbG9naWNcbiAgICAgICAgICAgIGNvbnN0IG5ld0ZsYXR0ZW5UcmVlRGF0YSA9IGZsYXR0ZW5UcmVlRGF0YShcbiAgICAgICAgICAgICAgdGhpcy5zdGF0ZS50cmVlRGF0YSxcbiAgICAgICAgICAgICAgZXhwYW5kZWRLZXlzLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHRoaXMuc2V0VW5jb250cm9sbGVkU3RhdGUoeyBmbGF0dGVuTm9kZXM6IG5ld0ZsYXR0ZW5UcmVlRGF0YSB9KTtcbiAgICAgICAgICB9KVxuICAgICAgICA6IG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG5cbiAgb25Ob2RlTW91c2VFbnRlciA9IChcbiAgICBldmVudDogUmVhY3QuTW91c2VFdmVudDxIVE1MRGl2RWxlbWVudD4sXG4gICAgbm9kZTogRXZlbnREYXRhTm9kZSxcbiAgKSA9PiB7XG4gICAgY29uc3QgeyBvbk1vdXNlRW50ZXIgfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKG9uTW91c2VFbnRlcikge1xuICAgICAgb25Nb3VzZUVudGVyKHsgZXZlbnQsIG5vZGUgfSk7XG4gICAgfVxuICB9O1xuXG4gIG9uTm9kZU1vdXNlTGVhdmUgPSAoXG4gICAgZXZlbnQ6IFJlYWN0Lk1vdXNlRXZlbnQ8SFRNTERpdkVsZW1lbnQ+LFxuICAgIG5vZGU6IEV2ZW50RGF0YU5vZGUsXG4gICkgPT4ge1xuICAgIGNvbnN0IHsgb25Nb3VzZUxlYXZlIH0gPSB0aGlzLnByb3BzO1xuICAgIGlmIChvbk1vdXNlTGVhdmUpIHtcbiAgICAgIG9uTW91c2VMZWF2ZSh7IGV2ZW50LCBub2RlIH0pO1xuICAgIH1cbiAgfTtcblxuICBvbk5vZGVDb250ZXh0TWVudSA9IChcbiAgICBldmVudDogUmVhY3QuTW91c2VFdmVudDxIVE1MRGl2RWxlbWVudD4sXG4gICAgbm9kZTogRXZlbnREYXRhTm9kZSxcbiAgKSA9PiB7XG4gICAgY29uc3QgeyBvblJpZ2h0Q2xpY2sgfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKG9uUmlnaHRDbGljaykge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIG9uUmlnaHRDbGljayh7IGV2ZW50LCBub2RlIH0pO1xuICAgIH1cbiAgfTtcblxuICBvbkZvY3VzOiBSZWFjdC5Gb2N1c0V2ZW50SGFuZGxlcjxIVE1MRGl2RWxlbWVudD4gPSAoLi4uYXJncykgPT4ge1xuICAgIGNvbnN0IHsgb25Gb2N1cyB9ID0gdGhpcy5wcm9wcztcbiAgICB0aGlzLnNldFN0YXRlKHsgZm9jdXNlZDogdHJ1ZSB9KTtcblxuICAgIGlmIChvbkZvY3VzKSB7XG4gICAgICBvbkZvY3VzKC4uLmFyZ3MpO1xuICAgIH1cbiAgfTtcblxuICBvbkJsdXI6IFJlYWN0LkZvY3VzRXZlbnRIYW5kbGVyPEhUTUxEaXZFbGVtZW50PiA9ICguLi5hcmdzKSA9PiB7XG4gICAgY29uc3QgeyBvbkJsdXIgfSA9IHRoaXMucHJvcHM7XG4gICAgdGhpcy5zZXRTdGF0ZSh7IGZvY3VzZWQ6IGZhbHNlIH0pO1xuICAgIHRoaXMub25BY3RpdmVDaGFuZ2UobnVsbCk7XG5cbiAgICBpZiAob25CbHVyKSB7XG4gICAgICBvbkJsdXIoLi4uYXJncyk7XG4gICAgfVxuICB9O1xuXG4gIGdldFRyZWVOb2RlUmVxdWlyZWRQcm9wcyA9ICgpID0+IHtcbiAgICBjb25zdCB7XG4gICAgICBleHBhbmRlZEtleXMsXG4gICAgICBzZWxlY3RlZEtleXMsXG4gICAgICBsb2FkZWRLZXlzLFxuICAgICAgbG9hZGluZ0tleXMsXG4gICAgICBjaGVja2VkS2V5cyxcbiAgICAgIGhhbGZDaGVja2VkS2V5cyxcbiAgICAgIGRyYWdPdmVyTm9kZUtleSxcbiAgICAgIGRyb3BQb3NpdGlvbixcbiAgICAgIGtleUVudGl0aWVzLFxuICAgIH0gPSB0aGlzLnN0YXRlO1xuICAgIHJldHVybiB7XG4gICAgICBleHBhbmRlZEtleXM6IGV4cGFuZGVkS2V5cyB8fCBbXSxcbiAgICAgIHNlbGVjdGVkS2V5czogc2VsZWN0ZWRLZXlzIHx8IFtdLFxuICAgICAgbG9hZGVkS2V5czogbG9hZGVkS2V5cyB8fCBbXSxcbiAgICAgIGxvYWRpbmdLZXlzOiBsb2FkaW5nS2V5cyB8fCBbXSxcbiAgICAgIGNoZWNrZWRLZXlzOiBjaGVja2VkS2V5cyB8fCBbXSxcbiAgICAgIGhhbGZDaGVja2VkS2V5czogaGFsZkNoZWNrZWRLZXlzIHx8IFtdLFxuICAgICAgZHJhZ092ZXJOb2RlS2V5LFxuICAgICAgZHJvcFBvc2l0aW9uLFxuICAgICAga2V5RW50aXRpZXMsXG4gICAgfTtcbiAgfTtcblxuICAvLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT0gS2V5Ym9hcmQgPT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIG9uQWN0aXZlQ2hhbmdlID0gKGFjdGl2ZUtleTogS2V5KSA9PiB7XG4gICAgY29uc3QgeyBvbkFjdGl2ZUNoYW5nZSB9ID0gdGhpcy5wcm9wcztcblxuICAgIHRoaXMuc2V0U3RhdGUoeyBhY3RpdmVLZXkgfSk7XG4gICAgaWYgKGFjdGl2ZUtleSAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5zY3JvbGxUbyh7IGtleTogYWN0aXZlS2V5IH0pO1xuICAgIH1cblxuICAgIGlmIChvbkFjdGl2ZUNoYW5nZSkge1xuICAgICAgb25BY3RpdmVDaGFuZ2UoYWN0aXZlS2V5KTtcbiAgICB9XG4gIH07XG5cbiAgZ2V0QWN0aXZlSXRlbSA9ICgpID0+IHtcbiAgICBjb25zdCB7IGFjdGl2ZUtleSwgZmxhdHRlbk5vZGVzIH0gPSB0aGlzLnN0YXRlO1xuICAgIGlmIChhY3RpdmVLZXkgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHJldHVybiBmbGF0dGVuTm9kZXMuZmluZCgoeyBkYXRhOiB7IGtleSB9IH0pID0+IGtleSA9PT0gYWN0aXZlS2V5KSB8fCBudWxsO1xuICB9O1xuXG4gIG9mZnNldEFjdGl2ZUtleSA9IChvZmZzZXQ6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IHsgZmxhdHRlbk5vZGVzLCBhY3RpdmVLZXkgfSA9IHRoaXMuc3RhdGU7XG5cbiAgICBsZXQgaW5kZXggPSBmbGF0dGVuTm9kZXMuZmluZEluZGV4KFxuICAgICAgKHsgZGF0YTogeyBrZXkgfSB9KSA9PiBrZXkgPT09IGFjdGl2ZUtleSxcbiAgICApO1xuXG4gICAgLy8gQWxpZ24gd2l0aCBpbmRleFxuICAgIGlmIChpbmRleCA9PT0gLTEgJiYgb2Zmc2V0IDwgMCkge1xuICAgICAgaW5kZXggPSBmbGF0dGVuTm9kZXMubGVuZ3RoO1xuICAgIH1cblxuICAgIGluZGV4ID0gKGluZGV4ICsgb2Zmc2V0ICsgZmxhdHRlbk5vZGVzLmxlbmd0aCkgJSBmbGF0dGVuTm9kZXMubGVuZ3RoO1xuXG4gICAgY29uc3QgaXRlbSA9IGZsYXR0ZW5Ob2Rlc1tpbmRleF07XG4gICAgaWYgKGl0ZW0pIHtcbiAgICAgIGNvbnN0IHsga2V5IH0gPSBpdGVtLmRhdGE7XG4gICAgICB0aGlzLm9uQWN0aXZlQ2hhbmdlKGtleSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub25BY3RpdmVDaGFuZ2UobnVsbCk7XG4gICAgfVxuICB9O1xuXG4gIG9uS2V5RG93bjogUmVhY3QuS2V5Ym9hcmRFdmVudEhhbmRsZXI8SFRNTERpdkVsZW1lbnQ+ID0gZXZlbnQgPT4ge1xuICAgIGNvbnN0IHsgYWN0aXZlS2V5LCBleHBhbmRlZEtleXMsIGNoZWNrZWRLZXlzIH0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHsgb25LZXlEb3duLCBjaGVja2FibGUsIHNlbGVjdGFibGUgfSA9IHRoaXMucHJvcHM7XG5cbiAgICAvLyA+Pj4+Pj4+Pj4+IERpcmVjdGlvblxuICAgIHN3aXRjaCAoZXZlbnQud2hpY2gpIHtcbiAgICAgIGNhc2UgS2V5Q29kZS5VUDoge1xuICAgICAgICB0aGlzLm9mZnNldEFjdGl2ZUtleSgtMSk7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSBLZXlDb2RlLkRPV046IHtcbiAgICAgICAgdGhpcy5vZmZzZXRBY3RpdmVLZXkoMSk7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vID4+Pj4+Pj4+Pj4gRXhwYW5kICYgU2VsZWN0aW9uXG4gICAgY29uc3QgYWN0aXZlSXRlbSA9IHRoaXMuZ2V0QWN0aXZlSXRlbSgpO1xuICAgIGlmIChhY3RpdmVJdGVtICYmIGFjdGl2ZUl0ZW0uZGF0YSkge1xuICAgICAgY29uc3QgdHJlZU5vZGVSZXF1aXJlZFByb3BzID0gdGhpcy5nZXRUcmVlTm9kZVJlcXVpcmVkUHJvcHMoKTtcblxuICAgICAgY29uc3QgZXhwYW5kYWJsZSA9XG4gICAgICAgIGFjdGl2ZUl0ZW0uZGF0YS5pc0xlYWYgPT09IGZhbHNlIHx8XG4gICAgICAgICEhKGFjdGl2ZUl0ZW0uZGF0YS5jaGlsZHJlbiB8fCBbXSkubGVuZ3RoO1xuICAgICAgY29uc3QgZXZlbnROb2RlID0gY29udmVydE5vZGVQcm9wc1RvRXZlbnREYXRhKHtcbiAgICAgICAgLi4uZ2V0VHJlZU5vZGVQcm9wcyhhY3RpdmVLZXksIHRyZWVOb2RlUmVxdWlyZWRQcm9wcyksXG4gICAgICAgIGRhdGE6IGFjdGl2ZUl0ZW0uZGF0YSxcbiAgICAgICAgYWN0aXZlOiB0cnVlLFxuICAgICAgfSk7XG5cbiAgICAgIHN3aXRjaCAoZXZlbnQud2hpY2gpIHtcbiAgICAgICAgLy8gPj4+IEV4cGFuZFxuICAgICAgICBjYXNlIEtleUNvZGUuTEVGVDoge1xuICAgICAgICAgIC8vIENvbGxhcHNlIGlmIHBvc3NpYmxlXG4gICAgICAgICAgaWYgKGV4cGFuZGFibGUgJiYgZXhwYW5kZWRLZXlzLmluY2x1ZGVzKGFjdGl2ZUtleSkpIHtcbiAgICAgICAgICAgIHRoaXMub25Ob2RlRXhwYW5kKFxuICAgICAgICAgICAgICB7fSBhcyBSZWFjdC5Nb3VzZUV2ZW50PEhUTUxEaXZFbGVtZW50PixcbiAgICAgICAgICAgICAgZXZlbnROb2RlLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGFjdGl2ZUl0ZW0ucGFyZW50KSB7XG4gICAgICAgICAgICB0aGlzLm9uQWN0aXZlQ2hhbmdlKGFjdGl2ZUl0ZW0ucGFyZW50LmRhdGEua2V5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIEtleUNvZGUuUklHSFQ6IHtcbiAgICAgICAgICAvLyBFeHBhbmQgaWYgcG9zc2libGVcbiAgICAgICAgICBpZiAoZXhwYW5kYWJsZSAmJiAhZXhwYW5kZWRLZXlzLmluY2x1ZGVzKGFjdGl2ZUtleSkpIHtcbiAgICAgICAgICAgIHRoaXMub25Ob2RlRXhwYW5kKFxuICAgICAgICAgICAgICB7fSBhcyBSZWFjdC5Nb3VzZUV2ZW50PEhUTUxEaXZFbGVtZW50PixcbiAgICAgICAgICAgICAgZXZlbnROb2RlLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGFjdGl2ZUl0ZW0uY2hpbGRyZW4gJiYgYWN0aXZlSXRlbS5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMub25BY3RpdmVDaGFuZ2UoYWN0aXZlSXRlbS5jaGlsZHJlblswXS5kYXRhLmtleSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZWxlY3Rpb25cbiAgICAgICAgY2FzZSBLZXlDb2RlLkVOVEVSOlxuICAgICAgICBjYXNlIEtleUNvZGUuU1BBQ0U6IHtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBjaGVja2FibGUgJiZcbiAgICAgICAgICAgICFldmVudE5vZGUuZGlzYWJsZWQgJiZcbiAgICAgICAgICAgIGV2ZW50Tm9kZS5jaGVja2FibGUgIT09IGZhbHNlICYmXG4gICAgICAgICAgICAhZXZlbnROb2RlLmRpc2FibGVDaGVja2JveFxuICAgICAgICAgICkge1xuICAgICAgICAgICAgdGhpcy5vbk5vZGVDaGVjayhcbiAgICAgICAgICAgICAge30gYXMgUmVhY3QuTW91c2VFdmVudDxIVE1MRGl2RWxlbWVudD4sXG4gICAgICAgICAgICAgIGV2ZW50Tm9kZSxcbiAgICAgICAgICAgICAgIWNoZWNrZWRLZXlzLmluY2x1ZGVzKGFjdGl2ZUtleSksXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAhY2hlY2thYmxlICYmXG4gICAgICAgICAgICBzZWxlY3RhYmxlICYmXG4gICAgICAgICAgICAhZXZlbnROb2RlLmRpc2FibGVkICYmXG4gICAgICAgICAgICBldmVudE5vZGUuc2VsZWN0YWJsZSAhPT0gZmFsc2VcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHRoaXMub25Ob2RlU2VsZWN0KFxuICAgICAgICAgICAgICB7fSBhcyBSZWFjdC5Nb3VzZUV2ZW50PEhUTUxEaXZFbGVtZW50PixcbiAgICAgICAgICAgICAgZXZlbnROb2RlLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAob25LZXlEb3duKSB7XG4gICAgICBvbktleURvd24oZXZlbnQpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogT25seSB1cGRhdGUgdGhlIHZhbHVlIHdoaWNoIGlzIG5vdCBpbiBwcm9wc1xuICAgKi9cbiAgc2V0VW5jb250cm9sbGVkU3RhdGUgPSAoXG4gICAgc3RhdGU6IFBhcnRpYWw8VHJlZVN0YXRlPixcbiAgICBhdG9taWM6IGJvb2xlYW4gPSBmYWxzZSxcbiAgKSA9PiB7XG4gICAgbGV0IG5lZWRTeW5jID0gZmFsc2U7XG4gICAgbGV0IGFsbFBhc3NlZCA9IHRydWU7XG4gICAgY29uc3QgbmV3U3RhdGUgPSB7fTtcblxuICAgIE9iamVjdC5rZXlzKHN0YXRlKS5mb3JFYWNoKG5hbWUgPT4ge1xuICAgICAgaWYgKG5hbWUgaW4gdGhpcy5wcm9wcykge1xuICAgICAgICBhbGxQYXNzZWQgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBuZWVkU3luYyA9IHRydWU7XG4gICAgICBuZXdTdGF0ZVtuYW1lXSA9IHN0YXRlW25hbWVdO1xuICAgIH0pO1xuXG4gICAgaWYgKG5lZWRTeW5jICYmICghYXRvbWljIHx8IGFsbFBhc3NlZCkpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUobmV3U3RhdGUpO1xuICAgIH1cbiAgfTtcblxuICBzY3JvbGxUbzogU2Nyb2xsVG8gPSBzY3JvbGwgPT4ge1xuICAgIHRoaXMubGlzdFJlZi5jdXJyZW50LnNjcm9sbFRvKHNjcm9sbCk7XG4gIH07XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHtcbiAgICAgIGZvY3VzZWQsXG4gICAgICBmbGF0dGVuTm9kZXMsXG4gICAgICBrZXlFbnRpdGllcyxcbiAgICAgIGRyYWdnaW5nLFxuICAgICAgYWN0aXZlS2V5LFxuICAgIH0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHtcbiAgICAgIHByZWZpeENscyxcbiAgICAgIGNsYXNzTmFtZSxcbiAgICAgIHN0eWxlLFxuICAgICAgc2hvd0xpbmUsXG4gICAgICBmb2N1c2FibGUsXG4gICAgICB0YWJJbmRleCA9IDAsXG4gICAgICBzZWxlY3RhYmxlLFxuICAgICAgc2hvd0ljb24sXG4gICAgICBpY29uLFxuICAgICAgc3dpdGNoZXJJY29uLFxuICAgICAgZHJhZ2dhYmxlLFxuICAgICAgY2hlY2thYmxlLFxuICAgICAgY2hlY2tTdHJpY3RseSxcbiAgICAgIGRpc2FibGVkLFxuICAgICAgbW90aW9uLFxuICAgICAgbG9hZERhdGEsXG4gICAgICBmaWx0ZXJUcmVlTm9kZSxcbiAgICAgIGhlaWdodCxcbiAgICAgIGl0ZW1IZWlnaHQsXG4gICAgICB2aXJ0dWFsLFxuICAgIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IGRvbVByb3BzOiBSZWFjdC5IVE1MQXR0cmlidXRlczxIVE1MRGl2RWxlbWVudD4gPSBnZXREYXRhQW5kQXJpYShcbiAgICAgIHRoaXMucHJvcHMsXG4gICAgKTtcblxuICAgIHJldHVybiAoXG4gICAgICA8VHJlZUNvbnRleHQuUHJvdmlkZXJcbiAgICAgICAgdmFsdWU9e3tcbiAgICAgICAgICBwcmVmaXhDbHMsXG4gICAgICAgICAgc2VsZWN0YWJsZSxcbiAgICAgICAgICBzaG93SWNvbixcbiAgICAgICAgICBpY29uLFxuICAgICAgICAgIHN3aXRjaGVySWNvbixcbiAgICAgICAgICBkcmFnZ2FibGUsXG4gICAgICAgICAgY2hlY2thYmxlLFxuICAgICAgICAgIGNoZWNrU3RyaWN0bHksXG4gICAgICAgICAgZGlzYWJsZWQsXG4gICAgICAgICAga2V5RW50aXRpZXMsXG5cbiAgICAgICAgICBsb2FkRGF0YSxcbiAgICAgICAgICBmaWx0ZXJUcmVlTm9kZSxcblxuICAgICAgICAgIG9uTm9kZUNsaWNrOiB0aGlzLm9uTm9kZUNsaWNrLFxuICAgICAgICAgIG9uTm9kZURvdWJsZUNsaWNrOiB0aGlzLm9uTm9kZURvdWJsZUNsaWNrLFxuICAgICAgICAgIG9uTm9kZUV4cGFuZDogdGhpcy5vbk5vZGVFeHBhbmQsXG4gICAgICAgICAgb25Ob2RlU2VsZWN0OiB0aGlzLm9uTm9kZVNlbGVjdCxcbiAgICAgICAgICBvbk5vZGVDaGVjazogdGhpcy5vbk5vZGVDaGVjayxcbiAgICAgICAgICBvbk5vZGVMb2FkOiB0aGlzLm9uTm9kZUxvYWQsXG4gICAgICAgICAgb25Ob2RlTW91c2VFbnRlcjogdGhpcy5vbk5vZGVNb3VzZUVudGVyLFxuICAgICAgICAgIG9uTm9kZU1vdXNlTGVhdmU6IHRoaXMub25Ob2RlTW91c2VMZWF2ZSxcbiAgICAgICAgICBvbk5vZGVDb250ZXh0TWVudTogdGhpcy5vbk5vZGVDb250ZXh0TWVudSxcbiAgICAgICAgICBvbk5vZGVEcmFnU3RhcnQ6IHRoaXMub25Ob2RlRHJhZ1N0YXJ0LFxuICAgICAgICAgIG9uTm9kZURyYWdFbnRlcjogdGhpcy5vbk5vZGVEcmFnRW50ZXIsXG4gICAgICAgICAgb25Ob2RlRHJhZ092ZXI6IHRoaXMub25Ob2RlRHJhZ092ZXIsXG4gICAgICAgICAgb25Ob2RlRHJhZ0xlYXZlOiB0aGlzLm9uTm9kZURyYWdMZWF2ZSxcbiAgICAgICAgICBvbk5vZGVEcmFnRW5kOiB0aGlzLm9uTm9kZURyYWdFbmQsXG4gICAgICAgICAgb25Ob2RlRHJvcDogdGhpcy5vbk5vZGVEcm9wLFxuICAgICAgICB9fVxuICAgICAgPlxuICAgICAgICA8ZGl2XG4gICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWVzKHByZWZpeENscywgY2xhc3NOYW1lLCB7XG4gICAgICAgICAgICBbYCR7cHJlZml4Q2xzfS1zaG93LWxpbmVgXTogc2hvd0xpbmUsXG4gICAgICAgICAgICBbYCR7cHJlZml4Q2xzfS1mb2N1c2VkYF06IGZvY3VzZWQsXG4gICAgICAgICAgICBbYCR7cHJlZml4Q2xzfS1hY3RpdmUtZm9jdXNlZGBdOiBhY3RpdmVLZXkgIT09IG51bGwsXG4gICAgICAgICAgfSl9XG4gICAgICAgID5cbiAgICAgICAgICA8Tm9kZUxpc3RcbiAgICAgICAgICAgIHJlZj17dGhpcy5saXN0UmVmfVxuICAgICAgICAgICAgcHJlZml4Q2xzPXtwcmVmaXhDbHN9XG4gICAgICAgICAgICBzdHlsZT17c3R5bGV9XG4gICAgICAgICAgICBkYXRhPXtmbGF0dGVuTm9kZXN9XG4gICAgICAgICAgICBkaXNhYmxlZD17ZGlzYWJsZWR9XG4gICAgICAgICAgICBzZWxlY3RhYmxlPXtzZWxlY3RhYmxlfVxuICAgICAgICAgICAgY2hlY2thYmxlPXtjaGVja2FibGUgPyAxOjAgfSAvLyBSZWFjdOWvuWJvb2xlYW7nsbvlnovnmoRhdHRyaWJ1dGXnmoTor4bliKvmlrnlvI/pl67popjvvIzlj6/ku6Xph4fnlKjku6XkuIvmlrnms5Xop6PlhrPvvJp4eHg9e3ZhbHVlID8gMSA6IDB9XG4gICAgICAgICAgICBtb3Rpb249e21vdGlvbn1cbiAgICAgICAgICAgIGRyYWdnaW5nPXtkcmFnZ2luZ31cbiAgICAgICAgICAgIGhlaWdodD17aGVpZ2h0fVxuICAgICAgICAgICAgaXRlbUhlaWdodD17aXRlbUhlaWdodH1cbiAgICAgICAgICAgIHZpcnR1YWw9e3ZpcnR1YWx9XG4gICAgICAgICAgICBmb2N1c2FibGU9e2ZvY3VzYWJsZX1cbiAgICAgICAgICAgIGZvY3VzZWQ9e2ZvY3VzZWR9XG4gICAgICAgICAgICB0YWJJbmRleD17dGFiSW5kZXh9XG4gICAgICAgICAgICBhY3RpdmVJdGVtPXt0aGlzLmdldEFjdGl2ZUl0ZW0oKX1cbiAgICAgICAgICAgIG9uRm9jdXM9e3RoaXMub25Gb2N1c31cbiAgICAgICAgICAgIG9uQmx1cj17dGhpcy5vbkJsdXJ9XG4gICAgICAgICAgICBvbktleURvd249e3RoaXMub25LZXlEb3dufVxuICAgICAgICAgICAgb25BY3RpdmVDaGFuZ2U9e3RoaXMub25BY3RpdmVDaGFuZ2V9XG4gICAgICAgICAgICB7Li4udGhpcy5nZXRUcmVlTm9kZVJlcXVpcmVkUHJvcHMoKX1cbiAgICAgICAgICAgIHsuLi5kb21Qcm9wc31cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvVHJlZUNvbnRleHQuUHJvdmlkZXI+XG4gICAgKTtcbiAgfVxufVxuXG5wb2x5ZmlsbChUcmVlKTtcblxuZXhwb3J0IGRlZmF1bHQgVHJlZTtcbiJdLCJ2ZXJzaW9uIjozfQ==