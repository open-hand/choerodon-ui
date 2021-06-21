export default {
  isAppearSupported(props) {
    return props.transitionName && props.transitionAppear || (props.animation && props.animation.appear);
  },
  isEnterSupported(props) {
    return props.transitionName && props.transitionEnter || (props.animation && props.animation.enter);
  },
  isLeaveSupported(props) {
    return props.transitionName && props.transitionLeave || (props.animation && props.animation.leave);
  },
  allowAppearCallback(props) {
    return props.transitionAppear || (props.animation && props.animation.appear);
  },
  allowEnterCallback(props) {
    return props.transitionEnter || (props.animation && props.animation.enter);
  },
  allowLeaveCallback(props) {
    return props.transitionLeave || (props.animation && props.animation.leave);
  },
};
