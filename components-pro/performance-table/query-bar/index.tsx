import React, { cloneElement, Component, isValidElement, ReactElement, ReactNode } from 'react';
import { observer } from 'mobx-react';
import isObject from 'lodash/isObject';
import { TableQueryBarHookProps, TableQueryBarProps, TableQueryBarType } from '../Table';
import TableContext from '../TableContext';
import autobind from '../../_util/autobind';
import { getEditorByField, getPlaceholderByField } from '../../table/utils';
import Field from '../../data-set/Field';
import TableProfessionalBar from './TableProfessionalBar';
import TableDynamicFilterBar from './TableDynamicFilterBar';

export type TableQueryBarHookCustomProps = object;
export type TableQueryBarHook = (props: TableQueryBarHookCustomProps & TableQueryBarHookProps) => ReactNode;

@observer
export default class PerformanceTableQueryBar extends Component<TableQueryBarProps> {
  static displayName = 'PerformanceTableQueryBar';

  static get contextType(): typeof TableContext {
    return TableContext;
  }

  static defaultProps = {
    queryFieldsLimit: 3,
  };

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

  @autobind
  async handleQuery() {
    const {
      tableStore,
      tableStore: { dataSet, dataSet: { queryDataSet } },
    } = this.context;
    if (tableStore.queryBar === TableQueryBarType.filterBar) {
      if (await dataSet.modifiedCheck(undefined, dataSet, 'query') && queryDataSet && queryDataSet.current && await queryDataSet.current.validate()) {
        return dataSet.query();
      }
    } else {
      return dataSet.query();
    }
  }

  getQueryFields(): ReactElement<any>[] {
    const { tableStore: { dataSet, queryBar: { queryFields = {}, type } } } = this.context;
    const { queryDataSet } = dataSet;
    const result: ReactElement<any>[] = [];
    if (queryDataSet) {
      const { fields, current, props: { fields: propFields = [] } } = queryDataSet;
      const cloneFields: Map<string, Field> = fields.toJS();
      const processField = (field, name) => {
        if (!field.get('bind', current) && !name.includes('__tls')) {
          const element: ReactNode = queryFields![name];
          let filterBarProps = {};
          if (type === TableQueryBarType.filterBar) {
            const placeholder = isValidElement(element) && element.props.placeholder ? element.props.placeholder : getPlaceholderByField(field, current);
            filterBarProps = {
              placeholder,
              border: false,
              clearButton: true,
            };
          }
          const props: any = {
            key: name,
            name,
            dataSet: queryDataSet,
            isFlat: type === TableQueryBarType.filterBar,
            ...filterBarProps,
          };
          result.push(
            isValidElement(element)
              ? cloneElement(element, props)
              : cloneElement(getEditorByField(field, current, type !== TableQueryBarType.professionalBar, type === TableQueryBarType.filterBar), {
                ...props,
                ...(isObject(element) ? element : {}),
              }),
          );
        }
      };
      propFields.forEach(({ name }) => {
        if (name) {
          const field = cloneFields.get(name);
          if (field) {
            cloneFields.delete(name);
            processField(field, name);
          }
        }
      });
      cloneFields.forEach((field, name) => {
        processField(field, name);
      });
    }
    return result;
  }

  renderProfessionalBar(props: TableQueryBarHookProps) {
    const { tableStore: { prefixCls } } = this.context;
    return <TableProfessionalBar key="toolbar" prefixCls={prefixCls} {...props} />;
  }

  renderDynamicFilterBar(props: TableQueryBarHookProps) {
    const { tableStore: { prefixCls } } = this.context;
    // @ts-ignore
    return <TableDynamicFilterBar key="toolbar" prefixCls={prefixCls} {...props} />;
  }

  render() {
    const { tableStore: { queryBar, dataSet } } = this.context;
    if (dataSet) {
      const queryFields = this.getQueryFields();
      const { queryDataSet } = dataSet;
      const props: TableQueryBarHookProps = {
        ...queryBar,
        queryFields,
        queryDataSet,
      };

      if (typeof queryBar.renderer === 'function') {
        return (queryBar.renderer as TableQueryBarHook)(props);
      }
      switch (queryBar.type) {
        case TableQueryBarType.professionalBar:
          return this.renderProfessionalBar(props);
        case TableQueryBarType.filterBar:
          return this.renderDynamicFilterBar(props);
        default:
      }
    }
    return null;
  }
}
