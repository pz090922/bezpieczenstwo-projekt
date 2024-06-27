# bezpieczenstwo-projekt

Jest to projekt z instagramem. Próbowałem zrobić, aby wszystko było w kubernetesie, ale z jakiegoś niewiadomego mi powódu, Keycloak nie dawał mi dostępu do api, a niestety nie miałem czasu, żeby to zbadać, więc prawdopodobnie w czasie będę to zmieniał


## Jak uruchomić
Uruchamiamy pod'y
```
kubectl apply -f keycloak.yaml
kubectl apply -f mongo-open.yaml
```

Następnie logujemy się do keycloaka

```
localhost:8080

login i hasło = admin
```

Klikamy create realm i następnie z pliku
```
realm-export.json
```
Kopiujemy zawarotść i tworzymy realm.

Niestety (bądź nie), ale tworząc realm, nasz secret jest w postaci "**********", więc jeśli zależy, to można to zmienić wchodząc w:
```
Clients -> backend-api -> Credentials
```
Musimy wtedy tylko zmienić też również po stronie backend'u. Wystarczy wejść w plik

```
Server.js
```

I tam podmienić

```js
const keycloak = new Keycloak({ store: memoryStore },{
  "realm": "instagram-realm",
  "auth-server-url": "http://localhost:8080/",
  "ssl-required": "external",
  "resource": "backend-api",
  "verify-token-audience": true,
  "credentials": {
    "secret": "**********" <--------------
  },
  "use-resource-role-mappings": true,
  "confidential-port": 0,
  "policy-enforcer": {
    "credentials": {}
  },
  "bearer-only": true,
});
```

Teraz wystarczy wejść w katalog server i client wpisać

```
npm install
```

i na koniec uruchomić (bedac w katalogu client)
```
npm start
```

A w przypadku serwera (będąc w katalogu server)

```
node server.js
```