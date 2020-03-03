const bin = process.argv[2]

const buf1 = Buffer.alloc(bin.length/8)
for (let i = 0; i < buf1.length; i++) {
  let t = 1
  for (let j = 0; j < 8; j++) {
    buf1[i] |= bin[8*i + j] == '1' ? t : 0
    t *= 2
  }
}
console.log(buf1.toString('hex'))
