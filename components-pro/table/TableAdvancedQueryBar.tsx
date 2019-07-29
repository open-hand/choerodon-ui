import React, { cloneElement, Component, ContextType, isValidElement, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { action, isArrayLike } from 'mobx';
import { observer } from 'mobx-react';
import { isMoment, Moment } from 'moment';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import Field from '../data-set/Field';
import DataSet from '../data-set';
import Button from '../button';
import { getEditorByField } from './utils';
import TableContext from './TableContext';
import { ElementProps } from '../core/ViewComponent';
import { ButtonColor, FuncType } from '../button/enum';
import { filterBindField } from './TableToolBar';
import KeyValueBar, { KeyValuePair } from './KeyValueBar';
import Record from '../data-set/Record';
import { getDateFormatByField } from '../data-set/utils';
import { $l } from '../locale-context';

export interface TableAdvancedQueryBarProps extends ElementProps {
  queryFields: { [key: string]: ReactElement<any> | object };
  queryFieldsLimit: number;
}

export interface TableAdvancedQueryBarState {
  showMoreFieldsPanel: boolean;
}

function isFieldEmpty(field: Field): boolean {
  const value = field.getValue();
  return isArrayLike(value) ? value.length === 0 : !value;
}

function processFieldValue(field: Field) {
  let value = field.getValue();
  if (isMoment(value)) {
    value = (value as Moment).format(getDateFormatByField(field, field.get('type')));
  }
  if (isArrayLike(value)) {
    value = value.join(',');
  }
  return value;
}

@observer
export default class TableAdvancedQueryBar extends Component<TableAdvancedQueryBarProps, TableAdvancedQueryBarState> {

  static defaultProps = {
    queryFields: [],
  };

  static contextType = TableContext;

  context: ContextType<typeof TableContext>;

  state = {
    showMoreFieldsPanel: false,
  };

  moreFields: Field[];

  handleFieldEnter = () => {
    this.handleQuery();
  };

  handleFieldChange = () => {
    this.handleQuery();
  };

  handleQuery = () => {
    this.context.tableStore.dataSet.query();
  };

  getMoreFieldsButton(fields: Field[]) {
    const { showMoreFieldsPanel } = this.state;
    if (fields.length) {
      return (
        <Button icon="filter_list" color={ButtonColor.blue} funcType={FuncType.flat} onClick={this.handleMoreFieldsButtonClick}>
          {!showMoreFieldsPanel ? $l('Table', 'advanced_query') : $l('Table', 'hide_advanced_query')}
        </Button>
      );
    }
  }

  getClassName() {
    const { prefixCls } = this.props;
    return classNames(`${prefixCls}-advanced-query-bar-container`);
  }

  handleMoreFieldsButtonClick = () => {
    // toggle state
    this.setState((prevState) => {
      return {
        ...prevState,
        showMoreFieldsPanel: !prevState.showMoreFieldsPanel,
      };
    });
  };

  getCurrentFields(fields: Field[], dataSet: DataSet) {
    return this.createFields(fields, dataSet, false);
  }

  getQueryBar(): ReactNode {
    const { prefixCls, queryFieldsLimit } = this.props;
    const { queryDataSet } = this.context.tableStore.dataSet;
    if (queryDataSet) {
      const fields = filterBindField(queryDataSet.fields);
      const keys = Object.keys(fields);
      if (keys.length) {
        const currentFields = keys.slice(0, queryFieldsLimit).map(name => fields[name]);
        const moreKeys = keys.slice(queryFieldsLimit);
        let moreFieldsButton: ReactElement | undefined;
        // let dirtyInfo;
        if (moreKeys.length) {
          const moreFields = keys.slice(queryFieldsLimit).map(name => fields[name]);
          moreFieldsButton = this.getMoreFieldsButton(moreFields);
          // dirtyInfo = this.getDirtyInfo(queryDataSet.current, moreKeys);
        }
        return (
          <div className={`${prefixCls}-advanced-query-bar`}>
            {/* {dirtyInfo} */}
            {this.getCurrentFields(currentFields, queryDataSet)}
            {moreFieldsButton}
          </div>
        );
      }
    }
  }

  renderMoreFields(fields: ReactElement[]) {
    return fields.map((field, index) => {
      const { label } = field.props;
      return (
        <div className="more-field-container" key={`${field.key}-${index}`}>
          <label className="more-field-label">
            {label}
          </label>
          <div className="more-field-wrapper">
            {field}
          </div>
        </div>
      );
    });
  }

  renderMoreFieldsPanel(fields: Field[], dataSet: DataSet) {
    const { prefixCls } = this.props;
    return (
      <div className={`${prefixCls}-advanced-query-bar-more-fields-panel`}>
        {this.renderMoreFields(this.createFields(fields, dataSet, true))}
      </div>
    );
  }

  createFields(fields: Field[], dataSet: DataSet, isMore: boolean): ReactElement[] {
    const { queryFields } = this.props;
    return fields.map((field, index) => {
      const { name } = field;
      const props: any = {
        key: name,
        name,
        dataSet,
        autoFocus: isMore && index === 0,
        onEnterDown: this.handleFieldEnter,
        onChange: isMore ? this.handleFieldChange : undefined,
        style: {
          width: pxToRem(isMore ? 250 : 260),
          marginRight: !isMore ? pxToRem(16) : 0,
        },
        ...(isMore ? { label: field.get('label') } : { placeholder: field.get('label') }),
      };
      const label = field.get('label');
      if (label) {
        if (isMore) {
          props.label = label;
        } else {
          props.placeholder = label;
        }
      }
      const element = queryFields[name];
      return isValidElement(element) ? (
        cloneElement(element, props)
      ) : (
        cloneElement(getEditorByField(field), { ...props, ...element })
      );
    });
  }

  @action
  handleKeyValueItemClose = (label: string) => {
    const { queryDataSet } = this.context.tableStore.dataSet;
    if (queryDataSet) {
      const fields = filterBindField(queryDataSet.fields);
      Object.keys(fields)
        .map(fieldKey => fields[fieldKey])
        .filter(field => field.get('label') === label)
        .forEach(field => {
          const record = field.record || queryDataSet.current as Record;
          record.set(field.name, null);
          this.handleQuery();
        });
    }
  };

  getMoreFields(): Field[] {
    const { queryFieldsLimit } = this.props;
    const { queryDataSet } = this.context.tableStore.dataSet;

    if (queryDataSet) {
      const fields = filterBindField(queryDataSet.fields);
      const keys = Object.keys(fields);
      if (keys.length) {
        const moreFields = keys.slice(queryFieldsLimit).map(name => fields[name]);
        return moreFields;
      }
    }

    return [];
  }

  renderKeyValueBar() {
    const { prefixCls } = this.props;

    const items = [] as KeyValuePair[];

    this.getMoreFields().forEach(field => {
      if (!isFieldEmpty(field)) {
        items.push({
          key: field.get('label'),
          value: processFieldValue(field),
        });
      }
    });

    return (
      <KeyValueBar
        prefixCls={prefixCls}
        items={items}
        onCloseBtnClick={this.handleKeyValueItemClose}
      />
    );
  }

  getMoreFieldKeys(): string[] {
    const { queryFieldsLimit } = this.props;
    const { queryDataSet } = this.context.tableStore.dataSet;

    if (queryDataSet) {
      const fields = filterBindField(queryDataSet.fields);
      const keys = Object.keys(fields);
      return keys.slice(queryFieldsLimit);
    }

    return [];
  }

  render() {
    const { queryFieldsLimit } = this.props;
    const { queryDataSet } = this.context.tableStore.dataSet;
    const { showMoreFieldsPanel } = this.state;

    if (queryDataSet) {
      const fields = filterBindField(queryDataSet.fields);
      const keys = Object.keys(fields);
      if (keys.length) {
        const moreFields = keys.slice(queryFieldsLimit).map(name => fields[name]);
        return (
          <div className={this.getClassName()}>
            {this.getQueryBar()}
            {showMoreFieldsPanel ? this.renderMoreFieldsPanel(moreFields, queryDataSet) : null}
            {this.renderKeyValueBar()}
          </div>
        );
      }
    }

    // invalid advanced query bar
    console.warn(`queryBar = 'advancedBar' doesn't work, invalid queryDataSet`);
    return null;
  }
}
