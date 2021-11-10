import { DependencyList, useMemo } from 'react';
import DataSet from 'choerodon-ui/dataset';
import { getConfig } from 'choerodon-ui/dataset/configure';
import { DataSetProps } from 'choerodon-ui/dataset/data-set/interface';
import useConfig from 'choerodon-ui/lib/use-config';

export default function useDataSet(factory: () => DataSetProps | undefined, deps: DependencyList | undefined): DataSet {
  const context = useConfig();
  const getLocalConfig = context.getConfig as typeof getConfig;
  return useMemo<DataSet>(() => new DataSet(factory(), { getConfig: getLocalConfig }), deps ? [getLocalConfig, ...deps] : [getLocalConfig]);
}
