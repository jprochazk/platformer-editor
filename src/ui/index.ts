
import { Input, splitByUpperCase } from "common";
import { Entity, Registry, Transform, ValueWrapper } from "ecs";
import { Sprite, Spritesheet, Texture } from "gl";
import { m3, Mat3, v2, v4, Vec2, Vec4 } from "math";
import { Polygon } from "physx";

function CreateSpriteEntity(registry: Registry, name: string, sprite: Sprite, position: Vec2, rotation?: number, size?: Vec2): Entity {
    const transform = new Transform(position, rotation ?? 0, size ?? sprite.size);
    console.log(transform.position, transform.rotation, transform.scale);
    return registry.create(name, sprite, transform);
}

const UV = ValueWrapper<Vec4>();
type UV = InstanceType<typeof UV>;
function CreateTextureEntity(registry: Registry, name: string, texture: Texture, position: Vec2, uv?: UV, rotation?: number, size?: Vec2): Entity {
    const transform = new Transform(position, rotation ?? 0, size ?? texture.size);
    console.log(transform.position, transform.rotation, transform.scale);
    return registry.create(name, texture, transform, uv ?? new UV(v4(0, 0, 1, 1)));
}

function CreateColliderEntity(registry: Registry, name: string, shape: Polygon, position: Vec2 = v2()) {
    shape.position = position;
    return registry.create(name, shape);
}

