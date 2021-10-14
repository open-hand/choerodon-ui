import React, { ForwardRefExoticComponent, PropsWithoutRef, RefAttributes } from 'react';
import classNames from 'classnames';
import { svgBaseProps, useInsertStyles, warning } from './utils';

export interface IconBaseProps extends React.HTMLProps<HTMLSpanElement> {
  spin?: boolean;
  rotate?: number;
}

export interface CustomIconComponentProps {
  width: string | number;
  height: string | number;
  fill: string;
  viewBox?: string | undefined;
  className?: string;
  style?: React.CSSProperties | undefined;
}

export interface IconComponentProps extends IconBaseProps {
  viewBox?: string | undefined;
  component?: React.ComponentType<CustomIconComponentProps | React.SVGProps<SVGSVGElement>>;
  ariaLabel?: React.AriaAttributes['aria-label'];
}

export interface IIcon extends ForwardRefExoticComponent<PropsWithoutRef<IconComponentProps> & RefAttributes<HTMLSpanElement>> {
  __C7N_ICON?: boolean;
}

const Icon: IIcon = React.forwardRef<HTMLSpanElement, IconComponentProps>((props, ref) => {
  const {
    // affect outter <i>...</i>
    className,

    // affect inner <svg>...</svg>
    component: Component,
    viewBox,
    spin,
    rotate,
    tabIndex,
    onClick,

    // children
    children,
    ...restProps
  } = props;

  const { height, width } = restProps;

  warning(
    Boolean(Component || children),
    'Should have `component` prop or `children`.',
  );

  useInsertStyles();

  const classString = classNames(
    'c7nicon',
    className,
  );

  const svgClassString = classNames({
    'c7nicon-spin': !!spin,
  });

  const svgStyle: React.CSSProperties | undefined = rotate
    ? {
      msTransform: `rotate(${rotate}deg)`,
      transform: `rotate(${rotate}deg)`,
    }
    : undefined;

  const innerSvgProps: CustomIconComponentProps & {
    'aria-hidden': boolean | 'false' | 'true';
    focusable: boolean | 'auto' | 'false' | 'true';
  } = {
    ...svgBaseProps,
    className: svgClassString,
    style: svgStyle,
    viewBox,
    height: height || svgBaseProps.height,
    width: width || svgBaseProps.width,
  };

  if (!viewBox) {
    delete innerSvgProps.viewBox;
  }

  // component > children
  const renderInnerNode = () => {
    if (Component) {
      return <Component {...innerSvgProps}>{children}</Component>;
    }

    if (children) {
      warning(
        Boolean(viewBox) ||
        (React.Children.count(children) === 1 &&
          React.isValidElement(children) &&
          React.Children.only(children).type === 'use'),
        'Make sure that you provide correct `viewBox`' +
        ' prop (default `0 0 1024 1024`) to the icon.',
      );

      return (
        <svg {...innerSvgProps} viewBox={viewBox}>
          {children}
        </svg>
      );
    }

    return null;
  };

  let iconTabIndex = tabIndex;
  if (iconTabIndex === undefined && onClick) {
    iconTabIndex = -1;
  }

  return (
    <span
      role="img"
      {...restProps}
      ref={ref}
      tabIndex={iconTabIndex}
      onClick={onClick}
      className={classString}
    >
      {renderInnerNode()}
    </span>
  );
});

Icon.displayName = 'SvgIcon';

Icon.__C7N_ICON = true;

export default Icon;
