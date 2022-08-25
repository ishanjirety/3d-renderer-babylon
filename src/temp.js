import React, { useEffect, useRef, useState } from "react";
import { Button } from "reactstrap";
import { ColorPicker, Engine, FreeCamera, GizmoManager, HemisphericLight, PBRMetallicRoughnessMaterial, Scene, Skybox } from "react-babylonjs";
import {
  Vector3,
  Color4,
  Color3,
  ActionManager,
  SetValueAction
} from "@babylonjs/core";
import { PrismCode } from "react-prism";
import Octicon, { ArrowDown, ArrowUp } from "@githubprimer/octicons-react";

import { Suspense } from "react";

import { Model, Box, StandardMaterial, Mesh } from "react-babylonjs";
import { Matrix } from "@babylonjs/core";
import * as BABYLON from "babylonjs";
import "@babylonjs/loaders";
import { GridMaterial } from "@babylonjs/materials";
import { MeshBuilder } from "babylonjs";
// import ScaledModelWithProgress from './ScaledModelWithProgress'

// import './WithModel.css'

const WithModel = (props) => {
  const [modelSettings, updateModelSettings] = useState({
    ModelYPos: -1.5,
    ModelScaling: 3.0
  });

  const moveModelDown = () => {
    updateModelSettings((state) => ({
      ...state,
      ModelYPos: state.ModelYPos - 0.5
    }));
  };

  const moveModelUp = () => {
    updateModelSettings((state) => ({
      ...state,
      ModelYPos: state.ModelYPos + 0.5
    }));
  };

  const link = useRef();
  const [model, setModel] = useState({ url: "", extension: "" });
  const [zoom, setZoom] = useState(5)

  const [scene, setScene] = useState(null)
  const [canvas, setCanvas] = useState(null)
  const [camera, setCamera] = useState(null)

  function onFileInputChanged(e) {
    if (e.target.files.length > 0) {
      let file = e.target.files[0];
      var url = URL.createObjectURL(file);
      const extension = file.name.substring(file.name.lastIndexOf("."));
      console.log(`loading '${extension}'.`);
      setModel({ url, extension });
    }
  }

  function ZoomInOut(action) {
    if (action === "zoomin") {
      console.log(camera.update())
      camera.position = new Vector3(camera.position.x, camera.position.y, zoom - 0.1);
      setZoom(zoom - 0.1)
      scene.render()

    } else if (action === "zoomout") {
      camera.position = new Vector3(camera.position.x, camera.position.y, zoom + 0.1);
      setZoom(zoom + 0.1)
      scene.render()
      camera.update()
    }
  }


  function onSceneMount(e) {
    const { canvas, scene } = e
    setCanvas(e)
    // Setting up background
    scene.clearColor = Color3.FromInts(237, 238, 238)
    setScene(scene)

    // On zoom prevent canvas webpage zooming
    canvas.addEventListener('wheel', e => { e.preventDefault(); e.stopPropagation() });



    // Ground
    const width = 100
    const height = 100
    const subdivisions = 100
    var ground = BABYLON.MeshBuilder.CreateGround("ground", { width, height, subdivisions }, scene, false);
    var groundMaterial = new GridMaterial("groundMaterial", scene);
    // groundMaterial.mainColor = new Color3(0,0,0)
    groundMaterial.opacity = 0.5
    groundMaterial.backFaceCulling = true
    groundMaterial.transparencyMode = 0
    groundMaterial.lineColor = Color3.Black()
    groundMaterial.gridRatio = 2
    ground.material = groundMaterial;
    ground.updateFacetData();


    //SkyBox
    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;

    // Camera
    const camera = new BABYLON.ArcRotateCamera("camera1", 3 * Math.PI / 2, - Math.PI / 2, 50, Vector3.Zero(), scene);
    camera.lowerRadiusLimit = 1;
    camera.upperRadiusLimit = 20;
    camera.position = new Vector3(0, 1, 5)
    camera.minZ = 0.001
    camera.maxZ = 10000000
    camera.wheelPrecision = 50
    camera.rotation = 1
    camera.useFramingBehavior = true;

    setCamera(camera)
    // scene.camera.ArcRotateCamera.position = new Vector3(0, 5, 0)

    camera.attachControl(canvas, true)

    scene.getEngine().runRenderLoop(() => {
      if (scene) {
        scene.render();
      }
    });
  }



  const [target, setTarget] = useState(Vector3.Zero())

  return (
    <div>
      <div className="row">
        <input type="file" ref={link} onChange={onFileInputChanged} />
        <div className="col-xs-3 col-lg-3 align-top">
          Zoom:
          <Button onClick={() => ZoomInOut("zoomin")}>
            +
          </Button>
          &nbsp;&nbsp;
          <Button onClick={() => ZoomInOut("zoomout")}>
            -
          </Button>
          <Button onClick={() => setZoom(0)}>
            Reset Zoom
          </Button>
          <Button onClick={() => {
            // scene.clearColor = Color3.Black()
            // scene.render()

          }}>
            Change color
          </Button>

        </div>
      </div>
      <div className="row">
        <div className="col-xs-12 col-md-6">
          <Engine
            antialias={true}
            adaptToDeviceRatio={true}
            canvasId="sample-canvas"
            color="#EDEEEE"

          >
            <Scene onSceneMount={onSceneMount}>


              {/* <arcRotateCamera
                name="camera1"
                alpha={-Math.PI / 2}
                beta={Math.PI / 2}
                radius={5}
                checkCollisions
                // target={new Vector3(0, 1, 0)}
                // target={target}
                minZ={0.001}
                maxZ={10000000}
                wheelPrecision={50}
              /> */}
              <hemisphericLight
                name="light1"
                intensity={0.5}
                direction={new Vector3(5, 1, 5)}
              />
              <hemisphericLight
                name="light1"
                intensity={0.2}
                direction={new Vector3.Up()}
              />

              {model.url.length > 0 && (
                <ScaledModelWithProgress
                  rootUrl={model.url}
                  pluginExtension={model.extension}
                  scaleTo={modelSettings.ModelScaling}
                  progressBarColor={Color3.FromInts(255, 165, 0)}
                  center={new Vector3(0, 0, 0)}
                  setTarget={setTarget}
                  camera={camera}
                  scene={scene}
                />
              )}
            </Scene>
          </Engine>
        </div>
        <div className="col-xs-12 col-md-6"></div>
      </div>
    </div>
  );
};


