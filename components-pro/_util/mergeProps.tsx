import { CSSProperties } from 'react';
import classNames from 'classnames';

interface MergeProps {
  style?: CSSProperties | undefined,
  className?: string | undefined;

  [key: string]: any;
}

function mergeStyle(style: CSSProperties | undefined, newStyle: CSSProperties | undefined) {
  if (!style) {
    return newStyle;
  }
  if (newStyle) {
    return {
      ...style,
      ...newStyle,
    };
  }
  return style;
}

function mergeClassNameAndStyle<P extends MergeProps>(props: Partial<P> | undefined, newProps: Partial<P> | undefined): Partial<P> | undefined {
  if (!props) {
    return newProps;
  }
  if (newProps) {
    const style: CSSProperties | undefined = mergeStyle(props.style, newProps.style);
    const className: string | undefined = classNames(props.className, newProps.className);
    if (style || className) {
      return {
        style,
        className,
      } as P;
    }
    return undefined;
  }
  return props;
}

export default function mergeProps<P extends MergeProps>(props: Partial<P> | undefined, newProps: Partial<P> | undefined): Partial<P> | undefined {
  if (!props) {
    return newProps;
  }
  if (newProps) {
    return {
      ...props,
      ...newProps,
      ...mergeClassNameAndStyle<P>(props, newProps),
    };
  }
  return props;
}
