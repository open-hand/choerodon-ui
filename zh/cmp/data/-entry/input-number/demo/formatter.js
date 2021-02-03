import React from 'react';
import ReactDOM from 'react-dom';
import { InputNumber } from 'choerodon-ui';

function onChange(value) {
  console.log('changed', value);
}

ReactDOM.render(
  <div>
    <div style={{ marginBottom: 10 }}>
      <InputNumber
        defaultValue={1000}
        label="金额"
        formatter={(value) =>
          `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        }
        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
        onChange={onChange}
      />
    </div>
    <InputNumber
      defaultValue={100}
      label="百分比"
      min={0}
      max={100}
      formatter={(value) => `${value}%`}
      parser={(value) => value.replace('%', '')}
      onChange={onChange}
    />
  </div>,
  document.getElementById('container'),
);
