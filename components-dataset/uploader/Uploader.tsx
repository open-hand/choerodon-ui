import { AxiosError } from 'axios';
import { runInAction } from 'mobx';
import isPromise from 'is-promise';
import AttachmentFile from '../data-set/AttachmentFile';
import { beforeUploadFile, uploadFile } from './utils';
import { getConfig } from '../configure';
import { DataSetContext } from '../data-set/DataSet';
import AttachmentFileChunk from '../data-set/AttachmentFileChunk';
import UploadError from './UploadError';

export interface UploaderProps {
  /**
   *  可接受的上传文件类型
   */
  accept?: string[] | undefined;
  /**
   * 上传文件路径
   */
  action?: string | undefined;
  /**
   * 上传所需参数或者返回上传参数的方法
   */
  data?: object | Function | undefined;
  /**
   * 设置上传的请求头部
   */
  headers?: any | undefined;
  withCredentials?: boolean | undefined;
  fileKey?: string | undefined;
  fileSize?: number | undefined;
  chunkSize?: number | undefined;
  chunkThreads?: number | undefined;
  useChunk?: boolean | undefined;
  bucketName?: string | undefined;
  bucketDirectory?: string | undefined;
  storageCode?: string | undefined;
  isPublic?: boolean | undefined;
  beforeUpload?: ((attachment: AttachmentFile, attachments: AttachmentFile[], chunk?: AttachmentFileChunk) => boolean | undefined | PromiseLike<boolean | undefined>) | undefined;
  onUploadProgress?: ((percent: number, attachment: AttachmentFile) => void) | undefined;
  onUploadSuccess?: ((response: any, attachment: AttachmentFile, useChunk?: boolean) => void) | undefined;
  onUploadError?: ((error: AxiosError, response: any, attachment: AttachmentFile) => void) | undefined;
}

export default class Uploader {

  private props: UploaderProps;

  private context: DataSetContext;

  constructor(props: UploaderProps, context = { getConfig }) {
    this.props = props;
    this.context = context;
  }

  setProps(props: UploaderProps) {
    Object.assign(this.props, props);
  }

  /**
   * 中断上传任务
   * @param attachment 要中断的附件
   */
  abortUpload(attachment?: AttachmentFile): void {
    if (attachment) {
      this.abortSingleUpload(attachment);
    }
  }

  /**
   * 中断单个附件的上传
   */
  private abortSingleUpload(attachment: AttachmentFile): void {
    runInAction(() => {
      attachment.aborted = true;
      attachment.status = 'aborted';
    });

    // 取消普通上传的请求
    const { cancelToken } = attachment;
    if (cancelToken) {
      cancelToken.cancel('Upload aborted by user');
    }

    // 取消分片上传的队列和所有分片
    const { uploadQueue } = attachment;
    if (uploadQueue) {
      uploadQueue.abort();
    }

    // 取消所有分片的请求
    const { chunks } = attachment;
    if (chunks) {
      chunks.forEach(chunk => {
        runInAction(() => {
          chunk.aborted = true;
          chunk.status = 'aborted';
        });
        
        const { cancelToken: chunkCancelToken } = chunk;
        if (chunkCancelToken) {
          chunkCancelToken.cancel('Chunk upload aborted by user');
        }
      });
    }
  }

  async upload(attachment: AttachmentFile, attachments?: AttachmentFile[], tempAttachmentUUID?: string | undefined): Promise<any> {
    const { attachmentUUID = tempAttachmentUUID } = attachment;
    if (attachment.status === 'success' || attachment.invalid || !attachmentUUID) {
      return;
    }
    const { context, props } = this;
    const globalConfig = context.getConfig('attachment');
    const { chunkSize = globalConfig.defaultChunkSize } = props;
    const useChunk = props.useChunk && chunkSize > 0 && attachment.size > chunkSize;
    const result = await beforeUploadFile(props, context, attachment, attachments, useChunk);
    if (result === true) {
      try {
        const resp = await uploadFile(props, attachment, attachmentUUID, context, chunkSize, useChunk);
        const { aborted, chunks } = attachment;
        if (aborted || (chunks && chunks.some(chunk => chunk.aborted))) {
          console.warn('Upload aborted');
          return Promise.resolve();
        }
        let handleUploadSuccessResult;
        runInAction(() => {
          attachment.status = 'success';
          const { onUploadSuccess: handleUploadSuccess } = globalConfig;
          const { onUploadSuccess } = props;
          if (handleUploadSuccess) {
            handleUploadSuccessResult = handleUploadSuccess(resp, attachment, {
              useChunk,
              bucketName: props.bucketName,
              bucketDirectory: props.bucketDirectory,
              storageCode: props.storageCode,
              isPublic: props.isPublic,
              headers: props.headers,
            });
          }
          if (onUploadSuccess) {
            if (isPromise(handleUploadSuccessResult)) {
              handleUploadSuccessResult.then((res) => {
                onUploadSuccess(res, attachment, useChunk);
              });
            } else {
              onUploadSuccess(resp, attachment, useChunk);
            }
          }
        });
        if (isPromise(handleUploadSuccessResult)) {
          // 确保分片上传完成后再返回结果
          await handleUploadSuccessResult;
          return resp;
        }
        return resp;
      } catch (error) {
        if (error instanceof UploadError) {
          const { response } = error;
          runInAction(() => {
            const { onUploadError } = props;
            const { onUploadError: handleUploadError } = globalConfig;
            attachment.status = 'error';
            attachment.error = error;
            const { message } = error;
            if (handleUploadError) {
              handleUploadError(error, attachment);
            }
            attachment.errorMessage = message || attachment.errorMessage;
            if (onUploadError) {
              onUploadError(error, response, attachment);
            }
          });
          return response;
        }
        const { aborted, chunks } = attachment;
        if (aborted || (chunks && chunks.some(chunk => chunk.aborted))) {
          console.warn('Upload aborted');
          return Promise.resolve();
        }
        throw error;
      }
    }
    return result;
  }
}
