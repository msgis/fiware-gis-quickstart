const { importNGSILDfromUrl } = require('./lib/import');

const contextBrokerBaseUrl = process.env['CONTEXT_BROKER_BASEURL'];
const srcUrl = process.argv[2];

importNGSILDfromUrl(contextBrokerBaseUrl, srcUrl);
