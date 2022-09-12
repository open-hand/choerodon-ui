import React from 'react';
import ReactDOM from 'react-dom';
import { observer } from 'mobx-react-lite';
import { Tabs } from 'choerodon-ui';
import { useDataSet, Button, Form, TextField, message } from 'choerodon-ui/pro';

const { TabPane } = Tabs;

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
  const handleTabClick = React.useCallback((key) => {
    console.log('key', key);
    if (key === '2' && ds.getState('disabled')) {
      const validationMessage = ds.current
        .getValidationErrors()
        .map((error) => error.errors[0].validationMessage)
        .join(' ');
      message.warning(validationMessage);
    } else {
      ds.setState('activeKey', key);
    }
  }, []);
  return (
    <>
      <Button onClick={() => ds.validate()}>validate</Button>
      <Tabs
        activeKey={ds.getState('activeKey') || '1'}
        onTabClick={handleTabClick}
      >
        <TabPane tab="Tab 1" key="1" dataSet={ds}>
          <Form dataSet={ds}>
            <TextField name="name" />
          </Form>
        </TabPane>
        <TabPane tab="点击提示限制跳转" key="2">
          <Form dataSet={ds}>
            <TextField name="name" />
          </Form>
        </TabPane>
        <TabPane
          tab="校验禁用限制跳转"
          key="3"
          disabled={ds.getState('disabled')}
        >
          <Form dataSet={ds}>
            <TextField name="name" />
          </Form>
        </TabPane>
      </Tabs>
    </>
  );
});
ReactDOM.render(<App />, document.getElementById('container'));
