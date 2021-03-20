import React, { FunctionComponent, ReactNode, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { DraggableProvided, DropResult, ResponderProvided } from 'react-beautiful-dnd';
import Tree from '../tree/Tree';
import SubGroups from './SubGroups';
import TableContext from '../../TableContext';
import Record from '../../../data-set/Record';

export interface GroupProps {
  header?: ReactNode;
  records: Record[];
  value?: any;
  onDragEnd: (result: DropResult, provided: ResponderProvided) => void;
  treeNodeRenderer: (record: Record, provided: DraggableProvided) => ReactNode;
  treeNodeSuffix: (record: Record, index: number, records: Record[]) => ReactNode;
}

const Group: FunctionComponent<GroupProps> = observer((props) => {
  const { header, records, value, onDragEnd, treeNodeRenderer, treeNodeSuffix } = props;
  const { tableStore: { prefixCls } } = useContext(TableContext);
  return (
    <>
      <div className={`${prefixCls}-customization-tree-group-header`}>
        {header}
      </div>
      <Tree value={value}>
        <SubGroups
          records={records}
          onDragEnd={onDragEnd}
          treeNodeRenderer={treeNodeRenderer}
          treeNodeSuffix={treeNodeSuffix}
        />
      </Tree>
    </>
  );
});

Group.displayName = 'Group';

export default Group;
