import React from 'react';
import ReactDOM from 'react-dom';
import { Switch, SelectBox } from 'choerodon-ui/pro';

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
          onChange={(v) => setLoading(v)}
        >
          <Option value>true</Option>
          <Option value={false}>false</Option>
        </SelectBox>
      </p>
      <Switch
        style={{ marginRight: 20 }}
        defaultChecked
        onChange={onChange}
        loading={loading}
        size="small"
      />
      <Switch
        style={{ marginRight: 20 }}
        defaultChecked
        onChange={onChange}
        loading={loading}
        size="large"
      />
      <Switch
        style={{ marginRight: 20 }}
        defaultChecked
        onChange={onChange}
        loading={loading}
      />
      <Switch
        style={{ marginRight: 20 }}
        defaultChecked
        onChange={onChange}
        loading={loading}
        disabled
      />
      <Switch
        style={{ marginRight: 20 }}
        defaultChecked
        onChange={onChange}
        loading={loading}
        readOnly
      />
      <Switch
        style={{ marginRight: 20 }}
        unCheckedChildren="关"
        defaultChecked
        loading={loading}
      >
        开开开开
      </Switch>
    </>
  );
};

ReactDOM.render(<App />, document.getElementById('container'));
