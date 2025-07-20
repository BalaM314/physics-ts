export declare const Time: {
    current: number;
    /** deltatime in seconds */
    delta: number;
    update(): void;
    reset(): void;
};
declare global {
    var activePoint: Vec2;
}
export declare function setupPhysics(): readonly [() => void, (ctx: CanvasRenderingContext2D) => void];
declare class Vec2 {
    x: number;
    y: number;
    static readonly verySmall = 0.000001;
    constructor(x: number, y: number);
    add(other: Vec2): void;
    sub(other: Vec2): void;
    mul(coefficient: number): void;
    set(x: number, y: number): void;
    /** Removes components that are smaller than Vec2.verySmall (1e-6).*/
    clean(): void;
    mag(): number;
    norm(): Vec2;
    angle(): number;
    emoji(): "←" | "↙" | "↓" | "↘" | "→" | "↗" | "↑" | "↖";
    has(dir: Direction): boolean | undefined;
    toString(): string;
    static add(a: Vec2, b: Vec2): Vec2;
    static addn(a: Vec2, x: number, y: number): Vec2;
    static sub(a: Vec2, b: Vec2): Vec2;
    static mul(a: Vec2, c: number): Vec2;
    static div(a: Vec2, c: number): Vec2;
    static dot(a: Vec2, b: Vec2): number;
    static zero(): Vec2;
}
export type Direction = {
    num: number;
    bitmask: number;
    opposite: Direction;
    string: string;
    vec: Vec2;
    horizontal: boolean;
    vertical: boolean;
    cw: Direction;
    ccw: Direction;
};
export declare const Direction: {
    right: Direction;
    down: Direction;
    left: Direction;
    up: Direction;
    all: Direction[];
    number: number;
    [Symbol.iterator](): IterableIterator<Direction>;
};
export {};
