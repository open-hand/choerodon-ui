import { Lang } from './enum';
import { Locale } from './locale';

const locale: Locale = {
  lang: Lang.en_US,
  DataSet: {
    unsaved_data_confirm: `There's unsaved data, continue?`,
    invalid_query_dataset: 'Query condition dataSet verification failed.',
    delete_selected_row_confirm: 'Are you sure to delete the selected row?',
    delete_all_row_confirm: 'Are you sure to delete all rows?',
    query_failure: 'Fail to query data.',
    submit_success: 'Submit successfully.',
    submit_failure: 'Fail to submit data.',
    cannot_add_record_when_head_no_current: `Can't create new row record when head record unselected.`,
    data_length_too_short: 'Please maintain at least {length} data.',
    data_length_too_long: 'Please maintain {length} data at most.',
  },
  Validator: {
    bad_input: 'Please input a number.',
    pattern_mismatch: 'Please input a valid value.',
    range_overflow: '{label} must be less than or equal to {max}.',
    range_underflow: '{label} must be greater than or equal to {min}.',
    range_overflow_excl: '{label} must be less than {maxExcl}.',
    range_underflow_excl: '{label} must be greater than {minExcl}.',
    step_mismatch: 'Please input a valid value. The closest valid value is {0}.',
    step_mismatch_between:
      'Please input a valid value. The two closest valid values are {0} and {1}.',
    too_long:
      'Please decrease the length of the value down to {maxLength} or less characters (You have input {length} characters).',
    too_short:
      'Please increase the length of the value down to {minLength} or more characters (You have input {length} characters).',
    type_mismatch: 'Please input a value to match the given type.',
    type_mismatch_email: 'Please input a valid email address.',
    type_mismatch_url: 'Please input a valid url address.',
    type_mismatch_date: 'Please enter a valid date.',
    type_mismatch_color: 'Please select a valid color.',
    value_missing_no_label: 'Please input a value.',
    value_missing: 'Please input {label}.',
    unique: 'The value is duplicate, please input another one.',
    unknown: 'Unknown error.',
  },
  Attachment: {
    file_max_size: 'File size cannot exceed: {size}',
    file_type_mismatch: 'File type mismatch, correct type: {types}',
  },
};

export default locale;
