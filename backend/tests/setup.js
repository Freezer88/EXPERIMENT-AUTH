"use strict";
process.env['NODE_ENV'] = 'test';
process.env['JWT_ACCESS_TOKEN_SECRET'] = 'test-access-secret';
process.env['JWT_REFRESH_TOKEN_SECRET'] = 'test-refresh-secret';
process.env['JWT_ACCESS_TOKEN_EXPIRES_IN'] = '15m';
process.env['JWT_REFRESH_TOKEN_EXPIRES_IN'] = '7d';
process.env['JWT_ISSUER'] = 'test-issuer';
process.env['JWT_AUDIENCE'] = 'test-audience';
jest.setTimeout(10000);
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};
//# sourceMappingURL=setup.js.map