import React, { Component, CSSProperties, MouseEvent, ReactNode } from 'react';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';
import addEventListener from '../_util/addEventListener';
import Affix from '../affix';
import AnchorLink from './AnchorLink';
import scrollTo from '../_util/scrollTo';
import getScroll from '../_util/getScroll';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';
import { AnchorContextProvider } from './AnchorContext';

function getDefaultContainer() {
  return window;
}

function getOffsetTop(element: HTMLElement, container: AnchorContainer): number {
  if (!element) {
    return 0;
  }

  if (!element.getClientRects().length) {
    return 0;
  }

  const rect = element.getBoundingClientRect();

  if (rect.width || rect.height) {
    if (container === window && element.ownerDocument) {
      container = element.ownerDocument.documentElement;
      return rect.top - container.clientTop;
    }
    return rect.top - (container as HTMLElement).getBoundingClientRect().top;
  }

  return rect.top;
}

const sharpMatcherRegx = /#([^#]+)$/;

type Section = {
  link: string;
  top: number;
};

export type AnchorContainer = HTMLElement | Window;

export interface AnchorProps {
  prefixCls?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  offsetTop?: number;
  bounds?: number;
  affix?: boolean;
  showInkInFixed?: boolean;
  getContainer?: () => AnchorContainer;
  /** Return customize highlight anchor */
  getCurrentAnchor?: () => string;
  onClick?: (e: MouseEvent<HTMLElement>, link: { title: ReactNode; href: string }) => void;
  targetOffset?: number;
}

export interface AnchorState {
  activeLink: null | string;
}

export interface AnchorDefaultProps extends AnchorProps {
  prefixCls: string;
  affix: boolean;
  showInkInFixed: boolean;
  getContainer: () => AnchorContainer;
}

export interface C7NAnchor {
  registerLink: (link: string) => void;
  unregisterLink: (link: string) => void;
  activeLink: string | null;
  scrollTo: (link: string) => void;
  onClick?: ((
    e: React.MouseEvent<HTMLElement>,
    link: { title: React.ReactNode; href: string },
  ) => void) | undefined;
}

export default class Anchor extends Component<AnchorProps, AnchorState> {
  static displayName = 'Anchor';

  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static Link: typeof AnchorLink;

  static defaultProps = {
    affix: true,
    showInkInFixed: false,
    getContainer: getDefaultContainer,
  };

  context: ConfigContextValue;

  state = {
    activeLink: null,
  };

  private inkNode: HTMLSpanElement;

  // scroll scope's container
  private scrollContainer: HTMLElement | Window;

  private links: string[] = [];

  private scrollEvent: any;

  private animating: boolean;

  getContextValue() {
    const { onClick } = this.props;
    const { activeLink } = this.state;
    const c7nAnchor: C7NAnchor = {
      registerLink: (link: string) => {
        if (!this.links.includes(link)) {
          this.links.push(link);
        }
      },
      unregisterLink: (link: string) => {
        const index = this.links.indexOf(link);
        if (index !== -1) {
          this.links.splice(index, 1);
        }
      },
      activeLink,
      scrollTo: this.handleScrollTo,
      onClick,
    };
    return { c7nAnchor };
  }

  componentDidMount() {
    const { getContainer } = this.props as AnchorDefaultProps;
    this.scrollContainer = getContainer();
    this.scrollEvent = addEventListener(this.scrollContainer, 'scroll', this.handleScroll);
    this.handleScroll();
  }

  componentDidUpdate() {
    if (this.scrollEvent) {
      const { getContainer } = this.props as AnchorDefaultProps;
      const currentContainer = getContainer();
      if (this.scrollContainer !== currentContainer) {
        this.scrollContainer = currentContainer;
        this.scrollEvent.remove();
        this.scrollEvent = addEventListener(this.scrollContainer, 'scroll', this.handleScroll);
        this.handleScroll();
      }
    }
    this.updateInk();
  }

  componentWillUnmount() {
    if (this.scrollEvent) {
      this.scrollEvent.remove();
    }
  }

