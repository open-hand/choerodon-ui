import React, { CSSProperties, Key } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import shallowEqual from 'lodash/isEqual';
import noop from 'lodash/noop';
import isElement from 'lodash/isElement';
import Align from 'choerodon-ui/lib/align';
import { getProPrefixCls } from 'choerodon-ui/lib/configure';
import Animate from '../animate';
import ViewComponent, { ViewComponentProps } from '../core/ViewComponent';
import PopupInner from './PopupInner';
import autobind from '../_util/autobind';

/**
 * 记录ID生成器
 */
const PopupKeyGen: IterableIterator<string> = (function* (start: number) {
  while (true) {
    yield `popup-key-${start++}`;
  }
})(1);

export interface PopupProps extends ViewComponentProps {
  align: object;
  onAlign?: (source: Node, align: object, target: Node | Window, translate: { x: number, y: number }) => void;
  getRootDomNode?: () => Node;
  getPopupContainer?: (triggerNode: Element) => HTMLElement;
  transitionName?: string;
  onAnimateAppear?: (key: Key | null) => void;
  onAnimateEnter?: (key: Key | null) => void;
  onAnimateLeave?: (key: Key | null) => void;
  onAnimateEnd?: (key: Key | null, exists: boolean) => void;
  getStyleFromAlign?: (target: Node | Window, align: object) => object | undefined;
  getClassNameFromAlign?: (align: object) => string | undefined;
}

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

  contentRendered: boolean = false;

  popupKey: string = PopupKeyGen.next().value;

  saveRef = align => (this.align = align);

  getOtherProps() {
    const otherProps = omit(super.getOtherProps(), [
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
    ]);
    return otherProps;
  }

  componentWillUnmount() {
    const { popupContainer } = this;
    if (popupContainer && popupContainer !== Popup.popupContainer && popupContainer.parentNode) {
      popupContainer.parentNode.removeChild(popupContainer);
    }
  }

  render() {
    const {
      hidden,
      align,
      transitionName,
      getRootDomNode,
      children,
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
          key="align"
          childrenProps={{ hidden: 'hidden' }}
          align={align}
          onAlign={this.onAlign}
          target={getRootDomNode}
          hidden={hidden}
          monitorWindowResize
        >
          <PopupInner {...omit(this.getMergedProps(), ['ref'])}>{children}</PopupInner>
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
    const doc = window.document;
    const popupContainer = doc.createElement('div');
    popupContainer.className = getProPrefixCls('popup-container');
    const root = doc.body;
    if (getPopupContainer) {
      const mountNode = getPopupContainer(getRootDomNode());
      if (mountNode === root) {
        if (globalContainer) {
          this.popupContainer = globalContainer;
          return globalContainer;
        }
        Popup.popupContainer = popupContainer;
      }
      (isElement(mountNode) ? mountNode : root).appendChild(popupContainer);
      this.popupContainer = popupContainer;
    } else {
      root.appendChild(popupContainer);
      Popup.popupContainer = popupContainer;
    }
    return popupContainer;
  }

  @autobind
  onAlign(source, align, target, translate) {
    const { getClassNameFromAlign = noop, getStyleFromAlign = noop, onAlign = noop } = this.props;
    const currentAlignClassName = getClassNameFromAlign(align);
    if (this.currentAlignClassName !== currentAlignClassName) {
      this.currentAlignClassName = currentAlignClassName;
      source.className = this.getMergedClassNames(currentAlignClassName);
    }
    const currentAlignStyle = getStyleFromAlign(target, align);
    if (!shallowEqual(this.currentAlignStyle, currentAlignStyle)) {
      this.currentAlignStyle = currentAlignStyle;
      Object.assign(source.style, currentAlignStyle);
    }
    onAlign(source, align, target, translate);
  }

  forceAlign() {
    if (this.align) {
      this.align.forceAlign();
    }
  }
}
