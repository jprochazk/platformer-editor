
import { Vec2, v2 } from "math";

export class Input {
    // @ts-ignore OK because Boolean(undefined) === false
    private keys_: KeyMap = {};
    // @ts-ignore same as above
    private mouse_: ButtonMap = {};
    private mousePos_: Vec2 = v2();
    private pmousePos_: Vec2 = v2();
    private wheelDelta_: number = 0;

    private callbacks: {
        keypress: Map<string, (() => boolean)[]>;
        keydown: Map<string, (() => boolean)[]>;
        keyup: Map<string, (() => boolean)[]>;
        click: Map<string, (() => boolean)[]>;
        mousedown: Map<string, (() => boolean)[]>;
        mouseup: Map<string, (() => boolean)[]>;
        mousemove: (() => boolean)[];
        wheel: (() => boolean)[];
    };

    on: {
        keypress: (key: keyof Key, callback: () => boolean) => void;
        keydown: (key: keyof Key, callback: () => boolean) => void;
        keyup: (key: keyof Key, callback: () => boolean) => void;
        click: (button: keyof Button, callback: () => boolean) => void;
        mousedown: (button: keyof Button, callback: () => boolean) => void;
        mouseup: (button: keyof Button, callback: () => boolean) => void;
        mousemove: (callback: () => boolean) => void;
        wheel: (callback: () => boolean) => void;
    };

    constructor(
        private element: HTMLElement
    ) {
        this.callbacks = {
            keypress: new Map,
            keydown: new Map,
            keyup: new Map,
            click: new Map,
            mousedown: new Map,
            mouseup: new Map,
            mousemove: new Array,
            wheel: new Array,
        };
        this.on = {
            keypress: (key: keyof Key | string, callback: () => boolean) => {
                const callbacks = this.callbacks.keypress.get(key);
                if (!callbacks) this.callbacks.keypress.set(key, [callback]);
                else callbacks.push(callback);
            },
            keydown: (key: keyof Key | string, callback: () => boolean) => {
                const callbacks = this.callbacks.keydown.get(key);
                if (!callbacks) this.callbacks.keydown.set(key, [callback]);
                else callbacks.push(callback);
            },
            keyup: (key: keyof Key | string, callback: () => boolean) => {
                const callbacks = this.callbacks.keyup.get(key);
                if (!callbacks) this.callbacks.keyup.set(key, [callback]);
                else callbacks.push(callback);
            },
            click: (button: keyof Button, callback: () => boolean) => {
                const callbacks = this.callbacks.click.get(button);
                if (!callbacks) this.callbacks.click.set(button, [callback]);
                else callbacks.push(callback);
            },
            mousedown: (button: keyof Button, callback: () => boolean) => {
                const callbacks = this.callbacks.mousedown.get(button);
                if (!callbacks) this.callbacks.mousedown.set(button, [callback]);
                else callbacks.push(callback);
            },
            mouseup: (button: keyof Button, callback: () => boolean) => {
                const callbacks = this.callbacks.mouseup.get(button);
                if (!callbacks) this.callbacks.mouseup.set(button, [callback]);
                else callbacks.push(callback);
            },
            mousemove: (callback: () => boolean) => {
                this.callbacks.mousemove.push(callback);
            },
            wheel: (callback: () => boolean) => {
                this.callbacks.wheel.push(callback);
            },
        }

        this.attach();
    }

    get keys(): Readonly<KeyMap> { return this.keys_; }
    get mouse(): Readonly<ButtonMap> { return this.mouse_; }
    get mousePos(): Readonly<Vec2> { return this.mousePos_; }
    get pmousePos(): Readonly<Vec2> { return this.pmousePos_; }
    get wheelDelta(): number { return this.wheelDelta_; }

    poll() {
        this.wheelDelta_ = 0;
        this.pmousePos_ = this.mousePos_;
    }

    focus() {
        this.element.focus();
    }

    blur() {
        this.element.blur();
    }

    attach() {
        this.element.addEventListener("keypress", this.keypress);
        this.element.addEventListener("keydown", this.keydown);
        this.element.addEventListener("keyup", this.keyup);
        this.element.addEventListener("click", this.click);
        this.element.addEventListener("mousedown", this.mousedown);
        this.element.addEventListener("mouseup", this.mouseup);
        this.element.addEventListener("mousemove", this.mousemove);
        this.element.addEventListener("wheel", this.wheel);
    }

    detach() {
        this.element.removeEventListener("keypress", this.keypress);
        this.element.removeEventListener("keydown", this.keydown);
        this.element.removeEventListener("keyup", this.keyup);
        this.element.removeEventListener("click", this.click);
        this.element.removeEventListener("mousedown", this.mousedown);
        this.element.removeEventListener("mouseup", this.mouseup);
        this.element.removeEventListener("mousemove", this.mousemove);
        this.element.removeEventListener("wheel", this.wheel);
    }

