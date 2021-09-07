import React, { FunctionComponent, useLayoutEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';

export interface RenderedTextProps {
  prefixCls?: string | undefined;
  hidden?: boolean | undefined;
  onContentChange?: ((text: string, width: number, rangeTarget?: 0 | 1) => void) | undefined;
  className?: string | undefined;
  isFlat?: boolean | undefined;
  rangeTarget?: 0 | 1;
}

const RenderedText: FunctionComponent<RenderedTextProps> = ({ prefixCls, children, onContentChange, hidden, className, isFlat, rangeTarget }) => {
  const renderedValueRef = useRef<any>(null);
  const [content, setContent] = useState(null);
  const selfPrefixCls = `${prefixCls}-rendered-value`;
  const style = useMemo(() => isFlat ? {
    width: 'auto',
    maxWidth: 'none',
  } : undefined, [isFlat]);
  useLayoutEffect(() => {
    if (onContentChange) {
      const { current } = renderedValueRef;
      if (current) {
        const { textContent } = current;
        if (textContent !== null && textContent !== content) {
          setContent(textContent);
          onContentChange(textContent, current.scrollWidth, rangeTarget);
        }
      }
    }
  }, [onContentChange, renderedValueRef, content, children, rangeTarget]);
  return (
    <span key="renderedText" className={classNames(selfPrefixCls, className)} hidden={hidden} style={style}>
      <span className={`${selfPrefixCls}-inner`} ref={renderedValueRef}>{children}</span>
    </span>
  );
};

RenderedText.displayName = 'RenderedText';

export default RenderedText;
