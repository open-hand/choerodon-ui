import React from 'react';
import ReactDOM from 'react-dom';
import { Input } from 'choerodon-ui';

const Search = Input.Search;

ReactDOM.render(
  <div>
    <Search
      placeholder="input search text"
      onSearch={value => console.log(value)}
      style={{ width: 200 }}
    />
    <br />
    <br />
    <Search placeholder="input search text" onSearch={value => console.log(value)} enterButton />
    <br />
    <br />
    <Search placeholder="input search text" enterButton="Search" size="large" />
  </div>,
  document.getElementById('container'),
);
