/* eslint-disable no-unused-vars */
---
order: 26
title:
  en-US: export a report
  zh-CN: 导出表单
---

## zh-CN

展示一个表单的导出操作

## en-US

Simple export a report

````jsx
import { Table,Button, Icon, Divider } from 'choerodon-ui';
import React, { useState } from 'react';
import axios from 'axios';

const columns = [{
  title: 'Name',
  dataIndex: 'name',
  key: 'name1',
  render: text => <a href="#">{text}</a>,
}, {
  title: 'Age',
  dataIndex: 'age',
  key: 'age1',
}, {
  title: 'Address',
  dataIndex: 'address',
  key: 'address1',
}, {
  title: '',
  key: 'action1',
  render: (text, record) => (
    <span>
      <a href="#">Action 一 {record.name}</a>
      <Divider type="vertical" />
      <a href="#">Delete</a>
      <Divider type="vertical" />
      <a href="#" className="c7n-dropdown-link">
        More actions <Icon type="down" />
      </a>
    </span>
  ),
}];

const data = [{
  key: '11',
  name: 'John Brown',
  age: 32,
  address: 'New York No. 1 Lake Park',
}, {
  key: '12',
  name: 'Jim Green',
  age: 42,
  address: 'London No. 1 Lake Park',
}, {
  key: '13',
  name: 'Joe Black',
  age: 32,
  address: 'Sidney No. 1 Lake Park',
}];

const App = () => {
   const [exported, setExported] = useState(false);
   const basicUrl = ``;
   const token = ``;
   const filename = ``;
   const dataParam = {};
   let iframe 
   
   // eslint-disable-next-line no-unused-vars
   const handleExportPost = () => {
       setExported(true);

       axios.post(`${basicUrl}/v1/export`,{
           _token:token,
           filename,
       }).then(res => {
           setExported(false);
           const aLink = document.createElement("a");
             const blob = new Blob([res.data], {type: "application/vnd.ms-excel"})
             aLink.href = URL.createObjectURL(blob)
             aLink.download = filename
             aLink.click()
             document.body.appendChild(aLink)
       }).catch(err => {
           setExported(false);
           console.log(err);
       })
   } 

   const handleExportGet = () => {
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = '_export_window';
            iframe.name = '_export_window';
            iframe.style.cssText =
            'position:absolute;left:-10000px;top:-10000px;width:1px;height:1px;display:none';
            document.body.appendChild(iframe);
        }
        setExported(true);
        const form = document.createElement('form');
        form.target = '_export_window';
        form.method = 'get';
        form.action = 'http://gitee.com/xurime/excelize/raw/master/test/SharedStrings.xlsx';
        const s = document.createElement('input');
        s.id = '_request_data';
        s.type = 'hidden';
        s.name = '_request_data';
        s.value = JSON.stringify(dataParam);
        form.appendChild(s);
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
        setExported(false);
   };

   return (
       <>
          <Button
            type="primary"
            onClick={handleExportGet}
            disabled={exported}
          >
            导出表单
          </Button>
          <Table columns={columns} dataSource={data} filterBarPlaceholder="过滤表" onColumnFilterChange={item => console.log(item)} />
       </>
  );
}


ReactDOM.render(<App/>, mountNode);

````
