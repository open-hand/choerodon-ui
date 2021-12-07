import { Key } from 'react';
import { ColumnProps } from '../Column';

// @ts-ignore
export function addEvent(el?: any, event: string, handler: EventListener | EventListenerObject | null, inputOptions?: Object): void {
  if (!el) return;
  const options = { capture: true, ...inputOptions };
  if (el.addEventListener) {
    el.addEventListener(event, handler, options);
  } else if (el.attachEvent) {
    el.attachEvent('on' + event, handler);
  } else {
    // $FlowIgnore: Doesn't think elements are indexable
    el['on' + event] = handler;
  }
}

export function removeEvent(el: any, event: string, handler: Function, inputOptions?: Object): void {
  if (!el) return;
  const options = { capture: true, ...inputOptions };
  if (el.removeEventListener) {
    el.removeEventListener(event, handler, options);
  } else if (el.detachEvent) {
    el.detachEvent('on' + event, handler);
  } else {
    // $FlowIgnore: Doesn't think elements are indexable
    el['on' + event] = null;
  }
}

export function findHiddenKeys(children, columns: any[]): string[] {
  const hiddenColumnKeys: string[] = [];
  if (children && children.length) {
    Array.from(children as Iterable<any>).map(
      (child: any) => {
        if (child.props && child.props.hidden) {
          const columnChildren: any = child.props.children;
          hiddenColumnKeys.push(columnChildren[1].props.dataKey);
        }
      },
    );
  }
  if (columns && columns.length) {
    Array.from(columns as Iterable<any>).map(
      (child: any) => {
        if (child && child.hidden) {
          hiddenColumnKeys.push(child.dataIndex);
        }
      },
    );
  }
  return hiddenColumnKeys;
}


export function getColumnKey({ dataIndex, key }: ColumnProps): Key {
  return key || dataIndex!;
}

export function getColumnFixed(fixed?: boolean | 'left' | 'right'): 'left' | 'right' | false {
  if (fixed === true) {
    return 'left';
  }
  if (fixed) {
    return fixed;
  }

  return false;
}
