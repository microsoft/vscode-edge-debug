/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import {Utils} from 'vscode-chrome-debug-core';
import * as path from 'path';
import * as os from 'os';

const EDGE_ADAPTER_PATH = {
    OSX: '',
    WINx64:    path.resolve(__dirname, '../../node_modules/edge-diagnostics-adapter/dist/x64/EdgeDiagnosticsAdapter.exe'),
    WINx86: path.resolve(__dirname, '../../node_modules/edge-diagnostics-adapter/dist/x86/EdgeDiagnosticsAdapter.exe'),
    LINUX: ''
};

export function getAdapterPath(): string {
    const platform = Utils.getPlatform();
    const arch = os.arch();
    if (platform === Utils.Platform.Windows) {
        if(arch === 'x64'){
            return EDGE_ADAPTER_PATH.WINx64;
        } else if(arch === 'x86'){
            return EDGE_ADAPTER_PATH.WINx86;
        }
    }
    return null;
}
