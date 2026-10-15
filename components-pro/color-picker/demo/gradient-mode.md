---
order: 3
title:
  zh-CN: 渐变
  en-US: Gradient
---

## zh-CN

`gradientMode="gradient"` 仅显示渐变编辑器，`gradientMode={['single', 'gradient']}` 支持切换单色和渐变。可编辑色标、透明度、线性渐变方向和居中径向渐变，并输入 CSS 渐变样式值。

## en-US

Use `gradientMode="gradient"` for gradient-only editing or `gradientMode={['single', 'gradient']}` to switch between single colors and gradients. Edit color stops, opacity, linear directions and centered radial gradients, or enter a CSS gradient value.

````jsx
import { Row, Col } from 'choerodon-ui';
import { ColorPicker, Form } from 'choerodon-ui/pro';

const App = () => {
  return (
    <Form columns={1}>
      <ColorPicker
        label='单色'
      />
      <ColorPicker
        gradientMode="gradient"
        defaultValue="linear-gradient(90deg, #ff0000 0%, #0000ff 100%)"
        label='渐变'
      />
      <ColorPicker
        gradientMode={['single', 'gradient']}
        defaultValue="#00a854"
        label='单色+渐变'
      />
      <ColorPicker
        preset
        label='预设'
      />
      <ColorPicker
        preset
        gradientMode="gradient"
        label='预设+渐变'
      />
      <ColorPicker
        preset
        gradientMode={['single', 'gradient']}
        defaultValue="#00a854"
        label='预设+单色+渐变'
      />
    </Form>
  )
}

ReactDOM.render(
  <App />,
  mountNode
);
````
