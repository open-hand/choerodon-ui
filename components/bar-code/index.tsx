import React, { FunctionComponent } from 'react';
import { BaseQRCodeProps } from 'qrcode.react';
import { BaseOptions as JsBarCodeBaseOption } from 'jsbarcode';
import QRCode from './QRCode';
import BarCode from './BarCode';
import { CodeType } from './enum';

export {
  CodeType,
};

export interface QRBarCodeProps extends BaseQRCodeProps {
  type?: string;
  prefixCls?: string;
  className?: string;
  value: string;
  bgColor?: string;
  fgColor?: string;
  renderAs?: 'canvas' | 'svg';
  /**
   * JsBarcode 需要的属性
   */
  option?: JsBarCodeBaseOption;
}

const QRBarCode: FunctionComponent<QRBarCodeProps> = function QRBarCode(props) {
  const { type = CodeType.QR, ...rest } = props;
  if (type === CodeType.QR) {
    return <QRCode {...rest} />;
  }
  return <BarCode {...rest} />;
};

export default QRBarCode;
