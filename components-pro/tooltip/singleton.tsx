import React, {
  createRef,
  forwardRef,
  ForwardRefExoticComponent,
  RefObject,
  useCallback,
  useContext,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { render } from 'react-dom';
import defer from 'lodash/defer';
import { TooltipManager } from 'choerodon-ui/shared';
import { TooltipContainerRef, TooltipManagerType } from 'choerodon-ui/shared/tooltip-manager';
import ConfigContext from 'choerodon-ui/lib/config-provider/ConfigContext';
import { getProPrefixCls } from 'choerodon-ui/lib/configure/utils';
import { getGlobalPopupContainer } from 'choerodon-ui/lib/trigger/Popup';
import Tooltip, { TooltipProps } from './Tooltip';
import TaskRunner from '../_util/TaskRunner';

export const suffixCls = 'singleton-tooltip';

export { TooltipContainerRef, TooltipManagerType };

const TooltipContainer: ForwardRefExoticComponent<any> = forwardRef<TooltipContainerRef>((_, ref) => {
  const task = useMemo(() => new TaskRunner(), []);
  const [tooltipProps, setTooltipProps] = useState<TooltipProps>();
  const { getTooltipTheme, getTooltipPlacement } = useContext(ConfigContext);
  const open = useCallback((target, args, duration = 100) => {
    task.cancel();
    task.delay(duration, () => {
      setTooltipProps({
        theme: getTooltipTheme(),
        placement: getTooltipPlacement(),
        ...args,
        hidden: false,
        getRootDomNode: () => target,
      });
    });
    return task;
  }, [task, getTooltipTheme, getTooltipPlacement]);
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
    <Tooltip {...tooltipProps} onPopupMouseEnter={()=>defer(handlePopupMouseEnter)} onPopupMouseLeave={handlePopupMouseLeave} />
  );
});

function getRoot() {
  let { root } = TooltipManager;
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
      TooltipManager.root = root;
    }
  }
  return root;
}

async function getContainer(): Promise<RefObject<TooltipContainerRef>> {
  const { container } = TooltipManager;
  if (container) {
    return container;
  }
  return new Promise(resolve => {
    const root = getRoot();
    if (root) {
      const ref = createRef<TooltipContainerRef>();
      TooltipManager.container = ref;
      render(<TooltipContainer ref={ref} />, root, () => resolve(ref));
    }
  });
}

export async function show(target: HTMLElement, props: TooltipProps, duration = 100): Promise<TaskRunner | undefined> {
  const container = await getContainer();
  const { current } = container;
  if (current) {
    return current.open(target, props, duration);
  }
}

export async function hide(duration = 100): Promise<TaskRunner | undefined> {
  const container = await getContainer();
  const { current } = container;
  if (current) {
    return current.close(duration);
  }
}
