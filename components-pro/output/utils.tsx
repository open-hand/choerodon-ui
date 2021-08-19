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
    const field = record.getField(name);
    if (field) {
      if (field.type === FieldType.boolean) {
        const checkBoxPrefix = getProPrefixCls('checkbox');
        return (
          <label className={`${checkBoxPrefix}-wrapper ${checkBoxPrefix}-disabled`}>
            <input disabled className={checkBoxPrefix} type="checkbox" checked={value === field.get(BooleanValue.trueValue)} />
            <i className={`${checkBoxPrefix}-inner`} />
          </label>
        );
      }
      if (field.type === FieldType.attachment) {
        return <Attachment readOnly name={name} viewMode="popup" record={record} funcType={FuncType.link} />;
      }
    }
  }
  return defaultRenderer(renderOption);
}
