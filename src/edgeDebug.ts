/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import {ChromeDebugSession} from 'vscode-chrome-debug-core';
import {EdgeDebugSession} from './edgeDebugSession';

ChromeDebugSession.run(EdgeDebugSession);
