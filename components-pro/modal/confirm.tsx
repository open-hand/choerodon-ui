import React from 'react';
import noop from 'lodash/noop';
import { getProPrefixCls } from 'choerodon-ui/lib/configure';
import { ModalProps } from './Modal';
import { getKey, open } from '../modal-container/ModalContainer';
import Icon from '../icon';
import { $l } from '../locale-context';
import { normalizeProps } from './utils';

export default function confirm(props: ModalProps & { iconType?: string, type?: string, children } | string) {
  props = normalizeProps(props);
  const {
    children, type = 'confirm', onOk = noop, onCancel = noop,
    iconType = 'error', header = false, border = false, okCancel = true, ...otherProps,
  } = props;
  const prefixCls = getProPrefixCls('confirm');
  return new Promise((resolve) => {
    open({
      key: getKey(),
      title: $l('Modal', 'confirm_modal_title'),
      header,
      border,
      destroyOnClose: true,
      okCancel,
      closable: false,
      movable: false,
      style: { width: '4rem' },
      children: (
        <table className={prefixCls}>
          <tbody>
          <tr>
            <td className={`${prefixCls}-icon ${prefixCls}-${type}`}>
              <Icon type={iconType} />
            </td>
            <td>{children}</td>
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