    private keypress = (event: KeyboardEvent) => {
        const key = keyID(event.code);
        if (!key) return;

        for (const callback of this.callbacks.keypress.get(key) ?? []) {
            if (callback()) return event.preventDefault();
        }
    }

    private keydown = (event: KeyboardEvent) => {
        const key = keyID(event.code);
        if (!key) return;
        this.keys_[key] = true;

        for (const callback of this.callbacks.keydown.get(key) ?? []) {
            if (callback()) return event.preventDefault();
        }
    }

    private keyup = (event: KeyboardEvent) => {
        const key = keyID(event.code);
        if (!key) return;
        this.keys_[key] = false;

        for (const callback of this.callbacks.keyup.get(key) ?? []) {
            if (callback()) return event.preventDefault();
        }
    }

    private click = (event: MouseEvent) => {
        const button = buttonID(event.button);
        if (!button) return;

        for (const callback of this.callbacks.click.get(button) ?? []) {
            if (callback()) return event.preventDefault();
        }
    }

    private mousedown = (event: MouseEvent) => {
        const button = buttonID(event.button);
        if (!button) return;
        this.mouse_[button] = true;
        this.pmousePos_ = this.mousePos_;
        this.mousePos_ = v2(event.clientX, window.innerHeight - event.clientY);

        for (const callback of this.callbacks.mousedown.get(button) ?? []) {
            if (callback()) return event.preventDefault();
        }
    }

    private mouseup = (event: MouseEvent) => {
        const button = buttonID(event.button);
        if (!button) return;
        this.mouse_[button] = false;
        this.pmousePos_ = this.mousePos_;
        this.mousePos_ = v2(event.clientX, window.innerHeight - event.clientY);

        for (const callback of this.callbacks.mouseup.get(button) ?? []) {
            if (callback()) return event.preventDefault();
        }
    }

    private mousemove = (event: MouseEvent) => {
        const button = buttonID(event.button);
        if (!button) return;
        this.pmousePos_ = this.mousePos_;
        this.mousePos_ = v2(event.clientX, window.innerHeight - event.clientY);

        for (const callback of this.callbacks.mousemove) {
            if (callback()) return event.preventDefault();
        }
    }

    private wheel = (event: WheelEvent) => {
        const delta = event.deltaY / 100;
        this.wheelDelta_ = delta;

        for (const callback of this.callbacks.wheel) {
            if (callback()) return event.preventDefault();
        }
    }
}

type KeyMap = {
    [K in keyof Key]: boolean;
}
type ButtonMap = {
    [K in keyof Button]: boolean;
}

function keyID(key: string): keyof Key | null {
    return RawKey[key as keyof RawKey] as keyof Key ?? null;
}
function buttonID(button: number): keyof Button | null {
    return RawButton[button as keyof RawButton] as keyof Button ?? null;
}

const RawButton = {
    0: "Left",
    1: "Middle",
    2: "Right",
    3: "Back",
    4: "Forward"
};
type RawButton = typeof RawButton;

const Button = {
    "Left": 0,
    "Middle": 1,
    "Right": 2,
    "Back": 3,
    "Forward": 4
}
type Button = typeof Button;

const RawKey = {
    KeyQ: `Q`,
    KeyW: `W`,
    KeyE: `E`,
    KeyR: `R`,
    KeyT: `T`,
    KeyY: `Y`,
    KeyU: `U`,
    KeyI: `I`,
    KeyO: `O`,
    KeyP: `P`,
    KeyA: `A`,
    KeyS: `S`,
    KeyD: `D`,
    KeyF: `F`,
    KeyG: `G`,
    KeyH: `H`,
    KeyJ: `J`,
    KeyK: `K`,
    KeyL: `L`,
    KeyZ: `Z`,
    KeyX: `X`,
    KeyC: `C`,
    KeyV: `V`,
    KeyB: `B`,
    KeyN: `N`,
    KeyM: `M`,
    Digit1: `1`,
    Digit2: `2`,
    Digit3: `3`,
    Digit4: `4`,
    Digit5: `5`,
    Digit6: `6`,
    Digit7: `7`,
    Digit8: `8`,
    Digit9: `9`,
    Digit0: `0`,
    Backslash: `Backslash`,
    BracketLeft: `BracketLeft`,
    BracketRight: `BracketRight`,
    Semicolon: `Semicolon`,
    Quote: `Quote`,
    Comma: `Comma`,
    Period: `Period`,
    Slash: `Slash`,
    Backquote: `Backquote`,
    Plus: `Plus`,
    Minus: `Minus`,
    Equal: `Equal`,
    Space: `Space`,
    Enter: `Enter`,
    Backspace: `Backspace`,
    Tab: `Tab`,
    Escape: `Escape`,
    ShiftLeft: `ShiftLeft`,
    ShiftRight: `ShiftRight`,
    ControlLeft: `ControlLeft`,
    ControlRight: `ControlRight`,
    MetaLeft: `MetaLeft`,
    MetaRight: `MetaRight`,
    AltLeft: `AltLeft`,
    AltRight: `AltRight`,
    ArrowLeft: `ArrowLeft`,
    ArrowDown: `ArrowDown`,
    ArrowUp: `ArrowUp`,
    ArrowRight: `ArrowRight`,
    PrintScreen: `PrintScreen`,
    ScrollLock: `ScrollLock`,
    Pause: `Pause`,
    Insert: `Insert`,
    Home: `Home`,
    PageUp: `PageUp`,
    Delete: `Delete`,
    End: `End`,
    PageDown: `PageDown`,
    CapsLock: `CapsLock`,
    F1: `F1`,
    F2: `F2`,
    F3: `F3`,
    F4: `F4`,
    F5: `F5`,
    F6: `F6`,
    F7: `F7`,
    F8: `F8`,
    F9: `F9`,
    F10: `F10`,
    F11: `F11`,
    F12: `F12`,
    NumLock: `NumLock`,
    NumpadDivide: `NumpadDivide`,
    NumpadMultiply: `NumpadMultiply`,
    NumpadSubtract: `NumpadSubtract`,
    Numpad0: `Numpad0`,
    Numpad1: `Numpad1`,
    Numpad2: `Numpad2`,
    Numpad3: `Numpad3`,
    Numpad4: `Numpad4`,
    Numpad5: `Numpad5`,
    Numpad6: `Numpad6`,
    Numpad7: `Numpad7`,
    Numpad8: `Numpad8`,
    Numpad9: `Numpad9`,
    NumpadDecimal: `NumpadDecimal`,
    NumpadEnter: `NumpadEnter`
};
type RawKey = typeof RawKey;

