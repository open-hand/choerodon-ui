import React, { FocusEventHandler, FunctionComponent, ReactNode, useEffect, useRef } from 'react';

export interface TextFieldGroupProps {
  prefixCls?: string;
  onBlur?: FocusEventHandler<any>;
  children?: ReactNode;
}

const TextFieldGroup: FunctionComponent<TextFieldGroupProps> = ({ prefixCls, onBlur, children, ...otherProps }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const { current } = ref;
    if (current && onBlur) {
      const handleMousedown = (e) => {
        const { target } = e;
        if (!e.defaultPrevented && !current.contains(target)) {
          onBlur(e);
        }
      };

      document.addEventListener('mousedown', handleMousedown, false);
      return () => {
        document.removeEventListener('mousedown', handleMousedown, false);
      };
    }
  }, [onBlur, ref]);
  return (
    <div ref={ref} className={`${prefixCls}-group-wrapper`} {...otherProps}>
      {children}
    </div>
  );
};

TextFieldGroup.displayName = 'TextFieldGroup';

export default TextFieldGroup;
