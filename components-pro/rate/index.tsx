import React, { cloneElement, isValidElement, ReactNode } from 'react';
import { observer } from 'mobx-react';
import Rate, { RateProps } from 'choerodon-ui/lib/rate';
import { getConfig, getProPrefixCls } from 'choerodon-ui/lib/configure';
import classNames from 'classnames';
import isString from 'lodash/isString';
import omit from 'lodash/omit';
import { Tooltip as TextTooltip } from '../core/enum';
import { FIELD_SUFFIX } from '../form/utils';
import { FormField, FormFieldProps } from '../field/FormField';
import Animate from '../animate';
import { ShowHelp } from '../field/enum';
import Icon from '../icon';
import Tooltip from '../tooltip';
import { LabelLayout } from '../form/enum';

export interface ObserverRateProps extends FormFieldProps<number> {
  // TODO: ADD
}

@observer
export default class ObserverRate<T extends ObserverRateProps> extends FormField<T & RateProps & ObserverRateProps> {
  static defaultProps = {
    ...Rate.defaultProps,
    ...FormField.defaultProps,
    suffixCls: 'rate',
  };

  static displayName = 'ObserverRate';

  static __IS_IN_CELL_EDITOR = true;

  get hasFloatLabel(): boolean {
    const { labelLayout } = this;
    return labelLayout === LabelLayout.float || labelLayout === LabelLayout.placeholder;
  }

  onChange = (value: number) => {
    this.setValue(value);
  }

  renderFloatHelp(): ReactNode {
    const { showHelp } = this.props;
    if (showHelp !== ShowHelp.none) {
      const help = this.getProp('help');
      return (
        <Tooltip title={help} openClassName={`${getConfig('proPrefixCls')}-tooltip-popup-help`} placement="bottom">
          <Icon type="help"/>
        </Tooltip>
      )
    }
  }

  renderFloatLabel(): ReactNode {
    if (this.hasFloatLabel) {
      const label = this.getLabel();
      if (label) {
        const { labelTooltip, floatLabelOffsetX } = this;
        const prefixCls = getProPrefixCls(FIELD_SUFFIX);
        const required = this.getProp('required');
        const classString = classNames(`${prefixCls}-label`, {
          [`${prefixCls}-required`]: required,
          [`${prefixCls}-readonly`]: this.readOnly,
        });
        const style = floatLabelOffsetX ? {
          marginLeft: floatLabelOffsetX,
        } : undefined;
        return (
          <div className={`${prefixCls}-label-wrapper`} style={style}>
            <div
              className={classString}
              title={isString(label) && ![TextTooltip.always, TextTooltip.overflow].includes(labelTooltip) ? label : undefined}
              onMouseEnter={this.handleFloatLabelMouseEnter}
              onMouseLeave={this.handleFloatLabelMouseLeave}
            >
              {label}
            </div>
            {this.renderFloatHelp()}
          </div>
        );
      }
    }
  }

  getOtherProps(){
    const { props, disabled } = this;
    const otherProps: any = omit(props, this.getOmitPropsKeys());
    otherProps.ref = this.elementReference;
    otherProps.disabled = disabled;
    return otherProps;
  }


  renderWrapper(): ReactNode {
    return (
        <label key="wrapper" {...this.getWrapperProps()}>
          {this.renderFloatLabel()}
          <div onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave} >
            <Rate {...this.getOtherProps()} onChange={this.onChange} />
          </div>
        </label>
    );
  }

  render() {
    const wrapper = this.renderHighLight();
    if (this.hasFloatLabel) {
      const message = this.renderValidationResult();
      return [
        isValidElement(wrapper) ? cloneElement(wrapper, { key: 'wrapper' }) : wrapper,
        message && (
          <Animate transitionName="show-error" component="" transitionAppear key="validation-message">
            {message}
          </Animate>
        ),
      ];
    }
    return (
      <>
        {wrapper}
        {this.renderHelpMessage()}
      </>
    );
  }
}
