import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './App.css';
import styles from './css/Rend.module.css';
import { timingSafeEqual } from 'crypto';

class Rend extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ctx: null
    }
    this.canvas = React.createRef()
  }

  // getters
  get = () => {
    const { props } = this
    return {
      get shouldSet() {
        return props.cropGuide && props.cropGuide.length && props.image
      },
      get midPoint() {
        if (!this.shouldSet) {
          return null
        }
        return [
        ]
      }
    }
  }

  componentDidUpdate() {
    this.get().shouldSet && this.setImage()
  }

  componentDidMount() {
    this.canvas.current && this.setState({
      ctx: this.canvas.current.getContext('2d')
    })
  }

  setImage = () => {
    if (!this.get().shouldSet) {
      return;
    }
    const { height, width, image, cropGuide } = this.props
    const midX = cropGuide[0] + cropGuide[2] / 2
    const midY = cropGuide[1] + cropGuide[3] / 2
    this.canvas.current.height = height
    this.canvas.current.width = width
    console.log({
      width,
      height,
      cropGuide,
      midX,
      midY,
      param: [width - midX, height - midY, width, height]
    })
    this.state.ctx.drawImage(
      image,
      -midX + width / 2,
      -midY + height / 2,
      image.width,
      image.height
    )
  }

  render() {
    const canvas = <canvas height="0" width="0" ref={this.canvas}></canvas>

    return (
      <div className={styles.root}>
        {this.get().shouldSet && this.props.children}
        {canvas}
      </div >
    );
  }
}

Rend.propTypes = {
  image: PropTypes.object,
  height: PropTypes.number,
  width: PropTypes.number,
  cropGuide: PropTypes.arrayOf(PropTypes.number)
}

export default Rend
