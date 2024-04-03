import {test, expect} from '@playwright/test';
import {
    MattermostContainer,
    MattermostPlugin,
    login,
    logout,
} from 'mattermost-plugin-e2e-test-utils';

type DemoPluginConfig = {
    clientId: string
}

const DEMO_PLUGIN_EXTERNAL_URL = 'https://github.com/mattermost/mattermost-plugin-demo/releases/download/v0.10.0/com.mattermost.demo-plugin-0.10.0.tar.gz';

let mattermost: MattermostContainer;
let demoPluginInstance: MattermostPlugin<DemoPluginConfig>;

test.beforeAll(async () => {
    demoPluginInstance = new MattermostPlugin<DemoPluginConfig>({
        pluginId: 'com.mattermost.demo-plugin',
        pluginConfig: {
            clientId: 'client-id',
        },
    }).
        withExternalURL(DEMO_PLUGIN_EXTERNAL_URL);

    mattermost = await new MattermostContainer().
        withPlugin(demoPluginInstance).
        startWithUserSetup();
});

test.afterAll(async () => {
    await mattermost.stop();
});

test.describe('example test', () => {
    test('check if the town square and plublic channel are created', async ({page}) => {
        const url = mattermost.url();
        await login(page, url, 'regularuser', 'regularuser');
        await expect(page.getByLabel('town square public channel')).toBeVisible();
        await logout(page);
    });
});
