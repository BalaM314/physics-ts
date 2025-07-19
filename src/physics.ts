import { convertNaN } from "./util-funcs.js";

interface PhysicsObject {
	position: Vec2;
	velocity: Vec2;
	span: Rect;
	applyForce(force:Vec2):void;
	applyAcceleration(acceleration:Vec2):void;
	update(allObjects: Array<PhysicsObject>):void;
	draw(ctx:CanvasRenderingContext2D):void;
}

class Universe {
	private objects = Array<PhysicsObject>();
	add(object:PhysicsObject){
		this.objects.push(object);
	}
	update(){
		for(let i = 0; i < this.objects.length; i ++){
			this.objects[i]!.update(this.objects);
		}
	}
	draw(ctx:CanvasRenderingContext2D){
		for(let i = 0; i < this.objects.length; i ++){
			this.objects[i]!.draw(ctx);
		}
	}
}

export const Time = {
  current: Date.now(),
	/** deltatime in seconds */
  delta: 0,
  update(){
    Time.delta = (Date.now() - Time.current) / 1000;
    Time.current = Date.now();
  },
};

export function setupPhysics(){
	const universe = new Universe();
	universe.add(new ConstantAccelerationField(
		new Vec2(0, -600)
	));
	universe.add(new ConstantForceField(
		new Vec2(0, 600),
		new Rect(0, 400, 300, 300)
	).setDrawer(Field.coloredRectDrawer(`#33aa3320`)));
	universe.add(new ConstantForceField(
		new Vec2(0, 1200),
		new Rect(420, 50, 300, 750)
	).setDrawer(Field.coloredRectDrawer(`#aa333320`)));
	universe.add(new DragField(
		0.02,
		new Rect(800, 200, 300, 600)
	).setDrawer(Field.coloredRectDrawer(`#3333aa20`)));
	universe.add(new Box(
		new Vec2(10, 500),
		1,
		20, 20,
		new Vec2(100, 40),
	));
	return function loop(ctx:CanvasRenderingContext2D){
		universe.update();
		universe.draw(ctx);
	};
}

/** Rectangular physics object */
class Box implements PhysicsObject {
	constructor(
		public position: Vec2,
		public mass: number,
		public width: number,
		public height: number,
		/** velocity in ms^-1 */
		public velocity = Vec2.zero(),
		/** acceleration in ms^-2 */
		public acceleration = Vec2.zero(),
	){}
	get span(){
		return new Rect(this.position.x, this.position.y, this.width, this.height);
	}
	applyForce(force: Vec2){
		this.acceleration.add(Vec2.div(force, this.mass));
	}
	applyAcceleration(acceleration: Vec2){
		this.acceleration.add(acceleration);
	}
	update(){
		this.velocity.add(Vec2.mul(this.acceleration, Time.delta));
		this.position.add(Vec2.mul(this.velocity, Time.delta));
		this.acceleration.set(0, 0);
	}

	draw(ctx:CanvasRenderingContext2D){
		ctx.strokeRect(this.position.x, ctx.canvas.height - this.position.y - this.height, this.width, this.height);
	}
}

type FieldDrawer<F = Field> = (this: F, ctx: CanvasRenderingContext2D) => void;

abstract class Field implements PhysicsObject {
	constructor(
		public span: Rect = Rect.infinity,
	){}
	position = new Vec2(
		convertNaN((this.span.x + this.span.w) / 2, 0),
		convertNaN((this.span.y + this.span.h) / 2, 0),
	);
	velocity = Vec2.zero();
	drawer: null | FieldDrawer = null;

	//Ignore force and acceleration
	applyForce(force: Vec2){}
	applyAcceleration(acceleration: Vec2){}

	update(objects: Array<PhysicsObject>){
		for(const object of objects){
			if(this.span.overlaps(object.span)){
				this.handleObject(object);
			}
		}
	}
	setDrawer(drawer:FieldDrawer){
		this.drawer = drawer;
		return this;
	}
	abstract handleObject(object:PhysicsObject):void;
	draw(ctx:CanvasRenderingContext2D){
		if(this.drawer) this.drawer.call(this, ctx);
	}
	static coloredRectDrawer(color:string):FieldDrawer {
		return function(ctx){
			ctx.fillStyle = color;
			ctx.fillRect(this.span.x, ctx.canvas.height - this.span.y - this.span.h, this.span.w, this.span.h);
		};
	}
}

class ConstantForceField extends Field {
	constructor(
		public force: Vec2,
		public span: Rect = Rect.infinity,
	){
		super(span);
	}
	handleObject(object: PhysicsObject){
		object.applyForce(this.force);
	}
}

class ConstantAccelerationField extends Field {
	constructor(
		public accel: Vec2,
		public span: Rect = Rect.infinity,
	){
		super(span);
	}
	handleObject(object: PhysicsObject){
		object.applyAcceleration(this.accel);
	}
}

class DragField extends Field {
	constructor(
		public coefficient: number,
		public span: Rect = Rect.infinity,
	){
		super(span);
	}
	handleObject(object: PhysicsObject){
		// a = -kv^2
		object.applyAcceleration(Vec2.mul(object.velocity, -1 * object.velocity.mag() * this.coefficient));
	}
}


class Vec2 {
	constructor(
		public x: number,
		public y: number,
	){}
	add(other: Vec2){
		this.x += other.x;
		this.y += other.y;
	}
	mul(coefficient: number){
		this.x *= coefficient;
		this.y *= coefficient;
	}
	set(x: number, y: number){
		this.x = x;
		this.y = y;
	}
	mag(){
		return Math.sqrt(this.x ** 2 + this.y ** 2);
	}

	static add(a: Vec2, b: Vec2): Vec2 {
		return new Vec2(a.x + b.x, a.y + b.y);
	}
	static mul(a: Vec2, c: number): Vec2 {
		return new Vec2(a.x * c, a.y * c);
	}
	static div(a: Vec2, c: number): Vec2 {
		return new Vec2(a.x / c, a.y / c);
	}

	static zero(){
		return new Vec2(0, 0);
	}
}

class Rect {
	constructor(
		public x: number,
		public y: number,
		public w: number,
		public h: number,
	){}
	contains(p: Vec2): Boolean {
		return (
			((p.x >= this.x && p.x < (this.x + this.w)) || (this.x == -Infinity && this.w == Infinity))
			&&
			((p.y >= this.y && p.y < (this.y + this.h)) || (this.y == -Infinity && this.h == Infinity))
		);
	}
	overlaps(b: Rect): Boolean {
		return (
			((b.x <= this.x + this.w && this.x <= b.x + b.w) || (this.x == -Infinity && this.w == Infinity) || (b.x == -Infinity && b.w == Infinity))
			&&
			((b.y <= this.y + this.h && this.y <= b.y + b.h) || (this.y == -Infinity && this.h == Infinity) || (b.y == -Infinity && b.h == Infinity))
		);
	}
	static infinity = new Rect(-Infinity, -Infinity, Infinity, Infinity);
}

