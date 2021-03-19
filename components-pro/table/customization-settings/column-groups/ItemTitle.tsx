import React, { FunctionComponent, isValidElement, useCallback, useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { DraggableProvided } from 'react-beautiful-dnd';
import Button from '../../../button/Button';
import ObserverTextField from '../../../text-field/TextField';
import { ButtonColor, FuncType } from '../../../button/enum';
import { getHeader } from '../../utils';
import TableContext from '../../TableContext';
import { Size } from '../../../core/enum';
import Record from '../../../data-set/Record';

export interface ItemTitleProps {
  record: Record;
  provided?: DraggableProvided;
}

const ItemTitle: FunctionComponent<ItemTitleProps> = observer((props) => {
  const { record, provided } = props;
  const { tableStore: { dataSet, columnTitleEditable, prefixCls } } = useContext(TableContext);
  const [editing, setEditing] = useState(false);
  const handleEdit = useCallback(() => setEditing(true), []);
  const handleEditBlur = useCallback(() => {
    setEditing(false);
  }, []);
  const handleHeaderChange = useCallback((value) => {
    record.set('title', value);
  }, [record]);
  const title = record.get('title');
  const header = getHeader({
    name: record.get('name'),
    title,
    header: record.get('header'),
  }, dataSet);
  const titleEditable = columnTitleEditable && record.get('titleEditable') !== false;

  return (
    <>
      {
        editing && titleEditable ? (
          <ObserverTextField
            onBlur={handleEditBlur}
            value={isValidElement(header) ? title : header}
            onChange={handleHeaderChange}
            autoFocus
          />
        ) : (
          <span {...(provided && provided.dragHandleProps)} style={provided ? { cursor: 'move' } : undefined}>{header}</span>
        )
      }
      {
        !editing && titleEditable && (
          <Button
            className={`${prefixCls}-customization-tree-treenode-edit-btn`}
            funcType={FuncType.flat}
            icon="mode_edit"
            color={ButtonColor.primary}
            size={Size.small}
            onClick={handleEdit}
          />
        )
      }
    </>
  );
});

ItemTitle.displayName = 'ItemTitle';

export default ItemTitle;
