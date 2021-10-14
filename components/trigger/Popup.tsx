import React, { CSSProperties, Key } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import omit from 'lodash/omit';
import shallowEqual from 'lodash/isEqual';
import noop from 'lodash/noop';
import isElement from 'lodash/isElement';
import ViewComponent, { ViewComponentProps } from 'choerodon-ui/pro/lib/core/ViewComponent';
import autobind from 'choerodon-ui/pro/lib/_util/autobind';
import { findFocusableElements } from 'choerodon-ui/pro/lib/_util/focusable';
import { getDocument } from 'choerodon-ui/pro/lib/_util/DocumentUtils';
import Align from '../align';
import { getProPrefixCls } from '../configure';
import Animate from '../animate';
import PopupInner from './PopupInner';

/**
 * 记录ID生成器
 */
const PopupKeyGen: IterableIterator<string> = (function* (start: number) {
  while (true) {
    yield `popup-key-${start++}`;
  }
})(1);

const childrenProps = { hidden: 'hidden' };

export interface PopupProps extends ViewComponentProps {
  align: object;
  onAlign?: (source: Node, align: object, target: HTMLElement, translate: { x: number; y: number }) => void;
  getRootDomNode?: () => Element | Text | null;
  getPopupContainer?: (triggerNode: Element) => HTMLElement;
  transitionName?: string;
  onAnimateAppear?: (key: Key | null) => void;
  onAnimateEnter?: (key: Key | null) => void;
  onAnimateLeave?: (key: Key | null) => void;
  onAnimateEnd?: (key: Key | null, exists: boolean) => void;
  getStyleFromAlign?: (target: HTMLElement, align: object) => object | undefined;
  getClassNameFromAlign?: (align: object) => string | undefined;
  getFocusableElements?: (elements: HTMLElement[]) => void;
}

function newPopupContainer() {
  const doc = getDocument(window);
  const popupContainer = doc.createElement('div');
  popupContainer.className = getProPrefixCls('popup-container');
  return popupContainer;
}

@observer
export default class Popup extends ViewComponent<PopupProps> {
  static displayName = 'Popup';

  static popupContainer?: HTMLDivElement;

  static propTypes = {
    align: PropTypes.object,
    onAlign: PropTypes.func,
    getRootDomNode: PropTypes.func,
    getPopupContainer: PropTypes.func,
    transitionName: PropTypes.string,
    onAnimateAppear: PropTypes.func,
    onAnimateEnter: PropTypes.func,
    onAnimateLeave: PropTypes.func,
    onAnimateEnd: PropTypes.func,
    getStyleFromAlign: PropTypes.func,
    getClassNameFromAlign: PropTypes.func,
    ...ViewComponent.propTypes,
  };

  static defaultProps = {
    suffixCls: 'popup',
    transitionName: 'zoom',
  };

  popupContainer?: HTMLDivElement;

  currentAlignClassName?: string;

  currentAlignStyle?: CSSProperties;

  align: Align | null;

  target?: HTMLElement;

  contentRendered = false;

  popupKey: string = PopupKeyGen.next().value;

