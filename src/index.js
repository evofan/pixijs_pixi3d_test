import * as PIXI from 'pixi.js';
import * as PIXI3D from 'pixi3d';

// console.log(PIXI3D);

const STAGE_WIDTH = 480;
const STAGE_HEIGHT = 320;

// init
let app = new PIXI.Application({
	width: STAGE_WIDTH,
	height: STAGE_HEIGHT
});
/*
let canvas = document.getElementById("canvas");
canvas.appendChild(app.view);
*/

document.body.appendChild(app.view);
app.renderer.backgroundColor = 0x000000;

// v5 ticker
let ticker = PIXI.Ticker.shared;
// Set this to prevent starting this ticker when listeners are added.
// By default this is true only for the PIXI.Ticker.shared instance.
ticker.autoStart = false;
// FYI, call this to ensure the ticker is stopped. It should be stopped
// if you have not attempted to render anything yet.
// ticker.stop();
// Call this when you are ready for a running shared ticker.
// ticker.start();

ticker.add(function (time) {
	// app.renderer;
	// console.log("render...", time);
	update(time);
});
/*
// You may use the shared ticker to render...
let renderer = PIXI.autoDetectRenderer();
let stage = new PIXI.Container();
document.body.appendChild(renderer.view);
ticker.add(function (time) {
	renderer.render(stage);
});
*/

let bg;
// let snow;

let container_bg = new PIXI.Container();
container_bg.x = 0;
container_bg.y = 0;
app.stage.addChild(container_bg);

let container = new PIXI.Container();
container.width = 480;
container.height = 320;
container.x = 0;
container.y = 0;
container.pivot.x = 0;
container.pivot.y = 0;
container.interactive = true;
app.stage.addChild(container);

// asset property
// const ASSET_BG = "assets/pic_darksky_bg.jpg";
// const ASSET_BG = "assets/pic_inwater.jpg";
const ASSET_BG = "assets/pic_outerwall.jpg";
const ASSET_SNOW = "assets/pic_snow.png";
// const ASSET_3DMODEL = "assets/buster_drone/scene.gltf";
// const ASSET_3DMODEL = "assets/milk_truck/CesiumMilkTruck.gltf";
const ASSET_3DMODEL = "assets/CesiumMan/CesiumMan.gltf";
// const ASSET_3DMODEL = "assets/Duck/Duck.gltf";

// snow property
const ROTATE_LEFT = 1;
const ROTATE_RIGHT = 2;
const MAX_NUM = 20;
const MAX_SCALE = 1;
const MIN_SCALE = 0.3;
const MAX_ACCEL = 7;
const MIN_ALPHA = 0.3;
const MAX_ALPHA = 1;
const MAX_RADIUS = 5;
const MIN_RADIUS = 1;
let snows = [];
let radiusNums = [];
let angleNums = [];
let accelNums = [];

let model;

// v5 loader
const loader = PIXI.Loader.shared;

loader.add("bg_data", ASSET_BG)
	.add("snow_data", ASSET_SNOW)
	.add("thrd_data", ASSET_3DMODEL);
//.add("assets/buster_drone/scene.gltf");
/*
app.loader.load((loader, resources) => {
  let model = app.stage.addChild(PIXI3D.Model.from(resources["assets/buster_drone/scene.gltf"].gltf))
})
*/

loader.load((loader, resources) => onAssetsLoaded(loader, resources));

/**
 * Asset load Complete
 * @param { object } loader object
 * @param { object } res asset data
 */
