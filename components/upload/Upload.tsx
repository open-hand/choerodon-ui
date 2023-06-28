import React, { Component, DragEvent } from 'react';
import classNames from 'classnames';
import uniqBy from 'lodash/uniqBy';
import isUndefined from 'lodash/isUndefined';
import autobind from 'choerodon-ui/pro/lib/_util/autobind';
import LocaleReceiver from '../locale-provider/LocaleReceiver';
import defaultLocale from '../locale-provider/default';
import Dragger from './Dragger';
import UploadList from './UploadList';
import { UploadChangeParam, UploadFile, UploadListType, UploadLocale, UploadProps, UploadState, UploadType } from './interface';
import { fileToObject, genPercentAdd, getFileItem, removeFileItem, T } from './utils';
import RcUpload from '../rc-components/upload';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

export { UploadProps };

export default class Upload extends Component<UploadProps, UploadState> {
  static displayName = 'Upload';

  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static Dragger: typeof Dragger;

  static defaultProps = {
    type: 'select' as UploadType,
    multiple: true,
    action: '',
    data: {},
    accept: '',
    beforeUpload: T,
    showUploadList: true,
    listType: 'text',
    className: '',
    disabled: false,
    supportServerRender: true,
    showFileSize: false,
  };

  context: ConfigContextValue;

  recentUploadStatus: boolean | PromiseLike<any>;

  progressTimer: any;

  upload: any;

  constructor(props: UploadProps) {
    super(props);

    this.state = {
      fileList: props.fileList || props.defaultFileList || [],
      dragState: 'drop',
      originReuploadItem: null,
    };
  }

  componentWillUnmount() {
    this.clearProgressTimer();
  }

  onStart = (file: UploadFile) => {
    const { fileList } = this.state;
    const nextFileList = [...fileList];
    const targetItem = fileToObject(file);
    targetItem.status = 'uploading';
    const filterItem = getFileItem(file, nextFileList);
    if (!filterItem) {
      nextFileList.push(targetItem);
    } else {
      filterItem.status = 'uploading';
    }
    this.onChange({
      file: targetItem,
      fileList: nextFileList,
    });
    // fix ie progress
    if (!(window as any).FormData) {
      this.autoUpdateProgress(0, targetItem);
    }
    const { onStart } = this.props;
    if (onStart) {
      onStart(file);
    }
  };

  autoUpdateProgress(_: any, file: UploadFile) {
    const getPercent = genPercentAdd();
    let curPercent = 0;
    this.clearProgressTimer();
    this.progressTimer = setInterval(() => {
      curPercent = getPercent(curPercent);
      this.onProgress({
        percent: curPercent * 100,
      }, file);
    }, 200);
  }

  onSuccess = (response: any, file: UploadFile) => {
    this.clearProgressTimer();
    try {
      if (typeof response === 'string') {
        response = JSON.parse(response);
      }
    } catch (e) {
      /* do nothing */
    }
    const { fileList } = this.state;
    const targetItem = getFileItem(file, fileList);
    // removed
    if (targetItem) {
      targetItem.status = 'done';
      targetItem.response = response;
      this.onChange({
        file: { ...targetItem },
        fileList: fileList.slice(),
      });
    }
    const { onSuccess } = this.props;
    if (onSuccess) {
      onSuccess(response, file);
    }
  };

  onProgress = (e: { percent: number }, file: UploadFile) => {
    const { fileList } = this.state;
    const targetItem = getFileItem(file, fileList);
    // removed
    if (targetItem) {
      targetItem.percent = e.percent;
      this.onChange({
        event: e,
        file: { ...targetItem },
        fileList,
      });
    }
    const { onProgress } = this.props;
    if (onProgress) {
      onProgress(e, file);
    }
  };

  onError = (error: Error, response: any, file: UploadFile) => {
    this.clearProgressTimer();
    const { fileList } = this.state;
    const targetItem = getFileItem(file, fileList);
    // removed
    if (!targetItem) {
      return;
    }
    targetItem.error = error;
    targetItem.response = response;
    targetItem.status = 'error';
    this.onChange({
      file: { ...targetItem },
      fileList,
    });
    const { onError } = this.props;
    if (onError) {
      onError(error, response, file);
    }
  };

