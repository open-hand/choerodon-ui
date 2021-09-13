import React, { Component, Key } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { action, computed, observable, runInAction } from 'mobx';
import noop from 'lodash/noop';
import xor from 'lodash/xor';
import C7NTree, {
  C7nTreeNodeProps,
  EventDataNode,
  DataNode,
  TreeNode,
  TreeProps as C7NTreeProps,
} from 'choerodon-ui/lib/tree';
import { CheckInfo } from 'choerodon-ui/lib/rc-components/tree/Tree';
import autobind from '../_util/autobind';
import DataSet from '../data-set/DataSet';
import { getKey, getTreeNodes, NodeRenderer, TreeNodeRenderer } from './util';
import { BooleanValue, DataSetSelection } from '../data-set/enum';
import Spin from '../spin';

export interface C7nNodeEvent extends EventDataNode {
  eventKey: string
}

export interface TreeNodeCheckedEvent {
  event: 'check';
  node: C7nNodeEvent;
  checked: boolean;
  nativeEvent: MouseEvent;
  checkedNodes: DataNode[];
  checkedNodesPositions?: { node: DataNode; pos: string }[];
  halfCheckedKeys?: string[];
}

export interface C7nTreeNodeSelectedEvent {
  event: 'select';
  selected: boolean;
  node: C7nNodeEvent;
  selectedNodes: DataNode[];
  nativeEvent: MouseEvent;
}

export interface C7nTreeNodeExpandedEvent {
  expanded: boolean;
  nativeEvent: MouseEvent;
  node: C7nNodeEvent;
}

export interface TreeProps extends C7NTreeProps {
  dataSet?: DataSet;
  renderer?: NodeRenderer;
  titleField?: string;
  onTreeNode?: TreeNodeRenderer;
  /**
   * @deprecated
   */
  treeNodeRenderer?: TreeNodeRenderer;
  async?: boolean;
}

export function defaultRenderer({ text }) {
  return text;
}

function defaultNodeCover() {
  return {};
}

const keyPropType = PropTypes.oneOfType([PropTypes.string, PropTypes.number]);
@observer
export default class Tree extends Component<TreeProps> {
  static displayName = 'Tree<PRO>';

