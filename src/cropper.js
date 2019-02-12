/**
 * Create a cropping of given an image and crop guides
 */
export default class Cropper {
  /** 
   * Constructor for Cropper
   * @param {number} width - original image width
   * @param {number} height - original image height
   */
  constructor(width, height) {
    this.image = {
      height,
      width
    }
    this._cropGuide = null
    this._focus = {
      x: 0.5,
      y: 0.5
    }
    this.outerWidth = 0
    this.outerHeight = 0
    this.width = 0
    this.height = 0
    this.scale = 1
    this.x = 0
    this.y = 0

    if (!height || !width) {
      throw new Error('height and width required')
    }
  }

  /**
   * Set the cropGuide
   * @param {object} cropGuide
   * @param {number} cropGuide.top - top of crop area
   * @param {number} cropGuide.bottom - bottom of crop area
   * @param {number} cropGuide.left - left edge of crop area
   * @param {number} cropGuide.right - right edge of crop area
   */
  set cropGuide(_cropGuide = {}) {
    const {
      top = 0.2,
      right = 0.8,
      bottom = 0.8,
      left = 0.2
    } = _cropGuide,
      errs = this._validateRelativeCoordinates(_cropGuide)

    if (right <= left || bottom <= top) {
      errs.push(new Error(`Invalid cropGuide values:
        Left must be less than right and top must be less than bottom`))
    }

    errs.forEach((err) => {
      throw err
    })

    this._cropGuide = _cropGuide
    this.focus = {
      x: (right + left) / 2,
      y: (top + bottom) / 2
    }
  }

  /**
   * Set the focus point
   * @param {object} focus
   * @param {number} focus.x - float between 0-1 representing focus's X coorinate
   * @param {number} focus.y - float between 0-1 representing focus's Y coorinate
   */
  set focus(_focus = { x: 0.5, y: 0.5 }) {
    const errs = this._validateRelativeCoordinates(_focus)
    errs.forEach((err) => {
      throw err
    })
    this._focus = _focus
  }

  get cropGuide() {
    return this._cropGuide;
  }

  get focus() {
    return this._focus;
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
   * Validate an object of relative coordinates (numbers between 0 and 1)
   * @param {Object} obj
   * @return {Error}
   */
  _validateRelativeCoordinates(obj = {}) {
    const errs = []
    for (let key in obj) {
      if (typeof obj[key] !== 'number' || obj[key] < 0 || obj[key] > 1) {
        errs.push(new Error(
          `Expected ${key} to contain a number between 0 and 1 but recieved ${obj.key}`))
      }
    }
    return errs
  }

  /**
   * Get image's orientation
   * @returns {String} -  vertical|horiztonal|square
   */
  get _orientation() {

    if (this.outerHeight === this.outerWidth) {
      return 'square'
    }
    if (this.outerHeight > this.outerWidth) {
      return 'vertical'
    }
    return 'horizontal'
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
    if (this.image.width / this.image.height < this.outerWidth / this.outerHeight) {
      return this._alignOuterEdgesHorizontally()
    }
    return this._alignOuterEdgesVertically()
  }

  _alignOuterEdgesVertically() {
    const { height = 0, width = 0 } = this.image;

    this.scale = this.outerHeight / height;
    this.height = this.outerHeight;
    this.width = width * this.scale;
    this.x = (this.outerWidth / 2) - (this.width * this.focus.x)
    this.y = 0
  }

  _alignOuterEdgesHorizontally() {
    const { height = 0, width = 0 } = this.image;

    this.scale = this.outerWidth / width;
    this.width = this.outerWidth;
    this.height = height * this.scale;
    this.y = (this.outerHeight / 2) - (this.height * this.focus.y)
    this.x = 0
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
   * Ensure image fits in frame
   */
  _zoomToFit() {
    let mult
    if (this.width < this.outerWidth) {
      mult = (this.outerWidth - this.width) / this.width
      this.height = this.height * mult
    }
    if (this.height < this.outerHeight) {
      mult = (this.outerWidth - this.width) / this.width
      this.width = this.width * mult
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
