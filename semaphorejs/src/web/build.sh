#!/bin/bash -e
#
# semaphorejs - Zero-knowledge signaling on Ethereum
# Copyright (C) 2019 Kobi Gurkan <kobigurk@gmail.com>
#
# This file is part of semaphorejs.
#
# semaphorejs is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# semaphorejs is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with semaphorejs.  If not, see <http://www.gnu.org/licenses/>.
#

cp ../../build/circuit.json .
cp ../../build/contracts/Semaphore.json .
cp ../../build/proving_key.json .
cp ../../build/proving_key.bin .
cp ../../build/verification_key.json .
cp ../../build/contracts/Semaphore.json .
cp ../client/semaphore.js .
cp ../../node_modules/websnark/build/* .

webpack

cp circuit.json dist
cp proving_key.bin dist
cp verification_key.json dist
