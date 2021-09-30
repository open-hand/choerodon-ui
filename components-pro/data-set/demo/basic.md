---
order: 0
title:
  zh-CN: 数据转换案例
  en-US: Basic usage
---

## zh-CN

基本使用。

## en-US

Basic usage example.

````jsx
import { Button, DataSet, Form, Table, SelectBox, CodeArea, Row, Col } from 'choerodon-ui/pro';
import { action } from 'mobx';
// 引入格式化器
import JSONFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSONFormatter';
// 引入 json lint
import 'choerodon-ui/pro/lib/code-area/lint/json';
// 处理 codemirror 的SSR问题， 如无需SSR，请用import代替require;
if (typeof window !== 'undefined') {
  // 提供对应语言的语法高亮
  require('codemirror/mode/javascript/javascript');
}

const data = [
  {
    id: '1',
    code: 'code1',
    name: 'name1',
    number: 30,
    date_multiple_range: [['1984-11-22', '1985-07-01'], ['2020-11-22', '2021-07-01']],
    "model": [
      { "id": "id1-1", "code": "code1-1", name: "model1-1" },
      { "id": "id1-2", "code": "code1-2", name: "model1-2" },
    ],
    jsonData: JSON.stringify({ 
      "view": [
        { "id": "id1-1", "code": "code1-1", name: "view1-1" },
        { "id": "id1-2", "code": "code1-2", name: "view1-2" },
      ]
    }),
  },
  {
    id: '2',
    code: 'code2',
    name: 'name2',
    number: 30,
    "model": [
      { "id": "id2-1", "code": "code2-1", name: "model2-1" },
      { "id": "id2-2", "code": "code2-2", name: "model2-2" },
    ],
    jsonData: JSON.stringify({ 
      "view": [
        { "id": "id2-1", "code": "code2-1", name: "view2-1" },
        { "id": "id2-2", "code": "code2-2", name: "view2-2" },
      ],
    })
  }
];
const json = JSON.stringify(data, null, 2);

const jsonStyle = { height: 400 };

const App = () => {
  const [result, setResult] = React.useState();
  const [dataToJSON, setDataToJSON] = React.useState('dirty');
  const dataToJSONOptions = React.useMemo(() => new DataSet({
    data: [
      { value: 'dirty',  meaning: 'dirty' },
      { value: 'dirty-field',  meaning: 'dirty-field' },
      { value: 'selected',  meaning: 'selected' },
      { value: 'all',  meaning: 'all' },
      { value: 'normal',  meaning: 'normal' },
      { value: 'dirty-self',  meaning: 'dirty-self' },
      { value: 'dirty-field-self',  meaning: 'dirty-field-self' },
      { value: 'selected-self',  meaning: 'selected-self' },
      { value: 'all-self',  meaning: 'all-self' },
      { value: 'normal-self',  meaning: 'normal-self' },
    ],
  }), []);
  const viewDs = React.useMemo(() => new DataSet({
    primaryKey: 'id',
    dataToJSON: 'normal',
  }), []);
  const modelDs = React.useMemo(() => new DataSet({
    primaryKey: 'id',
  }), []);
  const ds = React.useMemo(() => new DataSet({
    primaryKey: 'id',
    data,
    fields: [
      { name: 'name', label: '名称' },
      { name: 'code', label: '编码' },
      { name: 'number', label: '数字' },
      { name: 'date_multiple_range', type: 'date', multiple: true, range: true, label: '多选日期', ignore: 'never' },
      { name: 'jsonData', type: 'json' },
    ],
    children: {
      'jsonData.view': viewDs,
      'model': modelDs,
    },
  }), [viewDs, modelDs]);
  const buttons = React.useMemo(() => ['add'], []);
  const columns = React.useMemo(() => ([
    { name: 'name', editor: true },
    { name: 'code', editor: true },
    { name: 'number', editor: true },
    { name: 'date_multiple_range', editor: true },
  ]), []);
  const viewModelcolumns = React.useMemo(() => ([
    { name: 'id', editor: true },
    { name: 'name', editor: true },
    { name: 'code', editor: true },
  ]), []);
  const toJSONData = React.useCallback(action(() => {
    ds.dataToJSON = dataToJSON;
    setResult(JSON.stringify(ds.toJSONData(), null, 2));
  }), [ds, dataToJSON]);
  const toData = React.useCallback(action(() => {
    ds.dataToJSON = dataToJSON;
    setResult(JSON.stringify(ds.toData(), null, 2));
  }), [ds, dataToJSON]);
  return (
    <>
      <Form columns={4} labelLayout="vertical">
        <SelectBox colSpan={3} value={dataToJSON} onChange={setDataToJSON} options={dataToJSONOptions} label="dataToJSON" />
        <div style={{ textAlign: 'right' }}>
          <Button onClick={toJSONData}>toJSONData</Button>
          <Button onClick={toData}>toData</Button>
        </div>
        <CodeArea colSpan={2} value={json} label="JSON数据" style={jsonStyle} />
        <CodeArea colSpan={2} value={result} label="执行结果" style={jsonStyle} />
      </Form>
      <Table buttons={buttons} columns={columns} dataSet={ds} />
      <Row gutter={10}>
        <Col span={12}>
          <Table header="view" buttons={buttons} columns={viewModelcolumns} dataSet={viewDs} />
        </Col>
        <Col span={12}>
          <Table header="model" buttons={buttons} columns={viewModelcolumns} dataSet={modelDs} />
        </Col>
      </Row>
    </>
  )
}

ReactDOM.render(
  <App />,
  mountNode
);
````
