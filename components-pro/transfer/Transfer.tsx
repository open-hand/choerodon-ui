import React, { ReactNode } from 'react';
import { observer } from 'mobx-react';
import { action, observable, runInAction } from 'mobx';
import classNames from 'classnames';
import omit from 'lodash/omit';
import isString from 'lodash/isString';
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
  operations?: string[] | ReactNode[];
  sortable?: boolean;
  sortOperations?: string[] | ReactNode[];
  placeholderOperations?: string[] | string;
  oneWay?: boolean;
}

@observer
export default class Transfer extends Select<TransferProps> {
  static displayName = 'Transfer';

  static defaultProps = {
    ...Select.defaultProps,
    suffixCls: 'transfer',
    multiple: true,
    sortable: false,
    oneWay: false,
  };

  static Option = Option;

  static OptGroup = OptGroup;

  @observable sourceSelected: Record[];

  @observable targetSelected: Record[];

  @observable targetCurrentSelected: string | undefined;

  isCustom = false;

  constructor(props, context) {
    super(props, context);
    runInAction(() => {
      this.sourceSelected = [];
      this.targetSelected = [];
      this.clearCurrentIndex();
    });
    this.isCustom = typeof props.children === 'function';
  }

  get range(): boolean | [string, string] {
    return false;
  }

  get showInputPrompt(): ReactNode | undefined {
    return undefined;
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
    this.options.locate(value.index);
  }

  @autobind
  @action
  handleMoveToLeft() {
    const { valueField, isCustom } = this;
    if (!isCustom) {
      this.removeValues(this.targetSelected.map(record => record.get(valueField)));
    } else {
      let currentValues = this.getValues();
      const targetKeys = this.targetSelected.map(record => record.key);
      for (const key of targetKeys) {
        currentValues = currentValues.filter(record => record.key !== key);
      }
      this.setValue(currentValues);
    }
   
    this.targetSelected = [];
    this.updateIndex();
  }

  @autobind
  @action
  handleMoveToRight() {
    const { valueField } = this;

    if (this.isCustom) {
      const currentValues = this.getValues();
      this.setValue([...currentValues, ...this.sourceSelected], true);
    } else {
      this.prepareSetValue(...this.sourceSelected.map(record => record.get(valueField)));  
    }
    
    this.sourceSelected = [];
    this.updateIndex();
  }

  @autobind
  @action
  handleSortTo(direction: string) {
    const { valueField, options } = this;
    const { current } = options;
    if (current) {
      const targetFilteredOptions = options.getState('targetFilteredOptions');
      if (targetFilteredOptions) {
        const to = direction === 'up' ? -1 : 1;
        const currentValue = current.get(valueField);
        const index = targetFilteredOptions.findIndex(record => record.get(valueField) === currentValue);
        const currentOpt = targetFilteredOptions[index];
        const moveOpt = targetFilteredOptions[index + to];
        if (currentOpt && moveOpt) {
          const currentOptValue = currentOpt.get(valueField);
          const moveOptValue = moveOpt.get(valueField);
          const optionsCurrentIndex = options.findIndex(record => record.get(valueField) === currentOptValue);
          const optionsMoveIndex = options.findIndex(record => record.get(valueField) === moveOptValue);
          if (optionsCurrentIndex !== -1 && optionsMoveIndex !== -1) {
            options.move(optionsCurrentIndex, optionsMoveIndex);
          }
        }
      }
    }
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

  @action
  clearCurrentIndex = () => {
    const current = this.options.current;
    if (current) {
      current.isCurrent = false;
    }
  };

  changeOptionIndex = () => {
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

  handleRemove = (value) => {
    this.removeValues([value]);
    this.updateIndex();
  };

  @action
  updateIndex() {
    this.changeOptionIndex();
    this.clearCurrentIndex();
  }

  handleSetTargetOption = (values: any[]) => {
    this.setValue(values);
  }

  renderWrapper() {
    const {
      disabled,
      prefixCls,
      targetSelected,
      sourceSelected,
      multiple,
      valueField,
      props: { titles = [], operations = [], sortOperations = [], sortable, oneWay, placeholderOperations = [] },
    } = this;

    const targetValues = this.getValues();
    const currentTarget = this.options.current;

    let upActive = false;
    let downActive = false;
    let currentIndex = currentTarget ? targetValues.findIndex(x => x === currentTarget.get(valueField)) : -1;

    const targetFilteredOptions = this.options.getState('targetFilteredOptions');
    if (targetFilteredOptions && currentTarget) {
      currentIndex = targetFilteredOptions.findIndex(record => record.get(valueField) === currentTarget.get(valueField));
      upActive = currentIndex > -1 && currentIndex !== 0;
      downActive = currentIndex > -1 && currentIndex !== targetFilteredOptions.length - 1;
    }
    const classNameString = classNames(`${prefixCls}-wrapper`, {
      [`${prefixCls}-sortable`]: sortable,
    });
    let oneWayProps = {};
    if (oneWay) {
      oneWayProps = {
        multiple: false,
        onRemove: this.handleRemove,
      };
    }
    let customOption = {};
    if (this.isCustom) {
      customOption = {
        targetOption: targetValues,
      };
    }

    const childProps = omit<TransferProps, keyof TransferProps>(this.props, [
      'help',
    ]);

    return (
      <span key="wrapper" className={classNameString}>
        <TransferList
          {...childProps}
          options={this.options}
          selected={sourceSelected}
          header={titles[0]}
          onSelectAll={this.handleSourceSelectAllChange}
          onSelect={this.handleMenuClick}
          optionsFilter={this.sourceFilter}
          direction="left"
          placeholder={isString(placeholderOperations) ? placeholderOperations : placeholderOperations[0]}
          {...customOption}
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
          oneWay={oneWay}
        />
        <TransferList
          {...childProps}
          options={this.options}
          selected={targetSelected}
          header={titles[1]}
          currentIndex={currentIndex}
          onSelectAll={this.handleTargetSelectAllChange}
          onSelect={this.handleTargetMenuClick}
          optionsFilter={this.targetFilter}
          direction="right"
          placeholder={isString(placeholderOperations) ? placeholderOperations : placeholderOperations[1]}
          setTargetOption={this.handleSetTargetOption}
          {...customOption}
          {...oneWayProps}
        />
        {sortable && !this.isCustom && (
          <TransferSort
            className={`${prefixCls}-sort`}
            upActive={upActive}
            downActive={downActive}
            upArrowText={sortOperations[0]}
            downArrowText={sortOperations[1]}
            moveToUp={() => this.handleSortTo('up')}
            moveToDown={() => this.handleSortTo('down')}
            multiple={multiple}
          />
        )}
      </span>
    );
  }
}
