import React, { FunctionComponent, ReactElement, useCallback, useContext } from 'react';
import { action } from 'mobx';
import { observer } from 'mobx-react-lite';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import sortBy from 'lodash/sortBy';
import DataSet from 'choerodon-ui/pro/lib/data-set/DataSet';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import Group, { GroupProps } from './Group';
import ItemSuffix from './ItemSuffix';
import TabsContext from '../../TabsContext';

export interface TabGroupsProps {
  dataSet: DataSet;
  defaultKey?: string | undefined;
  onDefaultKeyChange: (defaultKey: string) => void;
}

const TabGroups: FunctionComponent<TabGroupsProps> = function TabGroups(props) {
  const { dataSet, defaultKey, onDefaultKeyChange } = props;
  const { groupedTreeRecords } = dataSet;
  const { prefixCls, groupedPanelsMap } = useContext(TabsContext);
  const handleDragItem = useCallback(action((srcIndex: number, destIndex: number, groupKey: string) => {
    const group = groupedTreeRecords.find(({ value = 'default' }) => value === groupKey);
    if (group) {
      const records = sortBy(group.records, [r => r.get('sort')]);
      const [removed] = records.splice(srcIndex, 1);
      records.splice(destIndex, 0, removed);
      records.forEach((r, index) => r.set('sort', index));
    }
  }), [dataSet, groupedTreeRecords]);
  const handleDragEnd = useCallback(({ destination, source: { droppableId: srcDroppableId, index: srcIndex } }: DropResult) => {
    if (destination) {
      const { index: destIndex } = destination;
      if (srcIndex !== destIndex) {
        handleDragItem(srcIndex, destIndex, srcDroppableId);
      }
    }
  }, [handleDragItem]);
  const treeNodeSuffix = useCallback((record: Record, index: number, records: Record[]) => (
    <ItemSuffix
      record={record}
      index={index}
      records={records}
      groups={groupedTreeRecords}
      defaultKey={defaultKey}
      onDefaultKeyChange={onDefaultKeyChange}
    />
  ), [groupedTreeRecords, defaultKey]);

  function getGroupHeader(groupKey) {
    const groupPaneMap = groupedPanelsMap.get(groupKey);
    if (groupPaneMap) {
      return groupPaneMap.group.tab;
    }
  }

  const groups = groupedTreeRecords.map<ReactElement<GroupProps>>(({ value = 'default', records }) => (
    <DragDropContext key={String(value)} onDragEnd={handleDragEnd}>
      <Group
        value={value}
        header={getGroupHeader(value)}
        records={records}
        nodeSuffix={treeNodeSuffix}
        defaultKey={defaultKey}
      />
    </DragDropContext>
  ));
  return (
    <div className={`${prefixCls}-customization-panel-content`}>
      {groups}
    </div>
  );
};

TabGroups.displayName = 'TabGroups';

export default observer<TabGroupsProps>(TabGroups);
