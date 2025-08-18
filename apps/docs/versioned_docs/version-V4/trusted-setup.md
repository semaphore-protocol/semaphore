---
sidebar_position: 6
---

# Trusted Setup

We are excited to announce the upcoming Multi-Party Computation (MPC) Phase 2 Trusted Setup ceremony for the Semaphore V4 circuit, following a [bug fix in the BinaryMerkleRoot circuit](https://pse.dev/blog/under-constrained-bug-in-binary-merkle-root-circuit-fixed-in-v200) in ZK-Kit. This is crucial for establishing a robust security foundation for the cryptographic protocol.

The ceremony will take place from **July 23** to **August 20**. If all goes to plan, finalization should take place on **August 22** with the announcement of the final beacon on **August 21**.

## Securing Semaphore V4

To contribute to this ceremony, you will just need your browser!

1. Visit [ceremony.pse.dev](https://ceremony.pse.dev/projects/Semaphore%20Binary%20Merkle%20Root%20Fix).
2. Login and associate your **Github** account.
3. Hit the `contribute` button and wait for your turn.

Please note: You will find your contribution certificate on your GitHub gists - and, if all goes wrong or you feel lost, there are instructions on site or post a message on [Semaphore Telegram](https://semaphore.pse.dev/telegram) chat or [PSE discord](https://discord.com/invite/sF5CT5rzrR).

## What You Need to Know About the Ceremony

### Your Role

Many zero-knowledge proof systems, including those based on the Groth16 scheme, require this layer of randomness, often referred to as "toxic waste” which must remain unknown to anyone to maintain the integrity of the zero-knowledge proof system. Trusted setups rely on a 1 of N honest participant assumption. As long as just one participant actually discards their “toxic waste”, the proof system will be secure. You can be that one participant by providing your unique entropy with your contribution, making the ceremony unpredictable and unbiased, safeguarding the entire process against potential vulnerabilities.

### Why It Matters

Trusted setups are crucial as they generate a set of parameters necessary to initiate SNARK-based systems. Through a series of computations performed by various participants. This sequence involves downloading previous contributions, adding generated randomness, and uploading the results of your contribution. These contributions are then integrated into the final artifacts crucial for proof generation/verification.

### Semaphore Circuit

The [Semaphore circuit](https://github.com/semaphore-protocol/semaphore/blob/main/packages/circuits/src/semaphore.circom) centered around the creation of the _Semaphore identity_ and _identity commitment_, includes verification processes, and facilitates the generation of the _nullifier_. We are going to support `MAX_DEPTH` from 1 to 32 - therefore you will have to contribute to 32 variants of the same circuit. Since the constraints will range from 2k to less than 10k with very small artifacts size (< 6mb x contribution), the waiting and contribution time shouldn't be much!

### Transparency and Fairness

We are committed to transparency on ceremony setup, execution, finalization, and later verification. Our primary goal is to **engage as many contributors as possible** to ensure the circuit is **secure** and **production-ready**. To this end, the ceremony is designed to _maximize contributor inclusion_, monitor & troubleshoot whenever is needed, _lower the entry barriers_, _making contributing as effortless as possible_. A key step towards achieving these goals is running the ceremony w/ [p0tion](https://github.com/privacy-scaling-explorations/p0tion): an in-house developed, open-source, battle-tested tool that is fully equipped to meet our needs.

### Ceremony Settings

To protect the ceremony from sybils, in order to contribute you must have a GitHub account such that you have: 1 public repository, at least 1 follower, following at least 5 other accounts and, your account is at least 1 month old. While to protect from fake contributors or people hanging due to connection/machine resources, we are going to set a 10 minutes time-window on contributions (+ 1 hour verification) - after this amount of time, you will be kicked out and will have to wait **10 minutes** before you can contribute again.

## Troubleshooting

-   If you have been idle longer than expected, it may be that the current contributor has been blocked for some reason. Do not worry, the maximum wait in this case is one hour, after which you will be able to continue contributing.

### Learn more about Trusted Setups

-   [How Do Trusted Setups Work? - Vitalik](https://vitalik.eth.limo/general/2022/03/14/trustedsetup.html)
-   [p0tion FAQs](https://p0tion.super.site/faqs#block-cebca23ebb514c2ea096ad44d4833356)
