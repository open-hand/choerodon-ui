import React from 'react';
import ReactDOM from 'react-dom';
import { CodeArea, DataSet } from 'choerodon-ui/pro';
// 引入格式化器，注意使用模块的默认导出
import YAMLFormatter from 'choerodon-ui/pro/lib/code-area/formatters/YAMLFormatter';
// 引入 yaml lint
import 'choerodon-ui/pro/lib/code-area/lint/yaml';
// 处理 codemirror 的SSR问题， 如无需SSR，请用import代替require;
import 'codemirror/mode/yaml/yaml';
// if (typeof window !== 'undefined') {
//   // 提供对应语言的语法高亮
//   require('codemirror/mode/yaml/yaml');
// }

const options = { mode: 'yaml' };

const yamlText = `YAML:
  - A human-readable data serialization language
  - https://en.wikipedia.org/wiki/YAML
yaml:
  - A complete JavaScript implementation
  - https://www.npmjs.com/package/yaml
`;

const yamlStyle = { height: 200 };

class App extends React.Component {
  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'content',
        type: 'string',
        defaultValue: yamlText,
        required: true,
      },
    ],
  });

  render() {
    return (
      <div>
        <h4>YAML</h4>
        <CodeArea
          dataSet={this.ds}
          name="content"
          style={yamlStyle}
          formatter={YAMLFormatter}
          options={options}
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
