const H = function(g, w) {
  let i = g;
  const c = j[w];
  let e = null, t = 0, l = null;
  const x = [], y = {}, d = function(r, u) {
    t = i * 4 + 17, e = (function(n) {
      const f = new Array(n);
      for (let s = 0; s < n; s += 1) {
        f[s] = new Array(n);
        for (let p = 0; p < n; p += 1)
          f[s][p] = null;
      }
      return f;
    })(t), h(0, 0), h(t - 7, 0), h(0, t - 7), D(), P(), I(r, u), i >= 7 && E(r), l == null && (l = V(i, c, x)), m(l, u);
  }, h = function(r, u) {
    for (let n = -1; n <= 7; n += 1)
      if (!(r + n <= -1 || t <= r + n))
        for (let f = -1; f <= 7; f += 1)
          u + f <= -1 || t <= u + f || (0 <= n && n <= 6 && (f == 0 || f == 6) || 0 <= f && f <= 6 && (n == 0 || n == 6) || 2 <= n && n <= 4 && 2 <= f && f <= 4 ? e[r + n][u + f] = !0 : e[r + n][u + f] = !1);
  }, _ = function() {
    let r = 0, u = 0;
    for (let n = 0; n < 8; n += 1) {
      d(!0, n);
      const f = $.getLostPoint(y);
      (n == 0 || r > f) && (r = f, u = n);
    }
    return u;
  }, P = function() {
    for (let r = 8; r < t - 8; r += 1)
      e[r][6] == null && (e[r][6] = r % 2 == 0);
    for (let r = 8; r < t - 8; r += 1)
      e[6][r] == null && (e[6][r] = r % 2 == 0);
  }, D = function() {
    const r = $.getPatternPosition(i);
    for (let u = 0; u < r.length; u += 1)
      for (let n = 0; n < r.length; n += 1) {
        const f = r[u], s = r[n];
        if (e[f][s] == null)
          for (let p = -2; p <= 2; p += 1)
            for (let A = -2; A <= 2; A += 1)
              p == -2 || p == 2 || A == -2 || A == 2 || p == 0 && A == 0 ? e[f + p][s + A] = !0 : e[f + p][s + A] = !1;
      }
  }, E = function(r) {
    const u = $.getBCHTypeNumber(i);
    for (let n = 0; n < 18; n += 1) {
      const f = !r && (u >> n & 1) == 1;
      e[Math.floor(n / 3)][n % 3 + t - 8 - 3] = f;
    }
    for (let n = 0; n < 18; n += 1) {
      const f = !r && (u >> n & 1) == 1;
      e[n % 3 + t - 8 - 3][Math.floor(n / 3)] = f;
    }
  }, I = function(r, u) {
    const n = c << 3 | u, f = $.getBCHTypeInfo(n);
    for (let s = 0; s < 15; s += 1) {
      const p = !r && (f >> s & 1) == 1;
      s < 6 ? e[s][8] = p : s < 8 ? e[s + 1][8] = p : e[t - 15 + s][8] = p;
    }
    for (let s = 0; s < 15; s += 1) {
      const p = !r && (f >> s & 1) == 1;
      s < 8 ? e[8][t - s - 1] = p : s < 9 ? e[8][15 - s - 1 + 1] = p : e[8][15 - s - 1] = p;
    }
    e[t - 8][8] = !r;
  }, m = function(r, u) {
    let n = -1, f = t - 1, s = 7, p = 0;
    const A = $.getMaskFunction(u);
    for (let B = t - 1; B > 0; B -= 2)
      for (B == 6 && (B -= 1); ; ) {
        for (let M = 0; M < 2; M += 1)
          if (e[f][B - M] == null) {
            let T = !1;
            p < r.length && (T = (r[p] >>> s & 1) == 1), A(f, B - M) && (T = !T), e[f][B - M] = T, s -= 1, s == -1 && (p += 1, s = 7);
          }
        if (f += n, f < 0 || t <= f) {
          f -= n, n = -n;
          break;
        }
      }
  }, W = function(r, u) {
    let n = 0, f = 0, s = 0;
    const p = new Array(u.length), A = new Array(u.length);
    for (let b = 0; b < u.length; b += 1) {
      const C = u[b].dataCount, L = u[b].totalCount - C;
      f = Math.max(f, C), s = Math.max(s, L), p[b] = new Array(C);
      for (let R = 0; R < p[b].length; R += 1)
        p[b][R] = 255 & r.getBuffer()[R + n];
      n += C;
      const K = $.getErrorCorrectPolynomial(L), G = Q(p[b], K.getLength() - 1).mod(K);
      A[b] = new Array(K.getLength() - 1);
      for (let R = 0; R < A[b].length; R += 1) {
        const Y = R + G.getLength() - A[b].length;
        A[b][R] = Y >= 0 ? G.getAt(Y) : 0;
      }
    }
    let B = 0;
    for (let b = 0; b < u.length; b += 1)
      B += u[b].totalCount;
    const M = new Array(B);
    let T = 0;
    for (let b = 0; b < f; b += 1)
      for (let C = 0; C < u.length; C += 1)
        b < p[C].length && (M[T] = p[C][b], T += 1);
    for (let b = 0; b < s; b += 1)
      for (let C = 0; C < u.length; C += 1)
        b < A[C].length && (M[T] = A[C][b], T += 1);
    return M;
  }, V = function(r, u, n) {
    const f = J.getRSBlocks(r, u), s = Z();
    for (let A = 0; A < n.length; A += 1) {
      const B = n[A];
      s.put(B.getMode(), 4), s.put(B.getLength(), $.getLengthInBits(B.getMode(), r)), B.write(s);
    }
    let p = 0;
    for (let A = 0; A < f.length; A += 1)
      p += f[A].dataCount;
    if (s.getLengthInBits() > p * 8)
      throw "code length overflow. (" + s.getLengthInBits() + ">" + p * 8 + ")";
    for (s.getLengthInBits() + 4 <= p * 8 && s.put(0, 4); s.getLengthInBits() % 8 != 0; )
      s.putBit(!1);
    for (; !(s.getLengthInBits() >= p * 8 || (s.put(236, 8), s.getLengthInBits() >= p * 8)); )
      s.put(17, 8);
    return W(s, f);
  };
  y.addData = function(r, u) {
    u = u || "Byte";
    let n = null;
    switch (u) {
      case "Numeric":
        n = z(r);
        break;
      case "Alphanumeric":
        n = tt(r);
        break;
      case "Byte":
        n = et(r);
        break;
      case "Kanji":
        n = nt(r);
        break;
      default:
        throw "mode:" + u;
    }
    x.push(n), l = null;
  }, y.isDark = function(r, u) {
    if (r < 0 || t <= r || u < 0 || t <= u)
      throw r + "," + u;
    return e[r][u];
  }, y.getModuleCount = function() {
    return t;
  }, y.make = function() {
    if (i < 1) {
      let r = 1;
      for (; r < 40; r++) {
        const u = J.getRSBlocks(r, c), n = Z();
        for (let s = 0; s < x.length; s++) {
          const p = x[s];
          n.put(p.getMode(), 4), n.put(p.getLength(), $.getLengthInBits(p.getMode(), r)), p.write(n);
        }
        let f = 0;
        for (let s = 0; s < u.length; s++)
          f += u[s].dataCount;
        if (n.getLengthInBits() <= f * 8)
          break;
      }
      i = r;
    }
    d(!1, _());
  }, y.createTableTag = function(r, u) {
    r = r || 2, u = typeof u > "u" ? r * 4 : u;
    let n = "";
    n += '<table style="', n += " border-width: 0px; border-style: none;", n += " border-collapse: collapse;", n += " padding: 0px; margin: " + u + "px;", n += '">', n += "<tbody>";
    for (let f = 0; f < y.getModuleCount(); f += 1) {
      n += "<tr>";
      for (let s = 0; s < y.getModuleCount(); s += 1)
        n += '<td style="', n += " border-width: 0px; border-style: none;", n += " border-collapse: collapse;", n += " padding: 0px; margin: 0px;", n += " width: " + r + "px;", n += " height: " + r + "px;", n += " background-color: ", n += y.isDark(f, s) ? "#000000" : "#ffffff", n += ";", n += '"/>';
      n += "</tr>";
    }
    return n += "</tbody>", n += "</table>", n;
  }, y.createSvgTag = function(r, u, n, f) {
    let s = {};
    typeof arguments[0] == "object" && (s = arguments[0], r = s.cellSize, u = s.margin, n = s.alt, f = s.title), r = r || 2, u = typeof u > "u" ? r * 4 : u, n = typeof n == "string" ? { text: n } : n || {}, n.text = n.text || null, n.id = n.text ? n.id || "qrcode-description" : null, f = typeof f == "string" ? { text: f } : f || {}, f.text = f.text || null, f.id = f.text ? f.id || "qrcode-title" : null;
    const p = y.getModuleCount() * r + u * 2;
    let A, B, M, T, b = "", C;
    for (C = "l" + r + ",0 0," + r + " -" + r + ",0 0,-" + r + "z ", b += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"', b += s.scalable ? "" : ' width="' + p + 'px" height="' + p + 'px"', b += ' viewBox="0 0 ' + p + " " + p + '" ', b += ' preserveAspectRatio="xMinYMin meet"', b += f.text || n.text ? ' role="img" aria-labelledby="' + U([f.id, n.id].join(" ").trim()) + '"' : "", b += ">", b += f.text ? '<title id="' + U(f.id) + '">' + U(f.text) + "</title>" : "", b += n.text ? '<description id="' + U(n.id) + '">' + U(n.text) + "</description>" : "", b += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>', b += '<path d="', M = 0; M < y.getModuleCount(); M += 1)
      for (T = M * r + u, A = 0; A < y.getModuleCount(); A += 1)
        y.isDark(M, A) && (B = A * r + u, b += "M" + B + "," + T + C);
    return b += '" stroke="transparent" fill="black"/>', b += "</svg>", b;
  }, y.createDataURL = function(r, u) {
    r = r || 2, u = typeof u > "u" ? r * 4 : u;
    const n = y.getModuleCount() * r + u * 2, f = u, s = n - u;
    return st(n, n, function(p, A) {
      if (f <= p && p < s && f <= A && A < s) {
        const B = Math.floor((p - f) / r), M = Math.floor((A - f) / r);
        return y.isDark(M, B) ? 0 : 1;
      } else
        return 1;
    });
  }, y.createImgTag = function(r, u, n) {
    r = r || 2, u = typeof u > "u" ? r * 4 : u;
    const f = y.getModuleCount() * r + u * 2;
    let s = "";
    return s += "<img", s += ' src="', s += y.createDataURL(r, u), s += '"', s += ' width="', s += f, s += '"', s += ' height="', s += f, s += '"', n && (s += ' alt="', s += U(n), s += '"'), s += "/>", s;
  };
  const U = function(r) {
    let u = "";
    for (let n = 0; n < r.length; n += 1) {
      const f = r.charAt(n);
      switch (f) {
        case "<":
          u += "&lt;";
          break;
        case ">":
          u += "&gt;";
          break;
        case "&":
          u += "&amp;";
          break;
        case '"':
          u += "&quot;";
          break;
        default:
          u += f;
          break;
      }
    }
    return u;
  }, q = function(r) {
    r = typeof r > "u" ? 2 : r;
    const n = y.getModuleCount() * 1 + r * 2, f = r, s = n - r;
    let p, A, B, M, T;
    const b = {
      "██": "█",
      "█ ": "▀",
      " █": "▄",
      "  ": " "
    }, C = {
      "██": "▀",
      "█ ": "▀",
      " █": " ",
      "  ": " "
    };
    let L = "";
    for (p = 0; p < n; p += 2) {
      for (B = Math.floor((p - f) / 1), M = Math.floor((p + 1 - f) / 1), A = 0; A < n; A += 1)
        T = "█", f <= A && A < s && f <= p && p < s && y.isDark(B, Math.floor((A - f) / 1)) && (T = " "), f <= A && A < s && f <= p + 1 && p + 1 < s && y.isDark(M, Math.floor((A - f) / 1)) ? T += " " : T += "█", L += r < 1 && p + 1 >= s ? C[T] : b[T];
      L += `
`;
    }
    return n % 2 && r > 0 ? L.substring(0, L.length - n - 1) + Array(n + 1).join("▀") : L.substring(0, L.length - 1);
  };
  return y.createASCII = function(r, u) {
    if (r = r || 1, r < 2)
      return q(u);
    r -= 1, u = typeof u > "u" ? r * 2 : u;
    const n = y.getModuleCount() * r + u * 2, f = u, s = n - u;
    let p, A, B, M;
    const T = Array(r + 1).join("██"), b = Array(r + 1).join("  ");
    let C = "", L = "";
    for (p = 0; p < n; p += 1) {
      for (B = Math.floor((p - f) / r), L = "", A = 0; A < n; A += 1)
        M = 1, f <= A && A < s && f <= p && p < s && y.isDark(B, Math.floor((A - f) / r)) && (M = 0), L += M ? T : b;
      for (B = 0; B < r; B += 1)
        C += L + `
`;
    }
    return C.substring(0, C.length - 1);
  }, y.renderTo2dContext = function(r, u) {
    u = u || 2;
    const n = y.getModuleCount();
    for (let f = 0; f < n; f++)
      for (let s = 0; s < n; s++)
        r.fillStyle = y.isDark(f, s) ? "black" : "white", r.fillRect(s * u, f * u, u, u);
  }, y;
};
H.stringToBytes = function(g) {
  const w = [];
  for (let a = 0; a < g.length; a += 1) {
    const o = g.charCodeAt(a);
    w.push(o & 255);
  }
  return w;
};
H.createStringToBytes = function(g, w) {
  const a = (function() {
    const i = ot(g), c = function() {
      const l = i.read();
      if (l == -1) throw "eof";
      return l;
    };
    let e = 0;
    const t = {};
    for (; ; ) {
      const l = i.read();
      if (l == -1) break;
      const x = c(), y = c(), d = c(), h = String.fromCharCode(l << 8 | x), _ = y << 8 | d;
      t[h] = _, e += 1;
    }
    if (e != w)
      throw e + " != " + w;
    return t;
  })(), o = 63;
  return function(i) {
    const c = [];
    for (let e = 0; e < i.length; e += 1) {
      const t = i.charCodeAt(e);
      if (t < 128)
        c.push(t);
      else {
        const l = a[i.charAt(e)];
        typeof l == "number" ? (l & 255) == l ? c.push(l) : (c.push(l >>> 8), c.push(l & 255)) : c.push(o);
      }
    }
    return c;
  };
};
const k = {
  MODE_NUMBER: 1,
  MODE_ALPHA_NUM: 2,
  MODE_8BIT_BYTE: 4,
  MODE_KANJI: 8
}, j = {
  L: 1,
  M: 0,
  Q: 3,
  H: 2
}, O = {
  PATTERN000: 0,
  PATTERN001: 1,
  PATTERN010: 2,
  PATTERN011: 3,
  PATTERN100: 4,
  PATTERN101: 5,
  PATTERN110: 6,
  PATTERN111: 7
}, $ = (function() {
  const g = [
    [],
    [6, 18],
    [6, 22],
    [6, 26],
    [6, 30],
    [6, 34],
    [6, 22, 38],
    [6, 24, 42],
    [6, 26, 46],
    [6, 28, 50],
    [6, 30, 54],
    [6, 32, 58],
    [6, 34, 62],
    [6, 26, 46, 66],
    [6, 26, 48, 70],
    [6, 26, 50, 74],
    [6, 30, 54, 78],
    [6, 30, 56, 82],
    [6, 30, 58, 86],
    [6, 34, 62, 90],
    [6, 28, 50, 72, 94],
    [6, 26, 50, 74, 98],
    [6, 30, 54, 78, 102],
    [6, 28, 54, 80, 106],
    [6, 32, 58, 84, 110],
    [6, 30, 58, 86, 114],
    [6, 34, 62, 90, 118],
    [6, 26, 50, 74, 98, 122],
    [6, 30, 54, 78, 102, 126],
    [6, 26, 52, 78, 104, 130],
    [6, 30, 56, 82, 108, 134],
    [6, 34, 60, 86, 112, 138],
    [6, 30, 58, 86, 114, 142],
    [6, 34, 62, 90, 118, 146],
    [6, 30, 54, 78, 102, 126, 150],
    [6, 24, 50, 76, 102, 128, 154],
    [6, 28, 54, 80, 106, 132, 158],
    [6, 32, 58, 84, 110, 136, 162],
    [6, 26, 54, 82, 110, 138, 166],
    [6, 30, 58, 86, 114, 142, 170]
  ], w = 1335, a = 7973, o = 21522, i = {}, c = function(e) {
    let t = 0;
    for (; e != 0; )
      t += 1, e >>>= 1;
    return t;
  };
  return i.getBCHTypeInfo = function(e) {
    let t = e << 10;
    for (; c(t) - c(w) >= 0; )
      t ^= w << c(t) - c(w);
    return (e << 10 | t) ^ o;
  }, i.getBCHTypeNumber = function(e) {
    let t = e << 12;
    for (; c(t) - c(a) >= 0; )
      t ^= a << c(t) - c(a);
    return e << 12 | t;
  }, i.getPatternPosition = function(e) {
    return g[e - 1];
  }, i.getMaskFunction = function(e) {
    switch (e) {
      case O.PATTERN000:
        return function(t, l) {
          return (t + l) % 2 == 0;
        };
      case O.PATTERN001:
        return function(t, l) {
          return t % 2 == 0;
        };
      case O.PATTERN010:
        return function(t, l) {
          return l % 3 == 0;
        };
      case O.PATTERN011:
        return function(t, l) {
          return (t + l) % 3 == 0;
        };
      case O.PATTERN100:
        return function(t, l) {
          return (Math.floor(t / 2) + Math.floor(l / 3)) % 2 == 0;
        };
      case O.PATTERN101:
        return function(t, l) {
          return t * l % 2 + t * l % 3 == 0;
        };
      case O.PATTERN110:
        return function(t, l) {
          return (t * l % 2 + t * l % 3) % 2 == 0;
        };
      case O.PATTERN111:
        return function(t, l) {
          return (t * l % 3 + (t + l) % 2) % 2 == 0;
        };
      default:
        throw "bad maskPattern:" + e;
    }
  }, i.getErrorCorrectPolynomial = function(e) {
    let t = Q([1], 0);
    for (let l = 0; l < e; l += 1)
      t = t.multiply(Q([1, v.gexp(l)], 0));
    return t;
  }, i.getLengthInBits = function(e, t) {
    if (1 <= t && t < 10)
      switch (e) {
        case k.MODE_NUMBER:
          return 10;
        case k.MODE_ALPHA_NUM:
          return 9;
        case k.MODE_8BIT_BYTE:
          return 8;
        case k.MODE_KANJI:
          return 8;
        default:
          throw "mode:" + e;
      }
    else if (t < 27)
      switch (e) {
        case k.MODE_NUMBER:
          return 12;
        case k.MODE_ALPHA_NUM:
          return 11;
        case k.MODE_8BIT_BYTE:
          return 16;
        case k.MODE_KANJI:
          return 10;
        default:
          throw "mode:" + e;
      }
    else if (t < 41)
      switch (e) {
        case k.MODE_NUMBER:
          return 14;
        case k.MODE_ALPHA_NUM:
          return 13;
        case k.MODE_8BIT_BYTE:
          return 16;
        case k.MODE_KANJI:
          return 12;
        default:
          throw "mode:" + e;
      }
    else
      throw "type:" + t;
  }, i.getLostPoint = function(e) {
    const t = e.getModuleCount();
    let l = 0;
    for (let d = 0; d < t; d += 1)
      for (let h = 0; h < t; h += 1) {
        let _ = 0;
        const P = e.isDark(d, h);
        for (let D = -1; D <= 1; D += 1)
          if (!(d + D < 0 || t <= d + D))
            for (let E = -1; E <= 1; E += 1)
              h + E < 0 || t <= h + E || D == 0 && E == 0 || P == e.isDark(d + D, h + E) && (_ += 1);
        _ > 5 && (l += 3 + _ - 5);
      }
    for (let d = 0; d < t - 1; d += 1)
      for (let h = 0; h < t - 1; h += 1) {
        let _ = 0;
        e.isDark(d, h) && (_ += 1), e.isDark(d + 1, h) && (_ += 1), e.isDark(d, h + 1) && (_ += 1), e.isDark(d + 1, h + 1) && (_ += 1), (_ == 0 || _ == 4) && (l += 3);
      }
    for (let d = 0; d < t; d += 1)
      for (let h = 0; h < t - 6; h += 1)
        e.isDark(d, h) && !e.isDark(d, h + 1) && e.isDark(d, h + 2) && e.isDark(d, h + 3) && e.isDark(d, h + 4) && !e.isDark(d, h + 5) && e.isDark(d, h + 6) && (l += 40);
    for (let d = 0; d < t; d += 1)
      for (let h = 0; h < t - 6; h += 1)
        e.isDark(h, d) && !e.isDark(h + 1, d) && e.isDark(h + 2, d) && e.isDark(h + 3, d) && e.isDark(h + 4, d) && !e.isDark(h + 5, d) && e.isDark(h + 6, d) && (l += 40);
    let x = 0;
    for (let d = 0; d < t; d += 1)
      for (let h = 0; h < t; h += 1)
        e.isDark(h, d) && (x += 1);
    const y = Math.abs(100 * x / t / t - 50) / 5;
    return l += y * 10, l;
  }, i;
})(), v = (function() {
  const g = new Array(256), w = new Array(256);
  for (let o = 0; o < 8; o += 1)
    g[o] = 1 << o;
  for (let o = 8; o < 256; o += 1)
    g[o] = g[o - 4] ^ g[o - 5] ^ g[o - 6] ^ g[o - 8];
  for (let o = 0; o < 255; o += 1)
    w[g[o]] = o;
  const a = {};
  return a.glog = function(o) {
    if (o < 1)
      throw "glog(" + o + ")";
    return w[o];
  }, a.gexp = function(o) {
    for (; o < 0; )
      o += 255;
    for (; o >= 256; )
      o -= 255;
    return g[o];
  }, a;
})(), Q = function(g, w) {
  if (typeof g.length > "u")
    throw g.length + "/" + w;
  const a = (function() {
    let i = 0;
    for (; i < g.length && g[i] == 0; )
      i += 1;
    const c = new Array(g.length - i + w);
    for (let e = 0; e < g.length - i; e += 1)
      c[e] = g[e + i];
    return c;
  })(), o = {};
  return o.getAt = function(i) {
    return a[i];
  }, o.getLength = function() {
    return a.length;
  }, o.multiply = function(i) {
    const c = new Array(o.getLength() + i.getLength() - 1);
    for (let e = 0; e < o.getLength(); e += 1)
      for (let t = 0; t < i.getLength(); t += 1)
        c[e + t] ^= v.gexp(v.glog(o.getAt(e)) + v.glog(i.getAt(t)));
    return Q(c, 0);
  }, o.mod = function(i) {
    if (o.getLength() - i.getLength() < 0)
      return o;
    const c = v.glog(o.getAt(0)) - v.glog(i.getAt(0)), e = new Array(o.getLength());
    for (let t = 0; t < o.getLength(); t += 1)
      e[t] = o.getAt(t);
    for (let t = 0; t < i.getLength(); t += 1)
      e[t] ^= v.gexp(v.glog(i.getAt(t)) + c);
    return Q(e, 0).mod(i);
  }, o;
}, J = (function() {
  const g = [
    // L
    // M
    // Q
    // H
    // 1
    [1, 26, 19],
    [1, 26, 16],
    [1, 26, 13],
    [1, 26, 9],
    // 2
    [1, 44, 34],
    [1, 44, 28],
    [1, 44, 22],
    [1, 44, 16],
    // 3
    [1, 70, 55],
    [1, 70, 44],
    [2, 35, 17],
    [2, 35, 13],
    // 4
    [1, 100, 80],
    [2, 50, 32],
    [2, 50, 24],
    [4, 25, 9],
    // 5
    [1, 134, 108],
    [2, 67, 43],
    [2, 33, 15, 2, 34, 16],
    [2, 33, 11, 2, 34, 12],
    // 6
    [2, 86, 68],
    [4, 43, 27],
    [4, 43, 19],
    [4, 43, 15],
    // 7
    [2, 98, 78],
    [4, 49, 31],
    [2, 32, 14, 4, 33, 15],
    [4, 39, 13, 1, 40, 14],
    // 8
    [2, 121, 97],
    [2, 60, 38, 2, 61, 39],
    [4, 40, 18, 2, 41, 19],
    [4, 40, 14, 2, 41, 15],
    // 9
    [2, 146, 116],
    [3, 58, 36, 2, 59, 37],
    [4, 36, 16, 4, 37, 17],
    [4, 36, 12, 4, 37, 13],
    // 10
    [2, 86, 68, 2, 87, 69],
    [4, 69, 43, 1, 70, 44],
    [6, 43, 19, 2, 44, 20],
    [6, 43, 15, 2, 44, 16],
    // 11
    [4, 101, 81],
    [1, 80, 50, 4, 81, 51],
    [4, 50, 22, 4, 51, 23],
    [3, 36, 12, 8, 37, 13],
    // 12
    [2, 116, 92, 2, 117, 93],
    [6, 58, 36, 2, 59, 37],
    [4, 46, 20, 6, 47, 21],
    [7, 42, 14, 4, 43, 15],
    // 13
    [4, 133, 107],
    [8, 59, 37, 1, 60, 38],
    [8, 44, 20, 4, 45, 21],
    [12, 33, 11, 4, 34, 12],
    // 14
    [3, 145, 115, 1, 146, 116],
    [4, 64, 40, 5, 65, 41],
    [11, 36, 16, 5, 37, 17],
    [11, 36, 12, 5, 37, 13],
    // 15
    [5, 109, 87, 1, 110, 88],
    [5, 65, 41, 5, 66, 42],
    [5, 54, 24, 7, 55, 25],
    [11, 36, 12, 7, 37, 13],
    // 16
    [5, 122, 98, 1, 123, 99],
    [7, 73, 45, 3, 74, 46],
    [15, 43, 19, 2, 44, 20],
    [3, 45, 15, 13, 46, 16],
    // 17
    [1, 135, 107, 5, 136, 108],
    [10, 74, 46, 1, 75, 47],
    [1, 50, 22, 15, 51, 23],
    [2, 42, 14, 17, 43, 15],
    // 18
    [5, 150, 120, 1, 151, 121],
    [9, 69, 43, 4, 70, 44],
    [17, 50, 22, 1, 51, 23],
    [2, 42, 14, 19, 43, 15],
    // 19
    [3, 141, 113, 4, 142, 114],
    [3, 70, 44, 11, 71, 45],
    [17, 47, 21, 4, 48, 22],
    [9, 39, 13, 16, 40, 14],
    // 20
    [3, 135, 107, 5, 136, 108],
    [3, 67, 41, 13, 68, 42],
    [15, 54, 24, 5, 55, 25],
    [15, 43, 15, 10, 44, 16],
    // 21
    [4, 144, 116, 4, 145, 117],
    [17, 68, 42],
    [17, 50, 22, 6, 51, 23],
    [19, 46, 16, 6, 47, 17],
    // 22
    [2, 139, 111, 7, 140, 112],
    [17, 74, 46],
    [7, 54, 24, 16, 55, 25],
    [34, 37, 13],
    // 23
    [4, 151, 121, 5, 152, 122],
    [4, 75, 47, 14, 76, 48],
    [11, 54, 24, 14, 55, 25],
    [16, 45, 15, 14, 46, 16],
    // 24
    [6, 147, 117, 4, 148, 118],
    [6, 73, 45, 14, 74, 46],
    [11, 54, 24, 16, 55, 25],
    [30, 46, 16, 2, 47, 17],
    // 25
    [8, 132, 106, 4, 133, 107],
    [8, 75, 47, 13, 76, 48],
    [7, 54, 24, 22, 55, 25],
    [22, 45, 15, 13, 46, 16],
    // 26
    [10, 142, 114, 2, 143, 115],
    [19, 74, 46, 4, 75, 47],
    [28, 50, 22, 6, 51, 23],
    [33, 46, 16, 4, 47, 17],
    // 27
    [8, 152, 122, 4, 153, 123],
    [22, 73, 45, 3, 74, 46],
    [8, 53, 23, 26, 54, 24],
    [12, 45, 15, 28, 46, 16],
    // 28
    [3, 147, 117, 10, 148, 118],
    [3, 73, 45, 23, 74, 46],
    [4, 54, 24, 31, 55, 25],
    [11, 45, 15, 31, 46, 16],
    // 29
    [7, 146, 116, 7, 147, 117],
    [21, 73, 45, 7, 74, 46],
    [1, 53, 23, 37, 54, 24],
    [19, 45, 15, 26, 46, 16],
    // 30
    [5, 145, 115, 10, 146, 116],
    [19, 75, 47, 10, 76, 48],
    [15, 54, 24, 25, 55, 25],
    [23, 45, 15, 25, 46, 16],
    // 31
    [13, 145, 115, 3, 146, 116],
    [2, 74, 46, 29, 75, 47],
    [42, 54, 24, 1, 55, 25],
    [23, 45, 15, 28, 46, 16],
    // 32
    [17, 145, 115],
    [10, 74, 46, 23, 75, 47],
    [10, 54, 24, 35, 55, 25],
    [19, 45, 15, 35, 46, 16],
    // 33
    [17, 145, 115, 1, 146, 116],
    [14, 74, 46, 21, 75, 47],
    [29, 54, 24, 19, 55, 25],
    [11, 45, 15, 46, 46, 16],
    // 34
    [13, 145, 115, 6, 146, 116],
    [14, 74, 46, 23, 75, 47],
    [44, 54, 24, 7, 55, 25],
    [59, 46, 16, 1, 47, 17],
    // 35
    [12, 151, 121, 7, 152, 122],
    [12, 75, 47, 26, 76, 48],
    [39, 54, 24, 14, 55, 25],
    [22, 45, 15, 41, 46, 16],
    // 36
    [6, 151, 121, 14, 152, 122],
    [6, 75, 47, 34, 76, 48],
    [46, 54, 24, 10, 55, 25],
    [2, 45, 15, 64, 46, 16],
    // 37
    [17, 152, 122, 4, 153, 123],
    [29, 74, 46, 14, 75, 47],
    [49, 54, 24, 10, 55, 25],
    [24, 45, 15, 46, 46, 16],
    // 38
    [4, 152, 122, 18, 153, 123],
    [13, 74, 46, 32, 75, 47],
    [48, 54, 24, 14, 55, 25],
    [42, 45, 15, 32, 46, 16],
    // 39
    [20, 147, 117, 4, 148, 118],
    [40, 75, 47, 7, 76, 48],
    [43, 54, 24, 22, 55, 25],
    [10, 45, 15, 67, 46, 16],
    // 40
    [19, 148, 118, 6, 149, 119],
    [18, 75, 47, 31, 76, 48],
    [34, 54, 24, 34, 55, 25],
    [20, 45, 15, 61, 46, 16]
  ], w = function(i, c) {
    const e = {};
    return e.totalCount = i, e.dataCount = c, e;
  }, a = {}, o = function(i, c) {
    switch (c) {
      case j.L:
        return g[(i - 1) * 4 + 0];
      case j.M:
        return g[(i - 1) * 4 + 1];
      case j.Q:
        return g[(i - 1) * 4 + 2];
      case j.H:
        return g[(i - 1) * 4 + 3];
      default:
        return;
    }
  };
  return a.getRSBlocks = function(i, c) {
    const e = o(i, c);
    if (typeof e > "u")
      throw "bad rs block @ typeNumber:" + i + "/errorCorrectionLevel:" + c;
    const t = e.length / 3, l = [];
    for (let x = 0; x < t; x += 1) {
      const y = e[x * 3 + 0], d = e[x * 3 + 1], h = e[x * 3 + 2];
      for (let _ = 0; _ < y; _ += 1)
        l.push(w(d, h));
    }
    return l;
  }, a;
})(), Z = function() {
  const g = [];
  let w = 0;
  const a = {};
  return a.getBuffer = function() {
    return g;
  }, a.getAt = function(o) {
    const i = Math.floor(o / 8);
    return (g[i] >>> 7 - o % 8 & 1) == 1;
  }, a.put = function(o, i) {
    for (let c = 0; c < i; c += 1)
      a.putBit((o >>> i - c - 1 & 1) == 1);
  }, a.getLengthInBits = function() {
    return w;
  }, a.putBit = function(o) {
    const i = Math.floor(w / 8);
    g.length <= i && g.push(0), o && (g[i] |= 128 >>> w % 8), w += 1;
  }, a;
}, z = function(g) {
  const w = k.MODE_NUMBER, a = g, o = {};
  o.getMode = function() {
    return w;
  }, o.getLength = function(e) {
    return a.length;
  }, o.write = function(e) {
    const t = a;
    let l = 0;
    for (; l + 2 < t.length; )
      e.put(i(t.substring(l, l + 3)), 10), l += 3;
    l < t.length && (t.length - l == 1 ? e.put(i(t.substring(l, l + 1)), 4) : t.length - l == 2 && e.put(i(t.substring(l, l + 2)), 7));
  };
  const i = function(e) {
    let t = 0;
    for (let l = 0; l < e.length; l += 1)
      t = t * 10 + c(e.charAt(l));
    return t;
  }, c = function(e) {
    if ("0" <= e && e <= "9")
      return e.charCodeAt(0) - 48;
    throw "illegal char :" + e;
  };
  return o;
}, tt = function(g) {
  const w = k.MODE_ALPHA_NUM, a = g, o = {};
  o.getMode = function() {
    return w;
  }, o.getLength = function(c) {
    return a.length;
  }, o.write = function(c) {
    const e = a;
    let t = 0;
    for (; t + 1 < e.length; )
      c.put(
        i(e.charAt(t)) * 45 + i(e.charAt(t + 1)),
        11
      ), t += 2;
    t < e.length && c.put(i(e.charAt(t)), 6);
  };
  const i = function(c) {
    if ("0" <= c && c <= "9")
      return c.charCodeAt(0) - 48;
    if ("A" <= c && c <= "Z")
      return c.charCodeAt(0) - 65 + 10;
    switch (c) {
      case " ":
        return 36;
      case "$":
        return 37;
      case "%":
        return 38;
      case "*":
        return 39;
      case "+":
        return 40;
      case "-":
        return 41;
      case ".":
        return 42;
      case "/":
        return 43;
      case ":":
        return 44;
      default:
        throw "illegal char :" + c;
    }
  };
  return o;
}, et = function(g) {
  const w = k.MODE_8BIT_BYTE, a = H.stringToBytes(g), o = {};
  return o.getMode = function() {
    return w;
  }, o.getLength = function(i) {
    return a.length;
  }, o.write = function(i) {
    for (let c = 0; c < a.length; c += 1)
      i.put(a[c], 8);
  }, o;
}, nt = function(g) {
  const w = k.MODE_KANJI, a = H.stringToBytes;
  (function(c, e) {
    const t = a(c);
    if (t.length != 2 || (t[0] << 8 | t[1]) != e)
      throw "sjis not supported.";
  })("友", 38726);
  const o = a(g), i = {};
  return i.getMode = function() {
    return w;
  }, i.getLength = function(c) {
    return ~~(o.length / 2);
  }, i.write = function(c) {
    const e = o;
    let t = 0;
    for (; t + 1 < e.length; ) {
      let l = (255 & e[t]) << 8 | 255 & e[t + 1];
      if (33088 <= l && l <= 40956)
        l -= 33088;
      else if (57408 <= l && l <= 60351)
        l -= 49472;
      else
        throw "illegal char at " + (t + 1) + "/" + l;
      l = (l >>> 8 & 255) * 192 + (l & 255), c.put(l, 13), t += 2;
    }
    if (t < e.length)
      throw "illegal char at " + (t + 1);
  }, i;
}, X = function() {
  const g = [], w = {};
  return w.writeByte = function(a) {
    g.push(a & 255);
  }, w.writeShort = function(a) {
    w.writeByte(a), w.writeByte(a >>> 8);
  }, w.writeBytes = function(a, o, i) {
    o = o || 0, i = i || a.length;
    for (let c = 0; c < i; c += 1)
      w.writeByte(a[c + o]);
  }, w.writeString = function(a) {
    for (let o = 0; o < a.length; o += 1)
      w.writeByte(a.charCodeAt(o));
  }, w.toByteArray = function() {
    return g;
  }, w.toString = function() {
    let a = "";
    a += "[";
    for (let o = 0; o < g.length; o += 1)
      o > 0 && (a += ","), a += g[o];
    return a += "]", a;
  }, w;
}, rt = function() {
  let g = 0, w = 0, a = 0, o = "";
  const i = {}, c = function(t) {
    o += String.fromCharCode(e(t & 63));
  }, e = function(t) {
    if (t < 0)
      throw "n:" + t;
    if (t < 26)
      return 65 + t;
    if (t < 52)
      return 97 + (t - 26);
    if (t < 62)
      return 48 + (t - 52);
    if (t == 62)
      return 43;
    if (t == 63)
      return 47;
    throw "n:" + t;
  };
  return i.writeByte = function(t) {
    for (g = g << 8 | t & 255, w += 8, a += 1; w >= 6; )
      c(g >>> w - 6), w -= 6;
  }, i.flush = function() {
    if (w > 0 && (c(g << 6 - w), g = 0, w = 0), a % 3 != 0) {
      const t = 3 - a % 3;
      for (let l = 0; l < t; l += 1)
        o += "=";
    }
  }, i.toString = function() {
    return o;
  }, i;
}, ot = function(g) {
  const w = g;
  let a = 0, o = 0, i = 0;
  const c = {};
  c.read = function() {
    for (; i < 8; ) {
      if (a >= w.length) {
        if (i == 0)
          return -1;
        throw "unexpected end of file./" + i;
      }
      const l = w.charAt(a);
      if (a += 1, l == "=")
        return i = 0, -1;
      if (l.match(/^\s$/))
        continue;
      o = o << 6 | e(l.charCodeAt(0)), i += 6;
    }
    const t = o >>> i - 8 & 255;
    return i -= 8, t;
  };
  const e = function(t) {
    if (65 <= t && t <= 90)
      return t - 65;
    if (97 <= t && t <= 122)
      return t - 97 + 26;
    if (48 <= t && t <= 57)
      return t - 48 + 52;
    if (t == 43)
      return 62;
    if (t == 47)
      return 63;
    throw "c:" + t;
  };
  return c;
}, it = function(g, w) {
  const a = g, o = w, i = new Array(g * w), c = {};
  c.setPixel = function(x, y, d) {
    i[y * a + x] = d;
  }, c.write = function(x) {
    x.writeString("GIF87a"), x.writeShort(a), x.writeShort(o), x.writeByte(128), x.writeByte(0), x.writeByte(0), x.writeByte(0), x.writeByte(0), x.writeByte(0), x.writeByte(255), x.writeByte(255), x.writeByte(255), x.writeString(","), x.writeShort(0), x.writeShort(0), x.writeShort(a), x.writeShort(o), x.writeByte(0);
    const y = 2, d = t(y);
    x.writeByte(y);
    let h = 0;
    for (; d.length - h > 255; )
      x.writeByte(255), x.writeBytes(d, h, 255), h += 255;
    x.writeByte(d.length - h), x.writeBytes(d, h, d.length - h), x.writeByte(0), x.writeString(";");
  };
  const e = function(x) {
    const y = x;
    let d = 0, h = 0;
    const _ = {};
    return _.write = function(P, D) {
      if (P >>> D)
        throw "length over";
      for (; d + D >= 8; )
        y.writeByte(255 & (P << d | h)), D -= 8 - d, P >>>= 8 - d, h = 0, d = 0;
      h = P << d | h, d = d + D;
    }, _.flush = function() {
      d > 0 && y.writeByte(h);
    }, _;
  }, t = function(x) {
    const y = 1 << x, d = (1 << x) + 1;
    let h = x + 1;
    const _ = l();
    for (let m = 0; m < y; m += 1)
      _.add(String.fromCharCode(m));
    _.add(String.fromCharCode(y)), _.add(String.fromCharCode(d));
    const P = X(), D = e(P);
    D.write(y, h);
    let E = 0, I = String.fromCharCode(i[E]);
    for (E += 1; E < i.length; ) {
      const m = String.fromCharCode(i[E]);
      E += 1, _.contains(I + m) ? I = I + m : (D.write(_.indexOf(I), h), _.size() < 4095 && (_.size() == 1 << h && (h += 1), _.add(I + m)), I = m);
    }
    return D.write(_.indexOf(I), h), D.write(d, h), D.flush(), P.toByteArray();
  }, l = function() {
    const x = {};
    let y = 0;
    const d = {};
    return d.add = function(h) {
      if (d.contains(h))
        throw "dup key:" + h;
      x[h] = y, y += 1;
    }, d.size = function() {
      return y;
    }, d.indexOf = function(h) {
      return x[h];
    }, d.contains = function(h) {
      return typeof x[h] < "u";
    }, d;
  };
  return c;
}, st = function(g, w, a) {
  const o = it(g, w);
  for (let t = 0; t < w; t += 1)
    for (let l = 0; l < g; l += 1)
      o.setPixel(l, t, a(l, t));
  const i = X();
  o.write(i);
  const c = rt(), e = i.toByteArray();
  for (let t = 0; t < e.length; t += 1)
    c.writeByte(e[t]);
  return c.flush(), "data:image/gif;base64," + c;
};
H.stringToBytes;
const N = 4, ft = 0.42, F = "#14101f", ct = "#ffffff";
function ut(g, w, a) {
  const o = (c) => c < 7, i = (c) => c >= a - 7;
  return o(g) && o(w) || o(g) && i(w) || i(g) && o(w);
}
function S(g, w) {
  return `<rect x="${g + 0.5}" y="${w + 0.5}" width="6" height="6" rx="2.1" fill="none" stroke="${F}" stroke-width="1"/><rect x="${g + 2}" y="${w + 2}" width="3" height="3" rx="1.1" fill="${F}"/>`;
}
function at(g, w = "QR code") {
  const a = H(0, "M");
  a.addData(g), a.make();
  const o = a.getModuleCount(), i = o + N * 2, c = [];
  c.push(`<rect x="0" y="0" width="${i}" height="${i}" rx="3" fill="${ct}"/>`), c.push(S(N, N)), c.push(S(N + o - 7, N)), c.push(S(N, N + o - 7));
  for (let e = 0; e < o; e++)
    for (let t = 0; t < o; t++) {
      if (ut(e, t, o) || !a.isDark(e, t)) continue;
      const l = N + t + 0.5, x = N + e + 0.5;
      c.push(`<circle cx="${l}" cy="${x}" r="${ft}" fill="${F}"/>`);
    }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${i} ${i}" role="img" aria-label="${w}" shape-rendering="geometricPrecision">${c.join("")}</svg>`;
}
export {
  at as r
};
