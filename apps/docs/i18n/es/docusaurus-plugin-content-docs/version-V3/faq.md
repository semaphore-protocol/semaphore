---
sidebar_position: 8
---

# FAQ

## ¿Qué es Semaphore?

Semaphore es un protocolo de conocimiento cero (zero-knowledge) que permite a los usuarios demostrar su pertenencia a un grupo y enviar señales como votos, comentarios o mensajes de texto sin revelar la identidad del usuario.

Esto significa que las señales no tienen conexión con las identidades.

También proporciona un mecanismo simple para evitar la doble señalización, lo que significa que no puede verificar la misma prueba dos veces.

## ¿Dónde puedo hacer preguntas sobre Semaphore?

Puede hacer preguntas sobre Semaphore en [Discord](https://semaphore.pse.dev/discord) o abriendo un [Semaphore Discussion](https://github.com/semaphore-protocol/semaphore/discussions).

## ¿Por qué las identidades requieren tanto `identity trapdoor` como `identity nullifier`?

Tener dos valores privados proporciona una capa de seguridad adicional. Si alguien rompe el hash del nullifier (imagínese que existe cierta maleabilidad de que la preimagen de Poseidón es fácil de encontrar cuando se aplica un hash con un valor específico X, que es el external nullifier elegido por los desarrolladores), el atacante puede encontrar todos los mensajes que envió la misma persona, pero no puede encontrar a quién, porque también está el trapdoor, que podría ser más difícil de romper.

## ¿Cuál es la diferencia entre `identity nullifier`, `external nullifier` y `nullifier hash`?

El identity nullifier (anulador de identidad) es uno de los valores secretos del usuario, mientras que el external nullifier (anulador externo) se puede utilizar como un tema sobre el que los usuarios pueden generar una prueba válida (por ejemplo, enviar votos anónimos) un número limitado de veces.

Tanto el identity nullifier como el external nullifier se utilizan para evitar que la misma prueba se verifique dos veces, lo que significa que si un usuario genera la misma prueba (con la misma identidad y el mismo external nullifier) dos veces, la segunda no será válida.

Finalmente, el nullifier hash (hash del anulador) es solo el hash del identity nullifier y el external nullifier que se utiliza para comprobar si ya se ha generado la misma prueba.

En el caso de una aplicación de votación, si tiene un grupo y desea que todos los miembros de este grupo voten solo una vez, puede usar la identificación del grupo como external nullifier. Cuando un usuario vota por primera vez, puede guardar el hash de su identity nullifier y la identificación del grupo (es decir, el nullifier hash) y evitar la doble votación comprobando si ese hash ya existe.

Vea los [circuitos de Semaphore](https://docs.semaphore.pse.dev/technical-reference/circuits) para más información técnica, o el [Semaphore boilerplate](https://github.com/semaphore-protocol/boilerplate) para un caso de uso real.

## ¿Por qué debo evitar que las pruebas se verifiquen dos veces?

Dado que las pruebas de conocimiento cero son completamente anónimas, es importante evitar que las generadas por identidades elegibles sean reutilizadas por una parte malintencionada.

En una aplicación de voto anónimo, por ejemplo, sin chequeos, se podría reutilizar una prueba válida para volver a votar.

## ¿Dónde puedo encontrar ejemplos de aplicaciones que utilicen Semaphore?

Puede encontrar algunas aplicaciones que usan Semaphore en [este blog post](https://mirror.xyz/privacy-scaling-explorations.eth/Yi4muh-vzDZmIqJIcM9Mawu2e7jw8MRnwxvhFcyfns8).

## ¿Cómo puedo iniciar un proyecto usando Semaphore?

Hay tres formas de comenzar a usar Semaphore en su proyecto: usando la [Semaphore CLI](https://github.com/semaphore-protocol/semaphore/tree/main/packages/cli), usando el [Semaphore boilerplate](https://github.com/semaphore-protocol/boilerplate) como una plantilla o bifurcándolo, o instalando los paquetes de Semaphore manualmente.

### Semaphore CLI

Para crear un nuevo proyecto podrías usar `npx` o instalar la [Semaphore CLI](https://github.com/semaphore-protocol/semaphore/tree/main/packages/cli) globalmente usando `npm` y entonces crear un nuevo proyecto usando el comando `semaphore create`. Vea [Configuración Rápida](https://docs.semaphore.pse.dev/quick-setup) para más información.

Hay tres plantillas soportadas en este momento: `contracts-hardhat`, `monorepo-ethers` y `monorepo-subgraph`.

-   `contracts-hardhat`: Contiene un caso de uso básico de Semaphore. Viene con un contrato de muestra, una prueba (test) para ese contrato y una tarea (task) de muestra que implementa (deploys) ese contrato.
-   `monorepo-ethers`: Es una aplicación completa que demuestra un caso de uso básico de Semaphore. Viene con un contrato de muestra, una prueba para ese contrato y una tarea de muestra que implementa ese contrato. También contiene una interfaz para usar el contrato. Esta plantilla usa [Ethers](https://github.com/ethers-io/ethers.js/) por detrás para obtener datos on-chain.
-   `monorepo-subgraph`: Es lo mismo que la plantilla `monorepo-ethers`, pero usa [The Graph protocol](https://thegraph.com/) por detrás para obtener datos on-chain.

La Semaphore CLI también se puede usar para obtener datos de grupo de una red soportada. Hay comandos como: `get-groups`, `get-group`, `get-members`, `get-proofs`:

-   `get-groups`: Muestra la lista de grupos de una red soportada.
-   `get-group`: Muestra los datos de un grupo de una red soportada.
-   `get-members`: Muestra los miembros de un grupo de una red soportada.
-   `get-proofs`: Muestra las pruebas de un grupo de una red soportada.

### Semaphore boilerplate

Para crear un proyecto, también puede utilizar el [Semaphore boilerplate](https://github.com/semaphore-protocol/boilerplate). Puede bifurcarlo o usarlo como plantilla.

Las plantillas de la Semaphore CLI y el Semaphore boilerplate contienen el mismo código, que es una aplicación de feedback en la que puede crear una identidad, unirse a un grupo, y enviar su feedback de forma anónima. Son casi lo mismo, la única diferencia es que las plantillas usan CSS para que pueda decidir el framework de CSS o librería que desea usar y el boilerplate usa [ChakraUI](https://chakra-ui.com/) por defecto.

También puede probar la aplicación Semaphore boilerplate en vivo aquí: https://demo.semaphore.pse.dev.

### Instalación manual

Alternativamente, también puede instalar todos los paquetes manualmente usando npm o yarn siguiendo la [documentación de Semaphore](https://docs.semaphore.pse.dev).

## ¿Cómo puedo contribuir al protocolo?

Hay varias formas de contribuir al protocolo, puede encontrar más información al respecto aquí: https://github.com/semaphore-protocol#ways-to-contribute.
