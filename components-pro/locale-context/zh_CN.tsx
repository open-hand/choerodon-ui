import zhCN from 'choerodon-ui/dataset/locale-context/zh_CN';
import { Locale } from './locale';

const locale: Locale = {
  ...zhCN,
  Tabs: {
    rename: '重新命名',
    default: '默认',
    restore_default: '恢复默认',
    set_default: '设为默认',
    set_default_tip: '设置为默认的标签页会在下次打开该功能时默认显示',
    show_count: '显示数量',
    yes: '是',
    no: '否',
    save: '保存',
    customization_settings: '标签页显示设置',
  },
  Table: {
    show_cached_records: '查看',
    hide_cached_records: '取消查看',
    cached_tips: '最近{type}的 {count} 条数据',
    cached_type_selected: '勾选',
    cached_type_created: '新增',
    cached_type_updated: '修改',
    cached_type_destroyed: '移除',
    selection_tips: '已勾选 {count} 条数据',
    select_current_page: '勾选当页',
    unselect_current_page: '取消勾选当页',
    select_all_page: '跨页全选',
    unselect_all_page: '取消跨页全选',
    edit_button: '编辑',
    create_button: '新增',
    save_button: '保存',
    cancel_button: '取消',
    delete_button: '删除',
    remove_button: '移除',
    reset_button: '重置',
    all_reset_button: '全部重置',
    filter_placeholder: '请输入搜索内容',
    retry_button: '重试',
    download_button: '下载',
    query_button: '查询',
    expand_button: '展开',
    collapse_button: '合并',
    export_button: '导出',
    file_name: '文件名',
    default_export: '默认导出文件名',
    export_failed: '导出失败',
    export_success: '导出成功',
    export_ing: '正在导出...',
    export_break: '数据导出中断，点击重试重新导出',
    export_operating: '正在导出表格数据点击取消终止导出',
    export_waiting: '数据量比较大，耐心等待',
    advanced_search: '高级搜索',
    dirty_info: '显示条件已更改',
    restore: '还原',
    empty_data: '暂无数据',
    choose_export_columns: '请选择要导出的列',
    column_name: '列名',
    filter_bar_placeholder: '过滤表',
    advanced_query: '高级查询',
    advanced_query_conditions: '高级查询条件',
    more: '更多',
    query_more_children: '更多',
    enter_text_filter: '搜索过滤条件',
    clear_filter: '清除筛选项',
    save_filter: '保存筛选',
    collapse: '收起',
    predefined_fields: '预定义字段',
    add_filter: '添加筛选',
    enter_search_content: '模糊查询，聚合高频文本字段',
    save_as: '另存为',
    no_save_filter: '暂无保存筛选',
    modified: '已修改',
    fast_filter: '默认筛选',
    default_flag: '默认',
    rename: '重新命名',
    set_default: '设为默认',
    cancel_default: '取消默认',
    restore_default: '恢复默认',
    filter_edit: '修改配置',
    save_filter_as: '筛选另存为',
    save_filter_value: '保存筛选值',
    preset: '预置',
    user: '用户',
    whether_delete_filter: '是否删除筛选记录',
    filter_name: '筛选名称',
    please_enter: '请输入',
    query_option_yes: '是',
    query_option_no: '否',
    customization_settings: '个性化设置',
    display_settings: '显示设置',
    view_display: '显示视图',
    tiled_view: '表平铺视图',
    aggregation_view: '表聚合视图',
    density_display: '显示密度',
    normal: '正常',
    compact: '紧凑',
    parity_row: '斑马纹',
    table_settings: '表格设置',
    height_settings: '高度设置',
    auto_height: '自动高度',
    fixed_height: '固定高度',
    flex_height: '自适应高度',
    flex_height_help: '表格高度 = 窗口高度 - 自适应高度',
    column_settings: '表头设置',
    left_lock: '左侧冻结',
    right_lock: '右侧冻结',
    drag_lock_tip: '支持拖动控制列冻结',
    unlocked: '未冻结',
    unlock: '取消冻结',
    top: '置顶',
    up: '前置一列',
    down: '后置一列',
    row_expand_settings: '行展开设置',
    expand_cell: '展开单元格',
    expand_row: '展开整行',
    expand_column: '展开整列',
    collapse_cell: '收起单元格',
    collapse_row: '收起整行',
    collapse_column: '收起整列',
    current_page: '当前页',
    current_page_records: '当前页记录',
    cached_records: '缓存的记录',
    refresh: '刷新',
    export_all: '导出列所有数据',
    export_selected: '导出列已选数据',
    filter_header_title: '筛选器',
    field_settings: '字段配置',
    lock_first_column: '首列冻结',
    lock_column: '已锁定',
    cancel_lock_first_column: '首列打开',
    cancel_lock_column: '未锁定',
    enter_search_filter: '请输入搜索内容',
    search: '搜索',
    clear: '清除',
    show: '显示',
    hide: '隐藏',
    add_search: '添加搜索',
    custom_sort: '自定义排序',
    add_sort: '新增排序',
    please_select_column: '请选择列',
    ascending: '正序',
    descending: '倒序',
    current_data_sort: '当前页排序',
    all_data_sort: '所有页排序',
    ad_search_help: '使用括号、AND、OR和NOT，自定义逻辑。例如，如果您输入"(1 AND 2 AND 3) OR 4"，流评估前三个条件是否为真，或仅评估第四个条件是否为真。',
    ad_search_all: '满足全部',
    ad_search_any: '满足任一',
    ad_search_custom: '自定义逻辑',
    ad_search_placeholder: '请输入表达式，例“(1 AND 2) OR 4”',
    ad_search_add: '新增条件',
    ad_search_title: '高级筛选',
    ad_search_validation: '请参考帮助信息正确填写逻辑表达式。',
    table_support: '表格支持',
    ctrl_c_info: '进行复制数据至 Excel，鼠标选中单元格后进行拖动选择复制范围;',
    ctrl_v_info: '进行粘贴从Excel复制的数据，选择可编辑单元格后进行粘贴数据；',
    download_table_template: '下载表格模板',
    download_table_template_tooltip: '根据下载模板创建数据并复制粘贴进表格中',
    copy_config: '复制配置',
    copy_pristine: '复制原始值',
    copy_display: '复制显示值',
    copy_display_success: '复制显示值成功',
    copy_pristine_success: '复制原始值成功',
    paste_template: '粘贴模板',
    no_xlsx: '缺少 xlsx 配置，请先配置 xlsx 后再进行下载',
    arrange_count: '计数',
    arrange_avg: '平均',
    arrange_max: '最大',
    arrange_min: '最小',
    arrange_sum: '总和',
  },
  Pagination: {
    page: '页',
    jump_to: '跳转至:',
    jump_to_confirm: '确定',
    records_per_page: '每页行数:',
    max_pagesize_info: '超出最大分页数 {count}，请重新输入',
  },
  Upload: {
    file_selection: '选择文件',
    click_to_upload: '点击上传',
    upload_success: '上传成功',
    upload_failure: '上传失败',
    no_file: '没有文件',
    been_uploaded: '文件已上传',
    upload_path_unset: '未设置上传路径',
    not_acceptable_prompt: '含有上传类型不匹配的文件，期待：',
    file_list_max_length: '文件数量超过最大限制',
  },
  Attachment: {
    ...zhCN.Attachment,
    value_missing_no_label: '请上传附件。',
    value_missing: '请上传{label}。',
    upload_attachment: '上传附件',
    upload_picture: '上传图片',
    download_all: '全部下载',
    view_attachment: '查看附件',
    no_attachments: '暂无附件',
    by_upload_time: '按上传时间',
    by_name: '按名称',
    by_custom: '自定义排序',
    operation_records: '操作记录',
    view_operation_records: '查看操作记录',
    download: '下载',
    download_template: '下载模板',
    delete: '删除',
    file_list_max_length: '文件数量最大限制为：{count}',
    drag_info: '点击或将文件拖拽到这里上传',
    secret_level_modal_title: '密级选择',
    remove_confirm_title: '是否删除此条记录',
  },
  Modal: {
    ok: '确定',
    cancel: '取消',
    close: '关闭',
    preview_picture: '图片预览',
  },
  DatePicker: {
    value_missing_no_label: '请选择日期。',
    value_missing: '请选择{label}。',
    type_mismatch: '请输入有效的日期。',
    ok: '确定',
    today: '今天',
    now: '此刻',
    this_week: '本周',
    invalid_date: '无效日期',
    year: '年',
  },
  EmailField: {
    value_missing_no_label: '请输入邮箱地址。',
    value_missing: '请输入{label}。',
    type_mismatch: '请输入有效的邮箱地址。',
  },
  IntlField: {
    modal_title: '输入多语言信息',
    output_modal_title: '多语言信息',
  },
  NumberField: {
    value_missing_no_label: '请输入数字。',
    value_missing: '请输入{label}。',
  },
  Radio: {
    value_missing_no_label: '请选择。',
    value_missing: '请选择{label}。',
  },
  SelectBox: {
    value_missing_no_label: '请选择。',
    value_missing: '请选择{label}。',
  },
  Select: {
    value_missing_no_label: '请选择。',
    value_missing: '请选择{label}。',
    no_matching_results: '无匹配结果。',
    select_all: '全选',
    select_re: '反选',
    unselect_all: '无',
    common_item: '常用项',
  },
  SecretField: {
    edit: '{label}编辑',
    query: '{label}查看',
    verify_type: '验证方式选择',
    verify_value: '验证号码',
    verify_code: '验证码',
    get_verify_code: '获取验证码',
    cancel: '取消',
    next_step: '下一步',
    verify_slider_hint: '向右滑动到底完成验证',
    verify_finish: '完成验证',
    ok_btn: '确定',
    type_mismatch: '请输入有效的{label}。',
  },
  Lov: {
    choose: '请选择',
    selection_tips: '已勾选 {count} 条数据',
    non_conformity_warning: '此值集不符合可展示值集值详细的值集规范要求，请联系系统管理员去处理！',
  },
  Transfer: {
    items: '项',
    search_placeholder_right: '请输入搜索内容',
    search_placeholder_left: '请输入搜索内容',
  },
  UrlField: {
    value_missing_no_label: '请输入网址。',
    value_missing: '请输入{label}。',
    type_mismatch: '请输入有效的网址。',
  },
  ColorPicker: {
    value_missing_no_label: '请选择颜色',
    value_missing: '请选择{label}。',
    type_mismatch: '请选择有效的颜色。',
    used_view: '最近使用',
    custom_view: '自定义颜色',
    pick_color_view:  '拾色器',
  },
  Icon: {
    icons: '图标',
    whatsNew: '新增',
    direction: '方向性',
    suggestion: '提示建议性',
    edit: '编辑类',
    data: '数据类',
    other: '网站通用',
    series: '套系类',
  },
  Cascader: {
    please_select: '请选择',
    value_missing_no_label: '请选择。',
    value_missing: '请选择{label}。',
    select_all: '全选',
    unselect_all: '无',
  },
  Screening: {
    selected: '已选',
    pack_up: '收起',
    more: '更多',
    multi_select: '多选',
    confirm: '确认',
    cancel: '取消',
  },
  Typography: {
    expand: '展开',
    copy: '复制',
    copied: '已复制',
  },
  Operator: {
    equal: '等于',
    not_equal: '不等于',
    greater_than: '大于',
    greater_than_or_equal_to: '大于等于',
    less_than: '小于',
    less_than_or_equal_to: '小于等于',
    in: '包含于',
    not_in: '不包含于',
    is_null: '为空',
    is_not_null: '不为空',
    fully_fuzzy: '全模糊',
    after_fuzzy: '开始为',
    before_fuzzy: '结束为',
    range: '介于',
  },
};

export default locale;
