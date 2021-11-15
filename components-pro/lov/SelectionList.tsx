import React, { Component } from 'react';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import sortBy from 'lodash/sortBy'
import { action, toJS } from 'mobx';
import { observer } from 'mobx-react';
import { getProPrefixCls } from 'choerodon-ui/lib/configure/utils';
import { LovConfig } from 'choerodon-ui/dataset/interface';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import Animate from '../animate';
import Icon from '../icon';
import { $l } from '../locale-context';
import { NodeRenderer } from './Lov';

export const TIMESTAMP = '__TIMESTAMP__';

export interface SelectionListProps {
  dataSet: DataSet;
  treeFlag?: LovConfig['treeFlag'];
  valueField: string;
  textField: string;
  label?: string;
  nodeRenderer?: NodeRenderer,
}

@observer
export default class SelectionList extends Component<SelectionListProps> {
  prefixCls = getProPrefixCls('modal');

  getRecords(records: Record[]) {
    return sortBy(records, function(item) {
      return item.getState(TIMESTAMP);
    });
  }

  @action
  handleRemove(record: Record) {
    this.unSelect(record);

    if (record.parent && !isUndefined(record.parent)) {
      this.unSelect(record.parent);
    }

    record.children?.forEach(item => {
      this.handleRemove(item);
    });
  }

  unSelect = (record: Record) => {
    const { dataSet, treeFlag } = this.props;
    record.setState(TIMESTAMP, 0);
    if (treeFlag === 'Y') {
      dataSet.treeUnSelect(record);
    } else {
      dataSet.unSelect(record);
    }
  };

  render() {
    const { dataSet, treeFlag, label = '', valueField = '', textField = '', nodeRenderer } = this.props;
    const records: Record[] = treeFlag === 'Y' ? dataSet.treeSelected : dataSet.selected;
    if (isEmpty(records)) {
      return null;
    }

    const classString = `${this.prefixCls}-selection-list`;
    const animateChildren = this.getRecords(records).map((record: Record) => {
      return (
        <li key={record.get(valueField)} className={`${classString}-item`}>
          { nodeRenderer ? toJS(nodeRenderer(record)) : <span>{record.get(textField)}</span> }
          <Icon
            type="cancel"
            onClick={() => {
              this.handleRemove(record);
            }}
          />
        </li>
      );
    });
    return (
      <div className={`${classString}-container`}>
        <p className={`${classString}-intro`}>
          {$l('Lov', 'selected')}
          <span>{records.length}</span>
          {label}
        </p>
        <Animate
          className={`${classString}-list`}
          transitionAppear
          transitionName="slide-right"
          component="ul"
        >
          {animateChildren}
        </Animate>
      </div>
    );
  }
}
