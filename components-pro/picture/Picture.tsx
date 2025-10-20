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
import noop from 'lodash/noop';
import { Property } from 'csstype';
import ReactIntersectionObserver from 'react-intersection-observer';
import isNumber from 'lodash/isNumber';
import ConfigContext from 'choerodon-ui/lib/config-provider/ConfigContext';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import Icon from '../icon';
import objectFitPolyfill, { isObjectFitSupport } from '../_util/objectFitPolyfill';
import isEmpty from '../_util/isEmpty';
import PictureContext, { PictureContextValue, PictureProvider } from './PictureContext';
import modalPreview from '../modal/preview';
import { ModalProps } from '../modal/interface';
import Spin from '../spin';

export type ImageStatus = 'loaded' | 'error' | 'empty' | 'loading';

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
  objectFit?: Property.ObjectFit;
  objectPosition?: Property.ObjectPosition;
  sources?: SourceHTMLAttributes<HTMLSourceElement>[];
  status?: ImageStatus;
  onClick?: MouseEventHandler<HTMLPictureElement>;
  onPreview?: () => void;
  children?: ReactNode;
  modalProps?: ModalProps;
  /**
   * 点击事件前(图片预览前)执行
   * @returns 返回值为 true 时, 强制调用预览(即使图片状态不是加载成功)
   */
  onBeforeClick?: () => (Promise<boolean | void> | boolean | void);
}

export interface PictureRef {
  src?: string | undefined;
  downloadUrl?: string | Function | undefined;
}

export interface OldPropsRef {
  src?: string | undefined;
  status?: ImageStatus;
}

export interface PictureForwardRef {
  preview(forcePreview?: boolean);

  getImage(): HTMLImageElement | null;

  updatePreviewUrl(previewUrl?: string | undefined): void;
}

function Picture(props: PictureProps, ref: Ref<PictureForwardRef>) {
  const {
    src, downloadUrl, previewUrl, previewTarget, lazy, className, width, height, prefixCls, style, sources, alt, title, block = true, preview = true, modalProps,
    objectFit = 'fill', objectPosition = 'center', status: propStatus, border, index, onClick, children, onPreview, onBeforeClick = noop, ...rest
  } = props;
  const [url, setUrl] = useState(previewUrl || src);
  const pictureRef = useRef<PictureRef>({ src: url, downloadUrl });
  const context = useContext<PictureContextValue | undefined>(PictureContext);
  const { getProPrefixCls } = useContext(ConfigContext);
  const customPrefixCls = getProPrefixCls('picture', prefixCls);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [status, setStatus] = useState<ImageStatus>(propStatus || 'empty');
  const [inView, setInView] = useState<boolean>(!lazy || !!propStatus);
  const oldPropsRef = useRef<OldPropsRef>({});

  useEffect(() => {
    setUrl(previewUrl || src);
  }, [setUrl, previewUrl, src]);

  const handlePreview = useCallback((forcePreview?: boolean) => {
    if (preview && !previewTarget && url && (status === 'loaded' || forcePreview)) {
      if (context && isNumber(index)) {
        context.preview(index, modalProps);
      } else {
        modalPreview({ list: [{ src: url, downloadUrl }] }, modalProps);
      }
      if (onPreview) {
        onPreview();
      }
    }
  }, [context, index, preview, previewTarget, status, url, downloadUrl, onPreview]);
  const handleClick = useCallback(async (e) => {
    const forcePreview = await onBeforeClick();
    handlePreview(forcePreview);
    if (onClick) {
      onClick(e);
    }
  }, [handlePreview, onClick, onBeforeClick]);
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
    if (!propStatus && isEmpty(src)) {
      setStatus('empty');
    }
    if (!propStatus && inView && src) {
      if (src !== oldPropsRef.current.src) {
        setStatus('loading');
      } else {
        setStatus('empty');
      }

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
    oldPropsRef.current = { src, status: propStatus };
  }, [inView, src, propStatus, oldPropsRef]);

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

  const updatePreviewUrl = useCallback((previewUrl?: string | undefined): void => {
    setUrl(previewUrl);
  }, [setUrl]);

  useImperativeHandle(ref, () => ({
    preview: handlePreview,
    getImage: () => imgRef.current,
    updatePreviewUrl,
  }), [handlePreview, imgRef, updatePreviewUrl]);

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
            className={`${customPrefixCls}-img ${customPrefixCls}-${status}`}
            src={src}
            alt={alt || title}
            title={title}
            {...rest}
          />
        );
      }
      case 'error':
        return (
          <div className={`${customPrefixCls}-icon ${customPrefixCls}-${status}`}>
            <Icon type="sentiment_dissatisfied" />
          </div>
        );
      case 'loading':
        return (
          <div className={`${customPrefixCls}-icon ${customPrefixCls}-${status}`}>
            <Spin className={`${customPrefixCls}-spin`} />
          </div>
        );
      case 'empty':
      default:
        return (
          <div className={`${customPrefixCls}-icon ${customPrefixCls}-${status}`}>
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
