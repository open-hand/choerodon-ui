import React, { FunctionComponent, useCallback, useContext, useEffect, useMemo, useRef, useState, WheelEvent } from 'react';
import throttle from 'lodash/throttle';
import isString from 'lodash/isString';
import ConfigContext from 'choerodon-ui/lib/config-provider/ConfigContext';
import Button from '../button/Button';
import { FuncType } from '../button/enum';
import Picture, { PictureForwardRef, PictureRef } from './Picture';
import { ModalChildrenProps } from '../modal/interface';
import transform, { toTransformValue } from '../_util/transform';
import EventManager from '../_util/EventManager';
import { transformZoomData } from '../_util/DocumentUtils';
import Toolbar from './Toolbar';
import Navbar from './Navbar';

export interface PictureViewerProps {
  prefixCls?: string;
  list: (string | PictureRef)[];
  defaultIndex?: number;
}

const scaleSteps: number[] = [
  0.05, 0.06, 0.07, 0.09, 0.11, 0.14, 0.17, 0.21, 0.26, 0.32, 0.39, 0.47, 0.5, 0.57, 0.69, 0.83, 0.92,
  1, 1.2, 1.72, 2, 2.4, 2.88, 3.45, 4.14, 4.96, 5.95, 7.14, 8.56, 10,
];

function getPreviewItem(item: string | PictureRef): PictureRef {
  if (isString(item)) {
    return {
      src: item,
    } as PictureRef;
  }
  return item as PictureRef;
}

