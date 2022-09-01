import React from 'react';
import ReactDOM from 'react-dom';
import { observer } from 'mobx-react-lite';
import { Tabs } from 'choerodon-ui';
import { useDataSet, Button, Form, TextField } from 'choerodon-ui/pro';

const { TabPane } = Tabs;
const { TabGroup } = Tabs;

const App = observer(() => {
  const ds = useDataSet(
    () => ({
      autoCreate: true,
      fields: [{ name: 'name', required: true, label: '姓名' }],
      events: {
        validate: async ({ dataSet, result }) => {
          dataSet.setState('disabled', !(await result));
        },
      },
    }),
    [],
  );
  return (
    <>
      <Button onClick={() => ds.validate()}>validate</Button>
      <Tabs>
        <TabGroup tab="Group 1">
          <TabPane tab="Auto expand by dataSet" key="1" dataSet={ds}>
            <Form dataSet={ds}>
              <TextField name="name" />
            </Form>
          </TabPane>
          <TabPane
            tab="Auto expand by context but need forceRender"
            key="2"
            disabled={ds.getState('disabled')}
            forceRender
          >
            <Form dataSet={ds}>
              <TextField name="name" />
            </Form>
          </TabPane>
        </TabGroup>
        <TabGroup tab="Group 2">
          <TabPane tab="Auto expand by dataSet" key="3" dataSet={ds}>
            <Form dataSet={ds}>
              <TextField name="name" />
            </Form>
          </TabPane>
          <TabPane
            tab="Disabled will not auto expand"
            key="4"
            disabled
            dataSet={ds}
          >
            <Form dataSet={ds}>
              <TextField name="name" />
            </Form>
          </TabPane>
        </TabGroup>
      </Tabs>
    </>
  );
});
ReactDOM.render(<App />, document.getElementById('container'));
