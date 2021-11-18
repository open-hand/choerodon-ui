import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { action, observable, runInAction } from 'mobx';
import { Select, SelectProps } from '../select/Select';
import Option from '../option/Option';
import OptGroup from '../option/OptGroup';
import TransferList from './TransferList';
import TransferOperation from './TransferOperation';
import TransferSort from './TransferSort';
import autobind from '../_util/autobind';
import Record from '../data-set/Record';
import isSameLike from '../_util/isSameLike';

export interface TransferProps extends SelectProps {
  titles?: [ReactNode, ReactNode];
  footer?: (props: any) => ReactNode;
  operations: string[] | ReactNode[];
  showSort?: boolean;
  sorts?: string[] | ReactNode[];
}

@observer
export default class Transfer extends Select<TransferProps> {
  static displayName = 'Transfer';

  static propTypes = {
    ...Select.propTypes,
    titles: PropTypes.arrayOf(PropTypes.node),
    showSort: PropTypes.bool,
  };

  static defaultProps = {
    ...Select.defaultProps,
    suffixCls: 'transfer',
    multiple: true,
    showSort: false,
  };

  static Option = Option;

  static OptGroup = OptGroup;

  @observable sourceSelected: Record[];

  @observable targetSelected: Record[];

  @observable targetCurrentSelected: string | undefined;

  constructor(props, context) {
    super(props, context);
    runInAction(() => {
      this.sourceSelected = [];
      this.targetSelected = [];
      this.targetCurrentSelected = '';
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
    this.setTargetCurrentSelect(value.get(this.valueField));
  }

  @autobind
  @action
  handleMoveToLeft() {
    const { valueField } = this;
    this.removeValues(this.targetSelected.map(record => record.get(valueField)));
    this.changeOptionIndex();
    this.targetSelected = [];
    this.setTargetCurrentSelect();
  }

  @autobind
  @action
  handleMoveToRight() {
    const { valueField } = this;
    this.prepareSetValue(...this.sourceSelected.map(record => record.get(valueField)));
    this.changeOptionIndex();
    this.sourceSelected = [];
    this.setTargetCurrentSelect();
  }

  @autobind
  @action
  handleSortTo(direction: string) {
    const { options, valueField, targetCurrentSelected } = this;
    const optionsData = options.data;
    const targetValues = this.getValues();

    const findComboxIndex = optionsData.findIndex(
      record => record.get(valueField) === targetCurrentSelected,
    );
    optionsData[findComboxIndex] = optionsData.splice(
      findComboxIndex + (direction === 'up' ? -1 : 1),
      1,
      optionsData[findComboxIndex],
    )[0];

    const index = targetValues.indexOf(targetCurrentSelected);
    targetValues[index] = targetValues.splice(
      index + (direction === 'up' ? -1 : 1),
      1,
      targetValues[index],
    )[0];

    this.options.data = optionsData;
    this.setValue(targetValues);
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

  setTargetCurrentSelect = (val?: string) => {
    runInAction(() => {
      this.targetCurrentSelected = val;
    });
  };

  changeOptionIndex = () => {
    // options.data 的顺序跟着变化
    const { valueField, options } = this;
    const targetValues = this.getValues(); // 这是有顺序的
    let optionData = options.data;
    const sortOpt: Record[] = [];
    targetValues.forEach(key => {
      optionData = optionData.filter(record => {
        if (record.get(valueField) !== key) {
          return true;
        }
        sortOpt.push(record);
        return false;
      });
    });

    optionData.unshift(...sortOpt);
    this.options.data = optionData;
  };

  renderWrapper() {
    const {
      disabled,
      prefixCls,
      targetSelected,
      sourceSelected,
      multiple,
      targetCurrentSelected,
      props: { titles = [], operations = [], sorts = [], showSort },
    } = this;

    const targetValues = this.getValues();

    const selectedIndex = targetValues.indexOf(targetCurrentSelected);
    const upActive = !!targetCurrentSelected && selectedIndex !== 0;
    const downActive = !!targetCurrentSelected && selectedIndex !== targetValues.length - 1;
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
          rightArrowText={operations[0]}
          leftArrowText={operations[1]}
          moveToLeft={this.handleMoveToLeft}
          moveToRight={this.handleMoveToRight}
          multiple={multiple}
        />
        <TransferList
          {...this.props}
          options={this.options}
          selected={targetSelected}
          header={titles[1]}
          currentSelectedIndex={selectedIndex}
          onSelectAll={this.handleTargetSelectAllChange}
          onSelect={this.handleTargetMenuClick}
          optionsFilter={this.targetFilter}
        />
        {!!showSort && (
          <TransferSort
            className={`${prefixCls}-sort`}
            upActive={upActive}
            downActive={downActive}
            upArrowText={sorts[0]}
            downArrowText={sorts[1]}
            moveToUp={() => this.handleSortTo('up')}
            moveToDown={() => this.handleSortTo('down')}
            multiple={multiple}
          />
        )}
      </span>
    );
  }
}
