"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
class MattermostPlugin {
    constructor(options) {
        this.isExternal = false;
        this.withExternalURL = (externalPath) => {
            this.isExternal = true;
            this.path = externalPath;
            return this;
        };
        this.withLocalBinary = (path) => {
            let filename = '';
            const files = fs_1.default.readdirSync(path);
            for (const file of files) {
                if (file.endsWith('.tar.gz')) {
                    filename = `${path}/${file}`;
                    break;
                }
            }
            if (filename === '') {
                throw Error('No tar.gz file found in dist folder');
            }
            this.path = filename;
            return this;
        };
        this.path = '';
        this.options = options;
    }
}
exports.default = MattermostPlugin;
