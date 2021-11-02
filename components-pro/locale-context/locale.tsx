/* eslint-disable camelcase */
import { Lang } from './enum';
import zh_CN from './zh_CN';

export interface Locale {
  lang: Lang;
  Tabs: {
    rename: string;
    default: string;
    restore_default: string;
    set_default: string;
    set_default_tip: string;
    show_count: string;
    yes: string;
    no: string;
    save: string;
    customization_settings: string;
  };
  Table: {
    show_cached_seletion: string;
    hide_cached_seletion: string;
    show_cached_modified: string;
    hide_cached_modified: string;
    selection_tips: string;
    select_current_page: string;
    unselect_current_page: string;
    select_all_page: string;
    unselect_all_page: string;
    edit_button: string;
    create_button: string;
    save_button: string;
    cancel_button: string;
    delete_button: string;
    remove_button: string;
    reset_button: string;
    query_button: string;
    expand_button: string;
    collapse_button: string;
    export_button: string;
    defalut_export: string;
    advanced_search: string;
    dirty_info: string;
    restore: string;
    empty_data: string;
    choose_export_columns: string;
    column_name: string;
    filter_bar_placeholder: string;
    advanced_query: string;
    advanced_query_conditions: string;
    export_failed: string;
    download_button: string;
    export_success: string;
    export_ing: string;
    retry_button: string;
    file_name: string;
    export_break: string;
    export_operating: string;
    export_waiting: string;
    more: string;
    enter_text_filter: string;
    clear_filter: string;
    save_filter: string;
    collapse: string;
    predefined_fields: string;
    add_filter: string;
    enter_search_content: string;
    no_save_filter: string;
    save_as: string;
    modified: string;
    fast_filter: string;
    default_flag: string;
    rename: string;
    set_default: string;
    cancel_default: string;
    filter_rename: string;
    save_filter_as: string;
    whether_delete_filter: string;
    filter_name: string;
    please_enter: string;
    query_option_yes: string;
    query_option_no: string;
    customization_settings: string;
    display_settings: string;
    view_display: string;
    tiled_view: string;
    aggregation_view: string;
    density_display: string;
    normal: string;
    compact: string;
    parity_row: string;
    table_settings: string;
    height_settings: string;
    auto_height: string;
    fixed_height: string;
    flex_height: string;
    flex_height_help: string;
    column_settings: string;
    restore_default: string;
    left_lock: string;
    right_lock: string;
    unlocked: string;
    unlock: string;
    top: string;
    up: string;
    down: string;
    row_expand_settings: string;
    expand_cell: string;
    expand_row: string;
    expand_column: string;
    collapse_cell: string;
    collapse_row: string;
    collapse_column: string;
    current_page_records: string;
    cached_records: string;
  };
  Pagination: {
    page: string;
    jump_to: string;
    jump_to_confirm: string;
    records_per_page: string;
  };
  Upload: {
    file_selection: string;
    click_to_upload: string;
    upload_success: string;
    upload_failure: string;
    no_file: string;
    upload_path_unset: string;
    been_uploaded: string;
    not_acceptable_prompt: string;
    file_list_max_length: string;
  };
  Attachment: {
    value_missing_no_label: string;
    value_missing: string;
    upload_attachment: string;
    upload_picture: string;
    download_all: string;
    view_attachment: string;
    no_attachments: string;
    by_upload_time: string;
    by_name: string;
    operation_records: string;
    view_operation_records: string;
    download: string;
    delete: string;
    file_max_size: string;
    file_list_max_length: string;
    file_type_mismatch: string;
  };
  Modal: {
    ok: string;
    cancel: string;
    close: string;
    preview_picture: string;
  };
  DataSet: {
    unsaved_data_confirm: string;
    invalid_query_dataset: string;
    delete_selected_row_confirm: string;
    delete_all_row_confirm: string;
    query_failure: string;
    submit_success: string;
    submit_failure: string;
    cannot_add_record_when_head_no_current: string;
  };
  DatePicker: {
    value_missing: string;
    value_missing_no_label: string;
    type_mismatch: string;
    ok: string;
    today: string;
    now: string;
    this_week: string;
    invalid_date: string;
  };
  EmailField: {
    value_missing: string;
    value_missing_no_label: string;
    type_mismatch: string;
  };
  IntlField: {
    modal_title: string;
  };
  NumberField: {
    value_missing: string;
    value_missing_no_label: string;
  };
  Radio: {
    value_missing: string;
    value_missing_no_label: string;
  };
  SelectBox: {
    value_missing: string;
    value_missing_no_label: string;
  };
  Select: {
    value_missing: string;
    value_missing_no_label: string;
    no_matching_results: string;
    select_all: string;
    select_re: string;
    unselect_all: string;
    common_item: string;
  };
  SecretField: {
    edit: string;
    query: string;
    verify_type: string;
    verify_value: string;
    verify_code: string;
    get_verify_code: string;
    cancel: string;
    next_step: string;
    verify_slider_hint: string;
    verify_finish: string;
    ok_btn: string;
  };
  Lov: {
    choose: string;
  };
  Transfer: {
    items: string;
  };
  UrlField: {
    value_missing: string;
    value_missing_no_label: string;
    type_mismatch: string;
  };
  ColorPicker: {
    value_missing: string;
    value_missing_no_label: string;
    type_mismatch: string;
  };
  Validator: {
    bad_input: string;
    pattern_mismatch: string;
    range_overflow: string;
    range_underflow: string;
    step_mismatch: string;
    step_mismatch_between: string;
    too_long: string;
    too_short: string;
    type_mismatch: string;
    value_missing: string;
    value_missing_no_label: string;
    unique: string;
    unknown: string;
  };
  Icon: {
    icons: string;
    whatsNew: string;
    direction: string;
    suggestion: string;
    edit: string;
    data: string;
    other: string;
    series: string;
  };
  Cascader: {
    please_select: string;
    value_missing_no_label: string;
    value_missing: string;
    select_all: string;
    unselect_all: string;
  };
  Screening: {
    selected: string;
    pack_up: string;
    more: string;
    multi_select: string;
    confirm: string;
    cancel: string;
  };
}

export default zh_CN;
