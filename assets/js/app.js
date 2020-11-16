import * as THREE from './libs/three/three.module.js';

import { OrbitControls } from './libs/three/jsm/OrbitControls.js';
import { BoxLineGeometry } from './libs/three/jsm/BoxLineGeometry.js';
import { XRControllerModelFactory } from './libs/three/jsm/XRControllerModelFactory.js';

import { Stats } from './libs/stats.module.js';

//import conponents

import { VRButton } from './VRButton.js';
import { LBlock } from './lShape.js';

class App {
  constructor() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    this.clock = new THREE.Clock();
    //camera setting:
    //perspectiveCamera(FOV(left-right degree), aspect ratio(view's width/height), near, far)
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    //move camera nearer along Z axis
    this.camera.position.set(13, 8, 13);
    this.camera.lookAt(0, 0, 0);

    //Scene setting: default background is white 0xfe53bb
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);
    //Only have light can see the color of objects

    //add environment light (can't have shadows):
    //hemispherelight(Sky color, ground color, intensity)
    const environmentLight = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.3);
    this.scene.add(environmentLight);

    //add direct light from a position.
    const light = new THREE.DirectionalLight();
    light.position.set(0.2, 1, 0);
    this.scene.add(light);

    //Renderer setting:
    //antialias is for vr headset, otherwise will have bad edges
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    container.appendChild(this.renderer.domElement);

    //get mouse
    this.mouse = new THREE.Vector2();
    document.addEventListener(
      'mousemove',
      this.onDocumentMouseMove.bind(this),
      false
    );
    document.addEventListener(
      'mousedown',
      this.onDocumentMouseDown.bind(this),
      false
    );
    document.addEventListener(
      'keydown',
      this.roatetkeyPressed.bind(this),
      false
    );

    //drag page control
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.minDistance = 9;
    this.controls.maxDistance = 14;
    this.controls.keys = false;
    this.controls.target.set(0, 3, 0);
    this.controls.update();

    this.stats = new Stats();
    container.appendChild(this.stats.dom);

    //visuialize controllers
    this.raycaster = new THREE.Raycaster();
    this.workingMatrix = new THREE.Matrix4();
    this.workingVector = new THREE.Vector3();

    this.initScene();
    this.setupXR();

    window.addEventListener('resize', this.resize.bind(this));
    this.renderer.setAnimationLoop(this.render.bind(this));
  }

  initScene() {
    this.radius = 0.08;
    //XY plane
    const gridHelperXY = new THREE.GridHelper(6, 6);
    gridHelperXY.rotateX(Math.PI / 2);
    gridHelperXY.position.z = -4;
    gridHelperXY.position.y = 3;
    this.scene.add(gridHelperXY);

    const planeGeomXY = new THREE.PlaneBufferGeometry(6, 6);
    this.planeXY = new THREE.Mesh(
      planeGeomXY,
      new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        opacity: 0.5,
        transparent: true,
      })
    );
    this.planeXY.position.set(0, 3, -4);
    this.scene.add(this.planeXY);

    //ZY plane
    const gridHelperZY = new THREE.GridHelper(6, 6);
    gridHelperZY.rotateZ(-Math.PI / 2);
    gridHelperZY.position.x = -4;
    gridHelperZY.position.y = 3;
    this.scene.add(gridHelperZY);

    const planeGeomZY = new THREE.PlaneBufferGeometry(6, 6);
    this.planeZY = new THREE.Mesh(
      planeGeomZY,
      new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        opacity: 0.5,
        transparent: true,
      })
    );
    this.planeZY.rotateY(Math.PI / 2);
    this.planeZY.position.x = -4;
    this.planeZY.position.y = 3;
    this.scene.add(this.planeZY);

    //XZ plane
    const gridHelperXZ = new THREE.GridHelper(6, 6, 0xffffff, 0xffffff);
    this.scene.add(gridHelperXZ);
    const planeGeomXZ = new THREE.PlaneBufferGeometry(6, 6);
    planeGeomXZ.rotateX(-Math.PI / 2);
    planeGeomXZ.normalizeNormals();

    this.planeXZ = new THREE.Mesh(
      planeGeomXZ,
      new THREE.MeshBasicMaterial({
        color: 0xff0080,
        transparent: true,
        opacity: 0.5,
      })
    );
    this.planeXZPivot = new THREE.Group();
    this.planeXZPivot.add(this.planeXZ, gridHelperXZ);

    this.LBlockS = new LBlock().addSkeletonToSpace();
    this.currentRotation = new THREE.Quaternion();
    this.LBlockS.getWorldQuaternion(this.currentRotation);
    //console.log(this.currentRotation);

    this.removedXYPiece = [];
    this.LShadowXY = new LBlock().addShadowXY();
    this.LShadowXY.position.set(0, 3, -4);
    this.planeXY.attach(this.LShadowXY);

    this.removedZYPiece = [];
    this.LShadowZY = new LBlock().addShadowZY();
    this.removedZYPiece.push(this.LShadowZY.children[0].children[1]);
    this.LShadowZY.children[0].remove(this.LShadowZY.children[0].children[1]);
    this.LShadowZY.position.set(-4, 3, 0);
    this.planeZY.attach(this.LShadowZY);

    //raycaster array
    this.allObjects = [];

    this.scene.add(this.planeXZPivot);
    this.scene.add(this.LBlockS);
    this.allObjects.push(this.planeXZPivot.children[0]);
  }

  //using XR API in VRButton and call controllers
  //from building function

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

  checkShadow(shadowXY, shadowZY) {
    const wrongColor = 0xff0000;

    let pointXY1M = new THREE.Vector3();
    let pointXY2M = new THREE.Vector3();
    let pointZY1M = new THREE.Vector3();
    let pointZY2M = new THREE.Vector3();

    const pointCurent1 = new THREE.Vector3();
    const pointCurent2 = new THREE.Vector3();

    this.LBlockS.children[0].children[0].getWorldPosition(pointCurent1);
    this.LBlockS.children[0].children[1].getWorldPosition(pointCurent2);

    //XY plane shadow trasnform
    pointXY1M.x = pointCurent1.x.toFixed(1);
    pointXY1M.y = pointCurent1.y;
    pointXY1M.z = 0;
    pointXY2M.x = pointCurent2.x.toFixed(1);
    pointXY2M.y = pointCurent2.y;
    pointXY2M.z = 0;

    if (pointXY1M.x !== pointXY2M.x) {
      if (this.removedXYPiece.length > 0) {
        pointXY2M.z = pointXY2M.z - 4;
        this.removedXYPiece[0].position.copy(pointXY2M);
        shadowXY.children[0].attach(this.removedXYPiece[0]);
        this.removedXYPiece.length = 0;
      }
    } else {
      if (this.removedXYPiece.length === 0) {
        this.removedXYPiece.push(shadowXY.children[0].children[1]);
        shadowXY.children[0].remove(shadowXY.children[0].children[1]);
      }
    }
    //ZY plane shadow trasnform
    pointZY1M.x = -pointCurent1.z.toFixed(1);
    pointZY1M.y = pointCurent1.y;
    pointZY1M.z = 0;
    pointZY2M.x = -pointCurent2.z.toFixed(1);
    pointZY2M.y = pointCurent2.y;
    pointZY2M.z = 0;

    if (pointZY1M.x !== pointZY2M.x) {
      if (this.removedZYPiece.length > 0) {
        pointZY2M.x = -4;
        pointZY2M.z = pointCurent2.z;
        this.removedZYPiece[0].position.copy(pointZY2M);
        shadowZY.children[0].attach(this.removedZYPiece[0]);
        this.removedZYPiece.length = 0;
      }
    } else {
      if (this.removedZYPiece.length === 0) {
        this.removedZYPiece.push(shadowZY.children[0].children[1]);
        shadowZY.children[0].remove(shadowZY.children[0].children[1]);
      }
    }

    if (
      Math.abs(pointCurent2.x) > 3 ||
      Math.abs(pointCurent2.z) > 3 ||
      pointCurent1.y + 2 > 6
    ) {
      this.LBlockS.children[0].children[0].material.color.setHex(wrongColor);
      this.LBlockS.children[0].children[1].material.color.setHex(wrongColor);
    }

    TWEEN.removeAll();
    const current = {
      opacity: 0.4,
    };
    const tween = new TWEEN.Tween(current)
      .to({ opacity: 0.05 }, 1000)
      .easing(TWEEN.Easing.Elastic.InOut)
      .repeat(Infinity)
      .yoyo(true);

    if (
      this.LBlockS.children[0].children[1].material.color.getHex() == wrongColor
    ) {
      tween.start();
      tween.onUpdate(() => {
        this.LBlockS.children[0].children[0].material.opacity = current.opacity;
        this.LBlockS.children[0].children[1].material.opacity = current.opacity;

        this.LShadowXY.children[0].children[0].material.opacity =
          current.opacity;
        if (this.LShadowXY.children[0].children[1] !== undefined) {
          this.LShadowXY.children[0].children[1].material.opacity =
            current.opacity;
        }
        this.LShadowZY.children[0].children[0].material.opacity =
          current.opacity;
        if (this.LShadowZY.children[0].children[1] !== undefined) {
          this.LShadowZY.children[0].children[1].material.opacity =
            current.opacity;
        }
      });
    } else {
      tween.stop();
    }
  }

  onDocumentMouseMove(event) {
    event.preventDefault();

    let pointXY1M = new THREE.Vector3();
    let pointXY2M = new THREE.Vector3();
    let pointZY1M = new THREE.Vector3();
    let pointZY2M = new THREE.Vector3();
    const rightColor = 0x00a9fe;
    const wrongColor = 0xff0000;

    //let mouse is mouse position
    this.mouse.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
    //create raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera);
    //have a array to store all objects that been touched by ray
    const intersects = this.raycaster.intersectObjects(this.allObjects, true);
    //if have touched, get the first one
    if (intersects.length > 0) {
      this.LBlockS.children[0].children[0].material.needsUpdate = true;
      this.LBlockS.children[0].children[1].material.needsUpdate = true;
      this.LBlockS.children[0].children[0].material.color.setHex(rightColor);
      this.LBlockS.children[0].children[1].material.color.setHex(rightColor);
      //only need to place above plane and the highlight only exist on XZ plane.
      const intersect = intersects[0];
      let yValue = intersect.point.y;

      if (yValue < 0) {
        yValue = 0.3;
      } else {
        this.LBlockS.position.copy(intersect.point);
        this.LBlockS.position.floor().addScalar(0.5);
        this.LBlockS.updateMatrixWorld();
        //check valid or not, change color
        for (let i = 0; i < this.allObjects.length; i++) {
          if (this.allObjects[i].type == 'Mesh') {
            //dont test against the plane, other blocks are object3D
            continue;
          }
          if (
            this.checkCollision(this.LBlockS.children[0], this.allObjects[i])
          ) {
            this.LBlockS.children[0].children[0].material.color.setHex(
              wrongColor
            );
            this.LBlockS.children[0].children[1].material.color.setHex(
              wrongColor
            );
          }
        }

        this.checkShadow(this.LShadowXY, this.LShadowZY);

        const pointCurent1 = new THREE.Vector3();
        const pointCurent2 = new THREE.Vector3();
        this.LBlockS.children[0].children[0].getWorldPosition(pointCurent1);
        this.LBlockS.children[0].children[1].getWorldPosition(pointCurent2);

        pointXY1M.x = pointCurent1.x.toFixed(1);
        pointXY1M.y = pointCurent1.y;
        pointXY1M.z = 0;
        pointXY2M.x = pointCurent2.x.toFixed(1);
        pointXY2M.y = pointCurent2.y;
        pointXY2M.z = 0;

        pointZY1M.x = -pointCurent1.z.toFixed(1);
        pointZY1M.y = pointCurent1.y;
        pointZY1M.z = 0;
        pointZY2M.x = -pointCurent2.z.toFixed(1);
        pointZY2M.y = pointCurent2.y;
        pointZY2M.z = 0;
        this.LShadowXY.position.copy(pointXY1M);
        this.LShadowZY.position.copy(pointZY1M);
      }
    }
  }

  onDocumentMouseDown(event) {
    event.preventDefault();
    const wrongColor = 0xff0000;
    this.LBlockC = new LBlock().addCubeToSpace();
    this.LBlockC.setRotationFromQuaternion(this.currentRotation);
    this.LBlockC.updateMatrixWorld();

    this.LShadowCXY = new LBlock().addShadowXY();
    this.LShadowCZY = new LBlock().addShadowZY();
    this.LShadowCZY.rotateY(-Math.PI / 2);

    this.mouse.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.allObjects, true);

    if (intersects.length > 0) {
      //only need to place above plane and the highlight only exist on XZ plane.
      const intersect = intersects[0];
      let yValue = intersect.point.y;

      if (yValue < 0) {
        yValue = 0.3;
      } else {
        this.LBlockC.position.copy(intersect.point);
        this.LBlockC.position.floor().addScalar(0.5);
        this.LBlockC.updateMatrixWorld();

        let pointXY1M = new THREE.Vector3();
        let pointXY2M = new THREE.Vector3();
        let pointZY1M = new THREE.Vector3();
        let pointZY2M = new THREE.Vector3();

        let pointCurent1 = new THREE.Vector3();
        let pointCurent2 = new THREE.Vector3();

        this.LBlockC.children[0].children[0].getWorldPosition(pointCurent1);
        this.LBlockC.children[0].children[1].getWorldPosition(pointCurent2);
        //XY plane shadow trasnform
        pointXY1M.x = pointCurent1.x.toFixed(1);
        pointXY1M.y = pointCurent1.y;
        pointXY1M.z = 0;
        pointXY2M.x = pointCurent2.x.toFixed(1);

        if (pointXY1M.x == pointXY2M.x) {
          this.LShadowCXY.children[0].remove(
            this.LShadowCXY.children[0].children[1]
          );
          this.LShadowCXY.position.copy(pointXY1M);
        } else {
          this.LShadowCXY.position.copy(pointXY1M);
          this.LShadowCXY.setRotationFromQuaternion(this.currentRotation);
          this.LShadowCXY.updateMatrixWorld();
        }
        //ZY plane shadow trasnform
        pointZY1M.x = -pointCurent1.z.toFixed(1);
        pointZY1M.y = pointCurent1.y;
        pointZY1M.z = 0;
        pointZY2M.x = -pointCurent2.z.toFixed(1);

        if (pointZY1M.x == pointZY2M.x) {
          this.LShadowCZY.children[0].remove(
            this.LShadowCZY.children[0].children[1]
          );
          this.LShadowCZY.position.copy(pointZY1M);
        } else {
          this.LShadowCZY.position.copy(pointZY1M);
          this.LShadowCZY.setRotationFromQuaternion(this.currentRotation);
          this.LShadowCZY.rotateY(-Math.PI);
          this.LShadowCZY.updateMatrixWorld();
        }
        if (
          this.LBlockS.children[0].children[0].material.color.getHex() ==
          wrongColor
        ) {
          return;
        }
        this.planeXY.add(this.LShadowCXY);
        this.planeZY.add(this.LShadowCZY);
        this.planeXZ.add(this.LBlockC);
        this.allObjects.push(this.LBlockC.children[0]);
      }
    }
  }

  roatetkeyPressed(event) {
    event.preventDefault();

    const rightColor = 0x00a9fe;
    const wrongColor = 0xff0000;
    this.LBlockS.children[0].children[0].material.needsUpdate = true;
    this.LBlockS.children[0].children[1].material.needsUpdate = true;
    this.LBlockS.children[0].children[0].material.color.setHex(rightColor);
    this.LBlockS.children[0].children[1].material.color.setHex(rightColor);

    switch (event.key) {
      case 'ArrowLeft':
        this.LBlockS.rotateY(-Math.PI / 2);
        this.LBlockS.updateMatrixWorld();
        this.checkShadow(this.LShadowXY, this.LShadowZY);
        this.LBlockS.getWorldQuaternion(this.currentRotation);
        //check valid or not, change color
        for (let i = 0; i < this.allObjects.length; i++) {
          if (this.allObjects[i].type == 'Mesh') {
            //dont test against the plane, other blocks are object3D
            continue;
          }
          if (
            this.checkCollision(this.LBlockS.children[0], this.allObjects[i])
          ) {
            this.LBlockS.children[0].children[0].material.color.setHex(
              wrongColor
            );
            this.LBlockS.children[0].children[1].material.color.setHex(
              wrongColor
            );
          }
        }

        break;
      case 'ArrowRight':
        this.LBlockS.rotateY(Math.PI / 2);
        this.LBlockS.updateMatrixWorld();
        this.checkShadow(this.LShadowXY, this.LShadowZY);
        //check valid or not, change color
        for (let i = 0; i < this.allObjects.length; i++) {
          if (this.allObjects[i].type == 'Mesh') {
            //dont test against the plane, other blocks are object3D
            continue;
          }
          if (
            this.checkCollision(this.LBlockS.children[0], this.allObjects[i])
          ) {
            this.LBlockS.children[0].children[0].material.color.setHex(
              wrongColor
            );
            this.LBlockS.children[0].children[1].material.color.setHex(
              wrongColor
            );
          }
        }

        this.LBlockS.getWorldQuaternion(this.currentRotation);

        break;
    }
  }

  setupXR() {
    this.renderer.xr.enabled = true;
    const button = new VRButton(this.renderer);

    this.controllers = this.buildControllers();
  }

  //build controllers
  buildControllers() {
    //get from factory lib
    const controllerModelFactory = new XRControllerModelFactory();
    //set a line(raycast) from 000 to 00-1
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -1),
    ]);
    const line = new THREE.Line(lineGeometry);
    line.name = 'line';
    //expend to far away
    line.scale.z = 6;

    //read and load controllers based on devices and save it to controllers[]
    const controllers = [];
    for (let i = 0; i <= 1; i++) {
      const controller = this.renderer.xr.getController(i);
      //every controller has a line
      controller.add(line.clone());
      controller.userData.selectPressed = false;
      this.scene.add(controller);

      controllers.push(controller);

      const grip = this.renderer.xr.getControllerGrip(i);
      grip.add(controllerModelFactory.createControllerModel(grip));
      this.scene.add(grip);
    }
    return controllers;
  }

  resize() {
    //resize function
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    this.stats.update();
    this.renderer.render(this.scene, this.camera);
    TWEEN.update();
  }
}

export { App };
