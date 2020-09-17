# platformer-editor

Editor for my online game project, written in TypeScript, HTML and CSS, running in Electron.

### Usage

```
> npm install
> npm run dev
```

This will install all dependencies and open the app in a new window, along with developer tools.

### Features

* 2D WebGL Renderer
* UI
* ECS library
* Math library
* 2D collision library

### Warning

All the code runs in an unsecured context with node integration enabled. Future versions will expose required node libs through a `preload` script.

### TODO

* Fixed chunk batching instead of dynamic batching
* Switch sprite input from text to file
* Map + sprite managed directories
