import React, { FunctionComponent, memo, useCallback, useContext, useEffect, useState } from 'react';
import { CHILDREN_PAGE_INFO } from 'choerodon-ui/dataset/data-set/DataSet';
import { ElementProps } from '../core/ViewComponent';
import Button from '../button';
import { ButtonColor, FuncType } from '../button/enum';
import TableContext from './TableContext';
import Record from '../data-set/Record';
import { DataSetStatus } from '../data-set/enum';
import { $l } from '../locale-context';

export interface ChildrenQueryButtonProps extends ElementProps {
  expanded?: boolean;
  record: Record;
}

const ChildrenQueryButton: FunctionComponent<ChildrenQueryButtonProps> = function ChildrenQueryButton(props) {
  const [hasMoreChild, setHasMoreChild]: [boolean, any] = useState(false);
  const { expanded, record: parent, style } = props;
  const { dataSet, isTree, prefixCls } = useContext(TableContext);

  const updateHasMoreChild = useCallback(async () => {
    await dataSet.ready();
    const { total = 0 } = parent.getState(CHILDREN_PAGE_INFO);
    const childrenLength = parent.children?.length || 0;
    if (total > childrenLength) {
      setHasMoreChild(true);
    } else {
      setHasMoreChild(false);
    }
  }, [parent]);

  const queryMoreChild = useCallback(async () => {
    if (parent.getState(CHILDREN_PAGE_INFO)) {
      const { currentPage } = parent.getState(CHILDREN_PAGE_INFO);
      await dataSet.queryMoreChild(parent, currentPage + 1);
      updateHasMoreChild();
    }
  }, [parent]);
  
  useEffect(() => {
    dataSet.ready().then(() => {
      if (parent.getState(CHILDREN_PAGE_INFO)) {
        updateHasMoreChild();
      }
    });
  }, [parent, expanded, dataSet]);
  return (
    <Button
      funcType={FuncType.link}
      color={ButtonColor.primary}
      onClick={queryMoreChild}
      hidden={!isTree || dataSet.paging === false || !expanded || !hasMoreChild}
      loading={dataSet.status === DataSetStatus.loading}
      className={`${prefixCls}-children-query-button`}
      style={style}
    >
      {$l('Table', 'query_more_children')}
    </Button>
  );
};

ChildrenQueryButton.displayName = 'ChildrenQueryButton';

export default memo(ChildrenQueryButton);
