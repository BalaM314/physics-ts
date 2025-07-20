import { convertNaN } from "./util-funcs.js";
import { forceType } from "./util-types.js";
class Universe {
    constructor() {
        this.objects = Array();
    }
    add(object) {
        this.objects.push(object);
    }
    update() {
        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].update(this.objects);
        }
    }
    draw(ctx) {
        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].draw(ctx);
        }
    }
}
export const Time = {
    current: Date.now(),
    /** deltatime in seconds */
    delta: 1 / 60,
    update() {
        // Time.delta = (Date.now() - Time.current) / 1000;
        // Time.current = Date.now();
    },
    reset() {
        Time.delta = 1 / 60;
        Time.current = Date.now();
    },
};
export function setupPhysics() {
    const universe = new Universe();
    universe.add(new ConstantAccelerationField(new Vec2(0, -600)));
    universe.add(new ConstantAccelerationField(new Vec2(0, 1500), new Rect(100, 100, 300, 700)).setDrawer(Field.coloredRectDrawer(`#33aa3320`)));
    universe.add(new ConstantAccelerationField(new Vec2(1000, 0), new Rect(100, 850, 400, 200)).setDrawer(Field.coloredRectDrawer(`#aa333320`)));
    // universe.add(new ConstantForceField(
    // 	new Vec2(0, 1200),
    // 	new Rect(420, 50, 300, 750)
    // ).setDrawer(Field.coloredRectDrawer(`#aa333320`)));
    // universe.add(new DragField(
    // 	0.02,
    // 	new Rect(800, 200, 300, 600)
    // ).setDrawer(Field.coloredRectDrawer(`#3333aa20`)));
    universe.add(new Box(new Vec2(600, 950), 1, 100, 100, new Vec2(400, 300)));
    universe.add(new ThinWall(new Vec2(100, 100), new Vec2(1500, 100), [Direction.up]));
    universe.add(new ThinWall(new Vec2(1050, 750), new Vec2(1350, 950), [Direction.up, Direction.left]));
    universe.add(new ThinWall(new Vec2(550, 650), new Vec2(550, 700), [Direction.right]));
    universe.add(new ThinWall(new Vec2(550, 650), new Vec2(1150, 500), [Direction.up, Direction.right]));
    universe.add(new ThinWall(new Vec2(1050, 150), new Vec2(1750, 400), [Direction.up, Direction.left]));
    universe.add(new ThinWall(new Vec2(100, 100), new Vec2(100, 900), [Direction.right]));
    // let
    // 	p1 = new Vec2(100, 100),
    // 	p2 = new Vec2(200, 100),
    // 	p3 = new Vec2(200, 200),
    // 	p4 = new Vec2(100, 200),
    // 	l1 = new Vec2(50, 80),
    // 	l2 = new Vec2(210, 80);
    // window.activePoint = l1;
    // Object.assign(window, {p1, p2, p3, p4, l1, l2});
    // window.onmousemove = e => {
    // 	window.activePoint.x = e.x;
    // 	window.activePoint.y = e.y;
    // }
    return [() => universe.update(), (ctx) => universe.draw(ctx)];
    // ctx.fillStyle = Geom.parallelogramOverlapsLine(p1, p2, p3, p4, l1, l2) ? 'green' : 'red';
    // ctx.beginPath();
    // ctx.moveTo(p1.x, p1.y);
    // ctx.lineTo(p2.x, p2.y);
    // ctx.lineTo(p3.x, p3.y);
    // ctx.lineTo(p4.x, p4.y);
    // ctx.fill();
    // ctx.strokeStyle = '#000';
    // ctx.beginPath();
    // ctx.moveTo(l1.x, l1.y);
    // ctx.lineTo(l2.x, l2.y);
    // ctx.stroke();
}
/** Rectangular physics object */
class Box {
    constructor(position, mass, width, height, 
    /** velocity in ms^-1 */
    velocity = Vec2.zero(), 
    /** acceleration in ms^-2 */
    acceleration = Vec2.zero()) {
        this.position = position;
        this.mass = mass;
        this.width = width;
        this.height = height;
        this.velocity = velocity;
        this.acceleration = acceleration;
    }
    get span() {
        return new Rect(this.position.x, this.position.y, this.width, this.height);
    }
    applyForce(force) {
        this.acceleration.add(Vec2.div(force, this.mass));
    }
    applyAcceleration(acceleration) {
        this.acceleration.add(acceleration);
    }
    update(objects) {
        let deltaP;
        for (let i = 0;; i++) {
            if (i > 5)
                throw new Error('too many bounces');
            deltaP = Vec2.mul(Vec2.add(this.velocity, Vec2.mul(this.acceleration, Time.delta)), Time.delta);
            deltaP.clean();
            if (!this.checkCollisions(objects.filter(w => w instanceof ThinWall), deltaP))
                break;
        }
        this.velocity.add(Vec2.mul(this.acceleration, Time.delta));
        this.position.add(deltaP);
        this.acceleration.set(0, 0);
    }
    edges() {
        return [
            [Direction.down, this.position, Vec2.addn(this.position, this.width, 0)],
            [Direction.right, Vec2.addn(this.position, this.width, 0), Vec2.addn(this.position, this.width, this.height)],
            [Direction.up, Vec2.addn(this.position, 0, this.height), Vec2.addn(this.position, this.width, this.width)],
            [Direction.left, this.position, Vec2.addn(this.position, 0, this.height)],
        ];
    }
    checkCollisions(walls, delta) {
        let collided = false;
        for (const [direction, p1, p2] of this.edges().filter(([f]) => delta.has(f))) {
            for (const wall of walls.filter(w => w.directions.get(direction.opposite))) {
                //The path formed by p1, p2, p2+delta, p1+delta is a parallelogram
                //If this parallelogram contains the line segment wall.point1, wall.point2
                //the edge will collide with the wall
                let p1d = Vec2.add(p1, delta);
                let p2d = Vec2.add(p2, delta);
                if (Geom.parallelogramOverlapsLine(p1, p2, p2d, p1d, wall.point1, wall.point2)) {
                    console.log(`Edge ${p1}-${p2} (${direction.string}) collided with wall ${wall.point1}-${wall.point2} while moving ${delta}`);
                    //Calculate how much of the movement needs to be blocked
                    let T1 = Geom.getT(p1, delta, wall.point1, wall.point2);
                    if (T1 < 0)
                        T1 = 1;
                    let T2 = Geom.getT(p2, delta, wall.point1, wall.point2);
                    if (T2 < 0)
                        T2 = 1;
                    const Tn = Math.min(T1, T2);
                    const T = Math.max(Math.min(Tn, 1) - 0.01, 0);
                    console.log(`T1:${T1} T2:${T2} | ${T} of movement was allowed`);
                    //subtract 0.01 to prevent clipping through due to floating point imprecision
                    //this causes objects to float very slightly above the wall (usually by less than one pixel)
                    //Calculate the necessary reaction force
                    if (T1 === 1 && T2 === 1) {
                        console.log('Skipped reaction force');
                    }
                    else {
                        const pd = T1 <= T2 ? p1d : p2d;
                        const S = Vec2.dot(Vec2.sub(pd, wall.point1), wall.wallVector) / (wall.wallVector.mag() ** 2);
                        const F = Vec2.sub(Vec2.add(wall.point1, Vec2.mul(wall.wallVector, S)), pd);
                        console.log(`Applied reaction force of ${F}`);
                        if (F.mag() > Vec2.verySmall)
                            collided = true;
                        //s = vt = at^2; a = s/t^2
                        this.applyAcceleration(Vec2.div(F, Time.delta ** 2));
                    }
                    //Block the movement (to prevent redundant collisions applying extra reaction force)
                    if (direction.horizontal)
                        delta.x *= T;
                    if (direction.vertical)
                        delta.y *= T;
                    //TODO friction
                }
            }
        }
        return collided;
    }
    draw(ctx) {
        ctx.fillStyle = `#aaFFaa`;
        ctx.fillRect(this.position.x, ctx.canvas.height - this.position.y - this.height, this.width, this.height);
        ctx.lineWidth = 1;
        ctx.strokeRect(this.position.x, ctx.canvas.height - this.position.y - this.height, this.width, this.height);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⭐', this.position.x + this.width / 2, ctx.canvas.height - (this.position.y + this.height / 2));
    }
}
class Field {
    constructor(span = Rect.infinity) {
        this.span = span;
        this.position = new Vec2(convertNaN((this.span.x + this.span.w) / 2, 0), convertNaN((this.span.y + this.span.h) / 2, 0));
        this.velocity = Vec2.zero();
        this.drawer = null;
    }
    //Ignore force and acceleration
    applyForce(force) { }
    applyAcceleration(acceleration) { }
    update(objects) {
        for (const object of objects) {
            if (this.span.overlaps(object.span)) {
                this.handleObject(object);
            }
        }
    }
    setDrawer(drawer) {
        this.drawer = drawer;
        return this;
    }
    draw(ctx) {
        if (this.drawer)
            this.drawer.call(this, ctx);
    }
    static coloredRectDrawer(color) {
        return function (ctx) {
            ctx.fillStyle = color;
            ctx.fillRect(this.span.x, ctx.canvas.height - this.span.y - this.span.h, this.span.w, this.span.h);
            ctx.fillStyle = '#0002';
            ctx.font = `32px sans-serif`;
            const c = this.accel.emoji();
            for (let y = ctx.canvas.height - this.span.y - 5; y > ctx.canvas.height - this.span.y - this.span.h + 5; y -= 40) {
                for (let x = this.span.x + 5; x < this.span.x + this.span.w - 5; x += 40) {
                    ctx.fillText(c, x, y);
                }
            }
        };
    }
}
class ConstantForceField extends Field {
    constructor(force, span = Rect.infinity) {
        super(span);
        this.force = force;
        this.span = span;
    }
    handleObject(object) {
        object.applyForce(this.force);
    }
}
class ConstantAccelerationField extends Field {
    constructor(accel, span = Rect.infinity) {
        super(span);
        this.accel = accel;
        this.span = span;
    }
    setDrawer(drawer) {
        this.drawer = drawer;
        return this;
    }
    handleObject(object) {
        object.applyAcceleration(this.accel);
    }
}
class DragField extends Field {
    constructor(coefficient, span = Rect.infinity) {
        super(span);
        this.coefficient = coefficient;
        this.span = span;
    }
    handleObject(object) {
        // a = -kv^2
        object.applyAcceleration(Vec2.mul(object.velocity, -1 * object.velocity.mag() * this.coefficient));
    }
}
class ThinWall {
    constructor(
    /** position must not change */
    point1, 
    /** position must not change */
    point2, directions) {
        this.point1 = point1;
        this.point2 = point2;
        this.position = this.point1;
        this.wallVector = Vec2.sub(this.point2, this.point1);
        this.velocity = Vec2.zero();
        this.directions = new Map(Direction.all.map(d => [d, directions.includes(d)]));
    }
    get span() {
        return new Rect(this.point1.x, this.point1.y, this.wallVector.x, this.wallVector.y);
    }
    applyAcceleration(acceleration) { }
    applyForce(force) { }
    update(allObjects) { }
    draw(ctx) {
        ctx.beginPath();
        ctx.lineWidth = 4;
        ctx.moveTo(this.point1.x, ctx.canvas.height - this.point1.y);
        ctx.lineTo(this.point2.x, ctx.canvas.height - this.point2.y);
        ctx.stroke();
    }
}
class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(other) {
        this.x += other.x;
        this.y += other.y;
    }
    sub(other) {
        this.x -= other.x;
        this.y -= other.y;
    }
    mul(coefficient) {
        this.x *= coefficient;
        this.y *= coefficient;
    }
    set(x, y) {
        this.x = x;
        this.y = y;
    }
    /** Removes components that are smaller than Vec2.verySmall (1e-6).*/
    clean() {
        if (this.x < Vec2.verySmall && this.x > -Vec2.verySmall)
            this.x = 0;
        if (this.y < Vec2.verySmall && this.y > -Vec2.verySmall)
            this.y = 0;
    }
    mag() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
    norm() {
        return Vec2.div(this, this.mag());
    }
    angle() {
        return Math.atan2(this.y, this.x);
    }
    emoji() {
        const angle = this.angle() / Math.PI;
        if (angle < -7 / 8)
            return '←';
        if (angle < -5 / 8)
            return '↙';
        if (angle < -3 / 8)
            return '↓';
        if (angle < -1 / 8)
            return '↘';
        if (angle < +1 / 8)
            return '→';
        if (angle < +3 / 8)
            return '↗';
        if (angle < +5 / 8)
            return '↑';
        if (angle < +7 / 8)
            return '↖';
        return '←';
    }
    has(dir) {
        switch (dir) {
            case Direction.up:
                return this.y > 0;
            case Direction.down:
                return this.y < 0;
            case Direction.right:
                return this.x > 0;
            case Direction.left:
                return this.x < 0;
        }
    }
    toString() {
        return `(${this.x},${this.y})`;
    }
    static add(a, b) {
        return new Vec2(a.x + b.x, a.y + b.y);
    }
    static addn(a, x, y) {
        return new Vec2(a.x + x, a.y + y);
    }
    static sub(a, b) {
        return new Vec2(a.x - b.x, a.y - b.y);
    }
    static mul(a, c) {
        return new Vec2(a.x * c, a.y * c);
    }
    static div(a, c) {
        return new Vec2(a.x / c, a.y / c);
    }
    static dot(a, b) {
        return a.x * b.x + a.y * b.y;
    }
    static zero() {
        return new Vec2(0, 0);
    }
}
Vec2.verySmall = 1e-6;
const Geom = {
    /** Returns true if the points are listed in counterclockwise order. */
    ccw(a, b, c) {
        return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
    },
    /** Returns true if A1A2 intersects B1B2. */
    linesIntersect(a1, a2, b1, b2) {
        return Geom.ccw(a1, a2, b1) !== Geom.ccw(a1, a2, b2) && Geom.ccw(a1, b1, b2) !== Geom.ccw(a2, b1, b2);
    },
    /** Returns true if moving a1-b1 to a2-b2 overlaps l1-l2, assuming that a1-b1 does not already overlap l1-l2. */
    parallelogramOverlapsLine(a1, b1, a2, b2, l1, l2) {
        return (Geom.linesIntersect(a1, b2, l1, l2) ||
            Geom.linesIntersect(b1, a2, l1, l2) ||
            Geom.linesIntersect(a1, b1, l1, l2) ||
            (Geom.ccw(a1, b2, l1) !== Geom.ccw(b1, a2, l1) &&
                Geom.ccw(a1, b1, l1) !== Geom.ccw(b2, a2, l1)) ||
            (Geom.ccw(a1, b2, l2) !== Geom.ccw(b1, a2, l2) &&
                Geom.ccw(a1, b1, l2) !== Geom.ccw(b2, a2, l2)));
    },
    /** @returns the value t such that a + t*da lies on l1-l2 */
    getT(a, da, l1, l2) {
        const l = Vec2.sub(l2, l1);
        return (((a.x - l1.x) * l.y - (a.y - l1.y) * l.x)
            / (da.y * l.x - da.x * l.y));
    }
};
class Rect {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    contains(p) {
        return (((p.x >= this.x && p.x < (this.x + this.w)) || (this.x == -Infinity && this.w == Infinity))
            &&
                ((p.y >= this.y && p.y < (this.y + this.h)) || (this.y == -Infinity && this.h == Infinity)));
    }
    overlaps(b) {
        return (((b.x <= this.x + this.w && this.x <= b.x + b.w) || (this.x == -Infinity && this.w == Infinity) || (b.x == -Infinity && b.w == Infinity))
            &&
                ((b.y <= this.y + this.h && this.y <= b.y + b.h) || (this.y == -Infinity && this.h == Infinity) || (b.y == -Infinity && b.h == Infinity)));
    }
}
Rect.infinity = new Rect(-Infinity, -Infinity, Infinity, Infinity);
export const Direction = (() => {
    let right = { num: 0, string: "right", vec: new Vec2(1, 0), horizontal: true, vertical: false };
    let down = { num: 1, string: "down", vec: new Vec2(0, 1), horizontal: false, vertical: true };
    let left = { num: 2, string: "left", vec: new Vec2(-1, 0), horizontal: true, vertical: false };
    let up = { num: 3, string: "up", vec: new Vec2(0, -1), horizontal: false, vertical: true };
    right.bitmask = 1 << right.num;
    down.bitmask = 1 << down.num;
    left.bitmask = 1 << left.num;
    up.bitmask = 1 << up.num;
    right.opposite = left;
    left.opposite = right;
    down.opposite = up;
    up.opposite = down;
    right.cw = down;
    down.cw = left;
    left.cw = up;
    up.cw = right;
    down.ccw = right;
    left.ccw = down;
    up.ccw = left;
    right.ccw = up;
    forceType(right);
    forceType(down);
    forceType(left);
    forceType(up);
    return {
        right,
        down,
        left,
        up,
        *[Symbol.iterator]() {
            yield right;
            yield down;
            yield left;
            yield up;
        },
        all: [right, down, left, up],
        number: 4
    };
})();
