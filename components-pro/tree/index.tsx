import React, { Component, Key } from 'react';
import { observer } from 'mobx-react';
import { action, computed, observable, runInAction } from 'mobx';
import defaultTo from 'lodash/defaultTo';
import noop from 'lodash/noop';
import xor from 'lodash/xor';
import isNil from 'lodash/isNil';
import C7NTree, {
  C7nTreeNodeProps,
  EventDataNode,
  DataNode,
  TreeNode,
  TreeProps as C7NTreeProps,
} from 'choerodon-ui/lib/tree';
import { CheckInfo } from 'choerodon-ui/lib/rc-components/tree/Tree';
import { QUERY_CANCELABLE } from 'choerodon-ui/dataset/data-set/DataSet';
import autobind from '../_util/autobind';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import { getKey, getTreeNodes, NodeRenderer, TreeNodeRenderer } from './util';
import { BooleanValue, DataSetEvents, DataSetSelection } from '../data-set/enum';
import { equalTrueValue, getFirstValue } from '../data-set/utils';
import Spin from '../spin';

export interface C7nNodeEvent extends EventDataNode {
  eventKey: string;
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
  filter?: (record: Record, index: number, array: Record[]) => boolean;
}

type CheckedKeys = string[] | { checked: string[], halfChecked: string[] };

export function defaultRenderer({ text }) {
  return text;
}

function defaultNodeCover() {
  return {};
}

function getCheckedKeys(checkedKeys: CheckedKeys): string[] {
  return Array.isArray(checkedKeys)
    ? checkedKeys
    : typeof checkedKeys === 'object'
      ? checkedKeys.checked
      : [];
}

@observer
export default class Tree extends Component<TreeProps> {
  static displayName = 'Tree<PRO>';

  static TreeNode: typeof TreeNode = TreeNode;

  @observable stateCheckedKeys: string[];

  @observable stateExpandedKeys: string[];

  @observable stateLoadedKeys: string[];

