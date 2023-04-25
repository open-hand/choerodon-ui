import React, { cloneElement, FunctionComponent, Key, MouseEvent, ReactElement, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react-lite';
import { DragDropContext, Draggable, DraggableProps, DraggableProvided, DraggableStateSnapshot, Droppable, DropResult } from 'react-beautiful-dnd';
import sortBy from 'lodash/sortBy';
import isNumber from 'lodash/isNumber';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import { ModalChildrenProps } from 'choerodon-ui/pro/lib/modal/interface';
import Collapse from 'choerodon-ui/lib/collapse';
import Tag from 'choerodon-ui/lib/tag';
import { warning } from 'choerodon-ui/dataset/utils';
import CollapsePanel from 'choerodon-ui/lib/collapse/CollapsePanel';
// import { $l } from 'choerodon-ui/pro/lib/locale-context';
import BoardContext from '../BoardContext';
import Record from '../../data-set/Record';
import ObserverSelect from '../../select';
import Form from '../../form';
import { FieldIgnore, FieldType, SortOrder } from '../../data-set/enum';
import ObserverSelectBox from '../../select-box';
import Button from '../../button';
import Icon from '../../icon';
import { ViewField, ViewMode } from '../enum';
import { getColumnKey, getHeader } from '../../table/utils';
import { BoardCustomized } from '../Board';
import Tree from './tree';
import TreeNode, { TreeNodeProps } from './tree/TreeNode';
import { ColumnProps } from '../../table/interface';
import { treeReduce } from '../../_util/treeUtils';
import Tooltip from '../../tooltip';
import ObserverNumberField from '../../number-field';
import ObserverTextField from '../../text-field';
import { $l } from '../../locale-context';
import { ButtonColor, ButtonProps, FuncType } from '../../button/interface';
import DataSet from '../../data-set/DataSet';

function normalizeColumnsToTreeData(columns: ColumnProps[], displayFields, displaySort): object[] {
  return [...treeReduce<Map<Key, object>, ColumnProps>(columns, (map, column, _sort, parentColumn) => {
    if ((!column.__tableGroup || (!column.children && column.__group)) && column.name) {
      const key = column.__originalKey || getColumnKey(column);
      const sort = displaySort ? displaySort.find(s => s.name === key) : undefined;
      map.set(key, {
        key,
        parentKey: parentColumn && (parentColumn.__originalKey || getColumnKey(parentColumn)),
        width: column.width,
        header: column.header,
        title: column.title,
        hidden: !displayFields.includes(column.name),
        name: column.name,
        sort: isNumber(sort) ? sort : (column.sort || 999),
        hideable: column.hideable,
        // titleEditable: column.titleEditable,
        // draggable: column.draggable,
      });
    }
    return map;
  }, new Map()).values()];
}

export interface KanbanCustomizationSettingsProps {
  modal?: ModalChildrenProps;
  viewMode: ViewMode;
}

const KanbanCustomizationSettings: FunctionComponent<KanbanCustomizationSettingsProps> = function CustomizationSettings(props) {
  const { modal, viewMode } = props;
  const { onConfigChange = noop, autoQuery, customizedCode, getConfig, optionDS, prefixCls, customizedDS, dataSet, saveCustomized, displayFields } = useContext(BoardContext);
  const tempCustomized = useRef<BoardCustomized>(customizedDS!.current!.toData());
  const defaultData = tempCustomized.current;
  const PanelRef = useRef(null);
  const customizedLoad = getConfig('customizedLoad');

  const kanbanRecord: Record = useMemo(() => new DataSet({
    autoCreate: true,
    fields: [
      {
        name: ViewField.groupField,
        type: FieldType.string,
        options: optionDS,
        defaultValue: defaultData[ViewField.groupField],
        ignore: viewMode === ViewMode.card ? FieldIgnore.always : FieldIgnore.clean,
        required: true,
      },
      {
        name: ViewField.viewName,
        type: FieldType.string,
        defaultValue: defaultData[ViewField.viewName] || '',
        required: true,
      },
      {
        name: ViewField.viewHeight,
        type: FieldType.number,
        defaultValue: defaultData[ViewField.viewHeight] || 366,
        step: 1,
        required: true,
      },
      {
        name: ViewField.cardWidth,
        type: FieldType.number,
        defaultValue: defaultData[ViewField.cardWidth] || 6,
      },
      {
        name: ViewField.displayFields,
        type: FieldType.string,
        multiple: true,
        defaultValue: defaultData[ViewField.displayFields] || displayFields.slice(0, 3).map(field => field.name || field.header),
      },
      {
        name: ViewField.sort,
        type: FieldType.object,
        defaultValue: defaultData[ViewField.sort],
      },
      {
        name: ViewField.combineSort,
        type: FieldType.object,
        defaultValue: defaultData[ViewField.combineSort],
      },
      {
        name: ViewField.showLabel,
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        defaultValue: defaultData[ViewField.showLabel] === 0 ? 0 : 1,
      },
    ],
  }).current!, []);

  const sortPrefixCls = `${prefixCls}-customization-combine-sort`;
  const {
    fields,
    props: {
      combineSort,
    },
  } = dataSet!;

  
  const sortableFieldNames = useMemo(() => displayFields.map(df => df.sortable && df.name), [displayFields]);
  
  const sortFieldOptions = useMemo<DataSet>(() => {
    const sortFieldData: any[] = [];
    if (fields && sortableFieldNames && sortableFieldNames.length > 0) {
      fields.forEach(field => {
        if (sortableFieldNames.includes(field.name)) {
          sortFieldData.push({
            value: field.name,
            meaning: field.get('label') || field.name,
          });
        }
      });
    }
    return new DataSet({
      autoQuery: false,
      autoCreate: false,
      paging: false,
      fields: [
        { name: 'value', type: FieldType.string },
        { name: 'meaning', type: FieldType.string },
      ],
      data: sortFieldData,
    });
  }, [fields, sortableFieldNames]);

  const sortDS = useMemo<DataSet>(() => {
    const { combineSortFieldNames = new Map<string, SortOrder>() } = dataSet!;
    const data: any[] = [];
    combineSortFieldNames.forEach((sortOrder, fieldName) => {
      const record = sortFieldOptions.records.find(record => record.get('value') === fieldName);
      if (record) {
        const field = dataSet!.getField(fieldName);
        data.push({
          sortName: fieldName,
          order: sortOrder || (field && field.order) || SortOrder.asc,
        });
      }
    });
    return new DataSet({
      forceValidate: true,
      autoQuery: false,
      autoCreate: false,
      paging: false,
      fields: [
        { name: 'sortName', type: FieldType.string, options: sortFieldOptions },
        { name: 'order', type: FieldType.string, defaultValue: SortOrder.asc },
      ],
      data,
      events: {
        update: ({ dataSet }) => {
          kanbanRecord.set('combineSort', dataSet.toData());
        },
        remove: ({ dataSet }) => {
          kanbanRecord.set('combineSort', dataSet.toData());
        },
      },
    });
  }, [sortFieldOptions, dataSet, dataSet!.combineSortFieldNames]);

  const optionsFilter = (record: Record) => {
    return sortDS.every(sortRecord => sortRecord.get('sortName') !== record.get('value'));
  }

  const SortDragItem: FunctionComponent<{record: Record, index: number}> = ({record, index}) => {
    const { key } = record;
    return (
      <Draggable
        draggableId={String(key)}
        index={record.index}
      >
        {(pro, snapshot) => (
          <span
            ref={pro.innerRef}
            {...pro.draggableProps}
            className={`${sortPrefixCls}-list-item${snapshot.isDragging ? ` ${sortPrefixCls}-list-item-dragging` : ''}`}
          >
            <span {...pro.dragHandleProps} className={`${sortPrefixCls}-list-item-drag`}>
              <Icon type="baseline-drag_indicator" />
            </span>
            <span className={`${sortPrefixCls}-list-item-index`}>
              <Tag>{index + 1}</Tag>
            </span>
            <ObserverSelect
              placeholder={$l('Table', 'please_select_column')}
              className={`${sortPrefixCls}-list-item-sortName`}
              record={record}
              name="sortName"
              optionsFilter={optionsFilter}
              notFoundContent={$l('Table', 'no_save_filter')}
              clearButton={false}
            />
            <ObserverSelectBox
              record={record}
              name="order"
              className={`${sortPrefixCls}-list-item-sortOrder`}
            >
              <ObserverSelectBox.Option value={SortOrder.asc}>{$l('Table', 'ascending')}</ObserverSelectBox.Option>
              <ObserverSelectBox.Option value={SortOrder.desc}>{$l('Table', 'descending')}</ObserverSelectBox.Option>
            </ObserverSelectBox>
            <Button
              className={`${sortPrefixCls}-list-item-delete`}
              icon='delete_black-o'
              funcType={FuncType.link}
              color={ButtonColor.primary}
              onClick={() => sortDS.delete(record, false)}
            />
          </span>
        )}
      </Draggable>
    );
  }
  
  const onDragEnd = useCallback((result: DropResult) => {
    if (result.destination) {
      sortDS.move(result.source.index, result.destination.index);
      kanbanRecord.set('combineSort', sortDS.toData());
    }
  }, [sortDS.length]);

  const columnDataSet = useMemo(() => new DataSet({
    data: normalizeColumnsToTreeData(displayFields, kanbanRecord.get(ViewField.displayFields), kanbanRecord.get(ViewField.sort)),
    paging: false,
    primaryKey: 'key',
    idField: 'key',
    parentField: 'parentKey',
    events: {
      update({ dataSet, name }) {
        if (name === 'sort') {
          kanbanRecord.set(ViewField.sort, sortBy(dataSet.records, [r => r.get('sort')]).map(r => ({name: r.get('name'), sort: r.get('sort')})));
        }
        kanbanRecord.set(ViewField.displayFields, sortBy(dataSet.filter(r => !r.get('hidden')), [r => r.get('sort')]).map(r => r.get('name')));
      },
    },
  }), []);

  const { groupedTreeRecords } = columnDataSet;

  const handleRestoreKanban = useCallback(action((e: MouseEvent<any>) => {
    e.stopPropagation();
    kanbanRecord.set(defaultData);
    if (modal) {
      modal.close();
    }
  }), [kanbanRecord, modal]);

  const handleOk = useCallback(async() => {
    if (customizedDS && customizedDS.current) {
      customizedDS.current.set(kanbanRecord.toData());
      try {
        // const saveCustomized(customizedDS.current.toData());
        const customizedLoad = getConfig('customizedLoad');
        const detailRes = await saveCustomized(customizedDS.current.toData());
        const res = await customizedLoad(customizedCode, 'Board', {
          type: 'list',
        });
        const mergeRes = res.map(r => {
          if (r.id === detailRes[ViewField.id]) {
            return {...detailRes, objectVersionNumber: r.objectVersionNumber};
          }
          return r;
        })
        const defaultView = {
          code: customizedCode,
          [ViewField.viewName]: '初始列表视图',
          [ViewField.viewMode]: ViewMode.table,
          [ViewField.id]: '__DEFAULT__',
        }
        customizedDS.loadData([...mergeRes, defaultView]);
        const records = sortDS.filter(r => r.get('sortName') && r.get('order'));
        const sortInfo: Map<string, SortOrder> = new Map();
        records.forEach(record => {
          sortInfo.set(record.get('sortName'), record.get('order'));
        });
        const currentViewDS = dataSet!.getState('__CURRENTVIEWDS__'); 
        if (currentViewDS && sortInfo) {
          currentViewDS.fields.forEach(current => {
            current.order = undefined;
          });
          currentViewDS.combineSort = true;
          currentViewDS.combineSortFieldNames = observable.map(sortInfo);
          sortInfo.forEach((sortOrder, fieldName) => {
            const field = currentViewDS.getField(fieldName);
            if (field) {
              field.order = sortOrder;
            }
          });
          onConfigChange({ config: customizedDS.current.toData(), currentViewDS });
          if (autoQuery) {
            currentViewDS.query();
          }
        }
      } catch (e) {
        // record.status = RecordStatus.sync;
      }
      if (modal) {
        modal.close();
      }
    }
  }, [kanbanRecord, modal]);

  useEffect(() => {
    if (modal) {
      modal.update({
        footer: (okBtn, cancelBtn) => (
          <>
            {cloneElement<ButtonProps>(cancelBtn, { onClick: handleRestoreKanban })}
            {cloneElement<ButtonProps>(okBtn, { onClick: handleOk })}
            {/* <Button funcType={FuncType.link} color={ButtonColor.primary} onClick={handleRestoreKanban} style={{ float: 'right' }}>
              {$l('Tabs', 'restore_default')}
            </Button> */}
          </>
        ),
      });
    }
  }, [modal]);

  const loadDetail = useCallback(async () => {
    const res = await customizedLoad(customizedCode!, 'Board', {
      type: 'detail',
      [ViewField.id]: defaultData[ViewField.id],
    });
    try {
      const dataJson = res.dataJson ? JSON.parse(res.dataJson) : {};
      kanbanRecord.init({...omit(res, 'dataJson'), ...dataJson});
      sortDS.loadData(dataJson.combineSort);
    } catch (error) {
      warning(false, error.message);
    }
  }, []);

  useEffect(() => {
    loadDetail();
  }, []);

  const handleDragTreeNode = useCallback(action((srcIndex: number, destIndex: number) => {
    const records = sortBy(columnDataSet.records, [r => r.get('sort')]);
    const [removed] = records.splice(srcIndex, 1);
    records.splice(destIndex, 0, removed);
    records.forEach((r, index) => {
      r.set('sort', index);
    });
  }), [columnDataSet]);

  const handleDragEnd = useCallback(({ destination, source: { index: srcIndex } }: DropResult) => {
    if (destination) {
      const {
        // droppableId: destDroppableId, 
        index: destIndex,
      } = destination;
      // const src = srcDroppableId.split('__--__');
      handleDragTreeNode(srcIndex, destIndex);
      // , src[1]
    }
  }, [handleDragTreeNode]);

  const renderPopupContent = useCallback(() => {
    return (
      <div className={`${prefixCls}-customization-panel-content`}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Tree>
            {
              sortBy(groupedTreeRecords[0].records, [r => r.get('sort')]).map<ReactElement<TreeNodeProps | DraggableProps>>((record, index, list) => {
                const children = (
                  <TreeNode
                    key={record.key}
                    record={record}
                    isLeaf
                    index={index}
                    records={list}
                  />
                );
                return record.get('draggable') !== false && (!record.parent || list.length > 1) ? (
                  <Draggable key={record.key} draggableId={String(record.key)} index={index}>
                    {
                      (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                        cloneElement<any>(children, { provided, snapshot })
                      )
                    }
                  </Draggable>
                ) : children;
              })}
          </Tree>
        </DragDropContext>
      </div>
    );
  }, [kanbanRecord.get(ViewField.displayFields), kanbanRecord.get(ViewField.sort), groupedTreeRecords]);

  return (
    <div ref={PanelRef}>
      <Collapse
        // onChange={handleCollapseChange}
        defaultActiveKey={['kanban', 'card', 'data']}
        // expandIcon={renderIcon}
        expandIconPosition="text-right"
        className={`${prefixCls}-customization`}
        ghost
      >
        <CollapsePanel
          header={
            <span className={`${prefixCls}-customization-panel-title`}>
              看板设置
            </span>
          }
          key="kanban"
        >
          <Form className={`${prefixCls}-customization-form`} record={kanbanRecord}>
            <ObserverTextField
              name={ViewField.viewName}
              label="视图名称"
            />
            <ObserverSelect
              name="groupField"
              label="分组字段"
              clearButton={false}
              hidden={viewMode !== ViewMode.kanban}
            />
            <ObserverNumberField
              label="视图高度"
              name={ViewField.viewHeight}
            />
          </Form>
        </CollapsePanel>
        <CollapsePanel
          header={
            <span className={`${prefixCls}-customization-panel-title`}>
              卡片设置
            </span>
          }
          key="card"
        >
          <Form className={`${prefixCls}-customization-form`} record={kanbanRecord}>
            <ObserverSelect
              name="cardWidth"
              label="卡片宽度"
              key="cardWidth"
              clearButton={false}
            >
              <ObserverSelect.Option value={4}>
                窄
              </ObserverSelect.Option>
              <ObserverSelect.Option value={6}>
                适中
              </ObserverSelect.Option>
              <ObserverSelect.Option value={8}>
                较宽
              </ObserverSelect.Option>
              <ObserverSelect.Option value={12}>
                宽
              </ObserverSelect.Option>
            </ObserverSelect>
            <ObserverSelect
              name="displayFields"
              label="显示字段"
              key="displayFields"
              popupContent={renderPopupContent}
              onClear={() => kanbanRecord.set(ViewField.displayFields, null)}
              getPopupContainer={() => PanelRef.current}
            >
              {displayFields.map(field => {
                if (!field.hidden) {
                  const header = getHeader({
                    name: field.name,
                    title: field.title,
                    header: field.header,
                    dataSet: dataSet!,
                  });
                  return <ObserverSelect.Option value={field.name} key={`${field.name}_option`}>
                    {header}
                  </ObserverSelect.Option>
                }
                return null;
              }).filter(Boolean)}
            </ObserverSelect>
            <ObserverSelectBox
              name="showLabel"
              key="showLabel"
              label="显示字段名称"
            >
              <ObserverSelectBox.Option value={1}>
                是
              </ObserverSelectBox.Option>
              <ObserverSelectBox.Option value={0}>
                否
              </ObserverSelectBox.Option>
            </ObserverSelectBox>
          </Form>
        </CollapsePanel>
        <CollapsePanel
          header={
            <span className={`${prefixCls}-customization-panel-title`}>
              数据设置
            </span>
          }
          key="data"
        >
          <div className={`${prefixCls}-customization-panel-des`}>
            <span>选择此视图下的记录默认排序方式</span>
            <Tooltip title="可排序的前提是后端查询已支持排序">
              <Icon type='help' />
            </Tooltip>
          </div>
          <div className={`${sortPrefixCls}-content`}>
            <div className={`${sortPrefixCls}-list-container`}>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable
                  droppableId="combine-sort"
                  direction="vertical"
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`${sortPrefixCls}-list`}
                    >
                      {sortDS.map((record, index) => {
                        const { key } = record;
                        return <SortDragItem key={key} record={record} index={index} />;
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
            <div className={`${sortPrefixCls}-add-button`}>
              <Button
                funcType={FuncType.link}
                icon="add"
                onClick={() => sortDS.create()}
                color={ButtonColor.primary}
                disabled={combineSort ? sortDS.length >= sortFieldOptions.length : sortDS.length > 0}
              >
                {$l('Table', 'add_sort')}
              </Button>
            </div>
          </div>
        </CollapsePanel>
      </Collapse>
    </div>
  );
}


KanbanCustomizationSettings.displayName = 'KanbanCustomizationSettings';

export default observer(KanbanCustomizationSettings);
