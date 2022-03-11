import React from 'react';
import ReactDOM from 'react-dom';
import { Mentions } from 'choerodon-ui/pro';

const { Option, getMentions } = Mentions;

function onChange(value) {
  console.log('Change:', value);

  console.log('getMentions: ', value && getMentions(value));
}

function onSelect(option, mentionsKey) {
  console.log('select:', option, 'mentionsKey:', mentionsKey);
}

ReactDOM.render(
  <Mentions
    style={{ width: '100%' }}
    onChange={onChange}
    onSelect={onSelect}
    defaultValue="@mike"
  >
    <Option value="mike">mike</Option>
    <Option value="jason">jason</Option>
    <Option value="Kevin">Kevin</Option>
  </Mentions>,
  document.getElementById('container'),
);
