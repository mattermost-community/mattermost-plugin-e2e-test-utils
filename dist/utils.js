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
exports.logout = exports.login = void 0;
const login = (page, url, username, password) => __awaiter(void 0, void 0, void 0, function* () {
    yield page.addInitScript(() => {
        localStorage.setItem('__landingPageSeen__', 'true');
    });
    yield page.goto(url);
    yield page.getByText('Log in to your account').waitFor();
    yield page.getByPlaceholder('Password').fill(password);
    yield page.getByPlaceholder('Email or Username').fill(username);
    yield page.getByTestId('saveSetting').click();
});
exports.login = login;
const logout = (page) => __awaiter(void 0, void 0, void 0, function* () {
    yield page.getByLabel('Current status: Online. Select to open profile and status menu.').click();
    yield page.getByText('Log Out').click();
});
exports.logout = logout;
