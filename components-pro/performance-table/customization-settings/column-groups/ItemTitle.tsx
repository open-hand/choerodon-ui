import React, { FunctionComponent, isValidElement, useCallback, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { DraggableProvided } from 'react-beautiful-dnd';
import ObserverTextField from '../../../text-field/TextField';
import TableContext from '../../TableContext';
import Record from '../../../data-set/Record';
import { $l } from '../../../locale-context';

export interface ItemTitleProps {
  record: Record;
  provided?: DraggableProvided;
}

function getHeader(record, title) {
  if (title !== undefined) {
    if (typeof title === 'function') {
      const dom = title();
      if (dom && dom.type && dom.type.__PRO_CHECKBOX) {
        record.set('titleEditable', false);
        return $l('Table', 'select_current_page');
      }
      return dom;
    }
    return title;
  }
  return record.get('children')[0].props.children;
}

const ItemTitle: FunctionComponent<ItemTitleProps> = function ItemTitle(props) {
  const { record, provided } = props;
  const { tableStore } = useContext(TableContext);
  const { columnTitleEditable } = tableStore;
  const editing = record.getState('editing');
  const handleEditBlur = useCallback(() => {
    record.setState('editing', false);
  }, []);
  const handleHeaderChange = useCallback((value) => {
    record.set('title', value);
  }, [record]);
  const title = record.get('title') || record.get('header');
  const header = getHeader(record, title);
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
};

ItemTitle.displayName = 'ItemTitle';

export default observer(ItemTitle);