  static propTypes = {
    prefixCls: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    tabIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    children: PropTypes.any,
    treeData: PropTypes.array, // Generate treeNode by children
    showLine: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
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

  static TreeNode = TreeNode;

  @observable stateCheckedKeys: string[];

  @observable stateExpandedKeys: string[];

  @observable stateLoadedKeys: string[];

  componentWillMount() {
    this.handleDataSetLoad();
    this.processDataSetListener(true);
  }


  componentWillReceiveProps(nextProps) {
    const { defaultExpandAll, defaultSelectedKeys, defaultExpandedKeys, defaultCheckedKeys } = this.props;
    if (defaultExpandAll !== nextProps.defaultExpandAll ||
      defaultExpandedKeys !== nextProps.defaultExpandedKeys ||
      defaultCheckedKeys !== nextProps.defaultCheckKeys ||
      defaultSelectedKeys !== nextProps.defaultSelectedKeys
    ) {
      this.processDataSetListener(false);
      this.processDataSetListener(true);
    }
  }

  componentWillUnmount() {
    this.processDataSetListener(false);
  }

  processDataSetListener(flag: boolean) {
    const { dataSet } = this.props;
    if (dataSet) {
      const handler = flag ? dataSet.addEventListener : dataSet.removeEventListener;
      handler.call(dataSet, 'load', this.handleDataSetLoad);
    }
  }

  @autobind
  handleDataSetLoad() {
    this.initDefaultExpandedRows();
    this.initDefaultCheckRows();
    this.initDefaultSelectRows();
    this.initDefaultLoadedRows();
  }

  @action
  initDefaultExpandedRows() {
    const {
      props: {
        defaultExpandAll,
        dataSet,
        defaultExpandedKeys,
      },
    } = this;
    this.stateExpandedKeys = this.dealDefaultCheckExpand(dataSet, defaultExpandedKeys, defaultExpandAll);
  }

  @action
  initDefaultCheckRows() {
    const {
      props: {
        dataSet,
        defaultCheckedKeys,
      },
    } = this;
    this.stateCheckedKeys = this.dealDefaultCheckExpand(dataSet, defaultCheckedKeys);
  }

  @action
  initDefaultLoadedRows() {
    this.stateLoadedKeys = [];
  }

  @action
  initDefaultSelectRows() {
    const {
      props: {
        dataSet,
        defaultSelectedKeys,
      },
    } = this;
    if (dataSet && (defaultSelectedKeys)) {
      const { idField } = dataSet.props;
      defaultSelectedKeys.map(selectKey => {
        const found = dataSet.find(
          record => selectKey === String(idField ? record.get(idField) : record.id),
        );
        if (found) {
          dataSet.select(found);
        }
        return null;
      });
    }

  }

  /**
   * 处理tree的props expand check的默认事件
   * @param dataSet
   * @param defaultAll
   * @param defaultKeys
   */
  dealDefaultCheckExpand(dataSet: DataSet | undefined, defaultKeys: Key[] | undefined, defaultAll?: boolean) {
    let defaultStateKeys: string[] = [];
    if (dataSet) {
      const { idField, expandField } = dataSet.props;
      if (defaultAll && !expandField) {
        defaultStateKeys = dataSet.reduce<(string)[]>((array, record) => {
          if (record.children) {
            array.push(getKey(record, idField));
          }
          return array;
        }, []);
      } else if (defaultKeys && !expandField) {
        defaultStateKeys = dataSet.reduce<(string)[]>((array, record) => {
          defaultKeys.map((key) => {
            if (getKey(record, idField) === key) {
              array.push(key);
            }
            return null;
          });
          return array;
        }, []);
      }
    }
    return defaultStateKeys;
  }

  @computed
  get expandedKeys(): string[] {
    const { dataSet } = this.props;
    if (dataSet) {
      const { expandField, idField } = dataSet.props;
      if (expandField) {
        const keys: string[] = [];
        dataSet.forEach(record => {
          if (record.isExpanded) {
            keys.push(getKey(record, idField));
          }
        });
        return keys;
      }
    }
    return this.stateExpandedKeys;
  }

  get checkedKeys(): string[] {
    const { dataSet, selectable, checkable } = this.props;
    if (dataSet) {
      const { checkField, idField } = dataSet.props;
      if (checkField) {
        const keys: string[] = [];
        dataSet.forEach(record => {
          const field = record.getField(checkField);
          const key = getKey(record, idField);
          if (record.get(checkField) === (field ? field.get(BooleanValue.trueValue) : true)) {
            keys.push(key);
            if (checkable && record.selectable && !record.isSelected && selectable === false) {
              record.isSelected = true;
            }
          }
        });
        return keys;
      }
    }
    return this.stateCheckedKeys;
  }

  @computed
  get selectedKeys(): string[] {
    const { dataSet } = this.props;
    if (dataSet) {
      const { idField } = dataSet.props;
      return dataSet.selected.map(record => getKey(record, idField));
    }
    return [];
  }

  constructor(props, context) {
    super(props, context);
    runInAction(() => {
      this.stateCheckedKeys = [];
      this.stateExpandedKeys = [];
      this.stateLoadedKeys = [];
    });
  }

  setExpand(eventObj: C7nTreeNodeExpandedEvent) {
    const { dataSet } = this.props;
    if (dataSet) {
      const { expandField, idField } = dataSet.props;
      if (expandField) {
        const { node, expanded } = eventObj;
        const { eventKey } = node;
        const found = dataSet.find(record => eventKey === getKey(record, idField));
        if (found) {
          found.isExpanded = !!expanded;
          return false;
        }
      }
    }
    return true;
  }


  setCheck(eventObj: C7nTreeNodeProps) {
    const { dataSet } = this.props;
    if (dataSet) {
      const { checkField, idField } = dataSet.props;
      if (checkField) {
        const { node, checked } = eventObj;
        const { eventKey } = node;
        const found = dataSet.find(
          record => eventKey === String(idField ? record.get(idField) : record.id),
        );
        if (found) {
          const field = found.getField(checkField);
          found.set(
            checkField,
            field
              ? checked
              ? field.get(BooleanValue.trueValue)
              : field.get(BooleanValue.falseValue)
              : checked,
          );
          return false;
        }
      }
    }
    return true;
  }

  @autobind
  handleExpand(expandedKeys: string[], eventObj: C7nTreeNodeExpandedEvent) {
    if (this.setExpand(eventObj)) {
      runInAction(() => {
        this.stateExpandedKeys = expandedKeys;
      });
    }
    const { onExpand = noop } = this.props;
    onExpand(expandedKeys, eventObj);
  }

  @autobind
  handleCheck(checkedKeys: string[], eventObj: CheckInfo, oldCheckedKeys: string[]) {
    const { dataSet, selectable } = this.props;

    if (this.setCheck(eventObj)) {
      runInAction(() => {
        this.stateCheckedKeys = checkedKeys;
      });
    }
    if (dataSet && selectable === false) {
      const { idField } = dataSet.props;
      const diffKeys = xor(oldCheckedKeys, checkedKeys);
      dataSet.forEach(record => {
        diffKeys.forEach((key) => {
          if (getKey(record, idField) === key) {
            if (!record.isSelected) {
              dataSet.select(record);
            } else {
              dataSet.unSelect(record);
            }
          }
        });
      });
    }

    const { onCheck = noop } = this.props;
    onCheck(checkedKeys, eventObj, oldCheckedKeys);
  }

  @autobind
  handleSelect(selectedKeys: string[], eventObj: C7nTreeNodeSelectedEvent) {
    const { dataSet, onSelect = noop } = this.props;
    if (dataSet) {
      const { idField } = dataSet.props;
      const { node, selected } = eventObj;
      const { eventKey } = node;
      const found = dataSet.find(
        record => eventKey === String(idField ? record.get(idField) : record.id),
      );
      if (found) {
        if (selected) {
          dataSet.select(found);
        } else {
          dataSet.unSelect(found);
        }
      }
      onSelect(selectedKeys, eventObj);
    }
  }

  @autobind
  handleLoadData(event): Promise<any> {
    const { dataSet, loadData, async } = this.props;
    const promises: Promise<any>[] = [];
    if (async && dataSet) {
      const { record } = event.props;
      promises.push(dataSet.queryMoreChild(record));
    }
    if (loadData) {
      promises.push(loadData(event));
    }
    return Promise.all(promises).then(action(() => this.stateLoadedKeys.push(event.key)));
  }

  render() {
    const { dataSet, renderer = defaultRenderer, titleField, treeNodeRenderer, onTreeNode, loadData, async, selectable, ...otherProps } = this.props;
    if (dataSet) {
      const props: TreeProps = {};
      props.treeData = getTreeNodes(
        dataSet,
        dataSet.treeData,
        renderer,
        // @ts-ignore
        onTreeNode || treeNodeRenderer || defaultNodeCover,
        async || !!loadData,
        titleField,
      ) || [];
      // @ts-ignore
      props.onExpand = this.handleExpand;
      // @ts-ignore
      props.onCheck = this.handleCheck;
      // @ts-ignore
      props.onSelect = this.handleSelect;
      props.selectable = selectable;
      props.loadData = this.handleLoadData;
      props.expandedKeys = this.expandedKeys.slice();
      if (!('checkedKeys' in otherProps)) {
        props.checkedKeys = this.checkedKeys.slice();
      }
      if (!('multiple' in otherProps)) {
        props.multiple = dataSet.props.selection === DataSetSelection.multiple;
      }
      if (!('selectedKeys' in otherProps)) {
        props.selectedKeys = this.selectedKeys.slice();
      }
      if (!('loadedKeys' in otherProps)) {
        props.loadedKeys = this.stateLoadedKeys.slice();
      }
      return (
        <Spin dataSet={dataSet}>
          <C7NTree {...otherProps} {...props} />
        </Spin>
      );
    }
    return <C7NTree {...otherProps} />;
  }
}
