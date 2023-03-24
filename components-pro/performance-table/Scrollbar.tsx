import * as React from 'react';
import classNames from 'classnames';
import { addStyle, DOMMouseMoveTracker, getOffset } from 'dom-lib';
import isNumber from 'lodash/isNumber';
import Icon from 'choerodon-ui/lib/icon';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import { SCROLLBAR_MIN_WIDTH } from './constants';
import { defaultClassPrefix, getUnhandledProps, prefix } from './utils';
import TableContext from './TableContext';
import { TableScrollLength } from './Table';
import { transformZoomData } from '../_util/DocumentUtils';

export interface ScrollbarProps {
  vertical?: boolean;
  length: number;
  scrollLength: number;
  scrollBarOffset: number;
  className?: string;
  classPrefix?: string;
  tableId?: string;
  onScroll?: (delta: number, event: React.MouseEvent) => void;
  onMouseDown?: (event: React.MouseEvent) => void;
  clickScrollLength: TableScrollLength,
  showScrollArrow?: boolean;

  [key: string]: any;
}

type Offset = {
  top: number;
  left: number;
  height?: number;
  width?: number;
};

type State = {
  barOffset: Offset;
  handlePressed: boolean;
};

const propTypeKeys = [
  'tableId',
  'vertical',
  'length',
  'scrollLength',
  'scrollBarOffset',
  'clickScrollLength',
  'showScrollArrow',
  'className',
  'classPrefix',
  'onScroll',
  'onMouseDown',
];

class Scrollbar extends React.PureComponent<ScrollbarProps, State> {
  static get contextType(): typeof TableContext {
    return TableContext;
  }

  static defaultProps = {
    classPrefix: defaultClassPrefix('performance-table-scrollbar'),
    scrollLength: 1,
    length: 1,
  };

  scrollOffset = 0;
  mouseMoveTracker = null;
  handleRef: React.RefObject<HTMLDivElement>;
  barRef: React.RefObject<HTMLDivElement>;

  constructor(props: ScrollbarProps) {
    super(props);
    this.state = {
      barOffset: {
        top: 0,
        left: 0,
      },
      handlePressed: false,
    };
    this.handleRef = React.createRef();
    this.barRef = React.createRef();
  }

  componentDidMount() {
    this.initBarOffset();
  }

  componentDidUpdate(prevProps) {
    if (this.props.vertical && this.props.scrollLength !== prevProps.scrollLength) {
      this.initBarOffset();
    } else if (!this.props.vertical && this.props.scrollLength !== prevProps.scrollLength) {
      this.initBarOffset();
    }
  }

  componentWillUnmount() {
    this.releaseMouseMoves();
  }

  onWheelScroll(delta: number) {
    const { length, scrollLength } = this.props;
    const nextDelta = delta / (scrollLength / length);

    this.updateScrollBarPosition(nextDelta);
  }

  getMouseMoveTracker() {
    return (
      this.mouseMoveTracker ||
      new DOMMouseMoveTracker(this.handleDragMove, this.handleDragEnd, document.body)
    );
  }

  initBarOffset() {
    setTimeout(() => {
      this.barRef.current &&
      this.setState({
        barOffset: getOffset(this.barRef.current),
      });
    }, 1);
  }

  handleMouseDown = (event: React.MouseEvent) => {
    const mouseMoveTracker = this.getMouseMoveTracker();
    this.mouseMoveTracker = mouseMoveTracker;
    if (mouseMoveTracker) {
      // @ts-ignore
      mouseMoveTracker.captureMouseMoves(event);
    }
    this.setState({ handlePressed: true });
    const { onMouseDown } = this.props;
    if (onMouseDown) {
      onMouseDown(event);
    }
  };

  handleDragEnd = () => {
    this.releaseMouseMoves();
    this.setState({ handlePressed: false });
  };

  handleScroll(delta: number, event: React.MouseEvent) {
    const { length, scrollLength, onScroll } = this.props;
    const scrollDelta = delta * (scrollLength / length);

    this.updateScrollBarPosition(delta);
    if (onScroll) {
      onScroll(scrollDelta, event);
    }
  }

  resetScrollBarPosition(forceDelta = 0) {
    this.scrollOffset = 0;
    this.updateScrollBarPosition(0, forceDelta);
  }

  updateScrollBarPosition(delta: number, forceDelta?: number) {
    const { vertical, length, scrollLength } = this.props;
    const { translateDOMPositionXY } = this.context;
    const max =
      scrollLength && length
        ? length - Math.max((length / scrollLength) * length, SCROLLBAR_MIN_WIDTH + 2)
        : 0;
    const styles = {};

    if (typeof forceDelta === 'undefined') {
      this.scrollOffset = Math.min(Math.max(this.scrollOffset + delta, 0), max);
    } else {
      this.scrollOffset = forceDelta || 0;
    }
    if (translateDOMPositionXY) {
      if (vertical) {
        translateDOMPositionXY(styles, 0, this.scrollOffset);
      } else {
        translateDOMPositionXY(styles, this.scrollOffset, 0);
      }
    }

    addStyle(this.handleRef.current, styles);
  }

