import { Lang } from './enum';
import { Locale } from './locale';

const locale: Locale = {
  lang: Lang.zh_CN,
  DataSet: {
    unsaved_data_confirm: '有未保存的数据，是否继续？',
    invalid_query_dataset: '查询条件数据集校验不通过',
    delete_selected_row_confirm: '确认删除选中行？',
    delete_all_row_confirm: '确认删除所有行？',
    query_failure: '查询失败',
    submit_success: '提交成功',
    submit_failure: '提交失败',
    cannot_add_record_when_head_no_current: '头未选中记录，不能新建行记录',
    data_length_too_short: '请至少维护{length}条数据',
    data_length_too_long: '请最多维护{length}条数据',
  },
  Validator: {
    bad_input: '请输入一个数字。',
    pattern_mismatch: '请输入有效的值。',
    range_overflow: '{label}必须小于或等于{max}。',
    range_underflow: '{label}必须大于或等于{min}。',
    range_overflow_excl: '{label}必须小于{maxExcl}。',
    range_underflow_excl: '{label}必须大于{minExcl}。',
    step_mismatch: '请输入有效值。最接近的有效值为{0}。',
    step_mismatch_between: '请输入有效值。两个最接近的有效值分别为{0}和{1}。',
    too_long: '请将该内容减少到{maxLength}个或更少字符（目前您使用了{length}个字符）。',
    too_short: '请将该内容增加到{minLength}个或更多字符（目前您使用了{length}个字符）。',
    type_mismatch: '请输入与类型匹配的有效值。',
    type_mismatch_email: '请输入有效的邮箱地址。',
    type_mismatch_url: '请输入有效的网址。',
    type_mismatch_date: '请输入有效的日期。',
    type_mismatch_color: '请选择有效的颜色。',
    value_missing_no_label: '请填写此字段。',
    value_missing: '请输入{label}。',
    unique: '该字段值重复，请重新填写。',
    unknown: '未知错误。',
  },
  Attachment: {
    file_max_size: '文件大小不能超过：{size}',
    file_type_mismatch: '文件类型不匹配，正确的类型：{types}',
  },
};

export default locale;
