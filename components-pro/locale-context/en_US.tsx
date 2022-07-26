import enUS from 'choerodon-ui/dataset/locale-context/en_US';
import { Locale } from './locale';

const locale: Locale = {
  ...enUS,
  Tabs: {
    rename: 'Rename',
    default: 'Default',
    restore_default: 'Restore default',
    set_default: 'Set as default',
    set_default_tip: 'The tab set as the default will be displayed by default in the next time.',
    show_count: 'Display number',
    yes: 'Yes',
    no: 'No',
    save: 'Save',
    customization_settings: 'Tab page display settings',
  },
  Table: {
    show_cached_records: 'Show',
    hide_cached_records: 'Hide',
    cached_tips: '{count} recently {type} data',
    cached_type_selected: 'selected',
    cached_type_created: 'created',
    cached_type_updated: 'updated',
    cached_type_destroyed: 'removed',
    selection_tips: '{count} data selected',
    select_current_page: 'Select the current page',
    unselect_current_page: 'Unselect the current page',
    select_all_page: 'Select all pages',
    unselect_all_page: 'Unselect all pages',
    edit_button: 'Edit',
    create_button: 'Create',
    save_button: 'Save',
    cancel_button: 'Cancel',
    delete_button: 'Delete',
    remove_button: 'Remove',
    reset_button: 'Reset',
    query_button: 'Query',
    expand_button: 'Expand',
    collapse_button: 'Collapse',
    export_button: 'Export',
    export_waiting: 'The amount of data is relatively large, wait patiently',
    advanced_search: 'Advanced Search',
    dirty_info: 'Display condition has changed.',
    restore: 'Restore',
    empty_data: 'No data',
    choose_export_columns: 'Please select the column to export',
    column_name: 'Column Name',
    filter_bar_placeholder: 'Table Filter',
    advanced_query: 'Advanced Query',
    advanced_query_conditions: 'Advanced Queries',
    more: 'More',
    default_export: 'Default export file',
    download_button: 'Download',
    export_failed: 'Export failed ',
    export_success: 'Export Successed',
    export_ing: 'Exporting...',
    retry_button: 'retry',
    export_break: 'Data export interrupted, click Retry to export again.',
    export_operating: 'Exporting table data. Click Cancel to terminate the export',
    enter_text_filter: 'Enter text to filter',
    clear_filter: 'Clear filter',
    save_filter: 'Save filter',
    file_name: 'File name',
    collapse: 'Collapse',
    predefined_fields: 'Predefined fields',
    add_filter: 'Add filter',
    enter_search_content: 'Fuzzy query, aggregate high-frequency text fields',
    save_as: 'Save as',
    no_save_filter: 'No save filter',
    modified: 'Modified',
    fast_filter: 'Fast filter',
    default_flag: 'Default',
    rename: 'Rename',
    set_default: 'Set as Default',
    cancel_default: 'Cancel default',
    filter_edit: 'Filter edit',
    save_filter_as: 'Save filter as',
    save_filter_value: 'Save filter value',
    preset: 'Preset',
    user: 'Users',
    whether_delete_filter: 'Whether to delete the filter record',
    filter_name: 'Filter name',
    please_enter: 'Please enter',
    query_option_yes: 'Yes',
    query_option_no: 'No',
    customization_settings: 'Settings of customization',
    display_settings: 'Settings of display',
    view_display: 'View of display',
    tiled_view: 'Tiled view',
    aggregation_view: 'Aggregation view',
    density_display: 'Density of display',
    normal: 'Normal',
    compact: 'Compact',
    parity_row: 'Zebra pattern',
    table_settings: 'Settings of table',
    height_settings: 'Settings of height',
    auto_height: 'Auto height',
    fixed_height: 'Fixed height',
    flex_height: 'Responsive height',
    flex_height_help: 'Table height = window height - responsive height',
    column_settings: 'Settings of column',
    restore_default: 'Restore to default',
    left_lock: 'Lock on the left',
    right_lock: 'Lock on the right',
    unlocked: 'Unlocked',
    unlock: 'Unlock',
    top: 'Top',
    up: 'Up',
    down: 'Down',
    row_expand_settings: 'Row expansion settings',
    expand_cell: 'Expand the cell',
    expand_row: 'Expand the entire row',
    expand_column: 'Expand the entire column',
    collapse_cell: 'Collapse the cell',
    collapse_row: 'Collapse the entire row',
    collapse_column: 'Collapse the entire column',
    current_page: 'Current page',
    current_page_records: 'Current page records',
    cached_records: 'Cached records',
    refresh: 'Refresh',
    export_all: 'Export all data',
    export_selected: 'Export selected data',
    filter_header_title: '筛选器',
    please_enter_search_content: '请输入搜索内容',
    field_settings: '字段配置',
    lock_first_column: '首列锁定',
    filter_copy: '复制',
    advanced_filter: '高级筛选',
    collapse_filter: '收起筛选',
    advanced_filter_setting: '设置高级筛选条件',
  },
  Pagination: {
    page: 'Page',
    jump_to: 'Jump to:',
    jump_to_confirm: 'Confirm',
    records_per_page: 'Number of items per page:',
  },
  Upload: {
    file_selection: 'Select File',
    click_to_upload: 'Click to Upload',
    upload_success: 'Upload successfully',
    upload_failure: 'Fail to upload',
    no_file: 'No File',
    been_uploaded: 'File uploaded',
    upload_path_unset: 'Upload path unset',
    not_acceptable_prompt: 'Upload List contains unacceptable file, accept:',
    file_list_max_length: 'Number of files exceeded the maximum',
  },
  Attachment: {
    ...enUS.Attachment,
    value_missing_no_label: 'Please upload attachments. ',
    value_missing: 'Please upload {label}. ',
    upload_attachment: 'Upload attachment',
    upload_picture: 'Upload picture',
    download_all: 'Download all',
    view_attachment: 'View attachment',
    no_attachments: 'No attachments',
    by_upload_time: 'By upload time',
    by_name: 'By name',
    operation_records: 'Operation records',
    view_operation_records: 'View operation records',
    download: 'Download',
    delete: 'Delete',
    file_list_max_length: 'The maximum number of files is limited to: {count}',
    drag_info: 'Click or drag files here to upload',
    download_template: 'Download template',
  },
  Modal: {
    ok: 'OK',
    cancel: 'Cancel',
    close: 'Close',
    preview_picture: 'Preview picture',
  },
  DatePicker: {
    value_missing_no_label: 'Please choose a date.',
    value_missing: 'Please select {label}.',
    type_mismatch: 'Please enter a valid date.',
    ok: 'OK',
    today: 'Today',
    now: 'Now',
    this_week: 'This week',
    invalid_date: 'Invalid date',
  },
  EmailField: {
    value_missing_no_label: 'Please input an email address.',
    value_missing: 'Please input {label}.',
    type_mismatch: 'Please input a valid email address.',
  },
  IntlField: {
    modal_title: 'Input multi-language information.',
  },
  NumberField: {
    value_missing_no_label: 'Please input a number.',
    value_missing: 'Please input {label}.',
  },
  Radio: {
    value_missing_no_label: 'Please make a choice.',
    value_missing: 'Please select {label}.',
  },
  SelectBox: {
    value_missing_no_label: 'Please make a choice.',
    value_missing: 'Please select {label}.',
  },
  Select: {
    value_missing_no_label: 'Please make a choice.',
    value_missing: 'Please select {label}.',
    no_matching_results: 'No matching results.',
    select_all: 'Select All',
    select_re: 'Re Select',
    unselect_all: 'None',
    common_item: 'Common Items',
  },
  SecretField: {
    edit: '{label} Edit',
    query: '{label} Check',
    verify_type: 'Verification method selection',
    verify_value: 'Verification number',
    verify_code: 'Verification code',
    get_verify_code: 'get verification code',
    cancel: 'Cancel',
    next_step: 'Next step',
    verify_slider_hint: 'Swipe right to the end to complete verification',
    verify_finish: 'Complete verification',
    ok_btn: 'Sure',
    type_mismatch: 'Please input a valid {label}.',
  },
  Lov: {
    choose: 'Choose',
    selection_tips: '{count} data selected',
  },
  Transfer: {
    items: 'items',
  },
  UrlField: {
    value_missing_no_label: 'Please input a url address.',
    value_missing: 'Please input {label}.',
    type_mismatch: 'Please input a valid url address.',
  },
  ColorPicker: {
    value_missing_no_label: 'Please select a color.',
    value_missing: 'Please select {label}.',
    type_mismatch: 'Please select a valid color.',
    used_view: 'Recently used',
    custom_view: 'Custom colors',
    pick_color_view: 'Pick color',
  },
  Icon: {
    icons: ' Icons',
    whatsNew: 'New',
    direction: 'Directional',
    suggestion: 'Suggested',
    edit: 'Editor',
    data: 'Data',
    other: 'Application',
    series: 'Series',
  },
  Cascader: {
    please_select: 'Please select',
    value_missing_no_label: 'Please make a choice.',
    value_missing: 'Please select {label}.',
    select_all: 'Select All',
    unselect_all: 'None',
  },
  Screening: {
    selected: 'Selected',
    pack_up: 'Pack up',
    more: 'More',
    multi_select: 'Multi-select',
    confirm: 'Confirm',
    cancel: 'Cancel',
  },
  Typography: {
    expand: 'Expand',
    copy: 'Copy',
    copied: 'Copied',
  },
};

export default locale;
