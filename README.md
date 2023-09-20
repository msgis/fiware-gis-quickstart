# Fiware GIS Quickstart

Get up and running with Fiware GIS integrations ([QGIS](https://github.com/msgis/qgis-fiware), [ArcGIS](https://github.com/msgis/arcgis-fiware) and [OpenLayers](https://github.com/msgis/ol-fiware)).

---

This repository contains everything you need to setup a minimal Fiware Context Broker including sample data and support services to quickly
get started with the [ms.GIS](https://www.msgis.com/) Fiware GIS integrations.

## Quickstart

Requirements

  - docker 20.10.0+
  - git

First clone the repository

    git clone https://github.com/msgis/fiware-gis-quickstart.git

and then run docker to start the app

    cd fiware-gis-quickstart
    docker compose up

The Fiware Context Broker (Orion LD) should be accessible on <http://localhost:1026>.
To ensure the sample data has been imported, the entity types can be quieried via <http://localhost:1026/ngsi-ld/v1/types>
and should contain at least `Hydrant`, `Trinkbrunnen`, `Schwimmbad` and `NgsiProxyConfig`.

If everything is up and running, proceed with the configuration of one or more Fiware GIS implementations:

  - [Fiware GIS integration for OpenLayers (HTML5 Web App)](https://github.com/msgis/ol-fiware)
  - [Fiware GIS integration for QGIS](https://github.com/msgis/qgis-fiware)
  - [Fiware GIS integration for ArcGIS](https://github.com/msgis/arcgis-fiware)

## Services

The docker-compose configuration includes the following services:

  - orion - the [Fireware Context Broker](https://github.com/FIWARE/context.Orion-LD), listening on <http://localhost:1026>
  - orionproxy - a simple reverse proxy (implemented with [nginx](https://www.nginx.com/)) to allow CORS requests, listening on <http://localhost:2026>
  - mongo-db - the database used by orion
  - ngsiproxy - an instance of [ngsi-proxy](https://github.com/conwetlab/ngsi-proxy) which exposes orion event subscriptions as [EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) for clients.
  - setup - imports sample data and configures ngsiproxy as soon as orion and ngsiproxy are up and running. The container will stop after the setup process has been finished.

## Data and entity types

The setup process imports the following data into the Context Broker:

  - Hydrant - [fire hydrants in Vienna](https://www.data.gv.at/katalog/en/dataset/stadt-wien_feuerhydrantenstandortewien),
    imported as entity type `Hydrant`,
    see <http://localhost:1026/ngsi-ld/v1/entities?type=Hydrant>.
  - Trinkbrunnen - [drinking fountains in Vienna](https://www.data.gv.at/katalog/en/dataset/stadt-wien_trinkbrunnenstandortewien),
    imported as entity type `Trinkbrunnen`,
    see <http://localhost:1026/ngsi-ld/v1/entities?type=Trinkbrunnen>.
  - Schwimmbad - [public swimming pools in Vienna](https://www.data.gv.at/katalog/en/dataset/stadt-wien_schwimmbderstandortewien),
    imported as entity type `Schwimmbad`,
    see <http://localhost:1026/ngsi-ld/v1/entities?type=Schwimmbad>

In addition to the entity types above, there is a special type called `NgsiProxyConfig`. This type is used to store the ngsiproxy configuration,
so a client can find the matching EventSource url for an entity type if needed.

To reset the data/entities the monog-db data volume can be removed by running

    cd fiware-gis-quickstart
    docker compose rm
    docker volume rm fiware-gis-quickstart_mongo-db-data

## Contributing

Everyone is invited to get involved and contribute to the project.

Simply create a [fork and pull request](https://docs.github.com/en/get-started/quickstart/contributing-to-projects) for code contributions or
feel free to [open an issue](https://github.com/msgis/fiware-gis-quickstart/issues) for any other contributions or issues.
