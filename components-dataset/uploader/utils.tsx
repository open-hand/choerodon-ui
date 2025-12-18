import axiosStatic, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { action as mobxAction, runInAction } from 'mobx';
import { DataSetContext } from '../data-set/DataSet';
import AttachmentFile from '../data-set/AttachmentFile';
import AttachmentFileChunk from '../data-set/AttachmentFileChunk';
import { appendFormData } from '../data-set/utils';
import axios from '../axios';
import PromiseQueue from '../promise-queue';
import { UploaderProps } from './Uploader';
import { $l } from '../locale-context';
import { formatFileSize } from '../formatter';
import UploadError from './UploadError';

function getAxios(context: DataSetContext): AxiosInstance {
  return context.getConfig('axios') || axios;
}

export function isAcceptFile(attachment: AttachmentFile, accept: string[]): boolean {
  if (!accept || accept.length === 0) return true;
  const acceptTypes = accept.map(type => (
    new RegExp(type.replace(/\./g, '\\.').replace(/\*/g, '.*'))
  ));
  const { name, type } = attachment;
  return acceptTypes.some(acceptType => acceptType.test(name) || acceptType.test(type));
}

function getUploadAxiosConfig(
  props: UploaderProps,
  attachment: AttachmentFile,
  chunk: AttachmentFileChunk | undefined,
  attachmentUUID: string,
  context: DataSetContext,
  onUploadProgress: (e) => void,
): AxiosRequestConfig {
  const { originFileObj } = attachment;
  if (originFileObj) {
    const blob = chunk ? originFileObj.slice(chunk.start, chunk.end) : originFileObj;
    const globalConfig = context.getConfig('attachment');
    const { action, data, headers, fileKey = globalConfig.defaultFileKey, withCredentials } = props;
    const newHeaders = {
      'X-Requested-With': 'XMLHttpRequest',
      ...headers,
    };
    const formData = new FormData();
    formData.append(fileKey, blob);
    if (data) {
      appendFormData(formData, data);
    }
    if (action && !chunk) {
      return {
        url: action,
        headers: newHeaders,
        data: formData,
        onUploadProgress,
        method: 'POST',
        withCredentials,
      };
    }
    const actionHook = globalConfig.action;
    if (actionHook) {
      const { bucketName, bucketDirectory, storageCode, isPublic } = props;
      const newConfig = typeof actionHook === 'function' ? actionHook({
        attachment,
        chunk,
        bucketName,
        bucketDirectory,
        storageCode,
        attachmentUUID,
        isPublic,
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
    throw new Error(`Please set configure.attachment.action .`);
  }
  throw new Error('AttachmentFile can be uploaded only from input.files or DragEvent.dataTransfer.files');
}

async function uploadChunk(props: UploaderProps, attachment: AttachmentFile, chunk: AttachmentFileChunk, attachmentUUID: string, context: DataSetContext): Promise<any> {
  try {
    const { onBeforeUploadChunk } = context.getConfig('attachment');
    if (!onBeforeUploadChunk || await onBeforeUploadChunk({
      chunk,
      attachment,
      bucketName: props.bucketName,
      bucketDirectory: props.bucketDirectory,
      storageCode: props.storageCode,
      isPublic: props.isPublic,
      headers: props.headers,
      attachmentUUID,
    }) !== false) {
      // 在发起请求前检查中断状态
      if (attachment.aborted || chunk.aborted) {
        chunk.status = 'aborted';
        runInAction(() => {
          chunk.aborted = true;
        });
        return Promise.resolve();
      }
      
      const config = getUploadAxiosConfig(props, attachment, chunk, attachmentUUID, context, mobxAction((e) => {
        chunk.percent = e.total > 0 ? (e.loaded / e.total) * 100 : 0;
      }));
      
      const axiosInstance = getAxios(context);
      const source = axiosStatic.CancelToken.source();
      // 添加取消token到config
      config.cancelToken = source.token;
      // 将取消token存储到chunk中，以便后续取消
      chunk.cancelToken = source;
      
      const resp = await axiosInstance(config);
      chunk.status = 'success';
      return resp;
    }
  } catch (e) {
    // 优先检查中断状态，避免将中断错误误判为上传失败
    if (attachment.aborted || chunk.aborted) {
      chunk.status = 'aborted';
      runInAction(() => {
        chunk.aborted = true;
      });
      return Promise.resolve();
    }
    chunk.status = 'error';
    throw new UploadError(e);
  }
}

function uploadChunks(
  props: UploaderProps,
  attachment: AttachmentFile,
  chunks: AttachmentFileChunk[],
  attachmentUUID: string,
  context: DataSetContext,
  threads: number,
): Promise<void> {
  const { length } = chunks;
  if (length) {
    runInAction(() => {
      attachment.status = 'uploading';
    });
    const queue = new PromiseQueue(threads);
    
    // 将queue存储到attachment中，以便后续中断
    attachment.uploadQueue = queue;
    
    chunks.forEach(chunk => {
      if (chunk.status !== 'success') {
        queue.add(() => uploadChunk(props, attachment, chunk, attachmentUUID, context));
      }
    });
    return queue.ready();
  }
  return Promise.resolve();
}

async function uploadNormalFile(props: UploaderProps, attachment: AttachmentFile, attachmentUUID: string, context: DataSetContext) {
  try {
    // 在开始上传前检查中断状态
    if (attachment.aborted) {
      runInAction(() => {
        attachment.status = 'aborted';
      });
      return Promise.resolve();
    }

    runInAction(() => {
      attachment.status = 'uploading';
    });
    const config = getUploadAxiosConfig(props, attachment, undefined, attachmentUUID, context, mobxAction((e) => {
      const percent = e.total > 0 ? (e.loaded / e.total) * 100 : 0;
      attachment.percent = percent;
      const { onUploadProgress: handleProgress } = props;
      if (handleProgress) {
        handleProgress(percent, attachment);
      }
    }));
    
    // 在发起请求前再次检查中断状态
    if (attachment.aborted) {
      runInAction(() => {
        attachment.status = 'aborted';
      });
      return Promise.resolve();
    }
    
    const axiosInstance = getAxios(context);
    const source = axiosStatic.CancelToken.source();
    // 添加取消token到config
    config.cancelToken = source.token;
    // 将取消token存储到attachment中，以便后续取消
    attachment.cancelToken = source;
    
    const resp = await axiosInstance(config);
    attachment.percent = 100;
    return new Promise<any>((resolve) => {
      setTimeout(() => resolve(resp), 0);
    });
  } catch (e) {
    // 优先检查中断状态，避免将中断错误误判为上传失败
    if (attachment.aborted) {
      runInAction(() => {
        attachment.status = 'aborted';
      });
      return Promise.resolve();
    }
    throw new UploadError(e);
  }
}

function cuteFile(attachment: AttachmentFile, chunkSize: number): AttachmentFileChunk[] {
  const { size, chunks } = attachment;
  if (!chunks) {
    const count = chunkSize ? Math.ceil(size / chunkSize) : 1;
    let start = 0;
    let index = 0;
    let len;
    const newChunks: AttachmentFileChunk[] = [];
    while (index < count) {
      len = Math.min(chunkSize, size - start);
      newChunks.push(new AttachmentFileChunk({
        file: attachment,
        total: size,
        start,
        end: chunkSize ? (start + len) : size,
        index,
      }));
      index += 1;
      start += len;
    }
    if (newChunks.length > 1) {
      attachment.chunks = newChunks;
    }
    return newChunks;
  }
  return chunks;
}

export async function beforeUploadFile(
  props: UploaderProps,
  context: DataSetContext,
  attachment: AttachmentFile,
  attachments: AttachmentFile[] = [],
  useChunk?: boolean,
): Promise<boolean | undefined> {
  const globalConfig = context.getConfig('attachment');
  const { accept } = props;
  if (accept && !isAcceptFile(attachment, accept)) {
    runInAction(() => {
      attachment.status = 'error';
      attachment.invalid = true;
      attachment.errorMessage = $l('Attachment', 'file_type_mismatch', undefined, { types: accept.join(',') }) as string;
    });
    return;
  }
  let { fileSize = globalConfig.defaultFileSize } = props;
  const { fetchFileSize } = globalConfig;
  if (fetchFileSize) {
    fileSize = await fetchFileSize({
      bucketName: props.bucketName,
      bucketDirectory: props.bucketDirectory,
      storageCode: props.storageCode,
      isPublic: props.isPublic,
    });
  }
  if (fileSize && fileSize > 0 && attachment.size > fileSize) {
    runInAction(() => {
      attachment.status = 'error';
      attachment.invalid = true;
      attachment.errorMessage = $l('Attachment', 'file_max_size', undefined, { size: formatFileSize(fileSize) }) as string;
    });
    return;
  }
  const { onBeforeUpload } = globalConfig;
  if (onBeforeUpload && await onBeforeUpload(attachment, attachments, {
    useChunk,
    bucketName: props.bucketName,
    bucketDirectory: props.bucketDirectory,
    storageCode: props.storageCode,
    isPublic: props.isPublic,
  }) === false) {
    return false;
  }

  const { beforeUpload } = props;
  return !(beforeUpload && await beforeUpload(attachment, attachments) === false);
}

export async function uploadFile(props: UploaderProps, attachment: AttachmentFile, attachmentUUID: string, context: DataSetContext, chunkSize: number, useChunk?: boolean): Promise<any> {
  if (useChunk) {
    const chunks = cuteFile(attachment, chunkSize);
    const globalConfig = context.getConfig('attachment');
    const { chunkThreads = globalConfig.defaultChunkThreads } = props;
    return uploadChunks(props, attachment, chunks.slice(), attachmentUUID, context, Math.min(chunks.length, chunkThreads));
  }
  return uploadNormalFile(props, attachment, attachmentUUID, context);
}
