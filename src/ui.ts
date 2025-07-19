import { setupPhysics, Time } from "./physics.js";
import { crash, getElement } from "./util-funcs.js";


const canvas = getElement("canvas", HTMLCanvasElement);

function setCanvasSize(){
  if(canvas.width != innerWidth) canvas.width = innerWidth;
  if(canvas.height != innerHeight) canvas.height = innerHeight;
}

const updatePhysics = setupPhysics();
const ctx = canvas.getContext('2d') ?? crash('canvas not supported');


(function loop(){
  setCanvasSize();
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  Time.update();
  updatePhysics(ctx);
  requestAnimationFrame(loop);
})();
