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
  get = () => {
    const { state } = this
    return {
      get scale() {
        const { previewImg } = state
        if (!previewImg) return null;
        return (previewImg.height >= maxHeight) ? previewImg.height / maxHeight : previewImg.height
      },
      get previewCenter() {
        const [x1, y1, x2, y2] = state.cropBox
        return {
          x: Math.floor((x2 + x1) / 2),
          y: Math.floor((y2 + y1) / 2)
        }
      },
      get cropGuide() {
        if (state.cropBox.reduce((acc, n) => acc + n) === 0) {
          return null;
        }
        return state.cropBox.map((n) => parseInt(n * this.scale, 10))
      }
    }
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
          cropGuide={this.get().cropGuide}
        >
          <h1>Thumbnail</h1>
        </Rend>



        <input type="file" onChange={this.preview}></input>
        <p>{JSON.stringify(this.get())}</p>
      </div>
    );
  }

  resetImage = () => {
    const canvas = this.originalInput.current
    const { previewImg, ctx } = this.state
    const h = Math.min(previewImg.height, maxHeight)
    const w = previewImg.width / this.get().scale
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
    const { ctx, cropBox } = this.state
    this.resetImage()
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(...cropBox)
  }
}

export default App;

// function drawRect(ctx, box, alt = false) {
//   const marchingAngtsPattern = alt ? [5, 5] : [10, 5]
//   console.log(marchingAngtsPattern)
//   // requestAnimationFrame(() => drawRect(ctx, box, !alt))
// }
