---
id: introduction
title: ¿Qué es Semaphore?
sidebar_position: 1
slug: /
---

## General

[Semaphore](https://github.com/semaphore-protocol/semaphore) es un protocolo que utiliza [conocimiento cero (zero-knowledge)](https://z.cash/technology/zksnarks) y permite emitir una señal (por ejemplo: un voto o una aprobación) como una persona probablemente miembro de un grupo sin revelar su identidad.
Además, proporciona un mecanismo sencillo para impedir que un mismo usuario emita dos señales.
Algunos de los potenciales casos de uso son: votaciones, denuncias, DAOs anónimas y mezcladores.

## Características

Con Semaphore puede permitir que sus usuarios realicen las siguientes acciones:

1. [Crear una identidad Semaphore](/V3/guides/identities/).
2. [Agregar su identidad Semaphore a un grupo (es decir: _Árbol de Merkle_)](/V3/guides/groups/).
3. [Enviar una señal anónima, verificable (ej. un voto o una aprobación)](/V3/guides/proofs/).

Cuando un usuario emite una señal (por ejemplo: un voto), las pruebas de conocimiento cero (ZKP) pueden asegurar que el usuario se ha incorporado al grupo y aún no ha emitido una señal con su nullifier (anulador).

Semaphore utiliza contratos internos a la cadena en Solidity y librerías de JavaScript externas a la cadena que funcionan de forma conjunta.

-   Externos a la cadena (off-chain), se pueden utilizar librerías de Javascript para crear identidades, organizar grupos y generar pruebas.
-   Internos a la cadena (on-chain), se pueden utilizar contratos en Solidity para organizar grupos y verificar pruebas.

## Beneficios para desarrolladores

Semaphore está diseñado para ser un _componente de privacidad_ simple y genérico para aplicaciones descentralizadas (dApps) en Ethereum. Promueve el diseño modular de las aplicaciones, lo que permite que los desarrolladores de las dApps escojan y personalicen los componentes que necesitan externos e internos a la cadena.

## Respecto al código

La base del protocolo es la [lógica de circuitos](https://github.com/semaphore-protocol/semaphore/tree/main/packages/circuits/scheme.png) (circuit logic).
Además de los circuitos,
Semaphore ofrece [contratos en Solidity](https://github.com/semaphore-protocol/semaphore/tree/main/packages/contracts)
y [librerías en JavaScript](https://github.com/semaphore-protocol/semaphore#-packages) que permiten que los desarrolladores generen pruebas de conocimiento cero (ZKP) y las verifiquen con un esfuerzo mínimo.

### Ceremonia de configuración de confianza (Trusted Setup Ceremony)

Los [parámetros seguros](/V3/glossary#archivos-confiables-de-configuración-trusted-setup-files) para generar pruebas válidas con los circuitos Semaphore fueron generados en una [ceremonia de configuración de confianza](https://storage.googleapis.com/trustedsetup-a86f4.appspot.com/semaphore/semaphore_top_index.html) que se completó con más de 300 participantes el [29 de Marzo de 2022](https://etherscan.io/tx/0xec6dbe68883c7593c2bea82f55af18b3aeb5cc146e026d0083a9b3faa9aa0b65#eventlog).

### Auditorías

| Versión | Auditores                         | Reporte                                                                                                              | Alcance                  |
| ------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| v2.0.0  | [PSE](https://pse.dev/)           | [Semaphore_2.0.0_Audit.pdf](https://github.com/semaphore-protocol/semaphore/files/9850441/Semaphore_2.0.0_Audit.pdf) | `circuits`, `contracts`  |
| v2.5.0  | [PSE](https://pse.dev/)           | [Semaphore_2.5.0_Audit.pdf](https://github.com/semaphore-protocol/semaphore/files/9845008/Semaphore_2.5.0_Audit.pdf) | `contracts`, `libraries` |
| v3.0.0  | [Veridise](https://veridise.com/) | [Semaphore_3.0.0_Audit.pdf](https://github.com/semaphore-protocol/semaphore/files/9845008/Semaphore_2.5.0_Audit.pdf) | `circuits`, `contracts`  |

:::info
Si está utilizando una de las versiones anteriores de Semaphore, vea la documentación de [Semaphore V1](/V1) o de [Semaphore V2](/V2).
:::
