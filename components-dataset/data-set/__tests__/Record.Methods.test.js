import React from 'react';
import { mount, render } from "enzyme";
import DataSet from "..";
import Record from '../Record';
import Field from '../Field';
import Tree from '../../../components-pro/tree';
import { testName, data, commonDs, commonQueryFields, simpleTreeDs, childDs, fatherDs } from "./mock";
import { randomData } from './utils';

describe('Record Methods', () => {
  describe('get', () => {
    it('get(fieldName)-校验是否会根据字段名获取字段值（fieldName为字段名）', () => {
      const firstData = data[0];
      const ds = new DataSet({...commonDs, data: data.slice(0, 1)});
      Object.keys(firstData).forEach(key => {
        expect(ds.get(0).get(key)).toBe(firstData[key]);
      });
    });
    it('get([...fieldNames])-校验是否会根据字段名数组获取字段名与字段值的map（fieldName为字段名数组）', () => {
      const firstData = data[0];
      const ds = new DataSet({...commonDs, data: data.slice(0, 1)});
      // expect(ds.get(0).get(Array.from(Object.keys(firstData)))).toBeInstanceOf(Map);
      const obj = ds.get(0).get(Array.from(Object.keys(firstData)));
      expect(obj).toEqual(firstData);
    });
  });

  describe('getPristineValue', () => {
    it('getPristineValue(fieldName)-该数据有过变更-根据字段名获取字段的原始值', () => {
      const mockData = randomData(1);
      const ds = new DataSet({...commonDs, data: mockData});
      ds.get(0).set('name', 'newName');
      expect(ds.get(0).getPristineValue('name')).toBe(mockData[0].name);
    });

    it('getPristineValue(fieldName)-该数据没有过变更-根据字段名获取字段的原始值', () => {
      const mockData = randomData(1);
      const ds = new DataSet({...commonDs, data: mockData});
      expect(ds.get(0).getPristineValue('name')).toBe(mockData[0].name);
    });
  })
  
  describe('set', () => {
    it('set(fieldName, value)-校验是否给指定字段正确赋值', () => {
      const ds = new DataSet({...commonDs, data: randomData(1)});
      ds.get(0).set('name', 'newName');
      expect(ds.get(0).get('name')).toBe('newName');
    });

    it('set(fieldName, value)-校验是否给键值对对象正确赋值', () => {
      const ds = new DataSet({...commonDs, data: randomData(1)});
      ds.get(0).set({name: 'newName', email: 'newEmail'});
      expect(ds.get(0).get('name')).toBe('newName');
      expect(ds.get(0).get('email')).toBe('newEmail');
    });
  })
  
  describe('init', () => {
    it('init(fieldName, value)-校验是否给指定字段名初始化值-且字段变为净值', () => {
      const ds = new DataSet({...commonDs, data: randomData(1)});
      ds.get(0).init('name', 'newName');
      expect(ds.dirty).toBeFalsy();
      expect(ds.get(0).get('name')).toBe('newName');
    });

    it('init(fieldName, value)-校验是否给指定字段名初始化值-且字段变为净值', () => {
      const ds = new DataSet({...commonDs, data: randomData(1)});
      ds.get(0).init({name: 'newName', email: 'newEmail'});
      expect(ds.dirty).toBeFalsy();
      expect(ds.get(0).get('name')).toBe('newName');
      expect(ds.get(0).get('email')).toBe('newEmail');
    });
  });

  describe('getState', () => {
    it('getState(key)-根据key取，校验获取到的自定义状态值', () => {
      const ds = new DataSet({...commonDs, data: randomData(1)});
      ds.get(0).setState('customizedKey', '123');
      expect(ds.get(0).getState('customizedKey')).toBe('123');
    });
  });
  
  describe('toData', () => {
    it('toData()-数据本来就是普通数据-用该方法校验转换成的数据是不是依然是普通数据', () => {
      const ds = new DataSet({...commonDs, data});
      expect(ds.get(0).toData()).toEqual({...data[0], __dirty: false});
    });
  });

  describe('getCascadeRecords', () => {
    it('getCascadeRecords(childName)-该级联名有级联子数据-校验是否根据该方法获取子级联数据', () => {
      const childrenDs = new DataSet(childDs);
      const parentDs = new DataSet({...fatherDs, children: {'info.view': childrenDs}});
      const ds = new DataSet({...commonDs, data});
      expect(parentDs.get(0).getCascadeRecords('info.view').length).toBe(1);
      expect(parentDs.get(0).getCascadeRecords('info.view')).toBeDefined();
      expect(ds.get(0).getCascadeRecords('info.view')).toBeUndefined();
    });
  });

  describe('getField', () => {
    it('getField(fieldName)-fieldName有或没有对应的Field-校验通过该方法是否可以正确获取到对应的Field', () => {
      const ds = new DataSet({...commonDs, data});
      expect(ds.get(0).getField('name').get('name')).toBe('name');
      // expect(ds.get(0).getField('error').get('name')).toBeUndefined();
    });
  });

  describe('addField', () => {
    it('addField(fieldName, fieldProps)-添加的数据是ds里面没有的-校验是否通过该方法成功添加', () => {
      const ds = new DataSet({...commonDs, data});
      ds.get(0).addField('newField', {required: true, disabled: true});
      expect(ds.getField('newField').get('required')).toBeTruthy();
      expect(ds.getField('newField').get('disabled')).toBeTruthy();
      expect(ds.get(0).getField('newField').get('required')).toBeTruthy();
      expect(ds.get(0).getField('newField').get('disabled')).toBeTruthy();
    });

    it('addField(fieldName, fieldProps)-添加的数据是ds里面存在的-校验调用该方法是否替换原来的数据', () => {
      const ds = new DataSet({...commonDs, data});
      ds.get(0).addField('userid', {type: 'string', required: false});
      expect(ds.getField('userid').get('type')).toBe('number');
      expect(ds.getField('userid').get('required')).toBeTruthy();
      expect(ds.get(0).getField('userid').get('type')).toBe('string');
      expect(ds.get(0).getField('userid').get('required')).toBeFalsy();
    });
  });
  
  describe('clone', () => {
    it('clone()-记录中有主键-校验该方法是否成功克隆记录并且是否会剔除主键', () => {
      const ds = new DataSet({...commonDs, data});
      const cloneRecord = ds.get(0).clone();
      expect(cloneRecord.get('userid')).toBeUndefined();
      expect({...cloneRecord.toData(), userid: 1, __dirty: false}).toEqual(ds.get(0).toData());
    });

    it('clone()-记录中没有主键-校验该方法是否成功克隆记录', () => {
      const temp = {...commonDs};
      delete temp.primaryKey;
      const ds = new DataSet({...temp, data});
      const cloneRecord = ds.get(0).clone();
      expect({...cloneRecord.toData(), __dirty: false}).toEqual(ds.get(0).toData());
    });
  });

  describe('reset', () => {
    it('reset()-有数据进行了更改-调用该方法，校验是否重置更改', () => {
      const ds = new DataSet({...commonDs, data});
      ds.get(0).set('name', 'newName1');
      ds.get(1).set('name', 'newName2');
      ds.get(0).reset();
      expect(ds.get(0).get('name')).toBe('假数据宋江');
      expect(ds.get(1).get('name')).toBe('newName2');
    });
  });
  
  describe('save & restore', () => {
    it('先save再restore 是否能成功恢复缓存', () => {
      const ds = new DataSet({...commonDs, data});
      ds.get(0).set('name', 'newName');
      ds.get(0).save();
      ds.get(0).set('name', 'Lebron James');
      expect(ds.get(0).get('name')).toBe('Lebron James');
      ds.get(0).restore();
      expect(ds.get(0).get('name')).toBe('newName');
    });
  });
  
  describe('clear', () => {
    it('clear()-调用该方法，校验数据是否被全部清除', () => {
      const ds = new DataSet({...commonDs, data});
      ds.get(0).clear();
      Array.from(Object.keys(data[0])).forEach(key => {
        expect(ds.get(0).get(key)).toBeNull();
      });
    });
  });

  describe('getValidationErrors', () => {
    it('getValidationErrors()-有错误信息-调用该方法校验是否返回field、errors、valid: false', async () => {
      const ds = new DataSet({...commonDs, data});
      ds.getField('name').set('required', true);
      ds.get(0).set('name', null);
      expect(ds.get(0).getValidationErrors().length).toBe(0);
      const flag = await ds.get(0).validate(true, true);
      expect(flag).toBeFalsy();
      expect(ds.get(0).getValidationErrors().length).toBe(1);
      expect(ds.get(0).getValidationErrors()[0].valid).toBeFalsy();
      expect(ds.get(0).getValidationErrors()[0].field).toBeInstanceOf(Field);
      expect(ds.get(0).getValidationErrors()[0].errors.length).toBeGreaterThan(0);
    });
  });
});
