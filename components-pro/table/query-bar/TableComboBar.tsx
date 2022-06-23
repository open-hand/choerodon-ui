import React, { cloneElement, Component, ReactElement, ReactNode } from 'react';
import { observer } from 'mobx-react';
import noop from 'lodash/noop';
import isFunction from 'lodash/isFunction';
import Icon from 'choerodon-ui/lib/icon';
import { getProPrefixCls as getProPrefixClsDefault } from 'choerodon-ui/lib/configure/utils';
import FilterSelect from './FilterSelect';
import { FilterBarProps } from './TableFilterBar';
import ColumnFilter from './ColumnFilter';
import TableContext from '../TableContext';
import { TableQueryBarBaseProps } from '../Table';
import { $l } from '../../locale-context';
import ObserverSelect from '../../select';
import { LabelLayout } from '../../form/enum';
import Option, { OptionProps } from '../../option/Option';
import Field from '../../data-set/Field';
import Record from '../../data-set/Record';
import autobind from '../../_util/autobind';

export interface ComboBarProps extends TableQueryBarBaseProps, FilterBarProps {
  title?: string | ReactNode;
  fold?: Boolean;
  searchable?: Boolean;
  dropDownArea?: () => ReactNode;
  buttonArea?: () => ReactNode;
}

@observer
export default class TableComboBar extends Component<ComboBarProps, any> {
  static get contextType(): typeof TableContext {
    return TableContext;
  }

  static defaultProps = {
    paramName: 'params',
    queryHeaderConfig: {},
  };

  get prefixCls(): string {
    const { prefixCls } = this.props;
    const { tableStore: { getProPrefixCls = getProPrefixClsDefault } } = this.context;
    return getProPrefixCls('table', prefixCls);
  }

  componentDidMount(): void {
    const { queryDataSet } = this.props;

    if (queryDataSet) {
      queryDataSet.setState('currentField', queryDataSet.fields.keys().next().value || '');
    }
  }

  renderSuffix() {
    const { prefixCls } = this;
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
        if (!field.get('bind', current)) {
          data.push(
            <Option key={String(key)} value={String(key)}>
              {this.getFieldLabel(field, current)}
            </Option>,
          );
        }
      });
    }
    return data;
  }

  @autobind
  handleFieldEnter(e) {
    e.stopPropagation();
  }

  @autobind
  createFields(element) {
    if (!element) {
      return React.createElement('span');
    }
    const { queryDataSet } = this.props;
    const { prefixCls } = this;
    const { onEnterDown, name: fieldName } = element.props;
    if (onEnterDown && isFunction(onEnterDown)) {
      return element;
    }
    const props: any = {
      onEnterDown: this.handleFieldEnter,
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
    const { queryDataSet, queryFields } = this.props;
    const { prefixCls } = this;
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
    const { buttons } = this.props;
    const { prefixCls } = this;
    if (buttons.length) {
      return (
        <div key="toolbar" className={`${prefixCls}-toolbar`}>
          <span className={`${prefixCls}-toolbar-button-group`}>{buttons}</span>
        </div>
      );
    }
  }

  getFilterbar(): ReactNode | null {
    const { tableStore: { isFold } } = this.context;
    const { buttonArea, dropDownArea, searchable, title, fold } = this.props;
    const { prefixCls } = this;
    const queryBar: ReactNode = this.getQueryBar();
    const defaultPrefixCls = `${prefixCls}-combo-toolbar`;
    if (buttonArea || dropDownArea || searchable || title || fold) {
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
    return null;
  }

  render() {
    const { dataSet, queryDataSet, paramName, placeholder = $l('Table', 'filter_bar_placeholder'), onQuery = noop, onReset = noop } = this.props;
    const { prefixCls } = this;
    const { tableStore: { isFold } } = this.context;
    const filterBar: ReactNode | null = this.getFilterbar();
    const buttons = this.getButtons();
    return [
      filterBar,
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
