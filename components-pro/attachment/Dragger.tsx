import React, { FunctionComponent, ReactNode } from 'react';
import omit from 'lodash/omit';
import Attachment, { AttachmentProps } from './Attachment';

export type DraggerProps = AttachmentProps & { height?: number, children?: ReactNode[], attachmentChildren?: ReactNode };

const Dragger: FunctionComponent<DraggerProps> = props => {
  const { style, height, children, attachmentChildren } = props;
  const dragBoxRender = children;
  const omitProps = omit(props, ['children']);
  return <Attachment {...omitProps} dragUpload dragBoxRender={dragBoxRender} style={{ ...style, height }}>
    {attachmentChildren}
  </Attachment>;
};

export default Dragger;
