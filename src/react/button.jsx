/**
 * MUI React button module
 * @module react/button
 */

'use strict';

import React from 'react';

import * as jqLite from '../js/lib/jqLite';
import * as util from '../js/lib/util';

const PropTypes = React.PropTypes,
      btnClass = 'mui-btn',
      btnAttrs = {color: 1, variant: 1, size: 1},
      animationDuration = 600,
      supportsTouch = 'ontouchstart' in document.documentElement;


/**
 * Button element
 * @class
 */
class Button extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      ripples: {}
    };

    this.rippleTimers = [];

    let cb = util.callback;
    this.onClickCB = cb(this, 'onClick');
    this.onMouseDownCB = cb(this, 'onMouseDown');
    this.onMouseUpCB = cb(this, 'onMouseUp');
  }

  static propTypes = {
    color: PropTypes.oneOf(['default', 'primary', 'danger', 'dark', 'accent']),
    disabled: PropTypes.bool,
    size: PropTypes.oneOf(['default', 'small', 'large']),
    type: PropTypes.oneOf(['submit', 'button']),
    variant: PropTypes.oneOf(['default', 'flat', 'raised', 'fab']),
    onClick: PropTypes.func
  };

  static defaultProps = {
    className: '',
    color: 'default',
    disabled: false,
    size: 'default',
    type: null,
    variant: 'default',
    onClick: null
  };

  componentDidMount() {
    // disable MUI js
    let el = this.refs.buttonEl;
    el._muiDropdown = true;
    el._muiRipple = true;
  }

  componentWillUnmount() {
    // clear ripple timers
    let timers = this.rippleTimers,
        i = timers.length;

    while (i--) clearTimeout(timers[i]);
  }

  onClick(ev) {
    let onClickFn = this.props.onClick;
    onClickFn && onClickFn(ev);
  }

  onMouseDown(ev) {
    // de-dupe touch events
    if (supportsTouch && ev.type === 'mousedown') return;

    // get (x, y) position of click
    let offset = jqLite.offset(this.refs.buttonEl),
        clickEv = (ev.type === 'touchstart') ? ev.touches[0] : ev;

    // choose diameter
    let diameter = offset.height;
    if (this.props.variant === 'fab') diameter = diameter / 2;

    // add ripple to state
    let ripples = this.state.ripples;
    let key = Date.now();

    ripples[key] = {
      xPos: clickEv.pageX - offset.left,
      yPos: clickEv.pageY - offset.top,
      diameter: diameter,
      animateOut: false
    };

    this.setState({ ripples });
  }

  onMouseUp(ev) {
    // animate out ripples
    let ripples = this.state.ripples,
        deleteKeys = Object.keys(ripples),
        k;

    for (k in ripples) ripples[k].animateOut = true;
    this.setState({ ripples });

    // remove ripples after animation
    let timer = setTimeout(() => {
      let ripples = this.state.ripples,
          i = deleteKeys.length;

      while (i--) delete ripples[deleteKeys[i]];
      this.setState({ ripples });
    }, animationDuration);

    this.rippleTimers.push(timer);
  }

  render() {
    let cls = btnClass,
        k,
        v;

    const ripples = this.state.ripples;

    // button attributes
    for (k in btnAttrs) {
      v = this.props[k];
      if (v !== 'default') cls += ' ' + btnClass + '--' + v;
    }

    return (
      <button
        { ...this.props }
        ref="buttonEl"
        className={cls + ' ' + this.props.className}
        onClick={this.onClickCB}
        onMouseDown={this.onMouseDownCB}
        onTouchStart={this.onMouseDownCB}
        onMouseUp={this.onMouseUpCB}
        onMouseLeave={this.onMouseUpCB}
        onTouchEnd={this.onMouseUpCB}
      >
        {this.props.children}
        {
          Object.keys(ripples).map((k, i) => {
            let v = ripples[k];

            return (
              <Ripple
                key={k}
                xPos={v.xPos}
                yPos={v.yPos}
                diameter={v.diameter}
                animateOut={v.animateOut}
              />
            );
          })
        }
      </button>
    );
  }
}


/**
 * Ripple component
 * @class
 */
class Ripple extends React.Component {
  state = {
    animateIn: false
  };

  static propTypes = {
    xPos: PropTypes.number,
    yPos: PropTypes.number,
    diameter: PropTypes.number,
    animateOut: PropTypes.bool
  };

  static defaultProps = {
    xPos: 0,
    yPos: 0,
    diameter: 0,
    animateOut: false
  };

  componentDidMount() {
    util.requestAnimationFrame(() => {
      this.setState({animateIn: true});
    });
  }

  render() {
    const diameter = this.props.diameter,
          radius = diameter / 2;

    const style = {
      height: diameter,
      width: diameter,
      top: this.props.yPos - radius || 0,
      left: this.props.xPos - radius || 0
    };

    // define class
    let cls = 'mui-ripple-effect';
    if (this.state.animateIn) cls += ' mui--animate-in mui--active';
    if (this.props.animateOut) cls += ' mui--animate-out';

    return <div className={cls} style={style} />;
  }
}


/** Define module API */
export default Button;
