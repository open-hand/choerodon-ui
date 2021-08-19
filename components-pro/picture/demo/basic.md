---
order: 0
title:
  zh-CN: 基本使用
  en-US: Basic Usage
---

## zh-CN

基本使用

## en-US

````jsx
import { Picture, Row, Col, SelectBox } from 'choerodon-ui/pro';

const { Option } = SelectBox;

const App = () => {
  const [objectFit, setObjectFit] = React.useState('fill');
  const [objectPosition, setObjectPosition] = React.useState('center');
  return (
    <Row>
      <Col span={24}>
        <SelectBox label="objectFit" value={objectFit} onChange={setObjectFit} labelLayout="float">
          <Option value="fill">fill</Option>
          <Option value="contain">contain</Option>
          <Option value="cover">cover</Option>
          <Option value="none">none</Option>
          <Option value="scale-down">scale-down</Option>
        </SelectBox>
      </Col>
      <Col span={24}>
        <SelectBox label="objectPosition" value={objectPosition} onChange={setObjectPosition} labelLayout="float">
          <Option value="center">center</Option>
          <Option value="top">top</Option>
          <Option value="bottom">bottom</Option>
          <Option value="left">left</Option>
          <Option value="right">right</Option>
        </SelectBox>
      </Col>
      <Col span={12}>
        <Picture
          border
          src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
          width={200}
          height={100}
          objectFit={objectFit}
          objectPosition={objectPosition}
        />
      </Col>
      <Col span={12}>
        <Picture
          border
          src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
          width={100}
          height={200}
          objectFit={objectFit}
          objectPosition={objectPosition}
        />
      </Col>
    </Row>
  )
}

ReactDOM.render(
  <App />,
  mountNode,
);
````
