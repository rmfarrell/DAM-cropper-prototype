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
  }

  anchorToOuterEdge(image, center = { x: 0, y: 0 }) {
    if (!image) {
      throw new Error('no image')
    }

    const { height, width } = image;

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
  }

  anchorToInnerEdge(image, cropGuide) {

    if (!image) {
      throw new Error('no image')
    }

    const { height, width } = image,
      { left, top, right, bottom, center } = cropGuide

    // set initial zoom
    // if inner image has wider ratio than container
    if ((right - left) / (bottom - top) > this.outerWidth / this.outerHeight) {

      // set image width to outer width / inner width
      this.width = this.outerWidth / (right - left)
      this.scale = this.width / width
      this.height = height * this.scale
    }
    else {
      // set image height to outer width / inner height
      this.height = this.outerHeight / (bottom - top)
      this.scale = this.height / height
      this.width = width * this.scale
    }
    this.x = (this.outerWidth / 2) - (this.width * center.x)
    this.y = (this.outerHeight / 2) - (this.height * center.y)
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

  zoom(step = 1.05) {
    const oldHeight = this.height,
      oldWidth = this.width
    this.height = oldHeight * step
    this.width = oldWidth * step
    this.x = this.x -= (this.width - oldWidth) / 2
    this.y = this.y -= (this.height - oldHeight) / 2
  }

  zoomToFit() {

    while (this.height < this.outerHeight || this.width < this.outerWidth) {
      this.zoom()
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

  crop(image, cropGuide, zoom = 'in') {

    if (!image) {
      return;
    }

    if (zoom === 'out') {
      this.anchorToInnerEdge(image, cropGuide)
      this.zoomToFit()
      this.cover()
    } else {
      this.anchorToOuterEdge(image, cropGuide.center)
      this.zoomToFit()
      this.cover()
    }

    return [this.x, this.y, this.width, this.height]
  }

  get isVertical() {
    return this.outerHeight > this.outerWidth
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
}
