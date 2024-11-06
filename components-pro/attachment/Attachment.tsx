import React, { ReactElement, ReactNode } from 'react';
import { action as mobxAction, computed, IReactionDisposer, observable, reaction, runInAction, toJS } from 'mobx';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import isFunction from 'lodash/isFunction';
import { getConfig, Uploader } from 'choerodon-ui/dataset';
import { AttachmentValue, AttachmentFileProps } from 'choerodon-ui/dataset/configure';
import { UploaderProps } from 'choerodon-ui/dataset/uploader/Uploader';
import { DownloadAllMode } from 'choerodon-ui/dataset/data-set/enum';
import { AttachmentConfig } from 'choerodon-ui/lib/configure';
import { getConfig as getConfigDefault } from 'choerodon-ui/lib/configure/utils';
import { Size } from 'choerodon-ui/lib/_util/enum';
import Trigger from 'choerodon-ui/lib/trigger/Trigger';
import RcUpload from 'choerodon-ui/lib/rc-components/upload';
import { Action } from 'choerodon-ui/lib/trigger/enum';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import Button, { ButtonProps } from '../button/Button';
import { $l } from '../locale-context';
import { ButtonColor, FuncType } from '../button/enum';
import AttachmentList from './AttachmentList';
import AttachmentGroup from './AttachmentGroup';
import { FormField, FormFieldProps } from '../field/FormField';
import autobind from '../_util/autobind';
import Modal from '../modal';
import AttachmentFile, { FileLike } from '../data-set/AttachmentFile';
import { getSecretLevelModal, sortAttachments } from './utils';
import ObserverSelect from '../select/Select';
import BUILT_IN_PLACEMENTS from '../trigger-field/placements';
import attachmentStore from '../stores/AttachmentStore';
import { FieldType } from '../data-set/enum';
import { ValidationMessages } from '../validator/Validator';
import ValidationResult from '../validator/ValidationResult';
import { open } from '../modal-container/ModalContainer';
import Icon from '../icon';
import Dragger from './Dragger';
import { ShowHelp } from '../field/enum';
import { FIELD_SUFFIX } from '../form/utils';
import { showValidationMessage } from '../field/utils';
import { ShowValidation } from '../form/enum';
import { getIf } from '../data-set/utils';
import { ATTACHMENT_TARGET } from './Item';
import TemplateDownloadButton from './TemplateDownloadButton';
import { hide, show } from '../tooltip/singleton';
import DataSet from '../data-set';
import { ModalContextValue } from '../modal-provider/ModalContext';

export type AttachmentListType = 'text' | 'picture' | 'picture-card';

export enum AttachmentButtonType {
  download = 'download',
  remove = 'remove',
  history = 'history',
}

export type AttachmentButtons =
  | AttachmentButtonType
  | [AttachmentButtonType, ButtonProps]
  | ReactElement<ButtonProps>;

export interface AttachmentProps extends FormFieldProps, ButtonProps, UploaderProps {
  listType?: AttachmentListType;
  viewMode?: 'none' | 'list' | 'popup';
  sortable?: boolean;
  pictureWidth?: number;
  count?: number;
  max?: number;
  listLimit?: number;
  showHistory?: boolean;
  showSize?: boolean;
  showValidation?: ShowValidation;
  attachments?: (AttachmentFile | FileLike)[];
  onAttachmentsChange?: (attachments: AttachmentFile[]) => void;
  onRemove?: (attachment: AttachmentFile) => boolean | void;
  getUUID?: () => Promise<string> | string;
  downloadAll?: ButtonProps | boolean;
  previewTarget?: string;
  dragUpload?: boolean;
  dragBoxRender?: ReactNode[];
  template?: AttachmentValue;
  buttons?: AttachmentButtons[];
  __inGroup?: boolean;
  getPreviewUrl?: (props: AttachmentFileProps) => (string | (() => string | Promise<string>) | undefined);
  removeImmediately?: boolean;
  onTempRemovedAttachmentsChange?: (tempRemovedAttachments?: AttachmentFile[]) => void;
  filesLengthLimitNotice?: (defaultInfo: string) => void;
  countTextRenderer?: (count?: number, max?: number, defaultCountText?: ReactNode) => ReactNode;
  Modal?: ModalContextValue;
}

