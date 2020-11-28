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
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    //move camera nearer along Z axis
    this.camera.position.set(13, 13, 13);
    this.camera.lookAt(0, 0, 0);

    //Scene setting: default background is white 0xfe53bb
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xa0);
    //Only have light can see the color of objects

    //add environment light (can't have shadows):
    //hemispherelight(Sky color, ground color, intensity)
    const environmentLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
    this.scene.add(environmentLight);
    //0xffffbb, 0x080820, 1
    //0xffffff, 0xbbbbff, 0.3

    //add direct light from a position.
    const light = new THREE.DirectionalLight();
    light.position.set(1, 10, 4);
    this.scene.add(light);

    //Renderer setting:
    //antialias is for vr headset, otherwise will have bad edges
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(this.renderer.domElement);
    this.mouseX = 0;
    this.mouseY = 0;
    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;

    //drag page control
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.minDistance = 9;
    this.controls.maxDistance = 12;
    this.controls.keys = false;
    this.controls.target.set(0, 3, 0);
    this.controls.update();

    this.stats = new Stats();
    container.appendChild(this.stats.dom);

    //visuialize controllers
    this.raycaster = new THREE.Raycaster();
    //this.raycaster.layers.set(1);
    this.mouse = new THREE.Vector2();
    this.workingMatrix = new THREE.Matrix4();
    this.workingVector = new THREE.Vector3();

    //** Init scene
    //Init planes
    this.planeXYG = new Planes().addXY();
    this.planeXY = this.planeXYG.children[0];
    this.planeZYG = new Planes().addZY();
    this.planeZY = this.planeZYG.children[0];
    this.planeXZG = new Planes().addXZ();
    this.planeXZ = this.planeXZG.children[0];
    this.coorGroup2 = new Planes().addCoor();

    // Init BLOCKS
    this.BLOCKS = [];
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
    this.gameOverCubes = [];
    this.gameOverCubes.push(
      this.LBLOCK.children[0],
      this.TBLOCK.children[0],
      this.ZBLOCK.children[0]
    );

    this.coorGroup2.children[4].add(this.ZBLOCK);
    this.coorGroup2.children[5].add(this.LBLOCK);
    this.coorGroup2.children[6].add(this.TBLOCK);

    this.BLOCKS.push(this.LBLOCK, this.TBLOCK, this.ZBLOCK);

    //** levels
    this.levelShdaowsXY = [];
    this.levelShdaowsZY = [];
    this.receivedShadowsXY = [];
    this.receivedShadowsZY = [];

    this.ShadowXY1 = new Levels().level1XY();
    this.ShadowZY1 = new Levels().level1ZY();
    this.ShadowXY2 = new Levels().level2XY();
    this.ShadowZY2 = new Levels().level2ZY();

    this.levelShdaowsXY.push(this.ShadowXY1, this.ShadowXY2);
    this.levelShdaowsZY.push(this.ShadowZY1, this.ShadowZY2);

    this.finalGroup = new THREE.Group();
    this.textMesh = new THREE.Mesh();

    //** raycaster array
    this.allObjects = [];
    this.allObjects.push(this.planeXZ);

    //** Init events
    this._onMouseMoves = [];
    this._onMouseDowns = [];
    this._onKeyDowns = [];
    this._onKeyUp = [];
    this.BlocksControls = new Inputs(this);
    this._addEventListeners();
    this.count = 0;

    //** Init flags
    this.LSelected = false;
    this.TSelected = false;
    this.ZSelected = false;
    this.LMoved = false;
    this.TMoved = false;
    this.ZMoved = false;
    this.XYmatched = false;
    this.ZYmatched = false;
    this.levelPassed = false;
    this.level = 0;

    //** Start
    this.initScene();
    this.setupXR();

    window.addEventListener('resize', this.resize.bind(this));
    this.renderer.setAnimationLoop(this.render.bind(this));
  }

  menue() {}

  initScene() {
    this.radius = 0.08;

    this.menue();
    //** XY plane
    this.scene.add(this.planeXYG);
    //** ZY plane
    this.scene.add(this.planeZYG);

    //** XZ plane
    this.scene.add(this.planeXZG);
    //** Coordinate
    this.coorGroup2.position.set(-3.5, -0.1, -3.5);
    this.planeXZG.attach(this.coorGroup2);

    //this.gameOver();
  }

  gameOver() {
    this.camera.position.x = -5;
    this.camera.position.z = 10;

    for (let i = 0; i < this.gameOverCubes.length; i++) {
      const dist = 5;
      const distDouble = dist * 2;
      const rotate = 2 * Math.PI;
      this.gameOverCubes[i].position.x = Math.random() * distDouble - dist;
      this.gameOverCubes[i].position.y = Math.random() * distDouble - dist;
      this.gameOverCubes[i].position.z = Math.random() * distDouble - dist;
      this.gameOverCubes[i].rotation.x = Math.random() * rotate;
      this.gameOverCubes[i].rotation.y = Math.random() * rotate;
      this.gameOverCubes[i].rotation.z = Math.random() * rotate;
      //this.gameOverCubes[i].matrixAutoUpdate = false;

      this.finalGroup.add(this.gameOverCubes[i]);
    }
    this.scene.add(this.finalGroup);

    // CREATE TYPOGRAPHY
    const loader = new THREE.FontLoader();
    const createTypo = (font) => {
      const word = 'Congraduation';
      const typoProperties = {
        font: font,
        size: 120,
        height: 120 / 2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 10,
        bevelSize: 6,
        bevelOffset: 1,
        bevelSegments: 8,
      };
      const text = new THREE.TextGeometry(word, typoProperties);
      const material = new THREE.MeshNormalMaterial();
      this.textMesh.geometry = text;
      this.textMesh.material = material;
      this.textMesh.position.x = 3 * -2;
      this.textMesh.position.z = 2 * -1;
      this.textMesh.scale.set(0.01, 0.01, 0.01);
      this.scene.add(this.textMesh);
    };
    loader.load(
      'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
      createTypo
    );
  }

  levelMove() {
    //Init level one
    if (this.level === 0) {
      //  this.scene.add(this.planeXYG);
      //  //** ZY plane
      //  this.scene.add(this.planeZYG);

      //  //** XZ plane
      //  this.scene.add(this.planeXZG);
      //  //** Coordinate
      //  this.coorGroup2.position.set(-3.5, -0.1, -3.5);
      //  this.planeXZG.attach(this.coorGroup2);
      this.planeXYG.add(this.levelShdaowsXY[0]);
      this.planeZYG.add(this.levelShdaowsZY[0]);
    } else if (this.level === 2) {
      //reset coordinate
      this.resetL();
      this.resetT();
      this.resetZ();

      //reset match logics
      this.XYmatched = false;
      this.ZYmatched = false;
      this.levelPassed = false;

      // clean received points
      this.receivedShadowsXY = [];
      this.receivedShadowsZY = [];

      //clean objects on the plane and array
      this.allObjects = [];
      this.allObjects.push(this.planeXZ);

      for (let i = 3; i < this.planeXZG.children.length; i++) {
        this.planeXZG.remove(this.planeXZG.children[i]);
      }
      this.scene.remove(this.planeXYG, this.planeXZG, this.planeZYG);

      this.gameOver();
    } else if (this.level !== 2) {
      if (this.levelPassed) {
        //reset coordinate
        this.resetL();
        this.resetT();
        this.resetZ();

        //reset match logics
        this.XYmatched = false;
        this.ZYmatched = false;
        this.levelPassed = false;

        // clean received points
        this.receivedShadowsXY = [];
        this.receivedShadowsZY = [];

        //clean objects on the plane and array
        this.allObjects = [];
        this.allObjects.push(this.planeXZ);

        for (let i = 3; i < this.planeXZG.children.length; i++) {
          this.planeXZG.remove(this.planeXZG.children[i]);
        }

        //clean current shadows
        this.planeXYG.remove(this.levelShdaowsXY[this.level - 1]);
        this.planeZYG.remove(this.levelShdaowsZY[this.level - 1]);

        //add new level
        const currentO = { opacity: 0.5 };
        this.levelShdaowsXY[this.level].children[0].material.color.setHex(
          0x00ffff
        );
        this.levelShdaowsZY[this.level].children[0].material.color.setHex(
          0x00ffff
        );
        const currentC = this.levelShdaowsXY[this.level].children[0].material
          .color;

        this.planeXYG.add(this.levelShdaowsXY[this.level]);
        //console.log(this.levelShdaowsXY[this.level]);
        this.planeZYG.add(this.levelShdaowsZY[this.level]);

        const tweenAppear = new TWEEN.Tween(currentO)
          .to({ opacity: 0.3 }, 4000)
          .easing(TWEEN.Easing.Elastic.InOut)
          .start();

        const tweenColor = new TWEEN.Tween(currentC)
          .to({ r: '+' + 0, g: '-' + 255, b: '-' + 255 }, 4000)
          .easing(TWEEN.Easing.Elastic.InOut)
          .start();

        if (this.planeXZG.children[3] === undefined) {
          tweenAppear.onComplete(() => {
            this.levelShdaowsXY[this.level].children[0].material.opacity =
              currentO.opacity;
            this.levelShdaowsZY[this.level].children[0].material.opacity =
              currentO.opacity;
          });
          tweenColor.onUpdate(() => {
            this.levelShdaowsXY[
              this.level
            ].children[0].material.color = currentC;
            this.levelShdaowsZY[
              this.level
            ].children[0].material.color = currentC;
          });
        }
      }
    }
  }

  animateLforward() {
    this.coorGroup2.children[0].material.color.setHex(0x00a9fe);
    this.coorGroup2.children[1].visible = true;
    const defultRL = this.LBLOCK.rotation;
    const tweenRL1 = new TWEEN.Tween(defultRL)
      .to({ y: '+' + Math.PI }, 700)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onComplete()
      .start();
    const tweenSL1 = new TWEEN.Tween(this.LBLOCK.scale)
      .to({ x: '+' + 0.1, y: '+' + 0.1, z: '+' + 0.1 }, 1000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onComplete()
      .start();

    const currentEmis = this.LBLOCK.children[0].children[0].material.emissive;

    const tweenColorL1 = new TWEEN.Tween(currentEmis)
      .to({ r: '+' + 0, g: '+' + 156, b: '+' + 224 }, 30000)
      .onComplete()
      .start();
    this.LMoved = true;
  }
  animateLbackward() {
    this.coorGroup2.children[0].material.color.setHex(0xffffff);
    this.coorGroup2.children[1].visible = false;
    const defultRL = this.LBLOCK.rotation;
    const tweenL2 = new TWEEN.Tween(this.LBLOCK.rotation)
      .to({ y: '-' + Math.PI }, 700)
      .easing(TWEEN.Easing.Elastic.InOut)
      .onUpdate()
      .start();
    const tweenSL2 = new TWEEN.Tween(this.LBLOCK.scale)
      .to({ x: '-' + 0.1, y: '-' + 0.1, z: '-' + 0.1 }, 1000)
      .easing(TWEEN.Easing.Elastic.InOut)
      .onUpdate()
      .start();
    const currentEmis = this.LBLOCK.children[0].children[0].material;
    //console.log(this.LBLOCK.children[0].children[0].material);
    const defaultEmis = currentEmis.emissive.set(0x000000);
    this.LMoved = false;
  }

  animateTforward() {
    this.coorGroup2.children[0].material.color.setHex(0xfc6e22);
    this.coorGroup2.children[2].visible = true;
    const defultRT = this.TBLOCK.rotation;
    const tweenRT1 = new TWEEN.Tween(defultRT)
      .to({ z: '+' + Math.PI }, 700)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate()
      .start();
    const tweenST1 = new TWEEN.Tween(this.TBLOCK.scale)
      .to({ x: '+' + 0.1, y: '+' + 0.1, z: '+' + 0.1 }, 1000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate()
      .start();

    const currentEmis = this.TBLOCK.children[0].children[0].material.emissive;

    const tweenColorT1 = new TWEEN.Tween(currentEmis)
      .to({ r: '+' + 252, g: '+' + 0, b: '+' + 0 }, 1000)
      .onUpdate()
      .start();

    this.TMoved = true;
  }
  animateTbackward() {
    this.coorGroup2.children[0].material.color.setHex(0xffffff);
    this.coorGroup2.children[2].visible = false;
    const defultRT = this.TBLOCK.rotation;
    const tweenRT2 = new TWEEN.Tween(defultRT)
      .to({ z: '-' + Math.PI }, 700)
      .easing(TWEEN.Easing.Elastic.InOut)
      .onUpdate()
      .start();

    const tweenST2 = new TWEEN.Tween(this.TBLOCK.scale)
      .to({ x: '-' + 0.1, y: '-' + 0.1, z: '-' + 0.1 }, 1000)
      .easing(TWEEN.Easing.Elastic.InOut)
      .onUpdate()
      .start();
    this.TBLOCK.children[0].children[0].material.emissive.setHex(0x000000);
    this.TMoved = false;
  }
  animateZforward() {
    this.coorGroup2.children[0].material.color.setHex(0xb537f2);
    this.coorGroup2.children[3].visible = true;
    const defultRZ = this.ZBLOCK.rotation;
    const tweenRZ1 = new TWEEN.Tween(defultRZ)
      .to({ y: '-' + Math.PI }, 700)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate()
      .start();
    const tweenST1 = new TWEEN.Tween(this.ZBLOCK.scale)
      .to({ x: '+' + 0.1, y: '+' + 0.1, z: '+' + 0.1 }, 1000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate()
      .start();

    const currentEmis = this.ZBLOCK.children[0].children[0].material.emissive;

    const tweenColorZ1 = new TWEEN.Tween(currentEmis)
      .to({ r: '+' + 181, g: '+' + 0, b: '+' + 242 }, 30000)
      .onUpdate()
      .start();
    // this.ZBLOCK.children[0].children[0].material.emissive.setHex(0xb537f2);
    this.ZMoved = true;
  }
  animateZbackward() {
    this.coorGroup2.children[0].material.color.setHex(0xffffff);
    this.coorGroup2.children[3].visible = false;
    const defultRZ = this.ZBLOCK.rotation;
    const tweenRZ2 = new TWEEN.Tween(defultRZ)
      .to({ y: '+' + Math.PI }, 700)
      .easing(TWEEN.Easing.Elastic.InOut)
      .onUpdate()
      .start();

    const tweenSZ2 = new TWEEN.Tween(this.ZBLOCK.scale)
      .to({ x: '-' + 0.1, y: '-' + 0.1, z: '-' + 0.1 }, 1000)
      .easing(TWEEN.Easing.Elastic.InOut)
      .onUpdate()
      .start();

    const currentEmis = this.ZBLOCK.children[0].children[0].material.emissive;
    const defaultEmis = currentEmis.setHex(0x000000);
    this.ZMoved = false;
  }

  resetL() {
    this.LSelected = false;
    this.scene.remove(this.LBlockS);
    this.planeXY.remove(this.LShadowXY);
    this.planeZY.remove(this.LShadowZY);
    if (this.LMoved === true) {
      this.animateLbackward();
    }
  }
  resetT() {
    this.TSelected = false;
    this.scene.remove(this.TBlockS);
    this.planeXY.remove(this.TShadowXY);
    this.planeZY.remove(this.TShadowZY);
    if (this.TMoved === true) {
      this.animateTbackward();
    }
  }
  resetZ() {
    this.ZSelected = false;
    this.scene.remove(this.ZBlockS);
    this.planeXY.remove(this.ZShadowXY);
    this.planeZY.remove(this.ZShadowZY);
    if (this.ZMoved === true) {
      this.animateZbackward();
    }
  }

  initBlocks(controller) {
    const blockElements = this.raycaster.intersectObjects(this.BLOCKS, true);
    if (blockElements.length > 0) {
      let selectBlock = blockElements[0];
      if (this.renderer.xr.isPresenting) {
        controller.children[0].scale.z = selectBlock.distance;
      }

      //** Init LBLOCK
      if (selectBlock.object.parent == this.BLOCKS[0].children[0]) {
        if (!this.LSelected) {
          this.LSelected = !this.LSelected;
          // reset all
          this.resetT();
          this.resetZ();
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
          this.resetL();
        }
        //** Init TBLOCK
      } else if (selectBlock.object.parent == this.BLOCKS[1].children[0]) {
        if (!this.TSelected) {
          this.TSelected = !this.TSelected;
          //reset all
          this.resetL();
          this.resetZ();
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
          this.resetT();
        }
        //** Init ZBLOCK
      } else if (selectBlock.object.parent == this.BLOCKS[2].children[0]) {
        if (!this.ZSelected) {
          this.ZSelected = !this.ZSelected;
          //reset all
          this.resetL();
          this.resetT();
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
          this.resetZ();
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
  onKeyUp(fn) {
    this._onKeyUp.push(fn);
  }

  //using XR API in VRButton and call controllers
  //from building function

  setupXR() {
    this.renderer.xr.enabled = true;
    const button = new VRButton(this.renderer);

    const self = this;

    this.controllers = this.buildControllers();

    function onSelectStart() {
      this.children[0].scale.z = 10;

      this.userData.selectPressed = true;
    }

    function onSelectEnd() {
      this.children[0].scale.z = 0;
      this.userData.selectPressed = false;
    }

    function onSqueezeStart() {
      this.userData.squeezePressed = true;
    }
    function onSqueezeEnd() {
      this.userData.squeezePressed = false;
    }
    this.controllers.forEach((controller) => {
      controller.addEventListener('selectstart', onSelectStart);
      controller.addEventListener('selectend', onSelectEnd);
      //controller.addEventListener('squeezestart', onSqueezeStart);
      //controller.addEventListener('squeezeend', onSqueezeEnd);
    });
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

  selectController(controller) {
    if (controller.userData.selectPressed) {
      controller.children[0].scale.z = 10;
      this.workingMatrix.identity().extractRotation(controller.matrixWorld);
      this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
      this.raycaster.ray.direction
        .set(0, 0, -1)
        .applyMatrix4(this.workingMatrix);
      TWEEN.removeAll();

      this.initBlocks(controller);
      controller.userData.selectPressed = false;
    }
  }
  moveController(controller) {

      controller.children[0].scale.z = 10;
      this.workingMatrix.identity().extractRotation(controller.matrixWorld);
      this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
      this.raycaster.ray.direction
        .set(0, 0, -1)
        .applyMatrix4(this.workingMatrix);
      this._onMouseMoves.forEach((fn) => {
        fn(controller);
      });


  }

  resize() {
    //resize function
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    this.stats.update();

    if (this.renderer.xr.isPresenting) {
      const self = this;
      this.controllers.forEach((controller) => {
        self.selectController(controller);
        self.moveController(controller);
      });
    }

    if (this.level === 2) {
      this.camera.position.x += (this.mouseX - this.camera.position.x) * 0.005;
      this.camera.position.y +=
        (this.mouseY * -1 - this.camera.position.y) * 0.005;
      this.camera.lookAt(this.scene.position);
      //const dt = this.clock.getDelta() * 10;

      const t = Date.now() * 0.001;

      console.log(dt, t);

      const rx = Math.sin(t * 0.7) * 0.5;
      const ry = Math.sin(t * 0.3) * 0.5;
      const rz = Math.sin(t * 0.2) * 0.5;
      this.finalGroup.rotation.x = rx;
      this.finalGroup.rotation.y = ry;
      this.finalGroup.rotation.z = rz;
      this.textMesh.rotation.x = rx;
      this.textMesh.rotation.y = ry;
      this.textMesh.rotation.z = rx;
    }
    this.renderer.render(this.scene, this.camera);
    TWEEN.update();
  }

  coordinate(coordX, coordY) {
    this.mouseX = (coordX - this.windowHalfX) * 0.5;
    this.mouseY = (coordY - this.windowHalfY) * 0.5;
  }
  onMouseMoveF(event) {
    this.coordinate(event.clientX, event.clientY);
  }

  _addEventListeners() {
    document.addEventListener('mousemove', (event) => {
      event.preventDefault();
      if (this.level !== 2) {
        this.mouse.set(
          (event.clientX / window.innerWidth) * 2 - 1,
          -(event.clientY / window.innerHeight) * 2 + 1
        );
        this.raycaster.setFromCamera(this.mouse, this.camera);
        this._onMouseMoves.forEach((fn) => {
          fn();
        });
      } else {
        this.onMouseMoveF(event);
      }
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
        fn();
      });

      if (this.XYmatched && this.ZYmatched) {
        this.levelPassed = true;
        this.level++;
      }

      this.levelMove();
    });

    document.addEventListener('keydown', (event) => {
      event.preventDefault();
      this._onKeyDowns.forEach((fn) => {
        fn(event);
      });
    });
    document.addEventListener('keyup', (event) => {
      event.preventDefault();
      this._onKeyUp.forEach((fn) => {
        fn(event);
      });
    });
  }
}

export { App };
