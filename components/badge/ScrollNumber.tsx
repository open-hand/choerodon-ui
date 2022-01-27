import React, { createElement, CSSProperties, FunctionComponent, memo, ReactElement, ReactNode, useContext } from 'react';
import classNames from 'classnames';
import { cloneElement } from '../_util/reactNode';
import SingleNumber from './SingleNumber';
import ConfigContext from '../config-provider/ConfigContext';

export interface ScrollNumberProps {
  prefixCls?: string;
  className?: string;
  motionClassName?: string;
  count?: string | number | null;
  children?: ReactElement<HTMLElement>;
  component?: string;
  style?: CSSProperties;
  title?: string | number | null;
  show: boolean;
}

export interface ScrollNumberState {
  animateStarted?: boolean;
  count?: string | number | null;
}

const ScrollNumber: FunctionComponent<ScrollNumberProps> = function ScrollNumber({
  prefixCls: customizePrefixCls,
  count,
  className,
  motionClassName,
  style,
  title,
  show,
  component = 'sup',
  children,
  ...restProps
}) {
  const { getPrefixCls } = useContext(ConfigContext);
  const prefixCls = getPrefixCls('scroll-number', customizePrefixCls);

  // ============================ Render ============================
  const newProps = {
    ...restProps,
    'data-show': show,
    style,
    className: classNames(prefixCls, className, motionClassName),
    title: title as string,
  };

  // Only integer need motion
  let numberNodes: ReactNode = count;
  if (count && Number(count) % 1 === 0) {
    const numberList = String(count).split('');

    numberNodes = numberList.map((num, i) => (
      <SingleNumber
        prefixCls={prefixCls}
        count={Number(count)}
        value={num}
        // eslint-disable-next-line react/no-array-index-key
        key={numberList.length - i}
      />
    ));
  }

  if (style && style.borderColor) {
    newProps.style = {
      ...style,
      boxShadow: `0 0 0 1px ${style.borderColor} inset`,
    };
  }
  if (children) {
    return cloneElement(children, oriProps => ({
      className: classNames(`${prefixCls}-custom-component`, oriProps && oriProps.className, motionClassName),
    }));
  }
  return createElement(component, newProps, numberNodes);
};

ScrollNumber.displayName = 'ScrollNumber';

export default memo(ScrollNumber);
