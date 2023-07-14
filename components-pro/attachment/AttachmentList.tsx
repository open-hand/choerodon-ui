import React, { Fragment, FunctionComponent, ReactNode, useCallback, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import { DragDropContext, Draggable, DraggableProvided, Droppable, DroppableProvided, DropResult } from 'react-beautiful-dnd';
import isNumber from 'lodash/isNumber';
import Item from './Item';
import AttachmentFile from '../data-set/AttachmentFile';
import Record from '../data-set/Record';
import { AttachmentButtons, AttachmentListType } from './Attachment';
import Animate from '../animate';
import { arrayMove } from '../data-set/utils';
import { PictureProvider } from '../picture/PictureContext';

export interface AttachmentListProps {
  prefixCls: string;
  attachments?: AttachmentFile[];
  listType?: AttachmentListType;
  pictureWidth: number;
  limit?: number;
  onUpload: (attachment: AttachmentFile) => void;
  onHistory?: (attachment: AttachmentFile, attachmentUUID: string) => void;
  onRemove: (attachment: AttachmentFile) => Promise<any> | undefined;
  onOrderChange: (props: { attachments: AttachmentFile[] }) => void;
  onFetchAttachments: (props: { bucketName?: string; bucketDirectory?: string; storageCode?: string; attachmentUUID: string; isPublic?: boolean; }) => void;
  onAttachmentsChange: (attachments: AttachmentFile[] | undefined) => void;
  onPreview: () => void;
  previewTarget?: string;
  bucketName?: string;
  bucketDirectory?: string;
  storageCode?: string;
  attachmentUUID?: string;
  uploadButton?: ReactNode;
  sortable?: boolean;
  readOnly?: boolean;
  showHistory?: boolean;
  showSize?: boolean;
  isPublic?: boolean;
  record?: Record;
  buttons?: AttachmentButtons[];
  onPreviewAvailable?: (attachment: AttachmentFile) => (boolean | void);
}

const AttachmentList: FunctionComponent<AttachmentListProps> = function AttachmentList(props) {
  const {
    prefixCls,
    attachments,
    onUpload,
    onRemove,
    onOrderChange,
    listType,
    pictureWidth,
    bucketName,
    bucketDirectory,
    storageCode,
    attachmentUUID,
    uploadButton,
    sortable,
    readOnly,
    onFetchAttachments,
    onAttachmentsChange,
    limit,
    onHistory,
    onPreview,
    previewTarget,
    isPublic,
    record,
    showSize,
    buttons,
    onPreviewAvailable,
  } = props;
  const isCard = listType === 'picture-card';
  const classString = classNames(prefixCls, isCard ? `${prefixCls}-card` : `${prefixCls}-no-card`);
  const oldValues = useRef<{
    attachmentUUID?: string;
    record?: Record;
  } | undefined>();
  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source } = result;
    if (destination && attachments) {
      const newAttachments = attachments.slice();
      arrayMove<AttachmentFile>(
        newAttachments,
        source.index,
        destination.index,
      );
      onOrderChange({ attachments: newAttachments });
    }
  }, [attachments, onOrderChange]);
  useEffect(() => {
    if (attachmentUUID) {
      const { current } = oldValues;
      if (!current || current.attachmentUUID !== attachmentUUID || current.record !== record) {
        if (attachments) {
          onAttachmentsChange(undefined);
        }
        oldValues.current = { attachmentUUID, record };
        onFetchAttachments({ bucketName, bucketDirectory, storageCode, attachmentUUID, isPublic });
      }
    }
  }, [onFetchAttachments, bucketName, bucketDirectory, storageCode, attachmentUUID, isPublic, record]);

  if (attachments) {
    const { length } = attachments;
    const draggable = sortable && !readOnly && length > 1;
    let previewIndex = 0;
    const list = attachments.map((attachment, index) => {
      const { type, uid } = attachment;
      const restCount = index + 1 === limit ? length - limit : undefined;
      const hidden = isNumber(limit) && index >= limit;
      const itemDraggable = draggable && !restCount;
      const itemIndex = type.startsWith('image') ? previewIndex++ : undefined;
      return (
        <Draggable
          draggableId={uid}
          index={index}
          key={uid}
          isDragDisabled={!itemDraggable}
        >
          {
            (provided: DraggableProvided) => (
              <Item
                key={uid}
                provided={provided}
                prefixCls={`${prefixCls}-item`}
                attachment={attachment}
                pictureWidth={pictureWidth}
                listType={listType}
                bucketName={bucketName}
                bucketDirectory={bucketDirectory}
                storageCode={storageCode}
                showSize={showSize}
                attachmentUUID={attachmentUUID}
                onRemove={onRemove}
                onUpload={onUpload}
                isCard={isCard}
                readOnly={readOnly}
                restCount={restCount}
                draggable={itemDraggable}
                index={itemIndex}
                hidden={hidden}
                onHistory={onHistory}
                onPreview={onPreview}
                previewTarget={previewTarget}
                isPublic={isPublic}
                buttons={buttons}
                onPreviewAvailable={onPreviewAvailable}
              />
            )
          }
        </Draggable>
      );
    });

    return (
      <PictureProvider>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable
            droppableId="list"
            key="list"
            isDropDisabled={!draggable}
            direction={isCard ? 'horizontal' : 'vertical'}
          >
            {
              (droppableProvided: DroppableProvided) => (
                <div
                  ref={droppableProvided.innerRef}
                  {...droppableProvided.droppableProps}
                  className={classString}
                >
                  <Animate
                    component={Fragment}
                    transitionName="fade"
                    exclusive
                  >
                    {list}
                  </Animate>
                  {droppableProvided.placeholder}
                  {uploadButton}
                </div>
              )
            }
          </Droppable>
        </DragDropContext>
      </PictureProvider>
    );
  }
  if (uploadButton) {
    return (
      <div className={classString}>
        {uploadButton}
      </div>
    );
  }
  return null;
};

AttachmentList.displayName = 'AttachmentList';

export default observer(AttachmentList);