export type Sort = {
  type: 'time' | 'name' | 'custom';
  order: 'asc' | 'desc';
  custom?: boolean;
};

const defaultSort: Sort = {
  type: 'custom',
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
    showSize: true,
    downloadAll: true,
    listType: 'text',
    viewMode: 'list',
    dragUpload: false,
    removeImmediately: true,
  };

  constructor(props, context) {
    super(props, context);
    if (!this.secretLevelDataSet) {
      const secretLevelFlag = getConfigDefault('uploadSecretLevelFlag');
      const secretLevelOptions = getConfigDefault('uploadSecretLevelOptions');
      if (secretLevelFlag && secretLevelOptions) {
        const { fields } = secretLevelOptions;
        this.secretLevelDataSet = new DataSet({ fields, autoCreate: true });
      }
    }
  }

  // eslint-disable-next-line camelcase
  static __IS_IN_CELL_EDITOR = true;

  // eslint-disable-next-line camelcase
  static __PRO_ATTACHMENT = true;

  static Group = AttachmentGroup;

  @observable sort?: Sort;

  @observable popup?: boolean;

  @observable dragState?: string;

  uploader?: Uploader;

  @observable oldValue?: string | undefined;

  @observable tempAttachmentUUID?: string | undefined;

  @observable uploadWithoutUuid?: boolean;

  tempRemovedAttachments?: AttachmentFile[];

  secretLevelDataSet?: DataSet;

  get help() {
    return this.getDisplayProp('help');
  }

  @computed
  get showAttachmentHelp() {
    const defaultShowHelp = this.getContextConfig('showHelp');
    const { viewMode } = this.props;
    const { showHelp } = this;
    const { formNode } = this.context;
    if (showHelp === ShowHelp.none ||
      (formNode && showHelp === ShowHelp.label) ||
      (viewMode === 'popup' && (showHelp || defaultShowHelp) === ShowHelp.label && formNode)) {
      return ShowHelp.none;
    }
    if (viewMode === 'popup') {
      return ShowHelp.tooltip;
    }
    return ShowHelp.newLine;
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
    if (this.getValue()) {
      return this.observableProps.attachments;
    }
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

  get accept(): string[] | undefined {
    return this.getProp('accept');
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
    if (viewMode === 'popup' && this.oldValue !== this.getValue()) {
      this.fetchCount();
      runInAction(() => this.oldValue = this.getValue());
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
    if (viewMode !== 'list') {
      if (isNil(this.count)) {
        const value = this.getValue();
        if (value) {
          const { isPublic } = this;
          if (field) {
            field.fetchAttachmentCount(value, isPublic, this.record);
          } else {
            const { batchFetchCount } = this.getContextConfig('attachment');
            if (batchFetchCount && !this.attachments) {
              const { bucketName, bucketDirectory, storageCode } = this;
              attachmentStore.fetchCountInBatch({
                attachmentUUID: value,
                bucketName,
                bucketDirectory,
                storageCode,
                isPublic,
              }).then(mobxAction((count) => {
                this.observableProps.count = count || 0;
              }));
            }
          }
        }
      } else if (this.field && !this.field.isValid(this.record)) {
        this.field.checkValidity(this.record);
      }
    }
  }

  @autobind
  updateCacheCount() {
    const attachmentUUID = this.getValue();
    if (attachmentUUID) {
      attachmentStore.updateCacheCount(attachmentUUID, this.count);
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
      'buttons',
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
      'showSize',
      'isPublic',
      'downloadAll',
      'attachments',
      'onAttachmentsChange',
      'beforeUpload',
      'onUploadProgress',
      'onUploadSuccess',
      'onUploadError',
      'onRemove',
      'getPreviewUrl',
      'removeImmediately',
      'onTempRemovedAttachmentsChange',
      'filesLengthLimitNotice',
      'countTextRenderer',
      'Modal',
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
    if (!oldAttachmentUUID) {
      runInAction(() => this.uploadWithoutUuid = true);
    }
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
    const { filesLengthLimitNotice } = this.props;
    if (max > 0 && (this.count || 0) + attachments.length > max) {
      const defaultInfo = $l('Attachment', 'file_list_max_length', { count: max });
      if (typeof filesLengthLimitNotice === 'function') {
        filesLengthLimitNotice(defaultInfo);
      } else {
        Modal.error(defaultInfo);
      }
      return;
    }
    const secretLevelFlag = getConfigDefault('uploadSecretLevelFlag');
    const secretLevelOptions = getConfigDefault('uploadSecretLevelOptions');
    const { Modal: modalInProps } = this.props;
    let secretLevelHeadersInfo = {};
    if (secretLevelFlag && secretLevelOptions && this.secretLevelDataSet && modalInProps) {
      const { formProps, modalProps } = secretLevelOptions;
      secretLevelHeadersInfo = await getSecretLevelModal({
        dataSet: this.secretLevelDataSet,
        Modal: modalInProps,
        formProps,
        modalProps,
      });
      if (secretLevelHeadersInfo === false) {
        return;
      }
    }
    const oldAttachments = this.attachments || [];
    if (this.multiple) {
      this.attachments = [...oldAttachments.slice(), ...attachments];
    } else {
      oldAttachments.forEach(attachment => this.doRemove(attachment));
      this.attachments = [...attachments];
    }
    try {
      await Promise.all(attachments.map((attachment) => this.upload(attachment, secretLevelHeadersInfo)));
    } finally {
      runInAction(() => this.uploadWithoutUuid = false);
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
    const { bucketName, bucketDirectory, storageCode, isPublic, fileKey, accept } = this;
    const fileSize = this.getProp('fileSize');
    const chunkSize = this.getProp('chunkSize');
    const chunkThreads = this.getProp('chunkThreads');
    const useChunk = this.getProp('useChunk');
    const {
      action, data, headers, withCredentials,
      beforeUpload, onUploadProgress, onUploadSuccess, onUploadError,
    } = this.props;
    return {
      accept, action, data, headers, fileKey, withCredentials, bucketName, bucketDirectory, storageCode, isPublic,
      fileSize, chunkSize, chunkThreads, useChunk, beforeUpload, onUploadProgress, onUploadSuccess, onUploadError,
    };
  }

  async upload(attachment: AttachmentFile, extraHeaders?: object) {
    try {
      const uploader = getIf(this, 'uploader', () => {
        return new Uploader(
          {},
          {
            getConfig: this.getContextConfig as typeof getConfig,
          },
        );
      });
      const uploaderProps = this.getUploaderProps();
      if (extraHeaders) {
        if (uploaderProps.headers) {
          Object.assign(uploaderProps.headers, extraHeaders);
        } else {
          uploaderProps.headers = extraHeaders;
        }
      }
      uploader.setProps(uploaderProps);
      const result = await uploader.upload(attachment, this.attachments || [attachment], this.tempAttachmentUUID);
      if (result === false) {
        this.removeAttachment(attachment);
      } else {
        runInAction(() => {
          const { tempAttachmentUUID } = this;
          if (attachment.status === 'success') {
            this.updateCacheCount();
            if (tempAttachmentUUID) {
              this.tempAttachmentUUID = undefined;
              this.setValue(tempAttachmentUUID);
            }
            const results = this.getValidationResults();
            if (results && results.length) {
              this.checkValidity();
            }
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

  doRemove(attachment?: AttachmentFile, attachments: AttachmentFile[] = []): Promise<any> | undefined {
    const { bucketName, bucketDirectory, storageCode, isPublic, multiple, props: { removeImmediately, onRemove: onAttachmentRemove = noop } } = this;
    if (attachment) {
      return Promise.resolve(onAttachmentRemove(attachment)).then(mobxAction(ret => {
        if (ret !== false) {
          const { onRemove } = this.getContextConfig('attachment');
          if (onRemove) {
            if (attachment.status === 'error' || attachment.invalid) {
              return this.removeAttachment(attachment);
            }
            const attachmentUUID = this.getValue();
            if (attachmentUUID) {
              attachment.status = 'deleting';
              return onRemove({ attachment, attachmentUUID, bucketName, bucketDirectory, storageCode, isPublic }, multiple)
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
      }));
    }
    // 批量删除临时移除文件
    let validAttachments = attachments.filter(attachment => attachment.status !== 'error' && !attachment.invalid);
    if (!removeImmediately && validAttachments.length > 0) {
      return Promise.resolve(onAttachmentRemove(attachment)).then(mobxAction(ret => {
        if (ret !== false) {
          const { onRemove } = this.getContextConfig('attachment');
          if (onRemove) {
            const attachmentUUID = this.getValue();
            if (attachmentUUID) {
              validAttachments = validAttachments.map(attachment => {
                attachment.status = 'deleting';
                return attachment;
              });
              return onRemove({ attachments: validAttachments, attachmentUUID, bucketName, bucketDirectory, storageCode, isPublic }, multiple)
                .then(mobxAction((result) => {
                  if (result === false) {
                    this.handleFetchAttachment({ bucketName, bucketDirectory, storageCode, attachmentUUID, isPublic });
                  }
                }))
                .catch(mobxAction(() => {
                  this.handleFetchAttachment({ bucketName, bucketDirectory, storageCode, attachmentUUID, isPublic });
                }));
            }
          }
        }
      }));
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
    const { tempRemovedAttachments = [], props: { removeImmediately, onTempRemovedAttachmentsChange } } = this;
    if (removeImmediately) {
      return this.doRemove(attachment);
    }
    // 临时移除
    this.removeAttachment(attachment);
    tempRemovedAttachments.push(attachment);
    this.tempRemovedAttachments = tempRemovedAttachments;
    if (onTempRemovedAttachmentsChange) {
      onTempRemovedAttachmentsChange(this.tempRemovedAttachments);
    }
  }

  @autobind
  public remove() {
    const { tempRemovedAttachments = [], props: { onTempRemovedAttachmentsChange } } = this;
    if (tempRemovedAttachments.length > 0) {
      this.tempRemovedAttachments = undefined;
      if (onTempRemovedAttachmentsChange) {
        onTempRemovedAttachmentsChange(this.tempRemovedAttachments);
      }
      this.doRemove(undefined, tempRemovedAttachments);
    }
  }

  @autobind
  public reset() {
    const { attachments = [], tempRemovedAttachments = [], props: { onTempRemovedAttachmentsChange } } = this;
    if (tempRemovedAttachments.length > 0) {
      this.attachments = [...attachments, ...tempRemovedAttachments];
    }
    this.tempRemovedAttachments = undefined;
    if (onTempRemovedAttachmentsChange) {
      onTempRemovedAttachmentsChange(this.tempRemovedAttachments);
    }
  }

  @autobind
  @mobxAction
  handleAttachmentsChange(attachments: AttachmentFile[] | undefined) {
    this.observableProps.attachments = attachments;
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
        this.updateCacheCount();
      }
    }
    return undefined;
  }

  handleDragUpload = (file: File, files: File[]) => {
    if (files.indexOf(file) === files.length - 1) {
      this.getAttachmentUUID().then((uuid) => {
        this.uploadAttachments(this.processFiles(files, uuid));
      });
    }

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
    const { count = 0 } = this;
    if (this.readOnly) {
      return count === 0;
    }
    if (max) {
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

  renderTemplateDownloadButton(): ReactElement<ButtonProps> | undefined {
    if (!this.readOnly) {
      const template = this.getProp('template');
      if (template) {
        const { bucketName, bucketDirectory, storageCode, isPublic, attachmentUUID } = template;
        if (attachmentUUID) {
          const { previewTarget = ATTACHMENT_TARGET, viewMode, color, funcType = viewMode === 'popup' ? FuncType.flat : FuncType.link } = this.props;
          return (
            <TemplateDownloadButton
              attachmentUUID={attachmentUUID}
              bucketName={bucketName}
              bucketDirectory={bucketDirectory}
              storageCode={storageCode}
              isPublic={isPublic}
              target={previewTarget}
              funcType={funcType}
              color={color}
            />
          );
        }
      }
    }
  }

  renderUploadBtn(isCardButton: boolean, label?: ReactNode): ReactElement<ButtonProps> {
    const {
      count = 0,
      multiple,
      prefixCls,
      accept,
      props: {
        children, viewMode, countTextRenderer,
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
      tabIndex: -1, // Tab 切换焦点会跳过 input
    };
    const width = isCardButton ? pxToRem(this.getPictureWidth()) : undefined;
    let countText: ReactNode = multiple && (max ? `${count}/${max}` : count) || undefined;
    if (typeof countTextRenderer ==='function') {
      countText = countTextRenderer(count, max, countText);
    }
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
        <input key="upload" {...uploadProps} style={{ width: 0, height: 0, display: 'block', position: 'absolute', visibility: 'hidden' }} />
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
        <input key="upload" {...uploadProps} style={{ width: 0, height: 0, display: 'block', position: 'absolute', visibility: 'hidden' }} />
      </Button>
    );
  }

  showTooltip(e): boolean {
    if (this.showValidation === ShowValidation.tooltip) {
      const message = this.getTooltipValidationMessage();
      if (message) {
        showValidationMessage(e, message, this.context.getTooltipTheme('validation'), this.context.getTooltipPlacement('validation'), this.getContextConfig);
        return true;
      }
    }
    return false;
  }

  renderViewButton(label?: ReactNode): ReactElement<ButtonProps> {
    const { children, multiple, viewMode, countTextRenderer } = this.props;
    const max = this.getProp('max');
    const rest = this.getOtherProps();
    let countText: ReactNode = multiple ? this.count || 0 : undefined;
    if (typeof countTextRenderer ==='function') {
      countText = countTextRenderer(this.count, max, countText);
    }
    return (
      <Button
        funcType={viewMode === 'popup' ? FuncType.flat : FuncType.link}
        key="view-btn"
        icon="attach_file"
        color={ButtonColor.primary}
        {...omit(rest, ['ref'])}
        className={this.getMergedClassNames()}
      >
        {children || $l('Attachment', 'view_attachment')}{label && <>({label})</>} {countText}
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
    this.sort = defaultSort;
    this.changeOrder();
  }

  @mobxAction
  changeOrder() {
    this.sort = {
      ...defaultSort,
      ...this.sort,
      custom: true,
    };
    const { sortable } = this.props;
    if (sortable) {
      const { onOrderChange } = this.getContextConfig('attachment');
      if (onOrderChange) {
        const attachmentUUID = this.getValue();
        if (attachmentUUID) {
          const attachments = this.getValidAttachments();
          if (attachments) {
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
              onChange={(newType) => this.handleSort({ type: newType, order, custom: newType === 'custom' })}
              clearButton={false}
              isFlat
              popupPlacement="bottomRight"
              getPopupContainer={viewMode === 'popup' ? this.getSortSelectPopupContainer : undefined}
              size={Size.small}
              border={false}
            >
              <ObserverSelect.Option value="time">{$l('Attachment', 'by_upload_time')}</ObserverSelect.Option>
              <ObserverSelect.Option value="name">{$l('Attachment', 'by_name')}</ObserverSelect.Option>
              <ObserverSelect.Option value="custom">{$l('Attachment', 'by_custom')}</ObserverSelect.Option>
            </ObserverSelect>
            <Button
              funcType={FuncType.link}
              className={classNames(`${prefixCls}-order-icon`, order)}
              onClick={() => this.handleSort({ type, order: order === 'asc' ? 'desc' : 'asc', custom: type === 'custom' })}
            />
          </>
        );
      }
    }
  }

  renderUploadList(uploadButton?: ReactNode) {
    const {
      listType, sortable, listLimit, showHistory, showSize, previewTarget, buttons, getPreviewUrl, disabled, 
    } = this.props;
    let mergeButtons:AttachmentButtons[]  = [AttachmentButtonType.download, AttachmentButtonType.remove];
    if (buttons) {
      mergeButtons = [...mergeButtons, ...buttons];
    }
    if (showHistory) {
      mergeButtons.unshift(AttachmentButtonType.history);
    }
    const { attachments } = this;
    const attachmentUUID = this.tempAttachmentUUID || this.getValue();
    if (attachmentUUID || uploadButton || (attachments && attachments.length)) {
      const { bucketName, bucketDirectory, storageCode, readOnly, isPublic } = this;
      const width = this.getPictureWidth();
      const { orderField } = this.getContextConfig('attachment');
      return (
        <AttachmentList
          prefixCls={`${this.prefixCls}-list`}
          pictureWidth={width}
          listType={listType}
          attachments={sortAttachments(attachments, this.sort || defaultSort, orderField)}
          bucketName={bucketName}
          bucketDirectory={bucketDirectory}
          storageCode={storageCode}
          attachmentUUID={attachmentUUID}
          uploadButton={uploadButton}
          sortable={sortable}
          showSize={showSize}
          readOnly={readOnly}
          disabled={disabled}
          isPublic={isPublic}
          limit={readOnly ? listLimit : undefined}
          previewTarget={previewTarget}
          onHistory={showHistory ? this.handleHistory : undefined}
          onRemove={this.handleRemove}
          onUpload={this.uploadAttachment}
          onOrderChange={this.handleOrderChange}
          onFetchAttachments={this.handleFetchAttachment}
          onAttachmentsChange={this.handleAttachmentsChange}
          onPreview={this.handlePreview}
          record={this.record}
          buttons={mergeButtons}
          getPreviewUrl={getPreviewUrl}
          fetchAttachmentsFlag={!this.uploadWithoutUuid}
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
        this.renderTemplateDownloadButton(),
      );
    }
    const { downloadAllMode = DownloadAllMode.readOnly } = this.getContextConfig('attachment');
    if ((downloadAllMode === DownloadAllMode.readOnly && this.readOnly) || (downloadAllMode === DownloadAllMode.always)) {
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
        {viewMode !== 'popup' && this.renderDragUploadArea()}
        {this.renderHeader(!isCard && uploadBtn)}
        {!__inGroup && viewMode !== 'popup' && this.renderHelp()}
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

  @autobind
  handleHelpMouseEnter(e) {
    const { getTooltipTheme } = this.context;
    const { helpTooltipProps, help } = this;
    let helpTooltipCls = `${this.getContextConfig('proPrefixCls')}-tooltip-popup-help`;
    if (helpTooltipProps && helpTooltipProps.popupClassName) {
      helpTooltipCls = helpTooltipCls.concat(' ', helpTooltipProps.popupClassName)
    }
    show(e.currentTarget, {
      title: help,
      theme: getTooltipTheme('help'),
      placement: 'bottom', // 保留 bottom 原效果
      ...helpTooltipProps,
      popupClassName: helpTooltipCls,
    });
  }

  handleHelpMouseLeave() {
    hide();
  }

  renderHelp(): ReactNode {
    const { help, showAttachmentHelp } = this;
    if (!help || showAttachmentHelp === ShowHelp.none) return;
    switch (showAttachmentHelp) {
      case ShowHelp.tooltip:
        return (
          <Icon
            type="help"
            style={{ fontSize: '0.14rem', color: '#8c8c8c' }}
            onMouseEnter={this.handleHelpMouseEnter}
            onMouseLeave={this.handleHelpMouseLeave}
          />
        );
      default:
        return (
          <div key="help" className={`${this.getContextProPrefixCls(FIELD_SUFFIX)}-help`}>
            {toJS(help)}
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
    const { prefixCls, help } = this;
    return (
      <div className={`${prefixCls}-drag-box`}>
        <p className={`${prefixCls}-drag-box-icon`}>
          <Icon type="inbox" />
        </p>
        <p className={`${prefixCls}-drag-box-text`}>{$l('Attachment', 'file_type_mismatch')}</p>
        <p className={`${prefixCls}-drag-box-hint`}>
          {help}
        </p>
      </div>
    );
  }

  renderDragUploadArea() {
    const { dragUpload, dragBoxRender, readOnly } = this.props;
    const { prefixCls, accept } = this;
    if (dragUpload) {
      const isDisabled = this.isDisabled() || readOnly;
      const dragCls = classNames(prefixCls, {
        [`${prefixCls}-drag`]: true,
        [`${prefixCls}-drag-hover`]: this.dragState === 'dragover',
        [`${prefixCls}-drag-disabled`]: isDisabled,
      });
      const rcUploadProps = {
        ...this.props,
        disabled: isDisabled,
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
          {this.renderTemplateDownloadButton()}
          {this.renderHelp()}
          {this.showValidation === ShowValidation.newLine && this.renderValidationResult()}
        </>
      );
    }
    return this.renderWrapperList(readOnly ? undefined : this.renderUploadBtn(listType === 'picture-card'));
  }
}
