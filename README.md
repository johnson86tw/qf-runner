# clrfund-vue3

## Development

### Deployment
- /clrfund/graph-node/docker
  - `docker compose up -d` or `docker compose restart`
- /clrfund
  - `yarn start:subgraph`
  - `yarn start:node`
  - `yarn deploy:local`
- export `8000` and `18545` port

### Local
#### original clrfund
- /clrfund
  - `yarn start:gun`
- /clrfund/vue-app
  - `yarn serve`


#### clrfund-vue3
- /clrfund-vue3
  - `yarn dev`