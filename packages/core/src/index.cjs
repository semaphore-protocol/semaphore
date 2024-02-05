const identity = require("./identity/index.cjs")
const group = require("./group/index.cjs")
const proof = require("./proof/index.cjs")

Object.assign(exports, identity, group, proof)
