import { Page } from '@playwright/test';
export declare const login: (page: Page, url: string, username: string, password: string) => Promise<void>;
export declare const logout: (page: Page) => Promise<void>;
