---
sidebar_position: 10
---

# FAQ

## ¿Dónde puedo hacer preguntas sobre Semaphore?

Puede hacer preguntas sobre Semaphore en [Discord](https://semaphore.pse.dev/discord) o abriendo un [Semaphore Discussion](https://github.com/semaphore-protocol/semaphore/discussions). Las preguntas más frecuentes se enumerarán a continuación.

## ¿Por qué debo evitar que las pruebas se verifiquen dos veces?

Dado que las pruebas de conocimiento cero son completamente anónimas, es importante evitar que las generadas por identidades elegibles sean reutilizadas por una parte malintencionada.

En una aplicación de voto anónimo, por ejemplo, sin chequeos, se podría reutilizar una prueba válida para volver a votar.

## ¿Cuál es la diferencia entre `nullifier` y `scope`?

El [scope](/V4-alpha/glossary#scope) se utiliza como un tema sobre el cual los usuarios pueden generar una prueba válida solo una vez. El scope es un valor público y todos pueden ver cuál es el alcance (scope) de una prueba.

El [nullifier](/V4-alpha/glossary#nullifier) es el hash de la clave privada de la identidad y el scope, y se utiliza para comprobar si la misma prueba con ese scope específico ya ha sido generada por el mismo usuario. El nullifier también es un valor público y es lo que realmente se almacena para evitar, por ejemplo, la doble votación.

En el caso de una aplicación de votación, si tiene un grupo y desea que todos los miembros de este grupo voten solo una vez, puede usar la identificación del grupo como scope. Cuando un usuario vota por primera vez, puede almacenar el hash de la clave privada del votante y la identificación del grupo (es decir, el anulador) y evitar la doble votación verificando si ese hash ya existe.

Consulte los [circuitos de Semaphore](/V4-alpha/technical-reference/circuits) para obtener más información técnica, o el [Semaphore boilerplate](https://github.com/semaphore-protocol/boilerplate/tree/version/4) para un caso de uso real.

## ¿Dónde puedo encontrar ejemplos de aplicaciones que utilicen Semaphore?

Puede encontrar una lista completa de aplicaciones que usan Semaphore en el [website de Semaphore](https://semaphore.pse.dev/projects).

## ¿Cómo puedo iniciar un proyecto usando Semaphore?

Hay tres formas de comenzar a usar Semaphore en su proyecto: usando la [Semaphore CLI](https://github.com/semaphore-protocol/semaphore/tree/feat/semaphore-v4/packages/cli), usando el [Semaphore boilerplate](https://github.com/semaphore-protocol/boilerplate/tree/version/4) como una plantilla o bifurcándolo, o instalando los [paquetes]((/V4-alpha/guides/identities)) de Semaphore manualmente.
