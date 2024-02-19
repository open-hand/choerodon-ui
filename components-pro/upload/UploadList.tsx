import React, { ReactNode } from 'react';
import classnames from 'classnames';
import { getFileType } from 'choerodon-ui/lib/upload/utils';
import CompressedfileIcon from 'choerodon-ui/lib/upload/icon-svg/compressedfileIcon';
import DocIcon from 'choerodon-ui/lib/upload/icon-svg/docIcon';
import FileuploadIcon from 'choerodon-ui/lib/upload/icon-svg/fileuploadIcon';
import PdfIcon from 'choerodon-ui/lib/upload/icon-svg/pdfIcon';
import XlsIcon from 'choerodon-ui/lib/upload/icon-svg/xlsIcon';
import { FormField, FormFieldProps } from '../field/FormField';
import Icon from '../icon';
import Progress from '../progress';
import { Size } from '../core/enum';
import { UploadFile } from './interface';
import autobind from '../_util/autobind';

export interface UploadListProps extends FormFieldProps {
  items: UploadFile[];
  showPreviewImage: boolean;
  previewImageWidth: number;
  previewImageRenderer?: (file: UploadFile) => React.ReactNode;
  remove: (file: UploadFile) => void;
}

export default class UploadList extends FormField<UploadListProps> {
  static displayName = 'UploadList';

  static defaultProps = {
    ...FormField.defaultProps,
    suffixCls: 'upload-list',
    items: [],
  };

  @autobind
  previewImageRenderer(file: UploadFile): ReactNode {
    let previewImg: ReactNode;
    const { prefixCls, props: { showPreviewImage, previewImageWidth } } = this;
    if (showPreviewImage && file.type.startsWith('image')) {
      // temporarily set img[width] to 100
      previewImg = <img width={previewImageWidth} alt={file.filename} src={file.url} />;
    } else {
      const filetype = getFileType(file.name);
      switch (filetype) {
        case 'compressedfile':
          previewImg = <CompressedfileIcon style={{width: previewImageWidth}} className={`${prefixCls}-icon-file`} />;
          break;
        case 'doc':
          previewImg = <DocIcon style={{width: previewImageWidth}} className={`${prefixCls}-icon-file`} />;
          break;
        case 'pdf':
          previewImg = <PdfIcon style={{width: previewImageWidth}} className={`${prefixCls}-icon-file`} />;
          break;
        case 'xls':
          previewImg = <XlsIcon style={{width: previewImageWidth}} className={`${prefixCls}-icon-file`} />;
          break;
        default:
          previewImg = <FileuploadIcon style={{width: previewImageWidth}} className={`${prefixCls}-icon-file`} />;
      }
    }
    return previewImg;
  }

  render() {
    const {
      prefixCls,
      props: {
        items,
        remove,
        showPreviewImage,
        previewImageRenderer = this.previewImageRenderer,
      },
    } = this;

    const list = items.map(file => {
      let progress;
      let removeIcon;
      const progressProps = {
        value: file.percent,
        size: Size.small,
        showInfo: false,
      };
      const previewImg = showPreviewImage ? previewImageRenderer(file) : null;
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
