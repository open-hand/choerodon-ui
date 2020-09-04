/**
 * 裁剪组件
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getPrefixCls } from '../configure';

let relativeX = 0;
let relativeY = 0;
let resizeMode;
let resizeX = 0;
let resizeY = 0;
let resizeSize = 0;

/**
 * when can't be exact division it will return false
 * @param rotate 
 */
function rotateFlag(rotate) {
    return (rotate / 90) % 2 !== 0;
}

export interface CropValue {
    height: number;
    width: number;
    x: number;
    y: number;
}

export type Size = {
    width: number
    height: number
}

export interface ImageCrop extends HTMLImageElement {
    src: string;
}


export interface CropProps {
    crossOrigin?: "anonymous" | "use-credentials"; //   如果使用这个值的话就会在请求中的header中的带上Origin属性，但请求不会带上cookie和其他的一些认证信息 | 这个就同时会在跨域请求中带上cookie和其他的一些认证信息
    src?: string; // 图片
    editorWidth: number; // 编辑区域的宽度
    editorHeight: number; // 编辑区域的高度
    minRectSize: number; // 最小的裁剪区域
    defaultRectSize: number; // 默认最小的
    rotation?: number; // 度数
    onRotationChange?: (rate: number) => void; // 裁剪度数的变化触发
    onComplete?: (value: any) => void; // 裁剪完成触发
    onCropChange?: (crop: any) => void; // 裁剪区域变化时候触发
    prefixCls?: string, // 自定义样式前缀
}

export default class Crop extends Component<CropProps, any> {
    static propTypes = {
        crossOrigin: PropTypes.string, // 是否跨域
        src: PropTypes.string,// 图片
        rotation: PropTypes.number,// 旋转度数
        onRotationChange: PropTypes.func, // 裁剪度数的变化触发
        onComplete: PropTypes.func,// 裁剪完成触发
        onCropChange: PropTypes.func, // 裁剪区域变化时候触发
        prefixCls: PropTypes.string, // 自定义样式前缀
        editorWidth: PropTypes.number,
        editorHeight: PropTypes.number,
        minRectSize: PropTypes.number, // 最小的裁剪区域
        defaultRectSize: PropTypes.number, // 默认最小的
    };

    static defaultProps = {
        editorWidth: 540,
        editorHeight: 300,
        minRectSize: 80,
        defaultRectSize: 200,
    };



