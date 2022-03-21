import React, { CSSProperties, ReactElement, ReactNode, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { toArray } from '../../mentions/utils';

export interface EllipsisProps {
  enabledMeasure?: boolean;
  text?: ReactNode;
  width: number;
  rows: number;
  children: (cutChildren: ReactNode[], needEllipsis: boolean) => ReactNode;
  onEllipsis: (isEllipsis: boolean) => void;
}

function cuttable(node: ReactElement) {
  const type = typeof node;
  return type === 'string' || type === 'number';
}

function getNodesLen(nodeList: ReactElement[]) {
  let totalLen = 0;

  nodeList.forEach(node => {
    if (cuttable(node)) {
      totalLen += String(node).length;
    } else {
      totalLen += 1;
    }
  });

  return totalLen;
}

function sliceNodes(nodeList: ReactElement[], len: number) {
  let currLen = 0;
  const currentNodeList: ReactNode[] = [];

  for (let i = 0; i < nodeList.length; i += 1) {
    // 匹配返回
    if (currLen === len) {
      return currentNodeList;
    }

    const node = nodeList[i];
    const canCut = cuttable(node);
    const nodeLen = canCut ? String(node).length : 1;
    const nextLen = currLen + nodeLen;

    // 超过但不是当前的长度，需要削减
    if (nextLen > len) {
      const restLen = len - currLen;
      currentNodeList.push(String(node).slice(0, restLen));
      return currentNodeList;
    }

    currentNodeList.push(node);
    currLen = nextLen;
  }

  return nodeList;
}

const NONE = 0;
const PREPARE = 1;
const WALKING = 2;
const DONE_WITH_ELLIPSIS = 3;
const DONE_WITHOUT_ELLIPSIS = 4;

const Ellipsis = ({ enabledMeasure, children, text, width, rows, onEllipsis }: EllipsisProps) => {
  const [cutLength, setCutLength] = useState<[number, number, number]>([0, 0, 0]);
  const [walkingState, setWalkingState] = useState<
    | typeof NONE
    | typeof PREPARE
    | typeof WALKING
    | typeof DONE_WITH_ELLIPSIS
    | typeof DONE_WITHOUT_ELLIPSIS
  >(NONE);
  const [startLen, midLen, endLen] = cutLength;

  const [singleRowHeight, setSingleRowHeight] = useState(0);

  const singleRowRef = useRef<HTMLSpanElement>(null);
  const midRowRef = useRef<HTMLSpanElement>(null);

  const nodeList = useMemo(() => toArray(text), [text]);
  const totalLen = useMemo(() => getNodesLen(nodeList), [nodeList]);

  const mergedChildren = useMemo(() => {
    if (!enabledMeasure || walkingState !== DONE_WITH_ELLIPSIS) {
      return children(nodeList, false);
    }

    return children(sliceNodes(nodeList, midLen), midLen < totalLen);
  }, [enabledMeasure, walkingState, children, nodeList, midLen, totalLen]);

  // ======================== Walk ========================
  useLayoutEffect(() => {
    if (enabledMeasure && width && totalLen) {
      setWalkingState(PREPARE);
      setCutLength([0, Math.ceil(totalLen / 2), totalLen]);
    }
  }, [enabledMeasure, width, text, totalLen, rows]);

  useLayoutEffect(() => {
    if (walkingState === PREPARE) {
      setSingleRowHeight(singleRowRef.current?.offsetHeight || 0);
    }
  }, [walkingState]);

  useLayoutEffect(() => {
    if (singleRowHeight) {
      if (walkingState === PREPARE) {
        // 忽略位置是否足够
        const midHeight = midRowRef.current?.offsetHeight || 0;
        const maxHeight = rows * singleRowHeight;

        if (midHeight <= maxHeight) {
          setWalkingState(DONE_WITHOUT_ELLIPSIS);
          onEllipsis(false);
        } else {
          setWalkingState(WALKING);
        }
      } else if (walkingState === WALKING) {
        if (startLen !== endLen) {
          const midHeight = midRowRef.current?.offsetHeight || 0;
          const maxHeight = rows * singleRowHeight;

          let nextStartLen = startLen;
          let nextEndLen = endLen;

          // 当等于最后的时候
          if (startLen === endLen - 1) {
            nextEndLen = startLen;
          } else if (midHeight <= maxHeight) {
            nextStartLen = midLen;
          } else {
            nextEndLen = midLen;
          }

          const nextMidLen = Math.ceil((nextStartLen + nextEndLen) / 2);

          setCutLength([nextStartLen, nextMidLen, nextEndLen]);
        } else {
          setWalkingState(DONE_WITH_ELLIPSIS);
          onEllipsis(true);
        }
      }
    }
  }, [walkingState, startLen, endLen, rows, singleRowHeight]);

  // ======================= Render =======================
  const measureStyle: CSSProperties = {
    width,
    whiteSpace: 'normal',
    margin: 0,
    padding: 0,
  };

  const renderMeasure = (
    content: ReactNode,
    ref: React.Ref<HTMLSpanElement>,
    style: CSSProperties,
  ) => (
    <span
      aria-hidden
      ref={ref}
      style={{
        position: 'fixed',
        display: 'block',
        left: 0,
        top: 0,
        zIndex: -9999,
        visibility: 'hidden',
        pointerEvents: 'none',
        ...style,
      }}
    >
      {content}
    </span>
  );

  const renderMeasureSlice = (len: number, ref: React.Ref<HTMLSpanElement>) => {
    const sliceNodeList = sliceNodes(nodeList, len);

    return renderMeasure(children(sliceNodeList, true), ref, measureStyle);
  };

  return (
    <>
      {mergedChildren}
      {enabledMeasure &&
        walkingState !== DONE_WITH_ELLIPSIS &&
        walkingState !== DONE_WITHOUT_ELLIPSIS && (
        <>
          {renderMeasure('lg', singleRowRef, { wordBreak: 'keep-all', whiteSpace: 'nowrap' })}
          {walkingState === PREPARE
            ? renderMeasure(children(nodeList, false), midRowRef, measureStyle)
            : renderMeasureSlice(midLen, midRowRef)}
        </>
      )}
    </>
  );
};

Ellipsis.displayName = 'Ellipsis';

export default Ellipsis;
