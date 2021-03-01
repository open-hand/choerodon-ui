import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import { computed } from 'mobx';
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

export default class DataSetComponent<T extends DataSetComponentProps> extends ViewComponent<T> {
  static propTypes = {
    dataSet: PropTypes.object,
    ...ViewComponent.propTypes,
  };

  @computed
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
    return {
      ...super.getObservableProps(props, context),
      dataSet: props.dataSet,
    };
  }

  getOtherProps() {
    return omit(super.getOtherProps(), ['dataSet']);
  }
}
