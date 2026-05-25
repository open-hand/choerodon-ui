import React from 'react';
import ReactDOM from 'react-dom';
import { Cascader } from 'choerodon-ui/pro';

const options = [
  {
    value: 'zhejiang',
    meaning: 'Zhejiang',
    children: [
      {
        value: 'hangzhou',
        meaning: 'Hangzhou',
        children: [
          {
            value: 'xihu',
            meaning: 'West Lake',
          },
          {
            value: 'Qiandaohu',
            meaning: 'Qiandaohu',
          },
          {
            value: 'Qiantang',
            meaning: 'Qiantang',
            disabled: true,
          },
        ],
      },
    ],
  },
  {
    value: 'jiangsu',
    meaning: 'Jiangsu',
    children: [
      {
        value: 'nanjing',
        meaning: 'Nanjing',
        children: [
          {
            value: 'zhonghuamen',
            meaning: 'Zhong Hua Men',
          },
          {
            value: 'Yuhuaqu',
            meaning: 'Yuhuaqu',
          },
        ],
      },
    ],
  },
];

function onChange(value) {
  console.log(value);
}

ReactDOM.render(
  <Cascader
    options={options}
    onChange={onChange}
    placeholder="Please select"
    multiple
    checkable
  />,
  document.getElementById('container'),
);
