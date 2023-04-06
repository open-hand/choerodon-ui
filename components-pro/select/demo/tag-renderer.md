---
order: 17
title:
  zh-CN: 自定义多值渲染
  en-US: Customize Tag render
---

## zh-CN

自定义多值渲染。

## en-US

Customize Tag render.

```jsx
import { Tag } from 'choerodon-ui';
import { Icon, Select, Form, useDataSet } from 'choerodon-ui/pro';

const { Option }  = Select;

const validator = v => {
  if (v === 'wangwu') {
    return '你不能选择王五';
  }
  return true;
}

const App = () => {
  const ds = useDataSet(() => ({
    autoCreate: true,
    fields: [
      { name: 'name', label: '姓名', type: 'string', multiple: true, defaultValue: ['zhangsan', 'lisi', 'xieguangkun'], validator },
      { name: 'name-disabled', label: '姓名(禁用)', type: 'string', disabled: true, multiple: true, defaultValue: ['zhangsan', 'lisi', 'xieguangkun'], validator },
      { name: 'city', label: '城市', type: 'string', multiple: true, defaultValue: ['chengdu', 'chongqing'] },
      { name: 'city-max-tag', label: '城市(maxTagCount)', type: 'string', multiple: true, defaultValue: ['chengdu', 'chongqing', 'beijing', 'shanghai'] },
    ],
  }), []);

  // 使用 Tag 组件渲染
  const nameTagRenderer = React.useCallback(props => {
    // props：值，显示文本，唯一键，只读状态，错误状态，禁用状态，关闭 Tag
    const { value, text, key, readOnly, invalid, disabled, onClose } = props;
    const tagProps = {
      closable: !(readOnly || disabled),
      onClose,
      key,
      style: { margin: '0 0 0 4px' },
    };
    if (value === 'xieguangkun') {
      tagProps.color = 'green-inverse';
    }
    if (disabled) {
      tagProps.color = 'gray-inverse';
    }
    if (invalid) {
      tagProps.color = 'red-inverse';
      console.log('value, invalid:', value, invalid);
    }
    return <Tag {...tagProps}>{text}</Tag>;
  }, []);

  // 结合原始类名做简单样式覆盖
  const cityTagRenderer = React.useCallback(props => {
    const { text, key, readOnly, disabled, onClose, className } = props;
    const closeBtn = <Icon type="close" onClick={onClose} />;
    const showClose = !(readOnly || disabled || key === "maxTagPlaceholder");
    const style = {
      borderRadius: 6,
      minWidth: 48,
      textAlign: 'center',
    };
    return <li key={key} className={className} style={style}>{text}{showClose ? closeBtn : null}</li>;
  }, []);

  return (
    <Form dataSet={ds} useColon>
      <Select name="name" tagRenderer={nameTagRenderer}>
        <Option value="zhangsan">张三</Option>
        <Option value="lisi">李四</Option>
        <Option value="wangwu">王五</Option>
        <Option value="xieguangkun">谢广坤</Option>
      </Select>
      <Select disabled name="name-disabled" tagRenderer={nameTagRenderer}>
        <Option value="zhangsan">张三</Option>
        <Option value="lisi">李四</Option>
        <Option value="wangwu">王五</Option>
        <Option value="xieguangkun">谢广坤</Option>
      </Select>
      <Select name="city" tagRenderer={cityTagRenderer}>
        <Option value="chengdu">成都市</Option>
        <Option value="chongqing">重庆市</Option>
        <Option value="beijing">北京市</Option>
        <Option value="shanghai">上海市</Option>
      </Select>
      <Select name="city-max-tag" maxTagCount={3} tagRenderer={cityTagRenderer}>
        <Option value="chengdu">成都市</Option>
        <Option value="chongqing">重庆市</Option>
        <Option value="beijing">北京市</Option>
        <Option value="shanghai">上海市</Option>
      </Select>
    </Form>
  );
};

ReactDOM.render(<App />, mountNode);
```