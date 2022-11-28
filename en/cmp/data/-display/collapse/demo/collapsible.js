import React from 'react';
import ReactDOM from 'react-dom';
import { Collapse } from 'choerodon-ui';

const { Panel } = Collapse;

const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;

ReactDOM.render(
  <>
    <Collapse collapsible="icon">
      <Panel header="This panel can't be collapsed" key="1">
        <p>{text}</p>
      </Panel>
    </Collapse>
    <br />
    <Collapse>
      <Panel collapsible="icon" header="This panel can't be collapsed" key="1">
        <p>{text}</p>
      </Panel>
    </Collapse>
    <br />
    <Collapse collapsible="header">
      <Panel
        collapsible="disabled"
        header="This panel can't be collapsed"
        key="1"
      >
        <p>{text}</p>
      </Panel>
    </Collapse>
    <br />
    <Collapse collapsible="disabled">
      <Panel
        collapsible="header"
        header="This panel can't be collapsed"
        key="1"
      >
        <p>{text}</p>
      </Panel>
    </Collapse>
    <Collapse>
      <Panel
        collapsible="disabled"
        header="This panel can't be collapsed"
        key="1"
      >
        <p>{text}</p>
      </Panel>
    </Collapse>
  </>,
  document.getElementById('container'),
);
