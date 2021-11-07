import React, {
    FunctionComponent,
} from 'react';
import QRCode from './qrcode'
import BarCode from './barcode'
import { BaseQRCodeProps } from 'qrcode.react'
import {BaseOptions as JsBarCodeBaseOption} from 'jsbarcode';

export enum CodeType {
    QR = 'qr',
    BAR = 'bar',
}

export interface QRBarCodeProps extends BaseQRCodeProps {
    type?: string;
    prefixCls?: string;
    className?: string;
    renderAs: "canvas" | "svg";
    /**
     * JsBarcode 需要的属性
     */
    option?: JsBarCodeBaseOption;
}

const QRBarCode: FunctionComponent<QRBarCodeProps> = function QRBarCode(props) {
    const {
        type = CodeType.QR,
        ...rest
    } = props;
    if (type === CodeType.QR) {
        return <QRCode {...rest} />
    }
    return <BarCode {...rest} />

};

export default QRBarCode;
