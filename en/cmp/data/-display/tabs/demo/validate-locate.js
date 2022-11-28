import React from 'react';
import ReactDOM from 'react-dom';
import { observer } from 'mobx-react-lite';
import { Tabs } from 'choerodon-ui';
import { useDataSet, Button, Form, TextField } from 'choerodon-ui/pro';

const { TabPane } = Tabs;

const App = observer(() => {
  const ds = useDataSet(
    () => ({
      autoCreate: true,
      fields: [{ name: 'name', required: true, label: '姓名DS-1' }],
    }),
    [],
  );
  const ds2 = useDataSet(
    () => ({
      autoCreate: true,
      fields: [{ name: 'name', required: true, label: '姓名DS-2' }],
    }),
    [],
  );

  const handleTabClick = React.useCallback((key) => {
    console.log('key', key);
    ds.setState('activeKey', key);
  }, []);

  return (
    <>
      <Button
        onClick={async () => {
          const result1 = await ds.validate();
          const result2 = await ds2.validate();
          if (result1 === false) {
            ds.setState('activeKey', '1');
          } else if (result2 === false) {
            ds.setState('activeKey', '2');
          }
          console.log('res', result1, result2);
        }}
      >
        全校验
      </Button>
      <Button
        onClick={async () => {
          ds.current.set('name', '测试');
          const result2 = await ds2.validate();
          if (result2 === false) {
            ds.setState('activeKey', '2');
          }
          console.log('result2', result2);
        }}
      >
        DS-1 赋值 + DS-2 校验
      </Button>
      <Button
        onClick={() => {
          ds.current.reset();
          ds2.current.reset();
        }}
      >
        重置
      </Button>
      <Tabs
        activeKey={ds.getState('activeKey') || '1'}
        onTabClick={handleTabClick}
      >
        <TabPane tab="DS-1 Tab" key="1" dataSet={ds}>
          <Form dataSet={ds}>
            <TextField name="name" />
          </Form>
        </TabPane>
        <TabPane
          tab="校验失败跳转定位(关联DS-1&DS2)"
          key="2"
          dataSet={[ds, ds2]}
        >
          <Form dataSet={ds}>
            <TextField name="name" />
          </Form>
          <Form dataSet={ds2}>
            <TextField autoFocus name="name" />
          </Form>
        </TabPane>
      </Tabs>
    </>
  );
});
ReactDOM.render(<App />, document.getElementById('container'));
