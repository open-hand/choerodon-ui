---
order: 19
title:
  zh-CN: 新增数据功能
  en-US: Add new option
---

## zh-CN

新增数据功能自定义渲染。

## en-US

新增数据功能自定义渲染。

````jsx
import React, { useState, useEffect } from 'react';
import { DataSet, Select, Button, Row, Col, Tooltip, Icon } from 'choerodon-ui/pro';
import { configure, Spin } from 'choerodon-ui';

const C7NAddNewOptionPromptRender = ({
  type,
  component,
  renderEmptyComponent,
  record,
  field,
  code,
  path,
  disabledTooltip = {},
  onClick,
}) => {
  url = path;

  // TODO: 按钮根据用户是否有 url 权限, 判断是否禁用
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    // TODO: 模拟异步请求权限
    setTimeout(() => {
      setIsLoading(false);
      setIsDisabled(false);
    }, 500);
  }, []);

  const tooltip = isDisabled ? [
    'always',
    {
      title: `当前账号无该字段对应功能的菜单权限，请联系管理员`,
      ...disabledTooltip,
    },
  ] : undefined;

  const buttonClick = () => {
    if (!url) return null;
    if (onClick) {
      onClick(url, record, field);
      return;
    }
    window.location.href = url;
  }

  if (!url) {
    return undefined;
  }

  if (isLoading) {
    return <Spin />;
  }

  if ((component === 'Select' && type === 'prompt') || (component === 'Lov' && type === 'prompt')) {
    return (
      <>
        <span className={`c7n-pro-select-new-option-prompt-tip`}>没有找到数据?</span>
        <Button funcType="flat" color="primary" onClick={buttonClick} disabled={isDisabled} tooltip={tooltip}>
          立即添加{isDisabled ? <Icon type="help" /> : undefined}
        </Button>
      </>
    );
  }
  if (component === 'Lov' && type === 'noDataPrompt' && renderEmptyComponent === 'Table') {
    return (
      <>
        <div>图片占位</div>
        <span className={`c7n-pro-select-new-option-prompt-tip`}>暂无数据</span>
        <Button funcType="flat" color="primary" onClick={buttonClick} disabled={isDisabled} tooltip={tooltip}>
          立即添加{isDisabled ? <Icon type="help" /> : undefined}
        </Button>
      </>
    );
  }
  if ((component === 'Select' && type === 'noDataPrompt') || (component === 'Lov' && type === 'noDataPrompt')) {
    return (
      <>
        <span className={`c7n-pro-select-new-option-prompt-tip`}>暂无数据</span>
        <Button funcType="flat" color="primary" onClick={buttonClick} disabled={isDisabled} tooltip={tooltip}>
          立即添加{isDisabled ? <Icon type="help" /> : undefined}
        </Button>
      </>
    );
  }
};

const addNewOptionPromptRender = (props) => {
  return React.createElement(C7NAddNewOptionPromptRender, { ...props });
};

configure({
  addNewOptionPromptRender: addNewOptionPromptRender,
});

function handleDataSetChange({ record, name, value, oldValue }) {
  console.log('[dataset newValue]', value, '[oldValue]', oldValue, `[record.get('${name}')]`, record.get(name));
}

const { Option } = Select;

const data = [{
  user: 'wu',
  user2: {
    text: 'Wu',
    value: 'wu',
  },
}];

class App extends React.Component {
  ds = new DataSet({
    data,
    fields: [
      { name: 'user', type: 'string', textField: 'text', label: '用户' },
      { name: 'user2', type: 'object', textField: 'text', label: '用户object' },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
      <div>
        <Row>
          <Col span={12}>
            <Select dataSet={this.ds} searchable name="user" addNewOptionPrompt={{ path: "/components-pro/button-cn/" }}>
              <Option value="jack">Jack</Option>
              <Option value="lucy">Lucy</Option>
              <Option value="wu">Wu</Option>
            </Select>
          </Col>
          <Col span={12}>
            <Select dataSet={this.ds} name="user2" addNewOptionPrompt={{ path: "/components-pro/button-cn/", disabledTooltip: { title: '自定义提示' } }}>
              <Option value="jack">Jack</Option>
              <Option value="lucy">Lucy</Option>
              <Option value="wu">Wu</Option>
            </Select>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Select dataSet={this.ds} searchable name="user" addNewOptionPrompt={{ path: "/components-pro/button-cn/", onClick: (path, record, field) => {
              console.log('clickProps', path, record, field);
              window.location.href = "/components-pro/button-cn/";
            } }}>
              <Option value="jack">Jack</Option>
              <Option value="lucy">Lucy</Option>
              <Option value="wu">Wu</Option>
            </Select>
          </Col>
          <Col span={12}>
            <Select dataSet={this.ds} name="user2" addNewOptionPrompt={(props) => {
              console.log('renderProps', props);
              return { path: "/components-pro/button-cn/", onClick: (path, record, field) => {
                console.log('clickProps', path, record, field);
                window.location.href = "/components-pro/button-cn/";
              }, disabledTooltip: { title: '自定义提示' } };
            }}>
              <Option value="jack">Jack</Option>
              <Option value="lucy">Lucy</Option>
              <Option value="wu">Wu</Option>
            </Select>
          </Col>
        </Row>
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);
````