function onAssetsLoaded(loader, res) {
	console.log("onAssetsLoaded()", loader, res);
	// e {baseUrl: "", progress: 100, loading: false, defaultQueryString: "", _beforeMiddleware: Array(0), …}
	// {bg_data: t, snow_data: t}

	// BG
	bg = new PIXI.Sprite(res.bg_data.texture);
	container_bg.addChild(bg);
	bg.x = 0;
	bg.y = 0;
	bg.interactive = true;
	bg.on("tap", (event) => {
		console.log("onTap"); // Desktop(Touch)
	});
	bg.on("click", (event) => {
		console.log("click"); // Desktop
	});

	// Text
	let text = new PIXI.Text(`Hold left mouse button and drag to orbit.\nUse scroll wheel to zoom in/out.\nPixiJS v${PIXI.VERSION} + Pixi3D + glTF`, {
		fontFamily: "Arial",
		fontSize: 20,
		fill: 0xf0fff0,
		align: "center",
		fontWeight: "bold",
		stroke: "#000000",
		strokeThickness: 4,
		dropShadow: false,
		dropShadowColor: "#666666",
		lineJoin: "round"
	});
	container.addChild(text);
	text.x = 40;
	text.y = 10;

	// 3D Model
	model = PIXI3D.Model.from(res.thrd_data.gltf);
	// let model = PIXI3D.Model.from(res["assets/buster_drone/scene.gltf"].gltf);// ok
	container.addChild(model);

	// position, scale, rotation
	model.position.y = -2;//0.3;
	model.scale.set(2);
	model.rotationQuaternion.setEulerAngles(0, 25, 0);

	// Light、これを設定しないとモデルが真っ黒のまま
	let dirLight = Object.assign(new PIXI3D.Light(), {
		type: "directional", intensity: 0.5, x: -4, y: 7, z: -4
	});
	dirLight.rotationQuaternion.setEulerAngles(45, 45, 0);
	PIXI3D.LightingEnvironment.main.lights.push(dirLight);

	let pointLight = Object.assign(new PIXI3D.Light(), {
		type: "point", x: -1, y: 0, z: 3, range: 10, intensity: 10
	});
	PIXI3D.LightingEnvironment.main.lights.push(pointLight);

	// shadow
	let shadowCastingLight = new PIXI3D.ShadowCastingLight(
		app.renderer, dirLight, 512, 15, 1, PIXI3D.ShadowQuality.medium);

	let pipeline = PIXI3D.StandardPipeline.from(app.renderer);
	// v5 pipeline.shadowRenderPass.lights.push(shadowCastingLight);
	// v5 pipeline.shadowRenderPass.enableShadows(model, shadowCastingLight);
	// v6
	pipeline.enableShadows(model, shadowCastingLight);

	// camera
	let control = new PIXI3D.CameraOrbitControl(app.view);

	// anime
	model.animations[0].play();
	model.animations[0].loop = true;

	// Snow
	for (let i = 0; i < MAX_NUM; i++) {
		let snow = PIXI.Sprite.from(res.snow_data.texture);

		// x position
		let xNum = Math.floor(Math.random() * STAGE_WIDTH + 1);
		snow.x = xNum;

		// y position
		let yNum = -Math.floor(Math.random() * 100 + 1);
		snow.y = yNum;

		// scale
		let scaleNum = Math.random() * (MAX_SCALE - MIN_SCALE) + MIN_SCALE;
		snow.scale.x = scaleNum;
		snow.scale.y = scaleNum;

		// direction of rotation
		let rotateDirecNum = Math.floor(Math.random() * 2 + 1);
		rotateDirecNum === 1
			? (rotateDirecNum = ROTATE_LEFT)
			: (rotateDirecNum = ROTATE_RIGHT);

		// acceleration
		let accelNum = Math.floor(Math.random() * MAX_ACCEL + 1);
		accelNums.push(accelNum);

		// transparency
		let alphaNum =
			Math.floor((Math.random() * (MAX_ALPHA - MIN_ALPHA) + MIN_ALPHA) * 10) / 10;
		snow.alpha = alphaNum;

		// radius
		let radiusNum = Math.random() * (MAX_RADIUS - MIN_RADIUS) + MIN_RADIUS;
		radiusNums.push(radiusNum);

		// angle
		let angleNum = Math.floor(Math.random() * 360 + 1);
		angleNums.push(angleNum);

		snows.push(snow);
		container.addChild(snow);
	}

	ticker.start(); // reder start

}

/**
 * app rendering
 * @param { number } time
 */
function update(time) {
	for (let i = 0; i < MAX_NUM; i++) {
		// radian
		let radian = (angleNums[i] * Math.PI) / 180;

		snows[i].x += radiusNums[i] * Math.cos(radian);

		snows[i].y += 1 * accelNums[i];
		angleNums[i] += 5;

		// +rotation

		// moved out of screen
		if (STAGE_HEIGHT + snows[i].height < snows[i].y) {
			let xNew = Math.floor(Math.random() * STAGE_WIDTH + 1);
			snows[i].x = xNew;
			snows[i].y = -snows[i].height;
		}
	}

}
