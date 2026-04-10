// @ts-expect-error - provided by host
import { defineSetupPluginEntry } from "openclaw/plugin-sdk/core";
import plugin from "./index.js";

export default defineSetupPluginEntry(plugin);
