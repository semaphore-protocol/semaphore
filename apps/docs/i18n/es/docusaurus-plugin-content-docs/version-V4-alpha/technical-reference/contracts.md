---
sidebar_position: 3
---

# Contratos

Los contratos de Semaphore están diseñados con un código mínimo pero esencial, permitiendo a los desarrolladores gestionar de manera eficiente grupos en cadena (on-chain) y verificar o validar pruebas de conocimiento cero.
Semaphore incluye tres contratos:

-   [`SemaphoreVerifier.sol`](https://github.com/semaphore-protocol/semaphore/blob/feat/semaphore-v4/packages/contracts/contracts/base/SemaphoreVerifier.sol)
-   [`SemaphoreGroups.sol`](https://github.com/semaphore-protocol/semaphore/blob/feat/semaphore-v4/packages/contracts/contracts/base/SemaphoreGroups.sol)
-   [`Semaphore.sol`](https://github.com/semaphore-protocol/semaphore/blob/feat/semaphore-v4/packages/contracts/contracts/Semaphore.sol)

:::info
Para utilizar los contratos e interfaces Semaphore en su proyecto, instale el paquete NPM [`@semaphore-protocol/contracts`](https://github.com/semaphore-protocol/semaphore/tree/feat/semaphore-v4/packages/contracts).
:::

## SemaphoreVerifier.sol

`SemaphoreVerifier.sol` es una versión extendida del verificador Groth16 generado por defecto con [SnarkJS](https://github.com/iden3/snarkjs). Contiene una función para verificar pruebas y una lista de parámetros de claves de verificación.

Dado que el circuito Semaphore se compila con un rango `MAX_DEPTH` de 1 a 32 durante el [trusted setup](/V4-alpha/glossary#trusted-setup), el verificador debe incluir los parámetros de las claves de verificación de cada instancia.

## SemaphoreGroups.sol

`SemaphoreGroups.sol` es un contrato abstracto que contiene las funciones necesarias para crear grupos on-chain (en cadena) y agregar/eliminar/actualizar miembros. A cada grupo se le asigna un administrador, que puede ser una cuenta de Ethereum u otro contrato.

Este contrato utiliza la biblioteca [`LeanIMT.sol`](https://github.com/privacy-scaling-explorations/zk-kit/blob/main/packages/imt.sol/contracts/internal/InternalLeanIMT.sol) ZK-Kit, un árbol de Merkle incremental binario optimizado con [Poseidon](https://www.poseidon-hash.info).

## Semaphore.sol

`Semaphore.sol` hereda `SemaphoreGroups.sol` y añade funciones para verificar (`verifyProof`) o validar (`validateProof`) una prueba de Semaphore. El único parámetro del constructor es la dirección `SemaphoreVerifier.sol`, que debe implementarse por separado.

La función `verifyProof` contiene código para comprobar si una prueba de Semaphore es verdadera o falsa. Es una función de vista de solo lectura que además de verificar la prueba también incluye un mecanismo para realizar un seguimiento de las pruebas generadas con raíces antiguas de Merkle, i.e., instancias de grupo que contenían menos o diferentes miembros.

La función `validateProof` primero verifica si una prueba con el mismo anulador ya ha sido validada y luego verifica la prueba con la función `verifyProof` y guarda el anulador. Esta función también crea un registro con la identificación del grupo y la prueba, que luego se puede verificar adicionalmente off-chain.

:::info
Los contratos de Semaphore se implementan en las principales redes de prueba y en Arbitrum One.
Visitando [contratos desplegados](/V4-alpha/deployed-contracts) puede encontrar las direcciones correspondientes a su red.
::::