const Key = {
    "Q": "KeyQ",
    "W": "KeyW",
    "E": "KeyE",
    "R": "KeyR",
    "T": "KeyT",
    "Y": "KeyY",
    "U": "KeyU",
    "I": "KeyI",
    "O": "KeyO",
    "P": "KeyP",
    "A": "KeyA",
    "S": "KeyS",
    "D": "KeyD",
    "F": "KeyF",
    "G": "KeyG",
    "H": "KeyH",
    "J": "KeyJ",
    "K": "KeyK",
    "L": "KeyL",
    "Z": "KeyZ",
    "X": "KeyX",
    "C": "KeyC",
    "V": "KeyV",
    "B": "KeyB",
    "N": "KeyN",
    "M": "KeyM",
    "0": "Digit0",
    "1": "Digit1",
    "2": "Digit2",
    "3": "Digit3",
    "4": "Digit4",
    "5": "Digit5",
    "6": "Digit6",
    "7": "Digit7",
    "8": "Digit8",
    "9": "Digit9",
    "Backslash": "Backslash",
    "BracketLeft": "BracketLeft",
    "BracketRight": "BracketRight",
    "Semicolon": "Semicolon",
    "Quote": "Quote",
    "Comma": "Comma",
    "Period": "Period",
    "Slash": "Slash",
    "Backquote": "Backquote",
    "Plus": "Plus",
    "Minus": "Minus",
    "Equal": "Equal",
    "ShiftLeft": "ShiftLeft",
    "ShiftRight": "ShiftRight",
    "ControlLeft": "ControlLeft",
    "ControlRight": "ControlRight",
    "MetaLeft": "MetaLeft",
    "MetaRight": "MetaRight",
    "AltLeft": "AltLeft",
    "AltRight": "AltRight",
    "ArrowLeft": "ArrowLeft",
    "ArrowDown": "ArrowDown",
    "ArrowUp": "ArrowUp",
    "ArrowRight": "ArrowRight",
    "PrintScreen": "PrintScreen",
    "ScrollLock": "ScrollLock",
    "PageUp": "PageUp",
    "PageDown": "PageDown",
    "CapsLock": "CapsLock",

    F1: `F1`,
    F2: `F2`,
    F3: `F3`,
    F4: `F4`,
    F5: `F5`,
    F6: `F6`,
    F7: `F7`,
    F8: `F8`,
    F9: `F9`,
    F10: `F10`,
    F11: `F11`,
    F12: `F12`,

    "NumLock": "NumLock",
    "NumpadDivide": "NumpadDivide",
    "NumpadMultiply": "NumpadMultiply",
    "NumpadSubtract": "NumpadSubtract",
    "Numpad0": "Numpad0",
    "Numpad1": "Numpad1",
    "Numpad2": "Numpad2",
    "Numpad3": "Numpad3",
    "Numpad4": "Numpad4",
    "Numpad5": "Numpad5",
    "Numpad6": "Numpad6",
    "Numpad7": "Numpad7",
    "Numpad8": "Numpad8",
    "Numpad9": "Numpad9",
    "NumpadDecimal": "NumpadDecimal",
    "NumpadEnter": "NumpadEnter"
};
type Key = typeof Key;
