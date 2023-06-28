import * as React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import clamp from 'lodash/clamp';
import debounce from 'lodash/debounce';
import noop from 'lodash/noop';
import { DOMMouseMoveTracker } from 'dom-lib';
import { defaultClassPrefix, getUnhandledProps } from './utils';
import { addEvent, removeEvent } from './utils/domFns';
import TableContext from './TableContext';
import { RESIZE_MIN_WIDTH } from './constants';
import { transformZoomData } from '../_util/DocumentUtils';

export type FixedType = boolean | 'left' | 'right';

export interface Client {
  clientX?: number;
  clientY?: number;
  preventDefault?: Function;
}

export interface ColumnResizeHandlerProps {
  height?: number;
  defaultColumnWidth?: number;
  columnLeft?: number;
  columnFixed?: FixedType;
  className?: string;
  classPrefix?: string;
  minWidth?: number;
  style?: React.CSSProperties;
  onColumnResizeStart?: (client: Client) => void;
  onColumnResizeEnd?: (columnWidth?: number, cursorDelta?: number) => void;
  onColumnResizeMove?: (columnWidth?: number, columnLeft?: number, columnFixed?: FixedType) => void;
  onMouseEnterHandler?: () => void;
  onMouseLeaveHandler?: () => void;
}

const propTypeKeys = [
  'height',
  'defaultColumnWidth',
  'columnLeft',
  'columnFixed',
  'className',
  'classPrefix',
  'minWidth',
  'style',
  'onColumnResizeStart',
  'onColumnResizeEnd',
  'onColumnResizeMove',
  'onMouseEnterHandler',
  'onMouseLeaveHandler',
];

class ColumnResizeHandler extends React.Component<ColumnResizeHandlerProps> {
  static get contextType(): typeof TableContext {
    return TableContext;
  }

  static defaultProps = {
    classPrefix: defaultClassPrefix('performance-table-column-resize-spanner'),
  };

  columnWidth = 0;
  cursorDelta = 0;
  mouseMoveTracker;
  isKeyDown: boolean;

  handleRef: React.RefObject<any>;
  mounted: boolean = false;

  dragging: boolean;
  deltaX: any = 0;
  touchX: any = 0;


  constructor(props) {
    super(props);
    this.columnWidth = props.defaultColumnWidth || 0;
    this.handleRef = React.createRef();
  }

  componentDidMount() {
    this.mounted = true;
    // Touch handlers must be added with {passive: false} to be cancelable.
    const thisNode = this.findDOMNode();
    if (thisNode) {
      addEvent(thisNode, 'touchstart', this.handleDragStart, { passive: false });
    }
  }

  componentWillUnmount() {
    this.mounted = false;
    if (this.mouseMoveTracker) {
      this.mouseMoveTracker.releaseMouseMoves();
      this.mouseMoveTracker = null;
    }
    const thisNode = this.findDOMNode();
    if (thisNode) {
      const { ownerDocument } = thisNode;
      removeEvent(ownerDocument, 'touchmove', this.handleDrag);
      removeEvent(ownerDocument, 'touchend', this.handleDragStop);
      removeEvent(thisNode, 'touchstart', this.handleDragStart, { passive: false });
    }
  }

  // React Strict Mode compatibility: if `nodeRef` is passed, we will use it instead of trying to find
  // the underlying DOM node ourselves. See the README for more information.
  findDOMNode(): HTMLElement {
    const { handleRef } = this;
    return handleRef && handleRef.current || ReactDOM.findDOMNode(this);
  }

  handleDragStart = (e) => {
    if (e.touches) {
      this.dragging = true;
      this.cursorDelta = 0;
      const eTouch = e.touches[0];
      const clientX = transformZoomData(eTouch.clientX);
      const clientY = transformZoomData(eTouch.clientY);
      const client = {
        clientX,
        clientY,
      };

      this.touchX = clientX;
      const { onColumnResizeStart } = this.props;
      if (onColumnResizeStart) {
        onColumnResizeStart(client);
      }
    }

    const thisNode = this.findDOMNode();
    const { ownerDocument } = thisNode;
    if (e.type === 'touchstart') e.preventDefault();
    if (!this.mounted) return;

    addEvent(ownerDocument, 'touchmove', this.handleDrag);
    addEvent(ownerDocument, 'touchend', this.handleDragStop);
  };

