import React, { FunctionComponent, memo, useContext, useState } from 'react';
import Popover from 'choerodon-ui/lib/popover';
import { FuncType } from '../../button/enum';
import { Size } from '../../core/enum';
import Button from '../../button/Button';
import Tooltip from '../../tooltip';
import TableContext from '../TableContext';
import { $l } from '../../locale-context';
import CustomizationSettings from './CustomizationSettings';

const ComboCustomizationColumnHeader: FunctionComponent = function ComboCustomizationColumnHeader() {
  const { prefixCls } = useContext(TableContext);
  const [visible, setVisible] = useState<boolean>(false);

  const handleVisibleChange = () => {
    setVisible(!visible);
  };

  return (
    <Tooltip title={$l('Table', 'field_settings')}>
      <Popover
        trigger="click"
        placement="bottomRight"
        overlayClassName={`${prefixCls}-combo-customization`}
        title={$l('Table', 'field_settings')}
        content={<CustomizationSettings visible={visible} setVisible={setVisible} />}
        onVisibleChange={handleVisibleChange}
        visible={visible}
        arrowPointAtCenter
      >
        <Button funcType={FuncType.flat} size={Size.small} icon="predefine" />
      </Popover>
    </Tooltip>
  );
};

ComboCustomizationColumnHeader.displayName = 'ComboCustomizationColumnHeader';

export default memo(ComboCustomizationColumnHeader);
