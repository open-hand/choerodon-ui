import React, { Children, cloneElement, FunctionComponent, useCallback, useRef } from 'react';
import { findDOMNode } from 'react-dom';
import noop from 'lodash/noop';
import Tooltip, { TooltipProps } from '../tooltip/Tooltip';
import measureTextWidth from '../_util/measureTextWidth';

function renderTitle(props) {
  if (props) {
    const { trigger } = props;
    if (trigger) {
      return Children.map(trigger, (item) => cloneElement<any>(item, { ref: null, className: null }));
    }
  }
}

export interface OverflowTipProps extends TooltipProps {
  strict?: boolean;
  getOverflowContainer?: () => Element | null | undefined;
}

const OverflowTip: FunctionComponent<OverflowTipProps> = (props) => {
  const ref = useRef<Tooltip | null>(null);
  const defaultGetOverflowContainer = useCallback(() => {
    const { current } = ref;
    if (current) {
      return findDOMNode(current) as Element;
    }
  }, [ref]);
  const { children, strict, getOverflowContainer = defaultGetOverflowContainer, onHiddenBeforeChange = noop, title = renderTitle, ...rest } = props;
  const isOverFlow = useCallback((): boolean => {
    const element = getOverflowContainer();
    if (element) {
      const { textContent, ownerDocument } = element;
      if (textContent && ownerDocument) {
        const { clientWidth, scrollWidth } = element;
        if (scrollWidth > clientWidth) {
          return true;
        }
        const { defaultView } = ownerDocument;
        if (defaultView) {
          const computedStyle = defaultView.getComputedStyle(element);
          const { paddingLeft, paddingRight } = computedStyle;
          const pl = paddingLeft ? parseFloat(paddingLeft) : 0;
          const pr = paddingRight ? parseFloat(paddingRight) : 0;
          if (pl || pr) {
            const textWidth = measureTextWidth(textContent, computedStyle);
            const contentWidth = clientWidth - pl - pr;
            return textWidth > contentWidth;
          }
        }
      }
    }
    return false;
  }, [getOverflowContainer]);
  const handleHiddenBeforeChange = useCallback((hidden: boolean): boolean => {
    if (onHiddenBeforeChange(hidden) === false) {
      return false;
    }
    if (hidden) {
      return true;
    }
    return isOverFlow();
  }, [isOverFlow, onHiddenBeforeChange]);

  return (
    <Tooltip
      {...rest}
      title={title}
      onHiddenBeforeChange={strict ? onHiddenBeforeChange : handleHiddenBeforeChange}
      ref={ref}
    >
      {children}
    </Tooltip>
  );
};

OverflowTip.displayName = 'OverflowTip';

export default OverflowTip;
