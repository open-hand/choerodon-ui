import React, { ReactNode } from 'react';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';
import classNames from 'classnames';
import noop from 'lodash/noop';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import C7NRate, { RateProps as C7NRateProps } from 'choerodon-ui/lib/rate';
import { FIELD_SUFFIX } from '../form/utils';
import { FormField, FormFieldProps } from '../field/FormField';
import { renderValidationMessage } from '../field/utils';
import Icon from '../icon';
import { LabelLayout, ShowValidation } from '../form/enum';
import autobind from '../_util/autobind';
import { hide, show } from '../tooltip/singleton';
import ValidationResult from '../validator/ValidationResult';
import { ShowHelp } from '../field/enum';

export interface RateProps extends C7NRateProps, FormFieldProps {
  defaultValue?: number;
  onChange?: (value: number) => any;
  value?: number;
}

@observer
export default class Rate<T extends RateProps> extends FormField<T> {
  static displayName = 'Rate';

  static defaultProps = {
    ...C7NRate.defaultProps,
    ...FormField.defaultProps,
    suffixCls: 'rate',
  };

  // eslint-disable-next-line camelcase
  static __PRO_RATE = true;

  // eslint-disable-next-line camelcase
  static __IS_IN_CELL_EDITOR = true;

  get hasFloatLabel(): boolean {
    const { labelLayout } = this;
    if (labelLayout) {
      return [LabelLayout.float, LabelLayout.placeholder].includes(labelLayout);
    }
    return false;
  }

  @autobind
  renderValidationResult(validationResult?: ValidationResult): ReactNode {
    const validationMessage = this.getValidationMessage(validationResult);
    const { labelLayout, showValidation, getProPrefixCls } = this.context;
    if (validationMessage) {
      const showIcon = !((labelLayout && [LabelLayout.float, LabelLayout.placeholder].includes(labelLayout)) || showValidation === ShowValidation.newLine);
      return renderValidationMessage(validationMessage, showIcon, getProPrefixCls);
    }
  }

  onChange = (value: number) => {
    this.setValue(value);
  };

  @autobind
  handleHelpMouseEnter(e) {
    const { getTooltipTheme, getTooltipPlacement } = this.context;
    const { helpTooltipProps } = this;
    let helpTooltipCls = `${this.getContextConfig('proPrefixCls')}-tooltip-popup-help`;
    if (helpTooltipProps && helpTooltipProps.popupClassName) {
      helpTooltipCls = helpTooltipCls.concat(' ', helpTooltipProps.popupClassName)
    }
    show(e.currentTarget, {
      title: this.getDisplayProp('help'),
      theme: getTooltipTheme('help'),
      placement: getTooltipPlacement('help'),
      ...helpTooltipProps,
      popupClassName: helpTooltipCls,
    });
  }

  handleHelpMouseLeave() {
    hide();
  }

  renderTooltipHelp(): ReactNode {
    const help = this.getDisplayProp('help');
    if (help) {
      return (
        <Icon
          type="help"
          onMouseEnter={this.handleHelpMouseEnter}
          onMouseLeave={this.handleHelpMouseLeave}
        />
      );
    }
  }

  renderFloatLabel(): ReactNode {
    if (this.hasFloatLabel) {
      const label = this.getLabel();
      if (label) {
        const { floatLabelOffsetX } = this;
        const prefixCls = this.getContextProPrefixCls(FIELD_SUFFIX);
        const required = this.getProp('required');
        const classString = classNames(`${prefixCls}-label`, {
          [`${prefixCls}-required`]: required,
          [`${prefixCls}-readonly`]: this.readOnly,
        });
        const style = floatLabelOffsetX ? {
          marginLeft: pxToRem(floatLabelOffsetX, true),
        } : undefined;
        return (
          <div className={`${prefixCls}-label-wrapper`} style={style}>
            <div
              className={classString}
              onMouseEnter={this.handleFloatLabelMouseEnter}
              onMouseLeave={this.handleFloatLabelMouseLeave}
            >
              {label}
            </div>
            {this.renderTooltipHelp()}
          </div>
        );
      }
    }
  }

  getOtherProps() {
    const otherProps = super.getOtherProps();
    otherProps.onFocus = noop;
    otherProps.onBlur = noop;
    return otherProps;
  }

  renderWrapper(): ReactNode {
    const value = this.getValue();
    return (
      <label key="wrapper" {...this.getWrapperProps()}>
        {this.renderFloatLabel()}
        <div onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
          <C7NRate {...this.getOtherProps()} onChange={this.onChange} value={value} />
        </div>
      </label>
    );
  }

  renderHelpMessage(): ReactNode {
    const { showHelp } = this;
    const label = this.getLabel();
    if ([ShowHelp.none, ShowHelp.label].includes(showHelp)) return;
    if (!this.hasFloatLabel || !label) {
      const help = this.getDisplayProp('help');
      if (help) {
        return (
          <div key="help" className={`${this.getContextProPrefixCls(FIELD_SUFFIX)}-help`}>
            {toJS(help)}
          </div>
        );
      }
    }
  }
}
