---
order: 1
title:
  zh-CN: 简单的格式化工具栏
  en-US: Simple formatting toolbar
---

## zh-CN

简单的格式化工具栏，数组写法工具栏在 RichText 组件内，外层包裹需考虑工具栏高度。

## en-US

Simply format the toolbar. The array format toolbar is in the RichText component, and the height of the toolbar should be considered for the outer wrapper.

````jsx
import { RichText, Switch } from 'choerodon-ui/pro';

const style = { height: 200 };

const options = {
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      ['blockquote', 'code-block'],

      [{ 'header': 1 }, { 'header': 2 }],               // custom button values
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
      [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
      [{ 'direction': 'rtl' }],                         // text direction

      [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

      [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
      [{ 'font': [] }],
      [{ 'align': [] }],

      ['clean'],                                         // remove formatting button
    ],
    imageDropAndPaste: false,
  },
};

class App extends React.Component {
  state = { mode: 'editor' };
  
  handlePerviewChange = (value) => {
    console.log(value);
    this.setState({ mode: value ? 'preview' : 'editor' });
  };

  render() {
    const { mode } = this.state;
    return (
      <>
        <div style={{ height: 220 }}>
          <RichText mode={mode} style={style} options={options} toolbar="none" />
        </div>
        <Switch style={{ paddingTop: 10 }} onChange={this.handlePerviewChange} checked={mode === 'preview'}>preview</Switch>
      </>
    );
  }
}

ReactDOM.render(
  <App />,
  mountNode,
);
````
