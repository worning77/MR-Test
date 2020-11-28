import * as THREE from './libs/three/three.module.js';

const level1 = {
  gridXY: [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 1, 0],
  ],
  gridZY: [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 1],
  ],
};
const level2 = {
  gridXY: [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0],
  ],
  gridZY: [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0],
    [0, 1, 1, 1, 0, 0],
    [0, 0, 1, 0, 0, 0],
    [0, 1, 1, 1, 0, 0],
  ],
};

class Levels {
  constructor(x = 0, y = 0) {
    this.lvl1GridXY = level1.gridXY;
    this.lvl1GridZY = level1.gridZY;

    this.lvl2GridXY = level2.gridXY;
    this.lvl2GridZY = level2.gridZY;

    this.xStart = x;
    this.yStart = y;

    this.shape = new THREE.Shape();
    this.shape.moveTo(0, 0);
    this.shape.lineTo(0, 1);
    this.shape.lineTo(1, 1);
    this.shape.lineTo(1, 0);
    this.shape.lineTo(0, 0);

    this.extrudeSettings = {
      steps: 1,
      depth: 0.1,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0,
      bevelOffset: 0,
      bevelSegments: 1,
    };

    this.geometry = new THREE.ExtrudeBufferGeometry(
      this.shape,
      this.extrudeSettings
    );

    this.squareGeo = new THREE.PlaneBufferGeometry(1, 1);
    this.shadowMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      opacity: 0.3,
      transparent: true,
      side: THREE.DoubleSide,
      //emissive: 0xffffff
    });
    this.groupXY = new THREE.Object3D();
    this.groupZY = new THREE.Object3D();
    this.centerXY = new THREE.Vector3();
    this.centerZY = new THREE.Vector3();
  }

  level1XY() {
    const group = this.readGridXY(this.lvl1GridXY).clone();
    return group;
  }
  level1ZY() {
    const group = this.readGridZY(this.lvl1GridZY).clone();
    return group;
  }
  level2XY() {
    const group = this.readGridXY(this.lvl2GridXY).clone();
    return group;
  }
  level2ZY() {
    const group = this.readGridZY(this.lvl2GridZY).clone();
    return group;
  }

  readGridXY(level) {
    const geo = this.geometry.clone();
    const shadowPiece = new THREE.Mesh(geo, this.shadowMaterial);

    for (let iY = level.length - 1; iY > -1; iY--) {
      for (let iX = 0; iX < level[iY].length; iX++) {
        if (level[iY][iX] == 1) {
          let bX = this.xStart + iX;
          let bY = this.yStart + level.length - 1 - iY;
          this.shadowPiece = shadowPiece.clone();
          this.shadowPiece.geometry.computeBoundingBox();
          this.shadowPiece.geometry.boundingBox.getCenter(this.centerXY);
          this.centerXY.x = bX - 2.5;
          this.centerXY.y = bY + 0.5;
          this.centerXY.z = -4;
          this.centerXY.add(new THREE.Vector3(-0.5, -0.5, -0.04));
          this.shadowPiece.position.copy(this.centerXY);
          this.shadowPiece.updateWorldMatrix;
          this.groupXY.attach(this.shadowPiece);
          this.groupXY.updateWorldMatrix;
        }
      }
    }
    return this.groupXY;
  }

  readGridZY(level) {
    const geo = this.geometry.clone();
    const shadowPiece = new THREE.Mesh(geo, this.shadowMaterial);

    for (let iY = level.length - 1; iY > -1; iY--) {
      for (let iX = 0; iX < level[iY].length; iX++) {
        if (level[iY][iX] == 1) {
          let bX = this.xStart + iX;
          let bY = this.yStart + level.length - 1 - iY;
          this.shadowPiece = shadowPiece.clone();
          this.shadowPiece.geometry.computeBoundingBox();
          this.shadowPiece.geometry.boundingBox.getCenter(this.centerZY);
          this.centerZY.x = -4;
          this.centerZY.y = bY + 0.5;
          this.centerZY.z = -bX + 2.5;

          this.centerZY.add(new THREE.Vector3(-0.04, -0.5, 0.5));

          this.shadowPiece.position.copy(this.centerZY);
          //console.log(this.shadowPiece);
          this.shadowPiece.rotateY(Math.PI / 2);
          // this.shadowPiece.geometry.attributes.position.needsUpdate = true;
          this.shadowPiece.updateWorldMatrix;
          this.groupZY.add(this.shadowPiece);
          this.groupZY.updateWorldMatrix;
        }
      }
    }
    return this.groupZY;
  }

}
export { Levels };
