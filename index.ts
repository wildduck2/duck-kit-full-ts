class Scale {
  scale(gap: number, vector: number[]) {
    // do something
  }
}

// 5,5,5,5
// 2,2,2,2

class Triangle extends Scale {
  x: number
  y: number
  width: number
  height: number
  constructor(x: number, y: number, width: number, height: number) {
    super()
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  draw() {}

  run() {
    let shapes = [[this.x, this.y, this.width + this.x, this.height + this.y]]
    this.scale(1, shapes[-1])

    this.draw()
  }
}
