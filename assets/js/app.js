import * as THREE from './libs/three/three.module.js';

import { OrbitControls } from './libs/three/jsm/OrbitControls.js';
import { XRControllerModelFactory } from './libs/three/jsm/XRControllerModelFactory.js';

import { Stats } from './libs/stats.module.js';

//import conponents

import { VRButton } from './VRButton.js';
import { Planes } from './planes.js';
import { LBlock } from './shapes/l-shape.js';
import { TBlock } from './shapes/t-shape.js';
import { ZBlock } from './shapes/z-shape.js';
import { Inputs } from './inputs.js';
import { Levels } from './level.js';


// import { LBlock, TBlock, ZBlock } from './shapes/'

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
    this.scene.background = new THREE.Color(0xfffff0);
    //Only have light can see the color of objects

    //add environment light (can't have shadows):
    //hemispherelight(Sky color, ground color, intensity)
    const environmentLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    this.scene.add(environmentLight);
    //0xffffbb, 0x080820, 1
    //0xffffff, 0xbbbbff, 0.3

    //add direct light from a position.
    const light = new THREE.DirectionalLight();
    light.position.set(0, 20, 0);
    this.scene.add(light);

    //Renderer setting:
    //antialias is for vr headset, otherwise will have bad edges
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(this.renderer.domElement);

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
    this.mouse = new THREE.Vector2();
    this.workingMatrix = new THREE.Matrix4();
    this.workingVector = new THREE.Vector3();

    //Init planes
    this.planeXYG = new Planes().addXY();
    this.planeXY = this.planeXYG.children[0];
    this.planeZYG = new Planes().addZY();
    this.planeZY = this.planeZYG.children[0];
    this.planeXZG = new Planes().addXZ();
    this.planeXZ = this.planeXZG.children[0];
    this.levelShdaowsXY = [];
    this.levelShdaowsZY = [];
    //shadow center points

    this.receivedShadowsXY = [];
    this.receivedShadowsZY = [];


    //raycaster array
    this.allObjects = [];
    this.allObjects.push(this.planeXZG.children[0]);

    // Init events
    this._onMouseMoves = [];
    this._onMouseDowns = [];
    this._onKeyDowns = [];
    this.BlocksControls = new Inputs(this);
    this._addEventListeners();

    this.LSelected = false;
    this.TSelected = false;
    this.ZSelected = false;
    this.BLOCKS = [];

    this.initScene();
    this.setupXR();

    window.addEventListener('resize', this.resize.bind(this));
    this.renderer.setAnimationLoop(this.render.bind(this));
  }

  initScene() {

    this.radius = 0.08;
    //XY plane
    this.ShadowXY1 = new Levels().addShadowXY(this);
    //console.log(this.ShadowXY1.children[1].getWorldPosition());

    this.planeXYG.add(this.ShadowXY1);
    this.scene.add(this.planeXYG);
    //ZY plane
     this.ShadowZY1 = new Levels().addShadowZY(this);
     //console.log(this.ShadowZY1.children[1].getWorldPosition());

     this.planeZYG.add(this.ShadowZY1);
    this.scene.add(this.planeZYG);
    //XZ plane
    this.scene.add(this.planeXZG);

    this.LBLOCK = new LBlock().addToSpace();
    this.LBLOCK.position.set(0, 3.4, 0);
    this.LBLOCK.rotateY(Math.PI / 2);
    this.LBLOCK.scale.set(0.5, 0.5, 0.5);

    this.TBLOCK = new TBlock().addToSpace();
    this.TBLOCK.rotateX(Math.PI / 2);
    this.TBLOCK.position.set(0, -4, 0);
    this.TBLOCK.scale.set(0.5, 0.5, 0.5);

    this.ZBLOCK = new ZBlock().addToSpace();
    this.ZBLOCK.position.set(0, 3.6, 0);
    this.ZBLOCK.rotateZ(Math.PI / 2);
    this.ZBLOCK.scale.set(0.5, 0.5, 0.5);

    const pointLight = new THREE.PointLight(0xffffff, 3, 800);
    this.powerLight = new THREE.Mesh(
      new THREE.SphereBufferGeometry(0.1, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    this.powerLight.add(pointLight);
    this.powerLight.position.y = 3;

    const Cygeometry = new THREE.CylinderBufferGeometry(0.1, 0.1, 7, 32);
    const materialX = new THREE.MeshPhongMaterial({
      color: 0x304281,
      specular: 0x111111,
      reflectivity: 1,
      shininess: 30,
    });
    const materialZ = new THREE.MeshPhongMaterial({
      color: 0x72d0b2,
      specular: 0x111111,
      reflectivity: 1,
      shininess: 30,
    });
    const materialY = new THREE.MeshPhongMaterial({
      color: 0x304281,
      specular: 0x111111,
      reflectivity: 1,
      shininess: 30,
      opacity: 1,
      transparent: true,
    });

    const CygeometryY = new THREE.CylinderBufferGeometry(
      0.1,
      0.1,
      6.5,
      32,
      4,
      true
    );

    CygeometryY.computeBoundingBox();

    const centerGeometry = new THREE.SphereBufferGeometry(0.2, 32, 32);
    const centerMaterial = new THREE.MeshPhongMaterial({
      color: 0x72d0b2,
      specular: 0x111111,
      reflectivity: 0.8,
      shininess: 30,
      opacity: 0.8,
      transparent: true,
    });
    this.alixX = new THREE.Mesh(Cygeometry, materialX);
    this.alixX.rotateZ(-Math.PI / 2);
    this.alixX.position.set(3.5, 0, 0);
    this.alixX.add(this.ZBLOCK);
    this.alixY = new THREE.Mesh(CygeometryY, materialY);
    this.alixY.position.set(0, 3.25, 0);
    this.alixY.add(this.LBLOCK);
    this.alixZ = new THREE.Mesh(Cygeometry, materialZ);
    this.alixZ.rotateX(-Math.PI / 2);
    this.alixZ.position.set(0, 0, 3.5);
    this.alixZ.add(this.TBLOCK);
    this.center = new THREE.Mesh(centerGeometry, centerMaterial);
    this.center.add(this.alixX, this.alixY, this.alixZ);
    //this.center.add(this.powerLight);

    this.coorGroup = new THREE.Object3D();
    this.coorGroup.add(this.center);
    this.coorGroup.position.set(-3.5, -0.1, -3.5);
    this.scene.add(this.coorGroup);

    this.BLOCKS.push(this.LBLOCK, this.TBLOCK, this.ZBLOCK);
  }

  animateLforward() {
    const defultRL = this.LBLOCK.rotation;
    const tweenRL1 = new TWEEN.Tween(defultRL)
      .to({ y: '+' + Math.PI / 6 }, 700)
      .easing(TWEEN.Easing.Elastic.InOut)
      .onUpdate()
      .start();
    const tweenSL1 = new TWEEN.Tween(this.LBLOCK.scale)
      .to(
        this.LBLOCK.scale.set(
          this.LBLOCK.scale.x + 0.1,
          this.LBLOCK.scale.y + 0.1,
          this.LBLOCK.scale.z + 0.1
        ),
        700
      )
      .easing(TWEEN.Easing.Elastic.InOut)
      .onUpdate()
      .start();

    const currentEmis = this.LBLOCK.children[0].children[0].material.emissive;

    const tweenColorL1 = new TWEEN.Tween(currentEmis)
      .to({ r: '+' + 0, g: '+' + 156, b: '+' + 224 }, 40000)
      .onUpdate()
      .start();
  }
  animateLbackward() {
    const defultRL = this.LBLOCK.rotation;
    const tweenL2 = new TWEEN.Tween(this.LBLOCK.rotation)
      .to({ y: '-' + Math.PI / 6 }, 700)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate()
      .start();
    const tweenSL2 = new TWEEN.Tween(this.LBLOCK.scale)
      .to(
        this.LBLOCK.scale.set(
          this.LBLOCK.scale.x - 0.1,
          this.LBLOCK.scale.y - 0.1,
          this.LBLOCK.scale.z - 0.1
        ),
        500
      )
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate()
      .start();
    const currentEmis = this.LBLOCK.children[0].children[0].material;
    //console.log(this.LBLOCK.children[0].children[0].material);
    const defaultEmis = currentEmis.emissive.set(0x000000);
  }

  animateTforward() {
    const defultRT = this.TBLOCK.rotation;
    const tweenRT1 = new TWEEN.Tween(defultRT)
      .to({ z: '+' + Math.PI / 7 }, 700)
      .easing(TWEEN.Easing.Elastic.InOut)
      .onUpdate()
      .start();
    const tweenST1 = new TWEEN.Tween(this.TBLOCK.scale)
      .to(
        this.TBLOCK.scale.set(
          this.TBLOCK.scale.x + 0.1,
          this.TBLOCK.scale.y + 0.1,
          this.TBLOCK.scale.z + 0.1
        ),
        700
      )
      .easing(TWEEN.Easing.Elastic.InOut)
      .onUpdate()
      .start();

    this.TBLOCK.children[0].children[0].material.emissive.setHex(0xfc6e22);



  }
  animateTbackward() {
    const defultRT = this.TBLOCK.rotation;
    const tweenRT2 = new TWEEN.Tween(defultRT)
      .to({ z: '-' + Math.PI / 7 }, 700)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate()
      .start();

    const tweenST2 = new TWEEN.Tween(this.TBLOCK.scale)
      .to(
        this.TBLOCK.scale.set(
          this.TBLOCK.scale.x - 0.1,
          this.TBLOCK.scale.y - 0.1,
          this.TBLOCK.scale.z - 0.1
        ),
        700
      )
      .easing(TWEEN.Easing.Elastic.InOut)
      .onUpdate()
      .start();
    this.TBLOCK.children[0].children[0].material.emissive.setHex(0x000000);
  }
  animateZforward() {
    const defultRZ = this.ZBLOCK.rotation;
    const tweenRZ1 = new TWEEN.Tween(defultRZ)
      .to({ y: '-' + Math.PI / 7 }, 700)
      .easing(TWEEN.Easing.Elastic.InOut)
      .onUpdate()
      .start();
    const tweenST1 = new TWEEN.Tween(this.ZBLOCK.scale)
      .to(
        this.ZBLOCK.scale.set(
          this.ZBLOCK.scale.x + 0.1,
          this.ZBLOCK.scale.y + 0.1,
          this.ZBLOCK.scale.z + 0.1
        ),
        700
      )
      .easing(TWEEN.Easing.Elastic.InOut)
      .onUpdate()
      .start();

    const currentEmis1 = this.ZBLOCK.children[0].children[0].material.emissive;
    //0xb537f2;
    //r: '+' + 181, g: '+' + 55, b: '+' + 242
    const tweenColorZ1 = new TWEEN.Tween(currentEmis1)
      .to({ r: '+' + 10, g: '+' + 55, b: '+' + 0 }, 40000)
      .onUpdate()
      .start();
  }
  animateZbackward() {
    const defultRZ = this.ZBLOCK.rotation;
    const tweenRZ2 = new TWEEN.Tween(defultRZ)
      .to({ y: '+' + Math.PI / 7 }, 700)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate()
      .start();

    const tweenSZ2 = new TWEEN.Tween(this.ZBLOCK.scale)
      .to(
        this.ZBLOCK.scale.set(
          this.ZBLOCK.scale.x - 0.1,
          this.ZBLOCK.scale.y - 0.1,
          this.ZBLOCK.scale.z - 0.1
        ),
        700
      )
      .easing(TWEEN.Easing.Elastic.InOut)
      .onUpdate()
      .start();

    const currentEmis = this.ZBLOCK.children[0].children[0].material.emissive;
    const defaultEmis = currentEmis.setHex(0x000000);
    console.log(currentEmis);
    // const tweenColorZ2 = new TWEEN.Tween(currentEmis)
    //   .to(defaultEmis, 700)
    //   .onUpdate()
    //   .start();
  }

  initBlocks() {
    const blockElements = app.raycaster.intersectObjects(this.BLOCKS, true);
    if (blockElements.length > 0) {
      let selectBlock = blockElements[0];
      if (selectBlock.object.parent == this.BLOCKS[0].children[0]) {
        if (!this.LSelected) {
          this.LSelected = !this.LSelected;
          // reset all
          this.TSelected = false;
          this.scene.remove(this.TBlockS);
          this.planeXY.remove(this.TShadowXY);
          this.planeZY.remove(this.TShadowZY);
          if (this.TBLOCK.scale.x !== 0.5) {
            this.animateTbackward();
          }
          this.ZSelected = false;
          this.scene.remove(this.ZBlockS);
          this.planeXY.remove(this.ZShadowXY);
          this.planeZY.remove(this.ZShadowZY);
          if (this.ZBLOCK.scale.x !== 0.5) {
            this.animateZbackward();
          }
          //new stuff
          this.animateLforward();
          this.LBlockS = new LBlock().addSkeletonToSpace();
          this.LcurrentRotation = new THREE.Quaternion();
          this.LBlockS.getWorldQuaternion(this.LcurrentRotation);
          this.scene.add(this.LBlockS);
          this.removedXYPieceL = [];
          this.LShadowXY = new LBlock().addShadowXY();
          this.LShadowXY.position.set(0, 3, -4);
          this.planeXY.attach(this.LShadowXY);
          this.removedZYPieceL = [];
          this.LShadowZY = new LBlock().addShadowZY();
          this.removedZYPieceL.push(this.LShadowZY.children[0].children[1]);
          this.LShadowZY.children[0].remove(
            this.LShadowZY.children[0].children[1]
          );
          this.LShadowZY.position.set(-4, 3, 0);

          this.planeZY.attach(this.LShadowZY);
        } else {
          //reset
          this.LSelected = !this.LSelected;
          this.scene.remove(this.LBlockS);
          this.planeXY.remove(this.LShadowXY);
          this.planeZY.remove(this.LShadowZY);
          this.animateLbackward();
        }
      } else if (selectBlock.object.parent == this.BLOCKS[1].children[0]) {
        if (!this.TSelected) {
          this.TSelected = !this.TSelected;
          //reset all
          this.LSelected = false;
          this.scene.remove(this.LBlockS);
          this.planeXY.remove(this.LShadowXY);
          this.planeZY.remove(this.LShadowZY);
          if (this.LBLOCK.scale.x !== 0.5) {
            this.animateLbackward();
          }
          this.ZSelected = false;
          this.scene.remove(this.ZBlockS);
          this.planeXY.remove(this.ZShadowXY);
          this.planeZY.remove(this.ZShadowZY);
          if (this.ZBLOCK.scale.x !== 0.5) {
            this.animateZbackward();
          }
          // new stuff
          this.animateTforward();
          this.TBlockS = new TBlock().addSkeletonToSpace();
          this.TcurrentRotation = new THREE.Quaternion();
          this.TcurrentRotation1 = new THREE.Quaternion();
          this.TBlockS.getWorldQuaternion(this.TcurrentRotation);
          this.scene.add(this.TBlockS);
          this.TShadowXY = new TBlock().addShadowXY();
          this.TShadowXY.position.set(0, 0, -4);
          this.planeXY.attach(this.TShadowXY);
          this.TShadowZY = new TBlock().addShadowZY();
          this.removedZYPieceT = [];
          this.TShadowZY.position.set(-4, 3, 0);
          this.planeZY.attach(this.TShadowZY);
        } else {
          //reset
          this.TSelected = !this.TSelected;
          this.scene.remove(this.TBlockS);
          this.planeXY.remove(this.TShadowXY);
          this.planeZY.remove(this.TShadowZY);
          this.animateTbackward();
        }
      } else if (selectBlock.object.parent == this.BLOCKS[2].children[0]) {
        if (!this.ZSelected) {
          this.ZSelected = !this.ZSelected;
          //reset all
          this.LSelected = false;
          this.scene.remove(this.LBlockS);
          this.planeXY.remove(this.LShadowXY);
          this.planeZY.remove(this.LShadowZY);
          if (this.LBLOCK.scale.x !== 0.5) {
            this.animateLbackward();
          }
          this.TSelected = false;
          this.scene.remove(this.TBlockS);
          this.planeXY.remove(this.TShadowXY);
          this.planeZY.remove(this.TShadowZY);
          if (this.TBLOCK.scale.x !== 0.5) {
            this.animateTbackward();
          }
          //new staff
          this.animateZforward();
          this.ZBlockS = new ZBlock().addSkeletonToSpace();
          this.ZcurrentRotation = new THREE.Quaternion();
          this.ZBlockS.getWorldQuaternion(this.ZcurrentRotation);
          this.scene.add(this.ZBlockS);
          this.ZShadowXY = new ZBlock().addShadowXY();
          this.ZShadowXY.position.set(0, 0, -4);
          this.removedXYPieceZ = [];
          this.planeXY.attach(this.ZShadowXY);
          this.ZShadowZY = new ZBlock().addShadowZY();
          this.ZShadowZY.position.set(-4, 0, 0);
          this.ZcurrentRotation1 = new THREE.Quaternion();
          this.planeZY.attach(this.ZShadowZY);
        } else {
          //reset
          this.ZSelected = !this.ZSelected;
          this.scene.remove(this.ZBlockS);
          this.planeXY.remove(this.ZShadowXY);
          this.planeZY.remove(this.ZShadowZY);
          this.animateZbackward();
        }
      } else {
        return;
      }
    }
  }

  onMouseMove(fn) {
    this._onMouseMoves.push(fn);
  }
  onMouseDown(fn) {
    this._onMouseDowns.push(fn);
  }
  onKeyDown(fn) {
    this._onKeyDowns.push(fn);
  }

  //using XR API in VRButton and call controllers
  //from building function

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

  _addEventListeners() {
    document.addEventListener('mousemove', (event) => {
      event.preventDefault();
      this._onMouseMoves.forEach((fn) => {
        fn(event);
      });
    });

    document.addEventListener('mousedown', (event) => {
      event.preventDefault();
      this.mouse.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
      );
      this.raycaster.setFromCamera(this.mouse, this.camera);
      TWEEN.removeAll();

      this.initBlocks();

      this._onMouseDowns.forEach((fn) => {
        fn(event);
      });
    });

    document.addEventListener('keydown', (event) => {
      event.preventDefault();
      this._onKeyDowns.forEach((fn) => {
        fn(event);
      });
    });
  }
}

export { App };
