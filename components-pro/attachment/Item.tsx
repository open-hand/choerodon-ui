import React, { FunctionComponent, isValidElement, ReactNode, useCallback, useContext, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import classnames from 'classnames';
import { DraggableProvided } from 'react-beautiful-dnd';
import isString from 'lodash/isString';
import { Size } from 'choerodon-ui/lib/_util/enum';
import { AttachmentConfig } from 'choerodon-ui/lib/configure';
import ConfigContext from 'choerodon-ui/lib/config-provider/ConfigContext';
import { ProgressStatus } from 'choerodon-ui/lib/progress/enum';
import Progress from '../progress';
import Icon from '../icon';
import AttachmentFile from '../data-set/AttachmentFile';
import { AttachmentListType } from './Attachment';
import Picture, { PictureForwardRef } from '../picture/Picture';
import Button from '../button/Button';
import { FuncType } from '../button/enum';
import { hide, show } from '../tooltip/singleton';
import { formatFileSize } from './utils';
import Tooltip from '../tooltip/Tooltip';
import { $l } from '../locale-context';

const ATTACHMENT_TARGET = 'attachment-preview';

export interface ItemProps {
  attachment: AttachmentFile;
  onUpload: (attachment: AttachmentFile, attachmentUUID: string) => void;
  onHistory?: (attachment: AttachmentFile, attachmentUUID: string) => void;
  onPreview?: () => void;
  onRemove: (attachment: AttachmentFile) => Promise<any> | undefined;
  readOnly?: boolean;
  isCard?: boolean;
  prefixCls?: string;
  pictureWidth?: number;
  restCount?: number;
  index?: number;
  listType?: AttachmentListType;
  bucketName?: string;
  bucketDirectory?: string;
  storageCode?: string;
  attachmentUUID?: string;
  provided: DraggableProvided;
  draggable?: boolean;
  hidden?: boolean;
}

const Item: FunctionComponent<ItemProps> = function Item(props) {
  const {
    attachment, listType, prefixCls, onUpload, onRemove, pictureWidth: width, bucketName, onHistory, onPreview,
    bucketDirectory, storageCode, attachmentUUID, isCard, provided, readOnly, restCount, draggable, index, hidden,
  } = props;
  const { status, name, filename, ext, url, size, type } = attachment;
  const { getConfig, getTooltipTheme, getTooltipPlacement } = useContext(ConfigContext);
  const attachmentConfig: AttachmentConfig = getConfig('attachment');
  const tooltipRef = useRef<boolean>(false);
  const pictureRef = useRef<PictureForwardRef | null>(null);
  const { getPreviewUrl, getDownloadUrl } = attachmentConfig;
  const src = getPreviewUrl ? getPreviewUrl({ attachment, bucketName, bucketDirectory, storageCode, attachmentUUID }) : url;
  const downloadUrl = getDownloadUrl && getDownloadUrl({ attachment, bucketName, bucketDirectory, storageCode, attachmentUUID });
  const dragProps = { ...provided.dragHandleProps };
  const isPicture = type.startsWith('image') || ['png', 'gif', 'jpg', 'webp', 'jpeg', 'bmp', 'tif', 'pic', 'svg'].includes(ext);
  const preview = (status === 'success' || status === 'done');
  const handlePreview = useCallback(() => {
    const { current } = pictureRef;
    if (current) {
      current.preview();
    }
  }, [pictureRef]);
  const renderDragger = (): ReactNode => {
    if (draggable && !isCard) {
      const iconProps = {
        className: `${prefixCls}-drag-icon`,
        type: 'baseline-drag_indicator',
      };
      if (status !== 'deleting') {
        Object.assign(iconProps, dragProps);
      }
      return (
        <Icon {...iconProps} />
      );
    }
  };
  const renderImagePreview = (): ReactNode => {
    if (listType === 'text') {
      const { renderIcon } = attachmentConfig;
      const defaultIcon = <Icon type="insert_drive_file" />;
      const icon = renderIcon ? renderIcon(attachment, listType, defaultIcon) : defaultIcon;
      const isSrcIcon = isString(icon);
      return isPicture || isSrcIcon ? (
        <Picture
          width={14}
          height={14}
          alt={name}
          previewUrl={src}
          downloadUrl={downloadUrl}
          src={isSrcIcon ? icon as string : undefined}
          objectFit="contain"
          status="loaded"
          index={index}
          className={`${prefixCls}-icon`}
          previewTarget={isSrcIcon && !isPicture ? ATTACHMENT_TARGET : undefined}
          preview={preview}
          onPreview={onPreview}
          ref={pictureRef}
        >
          {isValidElement(icon) ? icon : undefined}
        </Picture>
      ) : preview ? (
        <Button
          href={src}
          target={ATTACHMENT_TARGET}
          funcType={FuncType.link}
          className={`${prefixCls}-icon`}
        >
          {icon}
        </Button>
      ) : (
        <div className={`${prefixCls}-icon`}>
          {icon}
        </div>
      );
    }
    if (isCard || listType === 'picture') {
      if ((preview || status === 'deleting') && isPicture) {
        return (
          <Picture
            width={width}
            height={width}
            alt={name}
            src={src}
            downloadUrl={downloadUrl}
            lazy
            objectFit="contain"
            index={index}
            preview={preview}
          />
        );
      }
      return <Picture width={width} height={width} alt={name} status={status === 'error' ? 'error' : 'empty'} index={index} />;
    }
  };
  const renderPlaceholder = (): ReactNode => {
    if (restCount && isCard) {
      return (
        <div className={`${prefixCls}-placeholder`}>
          +{restCount}
        </div>
      );
    }
  };
  const renderTitle = (isCardTitle?: boolean): ReactNode => {
    const fileName = (
      <>
        <span className={`${prefixCls}-name`}>{filename}</span>
        {ext && <span className={`${prefixCls}-ext`}>.{ext}</span>}
      </>
    );
    const nameNode = preview && src && listType === 'text' ? (
      <a
        {...isPicture ? { onClick: handlePreview } : { href: src, target: ATTACHMENT_TARGET }}
        className={`${prefixCls}-link`}
      >
        {fileName}
      </a>
    ) : fileName;
    return (
      <span className={`${prefixCls}-title`} style={isCardTitle ? { width } : undefined}>
        {nameNode}
        {!isCardTitle && <span className={`${prefixCls}-size`}> ({formatFileSize(size)})</span>}
      </span>
    );
  };
  const renderProgress = (): ReactNode => {
    if (status === 'uploading') {
      return (
        <Progress
          value={attachment.percent || 0}
          size={Size.small}
          showInfo={false}
          strokeWidth={2}
          className={`${prefixCls}-progress`}
          status={ProgressStatus.normal}
        />
      );
    }
  };
  const renderButtons = (): ReactNode => {
    const buttons: ReactNode[] = [];
    if (attachmentUUID && !readOnly && status === 'error' && !attachment.invalid) {
      const upProps = {
        key: 'upload',
        className: classnames(`${prefixCls}-icon`),
        icon: 'replay',
        onClick: () => onUpload(attachment, attachmentUUID),
        funcType: FuncType.link,
        block: isCard,
      };
      buttons.push(<Button {...upProps} />);
    }
    if (!status || status === 'success' || status === 'done') {
      if (attachmentUUID && onHistory) {
        const historyProps = {
          className: classnames(`${prefixCls}-icon`),
          icon: 'library_books',
          onClick: () => onHistory(attachment, attachmentUUID),
          funcType: FuncType.link,
          block: isCard,
        };
        buttons.push(
          <Tooltip key="history" title={$l('Attachment', 'view_operation_records')}>
            <Button {...historyProps} />
          </Tooltip>,
        );
      }
      if (downloadUrl) {
        const downProps = {
          className: classnames(`${prefixCls}-icon`),
          icon: isCard ? 'arrow_downward' : 'get_app',
          funcType: FuncType.link,
          href: downloadUrl,
          target: ATTACHMENT_TARGET,
          block: isCard,
        };
        buttons.push(
          <Tooltip key="download" title={$l('Attachment', 'download')}>
            <Button {...downProps} />
          </Tooltip>,
        );
      }
    }
    if (attachmentUUID && !readOnly && status !== 'uploading') {
      const rmProps = {
        className: classnames(`${prefixCls}-icon`),
        icon: isCard ? 'delete_forever-o' : 'close',
        onClick: () => onRemove(attachment),
        funcType: FuncType.link,
        block: isCard,
      };
      buttons.push(
        <Tooltip key="remove" title={status === 'deleting' ? undefined : $l('Attachment', 'delete')}>
          <Button {...rmProps} />
        </Tooltip>,
      );
    }
    if (buttons.length) {
      return (
        <div className={classnames(`${prefixCls}-buttons`, { [`${prefixCls}-buttons-visible`]: status === 'deleting' })}>
          {buttons}
        </div>
      );
    }
  };
  const renderErrorMessage = (): ReactNode => {
    if (status === 'error') {
      const { errorMessage } = attachment;
      if (errorMessage) {
        return (
          <div className={`${prefixCls}-error-content`}>
            <Icon type="warning" />
            <span className={`${prefixCls}-error-message`}>{errorMessage}</span>
          </div>
        );
      }
    }
  };
  const errorMessageNode = renderErrorMessage();
  const handleMouseEnter = useCallback((e) => {
    if (errorMessageNode) {
      show(e.currentTarget, {
        title: errorMessageNode,
        theme: getTooltipTheme('validation'),
        placement: getTooltipPlacement('validation') || 'bottomLeft',
      });
      tooltipRef.current = true;
    }
  }, [errorMessageNode, getTooltipTheme, getTooltipPlacement, tooltipRef]);
  const handleMouseLeave = useCallback(() => {
    if (tooltipRef.current) {
      hide();
      tooltipRef.current = false;
    }
  }, [tooltipRef]);

  useEffect(() => () => {
    if (tooltipRef.current) {
      hide();
      tooltipRef.current = false;
    }
  }, []);

  const listProps = {
    ref: provided.innerRef,
    className: classnames(prefixCls, {
      [`${prefixCls}-error`]: status === 'error',
      [`${prefixCls}-success`]: status === 'success',
    }),
    ...provided.draggableProps,
    style: {
      ...provided.draggableProps.style,
    },
  };
  if (draggable && isCard) {
    Object.assign(listProps, dragProps);
  }
  return (
    <div {...listProps} hidden={hidden}>
      <div
        className={`${prefixCls}-container`}
        onMouseEnter={isCard ? handleMouseEnter : undefined}
        onMouseLeave={isCard ? handleMouseLeave : undefined}
      >
        <div className={`${prefixCls}-content`}>
          {renderDragger()}
          {renderImagePreview()}
          {renderPlaceholder()}
          {!restCount && !isCard && renderTitle()}
          {!restCount && renderButtons()}
        </div>
        {errorMessageNode}
        {renderProgress()}
      </div>
      {!restCount && isCard && renderTitle(true)}
    </div>
  );
};

Item.displayName = 'Item';

export default observer(Item);
