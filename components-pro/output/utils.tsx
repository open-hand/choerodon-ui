import React, { FunctionComponent, useContext } from 'react';
import isNil from 'lodash/isNil';
import ConfigContext from 'choerodon-ui/lib/config-provider/ConfigContext';
import { RenderProps } from '../field/FormField';
import { BooleanValue, FieldType } from '../data-set/enum';
import Attachment from '../attachment/Attachment';
import { FuncType } from '../button/enum';
import { defaultRenderer } from '../field/utils';
import { ShowHelp } from '../field/enum';
import IntlField from '../intl-field/IntlField';

interface SimpleCheckBoxProps {
  checked: boolean;
}

const SimpleCheckBox: FunctionComponent<SimpleCheckBoxProps> = function (props) {
  const { checked } = props;
  const { getProPrefixCls } = useContext(ConfigContext);
  const checkBoxPrefix = getProPrefixCls('checkbox');
  return (
    <label className={`${checkBoxPrefix}-wrapper ${checkBoxPrefix}-disabled`}>
      <input disabled className={checkBoxPrefix} type="checkbox" checked={checked} />
      <i className={`${checkBoxPrefix}-inner`} />
    </label>
  );
};

SimpleCheckBox.displayName = 'SimpleCheckBox';

export function defaultOutputRenderer(renderOption: RenderProps) {
  const { value, name, record, readOnly: optionReadOnly } = renderOption;
  if (record) {
    const field = record.dataSet.getField(name);
    if (field) {
      if (field.get('type', record) === FieldType.boolean) {
        const checked = value === field.get(BooleanValue.trueValue, record);
        return (
          <SimpleCheckBox checked={checked} />
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
            showHelp={ShowHelp.none}
          />
        );
      }
      if (field.get('type', record) === FieldType.intl && !isNil(value) && value !== '' && optionReadOnly) {
        return (
          <IntlField
            record={record}
            name={name}
            showHelp={ShowHelp.none}
            displayOutput
          />
        );
      }
    }
  }
  return defaultRenderer(renderOption);
}
