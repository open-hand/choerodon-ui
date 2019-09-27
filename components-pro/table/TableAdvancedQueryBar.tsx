import React, { cloneElement, Component, ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import { action, isArrayLike } from 'mobx';
import { observer } from 'mobx-react';
import { isMoment, Moment } from 'moment';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import Field from '../data-set/Field';
import DataSet from '../data-set';
import Button from '../button';
import TableContext from './TableContext';
import { ElementProps } from '../core/ViewComponent';
import { ButtonColor, FuncType } from '../button/enum';
import { ButtonProps } from '../button/Button';
import { filterBindField } from './TableToolBar';
import KeyValueBar, { KeyValuePair } from './KeyValueBar';
import Record from '../data-set/Record';
import { $l } from '../locale-context';
import autobind from '../_util/autobind';
import { getDateFormatByField } from '../field/utils';
import { PaginationProps } from '../pagination/Pagination';
import TableButtons from './TableButtons';

export interface TableAdvancedQueryBarProps extends ElementProps {
  dataSet: DataSet;
  queryDataSet?: DataSet;
  queryFields: ReactElement<any>[];
  queryFieldsLimit: number;
  buttons: ReactElement<ButtonProps>[];
  pagination?: ReactElement<PaginationProps>;
}

export interface TableAdvancedQueryBarState {
  showMoreFieldsPanel: boolean;
}

function isFieldEmpty(field: Field): boolean {
  const value = field.getValue();
  return isArrayLike(value) ? value.length === 0 : !value;
}

function processFieldValue(field: Field) {
  const value = field.getValue();
  if (isMoment(value)) {
    return (value as Moment).format(getDateFormatByField(field, field.get('type')));
  }
  return field.getText();
}

@observer
export default class TableAdvancedQueryBar extends Component<
  TableAdvancedQueryBarProps,
  TableAdvancedQueryBarState
> {
  static contextType = TableContext;

  state = {
    showMoreFieldsPanel: false,
  };

  moreFields: Field[];

  constructor(props, context) {
    super(props, context);
    this.on(props.queryDataSet);
  }

  componentWillReceiveProps(nextProps) {
    const { queryDataSet } = this.props;
    const { queryDataSet: newQueryDataSet } = nextProps;
    if (queryDataSet !== newQueryDataSet) {
      this.off(queryDataSet);
      this.on(newQueryDataSet);
    }
  }

  componentWillUnmount() {
    const { queryDataSet } = this.props;
    this.off(queryDataSet);
  }

  on(dataSet?: DataSet) {
    if (dataSet) {
      dataSet.addEventListener('update', this.handleDataSetUpdate);
    }
  }

  off(dataSet?: DataSet) {
    if (dataSet) {
      dataSet.removeEventListener('update', this.handleDataSetUpdate);
    }
  }

  @autobind
  handleDataSetUpdate() {
    this.handleQuery();
  }

  @autobind
  handleFieldEnter() {
    this.handleQuery();
  }

  @autobind
  handleQuery() {
    const {
      tableStore: { dataSet },
    } = this.context;
    dataSet.query();
  }

  getMoreFieldsButton(fields: ReactElement<any>[]) {
    if (fields.length) {
      const { showMoreFieldsPanel } = this.state;
      return (
        <Button
          icon="filter_list"
          color={ButtonColor.primary}
          funcType={FuncType.flat}
          onClick={this.handleMoreFieldsButtonClick}
        >
          {!showMoreFieldsPanel
            ? $l('Table', 'advanced_query')
            : $l('Table', 'hide_advanced_query')}
        </Button>
      );
    }
  }

  getClassName() {
    const { prefixCls } = this.props;
    return classNames(`${prefixCls}-advanced-query-bar-container`);
  }

  @autobind
  handleMoreFieldsButtonClick() {
    // toggle state
    this.setState(prevState => {
      return {
        ...prevState,
        showMoreFieldsPanel: !prevState.showMoreFieldsPanel,
      };
    });
  }

  getResetButton() {
    return (
      <Button
        icon="replay"
        color={ButtonColor.primary}
        funcType={FuncType.flat}
        onClick={this.handleQueryReset}
      >
        {$l('Table', 'reset_button')}
      </Button>
    );
  }

  getQueryBar(): ReactNode {
    const { prefixCls, queryFieldsLimit, queryFields, buttons, queryDataSet } = this.props;
    if (queryDataSet && queryFields.length) {
      const { showMoreFieldsPanel } = this.state;
      const currentFields = this.createFields(
        queryFields.slice(0, queryFieldsLimit),
        queryDataSet,
        false,
      );
      const moreFields = this.createFields(queryFields.slice(queryFieldsLimit), queryDataSet, true);
      const moreFieldsButton: ReactElement | undefined = this.getMoreFieldsButton(moreFields);
      return [
        <div key="toolbar" className={`${prefixCls}-advanced-query-bar`}>
          {/* {dirtyInfo} */}
          {currentFields}
          <span className={`${prefixCls}-advanced-query-bar-button`}>
            {this.getResetButton()}
            {moreFieldsButton}
            {buttons}
          </span>
        </div>,
        showMoreFieldsPanel ? this.renderMoreFieldsPanel(moreFields) : null,
      ];
    }
  }

  renderMoreFields(fields: ReactElement[]) {
    return fields.map((field, index) => {
      const { label } = field.props;
      return (
        <div className="more-field-container" key={`${field.key}-${String(index)}`}>
          <label className="more-field-label">{label}</label>
          <div className="more-field-wrapper">{field}</div>
        </div>
      );
    });
  }

  renderMoreFieldsPanel(fields: ReactElement<any>[]) {
    const { prefixCls } = this.props;
    return (
      <div className={`${prefixCls}-advanced-query-bar-more-fields-panel`}>
        {this.renderMoreFields(fields)}
      </div>
    );
  }

  createFields(elements: ReactElement<any>[], dataSet: DataSet, isMore: boolean): ReactElement[] {
    return elements.map(element => {
      const { name } = element.props;
      const props: any = {
        onEnterDown: this.handleFieldEnter,
        style: {
          width: pxToRem(isMore ? 250 : 260),
          marginRight: !isMore ? pxToRem(16) : 0,
        },
      };
      const field = dataSet.getField(name);
      if (field) {
        const label = field.get('label');
        if (label) {
          if (isMore) {
            props.label = label;
          } else {
            props.placeholder = label;
          }
        }
      }
      return cloneElement(element, props);
    });
  }

  @autobind
  @action
  handleKeyValueItemClose(label: string) {
    const {
      tableStore: {
        dataSet: { queryDataSet },
      },
    } = this.context;
    if (queryDataSet) {
      const fields = filterBindField(queryDataSet.fields);
      Object.keys(fields)
        .map(fieldKey => fields[fieldKey])
        .filter(field => field.get('label') === label)
        .forEach(field => {
          const record = field.record || (queryDataSet.current as Record);
          record.set(field.name, null);
          this.handleQuery();
        });
    }
  }

  @autobind
  handleQueryReset() {
    const {
      tableStore: {
        dataSet: { queryDataSet },
      },
    } = this.context;
    if (queryDataSet) {
      const { current } = queryDataSet;
      if (current) {
        current.reset();
      }
      this.handleQuery();
    }
  }

  getMoreFields(): Field[] {
    const { queryFieldsLimit } = this.props;
    const {
      tableStore: {
        dataSet: { queryDataSet },
      },
    } = this.context;

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
        key="key-value-bar"
        prefixCls={prefixCls}
        items={items}
        onCloseBtnClick={this.handleKeyValueItemClose}
      />
    );
  }

  getMoreFieldKeys(): string[] {
    const { queryFieldsLimit } = this.props;
    const {
      tableStore: {
        dataSet: { queryDataSet },
      },
    } = this.context;

    if (queryDataSet) {
      const fields = filterBindField(queryDataSet.fields);
      const keys = Object.keys(fields);
      return keys.slice(queryFieldsLimit);
    }

    return [];
  }

  render() {
    const { buttons, prefixCls } = this.props;
    const queryBar = this.getQueryBar();

    if (queryBar) {
      return (
        <div className={this.getClassName()}>
          {queryBar}
          {this.renderKeyValueBar()}
        </div>
      );
    }

    return <TableButtons key="toolbar" prefixCls={prefixCls} buttons={buttons} />;
  }
}
