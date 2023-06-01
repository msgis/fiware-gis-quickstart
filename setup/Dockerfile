FROM node:18-alpine

WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# default config
ENV NGSI_PROXY_BASEURL=http://ngsiproxy:3000 \
    NGSI_PROXY_CALLBACK_BASEURL=http://ngsiproxy:3000 \
    CONTEXT_BROKER_BASEURL=http://orion:1026

# Bundle app source
COPY . .

CMD [ "node", "index.js" ]
