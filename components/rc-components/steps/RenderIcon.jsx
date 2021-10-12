import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

function isString(str) {
    return typeof str === 'string';
  }

export default class RenderIcon extends Component {
    static propTypes = {
        prefixCls: PropTypes.string,
        status: PropTypes.string,
        iconPrefix: PropTypes.string,
        icon: PropTypes.node,
        stepNumber: PropTypes.string,
        description: PropTypes.any,
        title: PropTypes.any,
        progressDot: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
    };

    render() {
        const {
            prefixCls,
            progressDot,
            stepNumber,
            status,
            title,
            description,
            icon,
            iconPrefix,
        } = this.props;
        let iconNode;
        const iconClassName = classNames(`${iconPrefix}`, {
            [`${iconPrefix}-${icon}`]: icon && isString(icon),
            [`${iconPrefix}-check`]: !icon && status === 'finish',
            [`${iconPrefix}-close`]: !icon && status === 'error',
        });
        const iconDot = <span className={`${prefixCls}-icon-dot`}></span>;
        if (progressDot) {
            if (typeof progressDot === 'function') {
                iconNode = (
                    <span className={`${prefixCls}-icon`}>
                        {progressDot(iconDot, { index: stepNumber - 1, status, title, description })}
                    </span>
                );
            } else {
                iconNode = <span className={`${prefixCls}-icon`}>{iconDot}</span>;
            }
        } else if (icon && !isString(icon)) {
            iconNode = <span className={`${prefixCls}-icon`}>{icon}</span>;
        } else if (icon || status === 'finish' || status === 'error') {
            iconNode = <span className={iconClassName} />;
        } else {
            iconNode = <span className={`${prefixCls}-icon`}>{stepNumber}</span>;
        }
        return iconNode;
    }
}