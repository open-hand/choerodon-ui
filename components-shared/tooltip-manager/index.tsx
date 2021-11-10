import { RefObject } from 'react';
import { TooltipProps } from 'choerodon-ui/pro/lib/tooltip/Tooltip';
import TaskRunner from 'choerodon-ui/pro/lib/_util/TaskRunner';

export type TooltipContainerRef = {
  open: (target: Node, props: TooltipProps, duration?: number) => TaskRunner;
  close: (duration?: number) => TaskRunner;
}

export type TooltipManagerType = {
  container?: RefObject<TooltipContainerRef>;
  root?: HTMLDivElement;
}
const manager: TooltipManagerType = {};

export default manager;
