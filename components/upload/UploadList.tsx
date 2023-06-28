import React, { Component, createElement, CSSProperties, SyntheticEvent } from 'react';
import classNames from 'classnames';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import isFunction from 'lodash/isFunction';
import Icon from '../icon';
import Tooltip from '../tooltip';
import Progress from '../progress';
import { UploadFile, UploadListIconFunc, UploadListReUploadIconFunc, UploadListProps, UploadListType, ShowReUploadIconType } from './interface';
import Animate from '../animate';
import PopConfirm from '../popconfirm';
import { ProgressType } from '../progress/enum';
import { getFileSizeStr, getFileType, isImageUrl, previewImage } from './utils';
import CompressedfileIcon from './icon-svg/compressedfileIcon';
import DocIcon from './icon-svg/docIcon';
import FileuploadIcon from './icon-svg/fileuploadIcon';
import ImageIcon from './icon-svg/imageIcon';
import PdfIcon from './icon-svg/pdfIcon';
import XlsIcon from './icon-svg/xlsIcon';
import { Size } from '../_util/enum';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex): UploadFile[] => {
  const result: UploadFile[] = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

function defaultRenderIcon(file: UploadFile, listType: UploadListType, prefixCls?: string) {
  if (listType === 'picture' || listType === 'picture-card') {
    return <Icon type="insert_drive_file" className={`${prefixCls}-list-item-icon`} />;
  }
  if (file.status === 'uploading') {
    return <Progress key='loading' type={ProgressType.loading} size={Size.small} />;
  }
  const filetype = getFileType(file.name);
  switch (filetype) {
    case 'compressedfile':
      return <CompressedfileIcon className={`${prefixCls}-icon-file`} />;
    case 'doc':
      return <DocIcon className={`${prefixCls}-icon-file`} />;
    case 'image':
      return <ImageIcon className={`${prefixCls}-icon-file`} />;
    case 'pdf':
      return <PdfIcon className={`${prefixCls}-icon-file`} />;
    case 'xls':
      return <XlsIcon className={`${prefixCls}-icon-file`} />;
    default:
      return <FileuploadIcon className={`${prefixCls}-icon-file`} />;
  }
}

export default class UploadList extends Component<UploadListProps, any> {
  static displayName = 'UploadList';

  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static defaultProps = {
    listType: 'text',
    progressAttr: {
      strokeWidth: 2,
      showInfo: false,
    },
    previewFile: previewImage,
    showRemoveIcon: true,
    showPreviewIcon: true,
    dragUploadList: false,
    showFileSize: false,
    showDownloadIcon: true,
    showReUploadIcon: false,
    downloadPropsIntercept: o => o,
  };

  context: ConfigContextValue;

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

  /**
   * @param {UploadFile} file
   * @param {React.SyntheticEvent<HTMLElement>} e
   */
  handleReUpload = (file: UploadFile, e: React.SyntheticEvent<HTMLElement>) => {
    const { onReUpload } = this.props;
    if (!onReUpload) {
      return;
    }
    e.preventDefault();
    onReUpload(file);
  };

  handleReUploadConfirm = (fileTarget: UploadFile, e: React.SyntheticEvent<HTMLElement>)=>{
    if (fileTarget.status === 'error') {
      this.handleReUpload(fileTarget, e);
    } else if (fileTarget.status && ['success','done','removed'].includes(fileTarget.status)) {
      const { getUploadRef, setReplaceReuploadItem } = this.props;
      const uploadRef = getUploadRef();
      if (uploadRef) {
        const { fileInput } = uploadRef.uploader;
        setReplaceReuploadItem(fileTarget);
        fileInput.click();
      }
    }
  }

  componentDidUpdate() {
    const { listType } = this.props;
    if (listType !== 'picture' && listType !== 'picture-card') {
      return;
    }
    const { items, previewFile } = this.props;
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
      showDownloadIcon,
      showReUploadIcon,
      removePopConfirmTitle,
      reUploadText,
      reUploadPopConfirmTitle,
      locale,
      dragUploadList,
      showFileSize,
      getCustomFilenameTitle,
      downloadPropsIntercept,
      tooltipPrefixCls,
      popconfirmProps,
      renderIcon = defaultRenderIcon,
    } = this.props;
    const { getPrefixCls } = this.context;
    const prefixCls = getPrefixCls('upload', customizePrefixCls);
    const list = items.map((file, index) => {
      let progress;
      let icon = renderIcon(file, listType!, prefixCls);
      const stat = {
        isImg: isImageUrl(file),
        isUploading: file.status === 'uploading',
        isError: file.status === 'error',
        isPictureCard: listType === 'picture-card',
      };
      if (listType === 'picture' || stat.isPictureCard) {
        if (stat.isPictureCard && stat.isUploading) {
          icon = <div className={`${prefixCls}-list-item-uploading-text`}>{locale.uploading}</div>;
        } else if (listType === 'picture' && stat.isUploading) {
          icon = <Progress key='loading' type={ProgressType.loading} size={Size.small} />;
        } else if (!file.thumbUrl && !file.url) {
          icon = <Icon className={`${prefixCls}-list-item-thumbnail`} type="picture" />;
        } else {
          const thumbnail = stat.isImg ? (
            <img src={file.thumbUrl || file.url} alt={file.name} />
          ) : icon;
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

      if (stat.isUploading) {
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
      const message = file.response && typeof file.response === 'string' ? file.response : ((file.error && file.error.statusText) || locale.uploadError);
      const preview = file.url ? (
        <a
          href={file.url}
          {...file.linkProps}
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
      const previewIcon = (
        isFunction(showPreviewIcon)
          ? (showPreviewIcon as UploadListIconFunc)(file)
          : stat.isImg && showPreviewIcon
      ) ? (
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
      let showReUploadIconType: ShowReUploadIconType | undefined;
      if (isFunction(showReUploadIcon)) {
        const customReUploadIcon: boolean | 'text' = (showReUploadIcon as UploadListReUploadIconFunc)(file, listType!);
        showReUploadIconType = customReUploadIcon ? customReUploadIcon === 'text' ? 'text' : 'icon' : undefined;
      } else if (showReUploadIcon) {
        showReUploadIconType = showReUploadIcon === 'text' ? 'text' : 'icon';
      }
      const pictureCardReUploadIconOrText = showReUploadIconType && !stat.isUploading ? (
        <PopConfirm
          {...popconfirmProps}
          title={reUploadPopConfirmTitle || locale.confirmReUpload}
          onConfirm={(e) => {
            this.handleReUploadConfirm(file, e);
          }}
        >
          {showReUploadIconType === 'icon' ? (
            <Icon
              type="file_upload"
              title={reUploadText}
            />
          ) : (
            stat.isError ?
              <Tooltip prefixCls={tooltipPrefixCls} title={message}>
                <span className={`${prefixCls}-list-item-reupload-${listType}`} title={reUploadText}>{locale.reUpload}</span>
              </Tooltip> :
              <span className={`${prefixCls}-list-item-reupload-${listType}`} title={reUploadText}>{locale.reUpload}</span>
          )}
        </PopConfirm>
      ) : null;
      const removeIcon = showRemoveIcon ? (
        <PopConfirm
          {...popconfirmProps}
          title={removePopConfirmTitle || locale.confirmRemove}
          onConfirm={() => {
            this.handleClose(file);
          }}
        >
          <Icon
            type={stat.isPictureCard ? 'delete' : 'close'}
            className={stat.isPictureCard ? `${prefixCls}-list-item-action-remove` : undefined}
            title={locale.removeFile}
          />
        </PopConfirm>
      ) : null;
      const downloadLinkProps: any = {
        ...file.linkProps,
        rel: 'noopener noreferrer',
      };
      if (stat.isError) {
        downloadLinkProps.style = { color: '#f5222d' };
      }
      if (!(stat.isError || stat.isUploading)) {
        downloadLinkProps.href = file.url || file.thumbUrl;
        downloadLinkProps.target = '_blank';
        if (downloadLinkProps.href) {
          downloadLinkProps.filename = file.name;
        }
      }
      const downloadIcon =
        !stat.isError && !stat.isUploading && (isFunction(showDownloadIcon) ? (showDownloadIcon as UploadListIconFunc)(file) : showDownloadIcon)
        && <a {...downloadPropsIntercept!(downloadLinkProps)} style={style}><Icon type="get_app" /></a>;
      const actionsClass = classNames(`${prefixCls}-list-item-actions`, {
        [`${prefixCls}-list-item-actions-reupload-text`]: showReUploadIconType === 'text' && stat.isError,
      });

      const fileName = (stat.isPictureCard && !stat.isUploading) ? (
        <Tooltip prefixCls={tooltipPrefixCls} title={getCustomFilenameTitle ? getCustomFilenameTitle(file) : file.name} placement="bottom">
          {
            createElement(downloadLinkProps.href ? 'a' : 'span', {
              className: `${prefixCls}-list-item-file-name`,
              ...downloadPropsIntercept!(downloadLinkProps),
            }, file.name)
          }
        </Tooltip>
      ) : null;
      const filesizeStr = getFileSizeStr(file.size);
      const fileSize =
        (showFileSize && filesizeStr !== '' && listType === 'text') ? (
          <span className={`${prefixCls}-list-item-info-filesize`}>
            {filesizeStr}
          </span>
        ) : null;

      const iconAndPreview = stat.isPictureCard ? (
        <span className={`${prefixCls}-list-item-picture-card`}>
          {icon}
        </span>
      ) : <span className={`${prefixCls}-list-item-text`}>{icon}{preview}</span>;

      const iconAndPreviewTooltip =
        stat.isError ? (
          <Tooltip prefixCls={tooltipPrefixCls} title={message}>
            {iconAndPreview}
          </Tooltip>
        ) : (
          iconAndPreview
        );

      const reUpload = showReUploadIconType && (listType === 'text' || listType === 'picture') && !stat.isUploading ? (
        <PopConfirm
          {...popconfirmProps}
          title={reUploadPopConfirmTitle || locale.confirmReUpload}
          onConfirm={(e) => {
            this.handleReUploadConfirm(file, e);
          }}
        >
          <span className={`${prefixCls}-list-item-reupload-${listType}`} title={reUploadText}>{locale.reUpload}</span>
        </PopConfirm>
      ) : null;

      const getActions = ()=>{
        if(!stat.isUploading) {
          if(stat.isPictureCard) {
            return (
              <div className={actionsClass}>
                <span className={`${prefixCls}-reupload-action`}>{pictureCardReUploadIconOrText}</span>
                <span className={`${prefixCls}-other-actions`}>{stat.isError || previewIcon}{downloadIcon}{removeIcon}</span>
              </div>
            )
          }
          return (
            <div className={`${prefixCls}-actions`}>{reUpload}{stat.isError || previewIcon}{downloadIcon}{removeIcon}</div>
          )
        }
        return  <div className={`${prefixCls}-actions`}>{removeIcon}</div>;
      }

      const listItemInfo = (
        <div className={`${prefixCls}-list-item-info`}>
          <span className={`${prefixCls}-list-item-span`}>
            {iconAndPreviewTooltip}
            {fileName}
            {fileSize}
            {getActions()}
          </span>
          <Animate transitionName="fade" component="">
            {progress}
          </Animate>
        </div>
      );
      const infoUploadingClass = classNames({
        [`${prefixCls}-list-item`]: true,
        [`${prefixCls}-list-item-${file.status}`]: true,
        [`${prefixCls}-list-item-error-reupload`]: file.status === 'error' && showReUploadIconType,
        [`${prefixCls}-list-item-done-reupload`]: file.status === 'done' && showReUploadIconType,
      });

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
                {listItemInfo}
              </div>
            )}
          </Draggable>
        );
      }

      return (
        <div className={infoUploadingClass} key={file.uid}>
          {listItemInfo}
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
