import * as THREE from './libs/three/three.module.js';
import { LBlock } from './shapes/l-shape.js';
import { TBlock } from './shapes/t-shape.js';
import { ZBlock } from './shapes/z-shape.js';

let pointXY1M = new THREE.Vector3();
let pointZY1M = new THREE.Vector3();

let pointCurent1 = new THREE.Vector3();
let pointCurent2 = new THREE.Vector3();
const LrightColor = 0x00a9fe;
const TrightColor = 0xfc6e22;
const ZrightColor = 0xb537f2;
const wrongColor = 0xff0000;

class Inputs {
  constructor(app) {
    app.onMouseMove((event) => {
      this._onMouseMoveL(event);
    });
    app.onMouseMove((event) => {
      this._onMouseMoveT(event);
    });
    app.onMouseMove((event) => {
      this._onMouseMoveZ(event);
    });

    app.onMouseDown((event) => {
      this._onMouseDownL(event);
    });

    app.onMouseDown((event) => {
      this._onMouseDownT(event);
    });
    app.onMouseDown((event) => {
      this._onMouseDownZ(event);
    });

    app.onKeyDown((event) => {
      this._onKeyDownL(event);
    });
    app.onKeyDown((event) => {
      this._onKeyDownT(event);
    });
    app.onKeyDown((event) => {
      this._onKeyDownZ(event);
    });

    this.shadowCenterPoint = new THREE.Vector3();
  }

  checkCollision(currentBlock, object2) {
    let collision = true;
    for (let Ci = 0; Ci < 2; Ci++) {
      let box1 = new THREE.Box3()
        .setFromObject(currentBlock.children[Ci])
        .expandByScalar(-0.9);
      for (let Pi = 0; Pi < 2; Pi++) {
        let box2 = new THREE.Box3().setFromObject(object2.children[Pi]);
        if (box1.intersectsBox(box2)) {
          return collision;
        }
      }
    }
    return !collision;
  }

