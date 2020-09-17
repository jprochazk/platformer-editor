#!/usr/bin/env node

/*
Webpack doesn't play well with electron, so I'm doing this instead.
All this does is run the TypeScript compiler in watch mode, and then starts Electron.
*/

const { exec } = require("child_process");

/* Helper to execute shell command asynchronously */
function shell(cmd, silent = false) {
    return new Promise((resolve, reject) => {
        try {
            const shell = exec(cmd);
            if (!silent) {
                shell.stdout.on("data", (data) => process.stdout.write(data));
                shell.stderr.on("data", (data) => process.stderr.write(data));
            }
            shell.on("error", (err) => reject(err));
            shell.on("close", () => resolve());
        } catch (err) {
            reject(err);
        }
    });
}

(async function () {
    /* Run tsc in watch mode together with electron */
    try {
        process.env.ELECTRON_START_URL = "http://localhost:8080";
        process.env.NODE_ENV = "development";
        await Promise.all([
            shell(`npx tsc -w --noEmit`, true),
            shell(`npx webpack-dev-server --config webpack.dev.js`, false),
            shell(`npx electron .`, true),
        ]);
    } catch (err) {
        console.error(err);
    }
})();
