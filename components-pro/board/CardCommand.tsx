import React, { FunctionComponent, useCallback, ReactElement, MouseEventHandler, ReactNode, isValidElement, cloneElement, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite'
import { isArrayLike } from 'mobx';
import isPromise from 'is-promise';
import classNames from 'classnames';
import isString from 'lodash/isString';
import isObject from 'lodash/isObject';
import Button from '../button';
import { FuncType } from '../button/enum';
import Dropdown from '../dropdown';
import Menu from '../menu';
import { $l } from '../locale-context';
import useComputed from '../use-computed';
import DataSet from '../data-set';
import Record from '../data-set/Record';
import { ButtonProps } from '../button/interface';
import { TableButtonProps, Commands } from '../table/Table';
import { TableCommandType } from '../table/interface';

export type cardCommandsProps = { dataSet: DataSet; record: Record; };

type CardCommandProps = {
  record: Record;
  prefixCls: string;
  dataSet: DataSet;
  command?: Commands[] | ((props: cardCommandsProps) => Commands[]);
  renderCommand?: Function | ((props: any) => PromiseLike<any>);
  viewMode?: string;
};

const CardCommand: FunctionComponent<CardCommandProps> = function CardCommand(props) {
  const {
    record,
    prefixCls,
    command,
    renderCommand = ({ command }) => command,
    dataSet,
    viewMode,
  } = props;
  const [item, setItem] = useState<any>(null);

  const cardCommand = useComputed(() => {
    if (typeof command === 'function') {
      const colC = command({ dataSet, record });
      return renderCommand({ command: colC, viewMode, dataSet, record })
    }
    return renderCommand({ command, viewMode, dataSet, record })
  }, [record, command, dataSet, renderCommand]);

  const handleCommandDelete = useCallback((e) => {
    e.stopPropagation();
    dataSet.delete(record);
  }, [dataSet, record]);

  const renderCommands = useCallback(async () => {
    const classString = classNames(`${prefixCls}-command`);
    if (cardCommand) {
      const commands: ReactElement<ButtonProps>[] = [];
      const result = isPromise(cardCommand) ? await cardCommand : cardCommand;
      result.forEach(button => {
        let tableButtonProps: TableButtonProps = {};
        if (isArrayLike(button)) {
          tableButtonProps = button[1] || {};
          button = button[0];
        }
        if (isString(button) && button in TableCommandType) {
          const getButtonProps = (
            type: TableCommandType,
          ): ButtonProps & { onClick: MouseEventHandler<any>; children?: ReactNode } | undefined => {
            switch (type) {
              case TableCommandType.delete:
                return {
                  funcType: FuncType.link,
                  onClick: handleCommandDelete,
                  // disabled,
                  children: $l('Table', 'delete_button'),
                };
              default:
            }
          };
          const defaultButtonProps = getButtonProps(button as TableCommandType);
          if (defaultButtonProps) {
            const { afterClick, ...buttonProps } = tableButtonProps;
            if (afterClick) {
              const { onClick } = defaultButtonProps;
              defaultButtonProps.onClick = async e => {
                e.persist();
                e.stopPropagation();
                try {
                  await onClick(e);
                } finally {
                  afterClick(e);
                }
              };
            }
            const { ...otherProps } = defaultButtonProps;
            commands.push(
              <Button
                {...otherProps}
                {...buttonProps}
                className={classNames(classString, otherProps.className, buttonProps.className)}
              />,
            );
          }
        } else if (isValidElement<ButtonProps>(button)) {
          commands.push(cloneElement(button, {
            ...button.props,
            onClick: (e) => {
              e.stopPropagation();
              button.props.onClick(e);
            },
            funcType: FuncType.link,
            className: classNames(classString, button.props.className),
          }));
        } else if (isObject(button)) {
          commands.push(
            <Button
              {...button}
              funcType={FuncType.link}
              className={classNames(classString, (button as ButtonProps).className)}
            />,
          );
        }
      });
      return commands;
    }
  }, [prefixCls, record, cardCommand, handleCommandDelete]);

  useEffect(() => {
    const renderMenuItem = async () => {
      const result = await renderCommands();
      setItem(result); // 更新状态
    };
    renderMenuItem();
  }, []);

  return (
    item ? (
      <div className={`${prefixCls}-quote-container-extra`}>
        <Dropdown
          popupClassName={`${prefixCls}-quote-container-extra-popup`}
          overlay={() => (
            <Menu>
              {item.map(cmd => (
                <Menu.Item key={cmd.key || `${record.id}_cmd`}>
                  {cmd}
                </Menu.Item>
              ))}
            </Menu>
          )}>
          <Button
            icon="more_vert"
            funcType={FuncType.flat}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      </div>
    ) : null
  );
}

CardCommand.displayName = 'CardCommand';

export default observer(CardCommand);