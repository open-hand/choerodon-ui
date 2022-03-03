import React, { Component, ReactNode } from 'react';
import defaultTo from 'lodash/defaultTo';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import sortBy from 'lodash/sortBy';
import { action, toJS } from 'mobx';
import { observer } from 'mobx-react';
import { getProPrefixCls } from 'choerodon-ui/lib/configure/utils';
import { LovConfig } from 'choerodon-ui/dataset/interface';
import Tag from 'choerodon-ui/lib/tag';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import Animate from '../animate';
import Icon from '../icon';
import { $l } from '../locale-context';
import autobind from '../_util/autobind';
import { SelectionProps } from './Lov';

export enum SelectionsPosition {
  side = 'side',
  below = 'below',
}

export interface SelectionListProps {
  dataSet: DataSet;
  treeFlag?: LovConfig['treeFlag'];
  valueField: string;
  textField: string;
  selectionsPosition?: SelectionsPosition;
  selectionProps?: SelectionProps;
}

@observer
export default class SelectionList extends Component<SelectionListProps> {
  prefixCls = getProPrefixCls('modal');

  selectionNode: HTMLElement;

  modalNode: HTMLElement | null;

  @autobind
  contentRef(node) {
    this.selectionNode = node;
  }

  getRecords(records: Record[]) {
    return sortBy(records, (item: Record) => defaultTo(item.selectedTimestamp, -1));
  }

  @action
  unSelect = (record: Record) => {
    const { dataSet, treeFlag } = this.props;
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
    const { dataSet, treeFlag, valueField = '', textField = '', selectionProps = {} } = this.props;
    const { nodeRenderer, placeholder } = selectionProps;
    const records: Record[] = treeFlag === 'Y' ? dataSet.treeSelected : dataSet.selected;
    const isEmptyList = isEmpty(records);
    if (isEmptyList && !placeholder) {
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
      <div className={`${classString}-container`} ref={this.contentRef}>
        <p className={`${classString}-intro`}>
          {isEmptyList ? placeholder : $l('Lov', 'selection_tips', {
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
          <Tag closable onClose={() => {
            this.unSelect(record);
          }}>
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
  };

  updateModalStyle() {
    if (!this.modalNode && this.selectionNode) {
      const { offsetParent } = this.selectionNode;
      if (this.selectionNode && offsetParent && offsetParent.parentNode) {
        const { parentNode } = offsetParent;
        this.modalNode = (parentNode as HTMLDivElement);
        const { width } = (parentNode as HTMLDivElement).getBoundingClientRect();
        Object.assign((parentNode as HTMLDivElement).style, {
          width: pxToRem(width + 300),
        });
      }
    } else if (this.modalNode && !this.selectionNode) {
      Object.assign((this.modalNode as HTMLDivElement).style, {
        width: pxToRem(this.modalNode.offsetWidth - 300),
      });
      this.modalNode = null;
    }
  }

  componentDidUpdate() {
    this.updateModalStyle();
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
