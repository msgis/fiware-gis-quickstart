const axios = require('axios');
const { importGeoJSONfromUrl, entityTypeExists } = require('./lib/import');
const { setupNgsiProxy } = require('./lib/ngsi-proxy');

const contextBrokerBaseUrl = process.env['CONTEXT_BROKER_BASEURL'];
const ngsiProxyBaseUrl = process.env['NGSI_PROXY_BASEURL'];
const ngsiProxyPublicBaseUrl = process.env['NGSI_PROXY_PUBLICBASEURL'];
const ngsiProxyCallbackBaseUrl = process.env['NGSI_PROXY_CALLBACK_BASEURL'];

async function waitFor(url) {
  // eslint-disable-next-line no-console
  console.log(`waiting for ${url}`);
  const next = (retrysLeft) => {
    if (retrysLeft < 1) {
      return Promise.reject(new Error(`service ${url} not available.`));
    } else {
      return new Promise((resolve) => {
        setTimeout(() => {
          axios.get(url).then(() => {
            // eslint-disable-next-line no-console
            console.log(`service ${url} is available`);
            return resolve();
          }).catch((error) => {
            const status = error && error.response ? error.response.status : null;
            if (status > 399 && status < 500) {
              // eslint-disable-next-line no-console
              console.log(`service ${url} is available`);
              return resolve();
            }
            // eslint-disable-next-line no-console
            console.log(`service ${url} not available, retrying`);
            return next(--retrysLeft);
          });
        }, 2000);
      });
    }
  };
  return next(5);
}

async function setup() {

  await waitFor(contextBrokerBaseUrl);
  await waitFor(ngsiProxyBaseUrl);

  if (!await entityTypeExists(contextBrokerBaseUrl, 'Hydrant')) {
    await importGeoJSONfromUrl(
      contextBrokerBaseUrl,
      'Hydrant',
      'https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:HYDRANTOGD&srsName=EPSG:4326&outputFormat=json'
    );
  }

  if (!await entityTypeExists(contextBrokerBaseUrl, 'Trinkbrunnen')) {
    await importGeoJSONfromUrl(
      contextBrokerBaseUrl,
      'Trinkbrunnen',
      'https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:TRINKBRUNNENOGD&srsName=EPSG:4326&outputFormat=json'
    );
  }

  if (!await entityTypeExists(contextBrokerBaseUrl, 'Schwimmbad')) {
    await importGeoJSONfromUrl(
      contextBrokerBaseUrl,
      'Schwimmbad',
      'https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:SCHWIMMBADOGD&srsName=EPSG:4326&outputFormat=json'
    );
  }

  if (!await entityTypeExists(contextBrokerBaseUrl, 'Anrainerparkplaetz')) {
    await importGeoJSONfromUrl(
      contextBrokerBaseUrl,
      'Anrainerparkplaetz',
      'https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:PARKENANRAINEROGD&srsName=EPSG:4326&outputFormat=json'
    );
  }

  if (!await entityTypeExists(contextBrokerBaseUrl, 'Begegnungszone')) {
    await importGeoJSONfromUrl(
      contextBrokerBaseUrl,
      'Begegnungszone',
      'https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:BEGEGNUNGSZONEOGD&srsName=EPSG:4326&outputFormat=json'
    );
  }

  await setupNgsiProxy({
    ngsiProxyBaseUrl, ngsiProxyPublicBaseUrl, contextBrokerBaseUrl, ngsiProxyCallbackBaseUrl
  });

}

setup();
