import React from 'react';
import { Tooltip, Icon } from 'choerodon-ui';

const branchUrl = 'https://github.com/open-hand/choerodon-ui/edit/master/';

export default function EditButton({ title, filename }) {
  return (
    <Tooltip title={title}>
      <a className="edit-button" href={`${branchUrl}${filename}`} target="_blank" rel="noopener noreferrer">
        <Icon type="edit" />
      </a>
    </Tooltip>
  );
}
