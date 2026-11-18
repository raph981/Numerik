/**
 * Bitweise Zerlegung von IEEE-754-Zahlen (Abschnitt 2.3).
 */

export const FORMATS = {
  single: { label: 'single (float)', bits: 32, exponentBits: 8, mantissaBits: 23, bias: 127 },
  double: { label: 'double', bits: 64, exponentBits: 11, mantissaBits: 52, bias: 1023 },
};

/** Bitfolge (String aus '0'/'1') einer Zahl im gewählten Format. */
export function toBits(value, formatName) {
  const { bits } = FORMATS[formatName];
  const view = new DataView(new ArrayBuffer(8));
  let out = '';
  if (bits === 32) {
    view.setFloat32(0, value);
    out = view.getUint32(0).toString(2).padStart(32, '0');
  } else {
    view.setFloat64(0, value);
    out = view.getUint32(0).toString(2).padStart(32, '0') + view.getUint32(4).toString(2).padStart(32, '0');
  }
  return out;
}

/** Zahl aus einer Bitfolge. */
export function fromBits(bitString, formatName) {
  const view = new DataView(new ArrayBuffer(8));
  if (FORMATS[formatName].bits === 32) {
    view.setUint32(0, parseInt(bitString, 2) >>> 0);
    return view.getFloat32(0);
  }
  view.setUint32(0, parseInt(bitString.slice(0, 32), 2) >>> 0);
  view.setUint32(4, parseInt(bitString.slice(32), 2) >>> 0);
  return view.getFloat64(0);
}

/**
 * Zerlegt eine Bitfolge in Vorzeichen, Exponent c, Mantisse und klassifiziert
 * sie gemäß der Tabelle im Skript (Null, denormalisiert, normal, ∞, NaN).
 */
export function decompose(bitString, formatName) {
  const { exponentBits, mantissaBits, bias } = FORMATS[formatName];
  const signBit = bitString[0];
  const exponent = bitString.slice(1, 1 + exponentBits);
  const mantissa = bitString.slice(1 + exponentBits);
  const c = parseInt(exponent, 2);
  const cMax = 2 ** exponentBits - 1;
  const mantissaIsZero = !mantissa.includes('1');

  let kind;
  if (c === 0) kind = mantissaIsZero ? 'zero' : 'denormal';
  else if (c === cMax) kind = mantissaIsZero ? 'infinity' : 'nan';
  else kind = 'normal';

  // Mantissenwert inkl. hidden bit (normal: 1.f, denormal: 0.f)
  let fraction = 0;
  for (let i = 0; i < mantissaBits; i++) if (mantissa[i] === '1') fraction += 2 ** -(i + 1);
  const hiddenBit = kind === 'normal' ? 1 : 0;
  const e = kind === 'normal' ? c - bias : 1 - bias;

  return {
    sign: signBit === '1' ? -1 : 1,
    signBit,
    exponent,
    mantissa,
    c,
    e,
    hiddenBit,
    significand: hiddenBit + fraction,
    kind,
    value: fromBits(bitString, formatName),
  };
}

/** Maschinengenauigkeit eps = 2^{−r} mit r = Mantissenbits + 1 (hidden bit). */
export function machineEpsilon(formatName) {
  return 2 ** -(FORMATS[formatName].mantissaBits + 1);
}
