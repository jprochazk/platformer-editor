import { Viewport } from "./viewport";
import { Mat4, Vec3, Vec2, v3, v2, m4, m3 } from "math";
import { cursor } from "common";

export interface Camera {
    readonly view: Mat4;
    readonly projection: Mat4;
}

export interface CameraOptions {
    eye?: Vec3;
    center?: Vec3;
    near?: number;
    far?: number;
    worldUp?: Vec3;
    zoom?: number;
}

function calcView(eye: Vec3, center: Vec3, worldUp: Vec3): Mat4 {
    return Mat4.lookAt(eye, center, worldUp);
}

function calcProjection(viewport: Viewport, near: number, far: number, zoom: number): Mat4 {
    return Mat4.orthographic(0, viewport.width / zoom, viewport.height / zoom, 0, near, far);
}

export class Camera2D {
    private view_: Mat4;
    private projection_: Mat4;

    private eye_: Vec3;
    private center_: Vec3;
    private near_: number;
    private far_: number;
    private worldUp_: Vec3;
    private zoom_: number;

    constructor(
        public viewport: Viewport,
        options: CameraOptions = {}
    ) {
        this.eye_ = options.eye !== undefined ? options.eye : v3(0, 0, -1);
        this.center_ = options.center !== undefined ? options.center : v3(0, 0, 0);
        this.near_ = options.near !== undefined ? options.near : -1;
        this.far_ = options.far !== undefined ? options.far : 1;
        this.worldUp_ = options.worldUp !== undefined ? options.worldUp : v3(0, 1, 0);
        this.zoom_ = options.zoom !== undefined ? options.zoom : 1;

        this.projection_ = m4();
        this.view_ = m4();
        this.update();

        this.viewport.onresize = () => {
            this.update();
        };
    }

    public get view(): Mat4 {
        return this.view_;
    }
    public get projection(): Mat4 {
        return this.projection_;
    }
    public get position(): Vec2 {
        return v2(this.eye_.x, this.eye_.y);
    }
    public set position(value: Vec2) {
        this.eye_ = v3(value.x, value.y, -1);
        this.center_ = v3(value.x, value.y, 0);
        this.update();
    }

    public zoom(delta?: number): number {
        if (delta) {
            this.zoom_ = Math.max(0.2, Math.min(10.0, this.zoom_ + delta));
            this.update();
        }
        return this.zoom_;
    }

    private panning = false;
    private panStart = v2();
    private initialPosition = v2();
    public start(mouse: Vec2) {
        this.panning = true;
        this.panStart = mouse;
        this.initialPosition = this.position;
        cursor("grab");
    }
    public move(value: Vec2) {
        if (!this.panning) return;
        cursor("grab");

        const delta = v2(this.panStart.x - value.x, this.panStart.y - value.y);
        this.position = v2(this.initialPosition.x + delta.x, this.initialPosition.y + delta.y);
    }
    public stop() {
        this.panning = false;
        cursor("default");
    }

    private update() {
        this.projection_ = calcProjection(this.viewport, this.near_, this.far_, this.zoom_);
        this.view_ = calcView(this.eye_, this.center_, this.worldUp_);
    }
}