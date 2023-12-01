class PathHelper {
  private readonly path: PathObject;
  
  constructor(path: PathObject) {
    this.path = path;
  }
  
  public getPathType(): "Polygonal" | "Oval" | "Freehand" | "Unknown" {
    const pathDef = this.getPathDefinition();
    if (pathDef.length > 1) {
      if (pathDef[1].length === 3 && pathDef[1][0] === "L") return "Polygonal";
      if (pathDef[1].length === 5 && pathDef[1][0] === "Q") return "Freehand";
      if (pathDef[1].length === 7 && pathDef[1][0] === "C") return "Oval";
    }
    return "Unknown";
  }
  
  public tryGetPointWithinPath(): Point | undefined {
    switch(this.getPathType()) {
      case "Polygonal": return this.tryGetPointWithinPolygon();
      case "Oval": return this.getPointWithinOval();
    }
  }
  
  private tryGetPointWithinPolygon(): Point | undefined {
    if (this.getPathType() !== "Polygonal") throw new Error("Path is not a polygon");
    const path = this.getPathDefinition<PolygonPathDefinition>();
    
    const polygon = path.map(p => ({x: p[1], y: p[2]}));
    
    // Ensure we have a closed polygon
    const [firstPoint, lastPoint] = [polygon[0], polygon[polygon.length - 1]];
    if (firstPoint.x !== lastPoint.x || firstPoint.y !== lastPoint.y) {
      polygon.push(firstPoint);
    }
    
    // Determine bounding box
    const polygonMinX = (_.min(polygon, p => p.x) as Point).x;
    const polygonMaxX = (_.max(polygon, p => p.x) as Point).x;
    const polygonMinY = (_.min(polygon, p => p.y) as Point).y;
    const polygonMaxY = (_.max(polygon, p => p.y) as Point).y;

    // Randomly select a point within the bounding box and check it's within our polygon
    for (let i = 0; i < 1000; i++) {
      const randomX = randomInteger(polygonMaxX - polygonMinX) + polygonMinX;
      const randomY = randomInteger(polygonMaxY - polygonMinY) + polygonMinY;
      const randomPoint: Point = { x: randomX, y: randomY };

      if (this.pointIsInPolygon(polygon, randomPoint, polygonMinX, polygonMaxX, polygonMinY, polygonMaxY)) {
        return randomPoint;
      }
    }
  }
  
  private getPointWithinOval(): Point {
    const phi = Math.random() * ((2 * Math.PI) + 1);
    const rho = Math.random();
    const width = this.path.get("width");
    const height = this.path.get("height");

    return {
      x: (Math.sqrt(rho) * Math.cos(phi) * width / 2.0) + (width / 2.0),
      y: (Math.sqrt(rho) * Math.sin(phi) * height / 2.0) + (height / 2.0),
    };
  }
  
  private getPathDefinition<T extends OneOfPathDefinition = OneOfPathDefinition>(): T {
    return JSON.parse(this.path.get("_path")) as T;
  }

  private pointIsInPolygon(
    polygon: Point[],
    point: Point,
    polygonMinX: number,
    polygonMaxX: number,
    polygonMinY: number,
    polygonMaxY: number
  ): boolean {    
    if (point.x < polygonMinX || point.x > polygonMaxX || point.x < polygonMinY || point.x > polygonMaxY) {
      return false;
    }

    let crossingCount = 0;

    for (let i = 0; i < polygon.length; i++) {
      const current = polygon[i];
      const next = polygon[(i + 1) % polygon.length];

      if (
        ((current.y <= point.y && point.y < next.y) || (next.y <= point.y && point.y < current.y)) &&
        point.x < ((next.x - current.x) * (point.y - current.y)) / (next.y - current.y) + current.x
      ) {
        crossingCount++;
      }
    }

    return crossingCount % 2 === 1;
  }
}