  saveRef = align => (this.align = align);

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'align',
      'transitionName',
      'getRootDomNode',
      'getPopupContainer',
      'getClassNameFromAlign',
      'getStyleFromAlign',
      'onAlign',
      'onAnimateAppear',
      'onAnimateEnter',
      'onAnimateLeave',
      'onAnimateEnd',
      'getFocusableElements',
    ]);
  }

  componentWillUnmount() {
    const { popupContainer } = this;
    if (popupContainer && popupContainer !== Popup.popupContainer && popupContainer.parentNode) {
      popupContainer.parentNode.removeChild(popupContainer);
    }
  }

  componentDidUpdate(): void {
    this.findFocusableElements();
  }

  componentDidMount(): void {
    super.componentDidMount();
    this.findFocusableElements();
  }

  findFocusableElements() {
    const { element } = this;
    const { getFocusableElements } = this.props;
    if (element && getFocusableElements) {
      const elements = findFocusableElements(element);
      getFocusableElements(elements && elements.filter(item => item.tabIndex !== -1).sort((e1, e2) => e1.tabIndex - e2.tabIndex));
    }
  }

  @autobind
  renderInner(innerRef) {
    const { children, getClassNameFromAlign = noop, align } = this.props;
    const className = this.getMergedClassNames(this.currentAlignClassName ||
      getClassNameFromAlign(align));
    return (
      <PopupInner {...omit(this.getMergedProps(), ['ref', 'className'])} className={className} innerRef={innerRef}>{children}</PopupInner>
    );
  }

  render() {
    const {
      hidden,
      align,
      transitionName,
      getRootDomNode,
      onAnimateAppear = noop,
      onAnimateEnter = noop,
      onAnimateLeave = noop,
      onAnimateEnd = noop,
    } = this.props;
    if (!hidden) {
      this.contentRendered = true;
    }
    const container = this.getContainer();
    return container && this.contentRendered ? createPortal(
      <Animate
        component=""
        exclusive
        transitionAppear
        transitionName={transitionName}
        hiddenProp="hidden"
        onAppear={onAnimateAppear}
        onEnter={onAnimateEnter}
        onLeave={onAnimateLeave}
        onEnd={onAnimateEnd}
      >
        <Align
          ref={this.saveRef}
          childrenRef={this.elementReference}
          key="align"
          childrenProps={childrenProps}
          align={align}
          onAlign={this.onAlign}
          target={getRootDomNode}
          hidden={hidden}
          monitorWindowResize
        >
          {this.renderInner}
        </Align>
      </Animate>,
      container,
      this.popupKey,
    ) : null;
  }

  getContainer(): HTMLDivElement | undefined {
    if (typeof window === 'undefined') {
      return undefined;
    }
    const { getPopupContainer, getRootDomNode = noop } = this.props;
    const globalContainer = Popup.popupContainer;
    if (getPopupContainer) {
      const container = this.popupContainer;
      if (container) {
        return container;
      }
    } else if (globalContainer) {
      return globalContainer;
    }
    if (getPopupContainer) {
      const mountNode = getPopupContainer(getRootDomNode());
      const popupContainer = newPopupContainer();
      const root = window.document.body;
      if (mountNode === root) {
        if (globalContainer) {
          this.popupContainer = globalContainer;
          return globalContainer;
        }
        Popup.popupContainer = popupContainer;
      }
      (isElement(mountNode) ? mountNode : root).appendChild(popupContainer);
      this.popupContainer = popupContainer;
      return popupContainer;
    }
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return getGlobalPopupContainer();
  }

  @autobind
  onAlign(source, align, target, translate) {
    const { getClassNameFromAlign = noop, getStyleFromAlign = noop, onAlign = noop } = this.props;
    const currentAlignClassName = getClassNameFromAlign(align);
    const differentTarget = target !== this.target;
    if (differentTarget || this.currentAlignClassName !== currentAlignClassName) {
      this.currentAlignClassName = currentAlignClassName;
      source.className = this.getMergedClassNames(currentAlignClassName);
    }
    const currentAlignStyle = getStyleFromAlign(target, align);
    if (differentTarget || !shallowEqual(this.currentAlignStyle, currentAlignStyle)) {
      this.currentAlignStyle = currentAlignStyle;
      Object.assign(source.style, currentAlignStyle);
    }
    onAlign(source, align, target, translate);
    this.target = source;
  }

  forceAlign() {
    if (this.align) {
      this.align.forceAlign();
    }
  }
}

export function getGlobalPopupContainer() {
  if (Popup.popupContainer) {
    return Popup.popupContainer;
  }
  const popupContainer = newPopupContainer();
  const root = getDocument(window).body;
  root.appendChild(popupContainer);
  Popup.popupContainer = popupContainer;
  return popupContainer;
}
