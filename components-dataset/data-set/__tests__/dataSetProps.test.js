import React from 'react';
import { mount } from "enzyme";
import DataSet from "..";
import Table from "../../../components-pro/table";
import { randomData, rows } from "./mock";
import Record from '../Record';

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

const commonQueryFields = [
  { name: 'enable', type: 'boolean', label: '是否开启' },
  { name: 'name', type: 'string', label: '姓名', defaultValue: 'Hugh' },
  { name: 'age', type: 'number', label: '年龄' },
]

const simpleTreeDs = {
  primaryKey: 'userid',
  autoQuery: true,
  parentField: 'parentId',
  expandField: 'expand',
  checkField: 'check',
  idField: 'userid',
  fields: [
    { name: 'userid', type: 'number' },
    { name: 'expand', type: 'boolean' },
    { name: 'parentId', type: 'number' },
    { name: 'check', type: 'boolean' }
  ],
  data: [
    { userid: 1 },
    { userid: 11, parentId: 1 },
    { userid: 12, parentId: 1 },
    { userid: 13, parentId: 1 },
  ],
};

const largeTreeDs = {
  primaryKey: 'userid',
  // queryUrl: 'https://www.fastmock.site/mock/423302b318dd24f1712751d9bfc1cbbc/mock/treeqqq',
  // submitUrl: 'https://www.fastmock.site/mock/423302b318dd24f1712751d9bfc1cbbc/mock/tree',
  autoQuery: true,
  parentField: 'parentId',
  idField: 'userid',
  checkField: 'ischecked',
  combineSort: true,
  paging: 'server',
  fields: [
    { name: 'userid', type: 'number' },
    { name: 'text', type: 'string', label: '功能名称' },
    { name: 'url', type: 'string', label: '入口页面' },
    { name: 'expand', type: 'boolean', label: '是否展开' },
    { name: 'ischecked', type: 'boolean', label: '是否开启' },
    { name: 'score', type: 'number', label: '顺序', order: 'asc' },
    { name: 'parentId', type: 'number' },
  ],
  data: rows,
};


describe('selection about properties test', () => {
  describe('selection', () => {
    it('value is single', () => {
      const singleDs = new DataSet({ ...simpleTreeDs, selection: 'single' });
      singleDs.records.forEach(record => {
        singleDs.select(record);
      });
      expect(singleDs.selected.length).toBe(1);
    });

    it('value is multiple', () => {
      const multipleDs = new DataSet({ ...simpleTreeDs, selection: 'multiple' });
      multipleDs.records.forEach(record => {
        multipleDs.select(record);
      });
      expect(multipleDs.selected.length).toBe(4);
    });

    it('value is false', () => {
      const noSelectionDs = new DataSet({ ...simpleTreeDs, selection: false });
      noSelectionDs.records.forEach(record => {
        noSelectionDs.select(record);
      });
      expect(noSelectionDs.selected.length).toBe(0);
    });
  });

  describe('selectionStrategy', () => {
    it('value is SHOW_ALL and choose all', () => {
      const showAllDs = new DataSet({ ...simpleTreeDs, selectionStrategy: 'SHOW_ALL' });
      showAllDs.records.forEach(record => {
        record.isSelected = true;
      });
      expect(showAllDs.treeSelected.length).toBe(4);
    });

    it('value is SHOW_ALL and only choose parent', () => {
      const showAllDs = new DataSet({ ...simpleTreeDs, selectionStrategy: 'SHOW_ALL' });
      showAllDs.records.forEach(record => {
        if (!record.get('parentId')) record.isSelected = true;
      });
      expect(showAllDs.treeSelected.length).toBe(1);
    });

    it('value is SHOW_ALL and only choose children', () => {
      const showAllDs = new DataSet({ ...simpleTreeDs, selectionStrategy: 'SHOW_ALL' });
      showAllDs.records.forEach(record => {
        if (record.get('parentId')) record.isSelected = true;
      });
      expect(showAllDs.treeSelected.length).toBe(3);
    });

    it('value is SHOW_PARENT and choose all', () => {
      const showParentDs = new DataSet({ ...simpleTreeDs, selectionStrategy: 'SHOW_PARENT' });
      showParentDs.records.forEach(record => {
        record.isSelected = true;
      });
      expect(showParentDs.treeSelected.length).toBe(1);
    });

    it('value is SHOW_PARENT and only choose parent', () => {
      const showParentDs = new DataSet({ ...simpleTreeDs, selectionStrategy: 'SHOW_PARENT' });
      showParentDs.records.forEach(record => {
        if (!record.get('parentId')) record.isSelected = true;
      });
      expect(showParentDs.treeSelected.length).toBe(1);
    });

    it('value is SHOW_PARENT and only choose children', () => {
      const showParentDs = new DataSet({ ...simpleTreeDs, selectionStrategy: 'SHOW_PARENT' });
      showParentDs.records.forEach(record => {
        if (record.get('parentId')) record.isSelected = true;
      });
      expect(showParentDs.treeSelected.length).toBe(0);
    });

    it('value is SHOW_CHILD and choose all', () => {
      const showChildDs = new DataSet({ ...simpleTreeDs, selectionStrategy: 'SHOW_CHILD' });
      showChildDs.forEach(record => {
        record.isSelected = true;
      });
      expect(showChildDs.treeSelected.length).toBe(3);
    });

    it('value is SHOW_CHILD and only choose parent', () => {
      const showChildDs = new DataSet({ ...simpleTreeDs, selectionStrategy: 'SHOW_CHILD' });
      showChildDs.forEach(record => {
        if (!record.get('parentId')) record.isSelected = true;
      });
      expect(showChildDs.treeSelected.length).toBe(0);
    });

    it('value is SHOW_CHILD and only choose children', () => {
      const showChildDs = new DataSet({ ...simpleTreeDs, selectionStrategy: 'SHOW_CHILD' });
      showChildDs.forEach(record => {
        if (record.get('parentId')) record.isSelected = true;
      });
      expect(showChildDs.treeSelected.length).toBe(3);
    });
  });
});

