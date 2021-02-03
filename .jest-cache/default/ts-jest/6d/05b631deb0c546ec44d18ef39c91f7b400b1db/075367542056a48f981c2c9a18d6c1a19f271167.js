/**
 * 裁剪头像上传
 */
import React, { Component } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import Button from '../button';
import Icon from '../icon';
import Modal from '../modal';
import message from '../message';
import Upload from '../upload';
import Crop from './Crop';
import { getPrefixCls } from '../configure';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import defaultLocale from '../locale-provider/default';
const Dragger = Upload.Dragger;
const { round } = Math;
function rotateFlag(rotate) {
    return (rotate / 90) % 2 !== 0;
}
let Avatarlocale = defaultLocale.imageCrop;
export default class AvatarUploader extends Component {
    constructor(props) {
        super(props);
        this.handleOk = () => {
            const { x, y, size, rotate, file, imageStyle: { width, height }, img: { naturalWidth } } = this.state;
            const { uploadUrl, uploadFaild, uploadError, handleUpload, axiosConfig } = this.props;
            const flag = rotateFlag(rotate);
            const scale = naturalWidth / width;
            const startX = flag ? x - ((width - height) / 2) : x;
            const startY = flag ? y + ((width - height) / 2) : y;
            const QsData = {
                rotate,
                startX: round(startX * scale),
                startY: round(startY * scale),
                endX: round(size * scale),
                endY: round(size * scale),
            };
            const qs = JSON.stringify(QsData);
            const data = new FormData();
            data.append('file', file);
            this.setState({ submitting: true });
            if (uploadUrl) {
                let config;
                if (axiosConfig) {
                    config = axiosConfig;
                }
                axios.post(`${uploadUrl}?${qs}`, data, config)
                    .then((res) => {
                    // @ts-ignore
                    if (res.success) {
                        this.uploadOk(res);
                    }
                    else {
                        message.error(Avatarlocale.avatarUploadError);
                        this.setState({ submitting: false });
                        if (uploadFaild) {
                            uploadFaild();
                        }
                    }
                })
                    .catch((error) => {
                    message.error(`${Avatarlocale.avatarServerError}${error}`);
                    this.setState({ submitting: false });
                    if (uploadError) {
                        uploadError(error);
                    }
                });
            }
            if (handleUpload) {
                QsData.file = file;
                handleUpload(QsData);
            }
        };
        this.handleCancel = () => {
            this.close();
        };
        const { defaultRectSize } = props;
        this.state = {
            submitting: false,
            img: null,
            file: '',
            imageStyle: { width: 0, height: 0 },
            size: defaultRectSize,
            x: 0,
            y: 0,
            rotate: 0,
        };
    }
    close() {
        const { onClose } = this.props;
        this.setState({
            img: null,
        });
        if (onClose) {
            onClose(false);
        }
    }
    uploadOk(res) {
        const { onUploadOk } = this.props;
        this.setState({
            img: null,
            submitting: false,
        }, () => {
            if (onUploadOk) {
                onUploadOk(res);
            }
        });
    }
    initImageSize(img, rotate = 0) {
        const { editorWidth, editorHeight, minRectSize, defaultRectSize } = this.props;
        const { naturalWidth, naturalHeight } = img;
        const flag = rotateFlag(rotate);
        let width = flag ? naturalHeight : naturalWidth;
        let height = flag ? naturalWidth : naturalHeight;
        if (width < minRectSize || height < minRectSize) {
            if (width > height) {
                width = (width / height) * minRectSize;
                height = minRectSize;
            }
            else {
                height = (height / width) * minRectSize;
                width = minRectSize;
            }
        }
        else if (width > editorWidth || height > editorHeight) {
            if (width / editorWidth > height / editorHeight) {
                height = (height / width) * editorWidth;
                width = editorWidth;
            }
            else {
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
        this.setState({
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
        });
    }
    onComplete(imageState) {
        const { cropComplete } = this.props;
        this.setState(imageState);
        if (cropComplete) {
            cropComplete(imageState);
        }
    }
    loadImage(src) {
        if (typeof window !== 'undefined') {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                this.initImageSize(img);
            };
        }
    }
    getPreviewProps(previewSize) {
        const { size, x, y, img: { src }, rotate, imageStyle: { width, height } } = this.state;
        const previewScale = previewSize / size;
        let radius = (rotate % 360) / 90;
        let px = -x;
        let py = -y;
        if (radius < 0)
            radius += 4;
        if (radius === 1) {
            py = ((x + ((height - width) / 2)) - height) + size;
            px = ((height - width) / 2) - y;
        }
        else if (radius === 2) {
            px = (x - width) + size;
            py = (y - height) + size;
        }
        else if (radius === 3) {
            px = ((y + ((width - height) / 2)) - width) + size;
            py = ((width - height) / 2) - x;
        }
        return {
            style: {
                width: previewSize,
                height: previewSize,
                backgroundImage: `url('${src}')`,
                backgroundSize: `${width * previewScale}px ${height * previewScale}px`,
                backgroundPosition: `${px * previewScale}px ${py * previewScale}px`,
                transform: `rotate(${rotate}deg)`,
            },
        };
    }
    renderPreviewItem(previewSizeList) {
        const { prefixCls: customizePrefixCls } = this.props;
        const prefixCls = getPrefixCls('avatar-crop-edit', customizePrefixCls);
        const dataList = previewSizeList.map((itemSize) => {
            return (React.createElement("div", { key: itemSize, className: `${prefixCls}-preview-item` },
                React.createElement("i", Object.assign({}, this.getPreviewProps(itemSize))),
                React.createElement("p", null, `${itemSize}＊${itemSize}`)));
        });
        return dataList;
    }
    renderEditor(props) {
        const { img, file, rotate } = this.state;
        const { prefixCls: customizePrefixCls, previewList, editorWidth, editorHeight, defaultRectSize, minRectSize, subTitle, previewTitle, reloadTitle } = this.props;
        const { src } = img;
        const prefixCls = getPrefixCls('avatar-crop-edit', customizePrefixCls);
        return (React.createElement("div", null,
            React.createElement("h3", { className: `${prefixCls}-text` },
                React.createElement("span", null, subTitle || Avatarlocale.avatarUpload),
                React.createElement(Icon, { type: "keyboard_arrow_right" }),
                React.createElement("span", null, file.name)),
            React.createElement("h4", { className: `${prefixCls}-hint` },
                React.createElement("span", null, Avatarlocale.avatarReminder)),
            React.createElement("div", { className: `${prefixCls}-wraper` },
                React.createElement(Crop, { defaultRectSize: defaultRectSize, minRectSize: minRectSize, editorHeight: editorHeight, editorWidth: editorWidth, rotation: rotate, src: src, onComplete: (stateImage) => this.onComplete(stateImage) }),
                React.createElement("div", { className: `${prefixCls}-toolbar` },
                    React.createElement(Button, { icon: "replay_90", shape: "circle", onClick: () => this.setState({ rotate: rotate - 90 }) }),
                    React.createElement(Button, { icon: "play_90", shape: "circle", onClick: () => this.setState({ rotate: rotate + 90 }) })),
                React.createElement("div", { className: `${prefixCls}-preview` },
                    React.createElement("h5", { className: `${prefixCls}-preview-title` },
                        React.createElement("span", null, previewTitle || Avatarlocale.preview)),
                    this.renderPreviewItem(previewList))),
            React.createElement("div", { className: `${prefixCls}-button` },
                React.createElement(Upload, Object.assign({}, props),
                    React.createElement(Button, { icon: "file_upload", type: "primary" },
                        React.createElement("span", null, reloadTitle || Avatarlocale.reUpload))))));
    }
    getUploadProps() {
        const { limit: { size: limitSize, type }, uploadProps } = this.props;
        const typeLimit = type.split(',').map((item) => `image/${item}`).join(',');
        return {
            multiple: false,
            name: 'file',
            accept: typeLimit,
            headers: {
                Authorization: `bearer`,
            },
            showUploadList: false,
            ...uploadProps,
            beforeUpload: (file) => {
                const { size } = file;
                if (size > limitSize * 1024) {
                    message.warning(Avatarlocale.imageTooLarge);
                    return false;
                }
                this.setState({ file });
                const windowURL = window.URL || window.webkitURL;
                if (windowURL && windowURL.createObjectURL) {
                    this.loadImage(windowURL.createObjectURL(file));
                    return false;
                }
                return false;
            },
            onChange: ({ file }) => {
                const { status, response } = file;
                if (status === 'done') {
                    this.loadImage(response);
                }
                else if (status === 'error') {
                    message.error(Avatarlocale.imageUploadError);
                }
            },
        };
    }
    renderContainer() {
        const { prefixCls: customizePrefixCls, limit: { size: limitSize, type } } = this.props;
        const { img } = this.state;
        const prefixCls = getPrefixCls('avatar-crop', customizePrefixCls);
        const props = this.getUploadProps();
        return img ? (this.renderEditor(props)) :
            (React.createElement(Dragger, Object.assign({ className: `${prefixCls}-dragger` }, props),
                React.createElement(Icon, { type: "inbox" }),
                React.createElement("h3", { className: `${prefixCls}-dragger-text` },
                    React.createElement("span", null, Avatarlocale.imageDragHere)),
                React.createElement("h4", { className: `${prefixCls}-dragger-hint` },
                    React.createElement("span", null, `${Avatarlocale.pleaseUpload}${limitSize / 1024}M,${Avatarlocale.uploadType}${type}${Avatarlocale.picture}`))));
    }
    render() {
        const { visible, modalProps, title } = this.props;
        const { img, submitting } = this.state;
        const modalFooter = [
            React.createElement(Button, { disabled: submitting, key: "cancel", onClick: this.handleCancel },
                React.createElement("span", null, Avatarlocale.cancelButton)),
            React.createElement(Button, { key: "save", type: "primary", disabled: !img, loading: submitting, onClick: this.handleOk },
                React.createElement("span", null, Avatarlocale.saveButton)),
        ];
        return (React.createElement(LocaleReceiver, { componentName: "imageCrop", defaultLocale: defaultLocale.imageCrop }, (locale, localeCode) => {
            Avatarlocale = (localeCode === "en" || localeCode === "zh-cn" ? locale : defaultLocale.imageCrop);
            return (React.createElement(Modal, Object.assign({ title: title || React.createElement("span", null, Avatarlocale.changeAvatar), className: "avatar-modal", visible: visible, width: 980, closable: false, maskClosable: false, footer: modalFooter }, modalProps), this.renderContainer()));
        }));
    }
}
AvatarUploader.propTypes = {
    visible: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
    onUploadOk: PropTypes.func,
    limit: PropTypes.object,
    uploadUrl: PropTypes.string,
    previewList: PropTypes.array,
    editorWidth: PropTypes.number,
    editorHeight: PropTypes.number,
    minRectSize: PropTypes.number,
    defaultRectSize: PropTypes.number,
    prefixCls: PropTypes.string,
    handleUpload: PropTypes.func,
    axiosConfig: PropTypes.object,
    cropComplete: PropTypes.func,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    subTitle: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    previewTitle: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    reloadTitle: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    uploadProps: PropTypes.object,
    modalProps: PropTypes.object,
    reloadText: PropTypes.func,
    uploadFaild: PropTypes.func,
    uploadError: PropTypes.func,
};
AvatarUploader.defaultProps = {
    limit: {
        type: 'jpeg,png,jpg',
        size: 1024,
    },
    previewList: [80, 30, 18],
    editorWidth: 540,
    editorHeight: 300,
    minRectSize: 80,
    defaultRectSize: 200,
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMvaW1hZ2UtY3JvcC9hdmF0YXJVcGxvYWQudHN4IiwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxLQUFLLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFDekMsT0FBTyxLQUE2QixNQUFNLE9BQU8sQ0FBQztBQUNsRCxPQUFPLFNBQVMsTUFBTSxZQUFZLENBQUM7QUFDbkMsT0FBTyxNQUFNLE1BQU0sV0FBVyxDQUFDO0FBQy9CLE9BQU8sSUFBSSxNQUFNLFNBQVMsQ0FBQztBQUMzQixPQUFPLEtBQXFCLE1BQU0sVUFBVSxDQUFDO0FBQzdDLE9BQU8sT0FBTyxNQUFNLFlBQVksQ0FBQztBQUNqQyxPQUFPLE1BQXVCLE1BQU0sV0FBVyxDQUFDO0FBQ2hELE9BQU8sSUFBSSxNQUFNLFFBQVEsQ0FBQztBQUMxQixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQzVDLE9BQU8sY0FBYyxNQUFNLG1DQUFtQyxDQUFDO0FBQy9ELE9BQU8sYUFBYSxNQUFNLDRCQUE0QixDQUFDO0FBR3ZELE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7QUFDL0IsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQztBQUV2QixTQUFTLFVBQVUsQ0FBQyxNQUFNO0lBQ3hCLE9BQU8sQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNqQyxDQUFDO0FBMENELElBQUksWUFBWSxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUE7QUFFMUMsTUFBTSxDQUFDLE9BQU8sT0FBTyxjQUFlLFNBQVEsU0FBaUM7SUF1QzNFLFlBQVksS0FBSztRQUNmLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQWNmLGFBQVEsR0FBRyxHQUFHLEVBQUU7WUFDZCxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVB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LElBQUksRUFBRSxjQUFjO1FBQ3BCLElBQUksRUFBRSxJQUFJO0tBQ1g7SUFDRCxXQUFXLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztJQUN6QixXQUFXLEVBQUUsR0FBRztJQUNoQixZQUFZLEVBQUUsR0FBRztJQUNqQixXQUFXLEVBQUUsRUFBRTtJQUNmLGVBQWUsRUFBRSxHQUFHO0NBQ3JCLENBQUEiLCJuYW1lcyI6W10sInNvdXJjZXMiOlsiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMvaW1hZ2UtY3JvcC9hdmF0YXJVcGxvYWQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICog6KOB5Ymq5aS05YOP5LiK5LygXG4gKi9cblxuaW1wb3J0IFJlYWN0LCB7IENvbXBvbmVudCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBheGlvcywgeyBBeGlvc1JlcXVlc3RDb25maWcgfSBmcm9tICdheGlvcyc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IEJ1dHRvbiBmcm9tICcuLi9idXR0b24nO1xuaW1wb3J0IEljb24gZnJvbSAnLi4vaWNvbic7XG5pbXBvcnQgTW9kYWwsIHsgTW9kYWxQcm9wcyB9IGZyb20gJy4uL21vZGFsJztcbmltcG9ydCBtZXNzYWdlIGZyb20gJy4uL21lc3NhZ2UnO1xuaW1wb3J0IFVwbG9hZCwgeyBVcGxvYWRQcm9wcyB9IGZyb20gJy4uL3VwbG9hZCc7XG5pbXBvcnQgQ3JvcCBmcm9tICcuL0Nyb3AnO1xuaW1wb3J0IHsgZ2V0UHJlZml4Q2xzIH0gZnJvbSAnLi4vY29uZmlndXJlJztcbmltcG9ydCBMb2NhbGVSZWNlaXZlciBmcm9tICcuLi9sb2NhbGUtcHJvdmlkZXIvTG9jYWxlUmVjZWl2ZXInO1xuaW1wb3J0IGRlZmF1bHRMb2NhbGUgZnJvbSAnLi4vbG9jYWxlLXByb3ZpZGVyL2RlZmF1bHQnO1xuaW1wb3J0IHsgaW1hZ2VDcm9wIH0gZnJvbSAnLi4vbG9jYWxlLXByb3ZpZGVyJ1xuXG5jb25zdCBEcmFnZ2VyID0gVXBsb2FkLkRyYWdnZXI7XG5jb25zdCB7IHJvdW5kIH0gPSBNYXRoO1xuXG5mdW5jdGlvbiByb3RhdGVGbGFnKHJvdGF0ZSkge1xuICByZXR1cm4gKHJvdGF0ZSAvIDkwKSAlIDIgIT09IDA7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTGltaXQge1xuICBzaXplOiBudW1iZXI7XG4gIHR5cGU6IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBBdmF0YXJBcmVhIHtcbiAgcm90YXRlOiBudW1iZXI7XG4gIHN0YXJ0WDogbnVtYmVyO1xuICBzdGFydFk6IG51bWJlcjtcbiAgZW5kWDogbnVtYmVyO1xuICBlbmRZOiBudW1iZXI7XG4gIGZpbGU/OiBGaWxlO1xufVxuXG5cbmV4cG9ydCBpbnRlcmZhY2UgQXZhdGFyVXBsb2FkUHJvcHMge1xuICB2aXNpYmxlOiBib29sZWFuOyAvLyDkuIrkvKDlm77niYfmqKHmgIHmoYbnmoTmmL7npLrnirbmgIFcbiAgb25DbG9zZT86ICh2aXNpYmxlOiBib29sZWFuKSA9PiB2b2lkOyAvLyDmqKHmgIHmoYblhbPpl63ml7bnmoTlm57osINcbiAgb25VcGxvYWRPaz86IChyZXM6IGFueSkgPT4gdm9pZDsgLy8g5oiQ5Yqf5LiK5Lyg5pe255qE5Zue6LCDXG4gIHVwbG9hZFVybD86IHN0cmluZzsgLy8g5LiK5Lyg6ZO+5o6lXG4gIHVwbG9hZEZhaWxkPzogKCkgPT4gdm9pZDsgLy8g5LiK5Lyg5aSx6LSlXG4gIHVwbG9hZEVycm9yPzogKGVycm9yOiBhbnkpID0+IHZvaWQ7IC8vIOS4iuS8oOacjeWKoeWZqOmUmeivr1xuICBoYW5kbGVVcGxvYWQ/OiAoYXJlYTogQXZhdGFyQXJlYSkgPT4gdm9pZDsgLy8g54K55Ye75LiK5LygXG4gIGNyb3BDb21wbGV0ZT86IChpbWFnZVN0YXRlOiBhbnkpID0+IHZvaWQ7IC8vIOijgeWJquWujOaIkFxuICB0aXRsZT86IHN0cmluZyB8IFJlYWN0LlJlYWN0RWxlbWVudDsgLy8g5LiK5Lyg5aS05YOP5qCH6aKYXG4gIHN1YlRpdGxlPzogc3RyaW5nIHwgUmVhY3QuUmVhY3RFbGVtZW50OyAvLyDkuIrkvKDlpLTlg4/lsI/moIfpophcbiAgcHJldmlld1RpdGxlPzogc3RyaW5nIHwgUmVhY3QuUmVhY3RFbGVtZW50OyAvLyDlpLTlg4/pooTop4jmoIfpophcbiAgcmVsb2FkVGl0bGU/OiBzdHJpbmcgfCBSZWFjdC5SZWFjdEVsZW1lbnQ7Ly8g6YeN5paw5LiK5Lyg5qCH6aKYXG4gIHVwbG9hZFByb3BzPzogVXBsb2FkUHJvcHM7IC8vIOS4iuS8oOmFjee9rlxuICBtb2RhbFByb3BzPzogTW9kYWxQcm9wczsgLy8g5qih5oCB5qGG55qE6YWN572uXG4gIGxpbWl0OiBMaW1pdDsgLy8g6ZmQ5Yi25YaF5a65XG4gIHByZXZpZXdMaXN0OiBudW1iZXJbXTsgLy8g5a6a5LmJ6aKE6KeI55qE5aSn5bCPXG4gIGVkaXRvcldpZHRoOiBudW1iZXI7IC8vIOijgeWJquWuueWZqOWuveW6plxuICBlZGl0b3JIZWlnaHQ6IG51bWJlcjsgLy8g6KOB5Ymq5a655Zmo6auY5bqmXG4gIG1pblJlY3RTaXplOiBudW1iZXI7ICAvLyDmnIDlsI/oo4HliarlpKflsI9cbiAgZGVmYXVsdFJlY3RTaXplOiBudW1iZXI7IC8vIOacgOWkp+ijgeWJquWkp+Wwj1xuICBheGlvc0NvbmZpZz86IEF4aW9zUmVxdWVzdENvbmZpZztcbiAgcHJlZml4Q2xzPzogc3RyaW5nOyAvLyDoh6rlrprkuYnmoLflvI/liY3nvIBcbn1cblxubGV0IEF2YXRhcmxvY2FsZSA9IGRlZmF1bHRMb2NhbGUuaW1hZ2VDcm9wXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEF2YXRhclVwbG9hZGVyIGV4dGVuZHMgQ29tcG9uZW50PEF2YXRhclVwbG9hZFByb3BzLCBhbnk+IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICB2aXNpYmxlOiBQcm9wVHlwZXMuYm9vbC5pc1JlcXVpcmVkLCAvLyDkuIrkvKDlm77niYfmqKHmgIHmoYbnmoTmmL7npLrnirbmgIFcbiAgICBvbkNsb3NlOiBQcm9wVHlwZXMuZnVuYywgLy8g5qih5oCB5qGG5YWz6Zet5pe255qE5Zue6LCDXG4gICAgb25VcGxvYWRPazogUHJvcFR5cGVzLmZ1bmMsIC8vIOaIkOWKn+S4iuS8oOaXtueahOWbnuiwg1xuICAgIGxpbWl0OiBQcm9wVHlwZXMub2JqZWN0LCAvLyDpmZDliLblhoXlrrlcbiAgICB1cGxvYWRVcmw6IFByb3BUeXBlcy5zdHJpbmcsIC8vIOS4iuS8oOmTvuaOpVxuICAgIHByZXZpZXdMaXN0OiBQcm9wVHlwZXMuYXJyYXksXG4gICAgZWRpdG9yV2lkdGg6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgZWRpdG9ySGVpZ2h0OiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIG1pblJlY3RTaXplOiBQcm9wVHlwZXMubnVtYmVyLCAvLyDmnIDlsI/nmoToo4HliarljLrln59cbiAgICBkZWZhdWx0UmVjdFNpemU6IFByb3BUeXBlcy5udW1iZXIsIC8vIOm7mOiupOacgOWwj+eahFxuICAgIHByZWZpeENsczogUHJvcFR5cGVzLnN0cmluZywgLy8g6Ieq5a6a5LmJ5qC35byP5YmN57yAXG4gICAgaGFuZGxlVXBsb2FkOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBheGlvc0NvbmZpZzogUHJvcFR5cGVzLm9iamVjdCxcbiAgICBjcm9wQ29tcGxldGU6IFByb3BUeXBlcy5mdW5jLFxuICAgIHRpdGxlOiBQcm9wVHlwZXMub25lT2ZUeXBlKFtQcm9wVHlwZXMuc3RyaW5nLCBQcm9wVHlwZXMub2JqZWN0XSksXG4gICAgc3ViVGl0bGU6IFByb3BUeXBlcy5vbmVPZlR5cGUoW1Byb3BUeXBlcy5zdHJpbmcsIFByb3BUeXBlcy5vYmplY3RdKSxcbiAgICBwcmV2aWV3VGl0bGU6IFByb3BUeXBlcy5vbmVPZlR5cGUoW1Byb3BUeXBlcy5zdHJpbmcsIFByb3BUeXBlcy5vYmplY3RdKSxcbiAgICByZWxvYWRUaXRsZTogUHJvcFR5cGVzLm9uZU9mVHlwZShbUHJvcFR5cGVzLnN0cmluZywgUHJvcFR5cGVzLm9iamVjdF0pLFxuICAgIHVwbG9hZFByb3BzOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIG1vZGFsUHJvcHM6IFByb3BUeXBlcy5vYmplY3QsXG4gICAgcmVsb2FkVGV4dDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgdXBsb2FkRmFpbGQ6IFByb3BUeXBlcy5mdW5jLFxuICAgIHVwbG9hZEVycm9yOiBQcm9wVHlwZXMuZnVuYyxcbiAgfTtcblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIGxpbWl0OiB7XG4gICAgICB0eXBlOiAnanBlZyxwbmcsanBnJyxcbiAgICAgIHNpemU6IDEwMjQsXG4gICAgfSxcbiAgICBwcmV2aWV3TGlzdDogWzgwLCAzMCwgMThdLFxuICAgIGVkaXRvcldpZHRoOiA1NDAsXG4gICAgZWRpdG9ySGVpZ2h0OiAzMDAsXG4gICAgbWluUmVjdFNpemU6IDgwLFxuICAgIGRlZmF1bHRSZWN0U2l6ZTogMjAwLFxuICB9XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgY29uc3QgeyBkZWZhdWx0UmVjdFNpemUgfSA9IHByb3BzXG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHN1Ym1pdHRpbmc6IGZhbHNlLFxuICAgICAgaW1nOiBudWxsLFxuICAgICAgZmlsZTogJycsXG4gICAgICBpbWFnZVN0eWxlOiB7IHdpZHRoOiAwLCBoZWlnaHQ6IDAgfSxcbiAgICAgIHNpemU6IGRlZmF1bHRSZWN0U2l6ZSxcbiAgICAgIHg6IDAsXG4gICAgICB5OiAwLFxuICAgICAgcm90YXRlOiAwLFxuICAgIH07XG4gIH1cblxuICBoYW5kbGVPayA9ICgpID0+IHtcbiAgICBjb25zdCB7IHgsIHksIHNpemUsIHJvdGF0ZSwgZmlsZSwgaW1hZ2VTdHlsZTogeyB3aWR0aCwgaGVpZ2h0IH0sIGltZzogeyBuYXR1cmFsV2lkdGggfSB9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCB7IHVwbG9hZFVybCwgdXBsb2FkRmFpbGQsIHVwbG9hZEVycm9yLCBoYW5kbGVVcGxvYWQsIGF4aW9zQ29uZmlnIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IGZsYWcgPSByb3RhdGVGbGFnKHJvdGF0ZSk7XG4gICAgY29uc3Qgc2NhbGUgPSBuYXR1cmFsV2lkdGggLyB3aWR0aDtcbiAgICBjb25zdCBzdGFydFggPSBmbGFnID8geCAtICgod2lkdGggLSBoZWlnaHQpIC8gMikgOiB4O1xuICAgIGNvbnN0IHN0YXJ0WSA9IGZsYWcgPyB5ICsgKCh3aWR0aCAtIGhlaWdodCkgLyAyKSA6IHk7XG4gICAgY29uc3QgUXNEYXRhOiBBdmF0YXJBcmVhID0ge1xuICAgICAgcm90YXRlLFxuICAgICAgc3RhcnRYOiByb3VuZChzdGFydFggKiBzY2FsZSksXG4gICAgICBzdGFydFk6IHJvdW5kKHN0YXJ0WSAqIHNjYWxlKSxcbiAgICAgIGVuZFg6IHJvdW5kKHNpemUgKiBzY2FsZSksXG4gICAgICBlbmRZOiByb3VuZChzaXplICogc2NhbGUpLFxuICAgIH1cbiAgICBjb25zdCBxcyA9IEpTT04uc3RyaW5naWZ5KFFzRGF0YSk7XG4gICAgY29uc3QgZGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuICAgIGRhdGEuYXBwZW5kKCdmaWxlJywgZmlsZSk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7IHN1Ym1pdHRpbmc6IHRydWUgfSk7XG4gICAgaWYgKHVwbG9hZFVybCkge1xuICAgICAgbGV0IGNvbmZpZztcbiAgICAgIGlmIChheGlvc0NvbmZpZykge1xuICAgICAgICBjb25maWcgPSBheGlvc0NvbmZpZztcbiAgICAgIH1cbiAgICAgIGF4aW9zLnBvc3QoYCR7dXBsb2FkVXJsfT8ke3FzfWAsIGRhdGEsIGNvbmZpZylcbiAgICAgICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICBpZiAocmVzLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHRoaXMudXBsb2FkT2socmVzKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWVzc2FnZS5lcnJvcihBdmF0YXJsb2NhbGUuYXZhdGFyVXBsb2FkRXJyb3IpO1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IHN1Ym1pdHRpbmc6IGZhbHNlIH0pO1xuICAgICAgICAgICAgaWYgKHVwbG9hZEZhaWxkKSB7XG4gICAgICAgICAgICAgIHVwbG9hZEZhaWxkKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICBtZXNzYWdlLmVycm9yKGAke0F2YXRhcmxvY2FsZS5hdmF0YXJTZXJ2ZXJFcnJvcn0ke2Vycm9yfWApO1xuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzdWJtaXR0aW5nOiBmYWxzZSB9KTtcbiAgICAgICAgICBpZiAodXBsb2FkRXJyb3IpIHtcbiAgICAgICAgICAgIHVwbG9hZEVycm9yKGVycm9yKVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChoYW5kbGVVcGxvYWQpIHtcbiAgICAgIFFzRGF0YS5maWxlID0gZmlsZTtcbiAgICAgIGhhbmRsZVVwbG9hZChRc0RhdGEpXG4gICAgfVxuICB9O1xuXG4gIGNsb3NlKCkge1xuICAgIGNvbnN0IHsgb25DbG9zZSB9ID0gdGhpcy5wcm9wcztcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGltZzogbnVsbCxcbiAgICB9KTtcbiAgICBpZiAob25DbG9zZSkge1xuICAgICAgb25DbG9zZShmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgdXBsb2FkT2socmVzKSB7XG4gICAgY29uc3QgeyBvblVwbG9hZE9rIH0gPSB0aGlzLnByb3BzO1xuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaW1nOiBudWxsLFxuICAgICAgc3VibWl0dGluZzogZmFsc2UsXG4gICAgfSwgKCkgPT4ge1xuICAgICAgaWYgKG9uVXBsb2FkT2spIHtcbiAgICAgICAgb25VcGxvYWRPayhyZXMpXG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBoYW5kbGVDYW5jZWwgPSAoKSA9PiB7XG4gICAgdGhpcy5jbG9zZSgpO1xuICB9O1xuXG4gIGluaXRJbWFnZVNpemUoaW1nLCByb3RhdGUgPSAwKSB7XG4gICAgY29uc3QgeyBlZGl0b3JXaWR0aCwgZWRpdG9ySGVpZ2h0LCBtaW5SZWN0U2l6ZSwgZGVmYXVsdFJlY3RTaXplIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHsgbmF0dXJhbFdpZHRoLCBuYXR1cmFsSGVpZ2h0IH0gPSBpbWc7XG4gICAgY29uc3QgZmxhZyA9IHJvdGF0ZUZsYWcocm90YXRlKTtcbiAgICBsZXQgd2lkdGggPSBmbGFnID8gbmF0dXJhbEhlaWdodCA6IG5hdHVyYWxXaWR0aDtcbiAgICBsZXQgaGVpZ2h0ID0gZmxhZyA/IG5hdHVyYWxXaWR0aCA6IG5hdHVyYWxIZWlnaHQ7XG4gICAgaWYgKHdpZHRoIDwgbWluUmVjdFNpemUgfHwgaGVpZ2h0IDwgbWluUmVjdFNpemUpIHtcbiAgICAgIGlmICh3aWR0aCA+IGhlaWdodCkge1xuICAgICAgICB3aWR0aCA9ICh3aWR0aCAvIGhlaWdodCkgKiBtaW5SZWN0U2l6ZTtcbiAgICAgICAgaGVpZ2h0ID0gbWluUmVjdFNpemU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBoZWlnaHQgPSAoaGVpZ2h0IC8gd2lkdGgpICogbWluUmVjdFNpemU7XG4gICAgICAgIHdpZHRoID0gbWluUmVjdFNpemU7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh3aWR0aCA+IGVkaXRvcldpZHRoIHx8IGhlaWdodCA+IGVkaXRvckhlaWdodCkge1xuICAgICAgaWYgKHdpZHRoIC8gZWRpdG9yV2lkdGggPiBoZWlnaHQgLyBlZGl0b3JIZWlnaHQpIHtcbiAgICAgICAgaGVpZ2h0ID0gKGhlaWdodCAvIHdpZHRoKSAqIGVkaXRvcldpZHRoO1xuICAgICAgICB3aWR0aCA9IGVkaXRvcldpZHRoO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgd2lkdGggPSAod2lkdGggLyBoZWlnaHQpICogZWRpdG9ySGVpZ2h0O1xuICAgICAgICBoZWlnaHQgPSBlZGl0b3JIZWlnaHQ7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChmbGFnKSB7XG4gICAgICBjb25zdCB0bXAgPSB3aWR0aDtcbiAgICAgIHdpZHRoID0gaGVpZ2h0O1xuICAgICAgaGVpZ2h0ID0gdG1wO1xuICAgIH1cbiAgICBjb25zdCBzaXplID0gTWF0aC5taW4oZGVmYXVsdFJlY3RTaXplLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGltZyxcbiAgICAgIGltYWdlU3R5bGU6IHtcbiAgICAgICAgd2lkdGgsXG4gICAgICAgIGhlaWdodCxcbiAgICAgICAgdG9wOiAoZWRpdG9ySGVpZ2h0IC0gaGVpZ2h0KSAvIDIsXG4gICAgICAgIGxlZnQ6IChlZGl0b3JXaWR0aCAtIHdpZHRoKSAvIDIsXG4gICAgICAgIHRyYW5zZm9ybTogYHJvdGF0ZSgke3JvdGF0ZX1kZWcpYCxcbiAgICAgIH0sXG4gICAgICBzaXplLFxuICAgICAgeDogKHdpZHRoIC0gc2l6ZSkgLyAyLFxuICAgICAgeTogKGhlaWdodCAtIHNpemUpIC8gMixcbiAgICAgIHJvdGF0ZSxcbiAgICB9KTtcbiAgfVxuXG4gIG9uQ29tcGxldGUoaW1hZ2VTdGF0ZSkge1xuICAgIGNvbnN0IHsgY3JvcENvbXBsZXRlIH0gPSB0aGlzLnByb3BzO1xuICAgIHRoaXMuc2V0U3RhdGUoaW1hZ2VTdGF0ZSk7XG4gICAgaWYgKGNyb3BDb21wbGV0ZSkge1xuICAgICAgY3JvcENvbXBsZXRlKGltYWdlU3RhdGUpXG4gICAgfVxuICB9XG5cbiAgbG9hZEltYWdlKHNyYykge1xuICAgIGlmKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgIGNvbnN0IGltZyA9IG5ldyBJbWFnZSgpO1xuICAgICAgaW1nLnNyYyA9IHNyYztcbiAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuaW5pdEltYWdlU2l6ZShpbWcpO1xuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBnZXRQcmV2aWV3UHJvcHMocHJldmlld1NpemUpIHtcbiAgICBjb25zdCB7IHNpemUsIHgsIHksIGltZzogeyBzcmMgfSwgcm90YXRlLCBpbWFnZVN0eWxlOiB7IHdpZHRoLCBoZWlnaHQgfSB9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCBwcmV2aWV3U2NhbGUgPSBwcmV2aWV3U2l6ZSAvIHNpemU7XG4gICAgbGV0IHJhZGl1cyA9IChyb3RhdGUgJSAzNjApIC8gOTA7XG4gICAgbGV0IHB4ID0gLXg7XG4gICAgbGV0IHB5ID0gLXk7XG4gICAgaWYgKHJhZGl1cyA8IDApIHJhZGl1cyArPSA0O1xuICAgIGlmIChyYWRpdXMgPT09IDEpIHtcbiAgICAgIHB5ID0gKCh4ICsgKChoZWlnaHQgLSB3aWR0aCkgLyAyKSkgLSBoZWlnaHQpICsgc2l6ZTtcbiAgICAgIHB4ID0gKChoZWlnaHQgLSB3aWR0aCkgLyAyKSAtIHk7XG4gICAgfSBlbHNlIGlmIChyYWRpdXMgPT09IDIpIHtcbiAgICAgIHB4ID0gKHggLSB3aWR0aCkgKyBzaXplO1xuICAgICAgcHkgPSAoeSAtIGhlaWdodCkgKyBzaXplO1xuICAgIH0gZWxzZSBpZiAocmFkaXVzID09PSAzKSB7XG4gICAgICBweCA9ICgoeSArICgod2lkdGggLSBoZWlnaHQpIC8gMikpIC0gd2lkdGgpICsgc2l6ZTtcbiAgICAgIHB5ID0gKCh3aWR0aCAtIGhlaWdodCkgLyAyKSAtIHg7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBzdHlsZToge1xuICAgICAgICB3aWR0aDogcHJldmlld1NpemUsXG4gICAgICAgIGhlaWdodDogcHJldmlld1NpemUsXG4gICAgICAgIGJhY2tncm91bmRJbWFnZTogYHVybCgnJHtzcmN9JylgLFxuICAgICAgICBiYWNrZ3JvdW5kU2l6ZTogYCR7d2lkdGggKiBwcmV2aWV3U2NhbGV9cHggJHtoZWlnaHQgKiBwcmV2aWV3U2NhbGV9cHhgLFxuICAgICAgICBiYWNrZ3JvdW5kUG9zaXRpb246IGAke3B4ICogcHJldmlld1NjYWxlfXB4ICR7cHkgKiBwcmV2aWV3U2NhbGV9cHhgLFxuICAgICAgICB0cmFuc2Zvcm06IGByb3RhdGUoJHtyb3RhdGV9ZGVnKWAsXG4gICAgICB9LFxuICAgIH07XG4gIH1cblxuICByZW5kZXJQcmV2aWV3SXRlbShwcmV2aWV3U2l6ZUxpc3QpIHtcbiAgICBjb25zdCB7IHByZWZpeENsczogY3VzdG9taXplUHJlZml4Q2xzIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHByZWZpeENscyA9IGdldFByZWZpeENscygnYXZhdGFyLWNyb3AtZWRpdCcsIGN1c3RvbWl6ZVByZWZpeENscyk7XG4gICAgY29uc3QgZGF0YUxpc3QgPSBwcmV2aWV3U2l6ZUxpc3QubWFwKChpdGVtU2l6ZSkgPT4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBrZXk9e2l0ZW1TaXplfSBjbGFzc05hbWU9e2Ake3ByZWZpeENsc30tcHJldmlldy1pdGVtYH0+XG4gICAgICAgICAgPGkgey4uLnRoaXMuZ2V0UHJldmlld1Byb3BzKGl0ZW1TaXplKX0gLz5cbiAgICAgICAgICA8cD57YCR7aXRlbVNpemV977yKJHtpdGVtU2l6ZX1gfTwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgICApXG4gICAgfSxcbiAgICApXG4gICAgcmV0dXJuIGRhdGFMaXN0XG4gIH1cblxuXG5cbiAgcmVuZGVyRWRpdG9yKHByb3BzKSB7XG4gICAgY29uc3QgeyBpbWcsIGZpbGUsIHJvdGF0ZSB9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCB7IHByZWZpeENsczogY3VzdG9taXplUHJlZml4Q2xzLCBwcmV2aWV3TGlzdCwgZWRpdG9yV2lkdGgsIGVkaXRvckhlaWdodCwgZGVmYXVsdFJlY3RTaXplLCBtaW5SZWN0U2l6ZSwgc3ViVGl0bGUsIHByZXZpZXdUaXRsZSwgcmVsb2FkVGl0bGUgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgeyBzcmMgfSA9IGltZztcbiAgICBjb25zdCBwcmVmaXhDbHMgPSBnZXRQcmVmaXhDbHMoJ2F2YXRhci1jcm9wLWVkaXQnLCBjdXN0b21pemVQcmVmaXhDbHMpO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIDxoMyBjbGFzc05hbWU9e2Ake3ByZWZpeENsc30tdGV4dGB9PlxuICAgICAgICAgIDxzcGFuID57c3ViVGl0bGUgfHwgQXZhdGFybG9jYWxlLmF2YXRhclVwbG9hZH08L3NwYW4+XG4gICAgICAgICAgPEljb24gdHlwZT1cImtleWJvYXJkX2Fycm93X3JpZ2h0XCIgLz5cbiAgICAgICAgICA8c3Bhbj57ZmlsZS5uYW1lfTwvc3Bhbj5cbiAgICAgICAgPC9oMz5cbiAgICAgICAgPGg0IGNsYXNzTmFtZT17YCR7cHJlZml4Q2xzfS1oaW50YH0+XG4gICAgICAgICAgPHNwYW4+e0F2YXRhcmxvY2FsZS5hdmF0YXJSZW1pbmRlcn08L3NwYW4+XG4gICAgICAgIDwvaDQ+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LXdyYXBlcmB9PlxuICAgICAgICAgIDxDcm9wXG4gICAgICAgICAgICBkZWZhdWx0UmVjdFNpemU9e2RlZmF1bHRSZWN0U2l6ZX1cbiAgICAgICAgICAgIG1pblJlY3RTaXplPXttaW5SZWN0U2l6ZX1cbiAgICAgICAgICAgIGVkaXRvckhlaWdodD17ZWRpdG9ySGVpZ2h0fVxuICAgICAgICAgICAgZWRpdG9yV2lkdGg9e2VkaXRvcldpZHRofVxuICAgICAgICAgICAgcm90YXRpb249e3JvdGF0ZX0gc3JjPXtzcmN9XG4gICAgICAgICAgICBvbkNvbXBsZXRlPXsoc3RhdGVJbWFnZSkgPT4gdGhpcy5vbkNvbXBsZXRlKHN0YXRlSW1hZ2UpfSAvPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LXRvb2xiYXJgfT5cbiAgICAgICAgICAgIDxCdXR0b24gaWNvbj1cInJlcGxheV85MFwiIHNoYXBlPVwiY2lyY2xlXCIgb25DbGljaz17KCkgPT4gdGhpcy5zZXRTdGF0ZSh7IHJvdGF0ZTogcm90YXRlIC0gOTAgfSl9IC8+XG4gICAgICAgICAgICA8QnV0dG9uIGljb249XCJwbGF5XzkwXCIgc2hhcGU9XCJjaXJjbGVcIiBvbkNsaWNrPXsoKSA9PiB0aGlzLnNldFN0YXRlKHsgcm90YXRlOiByb3RhdGUgKyA5MCB9KX0gLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7cHJlZml4Q2xzfS1wcmV2aWV3YH0+XG4gICAgICAgICAgICA8aDUgY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LXByZXZpZXctdGl0bGVgfT5cbiAgICAgICAgICAgICAgPHNwYW4gPntwcmV2aWV3VGl0bGUgfHwgQXZhdGFybG9jYWxlLnByZXZpZXd9PC9zcGFuPlxuICAgICAgICAgICAgPC9oNT5cbiAgICAgICAgICAgIHt0aGlzLnJlbmRlclByZXZpZXdJdGVtKHByZXZpZXdMaXN0KX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LWJ1dHRvbmB9PlxuICAgICAgICAgIDxVcGxvYWQgey4uLnByb3BzfT5cbiAgICAgICAgICAgIDxCdXR0b24gaWNvbj1cImZpbGVfdXBsb2FkXCIgdHlwZT1cInByaW1hcnlcIj5cbiAgICAgICAgICAgICAgPHNwYW4+e3JlbG9hZFRpdGxlIHx8IEF2YXRhcmxvY2FsZS5yZVVwbG9hZH08L3NwYW4+XG4gICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICA8L1VwbG9hZD5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgZ2V0VXBsb2FkUHJvcHMoKSB7XG4gICAgY29uc3QgeyBsaW1pdDogeyBzaXplOiBsaW1pdFNpemUsIHR5cGUgfSwgdXBsb2FkUHJvcHMgfSA9IHRoaXMucHJvcHNcbiAgICBjb25zdCB0eXBlTGltaXQgPSB0eXBlLnNwbGl0KCcsJykubWFwKChpdGVtKSA9PiBgaW1hZ2UvJHtpdGVtfWApLmpvaW4oJywnKTtcbiAgICByZXR1cm4ge1xuICAgICAgbXVsdGlwbGU6IGZhbHNlLFxuICAgICAgbmFtZTogJ2ZpbGUnLFxuICAgICAgYWNjZXB0OiB0eXBlTGltaXQsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgIEF1dGhvcml6YXRpb246IGBiZWFyZXJgLFxuICAgICAgfSxcbiAgICAgIHNob3dVcGxvYWRMaXN0OiBmYWxzZSxcbiAgICAgIC4uLnVwbG9hZFByb3BzLFxuICAgICAgYmVmb3JlVXBsb2FkOiAoZmlsZSkgPT4ge1xuICAgICAgICBjb25zdCB7IHNpemUgfSA9IGZpbGU7XG4gICAgICAgIGlmIChzaXplID4gbGltaXRTaXplICogMTAyNCkge1xuICAgICAgICAgIG1lc3NhZ2Uud2FybmluZyhBdmF0YXJsb2NhbGUuaW1hZ2VUb29MYXJnZSk7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBmaWxlIH0pO1xuICAgICAgICBjb25zdCB3aW5kb3dVUkwgPSB3aW5kb3cuVVJMIHx8IHdpbmRvdy53ZWJraXRVUkw7XG4gICAgICAgIGlmICh3aW5kb3dVUkwgJiYgd2luZG93VVJMLmNyZWF0ZU9iamVjdFVSTCkge1xuICAgICAgICAgIHRoaXMubG9hZEltYWdlKHdpbmRvd1VSTC5jcmVhdGVPYmplY3RVUkwoZmlsZSkpO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9LFxuICAgICAgb25DaGFuZ2U6ICh7IGZpbGUgfSkgPT4ge1xuICAgICAgICBjb25zdCB7IHN0YXR1cywgcmVzcG9uc2UgfSA9IGZpbGU7XG4gICAgICAgIGlmIChzdGF0dXMgPT09ICdkb25lJykge1xuICAgICAgICAgIHRoaXMubG9hZEltYWdlKHJlc3BvbnNlKTtcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0dXMgPT09ICdlcnJvcicpIHtcbiAgICAgICAgICBtZXNzYWdlLmVycm9yKEF2YXRhcmxvY2FsZS5pbWFnZVVwbG9hZEVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgcmVuZGVyQ29udGFpbmVyKCkge1xuICAgIGNvbnN0IHsgcHJlZml4Q2xzOiBjdXN0b21pemVQcmVmaXhDbHMsIGxpbWl0OiB7IHNpemU6IGxpbWl0U2l6ZSwgdHlwZSB9IH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHsgaW1nIH0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHByZWZpeENscyA9IGdldFByZWZpeENscygnYXZhdGFyLWNyb3AnLCBjdXN0b21pemVQcmVmaXhDbHMpO1xuICAgIGNvbnN0IHByb3BzID0gdGhpcy5nZXRVcGxvYWRQcm9wcygpO1xuICAgIHJldHVybiBpbWcgPyAoXG4gICAgICB0aGlzLnJlbmRlckVkaXRvcihwcm9wcylcbiAgICApIDpcbiAgICAgIChcbiAgICAgICAgPERyYWdnZXIgY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LWRyYWdnZXJgfSB7Li4ucHJvcHN9PlxuICAgICAgICAgIDxJY29uIHR5cGU9XCJpbmJveFwiIC8+XG4gICAgICAgICAgPGgzIGNsYXNzTmFtZT17YCR7cHJlZml4Q2xzfS1kcmFnZ2VyLXRleHRgfSA+XG4gICAgICAgICAgICA8c3Bhbj57QXZhdGFybG9jYWxlLmltYWdlRHJhZ0hlcmV9PC9zcGFuPlxuICAgICAgICAgIDwvaDM+XG4gICAgICAgICAgPGg0IGNsYXNzTmFtZT17YCR7cHJlZml4Q2xzfS1kcmFnZ2VyLWhpbnRgfT5cbiAgICAgICAgICAgIDxzcGFuPntgJHtBdmF0YXJsb2NhbGUucGxlYXNlVXBsb2FkfSR7bGltaXRTaXplIC8gMTAyNH1NLCR7QXZhdGFybG9jYWxlLnVwbG9hZFR5cGV9JHt0eXBlfSR7QXZhdGFybG9jYWxlLnBpY3R1cmV9YH08L3NwYW4+XG4gICAgICAgICAgPC9oND5cbiAgICAgICAgPC9EcmFnZ2VyPlxuICAgICAgKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7IHZpc2libGUsIG1vZGFsUHJvcHMsIHRpdGxlIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHsgaW1nLCBzdWJtaXR0aW5nIH0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IG1vZGFsRm9vdGVyID0gW1xuICAgICAgPEJ1dHRvbiBkaXNhYmxlZD17c3VibWl0dGluZ30ga2V5PVwiY2FuY2VsXCIgb25DbGljaz17dGhpcy5oYW5kbGVDYW5jZWx9PlxuICAgICAgICA8c3Bhbj57QXZhdGFybG9jYWxlLmNhbmNlbEJ1dHRvbn08L3NwYW4+XG4gICAgICA8L0J1dHRvbj4sXG4gICAgICA8QnV0dG9uIGtleT1cInNhdmVcIiB0eXBlPVwicHJpbWFyeVwiIGRpc2FibGVkPXshaW1nfSBsb2FkaW5nPXtzdWJtaXR0aW5nfSBvbkNsaWNrPXt0aGlzLmhhbmRsZU9rfT5cbiAgICAgICAgPHNwYW4+e0F2YXRhcmxvY2FsZS5zYXZlQnV0dG9ufTwvc3Bhbj5cbiAgICAgIDwvQnV0dG9uPixcbiAgICBdO1xuICAgIHJldHVybiAoXG4gICAgICA8TG9jYWxlUmVjZWl2ZXIgY29tcG9uZW50TmFtZT1cImltYWdlQ3JvcFwiIGRlZmF1bHRMb2NhbGU9e2RlZmF1bHRMb2NhbGUuaW1hZ2VDcm9wfT5cbiAgICAgICAgeyhsb2NhbGUsIGxvY2FsZUNvZGUpID0+IHtcbiAgICAgICAgICBBdmF0YXJsb2NhbGUgPSAobG9jYWxlQ29kZSA9PT0gXCJlblwiIHx8IGxvY2FsZUNvZGUgPT09IFwiemgtY25cIiA/IGxvY2FsZSA6IGRlZmF1bHRMb2NhbGUuaW1hZ2VDcm9wKSBhcyBpbWFnZUNyb3BcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPE1vZGFsXG4gICAgICAgICAgICAgIHRpdGxlPXt0aXRsZSB8fCA8c3Bhbj57QXZhdGFybG9jYWxlLmNoYW5nZUF2YXRhcn08L3NwYW4+fVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJhdmF0YXItbW9kYWxcIlxuICAgICAgICAgICAgICB2aXNpYmxlPXt2aXNpYmxlfVxuICAgICAgICAgICAgICB3aWR0aD17OTgwfVxuICAgICAgICAgICAgICBjbG9zYWJsZT17ZmFsc2V9XG4gICAgICAgICAgICAgIG1hc2tDbG9zYWJsZT17ZmFsc2V9XG4gICAgICAgICAgICAgIGZvb3Rlcj17bW9kYWxGb290ZXJ9XG4gICAgICAgICAgICAgIHsuLi5tb2RhbFByb3BzfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7dGhpcy5yZW5kZXJDb250YWluZXIoKX1cbiAgICAgICAgICAgIDwvTW9kYWw+XG4gICAgICAgICAgKVxuICAgICAgICB9fVxuICAgICAgPC9Mb2NhbGVSZWNlaXZlcj5cbiAgICApO1xuICB9XG59Il0sInZlcnNpb24iOjN9