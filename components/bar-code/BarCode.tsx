import React, { FunctionComponent, useCallback, useEffect, useRef } from 'react';
import defaultTo from 'lodash/defaultTo';
import JsBarCode from 'jsbarcode';
import { QRBarCodeProps } from './index';

const BarCode: FunctionComponent<QRBarCodeProps> = function BarCode(props) {
  const { value, renderAs = 'canvas', bgColor, fgColor, option } = props;
  const canvasBarCodeRef = useRef<HTMLCanvasElement>(null);
  const svgBarCodeRef = useRef<SVGSVGElement>(null);
  const renderCode = useCallback(() => {
    try {
      const canvasRef = canvasBarCodeRef.current;
      const svgRef = svgBarCodeRef.current;
      if (canvasRef || svgRef)
        JsBarCode(renderAs === 'canvas' ? canvasRef : svgRef, value, {
          ...option,
          background: defaultTo(option && option.background, bgColor),
          lineColor: defaultTo(option && option.lineColor, fgColor),
        });
    } catch (error) {
      console.warn(error);
    }
  }, [canvasBarCodeRef, svgBarCodeRef, value, option,  bgColor, fgColor]);

  useEffect(() => {
    renderCode();
  }, [renderCode()]);

  if (renderAs === 'canvas') {
    return <canvas ref={canvasBarCodeRef} />;
  }
  return <svg ref={svgBarCodeRef} />;
};

export default BarCode;
