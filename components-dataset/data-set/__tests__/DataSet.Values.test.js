import DataSet from '..';
import Record from '../Record';
import { data, commonDs } from "./mock";
import { randomIdx, randomData } from './utils';

describe('DataSet Values', () => {
  describe('length', () => {
    it('dataSet.length是否正确', () => {
      const testDs = new DataSet({...commonDs, data});
      // const idx = Math.floor(Math.random() * );
      const idx = randomIdx(data.length);
      testDs.forEach((record, index) => {
        if(index < idx) record.isSelected = true;
      });
      const length = testDs.selected.length + testDs.unSelected.length;
      expect(testDs.length === length && testDs.length === data.length).toBeTruthy();
    });
  });

  describe('current', () => {
    it('获取的dataSet.current是否正确', () => {
      const testDs = new DataSet({...commonDs, data});
      // const idx = Math.floor(Math.random() * data.length);
      const idx = randomIdx(data.length);
      testDs.forEach(record => record.isCurrent = false);
      testDs.get(idx).isCurrent = true;
      expect(testDs.current.index).toBe(idx);
    });

    it('设置的dataSet.current是否正确', () => {
      const testDs = new DataSet({...commonDs, data});
      // const idx = Math.floor(Math.random() * data.length);
      const idx = randomIdx(data.length);
      // testDs.forEach(record => record.isCurrent = false);
      testDs.current = testDs.get(idx);
      expect(testDs.get(idx).isCurrent).toBeTruthy();
    });
  });

  describe('currentIndex', () => {
    it('是否获取了当前游标索引(currentIndex)', () => {
      const testDs = new DataSet({...commonDs, data});
      // const idx = Math.floor(Math.random() * data.length);
      const idx = randomIdx(data.length);
      testDs.forEach(record => record.isCurrent = false);
      testDs.get(idx).isCurrent = true;
      expect(testDs.currentIndex).toBe(idx);
    });
  })

  describe('records', () => {
    it('校验记录是否为正确的全部记录', () => {
      const length = randomIdx(1, 10);
      const data = randomData(length);
      const fields = Array.from(Object.keys(data[0]));
      const testDs = new DataSet({...commonDs, data});
      const flag = testDs.every((record, index) => {
        return fields.every(field => {
          return record.get(field) === data[index][field];
        });
      });
      expect(testDs.records.length).toBe(length);
      expect(flag).toBeTruthy();
    });

    it('校验是否有全部字段', () => {
      const length = randomIdx(1, 10);
      const data = randomData(length);
      const testDs = new DataSet({...commonDs, data});
      const fields = commonDs.fields;
      const flag = testDs.every(record => {
        return fields.every(field => {
          return record.getField(field.name) !== undefined;
        });
      });
      expect(flag).toBeTruthy();
    });
  })

  describe('dirty', () => {
    it('dirty是否判断正确', () => {
      const testDs1 = new DataSet({...commonDs, data});
      const testDs2 = new DataSet({...commonDs, data});
      const dirty1 = testDs1.dirty;
      const dirty2 = testDs2.dirty;
      const idx = randomIdx(data.length);
      testDs1.get(idx).set('name', 'newName');
      testDs1.get(idx).status = 'sync';
      testDs2.get(idx).status = 'sync';
      const dirty3 = testDs1.dirty;
      const dirty4 = testDs2.dirty;
      expect(dirty1).toBeFalsy();
      expect(dirty2).toBeFalsy();
      expect(dirty3).toBeTruthy();
      expect(dirty4).toBeFalsy();
    });  
  })

  describe('parent & children', () => {
    it('parent和children值是否正确', () => {
      const nameDs = new DataSet({fields: [{name: 'firstName', type: 'string'}, {name: 'lastName', type: 'string'}]});
      const infoDs = new DataSet({fields: [{name: 'nickName', type: 'string'}, {name: 'tel', type: 'string'}]});
      const parentDs = new DataSet({
        children: {
          'name.completeName': nameDs,
          'info.completeInfo': infoDs
        },
        fields: [
          {name: 'name', type: 'object'},
          {name: 'info', type: 'object'},
        ],
        data: [
          {name: {completeName: [{firstName: 'James', lastName: 'Lebron'}]}},
          {info: {completeInfo: [{nickName: 'TacoTuesday', tel: '12345678910'}]}},
        ],
      });
      expect(nameDs.parent).toEqual(infoDs.parent);
      expect(nameDs.parent).toEqual(parentDs);
      expect(parentDs.children['name.completeName']).toEqual(nameDs);
      expect(parentDs.children['info.completeInfo']).toEqual(infoDs);
    });
  })
  
  describe('status', () => {
    const ds = new DataSet({ ...commonDs });
    it('status ready', () => {
      expect(ds.status).toBe('ready');
    })
    it('status loading', () => {
      const beforeQueryStatus = ds.status;
      ds.query();
      const afterQueryStatus = ds.status;
      expect([beforeQueryStatus, afterQueryStatus]).toEqual(['ready', 'loading']);
    })
  });

  describe('数据变更后，验证 fields、records、created、updated、destroyed的正确性', () => {
    const checkFieldsValidation = (dataSet) =>{
      let index = 0;
      dataSet.fields.forEach((eachField) => {
        expect(eachField.type).toBe(commonDs.fields[index].type);
        expect(eachField.name).toBe(commonDs.fields[index].name);
        index++;
      });
    }
    it('初始化数据', () => {
      const ds = new DataSet({ ...commonDs, data: data });
      expect(ds.fields.size).toEqual(commonDs.fields.length);
      expect(ds.records.length).toEqual(data.length);
      checkFieldsValidation(ds);
      expect(ds.created).toEqual([]);
      expect(ds.updated).toEqual([]);
      expect(ds.destroyed).toEqual([]);
    });
    it('新建数据',()=>{
      const ds = new DataSet({ ...commonDs, data: data });
      const newUserData = {
        "userid": 100,
        "name": "新建用户",
        "sex": "M",
        "age": 99,
        "email": "newUser@qq.com",
        "active": true
      };
      ds.create(newUserData,0);
      expect(ds.fields.size).toEqual(commonDs.fields.length);
      expect(ds.records.length).toEqual(data.length+1);
      checkFieldsValidation(ds);
      expect(ds.created[0]).toBeInstanceOf(Record);
      expect(ds.updated).toEqual([]);
      expect(ds.destroyed).toEqual([]);
    });
    it('更新数据',()=>{
      const ds = new DataSet({ ...commonDs, data: data });
      ds.get(0).set('name','更新后的名字');

      expect(ds.get(0).get('name')).toBe('更新后的名字');
      expect(ds.fields.size).toEqual(commonDs.fields.length);
      expect(ds.records.length).toEqual(data.length);
      checkFieldsValidation(ds);
      expect(ds.created).toEqual([]);
      expect(ds.updated[0]).toBeInstanceOf(Record);
      expect(ds.destroyed).toEqual([]);
    });
    it('临时删除',()=>{
      const ds = new DataSet({ ...commonDs, data: data });
      ds.remove(ds.get(0));
      expect(ds.fields.size).toEqual(commonDs.fields.length);
      expect(ds.records.length).toEqual(data.length);
      expect(ds.length).toEqual(data.length-1);
      checkFieldsValidation(ds);
      expect(ds.created).toEqual([]);
      expect(ds.destroyed[0]).toBeInstanceOf(Record);
      expect(ds.updated).toEqual([]);
    });
    // TODO:ds.length有异步问题，因此Expected: 7 Received: 8
    // it('立即删除',()=>{
    //   const ds = new DataSet({ ...commonDs, data: data });
    //   ds.delete(ds.get(0),false);
    //   expect(ds.fields.size).toEqual(commonDs.fields.length);
    //   expect(ds.records.length).toEqual(data.length);
    //   expect(ds.length).toEqual(data.length-1);
    //   checkFieldsValidation(ds);
    //   expect(ds.created).toEqual([]);
    //   expect(ds.destroyed[0]).toBeInstanceOf(Record);
    //   expect(ds.updated).toEqual([]);
    // });
  })

  describe('currentSelected、currentUnSelected', () => {
    it('勾选当前页部分数据', () => {
      const ds = new DataSet({ ...commonDs, data: data });
      const selectedIndexes = [0, 3, 6];
      const unSelectedIndexes = [1, 2, 4, 5,7];
      selectedIndexes.forEach((eachIndex) => {
        ds.get(eachIndex).isSelected = true;
      })
      expect(ds.currentSelected.length).toBe(selectedIndexes.length);
      ds.currentSelected.map((eachRecord, i) => {
        expect(eachRecord).toBeInstanceOf(Record);
        expect(eachRecord.get('userid')).toBe(data[selectedIndexes[i]].userid);
      })

      expect(ds.currentUnSelected.length).toBe(unSelectedIndexes.length);
      ds.currentUnSelected.map((eachRecord, i) => {
        expect(eachRecord).toBeInstanceOf(Record);
        expect(eachRecord.get('userid')).toBe(data[unSelectedIndexes[i]].userid);
      })
    })
    it('勾选当前页部分数据-翻页再勾选部分数据', () => {
      const ds = new DataSet({ ...commonDs, data: data });
      const selectedIndexes = [0, 3, 6];
      const unSelectedIndexes = [1, 2, 4, 5,7];
      selectedIndexes.forEach((eachIndex) => {
        // 勾选和非勾选记录反选
        ds.get(eachIndex).isSelected = true;
        ds.get(eachIndex).isSelected = false;
      })
      unSelectedIndexes.forEach((eachIndex) => {
        ds.get(eachIndex).isSelected = true;
      })
      // 此时unSelectedIndexes代表已选中索引数组，selectedIndexes代表未选中索引数组
      expect(ds.currentSelected.length).toBe(unSelectedIndexes.length);
      ds.currentSelected.map((eachRecord, i) => {
        expect(eachRecord).toBeInstanceOf(Record);
        expect(eachRecord.get('userid')).toBe(data[unSelectedIndexes[i]].userid);
      })

      expect(ds.currentUnSelected.length).toBe(selectedIndexes.length);
      ds.currentUnSelected.map((eachRecord, i) => {
        expect(eachRecord).toBeInstanceOf(Record);
        expect(eachRecord.get('userid')).toBe(data[selectedIndexes[i]].userid);
      })
    })
  });
});