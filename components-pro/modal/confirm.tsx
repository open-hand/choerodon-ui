import React, { cloneElement, isValidElement, ReactNode } from 'react';
import noop from 'lodash/noop';
import ModalManager from '../modal-manager';
import { ModalProps } from './Modal';
import { getContainer, open } from '../modal-container/ModalContainer';
import Icon from '../icon';
import { ModalChildrenProps } from './interface';
import { confirmProps, normalizeProps } from './utils';

type ConfirmChildrenProps = {
  prefixCls: string;
  children?: ReactNode;
  iconNode?: ReactNode;
  titleNode?: ReactNode;
  type?: string;
  modal?: ModalChildrenProps;
};

function ConfirmChildren({
  prefixCls,
  children,
  iconNode,
  titleNode,
  modal,
}: ConfirmChildrenProps) {
  const contentNode = children && (
    <div className={`${prefixCls}-content`}>
      {isValidElement(children) ? cloneElement<any>(children, { modal }) : children}
    </div>
  );

  return (
    <table className={prefixCls}>
      <tbody>
        <tr>
          {iconNode}
          <td>
            {titleNode}
            {contentNode}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default async function confirm(props: ModalProps & confirmProps | ReactNode) {
  const container = await getContainer();
  const {
    children,
    type = 'confirm',
    onOk = noop,
    onCancel = noop,
    onClose = noop,
    iconType,
    border = false,
    okCancel = true,
    title,
    ...otherProps
  } = normalizeProps(props);
  const prefixCls = container.context.getProPrefixCls('confirm');
  const titleNode = title && <div className={`${prefixCls}-title`}>{title}</div>;
  const iconNode = iconType && (
    <td className={`${prefixCls}-icon ${prefixCls}-${type}`}>
      <Icon type={iconType} />
    </td>
  );
  return new Promise(resolve => {
    open({
      key: ModalManager.getKey(),
      className: `${prefixCls}-wrapper ${prefixCls}-wrapper-${type}`,
      border,
      destroyOnClose: true,
      okCancel,
      closable: false,
      movable: false,
      style: { width: '4.16rem' },
      children: (
        <ConfirmChildren prefixCls={prefixCls} iconNode={iconNode} titleNode={titleNode}>
          {children}
        </ConfirmChildren>
      ),
      onOk: async () => {
        const result = await onOk();
        if (result !== false) {
          resolve('ok');
        }
        return result;
      },
      onCancel: async () => {
        const result = await onCancel();
        if (result !== false) {
          resolve('cancel');
        }
        return result;
      },
      onClose: async () => {
        const result = await onClose();
        if (result !== false) {
          resolve('cancel');
        }
        return result;
      },
      ...otherProps,
      resizable: false,
    });
  });
}
