import React from 'react';
import ReactDOM from 'react-dom';
import { Collapse } from 'choerodon-ui';
import { useDataSet, Button, Form, TextField } from 'choerodon-ui/pro';

const Panel = Collapse.Panel;

const App = () => {
  const ds = useDataSet(
    () => ({
      autoCreate: true,
      fields: [{ name: 'name', required: true, label: '姓名' }],
    }),
    [],
  );

  return (
    <>
      <Button onClick={() => ds.validate()}>validate</Button>
      <Collapse>
        <Panel header="Auto expand by dataSet" key="1" dataSet={ds}>
          <Form dataSet={ds}>
            <TextField name="name" />
          </Form>
        </Panel>
        <Panel
          header="Auto expand by context but need forceRender"
          key="2"
          forceRender
        >
          <Form dataSet={ds}>
            <TextField name="name" />
          </Form>
        </Panel>
        <Panel
          header="Disabled will not auto expand"
          key="3"
          disabled
          dataSet={ds}
        >
          <Form dataSet={ds}>
            <TextField name="name" />
          </Form>
        </Panel>
      </Collapse>
    </>
  );
};

ReactDOM.render(<App />, document.getElementById('container'));