  checkShadowL(shadowXY, shadowZY) {
    let pointXY1M = new THREE.Vector3();
    let pointXY2M = new THREE.Vector3();
    let pointZY1M = new THREE.Vector3();
    let pointZY2M = new THREE.Vector3();

    app.LBlockS.children[0].children[0].getWorldPosition(pointCurent1);
    app.LBlockS.children[0].children[1].getWorldPosition(pointCurent2);

    //XY plane shadow trasnform
    //pointXY1M.copy(pointCurent1.x.toFixed(1), pointCurent1.y, 0);

    pointXY1M.x = parseFloat(pointCurent1.x.toFixed(1));
    pointXY1M.y = pointCurent1.y;
    pointXY1M.z = 0;
    pointXY2M.x = parseFloat(pointCurent2.x.toFixed(1));
    pointXY2M.y = pointCurent2.y;
    pointXY2M.z = 0;

    if (pointXY1M.x !== pointXY2M.x) {
      if (app.removedXYPieceL.length > 0) {
        pointXY2M.z = pointXY2M.z - 4;
        app.removedXYPieceL[0].position.copy(pointXY2M);
        shadowXY.children[0].attach(app.removedXYPieceL[0]);
        app.removedXYPieceL.length = 0;
      }
    } else {
      if (app.removedXYPieceL.length === 0) {
        app.removedXYPieceL.push(shadowXY.children[0].children[1]);
        shadowXY.children[0].remove(shadowXY.children[0].children[1]);
      }
    }
    //ZY plane shadow trasnform
    pointZY1M.x = parseFloat (- pointCurent1.z.toFixed(1));
    pointZY1M.y = pointCurent1.y;
    pointZY1M.z = 0;
    pointZY2M.x = parseFloat (- pointCurent2.z.toFixed(1));
    pointZY2M.y = pointCurent2.y;
    pointZY2M.z = 0;

    if (pointZY1M.x !== pointZY2M.x) {
      if (app.removedZYPieceL.length > 0) {
        pointZY2M.x = -4;
        pointZY2M.z = pointCurent2.z;
        app.removedZYPieceL[0].position.copy(pointZY2M);
        shadowZY.children[0].attach(app.removedZYPieceL[0]);
        app.removedZYPieceL.length = 0;
      }
    } else {
      if (app.removedZYPieceL.length === 0) {
        app.removedZYPieceL.push(shadowZY.children[0].children[1]);
        shadowZY.children[0].remove(shadowZY.children[0].children[1]);
      }
    }

    if (
      Math.abs(pointCurent2.x) > 3 ||
      Math.abs(pointCurent2.z) > 3 ||
      pointCurent1.y + 2 > 6
    ) {
      app.LBlockS.children[0].children[0].material.color.setHex(wrongColor);
      app.LBlockS.children[0].children[1].material.color.setHex(wrongColor);
    }

    TWEEN.removeAll();
    const current = { opacity: 0.4 };
    const tween = new TWEEN.Tween(current)
      .to({ opacity: 0.05 }, 1000)
      .easing(TWEEN.Easing.Elastic.InOut)
      .repeat(Infinity)
      .yoyo(true);

    if (
      app.LBlockS.children[0].children[1].material.color.getHex() == wrongColor
    ) {
      tween.start();
      tween.onUpdate(() => {
        app.LBlockS.children[0].children[0].material.opacity = current.opacity;
        app.LBlockS.children[0].children[1].material.opacity = current.opacity;

        shadowXY.children[0].children[0].material.opacity = current.opacity;
        if (shadowXY.children[0].children[1] !== undefined) {
          shadowXY.children[0].children[1].material.opacity = current.opacity;
        }
        shadowZY.children[0].children[0].material.opacity = current.opacity;
        if (shadowZY.children[0].children[1] !== undefined) {
          shadowZY.children[0].children[1].material.opacity = current.opacity;
        }
      });
    } else {
      tween.stop();
    }
  }
  checkShadowT(shadowXY, shadowZY) {
    let pointZY1M = new THREE.Vector3();
    let pointZY2M = new THREE.Vector3();

    app.TBlockS.children[0].children[0].getWorldPosition(pointCurent1);
    app.TBlockS.children[0].children[1].getWorldPosition(pointCurent2);
    //ZY plane shadow trasnform
    pointZY1M.x = parseFloat (- pointCurent1.z.toFixed(1));
    pointZY1M.y = parseFloat(pointCurent1.y.toFixed(1));
    pointZY1M.z = 0;
    pointZY2M.x = parseFloat (- pointCurent2.z.toFixed(1));
    pointZY2M.y = parseFloat(pointCurent2.y.toFixed(1));
    pointZY2M.z = 0;

    if (pointZY1M.y !== pointZY2M.y) {
      if (app.removedZYPieceT.length > 0) {
        pointZY2M.x = -4;
        pointZY2M.z = pointCurent2.z;
        app.removedZYPieceT[0].position.copy(pointZY2M);
        shadowZY.children[0].attach(app.removedZYPieceT[0]);
        app.removedZYPieceT.length = 0;
      }
    } else {
      if (app.removedZYPieceT.length === 0) {
        app.removedZYPieceT.push(shadowZY.children[0].children[1]);
        shadowZY.children[0].remove(shadowZY.children[0].children[1]);
      }
    }
    if (
      Math.abs(pointCurent1.z) > 2 ||
      pointCurent1.y > 6 ||
      pointCurent2.y > 6 ||
      Math.abs(pointCurent2.x) > 3
    ) {
      app.TBlockS.children[0].children[0].material.color.setHex(wrongColor);
      app.TBlockS.children[0].children[1].material.color.setHex(wrongColor);
    }
    TWEEN.removeAll();
    const current = { opacity: 0.4 };
    const tween = new TWEEN.Tween(current)
      .to({ opacity: 0.05 }, 1000)
      .easing(TWEEN.Easing.Elastic.InOut)
      .repeat(Infinity)
      .yoyo(true);

    if (
      app.TBlockS.children[0].children[1].material.color.getHex() == wrongColor
    ) {
      tween.start();
      tween.onUpdate(() => {
        app.TBlockS.children[0].children[0].material.opacity = current.opacity;
        app.TBlockS.children[0].children[1].material.opacity = current.opacity;
        shadowXY.children[0].material.opacity = current.opacity;
        shadowZY.children[0].children[0].material.opacity = current.opacity;
        if (shadowZY.children[0].children[1] !== undefined) {
          shadowZY.children[0].children[1].material.opacity = current.opacity;
        }
      });
    } else {
      tween.stop();
    }
  }
  checkShadowZ(shadowXY, shadowZY) {
    let pointXY1M = new THREE.Vector3();
    let pointXY2M = new THREE.Vector3();

    app.ZBlockS.children[0].children[0].getWorldPosition(pointCurent1);
    app.ZBlockS.children[0].children[1].getWorldPosition(pointCurent2);
    //XY plane shadow trasnform
    pointXY1M.x = parseFloat(pointCurent1.x.toFixed(1));
    pointXY1M.y = parseFloat(pointCurent1.y.toFixed(1));
    pointXY1M.z = -4;
    pointXY2M.x = pointCurent2.x.toFixed(1);
    pointXY2M.y = pointCurent2.y.toFixed(1);
    pointXY2M.z = -4;

    if (pointXY1M.y == pointXY2M.y) {
      if (app.removedXYPieceZ.length === 0) {
        app.removedXYPieceZ.push(shadowXY.children[0].children[1]);
        app.removedXYPieceZ.push(shadowXY.children[0].children[2]);

        shadowXY.children[0].remove(shadowXY.children[0].children[2]);
        shadowXY.children[0].remove(shadowXY.children[0].children[1]);
      }
    } else {
      if (pointXY1M.y < pointXY2M.y) {
        if (app.removedXYPieceZ.length > 0) {
          app.removedXYPieceZ[0].position.copy(pointXY2M);
          app.removedXYPieceZ[1].position.set(
            pointXY1M.x,
            pointXY1M.y - 1,
            pointXY2M.z
          );
          shadowXY.children[0].attach(app.removedXYPieceZ[0]);
          shadowXY.children[0].attach(app.removedXYPieceZ[1]);
          app.removedXYPieceZ.length = 0;
        }
      } else if (pointXY1M.y > pointXY2M.y) {
        if (app.removedXYPieceZ.length > 0) {
          app.removedXYPieceZ[0].position.copy(pointXY2M);
          app.removedXYPieceZ[1].position.set(
            pointXY1M.x,
            pointCurent1.y + 1,
            pointXY2M.z
          );
          console.log(app.removedXYPieceZ[1].position);
          shadowXY.children[0].attach(app.removedXYPieceZ[0]);
          shadowXY.children[0].attach(app.removedXYPieceZ[1]);
          app.removedXYPieceZ.length = 0;
        }
      }
    }

    if (
      Math.abs(pointCurent2.x) > 3 ||
      pointCurent1.y > 6 ||
      pointCurent2.y > 6 ||
      Math.abs(pointCurent1.z) > 3 ||
      Math.abs(pointCurent2.z) > 3
    ) {
      app.ZBlockS.children[0].children[0].material.color.setHex(wrongColor);
      app.ZBlockS.children[0].children[1].material.color.setHex(wrongColor);
    }
    if (pointXY1M.y == pointXY2M.y && pointCurent1.z > 2) {
      app.ZBlockS.children[0].children[0].material.color.setHex(wrongColor);
      app.ZBlockS.children[0].children[1].material.color.setHex(wrongColor);
    }
    TWEEN.removeAll();
    const current = { opacity: 0.4 };
    const tween = new TWEEN.Tween(current)
      .to({ opacity: 0.05 }, 1000)
      .easing(TWEEN.Easing.Elastic.InOut)
      .repeat(Infinity)
      .yoyo(true);

    if (
      app.ZBlockS.children[0].children[1].material.color.getHex() == wrongColor
    ) {
      tween.start();
      tween.onUpdate(() => {
        app.ZBlockS.children[0].children[0].material.opacity = current.opacity;
        app.ZBlockS.children[0].children[1].material.opacity = current.opacity;
        shadowZY.children[0].children[0].material.opacity = current.opacity;
        shadowXY.children[0].children[0].material.opacity = current.opacity;
        if (shadowXY.children[0].children[1] !== undefined) {
          shadowXY.children[0].children[1].material.opacity = current.opacity;
          shadowXY.children[0].children[2].material.opacity = current.opacity;
        }
      });
    } else {
      tween.stop();
    }
  }

