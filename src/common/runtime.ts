
import { Constructor } from "common";

interface ApplicationLike {
    /**
     * Called once Runtime starts
     * 
     * @see {@link Runtime#start}
     * 
     * Initialization is expected to be asynchronous for the purpose of
     * loading images, json files, etc
     */
    init: () => Promise<void>;
    /**
     * Called at a fixed interval
     * 
     * @see {@link Runtime#rate} 
     */
    update: () => void;
    /**
     * Called as frequently as possible
     * 
     * @param {number} time milliseconds since document load
     */
    render: (time: number) => void;
}

let application: ApplicationLike | null = null;
abstract class Runtime {
    static rate = 30;
    static maxConsecutiveUpdates = 5;
    private static rafID = 0;

    /**
     * Start the given `app`
     * @param app 
     * @param args 
     */
    static async start() {
        if (!application) return;
        const update = application.update;
        const render = application.render;
        const init = application.init;

        const update_time_delta = 1000 / Runtime.rate;
        let next_game_tick = Date.now();

        const loop = () => {
            const now = Date.now();
            let processed_update_count = 0;
            while (now > next_game_tick && processed_update_count++ < Runtime.maxConsecutiveUpdates) {
                update();
                next_game_tick += update_time_delta;
            }
            render(now);
            Runtime.rafID = window.requestAnimationFrame(loop);
        }

        await init();
        Runtime.rafID = window.requestAnimationFrame(loop);
    }
}

// NOTE: this works because scripts are executed before the entire document loads
window.addEventListener("DOMContentLoaded", Runtime.start);

// NOTE: Requires the experimentalDecorators flag in tsconfig
// which is unstable due to the decorator proposal: https://github.com/tc39/proposal-decorators
/**
 * @param rate Frequency of fixed-interval `update` calls. Default is 30.
 * 
 * @param maxConsecutiveUpdates Maximum updates in a row before a render. Default is 5.
 * 
 * When the client is lagging badly, the runtime may execute multiple updates in a row,
 * in order to try and catch up. However, it will never execute more than `maxConsecutiveUpdates`
 * updates before doing at least a single render() call.
 */
export function Application<T extends Constructor<ApplicationLike>>(options: { rate?: number, maxConsecutiveUpdates?: number } = {}) {
    Runtime.rate = options?.rate ?? 30
    Runtime.maxConsecutiveUpdates = options?.maxConsecutiveUpdates ?? 5;

    return function (target: T) {
        if (application) throw new Error(`Only one @Application() may exist at a time!`);
        application = new target();
    }
}
