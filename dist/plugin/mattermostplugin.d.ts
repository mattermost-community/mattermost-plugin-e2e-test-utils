type MattermostPluginOptions<PluginConfigType> = {
    pluginId: string;
    pluginConfig: PluginConfigType;
};
export default class MattermostPlugin<PluginConfigType> {
    path: string;
    options: MattermostPluginOptions<PluginConfigType>;
    isExternal: boolean;
    constructor(options: MattermostPluginOptions<PluginConfigType>);
    withExternalURL: (externalPath: string) => MattermostPlugin<PluginConfigType>;
    withLocalBinary: (path: string) => MattermostPlugin<PluginConfigType>;
}
export {};
