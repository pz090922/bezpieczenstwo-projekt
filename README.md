# bezpieczenstwo-projekt
### Autor: Paweł Zawistowski
Jest to projekt klona Instagrama. Można dodawać posty, komentować like'ować, zmieniać profilowe, jak i również obserwować innych użytkowników i przeglądać ich profile. Próbowałem zrobić, aby wszystko było w kubernetesie, ale z jakiegoś niewiadomego mi powódu, Keycloak nie dawał mi dostępu do api, a niestety nie miałem czasu, żeby to zbadać, więc prawdopodobnie w czasie będę to zmieniał
## Mały problem
Istnieje folder kubectl--Nie_działa. Na niego proszę nie zwracać uwagi. Chciałem po prostu trzymać wszystko na jednym repo, i tam jest wszystko, aby działało w Kubernetes, tylko jak już wspomniałem, Keycloak "nie chciał" mnie uwierzytelnić

## Keycloak
Uwierzytelnianie polega na wykorzystaniu dwóch klientów. Jeden nazywa się frontend-client, który jest publiczny, a drugi już z secretem nazywa się backend-api. Użyłem również pkce.

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

Odpalamy Instagrama w przeglądarce wpisując adres
```
http://localhost:3000
```
Koniec 😊
