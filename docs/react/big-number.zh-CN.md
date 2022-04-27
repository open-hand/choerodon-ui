---
order: 9
title: 大数字
---

`choerodon-ui` 大数字方案， 使用的第三方 bignumber.js 库。具体使用参见官网 [BigNumber](https://mikemcl.github.io/bignumber.js/)


## math 库

```jsx
import { math } from 'choerodon-ui/dataset';

// 0.1 + 0.2 => 0.30000000000000004
math.plus(0.1, 0.2);  // 0.3

// 9007199254740992 + 1 => 9007199254740992
math.plus('9007199254740992', 1);  // BigNumber(9007199254740993)

// 9007199254740993 - 1 => 9007199254740991
math.minus('9007199254740993', 1);  // BigNumber(9007199254740992)

// strict
math.minus(new BigNumber('1234567'), 1);  // 1234566
math.minus(new BigNumber('1234567'), 1, { strict: true });  // BigNumber(1234566)

```

## 数字组件大数字的应用

choerodon-ui 的数字组件支持大数字显示， value 允许传递字符串或 BigNumber 对象， onChange钩子参数值可能是数字也可能是大数字, 为了便捷后续的运算， 请使用 choerodon-ui 的 math 库。

```jsx
import { NumberField } from 'choerodon-ui/pro';
import BigNumber from 'bignumber.js';

function handleChange(value: number | BigNumber) {

}

return (
  <Form>
    <NumberField label="支持传字符串" value="123456789.123456789" onChange={handleChange}  />
    <NumberField label="支持传BigNumber对象" value={new BigNumber('123456789.123456789')} onChange={handleChange}  />
  </Form>
);
```

## FieldType.bigNumber

choerodon-ui 的 DataSet 的字段提供了 bigNumber 类型。
普通的 number 字段类型数字组件的输入会根据数字是否溢出自动在 number 和 BigNumber 之间转换, 而 bigNumber 字段类型的数据始终是 BigNumber 对象。

```jsx
import { DataSet } from 'choerodon-ui/pro';

const ds = new DataSet({
    autoCreate: true,
    fields: [
      { 
        name: 'age',
        type: 'number',
        step: 2,
        required: true,
        max: '12345678901234567890123456',
        min: '-12345678901234567890123456',
        defaultValue: '123456789012345678',
      },
      { 
        name: 'big',
        type: 'bigNumber',
        step: 2,
        required: true,
        max: '12345678901234567890123456',
        min: '-12345678901234567890123456',
        defaultValue: '123456789012345678',
      },
    ],
  });

ds.current.get('age'); // BigNumber(123456789012345678)
ds.current.get('big'); // BigNumber(123456789012345678)

```

## 数据远程交互

数据远程交互现在主流是以 json 的格式进行交互， 系统内置的 JSON 库对 json 字符串进行解析时如遇大数字的数据，其精度会丢失。
因此有两种方案：

1. 交互的过程中将大数字类型转换为字符串， DataSet 默认也是这么做的。此方式需要改后端的接口， 因此不推荐。

2. 使用 json-bigint 库进行 json 的解析和字符串化。该库会自动将 json 中的大数字转换成 BigNumber 对象， 反之会将 BigNumber 对象转换成大数字。

注意： json-bigint v1.0.0 版本转换的对象有原型链丢失的[issue](https://github.com/sidorares/json-bigint/issues/39),  在该issue修复前请使用 v0.4.0 版本。

###个例使用：
```
import JSONBig from 'json-bigint';

// axios
axios.post(url, {
  data: {
    amount: new BigNumber('123456789.123456789')
  },
  transformRequest(data) {
    return JSONBig.stringify(data);
  },
  transformResponse(res) {
    return JSONBig.parse(res);
  }
});

// fetch
fetch(url, {
  method: 'POST',
  body: JSONBig.stringify({
    amount: new BigNumber('123456789.123456789')
  }),
}).then(res => res.text().then(text => JSONBig.parse(text)));

// ds
new DataSet({
  transport: {
    read: {
      transformRequest(data) {
        return JSONBig.stringify(data);
      },
      transformResponse(res) {
        return JSONBig.parse(res);
      }
    }
  }
})

```

###全局替换：

```
import JSONBig from 'json-bigint';

window.$JSON = window.JSON;
window.JSON = JSONBig;

// 兼容 fetch
if (typeof Response !== 'undefined') {
  Response.prototype.json = function json() {
    return this.text().then(text => JSON.parse(text))
  }
}

```
