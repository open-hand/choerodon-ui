import { __decorate } from "tslib";
import React from 'react';
import PropTypes from 'prop-types';
import { action, observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import omit from 'lodash/omit';
import uniqBy from 'lodash/uniqBy';
import { T } from 'choerodon-ui/lib/upload/utils';
import isEmpty from 'lodash/isEmpty';
import Button from '../button/Button';
import autobind from '../_util/autobind';
import { FormField } from '../field/FormField';
import Icon from '../icon';
import message from '../message';
import Modal from '../modal';
import UploadList from './UploadList';
import Tooltip from '../tooltip/Tooltip';
import { $l } from '../locale-context';
/**
 * 把XMLHttpRequest对象的返回信息转化为字符串
 *
 * @param {XMLHttpRequest} xhr
 * @returns {string}
 * @memberof Upload
 */
function getResponse(xhr) {
    const res = xhr.responseText || xhr.response;
    if (!res) {
        return res;
    }
    try {
        return JSON.parse(res).message;
    }
    catch (e) {
        return '';
    }
}
let Upload = class Upload extends FormField {
    constructor(props, context) {
        super(props, context);
        this.saveNativeInputElement = elem => (this.nativeInputElement = elem);
        /**
         * 传递包装按钮的点击事件
         *
         */
        this.handleWrapperBtnClick = () => {
            this.nativeInputElement.click();
        };
        this.handleUploadBtnClick = () => {
            this.startUpload();
        };
        /**
         * 文件上传前的回调
         *
         * @param {UploadFile}
         * @param {UploadFile[]}
         * @memberof Upload
         */
        this.beforeUpload = (file, fileList) => {
            const { beforeUpload } = this.props;
            if (!beforeUpload) {
                return true;
            }
            const result = beforeUpload(file, fileList);
            if (result === false) {
                this.removeFileItem(file);
                return false;
            }
            if (result && result.then) {
                return result;
            }
            return true;
        };
        this.startUpload = () => {
            const fileList = [...this.fileList];
            if (fileList.length) {
                // <-- 当有文件时才上传
                this.uploadFiles(fileList);
                // this.nativeInputElement.value = '';
            }
            else {
                Modal.error($l('Upload', 'no_file'));
            }
        };
        this.handleRemove = (file) => {
            // this.removeFileItem(file);
            // this.upload.abort(file);
            file.status = 'removed';
            this.handleOnRemove(file);
        };
        runInAction(() => {
            this.fileList = props.uploadFileList || props.defaultFileList || [];
        });
    }
    componentWillReceiveProps(nextProps) {
        const { uploadFileList } = nextProps;
        if (uploadFileList !== this.fileList && uploadFileList !== undefined) {
            this.fileList = uniqBy(uploadFileList, (item) => item.uid);
        }
    }
    getOtherProps() {
        const otherProps = omit(super.getOtherProps(), [
            'accept',
            'action',
            'data',
            'header',
            'multiple',
            'onChange',
            'ref',
            'uploadImmediately',
            'fileListMaxLength',
            'showPreviewImage',
            'previewImageWidth',
            'showUploadBtn',
            'showUploadList',
            'onRemoveFile',
            'onUploadSuccess',
            'onUploadError',
            'onFileChange',
            'beforeUpload',
            'withCredentials',
            'partialUpload',
            'appendUpload',
            'uploadFileList',
        ]);
        return otherProps;
    }
    render() {
        const { prefixCls, props: { action: formAction, children, multiple, accept, name = 'file', // <-- convince ts
        uploadImmediately, showPreviewImage, previewImageWidth, showUploadBtn, showUploadList, extra, }, } = this;
        const uploadProps = {
            multiple,
            accept: accept ? accept.join(',') : undefined,
            action: formAction,
            name,
            type: 'file',
            ref: this.saveNativeInputElement,
            onChange: this.handleChange,
            ...this.getOtherProps(),
        };
        const inputWrapperBtn = [
            React.createElement(Button, { key: "upload-btn", onClick: this.handleWrapperBtnClick },
                React.createElement(Icon, { type: "insert_drive_file" }),
                React.createElement("span", null, children || $l('Upload', 'file_selection'))),
            React.createElement("input", Object.assign({ key: "upload" }, uploadProps, { hidden: true })),
        ];
        const uploadBtn = (React.createElement(Tooltip, { title: $l('Upload', 'click_to_upload'), placement: "right" },
            React.createElement(Button, { color: "primary" /* primary */, onClick: this.handleUploadBtnClick },
                React.createElement(Icon, { type: "file_upload" }))));
        return (React.createElement("div", { className: `${prefixCls}` },
            React.createElement("div", { className: "flex-wrapper" },
                React.createElement("div", { className: `${prefixCls}-select` },
                    inputWrapperBtn,
                    !uploadImmediately && showUploadBtn ? uploadBtn : null),
                React.createElement("div", null, extra)),
            showUploadList ? (React.createElement(UploadList, { previewImageWidth: previewImageWidth, showPreviewImage: showPreviewImage, items: [...this.fileList], remove: this.handleRemove })) : null));
    }
    /**
     * 处理<input type="file">元素的change事件，
     * 主要是取出事件对象中的files对象并传递给uploadFiles方法
     *
     * @param {*} e <input>元素的change事件对象
     * @memberof Upload
     */
    handleChange(e) {
        if (e.target.value === '') {
            return;
        }
        const { appendUpload, defaultFileList, uploadFileList } = this.props;
        const fileList = e.target.files;
        const files = Array.from(fileList).slice(0);
        const tempFileList = appendUpload || defaultFileList || uploadFileList ? this.fileList.slice() : [];
        const fileBuffer = [];
        files.forEach((file, index) => {
            file.uid = this.getUid(index);
            file.url = URL.createObjectURL(file);
            const res = this.beforeUpload(file, files);
            if (!res) {
                return;
            }
            fileBuffer.push(file);
        });
        this.fileList = [...tempFileList, ...fileBuffer];
        const { uploadImmediately, onFileChange } = this.props;
        e.target.value = '';
        if (uploadImmediately) {
            if (!isEmpty(fileBuffer)) {
                this.uploadFiles(this.fileList);
            }
        }
        if (onFileChange) {
            onFileChange(this.fileList.slice());
        }
    }
    /**
     * 分别上传fileList中的每个文件对象
     *
     * @param {UploadFile[]} fileList 文件对象数组
     * @returns {void}
     * @memberof Upload
     */
    uploadFiles(fileList) {
        const { action: formAction, accept, fileListMaxLength = 0, // <-- convince ts
        partialUpload, } = this.props;
        if (!formAction) {
            Modal.error($l('Upload', 'upload_path_unset'));
            return;
        }
        if (!this.isAcceptFiles(fileList)) {
            Modal.error($l('Upload', 'not_acceptable_prompt') + accept.join(','));
            return;
        }
        if (fileListMaxLength !== 0 && this.fileList.length > fileListMaxLength) {
            Modal.error(`${$l('Upload', 'file_list_max_length')}: ${fileListMaxLength}`);
            return;
        }
        const files = partialUpload
            ? Array.from(fileList)
                .slice(0)
                .filter(item => !item.status || item.status !== 'success')
            : Array.from(fileList).slice(0);
        const that = this;
        if (!files.length) {
            message.info($l('Upload', 'been_uploaded'));
        }
        files.forEach((file, index) => {
            file.uid = this.getUid(index);
            setTimeout(() => {
                that.upload(file);
            }, 0);
        });
    }
    /**
     * 上传每个文件对象
     *
     * @param {*} file
     * @returns {void}
     * @memberof Upload
     */
    /* istanbul ignore next */
    upload(file) {
        const { data, action: formAction, headers, name: filename, withCredentials: xhrWithCredentials, } = this.props;
        if (typeof XMLHttpRequest === 'undefined') {
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        // 修改文件状态，方便UploadList判断是否展示进度条
        file.status = 'uploading';
        if (xhr.upload) {
            xhr.upload.onprogress = e => {
                let percent = 0;
                if (e.total > 0) {
                    percent = (e.loaded / e.total) * 100;
                }
                this.handleProgress(percent, file);
            };
        }
        if (data) {
            const newData = typeof data === 'function' ? data(file) : data;
            Object.keys(newData).forEach(key => formData.append(key, newData[key]));
        }
        // TODO: `filename` default value needs better implementation
        formData.append(filename || 'file', file);
        const errorMsg = `cannot post ${formAction} ${xhr.status}`;
        if (xhrWithCredentials && 'withCredentials' in xhr) {
            xhr.withCredentials = true;
        }
        xhr.open('post', formAction, true);
        xhr.onload = () => {
            // 以二开头的状态码都认为是成功，暂定？
            const isSuccessful = xhr.status.toString().startsWith('2');
            if (isSuccessful) {
                this.handleSuccess(xhr.status, xhr.response, file);
            }
            else {
                this.handleError(new Error(errorMsg), getResponse(xhr), xhr.response, file);
            }
        };
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        if (headers !== undefined) {
            Object.keys(headers).forEach(key => {
                if ({}.hasOwnProperty.call(headers, key)) {
                    xhr.setRequestHeader(key, headers[key]);
                }
            });
        }
        xhr.send(formData);
        xhr.onerror = () => {
            this.handleError(new Error(errorMsg), getResponse(xhr), xhr.response, file);
        };
        xhr.ontimeout = () => {
            const timeoutMsg = `The request post for ${action} timed out`;
            this.handleError(new Error(timeoutMsg), getResponse(xhr), xhr.response, file);
        };
    }
    /**
     * 处理上传成功的函数，根据结果设置文件对象的状态，
     * 用于在UploadList中的展示
     *
     * @param {number} status HTTP状态码
     * @param {string} response 响应对象
     * @param {UploadFile} file 文件对象
     * @returns
     */
    handleSuccess(status, response, file) {
        const targetItem = this.getFileItem(file);
        if (targetItem) {
            const { onUploadSuccess } = this.props;
            targetItem.status = status === 200 ? 'success' : 'done';
            targetItem.response = response;
            if (onUploadSuccess) {
                onUploadSuccess(response, file);
            }
            this.forceUpdate();
        }
    }
    /**
     * 处理上传进度变化的函数，更新文件对象中的percent值，
     * 用于在UploadList中展示
     *
     * @param {number} percent 上传百分比
     * @param {UploadFile} file 文件对象
     * @returns
     */
    handleProgress(percent, file) {
        const { onUploadProgress } = this.props;
        const targetItem = this.getFileItem(file);
        if (targetItem) {
            targetItem.percent = percent;
            if (onUploadProgress) {
                onUploadProgress(percent, file);
            }
            this.forceUpdate();
        }
    }
    /**
     * 处理上传出错的函数，用于设置文件对象的status值，
     *
     * @param {Error} error 错误对象
     * @param {string} responseText 处理成字符串的响应对象
     * @param {UploadFile} file 文件对象
     * @returns
     */
    handleError(error, responseText, response, file) {
        const { onUploadError } = this.props;
        const targetItem = this.getFileItem(file);
        if (targetItem) {
            targetItem.status = 'error';
            targetItem.error = error;
            targetItem.response = responseText;
            if (onUploadError) {
                onUploadError(error, response, file);
            }
            this.forceUpdate();
        }
    }
    handleOnRemove(file) {
        const { onRemoveFile } = this.props;
        Promise.resolve(typeof onRemoveFile === 'function' ? onRemoveFile(file) : onRemoveFile).then(ret => {
            if (ret === false) {
                return;
            }
            this.removeFileItem(file);
        });
    }
    /**
     * 判断文件后缀名是否合格
     * this.props.accept值为falsy时返回true，否则正常判断
     *
     * @param {UploadFile[]} fileList 文件对象数组
     * @returns {boolean}
     * @memberof Upload
     */
    isAcceptFiles(fileList) {
        const { accept } = this.props;
        if (!accept) {
            return true;
        }
        const acceptTypes = accept.map(type => {
            type = type.replace(/\./g, '\\.');
            type = type.replace(/\*/g, '.*');
            return new RegExp(type);
        });
        return fileList.some(({ name, type }) => acceptTypes.some(acceptType => acceptType.test(name) || acceptType.test(type)));
    }
    /**
     * 使用日期获取一个uid
     *
     * @param {number} index 索引
     * @returns {string}
     * @memberof Upload
     */
    getUid(index) {
        const { prefixCls } = this;
        const now = new Date();
        return `${prefixCls}-${now}-${index}`;
    }
    /**
     * 从文件对象数组中获取一个文件对象的引用，
     * 首先尝试通过uid属性匹配文件对象，若失败则尝试name
     *
     * @param {UploadFile} file
     * @param {UploadFile[]} fileList 文件对象数组
     * @returns {UploadFile}
     * @memberof Upload
     */
    getFileItem(file) {
        const matchKey = file.uid !== undefined ? 'uid' : 'name';
        return this.fileList.find(item => item[matchKey] === file[matchKey]);
    }
    /**
     * 从文件对象数组中移除一个文件对象，
     * 首先尝试通过uid属性匹配文件对象，若失败则尝试name
     *
     * @param {UploadFile} file
     * @param {UploadFile[]} fileList
     * @returns {UploadFile[]}
     * @memberof Upload
     */
    removeFileItem(file) {
        const matchKey = file.uid !== undefined ? 'uid' : 'name';
        const index = this.fileList.findIndex(item => item[matchKey] === file[matchKey]);
        const { uploadFileList } = this.props;
        if (uploadFileList && uploadFileList.length) {
            uploadFileList.splice(index, 1);
            this.fileList.splice(index, 1);
        }
        else {
            this.fileList.splice(index, 1);
        }
    }
};
Upload.displayName = 'Upload';
Upload.propTypes = {
    /**
     * 可接受的上传文件类型
     * 可选值: MIME类型字符串组成的数组
     */
    accept: PropTypes.arrayOf(PropTypes.string),
    /**
     * 上传文件路径
     */
    action: PropTypes.string,
    /**
     * 上传所需参数或者返回上传参数的方法
     * @default
     * {}
     */
    data: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    /**
     * 设置上传的请求头部
     * @default
     * {}
     */
    headers: PropTypes.object,
    /**
     * 是否支持多选文件
     * @default
     * false
     */
    multiple: PropTypes.bool,
    uploadImmediately: PropTypes.bool,
    fileListMaxLength: PropTypes.number,
    showPreviewImage: PropTypes.bool,
    previewImageWidth: PropTypes.number,
    extra: PropTypes.any,
    onFileChange: PropTypes.func,
    beforeUpload: PropTypes.func,
    onRemoveFile: PropTypes.func,
    onUploadProgress: PropTypes.func,
    onUploadSuccess: PropTypes.func,
    onUploadError: PropTypes.func,
    showUploadBtn: PropTypes.bool,
    showUploadList: PropTypes.bool,
    uploadFileList: PropTypes.array,
    withCredentials: PropTypes.bool,
    appendUpload: PropTypes.bool,
    partialUpload: PropTypes.bool,
    ...FormField.propTypes,
};
Upload.defaultProps = {
    ...FormField.defaultProps,
    suffixCls: 'upload',
    multiple: false,
    headers: {},
    data: {},
    action: '',
    name: 'file',
    withCredentials: false,
    appendUpload: false,
    partialUpload: true,
    uploadImmediately: true,
    fileListMaxLength: 0,
    showPreviewImage: true,
    previewImageWidth: 100,
    showUploadBtn: true,
    showUploadList: true,
    beforeUpload: T,
    onUploadSuccess: () => message.success($l('Upload', 'upload_success')),
    onUploadError: () => message.error($l('Upload', 'upload_failure')),
};
__decorate([
    observable
], Upload.prototype, "fileList", void 0);
__decorate([
    action
], Upload.prototype, "componentWillReceiveProps", null);
__decorate([
    autobind,
    action
], Upload.prototype, "handleChange", null);
__decorate([
    autobind,
    action
], Upload.prototype, "uploadFiles", null);
__decorate([
    autobind,
    action
], Upload.prototype, "upload", null);
__decorate([
    action
], Upload.prototype, "handleSuccess", null);
__decorate([
    action
], Upload.prototype, "handleProgress", null);
__decorate([
    action
], Upload.prototype, "handleError", null);
__decorate([
    action
], Upload.prototype, "handleRemove", void 0);
__decorate([
    action
], Upload.prototype, "removeFileItem", null);
Upload = __decorate([
    observer
], Upload);
export default Upload;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJmaWxlIjoiL1VzZXJzL2h1aWh1YXdrL0RvY3VtZW50cy9vcHQvY2hvZXJvZG9uLXVpL2NvbXBvbmVudHMtcHJvL3VwbG9hZC9VcGxvYWQudHN4IiwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEtBQW9CLE1BQU0sT0FBTyxDQUFDO0FBQ3pDLE9BQU8sU0FBUyxNQUFNLFlBQVksQ0FBQztBQUNuQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDdkQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUN0QyxPQUFPLElBQUksTUFBTSxhQUFhLENBQUM7QUFDL0IsT0FBTyxNQUFNLE1BQU0sZUFBZSxDQUFDO0FBQ25DLE9BQU8sRUFBRSxDQUFDLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUNsRCxPQUFPLE9BQU8sTUFBTSxnQkFBZ0IsQ0FBQztBQUNyQyxPQUFPLE1BQU0sTUFBTSxrQkFBa0IsQ0FBQztBQUV0QyxPQUFPLFFBQVEsTUFBTSxtQkFBbUIsQ0FBQztBQUN6QyxPQUFPLEVBQUUsU0FBUyxFQUFrQixNQUFNLG9CQUFvQixDQUFDO0FBQy9ELE9BQU8sSUFBSSxNQUFNLFNBQVMsQ0FBQztBQUMzQixPQUFPLE9BQU8sTUFBTSxZQUFZLENBQUM7QUFDakMsT0FBTyxLQUFLLE1BQU0sVUFBVSxDQUFDO0FBRTdCLE9BQU8sVUFBVSxNQUFNLGNBQWMsQ0FBQztBQUN0QyxPQUFPLE9BQU8sTUFBTSxvQkFBb0IsQ0FBQztBQUN6QyxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFFdkM7Ozs7OztHQU1HO0FBQ0gsU0FBUyxXQUFXLENBQUMsR0FBbUI7SUFDdEMsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLFlBQVksSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDO0lBQzdDLElBQUksQ0FBQyxHQUFHLEVBQUU7UUFDUixPQUFPLEdBQUcsQ0FBQztLQUNaO0lBRUQsSUFBSTtRQUNGLE9BQU8sSUFBSSxDQUFDLEtBQUss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RUFBRSxJQUFJO0lBQ25CLGNBQWMsRUFBRSxJQUFJO0lBQ3BCLFlBQVksRUFBRSxDQUFDO0lBQ2YsZUFBZSxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3RFLGFBQWEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztDQUNuRSxDQUFDO0FBVVU7SUFBWCxVQUFVO3dDQUF3QjtBQW1CbkM7SUFEQyxNQUFNO3VEQU1OO0FBeUpEO0lBRkMsUUFBUTtJQUNSLE1BQU07MENBK0JOO0FBV0Q7SUFGQyxRQUFRO0lBQ1IsTUFBTTt5Q0FvQ047QUFZRDtJQUZDLFFBQVE7SUFDUixNQUFNO29DQThETjtBQVlEO0lBREMsTUFBTTsyQ0FZTjtBQVdEO0lBREMsTUFBTTs0Q0FXTjtBQVdEO0lBREMsTUFBTTt5Q0FhTjtBQUdEO0lBREMsTUFBTTs0Q0FNTDtBQTBFRjtJQURDLE1BQU07NENBV047QUF0akJrQixNQUFNO0lBRDFCLFFBQVE7R0FDWSxNQUFNLENBdWpCMUI7ZUF2akJvQixNQUFNIiwibmFtZXMiOltdLCJzb3VyY2VzIjpbIi9Vc2Vycy9odWlodWF3ay9Eb2N1bWVudHMvb3B0L2Nob2Vyb2Rvbi11aS9jb21wb25lbnRzLXByby91cGxvYWQvVXBsb2FkLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgUmVhY3ROb2RlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7IGFjdGlvbiwgb2JzZXJ2YWJsZSwgcnVuSW5BY3Rpb24gfSBmcm9tICdtb2J4JztcbmltcG9ydCB7IG9ic2VydmVyIH0gZnJvbSAnbW9ieC1yZWFjdCc7XG5pbXBvcnQgb21pdCBmcm9tICdsb2Rhc2gvb21pdCc7XG5pbXBvcnQgdW5pcUJ5IGZyb20gJ2xvZGFzaC91bmlxQnknO1xuaW1wb3J0IHsgVCB9IGZyb20gJ2Nob2Vyb2Rvbi11aS9saWIvdXBsb2FkL3V0aWxzJztcbmltcG9ydCBpc0VtcHR5IGZyb20gJ2xvZGFzaC9pc0VtcHR5JztcbmltcG9ydCBCdXR0b24gZnJvbSAnLi4vYnV0dG9uL0J1dHRvbic7XG5pbXBvcnQgeyBCdXR0b25Db2xvciB9IGZyb20gJy4uL2J1dHRvbi9lbnVtJztcbmltcG9ydCBhdXRvYmluZCBmcm9tICcuLi9fdXRpbC9hdXRvYmluZCc7XG5pbXBvcnQgeyBGb3JtRmllbGQsIEZvcm1GaWVsZFByb3BzIH0gZnJvbSAnLi4vZmllbGQvRm9ybUZpZWxkJztcbmltcG9ydCBJY29uIGZyb20gJy4uL2ljb24nO1xuaW1wb3J0IG1lc3NhZ2UgZnJvbSAnLi4vbWVzc2FnZSc7XG5pbXBvcnQgTW9kYWwgZnJvbSAnLi4vbW9kYWwnO1xuaW1wb3J0IHsgVXBsb2FkRmlsZSB9IGZyb20gJy4vaW50ZXJmYWNlJztcbmltcG9ydCBVcGxvYWRMaXN0IGZyb20gJy4vVXBsb2FkTGlzdCc7XG5pbXBvcnQgVG9vbHRpcCBmcm9tICcuLi90b29sdGlwL1Rvb2x0aXAnO1xuaW1wb3J0IHsgJGwgfSBmcm9tICcuLi9sb2NhbGUtY29udGV4dCc7XG5cbi8qKlxuICog5oqKWE1MSHR0cFJlcXVlc3Tlr7nosaHnmoTov5Tlm57kv6Hmga/ovazljJbkuLrlrZfnrKbkuLJcbiAqXG4gKiBAcGFyYW0ge1hNTEh0dHBSZXF1ZXN0fSB4aHJcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKiBAbWVtYmVyb2YgVXBsb2FkXG4gKi9cbmZ1bmN0aW9uIGdldFJlc3BvbnNlKHhocjogWE1MSHR0cFJlcXVlc3QpOiBzdHJpbmcge1xuICBjb25zdCByZXMgPSB4aHIucmVzcG9uc2VUZXh0IHx8IHhoci5yZXNwb25zZTtcbiAgaWYgKCFyZXMpIHtcbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShyZXMpLm1lc3NhZ2U7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBVcGxvYWRQcm9wcyBleHRlbmRzIEZvcm1GaWVsZFByb3BzIHtcbiAgLyoqXG4gICAqICDlj6/mjqXlj5fnmoTkuIrkvKDmlofku7bnsbvlnotcbiAgICovXG4gIGFjY2VwdD86IHN0cmluZ1tdO1xuICAvKipcbiAgICog5LiK5Lyg5paH5Lu26Lev5b6EXG4gICAqL1xuICBhY3Rpb246IHN0cmluZztcbiAgLyoqXG4gICAqIOS4iuS8oOaJgOmcgOWPguaVsOaIluiAhei/lOWbnuS4iuS8oOWPguaVsOeahOaWueazlVxuICAgKi9cbiAgZGF0YT86IG9iamVjdCB8IEZ1bmN0aW9uO1xuICAvKipcbiAgICog6K6+572u5LiK5Lyg55qE6K+35rGC5aS06YOoXG4gICAqL1xuICBoZWFkZXJzPzogYW55O1xuICAvKipcbiAgICog5piv5ZCm5pSv5oyB5aSa6YCJ5paH5Lu2XG4gICAqL1xuICBtdWx0aXBsZT86IGJvb2xlYW47XG4gIC8qKlxuICAgKiDmmK/lkKblnKjpgInmi6nmlofku7blkI7nq4vljbPkuIrkvKBcbiAgICpcbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBtZW1iZXJvZiBVcGxvYWRQcm9wc1xuICAgKi9cbiAgdXBsb2FkSW1tZWRpYXRlbHk/OiBib29sZWFuO1xuICAvKipcbiAgICog57uE5Lu25Y+z5LiK6KeS55qE5biu5Yqp5L+h5oGvXG4gICAqXG4gICAqIEB0eXBlIHtSZWFjdE5vZGV9XG4gICAqIEBtZW1iZXJvZiBVcGxvYWRQcm9wc1xuICAgKi9cbiAgZXh0cmE/OiBSZWFjdE5vZGU7XG4gIC8qKlxuICAgKiBpbnB1dOWFg+e0oOWGheW3sumAieaLqeaWh+S7tuWPmOWMlueahOWbnuiwg1xuICAgKlxuICAgKiBAbWVtYmVyb2YgVXBsb2FkUHJvcHNcbiAgICovXG4gIG9uRmlsZUNoYW5nZT86IChmaWxlTGlzdDogVXBsb2FkRmlsZVtdKSA9PiB2b2lkO1xuICAvKipcbiAgICog5LiK5Lyg5LmL5YmN55qE5Zue6LCDXG4gICAqXG4gICAqIEBtZW1iZXJvZiBVcGxvYWRQcm9wc1xuICAgKi9cbiAgYmVmb3JlVXBsb2FkPzogKGZpbGU6IFVwbG9hZEZpbGUsIEZpbGVMaXN0OiBVcGxvYWRGaWxlW10pID0+IGJvb2xlYW4gfCBQcm9taXNlTGlrZTx2b2lkPjtcbiAgLyoqXG4gICAqIOWIoOmZpOWQjueahOWbnuiwg1xuICAgKlxuICAgKiBAbWVtYmVyb2YgVXBsb2FkUHJvcHNcbiAgICovXG4gIG9uUmVtb3ZlRmlsZT86IChmaWxlOiBVcGxvYWRGaWxlKSA9PiB2b2lkIHwgYm9vbGVhbiB8IFByb21pc2U8dm9pZCB8IGJvb2xlYW4+O1xuICAvKipcbiAgICog5LiK5Lyg6L+b5bqm5Y+Y5YyW55qE5Zue6LCDXG4gICAqXG4gICAqIEBtZW1iZXJvZiBVcGxvYWRQcm9wc1xuICAgKi9cbiAgb25VcGxvYWRQcm9ncmVzcz86IChwZXJjZW50OiBudW1iZXIsIGZpbGU6IFVwbG9hZEZpbGUpID0+IHZvaWQ7XG4gIC8qKlxuICAgKiDkuIrkvKDmiJDlip/nmoTlm57osINcbiAgICpcbiAgICogQG1lbWJlcm9mIFVwbG9hZFByb3BzXG4gICAqL1xuICBvblVwbG9hZFN1Y2Nlc3M/OiAocmVzcG9uc2U6IGFueSwgZmlsZTogVXBsb2FkRmlsZSkgPT4gdm9pZDtcbiAgLyoqXG4gICAqIOS4iuS8oOWHuumUmeeahOWbnuiwg1xuICAgKlxuICAgKiBAbWVtYmVyb2YgVXBsb2FkUHJvcHNcbiAgICovXG4gIG9uVXBsb2FkRXJyb3I/OiAoZXJyb3I6IEVycm9yLCByZXNwb25zZTogYW55LCBmaWxlOiBVcGxvYWRGaWxlKSA9PiB2b2lkO1xuICAvKipcbiAgICog5paH5Lu25LiK5Lyg6Zif5YiX55qE5pyA5aSn6ZW/5bqm77yMMOihqOekuuS4jemZkOWItlxuICAgKlxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKiBAbWVtYmVyb2YgVXBsb2FkUHJvcHNcbiAgICovXG4gIGZpbGVMaXN0TWF4TGVuZ3RoPzogbnVtYmVyO1xuICAvKipcbiAgICog5o6n5Yi25Zu+54mH6aKE6KeI55qE6YWN572u5a+56LGhXG4gICAqXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAbWVtYmVyb2YgVXBsb2FkUHJvcHNcbiAgICovXG4gIHNob3dQcmV2aWV3SW1hZ2U/OiBib29sZWFuO1xuICAvKipcbiAgICog6aKE6KeI5Zu+54mH55qE5a695bqmXG4gICAqXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBtZW1iZXJvZiBVcGxvYWRQcm9wc1xuICAgKi9cbiAgcHJldmlld0ltYWdlV2lkdGg/OiBudW1iZXI7XG4gIC8qKlxuICAgKiDmmK/lkKbmmL7npLrkuIrkvKDmjInpkq5cbiAgICpcbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBtZW1iZXJvZiBVcGxvYWRQcm9wc1xuICAgKi9cbiAgc2hvd1VwbG9hZEJ0bj86IGJvb2xlYW47XG4gIC8qKlxuICAgKiDmmK/lkKbmmL7npLrkuIrkvKDliJfooahcbiAgICpcbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBtZW1iZXJvZiBVcGxvYWRQcm9wc1xuICAgKi9cbiAgc2hvd1VwbG9hZExpc3Q/OiBib29sZWFuO1xuICAvKipcbiAgICog6buY6K6k5pi+56S655qE5LiK5Lyg5YiX6KGoXG4gICAqXG4gICAqIEB0eXBlIHthcnJheX1cbiAgICogQG1lbWJlcm9mIFVwbG9hZFByb3BzXG4gICAqL1xuICBkZWZhdWx0RmlsZUxpc3Q/OiBBcnJheTxVcGxvYWRGaWxlPjtcbiAgLyoqXG4gICAqIOW3sue7j+S4iuS8oOeahOWIl+ihqFxuICAgKlxuICAgKiBAdHlwZSB7YXJyYXl9XG4gICAqIEBtZW1iZXJvZiBVcGxvYWRQcm9wc1xuICAgKi9cbiAgdXBsb2FkRmlsZUxpc3Q/OiBBcnJheTxVcGxvYWRGaWxlPjtcbiAgLyoqXG4gICAqIOS4iuS8oOivt+axguaXtuaYr+WQpuaQuuW4piBjb29raWVcbiAgICpcbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBtZW1iZXJvZiBVcGxvYWRQcm9wc1xuICAgKi9cbiAgd2l0aENyZWRlbnRpYWxzPzogYm9vbGVhbjtcbiAgLyoqXG4gICAqIOaYr+WQpuS7pei/veWKoOW9ouW8j+a3u+WKoOaWh+S7tuiHs+WIl+ihqOS4rVxuICAgKlxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQG1lbWJlcm9mIFVwbG9hZFByb3BzXG4gICAqL1xuICBhcHBlbmRVcGxvYWQ/OiBib29sZWFuO1xuICAvKipcbiAgICog5piv5ZCm5q+P5qyh5LiK5Lyg5YWo6YOo5paH5Lu2XG4gICAqXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAbWVtYmVyb2YgVXBsb2FkUHJvcHNcbiAgICovXG4gIHBhcnRpYWxVcGxvYWQ/OiBib29sZWFuO1xufVxuXG5Ab2JzZXJ2ZXJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFVwbG9hZCBleHRlbmRzIEZvcm1GaWVsZDxVcGxvYWRQcm9wcz4ge1xuICBzdGF0aWMgZGlzcGxheU5hbWUgPSAnVXBsb2FkJztcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIC8qKlxuICAgICAqIOWPr+aOpeWPl+eahOS4iuS8oOaWh+S7tuexu+Wei1xuICAgICAqIOWPr+mAieWAvDogTUlNReexu+Wei+Wtl+espuS4sue7hOaIkOeahOaVsOe7hFxuICAgICAqL1xuICAgIGFjY2VwdDogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLnN0cmluZyksXG4gICAgLyoqXG4gICAgICog5LiK5Lyg5paH5Lu26Lev5b6EXG4gICAgICovXG4gICAgYWN0aW9uOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIC8qKlxuICAgICAqIOS4iuS8oOaJgOmcgOWPguaVsOaIluiAhei/lOWbnuS4iuS8oOWPguaVsOeahOaWueazlVxuICAgICAqIEBkZWZhdWx0XG4gICAgICoge31cbiAgICAgKi9cbiAgICBkYXRhOiBQcm9wVHlwZXMub25lT2ZUeXBlKFtQcm9wVHlwZXMub2JqZWN0LCBQcm9wVHlwZXMuZnVuY10pLFxuICAgIC8qKlxuICAgICAqIOiuvue9ruS4iuS8oOeahOivt+axguWktOmDqFxuICAgICAqIEBkZWZhdWx0XG4gICAgICoge31cbiAgICAgKi9cbiAgICBoZWFkZXJzOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIC8qKlxuICAgICAqIOaYr+WQpuaUr+aMgeWkmumAieaWh+S7tlxuICAgICAqIEBkZWZhdWx0XG4gICAgICogZmFsc2VcbiAgICAgKi9cbiAgICBtdWx0aXBsZTogUHJvcFR5cGVzLmJvb2wsXG4gICAgdXBsb2FkSW1tZWRpYXRlbHk6IFByb3BUeXBlcy5ib29sLFxuICAgIGZpbGVMaXN0TWF4TGVuZ3RoOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIHNob3dQcmV2aWV3SW1hZ2U6IFByb3BUeXBlcy5ib29sLFxuICAgIHByZXZpZXdJbWFnZVdpZHRoOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIGV4dHJhOiBQcm9wVHlwZXMuYW55LFxuICAgIG9uRmlsZUNoYW5nZTogUHJvcFR5cGVzLmZ1bmMsXG4gICAgYmVmb3JlVXBsb2FkOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvblJlbW92ZUZpbGU6IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uVXBsb2FkUHJvZ3Jlc3M6IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uVXBsb2FkU3VjY2VzczogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25VcGxvYWRFcnJvcjogUHJvcFR5cGVzLmZ1bmMsXG4gICAgc2hvd1VwbG9hZEJ0bjogUHJvcFR5cGVzLmJvb2wsXG4gICAgc2hvd1VwbG9hZExpc3Q6IFByb3BUeXBlcy5ib29sLFxuICAgIHVwbG9hZEZpbGVMaXN0OiBQcm9wVHlwZXMuYXJyYXksXG4gICAgd2l0aENyZWRlbnRpYWxzOiBQcm9wVHlwZXMuYm9vbCxcbiAgICBhcHBlbmRVcGxvYWQ6IFByb3BUeXBlcy5ib29sLFxuICAgIHBhcnRpYWxVcGxvYWQ6IFByb3BUeXBlcy5ib29sLFxuICAgIC4uLkZvcm1GaWVsZC5wcm9wVHlwZXMsXG4gIH07XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICAuLi5Gb3JtRmllbGQuZGVmYXVsdFByb3BzLFxuICAgIHN1ZmZpeENsczogJ3VwbG9hZCcsXG4gICAgbXVsdGlwbGU6IGZhbHNlLFxuICAgIGhlYWRlcnM6IHt9LFxuICAgIGRhdGE6IHt9LFxuICAgIGFjdGlvbjogJycsXG4gICAgbmFtZTogJ2ZpbGUnLFxuICAgIHdpdGhDcmVkZW50aWFsczogZmFsc2UsXG4gICAgYXBwZW5kVXBsb2FkOiBmYWxzZSxcbiAgICBwYXJ0aWFsVXBsb2FkOiB0cnVlLFxuICAgIHVwbG9hZEltbWVkaWF0ZWx5OiB0cnVlLFxuICAgIGZpbGVMaXN0TWF4TGVuZ3RoOiAwLFxuICAgIHNob3dQcmV2aWV3SW1hZ2U6IHRydWUsXG4gICAgcHJldmlld0ltYWdlV2lkdGg6IDEwMCxcbiAgICBzaG93VXBsb2FkQnRuOiB0cnVlLFxuICAgIHNob3dVcGxvYWRMaXN0OiB0cnVlLFxuICAgIGJlZm9yZVVwbG9hZDogVCxcbiAgICBvblVwbG9hZFN1Y2Nlc3M6ICgpID0+IG1lc3NhZ2Uuc3VjY2VzcygkbCgnVXBsb2FkJywgJ3VwbG9hZF9zdWNjZXNzJykpLFxuICAgIG9uVXBsb2FkRXJyb3I6ICgpID0+IG1lc3NhZ2UuZXJyb3IoJGwoJ1VwbG9hZCcsICd1cGxvYWRfZmFpbHVyZScpKSxcbiAgfTtcblxuICAvKipcbiAgICog5L+d5a2Y5LiK5Lyg55qE5paH5Lu25a+56LGhXG4gICAqXG4gICAqIOiLpeebtOaOpeS8oOmAku+8jOa1j+iniOWZqOS8muiupOS4uuWug+aYr01vYnjlr7nosaHvvIzlm6DmraTmnInml7bpnIDopoHmiYvliqjlpI3liLblubbkvKDlgLzosIPnlKhcbiAgICpcbiAgICogQHR5cGUge1VwbG9hZEZpbGVbXX1cbiAgICogQG1lbWJlcm9mIFVwbG9hZFxuICAgKi9cbiAgQG9ic2VydmFibGUgZmlsZUxpc3Q6IFVwbG9hZEZpbGVbXTtcblxuICAvKipcbiAgICog5Y6f55SfPGlucHV0PuWFg+e0oOeahOW8leeUqFxuICAgKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAdHlwZSB7SFRNTElucHV0RWxlbWVudH1cbiAgICogQG1lbWJlcm9mIFVwbG9hZFxuICAgKi9cbiAgcHJpdmF0ZSBuYXRpdmVJbnB1dEVsZW1lbnQ6IEhUTUxJbnB1dEVsZW1lbnQ7XG5cbiAgY29uc3RydWN0b3IocHJvcHMsIGNvbnRleHQpIHtcbiAgICBzdXBlcihwcm9wcywgY29udGV4dCk7XG4gICAgcnVuSW5BY3Rpb24oKCkgPT4ge1xuICAgICAgdGhpcy5maWxlTGlzdCA9IHByb3BzLnVwbG9hZEZpbGVMaXN0IHx8IHByb3BzLmRlZmF1bHRGaWxlTGlzdCB8fCBbXTtcbiAgICB9KTtcbiAgfVxuXG4gIEBhY3Rpb25cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcbiAgICBjb25zdCB7IHVwbG9hZEZpbGVMaXN0IH0gPSBuZXh0UHJvcHM7XG4gICAgaWYgKHVwbG9hZEZpbGVMaXN0ICE9PSB0aGlzLmZpbGVMaXN0ICYmIHVwbG9hZEZpbGVMaXN0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuZmlsZUxpc3QgPSB1bmlxQnkodXBsb2FkRmlsZUxpc3QsIChpdGVtOiBVcGxvYWRGaWxlKSA9PiBpdGVtLnVpZCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0T3RoZXJQcm9wcygpIHtcbiAgICBjb25zdCBvdGhlclByb3BzID0gb21pdChzdXBlci5nZXRPdGhlclByb3BzKCksIFtcbiAgICAgICdhY2NlcHQnLFxuICAgICAgJ2FjdGlvbicsXG4gICAgICAnZGF0YScsXG4gICAgICAnaGVhZGVyJyxcbiAgICAgICdtdWx0aXBsZScsXG4gICAgICAnb25DaGFuZ2UnLFxuICAgICAgJ3JlZicsXG4gICAgICAndXBsb2FkSW1tZWRpYXRlbHknLFxuICAgICAgJ2ZpbGVMaXN0TWF4TGVuZ3RoJyxcbiAgICAgICdzaG93UHJldmlld0ltYWdlJyxcbiAgICAgICdwcmV2aWV3SW1hZ2VXaWR0aCcsXG4gICAgICAnc2hvd1VwbG9hZEJ0bicsXG4gICAgICAnc2hvd1VwbG9hZExpc3QnLFxuICAgICAgJ29uUmVtb3ZlRmlsZScsXG4gICAgICAnb25VcGxvYWRTdWNjZXNzJyxcbiAgICAgICdvblVwbG9hZEVycm9yJyxcbiAgICAgICdvbkZpbGVDaGFuZ2UnLFxuICAgICAgJ2JlZm9yZVVwbG9hZCcsXG4gICAgICAnd2l0aENyZWRlbnRpYWxzJyxcbiAgICAgICdwYXJ0aWFsVXBsb2FkJyxcbiAgICAgICdhcHBlbmRVcGxvYWQnLFxuICAgICAgJ3VwbG9hZEZpbGVMaXN0JyxcbiAgICBdKTtcbiAgICByZXR1cm4gb3RoZXJQcm9wcztcbiAgfVxuXG4gIHNhdmVOYXRpdmVJbnB1dEVsZW1lbnQgPSBlbGVtID0+ICh0aGlzLm5hdGl2ZUlucHV0RWxlbWVudCA9IGVsZW0pO1xuXG4gIC8qKlxuICAgKiDkvKDpgJLljIXoo4XmjInpkq7nmoTngrnlh7vkuovku7ZcbiAgICpcbiAgICovXG4gIGhhbmRsZVdyYXBwZXJCdG5DbGljayA9ICgpID0+IHtcbiAgICB0aGlzLm5hdGl2ZUlucHV0RWxlbWVudC5jbGljaygpO1xuICB9O1xuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7XG4gICAgICBwcmVmaXhDbHMsXG4gICAgICBwcm9wczoge1xuICAgICAgICBhY3Rpb246IGZvcm1BY3Rpb24sXG4gICAgICAgIGNoaWxkcmVuLFxuICAgICAgICBtdWx0aXBsZSxcbiAgICAgICAgYWNjZXB0LFxuICAgICAgICBuYW1lID0gJ2ZpbGUnLCAvLyA8LS0gY29udmluY2UgdHNcbiAgICAgICAgdXBsb2FkSW1tZWRpYXRlbHksXG4gICAgICAgIHNob3dQcmV2aWV3SW1hZ2UsXG4gICAgICAgIHByZXZpZXdJbWFnZVdpZHRoLFxuICAgICAgICBzaG93VXBsb2FkQnRuLFxuICAgICAgICBzaG93VXBsb2FkTGlzdCxcbiAgICAgICAgZXh0cmEsXG4gICAgICB9LFxuICAgIH0gPSB0aGlzO1xuXG4gICAgY29uc3QgdXBsb2FkUHJvcHMgPSB7XG4gICAgICBtdWx0aXBsZSxcbiAgICAgIGFjY2VwdDogYWNjZXB0ID8gYWNjZXB0LmpvaW4oJywnKSA6IHVuZGVmaW5lZCxcbiAgICAgIGFjdGlvbjogZm9ybUFjdGlvbixcbiAgICAgIG5hbWUsXG4gICAgICB0eXBlOiAnZmlsZScsXG4gICAgICByZWY6IHRoaXMuc2F2ZU5hdGl2ZUlucHV0RWxlbWVudCxcbiAgICAgIG9uQ2hhbmdlOiB0aGlzLmhhbmRsZUNoYW5nZSxcbiAgICAgIC4uLnRoaXMuZ2V0T3RoZXJQcm9wcygpLFxuICAgIH07XG5cbiAgICBjb25zdCBpbnB1dFdyYXBwZXJCdG4gPSBbXG4gICAgICA8QnV0dG9uIGtleT1cInVwbG9hZC1idG5cIiBvbkNsaWNrPXt0aGlzLmhhbmRsZVdyYXBwZXJCdG5DbGlja30+XG4gICAgICAgIDxJY29uIHR5cGU9XCJpbnNlcnRfZHJpdmVfZmlsZVwiIC8+XG4gICAgICAgIDxzcGFuPntjaGlsZHJlbiB8fCAkbCgnVXBsb2FkJywgJ2ZpbGVfc2VsZWN0aW9uJyl9PC9zcGFuPlxuICAgICAgPC9CdXR0b24+LFxuICAgICAgPGlucHV0IGtleT1cInVwbG9hZFwiIHsuLi51cGxvYWRQcm9wc30gaGlkZGVuIC8+LFxuICAgIF07XG5cbiAgICBjb25zdCB1cGxvYWRCdG4gPSAoXG4gICAgICA8VG9vbHRpcCB0aXRsZT17JGwoJ1VwbG9hZCcsICdjbGlja190b191cGxvYWQnKX0gcGxhY2VtZW50PVwicmlnaHRcIj5cbiAgICAgICAgPEJ1dHRvbiBjb2xvcj17QnV0dG9uQ29sb3IucHJpbWFyeX0gb25DbGljaz17dGhpcy5oYW5kbGVVcGxvYWRCdG5DbGlja30+XG4gICAgICAgICAgPEljb24gdHlwZT1cImZpbGVfdXBsb2FkXCIgLz5cbiAgICAgICAgPC9CdXR0b24+XG4gICAgICA8L1Rvb2x0aXA+XG4gICAgKTtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7cHJlZml4Q2xzfWB9PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgtd3JhcHBlclwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgJHtwcmVmaXhDbHN9LXNlbGVjdGB9PlxuICAgICAgICAgICAge2lucHV0V3JhcHBlckJ0bn1cbiAgICAgICAgICAgIHshdXBsb2FkSW1tZWRpYXRlbHkgJiYgc2hvd1VwbG9hZEJ0biA/IHVwbG9hZEJ0biA6IG51bGx9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdj57ZXh0cmF9PC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7c2hvd1VwbG9hZExpc3QgPyAoXG4gICAgICAgICAgPFVwbG9hZExpc3RcbiAgICAgICAgICAgIHByZXZpZXdJbWFnZVdpZHRoPXtwcmV2aWV3SW1hZ2VXaWR0aCBhcyBudW1iZXJ9XG4gICAgICAgICAgICBzaG93UHJldmlld0ltYWdlPXtzaG93UHJldmlld0ltYWdlIGFzIGJvb2xlYW59XG4gICAgICAgICAgICBpdGVtcz17Wy4uLnRoaXMuZmlsZUxpc3RdfVxuICAgICAgICAgICAgcmVtb3ZlPXt0aGlzLmhhbmRsZVJlbW92ZX1cbiAgICAgICAgICAvPlxuICAgICAgICApIDogbnVsbH1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBoYW5kbGVVcGxvYWRCdG5DbGljayA9ICgpID0+IHtcbiAgICB0aGlzLnN0YXJ0VXBsb2FkKCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIOaWh+S7tuS4iuS8oOWJjeeahOWbnuiwg1xuICAgKlxuICAgKiBAcGFyYW0ge1VwbG9hZEZpbGV9XG4gICAqIEBwYXJhbSB7VXBsb2FkRmlsZVtdfVxuICAgKiBAbWVtYmVyb2YgVXBsb2FkXG4gICAqL1xuICBiZWZvcmVVcGxvYWQgPSAoZmlsZTogVXBsb2FkRmlsZSwgZmlsZUxpc3Q6IFVwbG9hZEZpbGVbXSkgPT4ge1xuICAgIGNvbnN0IHsgYmVmb3JlVXBsb2FkIH0gPSB0aGlzLnByb3BzO1xuICAgIGlmICghYmVmb3JlVXBsb2FkKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgY29uc3QgcmVzdWx0ID0gYmVmb3JlVXBsb2FkKGZpbGUsIGZpbGVMaXN0KTtcbiAgICBpZiAocmVzdWx0ID09PSBmYWxzZSkge1xuICAgICAgdGhpcy5yZW1vdmVGaWxlSXRlbShmaWxlKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHJlc3VsdCAmJiAocmVzdWx0IGFzIFByb21pc2VMaWtlPGFueT4pLnRoZW4pIHtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIHN0YXJ0VXBsb2FkID0gKCkgPT4ge1xuICAgIGNvbnN0IGZpbGVMaXN0ID0gWy4uLnRoaXMuZmlsZUxpc3RdO1xuICAgIGlmIChmaWxlTGlzdC5sZW5ndGgpIHtcbiAgICAgIC8vIDwtLSDlvZPmnInmlofku7bml7bmiY3kuIrkvKBcbiAgICAgIHRoaXMudXBsb2FkRmlsZXMoZmlsZUxpc3QpO1xuICAgICAgLy8gdGhpcy5uYXRpdmVJbnB1dEVsZW1lbnQudmFsdWUgPSAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgTW9kYWwuZXJyb3IoJGwoJ1VwbG9hZCcsICdub19maWxlJykpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICog5aSE55CGPGlucHV0IHR5cGU9XCJmaWxlXCI+5YWD57Sg55qEY2hhbmdl5LqL5Lu277yMXG4gICAqIOS4u+imgeaYr+WPluWHuuS6i+S7tuWvueixoeS4reeahGZpbGVz5a+56LGh5bm25Lyg6YCS57uZdXBsb2FkRmlsZXPmlrnms5VcbiAgICpcbiAgICogQHBhcmFtIHsqfSBlIDxpbnB1dD7lhYPntKDnmoRjaGFuZ2Xkuovku7blr7nosaFcbiAgICogQG1lbWJlcm9mIFVwbG9hZFxuICAgKi9cbiAgQGF1dG9iaW5kXG4gIEBhY3Rpb25cbiAgaGFuZGxlQ2hhbmdlKGU6IGFueSkge1xuICAgIGlmIChlLnRhcmdldC52YWx1ZSA9PT0gJycpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgeyBhcHBlbmRVcGxvYWQsIGRlZmF1bHRGaWxlTGlzdCwgdXBsb2FkRmlsZUxpc3QgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgZmlsZUxpc3QgPSBlLnRhcmdldC5maWxlcztcbiAgICBjb25zdCBmaWxlczogYW55ID0gQXJyYXkuZnJvbShmaWxlTGlzdCkuc2xpY2UoMCk7XG4gICAgY29uc3QgdGVtcEZpbGVMaXN0ID1cbiAgICAgIGFwcGVuZFVwbG9hZCB8fCBkZWZhdWx0RmlsZUxpc3QgfHwgdXBsb2FkRmlsZUxpc3QgPyB0aGlzLmZpbGVMaXN0LnNsaWNlKCkgOiBbXTtcbiAgICBjb25zdCBmaWxlQnVmZmVyOiBVcGxvYWRGaWxlW10gPSBbXTtcbiAgICBmaWxlcy5mb3JFYWNoKChmaWxlOiBVcGxvYWRGaWxlLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBmaWxlLnVpZCA9IHRoaXMuZ2V0VWlkKGluZGV4KTtcbiAgICAgIGZpbGUudXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChmaWxlKTtcbiAgICAgIGNvbnN0IHJlcyA9IHRoaXMuYmVmb3JlVXBsb2FkKGZpbGUsIGZpbGVzKTtcbiAgICAgIGlmICghcmVzKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGZpbGVCdWZmZXIucHVzaChmaWxlKTtcbiAgICB9KTtcbiAgICB0aGlzLmZpbGVMaXN0ID0gWy4uLnRlbXBGaWxlTGlzdCwgLi4uZmlsZUJ1ZmZlcl07XG4gICAgY29uc3QgeyB1cGxvYWRJbW1lZGlhdGVseSwgb25GaWxlQ2hhbmdlIH0gPSB0aGlzLnByb3BzO1xuICAgIGUudGFyZ2V0LnZhbHVlID0gJyc7XG4gICAgaWYgKHVwbG9hZEltbWVkaWF0ZWx5KSB7XG4gICAgICBpZighaXNFbXB0eShmaWxlQnVmZmVyKSkge1xuICAgICAgICB0aGlzLnVwbG9hZEZpbGVzKHRoaXMuZmlsZUxpc3QpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAob25GaWxlQ2hhbmdlKSB7XG4gICAgICBvbkZpbGVDaGFuZ2UodGhpcy5maWxlTGlzdC5zbGljZSgpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog5YiG5Yir5LiK5LygZmlsZUxpc3TkuK3nmoTmr4/kuKrmlofku7blr7nosaFcbiAgICpcbiAgICogQHBhcmFtIHtVcGxvYWRGaWxlW119IGZpbGVMaXN0IOaWh+S7tuWvueixoeaVsOe7hFxuICAgKiBAcmV0dXJucyB7dm9pZH1cbiAgICogQG1lbWJlcm9mIFVwbG9hZFxuICAgKi9cbiAgQGF1dG9iaW5kXG4gIEBhY3Rpb25cbiAgdXBsb2FkRmlsZXMoZmlsZUxpc3Q6IFVwbG9hZEZpbGVbXSk6IHZvaWQge1xuICAgIGNvbnN0IHtcbiAgICAgIGFjdGlvbjogZm9ybUFjdGlvbixcbiAgICAgIGFjY2VwdCxcbiAgICAgIGZpbGVMaXN0TWF4TGVuZ3RoID0gMCwgLy8gPC0tIGNvbnZpbmNlIHRzXG4gICAgICBwYXJ0aWFsVXBsb2FkLFxuICAgIH0gPSB0aGlzLnByb3BzO1xuICAgIGlmICghZm9ybUFjdGlvbikge1xuICAgICAgTW9kYWwuZXJyb3IoJGwoJ1VwbG9hZCcsICd1cGxvYWRfcGF0aF91bnNldCcpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuaXNBY2NlcHRGaWxlcyhmaWxlTGlzdCkpIHtcbiAgICAgIE1vZGFsLmVycm9yKCRsKCdVcGxvYWQnLCAnbm90X2FjY2VwdGFibGVfcHJvbXB0JykgKyBhY2NlcHQhLmpvaW4oJywnKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChmaWxlTGlzdE1heExlbmd0aCAhPT0gMCAmJiB0aGlzLmZpbGVMaXN0Lmxlbmd0aCA+IGZpbGVMaXN0TWF4TGVuZ3RoKSB7XG4gICAgICBNb2RhbC5lcnJvcihgJHskbCgnVXBsb2FkJywgJ2ZpbGVfbGlzdF9tYXhfbGVuZ3RoJyl9OiAke2ZpbGVMaXN0TWF4TGVuZ3RofWApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBmaWxlcyA9IHBhcnRpYWxVcGxvYWRcbiAgICAgID8gQXJyYXkuZnJvbShmaWxlTGlzdClcbiAgICAgICAgICAuc2xpY2UoMClcbiAgICAgICAgICAuZmlsdGVyKGl0ZW0gPT4gIWl0ZW0uc3RhdHVzIHx8IGl0ZW0uc3RhdHVzICE9PSAnc3VjY2VzcycpXG4gICAgICA6IEFycmF5LmZyb20oZmlsZUxpc3QpLnNsaWNlKDApO1xuICAgIGNvbnN0IHRoYXQgPSB0aGlzO1xuICAgIGlmICghZmlsZXMubGVuZ3RoKSB7XG4gICAgICBtZXNzYWdlLmluZm8oJGwoJ1VwbG9hZCcsICdiZWVuX3VwbG9hZGVkJykpO1xuICAgIH1cbiAgICBmaWxlcy5mb3JFYWNoKChmaWxlOiBVcGxvYWRGaWxlLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBmaWxlLnVpZCA9IHRoaXMuZ2V0VWlkKGluZGV4KTtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGF0LnVwbG9hZChmaWxlKTtcbiAgICAgIH0sIDApO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIOS4iuS8oOavj+S4quaWh+S7tuWvueixoVxuICAgKlxuICAgKiBAcGFyYW0geyp9IGZpbGVcbiAgICogQHJldHVybnMge3ZvaWR9XG4gICAqIEBtZW1iZXJvZiBVcGxvYWRcbiAgICovXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIEBhdXRvYmluZFxuICBAYWN0aW9uXG4gIHVwbG9hZChmaWxlOiBhbnkpOiB2b2lkIHtcbiAgICBjb25zdCB7XG4gICAgICBkYXRhLFxuICAgICAgYWN0aW9uOiBmb3JtQWN0aW9uLFxuICAgICAgaGVhZGVycyxcbiAgICAgIG5hbWU6IGZpbGVuYW1lLFxuICAgICAgd2l0aENyZWRlbnRpYWxzOiB4aHJXaXRoQ3JlZGVudGlhbHMsXG4gICAgfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKHR5cGVvZiBYTUxIdHRwUmVxdWVzdCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgY29uc3QgZm9ybURhdGEgPSBuZXcgRm9ybURhdGEoKTtcblxuICAgIC8vIOS/ruaUueaWh+S7tueKtuaAge+8jOaWueS+v1VwbG9hZExpc3TliKTmlq3mmK/lkKblsZXnpLrov5vluqbmnaFcbiAgICBmaWxlLnN0YXR1cyA9ICd1cGxvYWRpbmcnO1xuICAgIGlmICh4aHIudXBsb2FkKSB7XG4gICAgICB4aHIudXBsb2FkLm9ucHJvZ3Jlc3MgPSBlID0+IHtcbiAgICAgICAgbGV0IHBlcmNlbnQgPSAwO1xuICAgICAgICBpZiAoZS50b3RhbCA+IDApIHtcbiAgICAgICAgICBwZXJjZW50ID0gKGUubG9hZGVkIC8gZS50b3RhbCkgKiAxMDA7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5oYW5kbGVQcm9ncmVzcyhwZXJjZW50LCBmaWxlKTtcbiAgICAgIH07XG4gICAgfVxuICAgIGlmIChkYXRhKSB7XG4gICAgICBjb25zdCBuZXdEYXRhID0gdHlwZW9mIGRhdGEgPT09ICdmdW5jdGlvbicgPyBkYXRhKGZpbGUpIDogZGF0YTtcbiAgICAgIE9iamVjdC5rZXlzKG5ld0RhdGEpLmZvckVhY2goa2V5ID0+IGZvcm1EYXRhLmFwcGVuZChrZXksIG5ld0RhdGFba2V5XSkpO1xuICAgIH1cbiAgICAvLyBUT0RPOiBgZmlsZW5hbWVgIGRlZmF1bHQgdmFsdWUgbmVlZHMgYmV0dGVyIGltcGxlbWVudGF0aW9uXG4gICAgZm9ybURhdGEuYXBwZW5kKGZpbGVuYW1lIHx8ICdmaWxlJywgZmlsZSk7XG4gICAgY29uc3QgZXJyb3JNc2cgPSBgY2Fubm90IHBvc3QgJHtmb3JtQWN0aW9ufSAke3hoci5zdGF0dXN9YDtcbiAgICBpZiAoeGhyV2l0aENyZWRlbnRpYWxzICYmICd3aXRoQ3JlZGVudGlhbHMnIGluIHhocikge1xuICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG4gICAgfVxuICAgIHhoci5vcGVuKCdwb3N0JywgZm9ybUFjdGlvbiwgdHJ1ZSk7XG4gICAgeGhyLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgIC8vIOS7peS6jOW8gOWktOeahOeKtuaAgeeggemDveiupOS4uuaYr+aIkOWKn++8jOaaguWumu+8n1xuICAgICAgY29uc3QgaXNTdWNjZXNzZnVsID0geGhyLnN0YXR1cy50b1N0cmluZygpLnN0YXJ0c1dpdGgoJzInKTtcbiAgICAgIGlmIChpc1N1Y2Nlc3NmdWwpIHtcbiAgICAgICAgdGhpcy5oYW5kbGVTdWNjZXNzKHhoci5zdGF0dXMsIHhoci5yZXNwb25zZSwgZmlsZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmhhbmRsZUVycm9yKG5ldyBFcnJvcihlcnJvck1zZyksIGdldFJlc3BvbnNlKHhociksIHhoci5yZXNwb25zZSwgZmlsZSk7XG4gICAgICB9XG4gICAgfTtcbiAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignWC1SZXF1ZXN0ZWQtV2l0aCcsICdYTUxIdHRwUmVxdWVzdCcpO1xuICAgIGlmIChoZWFkZXJzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIE9iamVjdC5rZXlzKGhlYWRlcnMpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgaWYgKHt9Lmhhc093blByb3BlcnR5LmNhbGwoaGVhZGVycywga2V5KSkge1xuICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGtleSwgaGVhZGVyc1trZXldKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHhoci5zZW5kKGZvcm1EYXRhKTtcbiAgICB4aHIub25lcnJvciA9ICgpID0+IHtcbiAgICAgIHRoaXMuaGFuZGxlRXJyb3IobmV3IEVycm9yKGVycm9yTXNnKSwgZ2V0UmVzcG9uc2UoeGhyKSwgeGhyLnJlc3BvbnNlLCBmaWxlKTtcbiAgICB9O1xuICAgIHhoci5vbnRpbWVvdXQgPSAoKSA9PiB7XG4gICAgICBjb25zdCB0aW1lb3V0TXNnID0gYFRoZSByZXF1ZXN0IHBvc3QgZm9yICR7YWN0aW9ufSB0aW1lZCBvdXRgO1xuICAgICAgdGhpcy5oYW5kbGVFcnJvcihuZXcgRXJyb3IodGltZW91dE1zZyksIGdldFJlc3BvbnNlKHhociksIHhoci5yZXNwb25zZSwgZmlsZSk7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiDlpITnkIbkuIrkvKDmiJDlip/nmoTlh73mlbDvvIzmoLnmja7nu5Pmnpzorr7nva7mlofku7blr7nosaHnmoTnirbmgIHvvIxcbiAgICog55So5LqO5ZyoVXBsb2FkTGlzdOS4reeahOWxleekulxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gc3RhdHVzIEhUVFDnirbmgIHnoIFcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlc3BvbnNlIOWTjeW6lOWvueixoVxuICAgKiBAcGFyYW0ge1VwbG9hZEZpbGV9IGZpbGUg5paH5Lu25a+56LGhXG4gICAqIEByZXR1cm5zXG4gICAqL1xuICBAYWN0aW9uXG4gIGhhbmRsZVN1Y2Nlc3Moc3RhdHVzOiBudW1iZXIsIHJlc3BvbnNlOiBhbnksIGZpbGU6IFVwbG9hZEZpbGUpIHtcbiAgICBjb25zdCB0YXJnZXRJdGVtID0gdGhpcy5nZXRGaWxlSXRlbShmaWxlKTtcbiAgICBpZiAodGFyZ2V0SXRlbSkge1xuICAgICAgY29uc3QgeyBvblVwbG9hZFN1Y2Nlc3MgfSA9IHRoaXMucHJvcHM7XG4gICAgICB0YXJnZXRJdGVtLnN0YXR1cyA9IHN0YXR1cyA9PT0gMjAwID8gJ3N1Y2Nlc3MnIDogJ2RvbmUnO1xuICAgICAgdGFyZ2V0SXRlbS5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICAgICAgaWYgKG9uVXBsb2FkU3VjY2Vzcykge1xuICAgICAgICBvblVwbG9hZFN1Y2Nlc3MocmVzcG9uc2UsIGZpbGUpO1xuICAgICAgfVxuICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiDlpITnkIbkuIrkvKDov5vluqblj5jljJbnmoTlh73mlbDvvIzmm7TmlrDmlofku7blr7nosaHkuK3nmoRwZXJjZW505YC877yMXG4gICAqIOeUqOS6juWcqFVwbG9hZExpc3TkuK3lsZXnpLpcbiAgICpcbiAgICogQHBhcmFtIHtudW1iZXJ9IHBlcmNlbnQg5LiK5Lyg55m+5YiG5q+UXG4gICAqIEBwYXJhbSB7VXBsb2FkRmlsZX0gZmlsZSDmlofku7blr7nosaFcbiAgICogQHJldHVybnNcbiAgICovXG4gIEBhY3Rpb25cbiAgaGFuZGxlUHJvZ3Jlc3MocGVyY2VudDogbnVtYmVyLCBmaWxlOiBVcGxvYWRGaWxlKSB7XG4gICAgY29uc3QgeyBvblVwbG9hZFByb2dyZXNzIH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHRhcmdldEl0ZW0gPSB0aGlzLmdldEZpbGVJdGVtKGZpbGUpO1xuICAgIGlmICh0YXJnZXRJdGVtKSB7XG4gICAgICB0YXJnZXRJdGVtLnBlcmNlbnQgPSBwZXJjZW50O1xuICAgICAgaWYgKG9uVXBsb2FkUHJvZ3Jlc3MpIHtcbiAgICAgICAgb25VcGxvYWRQcm9ncmVzcyhwZXJjZW50LCBmaWxlKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZm9yY2VVcGRhdGUoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICog5aSE55CG5LiK5Lyg5Ye66ZSZ55qE5Ye95pWw77yM55So5LqO6K6+572u5paH5Lu25a+56LGh55qEc3RhdHVz5YC877yMXG4gICAqXG4gICAqIEBwYXJhbSB7RXJyb3J9IGVycm9yIOmUmeivr+WvueixoVxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmVzcG9uc2VUZXh0IOWkhOeQhuaIkOWtl+espuS4sueahOWTjeW6lOWvueixoVxuICAgKiBAcGFyYW0ge1VwbG9hZEZpbGV9IGZpbGUg5paH5Lu25a+56LGhXG4gICAqIEByZXR1cm5zXG4gICAqL1xuICBAYWN0aW9uXG4gIGhhbmRsZUVycm9yKGVycm9yOiBFcnJvciwgcmVzcG9uc2VUZXh0OiBzdHJpbmcsIHJlc3BvbnNlOiBhbnksIGZpbGU6IFVwbG9hZEZpbGUpIHtcbiAgICBjb25zdCB7IG9uVXBsb2FkRXJyb3IgfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgdGFyZ2V0SXRlbSA9IHRoaXMuZ2V0RmlsZUl0ZW0oZmlsZSk7XG4gICAgaWYgKHRhcmdldEl0ZW0pIHtcbiAgICAgIHRhcmdldEl0ZW0uc3RhdHVzID0gJ2Vycm9yJztcbiAgICAgIHRhcmdldEl0ZW0uZXJyb3IgPSBlcnJvcjtcbiAgICAgIHRhcmdldEl0ZW0ucmVzcG9uc2UgPSByZXNwb25zZVRleHQ7XG4gICAgICBpZiAob25VcGxvYWRFcnJvcikge1xuICAgICAgICBvblVwbG9hZEVycm9yKGVycm9yLCByZXNwb25zZSwgZmlsZSk7XG4gICAgICB9XG4gICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgfVxuICB9XG5cbiAgQGFjdGlvblxuICBoYW5kbGVSZW1vdmUgPSAoZmlsZTogVXBsb2FkRmlsZSkgPT4ge1xuICAgIC8vIHRoaXMucmVtb3ZlRmlsZUl0ZW0oZmlsZSk7XG4gICAgLy8gdGhpcy51cGxvYWQuYWJvcnQoZmlsZSk7XG4gICAgZmlsZS5zdGF0dXMgPSAncmVtb3ZlZCc7XG4gICAgdGhpcy5oYW5kbGVPblJlbW92ZShmaWxlKTtcbiAgfTtcblxuICBoYW5kbGVPblJlbW92ZShmaWxlOiBVcGxvYWRGaWxlKSB7XG4gICAgY29uc3QgeyBvblJlbW92ZUZpbGUgfSA9IHRoaXMucHJvcHM7XG4gICAgUHJvbWlzZS5yZXNvbHZlKHR5cGVvZiBvblJlbW92ZUZpbGUgPT09ICdmdW5jdGlvbicgPyBvblJlbW92ZUZpbGUoZmlsZSkgOiBvblJlbW92ZUZpbGUpLnRoZW4oXG4gICAgICByZXQgPT4ge1xuICAgICAgICBpZiAocmV0ID09PSBmYWxzZSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlbW92ZUZpbGVJdGVtKGZpbGUpO1xuICAgICAgfSxcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIOWIpOaWreaWh+S7tuWQjue8gOWQjeaYr+WQpuWQiOagvFxuICAgKiB0aGlzLnByb3BzLmFjY2VwdOWAvOS4umZhbHN55pe26L+U5ZuedHJ1Ze+8jOWQpuWImeato+W4uOWIpOaWrVxuICAgKlxuICAgKiBAcGFyYW0ge1VwbG9hZEZpbGVbXX0gZmlsZUxpc3Qg5paH5Lu25a+56LGh5pWw57uEXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKiBAbWVtYmVyb2YgVXBsb2FkXG4gICAqL1xuICBpc0FjY2VwdEZpbGVzKGZpbGVMaXN0OiBVcGxvYWRGaWxlW10pOiBib29sZWFuIHtcbiAgICBjb25zdCB7IGFjY2VwdCB9ID0gdGhpcy5wcm9wcztcbiAgICBpZiAoIWFjY2VwdCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGNvbnN0IGFjY2VwdFR5cGVzID0gYWNjZXB0Lm1hcCh0eXBlID0+IHtcbiAgICAgIHR5cGUgPSB0eXBlLnJlcGxhY2UoL1xcLi9nLCAnXFxcXC4nKTtcbiAgICAgIHR5cGUgPSB0eXBlLnJlcGxhY2UoL1xcKi9nLCAnLionKTtcbiAgICAgIHJldHVybiBuZXcgUmVnRXhwKHR5cGUpO1xuICAgIH0pO1xuICAgIHJldHVybiBmaWxlTGlzdC5zb21lKCh7IG5hbWUsIHR5cGUgfSkgPT5cbiAgICAgIGFjY2VwdFR5cGVzLnNvbWUoYWNjZXB0VHlwZSA9PiBhY2NlcHRUeXBlLnRlc3QobmFtZSkgfHwgYWNjZXB0VHlwZS50ZXN0KHR5cGUpKSxcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIOS9v+eUqOaXpeacn+iOt+WPluS4gOS4qnVpZFxuICAgKlxuICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXgg57Si5byVXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqIEBtZW1iZXJvZiBVcGxvYWRcbiAgICovXG4gIGdldFVpZChpbmRleDogbnVtYmVyKTogc3RyaW5nIHtcbiAgICBjb25zdCB7IHByZWZpeENscyB9ID0gdGhpcztcbiAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xuICAgIHJldHVybiBgJHtwcmVmaXhDbHN9LSR7bm93fS0ke2luZGV4fWA7XG4gIH1cblxuICAvKipcbiAgICog5LuO5paH5Lu25a+56LGh5pWw57uE5Lit6I635Y+W5LiA5Liq5paH5Lu25a+56LGh55qE5byV55So77yMXG4gICAqIOmmluWFiOWwneivlemAmui/h3VpZOWxnuaAp+WMuemFjeaWh+S7tuWvueixoe+8jOiLpeWksei0peWImeWwneivlW5hbWVcbiAgICpcbiAgICogQHBhcmFtIHtVcGxvYWRGaWxlfSBmaWxlXG4gICAqIEBwYXJhbSB7VXBsb2FkRmlsZVtdfSBmaWxlTGlzdCDmlofku7blr7nosaHmlbDnu4RcbiAgICogQHJldHVybnMge1VwbG9hZEZpbGV9XG4gICAqIEBtZW1iZXJvZiBVcGxvYWRcbiAgICovXG4gIGdldEZpbGVJdGVtKGZpbGU6IFVwbG9hZEZpbGUpOiBVcGxvYWRGaWxlIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBtYXRjaEtleSA9IGZpbGUudWlkICE9PSB1bmRlZmluZWQgPyAndWlkJyA6ICduYW1lJztcbiAgICByZXR1cm4gdGhpcy5maWxlTGlzdC5maW5kKGl0ZW0gPT4gaXRlbVttYXRjaEtleV0gPT09IGZpbGVbbWF0Y2hLZXldKTtcbiAgfVxuXG4gIC8qKlxuICAgKiDku47mlofku7blr7nosaHmlbDnu4TkuK3np7vpmaTkuIDkuKrmlofku7blr7nosaHvvIxcbiAgICog6aaW5YWI5bCd6K+V6YCa6L+HdWlk5bGe5oCn5Yy56YWN5paH5Lu25a+56LGh77yM6Iul5aSx6LSl5YiZ5bCd6K+VbmFtZVxuICAgKlxuICAgKiBAcGFyYW0ge1VwbG9hZEZpbGV9IGZpbGVcbiAgICogQHBhcmFtIHtVcGxvYWRGaWxlW119IGZpbGVMaXN0XG4gICAqIEByZXR1cm5zIHtVcGxvYWRGaWxlW119XG4gICAqIEBtZW1iZXJvZiBVcGxvYWRcbiAgICovXG4gIEBhY3Rpb25cbiAgcmVtb3ZlRmlsZUl0ZW0oZmlsZTogVXBsb2FkRmlsZSk6IHZvaWQge1xuICAgIGNvbnN0IG1hdGNoS2V5ID0gZmlsZS51aWQgIT09IHVuZGVmaW5lZCA/ICd1aWQnIDogJ25hbWUnO1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy5maWxlTGlzdC5maW5kSW5kZXgoaXRlbSA9PiBpdGVtW21hdGNoS2V5XSA9PT0gZmlsZVttYXRjaEtleV0pO1xuICAgIGNvbnN0IHsgdXBsb2FkRmlsZUxpc3QgfSA9IHRoaXMucHJvcHM7XG4gICAgaWYgKHVwbG9hZEZpbGVMaXN0ICYmIHVwbG9hZEZpbGVMaXN0Lmxlbmd0aCkge1xuICAgICAgdXBsb2FkRmlsZUxpc3Quc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIHRoaXMuZmlsZUxpc3Quc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5maWxlTGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgfVxufVxuIl0sInZlcnNpb24iOjN9