describe('autoLocateAfter something...', () => {
  describe('autoLocateAfterRemove', () => {
    // TODO: should keep it ?
    it('just one piece of data and turn it on', () => {
      const testDs = new DataSet({ ...commonDs, autoLocateAfterRemove: true, data: data.slice(0, 1) });
      testDs.get(0).isCurrent = true;
      testDs.remove(testDs.records[0]);
      expect(testDs.get(0)).toBeUndefined();
    });

    it('more than one piece of data and turn it on', () => {
      const testDs = new DataSet({ ...commonDs, autoLocateAfterRemove: true, data })
      testDs.records.map(record => {
        record.isCurrent = false;
        return record;
      });
      const firstIsCurrent = testDs.records[0].isCurrent;
      testDs.records[2].isCurrent = true;
      const customIsCurrent = testDs.records[2].isCurrent;
      testDs.remove(testDs.records[2]);
      const autoIsCurrent = testDs.records[0].isCurrent;
      const obj = { firstIsCurrent, customIsCurrent, autoIsCurrent };
      expect(obj).toEqual({ firstIsCurrent: false, customIsCurrent: true, autoIsCurrent: true });
    });

    it('more than one piece of data and turn it off', () => {
      const testDs = new DataSet({ ...commonDs, autoLocateAfterRemove: false, data })
      testDs.records.map(record => {
        record.isCurrent = false;
        return record;
      });
      const firstIsCurrent = testDs.records[0].isCurrent;
      testDs.records[2].isCurrent = true;
      const customIsCurrent = testDs.records[2].isCurrent;
      testDs.remove(testDs.records[2]);
      const autoIsCurrent = testDs.records[0].isCurrent;
      const obj = { firstIsCurrent, customIsCurrent, autoIsCurrent };
      expect(obj).toEqual({ firstIsCurrent: false, customIsCurrent: true, autoIsCurrent: false });
    });
  });

  describe('autoLocateAfterCreate', () => {
    it('no data and turn it on', () => {
      const testDs = new DataSet({ ...commonDs, autoLocateAfterCreate: true });
      testDs.create(data.slice(0, 1));
      expect(testDs.get(0).isCurrent).toBeTruthy();
    });

    it('no data and turn it off', () => {
      const testDs = new DataSet({ ...commonDs, autoLocateAfterCreate: false });
      testDs.create(data.slice(0, 1));
      expect(testDs.get(0).isCurrent).toBeFalsy();
    });

    it('more than one piece data and turn it on', () => {
      const testDs = new DataSet({ ...commonDs, autoLocateAfterCreate: true, data });
      const index = testDs.length;
      testDs.create({
        "userid": 9,
        "name": "插入数据",
        "sex": "M",
        "age": 68,
        "email": "888888889@qq.com",
        "active": true
      });
      expect(testDs.get(index).isCurrent).toBeTruthy();
    });

    it('more than one piece data and turn it off', () => {
      const testDs = new DataSet({ ...commonDs, autoLocateAfterCreate: false, data });
      const index = testDs.length;
      testDs.create({
        "userid": 9,
        "name": "插入数据",
        "sex": "M",
        "age": 68,
        "email": "888888889@qq.com",
        "active": true
      });
      expect(testDs.get(index).isCurrent).toBeFalsy();
    });
  })

});

