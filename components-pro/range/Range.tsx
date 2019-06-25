import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { NumberField, NumberFieldProps } from '../number-field/NumberField';
import autobind from '../_util/autobind';
import EventManager from '../_util/EventManager';
import omit from 'lodash/omit';
import { FieldType } from '../data-set/enum';

export interface RangeProps extends NumberFieldProps {
  /**
   *  是否垂直方向
   */
  vertical?: boolean;
}

@observer
export default class Range extends NumberField<RangeProps> {
  static displayName = 'Range';

  static propTypes = {
    /**
     * 是否垂直方向
     * @default
     * false
     */
    vertical: PropTypes.bool,
    ...NumberField.propTypes,
  };

  static defaultProps = {
    ...NumberField.defaultProps,
    suffixCls: 'range',
    min: 0,
    step: 1,
    max: 100,
    vertical: false,
  };

  dragEvent: EventManager = new EventManager(typeof window !== 'undefined' && document);
  track: HTMLDivElement;

  type: string = 'range';

  getFieldType(): FieldType {
    return FieldType.number;
  }

  getOtherProps() {
    return omit(super.getOtherProps(), [
      'vertical',
    ]);
  }

  getValue() {
    return super.getValue() || 0;
  }

  getWrapperClassNames() {
    const { props: { vertical }, prefixCls } = this;
    return super.getWrapperClassNames({
      [`${prefixCls}-vertical`]: vertical,
    });
  }

  renderWrapper(): ReactNode {
    return (
      <label key="wrapper" {...this.getWrapperProps()}>
        <input {...this.getOtherProps()} value={this.getValue()} />
        {this.renderTrack()}
        {this.renderFloatLabel()}
      </label>
    );
  }

  renderTrack() {
    const percent = this.getPercent();
    const { props: { vertical }, prefixCls } = this;
    return (
      <div className={`${prefixCls}-track`} onMouseDown={this.isReadOnly() || this.isDisabled() ? void 0 : this.handleTrackClick}>
        <div className={`${prefixCls}-draghandle`} style={vertical ? { bottom: percent } : { left: percent }} />
        <div className={`${prefixCls}-selection`} style={vertical ? { height: percent } : { width: percent }} />
      </div>
    );
  }

  @autobind
  handleTrackClick(e): void {
    this.track = e.currentTarget;
    this.handleDrag(e);
    this.handleDragStart();
  }

  @autobind
  handleDragStart(): void {
    this.dragEvent
      .addEventListener('mousemove', this.handleDrag)
      .addEventListener('mouseup', this.handleDragEnd);
  }

  @autobind
  handleDragEnd(): void {
    this.dragEvent
      .removeEventListener('mousemove', this.handleDrag)
      .removeEventListener('mouseup', this.handleDragEnd);
  }

  @autobind
  handleDrag(e) {
    const { track } = this;
    const { vertical } = this.props;
    const max = this.getProp('max');
    const min = this.getProp('min');
    const step = this.getProp('step');
    const { bottom, left } = track.getBoundingClientRect();
    const length = vertical ? bottom - e.clientY : e.clientX - left;
    const totalLength = vertical ? track.clientHeight : track.clientWidth;
    const oneStepLength = 1 / ((max - min ) / step) * totalLength;
    let value = min;
    if (length <= 0) {
      value = min;
    } else if (length >= totalLength) {
      value = max;
    } else {
      value = Math.round(length / oneStepLength) * step + min;
    }
    this.setValue(value);
  }

  getPercent() {
    const value = this.getValue();
    const max = this.getProp('max');
    const min = this.getProp('min');
    if (value <= min) {
      return 0;
    } else if (value >= max) {
      return '100%';
    } else {
      return `${(value - min) / (max - min) * 100}%`;
    }
  }

}
