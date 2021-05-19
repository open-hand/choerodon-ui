import React, { FunctionComponent, useCallback, useRef } from 'react';
import { findDOMNode } from 'react-dom';
import noop from 'lodash/noop';
import Tooltip, { TooltipProps } from '../tooltip/Tooltip';

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
  const { children, strict, getOverflowContainer = defaultGetOverflowContainer, onHiddenBeforeChange = noop, ...rest } = props;
  const isOverFlow = useCallback((): boolean => {
    const element = getOverflowContainer();
    if (element && element.textContent) {
      const { clientWidth, scrollWidth } = element;
      return scrollWidth > clientWidth;
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
      onHiddenBeforeChange={strict ? onHiddenBeforeChange : handleHiddenBeforeChange}
      ref={ref}
    >
      {children}
    </Tooltip>
  );
};

OverflowTip.displayName = 'OverflowTip';

export default OverflowTip;