  _onMouseMoveL(event) {
    app.mouse.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    //create raycaster
    app.raycaster.setFromCamera(app.mouse, app.camera);
    const intersects = app.raycaster.intersectObjects(app.allObjects, true);
    if (app.LSelected) {
      if (intersects.length > 0) {
        //if have touched, get the first one
        app.LBlockS.children[0].children[0].material.needsUpdate = true;
        app.LBlockS.children[0].children[1].material.needsUpdate = true;
        app.LBlockS.children[0].children[0].material.color.setHex(LrightColor);
        app.LBlockS.children[0].children[1].material.color.setHex(LrightColor);
        //only need to place above plane and the highlight only exist on XZ plane.
        const intersect = intersects[0];
        intersect.point.y = Math.floor(Math.abs(intersect.point.y));

        app.LBlockS.position.copy(intersect.point);
        app.LBlockS.position.floor().addScalar(0.5);
        app.LBlockS.updateMatrixWorld();
        //check valid or not, change color
        for (let i = 0; i < app.allObjects.length; i++) {
          if (app.allObjects[i].type == 'Mesh') {
            //dont test against the plane, other blocks are object3D
            continue;
          }
          if (this.checkCollision(app.LBlockS.children[0], app.allObjects[i])) {
            app.LBlockS.children[0].children[0].material.color.setHex(
              wrongColor
            );
            app.LBlockS.children[0].children[1].material.color.setHex(
              wrongColor
            );
          }
        }
        this.checkShadowL(app.LShadowXY, app.LShadowZY);
        app.LBlockS.children[0].children[0].getWorldPosition(pointCurent1);
        app.LBlockS.children[0].children[1].getWorldPosition(pointCurent2);
        pointXY1M.x = parseFloat(pointCurent1.x.toFixed(1));
        pointXY1M.y = pointCurent1.y;
        pointXY1M.z = 0;

        pointZY1M.x = parseFloat (- pointCurent1.z.toFixed(1));
        pointZY1M.y = pointCurent1.y;
        pointZY1M.z = 0;

        app.LShadowXY.position.copy(pointXY1M);
        app.LShadowZY.position.copy(pointZY1M);
      }
    }
  }

