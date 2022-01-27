import React, { ReactNode } from 'react';
import { observer } from 'mobx-react';
import noop from 'lodash/noop';
import Slider, { SliderProps } from 'choerodon-ui/lib/slider';
import { NumberField } from '../number-field/NumberField';

export interface RangeProps extends SliderProps {
  /**
   *  是否垂直方向
   */
  vertical?: boolean;
  min?: number;
  max?: number;
  dots?: boolean;
  included?: boolean;
  range?: boolean;
  step?: number;
  defaultValue?: number | [number, number];
}

@observer
export default class Range extends NumberField<RangeProps> {
  static displayName = 'Range';

  static defaultProps = {
    ...NumberField.defaultProps,
    suffixCls: 'range',
    min: 0,
    step: 1,
    max: 100,
    vertical: false,
    dots: false,
    marks: {},
    included: true,
    range: false,
    tipFormatter: null,
  };

  renderWrapper(): ReactNode {
    return (
      <label key="wrapper" {...this.getWrapperProps()}>
        {this.renderTrack()}
      </label>
    );
  }

  renderTrack() {
    const {
      props: { dataSet, onChange = noop, ...otherProps },
      prefixCls,
    } = this;
    if (dataSet) {
      const { fields = [] } = dataSet.props;
      let props: RangeProps = {};
      if (otherProps.name) {
        const fieldProps = fields.find(x => x.name === otherProps.name) as RangeProps
        props = fieldProps
      }

      return (
        <Slider prefixCls={prefixCls} {...otherProps} {...props} onChange={(value) => {
          this.setValue(value)
          onChange(value)
        }} />
      );
    }
    return (
      <Slider prefixCls={prefixCls} {...otherProps} onChange={onChange} />
    );
  }
}
