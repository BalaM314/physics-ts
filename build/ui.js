import { setupPhysics, Time } from "./physics.js";
import { crash, getElement } from "./util-funcs.js";
const canvas = getElement("canvas", HTMLCanvasElement);
const pause = getElement("pause", HTMLSpanElement);
const nextFrame = getElement("next-frame", HTMLSpanElement);
function setCanvasSize() {
    if (canvas.width != innerWidth)
        canvas.width = innerWidth;
    if (canvas.height != innerHeight)
        canvas.height = innerHeight;
}
const updatePhysics = setupPhysics();
const ctx = canvas.getContext('2d') ?? crash('canvas not supported');
let paused = Boolean(localStorage.getItem('physics-paused'));
pause.addEventListener("click", () => {
    paused = !paused;
    Time.reset();
    pause.innerText = paused ? '▶️' : '⏸️';
    pause.title = paused ? 'Resume' : 'Pause';
    nextFrame.classList[paused ? 'remove' : 'add']('disabled');
});
nextFrame.addEventListener("click", () => {
    if (!paused)
        return;
    ctx.fillStyle = `#cceeFF`;
    ctx.fillRect(0, 0, innerWidth, innerHeight);
    Time.reset();
    updatePhysics(ctx);
});
window.addEventListener("keydown", e => {
    if (e.key === "ArrowRight") {
        nextFrame.click();
        e.preventDefault();
    }
    if (e.key === " ") {
        pause.click();
        e.preventDefault();
    }
});
(function loop() {
    setCanvasSize();
    Time.update();
    if (!paused) {
        ctx.fillStyle = `#CCEEFF`;
        ctx.fillRect(0, 0, innerWidth, innerHeight);
        updatePhysics(ctx);
    }
    ctx.font = '32px sans-serif';
    ctx.fillStyle = '#905';
    ctx.textAlign = 'left';
    if (innerWidth < 1700)
        ctx.fillText('Zoom out! (press Ctrl and -)', 20, innerHeight - 30);
    requestAnimationFrame(loop);
})();
