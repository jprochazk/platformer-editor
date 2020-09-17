
import { Input, Mutable, Application, FPSCount } from "common";
import { CreateContext, Sprite, Spritesheet, Renderer, Viewport, Texture, Camera2D } from "gl";
import { Vec2, v2, Vec4, v4 } from "math";
import { Entity, NameTag, Registry, Transform, ValueWrapper } from "ecs";
import { intersect, Line, Point, Polygon } from "physx";
import { Alert, ConfirmDialog, Toolbar, TransformContext } from "ui";

/*
1. re-implement camera panning/zooming
2. electron app
3. allow uploading sprites instead of typing the damn name
4. map name, width, height
5. scrolling background
6. save/load map
*/

function CreateSpriteEntity(registry: Registry, name: string, sprite: Sprite, position: Vec2, rotation?: number, size?: Vec2): Entity {
    return registry.create(name, sprite, new Transform(position, rotation ?? 0, size ?? sprite.size));
}

const UV = ValueWrapper<Vec4>();
type UV = InstanceType<typeof UV>;
function CreateTextureEntity(registry: Registry, name: string, texture: Texture, position: Vec2, uv?: UV, rotation?: number, size?: Vec2): Entity {
    return registry.create(name, texture, new Transform(position, rotation ?? 0, size ?? texture.size), uv ?? new UV(v4(0, 0, 1, 1)));
}

function CreateColliderEntity(registry: Registry, name: string, shape: Polygon, position: Vec2 = v2()) {
    shape.position = position;
    return registry.create(name, shape);
}

function isSpriteEntity(registry: Registry, entity: Entity): boolean {
    return (
        registry.has(Sprite, entity) &&
        registry.has(Transform, entity)
    );
}

function isTextureEntity(registry: Registry, entity: Entity): boolean {
    return (
        registry.has(Texture, entity) &&
        registry.has(Transform, entity) &&
        registry.has(UV, entity)
    )
}

function IsColliderEntity(registry: Registry, entity: Entity): boolean {
    return (
        registry.has(Polygon, entity)
    );
}

function scaledMousePos(input: Input, camera: Camera2D) {
    const mpos = input.mousePos;
    const zoom = camera.zoom();
    return v2(
        mpos.x / zoom,
        mpos.y / zoom
    );
}
function adjustedMousePos(input: Input, camera: Camera2D) {
    const mpos = input.mousePos;
    const cpos = camera.position;
    const zoom = camera.zoom();
    return v2(
        cpos.x + (mpos.x / zoom),
        cpos.y + (mpos.y / zoom)
    );
}

function getNearestEdgeMid(poly: Polygon, point: Vec2, radius: number): [number, Vec2] | null {
    const points = poly.points;

    let nearestMid: Vec2 | null = null;
    let nearestDist = radius;
    let nearestIndex = -1;
    for (let i = 0, len = points.length; i < len; ++i) {
        const A = points[i];
        const B = points[(i + 1) % len];

        const mid = v2(
            A[0] + (B[0] - A[0]) * 0.5,
            A[1] + (B[1] - A[1]) * 0.5,
        );
        const dist = point.dist(mid);
        if (dist < nearestDist) {
            nearestDist = dist;
            nearestMid = mid;
            nearestIndex = (i + 1) % len;
        }
    }
    if (!nearestMid) return null;
    return [nearestIndex, nearestMid];
}

function getNearestPoint(poly: Polygon, point: Vec2, radius: number): [number, Vec2] | null {
    const points = poly.points;

    let nearestPoint: Vec2 | null = null;
    let nearestDist = radius;
    let nearestIndex = -1;
    for (let i = 0, len = points.length; i < len; ++i) {
        const dist = point.dist(points[i]);
        if (dist < nearestDist) {
            nearestDist = dist;
            nearestPoint = points[i];
            nearestIndex = i;
        }
    }
    if (!nearestPoint) return null;
    return [nearestIndex, nearestPoint];
}

@Application({ rate: 60 })
export class Editor {
    // rendering related
    private canvas!: HTMLCanvasElement;
    private gl!: WebGL2RenderingContext;
    private renderer!: Renderer;
    private viewport!: Viewport;
    private camera!: Camera2D;
    private fps!: FPSCount;
    private input!: Input;

    // ecs
    private registry!: Registry;

    // editor tools
    private selectedEntity!: Entity;
    private toolbar!: Toolbar;
    private transformContext!: TransformContext;

