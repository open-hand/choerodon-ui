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

const SIZE = 60;
const GUTTER = 8;

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
  const MAX = isMobile() ? 3 : 5;

  const { prefixCls, value, list, onChange } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(value);
  const navBarPrefixCls = `${prefixCls}-navbar`;
  const { length } = list;
  const disabled = length <= MAX;
  const handlePrev = useCallback(() => {
    setCurrentIndex((prevCurrentIndex) => Math.max(prevCurrentIndex - MAX, 0));
  }, []);
  const handleNext = useCallback(() => {
    setCurrentIndex((prevCurrentIndex) => Math.min(prevCurrentIndex + MAX, length - 1));
  }, [length]);
  useEffect(() => {
    const { current } = containerRef;
    if (current) {
      scrollTo(currentIndex * (SIZE + GUTTER), {
        getContainer: () => current,
        top: false,
      });
    }
  }, [currentIndex]);
  useEffect(() => {
    if (value < currentIndex || value >= currentIndex + MAX) {
      setCurrentIndex(value);
    }
  }, [value]);
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
    <div className={navBarPrefixCls}>
      <Button
        icon="navigate_before"
        disabled={disabled || currentIndex === 0}
        funcType={FuncType.link}
        onClick={handlePrev}
        onMouseDown={stopPropagation}
        className={`${prefixCls}-btn ${prefixCls}-btn-nav`}
      />
      <div
        ref={containerRef}
        className={`${navBarPrefixCls}-scroll-container`}
        style={disabled ? undefined : { width: SIZE * MAX + GUTTER * (MAX - 1) }}
        onMouseDown={stopPropagation}
      >
        <div className={`${navBarPrefixCls}-scroll`} style={disabled ? undefined : { width: SIZE * length + GUTTER * (length - 1) }}>
          {renderList()}
        </div>
      </div>
      <Button
        icon="navigate_next"
        disabled={disabled || currentIndex > length - MAX}
        funcType={FuncType.link}
        onClick={handleNext}
        onMouseDown={stopPropagation}
        className={`${prefixCls}-btn ${prefixCls}-btn-nav`}
      />
    </div>
  );
};

Navbar.displayName = 'Navbar';

export default memo(Navbar);
