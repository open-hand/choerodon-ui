import React from 'react';
import ReactDOM from 'react-dom';
import { CodeArea, DataSet } from 'choerodon-ui/pro';
// 引入格式化器
import HTMLFormatter from 'choerodon-ui/pro/lib/code-area/formatters/HTMLFormatter';
// 引入 html lint
import 'choerodon-ui/pro/lib/code-area/lint/html';
// 处理 codemirror 的SSR问题， 如无需SSR，请用import代替require;
import 'codemirror/mode/htmlmixed/htmlmixed';
// if (typeof window !== 'undefined') {
//   // 提供对应语言的语法高亮
//   require('codemirror/mode/htmlmixed/htmlmixed');
// }

const options = { mode: 'htmlmixed' };

const htmlText = `<div class="demo-wrapper">
    <span id="demo">Demo</span>
</div>
<script>
var demo = document.getElementById('demo');
demo.style.cssText = 'color: red;';
</script>
`;

const htmlStyle = { height: 200 };

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'content',
        type: 'string',
        defaultValue: htmlText,
        required: true,
      },
    ],
  });

  render() {
    return (
      <div>
        <h4>HTML</h4>
        <CodeArea
          dataSet={this.ds}
          name="content"
          style={htmlStyle}
          formatter={HTMLFormatter}
          options={options}
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
