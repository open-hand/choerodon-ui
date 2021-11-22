import React from 'react';
import { render, shallow, mount } from 'enzyme';

import DataSet from '..';
import fakeLargeData from '../../../site/theme/mock/performance-data/fakeLargeData.json';
import Table from '../../../components-pro/table';
import Record from '../Record';
import { randomData } from './mock'

const testName = 'testName';
const data = [
  {
    "userid": 1,
    "name": "假数据宋江",
    "sex": "M",
    "age": 68,
    "email": "6888888@qq.com",
    "active": true
  },
  {
    "userid": 2,
    "name": "假数据张飞",
    "sex": "M",
    "age": 60,
    "email": "zhangfei@163.com",
    "active": true
  },
  {
    "userid": 3,
    "name": "假数据赵云",
    "sex": "M",
    "age": 25,
    "email": "zhaoyun@163.com",
    "active": true
  },
  {
    "userid": 4,
    "name": "假数据廉颇",
    "sex": "M",
    "age": 88,
    "email": "61238@google.com",
    "active": false
  },
  {
    "userid": 5,
    "name": "假数据秦秀英",
    "sex": "F",
    "age": 12,
    "email": "6qxy8@hand-china.com",
    "active": true
  },
  {
    "userid": 6,
    "name": "假数据孔秀兰",
    "sex": "F",
    "age": 24,
    "email": "123368@qq.com",
    "active": true
  },
  {
    "userid": 7,
    "name": "假数据马芳",
    "sex": "F",
    "age": 10,
    "email": "mafangs@163.com",
    "active": false
  },
  {
    "userid": 8,
    "name": "假数据鲁智深",
    "sex": "M",
    "age": 48,
    "email": "6handlzs8@hand-china.com",
    "active": true
  }
];
const commonDs = {
  primaryKey: 'userid',
  fields: [
    {
      name: 'userid',
      type: 'number',
      label: '编号',
      required: true,
    },
    {
      name: 'name',
      type: 'string',
      label: '姓名',
    },
    {
      name: 'age',
      type: 'number',
      label: '年龄',
    },
    {
      name: 'sex',
      type: 'string',
      label: '性别',
      lookupCode: 'HR.EMPLOYEE_GENDER',
      required: true,
    },
    { name: 'email', type: 'string', label: '邮箱' },
    { name: 'active', type: 'boolean', label: '在线' },
  ],
  transport: {
    read: () => {
      return {
        // 此处设置的url无效，但是官网是可行的
        url: 'https://www.fastmock.site/mock/423302b318dd24f1712751d9bfc1cbbc/mock/guide/user',
        method: 'GET',
      };
    }
  },
};
const treeDs = {
  primaryKey: 'userid',
  autoQuery: true,
  parentField: 'parentId',
  expandField: 'expand',
  idField: 'userid',
  fields: [
    { name: 'userid', type: 'number' },
    { name: 'expand', type: 'boolean' },
    { name: 'parentId', type: 'number' },
  ],
  data: [
    { userid: 1, expand: true },
    { userid: 11, expand: true, parentId: 1 },
    { userid: 12, expand: true, parentId: 1 },
    { userid: 13, expand: true, parentId: 1 },
  ],
};
const commonQueryFields = [
  { name: 'enable', type: 'boolean', label: '是否开启' },
  { name: 'name', type: 'string', label: '姓名', defaultValue: 'Hugh' },
  { name: 'age', type: 'number', label: '年龄' },
]
const commonColumns = [
  { name: 'userid' },
  { name: 'name', editor: true },
  { name: 'age', editor: true },
  { name: 'sex', editor: true },
  { name: 'email', editor: true },
  { name: 'active', editor: true },
];

