import React, { Children, cloneElement, FunctionComponent, isValidElement, ReactElement, ReactNode, useContext, useMemo, useRef } from 'react';
import { action, observable, ObservableMap } from 'mobx';
import { observer } from 'mobx-react-lite';
import Trigger from 'choerodon-ui/lib/trigger';
import { Action } from 'choerodon-ui/lib/trigger/enum';
import ConfigContext from 'choerodon-ui/lib/config-provider/ConfigContext';
import BUILT_IN_PLACEMENTS from '../trigger-field/placements';
import { ButtonColor, FuncType } from '../button/enum';
import Button, { ButtonProps } from '../button/Button';
import { $l } from '../locale-context';
import isFragment from '../_util/isFragment';
import Attachment, { AttachmentProps } from './Attachment';
import { iteratorReduce } from '../_util/iteratorUtils';

export interface AttachmentGroupProps extends ButtonProps {
  viewMode: 'list' | 'popup';
  label?: ReactNode;
  colSpan?: number;
  rowSpan?: number;
  text?: ReactNode;
  count?: number;
}

type GetRef = (attachment: Attachment | null, index: number) => void;

function getRefCallback(callback, index) {
  return item => callback(item, index);
}

function normalizeAttachments(children: ReactNode, getRef?: GetRef, index = { count: 0 }): ReactNode {
  return Children.map(children, (child) => {
    if (isFragment(child)) {
      return normalizeAttachments(child.props.children, getRef, index);
    }
    if (isValidElement<AttachmentProps>(child) && (child.type as any).__PRO_ATTACHMENT) {
      const props: AttachmentProps & { ref?: GetRef } = { viewMode: 'list', readOnly: true, __inGroup: true };
      if (getRef) {
        const { count } = index;
        props.ref = getRefCallback(getRef, count);
        index.count = count + 1;
      }
      return cloneElement<AttachmentProps>(child, props);
    }
    return undefined;
  });
}

const AttachmentGroup: FunctionComponent<AttachmentGroupProps> = function AttachmentGroup(props) {
  const { viewMode, children, hidden, text, count, ...buttonProps } = props;
  const hasCount = count !== undefined;
  const { getProPrefixCls, getConfig } = useContext(ConfigContext);
  const listRef = useRef<ObservableMap<number, Attachment>>(observable.map());
  const prefixCls = getProPrefixCls('attachment');
  const computedCount = hasCount ? count : iteratorReduce<Attachment, number>(listRef.current.values(), (sum, attachment) => sum + (attachment.count || 0), 0);
  const attachments = useMemo((): ReactElement | undefined => children ? (
    <div className={`${prefixCls}-group`}>
      {
        normalizeAttachments(children, hasCount ? undefined : action((attachment, index) => {
          if (attachment) {
            listRef.current.set(index, attachment);
          } else {
            listRef.current.delete(index);
          }
        }))
      }
    </div>
  ) : undefined, [children, hasCount, viewMode, prefixCls]);
  const renderEmpty = (): ReactElement | undefined => {
    if (computedCount === 0) {
      return (
        <div className={`${prefixCls}-empty`}>
          {getConfig('renderEmpty')('Attachment')}
        </div>
      );
    }
  };
  const content: ReactElement = (
    <>
      {renderEmpty()}
      {attachments}
    </>
  );
  const renderGroup = (): ReactElement | null => {
    if (hidden) {
      return null;
    }
    if (viewMode === 'list') {
      return content;
    }
    return (
      <Trigger
        prefixCls={prefixCls}
        popupContent={content}
        action={[Action.hover, Action.focus]}
        builtinPlacements={BUILT_IN_PLACEMENTS}
        popupPlacement="bottomLeft"
        forceRender={!hasCount}
      >
        <Button
          icon="attach_file"
          funcType={FuncType.link}
          color={ButtonColor.primary}
          {...buttonProps}
        >
          {text || $l('Attachment', 'view_attachment')} {computedCount || undefined}
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

export default observer(AttachmentGroup);
