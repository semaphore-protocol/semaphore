const buf = Buffer.from(process.argv[2], 'hex')
let s = ''
for (let i = 0; i < buf.length; i++) {
  let t = 1
  for (let j = 0; j < 8; j++) {
    s += ((buf[i] & t) == t) ? '1' : '0'
    t *= 2
  }
}
console.log(s)
