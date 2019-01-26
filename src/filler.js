const stepSize = 0.1,
  halfStepSize = stepSize / 2,
  step = 1 + stepSize,
  halfStep = 1 + halfStepSize,
  maxIterations = 100;

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
    } else {
      this.scale = this.outerWidth / width;
      this.width = this.outerWidth;
      this.height = height * this.scale;
    }

    this.x = (this.outerWidth / 2) - (this.outerWidth * center.x)
    this.y = (this.outerHeight / 2) - (this.outerHeight * center.y)
    console.log(this.x)
    console.log(this.y)
  }

  anchorToInnerEdge() {

  }

  get focalPoint() {
    return [
      this.min.left + this.min.right,
      this.min.top + this.min.bottom
    ]
  }

  fill(image, cropGuide, zoom = 'in') {
    let counter = maxIterations

    if (!image) {
      return;
    }

    if (zoom === 'out') {
      this.anchorToInnerEdge(image, cropGuide)
    } else {
      this.anchorToOuterEdge(image, cropGuide)
    }

    while (
      counter &&
      this.isGap
    ) {
      counter--
      if (counter < 1) {
        console.warn('too many iterations')
        console.log(this.gaps)
      }

      // lemme help you debug that infinite loop, friend

      if (zoom === 'out') {
        this.zoomOut()
        this.fill()
      }
      this.zoomIn()
      this.fill()
    }

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
    console.log(this.x, this.y)

    // @todo handle too far zoom
  }

  zoomOut(x, y, height, width) {
    // @todo handle too far zoom
  }
}
