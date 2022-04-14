---
order: 6
title:
  zh-CN: 加载中
  en-US: Loading
---

## zh-CN

加载中的开关。

## en-US

Loading Switch.

````jsx
import { Switch, SelectBox, Row, Col } from 'choerodon-ui/pro';

const { Option } = SelectBox;

function onChange(checked) {
  console.log(`switch to ${checked}`);
}

const App = () => {
  const [loading, setLoading] = React.useState(false);

  return (
    <>
      <p>
        <span>loading：</span>
        <SelectBox
          mode="button"
          value={loading}
          onChange={v => setLoading(v)}
        >
          <Option value={true}>true</Option>
          <Option value={false}>false</Option>
        </SelectBox>
      </p>
      <Switch defaultChecked onChange={onChange} loading={loading} size="small"/>
      <Switch defaultChecked onChange={onChange} loading={loading} size="large" />
      <Switch defaultChecked onChange={onChange} loading={loading} />
      <Switch defaultChecked onChange={onChange} loading={loading} disabled />
      <Switch defaultChecked onChange={onChange} loading={loading} readOnly />
      <Switch unCheckedChildren="关" defaultChecked loading={loading}>开开开开</Switch>
    </>
  );
};

ReactDOM.render(
  <App />,
  mountNode
);
````
