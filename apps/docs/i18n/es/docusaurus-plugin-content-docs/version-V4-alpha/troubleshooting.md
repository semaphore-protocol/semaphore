---
sidebar_position: 9
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Solución de problemas

Si estas sugerencias no funcionan, no dude en solicitar más ayuda y soporte en [Github Discussions](https://github.com/semaphore-protocol/semaphore/discussions) o [Discord](https://semaphore.pse.dev/discord) (canal "dev-chat").

## Creando un Grupo

Cuando crea un grupo y se revierte la transacción, asegúrese de que la identificación del grupo que está utilizando no existe en la red que está utilizando.

Para comprobarlo, puede utilizar la [Semaphore CLI](https://github.com/semaphore-protocol/semaphore/tree/feat/semaphore-v4/packages/cli) con el comando `get-groups` y la red que está utilizando y luego, asegúrese de que su id de grupo no sea parte de esa lista. También puede utilizar el [Semaphore explorer](https://explorer.semaphore.pse.dev/).

## Transacción revertida al usar el mismo external nullifier

Cuando genera una prueba usando el mismo [scope](/V4-alpha/glossary#scope) que usó para verificar una prueba antes,
la transacción se revertirá porque ese scope (y el [nullifier](/V4-alpha/glossary#nullifier)) ya se usó.

Si desea enviar y verificar varias pruebas de la misma identidad, debe usar un external nullifier diferente cada vez que genere una prueba.
