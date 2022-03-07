import React, { FunctionComponent } from 'react';
import Upload from './Upload';
import { UploadProps } from './interface';

export type DraggerProps = UploadProps & { height?: number };

const Dragger: FunctionComponent<DraggerProps> = function Dragger(props) {
  const { style, height } = props;
  return <Upload {...props} type="drag" style={{ ...style, height }} />;
};

export default Dragger;
