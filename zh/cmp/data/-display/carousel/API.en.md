---
title: API
---

| Property | Description | Type | Default | Version |
| -------- | ----------- | ---- | ------- | ------------------- |
| afterChange | Callback function called after the current index changes | function(current) | - | |
| autoplay | Whether to scroll automatically | boolean | `false` | |
| beforeChange | Callback function called before the current index changes | function(from, to) | - | |
| dots | Whether to show the dots at the bottom of the gallery | boolean | `true` | |
| easing | Transition interpolation function name | string | `linear` | |
| effect | Transition effect | `scrollx` \| `fade` | `scrollx` | |
| vertical | Whether to use a vertical display | boolean | `false` | |
| className | Component Custom Class Names | string | | 1.6.4 |
| dotsClass | Indicator class name | string | | 1.6.4 |
| prevArrow | Customize the previous arrow | HTMLElement | | 1.6.4 |
| nextArrow | Customize the next arrow | HTMLElement | | 1.6.4 |
| theme | Arrow and Indicator Theme | dark \| light| light | 1.6.4 |
| arrows | Whether to show arrows | boolean | false | 1.6.4 |
| dotsActionType | Indicator Trigger Mode | [['click', 'hover']] | ['ckick'] | 1.6.4 |
| slidesToShow | How many sheets are displayed in a screen (can be decimal) | number ｜1 ｜ 1.6.4 |
| verticalSwiping | Vertical Drag | boolean | false | 1.6.4 |
| pauseOnDotsHover | Mouse over indicator to stop playback | boolean | true | 1.6.4 |
| pauseOnArrowsHover | Mouse over arrows to stop playback | boolean | true | 1.6.4 |

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

For more info on the parameters, refer to the <https://github.com/akiran/react-slick>

<style>
  .c7n-slick-slide {
  text-align: center;
  height: 160px;
  line-height: 160px;
  background: #364d79;
  overflow: hidden;
}

.c7n-slick-slide h3 {
  color: #fff;
}

.pic-carousel .slick-list{
  height: 200px !important;
}

.slick-slide img {
  margin: auto;
}

.my-class .slick-next::before {
  content: "👉";
  font-size: 12px;
  line-height: 1.5;
  padding-left: 5px;
}
.my-class .slick-prev::before {
  content: "👈";
  font-size: 12px;
  line-height: 1.5;
  padding-left: 5px;
}
.my-class {
  text-align: center;
  height: 160px;
  line-height: 160px;
  background: #364d79;
  overflow: hidden;
}
.my-class h3 {
  color: #fff;
}

.c7n-carousel .mydot-class .slick-active li button {
  background: rgb(214, 74, 242) !important;
}
.c7n-carousel .mydot-class li button{
  background: white;
  opacity: 1;
  height: 10px !important;
  width: 10px !important;;
}
</style>