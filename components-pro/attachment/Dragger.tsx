import React, { FunctionComponent, ReactNode } from 'react';
import omit from 'lodash/omit';
import Attachment, { AttachmentProps } from './Attachment';

export type DraggerProps = AttachmentProps & { height?: number, children?: ReactNode[] };

const Dragger: FunctionComponent<DraggerProps> = props => {
  const { style, height, children } = props;
  const dragBoxRender = children;
  const omitProps = omit(props, ['children']);
  return <Attachment {...omitProps} dragUpload dragBoxRender={dragBoxRender} style={{ ...style, height }} />;
};

export default Dragger;
