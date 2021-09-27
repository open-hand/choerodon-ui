/**
 * 裁剪头像上传
 */

import React, { Component } from 'react';
import axios, { AxiosRequestConfig } from 'axios';
import isString from 'lodash/isString';
import PropTypes from 'prop-types';
import Button from '../button';
import Icon from '../icon';
import Modal, { ModalProps } from '../modal';
import message from '../message';
import Upload, { UploadProps } from '../upload';
import Crop from './Crop';
import { getPrefixCls } from '../configure';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import defaultLocale from '../locale-provider/default';
import { imageCrop } from '../locale-provider';

const Dragger = Upload.Dragger;
const { round } = Math;

function rotateFlag(rotate) {
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
  subTitle?: string | React.ReactElement; // 上传头像小标题
  previewTitle?: string | React.ReactElement; // 头像预览标题
  reloadTitle?: string | React.ReactElement;// 重新上传标题
  uploadProps?: UploadProps; // 上传配置
  modalProps?: ModalProps; // 模态框的配置
  limit: Limit; // 限制内容
  previewList: number[]; // 定义预览的大小
  editorWidth: number; // 裁剪容器宽度
  editorHeight: number; // 裁剪容器高度
  minRectSize: number;  // 最小裁剪大小
  defaultRectSize: number; // 最大裁剪大小
  axiosConfig?: AxiosRequestConfig;
  prefixCls?: string; // 自定义样式前缀
}

let Avatarlocale = defaultLocale.imageCrop;

export default class AvatarUploader extends Component<AvatarUploadProps, any> {
  static propTypes = {
    visible: PropTypes.bool.isRequired, // 上传图片模态框的显示状态
    onClose: PropTypes.func, // 模态框关闭时的回调
    onUploadOk: PropTypes.func, // 成功上传时的回调
    limit: PropTypes.object, // 限制内容
    uploadUrl: PropTypes.string, // 上传链接
    previewList: PropTypes.array,
    editorWidth: PropTypes.number,
    editorHeight: PropTypes.number,
    minRectSize: PropTypes.number, // 最小的裁剪区域
    defaultRectSize: PropTypes.number, // 默认最小的
    prefixCls: PropTypes.string, // 自定义样式前缀
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

  static defaultProps = {
    limit: {
      type: 'jpeg,png,jpg',
      size: 1024,
    },
    previewList: [80, 30, 18],
    editorWidth: 540,
    editorHeight: 300,
    minRectSize: 80,
    defaultRectSize: 200,
  }

  constructor(props) {
    super(props);
    const { defaultRectSize } = props
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
    }
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
          // @ts-expect-error: this field may exist?
          if (res.success) {
            this.uploadOk(res);
          } else {
            message.error(Avatarlocale.avatarUploadError);
            this.setState({ submitting: false });
            if (uploadFaild) {
              uploadFaild()
            }
          }
        })
        .catch((error) => {
          message.error(`${Avatarlocale.avatarServerError}${error}`);
          this.setState({ submitting: false });
          if (uploadError) {
            uploadError(error)
          }
        });
    }
    if (handleUpload) {
      QsData.file = file;
      handleUpload(QsData)
    }
  };

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
        onUploadOk(res)
      }
    });
  }

  handleCancel = () => {
    this.close();
  };

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
      cropComplete(imageState)
    }
  }

  loadImage(src) {
    if(typeof window !== 'undefined'){
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
    const prefixCls = getPrefixCls('avatar-crop-edit', customizePrefixCls);
    const dataList = previewSizeList.map((itemSize) => {
      return (
        <div key={itemSize} className={`${prefixCls}-preview-item`}>
          <i {...this.getPreviewProps(itemSize)} />
          <p>{`${itemSize}＊${itemSize}`}</p>
        </div>
      )
    },
    )
    return dataList
  }

  renderEditor(props) {
    const { img, file, rotate } = this.state;
    const { prefixCls: customizePrefixCls, previewList, editorWidth, editorHeight, defaultRectSize, minRectSize, subTitle, previewTitle, reloadTitle } = this.props;
    const { src } = img;
    const prefixCls = getPrefixCls('avatar-crop-edit', customizePrefixCls);
    const previewTitleFlag = isString(previewTitle) || React.isValidElement(previewTitle);
    const renderPreviewTitle = (): React.ReactElement | null => {
      if(!previewTitleFlag || !previewTitle) return null;
      if(isString(previewTitle)) {
        return (
          <h5 className={`${prefixCls}-preview-title`}>
              <span >{previewTitle}</span>
          </h5>
        )
      }
      return previewTitle;
    };

    return (
      <div>
        <h3 className={`${prefixCls}-text`}>
          <span >{subTitle || Avatarlocale.avatarUpload}</span>
          <Icon type="keyboard_arrow_right" />
          <span>{file.name}</span>
        </h3>
        <h4 className={`${prefixCls}-hint`}>
          <span>{Avatarlocale.avatarReminder}</span>
        </h4>
        <div className={`${prefixCls}-wraper`}>
          <Crop
            defaultRectSize={defaultRectSize}
            minRectSize={minRectSize}
            editorHeight={editorHeight}
            editorWidth={editorWidth}
            rotation={rotate} src={src}
            onComplete={(stateImage) => this.onComplete(stateImage)} />
          <div className={`${prefixCls}-toolbar`}>
            <Button icon="replay_90" shape="circle" onClick={() => this.setState({ rotate: rotate - 90 })} />
            <Button icon="play_90" shape="circle" onClick={() => this.setState({ rotate: rotate + 90 })} />
          </div>
          <div className={`${prefixCls}-preview`}>
            {renderPreviewTitle()}
            {this.renderPreviewItem(previewList)}
          </div>
        </div>
        <div className={`${prefixCls}-button`}>
          <Upload {...props}>
            <Button icon="file_upload" type="primary">
              <span>{reloadTitle || Avatarlocale.reUpload}</span>
            </Button>
          </Upload>
        </div>
      </div>
    );
  }

  getUploadProps() {
    const { limit: { size: limitSize, type }, uploadProps } = this.props
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
    const prefixCls = getPrefixCls('avatar-crop', customizePrefixCls);
    const props = this.getUploadProps();
    return img ? (
      this.renderEditor(props)
    ) :
      (
        <Dragger className={`${prefixCls}-dragger`} {...props}>
          <Icon type="inbox" />
          <h3 className={`${prefixCls}-dragger-text`} >
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
    const modalFooter = [
      <Button disabled={submitting} key="cancel" onClick={this.handleCancel}>
        <span>{Avatarlocale.cancelButton}</span>
      </Button>,
      <Button key="save" type="primary" disabled={!img} loading={submitting} onClick={this.handleOk}>
        <span>{Avatarlocale.saveButton}</span>
      </Button>,
    ];
    return (
      <LocaleReceiver componentName="imageCrop" defaultLocale={defaultLocale.imageCrop}>
        {(locale: imageCrop) => {
          Avatarlocale = locale || defaultLocale.imageCrop;
          return (
            <Modal
              title={title || <span>{Avatarlocale.changeAvatar}</span>}
              className="avatar-modal"
              visible={visible}
              width={980}
              closable={false}
              maskClosable={false}
              footer={modalFooter}
              {...modalProps}
            >
              {this.renderContainer()}
            </Modal>
          )
        }}
      </LocaleReceiver>
    );
  }
}
