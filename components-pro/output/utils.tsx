import React from 'react';
import { getProPrefixCls } from 'choerodon-ui/lib/configure';
import { RenderProps } from '../field/FormField';
import { BooleanValue, FieldType } from '../data-set/enum';
import Attachment from '../attachment/Attachment';
import { FuncType } from '../button/enum';
import { defaultRenderer } from '../field/utils';

export function defaultOutputRenderer(renderOption: RenderProps) {
  const { value, name, record } = renderOption;
  if (record) {
    const field = record.dataSet.getField(name);
    if (field) {
      if (field.get('type', record) === FieldType.boolean) {
        const checkBoxPrefix = getProPrefixCls('checkbox');
        const checked = value === field.get(BooleanValue.trueValue, record);
        return (
          <label className={`${checkBoxPrefix}-wrapper ${checkBoxPrefix}-disabled`}>
            <input disabled className={checkBoxPrefix} type="checkbox" checked={checked} />
            <i className={`${checkBoxPrefix}-inner`} />
          </label>
        );
      }
      if (field.get('type', record) === FieldType.attachment) {
        return (
          <Attachment
            readOnly
            name={name}
            viewMode="popup"
            record={record}
            funcType={FuncType.link}
          />
        );
      }
    }
  }
  return defaultRenderer(renderOption);
}
