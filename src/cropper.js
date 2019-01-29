/**
 * Create a cropping of given an image and crop guides
 */
export default class Cropper {
  /** 
   * Constructor for Cropper
   * 
   * @param {Image} image
   * @param {object} focus - x/y coordinates of center of photo center of interest
   * @param {number} focus.x
   * @param {number} focus.y 
   * @param {object} [cropGuide]
   * @param {number} [cropGuide][top] - top of crop area
   * @param {number} [cropGuide][bottom] - bottom of crop area
   * @param {number} [cropGuide][left] - left edge of crop area
   * @param {number} [cropGuide][right] - right edge of crop area
   */
  constructor(image, focus = { x: 0, y: 0 }, cropGuide) {
    this.focus = focus
    this.image = image
    this.cropGuide = cropGuide
    this.outerWidth = 0
    this.outerHeight = 0
    this.width = 0
    this.height = 0
    this.scale = 1
    this.x = 0
    this.y = 0

    if (!image) {
      throw new Error('image required')
    }
  }

  /**
   * Crop the image in height/width area
   * @param {number} width - output image weight
   * @param {number} height - output image height
   * @param {string} zoom - (in|out) sets whether the image should zoom in or out to fill the space
   */
  crop(width = 0, height = 0, zoom = 'in') {

    // set width/height
    this.outerWidth = width;
    this.outerHeight = height


    if (zoom === 'out') {
      this._anchorToInnerEdge(this.image, this.cropGuide)
    } else {
      this._anchorToOuterEdge(this.image, this.focus)
    }
    this._zoomToFit()
    this._cover()

    return [this.x, this.y, this.width, this.height]
  }


  // -- Internals

  /**
   * Is the image vertical?
   * @return {Boolean}
   */
  get _isVertical() {
    return this.outerHeight > this.outerWidth
  }

  /**
   * Find any gaps between the image and the outer edge
   * @return {Boolean[]} - corresponds with top, bottom, left, and right edges respectively
   */
  get _gaps() {
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

  /**
   * Check if gaps returns anything
   * @returns {Boolean}
   */
  get _isGap() {
    return this._gaps.some((b) => b)
  }

  /**
   * Place the image in the frame matching its longest axis
   */
  _anchorToOuterEdge() {

    const { height, width } = this.image;

    // fill the largest axis
    if (this._isVertical) {
      this.scale = this.outerHeight / height;
      this.height = this.outerHeight;
      this.width = width * this.scale;
      this.x = (this.outerWidth / 2) - (this.width * this.focus.x)
      this.y = 0
      return
    } else {
      this.scale = this.outerWidth / width;
      this.width = this.outerWidth;
      this.height = height * this.scale;
      this.y = (this.outerHeight / 2) - (this.height * this.focus.y)
      this.x = 0
    }
  }

  /**
   * Place the image in the frame matching the longest crop guide to the longest edge
   */
  _anchorToInnerEdge() {

    const { height, width } = this.image,
      { left, top, right, bottom } = this.cropGuide

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
    this.x = (this.outerWidth / 2) - (this.width * this.focus.x)
    this.y = (this.outerHeight / 2) - (this.height * this.focus.y)
  }

  /**
   * Shift the image within the frame
   * @param {number} x - pixels to shift left/right
   * @param {number} y - pixels to shift up/down
   */
  _shift(x = 0, y = 0) {
    this.x = this.x + x
    this.y = this.y + y
  }

  /**
   * Zoom in/out (scale image) without shifting image in outer frame
   * @param {number} step - amount to enlarge image
   */
  _zoom(step = 1.05) {
    const oldHeight = this.height,
      oldWidth = this.width
    this.height = oldHeight * step
    this.width = oldWidth * step
    this.x = this.x -= (this.width - oldWidth) / 2
    this.y = this.y -= (this.height - oldHeight) / 2
  }

  /**
   * Ensure image fits in frame; if not 
   */
  _zoomToFit() {
    while (this.height < this.outerHeight || this.width < this.outerWidth) {
      this._zoom()
    }
  }

  /**
   * shift image around until the outer edges are covered
   */
  _cover() {
    const [top, bottom, left, right] = this._gaps

    if (top) {
      this.y = 0
    }
    if (bottom) {
      this._shift(0, 1)
      this._cover()
    }
    if (left) {
      this.x = 0
    }
    if (right) {
      this._shift(1)
      this._cover()
    }
    return
  }
}
