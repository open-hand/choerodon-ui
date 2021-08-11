import React, { FunctionComponent, useLayoutEffect, useRef, useState } from 'react';
import classNames from 'classnames';

export interface RenderedTextProps {
  prefixCls?: string;
  hidden?: boolean;
  onContentChange?: (text: string) => void;
  className?: string;
}

const RenderedText: FunctionComponent<RenderedTextProps> = ({ prefixCls, children, onContentChange, hidden, className }) => {
  const renderedValueRef = useRef<any>(null);
  const [content, setContent] = useState(null);
  const selfPrefixCls = `${prefixCls}-rendered-value`;
  useLayoutEffect(() => {
    if (onContentChange) {
      const { current } = renderedValueRef;
      if (current) {
        const { textContent } = current;
        if (textContent !== null && textContent !== content) {
          setContent(textContent);
          onContentChange(textContent);
        }
      }
    }
  }, [onContentChange, renderedValueRef, content, children]);
  return (
    <span key="renderedText" className={classNames(selfPrefixCls, className)} hidden={hidden}>
      <span className={`${selfPrefixCls}-inner`} ref={renderedValueRef}>{children}</span>
    </span>
  );
};

RenderedText.displayName = 'RenderedText';

export default RenderedText;
