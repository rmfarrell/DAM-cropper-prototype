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
      _zoom = (zoom) ? 'out' : 'in';

    let h, w, scale, cropHeight, cropWidth, x, y,
      _ratio = ratio.split(':');
    _ratio = _ratio[0] / _ratio[1];

    this.canvas.current.width = width
    this.canvas.current.height = width / _ratio;

    const filler = new Filler({
      outerHeight: this.canvas.current.height,
      outerWidth: this.canvas.current.width
    })

    const cropped = filler.fill(image, cropGuide, _zoom)

    this.state.ctx.fillStyle = "red"
    this.state.ctx.fillRect(0, 0, this.canvas.current.width, this.canvas.current.height);

    this.state.ctx.drawImage(
      image,
      ...cropped
    )
  }

  render() {
    const canvas = <canvas height="0" width="0" ref={this.canvas}></canvas>

    return (
      <div className={styles.root}>
        {canvas}
        {this.shouldSet && this.props.children}
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
