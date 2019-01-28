import React, { Component } from 'react';
import styles from './css/App.module.css';
import serialize from 'form-serialize'
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

  get isCropBox() {
    return this.state.cropBox.reduce((v, acc) => acc += v) > 0
  }

  get scale() {
    const { previewImg } = this.state
    if (!previewImg) return null;
    console.log(maxHeight / previewImg.height)
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

  reset() {
    window.location.reload()
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

  updateRendition = (evt, idx) => {
    evt.preventDefault()
    const { width, ratio1, ratio2, zoom } = serialize(evt.target, { hash: true }),
      renders = this.state.renders.slice(0)
    renders[idx] = {
      width: Number(width),
      ratio: `${ratio1}:${ratio2}`,
      zoom: zoom === 'on'
    }
    this.setState({ renders })
  }

  render() {
    return (
      <div className={styles.root}>
        <div className={styles.center}>
          <canvas
            id="original-input"
            draggable
            height="0"
            width="0"
            ref={this.originalInput}
          ></canvas>
          {this.state.img === null || <button className={styles.reset} onClick={this.reset}>🚫</button>}

          {this.state.img === null && (
            <label className={styles.fileUploadContainer}>
              Upload image here.
              <input type="file" name="img" id="img" onChange={this.preview}></input>
            </label>
          )}
          {this.state.img === null || this.isCropBox ||
            <p>Draw a rectangle around the area you want to crop</p>
          }
        </div>

        <div className={styles.rendContainer}>

          {this.state.renders.map(({ width, ratio, zoom }, idx) => {

            return (<Rend
              key={idx}
              image={this.state.img}
              width={width}
              ratio={ratio}
              zoom={zoom}
              cropGuide={this.cropGuide}
              orientation={this.orientation}
            >
              <h4>{`/v2/${ratio}/${zoom ? 'zoom/' : ''}imagename.jpg?w=${width}`}</h4>
              <form onSubmit={(e) => this.updateRendition(e, idx)}>
                <p>
                  <input type="checkbox" name="zoom" defaultChecked={zoom} />
                  <label>Zoom</label>
                </p>
                <p>
                  <label>Ratio</label>
                  <input type="number" name="ratio1" width="2" defaultValue={ratio.split(':')[0]} />:
                <input type="number" name="ratio2" width="2" defaultValue={ratio.split(':')[1]} />
                </p>
                <p>
                  <label>Width</label>
                  <input type="number" name="width" defaultValue={width} />
                </p>
                <input type="submit" value="update"></input>
              </form>
            </Rend>)
          })}
        </div>
      </div >
    );
  }

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

    const h = previewImg.height * this.scale
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

      // don't accept upside down rectangles
      if (start[0] > end[0] || start[1] > end[1]) {
        console.error('no upside down crop rectangles RN')
        return;
      }

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
