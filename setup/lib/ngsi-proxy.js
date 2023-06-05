const axios = require('axios');

async function getEntityTypes(contextBrokerBaseUrl) {
  const { data } = await axios.get(contextBrokerBaseUrl + '/ngsi-ld/v1/types');
  return data.typeList;
}

async function createEventSource({
  ngsiProxyBaseUrl, ngsiProxyPublicBaseUrl,
  contextBrokerBaseUrl, ngsiProxyCallbackBaseUrl, entityType
}) {
  // create EventSource
  const { data: { connection_id } } = await axios.post(ngsiProxyBaseUrl + '/eventsource');
  // create callback
  const { data: { callback_id} } = await axios.post(ngsiProxyBaseUrl + '/callbacks', {
    connection_id: connection_id
  });
  // add subscription
  await axios.post(contextBrokerBaseUrl + '/ngsi-ld/v1/subscriptions', {
    description: `Notify all ${entityType} changes`,
    type: 'Subscription',
    entities: [{ type: entityType }],
    notification: {
      format: 'keyValues',
      endpoint: {
        uri: `${ngsiProxyCallbackBaseUrl}/callbacks/${callback_id}`,
        accept: 'application/json',
      },
    },
  });
  return {
    type: entityType,
    eventSourceUrl: `${ngsiProxyPublicBaseUrl}/eventsource/${connection_id}`
  };
}

async function addNgsiProxyConfig({ contextBrokerBaseUrl, type, eventSourceUrl }) {
  const entityType = 'NgsiProxyConfig';
  return await axios.post(contextBrokerBaseUrl + '/ngsi-ld/v1/entities', {
    id: `urn:ngsi-ld:${entityType}:${type}`,
    type: entityType,
    eventSourceUrl: {
      type: 'Property',
      value: eventSourceUrl
    }
  });
}

async function setupNgsiProxy({
  ngsiProxyBaseUrl, ngsiProxyPublicBaseUrl, contextBrokerBaseUrl, ngsiProxyCallbackBaseUrl
}) {
  const entityTypes = await getEntityTypes(contextBrokerBaseUrl);
  return Promise.all(entityTypes.map(async (entityType) => {
    const { type, eventSourceUrl } = await createEventSource({
      ngsiProxyBaseUrl, ngsiProxyPublicBaseUrl,
      contextBrokerBaseUrl, ngsiProxyCallbackBaseUrl, entityType
    });
    await addNgsiProxyConfig({ contextBrokerBaseUrl, type, eventSourceUrl });
    // eslint-disable-next-line no-console
    console.log(`created EventSource url for ${type}: ${eventSourceUrl}`);
  }));
}

module.exports = {
  setupNgsiProxy
};

// Connect EventSource with curl
// curl -N "http://localhost:3000/eventsource/$CONNECTION_ID"
//
// Update Hydrant with curl
// curl --location --request PATCH 'http://localhost:1026/ngsi-ld/v1/entities/urn:ngsi-ld:Hydrant:HYDRANTOGD.36612499/attrs/OBJECTID' \
//   --header 'Content-Type: application/json' \
//   --data '{
//       "value": 36612499,
//       "type": "Property"
//   }'
