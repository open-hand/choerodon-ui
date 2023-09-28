---
order: 4
title:
  zh-CN: 设置多语言字段校验属性
  en-US: Set the multilingual field verification property
---

## zh-CN

通过 modalProps 提供的 beforeOpen 回调函数，在打开多语言弹窗前设置多语言字段的校验属性。

## en-US

Set the multilingual field verification property.

```jsx
import { getConfig } from 'choerodon-ui';
import { DataSet, IntlField, Row, Col } from 'choerodon-ui/pro';

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log(
    '[dataset newValue]',
    value,
    '[oldValue]',
    oldValue,
    `[record.get('${name}')]`,
    record.get(name),
  );
}

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
    events: {
      update: handleDataSetChange,
    },
  });

  beforeOpen = () => {
    if (!this.hadSetValidation) {
      const tlsKey = getConfig('tlsKey');
      const fieldName = 'first-name';
      const languageKeys = ['en_GB', 'en_US'];
      languageKeys.forEach(languageKey => {
        // 获取对应语言的字段，如: __tls.first-name.en_GB
        const field = this.ds.getField(`${tlsKey}.${fieldName}.${languageKey}`);
        if (field) {
          // 设置字段相关属性
          field.set('required', true);
        }
      });
      this.hadSetValidation = true;
    }
  }

  render() {
    return (
      <Row gutter={10}>
        <Col span={8}>
          <IntlField dataSet={this.ds} name="first-name" modalProps={{ beforeOpen: this.beforeOpen }} />
        </Col>
      </Row>
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
