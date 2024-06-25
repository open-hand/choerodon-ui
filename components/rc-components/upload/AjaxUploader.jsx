/* eslint react/no-is-mounted:0 react/sort-comp:0 */

import React, { Component } from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import { getConfig as getConfigDefault } from 'choerodon-ui/lib/configure/utils';;
import defaultRequest from './request';
import getUid from './uid';
import attrAccept from './attr-accept';
import traverseFileTree from './traverseFileTree';
import { fileToObject } from '../../upload/utils';

class AjaxUploader extends Component {
  state = { uid: getUid() };

  reqs = {};

  onChange = e => {
    const files = e.target.files;
    const { onReUpload, originReuploadItem } = this.props;
    if (originReuploadItem && originReuploadItem !== null) {
      // Upload 文件重新上传的替换操作只考虑单个文件
      const targetFile = files[0];
      targetFile ? onReUpload(targetFile) : null;
    } else {
      this.uploadFiles(files);
      this.reset();
    }
  };

  onClick = (e) => {
    const el = this.fileInput;
    if (!el) {
      return;
    }
    if (e && e.target === el) return;
    if (this.props.fileInputClick) {
      this.props.fileInputClick(el);
    } else {
      el.click();
    }
  };

  onKeyDown = e => {
    if (e.key === 'Enter') {
      this.onClick();
    }
  };

  onFileDrop = e => {
    e.preventDefault();

    if (e.type === 'dragover') {
      return;
    }
    let uploadCount = 0;
    if (this.props.directory) {
      traverseFileTree(
        e.dataTransfer.items,
        (files) => {
          uploadCount++;
          if (this.props.multiple || uploadCount <= 1) {
            this.uploadFiles(files);
          }
        },
        _file => attrAccept(_file, this.props.accept),
      );
    } else {
      const files = Array.prototype.slice.call(e.dataTransfer.files).filter(
        file => attrAccept(file, this.props.accept),
      );
      const filesResult = this.props.multiple || (files.length <= 1) ? files : [files[0]];
      this.uploadFiles(filesResult);
    }
  };

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.abort();
  }

  uploadFiles = async (files) => {
    const { beforeUploadFiles = noop } = this.props;
    const secretLevel = getConfigDefault('uploadSecretLevel');
    let secretLevelHeadersInfo = {};
    if (secretLevel) {
      secretLevelHeadersInfo = await secretLevel();
      if (secretLevelHeadersInfo === false) {
        return;
      }
    }
    const postFiles = Array.prototype.slice.call(files).map((file) => {
      file.uid = getUid();
      return file;
    });
    Promise.resolve(beforeUploadFiles(files)).then((res) => {
      if (res !== false) {
        postFiles.forEach((file) => {
          this.upload(file, postFiles, secretLevelHeadersInfo);
        });
      }
    });
  };

  upload(file, fileList, extraHeaders = {}) {
    const { props } = this;
    if (!props.beforeUpload) {
      // always async in case use react state to keep fileList
      return setTimeout(() => this.post(file, extraHeaders), 0);
    }

    const before = props.beforeUpload(file, fileList);
    if (before && before.then) {
      before.then((processedFile) => {
        const processedFileType = Object.prototype.toString.call(processedFile);
        if (processedFileType === '[object File]' || processedFileType === '[object Blob]') {
          return this.post(processedFile, extraHeaders);
        }
        return this.post(file, extraHeaders);
      }).catch(e => {
        console && console.log(e); // eslint-disable-line
      });
    } else if (before !== false) {
      setTimeout(() => this.post(file, extraHeaders), 0);
    }
  }

  post(file, extraHeaders) {
    const { originReuploadItem, fileList: originFileList, setReplaceReuploadItem } = this.props;
    // Upload 重新上传的替换处理
    if (originReuploadItem) {
      const reuploadItemIndex = originFileList.findIndex(item => item.uid === originReuploadItem.uid);
      file.uid = originReuploadItem.uid;
      file.originFileObj = originReuploadItem;
      originFileList[reuploadItemIndex] = fileToObject(file);
      setReplaceReuploadItem(null);
    }

    if (!this._isMounted) {
      return;
    }
    const { props } = this;
    let { data, requestFileKeys } = props;
    const { onStart, onProgress } = props;
    if (typeof data === 'function') {
      data = data(file);
    }
    new Promise(resolve => {
      const { action } = props;
      if (typeof action === 'function') {
        return resolve(action(file));
      }
      resolve(action);
    }).then(action => {
      const { uid } = file;
      const request = props.customRequest || defaultRequest;
      this.reqs[uid] = request({
        action,
        filename: props.name,
        file,
        data,
        requestFileKeys, // 判断传递的是数据不是文件
        headers: {...(props.headers || {}), ...extraHeaders},
        withCredentials: props.withCredentials,
        onProgress: onProgress ? e => {
          onProgress(e, file);
        } : null,
        onSuccess: (ret, xhr) => {
          delete this.reqs[uid];
          props.onSuccess(ret, file, xhr);
        },
        onError: (err, ret) => {
          delete this.reqs[uid];
          props.onError(err, ret, file);
        },
      });
      onStart(file);
    });
  }

  reset() {
    this.setState({
      uid: getUid(),
    });
  }

  abort(file) {
    const { reqs } = this;
    if (file) {
      const uid = file.uid ? file.uid : file;
      if (reqs[uid] && reqs[uid].abort) {
        reqs[uid].abort();
      }
      delete reqs[uid];
    } else {
      Object.keys(reqs).forEach(uid => {
        if (reqs[uid] && reqs[uid].abort) {
          reqs[uid].abort();
        }
        delete reqs[uid];
      });
    }
  }

  saveFileInput = (node) => {
    this.fileInput = node;
  };

  render() {
    const {
      component: Tag, prefixCls, className, disabled,
      style, multiple, accept, children, directory,
    } = this.props;
    const cls = classNames({
      [prefixCls]: true,
      [`${prefixCls}-disabled`]: disabled,
      [className]: className,
    });
    const events = disabled ? {} : {
      onClick: this.onClick,
      onKeyDown: this.onKeyDown,
      onDrop: this.onFileDrop,
      onDragOver: this.onFileDrop,
      tabIndex: '0',
    };
    return (
      <Tag
        {...events}
        className={cls}
        role="button"
        style={style}
      >
        <input
          type="file"
          ref={this.saveFileInput}
          key={this.state.uid}
          style={{ display: 'none' }}
          accept={accept}
          directory={directory ? 'directory' : null}
          webkitdirectory={directory ? 'webkitdirectory' : null}
          multiple={multiple}
          onChange={this.onChange}
        />
        {(disabled && children) ? React.cloneElement(children, { disabled: disabled }) : children}
      </Tag>
    );
  }
}

export default AjaxUploader;
