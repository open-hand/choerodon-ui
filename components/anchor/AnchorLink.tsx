import React, { Component, ReactNode } from 'react';
import classNames from 'classnames';
import AnchorContext, { AnchorContextValue } from './AnchorContext';

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

  static get contextType(): typeof AnchorContext {
    return AnchorContext;
  }

  context: AnchorContextValue;

  componentDidMount() {
    const { c7nAnchor } = this.context;
    if (c7nAnchor) {
      const { href } = this.props;
      c7nAnchor.registerLink(href);
    }
  }

  componentDidUpdate({ href: prevHref }: AnchorLinkProps) {
    const { href } = this.props;
    if (prevHref !== href) {
      const { c7nAnchor } = this.context;
      if (c7nAnchor) {
        c7nAnchor.unregisterLink(prevHref);
        c7nAnchor.registerLink(href);
      }
    }
  }

  componentWillUnmount() {
    const { c7nAnchor } = this.context;
    const { href } = this.props;
    if (c7nAnchor) {
      c7nAnchor.unregisterLink(href);
    }
  }

  handleClick = (e: React.MouseEvent<HTMLElement>) => {
    const { c7nAnchor } = this.context;
    if (c7nAnchor) {
      const { scrollTo, onClick } = c7nAnchor;
      const { href, title } = this.props;
      if (onClick) {
        onClick(e, { title, href });
      }
      scrollTo(href);
    }
  };

  render() {
    const { c7nAnchor, getPrefixCls } = this.context;
    const { prefixCls: customizePrefixCls, href, title, children, className } = this.props;
    const prefixCls = getPrefixCls('anchor', customizePrefixCls);
    const active = c7nAnchor && c7nAnchor.activeLink === href;
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