  handleRemove(file: UploadFile) {
    const { onRemove } = this.props;

    Promise.resolve(typeof onRemove === 'function' ? onRemove(file) : onRemove).then(ret => {
      // Prevent removing file
      if (ret === false) {
        return;
      }
      const { fileList } = this.state;
      const removedFileList = removeFileItem(file, fileList);
      if (removedFileList) {
        this.onChange({
          file,
          fileList: removedFileList,
        });
      }
    });
  }

  handleManualRemove = (file: UploadFile) => {
    this.upload.abort(file);
    file.status = 'removed'; // eslint-disable-line
    this.handleRemove(file);
  };

  @autobind
  defaultReUpload(file: UploadFile) {
    if (this.upload && this.upload.uploader) {
      this.upload.uploader.upload(file, [file]);
    }
  }

  /**
   * 拖拽触发回调
   * @param uploadFiles 拖拽后文件列表
   */
  onDragEnd = (uploadFiles: UploadFile[]) => {
    const { onDragEnd } = this.props;
    if (onDragEnd) {
      const result = onDragEnd(uploadFiles);
      if (result !== false) {
        this.setState({
          fileList: uploadFiles,
        });
      } else {
        return false;
      }
    }
    this.setState({
      fileList: uploadFiles,
    });
  };

  onChange = (info: UploadChangeParam) => {
    const { onChange } = this.props;
    if (!('fileList' in this.props) || !onChange) {
      this.setState({ fileList: info.fileList });
    }
    if (onChange) {
      onChange(info);
    }
  };

  componentWillReceiveProps(nextProps: UploadProps) {
    if ('fileList' in nextProps) {
      this.setState({
        fileList: nextProps.fileList || [],
      });
    }
  }

  onFileDrop = (e: DragEvent<HTMLDivElement>) => {
    this.setState({
      dragState: e.type,
    });
  };

  beforeUpload = (file: UploadFile, uploadFiles: UploadFile[]) => {
    const { multiple, beforeUpload } = this.props;
    if (!multiple) {
      const { fileList: nowFileList } = this.state;
      if (nowFileList.length !== 1) {
        nowFileList.forEach((eachFile: UploadFile)=> {
          // 错误态的重新上传，不用执行删除操作，此时 uid 相同
          if(eachFile.uid !== file.uid) {
            this.handleManualRemove(eachFile);
          }
        });
      }
      this.onChange({
        file,
        fileList: uploadFiles,
      });
    }
    if (beforeUpload) {
      const result = beforeUpload(file, uploadFiles);
      const rejectCall = () => {
        const { fileList } = this.state;
        this.onChange({
          file,
          fileList: uniqBy(fileList.concat(uploadFiles.map(fileToObject)), (item: UploadFile) => item.uid),
        });
      };
      if (result === false) {
        rejectCall();
        return false;
      }
      if (result && (result as PromiseLike<any>).then) {
        return (result as PromiseLike<any>).then((re) => {
          if (re === false) {
            rejectCall();
          }
          return re;
        });
      }
    }
    return true;
  };

  clearProgressTimer() {
    clearInterval(this.progressTimer);
  }

  saveUpload = (node: RcUpload | null) => {
    this.upload = node;
  };

  getUpload = (): RcUpload | null => {
    return this.upload;
  }

  setReplaceReuploadItem = (file: UploadFile) => {
    this.setState({
      originReuploadItem: file,
    })
  }

  getPrefixCls() {
    const { prefixCls: customizePrefixCls } = this.props;
    const { getPrefixCls } = this.context;
    return getPrefixCls('upload', customizePrefixCls);
  }

