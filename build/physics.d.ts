export declare const Time: {
    current: number;
    /** deltatime in seconds */
    delta: number;
    update(): void;
};
export declare function setupPhysics(): (ctx: CanvasRenderingContext2D) => void;
