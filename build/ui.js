import { setupPhysics, Time } from "./physics.js";
import { crash, getElement } from "./util-funcs.js";
const canvas = getElement("canvas", HTMLCanvasElement);
const pause = getElement("pause", HTMLSpanElement);
const nextFrame = getElement("next-frame", HTMLSpanElement);
const reset = getElement("reset", HTMLSpanElement);
const help = getElement("help", HTMLSpanElement);
function setCanvasSize() {
    if (canvas.width != innerWidth)
        canvas.width = innerWidth;
    if (canvas.height != innerHeight)
        canvas.height = innerHeight;
    ctx.setTransform(innerWidth / 1920, 0, 0, -innerHeight / 1080, 0, innerHeight);
}
let [update, draw] = setupPhysics();
const ctx = canvas.getContext('2d', { alpha: false }) ?? crash('canvas not supported');
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
let paused = Boolean(localStorage.getItem('physics-paused'));
function updateUI() {
    pause.innerText = paused ? '▶️' : '⏸️';
    pause.title = paused ? 'Resume' : 'Pause';
    nextFrame.classList[paused ? 'remove' : 'add']('disabled');
}
pause.addEventListener("click", () => {
    paused = !paused;
    updateUI();
    Time.reset();
});
nextFrame.addEventListener("click", () => {
    if (!paused)
        return;
    ctx.fillStyle = `#cceeFF`;
    ctx.fillRect(0, 0, innerWidth, innerHeight);
    Time.reset();
    update(keysHeld);
});
reset.addEventListener("click", e => {
    [update, draw] = setupPhysics();
    paused = e.shiftKey;
    updateUI();
});
help.addEventListener("click", e => {
    alert('Press ←/→ or A/D to apply a force to the box.\n\nSource code: https://github.com/BalaM314/physics-ts');
});
const keysHeld = new Set();
window.addEventListener("keydown", e => {
    if (e.key === ".") {
        nextFrame.click();
    }
    if (e.key === "r") {
        reset.click();
    }
    if (e.key === " ") {
        pause.click();
        e.preventDefault();
    }
    keysHeld.add(e.key.toLowerCase());
});
window.addEventListener("keyup", e => {
    keysHeld.delete(e.key.toLowerCase());
});
(function loop() {
    setCanvasSize();
    Time.update();
    ctx.fillStyle = `#CCEEFF`;
    ctx.fillRect(0, 0, 1920, 1080);
    draw(ctx);
    if (!paused) {
        update(keysHeld);
    }
    if (Math.abs(innerWidth / innerHeight - 16 / 9) > 0.3) {
        ctx.setTransform();
        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#905';
        ctx.textAlign = 'left';
        ctx.fillText((innerHeight > innerWidth && isMobile) ?
            'Please use landscape mode.'
            : 'Your screen does not have a 16:9 aspect ratio. Graphics may appear distorted.', 20, innerHeight - 30);
    }
    requestAnimationFrame(loop);
})();
