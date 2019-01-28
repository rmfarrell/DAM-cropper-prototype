const stepSize = 0.1,
  halfStepSize = stepSize / 2,
  step = 1 + stepSize;

export default class Filler {
  constructor(opts = {}) {
    this.outerWidth = opts.outerWidth || 0;
    this.min = {
      bottom: Infinity,
      top: -Infinity,
      left: -Infinity,
      right: Infinity
    };
    this.center = [];
    this.outerHeight = opts.outerHeight || 0;
    this.width = 0
    this.height = 0
    this.scale = 1
    this.x = 0
    this.y = 0
    // this.orientation = (this.outerHeight > this.outerWidth) ? 'V' : 'H'
  }

  anchorToOuterEdge(image, cropGuide) {
    if (!image) {
      throw new Error('no image')
    }

    const { height, width } = image,
      { left, top, right, bottom, center } = cropGuide

    // fill the largest axis
    if (this.isVertical) {
      this.scale = this.outerHeight / height;
      this.height = this.outerHeight;
      this.width = width * this.scale;
      this.x = (this.outerWidth / 2) - (this.width * center.x)
      this.y = 0
      return
    } else {
      this.scale = this.outerWidth / width;
      this.width = this.outerWidth;
      this.height = height * this.scale;
      // 200 - 400 * 0.5
      this.y = (this.outerHeight / 2) - (this.height * center.y)
      this.x = 0
    }
    // console.log('center', center)
    // console.log('width', this.width)
    // console.log('height', this.height)
    // console.log('x', this.x)
    // console.log('y', this.y)
  }

  anchorToInnerEdge() {

  }

  get focalPoint() {
    return [
      this.min.left + this.min.right,
      this.min.top + this.min.bottom
    ]
  }

  shift(x = 0, y = 0) {
    this.x = this.x + x
    this.y = this.y + y
  }

  get shouldZoom() {
    return this.height < this.outerHeight || this.width < this.outerWidth
  }

  zoom() {
    const zoomStep = 1.05;
    console.log(this.height)
    while (this.shouldZoom) {
      const oldHeight = this.height,
        oldWidth = this.width
      this.height = oldHeight * zoomStep
      this.width = oldWidth * zoomStep
      console.log(this.height)
      this.x = this.x -= (this.width - oldWidth) / 2
      this.y = this.y -= (this.height - oldHeight) / 2
    }
  }

  cover() {

    if (this.gaps[0]) {
      this.y = 0
    }
    if (this.gaps[1]) {
      this.shift(0, 1)
      this.cover()
    }
    if (this.gaps[2]) {
      this.x = 0
    }
    if (this.gaps[3]) {
      this.shift(1)
      this.cover()
    }
    return
  }

  fill(image, cropGuide, zoom = 'in') {

    if (!image) {
      return;
    }

    if (zoom === 'out') {
      this.anchorToInnerEdge(image, cropGuide)
    } else {
      this.anchorToOuterEdge(image, cropGuide)
    }

    this.zoom()

    this.cover()

    // pan to fit

    // while (
    //   counter &&
    //   this.isGap
    // ) {
    //   counter--
    //   if (counter < 1) {
    //     console.warn('too many iterations')
    //     console.log(this.gaps)
    //   }

    //   // lemme help you debug that infinite loop, friend

    //   if (zoom === 'out') {
    //     this.zoomOut()
    //     this.fill()
    //   }
    //   this.zoomIn()
    //   this.fill()
    // }

    return [this.x, this.y, this.width, this.height]
  }

  get isVertical() {
    return this.outerHeight > this.outerWidth
  }

  pan() {

  }

  get gaps() {
    const { height, outerHeight, outerWidth, width, x, y } = this

    return [

      // top
      y > 0,

      // bottom
      y + height < outerHeight,

      // left
      x > 0,

      // right
      x + width < outerWidth
    ]
  }

  get isGap() {
    return this.gaps.some((b) => b)
  }

  zoomIn() {
    let { x, y } = this
    const oldHeight = this.height,
      oldWidth = this.width
    this.width = this.width * step
    this.height = this.height * step
    x = x - (this.width - oldWidth) / 2
    y = y - (this.height - oldHeight) / 2
    this.x = x
    this.y = y

    // @todo handle too far zoom
  }

  zoomOut(x, y, height, width) {
    // @todo handle too far zoom
  }
}
