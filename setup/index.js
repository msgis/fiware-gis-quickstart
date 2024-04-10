const axios = require('axios');
const { importGeoJSONfromUrl, entityTypeExists } = require('./lib/import');
const { setupNgsiProxy } = require('./lib/ngsi-proxy');

const contextBrokerBaseUrl = process.env['CONTEXT_BROKER_BASEURL'];
const ngsiProxyBaseUrl = process.env['NGSI_PROXY_BASEURL'];
const ngsiProxyPublicBaseUrl = process.env['NGSI_PROXY_PUBLICBASEURL'];
const ngsiProxyCallbackBaseUrl = process.env['NGSI_PROXY_CALLBACK_BASEURL'];

process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.error('uncaught exception, please report this\n' + err.stack);
  process.exit(255);
});

function waitFor(url, maxRetries = 15) {
  // eslint-disable-next-line no-console
  console.log(`waiting for ${url}`);
  const next = (retrysLeft) => {
    if (retrysLeft < 1) {
      return Promise.reject(new Error(`service ${url} not available.`));
    } else {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          axios.get(url).then(() => {
            // eslint-disable-next-line no-console
            console.log(`service ${url} is available, OK`);
            return resolve();
          }).catch((error) => {
            const status = error && error.response ? error.response.status : null;
            if (status > 399 && status < 500) {
              // eslint-disable-next-line no-console
              console.log(`service ${url} is available, ERR`);
              return resolve();
            }
            // eslint-disable-next-line no-console
            console.log(`service ${url} not available, retrying`);
            return next(--retrysLeft).then(() => resolve()).catch((error) => reject(error));
          });
        }, 2000);
      });
    }
  };
  return next(maxRetries);
}

async function tryImport(type, url) {
  try {
    if (!await entityTypeExists(contextBrokerBaseUrl, type)) {
      // eslint-disable-next-line no-console
      console.log(`importing type ${type}`);
      await importGeoJSONfromUrl(contextBrokerBaseUrl, type, url);
    } else {
      // eslint-disable-next-line no-console
      console.log(`type ${type} already exits, skipping import`);
    }
  } catch(error) {
    // eslint-disable-next-line no-console
    console.error(`error importing type ${type}`);
  }
}

async function setup() {

  await waitFor(contextBrokerBaseUrl);

  if (ngsiProxyBaseUrl) {
    await waitFor(ngsiProxyBaseUrl);
  }

  await tryImport(
    'Hydrant',
    'https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:HYDRANTOGD&srsName=EPSG:4326&outputFormat=json'
  );

  await tryImport(
    'Trinkbrunnen',
    'https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:TRINKBRUNNENOGD&srsName=EPSG:4326&outputFormat=json'
  );

  await tryImport(
    'Schwimmbad',
    'https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:SCHWIMMBADOGD&srsName=EPSG:4326&outputFormat=json'
  );

  await tryImport(
    'Anrainerparkplaetz',
    'https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:PARKENANRAINEROGD&srsName=EPSG:4326&outputFormat=json'
  );

  await tryImport(
    'Begegnungszone',
    'https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:BEGEGNUNGSZONEOGD&srsName=EPSG:4326&outputFormat=json'
  );

  if (ngsiProxyBaseUrl) {
    // eslint-disable-next-line no-console
    console.log('setting up ngsi proxy');
    await setupNgsiProxy({
      ngsiProxyBaseUrl, ngsiProxyPublicBaseUrl, contextBrokerBaseUrl, ngsiProxyCallbackBaseUrl
    });
  } else {
    // eslint-disable-next-line no-console
    console.log('skip ngsi proxy setup, NGSI_PROXY_BASEURL is empty');
  }

}

setup();
