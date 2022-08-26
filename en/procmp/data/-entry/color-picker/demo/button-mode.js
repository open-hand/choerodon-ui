import React from 'react';
import ReactDOM from 'react-dom';
import { Icon } from 'choerodon-ui';
import { ColorPicker } from 'choerodon-ui/pro';

ReactDOM.render(
  <>
    <ColorPicker
      defaultValue="#e88b3463"
      mode="button"
      preset
      style={{ marginRight: 30 }}
    />
    <ColorPicker
      defaultValue="#e88b34"
      mode="button"
      renderer={({ value }) => {
        return <Icon type="color_lens-o" style={{ color: value }} />;
      }}
    />
  </>,
  document.getElementById('container'),
);