  _onMouseMoveT(event) {
    app.mouse.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    //create raycaster
    app.raycaster.setFromCamera(app.mouse, app.camera);
    const intersects = app.raycaster.intersectObjects(app.allObjects, true);
    if (app.TSelected) {
      if (intersects.length > 0) {
        app.TBlockS.children[0].children[0].material.needsUpdate = true;
        app.TBlockS.children[0].children[1].material.needsUpdate = true;
        app.TBlockS.children[0].children[0].material.color.setHex(TrightColor);
        app.TBlockS.children[0].children[1].material.color.setHex(TrightColor);
        app.TBlockS.children[0].children[0].getWorldPosition(pointCurent1);
        app.TBlockS.children[0].children[1].getWorldPosition(pointCurent2);

        const intersect = intersects[0];

        intersect.point.y = Math.floor(Math.abs(intersect.point.y));
        if (
          parseFloat(pointCurent1.y.toFixed(1)) >
          parseFloat(pointCurent2.y.toFixed(1))
        ) {
          app.TBlockS.position.set(
            intersect.point.x,
            intersect.point.y + 1,
            intersect.point.z
          );
        } else {
          app.TBlockS.position.copy(intersect.point);
        }
        app.TBlockS.position.floor().addScalar(0.5);

        app.TBlockS.updateMatrixWorld();

        for (let i = 0; i < app.allObjects.length; i++) {
          if (app.allObjects[i].type == 'Mesh') {
            continue;
          }
          if (this.checkCollision(app.TBlockS.children[0], app.allObjects[i])) {
            app.TBlockS.children[0].children[0].material.color.setHex(
              wrongColor
            );
            app.TBlockS.children[0].children[1].material.color.setHex(
              wrongColor
            );
          }
        }
        this.checkShadowT(app.TShadowXY, app.TShadowZY);

        pointXY1M.x = parseFloat(pointCurent1.x.toFixed(1));
        pointXY1M.y = pointCurent1.y - 3;
        pointXY1M.z = 0;

        pointZY1M.x = parseFloat (- pointCurent1.z.toFixed(1));
        pointZY1M.y = pointCurent1.y;
        pointZY1M.z = 0;

        app.TShadowXY.position.copy(pointXY1M);
        app.TShadowZY.position.copy(pointZY1M);
      }
    }
  }

  _onMouseMoveZ(event) {
    app.mouse.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    app.raycaster.setFromCamera(app.mouse, app.camera);
    const intersects = app.raycaster.intersectObjects(app.allObjects, true);

    if (app.ZSelected) {
      if (intersects.length > 0) {
        app.ZBlockS.children[0].children[0].material.needsUpdate = true;
        app.ZBlockS.children[0].children[1].material.needsUpdate = true;
        app.ZBlockS.children[0].children[0].material.color.setHex(ZrightColor);
        app.ZBlockS.children[0].children[1].material.color.setHex(ZrightColor);

        let pointCurent1 = new THREE.Vector3();
        let pointCurent2 = new THREE.Vector3();
        app.ZBlockS.children[0].children[0].getWorldPosition(pointCurent1);
        app.ZBlockS.children[0].children[1].getWorldPosition(pointCurent2);
        const intersect = intersects[0];

        intersect.point.y = Math.floor(Math.abs(intersect.point.y));

        if (
          parseFloat(pointCurent1.y.toFixed(1)) <
          parseFloat(pointCurent2.y.toFixed(1))
        ) {
          app.ZBlockS.position.set(
            intersect.point.x,
            intersect.point.y + 1,
            intersect.point.z
          );
        } else if (
          parseFloat(pointCurent1.y.toFixed(1)) >
          parseFloat(pointCurent2.y.toFixed(1))
        ) {
          if (intersect.point.y > 0) {
            app.ZBlockS.position.copy(intersect.point);
          } else if (intersect.point.y == 0) {
            app.ZBlockS.position.set(
              intersect.point.x,
              intersect.point.y + 1,
              intersect.point.z
            );
          }
        } else if (
          parseFloat(pointCurent1.y.toFixed(1)) ==
          parseFloat(pointCurent2.y.toFixed(1))
        ) {
          app.ZBlockS.position.copy(intersect.point);
        }
        app.ZBlockS.position.floor().addScalar(0.5);
        app.ZBlockS.updateMatrixWorld();

        for (let i = 0; i < app.allObjects.length; i++) {
          if (app.allObjects[i].type == 'Mesh') {
            continue;
          }
          if (this.checkCollision(app.ZBlockS.children[0], app.allObjects[i])) {
            app.ZBlockS.children[0].children[0].material.color.setHex(
              wrongColor
            );
            app.ZBlockS.children[0].children[1].material.color.setHex(
              wrongColor
            );
          }
        }

        this.checkShadowZ(app.ZShadowXY, app.ZShadowZY);

        pointXY1M.x = parseFloat(pointCurent1.x.toFixed(1));
        pointXY1M.y = pointCurent1.y - 3;
        pointXY1M.z = 0;

        pointZY1M.x = parseFloat (- pointCurent1.z.toFixed(1));
        pointZY1M.y = pointCurent1.y - 3;
        pointZY1M.z = 0;

        app.ZShadowXY.position.copy(pointXY1M);
        app.ZShadowZY.position.copy(pointZY1M);
      }
    }
  }

