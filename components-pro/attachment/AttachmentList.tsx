import React, { Fragment, FunctionComponent, ReactNode, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import classNames from 'classnames';
import { DragDropContext, Draggable, DraggableProvided, Droppable, DroppableProvided, DropResult } from 'react-beautiful-dnd';
import isNumber from 'lodash/isNumber';
import Item from './Item';
import AttachmentFile from '../data-set/AttachmentFile';
import { AttachmentListType } from './Attachment';
import Animate from '../animate';
import { arrayMove } from '../data-set/utils';
import { PictureProvider } from '../picture/PictureContext';

export interface AttachmentListProps {
  prefixCls: string;
  attachments?: AttachmentFile[];
  listType?: AttachmentListType;
  pictureWidth: number;
  limit?: number;
  onUpload: (attachment: AttachmentFile, attachmentUUID: string) => void;
  onHistory?: (attachment: AttachmentFile, attachmentUUID: string) => void;
  onRemove: (attachment: AttachmentFile) => Promise<any> | undefined;
  onOrderChange: (props: { attachments: AttachmentFile[] }) => void;
  onFetchAttachments: (props: { bucketName?: string, bucketDirectory?: string, storageCode?: string, attachmentUUID: string }) => void;
  onPreview: () => void;
  bucketName?: string;
  bucketDirectory?: string;
  storageCode?: string;
  attachmentUUID?: string;
  uploadButton?: ReactNode;
  sortable?: boolean;
  readOnly?: boolean;
  showHistory?: boolean;
}

const AttachmentList: FunctionComponent<AttachmentListProps> = observer(function AttachmentList(props) {
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
    limit,
    onHistory,
    onPreview,
  } = props;
  const isCard = listType === 'picture-card';
  const classString = classNames(prefixCls, isCard ? `${prefixCls}-card` : `${prefixCls}-no-card`);
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
    if (!attachments && attachmentUUID) {
      onFetchAttachments({ bucketName, bucketDirectory, storageCode, attachmentUUID });
    }
  }, [onFetchAttachments, attachments, bucketName, bucketDirectory, storageCode, attachmentUUID]);

  if (attachments && attachmentUUID) {
    const { length } = attachments;
    const draggable = sortable && !readOnly && length > 1;
    let previewIndex = 0;
    const list = attachments.map((attachment, index) => {
      const { type, uid } = attachment;
      const restCount = index + 1 === limit ? length - limit : undefined;
      const hidden = isNumber(limit) && index >= limit;
      const itemDraggable = draggable && !restCount;
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
                attachmentUUID={attachmentUUID}
                onRemove={onRemove}
                onUpload={onUpload}
                isCard={isCard}
                readOnly={readOnly}
                restCount={restCount}
                draggable={itemDraggable}
                index={type.startsWith('image') ? previewIndex++ : undefined}
                hidden={hidden}
                onHistory={onHistory}
                onPreview={onPreview}
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
});

AttachmentList.displayName = 'AttachmentList';

export default AttachmentList;