    public init = async () => {
        const gameCanvas: HTMLCanvasElement | null = document.querySelector("canvas#game");
        if (!gameCanvas) throw new Error(`Could not select "canvas#game"`);

        this.canvas = gameCanvas;
        this.gl = CreateContext(this.canvas, "webgl2", { alpha: true, antialias: true });
        this.viewport = new Viewport(this.gl);
        this.camera = new Camera2D(this.viewport);
        this.renderer = new Renderer(this.gl);

        this.registry = new Registry();

        this.transformContext = new TransformContext;

        this.input = new Input(this.canvas);
        this.selectedEntity = -1;
        this.toolbar = new Toolbar(this.input, this.registry);
        this.initInput();
        this.fps = new FPSCount();


        // NOTE: <!-- temporary
        const spritesheet = await Spritesheet.load("assets/sprites/cate.json");
        const sprite = spritesheet.get("cat");
        CreateTextureEntity(this.registry, "cat", sprite.texture, v2(this.viewport.width / 5, this.viewport.height / 2), new UV(sprite.uv), 0, sprite.size);

        CreateTextureEntity(this.registry,
            "YEP COCK",
            await Texture.load("assets/YEP.jpg"),
            v2(this.viewport.width / 2, this.viewport.height / 2),
            new UV(v4(0, 0, 1, 1)),
            0,
            v2(112, 112)
        );

        const points = [
            sprite.size.mult(v2(-1, -1)),
            sprite.size.mult(v2(1, -1)),
            sprite.size.mult(v2(0.5, 1)),
            sprite.size.mult(v2(-1, 2.1)),
        ];
        CreateColliderEntity(this.registry, "test_collision", new Polygon(points), v2(this.viewport.width / 2, this.viewport.height / 2));
        // temporary --!>

        //@ts-ignore
        window.app = this;
    }

    public update = () => {
        document.title = `FPS: ${this.fps.get()}`;
        this.input.poll();
    }

    public render = (time: number) => {
        this.fps.update(time);

        this.viewport.resize();
        // TODO: render

        this.renderer.beginScene(this.camera, v4(100 / 255, 100 / 255, 100 / 255, 1));
        // sprites
        for (const [entity, sprite, transform] of this.registry.view(Sprite, Transform)) {
            this.renderer.drawQuad(
                transform.matrix,
                sprite.texture, sprite.uv
            );
            if (entity === this.selectedEntity && this.toolbar.selected !== "polygon") {
                this.renderer.drawPath([
                    v2(-1, -1).transform(transform.matrix),
                    v2(-1, 1).transform(transform.matrix),
                    v2(1, 1).transform(transform.matrix),
                    v2(1, -1).transform(transform.matrix),
                ], v4(220 / 255, 220 / 255, 220 / 255, 1));
                this.renderer.drawPoints([
                    v2(-1, -1).transform(transform.matrix),
                    v2(-1, 1).transform(transform.matrix),
                    v2(1, 1).transform(transform.matrix),
                    v2(1, -1).transform(transform.matrix),
                    v2(-1, 0).transform(transform.matrix),
                    v2(0, 1).transform(transform.matrix),
                    v2(1, 0).transform(transform.matrix),
                    v2(0, -1).transform(transform.matrix),
                ], v4(220 / 255, 220 / 255, 220 / 255, 1));
            }
        }

        // textures
        for (const [entity, texture, transform, uv] of this.registry.view(Texture, Transform, UV)) {
            this.renderer.drawQuad(
                transform.matrix,
                texture, uv.value
            );
            if (entity === this.selectedEntity && this.toolbar.selected !== "polygon") {
                this.renderer.drawPath([
                    v2(-1, -1).transform(transform.matrix),
                    v2(-1, 1).transform(transform.matrix),
                    v2(1, 1).transform(transform.matrix),
                    v2(1, -1).transform(transform.matrix),
                ], v4(220 / 255, 220 / 255, 220 / 255, 1));
                this.renderer.drawPoints([
                    v2(-1, -1).transform(transform.matrix),
                    v2(-1, 1).transform(transform.matrix),
                    v2(1, 1).transform(transform.matrix),
                    v2(1, -1).transform(transform.matrix),
                    v2(-1, 0).transform(transform.matrix),
                    v2(0, 1).transform(transform.matrix),
                    v2(1, 0).transform(transform.matrix),
                    v2(0, -1).transform(transform.matrix),
                ], v4(220 / 255, 220 / 255, 220 / 255, 1));
            }
        }

        // colliders
        for (const [entity, polygon] of this.registry.view(Polygon)) {
            const selected = entity === this.selectedEntity;

            const points = polygon.points as Mutable<Vec2[]>;
            const color = v4(
                120 / 255,
                selected ? 180 / 255 : 220 / 255,
                selected ? 120 / 255 : 220 / 255,
                1
            );
            this.renderer.drawPath(points, color);
            this.renderer.drawPoints(points, color);

            if (entity === this.selectedEntity && this.toolbar.selected !== null) {
                if (this.toolbar.selected !== "polygon") {
                    this.renderer.drawPath([
                        v2(-1, -1).transform(polygon.matrix),
                        v2(-1, 1).transform(polygon.matrix),
                        v2(1, 1).transform(polygon.matrix),
                        v2(1, -1).transform(polygon.matrix),
                    ], v4(220 / 255, 220 / 255, 220 / 255, 1));
                    this.renderer.drawPoints([
                        v2(-1, -1).transform(polygon.matrix),
                        v2(-1, 1).transform(polygon.matrix),
                        v2(1, 1).transform(polygon.matrix),
                        v2(1, -1).transform(polygon.matrix),
                        v2(-1, 0).transform(polygon.matrix),
                        v2(0, 1).transform(polygon.matrix),
                        v2(1, 0).transform(polygon.matrix),
                        v2(0, -1).transform(polygon.matrix),
                    ], v4(220 / 255, 220 / 255, 220 / 255, 1));
                } else {
                    if (this.input.keys["ShiftLeft"]) {
                        const found = getNearestEdgeMid(polygon, this.input.mousePos.clone(), 64);
                        if (found) {
                            const [, mid] = found;
                            this.renderer.drawPoints([mid], v4(120 / 255, 220 / 255, 220 / 255, 1));
                        }
                    } else if (this.input.keys["ControlLeft"]) {
                        const found = getNearestPoint(polygon, this.input.mousePos.clone(), 64);
                        if (found) {
                            const [, point] = found;
                            this.renderer.drawPoints([point], v4(120 / 255, 220 / 255, 220 / 255, 1));
                        }
                    }
                }
            }
        }
        this.renderer.endScene();
    }

