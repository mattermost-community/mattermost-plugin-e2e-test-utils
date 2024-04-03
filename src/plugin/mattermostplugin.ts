import fs from 'fs';

type MattermostPluginOptions<PluginConfigType> = {
    pluginId: string;
    pluginConfig: PluginConfigType;
}

export default class MattermostPlugin<PluginConfigType> {
    options: MattermostPluginOptions<PluginConfigType>;
    isExternal: boolean = false;
    path: string;

    constructor(options: MattermostPluginOptions<PluginConfigType>) {
        this.options = options;
    }

    withExternalURL = (externalPath: string): MattermostPlugin<PluginConfigType> => {
        this.isExternal = true;
        this.path = externalPath;

        return this;
    };

    withLocalBinary = (path: string): MattermostPlugin<PluginConfigType> => {
        let filename = '';
        const files = fs.readdirSync(path);
        for (const file of files) {
            if (file.endsWith('.tar.gz')) {
                filename = path + file;
                break;
            }
        }
        if (filename === '') {
            throw Error('No tar.gz file found in dist folder');
        }

        return this;
    };
}
