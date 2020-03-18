import Set from 'core-js/library/fn/set';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { computed, action, observable, runInAction } from 'mobx';
import noop from 'lodash/noop';
import C7NTree, {
  TreeNode,
  TreeNodeEvent,
  TreeNodeExpandEvent,
  TreeProps as C7NTreeProps,
} from 'choerodon-ui/lib/tree';
import autobind from 'choerodon-ui/pro/lib/_util/autobind';
import DataSet from '../data-set/DataSet';
import { getKey, getTreeNodes, NodeRenderer } from './util';
import { BooleanValue, DataSetSelection } from '../data-set/enum';
import Spin from '../spin';

export interface TreeProps extends C7NTreeProps {
  dataSet?: DataSet;
  renderer?: NodeRenderer;
  titleField?: string;
}

function defaultRenderer({ text }) {
  return text;
}

@observer
export default class Tree extends Component<TreeProps> {
  static displayName = 'Tree<PRO>';

  static propTypes = {
    prefixCls: PropTypes.string,
    className: PropTypes.string,
    tabIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    children: PropTypes.any,
    treeData: PropTypes.array, // Generate treeNode by children
    showLine: PropTypes.bool,
    showIcon: PropTypes.bool,
    icon: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    focusable: PropTypes.bool,
    selectable: PropTypes.bool,
    disabled: PropTypes.bool,
    multiple: PropTypes.bool,
    checkable: PropTypes.oneOfType([PropTypes.bool, PropTypes.node]),
    checkStrictly: PropTypes.bool,
    draggable: PropTypes.bool,
    defaultExpandParent: PropTypes.bool,
    autoExpandParent: PropTypes.bool,
    defaultExpandAll: PropTypes.bool,
    defaultExpandedKeys: PropTypes.arrayOf(PropTypes.string),
    expandedKeys: PropTypes.arrayOf(PropTypes.string),
    defaultCheckedKeys: PropTypes.arrayOf(PropTypes.string),
    checkedKeys: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
      PropTypes.object,
    ]),
    defaultSelectedKeys: PropTypes.arrayOf(PropTypes.string),
    selectedKeys: PropTypes.arrayOf(PropTypes.string),
    onClick: PropTypes.func,
    onDoubleClick: PropTypes.func,
    onExpand: PropTypes.func,
    onCheck: PropTypes.func,
    onSelect: PropTypes.func,
    onLoad: PropTypes.func,
    loadData: PropTypes.func,
    loadedKeys: PropTypes.arrayOf(PropTypes.string),
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
    openTransitionName: PropTypes.string,
    openAnimation: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
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
    const {defaultExpandAll,defaultExpandedKeys,defaultCheckedKeys} = this.props;
    if(defaultExpandAll !== nextProps.defaultExpandAll ||
      defaultExpandedKeys !== nextProps.defaultExpandedKeys ||
      defaultCheckedKeys !== nextProps.defaultCheckKeys){
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
    this.stateExpandedKeys = this.dealDefalutCheckExpand(dataSet,defaultExpandedKeys,defaultExpandAll)
  }

  @action
  initDefaultCheckRows(){
    const {
      props: {
        dataSet,
        defaultCheckedKeys,
      },
    } = this;
    this.stateCheckedKeys = this.dealDefalutCheckExpand(dataSet,defaultCheckedKeys)
  }

  /**
   * 处理tree的props expand check的默认事件
   * @param dataSet
   * @param defalutAll
   * @param defalutKeys
   */
  dealDefalutCheckExpand(dataSet:DataSet|undefined,defalutKeys:string[]|undefined,defalutAll?:boolean){
    let defalutStateKeys: string[] = []
    if(dataSet){
      const {idField, expandField} = dataSet.props;
      if ( defalutAll && !expandField) {
        defalutStateKeys = dataSet.reduce<(string)[]>((array, record) => {
          if (record.children) {
            array.push(getKey(record, idField));
          }
          return array;
        }, []);
      }else if(defalutKeys && !expandField){
        defalutStateKeys = dataSet.reduce<(string)[]>((array, record) => {
          defalutKeys.map((key) => {
            if(getKey(record,idField) === key){
              array.push(key)
            }
            return null
          })
          return array;
        },[]);
      }
    }
    return defalutStateKeys
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

  setExpand(eventObj: TreeNodeExpandEvent) {
    const { dataSet } = this.props;
    if (dataSet) {
      const { expandField, idField } = dataSet.props;
      if (expandField) {
        const { node, expanded } = eventObj;
        const { eventKey } = node.props;
        const found = dataSet.find(record => eventKey === getKey(record, idField));
        if (found) {
          found.isExpanded = expanded;
          return false;
        }
      }
    }
    return true;
  }


  setCheck(eventObj: TreeNodeEvent) {
    const { dataSet } = this.props;
    if (dataSet) {
      const { checkField, idField } = dataSet.props;
      if (checkField) {
        const { node, checked } = eventObj;
        const { eventKey } = node.props;
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

  handleExpand = (expandedKeys: string[], eventObj: TreeNodeExpandEvent) => {
    if (this.setExpand(eventObj)) {
      runInAction(() => {
        this.stateExpandedKeys = expandedKeys;
      });
    }
    const { onExpand = noop } = this.props;
    onExpand(expandedKeys, eventObj);
  };

  handleCheck = (checkedKeys: string[], eventObj: TreeNodeEvent) => {
    if (this.setCheck(eventObj)) {
      runInAction(() => {
        this.stateCheckedKeys = checkedKeys;
      });
    }
    const { onCheck = noop } = this.props;
    onCheck(checkedKeys, eventObj);
  };

  handleSelect = (_selectedKeys: string[], eventObj: TreeNodeEvent) => {
    const { dataSet } = this.props;
    if (dataSet) {
      const { idField } = dataSet.props;
      const { node, selected } = eventObj;
      const { eventKey } = node.props;
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
    }
  };

  render() {
    const { dataSet, renderer = defaultRenderer, titleField, ...otherProps } = this.props;
    if (dataSet) {
      const props: TreeProps = {};
      props.children = getTreeNodes(
        dataSet,
        dataSet.treeData,
        this.forceRenderKeys,
        renderer,
        titleField,
      );
      props.onExpand = this.handleExpand;
      props.onCheck = this.handleCheck;
      props.onSelect = this.handleSelect;
      props.expandedKeys = this.expandedKeys.slice();
      props.checkedKeys = this.checkedKeys.slice();
      props.multiple = dataSet.props.selection === DataSetSelection.multiple;
      props.selectedKeys = this.selectedKeys.slice();
      return (
        <Spin dataSet={dataSet}>
          <C7NTree {...otherProps} {...props} />
        </Spin>
      );
    }
    return <C7NTree {...otherProps} />;
  }
}
