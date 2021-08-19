import React, { FunctionComponent, ReactNode, useCallback, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import classnames from 'classnames';
import { DraggableProvided } from 'react-beautiful-dnd';
import { Size } from 'choerodon-ui/lib/_util/enum';
import { ProgressStatus } from 'choerodon-ui/lib/progress/enum';
import { getConfig } from 'choerodon-ui/lib/configure';
import { getTooltipTheme } from 'choerodon-ui/lib/_util/TooltipUtils';
import Progress from '../progress';
import Icon from '../icon';
import AttachmentFile from '../data-set/AttachmentFile';
import { AttachmentListType } from './Attachment';
import Picture from '../picture/Picture';
import Button from '../button/Button';
import { FuncType } from '../button/enum';
import { hide, show } from '../tooltip/singleton';
import { formatFileSize } from './utils';

export interface ItemProps {
  attachment: AttachmentFile;
  onUpload: (attachment: AttachmentFile, attachmentUUID: string) => void;
  onRemove: (attachment: AttachmentFile) => void;
  readOnly?: boolean;
  isCard?: boolean;
  prefixCls?: string;
  pictureWidth?: number;
  restCount?: number;
  index?: number;
  listType?: AttachmentListType;
  bucketName?: string;
  bucketDirectory?: string;
  attachmentUUID: string;
  provided: DraggableProvided;
  draggable?: boolean;
  hidden?: boolean;
}

const Item: FunctionComponent<ItemProps> = observer(function Item(props) {
  const {
    attachment, listType, prefixCls, onUpload, onRemove, pictureWidth: width, bucketName,
    bucketDirectory, attachmentUUID, isCard, provided, readOnly, restCount, draggable, index, hidden,
  } = props;
  const { status, name, filename, ext, url, size } = attachment;
  const attachmentConfig = getConfig('attachment');
  const tooltipRef = useRef<boolean>(false);
  const renderImagePreview = (): ReactNode => {
    if (listType === 'text') {
      const { renderIcon } = attachmentConfig;
      return (
        renderIcon ? renderIcon(attachment, listType) : <Icon type="insert_drive_file" />
      );
    }
    if (listType === 'picture' || isCard) {
      if ((status === 'success' || status === 'done') && attachment.type.startsWith('image')) {
        const { getPreviewUrl } = attachmentConfig;
        return (
          <Picture
            width={width}
            height={width}
            alt={name}
            src={getPreviewUrl && getPreviewUrl({ attachment, bucketName, bucketDirectory, attachmentUUID }) || url}
            lazy
            objectFit="contain"
            index={index}
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
    return (
      <span className={`${prefixCls}-title`} style={isCardTitle ? { width } : undefined}>
        <span className={`${prefixCls}-name`}>{filename}</span>
        {ext && <span className={`${prefixCls}-ext`}>.{ext}</span>}
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
    if (!readOnly && status === 'error' && !attachment.invalid) {
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
      const { getDownloadUrl } = attachmentConfig;
      const downProps = {
        key: 'download',
        icon: isCard ? 'arrow_downward' : 'get_app',
        funcType: FuncType.link,
        href: getDownloadUrl && getDownloadUrl({ attachment, bucketName, bucketDirectory, attachmentUUID }) || url,
        target: '_blank',
        block: isCard,
      };
      buttons.push(<Button {...downProps} />);
    }
    if (!readOnly && status !== 'uploading') {
      const rmProps = {
        key: 'remove',
        icon: isCard ? 'delete_forever-o' : 'close',
        onClick: () => onRemove(attachment),
        funcType: FuncType.link,
        block: isCard,
      };
      buttons.push(<Button {...rmProps} />);
    }
    if (buttons.length) {
      return (
        <div className={`${prefixCls}-buttons`}>
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
      });
      tooltipRef.current = true;
    }
  }, [errorMessageNode, tooltipRef]);
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

  const { dragHandleProps } = provided;

  const listProps = {
    ref: provided.innerRef,
    className: classnames(prefixCls, {
      [`${prefixCls}-error`]: status === 'error',
      [`${prefixCls}-success`]: status === 'success',
    }),
    ...dragHandleProps,
    ...provided.draggableProps,
    style: {
      ...provided.draggableProps.style,
      ...(draggable ? { cursor: 'move' } : undefined),
    },
  };

  return (
    <div {...listProps} hidden={hidden}>
      <div className={`${prefixCls}-container`} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <div className={`${prefixCls}-content`}>
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
});

Item.displayName = 'Item';

export default Item;
