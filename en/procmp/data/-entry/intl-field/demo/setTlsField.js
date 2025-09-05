import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, IntlField, Form, Button } from 'choerodon-ui/pro';

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'first-name',
        type: 'intl',
        required: true,
        label: 'First Name',
      },
      {
        name: 'last-name',
        type: 'intl',
        required: true,
        label: 'Last Name',
      },
      {
        name: 'description',
        type: 'intl',
        label: 'Description',
      },
    ],
  });

  handleSetTls = () => {
    this.ds.current.set({
      'first-name': '弗兰克',
      'last-name': '加拉格',
      __tls: {
        'first-name': {
          zh_CN: '弗兰克',
          en_US: 'Frank',
          en_GB: 'Frank',
        },
        'last-name': {
          zh_CN: '加拉格',
          en_US: 'Gallagher',
          en_GB: 'Gallagher',
        },
        description: {}, // __tls 应该包含所有多语言字段，如果不需要设置值，也需要保留字段
      },
    });
  };

  render() {
    return (
      <>
        <Form dataSet={this.ds} labelWidth={100} columns={3}>
          <IntlField name="first-name" />
          <IntlField name="last-name" />
          <IntlField name="description" />
        </Form>
        <Button onClick={this.handleSetTls}>点击设置多语言</Button>
      </>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
