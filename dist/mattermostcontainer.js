"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const testcontainers_1 = require("testcontainers");
const postgresql_1 = require("@testcontainers/postgresql");
const client_1 = require("@mattermost/client");
const pg_1 = require("pg");
const defaultEmail = 'admin@example.com';
const defaultUsername = 'admin';
const defaultPassword = 'admin';
const defaultTeamName = 'test';
const defaultTeamDisplayName = 'Test';
const defaultMattermostImage = 'mattermost/mattermost-enterprise-edition';
// MattermostContainer represents the mattermost container type used in the module
class MattermostContainer {
    constructor() {
        this.db = () => __awaiter(this, void 0, void 0, function* () {
            const port = this.pgContainer.getMappedPort(5432);
            const host = this.pgContainer.getHost();
            const database = 'mattermost_test';
            const client = new pg_1.Client({ user: 'user', password: 'pass', host, port, database });
            yield client.connect();
            return client;
        });
        this.getAdminClient = () => __awaiter(this, void 0, void 0, function* () {
            return this.getClient(this.username, this.password);
        });
        this.getClient = (username, password) => __awaiter(this, void 0, void 0, function* () {
            const url = this.url();
            const client = new client_1.Client4();
            client.setUrl(url);
            const profile = yield client.login(username, password);
            client.setUserId(profile.id);
            return client;
        });
        this.stop = () => __awaiter(this, void 0, void 0, function* () {
            yield this.pgContainer.stop();
            yield this.container.stop();
            yield this.network.stop();
        });
        this.createAdmin = (email, username, password) => __awaiter(this, void 0, void 0, function* () {
            yield this.container.exec(['mmctl', '--local', 'user', 'create', '--email', email, '--username', username, '--password', password, '--system-admin', '--email-verified']);
        });
        this.createUser = (email, username, password) => __awaiter(this, void 0, void 0, function* () {
            yield this.container.exec(['mmctl', '--local', 'user', 'create', '--email', email, '--username', username, '--password', password, '--email-verified']);
        });
        this.createTeam = (name, displayName) => __awaiter(this, void 0, void 0, function* () {
            yield this.container.exec(['mmctl', '--local', 'team', 'create', '--name', name, '--display-name', displayName]);
        });
        this.addUserToTeam = (username, teamname) => __awaiter(this, void 0, void 0, function* () {
            yield this.container.exec(['mmctl', '--local', 'team', 'users', 'add', teamname, username]);
        });
        this.getLogs = (lines) => __awaiter(this, void 0, void 0, function* () {
            const { output } = yield this.container.exec(['mmctl', '--local', 'logs', '--number', lines.toString()]);
            return output;
        });
        this.setSiteURL = () => __awaiter(this, void 0, void 0, function* () {
            const url = this.url();
            yield this.container.exec(['mmctl', '--local', 'config', 'set', 'ServiceSettings.SiteURL', url]);
            const containerPort = this.container.getMappedPort(8065);
            yield this.container.exec(['mmctl', '--local', 'config', 'set', 'ServiceSettings.ListenAddress', `${containerPort}`]);
        });
        this.installPluginFromLocalBinary = (plugin) => __awaiter(this, void 0, void 0, function* () {
            const { pluginId } = plugin.options;
            const patch = JSON.stringify({ PluginSettings: { Plugins: { [pluginId]: plugin.options.pluginConfig } } });
            yield this.container.copyFilesToContainer([{ source: plugin.path, target: '/tmp/plugin.tar.gz' }]);
            yield this.container.copyContentToContainer([{ content: patch, target: '/tmp/plugin.config.json' }]);
            yield this.container.exec(['mmctl', '--local', '--force', 'plugin', 'add', '/tmp/plugin.tar.gz']);
            yield this.container.exec(['mmctl', '--local', 'config', 'patch', '/tmp/plugin.config.json']);
            yield this.container.exec(['mmctl', '--local', 'plugin', 'enable', pluginId]);
        });
        this.installPluginFromUrl = (plugin) => __awaiter(this, void 0, void 0, function* () {
            const client = yield this.getAdminClient();
            const manifest = yield client.installPluginFromUrl(plugin.path, true);
            yield this.container.exec(['mmctl', '--local', 'plugin', 'enable', manifest.id]);
        });
        this.withEnv = (env, value) => {
            this.envs[env] = value;
            return this;
        };
        this.withAdmin = (email, username, password) => {
            this.email = email;
            this.username = username;
            this.password = password;
            return this;
        };
        this.withTeam = (teamName, teamDisplayName) => {
            this.teamName = teamName;
            this.teamDisplayName = teamDisplayName;
            return this;
        };
        this.withConfigFile = (cfg) => {
            const cfgFile = {
                source: cfg,
                target: '/etc/mattermost.json',
            };
            this.configFile.push(cfgFile);
            this.command.push('-c', '/etc/mattermost.json');
            return this;
        };
        this.withPlugin = (plugin) => {
            this.plugins.push(plugin);
            return this;
        };
        this.start = () => __awaiter(this, void 0, void 0, function* () {
            this.network = yield new testcontainers_1.Network().start();
            this.pgContainer = yield new postgresql_1.PostgreSqlContainer('docker.io/postgres:15.2-alpine').
                withExposedPorts(5432).
                withDatabase('mattermost_test').
                withUsername('user').
                withPassword('pass').
                withNetworkMode(this.network.getName()).
                withWaitStrategy(testcontainers_1.Wait.forLogMessage('database system is ready to accept connections')).
                withNetworkAliases('db').
                start();
            this.container = yield new testcontainers_1.GenericContainer(defaultMattermostImage).
                withEnvironment(this.envs).
                withExposedPorts(8065).
                withNetwork(this.network).
                withNetworkAliases('mattermost').
                withCommand(this.command).
                withWaitStrategy(testcontainers_1.Wait.forLogMessage('Server is listening on')).
                withCopyFilesToContainer(this.configFile).
                start();
            yield this.setSiteURL();
            yield this.createAdmin(this.email, this.username, this.password);
            yield this.createTeam(this.teamName, this.teamDisplayName);
            yield this.addUserToTeam(this.username, this.teamName);
            const pluginsToInstall = [];
            for (const plugin of this.plugins) {
                if (plugin.isExternal) {
                    pluginsToInstall.push(this.installPluginFromUrl(plugin));
                }
                else {
                    pluginsToInstall.push(this.installPluginFromLocalBinary(plugin));
                }
            }
            yield Promise.all(pluginsToInstall);
            return this;
        });
        this.startWithUserSetup = () => __awaiter(this, void 0, void 0, function* () {
            yield this.start();
            yield this.createUser('regularuser@sample.com', 'regularuser', 'regularuser');
            yield this.addUserToTeam('regularuser', 'test');
            const userClient = yield this.getClient('regularuser', 'regularuser');
            const user = yield userClient.getMe();
            yield userClient.savePreferences(user.id, [
                { user_id: user.id, category: 'tutorial_step', name: user.id, value: '999' },
                { user_id: user.id, category: 'onboarding_task_list', name: 'onboarding_task_list_show', value: 'false' },
                { user_id: user.id, category: 'onboarding_task_list', name: 'onboarding_task_list_open', value: 'false' },
                {
                    user_id: user.id,
                    category: 'drafts',
                    name: 'drafts_tour_tip_showed',
                    value: JSON.stringify({ drafts_tour_tip_showed: true }),
                },
                { user_id: user.id, category: 'crt_thread_pane_step', name: user.id, value: '999' },
            ]);
            const adminClient = yield this.getAdminClient();
            const admin = yield adminClient.getMe();
            yield adminClient.savePreferences(admin.id, [
                { user_id: admin.id, category: 'tutorial_step', name: admin.id, value: '999' },
                { user_id: admin.id, category: 'onboarding_task_list', name: 'onboarding_task_list_show', value: 'false' },
                { user_id: admin.id, category: 'onboarding_task_list', name: 'onboarding_task_list_open', value: 'false' },
                {
                    user_id: admin.id,
                    category: 'drafts',
                    name: 'drafts_tour_tip_showed',
                    value: JSON.stringify({ drafts_tour_tip_showed: true }),
                },
                { user_id: admin.id, category: 'crt_thread_pane_step', name: admin.id, value: '999' },
            ]);
            yield adminClient.completeSetup({
                organization: 'test',
                install_plugins: [],
            });
            return this;
        });
        this.command = ['mattermost', 'server'];
        const dbconn = 'postgres://user:pass@db:5432/mattermost_test?sslmode=disable';
        this.envs = {
            MM_SQLSETTINGS_DATASOURCE: dbconn,
            MM_SQLSETTINGS_DRIVERNAME: 'postgres',
            MM_SERVICESETTINGS_ENABLELOCALMODE: 'true',
            MM_PASSWORDSETTINGS_MINIMUMLENGTH: '5',
            MM_PLUGINSETTINGS_ENABLEUPLOADS: 'true',
            MM_FILESETTINGS_MAXFILESIZE: '256000000',
            MM_LOGSETTINGS_CONSOLELEVEL: 'DEBUG',
            MM_LOGSETTINGS_FILELEVEL: 'DEBUG',
        };
        this.email = defaultEmail;
        this.username = defaultUsername;
        this.password = defaultPassword;
        this.teamName = defaultTeamName;
        this.teamDisplayName = defaultTeamDisplayName;
        this.plugins = [];
        this.configFile = [];
    }
    url() {
        const containerPort = this.container.getMappedPort(8065);
        const host = this.container.getHost();
        return `http://${host}:${containerPort}`;
    }
}
exports.default = MattermostContainer;
