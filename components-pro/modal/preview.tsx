import React from 'react';
import { getProPrefixCls } from 'choerodon-ui/lib/configure';
import ModalManager from '../modal-manager';
import { open } from '../modal-container/ModalContainer';
import PictureViewer, { PictureViewerProps } from '../picture/PictureViewer';
import { ModalProps } from './Modal';

export default function preview(props: PictureViewerProps, modalProps?: ModalProps) {
  const customizedPrefixCls = getProPrefixCls('picture-viewer', props.prefixCls);
  open({
    key: ModalManager.getKey(),
    className: `${customizedPrefixCls}-modal`,
    border: false,
    header: null,
    footer: null,
    destroyOnClose: true,
    movable: false,
    closable: true,
    style: { width: 'auto' },
    fullScreen: true,
    maskClassName: `${customizedPrefixCls}-modal-mask`,
    children: (
      <PictureViewer prefixCls={customizedPrefixCls} {...props} />
    ),
    ...modalProps,
  });
}
