// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  production: false,
  apiEndPoint: 'http://127.0.0.1:3000/api/v1/',
  authDomain: 'yoov-test.auth0.com',
  authClientID: '37zNdFsX7qJVle44mve5V8w5Usl3NulP',
  authCallback: 'http://127.0.0.1:4200',
  socketIoPath: 'http://127.0.0.1.10:3000',
  cardKey: 'pk_test_kJKIXsNywYXIM7XDfgwRmV6q'
};
