---
category: Components
type: Data Display
title: Carousel
---

A carousel component. Scales with its container.

## When To Use

- When there is a group of content on the same level.
- When there is insufficient content space, it can be used to save space in the form of a revolving door.
- Commonly used for a group of pictures/cards.

## API

| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| afterChange | Callback function called after the current index changes | function(current) | - |
| autoplay | Whether to scroll automatically | boolean | `false` |
| beforeChange | Callback function called before the current index changes | function(from, to) | - |
| dots | Whether to show the dots at the bottom of the gallery | boolean | `true` |
| easing | Transition interpolation function name | string | `linear` |
| effect | Transition effect | `scrollx` \| `fade` | `scrollx` |
| vertical | Whether to use a vertical display | boolean | `false` |
| className | Component Custom Class Names | string | |
| dotsClass | Indicator class name | string | |
| prevArrow | Customize the previous arrow | HTMLElement | |
| nextArrow | Customize the next arrow | HTMLElement | |
| theme | Arrow and Indicator Theme | dark \| light| light |
| arrows | Whether to show arrows | boolean | false |
| dotsActionType | Indicator Trigger Mode | [['click', 'hover']] | ['ckick'] |
| slidesToShow | How many sheets are displayed in a screen (can be decimal) | number ｜1 ｜
| verticalSwiping | Vertical Drag | boolean | false |
| pauseOnDotsHover | Mouse over indicator to stop playback | boolean | true |
| pauseOnArrowsHover | Mouse over arrows to stop playback | boolean | true |

## Methods

| Name | Description |
| ---- | ----------- |
| goTo(slideNumber) | Change current slide to given slide number |
| next() | Change current slide to next slide |
| prev() | Change current slide to previous slide |

## Q&A

1. The dragging process appears to be stuck halfway through the screen.

  Solution: Please use div to wrap the content with one more layer for processing. For details, please refer to the vertical demo.

2. Problem causing overflow when switching to the next image

  Solution: Configure slidesToShow to be a decimal point, it can be avoided. For example, in theory, a screen shows 1 picture, but in reality, it shows 1.01 pictures, configure 0.99 to solve the problem.

For more info on the parameters, refer to the <https://github.com/akiran/react-slick>