  getCurrentAnchor(offsetTop = 0, bounds = 5): string {
    const { getCurrentAnchor } = this.props;

    if (typeof getCurrentAnchor === 'function') {
      return getCurrentAnchor();
    }

    const activeLink = '';
    if (typeof document === 'undefined') {
      return activeLink;
    }

    const linkSections: Array<Section> = [];
    const { getContainer } = this.props as AnchorDefaultProps;
    const container = getContainer();
    this.links.forEach(link => {
      const sharpLinkMatch = sharpMatcherRegx.exec(link.toString());
      if (!sharpLinkMatch) {
        return;
      }
      const target = document.getElementById(sharpLinkMatch[1]);
      if (target) {
        const top = getOffsetTop(target, container);
        if (top < offsetTop + bounds) {
          linkSections.push({
            link,
            top,
          });
        }
      }
    });

    if (linkSections.length) {
      const maxSection = linkSections.reduce((prev, curr) => (curr.top > prev.top ? curr : prev));
      return maxSection.link;
    }
    return '';
  }

  handleScrollTo = (link: string) => {
    const { offsetTop, getContainer, targetOffset } = this.props as AnchorDefaultProps;

    this.setState({ activeLink: link });
    const container = getContainer();
    const scrollTop = getScroll(container, true);
    const sharpLinkMatch = sharpMatcherRegx.exec(link);
    if (!sharpLinkMatch) {
      return;
    }
    const targetElement = document.getElementById(sharpLinkMatch[1]);
    if (!targetElement) {
      return;
    }

    const eleOffsetTop = getOffsetTop(targetElement, container);
    let y = scrollTop + eleOffsetTop;
    y -= targetOffset !== undefined ? targetOffset : offsetTop || 0;
    this.animating = true;

    scrollTo(y, {
      callback: () => {
        this.animating = false;
      },
      getContainer,
    });
  };

  saveInkNode = (node: HTMLSpanElement) => {
    this.inkNode = node;
  };

  handleScroll = () => {
    if (this.animating) {
      return;
    }
    const { activeLink } = this.state;
    const { offsetTop, bounds, targetOffset } = this.props;
    const currentActiveLink = this.getCurrentAnchor(
      targetOffset !== undefined ? targetOffset : offsetTop || 0,
      bounds,
    );
    if (activeLink !== currentActiveLink) {
      this.setState({
        activeLink: currentActiveLink,
      });
    }
  };

  updateInk = () => {
    if (typeof document === 'undefined') {
      return;
    }
    const prefixCls = this.getPrefixCls();
    const linkNode = (findDOMNode(this as any) as HTMLElement).getElementsByClassName(
      `${prefixCls}-link-title-active`,
    )[0] as HTMLElement | undefined;
    if (linkNode && linkNode.offsetParent) {
      this.inkNode.style.top = `${(linkNode as any).offsetTop + linkNode.clientHeight / 2 - 4.5}px`;
    }
  };

  getPrefixCls() {
    const { prefixCls } = this.props;
    const { getPrefixCls } = this.context;
    return getPrefixCls('anchor', prefixCls);
  }

  render() {
    const {
      className = '',
      style,
      offsetTop,
      affix,
      showInkInFixed,
      children,
      getContainer,
    } = this.props;
    const { activeLink } = this.state;
    const { getPrefixCls } = this.context;
    const prefixCls = this.getPrefixCls();
    const inkClass = classNames(`${prefixCls}-ink-ball`, {
      visible: activeLink,
    });

    const wrapperClass = classNames(className, `${prefixCls}-wrapper`);

    const anchorClass = classNames(prefixCls, {
      fixed: !affix && !showInkInFixed,
    });

    const wrapperStyle = {
      maxHeight: offsetTop ? `calc(100vh - ${offsetTop}px)` : '100vh',
      ...style,
    };

    const anchorContent = (
      <div className={wrapperClass} style={wrapperStyle}>
        <div className={anchorClass}>
          <div className={`${prefixCls}-ink`}>
            <span className={inkClass} ref={this.saveInkNode} />
          </div>
          <AnchorContextProvider {...this.getContextValue()} getPrefixCls={getPrefixCls}>
            {children}
          </AnchorContextProvider>
        </div>
      </div>
    );

    return !affix ? (
      anchorContent
    ) : (
      <Affix offsetTop={offsetTop} target={getContainer}>
        {anchorContent}
      </Affix>
    );
  }
}
