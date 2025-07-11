import React, { FunctionComponent, memo, useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import isString from 'lodash/isString';
import scrollTo from 'choerodon-ui/lib/_util/scrollTo';
import Button from '../button/Button';
import { FuncType } from '../button/enum';
import Picture, { PictureRef } from './Picture';
import { stopPropagation } from '../_util/EventManager';
import isMobile from '../_util/isMobile';

export interface NavbarProps {
  prefixCls?: string;
  value: number;
  onChange: (value: number) => void;
  list: (string | PictureRef)[];
}

export interface NavItemProps {
  prefixCls?: string;
  index: number;
  onClick: (index: number) => void;
  src?: string;
  active: boolean;
}

const SIZE = 66;
const GUTTER = 10;

const NavItem: FunctionComponent<NavItemProps> = function NavItem(props) {
  const { prefixCls, index, onClick, active, src } = props;
  const handleClick = useCallback(() => {
    onClick(index);
  }, [index, onClick]);
  return (
    <Picture
      className={classNames(`${prefixCls}-item`, { [`${prefixCls}-current`]: active })}
      src={src}
      objectFit="cover"
      objectPosition="top left"
      status="loaded"
      preview={false}
      lazy={false}
      draggable={false}
      width={SIZE}
      height={SIZE}
      onClick={handleClick}
    />
  );
};

NavItem.displayName = 'NavItem';

const MemoNavItem = memo(NavItem);

const Navbar: FunctionComponent<NavbarProps> = function Navbar(props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [MAX, setMAX] = useState(isMobile() ? 3 : 5);

  useEffect(() => {
    const { current } = containerRef;
    if (current) {
      const { clientWidth } = current;
      const max = Math.floor(clientWidth / (SIZE + GUTTER));
      setMAX(max);
      const width = max * (SIZE + GUTTER);
      Object.assign(current.style, { width: `${width}px` });

    }
  }, []);

  const { prefixCls, value, list, onChange } = props;
  const navBarPrefixCls = `${prefixCls}-navbar`;
  const { length } = list;
  const disabled = length <= 1;
  const handlePrev = useCallback(() => {
    if (value === 0) {
      const newIndex = list.length - 1;
      onChange(newIndex);
    } else {
      const newIndex = value - 1;
      onChange(newIndex);
    }
  }, [length, value]);
  const handleNext = useCallback(() => {
    if (value === length - 1) {
      onChange(0);
    } else {
      const newIndex = value + 1;
      onChange(newIndex);
    }
  }, [length, value]);
  useEffect(() => {
    const { current } = containerRef;
    const currentLeft = current?.scrollLeft || 0;
    const currentPosition = (value + 1) * (SIZE + GUTTER);
    if (current) {
      if (isMobile()) {
        scrollTo(value * (SIZE + GUTTER), {
          getContainer: () => current,
          top: false,
        });
      } else if ((currentLeft + MAX * (SIZE + GUTTER) < currentPosition)) {
        scrollTo(value * (SIZE + GUTTER), {
          getContainer: () => current,
          top: false,
        });
      } else if (currentPosition <= currentLeft) {
        scrollTo((value - MAX + 1 >= 0 ? value - MAX + 1 : 0) * (SIZE + GUTTER), {
          getContainer: () => current,
          top: false,
        });
      }
    }
  }, [value, MAX]);
  const renderList = () => {
    return list.map((item, index) => (
      <MemoNavItem
        key={String(index)}
        prefixCls={navBarPrefixCls}
        active={index === value}
        src={isString(item) ? item : item.src}
        onClick={onChange}
        index={index}
      />
    ));
  };
  return (
    <div
      className={navBarPrefixCls}
      onTouchStart={stopPropagation}
    >
      {
        isMobile() && (
          <Button
            icon="navigate_before"
            disabled={disabled}
            funcType={FuncType.link}
            onClick={handlePrev}
            onMouseDown={stopPropagation}
            className={`${prefixCls}-btn ${prefixCls}-btn-nav`}
          />
        )
      }
      <div
        ref={containerRef}
        className={`${navBarPrefixCls}-scroll-container`}
        style={{justifyContent: length > MAX ? 'flex-start' : 'center'}}
        onMouseDown={stopPropagation}
      >
        <div className={`${navBarPrefixCls}-scroll`}>
          {renderList()}
        </div>
      </div>
      {
        isMobile() && (
          <Button
            icon="navigate_next"
            disabled={disabled}
            funcType={FuncType.link}
            onClick={handleNext}
            onMouseDown={stopPropagation}
            className={`${prefixCls}-btn ${prefixCls}-btn-nav`}
          />
        )
      }
    </div>
  );
};

Navbar.displayName = 'Navbar';

export default memo(Navbar);
