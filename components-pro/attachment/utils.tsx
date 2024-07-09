import React, { ReactNode } from 'react';
import { Field, Utils } from 'choerodon-ui/dataset';
import omit from 'lodash/omit';
import AttachmentFile from '../data-set/AttachmentFile';
import { Sort } from './Attachment';
import DataSet from '../data-set';
import Form, { FormProps } from '../form/Form';
import { ModalProps } from '../modal/interface';
import { ModalContextValue } from '../modal-provider/ModalContext';
import { Fields } from '../data-set/Field';
import { getEditorByField } from '../table/utils';
import { FieldIgnore } from '../data-set/enum';
import { $l } from '../locale-context';

const formatFileSize: typeof Utils.formatFileSize = Utils.formatFileSize;

export {
  formatFileSize,
};

export function sortAttachments(attachments: AttachmentFile[] | undefined, sort: Sort, orderField?: string): AttachmentFile[] | undefined {
  if (attachments) {
    if (!sort.custom) {
      const { type, order } = sort;
      return attachments.sort((a, b) => {
        if (type === 'name') {
          if (order === 'desc') {
            return b.name.localeCompare(a.name);
          }
          return a.name.localeCompare(b.name);
        }
        if (order === 'desc') {
          return b.creationDate.getTime() - a.creationDate.getTime();
        }
        return a.creationDate.getTime() - b.creationDate.getTime();
      });
    }
    if (sort.custom && orderField) {
      const { order } = sort;
      if (order === 'desc') {
        return attachments.sort((a, b) => b[orderField] - a[orderField]);
      }
      return attachments.sort((a, b) => a[orderField] - b[orderField]);
    }
    return attachments;
  }
}

/**
 * 打开密级弹框
 * @param options { dataSet: 密级数据源; Modal: 密级弹框上下文; formProps: 表单配置; modalProps: 模态框配置 }
 * @returns Promise<false | object>: 点击取消 resolve(false) 关闭弹框并终止上传; 点击确定，密级数据源校验通过后 resolve(object), 将 object 加入上传请求头中
 */
export function getSecretLevelModal(options: { dataSet: DataSet, Modal: ModalContextValue, formProps?: FormProps, modalProps?: ModalProps }): Promise<false | object> {
  const { dataSet, Modal, formProps = {}, modalProps = {} } = options;
  const items: ReactNode[] = [];
  dataSet.fields.forEach((field, name) => {
    if (!field.get('bind')) {
      // eslint-disable-next-line react/no-array-index-key
      const editor = React.cloneElement(getEditorByField(field), { name, key: name });
      items.push(editor);
    }
  });
  return new Promise((resolve) => {
    Modal.open({
      title: $l('Attachment', 'secret_level_modal_title'),
      children: (
        <Form dataSet={dataSet} {...formProps}>
          {items}
        </Form>
      ),
      onOk: async () => {
        if (await dataSet?.current?.validate()) {
          resolve(omit(dataSet?.current?.toData(), getSecretLevelIgnoreKeys(dataSet.fields)));
          dataSet?.reset();
        } else {
          return false;
        }
      },
      onCancel: () => {
        dataSet?.reset();
        resolve(false);
      },
      ...modalProps,
    });
  });
}

/**
 * 获取不需要提交的密级配置字段名数组
 * @param fields Fields
 * @returns string[]
 */
export const getSecretLevelIgnoreKeys = (fields: Fields): string[] => {
  const keys = ['__dirty'];
  fields.forEach((field: Field, name: string) => {
    if (field.get('ignore') === FieldIgnore.always) {
      keys.push(name);
    }
  });
  return keys;
};
