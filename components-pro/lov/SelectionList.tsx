import React, { Component, ReactNode } from 'react';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import sortBy from 'lodash/sortBy';
import { action, toJS } from 'mobx';
import { observer } from 'mobx-react';
import { getProPrefixCls } from 'choerodon-ui/lib/configure/utils';
import { LovConfig } from 'choerodon-ui/dataset/interface';
import Tag from 'choerodon-ui/lib/tag';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import Animate from '../animate';
import Icon from '../icon';
import { $l } from '../locale-context';
import { NodeRenderer } from './Lov';

export const TIMESTAMP = '__TIMESTAMP__';

export enum SelectionsPosition {
  side = 'side',
  below = 'below',
}

export interface SelectionListProps {
  dataSet: DataSet;
  treeFlag?: LovConfig['treeFlag'];
  valueField: string;
  textField: string;
  nodeRenderer?: NodeRenderer;
  selectionsPosition?: SelectionsPosition;
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
  unSelect = (record: Record) => {
    const { dataSet, treeFlag } = this.props;
    record.setState(TIMESTAMP, 0);
    if (treeFlag === 'Y') {
      dataSet.treeUnSelect(record);
    } else {
      dataSet.unSelect(record);
    }

    if (!isUndefined(record.parent)) {
      dataSet.unSelect(record.parent);
    }
  };

  renderSide() {
    const { dataSet, treeFlag, valueField = '', textField = '', nodeRenderer } = this.props;
    const records: Record[] = treeFlag === 'Y' ? dataSet.treeSelected : dataSet.selected;
    if (isEmpty(records)) {
      return null;
    }

    const classString = `${this.prefixCls}-selection-list`;
    const animateChildren = this.getRecords(records).map((record: Record) => {
      return (
        <li key={record.get(valueField)} className={`${classString}-item`}>
          {nodeRenderer ? toJS(nodeRenderer(record)) : <span>{record.get(textField)}</span>}
          <Icon
            type="cancel"
            onClick={() => {
              this.unSelect(record);
            }}
          />
        </li>
      );
    });
    return (
      <div className={`${classString}-container`}>
        <p className={`${classString}-intro`}>
          {$l('Lov', 'selection_tips', {
            count: <b key="count">{records.length}</b>,
          })}
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

  renderBelow = (): ReactNode => {
    const { dataSet, treeFlag, valueField = '', textField = '' } = this.props;
    const records: Record[] = treeFlag === 'Y' ? dataSet.treeSelected : dataSet.selected;
    if (isEmpty(records)) {
      return null;
    }

    const classString = `${this.prefixCls}-selection-list-below`;
    const animateChildren = this.getRecords(records).map((record: Record) => {
      return (
        <li key={record.get(valueField)} className={`${classString}-item`}>
          <Tag closable onClose={() => { this.unSelect(record); }}>
            <span>{record.get(textField)}</span>
          </Tag>
        </li>
      );
    });
    return (
      <div className={classString}>
        <p className={`${classString}-intro`}>
          {$l('Lov', 'selection_tips', {
            count: <b key="count">{records.length}</b>,
          })}
        </p>
        <Animate
          className={`${classString}-list`}
          transitionAppear
          transitionName="fade"
          component="ul"
        >
          {animateChildren}
        </Animate>
      </div>
    );
  }

  render() {
    const { selectionsPosition } = this.props;
    if (selectionsPosition === SelectionsPosition.side) {
      return this.renderSide();
    }
    if (selectionsPosition === SelectionsPosition.below) {
      return this.renderBelow();
    }
    return null;
  }
}
