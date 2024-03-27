---
sidebar_position: 7
---

# Glosario

## Identidad Semaphore

La identidad de un usuario en el protocolo Semaphore.
Una identidad contiene los tres valores que se mencionan a continuación:

-   [Compromiso de identidad](#compromiso-de-identidad-identity-commitment) (identity commitment): el valor público.
-   Identidad trampilla (identity trapdoor) y anulador de identidad (identity nullifier): valores secretos que únicamente son del conocimiento del usuario.

## Compromiso de identidad (Identity commitment)

El valor público de la [identidad Semaphore](#identidad-semaphore) utilizado en los [grupos Semaphore](#grupo-semaphore).

Semaphore utiliza la función hash [Poseidon](https://www.poseidon-hash.info/) para crear un compromiso de identidad a partir de los valores secretos de la identidad Semaphore.

## Grupo Semaphore

Un grupo es un [árbol de Merkle](#árbol-de-merkle-merkle-tree) binario e incremental en el que cada hoja contiene un [compromiso de identidad](#compromiso-de-identidad-identity-commitment) para un usuario.
El compromiso de identidad comprueba que un usuario es un miembro del grupo sin revelar la identidad Semaphore del usuario.

Semaphore utiliza la función hash **Poseidon** para crear árboles de Merkle.
Para mayor información, vea el [sitio web de Poseidon](https://www.poseidon-hash.info/).

## Árbol de Merkle (Merkle tree)

Un árbol en el que cada hoja (es decir, un nodo que no tiene hijos) es etiquetado con el hash criptográfico de un bloque de datos,
y cada nodo, que no es una hoja, es etiquetado con el hash criptográfico de las etiquetas de sus nodos hijos.
En los protocolos de conocimiento zero (ZK), los árboles de Merkle pueden ser utilizados para resumir y validar de forma eficiente grandes conjuntos de datos.
Para validar que un árbol contiene una hoja en específico, un verificador sólo necesita una porción de la estructura completa de datos.

Para más información, vea [árbol de Merkle en Wikipedia](https://es.wikipedia.org/wiki/%C3%81rbol_de_Merkle).

## Anulador (Nullifier)

Un valor utilizado para prevenir registros dobles o dos señales emitidas por el mismo usuario.

Ver [hash de circuito nullifier](/V3/technical-reference/circuits#hash-anulador-nullifier-hash).

## Retransmisor (Relayer)

Un tercero que recibe una comisión por incluir transacciones retransmitidas en la blockchain (McMenamin, Daza, and Fitz. https://eprint.iacr.org/2022/155.pdf, p.3).
Para preservar la anonimidad del usuario emitiendo una señal con Semaphore, una aplicación puede utilizar un retransmisor para publicar la transacción de la señal en Ethereum en nombre del usuario.

Las aplicaciones pueden ofrecer recompensas a los retransmisores e implementar mecanismos para prevenir ventajas maliciosas, como requerir que las señales incluyan la dirección del retransmisor, vinculando así la señal a esa dirección en específico (https://semaphore.pse.dev/whitepaper-v1.pdf, p.6).

## Archivos confiables de configuración (Trusted setup files)

Los parámetros verificables y seguros generados por la ceremonia de configuración de confianza de Semaphore.
Semaphore utiliza los archivos confiables de configuración para generar y verificar pruebas válidas de conocimiento cero.
Para generar o verificar pruebas válidas de conocimiento cero con Semaphore, las aplicaciones deben incluir los siguientes archivos _confiables de configuración_ de Semaphore.

-   semaphore.zkey
-   semaphore.wasm
-   semaphore.json

Para ver una lista completa de archivos listos para utilizarse, vea [trusted-setup-pse.org](https://www.trusted-setup-pse.org).
Para aprender más, vea la [ceremonia de configuración de confianza](https://storage.googleapis.com/trustedsetup-a86f4.appspot.com/semaphore/semaphore_top_index.html) (trusted setup ceremony).

## Señales (Signals)

El término "señales" en Semaphore se refiere a los valores que el usuario transmite al votar, confirmar, enviar un mensaje, etc. Por otro lado, "[señales](https://docs.circom.io/circom-language/signals/)" en Circom se refiere a datos que contienen elementos dentro del campo de Z/pZ. En Circom, las "señales" se pueden definir como entrada o salida y, de lo contrario, se consideran señales intermedias.
