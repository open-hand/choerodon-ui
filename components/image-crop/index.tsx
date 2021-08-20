import React, { useState, useCallback, useRef, forwardRef, Ref, ReactElement } from 'react';
import Cropper from 'react-easy-crop';
import isFunction from 'lodash/isFunction';
import { getPrefixCls } from '../configure';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import Modal, { ModalProps } from '../modal';
import { UploadFile, UploadProps } from '../upload/interface';
import defaultLocale from '../locale-provider/default';
import Button from '../button';
import Upload from '../upload';
import AvatarUploader from './avatarUpload';
import { imageCrop } from '../locale-provider'

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

interface CompoundedComponent
    extends React.ForwardRefExoticComponent<ImgCropProps> {
    AvatarUploader: typeof AvatarUploader;
}

export interface ImageCropLocale {
    imageCrop?: string;
}

export enum shapeCroper {
    rect = 'rect',
    round = 'round',
}

export declare type Area = {
    width: number;
    height: number;
    x: number;
    y: number;
    zoom: number;
    rotation: number;
};

export interface BalanceRate {
    x: number;
    y: number;
}

export interface EasyCropProps {
    src?: string,
    aspect?: number,
    shape?: shapeCroper,
    grid?: boolean,
    hasZoom?: boolean,
    zoomVal?: number,
    rotateVal?: number,
    setZoomVal?: (value: number) => void,
    setRotateVal?: (rotation: number) => void,
    onComplete: (croppedAreaPixels: Area) => void,
    prefixCls?: string,
}

export interface ImgCropProps {
    aspect?: number,
    shape?: shapeCroper,
    zoom?: boolean,
    grid?: boolean,
    src?: string,
    rotate?: boolean,
    beforeCrop?: (file: UploadFile, uploadFiles: UploadFile[]) => boolean,
    modalTitle?: string,
    modalWidth?: number | string,
    modalOk?: string,
    modalCancel?: string,
    modalProps?: ModalProps,
    onCancel?: () => void,
    onOk?: ({ url: string, blob: Blob, area: Area }) => void,
    modalVisible?: boolean,
    children?: React.ReactElement<UploadProps> | React.ReactElement<any>,
    cropContent?: (crop: ReactElement<EasyCropProps>) => React.ReactElement<any>,
    onCropComplete?: ({ url: string, blob: Blob, area: Area }) => void,
    prefixCls?: string,
    serverCrop: boolean,
    rotateStep?: number,
}


const EasyCrop = forwardRef<unknown, EasyCropProps>((props, ref: Ref<Cropper>) => {
    const {
        src,
        aspect,
        shape,
        grid,
        hasZoom,
        zoomVal,
        rotateVal,
        setZoomVal,
        setRotateVal,
        onComplete,
        prefixCls,
    } = props;

    const [crop, setCrop] = useState({ x: 0, y: 0 });

    const onCropComplete = useCallback(
        (_croppedArea, croppedAreaPixels) => {
            croppedAreaPixels.zoom = zoomVal || 0;
            croppedAreaPixels.rotate = rotateVal || 0;
            onComplete(croppedAreaPixels);
        },
        [onComplete, zoomVal, rotateVal],
    );

    return (
        <Cropper
            ref={ref}
            image={src}
            aspect={aspect}
            cropShape={shape}
            showGrid={grid}
            zoomWithScroll={hasZoom}
            crop={crop}
            zoom={zoomVal}
            rotation={rotateVal}
            onCropChange={setCrop}
            onZoomChange={setZoomVal}
            onRotationChange={setRotateVal}
            onCropComplete={onCropComplete}
            classes={{ containerClassName: `${prefixCls}-container`, mediaClassName: `${prefixCls}-media` }}
        />
    );
});

// 图片转化为canvas
const imageToCanvas = (image) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    if (ctx) {
        ctx.drawImage(image, 0, 0);
        return canvas
    }
    return undefined
}




