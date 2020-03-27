---
order: 3
title:
  zh-CN: 包含子组件
  en-US: Contains sub component
---

## zh-CN

加载占位图包含子组件。

## en-US

Skeleton contains sub component.

```jsx
import { Skeleton, Button } from 'choerodon-ui';

class Demo extends React.Component {
  state = {
    loading: false,
  };

  showSkeleton = () => {
    this.setState({ loading: true });
    setTimeout(() => {
      this.setState({ loading: false });
    }, 3000);
  };

  render() {
    return (
      <div className="article">
        <Skeleton loading={this.state.loading}>
          <div>
            <h4>Choerodon UI of React</h4>
            <p>
              Following the Ant Design specification, we developed a React UI library Choerodon UI that contains a set of high quality components and demos for building rich, interactive user interfaces.
            </p>
          </div>
        </Skeleton>
        <Button onClick={this.showSkeleton} disabled={this.state.loading}>
          Show Skeleton
        </Button>
      </div>
    );
  }
}

ReactDOM.render(<Demo />, mountNode);
```

<style>
.article h4 {
  margin-bottom: 16px;
}
.article button {
  margin-top: 16px;
}
</style>
