import React from 'react';
import ReactDOM from 'react-dom';
import { getConfig } from 'choerodon-ui';
import { DataSet, IntlField } from 'choerodon-ui/pro';

class App extends React.Component {
  hadSetValidation = false;

  ds = new DataSet({
    primaryKey: 'pk',
    data: [{ 'first-name': '吴' }],
    tlsUrl: '/dataset/user/languages',
    fields: [
      {
        name: 'first-name',
        type: 'intl',
        defaultValue: 'Huazhen',
        required: true,
      },
    ],
  });

  beforeOpen = () => {
    if (!this.hadSetValidation) {
      const tlsKey = getConfig('tlsKey');
      const fieldName = 'first-name';
      const languageKeys = ['en_GB', 'en_US'];
      languageKeys.forEach((languageKey) => {
        // 获取对应语言的字段，如: __tls.first-name.en_GB
        const field = this.ds.getField(`${tlsKey}.${fieldName}.${languageKey}`);
        if (field) {
          // 设置字段相关属性, 必填: required
          field.set('required', true);
        }
      });
      const fieldCN = this.ds.getField(`${tlsKey}.${fieldName}.zh_CN`);
      if (fieldCN) {
        // 设置字段相关属性, 校验器: validator
        fieldCN.set('validator', (value, name, record) => {
          if (!value || value.length < 2) {
            return '请正确填写内容';
          }
          return true;
        });
      }
      // 字段属性只设置一次
      this.hadSetValidation = true;
    }
  };

  render() {
    return (
      <IntlField
        dataSet={this.ds}
        name="first-name"
        modalProps={{ beforeOpen: this.beforeOpen }}
      />
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