  _onMouseDownL(event) {
    event.preventDefault();
    const intersects = app.raycaster.intersectObjects(app.allObjects, true);

    if (app.LSelected) {
      const wrongColor = 0xff0000;
      app.LBlockC = new LBlock().addToSpace();
      app.LBlockC.setRotationFromQuaternion(app.LcurrentRotation);
      app.LBlockC.updateMatrixWorld();

      app.LShadowCXY = new LBlock().addShadowXY();
      app.LShadowCZY = new LBlock().addShadowZY();
      app.LShadowCZY.rotateY(-Math.PI / 2);

      if (intersects.length > 0) {
        //only need to place above plane and the highlight only exist on XZ plane.
        const intersect = intersects[0];
        intersect.point.y = Math.floor(Math.abs(intersect.point.y));
        app.LBlockC.position.copy(intersect.point);
        app.LBlockC.position.floor().addScalar(0.5);
        app.LBlockC.updateMatrixWorld();

        let pointXY1M = new THREE.Vector3();
        let pointXY2M = new THREE.Vector3();
        let pointZY1M = new THREE.Vector3();
        let pointZY2M = new THREE.Vector3();

        let pointCurent1 = new THREE.Vector3();
        let pointCurent2 = new THREE.Vector3();

        app.LBlockC.children[0].children[0].getWorldPosition(pointCurent1);
        app.LBlockC.children[0].children[1].getWorldPosition(pointCurent2);
        //XY plane shadow trasnform
        pointXY1M.x = parseFloat(pointCurent1.x.toFixed(1));
        pointXY1M.y = pointCurent1.y;
        pointXY1M.z = 0;
        pointXY2M.x = parseFloat(pointCurent2.x.toFixed(1));

        if (pointXY1M.x == pointXY2M.x) {
          app.LShadowCXY.children[0].remove(
            app.LShadowCXY.children[0].children[1]
          );
          app.LShadowCXY.position.copy(pointXY1M);
          let point1 = this.shadowCenterPoint.clone();
          let point2 = this.shadowCenterPoint.clone();
          let point3 = this.shadowCenterPoint.clone();
          point1.x = pointXY1M.x;
          point1.y = pointXY1M.y;
          point1.z = -4;
          point2.x = pointXY1M.x;
          point2.y = pointXY1M.y + 1;
          point2.z = -4;
          point3.x = pointXY1M.x;
          point3.y = pointXY1M.y + 2;
          point3.z = -4;


          //console.log(point1.equals(point1));
          let temArray1 = [];
          temArray1.push(point1, point2, point3);
          let length = app.receivedShadowsXY.length;

          if (length === 0) {
            app.receivedShadowsXY.push(point1, point2, point3);
          } else {
            for (let j = 0; j < temArray1.length; j++) {
              for (let i = 0; i < length; i++) {
                  console.log(temArray1[j], app.receivedShadowsXY[i]);
                if (temArray1[j].ealuals(app.recivedShadowsXY[i])) {
                  break;
                }
                if (
                  !temArray1[j].ealuals(app.recivedShadowsXY[i]) &&
                  j === recivedShadowsXY.length - 1
                ) {
                  app.receivedShadowsXY.push(temArray1[j]);
                }
              }
            }
          }
          temArray1.length === 0;

          //console.log(app.LShadowCXY.getWorldPosition());
        } else {
          app.LShadowCXY.position.copy(pointXY1M);
          let point1 = this.shadowCenterPoint.clone();
          let point2 = this.shadowCenterPoint.clone();
          let point3 = this.shadowCenterPoint.clone();
          let point4 = this.shadowCenterPoint.clone();
          point1.x = pointXY1M.x;
          point1.y = pointXY1M.y;
          point1.z = -4;
          point2.x = pointXY1M.x;
          point2.y = pointXY1M.y + 1;
          point2.z = -4;
          point3.x = pointXY1M.x;
          point3.y = pointXY1M.y + 2;
          point3.z = -4;
          point4.x = pointXY2M.x;
          point4.y = pointXY1M.y;
          point4.z = -4;
          let temArray2 = [];
          temArray2.push(point1, point2, point3, point4);
          let length = app.receivedShadowsXY.length;

          if (length === 0) {
            app.receivedShadowsXY.push(point1, point2, point3, point4);
          } else {
            for (let j = 0; j < temArray2.length; j++) {
              for (let i = 0; i < length; i++) {
                 if (temArray2[j].ealuals(app.recivedShadowsXY[i])) {
                   break;
                 }
                 if (
                   !temArray2[j].ealuals(app.recivedShadowsXY[i]) &&
                   j === recivedShadowsXY.length - 1
                 ) {
                   app.receivedShadowsXY.push(temArray2[j]);
                 }
              }
            }
          }
          temArray2.length == 0;

          app.LShadowCXY.setRotationFromQuaternion(app.LcurrentRotation);
          console.log(app.LShadowCXY.children[0].children[1].position);
          app.LShadowCXY.updateMatrixWorld();
        }

        console.log(app.receivedShadowsXY);

        //ZY plane shadow trasnform
        pointZY1M.x = parseFloat(-pointCurent1.z.toFixed(1));
        pointZY1M.y = pointCurent1.y;
        pointZY1M.z = 0;
        pointZY2M.x = -pointCurent2.z.toFixed(1);

        if (pointZY1M.x == pointZY2M.x) {
          app.LShadowCZY.children[0].remove(
            app.LShadowCZY.children[0].children[1]
          );
          app.LShadowCZY.position.copy(pointZY1M);
          //console.log(app.LShadowCZY.position);
        } else {
          app.LShadowCZY.position.copy(pointZY1M);
          //console.log(app.LShadowCZY.position);
          app.LShadowCZY.setRotationFromQuaternion(app.LcurrentRotation);
          app.LShadowCZY.rotateY(-Math.PI);
          app.LShadowCZY.updateMatrixWorld();
        }
        if (
          app.LBlockS.children[0].children[0].material.color.getHex() ==
          wrongColor
        ) {
          return;
        }
        app.planeXY.add(app.LShadowCXY);
        app.planeZY.add(app.LShadowCZY);
        app.planeXZ.add(app.LBlockC);
        app.allObjects.push(app.LBlockC.children[0]);

        app.receivedShadowsZY.push(app.LShadowCZY.children[0]);

        //console.log(app.LShadowCXY.children[0]);
        console.log(app.LShadowCXY.getWorldPosition());
        //console.log(app.LShadowCZY.getWorldPosition());
        // console.log(this.receivedShadowsXY.children[0].getWorldPosition());
      }
    } else {
      return;
    }
  }

