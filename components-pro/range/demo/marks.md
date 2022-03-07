---
order: 5
title:
  zh-CN: 自定义标识
  en-US: Custom Marks
---

## zh-CN

自定义标识

## en-US

Custom Marks

````jsx

import { DataSet, Range } from 'choerodon-ui/pro';

function handleDataSetChange({ value, oldValue }) {
  console.log('[dataset]', value, '[oldValue]', oldValue);
}

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      { name: 'range', defaultValue: 20, min: 10, max: 100, step: 1 },
    ],
    events: {
      update: handleDataSetChange,
    },
  });

  render() {
    return (
     <div class="range-demo">
      <div>
        <Range dataSet={this.ds} name="range" tipFormatter={(value)=> `${value}%`} marks={{ 25: '当前进度 25%', 50: '当前进度 50%', 100: '当前进度 100%', 60: '当前进度 60%' }} />
      </div>
      <div style={{ height: 200, marginTop:70 }}>
        <Range dataSet={this.ds} vertical name="range" tipFormatter={(value)=> `${value}%`} marks={{ 25: '温度 25℃', 40: '温度 40℃', 100: '温度 100℃', 50: '温度 50℃', 55: '温度 55℃' }} />
      </div>
    </div>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode
);

````

```css
.range-demo {
  display: flex;
  flex-direction: column;
}
```
