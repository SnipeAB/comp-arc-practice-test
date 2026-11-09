// Every answer is computed from the question's numbers, never typed in.
const group = (s) => s.replace(/\B(?=(.{4})+$)/g, ' ');
const bin = (n, w = 8) => group(n.toString(2).padStart(w, '0'));
const bin7 = (n) => bin(n, 7);
const hex = (n) => n.toString(16).toUpperCase();
const rand = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
const char = (code) => String.fromCharCode(code);

function powers(n) {
  const out = [];
  for (let p = 2 ** Math.floor(Math.log2(n)); p >= 1; p /= 2) if (n & p) out.push(p);
  return out.join(' + ');
}

function stack(x, op, y, r) {
  const w = Math.max(x.length, y.length, r.length);
  return `  ${x.padStart(w)}\n${op} ${y.padStart(w)}\n= ${r.padStart(w)}`;
}

function hexWork(a, b, sub) {
  const steps = [];
  let c = 0;
  for (let i = 0; i < Math.max(hex(a).length, hex(b).length); i++) {
    const x = (a >> (4 * i)) & 15;
    const y = (b >> (4 * i)) & 15;
    const carried = c ? (sub ? ' − 1' : ' + 1') : '';
    if (sub) {
      const r = x - y - c;
      c = r < 0 ? 1 : 0;
      steps.push(`${hex(x)} − ${hex(y)}${carried} = ${r} → ${c ? 'borrow 16, ' : ''}write ${hex(r + 16 * c)}`);
    } else {
      const r = x + y + c;
      c = r > 15 ? 1 : 0;
      steps.push(`${hex(x)} + ${hex(y)}${carried} = ${r} → write ${hex(r & 15)}${c ? ', carry 1' : ''}`);
    }
  }
  if (c) steps.push('The last carry 1 becomes the leading digit');
  return `Work right to left, using decimal inside each column:\n${steps.join('\n')}\nAnswer: ${hex(sub ? a - b : a + b)}`;
}

function divide16(n) {
  const out = [];
  for (let x = n; x; x = Math.floor(x / 16)) {
    out.push(`${x} ÷ 16 = ${Math.floor(x / 16)} remainder ${x % 16} (${hex(x % 16)})`);
  }
  return `${out.join('\n')}\nRead the remainders bottom to top: ${hex(n)}`;
}

function hexPlaces(n) {
  const digits = [...hex(n)].map((d, i, all) => [d, 16 ** (all.length - 1 - i)]);
  return `${digits.map(([d, p]) => `${d} × ${p}`).join(' + ')}\n= ${digits.map(([d, p]) => parseInt(d, 16) * p).join(' + ')}\n= ${n}`;
}

function twos(n) {
  const r = 4096 - n;
  return [
    `${n} in 12 bits:  ${bin(n, 12)}`,
    `Flip every bit: ${bin(~n & 0xfff, 12)}`,
    `Add 1:          ${bin(r, 12)}`,
    `Check: the top bit is worth −2048, so −2048 + ${r - 2048} = −${n}`,
  ].join('\n');
}

const logic = (name, f, rule) => (a, b) => ({
  q: `The result of applying the logical ${name} operator to the binary numbers ${bin(a)} ${name} ${bin(b)} is:`,
  n: f(a, b),
  bits: 8,
  fmt: bin,
  why: `${stack(bin(a), ' ', bin(b), bin(f(a, b)))}\n${rule}`,
});

