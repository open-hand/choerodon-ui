import React, { Component, ReactNode } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { getPrefixCls } from '../configure';

export interface AnchorLinkProps {
  prefixCls?: string;
  href: string;
  title: ReactNode;
  children?: any;
}

export default class AnchorLink extends Component<AnchorLinkProps, any> {
  static displayName = 'AnchorLink';
  static defaultProps = {
    href: '#',
  };

  static contextTypes = {
    c7nAnchor: PropTypes.object,
  };

  context: {
    c7nAnchor: any;
  };

  componentDidMount() {
    this.context.c7nAnchor.registerLink(this.props.href);
  }

  componentWillUnmount() {
    this.context.c7nAnchor.unregisterLink(this.props.href);
  }

  handleClick = () => {
    this.context.c7nAnchor.scrollTo(this.props.href);
  };

  render() {
    const {
      prefixCls: customizePrefixCls,
      href,
      title,
      children,
    } = this.props;
    const prefixCls = getPrefixCls('anchor', customizePrefixCls);
    const active = this.context.c7nAnchor.activeLink === href;
    const wrapperClassName = classNames(`${prefixCls}-link`, {
      [`${prefixCls}-link-active`]: active,
    });
    const titleClassName = classNames(`${prefixCls}-link-title`, {
      [`${prefixCls}-link-title-active`]: active,
    });
    return (
      <div className={wrapperClassName}>
        <a
          className={titleClassName}
          href={href}
          title={typeof title === 'string' ? title : ''}
          onClick={this.handleClick}
        >
          {title}
        </a>
        {children}
      </div>
    );
  }
}
