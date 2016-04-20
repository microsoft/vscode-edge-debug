/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import {ChromeDebugAdapter, Utils, Logger} from 'vscode-chrome-debug-core';
import * as edgeUtils from './utilities';
import * as childProcess from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export class EdgeDebugAdapter extends ChromeDebugAdapter {
    private _adapterProc: childProcess.ChildProcess;

    private _launchAdapter(url?:string, port?:number, adapterExePath?:string ):Promise<any> {
        this.initializeLogging('launch-adapter', arguments);
        if (!adapterExePath) {
            adapterExePath = edgeUtils.getAdapterPath();
        }

        Logger.log(`Launching adapter at: '${adapterExePath}', ${JSON.stringify(arguments) })`);
        // Check exists
        if (!fs.existsSync(adapterExePath)) {
            if (Utils.getPlatform() == Utils.Platform.Windows) {
                return Utils.errP(`No Edge Diagnostics Adapter was found. Install the Edge Diagnostics Adapter (https://github.com/Microsoft/edge-diagnostics-launch) and specify a valid 'adapterExecutable' path`);
            } else {
                return Utils.errP(`Edge debugging is only supported on Windows 10.`);
            }
        }

        let adapterArgs:string[] = [];
        if (!port) {
            port = 9222;
        }
        // We always tell the adpater what port to listen on so there's no shared info between the adapter and the extension
        let portCmdArg = '--port=' + port;
        adapterArgs.push(portCmdArg);

        if(url){
            let launchUrlArg = '--launch='+ url;
            adapterArgs.push(launchUrlArg);
        }

        // The adapter might already be running if so don't spawn a new one
        return Utils.getURL(`http://127.0.0.1:${port}/json/version`).then((jsonResponse:any) => {
            try {
                const responseArray = JSON.parse(jsonResponse);
                let targetBrowser:string = responseArray.Browser;
                targetBrowser = targetBrowser.toLocaleLowerCase();
                if(targetBrowser.indexOf('edge') > -1){
                    let attachArgs = {
                        port: port,
                        cwd: ""
                    }

                    return Promise.resolve(attachArgs);
                }

                return Utils.errP(`Sever for ${targetBrowser} already listening on :9222`);
            } catch (ex) {

                return Utils.errP(`Sever already listening on :9222 returned ${ex}`);
            }

        }, error => {
            Logger.log(`spawn('${adapterExePath}', ${JSON.stringify(adapterArgs) })`);
            this._adapterProc = childProcess.execFile(adapterExePath, adapterArgs, (err) => {
                    Logger.log(`Adapter error: ${err}`);
                    this.terminateSession();
                }, (data) => {
                    Logger.log(`Adapter output: ${data}`);
            });

            let attachArgs = {
                port: port,
                cwd: ""
            }

            return Promise.resolve(attachArgs);
        });
    }

    public constructor() {
        super();
    }

    public launch(args: any): Promise<void> {
        this.initializeLogging('launch-edge', arguments);
        Logger.log(`Launching Edge`);

        let launchUrl: string;
        if (args.file) {
            launchUrl = 'file:///' + path.resolve(args.cwd, args.file);
        } else if (args.url) {
            launchUrl = args.url;
        }

        return this._launchAdapter(launchUrl, args.port, args.runtimeExecutable).then((attachArgs:any) =>{
            return super.attach(attachArgs);
        });
    }

    public attach(args: any): Promise<void> {
        this.initializeLogging('attach-edge', arguments);
        Logger.log(`Attaching to Edge`);

        return this._launchAdapter(null, args.port, args.runtimeExecutable).then((attachArgs:any) =>{
            return super.attach(attachArgs);
        });
    }

    public clearEverything(): void {
        if (this._adapterProc) {
            this._adapterProc.kill('SIGINT');
            this._adapterProc = null;
        }

        super.clearEverything();
    }
}

