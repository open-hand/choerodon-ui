import React, { Component, CSSProperties, SyntheticEvent } from 'react';
import classNames from 'classnames';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Icon from '../icon';
import Tooltip from '../tooltip';
import Progress from '../progress';
import { UploadFile, UploadListProps } from './interface';
import Animate from '../animate';
import { ProgressType } from '../progress/enum';
import { getPrefixCls } from '../configure';
import { previewImage } from './utils';

const isImageUrl = (url: string): boolean => {
  return /^data:image\//.test(url) || /\.(webp|svg|png|gif|jpg|jpeg)$/.test(url);
};

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex): UploadFile[] => {
  const result: UploadFile[] = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export default class UploadList extends Component<UploadListProps, any> {
  static displayName = 'UploadList';

  static defaultProps = {
    listType: 'text', // or picture
    progressAttr: {
      strokeWidth: 2,
      showInfo: false,
    },
    previewFile: previewImage,
    showRemoveIcon: true,
    showPreviewIcon: true,
    dragUploadList: false,
  };

  handleClose = (file: UploadFile) => {
    const { onRemove } = this.props;
    if (onRemove) {
      onRemove(file);
    }
  };

  handlePreview = (file: UploadFile, e: SyntheticEvent<HTMLElement>) => {
    const { onPreview } = this.props;
    if (!onPreview) {
      return;
    }
    e.preventDefault();
    return onPreview(file);
  };

  componentDidUpdate() {
    const { listType, items, previewFile } = this.props;
    if (listType !== 'picture' && listType !== 'picture-card') {
      return;
    }
    (items || []).forEach(file => {
      if (
        typeof document === 'undefined' ||
        typeof window === 'undefined' ||
        !(window as any).FileReader ||
        !(window as any).File ||
        !(file.originFileObj instanceof File || file.originFileObj instanceof Blob) ||
        file.thumbUrl !== undefined
      ) {
        return;
      }
      file.thumbUrl = '';
      if (previewFile) {
        previewFile(file.originFileObj as File).then((previewDataUrl: string) => {
          // Need append '' to avoid dead loop
          file.thumbUrl = previewDataUrl || '';
          this.forceUpdate();
        });
      }
    });
  }

  /**
   * 拖拽事件
   * @param result
   */
  onDragEnd = (result) => {
    const { items, onDragEnd } = this.props;
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const dragItems = reorder(
      items,
      result.source.index,
      result.destination.index,
    );

    onDragEnd(dragItems);
  };

  render() {
    const {
      prefixCls: customizePrefixCls,
      items = [],
      listType,
      showPreviewIcon,
      showRemoveIcon,
      locale,
      dragUploadList,
    } = this.props;
    const prefixCls = getPrefixCls('upload', customizePrefixCls);
    const list = items.map((file, index) => {
      let progress;
      let icon = <Icon type={file.status === 'uploading' ? 'loading' : 'attach_file'} />;

      if (listType === 'picture' || listType === 'picture-card') {
        if (listType === 'picture-card' && file.status === 'uploading') {
          icon = <div className={`${prefixCls}-list-item-uploading-text`}>{locale.uploading}</div>;
        } else if (!file.thumbUrl && !file.url) {
          icon = <Icon className={`${prefixCls}-list-item-thumbnail`} type="picture" />;
        } else {
          const thumbnail = isImageUrl((file.thumbUrl || file.url) as string) ? (
            <img src={file.thumbUrl || file.url} alt={file.name} />
          ) : (
            <Icon type="file" style={{ fontSize: 48, color: 'rgba(0,0,0,0.5)' }} />
          );
          icon = (
            <a
              className={`${prefixCls}-list-item-thumbnail`}
              onClick={e => this.handlePreview(file, e)}
              href={file.url || file.thumbUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {thumbnail}
            </a>
          );
        }
      }

      if (file.status === 'uploading') {
        const { progressAttr } = this.props;
        // show loading icon if upload progress listener is disabled
        const loadingProgress =
          'percent' in file ? (
            <Progress type={ProgressType.line} {...progressAttr} percent={file.percent} />
          ) : null;

        progress = (
          <div className={`${prefixCls}-list-item-progress`} key="progress">
            {loadingProgress}
          </div>
        );
      }
      const infoUploadingClass = classNames({
        [`${prefixCls}-list-item`]: true,
        [`${prefixCls}-list-item-${file.status}`]: true,
      });
      const preview = file.url ? (
        <a
          {...file.linkProps}
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${prefixCls}-list-item-name`}
          onClick={e => this.handlePreview(file, e)}
          title={file.name}
        >
          {file.name}
        </a>
      ) : (
        <span
          className={`${prefixCls}-list-item-name`}
          onClick={e => this.handlePreview(file, e)}
          title={file.name}
        >
          {file.name}
        </span>
      );
      const style =
        file.url || file.thumbUrl
          ? undefined
          : ({
            pointerEvents: 'none',
            opacity: 0.5,
          } as CSSProperties);
      const previewIcon = showPreviewIcon ? (
        <a
          href={file.url || file.thumbUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={style}
          onClick={e => this.handlePreview(file, e)}
          title={locale.previewFile}
        >
          <Icon type="visibility" />
        </a>
      ) : null;
      const removeIcon = showRemoveIcon ? (
        <Icon type="delete" title={locale.removeFile} onClick={() => this.handleClose(file)} />
      ) : null;
      const removeIconCross = showRemoveIcon ? (
        <Icon type="close" title={locale.removeFile} onClick={() => this.handleClose(file)} />
      ) : null;
      const actions =
        listType === 'picture-card' && file.status !== 'uploading' ? (
          <span className={`${prefixCls}-list-item-actions`}>
            {previewIcon}
            {removeIcon}
          </span>
        ) : (
          removeIconCross
        );
      let message;
      if (file.response && typeof file.response === 'string') {
        message = file.response;
      } else {
        message = (file.error && file.error.statusText) || locale.uploadError;
      }
      const iconAndPreview =
        file.status === 'error' ? (
          <Tooltip title={message}>
            {icon}
            {preview}
          </Tooltip>
        ) : (
          <span>
            {icon}
            {preview}
          </span>
        );

      if (dragUploadList) {
        return (
          <Draggable key={file.uid} draggableId={String(file.uid)} index={index}>
            {provided => (
              <div
                className={infoUploadingClass}
                key={file.uid}
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
              >
                <div className={`${prefixCls}-list-item-info`}>{iconAndPreview}</div>
                {actions}
                <Animate transitionName="fade" component="">
                  {progress}
                </Animate>
              </div>
            )}
          </Draggable>
        );
      }

      return (
        <div className={infoUploadingClass} key={file.uid}>
          <div className={`${prefixCls}-list-item-info`}>{iconAndPreview}</div>
          {actions}
          <Animate transitionName="fade" component="">
            {progress}
          </Animate>
        </div>
      );
    });
    const listClassNames = classNames({
      [`${prefixCls}-list`]: true,
      [`${prefixCls}-list-${listType}`]: true,
      [`${prefixCls}-list-drag`]: dragUploadList,
    });
    const animationDirection = listType === 'picture-card' ? 'animate-inline' : 'animate';
    if (dragUploadList) {
      return (
        <DragDropContext onDragEnd={this.onDragEnd}>
          <Droppable droppableId="droppable" direction="horizontal">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                style={{
                  background: snapshot.isDraggingOver ? '#f2f9f4' : '',
                  border: snapshot.isDraggingOver ? '2px dashed #1ab16f' : '',
                  display: 'inline-flex',
                  maxWidth: '100%',
                  flexWrap: 'wrap',
                  overflow: 'auto',
                }}
                {...provided.droppableProps}
                className={listClassNames}
              >
                {list}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      );
    }
    return (
      <Animate
        transitionName={`${prefixCls}-${animationDirection}`}
        component="div"
        className={listClassNames}
      >
        {list}
      </Animate>
    );
  }
}