const kinds = {
  binAdd: (a, b) => ({
    q: `Determine the result of the binary addition: ${bin(a)} + ${bin(b)}`,
    n: a + b,
    bits: 9,
    fmt: bin,
    why: `${stack(bin(a), '+', bin(b), bin(a + b))}\nColumn rules: 1 + 1 = 10 (write 0, carry 1), 1 + 1 + 1 = 11 (write 1, carry 1).\nCheck in decimal: ${a} + ${b} = ${a + b}`,
  }),
  binSub: (a, b) => ({
    q: `The binary subtraction ${bin(a)} – ${bin(b)}`,
    n: a - b,
    bits: 8,
    fmt: bin,
    why: `${stack(bin(a), '−', bin(b), bin(a - b))}\nColumn rule: 0 − 1 borrows from the next column, making 10 − 1 = 1.\nCheck in decimal: ${a} − ${b} = ${a - b}`,
  }),
  hexAdd: (a, b) => ({
    q: `The hexadecimal addition ${hex(a)} + ${hex(b)} produces the result:`,
    n: a + b,
    bits: 20,
    fmt: hex,
    why: hexWork(a, b, false),
  }),
  hexSub: (a, b) => ({
    q: `The hexadecimal subtraction ${hex(a)} – ${hex(b)} produces the result:`,
    n: a - b,
    bits: 20,
    fmt: hex,
    why: hexWork(a, b, true),
  }),
  decToHex: (n) => ({
    q: `${n} in base 10 in hexadecimal is:`,
    n,
    bits: 16,
    fmt: hex,
    why: divide16(n),
  }),
  hexToDec: (n) => ({
    q: `${hex(n)} in base 16 converted to decimal is:`,
    n,
    bits: 8,
    fmt: String,
    why: hexPlaces(n),
  }),
  decToBin: (n) => ({
    q: `The denary number ${n} in base 10 converted to binary will be:`,
    n,
    bits: 12,
    fmt: (x) => bin(x, 12),
    why: `${n} = ${powers(n)}\nPut a 1 under each of those place values: ${bin(n, 12)}`,
  }),
  binToDec: (n) => ({
    q: `${bin(n, 12)} is represented by the denary value:`,
    n,
    bits: 8,
    fmt: String,
    why: `The 1s sit at place values ${powers(n)}\n= ${n}`,
  }),
  binToNeg: (n) => ({
    q: `Convert the following 8 bit binary number ${bin(n)} to its negative two's complement equivalent. Check your answer by converting it to decimal.`,
    n: 4096 - n,
    bits: 12,
    fmt: (x) => bin(x, 12),
    why: twos(n),
  }),
  decToNeg: (n) => ({
    q: `Convert the following 3 digit base ten number ${n} to its negative two's complement equivalent. Check your answer by converting it to decimal.`,
    n: 4096 - n,
    bits: 12,
    fmt: (x) => bin(x, 12),
    why: twos(n),
  }),
  and: logic('AND', (a, b) => a & b, 'AND: 1 only where both bits are 1.'),
  or: logic('OR', (a, b) => a | b, 'OR: 1 where either bit is 1.'),
  xor: logic('XOR', (a, b) => a ^ b, 'XOR: 1 where the bits are different.'),
  not: (n) => ({
    q: `The application of the logical NOT operator to the binary number ${bin(n)} produces the result:`,
    n: ~n & 255,
    bits: 8,
    fmt: bin,
    why: `${bin(n)}\n${bin(~n & 255)}\nNOT flips every bit.`,
  }),
  binToAscii: (code) => ({
    q: `The 7 – bit binary number ${bin7(code)} represents the ASCII character`,
    n: code,
    fmt: char,
    wrong: [char(code + 32), char(code + 1), char(code + 33)],
    why: `${bin7(code)} = ${powers(code)} = ${code}\nCapitals run from A = 65 to Z = 90, so ${code} is ${char(code)}. Lower case is 32 higher (a = 97).`,
  }),
  asciiToBin: (code) => ({
    q: `The 7 – bit binary value of the ASCII character "${char(code)}" is:`,
    n: code,
    bits: 7,
    fmt: bin7,
    why: `A = 65, so ${char(code)} = 65 + ${code - 65} = ${code}\n${code} = ${powers(code)}\n= ${bin7(code)}`,
  }),
  binToHex: (n) => ({
    q: `${bin(n)} converted to hexadecimal is:`,
    n,
    bits: 8,
    fmt: (x) => hex(x).padStart(2, '0'),
    why: `Split into groups of 4 bits and convert each group:\n${bin(n >> 4, 4)} = ${hex(n >> 4)}, ${bin(n & 15, 4)} = ${hex(n & 15)}\nAnswer: ${hex(n)}`,
  }),
  parity: (code) => {
    const ones = code.toString(2).replace(/0/g, '').length;
    const p = ones % 2;
    return {
      q: `The 7 bit ASCII character '${char(code)}' ${code.toString(2)}, when converted to an 8 bit value applying EVEN parity (parity bit on the left) is:`,
      n: (p << 7) | code,
      bits: 8,
      fmt: bin,
      why: `${code.toString(2)} has ${ones} ones, so the parity bit is ${p} to make the total even.\nPut it on the left: ${bin((p << 7) | code)}`,
    };
  },
  asciiVal: (code) => ({
    q: `Which of the following binary patterns represent the ASCII value ${code}:`,
    n: code,
    bits: 7,
    fmt: bin7,
    why: `${code} = ${powers(code)}\n= ${bin7(code)}`,
  }),
};

const digits = (s) => s.replace(/\s/g, '');

function paper(k, options, over = {}) {
  const a = over.a ?? k.fmt(k.n);
  return {
    q: over.q ?? k.q,
    why: over.why ?? k.why,
    options,
    answer: options.findIndex((o) => digits(o) === digits(a)),
  };
}

