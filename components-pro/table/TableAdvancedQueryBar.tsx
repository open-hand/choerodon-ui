import React, {
  cloneElement,
  Component,
  ContextType,
  isValidElement,
  ReactElement,
  ReactNode,
} from 'react';
import classNames from 'classnames';
import { action, IReactionDisposer, isArrayLike, reaction } from 'mobx';
import { observer } from 'mobx-react';
import { isMoment, Moment } from 'moment';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import warning from 'choerodon-ui/lib/_util/warning';
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
import autobind from '../_util/autobind';

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
  static defaultProps = {
    queryFields: [],
  };

  static contextType = TableContext;

  queryDataSet?: DataSet;

  reaction: IReactionDisposer;

  context: ContextType<typeof TableContext>;

  state = {
    showMoreFieldsPanel: false,
  };

  moreFields: Field[];

  constructor(props, context) {
    super(props, context);
    this.on(context.tableStore.dataSet.queryDataSet);
    this.reaction = reaction(() => context.tableStore.dataSet.queryDataSet, this.on);
  }

  on(dataSet) {
    this.off();
    dataSet.addEventListener('update', this.handleDataSetUpdate);
    this.queryDataSet = dataSet;
  }

  off() {
    const { queryDataSet } = this;
    if (queryDataSet) {
      queryDataSet.removeEventListener('update', this.handleDataSetUpdate);
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

  getMoreFieldsButton(fields: Field[]) {
    const { showMoreFieldsPanel } = this.state;
    if (fields.length) {
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

  getCurrentFields(fields: Field[], dataSet: DataSet) {
    return this.createFields(fields, dataSet, false);
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
    const { prefixCls, queryFieldsLimit } = this.props;
    const {
      tableStore: {
        dataSet: { queryDataSet },
      },
    } = this.context;
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
            <span className={`${prefixCls}-advanced-query-bar-button`}>
              {this.getResetButton()}
              {moreFieldsButton}
            </span>
          </div>
        );
      }
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
      return isValidElement(element)
        ? cloneElement(element, props)
        : cloneElement(getEditorByField(field), { ...props, ...element });
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
    const { queryFieldsLimit } = this.props;
    const {
      tableStore: {
        dataSet: { queryDataSet },
      },
    } = this.context;
    const { showMoreFieldsPanel } = this.state;
    // invalid advanced query bar
    warning(
      !!queryDataSet,
      `queryBar = 'advancedBar' doesn't work, caused by missing queryDataSet`,
    );

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

    return null;
  }
}
