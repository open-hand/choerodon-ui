import React, { cloneElement, Component, ReactElement, ReactNode } from 'react';
import { observer } from 'mobx-react';
import noop from 'lodash/noop';
import classNames from 'classnames';
import isFunction from 'lodash/isFunction';
import { getProPrefixCls } from 'choerodon-ui/lib/configure/utils';
import Icon from 'choerodon-ui/lib/icon';
import FilterSelect from './FilterSelect';
import ColumnFilter from './ColumnFilter';
import { QueryHeaderConfig } from '../Table';
import DataSet from '../../data-set/DataSet';
import { $l } from '../../locale-context';
import { ButtonProps } from '../../button/Button';
import { PaginationProps } from '../../pagination/Pagination';
import ObserverSelect from '../../select';
import { LabelLayout } from '../../form/enum';
import Option, { OptionProps } from '../../option/Option';
import Field from '../../data-set/Field';
import Record from '../../data-set/Record';
import autobind from '../../_util/autobind';

export interface YqCloudFilterBarProps {
  prefixCls?: string;
  placeholder?: string;
  dataSet: DataSet;
  queryFields: ReactElement<any>[];
  queryDataSet?: DataSet;
  paramName: string;
  title?: string | ReactNode;
  buttons: ReactElement<ButtonProps>[];
  pagination?: ReactElement<PaginationProps>;
  queryHeaderConfig?: QueryHeaderConfig;
  onQuery?: () => void;
  onReset?: () => void;
}

@observer
export default class TableYQCloudBar extends Component<YqCloudFilterBarProps, any> {
  static defaultProps = {
    prefixCls: getProPrefixCls('table'),
    paramName: 'params',
    queryHeaderConfig: {},
  };

  componentDidMount(): void {
    const { dataSet, queryDataSet, queryHeaderConfig } = this.props;
    if (queryHeaderConfig && queryHeaderConfig.fold) {
      dataSet.setState('foldable', false)
    }

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
          className={`${prefixCls}-yqcloud-toolbar-select`}
          clearButton={false}
          value={queryDataSet && queryDataSet.getState('currentField')}
          onChange={(value) => {
            if (queryDataSet) {
              queryDataSet.setState('currentField', value)
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
        <div key="query_bar" className={`${prefixCls}-yqcloud-query-bar`}>
          {currentField}
        </div>
      );
    }
  }

  handleFold() {
    const { dataSet } = this.props;
    dataSet.setState('foldable', !dataSet.getState('foldable'))
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

  getYqCloudbar(): ReactNode {
    const { prefixCls, dataSet, queryHeaderConfig } = this.props;
    if (queryHeaderConfig) {
      const { buttonArea, dropDownArea, searchable, title, fold } = queryHeaderConfig;
      const queryBar: ReactNode = this.getQueryBar();
      const defaultPrefixCls = `${prefixCls}-yqcloud-toolbar`;
      const foldCls = classNames(`${defaultPrefixCls}-fold`, {
        [`${defaultPrefixCls}-folded`]: !dataSet.getState('foldable'),
      })
      return (
        <div key="yqcloud_toolbar" className={`${defaultPrefixCls}`}>
          {dropDownArea &&
            <div className={`${defaultPrefixCls}-action-button`}>
              {dropDownArea}
            </div>
          }
          <div className={`${defaultPrefixCls}-filter-title`}>
            {title}
          </div>
          <div className={`${defaultPrefixCls}-filter-buttons`}>
            {buttonArea}
          </div>
          {
            searchable &&
            <div className={`${defaultPrefixCls}-filter`}>
              <span>{$l('Table', 'query_button')}:</span>
              {queryBar}
            </div>
          }
          {
            fold && <div className={foldCls} onClick={() => this.handleFold()}>
              <Icon type="flip" />
            </div>
          }
        </div>
      );
    }
    return null;
  }

  render() {
    const { prefixCls, dataSet, queryDataSet, paramName, placeholder = $l('Table', 'filter_bar_placeholder'), pagination, onQuery = noop, onReset = noop } = this.props;
    const yqCloudBar: ReactNode = this.getYqCloudbar();
    const buttons = this.getButtons();
    return [
      yqCloudBar,
      buttons,
      pagination,
      <FilterSelect
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
