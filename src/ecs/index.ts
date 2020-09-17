


// ECS CORE
import { Constructor, InstanceTypeTuple, Typeof } from "common";
// TODO: support multiple component types in Registry.get, Registry.has, Registry.remove and Registry.emplace

/**
 * An opaque identifier used to access component arrays
 */
export type Entity = number;

/**
 * Stores arbitrary data
 */
export type Component = {
    free?: () => void;
    [x: string]: any;
    [x: number]: any;
}

export function ValueWrapper<T>() {
    //const builder = new Function(`class ${name} { constructor(value) { this.value = value; } }`);
    //return builder();
    return class {
        constructor(public value: T) { }
    }
}

export type View<Types extends Component[]> = Iterable<[Entity, ...Types]>;

/**
 * Registry holds all components in arrays
 *
 * Component types must be registered first
 */
export class Registry {
    private entitySequence: Entity = 0;
    private entities: Set<Entity> = new Set;
    private byName: Map<string, Entity> = new Map;
    private components: Map<string, Map<Entity, Component>> = new Map;

    // TODO: store entities and components in sparse sets
    // TODO: serialization + deserialization
    // especially deserialization

    create<T extends Component[]>(...components: T): Entity;
    create<T extends Component[]>(name: string, ...components: T): Entity;
    /**
     * Creates an entity
     * 
     * If `entity` is not provided, then it creates one from 
     * 
     * Also accepts an entity identifier + list of components to construct the entity from
     */
    create(...args: any[]): Entity {
        const entity = this.entitySequence++;

        let name;
        this.entities.add(entity);
        if (typeof args[0] === "string") {
            const tag = new NameTag(args[0]);
            name = tag.value;
            this.emplace(tag, entity);
            for (let i = 1; i < args.length; ++i) {
                this.emplace(args[i], entity);
            }
        } else {
            const tag = new NameTag(`entity_${entity}`);
            name = tag.value;
            for (let i = 0; i < args.length; ++i) {
                this.emplace(args[i], entity);
            }
        }
        this.byName.set(name, entity);

        return entity;
    }

    //insert<T extends Component[]>(entity: Entity, ...components: T): Entity {
    //    if (this.entities.has(entity)) {
    //        throw new Error(`Attempted to insert duplicate entity ${entity}`);
    //    }
    //    this.entities.add(entity);
    //    for (const component of components) {
    //        this.emplace(component, entity);
    //    }
    //    return entity;
    //}

    /**
     * Returns true if `entity` is in the registry
     */
    alive(entity: Entity): boolean {
        return this.entities.has(entity);
    }

    /**
     * Destroys an entity and all its components
     * 
     * Calls `.free()` on each destroyed component
     * 
     * Example:
     * ```
     */
    destroy(entity: Entity) {
        this.entities.delete(entity);
        for (const list of this.components.values()) {
            const component = list.get(entity);
            if (component?.free) component.free();
            list.delete(entity);
        }
    }


    /**
     * Retrieves component of type `type` for `entity`
     * 
     * Example:
     * ```
     *  const registry = new Registry();
     *  const entity = registry.create();
     *  registry.emplace(new Component, entity);
     *  // ...
     *  const component = registry.get(Component, entity);
     * ```
     */

    get<T extends Component>(component: Constructor<T>, entity: Entity): T | null {
        const type = this.typeid(component);

        // can't get for "dead" entity
        if (!this.entities.has(entity)) {
            throw new Error(`Cannot get component "${Typeof(component)}" for dead entity ID ${entity}`);
        }

        return this.components.get(type)?.get(entity) as T ?? null;
    }

    /**
     * Used to check if `entity` has instance of `component`.
     * 
     * Example:
     * ```
     *  const registry = new Registry();
     *  const entity = registry.create();
     *  registry.has(Component, entity); // false
     *  registry.emplace(new Component, entity);
     *  registry.has(Component, entity); // true
     * ```
     */
    has<T extends Component>(component: Constructor<T>, entity: Entity) {
        return this.components.get(this.typeid(component))?.has(entity) ?? false;
    }

    /**
     * Sets `entity`'s instance of component `type` to `component`.
     * 
     * **Warning:** Overwrites any existing instance of the component!
     * Use `has` to check for existence first, if this is undesirable.
     * 
     * Example:
     * ```
     *  const entity = registry.create();
     *  registry.emplace(new Component, entity);
     * ```
     */
    emplace<T extends Component>(component: T, entity: Entity) {
        const type = this.typeid(component);

        if (!this.entities.has(entity)) {
            throw new Error(`Cannot set component "${Typeof(component)}" for dead entity ID ${entity}`);
        }

        let list = this.components.get(type);
        if (!list) {
            list = new Map();
            this.components.set(type, list);
        }
        list.set(entity, component);
    }

