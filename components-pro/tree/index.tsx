import Set from 'core-js/library/fn/set';
import React, { Component, Key, MouseEvent } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { action, computed, observable, runInAction } from 'mobx';
import noop from 'lodash/noop';
import C7NTree, { C7nTreeNodeProps, DataNode, EventDataNode, TreeNode, TreeProps as C7NTreeProps } from 'choerodon-ui/lib/tree';
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

  static TreeNode = TreeNode;

  @observable stateCheckedKeys: string[];

  @observable stateExpandedKeys: string[];

  stateForceRenderKeys: string[] = [];


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
    this.stateExpandedKeys = this.dealDefalutCheckExpand(dataSet, defaultExpandedKeys, defaultExpandAll);
  }

  @action
  initDefaultCheckRows() {
    const {
      props: {
        dataSet,
        defaultCheckedKeys,
      },
    } = this;
    this.stateCheckedKeys = this.dealDefalutCheckExpand(dataSet, defaultCheckedKeys);
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
   * @param defalutAll
   * @param defalutKeys
   */
  dealDefalutCheckExpand(dataSet: DataSet | undefined, defalutKeys: Key[] | undefined, defalutAll?: boolean) {
    let defalutStateKeys: string[] = [];
    if (dataSet) {
      const { idField, expandField } = dataSet.props;
      if (defalutAll && !expandField) {
        defalutStateKeys = dataSet.reduce<(string)[]>((array, record) => {
          if (record.children) {
            array.push(getKey(record, idField));
          }
          return array;
        }, []);
      } else if (defalutKeys && !expandField) {
        defalutStateKeys = dataSet.reduce<(string)[]>((array, record) => {
          defalutKeys.map((key) => {
            if (getKey(record, idField) === key) {
              array.push(key);
            }
            return null;
          });
          return array;
        }, []);
      }
    }
    return defalutStateKeys;
  }

  @computed
  get forceRenderKeys() {
    return (this.stateForceRenderKeys = [
      ...new Set<string>([...this.stateForceRenderKeys, ...this.expandedKeys]),
    ]);
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

  @computed
  get checkedKeys(): string[] {
    const { dataSet } = this.props;
    if (dataSet) {
      const { checkField, idField } = dataSet.props;
      if (checkField) {
        const keys: string[] = [];
        dataSet.forEach(record => {
          const field = record.getField(checkField);
          if (record.get(checkField) === (field ? field.get(BooleanValue.trueValue) : true)) {
            keys.push(getKey(record, idField));
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
    // @ts-ignore
    onExpand(expandedKeys, eventObj);
  }

  @autobind
  handleCheck(checkedKeys: string[], eventObj: TreeNodeCheckedEvent) {
    if (this.setCheck(eventObj)) {
      runInAction(() => {
        this.stateCheckedKeys = checkedKeys;
      });
    }
    const { onCheck = noop } = this.props;
    onCheck(checkedKeys, eventObj);
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
    const { dataSet, loadData } = this.props;
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

  render() {
    const { dataSet, renderer = defaultRenderer, titleField, treeNodeRenderer, onTreeNode, loadData, async, ...otherProps } = this.props;
    if (dataSet) {
      const { defaultExpandAll } = otherProps;
      const props: TreeProps = {};
      props.treeData = getTreeNodes(
        dataSet,
        dataSet.treeData,
        defaultExpandAll ? [] : this.forceRenderKeys,
        renderer,
        // @ts-ignore
        onTreeNode || treeNodeRenderer || defaultNodeCover,
        async || !!loadData,
        titleField,
        defaultExpandAll,
      ) || [];
      // @ts-ignore
      props.onExpand = this.handleExpand;
      // @ts-ignore
      props.onCheck = this.handleCheck;
      // @ts-ignore
      props.onSelect = this.handleSelect;
      if (async) {
        props.loadData = this.handleLoadData;
      } else {
        props.loadData = loadData;
      }
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
      return (
        <Spin dataSet={dataSet}>
          <C7NTree {...otherProps} {...props} />
        </Spin>
      );
    }
    return <C7NTree {...otherProps} />;
  }
}
