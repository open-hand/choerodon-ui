import React from 'react';
import { observer } from 'mobx-react';
import C7NSpin, { SpinProps as C7NSpinProps } from 'choerodon-ui/lib/spin';
import { DataSetStatus } from '../data-set/enum';
import DataSetComponent, { DataSetComponentProps } from '../data-set/DataSetComponent';

export interface SpinProps extends C7NSpinProps, DataSetComponentProps {
}

@observer
export default class Spin extends DataSetComponent<SpinProps> {
  static displayName = 'Spin';

  render() {
    const { dataSet, ...otherProps } = this.props;
    const props: SpinProps = {};
    if (dataSet) {
      props.spinning = dataSet.status !== DataSetStatus.ready;
    }
    return <C7NSpin {...otherProps} {...props} />;
  }
}
