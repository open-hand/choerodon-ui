import typeMismatch from '../rules/typeMismatch';
import ValidationResult from '../ValidationResult';
import { FieldType } from '../../data-set/enum';
import DataSet from '../../data-set';
import PackageDataSet from 'choerodon-ui/dataset';
import ProDataSet from '../../../components-pro/data-set';
import packageTypeMismatch from 'choerodon-ui/dataset/validator/rules/typeMismatch';
import { isColorValue as packageIsColorValue } from 'choerodon-ui/dataset/utils/color';
import { isColorValue } from '../../utils/color';

const validColors = ['#1234', '#12345678', 'rgb(1, 2, 3)', 'rgba(1, 2, 3, .123456)', 'linear-gradient(to right, #000, #fff)', 'radial-gradient(at center, #0000, #fff)'];
const invalidColors = ['#12', 'rgb(256, 0, 0)', 'rgba(1, 2, 3)', 'linear-gradient(#fff)', 'linear-gradient(#000, #fff 101%)', 'radial-gradient(at left, #000, #fff)'];
const getProp = key => ({ type: FieldType.color, defaultValidationMessages: { typeMismatch: '颜色格式错误' } }[key]);

describe('公共颜色校验', () => {
  it('DataSet 包入口、Pro 入口与颜色校验子路径均使用源码', () => {
    expect(PackageDataSet).toBe(DataSet);
    expect(ProDataSet).toBe(DataSet);
    expect(packageTypeMismatch).toBe(typeMismatch);
    expect(packageIsColorValue).toBe(isColorValue);
  });

  it.each(validColors)('typeMismatch 接受 %s', value => {
    expect(typeMismatch(value, {}, getProp)).toBe(true);
  });

  it.each(invalidColors)('typeMismatch 拒绝 %s', value => {
    const result = typeMismatch(value, {}, getProp);
    expect(result).toBeInstanceOf(ValidationResult);
    expect(result.ruleName).toBe('typeMismatch');
    expect(result.validationMessage).toBe('颜色格式错误');
  });

  it.each(['', undefined, null])('空值 %p 仍交给必填校验处理', value => {
    expect(typeMismatch(value, {}, getProp)).toBe(true);
  });

  it.each(validColors)('DataSet 接受 %s', async value => {
    const dataSet = new DataSet({ forceValidate: true, fields: [{ name: 'color', type: FieldType.color }], data: [{ color: value }] });
    expect(await dataSet.validate()).toBe(true);
  });

  it.each(invalidColors)('DataSet 拒绝 %s', async value => {
    const dataSet = new DataSet({ forceValidate: true, fields: [{ name: 'color', type: FieldType.color }], data: [{ color: value }] });
    expect(await dataSet.validate()).toBe(false);
  });
});
