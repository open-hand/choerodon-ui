/**
 * 裁剪头像上传
 */

import React, { Component } from 'react';
import axios, { AxiosRequestConfig } from 'axios';
import isString from 'lodash/isString';
import Cropper from 'react-easy-crop';
import Button, { ButtonProps } from '../button';
import Icon from '../icon';
import Modal, { ModalProps } from '../modal';
import message from '../message';
import Upload, { UploadProps } from '../upload';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import defaultLocale from '../locale-provider/default';
import { imageCrop } from '../locale-provider';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';
import { MAX_ZOOM, MIN_ZOOM, ZOOM_STEP } from '.';

const Dragger = Upload.Dragger;
const { round } = Math;
const ButtonGroup = Button.Group;

function rotateFlag(rotate): boolean {
  return (rotate / 90) % 2 !== 0;
}

export interface Limit {
  size: number;
  type: string;
}

export interface AvatarArea {
  rotate: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  file?: File;
}

export interface AvatarUploadProps {
  visible: boolean; // 上传图片模态框的显示状态
  onClose?: (visible: boolean) => void; // 模态框关闭时的回调
  onUploadOk?: (res: any) => void; // 成功上传时的回调
  uploadUrl?: string; // 上传链接
  uploadFaild?: () => void; // 上传失败
  uploadError?: (error: any) => void; // 上传服务器错误
  handleUpload?: (area: AvatarArea) => void; // 点击上传
  cropComplete?: (imageState: any) => void; // 裁剪完成
  title?: string | React.ReactElement; // 上传头像标题
  previewTitle?: string | React.ReactElement; // 头像预览标题
  reloadTitle?: string | React.ReactElement;// 重新上传标题
  uploadProps?: UploadProps; // 上传配置
  modalProps?: ModalProps; // 模态框的配置
  limit: Limit; // 限制内容
  previewList: number[]; // 定义预览的大小
  editorWidth: number; // 裁剪容器宽度
  editorHeight: number; // 裁剪容器高度
  rectSize: number; // 裁剪区域大小
  axiosConfig?: AxiosRequestConfig;
  prefixCls?: string; // 自定义样式前缀
}

let Avatarlocale = defaultLocale.imageCrop;

export default class AvatarUploader extends Component<AvatarUploadProps, any> {
  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static defaultProps = {
    limit: {
      type: 'jpeg,png,jpg',
      size: 1024,
    },
    previewList: [80, 48, 34],
    editorWidth: 380,
    editorHeight: 380,
    rectSize: 280,
  };

  context: ConfigContextValue;

  constructor(props, context: ConfigContextValue) {
    super(props, context);
    const { rectSize } = props;
    this.state = {
      submitting: false,
      img: null,
      file: '',
      imageStyle: { width: 0, height: 0 },
      crop: {
        x: 0,
        y: 0,
      },
      rotate: 0,
      zoom: 1,
      cropSize: rectSize,
    };
  }

  zoomImage = (type): void => {
    let { zoom } = this.state;
    const { imageStyle: { width, height }, cropSize } = this.state;
    switch (type) {
      case 'add': {
        const newZoomVal = (zoom * 10 + ZOOM_STEP * 10) / 10;
        zoom = newZoomVal >= MAX_ZOOM ? MAX_ZOOM : newZoomVal;
        this.setState({ zoom });
        break;
      }
      case 'sub': {
        const newZoomVal = (zoom * 10 - ZOOM_STEP * 10) / 10;
        zoom = newZoomVal <= MIN_ZOOM ? MIN_ZOOM : newZoomVal;
        this.setState({ zoom });
        break;
      }
      case 'init': {
        const x = (width - cropSize) / 2 / width;
        const y = (height - cropSize) / 2 / width;
        this.setState({ zoom: 1, rotate: 0, crop: { x, y } });
      }
        break;
      default:
        break;
    }
  };

