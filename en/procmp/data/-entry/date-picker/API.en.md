---
title: API
---

### DatePicker

| Property | Description | Type | Default | Version |
| ------------ | -------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------ | --- |
| mode | Display mode; options: date \| dateTime \| time \| year \| quarter \| month \| week | string | date  |  |
| min | Minimum date | MomentInput |  |  |
| max | Maximum date | MomentInput |  |  |
| format | Date format, e.g., YYYY-MM-DD HH:mm:ss | string |  |  |
| timeZone | Time zone display | string \| (moment) => string |  | 1.4.2 |
| step | Time step | { hour: number, minute: number, second: number } |  |  |
| filter | Date filter. The selection panel mode changes; set filtering based on the mode. currentDate is each time cell in the date-time panel; filter runs in a loop. selected is the selected or currently hovered time. In range mode (supported since 1.6.3), rangeTarget is 0 for start and 1 for end; rangeValue is the value array. | (currentDate, selected, mode, rangeTarget, rangeValue) => boolean |  |  |
| cellRenderer | Cell renderer; view options: date \| dateTime \| time \| week \| month \| quarter \| year \| decade | (view) => (props, text, currentDate, selected) => ReactNode |  |  |
| renderExtraFooter | Add an extra footer in the panel | ({ choose }: { choose?: (date?: Moment \| \[Moment \| undefined, Moment \| undefined\]) => void }) => React.ReactNode |  |  |
| extraFooterPlacement | Position of the extra footer; options: top bottom | string | bottom |  |
| editorInPopup | Editor inside the dropdown | boolean |  | 1.4.5 |
| defaultTime | Set default time when choosing a date; applies only to dateTime mode; DateTimePicker component | moment \| \[moment, moment] |  | 1.4.5 |
| useInvalidDate | Allow invalid dates; validation still fails | boolean | true | 1.5.4 |
| comboRangeMode | Whether to combine the selection popup in `range` mode (not supported in `time` and `dateTime` modes) | boolean |  | 1.6.5 |
| inputReadOnly | Set input to read-only (avoid opening virtual keyboard on mobile devices) | boolean | false | 1.6.6 |
| yearFirst | Whether the year is displayed first in the popup header | boolean \| undefined | [globalConfig.datePickerYearFirst](/components/configure#API) | 1.6.7 |
| disabledTimeLoopRoll | Disable cyclic scrolling for the time component | boolean |  | 1.6.7 |

For more properties, please refer to [TriggerField](/en/procmp/abstract/trigger-field/#TriggerField).
