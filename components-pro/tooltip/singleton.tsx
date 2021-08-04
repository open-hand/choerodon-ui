import React, { createRef, forwardRef, ForwardRefExoticComponent, RefObject, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import { render } from 'react-dom';
import { getTooltipTheme } from 'choerodon-ui/lib/_util/TooltipUtils';
import { getProPrefixCls } from 'choerodon-ui/lib/configure';
import Tooltip, { TooltipProps } from './Tooltip';
import { getGlobalPopupContainer } from '../trigger/Popup';
import TaskRunner from '../_util/TaskRunner';

export const suffixCls = 'singleton-tooltip';

const manager: TooltipManagerType = {};

export type TooltipContainerRef = {
  open: (target: Node, props: TooltipProps, duration?: number) => TaskRunner;
  close: (duration?: number) => TaskRunner;
}

export type TooltipManagerType = {
  container?: RefObject<TooltipContainerRef>;
  root?: HTMLDivElement;
}

const TooltipContainer: ForwardRefExoticComponent<any> = forwardRef<TooltipContainerRef>((_, ref) => {
  const task = useMemo(() => new TaskRunner(), []);
  const [tooltipProps, setTooltipProps] = useState<TooltipProps>();
  const open = useCallback((target, args, duration = 100) => {
    task.cancel();
    task.delay(duration, () => {
      setTooltipProps({
        theme: getTooltipTheme(),
        ...args,
        hidden: false,
        getRootDomNode: () => target,
      });
    });
    return task;
  }, [task]);
  const close = useCallback((duration = 100) => {
    task.cancel();
    task.delay(duration, () => {
      setTooltipProps((preState) => ({
        ...preState,
        hidden: true,
      }));
    });
    return task;
  }, [task]);
  const handlePopupMouseEnter = useCallback(() => {
    task.cancel();
  }, [task]);
  const handlePopupMouseLeave = useCallback(() => {
    close();
  }, [close]);
  useImperativeHandle(ref, () => ({
    open,
    close,
  }), [open, close]);

  return (
    <Tooltip {...tooltipProps} onPopupMouseEnter={handlePopupMouseEnter} onPopupMouseLeave={handlePopupMouseLeave} />
  );
});


function getRoot() {
  let { root } = manager;
  if (typeof window !== 'undefined') {
    const popupContainer = getGlobalPopupContainer();
    const doc = window.document;
    if (root) {
      if (!root.parentNode) {
        popupContainer.appendChild(root);
      }
    } else {
      root = doc.createElement('div');
      root.className = `${getProPrefixCls(suffixCls)}-container`;
      popupContainer.appendChild(root);
      manager.root = root;
    }
  }
  return root;
}

async function getContainer(): Promise<RefObject<TooltipContainerRef>> {
  const { container } = manager;
  if (container) {
    return container;
  }
  return new Promise(resolve => {
    const root = getRoot();
    if (root) {
      const ref = createRef<TooltipContainerRef>();
      manager.container = ref;
      render(<TooltipContainer ref={ref} />, root, () => resolve(ref));
    }
  });
}

export async function show(target: HTMLElement, props: TooltipProps, duration?: number): Promise<TaskRunner | undefined> {
  const container = await getContainer();
  const { current } = container;
  if (current) {
    return current.open(target, props, duration);
  }
}

export async function hide(duration?: number): Promise<TaskRunner | undefined> {
  const container = await getContainer();
  const { current } = container;
  if (current) {
    return current.close(duration);
  }
}
