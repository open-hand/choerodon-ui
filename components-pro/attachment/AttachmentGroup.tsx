import React, { Children, cloneElement, FunctionComponent, isValidElement, memo, ReactElement, ReactNode, useContext, useMemo } from 'react';
import Trigger from 'choerodon-ui/lib/trigger';
import { Action } from 'choerodon-ui/lib/trigger/enum';
import ConfigContext from 'choerodon-ui/lib/config-provider/ConfigContext';
import BUILT_IN_PLACEMENTS from '../trigger-field/placements';
import { ButtonColor, FuncType } from '../button/enum';
import Button, { ButtonProps } from '../button/Button';
import { $l } from '../locale-context';
import isFragment from '../_util/isFragment';
import { AttachmentProps } from './Attachment';

export interface AttachmentGroupProps extends ButtonProps {
  viewMode: 'list' | 'popup';
  label?: ReactNode;
  colSpan?: number;
  rowSpan?: number;
}

function normalizeAttachments(children: ReactNode): ReactNode {
  return Children.map(children, (child) => {
    if (isFragment(child)) {
      return normalizeAttachments(child.props.children);
    }
    if (isValidElement<AttachmentProps>(child) && (child.type as any).__PRO_ATTACHMENT) {
      return cloneElement<AttachmentProps>(child, { viewMode: 'list', readOnly: true, __inGroup: true });
    }
    return undefined;
  });
}

const AttachmentGroup: FunctionComponent<AttachmentGroupProps> = function AttachmentGroup(props) {
  const { viewMode, children, hidden, ...buttonProps } = props;
  const { getProPrefixCls } = useContext(ConfigContext);
  const prefixCls = getProPrefixCls('attachment');
  const attachments: ReactElement | null = useMemo(() => children ? (
    <div className={`${prefixCls}-group`}>
      {normalizeAttachments(children)}
    </div>
  ) : null, [children]);
  const renderGroup = (): ReactElement | null => {
    if (hidden) {
      return null;
    }
    if (viewMode === 'list') {
      return attachments;
    }
    return (
      <Trigger
        prefixCls={prefixCls}
        popupContent={attachments}
        action={[Action.hover, Action.focus]}
        builtinPlacements={BUILT_IN_PLACEMENTS}
        popupPlacement="bottomLeft"
      >
        <Button
          icon="attach_file"
          funcType={FuncType.flat}
          color={ButtonColor.primary}
          {...buttonProps}
        >
          {$l('Attachment', 'view_attachment')}
        </Button>
      </Trigger>
    );
  };

  return renderGroup();
};

AttachmentGroup.defaultProps = {
  viewMode: 'popup',
};

AttachmentGroup.displayName = 'AttachmentGroup';

export default memo(AttachmentGroup);
