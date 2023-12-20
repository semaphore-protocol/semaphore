---
sidebar_position: 2
---

# Circuitos

El [circuito Semaphore](https://github.com/semaphore-protocol/semaphore/tree/main/packages/circuits) es el corazón del protocolo y está compuesto por tres partes:

-   [**Prueba de membresía**](/technical-reference/circuits#proof-of-membership)
-   [**Nullifier hash**](/technical-reference/circuits#nullifier-hash) (hash anulador)
-   [**Señal**](/technical-reference/circuits#signal)

![Semaphore circuit](https://github.com/semaphore-protocol/semaphore/raw/main/packages/circuits/scheme.png)

El diagrama anterior muestra cómo se utilizan las señales de entrada en el circuito Semaphore y cómo se calculan los resultados.

## Prueba de membresía

El circuito resume criptográficamente (hashes) el nullifier hash de la identidad utilizando la identity trapdoor (identidad trampilla) para generar el compromiso de identidad. Después de esto, el circuito verifica la prueba de membresía contra la raíz de Merkle y el compromiso de identidad.

**Insumos (inputs) privados:**

-   `treeSiblings[nLevels]`: los valores a lo largo del camino de Merkle rumbo al compromiso de identidad del usuario,
-   `treePathIndices[nLevels]`: la dirección (0/1) por nivel del árbol correspondiente al camino de Merkle rumbo al compromiso de identidad del usuario,
-   `identityNullifier`: la identidad secreta de 32-bits utilizada como anulador,
-   `identityTrapdoor`: la identidad secreta de 32-bits utilizada como trampilla.

**Resultados (outputs) públicos:**

-   `root`: La raíz de Merkle del árbol.

## Hash anulador (Nullifier hash)

El circuito resume criptográficamente (hashes) el identity nullifier con el nullifier externo y después revisa que el resultado coincida con el nullifier hash provisto.
Los nullifier hashes guardados en un contrato inteligente Semaphore permiten que el contrato rechace las pruebas que contengan un nullifier hash ya utilizado.

**Insumos (inputs) privados:**

-   `identityNullifier`: el identity secret (secreto de identidad) de 32 bits que se utiliza como nullifier.

**Insumos (inputs) públicos:**

-   `externalNullifier`: el nullifier externo de 32 bits.

**Resultados (outputs) públicos:**

-   `nullifierHash`: el hash del identity nullifier y del nullifier externo; se utiliza para prevenir que el mismo usuario emita dos señales.

**Procedimiento:**

## Señal

El circuito calcula un cuadrado ficticio del hash de la señal para prevenir que se altere la prueba.

**Insumos (inputs) públicos:**

-   `signalHash`: El hash de la señal del usuario.
