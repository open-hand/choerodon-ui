import React, { Component } from 'react';
import ConfigContext, { ConfigContextValue } from 'choerodon-ui/lib/config-provider/ConfigContext';
import { $l } from '../locale-context';
import Icon from '../icon';
import Button from '../button';
import autobind from '../_util/autobind';
import EventManager from '../_util/EventManager';
import { transformZoomData } from '../_util/DocumentUtils';

interface VerifySliderProps {
  onSuccess?: () => void;
  onCancel?: (value?: any) => void;
}

export default class VerifySlider extends Component<VerifySliderProps> {
  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static displayName = 'VerifySlider';

  context: ConfigContextValue;

  get prefixCls() {
    const { context } = this;
    return context.getProPrefixCls('secret-field');
  }

  /**
   * 初始数据
   */
  /** x */
  private x1 = 0;

  private x2 = 0;

  /** 鼠标是否按下 */
  private isMousedown = false;

  /** 是否已经成功 */
  private isSuccess = false;

  /** 最大滑动距离 */
  private max = 290;

  private contentEle: any;

  private slideEle: any;

  private barEle: any;

  private tipEle: any;

  moveEvent: EventManager | null;

  contentOnRef = (ele: any) => {
    this.contentEle = ele;
  };

  slideOnRef = (ele: any) => {
    this.slideEle = ele;
  };

  barOnRef = (ele: any) => {
    this.barEle = ele;
  };

  tipOnRef = (ele: any) => {
    this.tipEle = ele;
  };

  @autobind
  handleMouseDown(e: any) {
    if (this.isSuccess) {
      return;
    }
    this.x1 = e.nativeEvent.x ? transformZoomData(e.nativeEvent.x) : transformZoomData(e.touches[0].clientX);
    this.isMousedown = true;

    if (!this.moveEvent) {
      this.moveEvent = new EventManager(this.contentEle);
    }
    this.moveEvent
      .addEventListener('mousemove', this.handleMouseMove)
      .addEventListener('mouseup', this.handleMouseUp);
  }

  @autobind
  handleMouseMove(e: any) {
    const { onSuccess } = this.props;
    if (!this.isMousedown || this.isSuccess) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    this.x2 = e.x ? transformZoomData(e.x) : transformZoomData(e.touches[0].clientX);
    let diff = this.x2 - this.x1;
    if (diff < 0) {
      diff = 0;
    }
    // mouseUp时候判断
    if (diff >= this.max) {
      diff = this.max;
      this.isSuccess = true;
      this.tipEle.style.opacity = 1;
      if (onSuccess) {
        onSuccess();
      }
    }
    const { style } = this.slideEle;
    const { style: barEleStyle } = this.barEle;
    style.transform = `translateX(${diff}px)`;
    style.opacity = 1;
    style.transitionDuration = '0s';
    barEleStyle.transform = `translateX(${diff}px)`;
  }

  @autobind
  handleMouseUp() {
    if (this.isSuccess) {
      return;
    }
    this.isMousedown = false;
    const { style } = this.slideEle;
    const { style: barEleStyle } = this.barEle;
    style.transform = `translateX(0)`;
    style.opacity = 0;
    barEleStyle.transform = `translateX(0)`;
    if (this.moveEvent) {
      this.moveEvent
        .removeEventListener('mousemove', this.handleMouseMove)
        .removeEventListener('mouseup', this.handleMouseUp);
    }
  }

  /** 滑块取消 */
  @autobind
  private handleSlider() {
    const { onCancel } = this.props;
    if (onCancel) {
      onCancel();
    }
  }

  componentWillUnmount() {
    const { moveEvent } = this;
    if (moveEvent) {
      moveEvent.clear();
    }
  }

  public render() {
    const { prefixCls } = this;

    return (
      <div className={`${prefixCls}-verify-content`}>
        <div className={`${prefixCls}-verify-content-slide`} ref={this.contentOnRef}>
          <div
            className={`${prefixCls}-simple-verify`}
          >
            <div className={`${prefixCls}-simple-verify-tips`}>
              {$l('SecretField', 'verify_slider_hint')}
            </div>
            <div className={`${prefixCls}-simple-verify-box`}>
              <div
                className={`${prefixCls}-simple-verify-slide`}
                ref={this.slideOnRef}
              />
            </div>
            <div className={`${prefixCls}-simple-verify-bar`} onMouseDown={this.handleMouseDown}>
              <div
                className={`${prefixCls}-simple-verify-bar-icon`}
                ref={this.barOnRef}
              />
            </div>
            <div className={`${prefixCls}-simple-verify-success-tips`} ref={this.tipOnRef}>
              <Icon type='check_circle_outline-o' />
              {$l('SecretField', 'verify_finish')}
            </div>
          </div>
        </div>
        <div className={`${prefixCls}-verify-content-btn`}>
          <Button onClick={this.handleSlider}>{$l('SecretField', 'cancel')}</Button>
        </div>
      </div>
    );
  }
}
