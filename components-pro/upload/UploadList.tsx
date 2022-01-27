import React from 'react';
import classnames from 'classnames';
import { FormField, FormFieldProps } from '../field/FormField';
import Icon from '../icon';
import Progress from '../progress';
import { Size } from '../core/enum';
import { UploadFile } from './interface';

export interface UploadListProps extends FormFieldProps {
  items: UploadFile[];
  showPreviewImage: boolean;
  previewImageWidth: number;
  remove: (file: UploadFile) => void;
}

export default class UploadList extends FormField<UploadListProps> {
  static displayName = 'UploadList';

  static defaultProps = {
    ...FormField.defaultProps,
    suffixCls: 'upload-list',
    items: [],
  };

  render() {
    const {
      prefixCls,
      props: {
        items,
        remove,
        showPreviewImage,
        previewImageWidth,
      },
    } = this;

    const list = items.map(file => {
      let previewImg: any;
      let progress;
      let removeIcon;
      const progressProps = {
        value: file.percent,
        size: Size.small,
        showInfo: false,
      };
      if (showPreviewImage && file.type.startsWith('image')) {
        // temporarily set img[width] to 100
        previewImg = <img width={previewImageWidth} alt={file.filename} src={file.url} />;
      }
      if (file.status === 'uploading') {
        progress = (
          <div className={`${prefixCls}-item-progress`}>
            <Progress {...progressProps} />
          </div>);
      } else {
        const rmProps = {
          className: classnames(`${prefixCls}-item-icon`, {
            [`${prefixCls}-item-remove`]: true,
          }),
          type: 'close',
          onClick: () => {
            remove(file);
          },
        };
        removeIcon = <Icon {...rmProps} />;
      }
      const listProps = {
        className: classnames(`${prefixCls}-item`, {
          [`${prefixCls}-item-error`]: file.status === 'error',
          [`${prefixCls}-item-success`]: file.status === 'success',
        }),
      };

      return (
        <div {...listProps} key={file.uid}>
          {previewImg}
          <span className={`${prefixCls}-item-name`}>{file.name}</span>
          {progress}
          {removeIcon}
        </div>
      );
    });

    const listWrapperCls = items.length ? `${prefixCls}` : `${prefixCls}-empty`;

    return (
      <div className={listWrapperCls}>
        {list}
      </div>
    );
  }
}
