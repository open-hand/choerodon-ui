import React, { isValidElement, useEffect, useRef } from 'react';
import classNames from 'classnames';

const Marks = ({
  className,
  vertical,
  marks,
  included,
  upperBound,
  lowerBound,
  max, min,
  onClickLabel,
}) => {
  const marksKeys = Object.keys(marks);
  const marksCount = marksKeys.length;
  const unit = marksCount > 1 ? 100 / (marksCount - 1) : 100;
  const markWidth = unit * 0.9;
  const range = max - min;
  const listRef = marksKeys.map(x => useRef());

  useEffect(() => {
    // 解决相邻 mark 重叠问题。
    for (let i = 0; i < listRef.length; i++) {
      const currentParent = listRef[i].current;
      const currentParentChild = currentParent.firstChild;
      if (i > 0) {
        // 从第二个mark 开始判断
        const prevParent = listRef[i - 1].current;
        const prevChild = prevParent.firstChild;
        if (!vertical) {
          const pevlength = prevParent.offsetLeft + prevChild.offsetLeft + prevChild.offsetWidth;
          if (currentParent.offsetLeft + currentParentChild.offsetLeft < pevlength && !prevParent.style.top) {
            currentParent.style.top = '-40px';
          }
        } else {
          const pevHeight = prevParent.offsetTop;
          if (currentParent.offsetTop + currentParent.offsetHeight > pevHeight && !prevParent.style.left) {
            currentParent.style.left = `${-(currentParent.offsetWidth + 15)}px`;
          }
        }
      }
    }
  }, []);

  const elements = marksKeys.map(parseFloat).sort((a, b) => a - b).map((point, index) => {
    const markPoint = marks[point];
    const markPointIsObject = typeof markPoint === 'object' &&
      !isValidElement(markPoint);
    const markLabel = markPointIsObject ? markPoint.label : markPoint;
    if (!markLabel && markLabel !== 0) {
      return null;
    }

    const isActive = (!included && point === upperBound) ||
      (included && point <= upperBound && point >= lowerBound);
    const markClassName = classNames({
      [`${className}-text`]: true,
      [`${className}-text-active`]: isActive,
    });

    const bottomStyle = {
      marginBottom: '-50%',
      bottom: `${(point - min) / range * 100}%`,
    };

    const leftStyle = {
      width: `${markWidth}%`,
      marginLeft: `${-markWidth / 2}%`,
      left: `${(point - min) / range * 100}%`,
    };

    const style = vertical ? bottomStyle : leftStyle;
    const markStyle = markPointIsObject ?
      { ...style, ...markPoint.style } : style;
    return (
      <span
        ref={listRef[index]}
        className={markClassName}
        style={markStyle}
        key={point}
        onMouseDown={(e) => onClickLabel(e, point)}
        onTouchStart={(e) => onClickLabel(e, point)}
      >
        <span >{markLabel}</span>
      </span>
    );
  });

  return <div className={className}>{elements}</div>;
};

export default Marks;
