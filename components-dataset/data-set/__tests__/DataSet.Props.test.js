import React from 'react';
import { mount, render } from "enzyme";
import DataSet from "..";
import Record from '../Record';
import Tree from '../../../components-pro/tree';
import { testName, data, commonDs, commonQueryFields, simpleTreeDs, childDs, fatherDs } from "./mock";
import { randomData } from './utils';

describe('DataSet Props', () => {
  describe('selection', () => {
    it('value is single', () => {
      const singleDs = new DataSet({...simpleTreeDs, selection: 'single'});
      singleDs.records.forEach(record => {
        singleDs.select(record);
      });
      expect(singleDs.selected.length).toBe(1);
    });
  
    it('value is multiple', () => {
      const multipleDs = new DataSet({...simpleTreeDs, selection: 'multiple'});
      multipleDs.records.forEach(record => {
        multipleDs.select(record);
      });
      expect(multipleDs.selected.length).toBe(4);
    });
  
    it('value is false', () => {
      const noSelectionDs = new DataSet({...simpleTreeDs, selection: false});
      noSelectionDs.records.forEach(record => {
        noSelectionDs.select(record);
      });
      expect(noSelectionDs.selected.length).toBe(0);
    });
  });

  describe('selectionStrategy', () => {
    it('value is SHOW_ALL and choose all', () => {
      const showAllDs = new DataSet({...simpleTreeDs, selectionStrategy: 'SHOW_ALL'});
      showAllDs.records.forEach(record => {
        record.isSelected = true;
      });
      expect(showAllDs.treeSelected.length).toBe(4);
    });

    it('value is SHOW_ALL and only choose parent', () => {
      const showAllDs = new DataSet({...simpleTreeDs, selectionStrategy: 'SHOW_ALL'});
      showAllDs.records.forEach(record => {
        if(!record.get('parentId')) record.isSelected = true;
      });
      expect(showAllDs.treeSelected.length).toBe(1);
    });

    it('value is SHOW_ALL and only choose children', () => {
      const showAllDs = new DataSet({...simpleTreeDs, selectionStrategy: 'SHOW_ALL'});
      showAllDs.records.forEach(record => {
        if(record.get('parentId')) record.isSelected = true;
      });
      expect(showAllDs.treeSelected.length).toBe(3);
    });
  
    it('value is SHOW_PARENT and choose all', () => {
      const showParentDs = new DataSet({...simpleTreeDs, selectionStrategy: 'SHOW_PARENT'});
      showParentDs.records.forEach(record => {
        record.isSelected = true;
      });
      expect(showParentDs.treeSelected.length).toBe(1);
    });

    it('value is SHOW_PARENT and only choose parent', () => {
      const showParentDs = new DataSet({...simpleTreeDs, selectionStrategy: 'SHOW_PARENT'});
      showParentDs.records.forEach(record => {
        if(!record.get('parentId')) record.isSelected = true;
      });
      expect(showParentDs.treeSelected.length).toBe(1);
    });

    it('value is SHOW_PARENT and only choose children', () => {
      const showParentDs = new DataSet({...simpleTreeDs, selectionStrategy: 'SHOW_PARENT'});
      showParentDs.records.forEach(record => {
        if(record.get('parentId')) record.isSelected = true;
      });
      expect(showParentDs.treeSelected.length).toBe(0);
    });
  
    it('value is SHOW_CHILD and choose all', () => {
      const showChildDs = new DataSet({...simpleTreeDs, selectionStrategy: 'SHOW_CHILD'});
      showChildDs.forEach(record => {
        record.isSelected = true;
      });
      expect(showChildDs.treeSelected.length).toBe(3);
    });

    it('value is SHOW_CHILD and only choose parent', () => {
      const showChildDs = new DataSet({...simpleTreeDs, selectionStrategy: 'SHOW_CHILD'});
      showChildDs.forEach(record => {
        if(!record.get('parentId')) record.isSelected = true;
      });
      expect(showChildDs.treeSelected.length).toBe(0);
    });

    it('value is SHOW_CHILD and only choose children', () => {
      const showChildDs = new DataSet({...simpleTreeDs, selectionStrategy: 'SHOW_CHILD'});
      showChildDs.forEach(record => {
        if(record.get('parentId')) record.isSelected = true;
      });
      expect(showChildDs.treeSelected.length).toBe(3);
    });
  });

  describe('autoLocateAfterRemove', () => {
    // TODO: should keep it ?
    it('只有一条数据并开启autoLocateAfterRemove', () => {
      const testDs = new DataSet({...commonDs, autoLocateAfterRemove: true, data: data.slice(0, 1)});
      testDs.get(0).isCurrent = true;
      testDs.remove(testDs.records[0]);
      expect(testDs.get(0)).toBeUndefined();
    });

    it('超过一条数据并开启autoLocateAfterRemove', () => {
      const testDs = new DataSet({...commonDs, autoLocateAfterRemove: true, data})
      testDs.records.map(record => {
        record.isCurrent = false;
        return record;
      });
      const firstIsCurrent = testDs.records[0].isCurrent;
      testDs.records[2].isCurrent = true;
      const customIsCurrent = testDs.records[2].isCurrent;
      testDs.remove(testDs.records[2]);
      const autoIsCurrent = testDs.records[0].isCurrent;
      const obj = {firstIsCurrent, customIsCurrent, autoIsCurrent};
      expect(obj).toEqual({firstIsCurrent: false, customIsCurrent: true, autoIsCurrent: true});
    });

    it('超过一条数据并关闭autoLocateAfterRemove', () => {
      const testDs = new DataSet({...commonDs, autoLocateAfterRemove: false, data})
      testDs.records.map(record => {
        record.isCurrent = false;
        return record;
      });
      const firstIsCurrent = testDs.records[0].isCurrent;
      testDs.records[2].isCurrent = true;
      const customIsCurrent = testDs.records[2].isCurrent;
      testDs.remove(testDs.records[2]);
      const autoIsCurrent = testDs.records[0].isCurrent;
      const obj = {firstIsCurrent, customIsCurrent, autoIsCurrent};
      expect(obj).toEqual({firstIsCurrent: false, customIsCurrent: true, autoIsCurrent: false});
    });
  });

  describe('autoLocateAfterCreate', () => {
    it('没有数据并打开autoLocateAfterCreate', () => {
      const testDs = new DataSet({...commonDs, autoLocateAfterCreate: true});
      testDs.create(data.slice(0, 1));
      expect(testDs.get(0).isCurrent).toBeTruthy();
    });

    it('没有数据并关闭autoLocateAfterCreate', () => {
      const testDs = new DataSet({...commonDs, autoLocateAfterCreate: false});
      testDs.create(data.slice(0, 1));
      expect(testDs.get(0).isCurrent).toBeFalsy();
    });

    it('超过一条数据并打开autoLocateAfterCreate', () => {
      const testDs = new DataSet({...commonDs, autoLocateAfterCreate: true, data});
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

    it('超过一条数据并打开autoLocateAfterCreate', () => {
      const testDs = new DataSet({...commonDs, autoLocateAfterCreate: false, data});
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

  describe('checkField', () => {
    it('checkField是否有效', () => {
      const data = simpleTreeDs.data.map(data => ({...data, check: true}));
      const testDsWithoutCheckField = new DataSet({...simpleTreeDs, data});
      const testDsWithCheckField = new DataSet({...simpleTreeDs, data, checkField: 'check'});
      const wrapperWithoutCheckField = mount(<Tree checkable dataSet={testDsWithoutCheckField} />)
      const wrapperWithCheckField = mount(<Tree checkable dataSet={testDsWithCheckField} />)
      const checkedCount1 = wrapperWithoutCheckField.find('.c7n-tree-checkbox-checked').length;
      const checkedCount2 = wrapperWithCheckField.find('.c7n-tree-checkbox-checked').length;
      expect({checkedCount1, checkedCount2}).toEqual({checkedCount1: 0, checkedCount2: 4});
    });
  });

  describe('expandField', () => {
    it('expandField是否有效', () => {
      const testDsBefore = new DataSet({...simpleTreeDs, expandField: undefined});
      const testDsAfter = new DataSet(simpleTreeDs);
      const obj = {beforeIsExpanded: testDsBefore.get(0).isExpanded, afterIsExpanded: testDsAfter.get(0).isExpanded};
      expect(obj).toEqual({beforeIsExpanded: false, afterIsExpanded: true});
    });
  });

  describe('pageSize', () => {
    it('pageSize: 5, paging: true', () => {
      const testDs = new DataSet({...commonDs, pageSize: 5, paging: true, data: randomData(11)});
      const obj = {
        currentPage: testDs.currentPage,
        totalCount: testDs.totalCount,
        totalPage: testDs.totalPage,
        pageSize: testDs.pageSize,
        paging: testDs.paging,
      };
      expect(obj).toEqual({currentPage: 1, totalCount: 11, totalPage: 3, pageSize: 5, paging: true});
    });

    it('pageSize: 5, paging: false', () => {
      const testDs = new DataSet({...commonDs, pageSize: 5, paging: false, data: randomData(11)});
      const obj = {
        currentPage: testDs.currentPage,
        totalCount: testDs.totalCount,
        totalPage: testDs.totalPage,
        pageSize: testDs.pageSize,
        paging: testDs.paging,
      };
      expect(obj).toEqual({currentPage: 1, totalCount: 11, totalPage: 1, pageSize: 5, paging: false});
    });
  })

  describe('queryParameter', () => {
    it('queryParameter是否添加上查询参数', async () => {
      const testDs = new DataSet({
        ...commonDs,
        queryParameter: {page: 2, pageSize: 123},
        events: {
          query({params}) {
            expect({pageSize: params.pageSize, page: params.page}).toEqual({pageSize: 123, page: 2});
          }
        },
      });
      await testDs.query();
    });
  });

  describe('combineSort', () => {
    it('combineSort 设置为 true', async () => {
      const testDs = new DataSet({
        ...commonDs,
        fields: commonDs.fields.map(field => {
          field.order = 'asc';
          return field;
        }),
        combineSort: true,
        data, 
        events: {
          query({params}) {
            expect(params.sort).toEqual(["userid,asc", "name,asc", "age,asc", "sex,asc", "email,asc", "active,asc"]);
          },
        },
      });
      await testDs.query();
    });
  
    it('combineSort 设置为 false', async () => {
      const testDs = new DataSet({
        ...commonDs,
        fields: commonDs.fields.map(field => {
          field.order = 'asc';
          return field;
        }),
        combineSort: false,
        data, 
        events: {
          query({params}) {
            expect(params.sort).toBeUndefined();
          },
        },
      });
      await testDs.query();
    });
  })

  describe('dataToJSON', () => {
    it('值为dirty时测试本身改变和级联数据改变的情况', () => {
      const dataToJSON = 'dirty';
      const count = Math.floor(Math.random() * (data.length - 1));
      const testDs = new DataSet({...commonDs, data, dataToJSON});
      const childrenDs = new DataSet({...childDs, dataToJSON});
      const parentDs = new DataSet({
        ...fatherDs,
        dataToJSON,
        children: {'info.view': childrenDs},
      });
      testDs.forEach((record, index) => {
        if(index < count) record.set('name', 'newName' + index);
      });
      childrenDs.get(0).set('nickName', 'newNickName');
      expect(testDs.toJSONData().length).toBe(count);
      expect(parentDs.toJSONData().length).toBe(1);
    });

    // TODO: is it right ?
    it('值为dirty-field时测试本身改变和级联数据改变的情况', () => {
      const dataToJSON = 'dirty-field';
      const childrenDs = new DataSet({...childDs, dataToJSON});
      const parentDs = new DataSet({
        ...fatherDs,
        dataToJSON,
        children: {'info.view': childrenDs},
      });
      // 修改本身和级联数据
      parentDs.get(0).set('name', 'newName');
      childrenDs.get(0).set('nickName', 'newNickName');
      // 转换了一条数据
      expect(parentDs.toJSONData().length).toBe(1);
      // 转换数据包含了修改的字段
      expect(parentDs.toJSONData()[0]['name']).toBe('newName');
      expect(parentDs.toJSONData()[0]['info']['view'].length).toBeGreaterThan(0);
      // 转换数据不包含未修改字段
      expect(parentDs.toJSONData()[0]['tel']).toBeUndefined();
    });

    // TODO: 不会转换级联数据吗
    it('value is selected', () => {
      const dataToJSON = 'selected';
      const testDs = new DataSet({...commonDs, data, dataToJSON});
      // const childrenDs = new DataSet({...childDs, dataToJSON});
      // const parentDs = new DataSet({
      //   ...fatherDs,
      //   dataToJSON,
      //   children: {'info.view': childrenDs},
      // });
      // 勾选第一条 修改第二条
      testDs.get(0).isSelected = true;
      testDs.get(1).set('name', 'newName');
      // TODO: 只勾选级联数据 不会转换吗
      // childrenDs.get(0).isSelected = true;
      expect(testDs.toJSONData().length).toBe(1);
      // expect(parentDs.toJSONData().length).toBe(1);
    });

    it('value is all', () => {
      const dataToJSON = 'all';
      const childrenDs = new DataSet({...childDs, dataToJSON});
      const parentDs = new DataSet({
        ...fatherDs,
        dataToJSON,
        children: {'info.view': childrenDs},
      });
      const flag = parentDs.toJSONData().every(({info: {view}}) => view.length > 0);
      expect(parentDs.toJSONData().length).toBe(2);
      expect(flag).toBeTruthy();
    });

    it('value is normal', () => {
      const dataToJSON = 'normal';
      const childrenDs = new DataSet({...childDs, dataToJSON});
      const parentDs = new DataSet({
        ...fatherDs,
        dataToJSON,
        children: {'info.view': childrenDs},
      });
      parentDs.remove(parentDs.get(0));
      const result = parentDs.toJSONData();
      const resultLength = result.length;
      const flag = parentDs.toJSONData().every(data => {
        const condition1 = data["__status"] === undefined && data["__id"] === undefined;
        const condition2 = data.info.view.every(oo => (oo["__status"] === undefined && oo["__id"] === undefined && oo !== undefined));
        return condition1 && condition2;
      });
      // 判断临时移除一行 以及 是否包含 __status & __id
      expect({resultLength, flag}).toEqual({resultLength: 1, flag: true});
    });

    it('value is dirty-self', () => {
      const dataToJSON = 'dirty-self';
      const childrenDs = new DataSet({...childDs, dataToJSON});
      const parentDs = new DataSet({
        ...fatherDs,
        dataToJSON,
        children: {'info.view': childrenDs},
      });
      childrenDs.get(0).set('nickName', 'newNickName');
      parentDs.get(0).set('name', 'newName');
      // 同时修改本身和级联的值 只转换本身修改的值
      expect(parentDs.toJSONData().length).toBe(1);
      expect(parentDs.toJSONData()[0].name === 'newName').toBeTruthy();
      expect(parentDs.toJSONData()[0].info.view[0].nickName === 'testNickName').toBeTruthy();
    });

    it('value is dirty-field-self', () => {
      const dataToJSON = 'dirty-field-self';
      const childrenDs = new DataSet({...childDs, dataToJSON});
      const parentDs = new DataSet({
        ...fatherDs,
        dataToJSON,
        children: {'info.view': childrenDs},
      });
      // 修改本身和级联数据
      parentDs.get(0).set('name', 'newName');
      childrenDs.get(0).set('nickName', 'newNickName');
      // 转换了一条数据
      expect(parentDs.toJSONData().length).toBe(1);
      // 转换数据包含了修改的字段
      expect(parentDs.toJSONData()[0]['name']).toBe('newName');
      // 不转换级联数据
      expect(parentDs.toJSONData()[0]['info']).toBeUndefined();
      // 转换数据不包含未修改字段
      expect(parentDs.toJSONData()[0]['tel']).toBeUndefined();
    });

    it('value is selected-self', () => {
      const dataToJSON = 'selected-self';
      const testDs = new DataSet({...commonDs, dataToJSON, data})
      const childrenDs = new DataSet({...childDs, dataToJSON});
      const parentDs = new DataSet({
        ...fatherDs,
        dataToJSON,
        children: {'info.view': childrenDs},
      });
      testDs.get(0).isSelected = true;
      testDs.get(1).set('name', 'newName');
      childrenDs.get(0).isSelected = true;
      expect(testDs.toJSONData().length).toBe(1);
      expect(parentDs.toJSONData().length).toBe(0);
    });

    it('value is all-self', () => {
      const dataToJSON = 'all-self';
      const childrenDs = new DataSet({...childDs, dataToJSON});
      const parentDs = new DataSet({
        ...fatherDs,
        dataToJSON,
        children: {'info.view': childrenDs},
      });
      parentDs.get(0).set('name', 'newName');
      childrenDs.get(0).set('nickName', 'newNickName');
      const flag = parentDs.toJSONData().every(jsonData => {
        return jsonData.info.view[0].nickName !== 'newNickName';
      });
      expect(parentDs.toJSONData().length).toBe(2);
      expect(parentDs.toJSONData()[0].name === 'newName').toBeTruthy();
      expect(flag).toBeTruthy();
    });

    // TODO: 转换了级联数据
    it('value is normal-self', () => {
      const dataToJSON = 'normal-self';
      const childrenDs = new DataSet({...childDs, dataToJSON});
      const parentDs = new DataSet({
        ...fatherDs,
        dataToJSON,
        children: {'info.view': childrenDs},
      });
      parentDs.remove(parentDs.get(0));
      childrenDs.get(0).set('nickName', 'newNickName');
      const result = parentDs.toJSONData();
      const resultLength = result.length;
      const flag = result.every(data => {
        const condition1 = data["__status"] === undefined && data["__id"] === undefined;
        const condition2 = data.info.view[0].nickName !== 'newNickName';
        return condition1 && condition2;
      });
      // 判断临时移除一行 是否包含 __status & __id 为转换级联数据
      expect({resultLength, flag}).toEqual({resultLength: 1, flag: true});
    });
  })

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
      expect(ds.queryDataSet).toEqual(queryDs);
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

  describe('modifiedCheck', () => {
    // TODO: ①死数据无法翻页 ②由于弹出框的渲染位置并不在mount挂载的元素内部，因此find方法找不到，因此根据其判定逻辑侧面进行证明
    // issue: https://github.com/enzymejs/enzyme/issues/2389
    it('modifiedCheck: true,有记录更改,验证是否有警告提示', () => {
      const ds = new DataSet({ ...commonDs, modifiedCheck: true, data: data, pageSize: 5 });
      const { modifiedCheck, cacheModified } = ds.props;
      expect(cacheModified || !modifiedCheck || !ds.dirty).toBeTruthy();
      ds.get(0).set('name', 'changedName');
      ds.page(2);
      expect(cacheModified || !modifiedCheck || !ds.dirty).toBeFalsy();
    })
    it('modifiedCheck: true,没有记录更改,验证是否有警告提示', () => {
      const ds = new DataSet({ ...commonDs, modifiedCheck: true, data: data, pageSize: 5 });
      const { modifiedCheck, cacheModified } = ds.props;
      expect(cacheModified || !modifiedCheck || !ds.dirty).toBeTruthy();
      ds.page(2);
      expect(cacheModified || !modifiedCheck || !ds.dirty).toBeTruthy();
    })
    it('modifiedCheck: true,做了更改又改回去,验证是否有警告提示', () => {
      const ds = new DataSet({ ...commonDs, modifiedCheck: true, data: data, pageSize: 5 });
      const { modifiedCheck, cacheModified } = ds.props;
      expect(cacheModified || !modifiedCheck || !ds.dirty).toBeTruthy();
      ds.get(0).set('name', 'changedName');
      ds.get(0).set('name', data[0].name);
      ds.page(2);
      expect(cacheModified || !modifiedCheck || !ds.dirty).toBeTruthy();
    })

    it('modifiedCheck: false,有记录更改,验证是否有警告提示', () => {
      const ds = new DataSet({ ...commonDs, modifiedCheck: false, data: data, pageSize: 5 });
      const { modifiedCheck, cacheModified } = ds.props;
      expect(cacheModified || !modifiedCheck || !ds.dirty).toBeTruthy();
      ds.get(0).set('name', 'changedName');
      ds.page(2);
      expect(cacheModified || !modifiedCheck || !ds.dirty).toBeTruthy();
    })
    it('modifiedCheck: false,无记录更改,验证是否有警告提示', () => {
      const ds = new DataSet({ ...commonDs, modifiedCheck: false, data: data, pageSize: 5 });
      const { modifiedCheck, cacheModified } = ds.props;
      expect(cacheModified || !modifiedCheck || !ds.dirty).toBeTruthy();
      ds.page(2);
      expect(cacheModified || !modifiedCheck || !ds.dirty).toBeTruthy();
    })
    it('modifiedCheck: false,做了更改又改回去,验证是否有警告提示', () => {
      const ds = new DataSet({ ...commonDs, modifiedCheck: true, data: data, pageSize: 5 });
      const { modifiedCheck, cacheModified } = ds.props;
      expect(cacheModified || !modifiedCheck || !ds.dirty).toBeTruthy();
      ds.get(0).set('name', 'changedName');
      ds.get(0).set('name', data[0].name);
      ds.page(2);
      expect(cacheModified || !modifiedCheck || !ds.dirty).toBeTruthy();
    })
  });
})