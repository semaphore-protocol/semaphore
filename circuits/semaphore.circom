pragma circom 2.0.0;
include "./semaphore-base.circom";

component main {public [signal_hash, external_nullifier]} = Semaphore(20);