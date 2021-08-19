import React, {
  Context,
  CSSProperties,
  FunctionComponent,
  ImgHTMLAttributes,
  MouseEventHandler,
  SourceHTMLAttributes,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { ObjectFitProperty, ObjectPositionProperty } from 'csstype';
import ReactIntersectionObserver from 'react-intersection-observer';
import isNumber from 'lodash/isNumber';
import { getProPrefixCls } from 'choerodon-ui/lib/configure';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import Icon from '../icon';
import objectFitPolyfill, { isObjectFitSupport } from '../_util/objectFitPolyfill';
import PictureContext, { PictureContextValue, PictureProvider, PictureProviderProps } from './PictureContext';
import modalPreview from '../modal/preview';

export type ImageStatus = 'loaded' | 'error' | 'empty';

export interface PictureProps extends ImgHTMLAttributes<HTMLImageElement> {
  prefixCls?: string;
  width?: number;
  height?: number;
  index?: number;
  lazy?: boolean;
  block?: boolean;
  border?: boolean;
  preview?: boolean;
  objectFit?: ObjectFitProperty;
  objectPosition?: ObjectPositionProperty<string | 0>;
  sources?: SourceHTMLAttributes<HTMLSourceElement>[];
  status?: ImageStatus;
  onClick?: MouseEventHandler<HTMLPictureElement>;
}

export interface PictureRef {
  src?: string | undefined;
}

const Picture: FunctionComponent<PictureProps> & { Provider?: FunctionComponent<PictureProviderProps>, Context?: Context<PictureContextValue | undefined> } = function Picture(props: PictureProps) {
  const {
    src, lazy, className, width, height, prefixCls, style, sources, alt, title, block = true, preview = true,
    objectFit = 'fill', objectPosition = 'center', status: propStatus, border, index, onClick, ...rest
  } = props;
  const ref = useRef<PictureRef>({ src });
  const context = useContext<PictureContextValue | undefined>(PictureContext);
  const customPrefixCls = getProPrefixCls('picture', prefixCls);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [status, setStatus] = useState<ImageStatus>(propStatus || 'empty');
  const [inView, setInView] = useState<boolean>(!lazy || !!propStatus);
  const handleClick = useCallback((e) => {
    if (preview && status === 'loaded' && src) {
      if (context && isNumber(index)) {
        context.preview(index);
      } else {
        modalPreview({ list: [src] });
      }
    }
    if (onClick) {
      onClick(e);
    }
  }, [context, index, preview, status, src, onClick]);
  const wrapperStyle: CSSProperties = {
    ...style,
  };
  const elementStyle: CSSProperties = {
    objectFit,
    objectPosition,
  };
  if (typeof width !== 'undefined') {
    const w: string | number = pxToRem(width) || 0;
    elementStyle.width = w;
    wrapperStyle.width = w;
  }
  if (typeof height !== 'undefined') {
    const h: string | number = pxToRem(height) || 0;
    elementStyle.height = h;
    wrapperStyle.height = h;
  }
  useEffect(() => {
    if (!propStatus && inView && src) {
      const img = new Image(width, height);
      const onLoad = () => {
        setStatus('loaded');
      };
      const onError = () => {
        setStatus('error');
      };
      img.addEventListener('load', onLoad, false);
      img.addEventListener('error', onError, false);
      img.src = src;
      return () => {
        img.removeEventListener('load', onLoad, false);
        img.removeEventListener('error', onError, false);
      };
    }
  }, [inView, src, propStatus]);

  useEffect(() => {
    if (propStatus) {
      setStatus(propStatus);
    }
  }, [propStatus]);

  useEffect(() => {
    const { current } = imgRef;
    if (current && !isObjectFitSupport() && objectFit && objectPosition) {
      const onResize = () => objectFitPolyfill(current, objectFit, objectPosition);
      onResize();
      window.addEventListener('resize', onResize, false);
      return () => window.removeEventListener('resize', onResize, false);
    }
  }, [imgRef, objectFit, objectPosition]);

  useEffect(() => {
    if (preview && context && isNumber(index) && status === 'loaded') {
      ref.current.src = src;
      context.registerPicture(index, ref.current);
      return () => context.unRegisterPicture(index, ref.current);
    }
  }, [index, context, ref, status, preview, src]);

  const renderSources = () => {
    if (sources) {
      return sources.map((source, i) => <source key={String(i)} {...source} />);
    }
  };

  const renderImg = () => {
    switch (status) {
      case 'loaded': {
        return (
          <img
            ref={imgRef}
            style={elementStyle}
            className={`${customPrefixCls}-img`}
            src={src}
            alt={alt || title}
            title={title}
            {...rest}
          />
        );
      }
      case 'error':
        return (
          <div className={`${customPrefixCls}-icon`}>
            <Icon type="sentiment_dissatisfied" />
          </div>
        );
      case 'empty':
      default:
        return (
          <div className={`${customPrefixCls}-icon`}>
            <Icon type="photo_size_select_actual" />
          </div>
        );
    }
  };
  const classString = classNames(customPrefixCls, {
    [`${customPrefixCls}-border`]: border,
    [`${customPrefixCls}-block`]: block,
    [`${customPrefixCls}-preview`]: preview && status === 'loaded',
  }, className);
  const isPictureSupport = typeof HTMLPictureElement !== 'undefined';
  const Cmp = isPictureSupport ? 'picture' : 'div';
  const picture = (
    <Cmp className={classString} style={wrapperStyle} onClick={handleClick}>
      {isPictureSupport && renderSources()}
      {renderImg()}
    </Cmp>
  );
  if (lazy && !propStatus && status !== 'loaded') {
    return (
      <ReactIntersectionObserver onChange={setInView}>
        {picture}
      </ReactIntersectionObserver>
    );
  }
  return picture;
};

Picture.Provider = PictureProvider;
Picture.Context = PictureContext;
Picture.displayName = 'Picture';

export default Picture;
