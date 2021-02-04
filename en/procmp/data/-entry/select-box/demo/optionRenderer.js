import React from 'react';
import ReactDOM from 'react-dom';
import { DataSet, SelectBox, Tooltip, Icon } from 'choerodon-ui/pro';

const App = () => {
  const optionDs = new DataSet({
    selection: 'single',
    queryUrl: '/dataset/user/queries',
    autoQuery: true,
  });
  const ds = new DataSet({
    fields: [
      {
        name: 'user',
        type: 'string',
        textField: 'name',
        valueField: 'userid',
        label: '用户',
        options: optionDs,
      },
    ],
  });
  const optionRenderer = ({ text }) => (
    <Tooltip title={text} placement="left">
      <span style={{ display: 'inline-block' }}>
        {text && <Icon type="people" />} {text}
      </span>
    </Tooltip>
  );

  return <SelectBox dataSet={ds} name="user" optionRenderer={optionRenderer} />;
};

ReactDOM.render(<App />, document.getElementById('container'));
