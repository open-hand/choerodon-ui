import React, { ForwardRefExoticComponent, PropsWithoutRef, RefAttributes } from 'react';
import classNames from 'classnames';
import { composeRef } from 'rc-util/lib/ref';
import devWarning from 'rc-util/lib/warning';
import ConfigContext from 'choerodon-ui/lib/config-provider/ConfigContext';

export interface TypographyProps {
  id?: string;
  prefixCls?: string;
  suffixCls?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  component?: string;
  setContentRef?: (node: HTMLElement) => void;
  ['aria-label']?: string;
}

export interface ITypographyProps extends ForwardRefExoticComponent<PropsWithoutRef<TypographyProps> & RefAttributes<HTMLElement>> {
  __PRO_TYPOGRAPHY?: boolean;
}
 
const Typography: ITypographyProps = React.forwardRef<HTMLElement, TypographyProps>((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    component,
    className,
    'aria-label': ariaLabel,
    setContentRef,
    children,
    ...restProps
  } = props;
  const { getPrefixCls } = React.useContext(ConfigContext);

  let mergedRef = ref;
  if (setContentRef) {
    devWarning(false, `[c7n: Typography] setContentRef is deprecated. Please use ref instead.`);
    mergedRef = composeRef(ref, setContentRef);
  }

  const Component = component as any;
  const prefixCls = getPrefixCls('pro-typography', customizePrefixCls);
  const componentClassName = classNames(
    prefixCls,
    className,
  );
  return (
    <Component className={componentClassName} aria-label={ariaLabel} ref={mergedRef} {...restProps}>
      {children}
    </Component>
  );
});

Typography.__PRO_TYPOGRAPHY = true;

Typography.displayName = 'Typography';

Typography.defaultProps = {
  component: 'article',
};

export default Typography;
