---
order: 4
title:
  zh-CN: 其他模式
  en-US: other mode
---

## zh-CN

其他模式。

## en-US

other mode.

```jsx
import { DataSet, Row, Col, Lov, Tree } from 'choerodon-ui/pro';

function nodeRenderer({ record }) {
  return record.get('text');
}

const App = () => {
  const ds = React.useMemo(
    () =>
      new DataSet({
        autoCreate: true,
        fields: [
          {
            name: 'popup_code',
            textField: 'code',
            type: 'object',
            lovCode: 'LOV_CODE',
            required: true,
          },
          {
            name: 'popup_code_string',
            type: 'object',
            lovCode: 'LOV_CODE',
            multiple: true,
            defaultValue: [{ description: 'Choerodon UI', code: 'c7n' }],
          },
          {
            name: 'drawer_code',
            textField: 'code',
            type: 'object',
            lovCode: 'LOV_CODE',
            multiple: true,
            required: true,
          },
          {
            name: 'drawer_code_string',
            textField: 'text',
            type: 'object',
            lovCode: 'LOV_TREE_CODE',
            multiple: true,
            required: true,
          },
        ],
      }),
    [],
  );

  const viewRenderer = React.useCallback(({ dataSet, lovConfig, textField, valueField, label, multiple }) => {
    console.log('info: ', dataSet, lovConfig, textField, valueField, label, multiple);
    const treeProps = {
      selectable: false,
      checkable: true,
      dataSet,
      renderer: nodeRenderer,
      multiple: true,
      showLine: {
        showLeafIcon: false,
      },
      defaultExpandAll: true,
    };
    return <Tree {...treeProps} />;
  }, []);

  return (
    <>
      <Row gutter={10}>
        <Col span={24}>POPUP MODE</Col>
      </Row>
      <Row gutter={10}>
        <Col span={12}>
          <Lov dataSet={ds} name="popup_code" viewMode="popup" />
        </Col>
        <Col span={12}>
          <Lov dataSet={ds} name="popup_code_string" viewMode="popup" />
        </Col>
      </Row>
      <Row gutter={10}>
        <Col span={24}>DRAWER MODE</Col>
      </Row>
      <Row gutter={10}>
        <Col span={12}>
          <Lov dataSet={ds} name="drawer_code" viewMode="drawer" />
        </Col>
        <Col span={12}>
          <Lov
            dataSet={ds}
            name="drawer_code_string"
            viewMode="drawer"
            viewRenderer={viewRenderer}
          />
        </Col>
      </Row>
    </>
  );
};

ReactDOM.render(<App />, mountNode);
```
