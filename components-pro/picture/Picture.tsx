import React, {
  CSSProperties,
  forwardRef,
  ForwardRefExoticComponent,
  ImgHTMLAttributes,
  MouseEventHandler,
  PropsWithoutRef,
  ReactNode,
  Ref,
  RefAttributes,
  SourceHTMLAttributes,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { ObjectFitProperty, ObjectPositionProperty } from 'csstype';
import ReactIntersectionObserver from 'react-intersection-observer';
import isNumber from 'lodash/isNumber';
import ConfigContext from 'choerodon-ui/lib/config-provider/ConfigContext';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import Icon from '../icon';
import objectFitPolyfill, { isObjectFitSupport } from '../_util/objectFitPolyfill';
import PictureContext, { PictureContextValue, PictureProvider } from './PictureContext';
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
  previewUrl?: string;
  downloadUrl?: string | Function;
  previewTarget?: string;
  objectFit?: ObjectFitProperty;
  objectPosition?: ObjectPositionProperty<string | 0>;
  sources?: SourceHTMLAttributes<HTMLSourceElement>[];
  status?: ImageStatus;
  onClick?: MouseEventHandler<HTMLPictureElement>;
  onPreview?: () => void;
  children?: ReactNode;
}

export interface PictureRef {
  src?: string | undefined;
  downloadUrl?: string | Function | undefined;
}

export interface PictureForwardRef {
  preview();

  getImage(): HTMLImageElement | null;
}

function Picture(props: PictureProps, ref: Ref<PictureForwardRef>) {
  const {
    src, downloadUrl, previewUrl, previewTarget, lazy, className, width, height, prefixCls, style, sources, alt, title, block = true, preview = true,
    objectFit = 'fill', objectPosition = 'center', status: propStatus, border, index, onClick, children, onPreview, ...rest
  } = props;
  const url = previewUrl || src;
  const pictureRef = useRef<PictureRef>({ src: url, downloadUrl });
  const context = useContext<PictureContextValue | undefined>(PictureContext);
  const { getProPrefixCls } = useContext(ConfigContext);
  const customPrefixCls = getProPrefixCls('picture', prefixCls);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [status, setStatus] = useState<ImageStatus>(propStatus || 'empty');
  const [inView, setInView] = useState<boolean>(!lazy || !!propStatus);
  const handlePreview = useCallback(() => {
    if (preview && !previewTarget && status === 'loaded' && url) {
      if (context && isNumber(index)) {
        context.preview(index);
      } else {
        modalPreview({ list: [{ src: url, downloadUrl }] });
      }
      if (onPreview) {
        onPreview();
      }
    }
  }, [context, index, preview, previewTarget, status, url, downloadUrl, onPreview]);
  const handleClick = useCallback((e) => {
    handlePreview();
    if (onClick) {
      onClick(e);
    }
  }, [handlePreview, onClick]);
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
    if (preview && !previewTarget && context && isNumber(index) && url) {
      const { current } = pictureRef;
      current.src = url;
      context.registerPicture(index, current);
      return () => context.unRegisterPicture(index, current);
    }
  }, [index, context, pictureRef, preview, previewTarget, url]);

  useImperativeHandle(ref, () => ({
    preview: handlePreview,
    getImage: () => imgRef.current,
  }), [handlePreview, imgRef]);

  const renderSources = () => {
    if (sources) {
      return sources.map((source, i) => <source key={String(i)} {...source} />);
    }
  };

  const renderImg = () => {
    if (children) {
      return children;
    }
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
  const img = renderImg();
  const picture = (
    <Cmp className={classString} style={wrapperStyle} onClick={handleClick}>
      {isPictureSupport && renderSources()}
      {
        preview && previewTarget ? (
          <a target={previewTarget} href={url}>
            {img}
          </a>
        ) : img
      }
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
}

const ForwardPicture: ForwardRefExoticComponent<PropsWithoutRef<PictureProps> & RefAttributes<PictureForwardRef>> = forwardRef<PictureForwardRef, PictureProps>(Picture);
export type ForwardPictureType = typeof ForwardPicture & { Provider: typeof PictureProvider; Context: typeof PictureContext };
(ForwardPicture as ForwardPictureType).Provider = PictureProvider;
(ForwardPicture as ForwardPictureType).Context = PictureContext;
ForwardPicture.displayName = 'Picture';

export default ForwardPicture as ForwardPictureType;
