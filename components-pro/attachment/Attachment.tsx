import React, { ReactElement, ReactNode } from 'react';
import { action as mobxAction, IReactionDisposer, observable, reaction, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import omit from 'lodash/omit';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import isFunction from 'lodash/isFunction';
import { getConfig, Uploader } from 'choerodon-ui/dataset';
import { UploaderProps } from 'choerodon-ui/dataset/uploader/Uploader';
import { AttachmentConfig } from 'choerodon-ui/lib/configure';
import { Size } from 'choerodon-ui/lib/_util/enum';
import Trigger from 'choerodon-ui/lib/trigger/Trigger';
import RcUpload from 'choerodon-ui/lib/rc-components/upload';
import { Action } from 'choerodon-ui/lib/trigger/enum';
import Button, { ButtonProps } from '../button/Button';
import { $l } from '../locale-context';
import { ButtonColor, FuncType } from '../button/enum';
import AttachmentList from './AttachmentList';
import AttachmentGroup from './AttachmentGroup';
import { FormField, FormFieldProps } from '../field/FormField';
import autobind from '../_util/autobind';
import Modal from '../modal';
import AttachmentFile, { FileLike } from '../data-set/AttachmentFile';
import { sortAttachments } from './utils';
import ObserverSelect from '../select/Select';
import BUILT_IN_PLACEMENTS from '../trigger-field/placements';
import attachmentStore from '../stores/AttachmentStore';
import { FieldType } from '../data-set/enum';
import { ValidationMessages } from '../validator/Validator';
import ValidationResult from '../validator/ValidationResult';
import { open } from '../modal-container/ModalContainer';
import Icon from '../icon';
import Tooltip from '../tooltip';
import Dragger from './Dragger';
import { ShowHelp } from '../field/enum';
import { FIELD_SUFFIX } from '../form/utils';
import { showValidationMessage } from '../field/utils';
import { ShowValidation } from '../form/enum';
import { getIf } from '../data-set/utils';

export type AttachmentListType = 'text' | 'picture' | 'picture-card';

export interface AttachmentProps extends FormFieldProps, ButtonProps, UploaderProps {
  listType?: AttachmentListType;
  viewMode?: 'none' | 'list' | 'popup';
  sortable?: boolean;
  pictureWidth?: number;
  count?: number;
  max?: number;
  listLimit?: number;
  showHistory?: boolean;
  showValidation?: ShowValidation;
  attachments?: (AttachmentFile | FileLike)[];
  onAttachmentsChange?: (attachments: AttachmentFile[]) => void;
  getUUID?: () => Promise<string> | string;
  downloadAll?: ButtonProps | boolean;
  previewTarget?: string;
  dragUpload?: boolean;
  dragBoxRender?: ReactNode[];
  __inGroup?: boolean;
}

export type Sort = {
  type: 'time' | 'name';
  order: 'asc' | 'desc';
  custom?: boolean;
};

const defaultSort: Sort = {
  type: 'time',
  order: 'asc',
  custom: true,
};

@observer
export default class Attachment extends FormField<AttachmentProps> {
  static displayName = 'Attachment';

  static Dragger: typeof Dragger;

  static defaultProps = {
    ...FormField.defaultProps,
    suffixCls: 'attachment',
    multiple: true,
    sortable: true,
    downloadAll: true,
    listType: 'text',
    viewMode: 'list',
    dragUpload: false,
  };

  // eslint-disable-next-line camelcase
  static __IS_IN_CELL_EDITOR = true;

  // eslint-disable-next-line camelcase
  static __PRO_ATTACHMENT = true;

  static Group = AttachmentGroup;

  @observable sort?: Sort;

  @observable popup?: boolean;

  @observable dragState?: string;

  uploader?: Uploader;

  @observable tempAttachmentUUID?: string | undefined;

  get help() {
    return this.getProp('help');
  }

  get bucketName() {
    return this.getProp('bucketName');
  }

  get bucketDirectory() {
    return this.getProp('bucketDirectory');
  }

  get storageCode() {
    return this.getProp('storageCode');
  }

  get fileKey() {
    return this.getProp('fileKey') || this.getContextConfig('attachment').defaultFileKey;
  }

  get isPublic() {
    return this.getProp('isPublic');
  }

  get attachments(): AttachmentFile[] | undefined {
    const { field } = this;
    if (field) {
      return field.getAttachments(this.record, this.tempAttachmentUUID);
    }
    return this.observableProps.attachments;
  }

  set attachments(attachments: AttachmentFile[] | undefined) {
    runInAction(() => {
      const { field } = this;
      if (field) {
        field.setAttachments(attachments, this.record, this.tempAttachmentUUID);
      } else {
        this.observableProps.attachments = attachments;
      }
      if (attachments) {
        const { onAttachmentsChange } = this.props;
        if (onAttachmentsChange) {
          onAttachmentsChange(attachments);
        }
      }
    });
  }

  get count(): number | undefined {
    const { attachments, field } = this;
    if (attachments) {
      return attachments.length;
    }
    if (field) {
      const attachmentCount = field.getAttachmentCount(this.record);
      if (attachmentCount !== undefined) {
        return attachmentCount;
      }
    }
    const { count } = this.observableProps;
    return count;
  }

  get defaultValidationMessages(): ValidationMessages {
    const label = this.getProp('label');
    return {
      valueMissing: $l('Attachment', label ? 'value_missing' : 'value_missing_no_label', { label }),
    };
  }

  private reaction?: IReactionDisposer;

  componentDidMount() {
    super.componentDidMount();
    this.fetchCount();
    this.reaction = reaction(() => this.record, () => this.fetchCount());
  }

  componentDidUpdate(prevProps: AttachmentProps) {
    const { value, viewMode } = this.props;
    if (prevProps.value !== value || prevProps.viewMode !== viewMode) {
      this.fetchCount();
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    const { reaction } = this;
    if (reaction) {
      reaction();
      delete this.reaction;
    }
  }

  getFieldType(): FieldType {
    return FieldType.attachment;
  }

  getObservableProps(props, context): any {
    const { count, attachments } = props;
    const { observableProps = { count, attachments } } = this;
    return {
      ...super.getObservableProps(props, context),
      count: count === undefined ? observableProps.count : count,
      attachments: attachments ? attachments.map(attachment => {
        if (attachment instanceof AttachmentFile) {
          return attachment;
        }
        return new AttachmentFile(attachment);
      }) : observableProps.attachments,
    };
  }

  getValidAttachments(): AttachmentFile[] | undefined {
    const { attachments } = this;
    if (attachments) {
      return attachments.filter(({ status }) => !status || ['success', 'done'].includes(status));
    }
  }

  getValidatorProp(key: string) {
    if (key === 'attachmentCount') {
      const attachments = this.getValidAttachments();
      const count = attachments ? attachments.length : this.count;
      return count || 0;
    }
    return super.getValidatorProp(key);
  }

  fetchCount() {
    const { field } = this;
    const { viewMode } = this.props;
    if (viewMode !== 'list' && isNil(this.count)) {
      const value = this.getValue();
      if (value) {
        const { isPublic } = this;
        if (field) {
          field.fetchAttachmentCount(value, isPublic, this.record);
        } else {
          const { batchFetchCount } = this.getContextConfig('attachment');
          if (batchFetchCount && !this.attachments) {
            attachmentStore.fetchCountInBatch(value, undefined, isPublic).then(mobxAction((count) => {
              this.observableProps.count = count || 0;
            }));
          }
        }
      }
    }
  }

  @autobind
  handleDataSetLoad() {
    this.fetchCount();
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
      'useChunk',
      'chunkSize',
      'chunkThreads',
      'bucketName',
      'bucketDirectory',
      'storageCode',
      'count',
      'max',
      'listLimit',
      'dragBoxRender',
      'dragUpload',
      'showHistory',
      'isPublic',
      'downloadAll',
      'attachments',
      'onAttachmentsChange',
      'beforeUpload',
      'onUploadProgress',
      'onUploadSuccess',
      'onUploadError',
    ]);
  }

  isAcceptFile(attachment: AttachmentFile, accept: string[]): boolean {
    const acceptTypes = accept.map(type => (
      new RegExp(type.replace(/\./g, '\\.').replace(/\*/g, '.*'))
    ));
    const { name, type } = attachment;
    return acceptTypes.some(acceptType => acceptType.test(name) || acceptType.test(type));
  }

  async getAttachmentUUID(): Promise<string> {
    this.autoCreate();
    const oldAttachmentUUID = this.tempAttachmentUUID || this.getValue();
    const attachmentUUID = oldAttachmentUUID || (await this.fetchAttachmentUUID());
    if (attachmentUUID !== oldAttachmentUUID) {
      runInAction(() => {
        this.tempAttachmentUUID = attachmentUUID;
      });
    }
    return attachmentUUID;
  }

  fetchAttachmentUUID(): Promise<string> | string {
    const { getUUID = this.getContextConfig('attachment').getAttachmentUUID } = this.props;
    if (!getUUID) {
      throw new Error('no getAttachmentUUID hook in global configure.');
    }
    return getUUID({ isPublic: this.isPublic });
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
    try {
      await Promise.all(attachments.map((attachment) => this.upload(attachment)));
    } finally {
      this.changeOrder();
    }
  }

  @autobind
  async uploadAttachment(attachment: AttachmentFile) {
    await this.upload(attachment);
    if (attachment.status === 'success') {
      this.changeOrder();
    }
  }

  getUploaderProps(): UploaderProps {
    const { bucketName, bucketDirectory, storageCode, isPublic, fileKey } = this;
    const fileSize = this.getProp('fileSize');
    const chunkSize = this.getProp('chunkSize');
    const chunkThreads = this.getProp('chunkThreads');
    const useChunk = this.getProp('useChunk');
    const {
      accept, action, data, headers, withCredentials,
      beforeUpload, onUploadProgress, onUploadSuccess, onUploadError,
    } = this.props;
    return {
      accept, action, data, headers, fileKey, withCredentials, bucketName, bucketDirectory, storageCode, isPublic,
      fileSize, chunkSize, chunkThreads, useChunk, beforeUpload, onUploadProgress, onUploadSuccess, onUploadError,
    };
  }

  async upload(attachment: AttachmentFile) {
    try {
      const uploader = getIf(this, 'uploader', () => {
        return new Uploader(
          {},
          {
            getConfig: this.getContextConfig as typeof getConfig,
          },
        );
      });
      uploader.setProps(this.getUploaderProps());
      const result = await uploader.upload(attachment, this.attachments || [attachment], this.tempAttachmentUUID);
      if (result === false) {
        this.removeAttachment(attachment);
      } else {
        runInAction(() => {
          const { tempAttachmentUUID } = this;
          if (attachment.status === 'success' && tempAttachmentUUID) {
            this.tempAttachmentUUID = undefined;
            this.setValue(tempAttachmentUUID);
          } else {
            this.checkValidity();
          }
        });
      }
    } catch (e) {
      this.removeAttachment(attachment);
      throw e;
    }
  }

  getOtherProps(): any {
    const otherProps = super.getOtherProps();
    otherProps.onClick = this.handleClick;
    return otherProps;
  }

  processFiles(files: File[], attachmentUUID: string): AttachmentFile[] {
    return files.map((file, index: number) => new AttachmentFile({
      uid: this.getUid(index),
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      originFileObj: file,
      creationDate: new Date(),
      attachmentUUID,
    }));
  }

  @autobind
  @mobxAction
  handleChange(e) {
    const { target } = e;
    if (target.value) {
      const files: File[] = [...target.files];
      target.value = '';
      this.getAttachmentUUID().then((uuid) => {
        this.uploadAttachments(this.processFiles(files, uuid));
      });
    }
  }

  @mobxAction
  doRemove(attachment: AttachmentFile): Promise<any> | undefined {
    const { onRemove } = this.getContextConfig('attachment');
    if (onRemove) {
      if (attachment.status === 'error' || attachment.invalid) {
        return this.removeAttachment(attachment);
      }
      const attachmentUUID = this.getValue();
      if (attachmentUUID) {
        const { bucketName, bucketDirectory, storageCode, isPublic } = this;
        attachment.status = 'deleting';
        return onRemove({ attachment, attachmentUUID, bucketName, bucketDirectory, storageCode, isPublic })
          .then(mobxAction((result) => {
            if (result !== false) {
              this.removeAttachment(attachment);
            }
            attachment.status = 'done';
          }))
          .catch(mobxAction(() => {
            attachment.status = 'done';
          }));
      }
    }
  }

  @autobind
  handleHistory(attachment: AttachmentFile, attachmentUUID: string) {
    const { renderHistory } = this.getContextConfig('attachment') as AttachmentConfig;
    if (renderHistory) {
      const { bucketName, bucketDirectory, storageCode } = this;
      open({
        title: $l('Attachment', 'operation_records'),
        children: renderHistory({
          attachment,
          attachmentUUID,
          bucketName,
          bucketDirectory,
          storageCode,
        }),
        cancelButton: false,
        okText: $l('Modal', 'close'),
        drawer: true,
      });
    }
  }

  @autobind
  handleRemove(attachment: AttachmentFile): Promise<any> | undefined {
    return this.doRemove(attachment);
  }

  @autobind
  handleFetchAttachment(fetchProps: { bucketName?: string; bucketDirectory?: string; storageCode?: string; attachmentUUID: string; isPublic?: boolean; }) {
    const { field } = this;
    if (field) {
      field.fetchAttachments(fetchProps, this.record);
    } else {
      const { fetchList } = this.getContextConfig('attachment');
      if (fetchList) {
        fetchList(fetchProps).then((results) => {
          this.attachments = results.map(file => new AttachmentFile(file));
        });
      }
    }
  }

  @autobind
  handlePreview() {
    this.setPopup(false);
  }

  @mobxAction
  removeAttachment(attachment: AttachmentFile): undefined {
    const { attachments } = this;
    if (attachments) {
      const index = attachments.indexOf(attachment);
      if (index !== -1) {
        attachments.splice(index, 1);
        this.attachments = attachments;
        this.checkValidity();
      }
    }
    return undefined;
  }

  handleDragUpload = (file: File) => {
    this.getAttachmentUUID().then((uuid) => {
      this.uploadAttachments(this.processFiles([file], uuid));
    });
    return false;
  };

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

  renderHeaderLabel() {
    const { viewMode } = this.props;
    if (this.hasFloatLabel || viewMode === 'popup') {
      const label = this.getLabel();
      if (label) {
        const { prefixCls } = this;
        return (
          <span className={classNames(`${prefixCls}-header-label`, { [`${prefixCls}-required`]: this.getProp('required') })}>
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

  isValid(): boolean {
    const { attachments } = this;
    if (attachments && attachments.some(({ status, invalid }) => invalid || status === 'error')) {
      return false;
    }
    return super.isValid();
  }

  renderUploadBtn(isCardButton: boolean, label?: ReactNode): ReactElement<ButtonProps> {
    const {
      count = 0,
      multiple,
      prefixCls,
      props: {
        children, viewMode, accept,
      },
    } = this;
    const buttonProps = this.getOtherProps();
    const { ref, style, name, onChange, ...rest } = buttonProps;
    const max = this.getProp('max');
    const uploadProps = {
      multiple,
      accept: accept ? accept.join(',') : undefined,
      name: name || this.fileKey,
      type: 'file',
      ref,
      onChange,
    };
    const width = isCardButton ? this.getPictureWidth() : undefined;
    const countText = multiple && (max ? `${count}/${max}` : count) || undefined;
    return isCardButton ? (
      <Button
        funcType={FuncType.link}
        key="upload-btn"
        icon="add"
        {...rest}
        className={classNames(`${prefixCls}-card-button`, this.getClassName())}
        style={{ ...style, width, height: width }}
      >
        <div>{children || $l('Attachment', 'upload_picture')}</div>
        {countText ? <div>{countText}</div> : undefined}
        <input key="upload" {...uploadProps} hidden />
      </Button>
    ) : (
      <Button
        funcType={viewMode === 'popup' ? FuncType.flat : FuncType.link}
        key="upload-btn"
        icon="file_upload"
        color={this.valid ? ButtonColor.primary : ButtonColor.red}
        {...rest}
        className={viewMode === 'popup' ? this.getMergedClassNames() : this.getClassName()}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        {children || $l('Attachment', 'upload_attachment')}{label && <>({label})</>} {countText}
        <input key="upload" {...uploadProps} hidden />
      </Button>
    );
  }

  showTooltip(e): boolean {
    if (this.showValidation === ShowValidation.tooltip) {
      const message = this.getTooltipValidationMessage();
      if (message) {
        showValidationMessage(e, message, this.context.getTooltipTheme('validation'), this.context.getTooltipPlacement('validation'));
        return true;
      }
    }
    return false;
  }

  renderViewButton(label?: ReactNode): ReactElement<ButtonProps> {
    const { children, multiple, viewMode } = this.props;
    const rest = this.getOtherProps();
    return (
      <Button
        funcType={viewMode === 'popup' ? FuncType.flat : FuncType.link}
        key="view-btn"
        icon="attach_file"
        color={ButtonColor.primary}
        {...omit(rest, ['ref'])}
        className={this.getMergedClassNames()}
      >
        {children || $l('Attachment', 'view_attachment')}{label && <>({label})</>} {multiple && this.count || undefined}
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
    this.changeOrder();
  }

  @mobxAction
  changeOrder() {
    this.sort = {
      ...defaultSort,
      ...this.sort,
      custom: true,
    };
    const attachmentUUID = this.getValue();
    if (attachmentUUID) {
      const attachments = this.getValidAttachments();
      const { onOrderChange } = this.getContextConfig('attachment');
      if (onOrderChange && attachments) {
        const { bucketName, bucketDirectory, storageCode, isPublic } = this;
        onOrderChange({
          bucketName,
          bucketDirectory,
          storageCode,
          attachments,
          attachmentUUID,
          isPublic,
        });
      }
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
      listType, sortable, listLimit, showHistory, previewTarget,
    } = this.props;
    const { attachments } = this;
    const attachmentUUID = this.tempAttachmentUUID || this.getValue();
    if (attachmentUUID || uploadButton || (attachments && attachments.length)) {
      const { bucketName, bucketDirectory, storageCode, readOnly, isPublic } = this;
      const width = this.getPictureWidth();
      return (
        <AttachmentList
          prefixCls={`${this.prefixCls}-list`}
          pictureWidth={width}
          listType={listType}
          attachments={sortAttachments(attachments, this.sort || defaultSort)}
          bucketName={bucketName}
          bucketDirectory={bucketDirectory}
          storageCode={storageCode}
          attachmentUUID={attachmentUUID}
          uploadButton={uploadButton}
          sortable={sortable}
          readOnly={readOnly}
          isPublic={isPublic}
          limit={readOnly ? listLimit : undefined}
          previewTarget={previewTarget}
          onHistory={showHistory ? this.handleHistory : undefined}
          onRemove={this.handleRemove}
          onUpload={this.uploadAttachment}
          onOrderChange={this.handleOrderChange}
          onFetchAttachments={this.handleFetchAttachment}
          onPreview={this.handlePreview}
          record={this.record}
        />
      );
    }
  }

  renderHeader(uploadBtn?: ReactNode) {
    const { prefixCls, count, props: { downloadAll, viewMode, __inGroup } } = this;
    const label = (!__inGroup || count) && this.renderHeaderLabel();
    const buttons: ReactNode[] = [];
    if (uploadBtn) {
      buttons.push(
        uploadBtn,
      );
    }
    if (this.readOnly) {
      if (this.count) {
        if (downloadAll) {
          const { getDownloadAllUrl } = this.getContextConfig('attachment');
          if (getDownloadAllUrl) {
            const attachmentUUID = this.getValue();
            if (attachmentUUID) {
              const { bucketName, bucketDirectory, storageCode, isPublic } = this;
              const downloadAllUrl = getDownloadAllUrl({
                bucketName,
                bucketDirectory,
                storageCode,
                attachmentUUID,
                isPublic,
              });
              if (downloadAllUrl) {
                const downProps: ButtonProps = {
                  key: 'download',
                  icon: 'get_app',
                  funcType: FuncType.link,
                  href: isString(downloadAllUrl) ? downloadAllUrl : undefined,
                  onClick: isFunction(downloadAllUrl) ? downloadAllUrl : undefined,
                  target: '_blank',
                  color: ButtonColor.primary,
                  children: $l('Attachment', 'download_all'),
                };
                buttons.push(<Button {...downProps} {...downloadAll} />);
              }
            }
          }
        }
      } else if (viewMode !== 'popup' && !__inGroup) {
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
    const hasButton = buttons.length;
    const sorter = this.renderSorter();
    const divider = !__inGroup && label && hasButton ? <span key="divider" className={`${prefixCls}-header-divider`} /> : undefined;
    if (label || divider || hasButton || sorter) {
      return (
        <div className={`${prefixCls}-header`}>
          {label}
          {divider}
          <div className={`${prefixCls}-header-buttons`}>
            {buttons}
          </div>
          {sorter}
        </div>
      );
    }
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
    const validationMessage = this.renderValidationResult();
    if (!this.isValidationMessageHidden(validationMessage)) {
      return validationMessage;
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
          {this.getContextConfig('renderEmpty')('Attachment')}
        </div>
      );
    }
  }

  getWrapperClassNames() {
    const {
      prefixCls,
      props: { className, size },
    } = this;
    return classNames(
      `${prefixCls}-wrapper`,
      className,
      {
        [`${prefixCls}-sm`]: size === Size.small,
        [`${prefixCls}-lg`]: size === Size.large,
      },
    );
  }

  renderWrapperList(uploadBtn?: ReactNode) {
    const { prefixCls, props: { viewMode, listType, __inGroup } } = this;
    const isCard = listType === 'picture-card';
    const classes = [`${prefixCls}-list-wrapper`];
    if (viewMode !== 'popup') {
      const wrapperClassName = this.getWrapperClassNames();
      if (wrapperClassName) {
        classes.push(wrapperClassName);
      }
    }
    return (
      <div className={classes.join(' ')}>
        {this.renderDragUploadArea()}
        {this.renderHeader(!isCard && uploadBtn)}
        {!__inGroup && viewMode !== 'popup' && this.renderHelp(ShowHelp.newLine)}
        {!__inGroup && this.showValidation === ShowValidation.newLine && this.renderValidationResult()}
        {!__inGroup && this.renderEmpty()}
        {viewMode !== 'none' && this.renderUploadList(isCard && uploadBtn)}
      </div>
    );
  }

  getPictureWidth() {
    const { pictureWidth, listType } = this.props;
    return pictureWidth || (listType === 'picture-card' ? 100 : 48);
  }

  renderHelp(forceHelpMode?: ShowHelp): ReactNode {
    const { showHelp } = this.props;
    const help = this.getProp('help');
    if (help === undefined || showHelp === ShowHelp.none) return;
    switch (forceHelpMode) {
      case ShowHelp.tooltip:
        return (
          <Tooltip title={help} openClassName={`${this.getContextConfig('proPrefixCls')}-tooltip-popup-help`} placement="bottom">
            <Icon type="help" style={{ fontSize: '14px', color: '#8c8c8c' }} />
          </Tooltip>
        );
      default:
        return (
          <div key="help" className={`${this.getContextProPrefixCls(FIELD_SUFFIX)}-help`}>
            {help}
          </div>
        );
    }
  }

  get showValidation() {
    const { viewMode, showValidation = viewMode === 'popup' ? ShowValidation.tooltip : ShowValidation.newLine } = this.props;
    const { context: { showValidation: ctxShowValidation = showValidation } } = this;
    return ctxShowValidation;
  }

  @autobind
  handlePopupHiddenChange(hidden) {
    this.setPopup(!hidden);
  }

  @mobxAction
  setPopup(popup) {
    this.popup = popup;
  }

  @mobxAction
  setDragState(state) {
    this.dragState = state;
  }

  @autobind
  handleFileDrop(e) {
    this.setDragState(e.type);
  }

  renderDefaultDragBox() {
    const { prefixCls } = this;
    return (
      <div className={`${prefixCls}-drag-box`}>
        <p className={`${prefixCls}-drag-box-icon`}>
          <Icon type="inbox" />
        </p>
        <p className={`${prefixCls}-drag-box-text`}>{$l('Attachment', 'file_type_mismatch')}</p>
        <p className={`${prefixCls}-drag-box-hint`}>
          {this.getProp('help')}
        </p>
      </div>
    );
  }

  renderDragUploadArea() {
    const { dragUpload, dragBoxRender, accept } = this.props;
    const { prefixCls } = this;
    if (dragUpload) {
      const dragCls = classNames(prefixCls, {
        [`${prefixCls}-drag`]: true,
        [`${prefixCls}-drag-hover`]: this.dragState === 'dragover',
      });
      const rcUploadProps = {
        ...this.props,
        accept: accept ? accept.join(',') : undefined,
        beforeUpload: this.handleDragUpload,
        prefixCls,
      };
      return (
        <div
          className={dragCls}
          onDrop={this.handleFileDrop}
          onDragOver={this.handleFileDrop}
          onDragLeave={this.handleFileDrop}
        >
          <RcUpload {...rcUploadProps} className={`${prefixCls}-btn`}>
            {dragBoxRender || this.renderDefaultDragBox()}
          </RcUpload>
        </div>
      );
    }
    return undefined;
  }

  render() {
    const { viewMode, listType, hidden } = this.props;
    const { readOnly, prefixCls } = this;
    if (viewMode === 'popup') {
      const label = this.hasFloatLabel && this.getLabel();
      return (
        <>
          <Trigger
            prefixCls={prefixCls}
            popupContent={this.renderWrapper}
            action={[Action.hover, Action.focus]}
            builtinPlacements={BUILT_IN_PLACEMENTS}
            popupPlacement="bottomLeft"
            popupHidden={hidden || !this.popup}
            onPopupHiddenChange={this.handlePopupHiddenChange}
          >
            {this.renderDragUploadArea()}
            {readOnly ? this.renderViewButton(label) : this.renderUploadBtn(false, label)}
          </Trigger>
          {this.renderHelp(ShowHelp.tooltip)}
          {this.showValidation === ShowValidation.newLine && this.renderValidationResult()}
        </>
      );
    }
    return this.renderWrapperList(readOnly ? undefined : this.renderUploadBtn(listType === 'picture-card'));
  }
}
