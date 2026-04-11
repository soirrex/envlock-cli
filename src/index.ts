#!/usr/bin/env node

import { App } from "./app.js";
import { container } from "./container.js";

const app = container.get(App);
app.start();
