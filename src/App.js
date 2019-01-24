import React, { Component } from 'react';
import styles from './css/App.module.css';
import Rend from './Rend'

// TODO move to prop
const maxHeight = 600

class App extends Component {
  constructor() {
    super()
    this.state = {
      scale: 1,
      zoom: 0,
      trim: 0,
      ratio: {
        height: 1,
        width: 1
      },
      img: null,
      previewImg: null,
      cropBox: [0, 0, 0, 0],
      ctx: null
    }
    this.originalInput = React.createRef()
  }

  get scale() {
    const { previewImg } = this.state
    if (!previewImg) return null;
    return (previewImg.height >= maxHeight) ? previewImg.height / maxHeight : previewImg.height
  }

  get previewCenter() {
    const [x1, y1, x2, y2] = this.state.cropBox
    return {
      x: Math.floor((x2 + x1) / 2),
      y: Math.floor((y2 + y1) / 2)
    }
  }

  get cropGuide() {
    if (this.state.cropBox.reduce((acc, n) => acc + n) === 0) {
      return null;
    }
    return this.state.cropBox.map((n) => parseInt(n * this.scale, 10))
  }

  preview = ({ target: { files = [] } }) => {
    const [file] = files,
      reader = new FileReader(),
      canvas = this.originalInput.current,
      ctx = canvas.getContext('2d')

    reader.addEventListener('load', (e) => {
      const img = new Image(),
        { result } = e.target;

      img.onload = () => {
        this.setState({
          ctx,
          img,
          previewImg: img
        }, this.resetImage)
      }
      img.src = result;
    }, false)

    file && reader.readAsDataURL(file)
  }

  render() {
    return (
      <div className="App">
        <canvas
          id="original-input"
          draggable
          height="0"
          width="0"
          ref={this.originalInput}
        ></canvas>
        <div className={styles.rendContainer}>

          <Rend
            image={this.state.img}
            height={200}
            width={200}
            zoom={true}
            cropGuide={this.cropGuide} >
            <h4>Thumbnail</h4>
          </Rend>
          <Rend
            image={this.state.img}
            height={400}
            width={600}
            ratio={'3:2'}
            zoom={false}
            cropGuide={this.cropGuide}>
            <h4>3:2</h4>
          </Rend>
        </div>


        <input type="file" onChange={this.preview}></input>
      </div >
    );
  }

  resetImage = () => {
    const canvas = this.originalInput.current
    const { previewImg, ctx } = this.state
    const h = Math.min(previewImg.height, maxHeight)
    const w = previewImg.width / this.scale
    canvas.width = w
    canvas.height = h
    ctx.drawImage(previewImg, 0, 0, w, h);
  }

  componentDidUpdate() {
    this.drawRect()
  }

  componentDidMount() {
    const canvas = this.originalInput.current
    let start = [0, 0],
      end = [0, 0];

    canvas.addEventListener('dragstart', ({ offsetX = 0, offsetY = 0 }) => {
      start = [
        offsetX,
        offsetY
      ]
      this.resetImage()
    })
    canvas.addEventListener('dragend', ({ offsetX = 0, offsetY = 0 }) => {
      end = [
        offsetX,
        offsetY
      ]
      this.setState({
        cropBox: [
          Math.min(start[0], end[0]),
          Math.min(start[1], end[1]),
          Math.abs(start[0] - end[0]),
          Math.abs(start[1] - end[1])
        ]
      })
    })
  }

  drawRect = () => {
    const { ctx, cropBox, previewImg } = this.state,
      centerCoords = [cropBox[0] + cropBox[2] / 2, cropBox[1] + cropBox[3] / 2]
    this.resetImage()
    ctx.globalCompositeOperation = 'source-over'

    // dotted line
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(...cropBox)

    // draw faint black boxes
    ctx.globalCompositeOperation = 'multiply'
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
    ctx.fillRect(0, 0, previewImg.width, cropBox[1])
    ctx.fillRect(0, 0, cropBox[0], maxHeight)
    ctx.fillRect(0, cropBox[1] + cropBox[3], maxHeight, previewImg.width)
    ctx.fillRect(cropBox[0] + cropBox[2], 0, maxHeight, previewImg.width)

    // center circle
    ctx.beginPath();
    ctx.arc(
      ...centerCoords,
      20,
      0,
      2 * Math.PI);


    ctx.fillStyle = 'rgba(255,255,255,0.25)'
    ctx.globalCompositeOperation = 'xor'
    ctx.fill();

    ctx.beginPath();
    ctx.arc(...centerCoords, 20, 0, Math.PI, false);
    ctx.closePath();
    ctx.fill();
  }
}

export default App;
