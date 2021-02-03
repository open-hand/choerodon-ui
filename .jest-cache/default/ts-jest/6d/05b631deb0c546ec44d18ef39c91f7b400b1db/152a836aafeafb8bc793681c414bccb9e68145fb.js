import React, { useState, useCallback, useRef, forwardRef } from 'react';
import Cropper from 'react-easy-crop';
import isFunction from 'lodash/isFunction';
import { getPrefixCls } from '../configure';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import Modal from '../modal';
import Slider from '../slider';
import defaultLocale from '../locale-provider/default';
import Button from '../button';
import Upload from '../upload';
import AvatarUploader from './avatarUpload';
// ssr 
if (typeof window !== 'undefined') {
    // 兼容ie11 remove 方法
    (function (arr) {
        arr.forEach(function (item) {
            // eslint-disable-next-line no-prototype-builtins
            if (item.hasOwnProperty('remove')) {
                return;
            }
            Object.defineProperty(item, 'remove', {
                configurable: true,
                enumerable: true,
                writable: true,
                value: function remove() {
                    if (this.parentNode === null) {
                        return;
                    }
                    this.parentNode.removeChild(this);
                },
            });
        });
        // 兼容IE
        if (!HTMLCanvasElement.prototype.toBlob) {
            Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
                value(callback, type, quality) {
                    const canvas = this;
                    setTimeout(function () {
                        const binStr = atob(canvas.toDataURL(type, quality).split(',')[1]);
                        const len = binStr.length;
                        const arrArray = new Uint8Array(len);
                        for (let i = 0; i < len; i++) {
                            arrArray[i] = binStr.charCodeAt(i);
                        }
                        callback(new Blob([arrArray], { type: type || 'image/png' }));
                    });
                },
            });
        }
    })([Element.prototype, CharacterData.prototype, DocumentType.prototype]);
}
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;
const MIN_RATE = 1;
const MAX_RATE = 100;
const RATE_STEP = 1;
const MIN_ROTATE = 0;
const MAX_ROTATE = 360;
const ROTATE_STEP = 1;
const EasyCrop = forwardRef((props, ref) => {
    const { src, aspect, shape, grid, hasZoom, zoomVal, rotateVal, setZoomVal, setRotateVal, onComplete, prefixCls, } = props;
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const onCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
        croppedAreaPixels.zoom = zoomVal || 0;
        croppedAreaPixels.rotate = rotateVal || 0;
        onComplete(croppedAreaPixels);
    }, [onComplete, zoomVal, rotateVal]);
    return (React.createElement(Cropper, { ref: ref, image: src, aspect: aspect, cropShape: shape, showGrid: grid, zoomWithScroll: hasZoom, crop: crop, zoom: zoomVal, rotation: rotateVal, onCropChange: setCrop, onZoomChange: setZoomVal, onRotationChange: setRotateVal, onCropComplete: onCropComplete, classes: { containerClassName: `${prefixCls}-container`, mediaClassName: `${prefixCls}-media` } }));
});
// 设置初始化的比例值，值更加贴近100 方便查看与拖拉
const balanceRate = (rate) => {
    let x = 100;
    let y = 100;
    if (rate > 100) {
        x = 100;
        y = 1;
    }
    else if (rate < 0.01) {
        x = 1;
        y = 0;
    }
    else if (rate === 1) { // 特殊值快速处理
        x = 50;
        y = 50;
    }
    else if (rate === 0.5) { // 特殊值快速处理
        x = 30;
        y = 60;
    }
    else {
        const residual = {
            value: 10000,
            x: 0,
            y: 0,
        };
        while (x > 0 && y > 0) {
            if (x / y > rate) {
                x--;
            }
            else if (x / y < rate) {
                y--;
            }
            else {
                residual.x = x;
                residual.y = y;
                break;
            }
            if (Math.abs(residual.value) > Math.abs(x / y - rate)) {
                residual.value = Math.abs(x / y - rate);
                residual.x = x;
                residual.y = y;
            }
        }
        x = residual.x;
        y = residual.y;
    }
    return {
        x,
        y,
    };
};
// 图片转化为canvas
const imageToCanvas = (image) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    if (ctx) {
        ctx.drawImage(image, 0, 0);
        return canvas;
    }
    return undefined;
};
const ImgCrop = forwardRef((props, ref) => {
    const { aspect, shape, grid, zoom, rotate, beforeCrop, modalTitle, modalWidth, modalOk, modalCancel, modalVisible, children, aspectControl, onCancel: onModalCancel, onOk: onModalOk, src: imageSrc, serverCrop, modalProps, cropContent, onCropComplete, prefixCls: customizePrefixCls, } = props;
    const prefixCls = getPrefixCls('image-crop', customizePrefixCls);
    const prefixClsMedia = `${prefixCls}-media`;
    const hasZoom = zoom === true;
    const hasRotate = rotate === true;
    const defaultRateXY = () => {
        if (aspect && aspectControl) {
            return balanceRate(aspect);
        }
        return {
            x: 40,
            y: 30,
        };
    };
    const hasAspectControl = aspectControl === true;
    const modalTextProps = { okText: modalOk, cancelText: modalCancel };
    Object.keys(modalTextProps).forEach((key) => {
        if (!modalTextProps[key])
            delete modalTextProps[key];
    });
    const [src, setSrc] = useState('');
    const [zoomVal, setZoomVal] = useState(1);
    const [rotateVal, setRotateVal] = useState(0);
    const [xRate, setXRate] = useState(defaultRateXY().x);
    const [yRate, setYRate] = useState(defaultRateXY().y);
    const beforeUploadRef = React.useRef(); // 返回上传组件的上传之前的钩子函数
    const fileRef = React.useRef(); // 记录文件的参数
    const resolveRef = useRef(); // 返回文件上传的成功数据的方法
    const rejectRef = useRef(); // 返回失败数据的方法
    const cropPixelsRef = React.useRef();
    const imageCropCanvas = (naturalModalImg) => {
        const { naturalWidth, naturalHeight } = naturalModalImg;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
            // create a max canvas to cover the source image after rotated
            const maxLen = Math.sqrt(naturalWidth ** 2 + naturalHeight ** 2);
            canvas.width = maxLen;
            canvas.height = maxLen;
            // rotate the image
            if (hasRotate && rotateVal > 0 && rotateVal < 360) {
                const halfMax = maxLen / 2;
                ctx.translate(halfMax, halfMax);
                ctx.rotate((rotateVal * Math.PI) / 180);
                ctx.translate(-halfMax, -halfMax);
            }
            // draw the source image in the center of the max canvas
            const left = (maxLen - naturalWidth) / 2;
            const top = (maxLen - naturalHeight) / 2;
            ctx.drawImage(naturalModalImg, left, top);
            // shrink the max canvas to the crop area size, then align two center points
            const maxImgData = ctx.getImageData(0, 0, maxLen, maxLen);
            if (cropPixelsRef && cropPixelsRef.current) {
                const { width, height, x, y } = cropPixelsRef.current;
                canvas.width = width;
                canvas.height = height;
                // get the new image
                ctx.putImageData(maxImgData, -left - x, -top - y);
                return canvas;
            }
        }
    };
    /**
     * Upload
     */
    const renderUpload = useCallback(() => {
        const upload = Array.isArray(children) ? children[0] : children;
        if (upload && upload.props && upload.type === Upload) {
            const { beforeUpload, accept, ...restUploadProps } = upload.props;
            beforeUploadRef.current = beforeUpload;
            return {
                ...upload,
                props: {
                    ...restUploadProps,
                    accept: accept || 'image/*',
                    beforeUpload: (file, fileList) => new Promise((resolve, reject) => {
                        if (beforeCrop && !beforeCrop(file, fileList)) {
                            reject();
                            return;
                        }
                        fileRef.current = file;
                        resolveRef.current = resolve;
                        rejectRef.current = reject;
                        const reader = new FileReader();
                        if (reader) {
                            reader.addEventListener('load', () => {
                                if (reader.result && typeof reader.result === 'string') {
                                    setSrc(reader.result);
                                }
                            });
                            if (file instanceof Blob) {
                                reader.readAsDataURL(file);
                            }
                        }
                    }),
                },
            };
        }
        if (imageSrc && (typeof window !== 'undefined')) {
            const newimage = new Image();
            newimage.src = imageSrc;
            newimage.crossOrigin = "anonymous";
            newimage.onload = function () {
                const canvas = imageToCanvas(newimage);
                if (canvas) {
                    if (isFunction(onModalOk) && canvas) {
                        setSrc(canvas.toDataURL());
                    }
                }
            };
        }
    }, [beforeCrop, children]);
    /**
     * EasyCrop
     */
    const onComplete = useCallback((croppedAreaPixels) => {
        cropPixelsRef.current = croppedAreaPixels;
        if (isFunction(onCropComplete)) {
            const naturalModalImg = document.querySelector(`.${prefixClsMedia}`);
            const canvas = serverCrop ? imageToCanvas(naturalModalImg) : imageCropCanvas(naturalModalImg);
            if (canvas) {
                canvas.toBlob((blob) => {
                    let area = {};
                    if (cropPixelsRef.current) {
                        area = cropPixelsRef.current;
                    }
                    onCropComplete({ url: canvas.toDataURL(), blob, area });
                });
            }
        }
    }, [rotateVal, hasRotate]);
    /**
     * Controls
     */
    const isMinZoom = zoomVal === MIN_ZOOM;
    const isMaxZoom = zoomVal === MAX_ZOOM;
    const isMinRotate = rotateVal === MIN_ROTATE;
    const isMaxRotate = rotateVal === MAX_ROTATE;
    const subZoomVal = useCallback(() => {
        if (!isMinZoom)
            setZoomVal(zoomVal - ZOOM_STEP);
    }, [isMinZoom, zoomVal]);
    const addZoomVal = useCallback(() => {
        if (!isMaxZoom)
            setZoomVal(zoomVal + ZOOM_STEP);
    }, [isMaxZoom, zoomVal]);
    const subRotateVal = useCallback(() => {
        if (!isMinRotate)
            setRotateVal(rotateVal - ROTATE_STEP);
    }, [isMinRotate, rotateVal]);
    const addRotateVal = useCallback(() => {
        if (!isMaxRotate)
            setRotateVal(rotateVal + ROTATE_STEP);
    }, [isMaxRotate, rotateVal]);
    /**
     * Modal
     */
    const closeModal = useCallback(() => {
        setSrc('');
        setZoomVal(1);
        setRotateVal(0);
    }, []);
    const onClose = useCallback(() => {
        closeModal();
        if (isFunction(onModalCancel)) {
            onModalCancel();
        }
    }, []);
    const onOk = useCallback(async () => {
        closeModal();
        const naturalModalImg = document.querySelector(`.${prefixClsMedia}`);
        if (naturalModalImg) {
            if (naturalModalImg && naturalModalImg instanceof HTMLImageElement) {
                const canvas = serverCrop ? imageToCanvas(naturalModalImg) : imageCropCanvas(naturalModalImg);
                if (fileRef.current && canvas) {
                    const { type, name, uid } = fileRef.current;
                    canvas.toBlob(async (blob) => {
                        let newFile = blob;
                        if (newFile) {
                            // @ts-ignore
                            newFile.lastModifiedDate = Date.now();
                            // @ts-ignore
                            newFile.name = name;
                            // @ts-ignore
                            newFile.uid = uid;
                            // @ts-ignore
                            newFile.imageCropArea = cropPixelsRef.current;
                            if (resolveRef && rejectRef && resolveRef.current && rejectRef.current) {
                                if (typeof beforeUploadRef.current !== 'function')
                                    return resolveRef.current(newFile);
                                // @ts-ignore
                                const res = beforeUploadRef.current(newFile, [newFile]);
                                if (typeof res !== 'boolean' && !res) {
                                    console.error('beforeUpload must return a boolean or Promise');
                                    return;
                                }
                                if (res === true)
                                    return resolveRef.current(newFile);
                                if (res === false)
                                    return rejectRef.current('not upload');
                                if (res && typeof res.then === 'function') {
                                    try {
                                        const passedFile = await res;
                                        const passedFileType = Object.prototype.toString.call(passedFile);
                                        if (passedFileType === '[object File]' || passedFileType === '[object Blob]')
                                            newFile = passedFile;
                                        resolveRef.current(newFile);
                                    }
                                    catch (err) {
                                        rejectRef.current(err);
                                    }
                                }
                            }
                        }
                    }, type, 0.4);
                }
                if (isFunction(onModalOk) && canvas) {
                    canvas.toBlob((blob) => {
                        let area = {};
                        if (cropPixelsRef.current) {
                            area = cropPixelsRef.current;
                        }
                        onModalOk({ url: canvas.toDataURL(), blob, area });
                    });
                }
            }
        }
    }, [hasRotate, onClose, rotateVal]);
    const RenderCrop = (React.createElement(EasyCrop, { ref: ref, src: src, aspect: aspectControl ? (xRate / yRate) : aspect, shape: shape, grid: grid, hasZoom: hasZoom, zoomVal: zoomVal, rotateVal: rotateVal, setZoomVal: setZoomVal, setRotateVal: setRotateVal, onComplete: onComplete, prefixCls: prefixCls }));
    return (React.createElement(LocaleReceiver, { componentName: "imageCrop", defaultLocale: defaultLocale.imageCrop }, (locale) => {
        return (React.createElement(React.Fragment, null,
            renderUpload(),
            src && modalVisible && (React.createElement(Modal, Object.assign({ visible: modalVisible, wrapClassName: `${prefixCls}-modal`, title: modalTitle || locale && locale.editImage ? locale.editImage : 'Edit image', width: modalWidth, destroyOnClose: true, maskClosable: false }, modalProps, { onOk: onOk, onCancel: onClose }, modalTextProps),
                cropContent ? cropContent(RenderCrop) : RenderCrop,
                hasZoom && (React.createElement("div", { className: `${prefixCls}-control zoom` },
                    React.createElement(Button, { onClick: subZoomVal, disabled: isMinZoom }, "\uFF0D"),
                    React.createElement(Slider, { min: MIN_ZOOM, max: MAX_ZOOM, step: ZOOM_STEP, value: zoomVal, onChange: (sliderValue) => (setZoomVal(sliderValue)) }),
                    React.createElement(Button, { onClick: addZoomVal, disabled: isMaxZoom }, "\uFF0B"))),
                hasRotate && (React.createElement("div", { className: `${prefixCls}-control rotate` },
                    React.createElement(Button, { onClick: subRotateVal, disabled: isMinRotate }, "\u21BA"),
                    React.createElement(Slider, { min: MIN_ROTATE, max: MAX_ROTATE, step: ROTATE_STEP, value: rotateVal, onChange: (sliderValue) => (setRotateVal(sliderValue)) }),
                    React.createElement(Button, { onClick: addRotateVal, disabled: isMaxRotate }, "\u21BB"))),
                hasAspectControl && (React.createElement("div", { className: `${prefixCls}-control yrate` },
                    React.createElement(Button, { onClick: subRotateVal, disabled: isMinRotate }, "y"),
                    React.createElement(Slider, { min: MIN_RATE, max: MAX_RATE, step: RATE_STEP, value: yRate, onChange: (sliderValue) => (setYRate(sliderValue)) }),
                    React.createElement(Button, { onClick: addRotateVal, disabled: isMaxRotate }, "100"))),
                hasAspectControl && (React.createElement("div", { className: `${prefixCls}-control xrate` },
                    React.createElement(Button, { onClick: subRotateVal, disabled: isMinRotate }, "x"),
                    React.createElement(Slider, { min: MIN_RATE, max: MAX_RATE, step: RATE_STEP, value: xRate, onChange: (sliderValue) => (setXRate(sliderValue)) }),
                    React.createElement(Button, { onClick: addRotateVal, disabled: isMaxRotate }, "100")))))));
    }));
});
ImgCrop.defaultProps = {
    shape: "rect" /* rect */,
    grid: false,
    zoom: true,
    rotate: false,
    modalWidth: 600,
    modalVisible: true,
    serverCrop: false,
};
ImgCrop.AvatarUploader = AvatarUploader;
export default ImgCrop;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMvaW1hZ2UtY3JvcC9pbmRleC50c3giLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLEVBQUUsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQXFCLE1BQU0sT0FBTyxDQUFDO0FBQzVGLE9BQU8sT0FBTyxNQUFNLGlCQUFpQixDQUFDO0FBQ3RDLE9BQU8sVUFBVSxNQUFNLG1CQUFtQixDQUFDO0FBQzNDLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDNUMsT0FBTyxjQUFjLE1BQU0sbUNBQW1DLENBQUM7QUFDL0QsT0FBTyxLQUFxQixNQUFNLFVBQVUsQ0FBQztBQUM3QyxPQUFPLE1BQU0sTUFBTSxXQUFXLENBQUM7QUFFL0IsT0FBTyxhQUFhLE1BQU0sNEJBQTRCLENBQUM7QUFDdkQsT0FBTyxNQUFNLE1BQU0sV0FBVyxDQUFDO0FBQy9CLE9BQU8sTUFBTSxNQUFNLFdBQVcsQ0FBQztBQUMvQixPQUFPLGNBQWMsTUFBTSxnQkFBZ0IsQ0FBQztBQUc1QyxPQUFPO0FBQ1AsSUFBSSxPQUFPLE1BQU0sS0FBSyxXQUFXLEVBQUU7SUFDL0IsbUJBQW1CO0lBQ25CLENBQUMsVUFBVSxHQUFHO1FBQ1YsR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLElBQUk7WUFDdEIsaURBQWlEO1lBQ2pELElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDL0IsT0FBTzthQUNWO1lBQ0QsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFO2dCQUNsQyxZQUFZLEVBQUUsSUFBSTtnQkFDbEIsVUFBVSxFQUFFLElBQUk7Z0JBQ2hCLFFBQVEsRUFBRSxJQUFJO2dCQUNkLEtBQUssRUFBRSxTQUFTLE1BQU07b0JBQ2xCLElBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxJQUFJLEVBQUU7d0JBQzFCLE9BQU87cUJBQ1Y7b0JB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Q0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsR0FDNUQ7b0JBQ0Ysb0JBQUMsTUFBTSxJQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLFdBQVcsVUFFM0MsQ0FDUCxDQUNULENBQ0csQ0FDWCxDQUNGLENBQ04sQ0FBQTtJQUNMLENBQUMsQ0FDWSxDQUNwQixDQUFDO0FBQ04sQ0FBQyxDQUF3QixDQUFBO0FBR3pCLE9BQU8sQ0FBQyxZQUFZLEdBQUc7SUFDbkIsS0FBSyxtQkFBa0I7SUFDdkIsSUFBSSxFQUFFLEtBQUs7SUFDWCxJQUFJLEVBQUUsSUFBSTtJQUNWLE1BQU0sRUFBRSxLQUFLO0lBQ2IsVUFBVSxFQUFFLEdBQUc7SUFDZixZQUFZLEVBQUUsSUFBSTtJQUNsQixVQUFVLEVBQUUsS0FBSztDQUNwQixDQUFDO0FBRUYsT0FBTyxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUE7QUFFdkMsZUFBZSxPQUFPLENBQUMiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMvaW1hZ2UtY3JvcC9pbmRleC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlLCB1c2VDYWxsYmFjaywgdXNlUmVmLCBmb3J3YXJkUmVmLCBSZWYsIFJlYWN0RWxlbWVudCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBDcm9wcGVyIGZyb20gJ3JlYWN0LWVhc3ktY3JvcCc7XG5pbXBvcnQgaXNGdW5jdGlvbiBmcm9tICdsb2Rhc2gvaXNGdW5jdGlvbic7XG5pbXBvcnQgeyBnZXRQcmVmaXhDbHMgfSBmcm9tICcuLi9jb25maWd1cmUnO1xuaW1wb3J0IExvY2FsZVJlY2VpdmVyIGZyb20gJy4uL2xvY2FsZS1wcm92aWRlci9Mb2NhbGVSZWNlaXZlcic7XG5pbXBvcnQgTW9kYWwsIHsgTW9kYWxQcm9wcyB9IGZyb20gJy4uL21vZGFsJztcbmltcG9ydCBTbGlkZXIgZnJvbSAnLi4vc2xpZGVyJztcbmltcG9ydCB7IFVwbG9hZEZpbGUsIFVwbG9hZFByb3BzIH0gZnJvbSAnLi4vdXBsb2FkL2ludGVyZmFjZSc7XG5pbXBvcnQgZGVmYXVsdExvY2FsZSBmcm9tICcuLi9sb2NhbGUtcHJvdmlkZXIvZGVmYXVsdCc7XG5pbXBvcnQgQnV0dG9uIGZyb20gJy4uL2J1dHRvbic7XG5pbXBvcnQgVXBsb2FkIGZyb20gJy4uL3VwbG9hZCc7XG5pbXBvcnQgQXZhdGFyVXBsb2FkZXIgZnJvbSAnLi9hdmF0YXJVcGxvYWQnO1xuaW1wb3J0IHsgaW1hZ2VDcm9wIH0gZnJvbSAnLi4vbG9jYWxlLXByb3ZpZGVyJ1xuXG4vLyBzc3IgXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyDlhbzlrrlpZTExIHJlbW92ZSDmlrnms5VcbiAgICAoZnVuY3Rpb24gKGFycikge1xuICAgICAgICBhcnIuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXByb3RvdHlwZS1idWlsdGluc1xuICAgICAgICAgICAgaWYgKGl0ZW0uaGFzT3duUHJvcGVydHkoJ3JlbW92ZScpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGl0ZW0sICdyZW1vdmUnLCB7XG4gICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIOWFvOWuuUlFXG4gICAgICAgIGlmICghSFRNTENhbnZhc0VsZW1lbnQucHJvdG90eXBlLnRvQmxvYikge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEhUTUxDYW52YXNFbGVtZW50LnByb3RvdHlwZSwgJ3RvQmxvYicsIHtcbiAgICAgICAgICAgICAgICB2YWx1ZShjYWxsYmFjaywgdHlwZSwgcXVhbGl0eSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjYW52YXMgPSB0aGlzO1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJpblN0ciA9IGF0b2IoY2FudmFzLnRvRGF0YVVSTCh0eXBlLCBxdWFsaXR5KS5zcGxpdCgnLCcpWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxlbiA9IGJpblN0ci5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhcnJBcnJheSA9IG5ldyBVaW50OEFycmF5KGxlbik7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyQXJyYXlbaV0gPSBiaW5TdHIuY2hhckNvZGVBdChpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG5ldyBCbG9iKFthcnJBcnJheV0sIHsgdHlwZTogdHlwZSB8fCAnaW1hZ2UvcG5nJyB9KSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pKFtFbGVtZW50LnByb3RvdHlwZSwgQ2hhcmFjdGVyRGF0YS5wcm90b3R5cGUsIERvY3VtZW50VHlwZS5wcm90b3R5cGVdKTtcbn1cblxuXG5cbmNvbnN0IE1JTl9aT09NID0gMTtcbmNvbnN0IE1BWF9aT09NID0gMztcbmNvbnN0IFpPT01fU1RFUCA9IDAuMTtcblxuaW50ZXJmYWNlIENvbXBvdW5kZWRDb21wb25lbnRcbiAgICBleHRlbmRzIFJlYWN0LkZvcndhcmRSZWZFeG90aWNDb21wb25lbnQ8SW1nQ3JvcFByb3BzPiB7XG4gICAgQXZhdGFyVXBsb2FkZXI6IHR5cGVvZiBBdmF0YXJVcGxvYWRlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJbWFnZUNyb3BMb2NhbGUge1xuICAgIGltYWdlQ3JvcD86IHN0cmluZztcbn1cblxuY29uc3QgTUlOX1JBVEUgPSAxO1xuY29uc3QgTUFYX1JBVEUgPSAxMDA7XG5jb25zdCBSQVRFX1NURVAgPSAxO1xuXG5jb25zdCBNSU5fUk9UQVRFID0gMDtcbmNvbnN0IE1BWF9ST1RBVEUgPSAzNjA7XG5jb25zdCBST1RBVEVfU1RFUCA9IDE7XG5cbmV4cG9ydCBjb25zdCBlbnVtIHNoYXBlQ3JvcGVyIHtcbiAgICByZWN0ID0gJ3JlY3QnLFxuICAgIHJvdW5kID0gJ3JvdW5kJyxcbn1cblxuZXhwb3J0IGRlY2xhcmUgdHlwZSBBcmVhID0ge1xuICAgIHdpZHRoOiBudW1iZXI7XG4gICAgaGVpZ2h0OiBudW1iZXI7XG4gICAgeDogbnVtYmVyO1xuICAgIHk6IG51bWJlcjtcbiAgICB6b29tOiBudW1iZXI7XG4gICAgcm90YXRpb246IG51bWJlcjtcbn07XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmFsYW5jZVJhdGUge1xuICAgIHg6IG51bWJlcjtcbiAgICB5OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRWFzeUNyb3BQcm9wcyB7XG4gICAgc3JjPzogc3RyaW5nLFxuICAgIGFzcGVjdD86IG51bWJlcixcbiAgICBzaGFwZT86IHNoYXBlQ3JvcGVyLFxuICAgIGdyaWQ/OiBib29sZWFuLFxuICAgIGhhc1pvb20/OiBib29sZWFuLFxuICAgIHpvb21WYWw/OiBudW1iZXIsXG4gICAgcm90YXRlVmFsPzogbnVtYmVyLFxuICAgIHNldFpvb21WYWw/OiAodmFsdWU6IG51bWJlcikgPT4gdm9pZCxcbiAgICBzZXRSb3RhdGVWYWw/OiAocm90YXRpb246IG51bWJlcikgPT4gdm9pZCxcbiAgICBvbkNvbXBsZXRlOiAoY3JvcHBlZEFyZWFQaXhlbHM6IEFyZWEpID0+IHZvaWQsXG4gICAgcHJlZml4Q2xzPzogc3RyaW5nLFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEltZ0Nyb3BQcm9wcyB7XG4gICAgYXNwZWN0PzogbnVtYmVyLFxuICAgIHNoYXBlPzogc2hhcGVDcm9wZXIsXG4gICAgem9vbT86IGJvb2xlYW4sXG4gICAgZ3JpZD86IGJvb2xlYW4sXG4gICAgc3JjPzogc3RyaW5nLFxuICAgIGFzcGVjdENvbnRyb2w/OiBib29sZWFuLFxuICAgIHJvdGF0ZT86IGJvb2xlYW4sXG4gICAgYmVmb3JlQ3JvcD86IChmaWxlOiBVcGxvYWRGaWxlLCB1cGxvYWRGaWxlczogVXBsb2FkRmlsZVtdKSA9PiBib29sZWFuLFxuICAgIG1vZGFsVGl0bGU/OiBzdHJpbmcsXG4gICAgbW9kYWxXaWR0aD86IG51bWJlciB8IHN0cmluZyxcbiAgICBtb2RhbE9rPzogc3RyaW5nLFxuICAgIG1vZGFsQ2FuY2VsPzogc3RyaW5nLFxuICAgIG1vZGFsUHJvcHM/OiBNb2RhbFByb3BzLFxuICAgIG9uQ2FuY2VsPzogKCkgPT4gdm9pZCxcbiAgICBvbk9rPzogKHsgdXJsOiBzdHJpbmcsIGJsb2I6IEJsb2IsIGFyZWE6IEFyZWEgfSkgPT4gdm9pZCxcbiAgICBtb2RhbFZpc2libGU/OiBib29sZWFuLFxuICAgIGNoaWxkcmVuPzogUmVhY3QuUmVhY3RFbGVtZW50PFVwbG9hZFByb3BzPiB8IFJlYWN0LlJlYWN0RWxlbWVudDxhbnk+LFxuICAgIGNyb3BDb250ZW50PzogKGNyb3A6IFJlYWN0RWxlbWVudDxFYXN5Q3JvcFByb3BzPikgPT4gUmVhY3QuUmVhY3RFbGVtZW50PGFueT4sXG4gICAgb25Dcm9wQ29tcGxldGU/OiAoeyB1cmw6IHN0cmluZywgYmxvYjogQmxvYiwgYXJlYTogQXJlYSB9KSA9PiB2b2lkLFxuICAgIHByZWZpeENscz86IHN0cmluZyxcbiAgICBzZXJ2ZXJDcm9wOiBib29sZWFuLFxufVxuXG5cbmNvbnN0IEVhc3lDcm9wID0gZm9yd2FyZFJlZjx1bmtub3duLCBFYXN5Q3JvcFByb3BzPigocHJvcHMsIHJlZjogUmVmPENyb3BwZXI+KSA9PiB7XG4gICAgY29uc3Qge1xuICAgICAgICBzcmMsXG4gICAgICAgIGFzcGVjdCxcbiAgICAgICAgc2hhcGUsXG4gICAgICAgIGdyaWQsXG4gICAgICAgIGhhc1pvb20sXG4gICAgICAgIHpvb21WYWwsXG4gICAgICAgIHJvdGF0ZVZhbCxcbiAgICAgICAgc2V0Wm9vbVZhbCxcbiAgICAgICAgc2V0Um90YXRlVmFsLFxuICAgICAgICBvbkNvbXBsZXRlLFxuICAgICAgICBwcmVmaXhDbHMsXG4gICAgfSA9IHByb3BzO1xuXG4gICAgY29uc3QgW2Nyb3AsIHNldENyb3BdID0gdXNlU3RhdGUoeyB4OiAwLCB5OiAwIH0pO1xuXG4gICAgY29uc3Qgb25Dcm9wQ29tcGxldGUgPSB1c2VDYWxsYmFjayhcbiAgICAgICAgKF9jcm9wcGVkQXJlYSwgY3JvcHBlZEFyZWFQaXhlbHMpID0+IHtcbiAgICAgICAgICAgIGNyb3BwZWRBcmVhUGl4ZWxzLnpvb20gPSB6b29tVmFsIHx8IDA7XG4gICAgICAgICAgICBjcm9wcGVkQXJlYVBpeGVscy5yb3RhdGUgPSByb3RhdGVWYWwgfHwgMDtcbiAgICAgICAgICAgIG9uQ29tcGxldGUoY3JvcHBlZEFyZWFQaXhlbHMpO1xuICAgICAgICB9LFxuICAgICAgICBbb25Db21wbGV0ZSwgem9vbVZhbCwgcm90YXRlVmFsXSxcbiAgICApO1xuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPENyb3BwZXJcbiAgICAgICAgICAgIHJlZj17cmVmfVxuICAgICAgICAgICAgaW1hZ2U9e3NyY31cbiAgICAgICAgICAgIGFzcGVjdD17YXNwZWN0fVxuICAgICAgICAgICAgY3JvcFNoYXBlPXtzaGFwZX1cbiAgICAgICAgICAgIHNob3dHcmlkPXtncmlkfVxuICAgICAgICAgICAgem9vbVdpdGhTY3JvbGw9e2hhc1pvb219XG4gICAgICAgICAgICBjcm9wPXtjcm9wfVxuICAgICAgICAgICAgem9vbT17em9vbVZhbH1cbiAgICAgICAgICAgIHJvdGF0aW9uPXtyb3RhdGVWYWx9XG4gICAgICAgICAgICBvbkNyb3BDaGFuZ2U9e3NldENyb3B9XG4gICAgICAgICAgICBvblpvb21DaGFuZ2U9e3NldFpvb21WYWx9XG4gICAgICAgICAgICBvblJvdGF0aW9uQ2hhbmdlPXtzZXRSb3RhdGVWYWx9XG4gICAgICAgICAgICBvbkNyb3BDb21wbGV0ZT17b25Dcm9wQ29tcGxldGV9XG4gICAgICAgICAgICBjbGFzc2VzPXt7IGNvbnRhaW5lckNsYXNzTmFtZTogYCR7cHJlZml4Q2xzfS1jb250YWluZXJgLCBtZWRpYUNsYXNzTmFtZTogYCR7cHJlZml4Q2xzfS1tZWRpYWAgfX1cbiAgICAgICAgLz5cbiAgICApO1xufSk7XG5cblxuLy8g6K6+572u5Yid5aeL5YyW55qE5q+U5L6L5YC877yM5YC85pu05Yqg6LS06L+RMTAwIOaWueS+v+afpeeci+S4juaLluaLiVxuY29uc3QgYmFsYW5jZVJhdGUgPSAocmF0ZTogbnVtYmVyKTogQmFsYW5jZVJhdGUgPT4ge1xuICAgIGxldCB4ID0gMTAwOyBsZXQgeSA9IDEwMDtcbiAgICBpZiAocmF0ZSA+IDEwMCkge1xuICAgICAgICB4ID0gMTAwO1xuICAgICAgICB5ID0gMTtcbiAgICB9IGVsc2UgaWYgKHJhdGUgPCAwLjAxKSB7XG4gICAgICAgIHggPSAxO1xuICAgICAgICB5ID0gMDtcbiAgICB9IGVsc2UgaWYgKHJhdGUgPT09IDEpIHsgIC8vIOeJueauiuWAvOW/q+mAn+WkhOeQhlxuICAgICAgICB4ID0gNTA7XG4gICAgICAgIHkgPSA1MDtcbiAgICB9IGVsc2UgaWYgKHJhdGUgPT09IDAuNSkgeyAgLy8g54m55q6K5YC85b+r6YCf5aSE55CGXG4gICAgICAgIHggPSAzMDtcbiAgICAgICAgeSA9IDYwO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHJlc2lkdWFsID0ge1xuICAgICAgICAgICAgdmFsdWU6IDEwMDAwLFxuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIHk6IDAsXG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUgKHggPiAwICYmIHkgPiAwKSB7XG4gICAgICAgICAgICBpZiAoeCAvIHkgPiByYXRlKSB7XG4gICAgICAgICAgICAgICAgeC0tO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh4IC8geSA8IHJhdGUpIHtcbiAgICAgICAgICAgICAgICB5LS07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc2lkdWFsLnggPSB4O1xuICAgICAgICAgICAgICAgIHJlc2lkdWFsLnkgPSB5O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKE1hdGguYWJzKHJlc2lkdWFsLnZhbHVlKSA+IE1hdGguYWJzKHggLyB5IC0gcmF0ZSkpIHtcbiAgICAgICAgICAgICAgICByZXNpZHVhbC52YWx1ZSA9IE1hdGguYWJzKHggLyB5IC0gcmF0ZSlcbiAgICAgICAgICAgICAgICByZXNpZHVhbC54ID0geDtcbiAgICAgICAgICAgICAgICByZXNpZHVhbC55ID0geTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB4ID0gcmVzaWR1YWwueFxuICAgICAgICB5ID0gcmVzaWR1YWwueVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICB4LFxuICAgICAgICB5LFxuICAgIH1cbn1cblxuLy8g5Zu+54mH6L2s5YyW5Li6Y2FudmFzXG5jb25zdCBpbWFnZVRvQ2FudmFzID0gKGltYWdlKSA9PiB7XG4gICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgY2FudmFzLndpZHRoID0gaW1hZ2UubmF0dXJhbFdpZHRoO1xuICAgIGNhbnZhcy5oZWlnaHQgPSBpbWFnZS5uYXR1cmFsSGVpZ2h0O1xuICAgIGlmIChjdHgpIHtcbiAgICAgICAgY3R4LmRyYXdJbWFnZShpbWFnZSwgMCwgMCk7XG4gICAgICAgIHJldHVybiBjYW52YXNcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZFxufVxuXG5cblxuXG5jb25zdCBJbWdDcm9wID0gZm9yd2FyZFJlZigocHJvcHM6IEltZ0Nyb3BQcm9wcywgcmVmKSA9PiB7XG4gICAgY29uc3Qge1xuICAgICAgICBhc3BlY3QsXG4gICAgICAgIHNoYXBlLFxuICAgICAgICBncmlkLFxuICAgICAgICB6b29tLFxuICAgICAgICByb3RhdGUsXG4gICAgICAgIGJlZm9yZUNyb3AsXG4gICAgICAgIG1vZGFsVGl0bGUsXG4gICAgICAgIG1vZGFsV2lkdGgsXG4gICAgICAgIG1vZGFsT2ssXG4gICAgICAgIG1vZGFsQ2FuY2VsLFxuICAgICAgICBtb2RhbFZpc2libGUsXG4gICAgICAgIGNoaWxkcmVuLFxuICAgICAgICBhc3BlY3RDb250cm9sLFxuICAgICAgICBvbkNhbmNlbDogb25Nb2RhbENhbmNlbCxcbiAgICAgICAgb25Pazogb25Nb2RhbE9rLFxuICAgICAgICBzcmM6IGltYWdlU3JjLFxuICAgICAgICBzZXJ2ZXJDcm9wLFxuICAgICAgICBtb2RhbFByb3BzLFxuICAgICAgICBjcm9wQ29udGVudCxcbiAgICAgICAgb25Dcm9wQ29tcGxldGUsXG4gICAgICAgIHByZWZpeENsczogY3VzdG9taXplUHJlZml4Q2xzLFxuICAgIH0gPSBwcm9wcztcblxuICAgIGNvbnN0IHByZWZpeENscyA9IGdldFByZWZpeENscygnaW1hZ2UtY3JvcCcsIGN1c3RvbWl6ZVByZWZpeENscyk7XG5cbiAgICBjb25zdCBwcmVmaXhDbHNNZWRpYSA9IGAke3ByZWZpeENsc30tbWVkaWFgXG5cbiAgICBjb25zdCBoYXNab29tID0gem9vbSA9PT0gdHJ1ZTtcbiAgICBjb25zdCBoYXNSb3RhdGUgPSByb3RhdGUgPT09IHRydWU7XG5cbiAgICBjb25zdCBkZWZhdWx0UmF0ZVhZID0gKCk6IEJhbGFuY2VSYXRlID0+IHtcbiAgICAgICAgaWYgKGFzcGVjdCAmJiBhc3BlY3RDb250cm9sKSB7XG4gICAgICAgICAgICByZXR1cm4gYmFsYW5jZVJhdGUoYXNwZWN0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogNDAsXG4gICAgICAgICAgICB5OiAzMCxcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGhhc0FzcGVjdENvbnRyb2wgPSBhc3BlY3RDb250cm9sID09PSB0cnVlO1xuXG4gICAgY29uc3QgbW9kYWxUZXh0UHJvcHMgPSB7IG9rVGV4dDogbW9kYWxPaywgY2FuY2VsVGV4dDogbW9kYWxDYW5jZWwgfTtcbiAgICBPYmplY3Qua2V5cyhtb2RhbFRleHRQcm9wcykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgIGlmICghbW9kYWxUZXh0UHJvcHNba2V5XSkgZGVsZXRlIG1vZGFsVGV4dFByb3BzW2tleV07XG4gICAgfSk7XG4gICAgY29uc3QgW3NyYywgc2V0U3JjXSA9IHVzZVN0YXRlKCcnKTtcbiAgICBjb25zdCBbem9vbVZhbCwgc2V0Wm9vbVZhbF0gPSB1c2VTdGF0ZSgxKTtcbiAgICBjb25zdCBbcm90YXRlVmFsLCBzZXRSb3RhdGVWYWxdID0gdXNlU3RhdGUoMCk7XG4gICAgY29uc3QgW3hSYXRlLCBzZXRYUmF0ZV0gPSB1c2VTdGF0ZShkZWZhdWx0UmF0ZVhZKCkueCk7XG4gICAgY29uc3QgW3lSYXRlLCBzZXRZUmF0ZV0gPSB1c2VTdGF0ZShkZWZhdWx0UmF0ZVhZKCkueSk7XG5cbiAgICBjb25zdCBiZWZvcmVVcGxvYWRSZWYgPSBSZWFjdC51c2VSZWY8KGZpbGU6IFVwbG9hZEZpbGUsIEZpbGVMaXN0OiBVcGxvYWRGaWxlW10pID0+IGJvb2xlYW4gfCBQcm9taXNlTGlrZTxhbnkgfCBCbG9iPj4oKTsgLy8g6L+U5Zue5LiK5Lyg57uE5Lu255qE5LiK5Lyg5LmL5YmN55qE6ZKp5a2Q5Ye95pWwXG4gICAgY29uc3QgZmlsZVJlZiA9IFJlYWN0LnVzZVJlZjxVcGxvYWRGaWxlPigpOyAvLyDorrDlvZXmlofku7bnmoTlj4LmlbBcbiAgICBjb25zdCByZXNvbHZlUmVmID0gdXNlUmVmPCh2YWx1ZT86IGFueSB8IFByb21pc2VMaWtlPGFueT4pID0+IHZvaWQ+KCk7IC8vIOi/lOWbnuaWh+S7tuS4iuS8oOeahOaIkOWKn+aVsOaNrueahOaWueazlVxuICAgIGNvbnN0IHJlamVjdFJlZiA9IHVzZVJlZjwocmVhc29uPzogYW55KSA9PiB2b2lkPigpOyAvLyDov5Tlm57lpLHotKXmlbDmja7nmoTmlrnms5VcblxuXG4gICAgY29uc3QgY3JvcFBpeGVsc1JlZiA9IFJlYWN0LnVzZVJlZjxIVE1MSW1hZ2VFbGVtZW50PigpO1xuXG4gICAgY29uc3QgaW1hZ2VDcm9wQ2FudmFzID0gKG5hdHVyYWxNb2RhbEltZyk6IEhUTUxDYW52YXNFbGVtZW50IHwgdW5kZWZpbmVkID0+IHtcbiAgICAgICAgY29uc3QgeyBuYXR1cmFsV2lkdGgsIG5hdHVyYWxIZWlnaHQgfSA9IG5hdHVyYWxNb2RhbEltZztcbiAgICAgICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBpZiAoY3R4KSB7XG4gICAgICAgICAgICAvLyBjcmVhdGUgYSBtYXggY2FudmFzIHRvIGNvdmVyIHRoZSBzb3VyY2UgaW1hZ2UgYWZ0ZXIgcm90YXRlZFxuICAgICAgICAgICAgY29uc3QgbWF4TGVuID0gTWF0aC5zcXJ0KG5hdHVyYWxXaWR0aCAqKiAyICsgbmF0dXJhbEhlaWdodCAqKiAyKTtcbiAgICAgICAgICAgIGNhbnZhcy53aWR0aCA9IG1heExlbjtcbiAgICAgICAgICAgIGNhbnZhcy5oZWlnaHQgPSBtYXhMZW47XG4gICAgICAgICAgICAvLyByb3RhdGUgdGhlIGltYWdlXG4gICAgICAgICAgICBpZiAoaGFzUm90YXRlICYmIHJvdGF0ZVZhbCA+IDAgJiYgcm90YXRlVmFsIDwgMzYwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaGFsZk1heCA9IG1heExlbiAvIDI7XG4gICAgICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZShoYWxmTWF4LCBoYWxmTWF4KTtcbiAgICAgICAgICAgICAgICBjdHgucm90YXRlKChyb3RhdGVWYWwgKiBNYXRoLlBJKSAvIDE4MCk7XG4gICAgICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZSgtaGFsZk1heCwgLWhhbGZNYXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gZHJhdyB0aGUgc291cmNlIGltYWdlIGluIHRoZSBjZW50ZXIgb2YgdGhlIG1heCBjYW52YXNcbiAgICAgICAgICAgIGNvbnN0IGxlZnQgPSAobWF4TGVuIC0gbmF0dXJhbFdpZHRoKSAvIDI7XG4gICAgICAgICAgICBjb25zdCB0b3AgPSAobWF4TGVuIC0gbmF0dXJhbEhlaWdodCkgLyAyO1xuICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShuYXR1cmFsTW9kYWxJbWcsIGxlZnQsIHRvcCk7XG5cbiAgICAgICAgICAgIC8vIHNocmluayB0aGUgbWF4IGNhbnZhcyB0byB0aGUgY3JvcCBhcmVhIHNpemUsIHRoZW4gYWxpZ24gdHdvIGNlbnRlciBwb2ludHNcbiAgICAgICAgICAgIGNvbnN0IG1heEltZ0RhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIG1heExlbiwgbWF4TGVuKTtcbiAgICAgICAgICAgIGlmIChjcm9wUGl4ZWxzUmVmICYmIGNyb3BQaXhlbHNSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHsgd2lkdGgsIGhlaWdodCwgeCwgeSB9ID0gY3JvcFBpeGVsc1JlZi5jdXJyZW50O1xuICAgICAgICAgICAgICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICAgICAgICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgICAgICAgICAgLy8gZ2V0IHRoZSBuZXcgaW1hZ2VcbiAgICAgICAgICAgICAgICBjdHgucHV0SW1hZ2VEYXRhKG1heEltZ0RhdGEsIC1sZWZ0IC0geCwgLXRvcCAtIHkpO1xuICAgICAgICAgICAgICAgIHJldHVybiBjYW52YXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVcGxvYWRcbiAgICAgKi9cbiAgICBjb25zdCByZW5kZXJVcGxvYWQgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGNvbnN0IHVwbG9hZDogUmVhY3QuUmVhY3RFbGVtZW50PFVwbG9hZFByb3BzPiA9IEFycmF5LmlzQXJyYXkoY2hpbGRyZW4pID8gY2hpbGRyZW5bMF0gOiBjaGlsZHJlbjtcbiAgICAgICAgaWYgKHVwbG9hZCAmJiB1cGxvYWQucHJvcHMgJiYgdXBsb2FkLnR5cGUgPT09IFVwbG9hZCkge1xuICAgICAgICAgICAgY29uc3QgeyBiZWZvcmVVcGxvYWQsIGFjY2VwdCwgLi4ucmVzdFVwbG9hZFByb3BzIH0gPSB1cGxvYWQucHJvcHM7XG4gICAgICAgICAgICBiZWZvcmVVcGxvYWRSZWYuY3VycmVudCA9IGJlZm9yZVVwbG9hZDtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgLi4udXBsb2FkLFxuICAgICAgICAgICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgICAgICAgICAgIC4uLnJlc3RVcGxvYWRQcm9wcyxcbiAgICAgICAgICAgICAgICAgICAgYWNjZXB0OiBhY2NlcHQgfHwgJ2ltYWdlLyonLFxuICAgICAgICAgICAgICAgICAgICBiZWZvcmVVcGxvYWQ6IChmaWxlOiBVcGxvYWRGaWxlLCBmaWxlTGlzdDogVXBsb2FkRmlsZVtdKSA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChiZWZvcmVDcm9wICYmICFiZWZvcmVDcm9wKGZpbGUsIGZpbGVMaXN0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlUmVmLmN1cnJlbnQgPSBmaWxlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmVSZWYuY3VycmVudCA9IHJlc29sdmU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0UmVmLmN1cnJlbnQgPSByZWplY3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVhZGVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlYWRlci5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlYWRlci5yZXN1bHQgJiYgdHlwZW9mIHJlYWRlci5yZXN1bHQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0U3JjKHJlYWRlci5yZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZpbGUgaW5zdGFuY2VvZiBCbG9iKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChpbWFnZVNyYyAmJiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpKSB7XG4gICAgICAgICAgICBjb25zdCBuZXdpbWFnZSA9IG5ldyBJbWFnZSgpO1xuICAgICAgICAgICAgbmV3aW1hZ2Uuc3JjID0gaW1hZ2VTcmM7XG4gICAgICAgICAgICBuZXdpbWFnZS5jcm9zc09yaWdpbiA9IFwiYW5vbnltb3VzXCJcbiAgICAgICAgICAgIG5ld2ltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjYW52YXMgPSBpbWFnZVRvQ2FudmFzKG5ld2ltYWdlKVxuICAgICAgICAgICAgICAgIGlmIChjYW52YXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzRnVuY3Rpb24ob25Nb2RhbE9rKSAmJiBjYW52YXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFNyYyhjYW52YXMudG9EYXRhVVJMKCkpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LCBbYmVmb3JlQ3JvcCwgY2hpbGRyZW5dKTtcblxuXG5cblxuICAgIC8qKlxuICAgICAqIEVhc3lDcm9wXG4gICAgICovXG4gICAgY29uc3Qgb25Db21wbGV0ZSA9IHVzZUNhbGxiYWNrKChjcm9wcGVkQXJlYVBpeGVscykgPT4ge1xuICAgICAgICBjcm9wUGl4ZWxzUmVmLmN1cnJlbnQgPSBjcm9wcGVkQXJlYVBpeGVscztcbiAgICAgICAgaWYgKGlzRnVuY3Rpb24ob25Dcm9wQ29tcGxldGUpKSB7XG4gICAgICAgICAgICBjb25zdCBuYXR1cmFsTW9kYWxJbWc6IEVsZW1lbnQgfCBIVE1MSW1hZ2VFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC4ke3ByZWZpeENsc01lZGlhfWApO1xuICAgICAgICAgICAgY29uc3QgY2FudmFzID0gc2VydmVyQ3JvcCA/IGltYWdlVG9DYW52YXMobmF0dXJhbE1vZGFsSW1nKSA6IGltYWdlQ3JvcENhbnZhcyhuYXR1cmFsTW9kYWxJbWcpXG4gICAgICAgICAgICBpZiAoY2FudmFzKSB7XG4gICAgICAgICAgICAgICAgY2FudmFzLnRvQmxvYigoYmxvYikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgYXJlYSA9IHt9XG4gICAgICAgICAgICAgICAgICAgIGlmIChjcm9wUGl4ZWxzUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZWEgPSBjcm9wUGl4ZWxzUmVmLmN1cnJlbnRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBvbkNyb3BDb21wbGV0ZSh7IHVybDogY2FudmFzLnRvRGF0YVVSTCgpLCBibG9iLCBhcmVhIH0pXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sIFtyb3RhdGVWYWwsIGhhc1JvdGF0ZV0pO1xuXG4gICAgLyoqXG4gICAgICogQ29udHJvbHNcbiAgICAgKi9cbiAgICBjb25zdCBpc01pblpvb20gPSB6b29tVmFsID09PSBNSU5fWk9PTTtcbiAgICBjb25zdCBpc01heFpvb20gPSB6b29tVmFsID09PSBNQVhfWk9PTTtcbiAgICBjb25zdCBpc01pblJvdGF0ZSA9IHJvdGF0ZVZhbCA9PT0gTUlOX1JPVEFURTtcbiAgICBjb25zdCBpc01heFJvdGF0ZSA9IHJvdGF0ZVZhbCA9PT0gTUFYX1JPVEFURTtcblxuICAgIGNvbnN0IHN1Ylpvb21WYWwgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmICghaXNNaW5ab29tKSBzZXRab29tVmFsKHpvb21WYWwgLSBaT09NX1NURVApO1xuICAgIH0sIFtpc01pblpvb20sIHpvb21WYWxdKTtcblxuICAgIGNvbnN0IGFkZFpvb21WYWwgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIGlmICghaXNNYXhab29tKSBzZXRab29tVmFsKHpvb21WYWwgKyBaT09NX1NURVApO1xuICAgIH0sIFtpc01heFpvb20sIHpvb21WYWxdKTtcblxuICAgIGNvbnN0IHN1YlJvdGF0ZVZhbCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICAgICAgaWYgKCFpc01pblJvdGF0ZSkgc2V0Um90YXRlVmFsKHJvdGF0ZVZhbCAtIFJPVEFURV9TVEVQKTtcbiAgICB9LCBbaXNNaW5Sb3RhdGUsIHJvdGF0ZVZhbF0pO1xuXG4gICAgY29uc3QgYWRkUm90YXRlVmFsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBpZiAoIWlzTWF4Um90YXRlKSBzZXRSb3RhdGVWYWwocm90YXRlVmFsICsgUk9UQVRFX1NURVApO1xuICAgIH0sIFtpc01heFJvdGF0ZSwgcm90YXRlVmFsXSk7XG5cbiAgICAvKipcbiAgICAgKiBNb2RhbFxuICAgICAqL1xuICAgIGNvbnN0IGNsb3NlTW9kYWwgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgICAgIHNldFNyYygnJyk7XG4gICAgICAgIHNldFpvb21WYWwoMSk7XG4gICAgICAgIHNldFJvdGF0ZVZhbCgwKTtcbiAgICB9LCBbXSk7XG5cbiAgICBjb25zdCBvbkNsb3NlID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgICAgICBjbG9zZU1vZGFsKCk7XG4gICAgICAgIGlmIChpc0Z1bmN0aW9uKG9uTW9kYWxDYW5jZWwpKSB7XG4gICAgICAgICAgICBvbk1vZGFsQ2FuY2VsKClcbiAgICAgICAgfVxuICAgIH0sIFtdKVxuXG4gICAgY29uc3Qgb25PayA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgY2xvc2VNb2RhbCgpO1xuICAgICAgICBjb25zdCBuYXR1cmFsTW9kYWxJbWc6IEVsZW1lbnQgfCBIVE1MSW1hZ2VFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC4ke3ByZWZpeENsc01lZGlhfWApO1xuICAgICAgICBpZiAobmF0dXJhbE1vZGFsSW1nKSB7XG4gICAgICAgICAgICBpZiAobmF0dXJhbE1vZGFsSW1nICYmIG5hdHVyYWxNb2RhbEltZyBpbnN0YW5jZW9mIEhUTUxJbWFnZUVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50IHwgdW5kZWZpbmVkID0gc2VydmVyQ3JvcCA/IGltYWdlVG9DYW52YXMobmF0dXJhbE1vZGFsSW1nKSA6IGltYWdlQ3JvcENhbnZhcyhuYXR1cmFsTW9kYWxJbWcpXG4gICAgICAgICAgICAgICAgaWYgKGZpbGVSZWYuY3VycmVudCAmJiBjYW52YXMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgeyB0eXBlLCBuYW1lLCB1aWQgfSA9IGZpbGVSZWYuY3VycmVudDtcbiAgICAgICAgICAgICAgICAgICAgY2FudmFzLnRvQmxvYihcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzeW5jIChibG9iKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5ld0ZpbGU6IEJsb2IgfCBVcGxvYWRGaWxlIHwgbnVsbCA9IGJsb2I7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld0ZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdGaWxlLmxhc3RNb2RpZmllZERhdGUgPSBEYXRlLm5vdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ld0ZpbGUubmFtZSA9IG5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3RmlsZS51aWQgPSB1aWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3RmlsZS5pbWFnZUNyb3BBcmVhID0gY3JvcFBpeGVsc1JlZi5jdXJyZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzb2x2ZVJlZiAmJiByZWplY3RSZWYgJiYgcmVzb2x2ZVJlZi5jdXJyZW50ICYmIHJlamVjdFJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGJlZm9yZVVwbG9hZFJlZi5jdXJyZW50ICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gcmVzb2x2ZVJlZi5jdXJyZW50KG5ld0ZpbGUpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzID0gYmVmb3JlVXBsb2FkUmVmLmN1cnJlbnQobmV3RmlsZSwgW25ld0ZpbGVdKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiByZXMgIT09ICdib29sZWFuJyAmJiAhcmVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignYmVmb3JlVXBsb2FkIG11c3QgcmV0dXJuIGEgYm9vbGVhbiBvciBQcm9taXNlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlcyA9PT0gdHJ1ZSkgcmV0dXJuIHJlc29sdmVSZWYuY3VycmVudChuZXdGaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXMgPT09IGZhbHNlKSByZXR1cm4gcmVqZWN0UmVmLmN1cnJlbnQoJ25vdCB1cGxvYWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXMgJiYgdHlwZW9mIHJlcy50aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFzc2VkRmlsZSA9IGF3YWl0IHJlcztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcGFzc2VkRmlsZVR5cGUgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwocGFzc2VkRmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXNzZWRGaWxlVHlwZSA9PT0gJ1tvYmplY3QgRmlsZV0nIHx8IHBhc3NlZEZpbGVUeXBlID09PSAnW29iamVjdCBCbG9iXScpIG5ld0ZpbGUgPSBwYXNzZWRGaWxlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlUmVmLmN1cnJlbnQobmV3RmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdFJlZi5jdXJyZW50KGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAwLjQsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChpc0Z1bmN0aW9uKG9uTW9kYWxPaykgJiYgY2FudmFzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbnZhcy50b0Jsb2IoKGJsb2IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhcmVhID0ge31cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjcm9wUGl4ZWxzUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmVhID0gY3JvcFBpeGVsc1JlZi5jdXJyZW50XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbk1vZGFsT2soeyB1cmw6IGNhbnZhcy50b0RhdGFVUkwoKSwgYmxvYiwgYXJlYSB9KVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfSwgW2hhc1JvdGF0ZSwgb25DbG9zZSwgcm90YXRlVmFsXSk7XG5cblxuICAgIGNvbnN0IFJlbmRlckNyb3AgPSAoXG4gICAgICAgIDxFYXN5Q3JvcFxuICAgICAgICAgICAgcmVmPXtyZWZ9XG4gICAgICAgICAgICBzcmM9e3NyY31cbiAgICAgICAgICAgIGFzcGVjdD17YXNwZWN0Q29udHJvbCA/ICh4UmF0ZSAvIHlSYXRlKSA6IGFzcGVjdH1cbiAgICAgICAgICAgIHNoYXBlPXtzaGFwZX1cbiAgICAgICAgICAgIGdyaWQ9e2dyaWR9XG4gICAgICAgICAgICBoYXNab29tPXtoYXNab29tfVxuICAgICAgICAgICAgem9vbVZhbD17em9vbVZhbH1cbiAgICAgICAgICAgIHJvdGF0ZVZhbD17cm90YXRlVmFsfVxuICAgICAgICAgICAgc2V0Wm9vbVZhbD17c2V0Wm9vbVZhbH1cbiAgICAgICAgICAgIHNldFJvdGF0ZVZhbD17c2V0Um90YXRlVmFsfVxuICAgICAgICAgICAgb25Db21wbGV0ZT17b25Db21wbGV0ZX1cbiAgICAgICAgICAgIHByZWZpeENscz17cHJlZml4Q2xzfVxuICAgICAgICAvPlxuICAgIClcblxuICAgIHJldHVybiAoXG4gICAgICAgIDxMb2NhbGVSZWNlaXZlciBjb21wb25lbnROYW1lPVwiaW1hZ2VDcm9wXCIgZGVmYXVsdExvY2FsZT17ZGVmYXVsdExvY2FsZS5pbWFnZUNyb3B9PlxuICAgICAgICAgICAgeyhsb2NhbGU6IGltYWdlQ3JvcCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgICAgICB7cmVuZGVyVXBsb2FkKCl9XG4gICAgICAgICAgICAgICAgICAgICAgICB7c3JjICYmIG1vZGFsVmlzaWJsZSAmJiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPE1vZGFsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU9e21vZGFsVmlzaWJsZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd3JhcENsYXNzTmFtZT17YCR7cHJlZml4Q2xzfS1tb2RhbGB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPXttb2RhbFRpdGxlIHx8IGxvY2FsZSAgJiYgbG9jYWxlLmVkaXRJbWFnZSA/IGxvY2FsZS5lZGl0SW1hZ2UgOiAnRWRpdCBpbWFnZSd9IC8vIOW9k+S4jeWtmOWcqOeahOivreiogOS9v+eUqOiLseaWh1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aD17bW9kYWxXaWR0aH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzdHJveU9uQ2xvc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFza0Nsb3NhYmxlPXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgey4uLm1vZGFsUHJvcHN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uT2s9e29uT2t9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2FuY2VsPXtvbkNsb3NlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Li4ubW9kYWxUZXh0UHJvcHN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y3JvcENvbnRlbnQgPyBjcm9wQ29udGVudChSZW5kZXJDcm9wKSA6IFJlbmRlckNyb3B9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtoYXNab29tICYmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LWNvbnRyb2wgem9vbWB9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxCdXR0b24gb25DbGljaz17c3ViWm9vbVZhbH0gZGlzYWJsZWQ9e2lzTWluWm9vbX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIO+8jVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8U2xpZGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbj17TUlOX1pPT019XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heD17TUFYX1pPT019XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXA9e1pPT01fU1RFUH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3pvb21WYWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoc2xpZGVyVmFsdWU6IG51bWJlcikgPT4gKHNldFpvb21WYWwoc2xpZGVyVmFsdWUpKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxCdXR0b24gb25DbGljaz17YWRkWm9vbVZhbH0gZGlzYWJsZWQ9e2lzTWF4Wm9vbX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIO+8i1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7aGFzUm90YXRlICYmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LWNvbnRyb2wgcm90YXRlYH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEJ1dHRvbiBvbkNsaWNrPXtzdWJSb3RhdGVWYWx9IGRpc2FibGVkPXtpc01pblJvdGF0ZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKGulxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxTbGlkZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluPXtNSU5fUk9UQVRFfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXg9e01BWF9ST1RBVEV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXA9e1JPVEFURV9TVEVQfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cm90YXRlVmFsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KHNsaWRlclZhbHVlOiBudW1iZXIpID0+IChzZXRSb3RhdGVWYWwoc2xpZGVyVmFsdWUpKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxCdXR0b24gb25DbGljaz17YWRkUm90YXRlVmFsfSBkaXNhYmxlZD17aXNNYXhSb3RhdGV9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDihrtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7aGFzQXNwZWN0Q29udHJvbCAmJiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7cHJlZml4Q2xzfS1jb250cm9sIHlyYXRlYH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEJ1dHRvbiBvbkNsaWNrPXtzdWJSb3RhdGVWYWx9IGRpc2FibGVkPXtpc01pblJvdGF0ZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8U2xpZGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbj17TUlOX1JBVEV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heD17TUFYX1JBVEV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXA9e1JBVEVfU1RFUH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3lSYXRlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KHNsaWRlclZhbHVlOiBudW1iZXIpID0+IChzZXRZUmF0ZShzbGlkZXJWYWx1ZSkpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEJ1dHRvbiBvbkNsaWNrPXthZGRSb3RhdGVWYWx9IGRpc2FibGVkPXtpc01heFJvdGF0ZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDEwMFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtoYXNBc3BlY3RDb250cm9sICYmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LWNvbnRyb2wgeHJhdGVgfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QnV0dG9uIG9uQ2xpY2s9e3N1YlJvdGF0ZVZhbH0gZGlzYWJsZWQ9e2lzTWluUm90YXRlfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxTbGlkZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluPXtNSU5fUkFURX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4PXtNQVhfUkFURX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RlcD17UkFURV9TVEVQfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17eFJhdGV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoc2xpZGVyVmFsdWU6IG51bWJlcikgPT4gKHNldFhSYXRlKHNsaWRlclZhbHVlKSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QnV0dG9uIG9uQ2xpY2s9e2FkZFJvdGF0ZVZhbH0gZGlzYWJsZWQ9e2lzTWF4Um90YXRlfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMTAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L01vZGFsPlxuICAgICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfX1cbiAgICAgICAgPC9Mb2NhbGVSZWNlaXZlcj5cbiAgICApO1xufSkgYXMgQ29tcG91bmRlZENvbXBvbmVudFxuXG5cbkltZ0Nyb3AuZGVmYXVsdFByb3BzID0ge1xuICAgIHNoYXBlOiBzaGFwZUNyb3Blci5yZWN0LFxuICAgIGdyaWQ6IGZhbHNlLFxuICAgIHpvb206IHRydWUsXG4gICAgcm90YXRlOiBmYWxzZSxcbiAgICBtb2RhbFdpZHRoOiA2MDAsXG4gICAgbW9kYWxWaXNpYmxlOiB0cnVlLFxuICAgIHNlcnZlckNyb3A6IGZhbHNlLFxufTtcblxuSW1nQ3JvcC5BdmF0YXJVcGxvYWRlciA9IEF2YXRhclVwbG9hZGVyXG5cbmV4cG9ydCBkZWZhdWx0IEltZ0Nyb3A7XG5cbiJdLCJ2ZXJzaW9uIjozfQ==