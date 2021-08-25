import React, { ReactElement, ReactNode } from 'react';
import PropTypes from 'prop-types';
import { action as mobxAction, observable, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import classNames from 'classnames';
import isNil from 'lodash/isNil';
import { getConfig } from 'choerodon-ui/lib/configure';
import { Size } from 'choerodon-ui/lib/_util/enum';
import Button, { ButtonProps } from '../button/Button';
import { $l } from '../locale-context';
import { ButtonColor, FuncType } from '../button/enum';
import AttachmentList from './AttachmentList';
import { FormField, FormFieldProps } from '../field/FormField';
import axios from '../axios';
import autobind from '../_util/autobind';
import Modal from '../modal';
import AttachmentFile from '../data-set/AttachmentFile';
import { appendFormData, formatFileSize, sortAttachments } from './utils';
import ObserverSelect from '../select/Select';
import Trigger from '../trigger/Trigger';
import { Action } from '../trigger/enum';
import BUILT_IN_PLACEMENTS from '../trigger-field/placements';
import attachmentStore from '../stores/AttachmentStore';
import { FieldType } from '../data-set/enum';
import { ValidatorProps } from '../validator/rules';
import { ValidationMessages } from '../validator/Validator';
import ValidationResult from '../validator/ValidationResult';

export type AttachmentListType = 'text' | 'picture' | 'picture-card';

export interface AttachmentProps extends FormFieldProps, ButtonProps {
  /**
   *  可接受的上传文件类型
   */
  accept?: string[];
  /**
   * 上传文件路径
   */
  action?: string;
  /**
   * 上传所需参数或者返回上传参数的方法
   */
  data?: object | Function;
  /**
   * 设置上传的请求头部
   */
  headers?: any;
  withCredentials?: boolean;
  listType?: AttachmentListType;
  viewMode?: 'none' | 'list' | 'popup';
  sortable?: boolean;
  fileKey?: string;
  fileSize?: number;
  bucketName?: string;
  bucketDirectory?: string;
  pictureWidth?: number;
  count?: number;
  max?: number;
  listLimit?: number;
  beforeUpload?: (attachment: AttachmentFile, attachments: AttachmentFile[]) => boolean | undefined | PromiseLike<boolean | undefined>;
  onUploadProgress?: (percent: number, attachment: AttachmentFile) => void;
  onUploadSuccess?: (response: any, attachment: AttachmentFile) => void;
  onUploadError?: (error: AxiosError, response: any, attachment: AttachmentFile) => void;
  downloadAll?: ButtonProps;
}

export type Sort = {
  type: 'time' | 'name';
  order: 'asc' | 'desc';
  custom?: boolean,
};

const defaultSort: Sort = {
  type: 'time',
  order: 'asc',
  custom: true,
};

@observer
export default class Attachment extends FormField<AttachmentProps> {
  static displayName = 'Attachment';

  static defaultProps = {
    ...FormField.defaultProps,
    suffixCls: 'attachment',
    multiple: true,
    sortable: true,
    downloadAll: true,
    listType: 'text',
    viewMode: 'list',
  };

  static propTypes = {
    ...FormField.propTypes,
    sortable: PropTypes.bool,
    listType: PropTypes.oneOf(['text', 'picture', 'picture-card']),
    viewMode: PropTypes.oneOf(['none', 'list', 'popup']),
  };

  // eslint-disable-next-line camelcase
  static __IS_IN_CELL_EDITOR = true;

  @observable $attachments?: AttachmentFile[] | undefined;

  @observable $count?: number | undefined;

  @observable sort?: Sort;

  get attachments(): AttachmentFile[] | undefined {
    const { field } = this;
    if (field) {
      return field.attachments;
    }
    return this.$attachments;
  }

  set attachments(attachments: AttachmentFile[] | undefined) {
    runInAction(() => {
      const { field } = this;
      if (field) {
        field.attachments = attachments;
      } else {
        this.$attachments = attachments;
      }
    });
  }

  get count(): number | undefined {
    const { attachments, field } = this;
    if (attachments) {
      return attachments.length;
    }
    if (field) {
      const { attachmentCount } = field;
      if (attachmentCount !== undefined) {
        return attachmentCount;
      }
    }
    const { $count } = this;
    if ($count !== undefined) {
      return $count;
    }
    const { count } = this.props;
    return count;
  }

  get axios(): AxiosInstance {
    return getConfig('axios') || axios;
  }

  get defaultValidationMessages(): ValidationMessages {
    const label = this.getProp('label');
    return {
      valueMissing: $l('Attachment', label ? 'value_missing' : 'value_missing_no_label', { label }),
    };
  }

  componentDidMount() {
    super.componentDidMount();
    const { viewMode } = this.props;
    if (viewMode !== 'list' && isNil(this.count)) {
      this.fetchCount();
    }
  }

  getFieldType(): FieldType {
    return FieldType.attachment;
  }

  getValidatorProps(): ValidatorProps {
    return {
      ...super.getValidatorProps(),
      attachmentCount: this.count || 0,
    };
  }

  fetchCount() {
    const { field } = this;
    const value = this.getValue();
    if (value) {
      if (field) {
        field.fetchAttachmentCount(value);
      } else {
        const { batchFetchCount } = getConfig('attachment');
        if (batchFetchCount && !this.attachments) {
          attachmentStore.fetchCountInBatch(value).then(mobxAction((count) => {
            this.$count = count || 0;
          }));
        }
      }
    }
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'value',
      'accept',
      'action',
      'data',
      'headers',
      'withCredentials',
      'sortable',
      'listType',
      'viewMode',
      'fileKey',
      'fileSize',
      'bucketName',
      'bucketDirectory',
      'count',
      'max',
      'listLimit',
      'downloadAll',
      'beforeUpload',
      'onUploadProgress',
      'onUploadSuccess',
      'onUploadError',
    ]);
  }

  getUploadAxiosConfig(attachment: AttachmentFile, attachmentUUID: string): AxiosRequestConfig | undefined {
    const { originFileObj } = attachment;
    if (originFileObj) {
      const globalConfig = getConfig('attachment');
      const { action, data, headers, fileKey = globalConfig.defaultFileKey, withCredentials } = this.props;
      const newHeaders = {
        'X-Requested-With': 'XMLHttpRequest',
        ...headers,
      };
      const formData = new FormData();
      formData.append(fileKey, originFileObj);
      if (data) {
        appendFormData(formData, data);
      }
      const onUploadProgress = (e) => {
        this.handleProgress(e.total > 0 ? (e.loaded / e.total) * 100 : 0, attachment);
      };
      if (action) {
        return {
          url: action,
          headers: {
            ...newHeaders,
          },
          data: formData,
          onUploadProgress,
          method: 'POST',
          withCredentials,
        };
      }
      const actionHook = globalConfig.action;
      if (actionHook) {
        const bucketName = this.getProp('bucketName');
        const bucketDirectory = this.getProp('bucketDirectory');
        const newConfig = typeof actionHook === 'function' ? actionHook({
          attachment,
          bucketName,
          bucketDirectory,
          attachmentUUID,
        }) : actionHook;
        const { data: customData, onUploadProgress: customUploadProgress } = newConfig;
        if (customData) {
          appendFormData(formData, customData);
        }
        return {
          withCredentials,
          method: 'POST',
          ...newConfig,
          headers: {
            ...newHeaders,
            ...newConfig.headers,
          },
          data: formData,
          onUploadProgress: (e) => {
            onUploadProgress(e);
            if (customUploadProgress) {
              customUploadProgress(e);
            }
          },
        };
      }
      throw new Error(`Please set Upload.action or configure.attachment.action .`);
    }
  }

  isAcceptFile(attachment: AttachmentFile, accept: string[]): boolean {
    const acceptTypes = accept.map(type => (
      new RegExp(type.replace(/\./g, '\\.').replace(/\*/g, '.*'))
    ));
    const { name, type } = attachment;
    return acceptTypes.some(acceptType => acceptType.test(name) || acceptType.test(type));
  }

  getAttachmentUUID() {
    const { getAttachmentUUID } = getConfig('attachment');
    if (!getAttachmentUUID) {
      throw new Error('no getAttachmentUUID hook in global configure.');
    }
    return getAttachmentUUID();
  }

  @mobxAction
  async uploadAttachments(attachments: AttachmentFile[]): Promise<void> {
    const max = this.getProp('max');
    if (max > 0 && (this.count || 0) + attachments.length > max) {
      Modal.error($l('Attachment', 'file_list_max_length', { count: max }));
      return;
    }
    const oldAttachments = this.attachments || [];
    if (this.multiple) {
      this.attachments = [...oldAttachments.slice(), ...attachments];
    } else {
      oldAttachments.forEach(attachment => this.doRemove(attachment));
      this.attachments = [...attachments];
    }
    const oldAttachmentUUID = this.getValue();
    const attachmentUUID = oldAttachmentUUID || (await this.getAttachmentUUID());
    if (attachmentUUID) {
      if (attachmentUUID !== oldAttachmentUUID) {
        this.setValue(attachmentUUID);
      }
      attachments.forEach((attachment) => this.upload(attachment, attachmentUUID));
    }
  }

  @autobind
  async upload(attachment: AttachmentFile, attachmentUUID: string) {
    try {
      const result = await this.beforeUpload(attachment, this.attachments!);
      if (result === false) {
        this.removeAttachment(attachment);
      } else if (attachment.status !== 'error' && !attachment.invalid) {
        const config = this.getUploadAxiosConfig(attachment, attachmentUUID);
        if (config) {
          this.handleSuccess(await this.axios(config), attachment);
        }
      }
    } catch (e) {
      this.handleError(e, attachment);
      throw e;
    }
  }

  getOtherProps(): any {
    const otherProps = super.getOtherProps();
    otherProps.onClick = this.handleClick;
    return otherProps;
  }

  @mobxAction
  handleProgress(percent: number, attachment: AttachmentFile) {
    attachment.status = 'uploading';
    attachment.percent = percent;
    const { onUploadProgress } = this.props;
    if (onUploadProgress) {
      onUploadProgress(percent, attachment);
    }
  }

  @mobxAction
  handleSuccess(response: any, attachment: AttachmentFile) {
    attachment.percent = 100;
    setTimeout(mobxAction(() => {
      attachment.status = 'success';
      const { onUploadSuccess: handleUploadSuccess } = getConfig('attachment');
      if (handleUploadSuccess) {
        handleUploadSuccess(response, attachment);
      }
      const { onUploadSuccess } = this.props;
      if (onUploadSuccess) {
        onUploadSuccess(response, attachment);
      }
      this.checkValidity();
    }), 0);
  }

  @mobxAction
  handleError(error: AxiosError, attachment: AttachmentFile) {
    const { onUploadError: handleUploadError } = getConfig('attachment');
    const { response } = error;
    const { onUploadError } = this.props;
    attachment.status = 'error';
    attachment.error = error;
    const { message } = error;
    if (handleUploadError) {
      handleUploadError(error, attachment);
    }
    attachment.errorMessage = attachment.errorMessage || message;
    if (onUploadError) {
      onUploadError(error, response, attachment);
    }
  }

  @autobind
  @mobxAction
  handleChange(e) {
    const { target } = e;
    if (target.value) {
      const files: File[] = [...target.files];
      target.value = '';
      this.uploadAttachments(files.map((file, index: number) => new AttachmentFile({
        uid: this.getUid(index),
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        originFileObj: file,
        creationDate: new Date(),
      })));
    }
  }

  doRemove(attachment: AttachmentFile) {
    const { onRemove } = getConfig('attachment');
    const attachmentUUID = this.getValue();
    if (onRemove && attachmentUUID) {
      const bucketName = this.getProp('bucketName');
      const bucketDirectory = this.getProp('bucketDirectory');
      return onRemove({ attachment, attachmentUUID, bucketName, bucketDirectory });
    }
  }

  @autobind
  handleRemove(attachment: AttachmentFile) {
    this.removeAttachment(attachment);
    return this.doRemove(attachment);
  }

  @autobind
  handleFetchAttachment(fetchProps: { bucketName?: string, bucketDirectory?: string, attachmentUUID: string }) {
    const { field } = this;
    if (field) {
      field.fetchAttachments(fetchProps);
    } else {
      const { fetchList } = getConfig('attachment');
      if (fetchList) {
        fetchList(fetchProps).then((results) => {
          this.attachments = results.map(file => new AttachmentFile(file));
        });
      }
    }
  }

  @mobxAction
  removeAttachment(attachment: AttachmentFile) {
    const { attachments } = this;
    if (attachments) {
      const index = attachments.indexOf(attachment);
      if (index !== -1) {
        attachments.splice(index, 1);
        this.checkValidity();
      }
    }
  }

  @mobxAction
  beforeUpload(attachment: AttachmentFile, attachments: AttachmentFile[]): boolean | undefined | PromiseLike<boolean | undefined> {
    const { beforeUpload, fileSize = getConfig('attachment').defaultFileSize, accept } = this.props;
    if (accept && !this.isAcceptFile(attachment, accept)) {
      attachment.status = 'error';
      attachment.invalid = true;
      attachment.errorMessage = $l('Attachment', 'file_type_mismatch', { types: accept.join(',') }) as string;
      return;
    }
    if (fileSize && attachment.size > fileSize) {
      attachment.status = 'error';
      attachment.invalid = true;
      attachment.errorMessage = $l('Attachment', 'file_max_size', { size: formatFileSize(fileSize) }) as string;
      return;
    }
    if (!beforeUpload) {
      return true;
    }
    return beforeUpload(attachment, attachments);
  }

  @autobind
  handleClick(e) {
    const { element } = this;
    if (element) {
      element.click();
    }
    const { onClick } = this.props;
    if (onClick) {
      onClick(e);
    }
  }

  getUid(index: number): string {
    const { prefixCls } = this;
    return `${prefixCls}-${Date.now()}-${index}`;
  }

  renderFloatLabel() {
    const { viewMode } = this.props;
    if (this.hasFloatLabel || viewMode === 'popup') {
      const label = this.getLabel();
      if (label) {
        return (
          <span className={`${this.prefixCls}-header-label`}>
            {label}
          </span>
        );
      }
    }
  }

  isDisabled(): boolean {
    if (super.isDisabled()) {
      return true;
    }
    const max = this.getProp('max');
    if (max) {
      const { count = 0 } = this;
      return count >= max;
    }
    return false;
  }

  renderUploadBtn(isCardButton?: boolean): ReactElement<ButtonProps> {
    const {
      count = 0,
      multiple,
      prefixCls,
    } = this;
    const buttonProps = this.getOtherProps();
    const { children, ref, className, style, accept, name, fileKey, ...rest } = buttonProps;
    const max = this.getProp('max');
    const uploadProps = {
      multiple,
      accept: accept ? accept.join(',') : undefined,
      name: name || fileKey || getConfig('attachment').defaultFileKey,
      type: 'file',
      ref,
    };
    const width = isCardButton ? this.getPictureWidth() : undefined;
    return isCardButton ? (
      <Button
        funcType={FuncType.link}
        key="upload-btn"
        icon="add"
        {...rest}
        className={classNames(`${prefixCls}-card-button`, className)}
        style={{ ...style, width, height: width }}
      >
        <div>{children || $l('Attachment', 'upload_picture')}</div>
        {max ? <div>{`${count}/${max}`}</div> : count || undefined}
        <input key="upload" {...uploadProps} hidden />
      </Button>
    ) : (
      <Button
        funcType={FuncType.flat}
        key="upload-btn"
        icon="file_upload"
        color={this.isValid ? ButtonColor.primary : ButtonColor.red}
        {...rest}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        {children || $l('Attachment', 'upload_attachment')} {multiple && (max ? `${count}/${max}` : count) || undefined}
        <input key="upload" {...uploadProps} hidden />
      </Button>
    );
  }

  renderViewButton(): ReactElement<ButtonProps> {
    const { multiple } = this.props;
    const { children, ...rest } = this.getOtherProps();
    return (
      <Button
        funcType={FuncType.link}
        key="view-btn"
        color={ButtonColor.primary}
        {...rest}
      >
        {children || $l('Attachment', 'view_attachment')} {multiple && this.count || undefined}
      </Button>
    );
  }

  @mobxAction
  handleSort(sort: Sort) {
    this.sort = sort;
  }

  @autobind
  @mobxAction
  handleOrderChange(props) {
    const { attachments } = props;
    this.attachments = attachments;
    this.sort = {
      ...defaultSort,
      ...this.sort,
      custom: true,
    };
    const { onOrderChange } = getConfig('attachment');
    if (onOrderChange) {
      onOrderChange(props);
    }
  }

  @autobind
  getSortSelectPopupContainer() {
    return this.wrapper;
  }

  renderSorter(): ReactNode {
    const { sortable, viewMode } = this.props;
    if (sortable) {
      const { prefixCls, attachments } = this;
      if (attachments && attachments.length > 1) {
        const { type, order } = this.sort || defaultSort;
        return (
          <>
            <ObserverSelect
              value={type}
              onChange={(newType) => this.handleSort({ type: newType, order, custom: false })}
              clearButton={false}
              isFlat
              popupPlacement="bottomRight"
              getPopupContainer={viewMode === 'popup' ? this.getSortSelectPopupContainer : undefined}
              size={Size.small}
              border={false}
            >
              <ObserverSelect.Option value="time">{$l('Attachment', 'by_upload_time')}</ObserverSelect.Option>
              <ObserverSelect.Option value="name">{$l('Attachment', 'by_name')}</ObserverSelect.Option>
            </ObserverSelect>
            <Button
              funcType={FuncType.link}
              className={classNames(`${prefixCls}-order-icon`, order)}
              onClick={() => this.handleSort({ type, order: order === 'asc' ? 'desc' : 'asc', custom: false })}
            />
          </>
        );
      }
    }
  }

  renderUploadList(uploadButton?: ReactNode) {
    const {
      listType, sortable, listLimit,
    } = this.props;
    const bucketName = this.getProp('bucketName');
    const bucketDirectory = this.getProp('bucketDirectory');
    const { attachments } = this;
    const attachmentUUID = this.getValue();
    if (attachmentUUID) {
      const width = this.getPictureWidth();
      const { readOnly } = this;
      return (
        <AttachmentList
          prefixCls={`${this.prefixCls}-list`}
          pictureWidth={width}
          listType={listType}
          attachments={sortAttachments(attachments, this.sort || defaultSort)}
          bucketName={bucketName}
          bucketDirectory={bucketDirectory}
          attachmentUUID={attachmentUUID}
          uploadButton={uploadButton}
          sortable={sortable}
          readOnly={readOnly}
          limit={readOnly ? listLimit : undefined}
          onRemove={this.handleRemove}
          onUpload={this.upload}
          onOrderChange={this.handleOrderChange}
          onFetchAttachments={this.handleFetchAttachment}
        />
      );
    }
  }

  renderHeader(uploadBtn?: ReactNode) {
    const { prefixCls, props: { downloadAll } } = this;
    const label = this.renderFloatLabel();
    const buttons: ReactNode[] = [];
    if (uploadBtn) {
      buttons.push(
        uploadBtn,
      );
    }
    if (this.readOnly) {
      if (this.count) {
        if (downloadAll) {
          const { getDownloadAllUrl } = getConfig('attachment');
          if (getDownloadAllUrl) {
            const bucketName = this.getProp('bucketName');
            const bucketDirectory = this.getProp('bucketDirectory');
            const attachmentUUID = this.getValue();
            getDownloadAllUrl({ bucketName, bucketDirectory, attachmentUUID });
            const downProps: ButtonProps = {
              key: 'download',
              icon: 'get_app',
              funcType: FuncType.flat,
              href: getDownloadAllUrl({ bucketName, bucketDirectory, attachmentUUID }),
              target: '_blank',
              color: ButtonColor.primary,
              children: $l('Attachment', 'download_all'),
              ...downloadAll,
            };
            buttons.push(<Button {...downProps} />);
          }
        }
      } else {
        const viewProps: ButtonProps = {
          key: 'view',
          funcType: FuncType.link,
          disabled: true,
          children: $l('Attachment', 'no_attachments'),
        };
        buttons.push(
          <Button {...viewProps} />,
        );

      }
    }
    return (
      <div className={`${prefixCls}-header`}>
        {label}
        {label && buttons.length ? <span key="divider" className={`${prefixCls}-header-divider`} /> : undefined}
        <div className={`${prefixCls}-header-buttons`}>
          {buttons}
        </div>
        {this.renderSorter()}
      </div>
    );
  }

  @autobind
  renderWrapper(): ReactNode {
    const { prefixCls } = this;
    return (
      <div className={`${prefixCls}-popup-inner`} ref={this.wrapperReference}>
        {this.renderWrapperList()}
      </div>
    );
  }

  @autobind
  getTooltipValidationMessage(): ReactNode {
    const { _inTable } = this.props;
    if (!_inTable) {
      const validationMessage = this.renderValidationResult();
      if (!this.isValidationMessageHidden(validationMessage)) {
        return validationMessage;
      }
    }
  }

  renderValidationResult(validationResult?: ValidationResult): ReactNode {
    const message = super.renderValidationResult(validationResult);
    if (message) {
      return (
        <div className={`${this.prefixCls}-validation-message`}>
          {message}
        </div>
      );
    }
  }

  renderEmpty() {
    const { viewMode } = this.props;
    if (viewMode === 'popup' && !this.count) {
      return (
        <div className={`${this.prefixCls}-empty`}>
          {getConfig('renderEmpty')('Attachment')}
        </div>
      );
    }
  }

  renderWrapperList(uploadBtn?: ReactNode) {
    const { prefixCls, props: { viewMode, listType } } = this;
    const isCard = listType === 'picture-card';
    return (
      <div className={`${prefixCls}-wrapper`}>
        {this.renderHeader(!isCard && uploadBtn)}
        {this.renderHelpMessage()}
        {viewMode !== 'popup' && isCard && this.renderValidationResult()}
        {this.renderEmpty()}
        {viewMode !== 'none' && this.renderUploadList(isCard && uploadBtn)}
      </div>
    );
  }

  getPictureWidth() {
    const { pictureWidth, listType } = this.props;
    return pictureWidth || (listType === 'picture-card' ? 100 : 48);
  }

  render() {
    const { viewMode, listType } = this.props;
    const { readOnly } = this;
    if (viewMode === 'popup') {
      return (
        <Trigger
          prefixCls={this.prefixCls}
          popupContent={this.renderWrapper}
          action={[Action.hover]}
          builtinPlacements={BUILT_IN_PLACEMENTS}
          popupPlacement="bottomLeft"
        >
          {readOnly ? this.renderViewButton() : this.renderUploadBtn()}
        </Trigger>
      );
    }
    return this.renderWrapperList(readOnly ? undefined : this.renderUploadBtn(listType === 'picture-card'));
  }
}