    private initInput() {
        // TODO: 
        // input is only attached to canvas, which means that keybindings only work when canvas is in focus.
        // make them work always when no popup/dialog is active.

        this.toolbar.ondelete = () => {
            this.toolbar.confirm(() => {
                this.registry.destroy(this.selectedEntity);
            });
        }

        this.input.on.click("Right", () => {
            return true;
        });
        (<HTMLCanvasElement>this.gl.canvas).oncontextmenu = (event) => {
            event.preventDefault();

            this.toolbar.cmenu([
                {
                    text: "Destroy selected entity",
                    // TODO: this is janky, somehow make the input auto-focus back onto the canvas...
                    callback: () => this.toolbar.confirm(() => this.registry.destroy(this.selectedEntity))
                },
                {
                    text: "Rename",
                    callback: () => Alert.error("Not implemented")
                }
            ], v2(this.input.mousePos.x, window.innerHeight - this.input.mousePos.y));
        }

        this.input.on.mousedown("Left", () => {
            const selected = this.toolbar.selected;
            if (selected === null) return false;

            if (!this.registry.alive(this.selectedEntity)) return false;

            const target = this.registry.get(Transform, this.selectedEntity) ?? this.registry.get(Polygon, this.selectedEntity) ?? null;
            if (!target) return false;

            if (selected === "polygon" && target instanceof Polygon) {
                if (this.input.keys["ShiftLeft"]) {
                    const found = getNearestEdgeMid(target, this.input.mousePos.clone(), 64);
                    if (!found) return false;

                    const [index, mid] = found;
                    target.addPoint(index, mid);
                    return true;
                } else if (this.input.keys["ControlLeft"]) {
                    if (target.length > 3) {
                        const found = getNearestPoint(target, this.input.mousePos.clone(), 64);
                        if (!found) return false;

                        const [index,] = found;
                        target.removePoint(index);
                        return true;
                    }
                }
            }

            return this.transformContext.begin(selected, target, this.input.mousePos.clone());
        });

        this.input.on.mousedown("Left", () => {
            let found = -1;

            const mouse = this.input.mousePos.clone();
            for (const [entity, transform] of this.registry.view(Transform)) {
                const localMouse = mouse.clone().transform(transform.matrix.invert());
                if (localMouse.x > -1 && localMouse.x < 1 &&
                    localMouse.y > -1 && localMouse.y < 1) {
                    found = entity;
                    break;
                }
            }
            if (found === -1) {
                for (const [entity, polygon] of this.registry.view(Polygon)) {
                    const mousePoint = Point.from(mouse);
                    if (intersect(mousePoint, polygon)) {
                        found = entity;
                        break;
                    }
                }
            }

            if (this.selectedEntity === found) return false;
            this.selectedEntity = found;
            return true;
        });

        this.input.on.mousemove(() => {
            return this.transformContext.move(this.input.mousePos.clone());
        });

        this.input.on.mouseup("Left", () => {
            return this.transformContext.end();
        });
    }
}