    constructor(props: CropProps) {
        super(props);
        if (props.src) {
            this.loadImage(props.src)
        }
        const rotate = typeof props.rotation !== 'undefined' ? props.rotation : 0;
        const defaultRectSize = typeof props.defaultRectSize !== 'undefined' ? props.defaultRectSize : 200;
        this.state = {
            img: null,
            size: defaultRectSize,
            x: 0,
            y: 0,
            rotate,
            imageStyle: {},
        };

        if ('onMaskClick' in props) {
            console.warn('`onMaskClick` are removed, please use `onClose` instead.');
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const { rotation, onRotationChange, src } = this.props;
        const { img } = prevState;
        if (img && rotation && prevProps.rotation !== rotation) {
            // 旋转触发方法
            if (onRotationChange) {
                onRotationChange(rotation)
            }
            this.initImageSize(img, rotation);
        }
        // 修改 src 触发方法
        if (src && prevProps.src !== src) {
            this.loadImage(src)
        }
    }

    handleMoveStart = ({ clientX, clientY }) => {
        const { x, y } = this.state;
        relativeX = clientX - x;
        relativeY = clientY - y;
        document.addEventListener('mousemove', this.handleMoving);
        document.addEventListener('mouseup', this.handleMoveEnd);
    };

    handleMoving = ({ clientX, clientY }) => {
        const { size, imageStyle: { width, height }, rotate } = this.state;
        const { onComplete } = this.props;
        const flag = rotateFlag(rotate);
        const minX = flag ? (width - height) / 2 : 0; // if can't be exact division min is 0
        const minY = flag ? (height - width) / 2 : 0; // if can't be exact division min is 0
        const maxX = width - size - minX; // the max width is image minus the size , there would minus the sizeWidth
        const maxY = height - size - minY; // the max height is image minus the size , there would minus the sizeHeight 
        const movingXY = {
            x: Math.min(Math.max(minX, clientX - relativeX), maxX),
            y: Math.min(Math.max(minY, clientY - relativeY), maxY),
        }

        if (onComplete) {
            const completeXY = { ...movingXY, size }
            onComplete(completeXY)
        }
        this.setState(movingXY);

    };

    handleMoveEnd = () => {
        document.removeEventListener('mousemove', this.handleMoving);
        document.removeEventListener('mouseup', this.handleMoveEnd);
    };

    handleResizeStart = (e) => {
        e.stopPropagation();
        const { currentTarget, clientX, clientY } = e; // mouse of body the x y position
        const { x, y, size } = this.state;
        relativeX = clientX - x; // relativeX 
        relativeY = clientY - y; // relativeY
        resizeMode = currentTarget.className;   // to confirm the witch border on handle 
        resizeX = x;        // x of image position
        resizeY = y;        // y of image position
        resizeSize = size;   // size of crop area , TODO change to resizeHeight resizeWidth 
        document.addEventListener('mousemove', this.handleResizing);
        document.addEventListener('mouseup', this.handleResizeEnd);
    };

    handleResizing = ({ clientX, clientY }) => {
        const { onComplete, onCropChange, minRectSize } = this.props
        const { imageStyle: { width, height }, rotate } = this.state;
        const flag = rotateFlag(rotate);
        const newX = clientX - relativeX; // mouse x diffrence from before 
        const newY = clientY - relativeY; // mouse y diffrence from before
        let x = resizeX;
        let y = resizeY;
        let size;
        if (resizeMode === 'lt') {
            const relative = Math.min(newX - resizeX, newY - resizeY);
            x += relative;
            y += relative;
            size = (resizeSize - x) + resizeX;
        } else if (resizeMode === 'rt') {
            const relative = Math.min(resizeX - newX, newY - resizeY);
            y += relative;
            size = (resizeSize - y) + resizeY;
        } else if (resizeMode === 'lb') {
            const relative = Math.min(newX - resizeX, resizeY - newY);
            x += relative;
            size = (resizeSize - x) + resizeX;
        } else {
            const relative = Math.min(resizeX - newX, resizeY - newY);
            size = resizeSize - relative;
        }
        const minX = flag ? (width - height) / 2 : 0;
        const minY = flag ? (height - width) / 2 : 0;
        const maxWidth = flag ? ((width - height) / 2) + height : width;
        const maxHeight = flag ? ((height - width) / 2) + width : height;
        x = Math.min(Math.max(minX, x), (resizeSize - minRectSize) + resizeX);
        y = Math.min(Math.max(minY, y), (resizeSize - minRectSize) + resizeY);

        const cropSize = {
            x,
            y,
            size: Math.max(Math.min(size, maxWidth - x, maxHeight - y), minRectSize),
        }
        if (onComplete) {
            onComplete(cropSize)
        }
        if (onCropChange) {
            onCropChange(cropSize)
        }
        this.setState(cropSize);
    };

    handleResizeEnd = () => {
        document.removeEventListener('mousemove', this.handleResizing);
        document.removeEventListener('mouseup', this.handleResizeEnd);
    };

    /** *
     * 永远计算理论上来说必须用sin这种方法来计算了
     * 最大高度和最小高度
     */

    /**
*
* Returns an x,y point once rotated around xMid,yMid
*/
    rotateAroundMidPoint = (
        x: number,
        y: number,
        xMid: number,
        yMid: number,
        degrees: number,
    ): [number, number] => {
        const cos = Math.cos
        const sin = Math.sin
        const radian = (degrees * Math.PI) / 180 // Convert to radians
        // Subtract midpoints, so that midpoint is translated to origin
        // and add it in the end again
        const xr = (x - xMid) * cos(radian) - (y - yMid) * sin(radian) + xMid
        const yr = (x - xMid) * sin(radian) + (y - yMid) * cos(radian) + yMid

        return [xr, yr]
    }

    /**
     * Returns the new bounding area of a rotated rectangle.
     */
    translateSize = (width: number, height: number, rotation: number): Size => {
        const centerX = width / 2
        const centerY = height / 2

        const outerBounds = [
            this.rotateAroundMidPoint(0, 0, centerX, centerY, rotation),
            this.rotateAroundMidPoint(width, 0, centerX, centerY, rotation),
            this.rotateAroundMidPoint(width, height, centerX, centerY, rotation),
            this.rotateAroundMidPoint(0, height, centerX, centerY, rotation),
        ]

        const minX = Math.min(...outerBounds.map(p => p[0]))
        const maxX = Math.max(...outerBounds.map(p => p[0]))
        const minY = Math.min(...outerBounds.map(p => p[1]))
        const maxY = Math.max(...outerBounds.map(p => p[1]))

        return { width: maxX - minX, height: maxY - minY }
    }


    initImageSize(img, rotate = 0) {
        const { editorWidth, editorHeight, defaultRectSize, minRectSize } = this.props;
        const { naturalWidth, naturalHeight } = img;
        // to judge the 
        const flag = rotateFlag(rotate);
        let width = flag ? naturalHeight : naturalWidth;
        let height = flag ? naturalWidth : naturalHeight;
        if (width < minRectSize || height < minRectSize) {
            if (width > height) {
                width = (width / height) * minRectSize;
                height = minRectSize;
            } else {
                height = (height / width) * minRectSize;
                width = minRectSize;
            }
        } else if (width > editorWidth || height > editorHeight) {
            if (width / editorWidth > height / editorHeight) {
                height = (height / width) * editorWidth;
                width = editorWidth;
            } else {
                width = (width / height) * editorHeight;
                height = editorHeight;
            }
        }
        if (flag) {
            const tmp = width;
            width = height;
            height = tmp;
        }
        const size = Math.min(defaultRectSize, width, height);
        const CropperInfo = {
            img,
            imageStyle: {
                width,
                height,
                top: (editorHeight - height) / 2,
                left: (editorWidth - width) / 2,
                transform: `rotate(${rotate}deg)`,
            },
            size,
            x: (width - size) / 2,
            y: (height - size) / 2,
            rotate,
        }

        this.setState(CropperInfo);
    }

    loadImage(src) {
        if(typeof window !== 'undefined'){
            const { crossOrigin, rotation } = this.props;
            const img: ImageCrop = new Image();
            img.src = src;
            if (crossOrigin === 'anonymous' || crossOrigin === 'use-credentials') {
                img.crossOrigin = 'anonymous';
            }
            img.onload = () => {
                const imgRotate = rotation || 0;
                this.initImageSize(img, imgRotate);
            };
        }
    }

    render() {
        const { img, imageStyle, size, x, y } = this.state;
        const { editorHeight, editorWidth, prefixCls: customizePrefixCls } = this.props;
        const prefixCls = getPrefixCls('avatar-crop', customizePrefixCls);
        if (img) {
            const { src } = img;
            const { left, top } = imageStyle;
            const style = {
                width: editorWidth,
                height: editorHeight,
            };
            // 通过border位置来控制裁剪高宽
            const maskStyle = {
                borderTopWidth: y + top,
                borderRightWidth: editorWidth - x - left - size,
                borderBottomWidth: editorHeight - y - top - size,
                borderLeftWidth: x + left,
            };
            return (<div className={`${prefixCls}-edit`} style={style}>
                <img alt="" src={src} style={imageStyle} />
                <div className={`${prefixCls}-edit-mask`} style={maskStyle}>
                    <div onMouseDown={this.handleMoveStart}>
                        <i className="lt" onMouseDown={this.handleResizeStart} />
                        <i className="rt" onMouseDown={this.handleResizeStart} />
                        <i className="lb" onMouseDown={this.handleResizeStart} />
                        <i className="rb" onMouseDown={this.handleResizeStart} />
                    </div>
                </div>
            </div>)
        }
        return null
    }
}