describe('pageSize about properties test', () => {
  describe('the correct paginated information', () => {
    it('pageSize: 5, paging: true', () => {
      const testDs = new DataSet({ ...commonDs, pageSize: 5, paging: true, data: randomData(11) });
      const obj = {
        currentPage: testDs.currentPage,
        totalCount: testDs.totalCount,
        totalPage: testDs.totalPage,
        pageSize: testDs.pageSize,
        paging: testDs.paging,
      };
      expect(obj).toEqual({ currentPage: 1, totalCount: 11, totalPage: 3, pageSize: 5, paging: true });
    });

    it('pageSize: 5, paging: false', () => {
      const testDs = new DataSet({ ...commonDs, pageSize: 5, paging: false, data: randomData(11) });
      const obj = {
        currentPage: testDs.currentPage,
        totalCount: testDs.totalCount,
        totalPage: testDs.totalPage,
        pageSize: testDs.pageSize,
        paging: testDs.paging,
      };
      expect(obj).toEqual({ currentPage: 1, totalCount: 11, totalPage: 1, pageSize: 5, paging: false });
    });

    // TODO: test in tree mode Table ?
    // it('pageSize: 5, paging: server', () => {
    //   const testDs = new DataSet({...largeTreeDs, pageSize: 5, paging: 'server'});
    //   const obj = {
    //     currentPage: testDs.currentPage,
    //     totalCount: testDs.totalCount,
    //     totalPage: testDs.totalPage,
    //     pageSize: testDs.pageSize,
    //     paging: testDs.paging,
    //   };
    //   expect(obj).toEqual({currentPage: 1, totalCount: 10, totalPage: 2, pageSize: 5, paging: 'server'});
    // });

    it('does expandField work correctly', () => {
      const testDsBefore = new DataSet({ ...simpleTreeDs, expandField: undefined });
      const testDsAfter = new DataSet({ ...simpleTreeDs, data: simpleTreeDs.data.map(item => ({ ...item, expand: true })) });
      const obj = { beforeIsExpanded: testDsBefore.get(0).isExpanded, afterIsExpanded: testDsAfter.get(0).isExpanded };
      expect(obj).toEqual({ beforeIsExpanded: false, afterIsExpanded: true });
    });

    // TODO: don'n knonw how to test it
    // it('does checkField work correctly', () => {
    //   const testDsBefore = new DataSet(simpleTreeDs);
    //   const testDsAfter = new DataSet({...simpleTreeDs, data: simpleTreeDs.data.map(item => ({...item, check: true}))});
    //   const obj = {beforeIsChecked: testDsBefore.get(0).isSelected, afterIsChecked: testDsAfter.get(0).isSelected};
    //   expect(obj).toEqual({beforeIsChecked: false, afterIsChecked: true});
    // });

    // TODO: lack of some conditions
    it('does cacheSelection work correctly', () => {

    });
  });
});

describe('query test', () => {
  it('does queryParameter work', () => {
    const testDs = new DataSet({
      ...commonDs,
      queryParameter: { page: 2, pageSize: 100 },
      events: {
        query({ params }) {
          expect({ pageSize: params.pageSize, page: params.page }).toEqual({ pageSize: 100, page: 2 });
        }
      },
    });
    testDs.query();
  });
});

