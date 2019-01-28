import React, { Component } from 'react';
import styles from './css/App.module.css';
import Rend from './Rend'

// TODO move to prop
const maxHeight = 600

class App extends Component {
  constructor() {
    super()
    this.state = {
      zoom: 0,
      trim: 0,
      ratio: {
        height: 1,
        width: 1
      },
      img: null,
      previewImg: null,
      cropBox: [0, 0, 0, 0],
      cropCoords: [],
      ctx: null,
      renders: [

        // 3:2
        {
          width: 400,
          ratio: '3:2',
          zoom: false
        },
        {
          width: 400,
          ratio: '3:2',
          zoom: true
        },

        // 1:1
        {
          width: 400,
          ratio: '1:1',
          zoom: true
        },

        {
          width: 400,
          ratio: '1:1',
          zoom: false
        },

        // various horizontals
        {
          width: 400,
          ratio: '2:1',
          zoom: false
        },
        {
          width: 400,
          ratio: '16:9',
          zoom: false
        },
        {
          width: 400,
          ratio: '12:5',
          zoom: false
        },

        // various vertical
        {
          width: 200,
          ratio: '2:5',
          zoom: false
        },
        {
          width: 200,
          ratio: '3:5',
          zoom: false
        },
        {
          width: 200,
          ratio: '4:7',
          zoom: false
        },
      ]
    }
    this.originalInput = React.createRef()
  }

  get scale() {
    const { previewImg } = this.state
    if (!previewImg) return null;
    return maxHeight / previewImg.height
  }

  get cropGuide() {

    if (!this.state.previewImg) {
      return null;
    }
    let mins, center
    const { cropCoords } = this.state,
      { height, width } = this.state.previewImg,
      h = height * this.scale,
      w = width * this.scale

    if (!cropCoords.length) {
      return null;
    }
    mins = {
      left: cropCoords[0] / w,
      top: cropCoords[1] / h,
      right: cropCoords[2] / w,
      bottom: cropCoords[3] / h,
    }
    center = {
      x: (mins.right + mins.left) / 2,
      y: (mins.top + mins.bottom) / 2
    }
    return Object.assign(mins, { center })
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

  handleChange = (e, idx) => {
    console.log(e)
  }

  render() {
    return (
      <div className={styles.root}>
        <canvas
          id="original-input"
          draggable
          height="0"
          width="0"
          ref={this.originalInput}
        ></canvas>
        <div className={styles.rendContainer}>

          {this.state.renders.map(({ width, ratio, zoom }, idx) => {

            return (<Rend
              key={`${ratio}${zoom}`}
              image={this.state.img}
              width={width}
              ratio={ratio}
              zoom={zoom}
              cropGuide={this.cropGuide}
              orientation={this.orientation}
            >
              <h4>{`/v2/${ratio}/${zoom ? 'zoom/' : ''}imagename.jpg`}</h4>
              <input type="checkbox" name="zoom" checked={zoom} onChange={(e) => this.handleChange(e, idx)} />
              <input type="text" name="ratio1" value={ratio.split(':')[0]} onChange={(e) => this.handleChange(e, idx)} />
              <input type="text" name="ratio2" value={ratio.split(':')[1]} onChange={(e) => this.handleChange(e, idx)} />
              <input type="width" name="width" value={width} onChange={(e) => this.handleChange(e, idx)} />
            </Rend>)
          })}
        </div>


        <input type="file" onChange={this.preview}></input>
      </div >
    );
  }

  /**
   * get orientation of the image
   * @reutrn {string} V|H|S (vertical|horizontal|square)
   * 
   */
  get orientation() {
    const { img } = this.state
    if (!img) {
      return null
    }
    if (img.height > img.width) {
      return 'V'
    }
    if (img.height < img.width) {
      return 'H'
    }
    return 'S'
  }

  resetImage = () => {
    const canvas = this.originalInput.current
    const { previewImg, ctx } = this.state

    const h = Math.min(previewImg.height, maxHeight)
    const w = previewImg.width * this.scale
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
        ],
        cropCoords: [...start, ...end]
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
