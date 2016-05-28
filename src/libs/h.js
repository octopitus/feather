export default function h(s, f, t, e, c, r, m, l, p) {
  t = '';
  p = [];
  e = function(t) {
    return (t.replace(/[<&]/g, function(c) {
      return '&#' + c.charCodeAt() + ';'
    }))
  };
  c = function(_) {
    return (_ = s.replace(/^(\s*)(\/(\/.*|\*([^]*?\*\/|[^]*)))/, function(_, w, m) {
      t += w + '<span\x20class=c>' + e(m).replace(/\100\w+/g, function(d) {
        return '<span\x20class=d>' + d + '</span>'
      }) + '</span>';
      return '';
    })) === s ? (s = _) : c(s = _)
  };
  (r = function(_) {
    return (s = c(s).replace(/^(\s*)(\/[^*]((\[(\\.|.)*?\]|\\.|.)+?\/[imguy]*|.*))/, function(_, w, m) {
      t += w + '<span\x20class=r>' + m + '</span>';
      return '';
    }))
  })();
  while ((m = /^([^]*?)(\b(break|catch|class|con(?:st|tinue)|default|do|else|finally|for|from|function|if|import|let|static|super|switch|this|try|var|while|with|(case|delete|export|extends|in(?:stanceof)?|new|of|return|throw|typeof|void|yield))\b|(\b(?:0[xX][a-fA-F\d]+|true|false|null|undefined|NaN|Infinity)\b|(?:\.\d+|\b(?:0[oObB])?\d+(?:\.\d*)?)(?:[eE][-+]?\d+)?)|((\x22|')(?:(?:\\[^]|.)*?\7|.*))|([.][.][.]|[(\[{;,?:]|=>)|([.)\]}])|(--|[+][+]|&&|[|][|]|(?:<<|>>>?|[-+\/*%&|^<>])=?|~|[!=]=?=?)|([$\w]+(?=\s*[(`]))|(`)|(.(?=\/[*\/])))/.exec(c(s))) && (m[10 - 1] != '}' || f != 1)) s = s.slice(m[0].length), m[12] ? !(function(n) {
    t += e(m[1]) + '<span\x20class=s>`';
    while ((n = /^([^]*?)(\\.|(`)|(\${))/.exec(s)) && !n[1 + 2]) s = s.slice(n[0].length), t += e(n[1]) + (n[2 + 2] ? '<span\x20class=p>\${</span><span\x20class=i>' + (l = h(s, 1), typeof(l) > 'r' ? (s = '', l + '</span>') : (s = l[1], l[0] + '</span><span\x20class=p>}</span>')) : e(n[2]));
    t += (n ? e(n[0], s = s.slice(n[0].length)) : e(s, s = '')) + '</span>'
  })() : (t += e(m[1]) + (m[12 + 1] || m[1 + 2] && (p[2] === '.' && /^\s*$/.test(m[1]) && (/^\s*[(`]/.test(s, m[1 + 2] = m[2 + 2] = '') ? !(m[11] = m[2]) : 1) || /^\s*:/.test(s)) ? e(m[2]) : '<span\x20class=' + '___k_vs_ppof' [m.indexOf(m[2], 2 + 1)] + '>' + e(m[2]) + '</span>'), p = m), (f && (m[10 - 1] === '}' && f-- || m[7 + 1] === '{' && f++)), (m[2 + 2] || m[7 + 1] || m[10]) && r();
  return (m ? [t + e(m[1]), s.slice(m[0].length)] : t + e(s))
}
