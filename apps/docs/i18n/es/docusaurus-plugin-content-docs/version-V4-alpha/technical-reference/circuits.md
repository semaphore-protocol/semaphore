---
sidebar_position: 2
---

# Circuitos

El [circuito Semaphore](https://github.com/semaphore-protocol/semaphore/tree/feat/semaphore-v4/packages/circuits/semaphore.circom) es el corazón del protocolo y está compuesto por tres partes:

-   [**Prueba de membresía**](#prueba-de-membresia)
-   [**Nullifier**](#nullifier) (anulador)
-   [**Mensaje**](#mensaje)

![Semaphore circuit](https://github.com/semaphore-protocol/semaphore/raw/feat/semaphore-v4/packages/circuits/scheme.png)

El diagrama anterior muestra cómo se utilizan las señales de entrada en el circuito Semaphore y cómo se calculan los resultados.

## Prueba de membresía

El circuito deriva la clave pública del secreto y resume criptográficamente (hashes) a la clave pública para generar el compromiso de identidad.
Después de esto, el circuito verifica la prueba de membresía contra la raíz de Merkle y el compromiso de identidad.

**Insumos (inputs) privados:**

-   `merkleProofLength`: el número real de nodos en la ruta de prueba de Merkle,
-   `merkleProofIndices[MAX_DEPTH]`: la lista de 0s y 1s para calcular los hashes de los nodos en la posición correcta,
-   `merkleProofSiblings[MAX_DEPTH]`: la lista de nodos hermanos que se utilizarán para calcular los hashes de los nodos hasta la raíz,
-   `secret`: el EdDSA [escalar secreto](https://www.rfc-editor.org/rfc/rfc8032#section-5.1.5) derivado de la clave privada.

**Resultados (outputs) públicos:**

-   `merkleRoot`: La raíz de Merkle del árbol.

## Hash anulador (Nullifier hash)

El circuito resume criptográficamente (hashes) el secreto con el alcance (scope) y después revisa que el resultado coincida con el nullifier provisto.

**Insumos (inputs) privados:**

-   `secret`: el EdDSA [escalar secreto](https://www.rfc-editor.org/rfc/rfc8032#section-5.1.5) derivado de la clave privada.

**Insumos (inputs) públicos:**

-   `scope`: el valor utilizado como un tema sobre el cual los usuarios pueden generar una prueba válida solo una vez.

**Resultados (outputs) públicos:**

-   `nullifier`: el valor diseñado para ser un identificador único y utilizado para evitar que la misma prueba se utilice dos veces.

## Mensaje

El circuito calcula un cuadrado ficticio del hash del mensaje para prevenir que se altere la prueba.

**Insumos (inputs) públicos:**

-   `message`: el valor anónimo que el usuario difunde.
