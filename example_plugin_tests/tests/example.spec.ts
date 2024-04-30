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

const DEMO_PLUGIN_EXTERNAL_URL = 'https://github.com/mattermost/mattermost-plugin-demo/releases/download/v0.10.1/com.mattermost.demo-plugin-0.10.1.tar.gz';

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

    test('open dialog and cancels it', async ({page}) => {
        const url = mattermost.url();
        await login(page, url, 'regularuser', 'regularuser');

        await page.getByTestId('post_textbox').fill('/dialog');
        await page.getByTestId('SendMessageButton').click();

        await expect(page.getByText('Test Title')).toBeVisible();
        await expect(page.getByTestId('realnamelabel')).toBeVisible();
        await expect(page.getByTestId('someemaillabel')).toBeVisible();
        await expect(page.getByTestId('somepasswordlabel')).toBeVisible();

        await page.getByRole('button', {name: 'Cancel'}).click();

        await expect(page.getByText('Test Title')).not.toBeVisible();

        await logout(page);
    });
});
