import React, { ReactNode } from 'react';
import noop from 'lodash/noop';
import { getProPrefixCls } from 'choerodon-ui/lib/configure';
import { ModalProps } from './Modal';
import { getKey, open } from '../modal-container/ModalContainer';
import Icon from '../icon';
import { confirmProps, normalizeProps } from './utils';

export default function confirm(props: ModalProps & confirmProps | ReactNode) {
  const {
    children,
    type = 'confirm',
    onOk = noop,
    onCancel = noop,
    iconType,
    border = false,
    okCancel = true,
    title,
    ...otherProps
  } = normalizeProps(props);
  const prefixCls = getProPrefixCls('confirm');
  const titleNode = title && <div className={`${prefixCls}-title`}>{title}</div>;
  const contentNode = children && <div className={`${prefixCls}-content`}>{children}</div>;
  const iconNode = iconType && (
    <td className={`${prefixCls}-icon ${prefixCls}-${type}`}>
      <Icon type={iconType} />
    </td>
  );
  return new Promise(resolve => {
    open({
      key: getKey(),
      border,
      destroyOnClose: true,
      okCancel,
      closable: false,
      movable: false,
      style: { width: '4.16rem' },
      children: (
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
      ...otherProps,
    });
  });
}
