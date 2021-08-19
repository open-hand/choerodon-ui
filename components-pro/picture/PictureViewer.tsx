import React, { FunctionComponent, ReactNode, useCallback, useEffect, useState } from 'react';
import { getProPrefixCls } from 'choerodon-ui/lib/configure';
import { Size } from 'choerodon-ui/lib/_util/enum';
import Button from '../button/Button';
import { FuncType } from '../button/enum';
import Picture from './Picture';
import { ModalProps } from '../modal/Modal';

export interface PictureViewerProps {
  prefixCls?: string;
  list: string[];
  defaultIndex?: number;
  modal?: {
    update(props: ModalProps)
  }
}

const PictureViewer: FunctionComponent<PictureViewerProps> = function PictureViewer(props) {
  const { list, defaultIndex = 0, prefixCls, modal } = props;
  const [index, setIndex] = useState<number>(defaultIndex);
  const customizedPrefixCls = getProPrefixCls('picture-viewer', prefixCls);
  const handlePrev = useCallback(() => setIndex(index - 1), [index]);
  const handleNext = useCallback(() => setIndex(index + 1), [index]);
  const { length } = list;
  useEffect(() => {
    if (modal) {
      modal.update({
        header(title: ReactNode, closeBtn: ReactNode) {
          return (
            <div className={`${customizedPrefixCls}-header`}>
              <span>{title}</span>
              {length > 1 ? <span>{index + 1} / {length}</span> : undefined}
              {closeBtn}
            </div>
          );
        },
      });
    }
  }, [index, length, customizedPrefixCls]);
  if (length) {
    const src = list[index];
    return (
      <div className={customizedPrefixCls}>
        {
          length > 1 && (
            <Button
              icon="navigate_before"
              disabled={index === 0}
              funcType={FuncType.link}
              onClick={handlePrev}
              className={`${customizedPrefixCls}-btn`}
              size={Size.large}
            />
          )
        }
        <div className={`${customizedPrefixCls}-picture`}>
          <Picture src={src} objectFit="scale-down" status="loaded" preview={false} lazy={false} />
        </div>
        {
          length > 1 && (
            <Button
              icon="navigate_next"
              disabled={index === length - 1}
              funcType={FuncType.link}
              onClick={handleNext}
              className={`${customizedPrefixCls}-btn`}
              size={Size.large}
            />
          )
        }
      </div>
    );
  }
  return null;
};

PictureViewer.displayName = 'PictureViewer';

export default PictureViewer;
