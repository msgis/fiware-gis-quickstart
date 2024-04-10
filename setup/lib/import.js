const axios = require('axios');
const { PromisePool } = require('@supercharge/promise-pool');

function* chunks(arr, n) {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}

async function addEntities(contextBrokerBaseUrl, entities) {
  const batchSize = 10;
  const batches = [...chunks(entities, batchSize)];
  await PromisePool
    .withConcurrency(2)
    .for(batches)
    .handleError(async (error /*, batch, pool */) => {
      throw error;
    })
    .process(async (batch) => {
      return await axios.post(`${contextBrokerBaseUrl}/ngsi-ld/v1/entityOperations/create`, batch);
    });
}

function geoJSONFeatureToEntity(entityType, feature) {
  const ignnoreKeys = ['SE_ANNO_CAD_DATA'];
  const id = feature.id || Math.random().toString(36).substring(2, 15);
  const entityProps = Object.keys(feature.properties).reduce((entityProps, key) => {
    if (ignnoreKeys.includes(key)) {
      return entityProps;
    }
    entityProps[key] = {
      type: 'Property',
      value: feature.properties[key]
      // unitCode: 'CEL'
    };
    return entityProps;
  }, {});
  return {
    id: `urn:ngsi-ld:${entityType}:${id}`,
    type: entityType,
    location: {
      type: 'GeoProperty',
      value: feature.geometry
    },
    ...entityProps
  };
}

async function entityTypeExists(contextBrokerBaseUrl, entityType) {
  const response = await axios.get(`${contextBrokerBaseUrl}/ngsi-ld/v1/types`);
  return response.data.typeList.includes(entityType);
}

async function importGeoJSONfromUrl(contextBrokerBaseUrl, entityType, srcUrl) {
  const { data: featureCollection } = await axios.get(srcUrl);
  const entities = featureCollection.features.map(geoJSONFeatureToEntity.bind(null, entityType));
  await addEntities(contextBrokerBaseUrl, entities);
}

async function importNGSILDfromUrl(contextBrokerBaseUrl, srcUrl) {
  const { data: entities } = await axios.get(srcUrl);
  await addEntities(contextBrokerBaseUrl, entities);
}

module.exports = {
  importGeoJSONfromUrl,
  importNGSILDfromUrl,
  entityTypeExists
};
