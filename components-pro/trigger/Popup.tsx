import React, { CSSProperties, Key } from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import shallowEqual from 'lodash/isEqual';
import noop from 'lodash/noop';
import isElement from 'lodash/isElement';
import ClassNames from 'classnames';
import Align from 'choerodon-ui/lib/align';
import Portal from 'choerodon-ui/lib/rc-components/util/Portal';
import { getProPrefixCls } from 'choerodon-ui/lib/configure';
import Animate from '../animate';
import ViewComponent, { ViewComponentProps } from '../core/ViewComponent';
import PopupInner from './PopupInner';
import autobind from '../_util/autobind';

let popupContainer;

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

    return this.contentRendered ? (
      <Portal
        key={this.popupKey}
        getContainer={this.getContainer}
      >
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
        </Animate>
      </Portal>
    ) : null;
  }


  @autobind
  getContainer() {
    const { getPopupContainer, getRootDomNode = noop } = this.props;
    if (typeof window !== 'undefined') {
      const doc = window.document;
      popupContainer = doc.createElement('div');
      popupContainer.className = ClassNames(getProPrefixCls('popup-container'));
      const mountNode = getPopupContainer ? getPopupContainer(getRootDomNode()) : doc.body;
      if (isElement(mountNode)) {
        mountNode.appendChild(popupContainer);
      } else {
        doc.body.appendChild(popupContainer);
      }
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
