---
sidebar_position: 6
---

# Subgrafo

[The Graph](https://thegraph.com/) es un protocolo para indexar redes como Ethererum o IPFS.
Las personas dueñas de los sitios publica _subgrafos_ que exponen los datos del sitio para que cualquiera los pueda consultar.
El subgrafo de Semaphore le permite obtener datos del contrato inteligente [`Semaphore.sol`](https://github.com/semaphore-protocol/semaphore/blob/main/packages/contracts/Semaphore.sol).

:::tip
El protocolo The Graph utiliza el lenguaje de consulta [GraphQL](https://graphql.org/). Para ver ejemplos visite [GraphQL API documentation](https://thegraph.com/docs/developer/graphql-api). Para ver la lista de subgrafos de Semaphore visite el [repositorio de subgrafos](https://github.com/semaphore-protocol/subgraph).
:::

## Esquema

### Árbol de Merkle

-   `id`: identificador único entre todas las entidades de árboles de Merkle,
-   `depth`: profundidad del árbol de Merkle,
-   `root`: raíz del árbol de Merkle,
-   `zeroValue`: valor cero del árbol de Merkle,
-   `numberOfLeaves`: número total de hojas en el árbol,
-   `group`: link a la entidad del grupo.

### Grupo

-   `id`: identificador único entre todas las entidades del grupo,
-   `merkleTree`: link a la entidad del árbol de Merkle,
-   `timestamp`: timestamp (registro de tiempo) del bloque,
-   `admin`: administrador del grupo,
-   `members`: lista de los miembros del grupo,
-   `verifiedProofs`: lista de las pruebas del grupo.

### Miembro

-   `id`: identificador único entre todos los miembros,
-   `identityCommitment`: compromiso de identidad Semaphore,
-   `timestamp`: timestamp del bloque,
-   `index`: índice de la hoja del árbol,
-   `group`: link a la entidad del grupo.

### PruebaVerificada

-   `id`: identificador único entre todas las entidades con una prueba verificada (VerifiedProof),
-   `signal`: señal del usuario,
-   `merkleTreeRoot`: raíz del árbol de Merkle,
-   `nullifierHash`: hash nullifier (anulador),
-   `externalNullifier`: nullifier externo,
-   `timestamp`: timestamp del bloque,
-   `group`: link a la entidad del grupo.
