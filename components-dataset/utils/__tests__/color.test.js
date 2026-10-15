import { parseColor, parseGradient, serializeGradient, mixWithWhite, isColorValue } from '../color';

describe('颜色工具', () => {
  describe('parseColor', () => {
    it.each([
      ['#abc', { r: 170, g: 187, b: 204, a: 1 }],
      ['#abcd', { r: 170, g: 187, b: 204, a: 221 / 255 }],
      [' #ABCDEF ', { r: 171, g: 205, b: 239, a: 1 }],
      ['#12345678', { r: 18, g: 52, b: 86, a: 120 / 255 }],
      ['#0000', { r: 0, g: 0, b: 0, a: 0 }],
      ['RGB(255, 0, 128)', { r: 255, g: 0, b: 128, a: 1 }],
      ['rgba(1, 2, 3, 0.123456)', { r: 1, g: 2, b: 3, a: 0.123456 }],
      ['rgba(1, 2, 3, 0)', { r: 1, g: 2, b: 3, a: 0 }],
      ['rgb(100%, 0%, 50%)', { r: 255, g: 0, b: 127.5, a: 1 }],
      ['rgb(1 2 3 / 25%)', { r: 1, g: 2, b: 3, a: 0.25 }],
      ['rgba(1 2 3 / .5)', { r: 1, g: 2, b: 3, a: 0.5 }],
    ])('解析 %s 并保留 alpha', (value, expected) => {
      expect(parseColor(value)).toEqual(expected);
    });

    it.each([
      undefined, null, 123, {}, '', 'red', 'transparent', '#12', '#12345', '#ggg',
      'rgb(256, 0, 0)', 'rgb(-1, 0, 0)', 'rgb(101%, 0%, 0%)',
      'rgba(1, 2, 3, 1.01)', 'rgba(1, 2, 3, -0.1)', 'rgba(1, 2, 3)',
      'rgb(1, 2, 3, .5)', 'rgb(1, 2, 3,)', 'rgb(1 2)', 'rgb(1 2 3 /)',
      'rgb(1 2 3 / .5 / .5)', 'rgb(1, 2 3)', 'rgb(1e2, 0, 0)',
      'rgb(NaN, 0, 0)', 'rgb(1, 2, 3) trailing',
    ])('非法颜色 %p 返回 undefined', value => {
      expect(parseColor(value)).toBeUndefined();
    });
  });

  describe('parseGradient', () => {
    it.each([
      ['to top', 0], ['to right', 90], ['to bottom', 180], ['to left', 270],
      ['to top right', 45], ['to right top', 45], ['to bottom right', 135],
      ['to right bottom', 135], ['to bottom left', 225], ['to left bottom', 225],
      ['to top left', 315], ['to left top', 315], ['-45deg', 315], ['450deg', 90],
      ['.5deg', 0.5], ['360deg', 0], ['TO RIGHT', 90],
    ])('解析方向 %s', (direction, angle) => {
      expect(parseGradient(`linear-gradient(${direction}, #000, #fff)`)).toEqual({
        type: 'linear', angle, stops: [{ color: '#000', position: 0 }, { color: '#fff', position: 100 }],
      });
    });

    it('处理 RGB 内的逗号并补全未指定位置', () => {
      expect(parseGradient('linear-gradient(rgba(1, 2, 3, .12345) 10%, #abcd, rgb(4, 5, 6), #fff 70%)')).toEqual({
        type: 'linear', angle: 180,
        stops: [
          { color: 'rgba(1, 2, 3, .12345)', position: 10 },
          { color: '#abcd', position: 30 },
          { color: 'rgb(4, 5, 6)', position: 50 },
          { color: '#fff', position: 70 },
        ],
      });
    });

    it('均分缺省色标并保留重复位置', () => {
      expect(parseGradient('linear-gradient(#000, #111, #fff)').stops.map(stop => stop.position)).toEqual([0, 50, 100]);
      expect(parseGradient('linear-gradient(#000 20%, #111 20%, #fff)').stops.map(stop => stop.position)).toEqual([20, 20, 100]);
    });

    it('按 CSS 规则修正递减色标', () => {
      expect(parseGradient('linear-gradient(#000 70%, #111, #222 20%, #fff)').stops.map(stop => stop.position)).toEqual([70, 70, 70, 100]);
    });

    it.each(['', 'circle, ', 'ellipse, ', 'at center, ', 'circle at center, ', 'ellipse at center center, ', 'at 50% 50%, '])('解析居中 radial %s', prefix => {
      expect(parseGradient(`radial-gradient(${prefix}#0000, #fff)`)).toEqual({
        type: 'radial', angle: 0, stops: [{ color: '#0000', position: 0 }, { color: '#fff', position: 100 }],
      });
    });

    it.each([
      undefined, null, 1, {}, '', '#fff', 'linear-gradient(#fff)',
      'linear-gradient()', 'linear-gradient(#000,)', 'linear-gradient(, #000, #fff)',
      'linear-gradient(to top bottom, #000, #fff)', 'linear-gradient(to left left, #000, #fff)',
      'linear-gradient(90rad, #000, #fff)', 'linear-gradient(NaNdeg, #000, #fff)',
      'linear-gradient(red, #fff)', 'linear-gradient(#000 -1%, #fff)',
      'linear-gradient(#000, #fff 101%)', 'linear-gradient(#000 10px, #fff)',
      'linear-gradient(#000 10% 20%, #fff)', 'linear-gradient(rgb(1, 2, 3, #fff)',
      'linear-gradient(#000, #fff))', 'linear-gradient(#000, #fff) trailing',
      'radial-gradient(at left, #000, #fff)', 'radial-gradient(circle at 25% 50%, #000, #fff)',
      'radial-gradient(45deg, #000, #fff)', 'repeating-linear-gradient(#000, #fff)',
    ])('非法渐变 %p 返回 undefined', value => {
      expect(parseGradient(value)).toBeUndefined();
    });
  });

  describe('serializeGradient', () => {
    it.each([
      ['linear-gradient(to top right, #1234 10%, rgba(4, 5, 6, .123456) 90%)', 'linear-gradient(45deg, #11223344 10%, #0405061f 90%)'],
      ['radial-gradient(circle at center, #12345678, #fff)', 'radial-gradient(at center, #12345678 0%, #ffffff 100%)'],
    ])('序列化渐变颜色为 HEX %s', (value, expected) => {
      const gradient = parseGradient(value);
      expect(serializeGradient(gradient)).toBe(expected);
      expect(parseGradient(serializeGradient(gradient))).toEqual(parseGradient(expected));
    });

    it('规范化角度', () => {
      const gradient = parseGradient('linear-gradient(#000, #fff)');
      expect(serializeGradient({ ...gradient, angle: -90 })).toBe('linear-gradient(270deg, #000000 0%, #ffffff 100%)');
    });

    it('按 8 位 alpha 量化并补零', () => {
      expect(serializeGradient(parseGradient('linear-gradient(rgba(1, 2, 3, 0.5), rgba(4, 5, 6, 0.999))')))
        .toBe('linear-gradient(180deg, #01020380 0%, #040506ff 100%)');
    });

    it.each([
      undefined, null, {}, { type: 'conic', angle: 0, stops: [] },
      { type: 'linear', angle: NaN, stops: [] },
      { type: 'linear', angle: 0, stops: [{ color: '#fff', position: 0 }] },
      { type: 'linear', angle: 0, stops: [null, null] },
      ...[-1, 101, NaN, Infinity, '50'].map(position => ({
        type: 'linear', angle: 0, stops: [{ color: '#000', position }, { color: '#fff', position: 100 }],
      })),
      { type: 'linear', angle: 0, stops: [{ color: 'red', position: 0 }, { color: '#fff', position: 100 }] },
      { type: 'linear', angle: 0, stops: [{ color: '#000', position: 80 }, { color: '#fff', position: 20 }] },
    ])('非法结构 %p 返回 undefined', value => {
      expect(serializeGradient(value)).toBeUndefined();
    });
  });

  describe('mixWithWhite', () => {
    it('混入白色并将 alpha 量化为 8 位', () => {
      expect(mixWithWhite('#000')).toBe('#808080');
      expect(mixWithWhite('rgba(0, 100, 200, .123456)', 0.2)).toBe('#3383d31f');
      expect(parseColor(mixWithWhite('#1234', 0)).a).toBe(68 / 255);
      expect(mixWithWhite('#0000', 1)).toBe('#ffffff00');
    });

    it.each([-1, 1.1, NaN, Infinity, '0.5', null])('非法比例 %p 返回 undefined', amount => {
      expect(mixWithWhite('#000', amount)).toBeUndefined();
    });

    it('非法颜色返回 undefined', () => {
      expect(mixWithWhite('red')).toBeUndefined();
    });
  });

  describe('isColorValue', () => {
    it.each(['#1234', 'rgba(1, 2, 3, .123456)', 'linear-gradient(#000, #fff)', 'radial-gradient(at center, #000, #fff)'])('接受 %s', value => {
      expect(isColorValue(value)).toBe(true);
    });

    it.each([undefined, {}, 'red', 'linear-gradient(#fff)', 'rgb(256, 0, 0)'])('拒绝 %p', value => {
      expect(isColorValue(value)).toBe(false);
    });
  });
});