  renderUploadList = (uploadLocale: UploadLocale) => {
    const { getConfig } = this.context;
    const {
      showUploadList,
      listType,
      onPreview,
      onReUpload = this.defaultReUpload,
      downloadPropsIntercept,
      locale,
      previewFile,
      dragUploadList,
      showFileSize,
      renderIcon,
      tooltipPrefixCls,
      popconfirmProps,
    } = this.props;
    const prefixCls = this.getPrefixCls();
    const { fileList } = this.state;
    const {
      showRemoveIcon,
      removePopConfirmTitle,
      showPreviewIcon,
      showDownloadIcon,
      showReUploadIcon = getConfig('uploadShowReUploadIcon'),
      reUploadText,
      reUploadPopConfirmTitle,
      getCustomFilenameTitle,
    } = showUploadList as any;
    let defaultShowPreviewIcon;
    let defaultShowDownloadIcon;
    if (['text','picture'].includes(listType as UploadListType)) {
      defaultShowPreviewIcon = isUndefined(showPreviewIcon) ? false : showPreviewIcon;
      defaultShowDownloadIcon = isUndefined(showDownloadIcon) ? false : showDownloadIcon;
    } else if (listType === 'picture-card') {
      defaultShowPreviewIcon = isUndefined(showPreviewIcon) ? true : showPreviewIcon;
      defaultShowDownloadIcon = isUndefined(showDownloadIcon) ? true : showDownloadIcon;
    }
    return (
      <UploadList
        prefixCls={prefixCls}
        listType={listType}
        items={fileList}
        onPreview={onPreview}
        dragUploadList={dragUploadList}
        onDragEnd={this.onDragEnd}
        previewFile={previewFile}
        onRemove={this.handleManualRemove}
        showRemoveIcon={showRemoveIcon}
        showPreviewIcon={defaultShowPreviewIcon}
        showDownloadIcon={defaultShowDownloadIcon}
        removePopConfirmTitle={removePopConfirmTitle}
        showReUploadIcon={showReUploadIcon}
        reUploadText={reUploadText}
        reUploadPopConfirmTitle={reUploadPopConfirmTitle}
        onReUpload={onReUpload}
        getCustomFilenameTitle={getCustomFilenameTitle}
        locale={{ ...uploadLocale, ...locale }}
        downloadPropsIntercept={downloadPropsIntercept}
        showFileSize={showFileSize}
        renderIcon={renderIcon}
        tooltipPrefixCls={tooltipPrefixCls}
        popconfirmProps={popconfirmProps}
        getUploadRef={this.getUpload}
        setReplaceReuploadItem={this.setReplaceReuploadItem}
      />
    );
  };

  render() {
    const {
      className,
      showUploadList,
      listType,
      type,
      disabled,
      children,
      dragUploadList,
      overwriteDefaultEvent,
      beforeUploadFiles,
      onReUpload = this.defaultReUpload,
    } = this.props;
    const { fileList, dragState, originReuploadItem } = this.state;

    const prefixCls = this.getPrefixCls();

    const rcUploadProps: any = {
      ...(overwriteDefaultEvent ? undefined : this.props),
      onStart: this.onStart,
      onError: this.onError,
      onProgress: this.onProgress,
      onSuccess: this.onSuccess,
      onReUpload,
      ...(overwriteDefaultEvent ? this.props : undefined),
      beforeUpload: this.beforeUpload,
      beforeUploadFiles,
      prefixCls,
      fileList,
      originReuploadItem,
      setReplaceReuploadItem: this.setReplaceReuploadItem,
    };

    delete rcUploadProps.className;

    const uploadList = showUploadList ? (
      <LocaleReceiver componentName="Upload" defaultLocale={defaultLocale.Upload}>
        {this.renderUploadList}
      </LocaleReceiver>
    ) : null;

    if (type === 'drag') {
      const dragCls = classNames(prefixCls, {
        [`${prefixCls}-drag`]: true,
        [`${prefixCls}-drag-uploading`]: fileList.some(file => file.status === 'uploading'),
        [`${prefixCls}-drag-hover`]: dragState === 'dragover',
        [`${prefixCls}-disabled`]: disabled,
      });
      return (
        <span className={className}>
          <div
            className={dragCls}
            onDrop={this.onFileDrop}
            onDragOver={this.onFileDrop}
            onDragLeave={this.onFileDrop}
          >
            <RcUpload {...rcUploadProps} ref={this.saveUpload} className={`${prefixCls}-btn`}>
              <div className={`${prefixCls}-drag-container`}>{children}</div>
            </RcUpload>
          </div>
          {uploadList}
        </span>
      );
    }

    const uploadButtonCls = classNames(prefixCls, {
      [`${prefixCls}-select`]: true,
      [`${prefixCls}-select-${listType}`]: true,
      [`${prefixCls}-disabled`]: disabled,
      [`${prefixCls}-drag-btn`]: dragUploadList,
    });

    const uploadButton = (
      <div className={uploadButtonCls} style={{ display: children ? '' : 'none' }}>
        <RcUpload {...rcUploadProps} ref={this.saveUpload} />
      </div>
    );

    if (listType === 'picture-card') {
      return (
        <span className={className}>
          {uploadList}
          {uploadButton}
        </span>
      );
    }
    return (
      <span className={className}>
        {uploadButton}
        {uploadList}
      </span>
    );
  }
}
