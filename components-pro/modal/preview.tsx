import React from 'react';
import ModalManager from '../modal-manager';
import { getContainer, open } from '../modal-container/ModalContainer';
import PictureViewer, { PictureViewerProps } from '../picture/PictureViewer';
import { ModalProps } from './Modal';

export default async function preview(props: PictureViewerProps, modalProps?: ModalProps) {
  const container = await getContainer();
  const customizedPrefixCls = container.context.getProPrefixCls('picture-viewer', props.prefixCls);
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
