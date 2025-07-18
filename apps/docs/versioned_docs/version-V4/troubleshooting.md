---
sidebar_position: 12
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Troubleshooting

If these suggestions do not work, feel free to ask for more help and support on [Github Discussions](https://github.com/semaphore-protocol/semaphore/discussions) or [Telegram](https://semaphore.pse.dev/telegram).

## Transaction reverted when using the same nullifier

When you generate a proof using the same [scope](/glossary#scope) you used to validate a proof before, the transaction will be reverted because that scope (and thus the [nullifier](/glossary#nullifier)) has already been used. If you want to send and validate several proofs from the same identity, you need to use a different scope for each time you generate a proof.
