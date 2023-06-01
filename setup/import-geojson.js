const { importGeoJSONfromUrl } = require('./lib/import');

const contextBrokerBaseUrl = process.env['CONTEXT_BROKER_BASEURL'];
const entityType = process.argv[2];
const srcUrl = process.argv[3];

importGeoJSONfromUrl(contextBrokerBaseUrl, entityType, srcUrl);
