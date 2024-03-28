import React, { ReactNode } from 'react';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import noop from 'lodash/noop';
import isNil from 'lodash/isNil';
import omit from 'lodash/omit';
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

  getWrapperClassNames(...args): string {
    const { prefixCls, props: { vertical } } = this;
    return super.getWrapperClassNames(
      {
        [`${prefixCls}-wrapper-vertical`]: vertical,
      },
      ...args,
    );
  }

  handleValueChange = (value) => {
    const { readOnly, props: { onChange = noop } } = this;
    if (!readOnly) {
      this.setValue(value);
      onChange(value);
    }
  }

  renderWrapper(): ReactNode {
    return (
      <label key="wrapper" {...omit(this.getWrapperProps(), ['style'])}>
        {this.renderTrack()}
      </label>
    );
  }

  renderTrack() {
    const {
      props: { onChange = noop, ...otherProps },
      prefixCls,
      readOnly,
      dataSet,
      name,
      disabled,
      max,
      min,
      range,
    } = this;
    if (readOnly) {
      otherProps.value = toJS(this.getValue());
    }

    if (dataSet && name) {
      const props: RangeProps = {
        defaultValue: this.getProp('defaultValue'),
        disabled,
        max: !isNil(max) && max !== Infinity ? !Number.isNaN(Number(max)) ? Number(max) : 100 : 100,
        min: !isNil(min) && min !== -Infinity ? !Number.isNaN(Number(min)) ? Number(min) : 1 : 1,
        range: !!range,
        step: this.getProp('step'),
        value: toJS(this.getValue()),
      };

      return (
        <Slider prefixCls={prefixCls} {...otherProps} {...props} onChange={this.handleValueChange} />
      );
    }
    
    return (
      <Slider prefixCls={prefixCls} {...otherProps} onChange={!readOnly ? onChange : undefined} />
    );
  }
}
