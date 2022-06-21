import React, {
  cloneElement,
  CSSProperties,
  forwardRef,
  ForwardRefExoticComponent,
  Key,
  memo,
  MutableRefObject,
  PropsWithoutRef,
  ReactElement,
  RefAttributes,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { ListRef } from 'rc-virtual-list';
import isNil from 'lodash/isNil';
import { FlattenNode } from './interface';
import { MotionTreeNodeProps } from './MotionTreeNode';

export interface ListProps {
  data: FlattenNode[];
  prefixCls: string;
  children: (item: FlattenNode) => ReactElement<MotionTreeNodeProps>;
  height?: number;
  itemKey: (item: FlattenNode) => Key;
  ref?: MutableRefObject<ListRef> | null;
}

const List: ForwardRefExoticComponent<PropsWithoutRef<ListProps> & RefAttributes<ListRef>> = forwardRef<ListRef, ListProps>(({
  data,
  prefixCls,
  children,
  height,
  itemKey,
}, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const innerStyle = useMemo(() => {
    const style: CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
    };
    if (height) {
      style.height = height;
      style.overflow = 'hidden auto';
    }
    return style;
  }, [height]);
  const getKey = useCallback(function (item) {
    if (typeof itemKey === 'function') {
      return itemKey(item);
    }

    return isNil(itemKey) ? undefined : item[itemKey];
  }, [itemKey]);
  const renderChild = useCallback(child => cloneElement<MotionTreeNodeProps>(children(child), { key: getKey(child) }), [children, getKey]);
  const scrollTo = useCallback((scroll) => {
    const { current } = containerRef;
    if (current) {
      if (current.scrollTo) {
        current.scrollTo(0, scroll);
      } else {
        current.scrollTop = scroll;
      }
    }
  }, [containerRef]);

  useImperativeHandle(ref, () => ({
    scrollTo,
  }), [scrollTo]);

  return (
    <div className={`${prefixCls}-holder`}>
      <div className={`${prefixCls}-holder-inner`} style={innerStyle} ref={containerRef}>
        {data.map(renderChild)}
      </div>
    </div>
  );
});

export default memo(List);
