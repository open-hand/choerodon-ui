import * as React from 'react';
import classNames from 'classnames';
import omit from 'lodash/omit';
import debounce from 'lodash/debounce';
import Icon from '../icon';
import { conductExpandParent } from '../rc-components/tree/util';
import { EventDataNode, DataNode, Key } from '../rc-components/tree/interface';
import { convertDataToEntities, convertTreeToData } from '../rc-components/tree/utils/treeUtil';
import Tree, { TreeProps, C7ndTreeNodeAttribute } from './index';
import { calcRangeKeys, convertDirectoryKeysToNodes } from './utils/dictUtil';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

export type ExpandAction = false | 'click' | 'doubleClick';

export interface DirectoryTreeProps extends TreeProps {
  expandAction?: ExpandAction;
}

export interface DirectoryTreeState {
  expandedKeys?: Key[];
  selectedKeys?: Key[];
}

function TreeIcon(props: C7ndTreeNodeAttribute) {
  const { getPrefixCls } = React.useContext(ConfigContext);
  const { isLeaf, expanded, prefixCls } = props;
  const prefixCl = getPrefixCls('tree', prefixCls);
  if (isLeaf) {
    return <Icon type="insert_drive_file" className={`${prefixCl}-switcher-line-icon`} />;
  }
  return expanded ? <Icon type="baseline-file_copy" className={`${prefixCl}-switcher-line-icon`} /> :
    <Icon type="library_books" className={`${prefixCl}-switcher-line-icon`} />;
}

function getIcon(props: C7ndTreeNodeAttribute): React.ReactNode {
  return <TreeIcon {...props} />;
}

function getTreeData({ treeData, children }: DirectoryTreeProps) {
  return treeData || convertTreeToData(children);
}

class DirectoryTree extends React.Component<DirectoryTreeProps, DirectoryTreeState> {
  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static defaultProps = {
    showIcon: true,
    expandAction: 'click',
  };

  static getDerivedStateFromProps(nextProps: DirectoryTreeProps) {
    const newState: DirectoryTreeState = {};
    if ('expandedKeys' in nextProps) {
      newState.expandedKeys = nextProps.expandedKeys;
    }
    if ('selectedKeys' in nextProps) {
      newState.selectedKeys = nextProps.selectedKeys;
    }
    return newState;
  }

  context: ConfigContextValue;

  state: DirectoryTreeState;

  tree: Tree;

  onDebounceExpand: (event: React.MouseEvent<HTMLElement>, node: EventDataNode) => void;

  // Shift click usage
  lastSelectedKey?: string;

  cachedSelectedKeys?: string[];

  constructor(props: DirectoryTreeProps) {
    super(props);

    const { defaultExpandAll, defaultExpandParent, expandedKeys, defaultExpandedKeys } = props;
    const { keyEntities } = convertDataToEntities(getTreeData(props));

    // Selected keys
    this.state = {
      selectedKeys: props.selectedKeys || props.defaultSelectedKeys || [],
    };

    // Expanded keys
    if (defaultExpandAll) {
      this.state.expandedKeys = Object.keys(keyEntities);
    } else if (defaultExpandParent) {
      this.state.expandedKeys = conductExpandParent(
        expandedKeys || defaultExpandedKeys || [],
        keyEntities,
      );
    } else {
      this.state.expandedKeys = expandedKeys || defaultExpandedKeys;
    }

    this.onDebounceExpand = debounce(this.expandFolderNode, 200, {
      leading: true,
    });
  }

  onExpand = (
    expandedKeys: string[],
    info: {
      node: EventDataNode;
      expanded: boolean;
      nativeEvent: MouseEvent;
    },
  ) => {
    const { onExpand } = this.props;

    this.setUncontrolledState({ expandedKeys });

    // Call origin function
    if (onExpand) {
      return onExpand(expandedKeys, info);
    }

    return undefined;
  };

  onClick = (event: React.MouseEvent<HTMLElement>, node: EventDataNode) => {
    const { onClick, expandAction } = this.props;

    // Expand the tree
    if (expandAction === 'click') {
      this.onDebounceExpand(event, node);
    }

    if (onClick) {
      onClick(event, node);
    }
  };

