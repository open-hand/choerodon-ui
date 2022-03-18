---
order: 6
title:
  zh-CN: 省略号
  en-US: Ellipsis
---

## zh-CN

多行文本省略。你可以通过 `tooltip` 属性配置省略展示内容，大量文本时推荐优先使用 `expandable`。

## en-US

Multiple line ellipsis support. You can use `tooltip` to config ellipsis tooltip. Recommend `expandable` when have lots of content.

```tsx
import { Typography, Switch } from 'choerodon-ui/pro';

const { Paragraph, Text } = Typography;

const Demo = () => {
  const [ellipsis, setEllipsis] = React.useState(true);

  return (
    <>
      <Switch
        checked={ellipsis}
        onChange={() => {
          setEllipsis(!ellipsis);
        }}
      />

      <Paragraph ellipsis={ellipsis}>
        Choerodon-ui, a design language for background applications, is refined by UED Team. Choerodon-ui
        Design, a design language for background applications, is refined by Choerodon-ui UED Team. Choerodon-ui
        Design, a design language for background applications, is refined by Choerodon-ui UED Team. Choerodon-ui
        Design, a design language for background applications, is refined by Choerodon-ui UED Team. Choerodon-ui
        Design, a design language for background applications, is refined by Choerodon-ui UED Team. Choerodon-ui
        Design, a design language for background applications, is refined by Choerodon-ui UED Team.
      </Paragraph>

      <Paragraph ellipsis={ellipsis ? { rows: 2, expandable: true, symbol: 'more' } : false}>
        Choerodon-ui, a design language for background applications, is refined by Choerodon-ui UED Team. Choerodon-ui
        Design, a design language for background applications, is refined by Choerodon-ui UED Team. Choerodon-ui
        Design, a design language for background applications, is refined by Choerodon-ui UED Team. Choerodon-ui
        Design, a design language for background applications, is refined by Choerodon-ui UED Team. Choerodon-ui
        Design, a design language for background applications, is refined by Choerodon-ui UED Team. Choerodon-ui
        Design, a design language for background applications, is refined by Choerodon-ui UED Team.
      </Paragraph>

      <Text
        style={ellipsis ? { width: 100 } : undefined}
        ellipsis={ellipsis ? { tooltip: 'I am ellipsis now!' } : false}
      >
        Choerodon-ui, a design language for background applications, is refined by Choerodon-ui UED Team.
      </Text>
    </>
  );
};

ReactDOM.render(<Demo />, mountNode);
```
