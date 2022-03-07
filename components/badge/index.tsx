import React, { CSSProperties, FunctionComponent, memo, ReactNode, useContext, useMemo, useRef } from 'react';
import classNames from 'classnames';
import defaultTo from 'lodash/defaultTo';
import ScrollNumber from './ScrollNumber';
import { isPresetColor, PresetColorType, PresetStatusColorType } from '../_util/colors';
import { LiteralUnion } from '../_util/type';
import { cloneElement } from '../_util/reactNode';
import ConfigContext from '../config-provider/ConfigContext';
import Animate from '../animate';

export { ScrollNumberProps } from './ScrollNumber';

export interface BadgeProps {
  /** Number to show in badge */
  count?: ReactNode;
  showZero?: boolean;
  /** Max count to show */
  overflowCount?: number;
  /** Whether to show red dot without number */
  dot?: boolean;
  style?: CSSProperties;
  prefixCls?: string;
  scrollNumberPrefixCls?: string;
  className?: string;
  status?: PresetStatusColorType;
  color?: LiteralUnion<PresetColorType, string>;
  text?: ReactNode;
  size?: 'default' | 'small';
  offset?: [number | string, number | string];
  title?: string;
  children?: ReactNode;
}

const Badge: FunctionComponent<BadgeProps> = function Badge({
  prefixCls: customizePrefixCls,
  scrollNumberPrefixCls: customizeScrollNumberPrefixCls,
  children,
  status,
  text,
  color,
  count = null,
  overflowCount = 99,
  dot = false,
  size = 'default',
  title,
  offset,
  style,
  className,
  showZero = false,
  ...restProps
}) {
  const { getPrefixCls } = useContext(ConfigContext);
  const prefixCls = getPrefixCls('badge', customizePrefixCls);
  const scrollNumberPrefixCls = getPrefixCls(
    'scroll-number',
    customizeScrollNumberPrefixCls,
  );
  // ================================ Misc ================================
  const numberedDisplayCount = (
    (count as number) > (overflowCount as number) ? `${overflowCount}+` : count
  ) as string | number | null;

  const hasStatus =
    (status !== null && status !== undefined) || (color !== null && color !== undefined);

  const isZero = numberedDisplayCount === '0' || numberedDisplayCount === 0;

  const showAsDot = dot && !isZero;

  const mergedCount = showAsDot ? '' : numberedDisplayCount;

  const isHidden = useMemo(() => {
    const isEmpty = mergedCount === null || mergedCount === undefined || mergedCount === '';
    return (isEmpty || (isZero && !showZero)) && !showAsDot;
  }, [mergedCount, isZero, showZero, showAsDot]);

  // Count should be cache in case hidden change it
  const countRef = useRef(count);
  if (!isHidden) {
    countRef.current = count;
  }
  const livingCount = countRef.current;

  // We need cache count since remove motion should not change count display
  const displayCountRef = useRef(mergedCount);
  if (!isHidden) {
    displayCountRef.current = mergedCount;
  }
  const displayCount = displayCountRef.current;

  // We will cache the dot status to avoid shaking on leaved motion
  const isDotRef = useRef(showAsDot);
  if (!isHidden) {
    isDotRef.current = showAsDot;
  }

  const isDot = isDotRef.current;

  // =============================== Styles ===============================
  const mergedStyle = useMemo<CSSProperties>(() => {
    if (!offset) {
      return { ...style };
    }

    const offsetStyle: CSSProperties = {
      marginTop: offset[0],
      marginLeft: offset[1],
    };

    return {
      ...offsetStyle,
      ...style,
    };
  }, [offset, style]);

  // =============================== Render ===============================
  // >>> Title
  const titleNode = defaultTo(title, typeof livingCount === 'string' || typeof livingCount === 'number' ? livingCount : undefined);

  // >>> Status Text
  const statusTextNode =
    isHidden || !text ? null : <span className={`${prefixCls}-status-text`}>{text}</span>;

  // >>> Display Component
  const displayNode =
    !livingCount || typeof livingCount !== 'object'
      ? undefined
      : cloneElement(livingCount, oriProps => ({
        style: {
          ...mergedStyle,
          ...oriProps.style,
        },
      }));

  // Shared styles
  const statusCls = classNames({
    [`${prefixCls}-status-dot`]: hasStatus,
    [`${prefixCls}-status-${status}`]: !!status,
    [`${prefixCls}-status-${color}`]: isPresetColor(color),
  });

  const scrollNumberCls = classNames({
    [`${prefixCls}-dot`]: isDot,
    [`${prefixCls}-count`]: !isDot,
    [`${prefixCls}-count-sm`]: size === 'small',
    [`${prefixCls}-multiple-words`]: !isDot && displayCount && displayCount.toString().length > 1,
    [`${prefixCls}-status-${status}`]: !!status,
    [`${prefixCls}-status-${color}`]: isPresetColor(color),
  });

  const badgeClassName = classNames(
    prefixCls,
    {
      [`${prefixCls}-status`]: hasStatus,
      [`${prefixCls}-not-a-wrapper`]: !children,
    },
    className,
  );

  const statusStyle: CSSProperties = {};
  if (color && !isPresetColor(color)) {
    statusStyle.background = color;
  }

  if (!children && hasStatus) {
    const statusTextColor = mergedStyle.color;
    return (
      <span {...restProps} className={badgeClassName} style={mergedStyle}>
        <span className={statusCls} style={statusStyle} />
        <span style={{ color: statusTextColor }} className={`${prefixCls}-status-text`}>
          {text}
        </span>
      </span>
    );
  }

  let scrollNumberStyle: CSSProperties = { ...mergedStyle };
  if (color && !isPresetColor(color)) {
    scrollNumberStyle = scrollNumberStyle || {};
    scrollNumberStyle.background = color;
  }
  const scrollNumber = isHidden ? null : (
    <ScrollNumber
      prefixCls={scrollNumberPrefixCls}
      hidden={isHidden}
      className={scrollNumberCls}
      count={displayCount}
      title={titleNode}
      style={scrollNumberStyle}
      key="scrollNumber"
    >
      {displayNode}
    </ScrollNumber>
  );

  return (
    <span {...restProps} className={badgeClassName}>
      {children}
      <Animate
        component=""
        hiddenProp="hidden"
        transitionName={children ? `${prefixCls}-zoom` : ''}
        transitionAppear
      >
        {scrollNumber};
      </Animate>
      {statusTextNode}
    </span>
  );
};

Badge.displayName = 'Badge';

export default memo(Badge);
