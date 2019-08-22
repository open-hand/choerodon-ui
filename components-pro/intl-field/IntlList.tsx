import React, { Component } from 'react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import { getConfig } from 'choerodon-ui/lib/configure';
import TextField from '../text-field/TextField';
import Form from '../form/Form';
import localeContext from '../locale-context';
import Record from '../data-set/Record';
import { Lang } from '../locale-context/enum';

export interface IntlListProps {
  record?: Record;
  name?: string;
  lang: Lang;
}

@observer
export default class IntlList extends Component<IntlListProps> {

  static propTypes = {
    record: PropTypes.object,
    name: PropTypes.string,
    lang: PropTypes.string,
  };

  renderOptions() {
    const { name, lang } = this.props;
    const { supports } = localeContext;
    const tlsKey = getConfig('tlsKey');
    return Object.keys(supports).map(key => (
      <TextField
        name={name ? `${tlsKey}.${name}.${key}` : key}
        autoFocus={key === lang}
        key={key}
      />
    ));
  }

  render() {
    const { record } = this.props;
    return (
      <Form record={record}>
        {this.renderOptions()}
      </Form>
    );
  }
}
