import React, { Component } from 'react';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import TextField from '../text-field/TextField';
import Form from '../form/Form';
import localeContext from '../locale-context';
import DataSet from '../data-set/DataSet';
import { Lang } from '../locale-context/enum';

export interface IntlListProps {
  dataSet: DataSet;
  name?: string;
  lang: Lang;
}

@observer
export default class IntlList extends Component<IntlListProps> {

  static propTypes = {
    dataSet: PropTypes.object,
    name: PropTypes.string,
    lang: PropTypes.string,
  };

  renderOptions() {
    const { dataSet, name, lang } = this.props;
    const { supports } = localeContext;
    return Object.keys(supports).map(key => (
      <TextField
        dataSet={dataSet}
        name={name ? `${name}.${key}` : key}
        autoFocus={key === lang}
        key={key}
        label={supports[key]}
      />
    ));
  }

  render() {
    return (
      <Form>
        {this.renderOptions()}
      </Form>
    );
  }
}
