import { StartedTestContainer, StartedNetwork } from 'testcontainers';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Client4 } from '@mattermost/client';
import { Client } from 'pg';
import { MattermostPlugin } from './plugin';
export default class MattermostContainer {
    container: StartedTestContainer;
    pgContainer: StartedPostgreSqlContainer;
    network: StartedNetwork;
    email: string;
    username: string;
    password: string;
    teamName: string;
    teamDisplayName: string;
    envs: {
        [key: string]: string;
    };
    command: string[];
    configFile: {
        source: string;
        target: string;
    }[];
    plugins: MattermostPlugin<unknown>[];
    constructor();
    url(): string;
    db: () => Promise<Client>;
    getAdminClient: () => Promise<Client4>;
    getClient: (username: string, password: string) => Promise<Client4>;
    stop: () => Promise<void>;
    createAdmin: (email: string, username: string, password: string) => Promise<void>;
    createUser: (email: string, username: string, password: string) => Promise<void>;
    createTeam: (name: string, displayName: string) => Promise<void>;
    addUserToTeam: (username: string, teamname: string) => Promise<void>;
    getLogs: (lines: number) => Promise<string>;
    setSiteURL: () => Promise<void>;
    installPluginFromLocalBinary: (plugin: MattermostPlugin<unknown>) => Promise<void>;
    installPluginFromUrl: (plugin: MattermostPlugin<unknown>) => Promise<void>;
    withEnv: (env: string, value: string) => MattermostContainer;
    withAdmin: (email: string, username: string, password: string) => MattermostContainer;
    withTeam: (teamName: string, teamDisplayName: string) => MattermostContainer;
    withConfigFile: (cfg: string) => MattermostContainer;
    withPlugin: (plugin: MattermostPlugin<unknown>) => MattermostContainer;
    start: () => Promise<MattermostContainer>;
    startWithUserSetup: () => Promise<MattermostContainer>;
}
