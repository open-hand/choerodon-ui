---
title: API
---

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| width | Width | number |  |  |
| height | Height | number |  |  |
| src | Source URL | string |  |  |
| border | Border | boolean |  |  |
| block | Block-level image | boolean | true |  |
| lazy | Lazy load | boolean |  |  |
| modalProps | Image preview modal properties; see [ModalProps](/en/procmp/feedback/modal) | ModalProps |  | 1.6.2 |
| preview | Previewable | boolean | true |  |
| previewUrl | Preview URL; defaults to src | string |  |  |
| downloadUrl | Download URL in preview | string \| Function |  | 1.5.1 |
| previewTarget | Preview method; if set, preview via anchor tag; default is modal preview | string |  |  |
| index | Index; used with [Picture.Provider](#pictureprovider) for group preview | number |  |  |
| status | Status | 'empty' \| 'loaded' \| 'error' \| 'loading' |  |  |
| objectFit | Fill mode, see [ObjectFit](#objectfit) | ObjectFit | 'fill' |  |
| objectPosition | Position of the image within its container | 'top' \| 'right' \| 'bottom' \| 'left' \| 'center' \| string | 'center' |  |
| sources | Display different images based on media queries; IE not supported; see [Source](#source) | Source[] |   |  |
| children | Render in place of image | ReactNode |   |  |
| onBeforeClick | Executed before the click event (before image preview). When the return value is false, the default preview will not be executed. | () => (Promise<boolean \| void> \| boolean \| void) |  | 1.6.8 |

### Picture.Provider

Provider for grouped image preview

| Property | Description | Type | Default | Version |
| --- | --- | --- | --- | --- |
| modalProps | Image preview modal properties; see [ModalProps](/en/procmp/feedback/modal) | ModalProps |  | 1.6.2 |

### Picture.Context

Context for grouped image preview

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| preview(index) | Open preview | Function |  |

### ObjectFit

| Property | Description  | 
| --- | --- | 
| fill | Does not ensure original aspect ratio; content stretches to fill the entire container. | 
| contain | Preserves original aspect ratio; content is scaled. | 
| cover | Preserves original aspect ratio; some content may be clipped. | 
| none | Retains original content width and height; content is not reset. | 
| scale-down | Preserves original aspect ratio; content size is the same as either none or contain, depending on which yields a smaller object size. | 

### Source

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| media | Media query, e.g., `(min-width: 800)` | string |  |
| srcset | Image source displayed when media query matches | string |  |