const ImgCrop = forwardRef((props: ImgCropProps, ref) => {
    const {
        aspect,
        shape,
        grid,
        zoom,
        rotate,
        rotateStep = 90,
        beforeCrop,
        modalTitle,
        modalWidth,
        modalOk,
        modalCancel,
        modalVisible,
        children,
        onCancel: onModalCancel,
        onOk: onModalOk,
        src: imageSrc,
        serverCrop,
        modalProps,
        cropContent,
        onCropComplete,
        prefixCls: customizePrefixCls,
    } = props;

    const prefixCls = getPrefixCls('image-crop', customizePrefixCls);

    const prefixClsMedia = `${prefixCls}-media`

    const hasZoom = zoom === true;
    const hasRotate = rotate === true;

    const modalTextProps = { okText: modalOk, cancelText: modalCancel };
    Object.keys(modalTextProps).forEach((key) => {
        if (!modalTextProps[key]) delete modalTextProps[key];
    });
    const [src, setSrc] = useState('');
    const [zoomVal, setZoomVal] = useState(1);
    const [rotateVal, setRotateVal] = useState(0);

    const beforeUploadRef = React.useRef<(file: UploadFile, FileList: UploadFile[]) => boolean | PromiseLike<any | Blob>>(); // 返回上传组件的上传之前的钩子函数
    const fileRef = React.useRef<UploadFile>(); // 记录文件的参数
    const resolveRef = useRef<(value?: any | PromiseLike<any>) => void>(); // 返回文件上传的成功数据的方法
    const rejectRef = useRef<(reason?: any) => void>(); // 返回失败数据的方法


    const cropPixelsRef = React.useRef<HTMLImageElement>();

    const imageCropCanvas = (naturalModalImg): HTMLCanvasElement | undefined => {
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
    }

    /**
     * Upload
     */
    const renderUpload = useCallback(() => {
        const upload: React.ReactElement<UploadProps> = Array.isArray(children) ? children[0] : children;
        if (upload && upload.props && upload.type === Upload) {
            const { beforeUpload, accept, ...restUploadProps } = upload.props;
            beforeUploadRef.current = beforeUpload;
            return {
                ...upload,
                props: {
                    ...restUploadProps,
                    accept: accept || 'image/*',
                    beforeUpload: (file: UploadFile, fileList: UploadFile[]) =>
                        new Promise((resolve, reject) => {
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
            newimage.crossOrigin = "anonymous"
            newimage.onload = function () {
                const canvas = imageToCanvas(newimage)
                if (canvas) {
                    if (isFunction(onModalOk) && canvas) {
                        setSrc(canvas.toDataURL())
                    }
                }
            }
        }
    }, [beforeCrop, children]);




    /**
     * EasyCrop
     */
    const onComplete = useCallback((croppedAreaPixels) => {
        cropPixelsRef.current = croppedAreaPixels;
        if (isFunction(onCropComplete)) {
            const naturalModalImg: Element | HTMLImageElement | null = document.querySelector(`.${prefixClsMedia}`);
            const canvas = serverCrop ? imageToCanvas(naturalModalImg) : imageCropCanvas(naturalModalImg)
            if (canvas) {
                canvas.toBlob((blob) => {
                    let area = {}
                    if (cropPixelsRef.current) {
                        area = cropPixelsRef.current
                    }
                    onCropComplete({ url: canvas.toDataURL(), blob, area })
                })
            }
        }
    }, [rotateVal, hasRotate]);

    /**
     * Controls
     */
    const MIN_ROTATE = 0;
    const MAX_ROTATE = 360;

    const isMinZoom = zoomVal <= MIN_ZOOM;
    const isMaxZoom = zoomVal >= MAX_ZOOM;
    const isMinRotate = rotateVal === MIN_ROTATE;
    const isMaxRotate = rotateVal >= MAX_ROTATE;

    const subZoomVal = useCallback(() => {
        if (!isMinZoom) setZoomVal(zoomVal - ZOOM_STEP);
    }, [isMinZoom, zoomVal]);

    const addZoomVal = useCallback(() => {
        if (!isMaxZoom) setZoomVal(zoomVal + ZOOM_STEP);
    }, [isMaxZoom, zoomVal]);

    const addRotateVal = useCallback(() => {
        if (!isMaxRotate) {
            setRotateVal(rotateVal + rotateStep);
        } else {
            setRotateVal(MIN_ROTATE + rotateStep);
        }
    }, [isMaxRotate, rotateVal]);

    const initVal = useCallback(() => {
        if(!isMinZoom || !isMinRotate) {
            setZoomVal(MIN_ZOOM);
            setRotateVal(MIN_ROTATE);
        }
    }, [zoomVal, rotateVal])

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
            onModalCancel()
        }
    }, [])

    const onOk = useCallback(async () => {
        closeModal();
        const naturalModalImg: Element | HTMLImageElement | null = document.querySelector(`.${prefixClsMedia}`);
        if (naturalModalImg) {
            if (naturalModalImg && naturalModalImg instanceof HTMLImageElement) {
                const canvas: HTMLCanvasElement | undefined = serverCrop ? imageToCanvas(naturalModalImg) : imageCropCanvas(naturalModalImg)
                if (fileRef.current && canvas) {
                    const { type, name, uid } = fileRef.current;
                    canvas.toBlob(
                        async (blob) => {
                            let newFile: Blob | UploadFile | null = blob;
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
                                    if (typeof beforeUploadRef.current !== 'function') return resolveRef.current(newFile);

                                  // @ts-ignore
                                    const res = beforeUploadRef.current(newFile, [newFile]);

                                    if (typeof res !== 'boolean' && !res) {
                                        console.error('beforeUpload must return a boolean or Promise');
                                        return;
                                    }
                                    if (res === true) return resolveRef.current(newFile);
                                    if (res === false) return rejectRef.current('not upload');
                                    if (res && typeof res.then === 'function') {
                                        try {
                                            const passedFile = await res;
                                            const passedFileType = Object.prototype.toString.call(passedFile);
                                            if (passedFileType === '[object File]' || passedFileType === '[object Blob]') newFile = passedFile;
                                            resolveRef.current(newFile);
                                        } catch (err) {
                                            rejectRef.current(err);
                                        }
                                    }
                                }
                            }
                        },
                        type,
                        0.4,
                    );
                }
                if (isFunction(onModalOk) && canvas) {
                    canvas.toBlob((blob) => {
                        let area = {}
                        if (cropPixelsRef.current) {
                            area = cropPixelsRef.current
                        }
                        onModalOk({ url: canvas.toDataURL(), blob, area })
                    })
                }
            }
        }

    }, [hasRotate, onClose, rotateVal]);


    const RenderCrop = (
        <EasyCrop
            ref={ref}
            src={src}
            aspect={aspect}
            shape={shape}
            grid={grid}
            hasZoom={hasZoom}
            zoomVal={zoomVal}
            rotateVal={rotateVal}
            setZoomVal={setZoomVal}
            setRotateVal={setRotateVal}
            onComplete={onComplete}
            prefixCls={prefixCls}
        />
    )

    return (
        <LocaleReceiver componentName="imageCrop" defaultLocale={defaultLocale.imageCrop}>
            {(locale: imageCrop) => {
                return (
                    <>
                        {renderUpload()}
                        {src && modalVisible && (
                            <Modal
                                visible={modalVisible}
                                wrapClassName={`${prefixCls}-modal`}
                                title={modalTitle || locale  && locale.editImage ? locale.editImage : 'Edit image'} // 当不存在的语言使用英文
                                width={modalWidth}
                                destroyOnClose
                                maskClosable={false}
                                {...modalProps}
                                onOk={onOk}
                                onCancel={onClose}
                                {...modalTextProps}
                            >
                                {cropContent ? cropContent(RenderCrop) : RenderCrop}
                                <div className={`${prefixCls}-control`}>
                                    {hasZoom && (
                                        <>
                                            <Button icon="zoom_in" onClick={addZoomVal} disabled={isMaxZoom} />
                                            <Button icon="zoom_out" onClick={subZoomVal} disabled={isMinZoom} />
                                        </>
                                    )}
                                    {
                                        hasRotate
                                        &&
                                        <Button
                                            icon={rotateStep === 90 ? "play_90" : "rotate_right"}
                                            onClick={addRotateVal}
                                        />
                                    }
                                    {hasZoom && <Button onClick={initVal}>1:1</Button>}
                                </div>
                            </Modal>
                        )}
                    </>
                )
            }}
        </LocaleReceiver>
    );
}) as CompoundedComponent


ImgCrop.defaultProps = {
    shape: shapeCroper.rect,
    grid: false,
    zoom: true,
    rotate: false,
    modalWidth: 600,
    modalVisible: true,
    serverCrop: false,
};

ImgCrop.AvatarUploader = AvatarUploader

export default ImgCrop;

