import * as THREE from './libs/three/three.module.js';

class Planes {
  constructor() {
    this.planeGroup = new THREE.Group();
  }

  addXY() {
    //XY plane
    const gridHelperXY = new THREE.GridHelper(6, 6);
    gridHelperXY.rotateX(Math.PI / 2);
    gridHelperXY.position.z = -4;
    gridHelperXY.position.y = 3;

    const planeGeomXY = new THREE.PlaneBufferGeometry(6, 6);
    const planeXY = new THREE.Mesh(
      planeGeomXY,
      new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        opacity: 0.5,
        transparent: true,
      })
    );
    planeXY.position.set(0, 3, -4);
    this.planeGroup.add(planeXY, gridHelperXY);
    return this.planeGroup;
  }

  addZY() {
    const gridHelperZY = new THREE.GridHelper(6, 6);
    gridHelperZY.rotateZ(-Math.PI / 2);
    gridHelperZY.position.x = -4;
    gridHelperZY.position.y = 3;

    const planeGeomZY = new THREE.PlaneBufferGeometry(6, 6);
    const planeZY = new THREE.Mesh(
      planeGeomZY,
      new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        opacity: 0.5,
        transparent: true,
      })
    );
    planeZY.rotateY(Math.PI / 2);
    planeZY.position.x = -4;
    planeZY.position.y = 3;
    this.planeGroup.add(planeZY, gridHelperZY);
    return this.planeGroup;
  }

  addXZ() {
    const gridHelperXZ = new THREE.GridHelper(6, 6, 0xffffff, 0xffffff);
    const planeGeomXZ = new THREE.PlaneBufferGeometry(6, 6);
    planeGeomXZ.rotateX(-Math.PI / 2);
    planeGeomXZ.normalizeNormals();

    const planeXZ = new THREE.Mesh(
      planeGeomXZ,
      new THREE.MeshBasicMaterial({
        color: 0xff0080,
        transparent: true,
        opacity: 0.5,
      })
    );
    this.planeGroup.add(planeXZ, gridHelperXZ);
    return this.planeGroup;
  }


}
export { Planes };
