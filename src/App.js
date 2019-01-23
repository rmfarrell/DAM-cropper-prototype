import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor() {
    super()
    this.state = {
      scale: 1,
      height: 0,
      width: 0,
      zoom: 0,
      trim: 0,
      ratio: {
        height: 1,
        width: 1
      }
    }
    this.originalInput = React.createRef()
  }

  computed = () => {
    return this.state.params
  }

  preview = ({ target: { files = [] } }) => {
    const [file] = files,
      reader = new FileReader(),
      canvas = this.originalInput.current,
      ctx = canvas.getContext('2d')

    reader.addEventListener('load', function (e) {
      const img = new Image(),
        { result } = e.target;

      img.onload = function () {
        setImage(ctx, canvas, img)
      }
      img.src = result;
    }, false)

    file && reader.readAsDataURL(file)
  }

  render() {
    return (
      <div className="App">
        <canvas id="original-input" height="600" width="600" ref={this.originalInput}></canvas>
        <input type="file" onChange={this.preview}></input>
        <p>{JSON.stringify(this.computed())}</p>
      </div>
    );
  }
}

export default App;

function setImage(ctx, canvas, img, maxHeight = 600) {
  const scale = (img.height >= maxHeight) ? img.height / maxHeight : img.height
  const h = Math.min(img.height, maxHeight)
  const w = img.width / scale

  canvas.width = w;
  canvas.height = h;
  ctx.drawImage(img, 0, 0, w, h);
}
