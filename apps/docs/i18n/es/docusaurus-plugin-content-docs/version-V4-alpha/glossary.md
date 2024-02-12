---
sidebar_position: 7
---

# Glosario

## Identidad

La identidad de un usuario en el protocolo Semaphore.
Una identidad de Semaphore consta de un par de claves pública/privada [EdDSA](https://en.wikipedia.org/wiki/EdDSA) y un [compromiso de identidad](#identity-commitment).
Semaphore utiliza una implementación [EdDSA](https://github.com/privacy-scaling-explorations/zk-kit/tree/main/packages/eddsa-poseidon) basada en [Baby Jubjub](https://eips.ethereum.org/EIPS/eip-2494) y [Poseidón](https://www.poseidon-hash.info).

## Compromiso de identidad (Identity commitment)

El valor público de la [identidad Semaphore](#identity) utilizado en los [grupos Semaphore](#semaphore-group).
Semaphore utiliza la función hash [Poseidon](https://www.poseidon-hash.info/) para crear un compromiso de identidad a partir de la clave pública de la identidad Semaphore.

## Grupo

Un grupo es un [árbol de Merkle](#merkle-tree) en el que cada hoja contiene un [compromiso de identidad](#identity-commitment) para un usuario.
Semaphore utiliza la implementación [LeanIMT](https://zkkit.pse.dev/classes/_zk_kit_imt.LeanIMT.html), que es un árbol de Merkle incremental binario optimizado.

Semaphore utiliza la función hash [Poseidon](https://www.poseidon-hash.info) para crear árboles de Merkle.

## Árbol de Merkle (Merkle tree)

Un [árbol](https://en.wikipedia.org/wiki/Merkle_tree) en el que cada hoja (es decir, un nodo que no tiene hijos) es etiquetado con el hash criptográfico de un bloque de datos,
y cada nodo, que no es una hoja, es etiquetado con el hash criptográfico de las etiquetas de sus nodos hijos.
En los protocolos de conocimiento zero (ZK), los árboles de Merkle pueden ser utilizados para resumir y validar de forma eficiente grandes conjuntos de datos.
Para validar que un árbol contiene una hoja en específico, un verificador sólo necesita una porción de la estructura completa de datos.

## Alcance (scope)

Un valor utilizado como un tema en el que los usuarios pueden generar una prueba válida solo una vez. Se supone que el scope se utiliza para generar el [anulador](#nullifier).

## Anulador (Nullifier)

Un valor diseñado para ser un identificador único y utilizado para evitar que la misma prueba de conocimiento cero se utilice dos veces.

En Semaphore, el nullifier es el hash del scope y la clave privada de la identidad Semaphore del usuario.

## Mensaje

El término "mensaje" en Semaphore se refiere al valor que transmite el usuario al votar, confirmar, enviar un mensaje de texto, entre otros.

## Retransmisor (Relayer)

Un tercero que recibe una comisión por incluir transacciones retransmitidas en la blockchain ([McMenamin, Daza, and Fitz, p. 3](https://eprint.iacr.org/2022/155.pdf)).
Para preservar la anonimidad del usuario emitiendo una señal con Semaphore, una aplicación puede utilizar un retransmisor para publicar la transacción de la señal en Ethereum en nombre del usuario.

Las aplicaciones pueden ofrecer recompensas a los retransmisores e implementar mecanismos para prevenir ventajas maliciosas, como requerir que las señales incluyan la dirección del retransmisor, vinculando así la señal a esa dirección en específico (https://docs.semaphore.pse.dev/whitepaper-v1.pdf, p.6).

## Configuración de confianza (Trusted setup)

Una configuración de confianza en el contexto de pruebas de conocimiento cero, particularmente zk-SNARKs, es una fase preparatoria donde se generan [ciertos parámetros](#trusted-setup-files) para su uso posterior en la creación y verificación de pruebas.
Este proceso debe ser realizado por partes confiables, ya que cualquier información secreta retenida (residuos tóxicos) podría comprometer la integridad del sistema al permitir la creación de pruebas falsas.

## Archivos confiables de configuración (Trusted setup files)

Los parámetros verificables y seguros generados por la ceremonia de configuración de confianza de Semaphore.
Semaphore utiliza los archivos confiables de configuración para generar y verificar pruebas válidas de conocimiento cero.

El [circuito de Sempahore](/V4-alpha/technical-reference/circuits) incluye un parámetro para establecer la profundidad máxima del árbol (MAX_DEPTH).
Durante la configuración de confianza, los parámetros se generan específicamente para cada instancia de circuito, alineándose con su MAX_DEPTH designado (de 1 a 32).