  handleOk = () => {
    const { x, y, size, rotate, file, imageStyle: { width, height }, img: { naturalWidth } } = this.state;
    const { uploadUrl, uploadFaild, uploadError, handleUpload, axiosConfig } = this.props;
    const flag = rotateFlag(rotate);
    const scale = naturalWidth / width;
    const startX = flag ? x - ((width - height) / 2) : x;
    const startY = flag ? y + ((width - height) / 2) : y;
    const QsData: AvatarArea = {
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
      axios.post<any, any>(`${uploadUrl}?${qs}`, data, config)
        .then((res) => {
          if (res.success) {
            this.uploadOk(res);
          } else {
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

  close() {
    const { onClose } = this.props;
    this.setState({
      img: null,
      crop: {
        x: 0,
        y: 0,
      },
      rotate: 0,
      zoom: 1,
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

  handleCancel = () => {
    this.close();
  };

  initImageSize(img, rotate = 0) {
    const { editorWidth, editorHeight, rectSize } = this.props;
    const { naturalWidth, naturalHeight } = img;
    const flag = rotateFlag(rotate);
    let width = flag ? naturalHeight : naturalWidth;
    let height = flag ? naturalWidth : naturalHeight;
    if (width < rectSize || height < rectSize) {
      if (width > height) {
        width = (width / height) * rectSize;
        height = rectSize;
      } else {
        height = (height / width) * rectSize;
        width = rectSize;
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
    const size = Math.min(rectSize, width, height);
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
      cropSize: size,
      x: (width - size) / 2,
      y: (height - size) / 2,
      rotate,
    });
  }

  onComplete(imgState): void {
    const { zoom, imageStyle: { width, height }, cropSize } = this.state;
    let { x, y } = imgState;
    x = Math.ceil(x * width / 100);
    y = Math.ceil(y * height / 100);
    const imageState = { x, y, size: cropSize / zoom };
    const { cropComplete } = this.props;
    this.setState(imageState);
    if (cropComplete) {
      cropComplete(imageState);
    }
  }

  loadImage(src): void {
    if (typeof window !== 'undefined') {
      const img = new Image();
      img.src = src;
      img.onload = (): void => {
        this.initImageSize(img);
      };
    }
  }

  getPreviewProps(previewSize): object {
    const { size, x, y, img: { src }, rotate, imageStyle: { width, height } } = this.state;
    const previewScale = previewSize / size;
    let radius = (rotate % 360) / 90;
    let px = -x;
    let py = -y;
    if (radius < 0) radius += 4;
    if (radius === 1) {
      py = ((x + ((height - width) / 2)) - height) + size;
      px = ((height - width) / 2) - y;
    } else if (radius === 2) {
      px = (x - width) + size;
      py = (y - height) + size;
    } else if (radius === 3) {
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
    const { getPrefixCls } = this.context;
    const prefixCls = getPrefixCls('avatar-crop-edit', customizePrefixCls);
    return previewSizeList.map((itemSize) => (
      <div key={itemSize} className={`${prefixCls}-preview-item`}>
        <i {...this.getPreviewProps(itemSize)} />
        <p>{`${itemSize}＊${itemSize}`}</p>
      </div>
    ));
  }

  renderEditor(props) {
    const { img, rotate, zoom, crop, cropSize } = this.state;
    const { prefixCls: customizePrefixCls, previewList, editorWidth, editorHeight, previewTitle, reloadTitle } = this.props;
    const { getPrefixCls } = this.context;
    const { src } = img;
    const style: object = { width: editorWidth, height: editorHeight, position: 'relative' };
    const isMinZoom = zoom === MIN_ZOOM;
    const isMaxZoom = zoom === MAX_ZOOM;
    const prefixCls = getPrefixCls('avatar-crop-edit', customizePrefixCls);
    const previewTitleFlag = isString(previewTitle) || React.isValidElement(previewTitle);
    const renderPreviewTitle = (): React.ReactElement | null => {
      if (!previewTitleFlag || !previewTitle) return null;
      if (isString(previewTitle)) {
        return (
          <h5 className={`${prefixCls}-preview-title`}>
            <span>{previewTitle}</span>
          </h5>
        );
      }
      return previewTitle;
    };

    return (
      <div>
        <div className={`${prefixCls}-wraper`}>
          <div className={`${prefixCls}-edit`} style={style}>
            <Cropper
              image={src}
              crop={crop}
              showGrid={false}
              cropSize={{ width: cropSize, height: cropSize }}
              zoom={zoom}
              minZoom={MIN_ZOOM}
              maxZoom={MAX_ZOOM}
              restrictPosition={false}
              rotation={rotate}
              aspect={1 / 1}
              onCropChange={(crop): void => this.setState({ crop })}
              onCropComplete={({ x, y }): void => this.onComplete({ x, y, cropSize })}
              onZoomChange={(zoom): void => {
                this.setState({ zoom });
              }}
            />
          </div>
          <div className={`${prefixCls}-preview`}>
            {renderPreviewTitle()}
            {this.renderPreviewItem(previewList)}
          </div>
        </div>
        <div className={`${prefixCls}-button`} style={{ width: editorWidth }}>
          <ButtonGroup>
            <Button
              funcType="raised"
              icon="zoom_in"
              disabled={isMaxZoom}
              onClick={(): void => this.zoomImage('add')}
            />
            <Button
              funcType="raised"
              icon="zoom_out"
              disabled={isMinZoom}
              onClick={(): void => this.zoomImage('sub')}
            />
          </ButtonGroup>
          <Button
            funcType="raised"
            icon="play_90"
            onClick={(): void => this.setState({ rotate: (rotate + 90) >= 360 ? 0 : (rotate + 90) })}
          />
          <Button funcType="raised" onClick={(): void => this.zoomImage('init')}>1:1</Button>
          <Upload {...props}>
            <Button funcType="raised" icon="file_upload">
              <span>{reloadTitle || Avatarlocale.reUpload}</span>
            </Button>
          </Upload>
        </div>
      </div>
    );
  }

  getUploadProps(): UploadProps {
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
        } else if (status === 'error') {
          message.error(Avatarlocale.imageUploadError);
        }
      },
    };
  }

  renderContainer() {
    const { prefixCls: customizePrefixCls, limit: { size: limitSize, type } } = this.props;
    const { img } = this.state;
    const { getPrefixCls } = this.context;
    const prefixCls = getPrefixCls('avatar-crop', customizePrefixCls);
    const props = this.getUploadProps();
    return img ? (
      this.renderEditor(props)
    ) : (
      <Dragger className={`${prefixCls}-dragger`} {...props}>
        <Icon type="inbox" />
        <h3 className={`${prefixCls}-dragger-text`}>
          <span>{Avatarlocale.imageDragHere}</span>
        </h3>
        <h4 className={`${prefixCls}-dragger-hint`}>
          <span>{`${Avatarlocale.pleaseUpload}${limitSize / 1024}M,${Avatarlocale.uploadType}${type}${Avatarlocale.picture}`}</span>
        </h4>
      </Dragger>
    );
  }

  render() {
    const { visible, modalProps, title } = this.props;
    const { img, submitting } = this.state;
    const cancelButtonProps: ButtonProps = { disabled: submitting, funcType: 'raised' };
    const okButtonProps: ButtonProps = { funcType: 'raised', type: 'primary', disabled: !img, loading: submitting };
    return (
      <LocaleReceiver componentName="imageCrop" defaultLocale={defaultLocale.imageCrop}>
        {(locale: imageCrop) => {
          Avatarlocale = locale || defaultLocale.imageCrop;
          return (
            <Modal
              title={title || <span>{Avatarlocale.changeAvatar}</span>}
              className="avatar-modal"
              visible={visible}
              width={600}
              closable
              maskClosable={false}
              onOk={this.handleOk}
              onCancel={this.handleCancel}
              okButtonProps={okButtonProps}
              cancelButtonProps={cancelButtonProps}
              {...modalProps}
            >
              {this.renderContainer()}
            </Modal>
          );
        }}
      </LocaleReceiver>
    );
  }
}