  _onMouseDownT(event) {
    event.preventDefault();
    const intersects = app.raycaster.intersectObjects(app.allObjects, true);

    if (app.TSelected) {
      const wrongColor = 0xff0000;
      app.TBlockC = new TBlock().addToSpace();
      app.TBlockC.setRotationFromQuaternion(app.TcurrentRotation);
      app.TBlockC.updateMatrixWorld();

      app.TShadowCXY = new TBlock().addShadowXY();
      app.TShadowCZY = new TBlock().addShadowZY();
      app.TShadowCZY.rotateY(-Math.PI / 2);

      let pointC1 = new THREE.Vector3();
      let pointC2 = new THREE.Vector3();
      app.TBlockS.children[0].children[0].getWorldPosition(pointC1);
      app.TBlockS.children[0].children[1].getWorldPosition(pointC2);

      if (intersects.length > 0) {
        //only need to place above plane and the highlight only exist on XZ plane.
        const intersect = intersects[0];
        intersect.point.y = Math.floor(Math.abs(intersect.point.y));
        if (pointC1.y.toFixed(1) > pointC2.y.toFixed(1)) {
          app.TBlockC.position.set(
            intersect.point.x,
            intersect.point.y + 1,
            intersect.point.z
          );
        } else {
          app.TBlockC.position.copy(intersect.point);
        }
        app.TBlockC.position.floor().addScalar(0.5);
        app.TBlockC.updateMatrixWorld();

        let pointXY1M = new THREE.Vector3();
        let pointZY1M = new THREE.Vector3();
        let pointCurent1 = new THREE.Vector3();
        let pointCurent2 = new THREE.Vector3();

        app.TBlockC.children[0].children[0].getWorldPosition(pointCurent1);
        app.TBlockC.children[0].children[1].getWorldPosition(pointCurent2);

        pointXY1M.x = parseFloat(pointCurent1.x.toFixed(1));
        pointXY1M.y = pointCurent1.y - 3;
        pointXY1M.z = 0;

        app.TShadowCXY.position.copy(pointXY1M);
        app.TShadowCXY.setRotationFromQuaternion(app.TcurrentRotation1);

        pointZY1M.x = parseFloat(- pointCurent1.z.toFixed(1));
        pointZY1M.y = parseFloat(pointCurent1.y.toFixed(1));
        pointZY1M.z = 0;
        if (
          parseFloat(pointCurent2.y.toFixed(1)) ==
          parseFloat(pointCurent1.y.toFixed(1))
        ) {
          app.TShadowCZY.children[0].remove(
            app.TShadowCZY.children[0].children[1]
          );
          app.TShadowCZY.position.set(
            pointZY1M.x,
            pointZY1M.y + 3,
            pointZY1M.z
          );
        } else if (
          parseFloat(pointCurent2.y.toFixed(1)) >
          parseFloat(pointCurent1.y.toFixed(1))
        ) {
          app.TShadowCZY.position.copy(pointZY1M);
        } else if (
          parseFloat(pointCurent2.y.toFixed(1)) <
          parseFloat(pointCurent1.y.toFixed(1))
        ) {
          app.TShadowCZY.rotateX(-Math.PI);
          app.TShadowCZY.position.set(
            pointZY1M.x,
            pointZY1M.y - 6,
            pointZY1M.z
          );
        }
        app.TShadowCZY.updateMatrixWorld();
        //app.TShadowCZY.copy(app.TShadowZY);

        if (
          app.TBlockS.children[0].children[0].material.color.getHex() ==
          wrongColor
        ) {
          return;
        }
        app.planeXY.add(app.TShadowCXY);
        app.planeZY.add(app.TShadowCZY);
        app.planeXZ.add(app.TBlockC);
        app.allObjects.push(app.TBlockC.children[0]);
        app.receivedShadowsXY.push(app.TShadowCXY.children[0]);
        app.receivedShadowsZY.push(app.TShadowCZY.children[0]);
      }
    } else {
      return;
    }
  }

