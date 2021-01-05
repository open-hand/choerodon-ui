import React, { createContext, useMemo } from 'react';
import { AxiosRequestConfig } from 'axios';
import { getConfig } from 'choerodon-ui/lib/configure';
import DataSet from '../../../data-set';
import { DataSetSelection, FieldType } from '../../../data-set/enum';

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
    { name: 'searchId', type: 'number' },
    { name: 'defaultFlag', type: 'boolean', falseValue: 0, trueValue: 1 },
    { name: 'searchCode', type: 'string', defaultValue: searchCode },
    { name: 'conditionList', type: 'object' },
  ],
});


// @ts-ignore
const Store = createContext();

export default Store;

export const StoreProvider = props => {
  const { children, dynamicFilterBar, queryDataSet } = props;
  const searchCode = dynamicFilterBar?.searchCode;
  const tableFilterAdapter = dynamicFilterBar?.tableFilterAdapter || getConfig('tableFilterAdapter');

  const filterMenuDS = useMemo(() => new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'filterName',
        type: FieldType.number,
        textField: 'searchName',
        valueField: 'searchId',
        options: new DataSet({
          selection: DataSetSelection.single,
        }),
      },
    ],
  }), []);

  // @ts-ignore
  const menuDataSet = useMemo(() => new DataSet(QuickFilterDataSet({
    searchCode,
    queryDataSet,
    tableFilterAdapter,
  })), []);

  const value = {
    ...props,
    menuDataSet,
    filterMenuDS,
  };
  return <Store.Provider value={value}>{children}</Store.Provider>;
};