function fresh(k) {
  const a = k.fmt(k.n);
  const set = new Set([a, ...(k.wrong ?? [])]);
  while (set.size < 4) set.add(k.fmt(k.n ^ (1 << rand(0, k.bits - 1))));
  const options = [...set]
    .map((o) => [Math.random(), o])
    .sort((x, y) => x[0] - y[0])
    .map((p) => p[1]);
  return { q: k.q, why: k.why, options, answer: options.indexOf(a) };
}

// The 20 questions and options exactly as they appear in the class test.
export const originalTest = () => [
  paper(kinds.binAdd(0b10110101, 0b11011001), ['11000 1110', '1000 1000', '1101 0000', '1110 0110']),
  paper(kinds.binSub(0b10110101, 0b00010110), ['0100 1111', '1001 1111', '0100 0111', '0110 1111']),
  paper(kinds.hexAdd(0xa5b96, 0xbc516), ['1621AC', '1621BC', '1620BC', '1620AC']),
  paper(kinds.hexSub(0xaa516, 0x2cd16), ['7D801', '7D810', '7D820', '7D800']),
  paper(kinds.decToHex(9311), ['24EF', '244E', '244F', '245F']),
  paper(kinds.hexToDec(0xafdc), ['45120', '45020', '45121', '45122']),
  paper(kinds.decToBin(2547), ['1001 1100 1100', '1001 1111 0011', '0110 1000 0110', '0100 1110 1110']),
  paper(kinds.binToDec(0b111111011011), ['4060', '4059', '4057', '4061']),
  paper(kinds.binToNeg(0b10111100), ['1111 0100 0100', '1111 0100 0000', '1111 0100 0111', '1111 0100 0101']),
  paper(kinds.decToNeg(276), ['1110 1110 1101', '1110 1110 1100', '1111 1110 1101', '1110 1110 1111']),
  paper(kinds.and(0b10101110, 0b10001111), ['10001110', '10011110', '10101110', '10001111']),
  paper(kinds.or(0b10011110, 0b01001111), ['11011111', '11011110', '11111111', '11000111']),
  paper(kinds.xor(0b11011101, 0b11111100), ['00100001', '10100001', '00100111', '00100011']),
  paper(kinds.not(0b11111110), ['10000001', '00000011', '00000101', '00000001']),
  // The 4th option is cut off in the screenshot, so 'b' is a stand-in.
  paper(kinds.binToAscii(65), ['B', 'a', 'A', 'b']),
  paper(kinds.asciiToBin(84), ['101 0100', '101 0110', '101 0101', '101 1100']),
  paper(kinds.decToBin(3419), ['1101 0101 1111', '1101 0101 1010', '1101 0101 1011', '1101 0100 1011'], {
    q: '3419 converted to binary is:',
  }),
  paper(kinds.binToHex(0b11011111), ['6A', '6D', '6E', 'DF']),
  paper(kinds.parity(66), ['1000 0010', '1000 0011', '1000 0110', '1000 1010'], {
    q: "The 7 bit ASCII character 'B' 1000010, when converted to an 8 bit value applying EVEN parity is:",
    a: '1000 0010',
    why: [
      '1000010 has 2 ones, which is already even, so the parity bit is 0.',
      'A 0 on the left gives 0100 0010. A 0 on the right gives 1000 0100. Neither is listed.',
      '1000 0010 is the only option with an even number of 1s, so it is the best answer.',
      'Ask your teacher which position they expect the parity bit in.',
    ].join('\n'),
  }),
  paper(kinds.asciiVal(66), ['100 0010', '100 0011', '100 0110', '100 1010']),
];

export function freshTest() {
  const byte = () => rand(128, 255);
  const twelve = () => rand(2048, 4095);
  const letter = () => rand(65, 89); // A to Y, so the next letter up is still a letter
  return [
    kinds.binAdd(byte(), byte()),
    kinds.binSub(byte(), rand(1, 127)),
    kinds.hexAdd(rand(0x10000, 0xfffff), rand(0x10000, 0xfffff)),
    kinds.hexSub(rand(0x80000, 0xfffff), rand(0x10000, 0x7ffff)),
    kinds.decToHex(rand(4096, 65535)),
    kinds.hexToDec(rand(0x1000, 0xffff)),
    kinds.decToBin(twelve()),
    kinds.binToDec(twelve()),
    kinds.binToNeg(byte()),
    kinds.decToNeg(rand(100, 999)),
    kinds.and(byte(), byte()),
    kinds.or(byte(), byte()),
    kinds.xor(byte(), byte()),
    kinds.not(byte()),
    kinds.binToAscii(letter()),
    kinds.asciiToBin(letter()),
    kinds.decToBin(twelve()),
    kinds.binToHex(byte()),
    kinds.parity(letter()),
    kinds.asciiVal(letter()),
  ].map(fresh);
}