  _onMouseDownZ(event) {
    event.preventDefault();
    const intersects = app.raycaster.intersectObjects(app.allObjects, true);

    if (app.ZSelected) {
      const wrongColor = 0xff0000;
      app.ZBlockC = new ZBlock().addToSpace();
      app.ZBlockC.setRotationFromQuaternion(app.ZcurrentRotation);
      app.ZBlockC.updateMatrixWorld();

      app.ZShadowCXY = new ZBlock().addShadowXY();
      app.ZShadowCZY = new ZBlock().addShadowZY();

      let pointC1 = new THREE.Vector3();
      let pointC2 = new THREE.Vector3();
      app.ZBlockS.children[0].children[0].getWorldPosition(pointC1);
      app.ZBlockS.children[0].children[1].getWorldPosition(pointC2);

      if (intersects.length > 0) {
        const intersect = intersects[0];
        intersect.point.y = Math.floor(Math.abs(intersect.point.y));
        if (pointC1.y.toFixed(1) < pointC2.y.toFixed(1)) {
          app.ZBlockC.position.set(
            intersect.point.x,
            intersect.point.y + 1,
            intersect.point.z
          );
        } else if (pointC1.y.toFixed(1) > pointC2.y.toFixed(1)) {
          if (intersect.point.y > 0) {
            app.ZBlockC.position.copy(intersect.point);
          } else if (intersect.point.y == 0) {
            app.ZBlockC.position.set(
              intersect.point.x,
              intersect.point.y + 1,
              intersect.point.z
            );
          }
        } else if (pointC1.y.toFixed(1) == pointC2.y.toFixed(1)) {
          app.ZBlockC.position.copy(intersect.point);
        }
        app.ZBlockC.position.floor().addScalar(0.5);
        app.ZBlockC.updateMatrixWorld();

        let pointXY1M = new THREE.Vector3();
        let pointXY2M = new THREE.Vector3();
        let pointZY1M = new THREE.Vector3();
        let pointCurent1 = new THREE.Vector3();
        let pointCurent2 = new THREE.Vector3();

        app.ZBlockC.children[0].children[0].getWorldPosition(pointCurent1);
        app.ZBlockC.children[0].children[1].getWorldPosition(pointCurent2);

        pointXY1M.x = pointCurent1.x;
        pointXY1M.y = pointCurent1.y - 3;
        pointXY1M.z = 0;

        pointXY2M.x = pointCurent2.x;
        pointXY2M.y = pointCurent2.y - 3;
        pointXY2M.z = 0;

        pointZY1M.x = -pointCurent1.z;
        pointZY1M.y = pointCurent1.y - 3;
        pointZY1M.z = 0;

        if (pointXY1M.y < pointXY2M.y) {
          app.ZShadowCXY.position.copy(pointXY1M);
        }
        if (pointXY1M.y == pointXY2M.y) {
          app.ZShadowCXY.children[0].remove(
            app.ZShadowCXY.children[0].children[1],
            app.ZShadowCXY.children[0].children[2]
          );
          app.ZShadowCXY.position.copy(pointXY1M);
        }
        if (pointXY1M.y > pointXY2M.y) {
          app.ZShadowCXY.rotateY(Math.PI);
          app.ZShadowCXY.position.set(
            pointXY1M.x + 1,
            pointXY1M.y,
            pointXY1M.z
          );
        }

        app.ZShadowCZY.copy(app.ZShadowZY);
        app.ZShadowCZY.position.copy(pointZY1M);

        if (
          app.ZBlockS.children[0].children[0].material.color.getHex() ==
          wrongColor
        ) {
          return;
        }
        app.planeXY.add(app.ZShadowCXY);
        app.planeZY.add(app.ZShadowCZY);
        app.planeXZ.add(app.ZBlockC);
        app.allObjects.push(app.ZBlockC.children[0]);
        app.receivedShadowsXY.push(app.ZShadowCXY.children[0]);
        app.receivedShadowsZY.push(app.ZShadowCZY.children[0]);
      }
    } else {
      return;
    }
  }

  _onKeyDownL(event) {
    if (app.LSelected) {
      const rightColor = 0x00a9fe;
      const wrongColor = 0xff0000;
      app.LBlockS.children[0].children[0].material.needsUpdate = true;
      app.LBlockS.children[0].children[1].material.needsUpdate = true;
      app.LBlockS.children[0].children[0].material.color.setHex(rightColor);
      app.LBlockS.children[0].children[1].material.color.setHex(rightColor);
      switch (event.key) {
        case 'ArrowLeft':
          app.LBlockS.rotateY(-Math.PI / 2);
          app.LBlockS.updateMatrixWorld();
          this.checkShadowL(app.LShadowXY, app.LShadowZY);
          app.LBlockS.getWorldQuaternion(app.LcurrentRotation);
          //check valid or not, change color
          for (let i = 0; i < app.allObjects.length; i++) {
            if (app.allObjects[i].type == 'Mesh') {
              //dont test against the plane, other blocks are object3D
              continue;
            }
            if (
              this.checkCollision(app.LBlockS.children[0], app.allObjects[i])
            ) {
              app.LBlockS.children[0].children[0].material.color.setHex(
                wrongColor
              );
              app.LBlockS.children[0].children[1].material.color.setHex(
                wrongColor
              );
            }
          }

          break;
        case 'ArrowRight':
          app.LBlockS.rotateY(Math.PI / 2);
          app.LBlockS.updateMatrixWorld();
          this.checkShadowL(app.LShadowXY, app.LShadowZY);
          //check valid or not, change color
          for (let i = 0; i < app.allObjects.length; i++) {
            if (app.allObjects[i].type == 'Mesh') {
              //dont test against the plane, other blocks are object3D
              continue;
            }
            if (
              this.checkCollision(app.LBlockS.children[0], app.allObjects[i])
            ) {
              app.LBlockS.children[0].children[0].material.color.setHex(
                wrongColor
              );
              app.LBlockS.children[0].children[1].material.color.setHex(
                wrongColor
              );
            }
          }
          app.LBlockS.getWorldQuaternion(app.LcurrentRotation);
          break;
      }
    }
  }

