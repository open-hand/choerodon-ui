import { computed } from 'mobx';
import { ConfigContextValue } from 'choerodon-ui/lib/config-provider/ConfigContext';
import DataSet from './DataSet';
import ViewComponent, { ViewComponentProps } from '../core/ViewComponent';
import { Lang } from '../locale-context/enum';
import localeContext from '../locale-context/LocaleContext';

/**
 * 可绑定数据源的组件.
 */
export interface DataSetComponentProps extends ViewComponentProps {
  /** 数据源 */
  dataSet?: DataSet;
}

export default class DataSetComponent<T extends DataSetComponentProps, C extends ConfigContextValue = ConfigContextValue> extends ViewComponent<T, C> {
  get dataSet(): DataSet | undefined {
    return this.observableProps.dataSet;
  }

  @computed
  get lang(): Lang {
    const { lang } = this.observableProps;
    if (lang) {
      return lang;
    }
    const { dataSet } = this;
    if (dataSet && dataSet.lang) {
      return dataSet.lang;
    }
    return localeContext.locale.lang;
  }

  getObservableProps(props, context) {
    const observableProps = super.getObservableProps(props, context);
    if ('dataSet' in props) {
      observableProps.dataSet = props.dataSet;
    }
    return observableProps;
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'dataSet',
    ]);
  }
}