describe('data processing transformation', () => {
  describe('dataToJSON', () => {
    beforeEach(() => {

    });
    it('value is dirty', () => {
      const testDs = new DataSet({ ...commonDs, data, dataToJSON: 'dirty' });
      testDs.get(0).set('name', 'newName');
      // expect(testDs.toJSONData()).toEqual([{"__id": 1111, "__status": "update", "active": true, "age": 68, "email": "6888888@qq.com", "userid": 1, "name": "newName", "sex": "M"}]);
      expect(testDs.toJSONData().length).toBe(1);
    });

    // TODO: is it right ?
    // it('value is dirty-field', () => {
    //   const childrenDs = new DataSet({
    //     fields: [
    //       {name: 'nickName', type: 'string'},
    //       {name: 'age', type: 'number'},
    //     ],
    //   });
    //   const testDs = new DataSet({
    //     dataToJSON: 'dirty-field',
    //     fields: [
    //       {name: 'info', type: 'object'},
    //       {anme: 'name', type: 'string'},
    //     ],
    //     data: [
    //       {
    //         name: 'testName',
    //         info: {
    //           view: [
    //             {nickName: 'testNickName', age: 12},
    //           ],
    //         }
    //       },
    //     ],
    //     children: {'info.view': childrenDs},
    //   });
    //   childrenDs.get(0).set('nickName', 'newNickName');
    //   expect(testDs.toJSONData().length).toBe(1);
    // });

    it('value is selected', () => {
      const testDs = new DataSet({ ...commonDs, data, dataToJSON: 'selected' });
      testDs.get(0).isSelected = true;
      testDs.get(1).set('name', 'newName');
      // expect(testDs.toJSONData()).toEqual([{"__id": 1119, "__status": "update", "active": true, "age": 68, "email": "6888888@qq.com", "userid": 1, "name": "假数据宋江", "sex": "M"}]);
      expect(testDs.toJSONData().length).toBe(1);
    });

    it('value is all', () => {
      const testDs = new DataSet({ ...commonDs, dataToJSON: 'all', data: data.slice(0, 2) });
      // expect(testDs.toJSONData()).toEqual([{"__id": 1127, "__status": "update", "active": true, "age": 68, "email": "6888888@qq.com", "userid": 1, "name": "假数据宋江", "sex": "M"}, {"__id": 1128, "__status": "update", "active": true, "age": 60, "email": "zhangfei@163.com", "userid": 2, "name": "假数据张飞", "sex": "M"}]);
      expect(testDs.toJSONData().length).toBe(2);
    });

    it('value is normal', () => {
      const testDs = new DataSet({ ...commonDs, dataToJSON: 'normal', data: data.slice(0, 3) });
      testDs.remove(testDs.get(0));
      const result = testDs.toJSONData();
      const resultLength = testDs.toJSONData().length;
      const flag = testDs.toJSONData().every(data => (data["__status"] === undefined && data["__id"] === undefined));
      // 判断临时移除一行 以及 是否包含 __status & __id
      expect({ result, resultLength, flag }).toEqual({
        result: [
          {
            "active": true,
            "age": 60,
            "email": "zhangfei@163.com",
            "userid": 2,
            "name": "假数据张飞",
            "sex": "M",
          },
          {
            "active": true,
            "age": 25,
            "email": "zhaoyun@163.com",
            "userid": 3,
            "name": "假数据赵云",
            "sex": "M",
          },
        ], resultLength: 2, flag: true
      });
    });

    // it('value is dirty-self', () => {
    //   const childrenDs = new DataSet({
    //     fields: [
    //       {name: 'nickName', type: 'string'},
    //       {name: 'age', type: 'number'},
    //     ],
    //   });
    //   const testDs = new DataSet({
    //     dataToJSON: 'dirty-self',
    //     fields: [
    //       {name: 'info', type: 'object'},
    //       {anme: 'name', type: 'string'},
    //     ],
    //     data: [
    //       {
    //         name: 'testName',
    //         info: {
    //           view: [
    //             {nickName: 'testNickName', age: 12},
    //           ],
    //         }
    //       },
    //     ],
    //     children: {'info.view': childrenDs},
    //   });
    //   childrenDs.get(0).set('nickName', 'newNickName');
    //   expect(testDs.toJSONData().length).toBe(0);
    // });

    it('value is dirty-field-self', () => {
      const testDs = new DataSet({
        ...commonDs,
        dataToJSON: 'dirty-field-self',
        data: data.slice(0, 1)
      })
      testDs.get(0).set('name', 'newName');
      // expect(testDs.toJSONData()).toEqual([{"__id": 1132, "__status": "update", "userid": 1, "name": "newName"}]);
      expect(testDs.toJSONData().length).toBe(1);
    });

    it('value is selected-self', () => {

    });

    it('value is all-self', () => {

    });

    it('value is normal-self', () => {

    });
  })
})

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
