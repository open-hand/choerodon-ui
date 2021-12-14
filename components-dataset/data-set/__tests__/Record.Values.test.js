import React from 'react';
import { mount, render } from "enzyme";
import DataSet from "..";
import Record from '../Record';
import Tree from '../../../components-pro/tree';
import Table from '../../../components-pro/table';
import { testName, data as mockData, commonDs, commonQueryFields, mockTableTreeDs, childDs, fatherDs } from "./mock";
import { randomData } from './utils';


describe('Record Values', () => {
  describe('id', () => {
    it('id-校验是否为记录中的唯一id,是否是自增长的', () => {
      const ds = new DataSet({ ...commonDs, data: mockData });
      expect(ds.selected).toEqual([]);
      const orderIndex = Math.floor((Math.random() * mockData.length));
      const id = ds.get(orderIndex).id;
      ds.batchSelect([id]);
      expect(ds.selected.length).toBe(1);
      for (let i = 1; i < mockData.length - 1; i++) {
        expect(ds.get(i).id).toBeLessThan(ds.get(i + 1).id);
      }
    })
  })
  describe('key', () => {
    it('校验是否为记录中的唯一键,未配置唯一索引，默认为id', () => {
      const ds = new DataSet({ ...commonDs, data: mockData });
      expect(ds.selected).toEqual([]);
      const orderIndex = Math.floor((Math.random() * mockData.length));
      const id = ds.get(orderIndex).id;
      ds.batchSelect([id]);
      expect(ds.selected.length).toBe(1);
      for (let i = 0; i < mockData.length; i++) {
        expect(ds.get(i).id).toBe(ds.get(i).key + 1016);
      }
    })
    it('校验是否为记录中的唯一键,未配置唯一索引，默认为id', () => {
      const ds = new DataSet({ ...commonDs, data: mockData, primaryKey: 'userid' });
      expect(ds.selected).toEqual([]);
      const orderIndex = Math.floor((Math.random() * mockData.length));
      const id = ds.get(orderIndex).id;
      ds.batchSelect([id]);
      expect(ds.selected.length).toBe(1);
      for (let i = 0; i < mockData.length; i++) {
        expect(ds.get(i).key).toBe(mockData[i].userid);
      }
    })
    it('校验是否为记录中的唯一键,新建record，检验其key的正确性', () => {
      const ds = new DataSet({ ...commonDs, data: mockData, primaryKey: 'userid' });
      ds.create();
      expect(ds.get(8).key).toBe(ds.get(8).id);
    })
  })
  describe('status', () => {
    it('status-add-校验记录的状态值是否为add', () => {
      const ds = new DataSet({ ...commonDs });
      ds.create();
      expect(ds.get(0).status).toBe('add');
    })
    it('status-update-校验记录的状态值是否为update', () => {
      const ds = new DataSet({ ...commonDs, data: mockData });
      ds.get(0).set('name', 'changedName');
      expect(ds.get(0).status).toBe('update');
    })
    // TODO: 如何变为delete态
    // it('status-delete-校验记录的状态值是否为delete', () => {
    // 	const ds = new DataSet({ ...commonDs, data: mockData });
    // 	expect(ds.get(0).status).toBe('delete');
    // })
    it('status-sync-校验记录的状态值是否为sync', () => {
      const ds = new DataSet({ ...commonDs, data: mockData });
      expect(ds.get(0).status).toBe('sync');
    })
  })
  describe('disabled', () => {
    it('disabled-校验是否禁用为是', () => {
      const ds = new DataSet({
        ...commonDs,
        data: mockData,
      });
      expect(ds.get(0).disabled).toBeFalsy();
    })
    it('disabled-校验是否禁用为是', () => {
      const ds = new DataSet({
        ...commonDs,
        data: mockData,
        record: {
          dynamicProps: {
            disabled: (record) => record.index === 0,
          },
        },
      });
      expect(ds.get(0).disabled).toBeTruthy();
    })
  })
  describe('selectable', () => {
    it('selectable-校验是否可选为是', () => {
      const ds = new DataSet({
        ...commonDs,
        data: mockData,
      });
      expect(ds.get(0).selectable).toBeTruthy();
    })
    it('selectable-校验是否可选为否，并修改其值，检验是否为是', () => {
      const ds = new DataSet({
        ...commonDs,
        data: mockData,
        record: {
          dynamicProps: {
            selectable: (record) => record.index !== 0,
          },
        },
      });
      expect(ds.get(0).selectable).toBeFalsy();
      ds.get(0).selectable = true;
      expect(ds.get(0).selectable).toBeTruthy();
    })
  })
  describe('isSelected', () => {
    it('isSelected-校验是否选中为是', () => {
      const ds = new DataSet({
        ...commonDs,
        data: mockData,
      });
      expect(ds.get(0).isSelected).toBeFalsy();
      ds.select(ds.get(0));
      expect(ds.get(0).isSelected).toBeTruthy();
    })
    it('isSelected-设置isAllPageSelection，校验是否选中为是和否', () => {
      const ds = new DataSet({
        ...commonDs,
        data: mockData,
      });
      expect(ds.get(0).isSelected).toBeFalsy();
      ds.setAllPageSelection(true);
      expect(ds.get(0).isSelected).toBeTruthy();
      ds.setAllPageSelection(false);
      expect(ds.get(0).isSelected).toBeFalsy();
    })
  })
  describe('isCurrent', () => {
    it('isCurrent-校验是否当前记录为是和否', () => {
      const ds = new DataSet({
        ...commonDs,
        data: mockData,
      });
      expect(ds.current.isCurrent).toBeTruthy();
      expect(ds.current.get('name')).toBe(mockData[0].name);
      ds.locate(5);
      expect(ds.get(0).isCurrent).toBeFalsy();
    })
  })
  describe('isCurrent', () => {
    it('isCurrent-校验是否当前记录为是和否', () => {
      const ds = new DataSet({
        ...commonDs,
        data: mockData,
      });
      expect(ds.current.isCurrent).toBeTruthy();
      expect(ds.current.get('name')).toBe(mockData[0].name);
      ds.locate(5);
      expect(ds.get(0).isCurrent).toBeFalsy();
    })
  })
  describe('isExpanded', () => {
    it('isExpanded-默认配置expandField-校验树形节点展开的正确性', () => {
      const ds = new DataSet({ ...mockTableTreeDs(2, 3) });
      expect(ds.getFromTree(0).isExpanded).toBeFalsy();
      ds.getFromTree(0).isExpanded = true;
      expect(ds.getFromTree(0).isExpanded).toBeTruthy();
    })
    it('isExpanded-不配置expandField-校验树形节点展开的正确性', () => {
      let { expandField, ...propsWithoutExpandFieldDs } = mockTableTreeDs(2, 3)
      const ds = new DataSet({ ...propsWithoutExpandFieldDs });
      expect(ds.getFromTree(0).isExpanded).toBeFalsy();
      ds.getFromTree(0).isExpanded = true;
      expect(ds.getFromTree(0).isExpanded).toBeTruthy();
    })
  })
  describe('children', () => {
    const parentLength = 3;
    const childrenLength = 5;
    const parentIndex = Math.floor(Math.random() * parentLength);
    const childrenIndex = Math.floor(Math.random() * childrenLength);
    it('children-是存在子数据的-校验树形的子数据集', () => {
      const ds = new DataSet({ ...mockTableTreeDs(parentLength, childrenLength) });
      expect(ds.getFromTree(parentIndex).children[childrenIndex].get('id')).toBe(`${parentIndex}-${childrenIndex}`);
    })
    it('children-不存在子数据-校验树形子数据集为undefined', () => {
      const ds = new DataSet({ ...commonDs, data: mockData });
      expect(ds.get(0).children).toBeUndefined();
    })
  })
  describe('parent', () => {
    const parentLength = 3;
    const childrenLength = 5;
    const parentIndex = Math.floor(Math.random() * parentLength);
    const childrenIndex = Math.floor(Math.random() * childrenLength);
    it('children-是存在子数据的-校验树形的子数据集', () => {
      const ds = new DataSet({ ...mockTableTreeDs(parentLength, childrenLength) });
      const randomChildRecord = ds.getFromTree(parentIndex).children[childrenIndex];
      expect(randomChildRecord.parent).toBeInstanceOf(Record);
      expect(randomChildRecord.parent.get('id')).toBe(parentIndex.toString());

    })
    it('children-不存在子数据-校验树形子数据集为undefined', () => {
      const ds = new DataSet({ ...commonDs, data: mockData });
      expect(ds.get(0).parent).toBeUndefined();
    })
  })
  describe('previousRecord', () => {
    it('previousRecord-树形中存在前一条数据-前一条不是父数据-校验树形中前一条数据', () => {
      const ds = new DataSet({ ...mockTableTreeDs(2, 3) });
      const childRecord = ds.getFromTree(0).children[2];
      expect(childRecord.previousRecord).toBeInstanceOf(Record);
      expect(childRecord.previousRecord.get('id')).toBe('0-1');
    })
    it('previousRecord-树形中存在前一条数据-前一条是父数据-校验树形中前一条数据', () => {
      const ds = new DataSet({ ...mockTableTreeDs(2, 3) });
      const childRecord = ds.getFromTree(0).children[0];
      expect(childRecord.previousRecord).toBeUndefined();
    })
    it('previousRecord-树形中存在前一条数据-前一条是父数据-校验树形中前一条数据', () => {
      const ds = new DataSet({ ...commonDs, data: mockData });
      expect(ds.get(0).previousRecord).toBeUndefined();
    })
  })
  describe('nextRecord', () => {
    const ds = new DataSet({ ...mockTableTreeDs(2, 3) });
    it('nextRecord-树形中存在后一条数据-后一条是其父层级别数据-校验树形中后一条数据', () => {
      const childRecord = ds.getFromTree(0).children[2];
      expect(childRecord.nextRecord).toBeUndefined();
    })
    it('nextRecord-树形中存在后一条数据-后一条是子数据-校验树形中后一条数据', () => {
      const childRecord = ds.getFromTree(0).children[1];
      expect(childRecord.nextRecord).toBeInstanceOf(Record);
      expect(childRecord.nextRecord.get('id')).toBe('0-2');
    })
    it('nextRecord-树形中不存在后一条数据-校验树形中后一条数据是否是undefined', () => {
      const childRecord = ds.getFromTree(1).children[2];
      expect(childRecord.nextRecord).toBeUndefined();
    })
  })
  describe('level', () => {
    it('level-父亲节点不存在儿子节点 单层', () => {
      const ds = new DataSet({ ...mockTableTreeDs(1, 0) });
      let childRecordLevel = ds.getFromTree(0).level;
      expect(childRecordLevel.children).toBeUndefined();
      expect(childRecordLevel).toBe(0);
    })
    it('level-父亲节点存在儿子节点-校验该树形的层级 双层', () => {
      const ds = new DataSet({ ...mockTableTreeDs(1, 4) });
      let childRecordLevel = ds.getFromTree(0).level;
      expect(childRecordLevel).toBe(0);
      childRecordLevel = ds.getFromTree(0).children[0].level;
      expect(childRecordLevel).toBe(1);
    })
    it('level-父亲节点存在儿子节点-该儿子节点也有儿子节点-校验该树形的层级 三层', () => {
      const ds = new DataSet({ ...mockTableTreeDs(1, 2, 3) });
      let childRecordLevel = ds.getFromTree(0).level;
      expect(childRecordLevel).toBe(0);
      childRecordLevel = ds.getFromTree(0).children[0].level;
      expect(childRecordLevel).toBe(1);
      childRecordLevel = ds.getFromTree(0).children[0].children[0].level;
      expect(childRecordLevel).toBe(2);
    })
  })
  describe('dirty', () => {
    it('dirty-非级联数据-根据数据发生了变更，校验其值的正确性', () => {
      const ds = new DataSet({ ...commonDs, data: mockData });
      expect(ds.dirty).toBeFalsy();
      ds.get(0).set('name', 'test');
      expect(ds.dirty).toBeTruthy();
    })
  })
  describe('cascadeParent', () => {
    it('cascadeParent-不是级联数据-校验其级联父数据是否为undefined', () => {
      const ds = new DataSet({ ...commonDs, data: mockData });
      expect(ds.get(0).cascadeParent).toBeUndefined();
    })
  })
  describe('index', () => {
    it('index-非级联数据-获取该数据的索引-校验是否正确', () => {
      const ds = new DataSet({ ...commonDs, data: mockData });
      const orderIndex = Math.floor((Math.random() * mockData.length));
      expect(ds.get(orderIndex).index).toBe(orderIndex);
    })
    it('index-树形数据-有多条父数据-且都有子数据-校验某父数据的子数据索引是否正确', () => {
      const parentIndex = Math.floor(Math.random() * 1);
      const childrenIndex = Math.floor(Math.random() * 2);
      const ds = new DataSet({ ...mockTableTreeDs(2, 3) });
      expect(ds.getFromTree(parentIndex).children[childrenIndex].index).toBe(parentIndex * childrenIndex + childrenIndex + 1);
    })
  })
  describe('editing', () => {
    const { Column } = Table;
    it('editing-验证处于编辑中和非编辑中的数据-校验其值的正确性', () => {
      const ds = new DataSet({ ...commonDs, data: mockData });
      const commands = () => [
        'edit',
      ];
      const wrapper = mount(
        <Table dataSet={ds} editMode="inline">
          <Column name="userid" editor />
          <Column name="name" />
          <Column header="操作" command={commands} lock="right" />
        </Table>);
      const commandBtns = wrapper.find('.c7n-pro-btn-wrapper.c7n-pro-table-cell-command');
      expect(commandBtns.length).toBe(8);
      expect(ds.find(record => record.editing === true)).toBeUndefined();
      commandBtns.first().simulate('click');
      expect(ds.find(record => record.editing === true)).toBeInstanceOf(Record);
      expect(ds.find(record => record.editing === true).get('name')).toBe(mockData[0].name);
    })
  })
  
})