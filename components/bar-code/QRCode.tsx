import React, { FunctionComponent } from 'react';
import QRCode from 'qrcode.react';

import { QRBarCodeProps } from './index';

const QR: FunctionComponent<QRBarCodeProps> = function QR(props) {
  const { renderAs = 'canvas', value, ...rest } = props;

  return <QRCode renderAs={renderAs as any} value={value} {...rest} />;
};

export default QR;
