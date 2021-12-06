import React from 'react';
import { mount, render } from "enzyme";
import DataSet from "..";
import Record from '../Record';
import Tree from '../../../components-pro/tree';
import { testName, data as mockData, commonDs, commonQueryFields, simpleTreeDs, childDs, fatherDs } from "./mock";
import { randomData } from './utils';

describe('DataSet Events', () => {
	describe('update', () => {
		it('update-同步-是否会成功触发值更新事件', () => {
			let counter = 0;
			const ds = new DataSet({
				...commonDs,
				data: mockData,
				events: {
					update: ({ dataSet, record, name, value, oldValue }) => {
						counter++;
						expect(ds).toEqual(dataSet);
						expect(record).toBe(ds.get(0));
						expect(name).toBe('name');
						expect(value).toBe('test-update');
						expect(oldValue).toBe(mockData[0].name);
					}
				}
			});
			expect(counter).toBe(0);
			ds.get(0).set('name', 'test-update');
			expect(counter).toBe(1);
		})
	})

	describe('beforeLoad && load', () => {
		it('beforeLoad && load-同步-数据加载前后的事件是否正常执行', () => {
			let counter = 0;
			let dsInLoadEvent = {};
			const ds = new DataSet({
				...commonDs,
				data: mockData,
				events: {
					beforeLoad: ({ dataSet, data }) => {
						counter++;
						expect(counter).toBe(1);
						expect(data).toEqual(mockData);
						expect(dataSet).toBeInstanceOf(DataSet);
						const orderIndex = Math.floor((Math.random() * commonDs.fields.length));
						expect(dataSet.getField(commonDs.fields[orderIndex].name).get('label')).toBe(commonDs.fields[orderIndex].label);
					},
					load: ({ dataSet }) => {
						counter++;
						expect(counter).toBe(2);
						expect(dataSet).toBeInstanceOf(DataSet);
						expect(dataSet.length).toBe(mockData.length);
						dsInLoadEvent = dataSet;
					}
				}
			});
			expect(ds).toEqual(dsInLoadEvent);
		})
	})

	describe('beforeAppend && append', () => {
		it('beforeAppend && append-同步-触发数据附加前后的事件是否正常执行', () => {
			let counter = 0;
			let dsInAppendEvent = {};
			const fakeAppendData = [{ userid: 999, name: '测试' }];
			const ds = new DataSet({
				...commonDs,
				data: mockData,
				events: {
					beforeAppend: ({ dataSet, data }) => {
						counter++;
						expect(counter).toBe(1);
						expect(dataSet).toBeInstanceOf(DataSet);
						expect(dataSet.length).toBe(mockData.length);
						expect(data).toEqual(fakeAppendData);
					},
					append: ({ dataSet }) => {
						counter++;
						expect(counter).toBe(2);
						expect(dataSet).toBeInstanceOf(DataSet);
						expect(dataSet.length).toBe(mockData.length + 1);
						dsInAppendEvent = dataSet;
					}
				}
			});
			ds.appendData(fakeAppendData);
			expect(ds).toEqual(dsInAppendEvent);
		})
	})

	// TODO: network error
	// describe('loadFailed', () => {
	// 	it('loadFailed-同步-是否会成功触发数据加载失败事件', async () => {
	// 		let counter = 0;
	// 		const ds = new DataSet({
	// 			...commonDs,
	// 			name:'loadFailed',
	// 			events: {
	// 				loadFailed: ({ dataSet }) => {
	// 					counter++;
	// 					expect(dataSet).toBeInstanceOf(DataSet);
	// 					expect(dataSet.length).toBe(0);
	// 				}
	// 			}
	// 		});
	// 		await ds.query();
	// 		expect(counter).toBe(1);
	// 	})
	// })

	describe('select && unSelect', () => {
		it('select && unSelect-同步-多选模式-是否会成功触发选择记录事件且其参数对应值正确', () => {
			let selectedCounter = 0;
			const ds = new DataSet({
				...commonDs,
				data: mockData,
				events: {
					select: ({ dataSet, record }) => {
						expect(record.get('name')).toBe(mockData[selectedCounter].name);
						expect(dataSet.length).toBe(mockData.length);
						selectedCounter++;
					},
					unSelect: ({ dataSet, record }) => {
						selectedCounter--;
						expect(dataSet.length).toBe(mockData.length);
						expect(record.get('name')).toBe(mockData[selectedCounter].name);
					},
				}
			});
			expect(selectedCounter).toBe(0);
			ds.select(ds.get(0));
			ds.select(ds.get(1));
			ds.select(ds.get(2));
			expect(selectedCounter).toBe(3);
			ds.unSelect(ds.get(2));
			ds.unSelect(ds.get(1));
			ds.unSelect(ds.get(0));
			expect(selectedCounter).toBe(0);
		})
		it('select && unSelect-同步-单选模式-是否会成功触发选择记录事件且其参数对应值正确', () => {
			let selectedCounter = 0;
			const ds = new DataSet({
				...commonDs,
				data: mockData,
				selection: 'single',
				events: {
					select: ({ dataSet, record, previous }) => {
						if (selectedCounter === 0) {
							expect(previous).toBeUndefined();
							expect(dataSet.length).toBe(mockData.length);
							selectedCounter++;
							return;
						}
						expect(record.get('name')).toBe(mockData[selectedCounter].name);
						expect(previous.get('name')).toBe(mockData[selectedCounter - 1].name);
						selectedCounter++;
					},
					unSelect: ({ dataSet, record }) => {
						selectedCounter--;
						expect(dataSet.length).toBe(mockData.length);
						expect(record.get('name')).toBe(mockData[selectedCounter].name);
					},
				}
			});
			expect(selectedCounter).toBe(0);
			ds.select(ds.get(0));
			ds.select(ds.get(1));
			ds.select(ds.get(2));
			expect(selectedCounter).toBe(3);
			ds.unSelect(ds.get(2));
			ds.unSelect(ds.get(1));
			ds.unSelect(ds.get(0));
		})
	})

	// TODO: 打印的result和expect语句中拿到的result不匹配
	// describe('validate', () => {
	// 	it('validate-同步-是否会成功触发查询事件且事件中的参数获取是否正确', () => {
	// 		let validateResult = 123;
	// 		const ds = new DataSet({
	// 			...commonDs,
	// 			data: mockData,
	// 			events: {
	// 				validate: ({ dataSet, result  }) => {
	// 					// console.log('validate执行2', result);
	// 					expect(result).toBeTruthy();
	// 					expect(result).toBeFalsy();
	// 					// console.log('validate执行', result);
	// 				},
	// 			}
	// 		});
	// 		ds.validate();
	// 	})
	// })

	describe('reset', () => {
		it('reset-同步-是否会成功触发查询事件且事件中的参数获取是否正确', () => {
			const ds = new DataSet({
				...commonDs,
				data: mockData,
				events: {
					reset: ({ dataSet, records })=>{
						expect(dataSet).toBeInstanceOf(DataSet);
						for(let i = 0;i<records.length;i++){
							expect(records[i]).toBeInstanceOf(Record);
						}
					},
				}
			});
			ds.get(0).set('name','测试');
			ds.reset();
		})
	})

	describe('beforeRemove', () => {
		it('beforeRemove-同步-是否会成功触发数据临时删除前的事件', () => {
			const ds = new DataSet({
				...commonDs,
				data: mockData,
				events: {
					beforeRemove: ({ dataSet, records })=>{
						expect(dataSet).toBeInstanceOf(DataSet);
						expect(records.length).toBe(1);
						expect(records[0].get('name')).toBe(mockData[orderIndex].name);
					},
				}
			});
			const orderIndex = Math.floor((Math.random() * mockData.length));
			expect(ds.length).toBe(mockData.length);
			ds.remove(ds.get(orderIndex));
			expect(ds.length).toBe(mockData.length-1);
		})
		it('beforeRemove-同步-返回值为false-是否会成功触发数据临时删除前的事件', () => {
			const ds = new DataSet({
				...commonDs,
				data: mockData,
				events: {
					beforeRemove: ()=>{
						return false;
					},
				}
			});
			const orderIndex = Math.floor((Math.random() * mockData.length));
			expect(ds.length).toBe(mockData.length);
			ds.remove(ds.get(orderIndex));
			expect(ds.length).toBe(mockData.length);
		})
	})

	describe('beforeDelete', () => {
		it('beforeDelete-同步-是否会成功触发数据删除前的事件', () => {
			const ds = new DataSet({
				...commonDs,
				data: mockData,
				events: {
					beforeDelete: ({ dataSet, records })=>{
						expect(dataSet).toBeInstanceOf(DataSet);
						expect(records.length).toBe(1);
						expect(records[0].get('name')).toBe(mockData[orderIndex].name);
					},
				}
			});
			const orderIndex = Math.floor((Math.random() * mockData.length));
			expect(ds.length).toBe(mockData.length);
			ds.delete(ds.get(orderIndex));
		})
		it('beforeDelete-同步-是否会成功触发数据删除前的事件', () => {
			const ds = new DataSet({
				...commonDs,
				data: mockData,
				events: {
					beforeDelete: ()=>{
						return false;
					},
				}
			});
			const orderIndex = Math.floor((Math.random() * mockData.length));
			expect(ds.length).toBe(mockData.length);
			ds.delete(ds.get(orderIndex));
			expect(ds.length).toBe(mockData.length);
		})
	})

})