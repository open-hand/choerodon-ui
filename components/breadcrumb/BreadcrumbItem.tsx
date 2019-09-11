import React, { Component, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { getPrefixCls } from '../configure';

export interface BreadcrumbItemProps {
  prefixCls?: string;
  separator?: ReactNode;
  href?: string;
}

export default class BreadcrumbItem extends Component<BreadcrumbItemProps, any> {
  static displayName = 'BreadcrumbItem';

  static __ANT_BREADCRUMB_ITEM = true;

  static defaultProps = {
    separator: '/',
  };

  static propTypes = {
    prefixCls: PropTypes.string,
    separator: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    href: PropTypes.string,
  };

  render() {
    const { prefixCls: customizePrefixCls, separator, children, ...restProps } = this.props;
    const prefixCls = getPrefixCls('breadcrumb', customizePrefixCls);
    let link;
    if ('href' in this.props) {
      link = (
        <a className={`${prefixCls}-link`} {...restProps}>
          {children}
        </a>
      );
    } else {
      link = (
        <span className={`${prefixCls}-link`} {...restProps}>
          {children}
        </span>
      );
    }
    if (children) {
      return (
        <span>
          {link}
          <span className={`${prefixCls}-separator`}>{separator}</span>
        </span>
      );
    }
    return null;
  }
}