  inCheckExpansion = false;

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
    const { dataSet, selectable, checkable } = this.props;
    if (dataSet) {
      const handler = flag ? dataSet.addEventListener : dataSet.removeEventListener;
      handler.call(dataSet, DataSetEvents.load, this.handleDataSetLoad);
      if (checkable && selectable === false) {
        handler.call(dataSet, DataSetEvents.batchSelect, this.handleBatchSelect);
        handler.call(dataSet, DataSetEvents.batchUnSelect, this.handleUnBatchSelect);
      }
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
        checkable,
        selectable,
        defaultCheckedKeys,
      },
    } = this;
    this.stateCheckedKeys = this.dealDefaultCheckExpand(dataSet, defaultCheckedKeys);
    if (dataSet) {
      const { checkField, idField } = dataSet.props;
      if (checkable && selectable === false) {
        if (checkField) {
          const field = dataSet.getField(checkField);
          dataSet.forEach(record => {
            if (equalTrueValue((field ? field.get(BooleanValue.trueValue, record) : true), record.get(checkField))) {
              record.isSelected = true;
            }
          });
        } else {
          this.stateCheckedKeys = dataSet.selected.map(selected => String(idField ? selected.get(idField) : selected.id));
        }
      }
    }
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
    const { dataSet } = this.props;
    if (dataSet) {
      const { checkField, idField } = dataSet.props;
      if (checkField) {
        const keys: string[] = [];
        const field = dataSet.getField(checkField);
        dataSet.forEach(record => {
          const key = getKey(record, idField);
          if (equalTrueValue((field ? field.get(BooleanValue.trueValue, record) : true), record.get(checkField))) {
            keys.push(key);
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

  get checkStrictly(): boolean | undefined {
    const { dataSet, checkStrictly } = this.props;
    if (dataSet && !isNil(dataSet.props.treeCheckStrictly)) {
      return dataSet.props.treeCheckStrictly;
    }
    if (dataSet && dataSet.props.checkField) {
      return false;
    }
    return checkStrictly;
  }

  constructor(props, context) {
    super(props, context);
    runInAction(() => {
      this.stateCheckedKeys = [];
      this.stateExpandedKeys = [];
      this.stateLoadedKeys = [];
    });
    const { async, dataSet } = props;
    if (async && dataSet) {
      dataSet.setState(QUERY_CANCELABLE, false)
    }
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
          const field = dataSet.getField(checkField);
          found.set(
            checkField,
            field ? getFirstValue(checked ? field.get(BooleanValue.trueValue, found) : field.get(BooleanValue.falseValue, found)) : checked,
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
  handleCheck(checkedKeys: CheckedKeys, eventObj: CheckInfo, oldCheckedKeys: CheckedKeys) {
    const checkedKeysArr = getCheckedKeys(checkedKeys);
    const oldCheckedKeysArr = getCheckedKeys(oldCheckedKeys);
    this.inCheckExpansion = true;
    const { dataSet, selectable } = this.props;

    if (this.setCheck(eventObj)) {
      runInAction(() => {
        this.stateCheckedKeys = checkedKeysArr;
      });
    }
    if (dataSet && selectable === false) {
      const { idField } = dataSet.props;
      const diffKeys = xor(oldCheckedKeysArr, checkedKeysArr);
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
    this.inCheckExpansion = false;
  }

  @autobind
  handleBatchSelect({ dataSet, records }) {
    this.handleDataSetSelect({ dataSet, records }, true);
  }

  @autobind
  handleUnBatchSelect({ dataSet, records }) {
    this.handleDataSetSelect({ dataSet, records }, false);
  }

  @autobind
  handleDataSetSelect({ dataSet, records }, checked) {
    if (!this.inCheckExpansion) {
      const { checkField, idField } = dataSet.props;
      if (checkField) {
        const field = dataSet.getField(checkField);
        records.forEach((record) => {
          record.set(
            checkField,
            field ? getFirstValue(checked ? field.get(BooleanValue.trueValue, record) : field.get(BooleanValue.falseValue, record)) : checked,
          );
        });
      } else {
        runInAction(() => {
          this.stateCheckedKeys = dataSet.selected.map(selected => String(idField ? selected.get(idField) : selected.id));
        });
      }
    }
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
      promises.push(dataSet.queryMoreChild(record, dataSet.currentPage));
    }
    if (loadData) {
      promises.push(loadData(event));
    }
    return Promise.all(promises).then(action(() => {
      this.stateLoadedKeys.push(event.key);

      if (promises.length) {
        this.handleAfterLoadData(event);
      }
    }));
  }

  @autobind
  handleAfterLoadData(event): void {
    const { dataSet, selectable } = this.props;
    if (dataSet && selectable === false) {
      const { checkField, idField, treeCheckStrictly } = dataSet.props;
      const loadRootRecord = dataSet.find(record => getKey(record, idField) === String(event.key));
      if (!loadRootRecord) {
        return;
      }
      const loadRecords: Record[] = defaultTo(loadRootRecord.children, []);

      if (checkField) {
        const field = dataSet.getField(checkField);
        loadRecords.forEach(record => {
          if (equalTrueValue((field ? field.get(BooleanValue.trueValue, record) : true), record.get(checkField))) {
            dataSet.select(record);
          }
        });
        if (!treeCheckStrictly) {
          if (!loadRootRecord.isSelected && loadRecords.every(record => record.isSelected)) {
            dataSet.select(loadRootRecord);
          } else if (loadRootRecord.isSelected && loadRecords.some(record => !record.isSelected)) {
            dataSet.unSelect(loadRootRecord);
          }
        }
      } else if (!treeCheckStrictly && event.checked) {
        loadRecords.forEach(record => {
          dataSet.select(record);
        });
      }
    }
  }

  render() {
    const { dataSet, renderer = defaultRenderer, titleField, treeNodeRenderer, onTreeNode, loadData, async, selectable, filter: optionsFilter, ...otherProps } = this.props;
    if (dataSet) {
      const props: TreeProps = {};
      props.treeData = getTreeNodes(
        dataSet,
        dataSet.treeData,
        renderer,
        onTreeNode || treeNodeRenderer || defaultNodeCover,
        async || !!loadData,
        titleField,
        optionsFilter,
      ) || [];
      props.onExpand = this.handleExpand;
      props.onCheck = this.handleCheck;
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
      props.checkStrictly = this.checkStrictly;
      return (
        <Spin dataSet={dataSet}>
          <C7NTree {...otherProps} {...props} />
        </Spin>
      );
    }
    return <C7NTree selectable={selectable} {...otherProps} />;
  }
}