const ProgressFallback = (props) => (
  <Mesh rotation={props.progressRotation} position={props.center}>
    <Box
      key="progress"
      name="boxProgress"
      height={props.scaleTo / 15}
      width={props.scaleTo}
      depth={props.scaleTo / 30}
      scaling={new Vector3(props.loadProgress, 1, 1)}
      position={new Vector3(props.scaleTo / 2, 0, props.scaleTo / 60)}
      setPivotMatrix={[Matrix.Translation(-props.scaleTo, 0, 0)]}
      setPreTransformMatrix={[Matrix.Translation(-props.scaleTo / 2, 0, 0)]}
    >
      <StandardMaterial
        diffuseColor={props.progressBarColor}
        specularColor={Color3.Black()}
      />
    </Box>
    <Box
      key="back"
      name="boxBack"
      height={props.scaleTo / 15}
      width={props.scaleTo}
      depth={props.scaleTo / 30}
      position={new Vector3(0, 0, props.scaleTo / -60)}
    />
  </Mesh>
);

const ScaledModelWithProgress = (props) => {
  const [loadProgress, setLoadProgress] = useState(0);
  const [rotation, setRotation] = useState(Vector3.Zero())

  let totalBoundingInfo = (meshes) => {
    //first mesh boundingInfo
    let boundingInfo = meshes[0].getBoundingInfo();
    //default values of min and max from the first mesh
    let min = boundingInfo.boundingBox.minimumWorld;
    let max = boundingInfo.boundingBox.maximumWorld;
    //now iterate through every other mesh
    for (let i = 1; i < meshes.length; i++) {
      //take their boundingInfos
      boundingInfo = meshes[i].getBoundingInfo();
      //and if any value is lower than min assign it as new min, same goes for max
      min = BABYLON.Vector3.Minimize(min, boundingInfo.boundingBox.minimumWorld);
      max = BABYLON.Vector3.Maximize(max, boundingInfo.boundingBox.maximumWorld);

    } //for loop closed
    //return BoundingInfo object with min and max values
    return new BABYLON.BoundingInfo(min, max);
  }


  function exampleLoad(newMeshes) {
    setTimeout(() => {
      let scene = props.scene
      console.log(scene)
      const someMeshFromTheArrayOfMeshes = scene.meshes[0];
      someMeshFromTheArrayOfMeshes.setBoundingInfo(totalBoundingInfo(scene.meshes));
      console.log(totalBoundingInfo(scene.meshes))
      //uncomment bellow to visually see bounding box 
      someMeshFromTheArrayOfMeshes.showBoundingBox = true;
      const es = someMeshFromTheArrayOfMeshes.getBoundingInfo().boundingBox.extendSize;
      // //get full WxHxD values
      const es_scaled = es.scale(4);
      console.log(es_scaled)
      // //now you have the dimension of the bounding box
      const width = es_scaled.x;
      const height = es_scaled.y;
      const depth = es_scaled.z;
      // //get center of the bounding box, I find this helpful, so I can position the parent box in the center
      // //of bounding box
      const center = someMeshFromTheArrayOfMeshes.getBoundingInfo().boundingBox.centerWorld;

      // //get max value from these dimension
      const boundingBoxMaxDimension = Math.max(width, height, depth);
      console.log(boundingBoxMaxDimension)

      // //create the box with the size of boundingBoxMaxDimension
      const parentBox = MeshBuilder.CreateBox("parentBox", { size: boundingBoxMaxDimension }, scene);

      // //position the box 
      parentBox.position = new Vector3(center.x, center.y, center.z);
      // //hhide the box
      parentBox.isVisible = true;

      // //parent everything in the scene to the box         
      for (const mesh of newMeshes) {
        mesh.setParent(parentBox);
      }

      //position the box in the 0 0 0 after parenting (if you want)
      // parentBox.position = Vector3.Zero();
      //normalize the cube to 1x1x1;
      parentBox.normalizeToUnitCube(true)
      parentBox.computeWorldMatrix(true);


      props.camera.minZ = 0;
    })


  }

  return (
    <Suspense
      fallback={
        <ProgressFallback
          progressRotation={props.progressRotation}
          center={new Vector3(0, 0, 0)}
          scaleTo={props.scaleTo}
          loadProgress={loadProgress}
          progressBarColor={props.progressBarColor}
        />
      }
    >
      <Model
        scaleToDimension={props.scaleTo}
        onLoadProgress={(evt) => {
          let modelLoadProgress = evt.lengthComputable
            ? evt.loaded / evt.total
            : evt.loaded /
            (props.estimatedFileSize *
              0.085);
          setLoadProgress(modelLoadProgress);
        }}
        onModelLoaded={(model) => {
          setLoadProgress(1);
          // onSceneLoaded(model.meshes)
          exampleLoad(model.meshes)
          // props.camera.setTarget(model.rootMesh)
          // model.meshes[1].setPo
          if (props.onModelLoaded) {
            props.onModelLoaded(model);
          }
        }}
        alwaysSelectAsActiveMesh={true}
        position={props.center}
        rootUrl={props.rootUrl}
        sceneFilename={""}
        pluginExtension={props.pluginExtension}
        rotation={rotation}
        rotationQuaternion={null}
      />
    </Suspense>
  );
};

export default WithModel;
