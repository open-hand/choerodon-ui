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
      [`${Math.PI / 2}rad`, 90], ['100grad', 90], ['.25turn', 90],
      ['-100grad', 270], ['1.25turn', 90],
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

    it('解析多行命名颜色渐变并支持序列化', () => {
      const gradient = parseGradient(`linear-gradient(
        to right,
        red,
        orange,
        yellow,
        green,
        blue,
        indigo,
        violet
      )`);
      const colors = ['#ff0000', '#ffa500', '#ffff00', '#008000', '#0000ff', '#4b0082', '#ee82ee'];
      expect(gradient.type).toBe('linear');
      expect(gradient.angle).toBe(90);
      expect(gradient.stops.map(stop => stop.color)).toEqual(colors);
      gradient.stops.forEach((stop, index) => expect(stop.position).toBeCloseTo(index * 100 / 6));
      const serialized = serializeGradient(gradient);
      expect(serialized).toBe('linear-gradient(90deg, #ff0000 0%, #ffa500 16.67%, #ffff00 33.33%, #008000 50%, #0000ff 66.67%, #4b0082 83.33%, #ee82ee 100%)');
      expect(parseGradient(serialized).stops.map(stop => stop.position)).toEqual([0, 16.67, 33.33, 50, 66.67, 83.33, 100]);
      expect(gradient.stops[1].position).toBe(100 / 6);
    });

    it.each(['linear', 'radial', 'conic', 'repeating-linear', 'repeating-radial', 'repeating-conic'])('解析 %s 中的命名颜色和透明色', type => {
      const gradient = parseGradient(`${type}-gradient(ReD 0%, transparent 100%)`);
      expect(gradient.stops).toEqual([
        { color: '#ff0000', position: 0 }, { color: '#00000000', position: 100 },
      ]);
      expect(parseGradient(serializeGradient(gradient))).toEqual(gradient);
    });

    it('解析用户的像素重复渐变并保留原始长度', () => {
      expect(parseGradient('repeating-linear-gradient(to top left, lightpink, lightpink 5px, white 5px, white 10px)')).toEqual({
        type: 'linear', angle: 315, repeating: true, stopUnit: 'px',
        stops: [
          { color: '#ffb6c1', position: 0 }, { color: '#ffb6c1', position: 5 },
          { color: '#ffffff', position: 5 }, { color: '#ffffff', position: 10 },
        ],
      });
      expect(parseGradient('linear-gradient(#000 0px, #fff 250px)')).toMatchObject({
        stopUnit: 'px', stops: [{ color: '#000', position: 0 }, { color: '#fff', position: 250 }],
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
      ['repeating-linear-gradient(90deg, #000, #fff)', {
        type: 'linear', angle: 90, repeating: true,
        stops: [{ color: '#000', position: 0 }, { color: '#fff', position: 100 }],
      }],
      ['repeating-radial-gradient(at center, #000, #fff)', {
        type: 'radial', angle: 0, repeating: true,
        stops: [{ color: '#000', position: 0 }, { color: '#fff', position: 100 }],
      }],
      ['repeating-conic-gradient(from 90deg at 25% 75%, #000, #fff)', {
        type: 'conic', angle: 90, position: '25% 75%', repeating: true,
        stops: [{ color: '#000', position: 0 }, { color: '#fff', position: 100 }],
      }],
    ])('解析重复渐变 %s', (value, expected) => {
      expect(parseGradient(value)).toEqual(expected);
    });

    it.each([
      ['conic-gradient(#000, #fff)', {
        type: 'conic', angle: 0,
        stops: [{ color: '#000', position: 0 }, { color: '#fff', position: 100 }],
      }],
      ['conic-gradient(at right top, #000 25%, #fff)', {
        type: 'conic', angle: 0, position: 'right top',
        stops: [{ color: '#000', position: 25 }, { color: '#fff', position: 100 }],
      }],
      ['conic-gradient(from .25turn at 25% 50%, #000 0.5turn, #fff)', {
        type: 'conic', angle: 90, position: '25% 50%',
        stops: [{ color: '#000', position: 50 }, { color: '#fff', position: 100 }],
      }],
      [`conic-gradient(from ${Math.PI / 2}rad, rgba(1, 2, 3, .5) 0deg 90deg, rgb(4, 5, 6) 200grad)`, {
        type: 'conic', angle: 90,
        stops: [
          { color: 'rgba(1, 2, 3, .5)', position: 0 },
          { color: 'rgba(1, 2, 3, .5)', position: 25 },
          { color: 'rgb(4, 5, 6)', position: 50 },
        ],
      }],
      ['conic-gradient(#000 0 25%, #fff 50% 100%)', {
        type: 'conic', angle: 0,
        stops: [
          { color: '#000', position: 0 }, { color: '#000', position: 25 },
          { color: '#fff', position: 50 }, { color: '#fff', position: 100 },
        ],
      }],
    ])('解析 conic 渐变 %s', (value, expected) => {
      expect(parseGradient(value)).toEqual(expected);
    });

    it.each([
      ['90deg', 90], ['100grad', 90], [`${Math.PI / 2}rad`, 90], ['.25turn', 90],
      ['-90deg', 270], ['1.25turn', 90],
    ])('解析 conic 起始角 %s', (direction, angle) => {
      expect(parseGradient(`conic-gradient(from ${direction}, #000, #fff)`)).toEqual({
        type: 'conic', angle, stops: [{ color: '#000', position: 0 }, { color: '#fff', position: 100 }],
      });
    });

    it.each(['90deg', '100grad', `${Math.PI / 2}rad`, '.25turn'])('将 conic 色标 %s 转为百分比', position => {
      expect(parseGradient(`conic-gradient(#000 ${position}, #fff)`).stops).toEqual([
        { color: '#000', position: 25 }, { color: '#fff', position: 100 },
      ]);
    });

    it.each([
      undefined, null, 1, {}, '', '#fff', 'linear-gradient(#fff)',
      'linear-gradient()', 'linear-gradient(#000,)', 'linear-gradient(, #000, #fff)',
      'linear-gradient(to top bottom, #000, #fff)', 'linear-gradient(to left left, #000, #fff)',
      'linear-gradient(NaNdeg, #000, #fff)',
      'linear-gradient(notacolor, #fff)', 'linear-gradient(#000 -1%, #fff)',
      'linear-gradient(#000, #fff 101%)', 'linear-gradient(#000 10px, #fff)',
      'linear-gradient(#000 0px, #fff)', 'linear-gradient(#000 0px, #fff 10foo)',
      'linear-gradient(#000 0deg, #fff 10deg)', 'linear-gradient(#000 -1px, #fff 10px)',
      'linear-gradient(#000 0px, #fff 10%)', 'linear-gradient(#000 0%, #fff 10px)',
      'linear-gradient(#000 1em, #fff 10px)',
      'linear-gradient(#000 10% 20%, #fff)', 'linear-gradient(rgb(1, 2, 3, #fff)',
      'linear-gradient(#000, #fff))', 'linear-gradient(#000, #fff) trailing',
      'radial-gradient(at left, #000, #fff)', 'radial-gradient(circle at 25% 50%, #000, #fff)',
      'radial-gradient(45deg, #000, #fff)',
      'conic-gradient(from nope, #000, #fff)', 'conic-gradient(from 90, #000, #fff)',
      'conic-gradient(from, #000, #fff)', 'conic-gradient(from NaNdeg, #000, #fff)',
      'conic-gradient(from 90deg at, #000, #fff)', 'conic-gradient(at nowhere, #000, #fff)',
      'conic-gradient(at left right, #000, #fff)', 'conic-gradient(at top bottom, #000, #fff)',
      'conic-gradient(at 10% 20% 30%, #000, #fff)', 'conic-gradient(#000 361deg, #fff)',
      'conic-gradient(#000 101%, #fff)', 'conic-gradient(#000 1.1turn, #fff)',
      'conic-gradient(#000 -1deg, #fff)', 'conic-gradient(#000 10px, #fff)',
      'conic-gradient(#000 10% 20% 30%, #fff)', 'conic-gradient(notacolor, #fff)',
      'conic-gradient(from 90deg, #000,)',
    ])('非法渐变 %p 返回 undefined', value => {
      expect(parseGradient(value)).toBeUndefined();
    });
  });

  describe('serializeGradient', () => {
    it.each([
      ['linear-gradient(to top right, #1234 10%, rgba(4, 5, 6, .123456) 90%)', 'linear-gradient(45deg, #11223344 10%, #0405061f 90%)'],
      ['radial-gradient(circle at center, #12345678, #fff)', 'radial-gradient(at center, #12345678 0%, #ffffff 100%)'],
      ['linear-gradient(.25turn, #000, #fff)', 'linear-gradient(90deg, #000000 0%, #ffffff 100%)'],
      ['repeating-linear-gradient(#000, #fff)', 'repeating-linear-gradient(180deg, #000000 0%, #ffffff 100%)'],
      ['repeating-linear-gradient(to top left, lightpink, lightpink 5px, white 5px, white 10px)', 'repeating-linear-gradient(315deg, #ffb6c1 0px, #ffb6c1 5px, #ffffff 5px, #ffffff 10px)'],
      ['linear-gradient(#000 0px, #fff 250px)', 'linear-gradient(180deg, #000000 0px, #ffffff 250px)'],
      ['repeating-radial-gradient(circle, #1234, #fff)', 'repeating-radial-gradient(at center, #11223344 0%, #ffffff 100%)'],
      ['conic-gradient(#000, #fff)', 'conic-gradient(from 0deg, #000000 0%, #ffffff 100%)'],
      ['conic-gradient(at right top, #000, #fff)', 'conic-gradient(from 0deg at right top, #000000 0%, #ffffff 100%)'],
      ['conic-gradient(from -100grad, #000 0deg 90deg, #fff 1turn)', 'conic-gradient(from 270deg, #000000 0%, #000000 25%, #ffffff 100%)'],
      ['repeating-conic-gradient(from .25turn at 25% 75%, rgba(1, 2, 3, .5) 0deg, #fff 200grad)', 'repeating-conic-gradient(from 90deg at 25% 75%, #01020380 0%, #ffffff 50%)'],
    ])('序列化渐变颜色为 HEX %s', (value, expected) => {
      const gradient = parseGradient(value);
      expect(serializeGradient(gradient)).toBe(expected);
      expect(parseGradient(serializeGradient(gradient))).toEqual(parseGradient(expected));
    });

    it('规范化角度', () => {
      const gradient = parseGradient('linear-gradient(#000, #fff)');
      expect(serializeGradient({ ...gradient, angle: -90 })).toBe('linear-gradient(270deg, #000000 0%, #ffffff 100%)');
    });

    it('repeating 为 false 时输出普通渐变', () => {
      const gradient = parseGradient('repeating-conic-gradient(#000, #fff)');
      expect(serializeGradient({ ...gradient, repeating: false }))
        .toBe('conic-gradient(from 0deg, #000000 0%, #ffffff 100%)');
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
      { type: 'linear', angle: 0, position: 'center', stops: [{ color: '#000', position: 0 }, { color: '#fff', position: 100 }] },
      ...['left right', 'at center', '', 50, null].map(position => ({
        type: 'conic', angle: 0, position, stops: [{ color: '#000', position: 0 }, { color: '#fff', position: 100 }],
      })),
      ...['true', 1, 0, null, {}].map(repeating => ({
        type: 'conic', angle: 0, repeating, stops: [{ color: '#000', position: 0 }, { color: '#fff', position: 100 }],
      })),
      ...[-1, 101, NaN, Infinity, '50'].map(position => ({
        type: 'conic', angle: 0, stops: [{ color: '#000', position }, { color: '#fff', position: 100 }],
      })),
      { type: 'conic', angle: 0, stops: [{ color: 'red', position: 0 }, { color: '#fff', position: 100 }] },
      { type: 'linear', angle: 0, stops: [{ color: '#000', position: 80 }, { color: '#fff', position: 20 }] },
      ...['foo', 'deg', 'px%', '', null, 10].map(stopUnit => ({
        type: 'linear', angle: 0, stopUnit, stops: [{ color: '#000', position: 0 }, { color: '#fff', position: 250 }],
      })),
      { type: 'conic', angle: 0, stopUnit: 'px', stops: [{ color: '#000', position: 0 }, { color: '#fff', position: 10 }] },
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
