import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import noop from 'lodash/noop';
import RenderIcon from './RenderIcon';
import Icon from '../../icon';

export default class Step extends Component {
  static propTypes = {
    className: PropTypes.string,
    prefixCls: PropTypes.string,
    style: PropTypes.object,
    wrapperStyle: PropTypes.object,
    itemWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    status: PropTypes.string,
    iconPrefix: PropTypes.string,
    icon: PropTypes.node,
    adjustMarginRight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    stepNumber: PropTypes.string,
    description: PropTypes.any,
    title: PropTypes.any,
    progressDot: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
    tailContent: PropTypes.any,
    navigation: PropTypes.bool,
    onChange: PropTypes.func,
  };

  onClickItem = (e) => {
    const { stepNumber, onChange = noop, onClick = noop } = this.props;
    onClick(e);
    onChange(Number(stepNumber) - 1);
  };

  render() {
    const {
      className,
      prefixCls,
      style,
      itemWidth,
      status = 'wait',
      iconPrefix,
      icon,
      wrapperStyle,
      adjustMarginRight,
      stepNumber,
      description,
      title,
      progressDot,
      tailContent,
      onChange,
      navigation,
      ...restProps
    } = this.props;

    const classString = classNames(`${prefixCls}-item`, `${prefixCls}-item-${status}`, className, {
      [`${prefixCls}-item-custom`]: icon,
    });
    const stepItemStyle = { ...style };
    if (itemWidth) {
      stepItemStyle.width = itemWidth;
    }
    if (adjustMarginRight) {
      stepItemStyle.marginRight = adjustMarginRight;
    }
    if (onChange) {
      stepItemStyle.cursor = 'pointer';
    }
    return (
      <div {...restProps} className={classString} style={stepItemStyle} ref={ref => {
        this.stepRef = ref;
      }} onClick={this.onClickItem}>
        <div className={`${prefixCls}-item-tail`}>{tailContent}</div>
        <div className={`${prefixCls}-item-icon`}><RenderIcon {...this.props} /></div>
        <div className={`${prefixCls}-item-content`}>
          <div className={`${prefixCls}-item-title`}>
            {title}
            {navigation && <Icon type="navigate_next" className={`${prefixCls}-item-title-icon`} />}
          </div>
          {description && <div className={`${prefixCls}-item-description`}>{description}</div>}
        </div>
      </div>
    );
  }
}
