import { g as lr } from "./bitlogin-shared-8bKMreA1.js";
var j = { exports: {} }, er;
function dr() {
  return er || (er = 1, (function(O, $) {
    var U = (function() {
      var C = function(x, c) {
        var v = 236, l = 17, n = x, h = D[c], t = null, r = 0, g = null, u = [], s = {}, y = function(a, f) {
          r = n * 4 + 17, t = (function(e) {
            for (var i = new Array(e), o = 0; o < e; o += 1) {
              i[o] = new Array(e);
              for (var d = 0; d < e; d += 1)
                i[o][d] = null;
            }
            return i;
          })(r), _(0, 0), _(r - 7, 0), _(0, r - 7), I(), L(), F(a, f), n >= 7 && m(a), g == null && (g = hr(n, h, u)), H(g, f);
        }, _ = function(a, f) {
          for (var e = -1; e <= 7; e += 1)
            if (!(a + e <= -1 || r <= a + e))
              for (var i = -1; i <= 7; i += 1)
                f + i <= -1 || r <= f + i || (0 <= e && e <= 6 && (i == 0 || i == 6) || 0 <= i && i <= 6 && (e == 0 || e == 6) || 2 <= e && e <= 4 && 2 <= i && i <= 4 ? t[a + e][f + i] = !0 : t[a + e][f + i] = !1);
        }, M = function() {
          for (var a = 0, f = 0, e = 0; e < 8; e += 1) {
            y(!0, e);
            var i = k.getLostPoint(s);
            (e == 0 || a > i) && (a = i, f = e);
          }
          return f;
        }, L = function() {
          for (var a = 8; a < r - 8; a += 1)
            t[a][6] == null && (t[a][6] = a % 2 == 0);
          for (var f = 8; f < r - 8; f += 1)
            t[6][f] == null && (t[6][f] = f % 2 == 0);
        }, I = function() {
          for (var a = k.getPatternPosition(n), f = 0; f < a.length; f += 1)
            for (var e = 0; e < a.length; e += 1) {
              var i = a[f], o = a[e];
              if (t[i][o] == null)
                for (var d = -2; d <= 2; d += 1)
                  for (var p = -2; p <= 2; p += 1)
                    d == -2 || d == 2 || p == -2 || p == 2 || d == 0 && p == 0 ? t[i + d][o + p] = !0 : t[i + d][o + p] = !1;
            }
        }, m = function(a) {
          for (var f = k.getBCHTypeNumber(n), e = 0; e < 18; e += 1) {
            var i = !a && (f >> e & 1) == 1;
            t[Math.floor(e / 3)][e % 3 + r - 8 - 3] = i;
          }
          for (var e = 0; e < 18; e += 1) {
            var i = !a && (f >> e & 1) == 1;
            t[e % 3 + r - 8 - 3][Math.floor(e / 3)] = i;
          }
        }, F = function(a, f) {
          for (var e = h << 3 | f, i = k.getBCHTypeInfo(e), o = 0; o < 15; o += 1) {
            var d = !a && (i >> o & 1) == 1;
            o < 6 ? t[o][8] = d : o < 8 ? t[o + 1][8] = d : t[r - 15 + o][8] = d;
          }
          for (var o = 0; o < 15; o += 1) {
            var d = !a && (i >> o & 1) == 1;
            o < 8 ? t[8][r - o - 1] = d : o < 9 ? t[8][15 - o - 1 + 1] = d : t[8][15 - o - 1] = d;
          }
          t[r - 8][8] = !a;
        }, H = function(a, f) {
          for (var e = -1, i = r - 1, o = 7, d = 0, p = k.getMaskFunction(f), w = r - 1; w > 0; w -= 2)
            for (w == 6 && (w -= 1); ; ) {
              for (var b = 0; b < 2; b += 1)
                if (t[i][w - b] == null) {
                  var R = !1;
                  d < a.length && (R = (a[d] >>> o & 1) == 1);
                  var A = p(i, w - b);
                  A && (R = !R), t[i][w - b] = R, o -= 1, o == -1 && (d += 1, o = 7);
                }
              if (i += e, i < 0 || r <= i) {
                i -= e, e = -e;
                break;
              }
            }
        }, G = function(a, f) {
          for (var e = 0, i = 0, o = 0, d = new Array(f.length), p = new Array(f.length), w = 0; w < f.length; w += 1) {
            var b = f[w].dataCount, R = f[w].totalCount - b;
            i = Math.max(i, b), o = Math.max(o, R), d[w] = new Array(b);
            for (var A = 0; A < d[w].length; A += 1)
              d[w][A] = 255 & a.getBuffer()[A + e];
            e += b;
            var P = k.getErrorCorrectPolynomial(R), N = K(d[w], P.getLength() - 1), z = N.mod(P);
            p[w] = new Array(P.getLength() - 1);
            for (var A = 0; A < p[w].length; A += 1) {
              var rr = A + z.getLength() - p[w].length;
              p[w][A] = rr >= 0 ? z.getAt(rr) : 0;
            }
          }
          for (var tr = 0, A = 0; A < f.length; A += 1)
            tr += f[A].totalCount;
          for (var Y = new Array(tr), S = 0, A = 0; A < i; A += 1)
            for (var w = 0; w < f.length; w += 1)
              A < d[w].length && (Y[S] = d[w][A], S += 1);
          for (var A = 0; A < o; A += 1)
            for (var w = 0; w < f.length; w += 1)
              A < p[w].length && (Y[S] = p[w][A], S += 1);
          return Y;
        }, hr = function(a, f, e) {
          for (var i = W.getRSBlocks(a, f), o = V(), d = 0; d < e.length; d += 1) {
            var p = e[d];
            o.put(p.getMode(), 4), o.put(p.getLength(), k.getLengthInBits(p.getMode(), a)), p.write(o);
          }
          for (var w = 0, d = 0; d < i.length; d += 1)
            w += i[d].dataCount;
          if (o.getLengthInBits() > w * 8)
            throw "code length overflow. (" + o.getLengthInBits() + ">" + w * 8 + ")";
          for (o.getLengthInBits() + 4 <= w * 8 && o.put(0, 4); o.getLengthInBits() % 8 != 0; )
            o.putBit(!1);
          for (; !(o.getLengthInBits() >= w * 8 || (o.put(v, 8), o.getLengthInBits() >= w * 8)); )
            o.put(l, 8);
          return G(o, i);
        };
        s.addData = function(a, f) {
          f = f || "Byte";
          var e = null;
          switch (f) {
            case "Numeric":
              e = nr(a);
              break;
            case "Alphanumeric":
              e = ar(a);
              break;
            case "Byte":
              e = fr(a);
              break;
            case "Kanji":
              e = ir(a);
              break;
            default:
              throw "mode:" + f;
          }
          u.push(e), g = null;
        }, s.isDark = function(a, f) {
          if (a < 0 || r <= a || f < 0 || r <= f)
            throw a + "," + f;
          return t[a][f];
        }, s.getModuleCount = function() {
          return r;
        }, s.make = function() {
          if (n < 1) {
            for (var a = 1; a < 40; a++) {
              for (var f = W.getRSBlocks(a, h), e = V(), i = 0; i < u.length; i++) {
                var o = u[i];
                e.put(o.getMode(), 4), e.put(o.getLength(), k.getLengthInBits(o.getMode(), a)), o.write(e);
              }
              for (var d = 0, i = 0; i < f.length; i++)
                d += f[i].dataCount;
              if (e.getLengthInBits() <= d * 8)
                break;
            }
            n = a;
          }
          y(!1, M());
        }, s.createTableTag = function(a, f) {
          a = a || 2, f = typeof f > "u" ? a * 4 : f;
          var e = "";
          e += '<table style="', e += " border-width: 0px; border-style: none;", e += " border-collapse: collapse;", e += " padding: 0px; margin: " + f + "px;", e += '">', e += "<tbody>";
          for (var i = 0; i < s.getModuleCount(); i += 1) {
            e += "<tr>";
            for (var o = 0; o < s.getModuleCount(); o += 1)
              e += '<td style="', e += " border-width: 0px; border-style: none;", e += " border-collapse: collapse;", e += " padding: 0px; margin: 0px;", e += " width: " + a + "px;", e += " height: " + a + "px;", e += " background-color: ", e += s.isDark(i, o) ? "#000000" : "#ffffff", e += ";", e += '"/>';
            e += "</tr>";
          }
          return e += "</tbody>", e += "</table>", e;
        }, s.createSvgTag = function(a, f, e, i) {
          var o = {};
          typeof arguments[0] == "object" && (o = arguments[0], a = o.cellSize, f = o.margin, e = o.alt, i = o.title), a = a || 2, f = typeof f > "u" ? a * 4 : f, e = typeof e == "string" ? { text: e } : e || {}, e.text = e.text || null, e.id = e.text ? e.id || "qrcode-description" : null, i = typeof i == "string" ? { text: i } : i || {}, i.text = i.text || null, i.id = i.text ? i.id || "qrcode-title" : null;
          var d = s.getModuleCount() * a + f * 2, p, w, b, R, A = "", P;
          for (P = "l" + a + ",0 0," + a + " -" + a + ",0 0,-" + a + "z ", A += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"', A += o.scalable ? "" : ' width="' + d + 'px" height="' + d + 'px"', A += ' viewBox="0 0 ' + d + " " + d + '" ', A += ' preserveAspectRatio="xMinYMin meet"', A += i.text || e.text ? ' role="img" aria-labelledby="' + J([i.id, e.id].join(" ").trim()) + '"' : "", A += ">", A += i.text ? '<title id="' + J(i.id) + '">' + J(i.text) + "</title>" : "", A += e.text ? '<description id="' + J(e.id) + '">' + J(e.text) + "</description>" : "", A += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>', A += '<path d="', b = 0; b < s.getModuleCount(); b += 1)
            for (R = b * a + f, p = 0; p < s.getModuleCount(); p += 1)
              s.isDark(b, p) && (w = p * a + f, A += "M" + w + "," + R + P);
          return A += '" stroke="transparent" fill="black"/>', A += "</svg>", A;
        }, s.createDataURL = function(a, f) {
          a = a || 2, f = typeof f > "u" ? a * 4 : f;
          var e = s.getModuleCount() * a + f * 2, i = f, o = e - f;
          return sr(e, e, function(d, p) {
            if (i <= d && d < o && i <= p && p < o) {
              var w = Math.floor((d - i) / a), b = Math.floor((p - i) / a);
              return s.isDark(b, w) ? 0 : 1;
            } else
              return 1;
          });
        }, s.createImgTag = function(a, f, e) {
          a = a || 2, f = typeof f > "u" ? a * 4 : f;
          var i = s.getModuleCount() * a + f * 2, o = "";
          return o += "<img", o += ' src="', o += s.createDataURL(a, f), o += '"', o += ' width="', o += i, o += '"', o += ' height="', o += i, o += '"', e && (o += ' alt="', o += J(e), o += '"'), o += "/>", o;
        };
        var J = function(a) {
          for (var f = "", e = 0; e < a.length; e += 1) {
            var i = a.charAt(e);
            switch (i) {
              case "<":
                f += "&lt;";
                break;
              case ">":
                f += "&gt;";
                break;
              case "&":
                f += "&amp;";
                break;
              case '"':
                f += "&quot;";
                break;
              default:
                f += i;
                break;
            }
          }
          return f;
        }, gr = function(a) {
          var f = 1;
          a = typeof a > "u" ? f * 2 : a;
          var e = s.getModuleCount() * f + a * 2, i = a, o = e - a, d, p, w, b, R, A = {
            "██": "█",
            "█ ": "▀",
            " █": "▄",
            "  ": " "
          }, P = {
            "██": "▀",
            "█ ": "▀",
            " █": " ",
            "  ": " "
          }, N = "";
          for (d = 0; d < e; d += 2) {
            for (w = Math.floor((d - i) / f), b = Math.floor((d + 1 - i) / f), p = 0; p < e; p += 1)
              R = "█", i <= p && p < o && i <= d && d < o && s.isDark(w, Math.floor((p - i) / f)) && (R = " "), i <= p && p < o && i <= d + 1 && d + 1 < o && s.isDark(b, Math.floor((p - i) / f)) ? R += " " : R += "█", N += a < 1 && d + 1 >= o ? P[R] : A[R];
            N += `
`;
          }
          return e % 2 && a > 0 ? N.substring(0, N.length - e - 1) + Array(e + 1).join("▀") : N.substring(0, N.length - 1);
        };
        return s.createASCII = function(a, f) {
          if (a = a || 1, a < 2)
            return gr(f);
          a -= 1, f = typeof f > "u" ? a * 2 : f;
          var e = s.getModuleCount() * a + f * 2, i = f, o = e - f, d, p, w, b, R = Array(a + 1).join("██"), A = Array(a + 1).join("  "), P = "", N = "";
          for (d = 0; d < e; d += 1) {
            for (w = Math.floor((d - i) / a), N = "", p = 0; p < e; p += 1)
              b = 1, i <= p && p < o && i <= d && d < o && s.isDark(w, Math.floor((p - i) / a)) && (b = 0), N += b ? R : A;
            for (w = 0; w < a; w += 1)
              P += N + `
`;
          }
          return P.substring(0, P.length - 1);
        }, s.renderTo2dContext = function(a, f) {
          f = f || 2;
          for (var e = s.getModuleCount(), i = 0; i < e; i++)
            for (var o = 0; o < e; o++)
              a.fillStyle = s.isDark(i, o) ? "black" : "white", a.fillRect(i * f, o * f, f, f);
        }, s;
      };
      C.stringToBytesFuncs = {
        default: function(x) {
          for (var c = [], v = 0; v < x.length; v += 1) {
            var l = x.charCodeAt(v);
            c.push(l & 255);
          }
          return c;
        }
      }, C.stringToBytes = C.stringToBytesFuncs.default, C.createStringToBytes = function(x, c) {
        var v = (function() {
          for (var n = ur(x), h = function() {
            var L = n.read();
            if (L == -1) throw "eof";
            return L;
          }, t = 0, r = {}; ; ) {
            var g = n.read();
            if (g == -1) break;
            var u = h(), s = h(), y = h(), _ = String.fromCharCode(g << 8 | u), M = s << 8 | y;
            r[_] = M, t += 1;
          }
          if (t != c)
            throw t + " != " + c;
          return r;
        })(), l = 63;
        return function(n) {
          for (var h = [], t = 0; t < n.length; t += 1) {
            var r = n.charCodeAt(t);
            if (r < 128)
              h.push(r);
            else {
              var g = v[n.charAt(t)];
              typeof g == "number" ? (g & 255) == g ? h.push(g) : (h.push(g >>> 8), h.push(g & 255)) : h.push(l);
            }
          }
          return h;
        };
      };
      var T = {
        MODE_NUMBER: 1,
        MODE_ALPHA_NUM: 2,
        MODE_8BIT_BYTE: 4,
        MODE_KANJI: 8
      }, D = {
        L: 1,
        M: 0,
        Q: 3,
        H: 2
      }, E = {
        PATTERN000: 0,
        PATTERN001: 1,
        PATTERN010: 2,
        PATTERN011: 3,
        PATTERN100: 4,
        PATTERN101: 5,
        PATTERN110: 6,
        PATTERN111: 7
      }, k = (function() {
        var x = [
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
        ], c = 1335, v = 7973, l = 21522, n = {}, h = function(t) {
          for (var r = 0; t != 0; )
            r += 1, t >>>= 1;
          return r;
        };
        return n.getBCHTypeInfo = function(t) {
          for (var r = t << 10; h(r) - h(c) >= 0; )
            r ^= c << h(r) - h(c);
          return (t << 10 | r) ^ l;
        }, n.getBCHTypeNumber = function(t) {
          for (var r = t << 12; h(r) - h(v) >= 0; )
            r ^= v << h(r) - h(v);
          return t << 12 | r;
        }, n.getPatternPosition = function(t) {
          return x[t - 1];
        }, n.getMaskFunction = function(t) {
          switch (t) {
            case E.PATTERN000:
              return function(r, g) {
                return (r + g) % 2 == 0;
              };
            case E.PATTERN001:
              return function(r, g) {
                return r % 2 == 0;
              };
            case E.PATTERN010:
              return function(r, g) {
                return g % 3 == 0;
              };
            case E.PATTERN011:
              return function(r, g) {
                return (r + g) % 3 == 0;
              };
            case E.PATTERN100:
              return function(r, g) {
                return (Math.floor(r / 2) + Math.floor(g / 3)) % 2 == 0;
              };
            case E.PATTERN101:
              return function(r, g) {
                return r * g % 2 + r * g % 3 == 0;
              };
            case E.PATTERN110:
              return function(r, g) {
                return (r * g % 2 + r * g % 3) % 2 == 0;
              };
            case E.PATTERN111:
              return function(r, g) {
                return (r * g % 3 + (r + g) % 2) % 2 == 0;
              };
            default:
              throw "bad maskPattern:" + t;
          }
        }, n.getErrorCorrectPolynomial = function(t) {
          for (var r = K([1], 0), g = 0; g < t; g += 1)
            r = r.multiply(K([1, B.gexp(g)], 0));
          return r;
        }, n.getLengthInBits = function(t, r) {
          if (1 <= r && r < 10)
            switch (t) {
              case T.MODE_NUMBER:
                return 10;
              case T.MODE_ALPHA_NUM:
                return 9;
              case T.MODE_8BIT_BYTE:
                return 8;
              case T.MODE_KANJI:
                return 8;
              default:
                throw "mode:" + t;
            }
          else if (r < 27)
            switch (t) {
              case T.MODE_NUMBER:
                return 12;
              case T.MODE_ALPHA_NUM:
                return 11;
              case T.MODE_8BIT_BYTE:
                return 16;
              case T.MODE_KANJI:
                return 10;
              default:
                throw "mode:" + t;
            }
          else if (r < 41)
            switch (t) {
              case T.MODE_NUMBER:
                return 14;
              case T.MODE_ALPHA_NUM:
                return 13;
              case T.MODE_8BIT_BYTE:
                return 16;
              case T.MODE_KANJI:
                return 12;
              default:
                throw "mode:" + t;
            }
          else
            throw "type:" + r;
        }, n.getLostPoint = function(t) {
          for (var r = t.getModuleCount(), g = 0, u = 0; u < r; u += 1)
            for (var s = 0; s < r; s += 1) {
              for (var y = 0, _ = t.isDark(u, s), M = -1; M <= 1; M += 1)
                if (!(u + M < 0 || r <= u + M))
                  for (var L = -1; L <= 1; L += 1)
                    s + L < 0 || r <= s + L || M == 0 && L == 0 || _ == t.isDark(u + M, s + L) && (y += 1);
              y > 5 && (g += 3 + y - 5);
            }
          for (var u = 0; u < r - 1; u += 1)
            for (var s = 0; s < r - 1; s += 1) {
              var I = 0;
              t.isDark(u, s) && (I += 1), t.isDark(u + 1, s) && (I += 1), t.isDark(u, s + 1) && (I += 1), t.isDark(u + 1, s + 1) && (I += 1), (I == 0 || I == 4) && (g += 3);
            }
          for (var u = 0; u < r; u += 1)
            for (var s = 0; s < r - 6; s += 1)
              t.isDark(u, s) && !t.isDark(u, s + 1) && t.isDark(u, s + 2) && t.isDark(u, s + 3) && t.isDark(u, s + 4) && !t.isDark(u, s + 5) && t.isDark(u, s + 6) && (g += 40);
          for (var s = 0; s < r; s += 1)
            for (var u = 0; u < r - 6; u += 1)
              t.isDark(u, s) && !t.isDark(u + 1, s) && t.isDark(u + 2, s) && t.isDark(u + 3, s) && t.isDark(u + 4, s) && !t.isDark(u + 5, s) && t.isDark(u + 6, s) && (g += 40);
          for (var m = 0, s = 0; s < r; s += 1)
            for (var u = 0; u < r; u += 1)
              t.isDark(u, s) && (m += 1);
          var F = Math.abs(100 * m / r / r - 50) / 5;
          return g += F * 10, g;
        }, n;
      })(), B = (function() {
        for (var x = new Array(256), c = new Array(256), v = 0; v < 8; v += 1)
          x[v] = 1 << v;
        for (var v = 8; v < 256; v += 1)
          x[v] = x[v - 4] ^ x[v - 5] ^ x[v - 6] ^ x[v - 8];
        for (var v = 0; v < 255; v += 1)
          c[x[v]] = v;
        var l = {};
        return l.glog = function(n) {
          if (n < 1)
            throw "glog(" + n + ")";
          return c[n];
        }, l.gexp = function(n) {
          for (; n < 0; )
            n += 255;
          for (; n >= 256; )
            n -= 255;
          return x[n];
        }, l;
      })();
      function K(x, c) {
        if (typeof x.length > "u")
          throw x.length + "/" + c;
        var v = (function() {
          for (var n = 0; n < x.length && x[n] == 0; )
            n += 1;
          for (var h = new Array(x.length - n + c), t = 0; t < x.length - n; t += 1)
            h[t] = x[t + n];
          return h;
        })(), l = {};
        return l.getAt = function(n) {
          return v[n];
        }, l.getLength = function() {
          return v.length;
        }, l.multiply = function(n) {
          for (var h = new Array(l.getLength() + n.getLength() - 1), t = 0; t < l.getLength(); t += 1)
            for (var r = 0; r < n.getLength(); r += 1)
              h[t + r] ^= B.gexp(B.glog(l.getAt(t)) + B.glog(n.getAt(r)));
          return K(h, 0);
        }, l.mod = function(n) {
          if (l.getLength() - n.getLength() < 0)
            return l;
          for (var h = B.glog(l.getAt(0)) - B.glog(n.getAt(0)), t = new Array(l.getLength()), r = 0; r < l.getLength(); r += 1)
            t[r] = l.getAt(r);
          for (var r = 0; r < n.getLength(); r += 1)
            t[r] ^= B.gexp(B.glog(n.getAt(r)) + h);
          return K(t, 0).mod(n);
        }, l;
      }
      var W = (function() {
        var x = [
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
        ], c = function(n, h) {
          var t = {};
          return t.totalCount = n, t.dataCount = h, t;
        }, v = {}, l = function(n, h) {
          switch (h) {
            case D.L:
              return x[(n - 1) * 4 + 0];
            case D.M:
              return x[(n - 1) * 4 + 1];
            case D.Q:
              return x[(n - 1) * 4 + 2];
            case D.H:
              return x[(n - 1) * 4 + 3];
            default:
              return;
          }
        };
        return v.getRSBlocks = function(n, h) {
          var t = l(n, h);
          if (typeof t > "u")
            throw "bad rs block @ typeNumber:" + n + "/errorCorrectionLevel:" + h;
          for (var r = t.length / 3, g = [], u = 0; u < r; u += 1)
            for (var s = t[u * 3 + 0], y = t[u * 3 + 1], _ = t[u * 3 + 2], M = 0; M < s; M += 1)
              g.push(c(y, _));
          return g;
        }, v;
      })(), V = function() {
        var x = [], c = 0, v = {};
        return v.getBuffer = function() {
          return x;
        }, v.getAt = function(l) {
          var n = Math.floor(l / 8);
          return (x[n] >>> 7 - l % 8 & 1) == 1;
        }, v.put = function(l, n) {
          for (var h = 0; h < n; h += 1)
            v.putBit((l >>> n - h - 1 & 1) == 1);
        }, v.getLengthInBits = function() {
          return c;
        }, v.putBit = function(l) {
          var n = Math.floor(c / 8);
          x.length <= n && x.push(0), l && (x[n] |= 128 >>> c % 8), c += 1;
        }, v;
      }, nr = function(x) {
        var c = T.MODE_NUMBER, v = x, l = {};
        l.getMode = function() {
          return c;
        }, l.getLength = function(t) {
          return v.length;
        }, l.write = function(t) {
          for (var r = v, g = 0; g + 2 < r.length; )
            t.put(n(r.substring(g, g + 3)), 10), g += 3;
          g < r.length && (r.length - g == 1 ? t.put(n(r.substring(g, g + 1)), 4) : r.length - g == 2 && t.put(n(r.substring(g, g + 2)), 7));
        };
        var n = function(t) {
          for (var r = 0, g = 0; g < t.length; g += 1)
            r = r * 10 + h(t.charAt(g));
          return r;
        }, h = function(t) {
          if ("0" <= t && t <= "9")
            return t.charCodeAt(0) - 48;
          throw "illegal char :" + t;
        };
        return l;
      }, ar = function(x) {
        var c = T.MODE_ALPHA_NUM, v = x, l = {};
        l.getMode = function() {
          return c;
        }, l.getLength = function(h) {
          return v.length;
        }, l.write = function(h) {
          for (var t = v, r = 0; r + 1 < t.length; )
            h.put(
              n(t.charAt(r)) * 45 + n(t.charAt(r + 1)),
              11
            ), r += 2;
          r < t.length && h.put(n(t.charAt(r)), 6);
        };
        var n = function(h) {
          if ("0" <= h && h <= "9")
            return h.charCodeAt(0) - 48;
          if ("A" <= h && h <= "Z")
            return h.charCodeAt(0) - 65 + 10;
          switch (h) {
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
              throw "illegal char :" + h;
          }
        };
        return l;
      }, fr = function(x) {
        var c = T.MODE_8BIT_BYTE, v = C.stringToBytes(x), l = {};
        return l.getMode = function() {
          return c;
        }, l.getLength = function(n) {
          return v.length;
        }, l.write = function(n) {
          for (var h = 0; h < v.length; h += 1)
            n.put(v[h], 8);
        }, l;
      }, ir = function(x) {
        var c = T.MODE_KANJI, v = C.stringToBytesFuncs.SJIS;
        if (!v)
          throw "sjis not supported.";
        (function(h, t) {
          var r = v(h);
          if (r.length != 2 || (r[0] << 8 | r[1]) != t)
            throw "sjis not supported.";
        })("友", 38726);
        var l = v(x), n = {};
        return n.getMode = function() {
          return c;
        }, n.getLength = function(h) {
          return ~~(l.length / 2);
        }, n.write = function(h) {
          for (var t = l, r = 0; r + 1 < t.length; ) {
            var g = (255 & t[r]) << 8 | 255 & t[r + 1];
            if (33088 <= g && g <= 40956)
              g -= 33088;
            else if (57408 <= g && g <= 60351)
              g -= 49472;
            else
              throw "illegal char at " + (r + 1) + "/" + g;
            g = (g >>> 8 & 255) * 192 + (g & 255), h.put(g, 13), r += 2;
          }
          if (r < t.length)
            throw "illegal char at " + (r + 1);
        }, n;
      }, q = function() {
        var x = [], c = {};
        return c.writeByte = function(v) {
          x.push(v & 255);
        }, c.writeShort = function(v) {
          c.writeByte(v), c.writeByte(v >>> 8);
        }, c.writeBytes = function(v, l, n) {
          l = l || 0, n = n || v.length;
          for (var h = 0; h < n; h += 1)
            c.writeByte(v[h + l]);
        }, c.writeString = function(v) {
          for (var l = 0; l < v.length; l += 1)
            c.writeByte(v.charCodeAt(l));
        }, c.toByteArray = function() {
          return x;
        }, c.toString = function() {
          var v = "";
          v += "[";
          for (var l = 0; l < x.length; l += 1)
            l > 0 && (v += ","), v += x[l];
          return v += "]", v;
        }, c;
      }, or = function() {
        var x = 0, c = 0, v = 0, l = "", n = {}, h = function(r) {
          l += String.fromCharCode(t(r & 63));
        }, t = function(r) {
          if (!(r < 0)) {
            if (r < 26)
              return 65 + r;
            if (r < 52)
              return 97 + (r - 26);
            if (r < 62)
              return 48 + (r - 52);
            if (r == 62)
              return 43;
            if (r == 63)
              return 47;
          }
          throw "n:" + r;
        };
        return n.writeByte = function(r) {
          for (x = x << 8 | r & 255, c += 8, v += 1; c >= 6; )
            h(x >>> c - 6), c -= 6;
        }, n.flush = function() {
          if (c > 0 && (h(x << 6 - c), x = 0, c = 0), v % 3 != 0)
            for (var r = 3 - v % 3, g = 0; g < r; g += 1)
              l += "=";
        }, n.toString = function() {
          return l;
        }, n;
      }, ur = function(x) {
        var c = x, v = 0, l = 0, n = 0, h = {};
        h.read = function() {
          for (; n < 8; ) {
            if (v >= c.length) {
              if (n == 0)
                return -1;
              throw "unexpected end of file./" + n;
            }
            var r = c.charAt(v);
            if (v += 1, r == "=")
              return n = 0, -1;
            if (r.match(/^\s$/))
              continue;
            l = l << 6 | t(r.charCodeAt(0)), n += 6;
          }
          var g = l >>> n - 8 & 255;
          return n -= 8, g;
        };
        var t = function(r) {
          if (65 <= r && r <= 90)
            return r - 65;
          if (97 <= r && r <= 122)
            return r - 97 + 26;
          if (48 <= r && r <= 57)
            return r - 48 + 52;
          if (r == 43)
            return 62;
          if (r == 47)
            return 63;
          throw "c:" + r;
        };
        return h;
      }, vr = function(x, c) {
        var v = x, l = c, n = new Array(x * c), h = {};
        h.setPixel = function(u, s, y) {
          n[s * v + u] = y;
        }, h.write = function(u) {
          u.writeString("GIF87a"), u.writeShort(v), u.writeShort(l), u.writeByte(128), u.writeByte(0), u.writeByte(0), u.writeByte(0), u.writeByte(0), u.writeByte(0), u.writeByte(255), u.writeByte(255), u.writeByte(255), u.writeString(","), u.writeShort(0), u.writeShort(0), u.writeShort(v), u.writeShort(l), u.writeByte(0);
          var s = 2, y = r(s);
          u.writeByte(s);
          for (var _ = 0; y.length - _ > 255; )
            u.writeByte(255), u.writeBytes(y, _, 255), _ += 255;
          u.writeByte(y.length - _), u.writeBytes(y, _, y.length - _), u.writeByte(0), u.writeString(";");
        };
        var t = function(u) {
          var s = u, y = 0, _ = 0, M = {};
          return M.write = function(L, I) {
            if (L >>> I)
              throw "length over";
            for (; y + I >= 8; )
              s.writeByte(255 & (L << y | _)), I -= 8 - y, L >>>= 8 - y, _ = 0, y = 0;
            _ = L << y | _, y = y + I;
          }, M.flush = function() {
            y > 0 && s.writeByte(_);
          }, M;
        }, r = function(u) {
          for (var s = 1 << u, y = (1 << u) + 1, _ = u + 1, M = g(), L = 0; L < s; L += 1)
            M.add(String.fromCharCode(L));
          M.add(String.fromCharCode(s)), M.add(String.fromCharCode(y));
          var I = q(), m = t(I);
          m.write(s, _);
          var F = 0, H = String.fromCharCode(n[F]);
          for (F += 1; F < n.length; ) {
            var G = String.fromCharCode(n[F]);
            F += 1, M.contains(H + G) ? H = H + G : (m.write(M.indexOf(H), _), M.size() < 4095 && (M.size() == 1 << _ && (_ += 1), M.add(H + G)), H = G);
          }
          return m.write(M.indexOf(H), _), m.write(y, _), m.flush(), I.toByteArray();
        }, g = function() {
          var u = {}, s = 0, y = {};
          return y.add = function(_) {
            if (y.contains(_))
              throw "dup key:" + _;
            u[_] = s, s += 1;
          }, y.size = function() {
            return s;
          }, y.indexOf = function(_) {
            return u[_];
          }, y.contains = function(_) {
            return typeof u[_] < "u";
          }, y;
        };
        return h;
      }, sr = function(x, c, v) {
        for (var l = vr(x, c), n = 0; n < c; n += 1)
          for (var h = 0; h < x; h += 1)
            l.setPixel(h, n, v(h, n));
        var t = q();
        l.write(t);
        for (var r = or(), g = t.toByteArray(), u = 0; u < g.length; u += 1)
          r.writeByte(g[u]);
        return r.flush(), "data:image/gif;base64," + r;
      };
      return C;
    })();
    (function() {
      U.stringToBytesFuncs["UTF-8"] = function(C) {
        function T(D) {
          for (var E = [], k = 0; k < D.length; k++) {
            var B = D.charCodeAt(k);
            B < 128 ? E.push(B) : B < 2048 ? E.push(
              192 | B >> 6,
              128 | B & 63
            ) : B < 55296 || B >= 57344 ? E.push(
              224 | B >> 12,
              128 | B >> 6 & 63,
              128 | B & 63
            ) : (k++, B = 65536 + ((B & 1023) << 10 | D.charCodeAt(k) & 1023), E.push(
              240 | B >> 18,
              128 | B >> 12 & 63,
              128 | B >> 6 & 63,
              128 | B & 63
            ));
          }
          return E;
        }
        return T(C);
      };
    })(), (function(C) {
      O.exports = C();
    })(function() {
      return U;
    });
  })(j)), j.exports;
}
var xr = dr();
const cr = /* @__PURE__ */ lr(xr), Q = 4, wr = 0.42, X = "#14101f", pr = "#ffffff";
function Ar(O, $, U) {
  const C = (D) => D < 7, T = (D) => D >= U - 7;
  return C(O) && C($) || C(O) && T($) || T(O) && C($);
}
function Z(O, $) {
  return `<rect x="${O + 0.5}" y="${$ + 0.5}" width="6" height="6" rx="2.1" fill="none" stroke="${X}" stroke-width="1"/><rect x="${O + 2}" y="${$ + 2}" width="3" height="3" rx="1.1" fill="${X}"/>`;
}
function _r(O, $ = "QR code") {
  const U = cr(0, "M");
  U.addData(O), U.make();
  const C = U.getModuleCount(), T = C + Q * 2, D = [];
  D.push(`<rect x="0" y="0" width="${T}" height="${T}" rx="3" fill="${pr}"/>`), D.push(Z(Q, Q)), D.push(Z(Q + C - 7, Q)), D.push(Z(Q, Q + C - 7));
  for (let E = 0; E < C; E++)
    for (let k = 0; k < C; k++) {
      if (Ar(E, k, C) || !U.isDark(E, k)) continue;
      const B = Q + k + 0.5, K = Q + E + 0.5;
      D.push(`<circle cx="${B}" cy="${K}" r="${wr}" fill="${X}"/>`);
    }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${T} ${T}" role="img" aria-label="${$}" shape-rendering="geometricPrecision">${D.join("")}</svg>`;
}
export {
  _r as r,
  cr as s
};
