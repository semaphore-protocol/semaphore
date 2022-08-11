pragma circom 2.0.0;

include "./semaphore.circom";

component main {public [signalHash, externalNullifier, roots, chainID]} = Semaphore(20, 7);
