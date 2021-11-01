import React, {
    FunctionComponent,
    useEffect,
    useRef,
} from 'react';

import JsBarCode from 'jsbarcode'
import { QRBarCodeProps } from './index'

const BarCode: FunctionComponent<QRBarCodeProps> = function BarCode(props) {
    const { value, renderAs, bgColor, fgColor, option } = props;
    const canvasBarCodeRef = useRef<HTMLCanvasElement>(null)
    const svgBarCodeRef = useRef<SVGSVGElement>(null)
    useEffect(() => {
        renderCode()
    })

    const renderCode = () => {
        try {
            JsBarCode(
                renderAs === 'canvas' ? canvasBarCodeRef.current : svgBarCodeRef.current,
                value,
                {
                    ...option,
                    background: option?.background || bgColor,
                    lineColor: option?.lineColor || fgColor,
                }
            );
        } catch (error) {
            console.warn(error)
        }

    }

    if (renderAs === 'canvas') {
        return <canvas ref={canvasBarCodeRef}></canvas>
    }
    return <svg ref={svgBarCodeRef}></svg>

};

export default BarCode;