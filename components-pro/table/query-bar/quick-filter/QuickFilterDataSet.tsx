import React, { createContext, useMemo } from 'react';
import { AxiosRequestConfig } from 'axios';
import { getConfig } from 'choerodon-ui/lib/configure';
import DataSet from '../../../data-set';
import { DataSetProps, DataSetSelection, DataToJSON, FieldIgnore, FieldType } from '../../../data-set/interface';

function processAxiosConfig(
  axiosConfig: AxiosRequestConfig | ((...args: any[]) => AxiosRequestConfig) = {},
  args: {},
): AxiosRequestConfig {
  if (typeof axiosConfig === 'function') {
    return axiosConfig({ ...args });
  }
  return axiosConfig;
}

function getTransportConfig(props) {
  const { config, type, searchCode, queryDataSet, tableFilterAdapter } = props;
  return processAxiosConfig(tableFilterAdapter, { type, config, searchCode, queryDataSet });
}

const ConditionDataSet: () => DataSetProps = () => ({
  paging: false,
  fields: [
    {
      name: 'fieldName',
      type: FieldType.string,
    },
    {
      name: 'comparator',
      type: FieldType.string,
      defaultValue: 'EQUAL',
    },
    {
      name: 'value',
    },
    {
      name: 'searchConditionId',
      type: FieldType.number,
    },
  ],
  dataToJSON: DataToJSON.all,
  events: {
    update: () => {/* noop */},
  },
});

const QuickFilterDataSet = ({ searchCode, queryDataSet, tableFilterAdapter }) => ({
  paging: false,
  autoQuery: false,
  primaryKey: 'searchId',
  transport: {
    adapter: (config: AxiosRequestConfig, type: string) => getTransportConfig({
      config,
      type,
      searchCode,
      queryDataSet,
      tableFilterAdapter,
    }),
  },
  fields: [
    { name: 'searchName', type: 'string', maxLength: 10, required: true },
    { name: 'searchId', type: 'string' },
    { name: 'defaultFlag', type: 'boolean', falseValue: 0, trueValue: 1 },
    { name: 'searchCode', type: 'string', defaultValue: searchCode },
    { name: 'conditionList', type: 'object' },
  ],
});


const Store = createContext({} as any);

export default Store;

export const StoreProvider = props => {
  const { children, dynamicFilterBar, queryDataSet, searchCode } = props;
  const searchCodes = dynamicFilterBar?.searchCode || searchCode;
  const tableFilterAdapter = dynamicFilterBar?.tableFilterAdapter || getConfig('tableFilterAdapter');

  const filterMenuDS = useMemo(() => new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'filterName',
        type: FieldType.string,
        textField: 'searchName',
        valueField: 'searchId',
        options: new DataSet({
          selection: DataSetSelection.single,
        }),
        ignore: FieldIgnore.always,
      },
    ],
  }), []);


  const conditionDataSet = useMemo(() => new DataSet(ConditionDataSet()), []);

  const menuDataSet = useMemo(() => new DataSet(QuickFilterDataSet({
    searchCode: searchCodes,
    queryDataSet,
    tableFilterAdapter,
  }) as DataSetProps), []);

  const value = {
    ...props,
    menuDataSet,
    filterMenuDS,
    conditionDataSet,
  };
  return <Store.Provider value={value}>{children}</Store.Provider>;
};


