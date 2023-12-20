import React, { Component, ReactNode } from 'react';
import defaultTo from 'lodash/defaultTo';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import isNil from 'lodash/isNil';
import sortBy from 'lodash/sortBy';
import { action, toJS } from 'mobx';
import { observer } from 'mobx-react';
import { LovConfig } from 'choerodon-ui/dataset/interface';
import Tag from 'choerodon-ui/lib/tag';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import Animate from '../animate';
import Icon from '../icon';
import { $l } from '../locale-context';
import autobind from '../_util/autobind';
import { FormContextValue } from '../form/FormContext';
import { SelectionProps } from './Lov';
import { SelectionsPosition } from './enum';
import { SelectionMode } from '../table/enum';

export {
  SelectionsPosition,
}

export interface SelectionListProps {
  dataSet: DataSet;
  treeFlag?: LovConfig['treeFlag'];
  valueField: string;
  textField: string;
  selectionsPosition?: SelectionsPosition;
  selectionProps?: SelectionProps;
  context: FormContextValue;
  selectionMode?: SelectionMode;
}

@observer
export default class SelectionList extends Component<SelectionListProps> {
  get prefixCls() {
    const { context: { getProPrefixCls } } = this.props;
    return getProPrefixCls('modal');
  }

  selectionNode: HTMLElement;

  modalNode: HTMLElement | null;

  @autobind
  contentRef(node) {
    this.selectionNode = node;
  }

  getRecords(records: Record[]) {
    const { textField } = this.props;
    return sortBy(
      records,
      (item: Record) => defaultTo(item.selectedTimestamp, -1), 
      (item: Record) => item.get(textField),
    );
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
    const { dataSet, treeFlag, valueField = '', textField = '', selectionProps = {}, selectionMode } = this.props;
    const { nodeRenderer, placeholder } = selectionProps;
    const records: Record[] = (treeFlag === 'Y' && selectionMode === SelectionMode.treebox ? dataSet.treeSelected : dataSet.selected).filter(record => !isNil(record.get(valueField)));
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
    const { dataSet, treeFlag, valueField = '', textField = '', selectionProps = {}, selectionMode } = this.props;
    const { nodeRenderer } = selectionProps;
    const records: Record[] = (treeFlag === 'Y' && selectionMode === SelectionMode.treebox ? dataSet.treeSelected : dataSet.selected).filter(record => !isNil(record.get(valueField)));
    if (isEmpty(records)) {
      return null;
    }

    const classString = `${this.prefixCls}-selection-list-below`;
    const animateChildren = this.getRecords(records).map((record: Record) => {
      return (
        <li key={record.get(valueField)} className={`${classString}-item`}>
          <Tag closable={record.selectable} onClose={() => {
            this.unSelect(record);
          }}>
            {nodeRenderer ? toJS(nodeRenderer(record)) : <span>{record.get(textField)}</span>}
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
          width: pxToRem(width + 300, true),
        });
      }
    } else if (this.modalNode && !this.selectionNode) {
      Object.assign((this.modalNode as HTMLDivElement).style, {
        width: pxToRem(this.modalNode.offsetWidth - 300, true),
      });
      this.modalNode = null;
    }
  }

  componentDidMount() {
    this.updateModalStyle();
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
