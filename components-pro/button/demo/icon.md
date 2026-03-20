---
order: 3
title:
  zh-CN: 图标按钮
  en-US: icon
---

## zh-CN

为按钮增加图标。


## en-US

Buttons display mode, flat and raised, default raised.


````jsx
import { Button, Icon, Row, Col } from 'choerodon-ui/pro';

const App = () => {
  const [flag, setFlag] = React.useState(true);
  const handleClick = React.useCallback(() => setFlag(!flag), [flag]);
  const overflowStyle = React.useMemo(() => ({ 
    maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  }), []);

  return (
    <div>
      <Row>
        <Col>
          <Button icon="save">{false}</Button>
          <Button><Icon type="save" /></Button>
          <Button funcType="flat" color="primary" icon="save">保存</Button>
          <Button icon="sync" />
          <Button funcType="flat" icon="sync" />
          <Button funcType="flat" icon="search" color="primary" />
          <Button funcType="flat" icon="close" style={{ color: '#e12330' }} disabled />
        </Col>
      </Row>
      <h3>iconPlacement='end'</h3>
      <Row>
        <Col>
          <Button funcType="flat" color="primary" icon="save" iconPlacement="end">保存</Button>
          <Button
            tooltip="overflow"
            style={flag ? overflowStyle : undefined}
            onClick={handleClick}
            icon="search"
            iconPlacement="end"
          >
            内容超长时显示气泡&lt;点击改变样式&gt;
          </Button>
          <Button
            tooltip="overflow"
            style={flag ? overflowStyle : undefined}
            disabled
            icon="search"
            iconPlacement="end"
          >
            内容超长时显示气泡&lt;点击改变样式&gt;
          </Button>
        </Col>
        <Col>
          <Button funcType="flat" color="primary" icon="save" iconPlacement="end" loading>保存</Button>
          <Button
            tooltip="overflow"
            style={flag ? overflowStyle : undefined}
            onClick={handleClick}
            icon="search"
            loading
            iconPlacement="end"
          >
            内容超长时显示气泡&lt;点击改变样式&gt;
          </Button>
          <Button
            tooltip="overflow"
            style={flag ? overflowStyle : undefined}
            disabled
            icon="search"
            loading
            iconPlacement="end"
          >
            内容超长时显示气泡&lt;点击改变样式&gt;
          </Button>
        </Col>
      </Row>
    </div>
  );
}

ReactDOM.render(
  <App />,
  mountNode);

````
