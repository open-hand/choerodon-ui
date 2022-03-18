---
order: 8
title:
  zh-CN: 后缀
  en-US: suffix
---

## zh-CN

添加后缀的省略。

## en-US

add suffix ellipsis support.

```jsx
import React from 'react'
import { Typography, Range } from 'choerodon-ui/pro';

const { Paragraph } = Typography;

class Demo extends React.Component {
  state = {
    rows: 1,
  };

  onChange = rows => {
    this.setState({ rows });
  };

  render() {
    const { rows } = this.state;
    const article =
      "To be, or not to be, that is a question: Whether it is nobler in the mind to suffer. The slings and arrows of outrageous fortune Or to take arms against a sea of troubles, And by opposing end them? To die: to sleep; No more; and by a sleep to say we end The heart-ache and the thousand natural shocks That flesh is heir to, 'tis a consummation Devoutly to be wish'd. To die, to sleep To sleep- perchance to dream: ay, there's the rub! For in that sleep of death what dreams may come When we have shuffled off this mortal coil, Must give us pause. There 's the respect That makes calamity of so long life";
    return (
      <>
        <Range value={rows} min={1} max={10} onChange={this.onChange} />
        <br />
        <Paragraph
          ellipsis={{
            rows,
            expandable: true,
            suffix: '--William Shakespeare',
            onEllipsis: ellipsis => {
              console.log('Ellipsis changed:', ellipsis);
            },
          }}
          title={`${article}--William Shakespeare`}
        >
          {article}
        </Paragraph>
      </>
    );
  }
}

ReactDOM.render(<Demo />, mountNode);
```