describe('DataSetProps', () => {
  describe('name', () => {
    it('name-自动生成 submitUrl，queryUrl，tlsUrl，validateUrl 正确性校验', () => {
      const ds = new DataSet({ ...commonDs, name: testName });
      expect(ds.tlsUrl).toBe(`/dataset/${testName}/languages`);
      expect(ds.validateUrl).toBe(`/dataset/${testName}/validate`);
      expect(ds.queryUrl).toBe(`/dataset/${testName}/queries`);
      expect(ds.submitUrl).toBe(`/dataset/${testName}/mutations`);
      expect(ds.exportUrl).toBe(`/dataset/${testName}/export`);
    })
  });

  describe('data', () => {
    it('data-验证初始化数据的数量及其数据字段的正确性', () => {
      const ds = new DataSet({ ...commonDs, data: data });
      if (ds.pageSize < data.length) {
        expect(ds.originalData.length).toBe(ds.pageSize);
      } else {
        expect(ds.originalData.length).toBe(data.length);
      }
      ds.originalData.map((record, i) => {
        expect(record.data).toEqual(data[i]);
      })
    })
  });

  describe('autoCreate', () => {
    it('autoCreate: true, autoQuery: false, 是否自动创建记录', () => {
      const ds = new DataSet({ ...commonDs, autoCreate: true, autoQuery: false })
      expect(ds.records.length).toBe(1);
      expect(ds.get(0)).toBeInstanceOf(Record);
    })
    it('autoCreate: false, autoQuery: false, 是否自动创建记录', () => {
      const ds = new DataSet({ ...commonDs, autoCreate: false, autoQuery: false })
      expect(ds.records.length).toBe(0);
      expect(ds.get(0)).toBeUndefined();
    })
    it('autoCreate: true, autoQuery: false, 存在初始数据, 是否自动创建记录', () => {
      const ds = new DataSet({ ...commonDs, autoCreate: true, autoQuery: false, data: data })
      expect(ds.records.length).toBe(data.length);
      ds.originalData.map((record, i) => {
        expect(record.data).toEqual(data[i]);
      })
      expect(ds.get(0)).not.toBeUndefined();
    })
    it('autoCreate: false, autoQuery: false, 存在初始数据, 是否自动创建记录', () => {
      const ds = new DataSet({ ...commonDs, autoCreate: false, autoQuery: false, data: data })
      expect(ds.records.length).toBe(data.length);
      ds.originalData.map((record, i) => {
        expect(record.data).toEqual(data[i]);
      })
      expect(ds.get(0)).not.toBeUndefined();
    })
  });

  describe('autoLocateFirst', () => {
    it('autoLocateFirst开启-多条初始数据', () => {
      const ds = new DataSet({ ...commonDs, autoLocateFirst: true, data: data });
      expect(ds.current).toBeInstanceOf(Record);
      expect(ds.get(0).isCurrent).toBeTruthy();
    })
    it('autoLocateFirst关闭-多条初始数据', () => {
      const ds = new DataSet({ ...commonDs, autoLocateFirst: false, data: data });
      expect(ds.current).toBeUndefined();
      expect(ds.get(0).isCurrent).toBeUndefined();
    })
  });

  // TODO: ①死数据无法翻页 ②由于弹出框的渲染位置并不在mount挂载的元素内部，因此find方法找不到
  // issue: https://github.com/enzymejs/enzyme/issues/2389
  // describe('modifiedCheck', () => {
  //   it('modifiedCheck: true,有记录更改,验证是否有警告提示', () => {
  //     const ds = new DataSet({ ...commonDs, modifiedCheck: true, data: randomData(30) });
  //     window.ds = ds;

  //     ds.get(0).set('name','changedName');
  //     ds.page(2);
  //     // const bodyEle = document.querySelector('body');
  //     const bodyEle = document.body.querySelector('div');
  //     const wrapper = mount(bodyEle);
  //     // const wrapper = mount(<span>test</span>)
  //     expect(wrapper.find('.c7n-pro-modal-content').length).toBe(1);
  //   })
  // });

  describe('queryDataSet', () => {
    it('queryDataSet-校验是否可以成功创建查询数据源', () => {
      const queryDs = new DataSet({
        autoCreate: true,
        fields: commonQueryFields,
      })
      const ds = new DataSet({ ...commonDs, queryDataSet: queryDs });
      expect(ds.queryDataSet).toBeInstanceOf(DataSet);
      expect(ds.queryDataSet.get(0)).toBeInstanceOf(Record);
      expect(ds.queryDataSet.get(0).get('name')).toBe('Hugh');
      expect(ds.queryDataSet.length).toBe(1);
    })
  });
  describe('fields', () => {
    it('fields-校验是否可以去设置字段属性数组', () => {
      const ds = new DataSet({ ...commonDs });
      commonDs.fields.map((eachFieldProp) => {
        expect(ds.fields.has(eachFieldProp.name)).toBeTruthy();
      })
    })
  });
  describe('queryFields', () => {
    it('设置queryFields-不设置queryDataSet-校验是否可以去设置查询字段属性数组', () => {
      const ds = new DataSet({
        ...commonDs,
        queryFields: commonQueryFields
      });
      expect(ds.queryDataSet).toBeInstanceOf(DataSet);
      commonQueryFields.map((eachFieldProp) => {
        expect(ds.queryDataSet.fields.has(eachFieldProp.name)).toBeTruthy();
      })
    })
    it('设置queryFields-设置queryDataSet-验证优先级', () => {
      const queryDataSetFields = [
        { name: 'enable1', type: 'boolean', label: '是否开启', defaultValue: true },
        { name: 'name1', type: 'string', label: '姓名', defaultValue: '通过queryDataSet设置' },
      ];
      const queryDs = new DataSet({
        autoCreate: true,
        fields: queryDataSetFields,
      })
      const ds = new DataSet({ ...commonDs, queryFields: commonQueryFields, queryDataSet: queryDs });
      
      expect(ds.queryDataSet).toBeInstanceOf(DataSet);
      commonQueryFields.map((eachFieldProp) => {
        expect(ds.queryDataSet.fields.has(eachFieldProp.name)).toBeTruthy();
      })
      // TODO: 查询字段的queryDateSet.length此处为0，但是官网为1
      // expect(ds.queryDataSet.get(0).get('name')).toBe(commonQueryFields[1].defaultValue);
    })
  });
})




