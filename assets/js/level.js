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


class Levels {
  constructor(x = 0, y = 0) {
    this.lvl1GridXY = level1.gridXY;
    this.lvl1GridZY = level1.gridZY;
    this.xStart = x;
    this.yStart = y;
    this.squareGeo = new THREE.PlaneBufferGeometry(1, 1);
    this.shadowMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      opacity: 0.6,
      transparent: true,
      side: THREE.DoubleSide,
    });
    this.groupXY = new THREE.Object3D();
     this.groupZY = new THREE.Object3D();
    this.centerXY = new THREE.Vector3();
    this.centerZY = new THREE.Vector3();
  }
  addShadowXY(app) {
    const geo = this.squareGeo.clone();
    const shadowPiece = new THREE.Mesh(geo, this.shadowMaterial);

    for (let iY = this.lvl1GridXY.length - 1; iY > -1; iY--) {
      for (let iX = 0; iX < this.lvl1GridXY[iY].length; iX++) {
        if (this.lvl1GridXY[iY][iX] == 1) {
          let bX = this.xStart + iX;
          let bY = this.yStart + this.lvl1GridXY.length - 1 - iY;
          this.shadowPiece = shadowPiece.clone();
          this.shadowPiece.geometry.computeBoundingBox();
          this.shadowPiece.geometry.boundingBox.getCenter(this.centerXY);
          this.centerXY.x = bX - 2.5;
          this.centerXY.y = bY + 0.5;
          this.centerXY.z = -4;

          //console.log(this.centerXY);
          this.shadowPiece.position.copy(this.centerXY);
          this.shadowPiece.geometry.attributes.position.needsUpdate = true;
            this.shadowPiece.updateWorldMatrix;
          app.levelShdaowsXY.push(this.shadowPiece);
          this.groupXY.add(this.shadowPiece);
          this.groupXY.updateWorldMatrix;
        }
      }
    }
    return this.groupXY;
  }

  addShadowZY(app) {
    const geo = this.squareGeo.clone();
    const shadowPiece = new THREE.Mesh(geo, this.shadowMaterial);

    for (let iY = this.lvl1GridZY.length - 1; iY > -1; iY--) {
      for (let iX = 0; iX < this.lvl1GridZY[iY].length; iX++) {
        if (this.lvl1GridZY[iY][iX] == 1) {
          let bX = this.xStart + iX;
          let bY = this.yStart + this.lvl1GridZY.length - 1 - iY;
          this.shadowPiece = shadowPiece.clone();
          this.shadowPiece.geometry.computeBoundingBox();
          this.shadowPiece.geometry.boundingBox.getCenter(this.centerZY);
          this.centerZY.x = -4 ;
          this.centerZY.y = bY +0.5 ;
          this.centerZY.z = -bX +2.5;

          //console.log(this.centerZY);

          this.shadowPiece.position.copy(this.centerZY);
          this.shadowPiece.rotateY(Math.PI / 2);
          this.shadowPiece.geometry.attributes.position.needsUpdate = true;
          this.shadowPiece.updateWorldMatrix;
          app.levelShdaowsZY.push(this.shadowPiece);
          this.groupZY.add(this.shadowPiece);
        this.groupZY.updateWorldMatrix;
        }
      }
    }
    return this.groupZY;
  }
}
export {Levels}
