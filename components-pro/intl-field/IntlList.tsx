import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Config, ConfigKeys, DefaultConfig } from 'choerodon-ui/lib/configure';
import ObserverTextField from '../text-field/TextField';
import TextArea from '../text-area/TextArea';
import { ResizeType } from '../text-area/enum';
import { IntlType } from './enum';
import Form from '../form/Form';
import localeContext from '../locale-context';
import Record from '../data-set/Record';
import { Lang } from '../locale-context/enum';

export interface IntlListProps {
  record?: Record;
  name?: string;
  lang: Lang;
  maxLengths?: object;
  disabled?: boolean;
  readOnly?: boolean;
  type?: IntlType;
  rows?: number;
  cols?: number;
  resize?: ResizeType;

  getConfig<T extends ConfigKeys>(key: T): T extends keyof DefaultConfig ? DefaultConfig[T] : Config[T];
}

@observer
export default class IntlList extends Component<IntlListProps> {
  renderOptions() {
    const { name, lang, maxLengths, type, rows, cols, resize, getConfig } = this.props;
    const { supports } = localeContext;
    const tlsKey = getConfig('tlsKey');
    const FieldTag = type === IntlType.multipleLine ? TextArea : ObserverTextField;
    const otherProps = type === IntlType.multipleLine ? { rows, cols, resize } : {};
    const supportsArr = Object.keys(supports)
    const index = supportsArr.indexOf(lang);
    if (index !== -1) {
      if (index !== 0) {
        supportsArr.splice(index, 1); 
        supportsArr.unshift(lang);
      }
    } else {
      supportsArr.unshift(lang);
    }
    return supportsArr.map(key => {
      const maxLengthProps = maxLengths && maxLengths[key] ? { maxLength: maxLengths[key] } : {};
      return (
        <FieldTag
          {...maxLengthProps}
          name={name ? `${tlsKey}.${name}.${key}` : key}
          autoFocus={key === lang}
          key={key}
          {...otherProps}
        />
      );
    });
  }

  render() {
    const { record, disabled, readOnly } = this.props;
    return <Form disabled={disabled} readOnly={readOnly} record={record}>{this.renderOptions()}</Form>;
  }
}
