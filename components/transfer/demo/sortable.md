---
order: 5
title:
  zh-CN: 排序
  en-US: sortable
---

## zh-CN

可以上下排序，并可以自定义上下按钮

## en-US

You can sort up and down, and customize the up and down buttons.

```jsx
import { Transfer } from 'choerodon-ui';

const mockData = [];
for (let i = 0; i < 20; i++) {
  mockData.push({
    key: i.toString(),
    title: `content${i + 1}`,
    description: `description of content${i + 1}`,
    disabled: i % 3 < 1,
  });
}

const targetKeys = mockData.filter(item => +item.key).map(item => item.key);

class App extends React.Component {
  state = {
    targetKeys,
    selectedKeys: [],
  };

  render() {
    const state = this.state;
    return (
      <Transfer
        dataSource={mockData}
        titles={['Source', 'Target']}
        targetKeys={state.targetKeys}
        selectedKeys={state.selectedKeys}
        render={item => item.title}
        sortable
      />
    );
  }
}

ReactDOM.render(<App />, mountNode);
```
