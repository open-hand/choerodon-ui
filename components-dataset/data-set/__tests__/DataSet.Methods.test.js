import { data, commonDs, childDs, fatherDs, mockTableTreeDs, treeTableData } from "./mock";
import { randomData, randomIdx } from './utils';
import DataSet from '..';
import Record from '../Record';
import Field from '../Field';

describe('DataSet Methods', () => {
  // describe('ready()', () => {
  //   it('实例化一个DataSet检验ready方法的返回', () => {
  //     const testDs = new DataSet({...commonDs, data});
  //     const result = await testDs.ready()
  //     expect(result).toBeFalsy();
  //   });
  // });

  describe('query()', () => {
    // TODO: cache暂时没办法测试
    it('query(page, params, cache)', async () => {
      const testDs = new DataSet({
        ...commonDs,
        data,
        pageSize: 3,
        events: {
          query({params}) {
            expect(params.page).toBe(2);
            expect(params.condition).toBe('hugh');
          }
        },
      });
      // testDs.get(0).set('name', 'makabaka');
      await testDs.query(2, {condition: 'hugh'}, true);
    });

    // TODO: 不能得到查询后的结果
    it('queryMore(page, params, cache)', async () => {
      const testDs = new DataSet({
        ...commonDs,
        data,
        pageSize: 3,
        events: {
          query({params}) {
            expect(params.page).toBe(2);
            expect(params.condition).toBe('hugh');
          }
        },
      });
      // testDs.get(0).set('name', 'makabaka');
      await testDs.queryMore(2, {condition: 'hugh'});
    });
  });

  describe('submit()', () => {
    it('数据源无变更submit', async () => {
      const testDs = new DataSet({...commonDs, data});
      const res = await testDs.submit();
      expect(res).toBeUndefined();
    });

    // TODO: 无法正常提交
    // it('更改一条数据并校验成功submit', async () => {
    //   const testDs = new DataSet({...commonDs, data});
    //   testDs.get(0).set('name', null);
    //   const res = await testDs.submit();
    //   expect(res).toBeTruthy();
    // });

    it('更改一条数据并校验失败submit', async () => {
      const testDs = new DataSet({...commonDs, data});
      testDs.getField('name').set('required', true);
      testDs.get(0).set('name', null);
      const res = await testDs.submit();
      expect(res).toBeFalsy();
    });
  });
  
  describe('reset', () => {
    it('更改ds之后对比reset前后ds的更改项', () => {
      const testDs = new DataSet({...commonDs, data});
      testDs.get(0).set('name', 'newName');
      testDs.get(1).status = 'delete';
      testDs.remove(testDs.get(2));
      expect(testDs.length).toBe(data.length - 2);
      testDs.reset();
      expect(testDs.get(0).get('name')).toBe(data[0].name);
      expect(testDs.length).toBe(data.length);
    });
  });

  describe('deleteAll', () => {
    it('deleteAll是否删除所有记录', () => {
      const testDs = new DataSet({...commonDs, data});
      testDs.deleteAll(false);
      expect(testDs.length).toBe(0);
      expect(testDs.toData().length).toBe(0);
      // testDs.reset();
      // expect(testDs.length).toBe(0);
    });
  });

  describe('splice', () => {
    it('splice的删除、插入功能', () => {
      const testDs = new DataSet({...commonDs, data});
      // 确保至少删一个: -2
      const delStartIdx = randomIdx(data.length - 2);
      const delCount = randomIdx(1, data.length - 1 - delStartIdx);
      const insertCount = randomIdx(1, 6);
      const insertRecords = (new DataSet({...commonDs, data: randomData(insertCount)})).slice();
      testDs.splice(delStartIdx, delCount, ...insertRecords);
      expect(testDs.length).toBe(data.length - delCount + insertCount);
      expect(testDs.toData().length).toBe(data.length - delCount + insertCount);
    });
  });
  
  describe('slice', () => {
    it('slice截取并且不改变原记录', () => {
      const testDs = new DataSet({...commonDs, data});
      const startIdx = randomIdx(0, 4);
      const endIdx = randomIdx(4, 8);
      const length = testDs.length;
      const sliceRecords = testDs.slice(startIdx, endIdx);
      const idx = randomIdx(sliceRecords.length - 1);
      expect(testDs.length).toBe(length);
      expect(testDs.toData().length).toBe(length);
      expect(sliceRecords[idx]).toEqual(testDs.get(idx + startIdx));
    });
  });

  describe('indexOf', () => {
    it('起始索引为0 indexOf返回索引是否正确', () => {
      const testDs = new DataSet({...commonDs, data});
      const idx = randomIdx(data.length - 1);
      const record = testDs.get(idx);
      const index = testDs.indexOf(record, 0);
      expect(index).toBe(idx);
    });

    it('起始索引为2 目标索引大于2 indexOf返回索引是否正确', () => {
      const testDs = new DataSet({...commonDs, data});
      const record = testDs.get(4);
      const index = testDs.indexOf(record, 2);
      expect(index).toBe(4);
    });

    it('起始索引为2 目标索引小于2 indexOf返回索引是否正确', () => {
      const testDs = new DataSet({...commonDs, data});
      const record = testDs.get(1);
      const index = testDs.indexOf(record, 2);
      expect(index).toBe(-1);
    });
  });

  describe('reverse', () => {
    it('reverse之后的顺序是否正确', () => {
      const testDs = new DataSet({...commonDs, data});
      const firstRecord = testDs.get(0);
      const lastRecord = testDs.get(data.length - 1);
      testDs.reverse();
      expect(testDs.get(0)).toEqual(lastRecord);
      expect(testDs.get(data.length - 1)).toEqual(firstRecord);
    });
  });

  describe('batchSelect', () => {
    it('batchSelect通过records批量选择记录', () => {
      const testDs = new DataSet({...commonDs, data});
      const idx = randomIdx(1, data.length - 1);
      const records = testDs.slice(0, idx);
      testDs.batchSelect(records);
      const flag = testDs.every((record, index) => {
        if(index < idx) return record.isSelected === true;
        return true;
      });
      expect(flag).toBeTruthy();
    });

    it('batchSelect通过id批量选择记录', () => {
      const testDs = new DataSet({...commonDs, data});
      const idx = randomIdx(1, data.length - 1);
      const idArr = testDs.slice(0, idx).map(record => record.id);
      testDs.batchSelect(idArr);
      const flag = testDs.every((record, index) => {
        if(index < idx) return record.isSelected === true;
        return true;
      });
      expect(flag).toBeTruthy();
    });
  });

  describe('batchUnSelect', () => {
    it('batchUnSelect通过records批量取消选择记录', () => {
      const testDs = new DataSet({...commonDs, data});
      testDs.forEach(record => record.isSelected = true);
      testDs.batchUnSelect(testDs.slice());
      const flag = testDs.every(record => record.isSelected === false);
      expect(flag).toBeTruthy();
    });

    it('batchUnSelect通过id批量取消选择记录', () => {
      const testDs = new DataSet({...commonDs, data});
      testDs.forEach(record => record.isSelected = true);
      const idArr = testDs.slice().map(record => record.id);
      testDs.batchUnSelect(idArr);
      const flag = testDs.every((record, index) => {
        return record.isSelected === false;
      });
      expect(flag).toBeTruthy();
    });
  });

  describe('loadData', () => {
    it('loadData(data)', () => {
      const testDs = new DataSet({...commonDs});
      const length1 = testDs.length;
      const data = randomData(3);
      testDs.loadData(data);
      const length2 = testDs.length;
      expect(length1).toBe(0);
      expect(length2).toBe(3);
      expect(testDs.toData()).toEqual(data);
    });

    // TODO: 使用 data 有效，使用新数据不行？
    it('loadData(data,total,cache)', () => {
      const testDs = new DataSet({...commonDs, data, cacheModified: true});
      testDs.get(0).set('name', 'newName');
      testDs.loadData(data, undefined, true);
      expect(testDs.get(0).get('name')).toBe('newName');
    });
  });

  describe('bind', () => {
    it('bind之后检查结果', () => {
      const parentDs1 = new DataSet(fatherDs);
      const parentDs2 = new DataSet(fatherDs);
      const childrenDs = new DataSet(childDs);
      childrenDs.bind(parentDs1, 'testName');
      expect(parentDs1.children.testName).toEqual(childrenDs);
      expect(childrenDs.parent).toEqual(parentDs1);
      expect(parentDs2.children).toEqual({});
    });
  });

  describe('locate()', () => {
    it('locate(index)-paging为true-调用该方法-是否定位到对应索引', () => {
      const ds = new DataSet({ ...commonDs, paging: true, data: data });
      expect(ds.current).toEqual(ds.get(0));
      const orderIndex = Math.floor((Math.random() * 7)) + 1;
      ds.locate(orderIndex);
      expect(ds.current).toEqual(ds.get(orderIndex));
      expect(ds.current.get('name')).toBe(data[orderIndex].name);
      expect(ds.current.get('userid')).toBe(data[orderIndex].userid);
      expect(ds.current.get('active')).toBe(data[orderIndex].active);
    })
  })

  describe('first()', () => {
    it('first()-paging为true-调用该方法-是否定位到第一条记录', () => {
      const ds = new DataSet({ ...commonDs, paging: true, data: data });
      const orderIndex = Math.floor((Math.random() * 7)) + 1;
      ds.locate(orderIndex);
      expect(ds.current).toEqual(ds.get(orderIndex));
      ds.first();
      expect(ds.current).toEqual(ds.get(0));
      expect(ds.current.get('name')).toBe(data[0].name);
      expect(ds.current.get('userid')).toBe(data[0].userid);
      expect(ds.current.get('active')).toBe(data[0].active);
    })
  })

  describe('last()', () => {
    it('last()-paging为true-调用该方法-是否定位到最后一条记录', () => {
      const ds = new DataSet({ ...commonDs, paging: true, data: data });
      expect(ds.current).toEqual(ds.get(0));
      ds.last();
      expect(ds.current).toEqual(ds.get(data.length - 1));
      expect(ds.current.get('name')).toBe(data[data.length - 1].name);
      expect(ds.current.get('userid')).toBe(data[data.length - 1].userid);
      expect(ds.current.get('active')).toBe(data[data.length - 1].active);
    })
  })

  describe('pre()', () => {
    it('pre()-paging为true-调用该方法-是否定位到上一条记录', () => {
      const ds = new DataSet({ ...commonDs, paging: true, data: data });
      const orderIndex = Math.floor((Math.random() * 7)) + 1;
      ds.locate(orderIndex);
      expect(ds.current).toEqual(ds.get(orderIndex));
      ds.pre();
      expect(ds.current).toEqual(ds.get(orderIndex - 1));
      expect(ds.current.get('name')).toBe(data[orderIndex - 1].name);
      expect(ds.current.get('userid')).toBe(data[orderIndex - 1].userid);
      expect(ds.current.get('active')).toBe(data[orderIndex - 1].active);
    })
  })

  describe('next()', () => {
    it('next()-paging为true-调用该方法-是否定位到下一条记录', () => {
      const ds = new DataSet({ ...commonDs, paging: true, data: data });
      const orderIndex = Math.floor((Math.random() * 8)) - 1 < 1 ? 2 : Math.floor((Math.random() * 8)) - 1;
      ds.locate(orderIndex);
      expect(ds.current).toEqual(ds.get(orderIndex));
      ds.next();
      expect(ds.current).toEqual(ds.get(orderIndex + 1));
      expect(ds.current.get('name')).toBe(data[orderIndex + 1].name);
      expect(ds.current.get('userid')).toBe(data[orderIndex + 1].userid);
      expect(ds.current.get('active')).toBe(data[orderIndex + 1].active);
    })
  })

  describe('create(data, index)', () => {
    it('create(data, index)-调用该方法-验证是否在对应索引创建了对应数据', () => {
      const addedData = {
        "userid": 100,
        "name": "newUser",
        "sex": "M",
        "age": 10,
        "email": "test@qq.com",
        "active": true
      };
      const orderIndex = Math.floor((Math.random() * 8));
      const ds = new DataSet({ ...commonDs, data: data });
      ds.create(addedData, orderIndex);
      expect(ds.length).toBe(data.length + 1);
      expect(ds.get(orderIndex).get('userid')).toBe(addedData.userid);
      expect(ds.get(orderIndex).get('name')).toBe(addedData.name);
      expect(ds.get(orderIndex).get('active')).toBe(addedData.active);
    })
  })

  describe('removeAll()', () => {
    it('removeAll()-调用该方法-验证是否临时删除了所有记录', () => {
      const ds = new DataSet({ ...commonDs, data: data });
      ds.removeAll();
      expect(ds.length).toBe(0);
      expect(ds.records.length).toBe(data.length);
      expect(ds.get(0)).toBeUndefined();
      expect(ds.current).toBeUndefined();
    })
  })

  describe('push(...records)', () => {
    it('push(...records)-调用该方法-验证是否将若干数据记录插入记录堆栈顶部', () => {
      const ds = new DataSet({ ...commonDs, data: data.slice(0, 4) });
      const addDs = new DataSet({ ...commonDs, data: data.slice(4) });
      expect(ds.length).toBe(data.slice(0, 4).length);
      ds.push(...addDs.records);
      expect(ds.length).toBe(data.length);
      expect(ds.records.get(ds.length - 1).get('name')).toBe(data[data.length - 1].name);
      expect(ds.records.get(ds.length - 1).get('userid')).toBe(data[data.length - 1].userid);
      expect(ds.records.get(ds.length - 1).get('active')).toBe(data[data.length - 1].active);
    })
  })

  describe('unshift(...records)', () => {
    it('unshift(...records)-调用该方法-验证是否将若干数据记录插入记录堆栈顶部', () => {
      const ds = new DataSet({ ...commonDs, data: data.slice(0, 4) });
      const addDs = new DataSet({ ...commonDs, data: data.slice(4) });
      ds.unshift(...addDs.records);
      expect(ds.length).toBe(data.length);
      expect(ds.records.get(3).get('name')).toBe(data[data.length - 1].name);
      expect(ds.records.get(3).get('userid')).toBe(data[data.length - 1].userid);
      expect(ds.records.get(3).get('active')).toBe(data[data.length - 1].active);
    })
  })

  describe('pop()', () => {
    it('pop()-调用该方法-验证是否从记录堆栈顶部获取记录', () => {
      const ds = new DataSet({ ...commonDs, data: data });
      let topRecordName = ds.get(ds.length - 1).get('name');
      let topRecordUserid = ds.get(ds.length - 1).get('userid');
      let topRecordActive = ds.get(ds.length - 1).get('active');
      let popedRedcord = ds.pop();
      expect(ds.length).toBe(data.length - 1);
      expect(popedRedcord.get('name')).toBe(topRecordName);
      expect(popedRedcord.get('userid')).toBe(topRecordUserid);
      expect(popedRedcord.get('active')).toBe(topRecordActive);
    })
  })

  describe('shift()', () => {
    it('shift()-调用该方法-验证是否从记录堆栈底部获取记录', () => {
      const ds = new DataSet({ ...commonDs, data: data });
      let bottomRecordName = ds.get(0).get('name');
      let bottomRecordUserid = ds.get(0).get('userid');
      let bottomRecordActive = ds.get(0).get('active');
      let shifttedRedcord = ds.shift();
      expect(ds.length).toBe(data.length - 1);
      expect(shifttedRedcord.get('name')).toBe(bottomRecordName);
      expect(shifttedRedcord.get('userid')).toBe(bottomRecordUserid);
      expect(shifttedRedcord.get('active')).toBe(bottomRecordActive);
    })
  })

  describe('find(record, index, array)', () => {
    it('find(record, index, array)-调用该方法-验证是否根据函数查找并返回第一条记录', () => {
      const ds = new DataSet({ ...commonDs, data: data });
      const orderIndex = Math.floor(Math.random() * 8);
      const resRecord = ds.find((record, index, array) => {
        if (index === orderIndex) {
          expect(record).toEqual(ds.get(orderIndex));
          expect(array.length).toBe(data.length);
          return true;
        }
      })
      expect(resRecord).toBeInstanceOf(Record);
      const resultRecordData = [resRecord.get('name'), resRecord.get('userid'), resRecord.get('active')];
      expect(resultRecordData).toEqual([data[orderIndex].name, data[orderIndex].userid, data[orderIndex].active])
    })
  })

  describe('findIndex(fn)', () => {
    it('findIndex(record, index, array)-调用该方法-验证是否根据函数查找记录所在的索引', () => {
      const ds = new DataSet({ ...commonDs, data: data });
      const orderIndex = Math.floor(Math.random() * 8);
      const resIndex = ds.findIndex((record, index, array) => {
        if (record.get('userid') === data[orderIndex].userid) {
          expect(record).toEqual(ds.get(orderIndex));
          expect(array.length).toBe(data.length);
          expect(index).toBe(orderIndex);
          return true;
        }
      })
      expect(resIndex).toBe(orderIndex);
    })
  })

  describe('forEach(fn, thisArg)', () => {
    it('forEach(record, index, array, thisArg)-调用该方法-验证是否根据函数进行遍历', () => {
      const ds = new DataSet({ ...commonDs, data: data });
      let compareFlag = false;
      ds.forEach((record, index, array) => {
        if (!compareFlag) {
          expect(array.length).toBe(data.length);
          const randomIndex = Math.floor(Math.random() * 8);
          expect(array[randomIndex]).toBeInstanceOf(Record);
          compareFlag = true;
        }
        expect(record).toEqual(ds.get(index));
      }, 'otherArgs')
    })
  })

  describe('map(fn, thisArg)', () => {
    it('map(record, index, array, thisArg)-调用该方法-验证是否根据函数进行遍历并输出新的数组', () => {
      const ds = new DataSet({ ...commonDs, data: data });
      const resRecords = ds.map((record, index, array) => {
        expect(array[index]).toBe(ds.get(index));
        expect(record.get('userid')).toBe(data[index].userid);
        return record;
      }, 'otherArgs')
      resRecords.map((each, i) => {
        expect(each).toBeInstanceOf(Record);
        expect(each.get('userid')).toBe(data[i].userid);
      })
    })
  })

  describe('some(fn, thisArg)', () => {
    it('some(record, index, array, thisArg)-调用该方法-验证是否根据函数遍历，当有返回值为true时，输出true', () => {
      const ds = new DataSet({ ...commonDs, data: data });
      let counter = 0
      const resBoolean = ds.some((record, index, array) => {
        counter++;
        if (record === ds.get(data.length - 1) && index === ds.length - 1 && array.length === ds.length) {
          return true;
        }
      }, 'otherArgs')
      expect([counter, resBoolean]).toEqual([data.length, true]);
    })
  })

  describe('every(fn, thisArg)', () => {
    it('every(record, index, array, thisArg)-调用该方法-验证是否根据函数遍历，当有返回值为false时，输出false', () => {
      const ds = new DataSet({ ...commonDs, data: data });
      let counter = 0;
      let compareFlag = false;
      const res1 = ds.every((record, index, array) => {
        if (!compareFlag) {
          expect(array.length).toBe(data.length);
          compareFlag = true;
        }
        counter++;
        return record.get('userid') && (array.length === data.length) && (index === counter - 1);
      }, 'otherArgs')
      const res2 = ds.every((record) => {
        return record.get('age') > 100;
      }, 'otherArgs')
      expect([counter, res1, res2]).toEqual([data.length, true, false]);
    })
  })

  describe('filter(fn, thisArg)', () => {
    it('filter(record, index, array, thisArg)-调用该方法-验证是否根据函数过滤并返回记录集', () => {
      const ds = new DataSet({ ...commonDs, data: data });
      let compareFlag = false;
      const resRecords = ds.filter((record, index, array) => {
        if (!compareFlag) {
          expect(array.length).toBe(data.length);
          compareFlag = true;
        }
        return record.get('userid') <= 4;
      }, 'otherArgs')
      expect(resRecords.length).toBe(4);
      resRecords.map((each) => {
        expect(each.get('userid')).toBeLessThan(5);
      })
    })
  })

  describe('reduce(fn, initialValue)', () => {
    it('reduce(previousValue, record, index, array, initialValue)-验证是否为数组中的所有元素调用指定的回调函数', () => {
      const ds = new DataSet({ ...commonDs, data: data });
      let compareFlag = false;
      const res = ds.reduce((previousValue, record, index, array) => {
        expect(record.get('userid')).toBe(index + 1);
        if (!compareFlag) {
          expect(array.length).toBe(data.length);
          expect(index).toBe(0);
          compareFlag = true;
        }
        return previousValue + record.get('userid');
      }, 0)
      const correctRes = data.reduce((preValue, each) => {
        return preValue + each.userid;
      }, 0)
      expect(res).toBe(correctRes)
    })
  })

  describe('reduceRight(fn, initialValue)', () => {
    it('reduceRight(previousValue, record, index, array, initialValue)-验证是否按降序调用数组中所有元素的指定回调函数', () => {
      const ds = new DataSet({ ...commonDs, data: data });
      let compareFlag = false;
      const res = ds.reduceRight((previousValue, record, index, array) => {
        expect(record.get('userid')).toBe(index + 1);
        if (!compareFlag) {
          expect(array.length).toBe(data.length);
          expect(index).toBe(data.length - 1);
          compareFlag = true;
        }
        return previousValue + record.get('userid');
      }, 0)
      const correctRes = data.reduce((preValue, each) => {
        return preValue + each.userid;
      }, 0)
      expect(res).toBe(correctRes)
    })
  })

  describe('select(recordOrIndex)', () => {
    it('调用该方法-验证是否根据-记录索引-选中记录', () => {
      const ds = new DataSet({ ...commonDs, data: data });
      const randomIndex = Math.floor(Math.random() * 8);
      expect(ds.get(randomIndex).isSelected).toBeFalsy();
      ds.select(randomIndex);
      expect(ds.get(randomIndex).isSelected).toBeTruthy();
    })
    it('调用该方法-验证是否根据-记录对象-选中记录', () => {
      const ds = new DataSet({ ...commonDs, data: data });
      const randomIndex = Math.floor(Math.random() * 8);
      expect(ds.get(randomIndex).isSelected).toBeFalsy();
      ds.select(ds.get(randomIndex));
      expect(ds.get(randomIndex).isSelected).toBeTruthy();
    })
  })

  describe('unSelect(recordOrIndex)', () => {
    it('调用该方法-验证是否根据-记录索引-取消选中记录', () => {
      const ds = new DataSet({ ...commonDs, data: data });
      const randomIndex = Math.floor(Math.random() * 8);
      const changedRecord = ds.get(randomIndex);
      expect(changedRecord.isSelected).toBeFalsy();

      ds.select(randomIndex);
      expect(changedRecord.isSelected).toBeTruthy();

      ds.unSelect(randomIndex);
      expect(changedRecord.isSelected).toBeFalsy();
    })
    it('调用该方法-验证是否根据-记录对象-取消选中记录', () => {
      const ds = new DataSet({ ...commonDs, data: data });
      const randomIndex = Math.floor(Math.random() * 8);
      const changedRecord = ds.get(randomIndex);
      expect(changedRecord.isSelected).toBeFalsy();

      ds.select(changedRecord);
      expect(changedRecord.isSelected).toBeTruthy();

      ds.unSelect(changedRecord);
      expect(changedRecord.isSelected).toBeFalsy();
    })
  })

  describe('selectAll()', () => {
    it('调用该方法-验证是否会全选当前页-有多页数据的时候', () => {
      const pageSize = 5;
      const ds = new DataSet({ ...commonDs, data: data, pageSize: pageSize });
      expect(ds.selected.length).toBe(0);
      ds.records.map((eachRecord) => {
        expect(eachRecord.isSelected).toBeFalsy();
      })
      ds.selectAll();
      expect(ds.selected.length).toBe(pageSize);
      ds.records.map((eachRecord) => {
        expect(eachRecord.isSelected).toBeTruthy();
      })
    })
    it('调用该方法-验证是否会全选当前页-单页数据的时候', () => {
      const ds = new DataSet({ ...commonDs, data: data });
      expect(ds.selected.length).toBe(0);
      ds.records.map((eachRecord) => {
        expect(eachRecord.isSelected).toBeFalsy();
      })
      ds.selectAll();
      expect(ds.selected.length).toBe(data.length);
      ds.records.map((eachRecord) => {
        expect(eachRecord.isSelected).toBeTruthy();
      })
    })
  })

  describe('unSelectAll()', () => {
    it('调用该方法-验证是否会取消选择当前页-有多页数据的时候', () => {
      const pageSize = 5;
      const ds = new DataSet({ ...commonDs, data: data, pageSize: pageSize });
      ds.selectAll();
      expect(ds.selected).not.toEqual([])
      ds.unSelectAll();
      expect(ds.selected).toEqual([])
    })
    it('调用该方法-验证是否会取消选择当前页-单页数据的时候', () => {
      const ds = new DataSet({ ...commonDs, data: data });
      ds.selectAll();
      expect(ds.selected).not.toEqual([])
      ds.unSelectAll();
      expect(ds.selected).toEqual([])
    })
  })

  describe('treeSelect(record)', () => {
    it('调用该方法-验证是否根据记录对象选择记录和其子记录', () => {
      const parentLength = 2;
      const childrenLength = 10;
      const ds = new DataSet({ ...mockTableTreeDs(parentLength, childrenLength) })
      expect(ds.getFromTree(0).isSelected).toBeFalsy();
      expect(ds.getFromTree(0).children.get(2).isSelected).toBeFalsy();
      ds.treeSelect(ds.get(0));
      expect(ds.selected.length).toBe(childrenLength + 1);
      expect(ds.getFromTree(0).isSelected).toBeTruthy();
      expect(ds.getFromTree(0).children.get(2).get('id')).toBe('0-2');
      expect(ds.getFromTree(0).children.get(2).isSelected).toBeTruthy();
    })
  })

  describe('treeUnSelect(record)', () => {
    it('调用该方法-验证是否根据记录对象取消选择记录和其子记录', () => {
      const parentLength = 2;
      const childrenLength = 10;
      const ds = new DataSet({ ...mockTableTreeDs(parentLength, childrenLength) });
      expect(ds.getFromTree(0).children.get(2).get('id')).toBe('0-2');;
      ds.treeSelect(ds.getFromTree(0));
      expect(ds.selected.length).toBe(childrenLength + 1);
      expect(ds.getFromTree(0).isSelected).toBeTruthy();
      expect(ds.getFromTree(0).children.get(2).isSelected).toBeTruthy();
      ds.treeUnSelect(ds.getFromTree(0));
      expect(ds.selected.length).toBe(0);
      expect(ds.getFromTree(0).isSelected).toBeFalsy();
      expect(ds.getFromTree(0).children.get(2).isSelected).toBeFalsy();
    })
  })

  describe('get(index)', () => {
    it('get(index)-调用该方法-索引合法-验证是否能获取指定索引的记录', () => {
      const ds = new DataSet({ ...commonDs, data: data });
      const orderIndex = Math.floor(Math.random() * 8);
      const record = ds.get(orderIndex);
      expect(record).toBeInstanceOf(Record);
      expect(record.get('userid')).toBe(data[orderIndex].userid);
    })
    it('get(index)-调用该方法-索引不合法-验证是否能获取指定索引的记录', () => {
      const ds = new DataSet({ ...commonDs, data: data });
      const orderIndex = 100;
      const record = ds.get(orderIndex);
      expect(record).toBeUndefined();
    })
  })

  describe('getFromTree(index)', () => {
    it('getFromTree(index)-调用该方法-验证是否能获取树形中指定索引的根节点记录', () => {
      const parentLength = 3;
      const childrenLength = 10;
      const ds = new DataSet({ ...mockTableTreeDs(parentLength, childrenLength) })
      const orderIndex = Math.floor(Math.random() * parentLength);

      expect(ds.getFromTree(orderIndex)).toBeInstanceOf(Record);
      expect(ds.getFromTree(orderIndex).get('id')).toBe(orderIndex.toString());
    })
    it('getFromTree(index)-调用该方法-验证是否能获取树形中指定索引的根节点记录', () => {
      const parentLength = 3;
      const childrenLength = 10;
      const ds = new DataSet({ ...mockTableTreeDs(parentLength, childrenLength) })
      const orderIndex = 100;
      expect(ds.getFromTree(orderIndex)).toBeUndefined();
    })
  })

  describe('validate()', () => {
    it('调用该方法-校验数据记录是否有效-校验有效', async () => {
      const ds = new DataSet({ ...commonDs, data: data });
      const flag = await ds.validate();
      expect(flag).toBeTruthy();
    })
    it('调用该方法-存在无效数据-校验数据记录是否有效-校验有效', async () => {
      const ds = new DataSet({ ...commonDs, data: data });
      let flag;
      flag = await ds.validate();
      expect(flag).toBeTruthy();
      ds.get(0).set('userid', undefined);
      flag = await ds.validate();
      expect(flag).toBeFalsy();
    })
  })

  describe('getField(fieldName)', () => {
    it('getField(fieldName)-调用该方法-校验是否根据字段名获取字段', () => {
      const ds = new DataSet({ ...commonDs, data: data });
      expect(ds.getField('userid')).toBeInstanceOf(Field);
      expect(ds.getField('userid').get('required')).toBe(commonDs.fields[0].required);
      expect(ds.getField('userid').get('label')).toBe(commonDs.fields[0].label);
    })
  })

  describe('addField(fieldName, fieldProps)', () => {
    it('addField(fieldName, fieldProps)-调用该方法-校验是否增加对应的字段名和属性', () => {
      const ds = new DataSet({ ...commonDs, data: data });
      expect(ds.fields.size).toBe(commonDs.fields.length);
      ds.addField('newField', { label: '新增字段', required: true });
      expect(ds.fields.size).toBe(commonDs.fields.length + 1);
      expect(ds.getField('newField')).toBeInstanceOf(Field);
      expect(ds.getField('newField').get('required')).toBeTruthy();
      expect(ds.getField('newField').get('label')).toBe('新增字段');
    })
  })

  describe('toData()', () => {
    it('toData()-调用该方法-校验是否能将数据转换成普通数据-且不包含删除的数据', () => {
      const ds = new DataSet({ ...commonDs, data: data });
      expect(ds.toData()).toEqual(data);
      ds.remove(ds.get(0));
      expect(ds.toData()).toEqual(data.slice(1));
    })
  })

  describe('toJSONData()', () => {
    it('toJSONData()-调用该方法-校验是否能将拿到修改的数据', () => {
      const ds = new DataSet({ ...commonDs, data: data });
      ds.get(0).set('name', 'test');
      expect(ds.toJSONData() instanceof Array).toBeTruthy();
      expect(ds.toJSONData()[0] instanceof Object).toBeTruthy();
      expect(ds.toJSONData()[0].name).toBe('test');
    })
  })

  describe('setQueryParameter(para, value)', () => {
    it('setQueryParameter(para, value)-调用该方法-校验是否设置了对应的查询参数和值', () => {
      const ds = new DataSet({ ...commonDs, data: data });
      ds.setQueryParameter('userid', 1);
      expect(ds.queryParameter).toEqual({ 'userid': 1 });
    })
  })

  describe('getQueryParameter(para)', () => {
    it('getQueryParameter(para)-调用该方法-校验是否根据参数名获取了查询参数', () => {
      const ds = new DataSet({ ...commonDs, data: data });
      ds.setQueryParameter('userid', 1);
      expect(ds.getQueryParameter('userid')).toBe(1);
    })
  })

  describe('setState(key, value)', () => {
    it('setState(key, value)-键名普通-调用该方法-校验是否能设置自定义的状态值', () => {
      const ds = new DataSet({ ...commonDs, data: data });
      ds.setState('selfState', 'loading');
      ds.setState(123, 12345);
      ds.setState({ name: "测试用例" }, '对象');
      expect(ds.state.get('selfState')).toBe('loading');
    })
  })

  describe('getState(key)', () => {
    it('getState(key)-调用该方法-校验是否能获取自定义的状态值', () => {
      const ds = new DataSet({ ...commonDs, data: data });
      ds.setState('selfState', 'loading');
      expect(ds.getState('selfState')).toBe('loading');
    })
  })

  describe('setAllPageSelection(enabled)',()=>{
    it('setAllPageSelection(enabled)-调用该方法-校验是不是开启了跨页全选',()=>{
      const ds = new DataSet({ ...commonDs });
      expect(ds.isAllPageSelection).toBeFalsy();
      ds.setAllPageSelection(true);
      expect(ds.isAllPageSelection).toBeTruthy();
    })
  })

  describe('appendData(data,parentRecord,total)', () => {
    it('appendData(data)-非树形数据-调用该方法-校验附加的数据', () => {
      const ds = new DataSet({ ...commonDs });
      expect(ds.length).toBe(0);
      const orderIndex = Math.floor((Math.random() * 8));
      ds.appendData(data);
      expect(ds.get(orderIndex)).toBeInstanceOf(Record);
      expect(ds.get(orderIndex).get('name')).toBe(data[orderIndex].name);
    })
    it('appendData(data,parentRecord)-树形数据-调用该方法-校验附加的数据、父节点', () => {
      const ds = new DataSet({ ...mockTableTreeDs(1, 0) });
      expect(ds.length).toBe(1);
      const parentLength = 1;
      const childrenLength = 10;
      const rightTotal = parentLength * childrenLength + parentLength;
      ds.appendData(treeTableData(parentLength, childrenLength), ds.get(0));
      expect(ds.length).toBe(rightTotal);
      expect(ds.getFromTree(0).children.get(9).get('id')).toBe('0-8');
    })
  })

  describe('getValidationErrors()', () => {
    it('getValidationErrors()-调用该方法-校验是不是获取了校验错误信息', async () => {
      const ds = new DataSet({ ...commonDs, data: data });
      expect(ds.getValidationErrors()).toEqual([]);
      ds.get(0).set('sex', undefined);
      const flag = await ds.validate();;
      expect(flag).toBeFalsy();
      const validationErrors = ds.getValidationErrors();
      expect(validationErrors.length).toBe(1);
      expect(validationErrors[0].valid).toBeFalsy();
      expect(validationErrors[0].record).toBeInstanceOf(Record);
      expect(validationErrors[0].errors[0].field.get('name')).toBe('sex');
    })
  })
});
