import React, { Component } from 'react';
import Menu from 'choerodon-ui/lib/menu';
import { MentionsContextConsumer, MentionsContextProps } from './MentionsContext';
import { OptionProps } from './Option';

const { Item } = Menu;

interface DropdownMenuProps {
  options: OptionProps[];
}

/**
 * We only use Menu to display the candidate.
 * The focus is controlled by textarea to make accessibility easy.
 */
class DropdownMenu extends Component<DropdownMenuProps, {}> {
  renderDropdown = ({
    notFoundContent,
    activeIndex,
    setActiveIndex,
    selectOption,
    onFocus,
    onBlur,
  }: MentionsContextProps) => {
    const { options } = this.props;
    const activeOption = options[activeIndex] || {};
    const handleClick = ({ key }) => {
      const option = options.find(({ key: optionKey }) => optionKey === key);
      if (option) {
        selectOption(option);
      }
    }
    const selectedKeys = activeOption && activeOption.key ? [activeOption.key] : [];

    return (
      <Menu
        selectedKeys={selectedKeys}
        onClick={handleClick}
        onFocus={onFocus}
        onBlur={onBlur}
        focusable
      >
        {options.map((option, index) => {
          const { key, disabled, children, className, style } = option;
          return (
            <Item
              key={key}
              disabled={disabled}
              className={className}
              style={style}
              onMouseEnter={() => {
                setActiveIndex(index);
              }}
            >
              {children}
            </Item>
          );
        })}

        {!options.length && <Item disabled>{notFoundContent}</Item>}
      </Menu>
    );
  };

  render() {
    return <MentionsContextConsumer>{this.renderDropdown}</MentionsContextConsumer>;
  }
}

export default DropdownMenu;
