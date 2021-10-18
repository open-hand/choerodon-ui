import React, { createContext, FunctionComponent, ReactNode, useCallback, useMemo, useRef } from 'react';
import { PictureRef } from './Picture';
import modalPreview from '../modal/preview';

export interface PictureContextValue {
  registerPicture(index: number, pictureRef: PictureRef);

  unRegisterPicture(index: number, pictureRef: PictureRef);

  preview(index: number);
}

export interface PictureProviderProps {
  children?: ReactNode;
}

const PictureContext = createContext<PictureContextValue | undefined>(undefined);

export default PictureContext;

export const PictureProvider: FunctionComponent<PictureProviderProps> = (props) => {
  const { children } = props;
  const pictureList = useRef<(PictureRef | undefined)[]>([]);
  const registerPicture = useCallback((index: number, pictureRef: PictureRef) => {
    if (pictureList.current[index] !== pictureRef) {
      pictureList.current[index] = pictureRef;
    }
  }, [pictureList]);
  const unRegisterPicture = useCallback((index: number, pictureRef: PictureRef) => {
    if (pictureList[index] === pictureRef) {
      pictureList.current[index] = undefined;
    }
  }, [pictureList]);
  const preview = useCallback((index: number) => {
    modalPreview({
      defaultIndex: index,
      list: pictureList.current.filter((picture) => picture && picture.src) as PictureRef[],
    });
  }, [pictureList]);
  const value = useMemo(() => ({
    registerPicture,
    unRegisterPicture,
    preview,
  }), [registerPicture, unRegisterPicture, preview]);
  return (
    <PictureContext.Provider value={value}>
      {children}
    </PictureContext.Provider>
  );
};
