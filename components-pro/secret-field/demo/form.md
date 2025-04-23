---
order: 0
title:
  zh-CN: 表单使用
  en-US: Form Usage
---

## zh-CN

表单使用

## en-US

```jsx
import { Row, Col, configure } from 'choerodon-ui';
import { DataSet, SecretField, Form, Axios } from 'choerodon-ui/pro';

configure({
  secretFieldFetchVerifyCode() {
    return Promise.resolve({
      captcha: null,
      captchaKey: 'ff62f4b0bcbc440d981fb1145beb9089',
      lastCheckKey: null,
      message: '短信验证码已发送至手机:185*****331，请在5分钟内完成验证',
      code: 'captcha.send.phone',
      interval: 60,
      errorTimes: 0,
      surplusTimes: 0,
      messageParams: null,
      success: true,
    });
  },
  secretFieldTypes() {
    const type = [
      { type: 'phone', name: '电话', value: '110' },
      { type: 'email', name: '邮箱', value: '100@gmail.com' },
    ];
    return type;
  },
  secretFieldEnable() {
    return true;
  },
  secretFieldQueryData(params) {
    return Axios.get(`/secretField/queryField`).then(res => {
      let value = res[params.fieldName];
      if (params.fieldName === 'secretField' || params.fieldName === 'secretField1') {
        res[params.fieldName].map(item => {
          if (item._token === params._token) {
            value = item[params.fieldName];
          }
          return value;
        });
      }
      return value;
    });
  },
  secretFieldSaveData(params) {
    return Promise.resolve(params.value);
  },
});

const App = () => {
  const ds = React.useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'phone',
            type: 'string',
            label: '手机号',
            pattern: /^1[3-9]\d{9}$/,
          },
          {
            name: 'bankCard',
            type: 'string',
            label: '银行卡号',
            restrict: 'a-zA-Z0-9-@._,',
          },
          {
            name: 'idCard',
            type: 'string',
            label: '身份证',
            readOnly: true,
          },
        ],
        data: [
          { phone: '153*****560', bankCard: '123*****456', idCard: '322*****001', _token: '111' },
        ],
      }),
    [],
  );

  return (
    <Form dataSet={ds}>
      <SecretField name="phone" />
      <SecretField name="bankCard" />
      <SecretField name="bankCard" disabled />
      <SecretField name="idCard" />
    </Form>
  );
};

ReactDOM.render(<App />, mountNode);
```
