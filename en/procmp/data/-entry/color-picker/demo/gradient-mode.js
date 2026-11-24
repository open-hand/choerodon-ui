import React from 'react';
import ReactDOM from 'react-dom';
import { ColorPicker, Form } from 'choerodon-ui/pro';

const App = () => {
  return (
    <Form columns={1}>
      <ColorPicker label="单色" />
      <ColorPicker
        gradientMode="gradient"
        defaultValue="linear-gradient(90deg, #ff0000 0%, #0000ff 100%)"
        label="渐变"
      />
      <ColorPicker
        gradientMode={['single', 'gradient']}
        defaultValue="#00a854"
        label="单色+渐变"
      />
      <ColorPicker preset label="预设" />
      <ColorPicker preset gradientMode="gradient" label="预设+渐变" />
      <ColorPicker
        preset
        gradientMode={['single', 'gradient']}
        defaultValue="#00a854"
        label="预设+单色+渐变"
      />
    </Form>
  );
};

ReactDOM.render(<App />, document.getElementById('container'));
