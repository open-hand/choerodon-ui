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
  onRemove: (attachment: AttachmentFile) => void;
  onOrderChange: (props: { bucketName?: string, bucketDirectory?: string, attachmentUUID: string, attachments: AttachmentFile[] }) => void;
  onFetchAttachments: (props: { bucketName?: string, bucketDirectory?: string, attachmentUUID: string }) => void;
  bucketName?: string;
  bucketDirectory?: string;
  attachmentUUID: string;
  uploadButton?: ReactNode;
  sortable?: boolean;
  readOnly?: boolean;
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
    attachmentUUID,
    uploadButton,
    sortable,
    readOnly,
    onFetchAttachments,
    limit,
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
      onOrderChange({ attachments: newAttachments, bucketName, bucketDirectory, attachmentUUID });
    }
  }, [attachments, bucketName, bucketDirectory, attachmentUUID, onOrderChange]);
  useEffect(() => {
    if (!attachments) {
      onFetchAttachments({ bucketName, bucketDirectory, attachmentUUID });
    }
  }, [onFetchAttachments, attachments]);

  if (attachments) {
    const { length } = attachments;
    const draggable = sortable && !readOnly && length > 1;
    const list = attachments.map((attachment, index) => {
      const restCount = index + 1 === limit ? length - limit : undefined;
      const hidden = isNumber(limit) && index >= limit;
      const itemDraggable = draggable && !restCount;
      return (
        <Draggable
          draggableId={attachment.uid}
          index={index}
          key={attachment.uid}
          isDragDisabled={!itemDraggable}
        >
          {
            (provided: DraggableProvided) => (
              <Item
                key={attachment.uid}
                provided={provided}
                prefixCls={`${prefixCls}-item`}
                attachment={attachment}
                pictureWidth={pictureWidth}
                listType={listType}
                bucketName={bucketName}
                bucketDirectory={bucketDirectory}
                attachmentUUID={attachmentUUID}
                onRemove={onRemove}
                onUpload={onUpload}
                isCard={isCard}
                readOnly={readOnly}
                restCount={restCount}
                draggable={itemDraggable}
                index={index}
                hidden={hidden}
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
