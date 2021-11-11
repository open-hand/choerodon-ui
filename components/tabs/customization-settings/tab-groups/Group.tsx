import React, { FunctionComponent, ReactElement, ReactNode, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { Draggable, DraggableProps, DraggableProvided, DraggableStateSnapshot, Droppable, DroppableProvided } from 'react-beautiful-dnd';
import sortBy from 'lodash/sortBy';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import TabsContext from '../../TabsContext';
import Item from './Item';

export interface GroupProps {
  header?: ReactNode;
  records: Record[];
  value?: any;
  defaultKey?: string | undefined;
  nodeSuffix: (record: Record, index: number, records: Record[]) => ReactNode;
}

const Group: FunctionComponent<GroupProps> = function Group(props) {
  const { header, records, value, nodeSuffix, defaultKey } = props;
  const { prefixCls, tabDraggable } = useContext(TabsContext);
  return (
    <>
      {
        header && (
          <div className={`${prefixCls}-customization-group-header`}>
            {header}
          </div>
        )
      }
      <Droppable
        isDropDisabled={!tabDraggable}
        droppableId={value}
        key="group"
      >
        {
          (droppableProvided: DroppableProvided) => (
            <div
              ref={droppableProvided.innerRef}
              className={`${prefixCls}-customization-group`}
              {...(droppableProvided && droppableProvided.droppableProps)}
            >
              {
                sortBy(records, [r => r.get('sort')]).map<ReactElement<DraggableProps>>((record, index, list) => (
                  <Draggable key={record.key} draggableId={String(record.key)} index={index}>
                    {
                      (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                        <Item
                          key={record.key}
                          record={record}
                          suffix={nodeSuffix}
                          index={index}
                          records={list}
                          provided={provided}
                          snapshot={snapshot}
                          defaultKey={defaultKey}
                        />
                      )
                    }
                  </Draggable>
                ))
              }
              {droppableProvided && droppableProvided.placeholder}
            </div>
          )
        }
      </Droppable>
    </>
  );
};

Group.displayName = 'Group';

export default observer(Group);
