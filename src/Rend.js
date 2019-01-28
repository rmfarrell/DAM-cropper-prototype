import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './css/Rend.module.css';
import { timingSafeEqual } from 'crypto';
import Filler from './filler'

class Rend extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ctx: null,
      height: 0,
      width: 0
    }
    this.canvas = React.createRef()
  }

  // getters
  get shouldSet() {
    return this.props.cropGuide && this.props.cropGuide && this.props.image
  }

  componentDidUpdate() {
    this.shouldSet && this.setImage()
  }

  componentDidMount() {
    this.canvas.current && this.setState({
      ctx: this.canvas.current.getContext('2d')
    })
  }

  setImage = () => {
    if (!this.shouldSet) {
      return;
    }
    const {
      height = 0,
      width = 0,
      image,
      cropGuide,
      zoom = false,
      ratio = '',
      orientation = ''
    } = this.props,
      _zoom = (zoom) ? 'in' : 'out',
      // [ratioW = 1, ratioH = 1] = ratio.split(':'),

      // trimmed = {
      //   top: zoom ? cropGuide[1] : 0,
      //   bottom: zoom ? cropGuide[1] + cropGuide[3] : image.height,
      //   left: zoom ? cropGuide[0] : 0,
      //   right: zoom ? cropGuide[0] + cropGuide[2] : image.width
      // },
      midX = cropGuide[0] + cropGuide[2] / 2,
      midY = cropGuide[1] + cropGuide[3] / 2;

    let h, w, scale, cropHeight, cropWidth, x, y,
      _ratio = ratio.split(':');
    _ratio = _ratio[0] / _ratio[1];

    // if (zoom) { }

    // if (height && width) {
    // figure out which is more important
    // } else if (height) {
    // define height
    // } else if (width) {

    // scale = width / image.width
    // w = width
    // h = image.height * scale

    // console.table({
    //   w,
    //   h,
    //   _ratio,
    //   scale
    // })

    this.canvas.current.width = width
    this.canvas.current.height = width / _ratio;

    // x = -midX + h / 2;
    // y = -midY + h / 2;

    const filler = new Filler({
      outerHeight: this.canvas.current.height,
      outerWidth: this.canvas.current.width
    })

    // [x, y, w, h] = fill({
    //   outHeight: w / _ratio,
    //   outWidth: w,
    //   width: w,
    //   height: h,
    //   x,
    //   y
    // })

    const cropped = filler.fill(image, cropGuide, _zoom)

    this.state.ctx.fillStyle = "#000"
    this.state.ctx.fillRect(0, 0, this.canvas.current.width, this.canvas.current.height);

    this.state.ctx.drawImage(
      image,
      ...cropped
    )




    // }

    // function fill({
    //   outHeight = 0,
    //   outWidth = 0,
    //   height = 0,
    //   width = 0,
    //   minHeight = 0,
    //   minWidth = 0,
    //   x = 0,
    //   y = 0,
    //   zoom = 'in'
    // }) {
    //   const stepSize = 0.1,
    //     halfStepSize = stepSize / 2,
    //     step = 1 + stepSize,
    //     halfStep = 1 + halfStepSize

    //   // solve by zooming
    //   while (
    //     y > 0 ||
    //     y + height < outHeight ||
    //     x > 0 ||
    //     x + width < outWidth
    //   ) {

    //     // lemme help you debug that infinite loop, friend
    //     console.info('undertop', y > 0)
    //     console.info('tooshort', y + height < outHeight)
    //     console.info('need more left', x > 0)
    //     console.info('need more right', x + width < outWidth)

    //     width = width * step
    //     height = height * step
    //     x = x - x * halfStep
    //     y = y - y * halfStep

    //     // todo: prevent cutting into min
    //   }
    //   return [x, y, width, height]

    //   function zoomIn() {
    //     width = width * step
    //     height = height * step
    //     x = x - x * halfStep
    //     y = y - y * halfStep
    //   }
    // }
  }

  render() {
    const canvas = <canvas height="0" width="0" ref={this.canvas}></canvas>

    return (
      <div className={styles.root}>
        {this.shouldSet && this.props.children}
        {canvas}
      </div >
    );
  }
}

Rend.propTypes = {
  image: PropTypes.object,
  height: PropTypes.number,
  width: PropTypes.number,
  cropGuide: PropTypes.object,
  ratio: PropTypes.string,
  zoom: PropTypes.bool,
  orientation: PropTypes.string
}

export default Rend


function ratioFromWidth(w = 0, ratio = '') {
  return {
    height: 0,
    width: 0
  }
}

function ratioFromHeight(h = 0, ratio = '') {

  return {
    height: 0,
    width: 0
  }
}