// TODO: move this elsewhere
const TAG_RX = /^[^.#]+/;
const CLASS_RX = /\.[^.#]+/g;
const ID_RX = /#[^.#]+/;

function CreateElement<K extends keyof HTMLElementTagNameMap>(tagName: K, appendTo?: Node): HTMLElementTagNameMap[K];
function CreateElement(element: string, appendTo?: Node): HTMLElement;
function CreateElement(arg0: string, arg1?: Node): HTMLElement {

    const tag = arg0.match(TAG_RX);
    if (!tag) throw new Error(`No tag provided!`);
    const element = document.createElement(tag[0]);

    const classList = arg0.match(CLASS_RX);
    if (classList) {
        for (const cl of classList) {
            element.classList.add(cl.slice(1));
        }
    }

    const id = arg0.match(ID_RX);
    if (id) {
        element.id = id[0].slice(1);
    }

    if (arg1) arg1.appendChild(element);

    return element;
}

// TODO: move each "component" into a separate file
// TODO: prefer template literals + html over CreateElement
// TODO: provide callbacks instead of manually handling everything

export interface ContextMenuOption {
    text: string;
    callback: () => void;
    divisor?: boolean;
}
export class ContextMenu {
    private container: HTMLDivElement;

    constructor(
        options: ContextMenuOption[]
    ) {
        this.container = CreateElement("div.context-menu") as HTMLDivElement;
        this.container.onblur = () => this.hide();
        this.container.tabIndex = -1;

        const list = document.createElement("ul");
        for (let i = 0, len = options.length; i < len; ++i) {
            const option = options[i];

            const item = !option.divisor ? CreateElement("li") : CreateElement("li.divisor");

            const text = CreateElement("a");
            text.textContent = option.text;
            text.onclick = () => {
                this.hide();
                option.callback();
            }

            item.appendChild(text);
            list.appendChild(item);
        }
        this.container.appendChild(list);

        document.body.appendChild(this.container);
    }

    show(position: Vec2) {
        this.container.style.left = `${position.x}px`;
        this.container.style.top = `${position.y}px`;
        this.container.style.display = "block";
        this.container.focus();
    }

    hide() {
        this.container.style.display = "none";
    }
}

export class ConfirmDialog {
    private container: HTMLDivElement;
    private buttons: {
        "confirm": HTMLButtonElement,
        "cancel": HTMLButtonElement
    };
    private confirm: (() => void) | null = null;
    private cancel: (() => void) | null = null;

    constructor() {
        this.container = CreateElement("div.confirm-dialog") as HTMLDivElement;
        this.container.onblur = (e) => {
            if (!(
                e.relatedTarget === this.buttons.confirm ||
                e.relatedTarget === this.buttons.cancel
            )) {
                this.hide();
            }
        }
        this.container.tabIndex = -1;

        this.buttons = {
            "confirm": CreateElement("button"),
            "cancel": CreateElement("button")
        };
        this.buttons.confirm.id = "confirm";
        this.buttons.confirm.textContent = "Confirm";
        this.buttons.cancel.id = "cancel";
        this.buttons.cancel.textContent = "Cancel";

        this.container.appendChild(this.buttons.confirm);
        this.container.appendChild(this.buttons.cancel);

        this.buttons.confirm.onclick = () => {
            if (this.confirm) this.confirm();
            this.hide();
        }
        this.buttons.cancel.onclick = () => {
            if (this.cancel) this.cancel();
            this.hide();
        }

        document.body.appendChild(this.container);
    }

    show(position: Vec2, confirm: () => void, cancel: () => void) {
        this.confirm = confirm;
        this.cancel = cancel;
        this.container.style.display = "flex";
        this.container.style.left = `${position.x}px`;
        this.container.style.top = `${position.y}px`;
        this.container.focus();
    }

    hide() {
        this.confirm = null;
        this.cancel = null;
        this.container.style.display = "none";
    }
}

export class Alert {
    private static alertContainer_: HTMLDivElement;
    static info(text: string, duration: number = 3000) {
        this.create("info", text, duration);
    }
    static error(text: string, duration: number = 3000) {
        this.create("error", text, duration);
    }
    static warn(text: string, duration: number = 3000) {
        this.create("warn", text, duration);
    }

    private static create(type: "info" | "error" | "warn", text: string, duration: number) {
        // lazily initialize container
        if (!this.alertContainer_) {
            this.alertContainer_ = CreateElement("div.alert-container") as HTMLDivElement;
            document.body.appendChild(this.alertContainer_);
        }

        const alert = CreateElement(`span.alert.${type}`) as HTMLParagraphElement;
        alert.textContent = text;
        setTimeout(() => {
            alert.classList.add("inactive");
            setTimeout(() => alert.remove(), 1100);
        }, duration);
        this.alertContainer_.appendChild(alert);
    }
}

export interface EntityProperty {
    label: string;
    type: "checkbox" | "text" | "number";
}
export interface EntityCreateOption {
    name: string;
    properties: EntityProperty[];
    oncreate: (properties: Map<string, string | number>) => void;
}
export class EntityCreateDialog {
    private container: HTMLDivElement;
    private selection: HTMLSelectElement;
    private properties: HTMLFormElement;
    private options: Map<string, { html: string, callback: (properties: Map<string, string | number>) => void }>;

    private buttons: {
        confirm: HTMLButtonElement,
        cancel: HTMLButtonElement
    };

    constructor(
        options: EntityCreateOption[]
    ) {
        this.container = <HTMLDivElement>CreateElement("div.entity", document.body);

        this.selection = <HTMLSelectElement>CreateElement("select", this.container);
        this.properties = <HTMLFormElement>CreateElement("form.properties", this.container);
        this.properties.autocomplete = "off";
        this.options = new Map;
        for (const option of options) {
            const optionID = option.name.replace(/\s/g, "").toLowerCase();
            const optionElement = <HTMLOptionElement>CreateElement("option");
            optionElement.value = optionID;
            optionElement.text = option.name;
            this.selection.add(optionElement);

            let properties = "";
            for (const property of option.properties) {
                const propertyID = property.label.replace(/\s/g, "-").toLowerCase();
                properties += `
                    <label for="${propertyID}">
                        ${property.label}
                        <input type="${property.type}" id="${propertyID}" />
                        ${property.type === "checkbox" ? "<span class=\"checkbox\"></span>" : ""}
                        <br />
                    </label>
                    <br />
                `;
            }
            this.options.set(optionID, { html: properties, callback: option.oncreate });
        }

        const buttonContainer = <HTMLDivElement>CreateElement("div.confirm", this.container);
        this.buttons = {
            confirm: <HTMLButtonElement>CreateElement("button#confirm", buttonContainer),
            cancel: <HTMLButtonElement>CreateElement("button#cancel", buttonContainer)
        };
        this.buttons.confirm.textContent = "Confirm";
        this.buttons.confirm.onclick = this.confirm;
        this.buttons.cancel.textContent = "Cancel";
        this.buttons.cancel.onclick = this.cancel;

        this.selection.onchange = this.select;
        this.selection.selectedIndex = 0;
        this.properties.innerHTML = this.options.get(this.selection.value)?.html
            ?? `No properties for ${this.selection.value}`;

        this.hide();
    }

    show = () => {
        this.container.style.display = "flex";
    }

    hide = () => {
        this.container.style.display = "none";
    }

    private confirm = () => {
        const properties = new Map<string, any>();
        for (let i = 0, len = this.properties.elements.length; i < len; ++i) {
            const prop = (<HTMLInputElement>this.properties.elements.item(i));
            properties.set(prop.id, prop.value);
        }
        const option = this.options.get(this.selection.value);
        if (option) {
            option.callback(properties);
        }
        this.hide();
    }

    private cancel = () => {
        this.selection.selectedIndex = 0;
        this.properties.innerHTML = this.options.get(this.selection.value)?.html
            ?? `No properties for ${this.selection.value}`;
        this.hide();
    }

    private select = () => {
        this.properties.innerHTML = this.options.get(this.selection.value)?.html
            ?? `No properties for ${this.selection.value}`;
    }
}

// TODO: remove glue between dialogs and tools from toolbar
export class Toolbar {
    private container_: HTMLDivElement;
    private buttons_: {
        "menu": HTMLButtonElement,
        "document": HTMLButtonElement,
        "save": HTMLButtonElement,
        "load": HTMLButtonElement,
        "create": HTMLButtonElement,
        "delete": HTMLButtonElement,
        "translate": HTMLButtonElement,
        "rotate": HTMLButtonElement,
        "scale": HTMLButtonElement,
        "polygon": HTMLButtonElement,
    }
    private selected_: "translate" | "rotate" | "scale" | "polygon" | null = null;

    private dialogs: {
        confirm: ConfirmDialog;
        create: EntityCreateDialog;
    }

    private contextMenu: ContextMenu;

    constructor(
        private input: Input,
        private registry: Registry
    ) {
        // TODO: make this not hardcoded, maybe using document.createElement instead
        const container = document.querySelector("div.container#toolbar") as HTMLDivElement | null;
        if (!container) throw new Error(`div.container#toolbar not found`);
        this.container_ = container;

        const found = {
            "menu": this.container_.querySelector("button.menu-button#menu"),
            "document": this.container_.querySelector("button.menu-button#document"),
            "save": this.container_.querySelector("button.menu-button#save"),
            "load": this.container_.querySelector("button.menu-button#load"),
            "create": this.container_.querySelector("button.menu-button#create"),
            "delete": this.container_.querySelector("button.menu-button#delete"),
            "translate": this.container_.querySelector("button.menu-button#translate"),
            "rotate": this.container_.querySelector("button.menu-button#rotate"),
            "scale": this.container_.querySelector("button.menu-button#scale"),
            "polygon": this.container_.querySelector("button.menu-button#polygon"),
        }
        for (const key of Object.keys(found) as (Extract<keyof typeof found, string>)[]) {
            const element = found[key];
            if (element === null)
                throw new Error(`Could not find ${key}`);
            if (!(element instanceof HTMLButtonElement))
                throw new Error(`${key} is not button`);
        }
        this.buttons_ = found as typeof Toolbar.prototype.buttons_;

        this.dialogs = {
            confirm: new ConfirmDialog,
            create: new EntityCreateDialog([
                {
                    name: "Sprite",
                    properties: [
                        { label: "Name", type: "text" },
                        { label: "Spritesheet", type: "text" },
                        { label: "Sprite", type: "text" },
                    ],
                    // TODO: better API for properties, so they're checked ahead of time
                    oncreate: async (properties) => {
                        const name = properties.get("name") as string;
                        const spritesheet = properties.get("spritesheet") as string;
                        const sprite = properties.get("sprite") as string;

                        let missing = false;
                        if (!name) {
                            missing = true;
                            Alert.error(`Missing required property: Name`);
                        }
                        if (!spritesheet) {
                            missing = true;
                            Alert.error(`Missing required property: Spritesheet`);
                        }
                        if (!sprite) {
                            missing = true;
                            Alert.error(`Missing required property: Sprite`);
                        }
                        if (missing) return;

                        // TODO: investigate sprite not rendering
                        CreateSpriteEntity(this.registry,
                            name,
                            (await Spritesheet.load(spritesheet)).get(sprite),
                            v2(window.innerWidth / 2, window.innerHeight / 2)
                        );
                    }
                },
                {
                    name: "Collider",
                    properties: [
                        { label: "Name", type: "text" },
                    ],
                    oncreate: (properties) => {
                        const name = properties.get("name") as string;
                        if (!name) {
                            Alert.error(`Missing required property: Name`);
                            return;
                        }

                        CreateColliderEntity(this.registry,
                            name, new Polygon([
                                v2(-64, -64),
                                v2(64, -64),
                                v2(64, 64),
                                v2(-64, 64),
                            ]), v2(window.innerWidth / 2, window.innerHeight / 2)
                        );
                    }
                }
            ])
        }

        this.contextMenu = new ContextMenu([]);

        this.buttons_.menu.onclick = this.toggle;
        this.buttons_.create.onclick = () => {
            this.dialogs.create.show();
        }

        this.buttons_.translate.onclick = () => this.select("translate");
        this.input.on.keydown("T", () => { this.select("translate"); return true; });
        this.buttons_.rotate.onclick = () => this.select("rotate");
        this.input.on.keydown("R", () => { this.select("rotate"); return true; });
        this.buttons_.scale.onclick = () => this.select("scale");
        this.input.on.keydown("S", () => { this.select("scale"); return true; });
        this.buttons_.polygon.onclick = () => this.select("polygon");
        this.input.on.keydown("G", () => { this.select("polygon"); return true; });

        this.input.on.keydown("Escape" as any, () => { this.select(null); return true; })
    }

    set ondelete(callback: () => void) {
        this.buttons_.delete.onclick = callback;
    }

    get selected(): typeof Toolbar.prototype.selected_ { return this.selected_; }

    cmenu(options: ContextMenuOption[], position: Vec2) {
        this.contextMenu = new ContextMenu(options);
        this.contextMenu.show(position);
    }

    confirm(callback: () => void) {
        // TODO: think of a better way to auto-focus on the canvas element after doing something
        // in a dialog
        this.dialogs.confirm.show(v2(window.innerWidth / 2, window.innerHeight / 2), () => {
            callback();
            this.input.focus();
        }, () => this.input.focus());
    }

    private toggle = () => {
        for (const element of Array.from(this.container_.children)) {
            if (element.id === "menu") continue;
            if (element.classList.contains("hide")) {
                element.classList.remove("hide");
            } else {
                element.classList.add("hide");
            }
        }
    }

    private select = (which: typeof Toolbar.prototype.selected_) => {
        this.input.focus();

        if (this.selected_ !== null) {
            this.buttons_[this.selected_].classList.remove("selected");
            if (this.selected_ === which) {
                this.selected_ = null;
                return;
            }
        }

        if (which !== null) this.buttons_[which].classList.add("selected");
        this.selected_ = which;
    }
}

// TODO: UI and TransformContext don't belong together
const TWO_PI = 2 * Math.PI;

interface Target {
    position: Vec2;
    rotation: number;
    scale: Vec2;
    matrix: Mat3;
}

function translate(target: Target, initial: { position: Vec2 }, delta: Vec2) {
    target.position = v2(
        initial.position.x + delta.x,
        initial.position.y + delta.y
    );
}

function rotate(target: Target, initial: { rotation: number }, mouse: Vec2) {
    // pivot is implicitly the target's center point
    // could be an arbitrary point
    const pivot = target.position;

    let angle = Math.atan2(
        pivot.x - mouse.x,
        -pivot.y + mouse.y
    );
    if (angle < 0) angle += TWO_PI;

    //let initialAngle = Math.atan2(
    //    pivot.x - this.initial.mouse.x,
    //    this.initial.mouse.x - pivot.y
    //);
    //if (initialAngle < 0) initialAngle += TWO_PI;
    //const angle = currentAngle - initialAngle;

    target.rotation = initial.rotation + angle;
}

const ControlPoints: { [x: string]: Vec2 } = {
    BottomLeft: v2(-1, -1),
    Left: v2(-1, 0),
    TopLeft: v2(-1, 1),
    Top: v2(0, 1),
    TopRight: v2(1, 1),
    Right: v2(1, 0),
    BottomRight: v2(1, -1),
    Bottom: v2(0, -1),
}
class Translation {
    private initial: {
        position: Vec2;
        mouse: Vec2;
    };

    private valid_ = false;

    constructor(
        private target: Target,
        mouse: Vec2
    ) {
        this.initial = {
            position: target.position.clone(),
            mouse: mouse.clone(),
        };

        const localMouse = mouse.clone().transform(target.matrix.invert());
        if (localMouse.x > -1 && localMouse.x < 1 &&
            localMouse.y > -1 && localMouse.y < 1) {
            this.valid_ = true;
        }
    }

    get valid(): boolean { return this.valid_; }

    move(mouse: Vec2) {
        const delta = v2(
            mouse.x - this.initial.mouse.x,
            mouse.y - this.initial.mouse.y
        );
        translate(this.target, this.initial, delta);
    }
}

class Rotation {
    private initial: {
        rotation: number;
        angle: number;
    }

    private valid_ = false;

    constructor(
        private target: Target,
        mouse: Vec2
    ) {
        this.initial = {
            rotation: target.rotation,
            angle: Math.atan2(target.position.x - mouse.x, mouse.y - target.position.y)
        };

        this.valid_ = true;
    }

    get valid(): boolean { return this.valid_; }

    move(mouse: Vec2) {
        const currentAngle = Math.atan2(this.target.position.x - mouse.x, mouse.y - this.target.position.y);
        const deltaAngle = currentAngle - this.initial.angle;
        this.target.rotation = this.initial.rotation + deltaAngle;
    }
}

function getScalingType(target: Target, mouse: Vec2): string | null {
    const inverse = target.matrix.invert();
    const localMouse = mouse.clone().transform(inverse);
    let nearest: string | null = null;
    let nearestDist = 0.1;
    for (const key of Object.keys(ControlPoints)) {
        const dist = localMouse.dist(ControlPoints[key]);
        if (dist < nearestDist) {
            nearestDist = dist;
            nearest = key
        }
    }
    return nearest;
}

// BUG: when scaling to negative values, polygon points go flying
// TODO: make sure you can't scale into negative values
// TODO: adjust bounding box of polygon when editing points, so that bounding box fully encompases polygon
class Scale {
    private initial: {
        position: Vec2;
        scale: Vec2;
        mouse: Vec2;
    }

    private type: string | null;

    private valid_ = false;

    constructor(
        private target: Target,
        mouse: Vec2
    ) {
        this.initial = {
            position: target.position.clone(),
            scale: target.scale.clone(),
            mouse: mouse.clone()
        };

        this.type = getScalingType(this.target, mouse);

        this.valid_ = this.type !== null;
    }

    get valid(): boolean { return this.valid_; }

    move(mouse: Vec2) {
        const halfDelta = v2(
            (mouse.x - this.initial.mouse.x) / 2,
            (mouse.y - this.initial.mouse.y) / 2
        );
        const rotatedDelta = halfDelta.clone().transform(m3().rotate(-this.target.rotation));

        let direction;
        switch (this.type) {
            case "Left": direction = v2(-1, 0); break;
            case "Right": direction = v2(1, 0); break;
            case "Top": direction = v2(0, 1); break;
            case "Bottom": direction = v2(0, -1); break;
            case "BottomLeft": direction = v2(-1, -1); break;
            case "BottomRight": direction = v2(1, -1); break;
            case "TopLeft": direction = v2(-1, 1); break;
            case "TopRight": direction = v2(1, 1); break;
            default: return;
        }
        const realDelta = v2(
            direction.x * rotatedDelta.x,
            direction.y * rotatedDelta.y
        );

        this.target.scale = v2(this.initial.scale.x + realDelta.x, this.initial.scale.y + realDelta.y);
        const translation = v2(
            Math.abs(direction.x) * rotatedDelta.x,
            Math.abs(direction.y) * rotatedDelta.y
        ).transform(m3().rotateThis(this.target.rotation));
        this.target.position = v2(this.initial.position.x + translation.x, this.initial.position.y + translation.y);
    }
}

class MovePoint {
    private initial!: {
        position: Vec2,
        mouse: Vec2
    };
    private target!: Polygon;
    private pointIndex!: number;

    private valid_ = false;

    constructor(
        target: Target,
        mouse: Vec2,
    ) {
        if (target instanceof Polygon) {
            this.target = target;
            const targetPoints = target.points;

            let nearestPointIndex = -1;
            let nearestDist = 16;
            for (let i = 0, len = targetPoints.length; i < len; ++i) {
                const dist = mouse.dist(targetPoints[i]);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestPointIndex = i;
                    this.valid_ = true;
                    break;
                }
            }

            this.pointIndex = nearestPointIndex;
            this.initial = {
                position: target.points[this.pointIndex],
                mouse: mouse.clone()
            };
        }
    }

    get valid(): boolean { return this.valid_; }

    move(mouse: Vec2) {
        const delta = v2(
            mouse.x - this.initial.mouse.x,
            mouse.y - this.initial.mouse.y
        );
        this.target.movePoint(this.pointIndex, v2(
            this.initial.position.x + delta.x,
            this.initial.position.y + delta.y
        ));
    }
}

interface Transformation {
    valid: boolean;
    move(mouse: Vec2): void;
}

interface TransformationConstructor {
    new(target: Target, mouse: Vec2): Transformation
}

const TransformationMap: { [x: string]: TransformationConstructor } = {
    "translate": Translation,
    "rotate": Rotation,
    "scale": Scale,
    "polygon": MovePoint,
}
type TransformationMap = typeof TransformationMap;

export class TransformContext {
    private transformation: Transformation | null = null;

    begin(tool: "polygon" | "translate" | "rotate" | "scale", target: Target, mouse: Vec2): boolean {
        const Transformation = TransformationMap[tool];
        if (!Transformation) return false;

        this.transformation = new Transformation(target, mouse);
        return this.transformation.valid;
    }

    move(mouse: Vec2): boolean {
        if (!this.transformation || !this.transformation.valid) return false;
        this.transformation.move(mouse);
        return true;
    }

    end() {
        if (this.transformation !== null) {
            this.transformation = null;
            return true;
        }
        return false;
    }
}
