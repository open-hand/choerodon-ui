import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { action, observable, runInAction } from 'mobx';
import { Select, SelectProps } from '../select/Select';
import Option from '../option/Option';
import OptGroup from '../option/OptGroup';
import TransferList from './TransferList';
import TransferOperation from './TransferOperation';
import autobind from '../_util/autobind';
import Record from '../data-set/Record';
import isSameLike from '../_util/isSameLike';

export interface TransferProps extends SelectProps {
  titles?: [ReactNode, ReactNode];
  footer?: (props: any) => ReactNode;
}

@observer
export default class Transfer extends Select<TransferProps> {
  static displayName = 'Transfer';

  static propTypes = {
    ...Select.propTypes,
    titles: PropTypes.arrayOf(PropTypes.node),
  };

  static defaultProps = {
    ...Select.defaultProps,
    suffixCls: 'transfer',
    multiple: true,
  };

  static Option = Option;

  static OptGroup = OptGroup;

  @observable sourceSelected: Record[];

  @observable targetSelected: Record[];

  constructor(props, context) {
    super(props, context);
    runInAction(() => {
      this.sourceSelected = [];
      this.targetSelected = [];
    });
  }

  @autobind
  sourceFilter(record, index, array) {
    const {
      valueField,
      props: { optionsFilter },
    } = this;
    if (optionsFilter && !optionsFilter(record, index, array)) {
      return false;
    }
    const values = this.getValues();
    if (values.length) {
      return values.every(v => !isSameLike(record.get(valueField), v));
    }
    return true;
  }

  @autobind
  targetFilter(record, index, array) {
    const {
      valueField,
      props: { optionsFilter },
    } = this;
    if (optionsFilter && !optionsFilter(record, index, array)) {
      return false;
    }
    const values = this.getValues();
    if (values.length) {
      return values.some(v => isSameLike(record.get(valueField), v));
    }
    return false;
  }

  @autobind
  handleMenuClick({
    item: {
      props: { value },
    },
  }) {
    if (this.multiple) {
      this.selectRecord(value, this.sourceSelected);
    } else {
      this.prepareSetValue(this.processRecordToObject(value));
    }
  }

  @autobind
  handleTargetMenuClick({
    item: {
      props: { value },
    },
  }) {
    if (this.multiple) {
      this.selectRecord(value, this.targetSelected);
    } else {
      this.removeValue(value);
    }
  }

  @autobind
  @action
  handleMoveToLeft() {
    const { valueField } = this;
    this.removeValues(this.targetSelected.map(record => record.get(valueField)));
    this.targetSelected = [];
  }

  @autobind
  @action
  handleMoveToRight() {
    const { valueField } = this;
    this.prepareSetValue(...this.sourceSelected.map(record => record.get(valueField)));
    this.sourceSelected = [];
  }

  @autobind
  @action
  handleSourceSelectAllChange(selected: Record[]) {
    this.sourceSelected = selected;
  }

  @autobind
  @action
  handleTargetSelectAllChange(selected: Record[]) {
    this.targetSelected = selected;
  }

  @action
  selectRecord(value: Record, selected: Record[]) {
    const index = selected.indexOf(value);
    if (index !== -1) {
      selected.splice(index, 1);
    } else {
      selected.push(value);
    }
  }

  renderWrapper() {
    const {
      disabled,
      prefixCls,
      targetSelected,
      sourceSelected,
      multiple,
      props: { titles = [] },
    } = this;
    return (
      <span key="wrapper" className={`${prefixCls}-wrapper`}>
        <TransferList
          {...this.props}
          options={this.options}
          selected={sourceSelected}
          header={titles[0]}
          onSelectAll={this.handleSourceSelectAllChange}
          onSelect={this.handleMenuClick}
          optionsFilter={this.sourceFilter}
        />
        <TransferOperation
          className={`${prefixCls}-operation`}
          leftActive={!(!targetSelected.length || disabled)}
          rightActive={!(!sourceSelected.length || disabled)}
          moveToLeft={this.handleMoveToLeft}
          moveToRight={this.handleMoveToRight}
          multiple={multiple}
        />
        <TransferList
          {...this.props}
          options={this.options}
          selected={targetSelected}
          header={titles[1]}
          onSelectAll={this.handleTargetSelectAllChange}
          onSelect={this.handleTargetMenuClick}
          optionsFilter={this.targetFilter}
        />
      </span>
    );
  }
}
