import React, { Component, ReactNode } from 'react';
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
    const { c7nAnchor } = this.context;
    const { href } = this.props;
    c7nAnchor.registerLink(href);
  }

  componentDidUpdate({ href: prevHref }: AnchorLinkProps) {
    const { href } = this.props;
    if (prevHref !== href) {
      const { c7nAnchor } = this.context;
      c7nAnchor.unregisterLink(prevHref);
      c7nAnchor.registerLink(href);
    }
  }

  componentWillUnmount() {
    const { c7nAnchor } = this.context;
    const { href } = this.props;
    c7nAnchor.unregisterLink(href);
  }

  handleClick = (e: React.MouseEvent<HTMLElement>) => {
    const {
      c7nAnchor: { scrollTo, onClick },
    } = this.context;
    const { href, title } = this.props;
    if (onClick) {
      onClick(e, { title, href });
    }
    scrollTo(href);
  };

  render() {
    const { c7nAnchor } = this.context;
    const { prefixCls: customizePrefixCls, href, title, children, className } = this.props;
    const prefixCls = getPrefixCls('anchor', customizePrefixCls);
    const active = c7nAnchor.activeLink === href;
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
