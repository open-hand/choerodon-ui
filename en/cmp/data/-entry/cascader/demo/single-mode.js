import React from 'react';
import ReactDOM from 'react-dom';
import { Cascader } from 'choerodon-ui';

const options = [
  {
    value: 'chengdu',
    label: '成都',
    isLeaf: false,
  },
  {
    value: 'lanjin',
    label: '南京',
    isLeaf: false,
  },
  {
    value: 'LA',
    label: 'LA',
    isLeaf: false,
  },
  {
    value: 'Boston',
    label: 'Boston',
    isLeaf: false,
  },
];

class LazyOptions extends React.Component {
  state = {
    options,
  };

  onChange = (value, selectedOptions) => {
    console.log(value, selectedOptions);
  };

  loadData = (selectedOptions) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;

    // load options lazily
    setTimeout(() => {
      targetOption.loading = false;
      targetOption.children = [
        {
          label: `In da house`,
          value: 'dynamic1',
        },
        {
          label: `Dynamic`,
          value: 'dynamic2',
        },
      ];
      this.setState({
        options: [...this.state.options],
      });
    }, 1000);
  };

  render() {
    return (
      <Cascader
        allowClear
        options={this.state.options}
        loadData={this.loadData}
        onChange={this.onChange}
        changeOnSelect
        menuMode="single"
      />
    );
  }
}
ReactDOM.render(<LazyOptions />, document.getElementById('container'));
