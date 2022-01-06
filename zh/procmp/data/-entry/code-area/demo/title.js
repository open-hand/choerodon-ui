import React from 'react';
import ReactDOM from 'react-dom';
import { CodeArea, DataSet } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
// 处理 codemirror 的SSR问题， 如无需SSR，请用import代替require;
import 'codemirror/mode/javascript/javascript';
// if (typeof window !== 'undefined') {
//   // 提供对应语言的语法高亮
//   require('codemirror/mode/javascript/javascript');
// }

const jsonText = `{
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
      "es2017.object"]
  },
  "exclude": [
    "node_modules",
    "lib",
    "es"
  ]
}
`;
const style = { height: 525 };

class App extends React.Component {
  state = {
    hiddenContent: false,
  };

  ds = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'content',
        type: 'string',
        defaultValue: jsonText,
        required: true,
      },
    ],
  });

  get getIconType() {
    const { hiddenContent } = this.state;
    return hiddenContent
      ? 'baseline-arrow_drop_up'
      : 'baseline-arrow_drop_down';
  }

  get getClassName() {
    const { hiddenContent } = this.state;
    return hiddenContent ? 'hidden-content' : '';
  }

  toggleHidden = () => {
    const { hiddenContent } = this.state;
    this.setState({ hiddenContent: !hiddenContent });
  };

  getHeader = () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
      >
        <div>代码区</div>
        <Icon
          type={this.getIconType}
          style={{ marginLeft: '4px' }}
          onClick={this.toggleHidden}
        />
      </div>
      <Icon
        type="source"
        onClick={() => {
          console.log('Do something.');
        }}
        style={{ cursor: 'pointer' }}
      />
    </div>
  );

  render() {
    return (
      <div>
        <CodeArea
          dataSet={this.ds}
          name="content"
          style={style}
          className={this.getClassName}
          title={this.getHeader()}
          themeSwitch="idea"
        />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('container'));
