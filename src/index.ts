import fetch from 'node-fetch';

// @ts-ignore
global.fetch = fetch;

export {default as MattermostContainer} from './mattermostcontainer';
export * from './plugin';
export * from './utils';