  handleDrag = (event) => {
    if (event.touches) {
      const x = transformZoomData(event.touches[0].clientX);
      this.deltaX = x - this.touchX;
      this.touchX = x;
      this.onMove(this.deltaX);
    }
  };

  handleDragStop = () => {
    if (!this.dragging) return;

    this.dragging = false;
    const { onColumnResizeEnd } = this.props;
    if (onColumnResizeEnd) {
      onColumnResizeEnd(this.columnWidth, this.cursorDelta);
    }
  };

  onMove = (deltaX: number) => {
    if (!this.isKeyDown && !this.dragging) {
      return;
    }

    const { onColumnResizeMove, defaultColumnWidth, columnLeft, columnFixed } = this.props;
    const { rtl } = this.context;
    this.cursorDelta += deltaX;

    this.columnWidth = clamp(
      // @ts-ignore
      defaultColumnWidth + (rtl ? -this.cursorDelta : this.cursorDelta),
      this.props.minWidth ? Math.max(this.props.minWidth, RESIZE_MIN_WIDTH) : RESIZE_MIN_WIDTH,
      20000,
    );
    if (onColumnResizeMove) {
      onColumnResizeMove(this.columnWidth, columnLeft, columnFixed);
    }
  };

  onColumnResizeEnd = () => {
    this.isKeyDown = false;
    const { onColumnResizeEnd } = this.props;
    if (onColumnResizeEnd) {
      onColumnResizeEnd(this.columnWidth, this.cursorDelta);
    }
    const { mouseMoveTracker } = this;
    if (mouseMoveTracker) {
      if (mouseMoveTracker.releaseMouseMoves) {
        mouseMoveTracker.releaseMouseMoves();
      }
      this.mouseMoveTracker = null;
    }
  };

  onColumnResizeMouseDown = (event: React.MouseEvent) => {
    this.mouseMoveTracker = this.getMouseMoveTracker();
    this.mouseMoveTracker.captureMouseMoves(event);
    this.isKeyDown = true;
    this.cursorDelta = 0;

    const client = {
      clientX: transformZoomData(event.clientX),
      clientY: transformZoomData(event.clientY),
      preventDefault: Function(),
    };
    const { onColumnResizeStart } = this.props;
    if (onColumnResizeStart) {
      onColumnResizeStart(client);
    }
  };

  handleShowMouseArea = debounce(() => {
    const { onMouseEnterHandler = noop } = this.props;
    onMouseEnterHandler();
  }, 300);

  handleHideMouseArea = () => {
    const { onMouseLeaveHandler = noop } = this.props;
    this.handleShowMouseArea.cancel();
    onMouseLeaveHandler();
  };

  getMouseMoveTracker() {
    return (
      this.mouseMoveTracker ||
      new DOMMouseMoveTracker(this.onMove, this.onColumnResizeEnd, document.body)
    );
  }

  render() {
    const {
      columnLeft = 0,
      classPrefix,
      height,
      className,
      style,
      columnFixed,
      ...rest
    } = this.props;

    if (columnFixed === 'right') {
      return null;
    }
    const { rtl } = this.context;
    const styles = {
      [rtl ? 'right' : 'left']: this.columnWidth + columnLeft - 2,
      height,
      ...style,
    };

    const classes = classNames(classPrefix, className);
    const unhandled = getUnhandledProps(propTypeKeys, rest);

    return (
      <div
        {...unhandled}
        ref={this.handleRef}
        className={classes}
        style={styles}
        onMouseDown={this.onColumnResizeMouseDown}
        onTouchEnd={this.handleDragStop}
        onMouseEnter={this.handleShowMouseArea}
        onMouseLeave={this.handleHideMouseArea}
        role="button"
        tabIndex={-1}
      />
    );
  }
}

export default ColumnResizeHandler;