    /**
     * Removes instance of `component` from `entity`. Also returns the removed component.
     * 
     * Example:
     * ```
     *  const registry = new Registry();
     *  const entity = registry.create();
     *  registry.emplace(new Component, entity);
     *  // ...
     *  registry.remove(Component, entity); // true
     * ```
     */
    remove<T extends Component>(component: Constructor<T>, entity: Entity): T | null {
        const type = this.typeid(component);

        // can't remove for "dead" entity
        if (!this.entities.has(entity)) {
            throw new Error(`Cannot remove component "${Typeof(component)}" for dead entity ID ${entity}`);
        }

        const list = this.components.get(type);
        if (!list) {
            return null;
        }
        const _component = list?.get(entity);
        list.delete(entity);
        return _component as T ?? null;
    }

    find(name: string): Entity | null {
        return this.byName.get(name) ?? null;
    }

    /**
     * Constructs a view into the registry from the given component types.
     * The view will contain every entity which has the given component types.
     * 
     * If no component types are provided, returns every entity
     * in the registry.
     * 
     * The resulting View type is a tuple consisting of the entity and
     * 0 or more components. It is also `Iterable`, so you can use it in a loop,
     * or convert it to an array and use array methods on it.
     * 
     * Example:
     * ```
     *  // Note that components MUST be classes.
     *  class Position {
     *      x: number = 0;
     *      y: number = 0;
     *  }
     *  class Velocity {
     *      x: number = 0;
     *      y: number = 0;
     *  }
     * 
     *  // this would be your classic position system
     *  for(const [entity, pos, vel] of registry.view(Position, Velocity)) {
     *      pos.x += vel.x;
     *      pos.y += vel.y;
     *  }
     * 
     *  // note that this is usually at least ~10x slower than the above,
     *  // and you should always iterate over views directly.
     *  // to array
     *  const view = Array.from(registry.view(A, B));
     *  // or using spread operator
     *  const view = [...registry.view(A, B)];
     *  // and use array methods...
     *  view.forEach(([entity, a, b]) => console.log(entity, a, b));
     *  view.reduce((acc, [entity, a, b]) => acc += (a.val + b.val));
     * ```
     */
    view<T extends Constructor<Component>[]>(...types: T): View<InstanceTypeTuple<T>> {
        return this.generateView(this, this.entities.values(), types) as View<InstanceTypeTuple<T>>;
    }

    /**
     * Returns the size of the registry (how many entities are stored)
     */
    size(): number {
        return this.entities.size;
    }

    /**
     * Returns the ID part of the Entity
     */
    static id(entity: Entity): number {
        return entity & 0b00000000_00000000_11111111_11111111
    }
    /**
     * Returns the version part of the Entity
     */
    static version(entity: Entity): number {
        return entity & 0b11111111_11111111_00000000_00000000
    }

    /**
     * Returns the typeid (name) of a Component
     * 
     * Used internally to identify components. Only supports classes (subject to change).
     */
    public typeid<T extends Component>(component: T | Constructor<T>): string {
        const type = Typeof(component);
        switch (type) {
            case "Object": case "BigInt": case "Boolean": case "Number": case "Array": case "String": case "Function":
                throw new Error(`Invalid value type: ${type}`);
            default:
                return type;
        }
    }

    /**
     * Creates an iterator over entities + their components
     */
    private generateView = function* (
        self: Registry,
        entities: Iterable<Entity>,
        types: Constructor<Component>[]
    ) {
        const components = self.components;

        // this label is used to exit out of both loops without any extra fuss
        // who knew they were actually useful?
        nextEntity:
        for (const entity of entities) {
            const item: [Entity, ...Component[]] = [entity];

            for (const type of types) {
                // stringify type
                const _type = self.typeid(type);
                // try get component list
                const list = components.get(_type);
                if (!list) continue nextEntity;

                // try get component
                // if unsuccessful, continue to next entity
                const component = list.get(entity);
                if (!component) continue nextEntity;

                // push component into 
                item.push(component);
            }

            yield item;
        }
    }
}

// COMPONENTS
export class NameTag {
    constructor(public readonly value: string) { }
}
import { m3, Mat3, v2, Vec2 } from "math";
export class Transform {

    constructor(
        position: Vec2 = v2(),
        rotation: number = 0,
        scale: Vec2 = v2(),
    ) {
        this.position_ = position;
        this.rotation_ = rotation;
        this.scale_ = scale;
        this.matrix_ = m3().translateThis(this.position_)
            .rotateThis(this.rotation_)
            .scaleThis(this.scale_);
    }

    private position_: Vec2;
    public get position(): Vec2 { return this.position_; }
    public set position(value: Vec2) { this.position_ = value; this.update(); }

    private rotation_: number;
    public get rotation(): number { return this.rotation_; }
    public set rotation(value: number) { this.rotation_ = value; this.update(); }

    private scale_: Vec2;
    public get scale(): Vec2 { return this.scale_; }
    public set scale(value: Vec2) { this.scale_ = value; this.update(); }

    private matrix_: Mat3;
    public get matrix(): Mat3 {
        return this.matrix_;
    }

    public update() {
        this.matrix_ = m3().translateThis(this.position_)
            .rotateThis(this.rotation_)
            .scaleThis(this.scale_);
    }
}
