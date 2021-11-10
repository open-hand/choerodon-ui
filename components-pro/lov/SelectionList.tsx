import React, { Component } from 'react';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import sortBy from 'lodash/sortBy'
import { action } from 'mobx';
import { observer } from 'mobx-react';
import { getProPrefixCls } from 'choerodon-ui/lib/configure/utils';
import { SelectionMode } from '../table/enum';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import Animate from '../animate';
import Icon from '../icon';
import { $l } from '../locale-context';

export const TIMESTAMP = '__TIMESTAMP__';

export interface SelectionListProps {
  dataSet: DataSet;
  selectionMode: SelectionMode | undefined;
  valueField: string;
  textField: string;
  label?: string;
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
    const { dataSet, selectionMode } = this.props;
    record.setState(TIMESTAMP, 0);
    if (selectionMode === SelectionMode.treebox) {
      dataSet.treeUnSelect(record);
    } else {
      dataSet.unSelect(record);
    }
  };

  render() {
    // TODO:观察selectionMode
    const { dataSet, selectionMode, label = '', valueField = '', textField = '' } = this.props;
    const records: Record[] = selectionMode === SelectionMode.treebox ? dataSet.treeSelected : dataSet.selected;
    if (isEmpty(records)) {
      return null;
    }

    const classString = `${this.prefixCls}-selection-list`;
    const animateChildren = this.getRecords(records).map((record: Record) => {
      return (
        <li key={record.get(valueField)} className={`${classString}-item`}>
          <span>{record.get(textField)}</span>
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
