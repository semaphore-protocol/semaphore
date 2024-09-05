import { poseidon } from "circomlibjs"

const zeroes = [0]

for (let x = 1; x < 33; x += 1) {
    zeroes[x] = poseidon([zeroes[x - 1], zeroes[x - 1]])
}

console.log(`
    ${Array(33)
        .fill(0)
        .map((_, i) => `uint256 constant public Z_${i} = ${zeroes[i]};`)
        .join("\n    ")}

/*
    function defaultZeroes() public pure returns (uint256[32] memory) {
        return [${Array(32)
            .fill()
            .map((_, i) => `Z_${i}`)
            .join(",")}];
    }
*/

    function defaultZero(uint256 index) public pure returns (uint256) {
    ${Array(33)
        .fill()
        .map((_, i) => `        if (index == ${i}) return Z_${i};`)
        .join("\n")}
        revert('badindex');
    }
`)
