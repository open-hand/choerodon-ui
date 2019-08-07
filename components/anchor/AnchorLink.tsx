import React, { Component, MouseEvent, ReactNode } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { C7NAnchor } from './Anchor';
import { getPrefixCls } from '../configure';

export interface AnchorLinkProps {
  prefixCls?: string;
  href: string;
  title: ReactNode;
  children?: any;
  className?: string;
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
    c7nAnchor: C7NAnchor;
  };

  componentDidMount() {
    this.context.c7nAnchor.registerLink(this.props.href);
  }

  componentDidUpdate({ href: prevHref }: AnchorLinkProps) {
    const { href } = this.props;
    if (prevHref !== href) {
      this.context.c7nAnchor.unregisterLink(prevHref);
      this.context.c7nAnchor.registerLink(href);
    }
  }

  componentWillUnmount() {
    this.context.c7nAnchor.unregisterLink(this.props.href);
  }

  handleClick = (e: MouseEvent<HTMLElement>) => {
    const { scrollTo, onClick } = this.context.c7nAnchor;
    const { href, title } = this.props;
    if (onClick) {
      onClick(e, { title, href });
    }
    scrollTo(href);
  };

  render() {
    const { prefixCls: customizePrefixCls, href, title, children, className } = this.props;
    const prefixCls = getPrefixCls('anchor', customizePrefixCls);
    const active = this.context.c7nAnchor.activeLink === href;
    const wrapperClassName = classNames(className, `${prefixCls}-link`, {
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