const PictureViewer: FunctionComponent<PictureViewerProps & { modal?: ModalChildrenProps }> = function PictureViewer(props) {
  const { list, defaultIndex = 0, prefixCls, modal } = props;
  const { getProPrefixCls } = useContext(ConfigContext);
  const pictureRef = useRef<PictureForwardRef | null>(null);
  const transformTargetRef = useRef<HTMLDivElement | null>(null);
  const touchRef = useRef<HTMLDivElement | null>(null);
  const touchStartClientRefP1 = useRef<(number | undefined)[]>([]); // [clientX, clientY]
  const touchEndClientRefP1 = useRef<(number | undefined)[]>([]); // [clientX, clientY]
  const touchStartClientRefP2 = useRef<(number | undefined)[]>([]); // [clientX, clientY]
  const touchEndClientRefP2 = useRef<(number | undefined)[]>([]); // [clientX, clientY]
  const [index, setIndex] = useState<number>(defaultIndex);
  const [rotate, setRotate] = useState<number>(0);
  const [translate, setTranslate] = useState<[number, number]>([0, 0]);
  const [scale, setScale] = useState<number | undefined>();
  const [isZoomMode, setIsZoomMode] = useState(false);
  const handleIndexChange = useCallback((newIndex) => {
    if (isZoomMode) setIsZoomMode(false);
    if (newIndex < 0) {
      setIndex(list.length - 1);
    } else if (newIndex >= list.length) {
      setIndex(0);
    } else {
      setIndex(newIndex); 
    }
    setTranslate([0, 0]);
    setRotate(0);
    setScale(undefined);
  }, [isZoomMode]);
  const getImageNaturalScale = useCallback((): number => {
    const { current } = pictureRef;
    if (current) {
      const image = current.getImage();
      if (image) {
        const { clientWidth, clientHeight, naturalHeight, naturalWidth } = image;
        const imageScale = Math.min(clientWidth / naturalWidth, clientHeight / naturalHeight);
        return scaleSteps.findIndex((step, index, steps) => {
          const nextStep = steps[index + 1];
          return step === imageScale ||
            (imageScale < step && index === 0) ||
            (step < imageScale && nextStep > imageScale) ||
            (nextStep < imageScale && index === steps.length - 1);
        });
      }
    }
    return scaleSteps.indexOf(1);
  }, [pictureRef]);
  const getCurrentScale = useCallback((): number => {
    if (scale !== undefined) {
      return scale;
    }
    return getImageNaturalScale();
  }, [getImageNaturalScale, scale]);
  const customizedPrefixCls = getProPrefixCls('picture-viewer', prefixCls);
  const handlePrev = useCallback(() => handleIndexChange(index - 1), [index, isZoomMode]);
  const handleNext = useCallback(() => handleIndexChange(index + 1), [index, isZoomMode]);
  const handleClose = useCallback(() => modal && modal.close(), []);
  const handleRotateLeft = useCallback(() => setRotate((rotate - 90) % 360), [rotate]);
  const handleRotateRight = useCallback(() => setRotate((rotate + 90) % 360), [rotate]);
  const handleZoomIn = useCallback(() => {
    if(!isZoomMode) setIsZoomMode(true);
    setScale(prev => {
      const current = prev !== undefined ? prev : getImageNaturalScale();
      if (current < scaleSteps.length - 1) {
        return current + 1;
      }
      return current;
    });
  }, [getCurrentScale, setScale, isZoomMode]);
  const handleZoomOut = useCallback(() => {
    if(!isZoomMode) setIsZoomMode(true);
    setScale(prev => {
      const current = prev !== undefined ? prev : getImageNaturalScale();
      if (current > 0) {
        return current - 1;
      }
      return current;
    });
  }, [getCurrentScale, setScale, isZoomMode]);
  const throttleWheel = useMemo(() => throttle((callback: Function) => callback(), 60), []);
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.deltaX > 0 || e.deltaY > 0) {
      throttleWheel((isZoomMode || list.length === 1) ? handleZoomOut : handleNext);
    } else {
      throttleWheel((isZoomMode || list.length === 1) ? handleZoomIn : handlePrev);
    }
  }, [handlePrev, handleNext, handleIndexChange, handleZoomOut, handleZoomIn, isZoomMode]);
  const translateEvent: EventManager = useMemo(() => new EventManager(), []);
  const executeTransform = useCallback((target: HTMLDivElement, r: number, s: number | undefined, t: [number, number]) => {
    const transformValue = toTransformValue({
      translate: `${t[0]}px,${t[1]}px`,
      rotate: r ? `${r}deg` : undefined,
      scale: s !== undefined && s > -1 ? scaleSteps[s] / scaleSteps[getImageNaturalScale()] : undefined,
    });
    transform(transformValue, target.style);
  }, []);
  const handleMouseDown = useCallback((e) => {
    const { current } = transformTargetRef;
    if (current) {
      const { currentTarget } = e;
      const pageX = transformZoomData(e.pageX);
      const pageY = transformZoomData(e.pageY);
      currentTarget.style.cursor = 'grabbing';
      let [currentX, currentY] = translate;
      const startX = currentX - pageX;
      const startY = currentY - pageY;
      const handleMouseMove = (me) => {
        currentX = startX + transformZoomData(me.pageX);
        currentY = startY + transformZoomData(me.pageY);
        executeTransform(current, rotate, scale, [currentX, currentY]);
      };
      const handleMouseUp = () => {
        currentTarget.style.cursor = '';
        setTranslate([currentX, currentY]);
        translateEvent
          .removeEventListener('mousemove', handleMouseMove)
          .removeEventListener('mouseup', handleMouseUp);
      };
      translateEvent
        .setTarget(document)
        .addEventListener('mousemove', handleMouseMove)
        .addEventListener('mouseup', handleMouseUp);
    }
  }, [translate, rotate, scale]);
  useEffect(() => {
    const { current } = transformTargetRef;
    if (current) {
      executeTransform(current, rotate, scale, translate);
    }
  }, [scale, rotate, translate]);
  const getDistance = useCallback((p1: [number, number], p2: [number, number]): number => {
    const [x1, y1] = p1;
    const [x2, y2] = p2;
    return Math.hypot(x2 - x1, y2 - y1);
  }, []);
  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const { touches: [endP1, endP2] } = e;
    touchEndClientRefP1.current = [endP1?.clientX, endP1?.clientY];
    touchEndClientRefP2.current = [endP2?.clientX, endP2?.clientY];
    if (endP2) {
      const startDistance = getDistance(touchStartClientRefP1.current as [number, number], touchStartClientRefP2.current as [number, number]);
      const endDistance = getDistance(touchEndClientRefP1.current as [number, number], touchEndClientRefP2.current as [number, number]);
      if (endDistance - startDistance > 10) {
        handleZoomIn();
        touchStartClientRefP1.current = touchEndClientRefP1.current;
        touchStartClientRefP2.current = touchEndClientRefP2.current;
      } else if (startDistance - endDistance > 10) {
        handleZoomOut();
        touchStartClientRefP1.current = touchEndClientRefP1.current;
        touchStartClientRefP2.current = touchEndClientRefP2.current;
      }
    }
  }, [handleZoomIn, handleZoomOut, getDistance]);
  const handleTouchStart = useCallback((e) => {
    const { touches: [startP1, startP2] } = e;
    touchStartClientRefP1.current = [startP1?.clientX, startP1?.clientY];
    touchStartClientRefP2.current = [startP2?.clientX, startP2?.clientY];
    const { current } = touchRef;
    if (current) {
      current.addEventListener('touchmove', handleTouchMove, { passive: true });
    }
  }, []);
  const handleTouchEnd = useCallback(() => {
    const [ p1StartClientX ] = touchStartClientRefP1.current;
    const [ p2StartClientX ] = touchStartClientRefP2.current;
    const [ p1EndClientX ] = touchEndClientRefP1.current;
    if ((p1StartClientX !== undefined) && (p1EndClientX !== undefined) && (p1StartClientX - p1EndClientX > 50) && (p2StartClientX === undefined)) {
      handleNext();
    }
    if ((p1StartClientX !== undefined) && (p1EndClientX !== undefined) && (p1EndClientX - p1StartClientX > 50) && (p2StartClientX === undefined)) {
      handlePrev();
    }
    const { current } = touchRef;
    if (current) {
      current.removeEventListener('touchmove', handleTouchMove);
    }
    touchStartClientRefP1.current = [];
    touchStartClientRefP2.current = [];
    touchEndClientRefP1.current = [];
    touchEndClientRefP2.current = [];
  }, [handlePrev, handleNext]);
  useEffect(() => () => {
    translateEvent.clear();
  }, []);
  const { length } = list;
  if (length) {
    const { src, downloadUrl } = getPreviewItem(list[index]);
    return (
      <div className={customizedPrefixCls} onWheel={handleWheel}>
        <div
          className={`${customizedPrefixCls}-picture`}
          ref={touchRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={`${customizedPrefixCls}-picture-main`}
            ref={transformTargetRef}
          >
            <Picture
              src={src}
              ref={pictureRef}
              objectFit="scale-down"
              status="loaded"
              preview={false}
              lazy={false}
              draggable={false}
            />
          </div>
          <Toolbar
            prefixCls={customizedPrefixCls}
            zoomInDisabled={scale === scaleSteps.length - 1}
            zoomOutDisabled={scale === 0}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onRotateLeft={handleRotateLeft}
            onRotateRight={handleRotateRight}
            downloadUrl={downloadUrl}
          />
          {
            length > 1 && (
              <Navbar
                prefixCls={customizedPrefixCls}
                value={index}
                onChange={handleIndexChange}
                list={list}
              />
            )
          }
        </div>
        <Button
          icon="close"
          funcType={FuncType.link}
          onClick={handleClose}
          className={`${customizedPrefixCls}-btn ${customizedPrefixCls}-btn-close`}
        />
      </div>
    );
  }
  return null;
};

PictureViewer.displayName = 'PictureViewer';

export default PictureViewer;
