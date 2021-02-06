import React, { Component } from 'react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { getConfig } from 'choerodon-ui/lib/configure';
import ObserverTextField from '../text-field/TextField';
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
}

@observer
export default class IntlList extends Component<IntlListProps> {
  static propTypes = {
    record: PropTypes.object,
    name: PropTypes.string,
    lang: PropTypes.string,
    maxLengths: PropTypes.object,
  };

  renderOptions() {
    const { name, lang, maxLengths } = this.props;
    const { supports } = localeContext;
    const tlsKey = getConfig('tlsKey');
    return Object.keys(supports).map(key => {
      const maxLengthProps = maxLengths && maxLengths[key] ? { maxLength: maxLengths[key] } : {};
      return (
        <ObserverTextField
          {...maxLengthProps}
          name={name ? `${tlsKey}.${name}.${key}` : key}
          autoFocus={key === lang}
          key={key}
        />
      );
    });
  }

  render() {
    const { record, disabled, readOnly } = this.props;
    return <Form disabled={disabled} readOnly={readOnly} record={record}>{this.renderOptions()}</Form>;
  }
}
