import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: process.env.REACT_APP_KEYCLOAK_AUTH_URL,
  realm: 'instagram-realm',
  clientId: 'frontend-client'
  
});

export default keycloak


