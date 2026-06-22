const Phaser = {
  Math: {
    Distance: {
      Between: (x1: number, y1: number, x2: number, y2: number): number => Math.hypot(x2 - x1, y2 - y1)
    }
  }
};

export default Phaser;
