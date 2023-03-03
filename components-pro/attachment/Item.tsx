import React, { cloneElement, FunctionComponent, isValidElement, MouseEventHandler, ReactNode, useCallback, useContext, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { isArrayLike } from 'mobx';
import classnames from 'classnames';
import { DraggableProvided } from 'react-beautiful-dnd';
import isString from 'lodash/isString';
import isFunction from 'lodash/isFunction';
import isObject from 'lodash/isObject';
import noop from 'lodash/noop';
import { Size } from 'choerodon-ui/lib/_util/enum';
import { AttachmentConfig } from 'choerodon-ui/lib/configure';
import ConfigContext from 'choerodon-ui/lib/config-provider/ConfigContext';
import { ProgressStatus } from 'choerodon-ui/lib/progress/enum';
import Progress from '../progress/Progress';
import Icon from '../icon';
import AttachmentFile from '../data-set/AttachmentFile';
import { AttachmentButtons, AttachmentButtonType, AttachmentListType } from './Attachment';
import Picture, { PictureForwardRef, PictureProps } from '../picture/Picture';
import Button, { ButtonProps } from '../button/Button';
import { FuncType } from '../button/enum';
import { hide, show } from '../tooltip/singleton';
import { formatFileSize } from './utils';
import Tooltip from '../tooltip/Tooltip';
import { $l } from '../locale-context';
import { TableButtonProps } from '../table/interface';

export const ATTACHMENT_TARGET = 'attachment-preview';

export interface ItemProps {
  attachment: AttachmentFile;
  onUpload: (attachment: AttachmentFile) => void;
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
  showSize?: boolean;
  attachmentUUID?: string;
  provided: DraggableProvided;
  draggable?: boolean;
  hidden?: boolean;
  isPublic?: boolean;
  previewTarget?: string;
  buttons?: AttachmentButtons[];
}

const Item: FunctionComponent<ItemProps> = function Item(props) {
  const {
    attachment, listType, prefixCls, onUpload, onRemove, pictureWidth: width, bucketName, onHistory, onPreview, previewTarget = ATTACHMENT_TARGET,
    bucketDirectory, storageCode, attachmentUUID, isCard, provided, readOnly, restCount, draggable, index, hidden, isPublic, showSize, buttons: fileButtons,
  } = props;
  const { status, name, filename, ext, url, size, type } = attachment;
  const { getConfig, getTooltipTheme, getTooltipPlacement } = useContext(ConfigContext);
  const attachmentConfig: AttachmentConfig = getConfig('attachment');
  const tooltipRef = useRef<boolean>(false);
  const pictureRef = useRef<PictureForwardRef | null>(null);
  const { getPreviewUrl, getDownloadUrl } = attachmentConfig;
  const previewUrl = getPreviewUrl ? getPreviewUrl({ attachment, bucketName, bucketDirectory, storageCode, attachmentUUID, isPublic }) : url;
  const downloadUrl: string | Function | undefined = getDownloadUrl && getDownloadUrl({
    attachment,
    bucketName,
    bucketDirectory,
    storageCode,
    attachmentUUID,
    isPublic,
  });
  const dragProps = { ...provided.dragHandleProps };
  const isPicture = type.startsWith('image') || ['png', 'gif', 'jpg', 'webp', 'jpeg', 'bmp', 'tif', 'pic', 'svg'].includes(ext);
  const preview = !!previewUrl && (status === 'success' || status === 'done');
  const handlePreview = useCallback(() => {
    const { current } = pictureRef;
    if (current) {
      current.preview();
    }
  }, [pictureRef]);
  const handleOpenPreview = useCallback(async () => {
    if (isFunction(previewUrl)) {
      const result = await previewUrl();
      if (isString(result)) {
        window.open(result, previewTarget);
      }
    }
  }, [previewUrl, previewTarget]);
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
      if (isPicture || isSrcIcon) {
        const pictureProps: PictureProps = {};
        if (isString(previewUrl)) {
          pictureProps.previewUrl = previewUrl;
        } else {
          pictureProps.onClick = handleOpenPreview;
        }
        return (
          <Picture
            width={14}
            height={14}
            alt={name}
            downloadUrl={downloadUrl}
            src={isSrcIcon ? icon as string : undefined}
            objectFit="contain"
            status="loaded"
            index={index}
            className={`${prefixCls}-icon`}
            previewTarget={isSrcIcon && !isPicture ? previewTarget : undefined}
            preview={preview}
            onPreview={onPreview}
            ref={pictureRef}
            {...pictureProps}
          >
            {isValidElement(icon) ? icon : undefined}
          </Picture>
        );
      }
      if (preview) {
        const previewButtonProps: ButtonProps = {
          funcType: FuncType.link,
          className: `${prefixCls}-icon`,
        };
        if (isString(previewUrl)) {
          previewButtonProps.href = previewUrl;
          previewButtonProps.target = previewTarget;
        } else {
          previewButtonProps.onClick = handleOpenPreview;
        }
        return (
          <Button {...previewButtonProps}>
            {icon}
          </Button>
        );
      }
      return (
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
            src={isString(previewUrl) ? previewUrl : url}
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
    const nameNode = preview && listType === 'text' ? (
      <a
        {
          ...isPicture ? { onClick: handlePreview } : isString(previewUrl) ? {
            href: previewUrl,
            target: previewTarget,
          } : { onClick: handleOpenPreview }
        }
        className={`${prefixCls}-link`}
      >
        {fileName}
      </a>
    ) : fileName;
    return (
      <span className={`${prefixCls}-title`} style={isCardTitle ? { width } : undefined}>
        {nameNode}
        {!isCardTitle && showSize && <span className={`${prefixCls}-size`}> ({formatFileSize(size)})</span>}
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


  const getButtonProps = (type: AttachmentButtonType)
    : ButtonProps & { onClick: MouseEventHandler<any>; children?: ReactNode } | undefined => {
    const commonProps = {
      className: classnames(`${prefixCls}-icon`),
      funcType: FuncType.link,
      block: isCard,
    }
    switch (type) {
      case AttachmentButtonType.download:
        return {
          ...commonProps,
          icon: isCard ? 'arrow_downward' : 'get_app',
          href: isString(downloadUrl) ? downloadUrl : undefined,
          onClick: isFunction(downloadUrl) ? downloadUrl : noop,
          target: previewTarget,
        }
      case AttachmentButtonType.remove:
        return {
          ...commonProps,
          icon: isCard ? 'delete_forever-o' : 'close',
          onClick: () => onRemove(attachment),
        }
      case AttachmentButtonType.history:
        if (onHistory && attachmentUUID) {
          return {
            ...commonProps,
            icon: 'library_books',
            onClick: () => onHistory(attachment, attachmentUUID),
          }
        }
        return { onClick: noop };
      default:
        break;
    }
  }

  const renderButtons = (): ReactNode => {
    const buttons: ReactNode[] = [];
    if (!readOnly && status === 'error' && !attachment.invalid) {
      const upProps = {
        key: 'upload',
        className: classnames(`${prefixCls}-icon`),
        icon: 'replay',
        onClick: () => onUpload(attachment),
        funcType: FuncType.link,
        block: isCard,
      };
      buttons.push(<Button {...upProps} />);
    }
    
    fileButtons!.forEach(btn => {
      let btnProps: TableButtonProps = {};
      if (isArrayLike(btn)) {
        btnProps = (btn[1] as TableButtonProps) || {};
        btn = btn[0] as AttachmentButtonType;
      }
      if (isString(btn) && btn in AttachmentButtonType) {
        const defaultButtonProps = getButtonProps(btn);
        if (defaultButtonProps) {
          const index = fileButtons!.indexOf(btn);
          switch (btn) {
            case AttachmentButtonType.history:
              if (attachmentUUID && onHistory && (!status || status === 'success' || status === 'done')) {
                buttons.splice(
                  index,
                  1,
                  <Tooltip key={btn} title={$l('Attachment', 'view_operation_records')}>
                    <Button
                      {...defaultButtonProps}
                      {...btnProps}
                    />
                  </Tooltip>,
                );
              }
              break;
            case AttachmentButtonType.download:
              if (downloadUrl && (!status || status === 'success' || status === 'done')) {
                buttons.splice(
                  index,
                  1,
                  <Tooltip key={btn} title={$l('Attachment', 'download')}>
                    <Button
                      {...defaultButtonProps}
                      {...btnProps}
                    />
                  </Tooltip>,
                );
              }
              break;
            case AttachmentButtonType.remove:
              if (attachmentUUID && !readOnly && status !== 'uploading') {
                buttons.splice(
                  index,
                  1,
                  <Tooltip key={btn} title={status === 'deleting' ? undefined : $l('Attachment', 'delete')}>
                    <Button
                      {...defaultButtonProps}
                      {...btnProps}
                    />
                  </Tooltip>,
                );
              }
              break;
            default:
              break;
          }
        }
      } else if (isValidElement<ButtonProps>(btn)) {
        buttons.push(cloneElement(btn, { ...btn.props }));
      } else if (isObject(btn)) {
        buttons.push(<Button {...(btn as TableButtonProps)} />);
      }
    });

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
