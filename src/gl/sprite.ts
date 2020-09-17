
import { Texture } from "./texture";
import { Vec4, v4, v2, Vec2 } from "math";

// TODO: this whole thing is awkward as fuck
// think of a better way to handle not-yet-loaded textures.
// probably just stick async/await everywhere,
// to make it explicit.

export class Sprite {
    private spriteData: SpriteData;
    private animationState: AnimationState;

    constructor(
        public readonly name: string,
        private spritesheet: SpritesheetFriend
    ) {
        this.spriteData = this.spritesheet.sprites_[this.name];
        this.animationState = {
            current: Object.keys(this.spriteData)[0],
            frame: 0,
            lastStep: Date.now()
        }
    }

    public get animations(): string[] {
        return Object.keys(this.spriteData);
    }

    public get animation(): string {
        return this.animationState.current;
    }
    public set animation(value: string) {
        if (!this.spriteData[value]) throw new Error(`${value} is not a valid animation for sprite ${this.name} from spritesheet ${this.spritesheet.path_}`);

        this.animationState.current = value ?? Object.keys(this.spriteData)[0];
        this.animationState.frame = 0;
        this.animationState.lastStep = Date.now();
    }

    public get size(): Vec2 {
        const tex = this.texture;
        const uv = this.uv;
        console.log(uv.toString());
        return v2(
            tex.width * uv.z,
            tex.height * uv.w
        );
    }

    public get uv(): Vec4 {
        const anim = this.spriteData[this.animationState.current];
        if (!anim) throw new Error(`${this.animationState.current} is not a valid animation for sprite ${this.name} from spritesheet ${this.spritesheet.path_}`);

        const now = Date.now();
        const currentFrame = anim.frames[this.animationState.frame];
        if (now >= this.animationState.lastStep! + currentFrame.delay) {
            this.animationState.frame = ++this.animationState.frame % anim.frames.length;
            this.animationState.lastStep = now;
        }
        return currentFrame.uv;
    }

    public get texture(): Texture {
        return this.spritesheet.texture_;
    }
}

interface AnimationState {
    current: string;
    frame: number;
    lastStep: number;
}

interface SpritesheetFriend {
    readonly path_: string;
    readonly texture_: Texture;
    readonly sprites_: { [x: string]: SpriteData };
    get(name: string): Sprite;
}

export class Spritesheet {
    private path_: string;
    private texture_: Texture;
    private sprites_: { [x: string]: SpriteData } = {};

    private constructor(
        path: string,
        texture: Texture,
        json: SpritesheetJSON
    ) {
        this.path_ = path;
        this.texture_ = texture;

        for (const [sprite, spriteData] of Object.entries(json.sprites)) {
            this.sprites_[sprite] = {};
            for (const [anim, animData] of Object.entries(spriteData)) {
                this.sprites_[sprite][anim] = {
                    frames: [],
                    direction: animData.direction
                }
                for (let i = 0, len = animData.frames.length; i < len; ++i) {
                    const frame = animData.frames[i];
                    this.sprites_[sprite][anim].frames[i] = {
                        uv: v4(frame.uv.x, frame.uv.y, frame.uv.w, frame.uv.h),
                        delay: frame.delay
                    }
                }
            }
        }
    }

    public get path(): string {
        return this.path_;
    }

    public get texture(): Texture {
        return this.texture_;
    }

    public get sprites(): string[] {
        return Object.keys(this.sprites_);
    }

    public get(name: string): Sprite {
        return new Sprite(name, this as unknown as SpritesheetFriend);
    }

    private static loaded: Map<string, Spritesheet> = new Map();
    public static async load(path: string): Promise<Spritesheet> {
        let spritesheet = Spritesheet.loaded.get(path);
        if (!spritesheet) {
            const json: SpritesheetJSON = await (await fetch(path)).json();
            const texture = await Texture.load(json.spritesheet);
            spritesheet = new Spritesheet(path, texture, json);
            Spritesheet.loaded.set(path, spritesheet);
        }
        return spritesheet;
    }
}

export interface FrameData {
    delay: number;
    uv: Vec4;
}

export interface AnimationData {
    frames: FrameData[],
    direction: "forward" | "backward" | "pingpong"
}

export interface SpriteData {
    [animation: string]: AnimationData
}

interface SpritesheetJSON {
    sprites: {
        [name: string]: {
            [animation: string]: {
                frames: {
                    uv: { x: number, y: number, w: number, h: number }
                    delay: number;
                }[],
                direction: "forward" | "backward" | "pingpong"
            }
        }
    },
    spritesheet: string;
}