  onDoubleClick = (event: React.MouseEvent<HTMLElement>, node: EventDataNode) => {
    const { onDoubleClick, expandAction } = this.props;

    // Expand the tree
    if (expandAction === 'doubleClick') {
      this.onDebounceExpand(event, node);
    }

    if (onDoubleClick) {
      onDoubleClick(event, node);
    }
  };

  onSelect = (
    keys: string[],
    event: {
      event: 'select';
      selected: boolean;
      node: any;
      selectedNodes: DataNode[];
      nativeEvent: MouseEvent;
    },
  ) => {
    const { onSelect, multiple } = this.props;
    const { expandedKeys = [] } = this.state;
    const { node, nativeEvent } = event;
    const { key = '' } = node;

    const treeData = getTreeData(this.props);
    const newState: DirectoryTreeState = {};

    // We need wrap this event since some value is not same
    const newEvent: any = {
      ...event,
      selected: true, // Directory selected always true
    };

    // Windows / Mac single pick
    const ctrlPick: boolean = nativeEvent.ctrlKey || nativeEvent.metaKey;
    const shiftPick: boolean = nativeEvent.shiftKey;

    // Generate new selected keys
    let newSelectedKeys: string[];
    if (multiple && ctrlPick) {
      // Control click
      newSelectedKeys = keys;
      this.lastSelectedKey = key;
      this.cachedSelectedKeys = newSelectedKeys;
      newEvent.selectedNodes = convertDirectoryKeysToNodes(treeData, newSelectedKeys);
    } else if (multiple && shiftPick) {
      // Shift click
      newSelectedKeys = Array.from(
        new Set([
          ...(this.cachedSelectedKeys || []),
          ...calcRangeKeys(treeData, expandedKeys, key, this.lastSelectedKey),
        ]),
      );
      newEvent.selectedNodes = convertDirectoryKeysToNodes(treeData, newSelectedKeys);
    } else {
      // Single click
      newSelectedKeys = [key];
      this.lastSelectedKey = key;
      this.cachedSelectedKeys = newSelectedKeys;
      newEvent.selectedNodes = convertDirectoryKeysToNodes(treeData, newSelectedKeys);
    }
    newState.selectedKeys = newSelectedKeys;

    if (onSelect) {
      onSelect(newSelectedKeys, newEvent);
    }

    this.setUncontrolledState(newState);
  };

  setTreeRef = (node: Tree) => {
    this.tree = node;
  };

  expandFolderNode = (event: React.MouseEvent<HTMLElement>, node: any) => {
    const { isLeaf } = node;

    if (isLeaf || event.shiftKey || event.metaKey || event.ctrlKey) {
      return;
    }

    // Get internal rc-tree
    const internalTree = this.tree.tree;

    // Call internal rc-tree expand function
    // https://github.com/C7n-design/C7n-design/issues/12567
    internalTree.onNodeExpand(event, node);
  };

  getPrefixCls() {
    const { prefixCls } = this.props;
    const { getPrefixCls } = this.context;
    return getPrefixCls('tree', prefixCls);
  }

  setUncontrolledState = (state: DirectoryTreeState) => {
    const newState = omit(state, Object.keys(this.props));
    if (Object.keys(newState).length) {
      this.setState(newState);
    }
  };

  renderDirectoryTree = () => {
    const { className, ...props } = this.props;
    const { expandedKeys, selectedKeys } = this.state;

    const prefixCls = this.getPrefixCls();
    const connectClassName = classNames(`${prefixCls}-directory`, className, {
      [`${prefixCls}-directory-rtl`]: true,
    });

    return (
      <Tree
        icon={getIcon}
        ref={this.setTreeRef}
        blockNode
        {...props}
        prefixCls={prefixCls}
        className={connectClassName}
        expandedKeys={expandedKeys}
        selectedKeys={selectedKeys}
        onSelect={this.onSelect}
        onClick={this.onClick}
        onDoubleClick={this.onDoubleClick}
        onExpand={this.onExpand}
      />
    );
  };

  render() {
    return this.renderDirectoryTree();
  }
}

export default DirectoryTree;