  _onKeyDownT(event) {
    if (app.TSelected) {
      const rightColor = 0xfc6e22;
      const wrongColor = 0xff0000;
      app.TBlockS.children[0].children[0].material.needsUpdate = true;
      app.TBlockS.children[0].children[1].material.needsUpdate = true;
      app.TBlockS.children[0].children[0].material.color.setHex(rightColor);
      app.TBlockS.children[0].children[1].material.color.setHex(rightColor);

      switch (event.key) {
        case 'ArrowLeft':
          app.TBlockS.rotateZ(-Math.PI / 2);
          app.TShadowXY.rotateZ(-Math.PI / 2);
          app.TBlockS.updateMatrixWorld();
          app.TShadowXY.updateMatrixWorld();
          app.TShadowXY.getWorldQuaternion(app.TcurrentRotation1);
          this.checkShadowT(app.TShadowXY, app.TShadowZY);
          app.TBlockS.getWorldQuaternion(app.TcurrentRotation);

          for (let i = 0; i < app.allObjects.length; i++) {
            if (app.allObjects[i].type == 'Mesh') {
              //dont test against the plane, other blocks are object3D
              continue;
            }
            if (
              this.checkCollision(app.TBlockS.children[0], app.allObjects[i])
            ) {
              app.TBlockS.children[0].children[0].material.color.setHex(
                wrongColor
              );
              app.TBlockS.children[0].children[1].material.color.setHex(
                wrongColor
              );
            }
          }
          break;
        case 'ArrowRight':
          app.TBlockS.rotateZ(Math.PI / 2);
          app.TShadowXY.rotateZ(Math.PI / 2);
          app.TBlockS.updateMatrixWorld();
          app.TShadowXY.getWorldQuaternion(app.TcurrentRotation1);
          this.checkShadowT(app.TShadowXY, app.TShadowZY);
          app.TBlockS.getWorldQuaternion(app.TcurrentRotation);
          //check valid or not, change color
          for (let i = 0; i < app.allObjects.length; i++) {
            if (app.allObjects[i].type == 'Mesh') {
              //dont test against the plane, other blocks are object3D
              continue;
            }
            if (
              this.checkCollision(app.TBlockS.children[0], app.allObjects[i])
            ) {
              app.TBlockS.children[0].children[0].material.color.setHex(
                wrongColor
              );
              app.TBlockS.children[0].children[1].material.color.setHex(
                wrongColor
              );
            }
          }

          break;
      }
    }
  }

  _onKeyDownZ(event) {
    if (app.ZSelected) {
      const rightColor = 0xb537f2;
      const wrongColor = 0xff0000;
      app.ZBlockS.children[0].children[0].material.needsUpdate = true;
      app.ZBlockS.children[0].children[1].material.needsUpdate = true;
      app.ZBlockS.children[0].children[0].material.color.setHex(rightColor);
      app.ZBlockS.children[0].children[1].material.color.setHex(rightColor);

      switch (event.key) {
        case 'ArrowLeft':
          app.ZBlockS.rotateX(-Math.PI / 2);
          app.ZShadowZY.rotateX(-Math.PI / 2);
          app.ZBlockS.updateMatrixWorld();
          app.ZShadowZY.updateMatrixWorld();
          app.ZShadowZY.getWorldQuaternion(app.ZcurrentRotation1);
          this.checkShadowZ(app.ZShadowXY, app.ZShadowZY);
          app.ZBlockS.getWorldQuaternion(app.ZcurrentRotation);

          for (let i = 0; i < app.allObjects.length; i++) {
            if (app.allObjects[i].type == 'Mesh') {
              continue;
            }
            if (
              this.checkCollision(app.ZBlockS.children[0], app.allObjects[i])
            ) {
              app.ZBlockS.children[0].children[0].material.color.setHex(
                wrongColor
              );
              app.ZBlockS.children[0].children[1].material.color.setHex(
                wrongColor
              );
            }
          }
          break;
        case 'ArrowRight':
          app.ZBlockS.rotateX(Math.PI / 2);
          app.ZShadowZY.rotateX(Math.PI / 2);
          app.ZShadowZY.updateMatrixWorld();
          app.ZShadowZY.getWorldQuaternion(app.ZcurrentRotation1);
          app.ZBlockS.updateMatrixWorld();
          this.checkShadowZ(app.ZShadowXY, app.ZShadowZY);
          app.ZBlockS.getWorldQuaternion(app.ZcurrentRotation);
          for (let i = 0; i < app.allObjects.length; i++) {
            if (app.allObjects[i].type == 'Mesh') {
              continue;
            }
            if (
              this.checkCollision(app.ZBlockS.children[0], app.allObjects[i])
            ) {
              app.ZBlockS.children[0].children[0].material.color.setHex(
                wrongColor
              );
              app.ZBlockS.children[0].children[1].material.color.setHex(
                wrongColor
              );
            }
          }

          break;
      }
    }
  }
}
export { Inputs };
