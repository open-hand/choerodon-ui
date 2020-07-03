import React from 'react';
import ReactDOM from 'react-dom';
import { CodeArea, DataSet } from 'choerodon-ui/pro';
// 引入格式化器
import JSFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSFormatter';
// 引入 javascript lint
import 'choerodon-ui/pro/lib/code-area/lint/javascript';
// 处理 codemirror 的SSR问题， 如无需SSR，请用import代替require;
import 'codemirror/mode/javascript/javascript';
// if (typeof window !== 'undefined') {
//   // 提供对应语言的语法高亮
//   require('codemirror/mode/javascript/javascript');
// }

const options = { mode: 'javascript' };

const jsText = `function getOptions() {
  var options = {
    "compilerOptions": {
      "strictNullChecks": true,
      "moduleResolution": "node",
      "allowSyntheticDefaultImports": true,
      "experimentalDecorators": true,
      "jsx": "preserve",
      "noUnusedParameters": true,
      "noUnusedLocals": true,
      "declaration": true,
      "target": "es6",
      "lib": [
        "dom",
        "dom.iterable",
        "es7",
        "es2017.object"
      ]
    },
    "exclude": [
      "node_modules",
      "lib",
      "es"
    ]
  };

  return options;
}
`;

const jsStyle = { height: 500 };

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      { name: 'content', type: 'string', defaultValue: jsText, required: true },
    ],
  });

  render() {
    return (
      <div>
        <h4>Javascript</h4>
        <CodeArea
          dataSet={this.ds}
          name="content"
          style={jsStyle}
          formatter={JSFormatter}
          options={options}
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
