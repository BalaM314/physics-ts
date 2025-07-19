import { convertNaN } from "./util-funcs.js";
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
    delta: 0,
    update() {
        Time.delta = (Date.now() - Time.current) / 1000;
        Time.current = Date.now();
    },
};
export function setupPhysics() {
    const universe = new Universe();
    universe.add(new ConstantAccelerationField(new Vec2(0, -600)));
    universe.add(new ConstantForceField(new Vec2(0, 600), new Rect(0, 400, 300, 300)).setDrawer(Field.coloredRectDrawer(`#33aa3320`)));
    universe.add(new ConstantForceField(new Vec2(0, 1200), new Rect(420, 50, 300, 750)).setDrawer(Field.coloredRectDrawer(`#aa333320`)));
    universe.add(new DragField(0.02, new Rect(800, 200, 300, 600)).setDrawer(Field.coloredRectDrawer(`#3333aa20`)));
    universe.add(new Box(new Vec2(10, 500), 1, 20, 20, new Vec2(100, 40)));
    return function loop(ctx) {
        universe.update();
        universe.draw(ctx);
    };
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
    update() {
        this.velocity.add(Vec2.mul(this.acceleration, Time.delta));
        this.position.add(Vec2.mul(this.velocity, Time.delta));
        this.acceleration.set(0, 0);
    }
    draw(ctx) {
        ctx.strokeRect(this.position.x, ctx.canvas.height - this.position.y - this.height, this.width, this.height);
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
class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(other) {
        this.x += other.x;
        this.y += other.y;
    }
    mul(coefficient) {
        this.x *= coefficient;
        this.y *= coefficient;
    }
    set(x, y) {
        this.x = x;
        this.y = y;
    }
    mag() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
    static add(a, b) {
        return new Vec2(a.x + b.x, a.y + b.y);
    }
    static mul(a, c) {
        return new Vec2(a.x * c, a.y * c);
    }
    static div(a, c) {
        return new Vec2(a.x / c, a.y / c);
    }
    static zero() {
        return new Vec2(0, 0);
    }
}
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