  releaseMouseMoves() {
    const { mouseMoveTracker } = this;
    if (mouseMoveTracker) {
      // @ts-ignore
      mouseMoveTracker.releaseMouseMoves && mouseMoveTracker.releaseMouseMoves();
      this.mouseMoveTracker = null;
    }
  }

  handleDragMove = (deltaX: number, deltaY: number, event: React.MouseEvent) => {

    // @ts-ignore
    if (!this.mouseMoveTracker || !this.mouseMoveTracker.isDragging()) {
      return;
    }

    if (event && event.buttons === 0 || window.event && window.event['buttons'] === 0) {
      this.releaseMouseMoves();
      return;
    }

    const { vertical } = this.props;
    this.handleScroll(vertical ? deltaY : deltaX, event);
  };

  /**
   * 点击滚动条，然后滚动到指定位置
   */
  handleClick = (event: React.MouseEvent) => {
    if (this.handleRef.current && this.handleRef.current.contains(event.target as Node)) {
      return;
    }

    const { vertical, length, scrollLength } = this.props;
    const { barOffset } = this.state;
    const offset = vertical ? transformZoomData(event.pageY) - barOffset.top : transformZoomData(event.pageX) - barOffset.left;

    const handleWidth = (length / scrollLength) * length;
    const delta = offset - handleWidth;

    const nextDelta =
      offset > this.scrollOffset ? delta - this.scrollOffset : offset - this.scrollOffset;
    this.handleScroll(nextDelta, event);
  };


  /**
   *
   * @param e
   * @param sort
   */
  handleArrowClick = (e, sort) => {
    e.stopPropagation();
    const { vertical, clickScrollLength, scrollLength, length } = this.props;
    if (vertical) {
      if (isNumber(clickScrollLength.vertical)) {
        const handleLength = (length / scrollLength) * clickScrollLength.vertical;
        this.handleScroll(sort === 'fir' ? -handleLength : handleLength, e);
      }
    } else if (isNumber(clickScrollLength.horizontal)) {
      const handleLength = (length / scrollLength) * clickScrollLength.horizontal;
      this.handleScroll(sort === 'fir' ? -handleLength : handleLength, e);
    }
  };

  render() {
    const { vertical, length, scrollLength, classPrefix, className, tableId, style, showScrollArrow, scrollBarOffset, ...rest } = this.props;
    const { handlePressed } = this.state;
    // @ts-ignore
    const addPrefix = prefix(classPrefix);

    const classes = classNames(classPrefix, className, {
      [addPrefix('vertical')]: vertical,
      [addPrefix('horizontal')]: !vertical,
      [addPrefix('hide')]: scrollLength <= length,
      [addPrefix('pressed')]: handlePressed,
      [addPrefix('arrow')]: showScrollArrow,
    });
    const width = (length / scrollLength) * 100;
    const styles: React.CSSProperties = {
      [vertical ? 'height' : 'width']: `${width}%`,
      [vertical ? 'minHeight' : 'minWidth']: SCROLLBAR_MIN_WIDTH,
    };
    const IEstyles: React.CSSProperties = {
      [vertical ? 'top' : 'left']: showScrollArrow ? '0.2rem' : 0,
      [vertical ? 'bottom' : 'right']: showScrollArrow ? '0.2rem' : 0,
      [vertical ? 'height' : 'width']: style ? style[vertical ? 'height' : 'width'] - scrollBarOffset : `calc(100% - ${pxToRem(scrollBarOffset)})`,
      [vertical ? 'width' : 'height']: showScrollArrow ? '0.2rem' : '0.1rem',
    };
    const unhandled = getUnhandledProps(propTypeKeys, rest);
    const scrollbarStyle = { ...style, ...IEstyles };
    const valuenow = (this.scrollOffset / length) * 100 + width;

    return (
      <div
        role="scrollbar"
        aria-controls={tableId}
        aria-valuemax="100"
        aria-valuemin="0"
        aria-valuenow={valuenow}
        aria-orientation={vertical ? 'vertical' : 'horizontal'}
        {...unhandled}
        style={scrollbarStyle}
        ref={this.barRef}
        className={classes}
        onClick={this.handleClick}
      >
        {showScrollArrow && (
          <div
            className={addPrefix(`handle-${vertical ? 'vertical' : 'horizontal'}-fir`)}
            onClick={(e) => this.handleArrowClick(e, 'fir')}
          >
            <Icon type="baseline-arrow_drop_up" />
          </div>
        )}
        <div
          ref={this.handleRef}
          className={addPrefix(`handle ${showScrollArrow ? 'has-arrow' : ''}`)}
          style={styles}
          onMouseDown={this.handleMouseDown}
          onTouchMove={(e) => e.stopPropagation()}
          role="button"
          tabIndex={-1}
        />
        {showScrollArrow && (
          <div className={addPrefix(`handle-${vertical ? 'vertical' : 'horizontal'}-sec`)} onClick={(e) => this.handleArrowClick(e, 'sec')}>
            <Icon type="baseline-arrow_drop_up" />
          </div>
        )}
      </div>
    );
  }
}

export default Scrollbar;
