
import { test } from "./test";

//const process = window.require("process");

const nv = <HTMLSpanElement>document.querySelector("#node-version");
if (nv) nv.innerText = window.process.versions.node;
const cv = <HTMLSpanElement>document.querySelector("#chrome-version");
if (cv) cv.innerText = window.process.versions.chrome;
const ev = <HTMLSpanElement>document.querySelector("#electron-version");
if (ev) ev.innerText = window.process.versions.electron;

test();
