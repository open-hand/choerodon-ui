import React, { cloneElement, Component, ReactElement, ReactNode } from 'react';
import { observer } from 'mobx-react';
import noop from 'lodash/noop';
import isFunction from 'lodash/isFunction';
import { getProPrefixCls } from 'choerodon-ui/lib/configure/utils';
import Icon from 'choerodon-ui/lib/icon';
import FilterSelect from './FilterSelect';
import ColumnFilter from './ColumnFilter';
import DataSet from '../../data-set/DataSet';
import TableContext from '../TableContext';
import { $l } from '../../locale-context';
import { ButtonProps } from '../../button/Button';
import ObserverSelect from '../../select';
import { LabelLayout } from '../../form/enum';
import Option, { OptionProps } from '../../option/Option';
import Field from '../../data-set/Field';
import Record from '../../data-set/Record';
import autobind from '../../_util/autobind';

export interface ComboBarProps {
  prefixCls?: string;
  placeholder?: string;
  dataSet: DataSet;
  queryFields: ReactElement<any>[];
  queryDataSet?: DataSet;
  title?: string | ReactNode;
  buttons: ReactElement<ButtonProps>[];
  paramName: string;
  fold?: Boolean;
  searchable?: Boolean;
  dropDownArea?: () => ReactNode;
  buttonArea?: () => ReactNode;
  onQuery?: () => void;
  onReset?: () => void;
}

@observer
export default class TableComboBar extends Component<ComboBarProps, any> {
  static get contextType() {
    return TableContext;
  }

  static defaultProps = {
    prefixCls: getProPrefixCls('table'),
    paramName: 'params',
    queryHeaderConfig: {},
  };

  componentDidMount(): void {
    const { queryDataSet } = this.props;

    if (queryDataSet) {
      queryDataSet.setState('currentField', queryDataSet.fields.keys().next().value || '');
    }
  }

  renderSuffix() {
    const { prefixCls } = this.props;
    return <ColumnFilter prefixCls={prefixCls} />;
  }

  getFieldLabel(field: Field, record?: Record): ReactNode {
    return field.get('label', record) || field.name;
  }

  getFieldSelectOptions(): ReactElement<OptionProps>[] {
    const { queryDataSet } = this.props;
    const data: ReactElement<OptionProps>[] = [];
    if (queryDataSet) {
      const { current } = queryDataSet;
      queryDataSet.fields.forEach((field, key) => {
        data.push(
          <Option key={String(key)} value={String(key)}>
            {this.getFieldLabel(field, current)}
          </Option>,
        );
      });
    }
    return data;
  }

  @autobind
  handleFieldEnter(e) {
    e.stopPropagation();
  }

  @autobind
  async handleQuery() {
    const { dataSet, queryDataSet } = this.props;
    if (queryDataSet && await queryDataSet.validate()) {
      dataSet.query();
    }
  }

  @autobind
  createFields(element) {
    if (!element) {
      return React.createElement('span');
    }
    const { queryDataSet, prefixCls } = this.props;
    const { onEnterDown, name: fieldName } = element.props;
    if (onEnterDown && isFunction(onEnterDown)) {
      return element;
    }
    const props: any = {
      onEnterDown: this.handleFieldEnter,
      onChange: this.handleQuery,
      labelLayout: LabelLayout.none,
      dataSet: queryDataSet,
      name: fieldName,
      addonBefore: (
        <ObserverSelect
          className={`${prefixCls}-combo-toolbar-select`}
          clearButton={false}
          value={queryDataSet && queryDataSet.getState('currentField')}
          onChange={(value) => {
            if (queryDataSet) {
              queryDataSet.setState('currentField', value);
            }
          }}
        >
          {this.getFieldSelectOptions()}
        </ObserverSelect>
      ),
    };
    return cloneElement(element, props);
  }

  getQueryBar(): ReactNode {
    const { prefixCls, queryDataSet, queryFields } = this.props;
    if (queryDataSet) {
      const currentField = this.createFields(queryFields.find(queryField => queryField.key === queryDataSet.getState('currentField')));

      return (
        <div key="query_bar" className={`${prefixCls}-combo-query-bar`}>
          {currentField}
        </div>
      );
    }
  }

  handleFold() {
    const { tableStore } = this.context;
    tableStore.setFold();
  }

  getButtons(): ReactNode {
    const { prefixCls, buttons } = this.props;
    if (buttons.length) {
      return (
        <div key="toolbar" className={`${prefixCls}-toolbar`}>
          <span className={`${prefixCls}-toolbar-button-group`}>{buttons}</span>
        </div>
      );
    }
  }

  getFilterbar(): ReactNode {
    const { tableStore: { isFold } } = this.context;
    const { prefixCls, buttonArea, dropDownArea, searchable, title, fold } = this.props;
    const queryBar: ReactNode = this.getQueryBar();
    const defaultPrefixCls = `${prefixCls}-combo-toolbar`;
    return (
      <div key="combo_toolbar" className={`${defaultPrefixCls}`}>
        {
          dropDownArea && !isFold &&
          <div className={`${defaultPrefixCls}-action-button`}>
            {dropDownArea()}
          </div>
        }
        {
          !isFold && <div className={`${defaultPrefixCls}-filter-title`}>
            {title}
          </div>
        }
        {
          buttonArea && !isFold &&
          <div className={`${defaultPrefixCls}-filter-buttons`}>
            {buttonArea()}
          </div>
        }
        {
          searchable && !isFold &&
          <div className={`${defaultPrefixCls}-filter`}>
            <span>{$l('Table', 'query_button')}:</span>
            {queryBar}
          </div>
        }
        {
          fold && <div className={`${defaultPrefixCls}-fold`} onClick={() => this.handleFold()}>
            <Icon type={isFold ? 'indeterminate_check_box-o' : 'add_box-o'} />
          </div>
        }
      </div>
    );
  }

  render() {
    const { prefixCls, dataSet, queryDataSet, paramName, placeholder = $l('Table', 'filter_bar_placeholder'), onQuery = noop, onReset = noop } = this.props;
    const { tableStore: { isFold } } = this.context;
    const filterbBr: ReactNode = this.getFilterbar();
    const buttons = this.getButtons();
    return [
      filterbBr,
      !isFold && buttons,
      !isFold && <FilterSelect
        key="filter"
        prefixCls={`${prefixCls}-filter-select`}
        optionDataSet={dataSet}
        queryDataSet={queryDataSet}
        placeholder={placeholder}
        suffix={this.renderSuffix()}
        paramName={paramName}
        onQuery={onQuery}
        onReset={onReset}
      />,
    ];
  }
}
