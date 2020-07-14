import React from 'react';
import ReactDOM from 'react-dom';
import { Collapse } from 'choerodon-ui';

const Panel = Collapse.Panel;

function callback(key) {
  console.log(key);
}

const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;

ReactDOM.render(
  <Collapse
    defaultActiveKey={['1']}
    onChange={callback}
    trigger="icon"
    expandIconPosition="right"
    expandIcon="text"
  >
    <Panel header="This is panel header 1" key="1">
      <p>{text}</p>
    </Panel>
    <Panel header="This is panel header 2" key="2">
      <p>{text}</p>
    </Panel>
    <Panel header="This is panel header 3" key="3" disabled>
      <p>{text}</p>
    </Panel>
  </Collapse>,
  document.getElementById('container'),
);
