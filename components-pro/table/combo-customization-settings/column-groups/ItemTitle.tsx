import React, { FunctionComponent, isValidElement, useCallback, useContext } from 'react';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import { DraggableProvided } from 'react-beautiful-dnd';
import ObserverTextField from '../../../text-field/TextField';
import { getHeader } from '../../utils';
import TableContext from '../../TableContext';
import Record from '../../../data-set/Record';
import { Size } from '../../../core/enum';

export interface ItemTitleProps {
  record: Record;
  provided?: DraggableProvided;
}

const ItemTitle: FunctionComponent<ItemTitleProps> = function ItemTitle(props) {
  const { record, provided } = props;
  const { dataSet, tableStore, aggregation } = useContext(TableContext);
  const { columnTitleEditable } = tableStore;
  const editing = record.getState('editing');
  const handleEditBlur = useCallback(() => {
    record.setState('editing', false);
  }, []);
  const handleHeaderChange = useCallback((value) => {
    record.set('title', value);
  }, [record]);
  const title = record.get('title');
  const header = getHeader({
    name: record.get('name'),
    title,
    header: record.get('header'),
    dataSet,
    aggregation,
  });
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
            size={Size.small}
          />
        ) : (
          <span {...(provided && provided.dragHandleProps)} style={provided ? { cursor: 'move' } : undefined}>
            {toJS(header)}
          </span>
        )
      }
    </>
  );
};

ItemTitle.displayName = 'ItemTitle';

export default observer(ItemTitle);
