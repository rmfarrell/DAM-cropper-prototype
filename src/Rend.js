import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './css/Rend.module.css';
import { timingSafeEqual } from 'crypto';

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
    return this.props.cropGuide && this.props.cropGuide.length && this.props.image
  }

  /**
   * get orientation of the image
   * @reutrn {string} V|H|S (vertical|horizontal|square)
   * 
   */
  get orientation() {
    const { image } = this.props
    if (!image) {
      return null
    }
    if (image.height > image.width) {
      return 'V'
    }
    if (image.height < image.width) {
      return 'H'
    }
    return 'S'
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
      ratio = ''
    } = this.props,

      // trimmed = {
      //   top: zoom ? cropGuide[1] : 0,
      //   bottom: zoom ? cropGuide[1] + cropGuide[3] : image.height,
      //   left: zoom ? cropGuide[0] : 0,
      //   right: zoom ? cropGuide[0] + cropGuide[2] : image.width
      // },
      midX = cropGuide[0] + cropGuide[2] / 2,
      midY = cropGuide[1] + cropGuide[3] / 2

    this.canvas.current.height = height
    this.canvas.current.width = width

    if (zoom) {

    }

    this.state.ctx.drawImage(
      image,
      -midX + width / 2,
      -midY + height / 2,
      width,
      height
    )



    // this.state.ctx.drawImage(
    //   image,
    //   -midX + width / 2,
    //   -midY + height / 2,
    //   image.width,
    //   image.height
    // )
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
  cropGuide: PropTypes.arrayOf(PropTypes.number),
  ratio: PropTypes.string,
  zoom: PropTypes.bool
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
