# VS Code - Debugger for Edge

A VS Code extension to debug your JavaScript code in the Edge browser.

![demo](https://cdn.rawgit.com/microsoft/vscode-edge-debug/master/.demo.gif)

## Getting started

To get started, you simply open the `Command Palette` inside VS Code and type `ext install` to run the `Extensions: Install Extension` command.  When the extension list appears, type **'edge'** to filter the list and install the **`Debugger for Edge`** extension.  

## Configuration
The extension operates in two modes - it can `launch` an instance of Edge navigated to your app, or it can `attach` to a running instance of Edge. 

Just like when using the Node debugger, you configure these modes with a `.vscode/launch.json` file in the root directory of your project. You can create this file manually, or Code will create one for you if you try to run your project, and it doesn't exist yet.

To use this extension, you must first open the folder containing the project you want to work on.

### Launch mode
Two example `launch.json` configs. You must specify either `file` or `url` to launch Edge against a local file or a url. If you use a url, set `webRoot` to the directory that files are served from. This can be either an absolute path or a path relative to the workspace (the folder open in Code). It's used to resolve urls (like `http://localhost/app.js`) to a file on disk (like `/users/me/project/app.js`), so be careful that it's set correctly.

```javascript
{
    "version": "0.1.0",
    "configurations": [
        {
            "name": "Launch localhost with sourcemaps",
            "type": "edge",
            "request": "launch",
            "url": "http://localhost/mypage.html",
            "webRoot": "${workspaceRoot}/app/files",
            "sourceMaps": true
        },
        {
            "name": "Launch index.html (without sourcemaps)",
            "type": "edge",
            "request": "launch",
            "file": "${workspaceRoot}/index.html"
        },
    ]
}
````
### Attach mode
Attaches the debugger to an already running instance of Edge.

```javascript
{
    "version": "0.1.0",
    "configurations": [
        {
            "name": "Attach with sourcemaps",
            "type": "edge",
            "request": "attach",
            "url": "http://localhost/mypage.html", // optional: used to find the right tab running in Edge
            "port": 9222,
            "sourceMaps": true
        },
        {
            "name": "Attach to url with files served from ./out",
            "type": "edge",
            "request": "attach",
            "port": 9222,
            "webRoot": "${workspaceRoot}/out"
        }
    ]
}
```

## Supported features

In this release, we support the following features:

- Setting breakpoints, including within source files when source maps are enabled
- TypeScript, via source maps
- Debug stepping
- Locals scope variables via the **VARIABLES** panel 
- Debugging eval scripts, script tags, and scripts that are added dynamically
- Watches via the **WATCH** panel.
- The debug console
- Most console APIs

## Known limitations

#### Launching Edge

There's a few issues with launching Edge, you're best bet is to have your page already open and attach to it.

1. You have to have one tab open in Edge. Opening Edge for the first time from VS Code will get a hung page.

#### Multiple Tabs with the same Url
The logic for picking which tab to attach to is based on the URL. If you have multiple tabs open at the same URL VS Code will attach to the first one.

#### No Console API
Currently the console.* API is not implemented so you won't see log messages in the console in VS Code. You can execute statements and inspect the results as normal though.

#### No Pause Overlay
Currently there is no indication in Edge when you are paused at a breakpoint in VS Code. You'll still see your site but won't be able to interact with it and the tab will eventually be reported as "Not responding".

#### No Support for Web Workers
Currently there is no support for debugging of web workers in Edge.

#### No Inlined Sourcemap Support
Sourcemaps that are included in the compiled JS aren't currently supported.

#### Broken Stepping
Occasionally, typically if you've been at a breakpoint for a while and tried to interact with the page you'll see that stepping no longer seems to be working. This can happen when Edge recycles the tab and moves the one being debugged to a hidden tab and in it's place creates a new page at the same URL.

## Troubleshooting
General things to try if you're having issues:
* Ensure `webRoot` is set correctly if needed
* Look at your sourcemap config carefully. A sourcemap has a path to the source files, and this extension uses that path to find the original source files on disk. Check the `sourceRoot` and `sources` properties in your sourcemap and make sure that they can be combined with the `webRoot` property in your launch config to build the correct path to the original source files.
* Only have one instace of Edge running
* Ensure nothing else is using port 9222, or specify a different port in your launch config
* Check the console for warnings that this extension prints in some cases when it can't attach
* Ensure the code in Edge matches the code in Code. Edge may cache an old version.
* If you set a breakpoint in code that runs immediately when the page loads, you won't hit that breakpoint until you refresh the page.
* File a bug in this extension's [GitHub repo](https://github.com/Microsoft/vscode-edge-debug). Set the `diagnosticLogging` field in your launch config to `true` and attach the logs when filing a bug.
