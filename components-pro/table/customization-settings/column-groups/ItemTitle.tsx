import React, { FunctionComponent, isValidElement, useCallback, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { DraggableProvided } from 'react-beautiful-dnd';
import ObserverTextField from '../../../text-field/TextField';
import { getHeader } from '../../utils';
import TableContext from '../../TableContext';
import Record from '../../../data-set/Record';

export interface ItemTitleProps {
  record: Record;
  provided?: DraggableProvided;
}

const ItemTitle: FunctionComponent<ItemTitleProps> = observer((props) => {
  const { record, provided } = props;
  const { tableStore: { dataSet, columnTitleEditable } } = useContext(TableContext);
  const editing = record.getState('editing');
  const handleEditBlur = useCallback(() => {
    record.setState('editing', false)
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
    </>
  );
});

ItemTitle.displayName = 'ItemTitle';

export default ItemTitle;
