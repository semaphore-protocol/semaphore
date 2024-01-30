---
sidebar_position: 9
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Troubleshooting

If these suggestions do not work, feel free to ask for more help and support on [Github Discussions](https://github.com/semaphore-protocol/semaphore/discussions) or [Discord](https://semaphore.pse.dev/discord) ("dev-chat" channel).

## Creating a Group

When you create a group and the transaction is reverted, make sure that the group id you are using does not exist on the network you are using.

To check that, you can use the [Semaphore CLI](https://github.com/semaphore-protocol/semaphore/tree/main/packages/cli) with the command `get-groups` and the network you are using and then, make sure that your group id is not part of that list. You can also use the [Semaphore explorer](https://explorer.semaphore.pse.dev/).

## Transaction reverted when using the same nullifier

When you generate a proof using the same [scope](/V4-alpha/glossary#scope) you used to validate a proof before, the transaction will be reverted because that scope (and thus the [nullifier](/V4-alpha/glossary#nullifier)) has already been used. If you want to send and validate several proofs from the same identity, you need to use a different scope for each time you generate a proof.
