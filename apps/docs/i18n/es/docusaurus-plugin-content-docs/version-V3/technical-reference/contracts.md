---
sidebar_position: 3
---

# Contratos

Semaphore incluye dos tipos de contratos:

-   [**Contratos base**](/docs/technical-reference/contracts#base-contracts)
-   [**Contratos para la extensión**](/docs/technical-reference/contracts#extension-contracts)

así como [**Semaphore.sol**](/docs/technical-reference/contracts#semaphoresol), el principal contrato desplegado en las redes soportadas por Semaphore.

:::info
Para utilizar los contratos e interfaces Semaphore en su proyecto, instale el paquete NPM [`@semaphore-protocol/contracts`](https://github.com/semaphore-protocol/semaphore/tree/main/packages/contracts).
:::

## Contratos base

Semaphore ofrece los siguientes contratos base:

-   [`SemaphoreVerifier.sol`](https://github.com/semaphore-protocol/semaphore/blob/main/packages/contracts/base/SemaphoreVerifier.sol): contiene una función para verificar pruebas Semaphore;
-   [`SemaphoreGroups.sol`](https://github.com/semaphore-protocol/semaphore/blob/main/packages/contracts/base/SemaphoreGroups.sol): contiene las funciones para crear grupos y añadir/remover/actualizar miembros.

Los contratos base están relacionados de forma muy cercana al protocolo.
Puede utilizarlos en su contrato o puede utilizar [**Semaphore.sol**](/docs/technical-reference/contracts#semaphoresol) que ya los tiene integrados.

:::info
Si bien algunas dApps pueden utilizar grupos internos a la cadena, otros puede que prefieran utilizar grupos externos a la cadena, por lo que únicamente guardarán las raíces de sus árboles en el contrato.
:::

## Contratos para la extensión

-   [`SemaphoreVoting.sol`](https://github.com/semaphore-protocol/semaphore/blob/main/packages/contracts/extensions/SemaphoreVoting.sol): contrato para votaciones que contiene las funciones esenciales para crear encuestas, añadir electores, y emitir votos de forma anónima;
-   [`SemaphoreWhistleblowing.sol`](https://github.com/semaphore-protocol/semaphore/blob/main/packages/contracts/extensions/SemaphoreWhistleblowing.sol): contrato para denuncias que contiene las funciones esenciales para crear entidades (por ejemplo: organizaciones sin fines de lucro), añade denunciantes, y filtraciones publicadas de forma anónima.

Estos contratos extienden las capacidades del protocolo y proveen una aplicación lógica para casos de uso específicos.
En un futuro se incluirán más extensiones.

## Semaphore.sol

[`Semaphore.sol`](https://github.com/semaphore-protocol/semaphore/blob/main/packages/contracts/contracts/Semaphore.sol) utiliza los contratos base como punto de partida, los integra y de forma adicional brinda:

-   un sistema que solamente permite que administradores (ej. cuentas de Ethereum o contratos inteligentes) controlen grupos;
-   un mecanismo que guarda los [hashes anuladores](/docs/technical-reference/circuits#nullifier-hash) (nullifier hashes) de cada grupo y evita que el mismo miembro emita dos señales;
-   un mecanismo que permite que pruebas Semaphore generadas con raíces de Merkle antiguas sean verificadas por un periodo de tiempo determinado por el administrador del grupo.

:::info
Visitando [contratos desplegados](/docs/deployed-contracts) puede encontrar las direcciones correspondientes a su red.
::::
