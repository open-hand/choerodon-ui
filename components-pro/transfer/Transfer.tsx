import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { action, observable, runInAction } from 'mobx';
import classNames from 'classnames';
import { Select, SelectProps } from '../select/Select';
import Option from '../option/Option';
import OptGroup from '../option/OptGroup';
import TransferList from './TransferList';
import TransferOperation from './TransferOperation';
import TransferSort from './TransferSort';
import autobind from '../_util/autobind';
import Record from '../data-set/Record';
import isSameLike from '../_util/isSameLike';
import Icon from '../icon';

export interface TransferProps extends SelectProps {
  titles?: [ReactNode, ReactNode];
  footer?: (props: any) => ReactNode;
  operations?: string[] | ReactNode[];
  sortable?: boolean;
  sortOperations?: string[] | ReactNode[];
  oneWay?: boolean;
}

@observer
export default class Transfer extends Select<TransferProps> {
  static displayName = 'Transfer';

  static propTypes = {
    ...Select.propTypes,
    titles: PropTypes.arrayOf(PropTypes.node),
    sortable: PropTypes.bool,
  };

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

  constructor(props, context) {
    super(props, context);
    runInAction(() => {
      this.sourceSelected = [];
      this.targetSelected = [];
      this.clearCurrentIndex();
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
    this.options.locate(value.index);
  }

  @autobind
  @action
  handleMoveToLeft() {
    const { valueField } = this;
    this.removeValues(this.targetSelected.map(record => record.get(valueField)));
    this.targetSelected = [];
    this.updateIndex()
  }

  @autobind
  @action
  handleMoveToRight() {
    const { valueField } = this;
    this.prepareSetValue(...this.sourceSelected.map(record => record.get(valueField)));
    this.sourceSelected = [];
    this.updateIndex()
  }

  @autobind
  @action
  handleSortTo(direction: string) {
    const { valueField } = this;
    const to = direction === 'up' ? -1 : 1

    const targetFilteredOptions = this.options.getState('targetFilteredOptions');
    const index = targetFilteredOptions.findIndex(record => record.get(valueField) === this.options.current?.get(valueField))
    const currentOpt = targetFilteredOptions[index]
    const moveOpt = targetFilteredOptions[index + to]

    const optionsCurrentIndex = this.options.findIndex(record => record.get(valueField) === currentOpt.get(valueField))
    const optionsMoveIndex = this.options.findIndex(record => record.get(valueField) === moveOpt.get(valueField))

    this.options.move(optionsCurrentIndex, optionsMoveIndex);
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

  handleDelete = (value) => {
    this.removeValues([value]);
    this.updateIndex();
  }

  @action
  updateIndex() {
    this.changeOptionIndex();
    this.clearCurrentIndex();
  }

  renderer = ({ text, value }) => {
    return (
      <div className={`${this.prefixCls}-item-delete`}>
        <div>{text}</div>
        <Icon type="delete_black-o" className={`${this.prefixCls}-item-icon`} onClick={() => this.handleDelete(value)} />
      </div>
    )
  };

  optionRenderer = ({ text, value }) => this.renderer({ text, value });

  renderWrapper() {
    const {
      disabled,
      prefixCls,
      targetSelected,
      sourceSelected,
      multiple,
      valueField,
      props: { titles = [], operations = [], sortOperations = [], sortable, oneWay },
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
        optionRenderer: this.optionRenderer,
        renderer: this.render,
      }
    }

    return (
      <span key="wrapper" className={classNameString}>
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
          oneWay={oneWay}
        />
        <TransferList
          {...this.props}
          options={this.options}
          selected={targetSelected}
          header={titles[1]}
          currentIndex={currentIndex}
          onSelectAll={this.handleTargetSelectAllChange}
          onSelect={this.handleTargetMenuClick}
          optionsFilter={this.targetFilter}
          {...oneWayProps}
        />
        {sortable && (
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
