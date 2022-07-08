import React, { CSSProperties, memo, ReactElement, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import isElement from 'lodash/isElement';
import classNames from 'classnames';
import ConfigContext from '../config-provider/ConfigContext';

export interface WaterMarkProps {
  /** 类名 */
  className?: string;
  /** 是否启用 */
  enable?: boolean;
  /** 水印类名 */
  markClassName?: string;
  /** 水印之间的水平间距 */
  gapX?: number;
  /** 水印之间的垂直间距 */
  gapY?: number;
  /** 追加的水印元素的z-index */
  zIndex?: number;
  /** 水印的宽度 */
  width?: number;
  /** 水印的高度 */
  height?: number;
  /** 水印在canvas 画布上绘制的垂直偏移量，正常情况下，水印绘制在中间位置, 即 offsetTop = gapY / 2 */
  offsetTop?: number; // 水印图片距离绘制 canvas 单元的顶部距离
  /** 水印在canvas 画布上绘制的水平偏移量, 正常情况下，水印绘制在中间位置, 即 offsetTop = gapX / 2 */
  offsetLeft?: number;
  /** 水印绘制时，旋转的角度，单位 ° */
  rotate?: number;
  /** ClassName 前缀 */
  prefixCls?: string;
  /** 高清印图片源, 为了高清屏幕显示，建议使用 2倍或3倍图，优先使用图片渲染水印。 */
  image?: string;
  /** 水印文字内容 */
  content?: string;
  /** 水印文字样式 */
  markStyle?: CSSProperties;
  children?: React.ReactNode;
  /** 是否可移除，默认为 false 不可移除，如果修改 Dom 节点强制移除则重新生成 */
  removeable?: boolean;
  /** 指定挂载的节点 */
  getContainer?: () => HTMLElement;
}

/**
 * 返回当前显示设备的物理像素分辨率与CSS像素分辨率之比
 *
 * @param context
 */
const getPixelRatio = (context: any) => {
  if (!context) {
    return 1;
  }
  const backingStore =
    context.backingStorePixelRatio ||
    context.webkitBackingStorePixelRatio ||
    context.mozBackingStorePixelRatio ||
    context.msBackingStorePixelRatio ||
    context.oBackingStorePixelRatio ||
    context.backingStorePixelRatio ||
    1;
  return (window.devicePixelRatio || 1) / backingStore;
};

const WaterMark: React.FC<WaterMarkProps> = memo((props) => {
  const {
    enable,
    removeable,
    children,
    className,
    markClassName,
    zIndex,
    gapX,
    gapY,
    width,
    height,
    rotate,
    image,
    content,
    offsetLeft,
    offsetTop,
    markStyle,
    prefixCls: customizePrefixCls,
    getContainer,
  } = props;

  const { getPrefixCls } = useContext(ConfigContext);
  const prefixCls = getPrefixCls('watermark', customizePrefixCls);
  const wrapperCls = classNames(`${prefixCls}-wrapper`, className);
  const waterMakrCls = classNames(prefixCls, markClassName);
  const [base64Url, setBase64Url] = useState<string>('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    canvasWM(mutationObserver);
  }, [
    enable,
    gapX,
    gapY,
    offsetLeft,
    offsetTop,
    rotate,
    width,
    height,
    image,
    content,
  ])

  useEffect(() => {
    if (wrapperRef.current && !removeable && enable) {
      const wrapperDom = getContainer && isElement(getContainer()) ? getContainer() : wrapperRef.current;
      const appendChild = (e) => {
        setTimeout(() => {
          if (!wrapperDom.getElementsByClassName(prefixCls).length) {
            wrapperDom.appendChild(e.target);
          }
        });
      }
      // 监听浏览器控制台强行移除节点
      wrapperDom.addEventListener('DOMNodeRemoved', (e) => appendChild(e));
      return wrapperDom.removeEventListener('DOMNodeRemoved', (e) => appendChild(e));
    }
  }, [wrapperRef, removeable, enable]);

  const mutationObserver = (imgSrc: string) => {
    if (wrapperRef.current && !removeable) {
      const wrapperDom = getContainer && isElement(getContainer()) ? getContainer() : wrapperRef.current;
      // 监听浏览器控制台样式变化
      const styleStr = `position: absolute;left: 0;top: 0;width: 100%;height: 100%;z-index:${zIndex};pointer-events: none;background-repeat: repeat;background-size: ${gapX! + width!}px;background-image: url('${imgSrc}');opacity:${markStyle!.opacity}`;
      const MutationObserver = window.MutationObserver;
      if (MutationObserver) {
        let mo: MutationObserver | null = new MutationObserver(() => {
          const wmInstance = wrapperDom.querySelector(`.${prefixCls}`);
          if ((wmInstance && wmInstance.getAttribute('style') !== styleStr)) {
            wmInstance.setAttribute('style', styleStr);
            // 避免一直触发
            mo = null;
          }
        });
        mo.observe(wrapperDom, {
          attributes: true,
          subtree: true,
          childList: true,
        });
      }
    }
  }

  const canvasWM = (callback: Function): void => {
    if (enable) {
      // 绘制水印
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const ratio = getPixelRatio(ctx);

      const canvasWidth = `${(gapX! + width!) * ratio}px`;
      const canvasHeight = `${(gapY! + height!) * ratio}px`;
      const canvasOffsetLeft = offsetLeft || gapX! / 2;
      const canvasOffsetTop = offsetTop || gapY! / 2;

      canvas.setAttribute('width', canvasWidth);
      canvas.setAttribute('height', canvasHeight);

      if (ctx) {
        // 旋转字符 rotate
        ctx.translate(canvasOffsetLeft * ratio, canvasOffsetTop * ratio);
        ctx.rotate((Math.PI / 180) * Number(rotate));
        const markWidth = width! * ratio;
        const markHeight = height! * ratio;

        if (image) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.referrerPolicy = 'no-referrer';
          img.src = image;
          img.onload = () => {
            ctx.drawImage(img, 0, 0, markWidth, markHeight);
            setBase64Url(canvas.toDataURL());
            callback(canvas.toDataURL());
          };
        } else if (content) {
          const { fontSize, fontWeight, fontFamily, color, fontStyle } = markStyle!;
          const markSize = Number(fontSize) * ratio;
          ctx.font = `${fontStyle} normal ${fontWeight} ${markSize}px/${markHeight}px ${fontFamily}`;
          ctx.fillStyle = color!;
          ctx.fillText(content, 0, 0);
          setBase64Url(canvas.toDataURL());
          callback(canvas.toDataURL());
        }
      } else {
        console.error('当前环境不支持Canvas');
      }
    }
  }

  const renderCanvas = useMemo(() => {
    return enable ? React.createElement('div', {
      className: waterMakrCls,
      style: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        zIndex,
        pointerEvents: 'none',
        backgroundRepeat: 'repeat',
        backgroundSize: `${gapX! + width!}px`,
        backgroundImage: `url('${base64Url}')`,
        opacity: markStyle!.opacity,
      },
    }) : null
  }, [enable, waterMakrCls, gapX, width, base64Url, zIndex]);

  const getWMContainer = useMemo((): ReactElement | null => {
    const container = getContainer && getContainer();
    if (container && isElement(container)) {
      container.style.setProperty('position', container.style.position || 'relative');
      return createPortal(renderCanvas, container);
    }
    return renderCanvas;
  }, [getContainer, renderCanvas])

  return (
    <div
      className={wrapperCls}
      ref={wrapperRef}
    >
      {children}
      {getWMContainer}
    </div>
  );
});

WaterMark.displayName = 'WaterMark';

WaterMark.defaultProps = {
  enable: true,
  removeable: false,
  zIndex: 9,
  gapX: 212,
  gapY: 222,
  width: 120,
  height: 64,
  rotate: -22,
  markStyle: {
    fontStyle: 'normal',
    fontWeight: 'normal',
    color: 'rgba(0,0,0,.15)',
    fontSize: 16,
    fontFamily: 'sans-serif',
    opacity: 0.8,
  },
};

export default WaterMark;