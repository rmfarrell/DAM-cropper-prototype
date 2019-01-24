import React, { Component } from 'react';
import './App.css';
import './css/App.module.css';
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

  // 🎩 Vue
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

        <Rend
          image={this.state.img}
          height={600}
          width={600}
          cropGuide={this.cropGuide}
        >
          <h1>Thumbnail</h1>
        </Rend>



        <input type="file" onChange={this.preview}></input>
      </div>
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
    const { ctx, cropBox, previewImg } = this.state
    this.resetImage()
    ctx.globalCompositeOperation = 'source-over'
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(...cropBox)
    ctx.globalCompositeOperation = 'multiply'
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
    ctx.fillRect(0, 0, previewImg.width, cropBox[1])
    ctx.fillRect(0, 0, cropBox[0], maxHeight)
    ctx.fillRect(0, cropBox[1] + cropBox[3], maxHeight, previewImg.width)
    ctx.fillRect(cropBox[0] + cropBox[2], 0, maxHeight, previewImg.width)
  }
}

export default App;
