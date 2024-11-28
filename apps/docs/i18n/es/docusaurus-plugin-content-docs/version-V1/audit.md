---
sidebar_position: 8
---

# Security audit

The [Ethereum Foundation](https://ethereum.org/) and [POA
Network](https://www.poa.network/) commissioned [ABDK
Consulting](https://www.abdk.consulting) to audit the source code of Semaphore
as well as relevant circuits in
[circomlib](https://github.com/iden3/circomlib), which contains components
which the Semaphore zk-SNARK uses.

The summary of the audit results can be found
[here](https://github.com/semaphore-protocol/semaphore/blob/main/apps/docs/versioned_docs/version-V1/audit.md). After three
rounds of fixes, all security and performance issues were fixed, and the few
remaining issues are minor and do not affect security.
