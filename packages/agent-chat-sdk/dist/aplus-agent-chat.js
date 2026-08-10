/**
* @vue/shared v3.5.22
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
// @__NO_SIDE_EFFECTS__
function an(e) {
  const t = /* @__PURE__ */ Object.create(null);
  for (const n of e.split(",")) t[n] = 1;
  return (n) => n in t;
}
const ge = process.env.NODE_ENV !== "production" ? Object.freeze({}) : {}, Qn = process.env.NODE_ENV !== "production" ? Object.freeze([]) : [], Le = () => {
}, Pc = () => !1, Gr = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // uppercase letter
(e.charCodeAt(2) > 122 || e.charCodeAt(2) < 97), Ou = (e) => e.startsWith("onUpdate:"), Re = Object.assign, Ts = (e, t) => {
  const n = e.indexOf(t);
  n > -1 && e.splice(n, 1);
}, i0 = Object.prototype.hasOwnProperty, ae = (e, t) => i0.call(e, t), Q = Array.isArray, Mn = (e) => uo(e) === "[object Map]", Rc = (e) => uo(e) === "[object Set]", te = (e) => typeof e == "function", Ie = (e) => typeof e == "string", kn = (e) => typeof e == "symbol", pe = (e) => e !== null && typeof e == "object", Fs = (e) => (pe(e) || te(e)) && te(e.then) && te(e.catch), jc = Object.prototype.toString, uo = (e) => jc.call(e), zs = (e) => uo(e).slice(8, -1), Lc = (e) => uo(e) === "[object Object]", Ms = (e) => Ie(e) && e !== "NaN" && e[0] !== "-" && "" + parseInt(e, 10) === e, Sr = /* @__PURE__ */ an(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
), a0 = /* @__PURE__ */ an(
  "bind,cloak,else-if,else,for,html,if,model,on,once,pre,show,slot,text,memo"
), oo = (e) => {
  const t = /* @__PURE__ */ Object.create(null);
  return ((n) => t[n] || (t[n] = e(n)));
}, c0 = /-\w/g, Ct = oo(
  (e) => e.replace(c0, (t) => t.slice(1).toUpperCase())
), l0 = /\B([A-Z])/g, _n = oo(
  (e) => e.replace(l0, "-$1").toLowerCase()
), so = oo((e) => e.charAt(0).toUpperCase() + e.slice(1)), Tn = oo(
  (e) => e ? `on${so(e)}` : ""
), gn = (e, t) => !Object.is(e, t), yr = (e, ...t) => {
  for (let n = 0; n < e.length; n++)
    e[n](...t);
}, Iu = (e, t, n, r = !1) => {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    writable: r,
    value: n
  });
}, f0 = (e) => {
  const t = parseFloat(e);
  return isNaN(t) ? e : t;
};
let Ai;
const Kr = () => Ai || (Ai = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {});
function Ps(e) {
  if (Q(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++) {
      const r = e[n], u = Ie(r) ? m0(r) : Ps(r);
      if (u)
        for (const o in u)
          t[o] = u[o];
    }
    return t;
  } else if (Ie(e) || pe(e))
    return e;
}
const d0 = /;(?![^(]*\))/g, p0 = /:([^]+)/, h0 = /\/\*[^]*?\*\//g;
function m0(e) {
  const t = {};
  return e.replace(h0, "").split(d0).forEach((n) => {
    if (n) {
      const r = n.split(p0);
      r.length > 1 && (t[r[0].trim()] = r[1].trim());
    }
  }), t;
}
function fr(e) {
  let t = "";
  if (Ie(e))
    t = e;
  else if (Q(e))
    for (let n = 0; n < e.length; n++) {
      const r = fr(e[n]);
      r && (t += r + " ");
    }
  else if (pe(e))
    for (const n in e)
      e[n] && (t += n + " ");
  return t.trim();
}
const g0 = "html,body,base,head,link,meta,style,title,address,article,aside,footer,header,hgroup,h1,h2,h3,h4,h5,h6,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,summary,template,blockquote,iframe,tfoot", b0 = "svg,animate,animateMotion,animateTransform,circle,clipPath,color-profile,defs,desc,discard,ellipse,feBlend,feColorMatrix,feComponentTransfer,feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,feDistantLight,feDropShadow,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,filter,foreignObject,g,hatch,hatchpath,image,line,linearGradient,marker,mask,mesh,meshgradient,meshpatch,meshrow,metadata,mpath,path,pattern,polygon,polyline,radialGradient,rect,set,solidcolor,stop,switch,symbol,text,textPath,title,tspan,unknown,use,view", v0 = "annotation,annotation-xml,maction,maligngroup,malignmark,math,menclose,merror,mfenced,mfrac,mfraction,mglyph,mi,mlabeledtr,mlongdiv,mmultiscripts,mn,mo,mover,mpadded,mphantom,mprescripts,mroot,mrow,ms,mscarries,mscarry,msgroup,msline,mspace,msqrt,msrow,mstack,mstyle,msub,msubsup,msup,mtable,mtd,mtext,mtr,munder,munderover,none,semantics", _0 = /* @__PURE__ */ an(g0), y0 = /* @__PURE__ */ an(b0), x0 = /* @__PURE__ */ an(v0), E0 = "itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly", k0 = /* @__PURE__ */ an(E0);
function Zc(e) {
  return !!e || e === "";
}
const Vc = (e) => !!(e && e.__v_isRef === !0), it = (e) => Ie(e) ? e : e == null ? "" : Q(e) || pe(e) && (e.toString === jc || !te(e.toString)) ? Vc(e) ? it(e.value) : JSON.stringify(e, Bc, 2) : String(e), Bc = (e, t) => Vc(t) ? Bc(e, t.value) : Mn(t) ? {
  [`Map(${t.size})`]: [...t.entries()].reduce(
    (n, [r, u], o) => (n[Co(r, o) + " =>"] = u, n),
    {}
  )
} : Rc(t) ? {
  [`Set(${t.size})`]: [...t.values()].map((n) => Co(n))
} : kn(t) ? Co(t) : pe(t) && !Q(t) && !Lc(t) ? String(t) : t, Co = (e, t = "") => {
  var n;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    kn(e) ? `Symbol(${(n = e.description) != null ? n : t})` : e
  );
};
/**
* @vue/reactivity v3.5.22
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function St(e, ...t) {
  console.warn(`[Vue warn] ${e}`, ...t);
}
let st;
class w0 {
  constructor(t = !1) {
    this.detached = t, this._active = !0, this._on = 0, this.effects = [], this.cleanups = [], this._isPaused = !1, this.parent = st, !t && st && (this.index = (st.scopes || (st.scopes = [])).push(
      this
    ) - 1);
  }
  get active() {
    return this._active;
  }
  pause() {
    if (this._active) {
      this._isPaused = !0;
      let t, n;
      if (this.scopes)
        for (t = 0, n = this.scopes.length; t < n; t++)
          this.scopes[t].pause();
      for (t = 0, n = this.effects.length; t < n; t++)
        this.effects[t].pause();
    }
  }
  /**
   * Resumes the effect scope, including all child scopes and effects.
   */
  resume() {
    if (this._active && this._isPaused) {
      this._isPaused = !1;
      let t, n;
      if (this.scopes)
        for (t = 0, n = this.scopes.length; t < n; t++)
          this.scopes[t].resume();
      for (t = 0, n = this.effects.length; t < n; t++)
        this.effects[t].resume();
    }
  }
  run(t) {
    if (this._active) {
      const n = st;
      try {
        return st = this, t();
      } finally {
        st = n;
      }
    } else process.env.NODE_ENV !== "production" && St("cannot run an inactive effect scope.");
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    ++this._on === 1 && (this.prevScope = st, st = this);
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    this._on > 0 && --this._on === 0 && (st = this.prevScope, this.prevScope = void 0);
  }
  stop(t) {
    if (this._active) {
      this._active = !1;
      let n, r;
      for (n = 0, r = this.effects.length; n < r; n++)
        this.effects[n].stop();
      for (this.effects.length = 0, n = 0, r = this.cleanups.length; n < r; n++)
        this.cleanups[n]();
      if (this.cleanups.length = 0, this.scopes) {
        for (n = 0, r = this.scopes.length; n < r; n++)
          this.scopes[n].stop(!0);
        this.scopes.length = 0;
      }
      if (!this.detached && this.parent && !t) {
        const u = this.parent.scopes.pop();
        u && u !== this && (this.parent.scopes[this.index] = u, u.index = this.index);
      }
      this.parent = void 0;
    }
  }
}
function C0() {
  return st;
}
let he;
const Ao = /* @__PURE__ */ new WeakSet();
class Uc {
  constructor(t) {
    this.fn = t, this.deps = void 0, this.depsTail = void 0, this.flags = 5, this.next = void 0, this.cleanup = void 0, this.scheduler = void 0, st && st.active && st.effects.push(this);
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    this.flags & 64 && (this.flags &= -65, Ao.has(this) && (Ao.delete(this), this.trigger()));
  }
  /**
   * @internal
   */
  notify() {
    this.flags & 2 && !(this.flags & 32) || this.flags & 8 || qc(this);
  }
  run() {
    if (!(this.flags & 1))
      return this.fn();
    this.flags |= 2, Di(this), Jc(this);
    const t = he, n = At;
    he = this, At = !0;
    try {
      return this.fn();
    } finally {
      process.env.NODE_ENV !== "production" && he !== this && St(
        "Active effect was not restored correctly - this is likely a Vue internal bug."
      ), Wc(this), he = t, At = n, this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let t = this.deps; t; t = t.nextDep)
        Ls(t);
      this.deps = this.depsTail = void 0, Di(this), this.onStop && this.onStop(), this.flags &= -2;
    }
  }
  trigger() {
    this.flags & 64 ? Ao.add(this) : this.scheduler ? this.scheduler() : this.runIfDirty();
  }
  /**
   * @internal
   */
  runIfDirty() {
    rs(this) && this.run();
  }
  get dirty() {
    return rs(this);
  }
}
let Hc = 0, $r, Nr;
function qc(e, t = !1) {
  if (e.flags |= 8, t) {
    e.next = Nr, Nr = e;
    return;
  }
  e.next = $r, $r = e;
}
function Rs() {
  Hc++;
}
function js() {
  if (--Hc > 0)
    return;
  if (Nr) {
    let t = Nr;
    for (Nr = void 0; t; ) {
      const n = t.next;
      t.next = void 0, t.flags &= -9, t = n;
    }
  }
  let e;
  for (; $r; ) {
    let t = $r;
    for ($r = void 0; t; ) {
      const n = t.next;
      if (t.next = void 0, t.flags &= -9, t.flags & 1)
        try {
          t.trigger();
        } catch (r) {
          e || (e = r);
        }
      t = n;
    }
  }
  if (e) throw e;
}
function Jc(e) {
  for (let t = e.deps; t; t = t.nextDep)
    t.version = -1, t.prevActiveLink = t.dep.activeLink, t.dep.activeLink = t;
}
function Wc(e) {
  let t, n = e.depsTail, r = n;
  for (; r; ) {
    const u = r.prevDep;
    r.version === -1 ? (r === n && (n = u), Ls(r), A0(r)) : t = r, r.dep.activeLink = r.prevActiveLink, r.prevActiveLink = void 0, r = u;
  }
  e.deps = t, e.depsTail = n;
}
function rs(e) {
  for (let t = e.deps; t; t = t.nextDep)
    if (t.dep.version !== t.version || t.dep.computed && (Gc(t.dep.computed) || t.dep.version !== t.version))
      return !0;
  return !!e._dirty;
}
function Gc(e) {
  if (e.flags & 4 && !(e.flags & 16) || (e.flags &= -17, e.globalVersion === Fr) || (e.globalVersion = Fr, !e.isSSR && e.flags & 128 && (!e.deps && !e._dirty || !rs(e))))
    return;
  e.flags |= 2;
  const t = e.dep, n = he, r = At;
  he = e, At = !0;
  try {
    Jc(e);
    const u = e.fn(e._value);
    (t.version === 0 || gn(u, e._value)) && (e.flags |= 128, e._value = u, t.version++);
  } catch (u) {
    throw t.version++, u;
  } finally {
    he = n, At = r, Wc(e), e.flags &= -3;
  }
}
function Ls(e, t = !1) {
  const { dep: n, prevSub: r, nextSub: u } = e;
  if (r && (r.nextSub = u, e.prevSub = void 0), u && (u.prevSub = r, e.nextSub = void 0), process.env.NODE_ENV !== "production" && n.subsHead === e && (n.subsHead = u), n.subs === e && (n.subs = r, !r && n.computed)) {
    n.computed.flags &= -5;
    for (let o = n.computed.deps; o; o = o.nextDep)
      Ls(o, !0);
  }
  !t && !--n.sc && n.map && n.map.delete(n.key);
}
function A0(e) {
  const { prevDep: t, nextDep: n } = e;
  t && (t.nextDep = n, e.prevDep = void 0), n && (n.prevDep = t, e.nextDep = void 0);
}
let At = !0;
const Kc = [];
function $t() {
  Kc.push(At), At = !1;
}
function Nt() {
  const e = Kc.pop();
  At = e === void 0 ? !0 : e;
}
function Di(e) {
  const { cleanup: t } = e;
  if (e.cleanup = void 0, t) {
    const n = he;
    he = void 0;
    try {
      t();
    } finally {
      he = n;
    }
  }
}
let Fr = 0;
class D0 {
  constructor(t, n) {
    this.sub = t, this.dep = n, this.version = n.version, this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Zs {
  // TODO isolatedDeclarations "__v_skip"
  constructor(t) {
    this.computed = t, this.version = 0, this.activeLink = void 0, this.subs = void 0, this.map = void 0, this.key = void 0, this.sc = 0, this.__v_skip = !0, process.env.NODE_ENV !== "production" && (this.subsHead = void 0);
  }
  track(t) {
    if (!he || !At || he === this.computed)
      return;
    let n = this.activeLink;
    if (n === void 0 || n.sub !== he)
      n = this.activeLink = new D0(he, this), he.deps ? (n.prevDep = he.depsTail, he.depsTail.nextDep = n, he.depsTail = n) : he.deps = he.depsTail = n, Yc(n);
    else if (n.version === -1 && (n.version = this.version, n.nextDep)) {
      const r = n.nextDep;
      r.prevDep = n.prevDep, n.prevDep && (n.prevDep.nextDep = r), n.prevDep = he.depsTail, n.nextDep = void 0, he.depsTail.nextDep = n, he.depsTail = n, he.deps === n && (he.deps = r);
    }
    return process.env.NODE_ENV !== "production" && he.onTrack && he.onTrack(
      Re(
        {
          effect: he
        },
        t
      )
    ), n;
  }
  trigger(t) {
    this.version++, Fr++, this.notify(t);
  }
  notify(t) {
    Rs();
    try {
      if (process.env.NODE_ENV !== "production")
        for (let n = this.subsHead; n; n = n.nextSub)
          n.sub.onTrigger && !(n.sub.flags & 8) && n.sub.onTrigger(
            Re(
              {
                effect: n.sub
              },
              t
            )
          );
      for (let n = this.subs; n; n = n.prevSub)
        n.sub.notify() && n.sub.dep.notify();
    } finally {
      js();
    }
  }
}
function Yc(e) {
  if (e.dep.sc++, e.sub.flags & 4) {
    const t = e.dep.computed;
    if (t && !e.dep.subs) {
      t.flags |= 20;
      for (let r = t.deps; r; r = r.nextDep)
        Yc(r);
    }
    const n = e.dep.subs;
    n !== e && (e.prevSub = n, n && (n.nextSub = e)), process.env.NODE_ENV !== "production" && e.dep.subsHead === void 0 && (e.dep.subsHead = e), e.dep.subs = e;
  }
}
const Tu = /* @__PURE__ */ new WeakMap(), Pn = Symbol(
  process.env.NODE_ENV !== "production" ? "Object iterate" : ""
), us = Symbol(
  process.env.NODE_ENV !== "production" ? "Map keys iterate" : ""
), zr = Symbol(
  process.env.NODE_ENV !== "production" ? "Array iterate" : ""
);
function je(e, t, n) {
  if (At && he) {
    let r = Tu.get(e);
    r || Tu.set(e, r = /* @__PURE__ */ new Map());
    let u = r.get(n);
    u || (r.set(n, u = new Zs()), u.map = r, u.key = n), process.env.NODE_ENV !== "production" ? u.track({
      target: e,
      type: t,
      key: n
    }) : u.track();
  }
}
function Lt(e, t, n, r, u, o) {
  const s = Tu.get(e);
  if (!s) {
    Fr++;
    return;
  }
  const i = (a) => {
    a && (process.env.NODE_ENV !== "production" ? a.trigger({
      target: e,
      type: t,
      key: n,
      newValue: r,
      oldValue: u,
      oldTarget: o
    }) : a.trigger());
  };
  if (Rs(), t === "clear")
    s.forEach(i);
  else {
    const a = Q(e), c = a && Ms(n);
    if (a && n === "length") {
      const f = Number(r);
      s.forEach((l, d) => {
        (d === "length" || d === zr || !kn(d) && d >= f) && i(l);
      });
    } else
      switch ((n !== void 0 || s.has(void 0)) && i(s.get(n)), c && i(s.get(zr)), t) {
        case "add":
          a ? c && i(s.get("length")) : (i(s.get(Pn)), Mn(e) && i(s.get(us)));
          break;
        case "delete":
          a || (i(s.get(Pn)), Mn(e) && i(s.get(us)));
          break;
        case "set":
          Mn(e) && i(s.get(Pn));
          break;
      }
  }
  js();
}
function S0(e, t) {
  const n = Tu.get(e);
  return n && n.get(t);
}
function Un(e) {
  const t = oe(e);
  return t === e ? t : (je(t, "iterate", zr), nt(e) ? t : t.map(He));
}
function io(e) {
  return je(e = oe(e), "iterate", zr), e;
}
const $0 = {
  __proto__: null,
  [Symbol.iterator]() {
    return Do(this, Symbol.iterator, He);
  },
  concat(...e) {
    return Un(this).concat(
      ...e.map((t) => Q(t) ? Un(t) : t)
    );
  },
  entries() {
    return Do(this, "entries", (e) => (e[1] = He(e[1]), e));
  },
  every(e, t) {
    return Qt(this, "every", e, t, void 0, arguments);
  },
  filter(e, t) {
    return Qt(this, "filter", e, t, (n) => n.map(He), arguments);
  },
  find(e, t) {
    return Qt(this, "find", e, t, He, arguments);
  },
  findIndex(e, t) {
    return Qt(this, "findIndex", e, t, void 0, arguments);
  },
  findLast(e, t) {
    return Qt(this, "findLast", e, t, He, arguments);
  },
  findLastIndex(e, t) {
    return Qt(this, "findLastIndex", e, t, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(e, t) {
    return Qt(this, "forEach", e, t, void 0, arguments);
  },
  includes(...e) {
    return So(this, "includes", e);
  },
  indexOf(...e) {
    return So(this, "indexOf", e);
  },
  join(e) {
    return Un(this).join(e);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...e) {
    return So(this, "lastIndexOf", e);
  },
  map(e, t) {
    return Qt(this, "map", e, t, void 0, arguments);
  },
  pop() {
    return xr(this, "pop");
  },
  push(...e) {
    return xr(this, "push", e);
  },
  reduce(e, ...t) {
    return Si(this, "reduce", e, t);
  },
  reduceRight(e, ...t) {
    return Si(this, "reduceRight", e, t);
  },
  shift() {
    return xr(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(e, t) {
    return Qt(this, "some", e, t, void 0, arguments);
  },
  splice(...e) {
    return xr(this, "splice", e);
  },
  toReversed() {
    return Un(this).toReversed();
  },
  toSorted(e) {
    return Un(this).toSorted(e);
  },
  toSpliced(...e) {
    return Un(this).toSpliced(...e);
  },
  unshift(...e) {
    return xr(this, "unshift", e);
  },
  values() {
    return Do(this, "values", He);
  }
};
function Do(e, t, n) {
  const r = io(e), u = r[t]();
  return r !== e && !nt(e) && (u._next = u.next, u.next = () => {
    const o = u._next();
    return o.done || (o.value = n(o.value)), o;
  }), u;
}
const N0 = Array.prototype;
function Qt(e, t, n, r, u, o) {
  const s = io(e), i = s !== e && !nt(e), a = s[t];
  if (a !== N0[t]) {
    const l = a.apply(e, o);
    return i ? He(l) : l;
  }
  let c = n;
  s !== e && (i ? c = function(l, d) {
    return n.call(this, He(l), d, e);
  } : n.length > 2 && (c = function(l, d) {
    return n.call(this, l, d, e);
  }));
  const f = a.call(s, c, r);
  return i && u ? u(f) : f;
}
function Si(e, t, n, r) {
  const u = io(e);
  let o = n;
  return u !== e && (nt(e) ? n.length > 3 && (o = function(s, i, a) {
    return n.call(this, s, i, a, e);
  }) : o = function(s, i, a) {
    return n.call(this, s, He(i), a, e);
  }), u[t](o, ...r);
}
function So(e, t, n) {
  const r = oe(e);
  je(r, "iterate", zr);
  const u = r[t](...n);
  return (u === -1 || u === !1) && Fu(n[0]) ? (n[0] = oe(n[0]), r[t](...n)) : u;
}
function xr(e, t, n = []) {
  $t(), Rs();
  const r = oe(e)[t].apply(e, n);
  return js(), Nt(), r;
}
const O0 = /* @__PURE__ */ an("__proto__,__v_isRef,__isVue"), Xc = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((e) => e !== "arguments" && e !== "caller").map((e) => Symbol[e]).filter(kn)
);
function I0(e) {
  kn(e) || (e = String(e));
  const t = oe(this);
  return je(t, "has", e), t.hasOwnProperty(e);
}
class Qc {
  constructor(t = !1, n = !1) {
    this._isReadonly = t, this._isShallow = n;
  }
  get(t, n, r) {
    if (n === "__v_skip") return t.__v_skip;
    const u = this._isReadonly, o = this._isShallow;
    if (n === "__v_isReactive")
      return !u;
    if (n === "__v_isReadonly")
      return u;
    if (n === "__v_isShallow")
      return o;
    if (n === "__v_raw")
      return r === (u ? o ? ol : ul : o ? rl : nl).get(t) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(t) === Object.getPrototypeOf(r) ? t : void 0;
    const s = Q(t);
    if (!u) {
      let a;
      if (s && (a = $0[n]))
        return a;
      if (n === "hasOwnProperty")
        return I0;
    }
    const i = Reflect.get(
      t,
      n,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      Oe(t) ? t : r
    );
    if ((kn(n) ? Xc.has(n) : O0(n)) || (u || je(t, "get", n), o))
      return i;
    if (Oe(i)) {
      const a = s && Ms(n) ? i : i.value;
      return u && pe(a) ? ss(a) : a;
    }
    return pe(i) ? u ? ss(i) : Vs(i) : i;
  }
}
class el extends Qc {
  constructor(t = !1) {
    super(!1, t);
  }
  set(t, n, r, u) {
    let o = t[n];
    if (!this._isShallow) {
      const a = qt(o);
      if (!nt(r) && !qt(r) && (o = oe(o), r = oe(r)), !Q(t) && Oe(o) && !Oe(r))
        return a ? (process.env.NODE_ENV !== "production" && St(
          `Set operation on key "${String(n)}" failed: target is readonly.`,
          t[n]
        ), !0) : (o.value = r, !0);
    }
    const s = Q(t) && Ms(n) ? Number(n) < t.length : ae(t, n), i = Reflect.set(
      t,
      n,
      r,
      Oe(t) ? t : u
    );
    return t === oe(u) && (s ? gn(r, o) && Lt(t, "set", n, r, o) : Lt(t, "add", n, r)), i;
  }
  deleteProperty(t, n) {
    const r = ae(t, n), u = t[n], o = Reflect.deleteProperty(t, n);
    return o && r && Lt(t, "delete", n, void 0, u), o;
  }
  has(t, n) {
    const r = Reflect.has(t, n);
    return (!kn(n) || !Xc.has(n)) && je(t, "has", n), r;
  }
  ownKeys(t) {
    return je(
      t,
      "iterate",
      Q(t) ? "length" : Pn
    ), Reflect.ownKeys(t);
  }
}
class tl extends Qc {
  constructor(t = !1) {
    super(!0, t);
  }
  set(t, n) {
    return process.env.NODE_ENV !== "production" && St(
      `Set operation on key "${String(n)}" failed: target is readonly.`,
      t
    ), !0;
  }
  deleteProperty(t, n) {
    return process.env.NODE_ENV !== "production" && St(
      `Delete operation on key "${String(n)}" failed: target is readonly.`,
      t
    ), !0;
  }
}
const T0 = /* @__PURE__ */ new el(), F0 = /* @__PURE__ */ new tl(), z0 = /* @__PURE__ */ new el(!0), M0 = /* @__PURE__ */ new tl(!0), os = (e) => e, fu = (e) => Reflect.getPrototypeOf(e);
function P0(e, t, n) {
  return function(...r) {
    const u = this.__v_raw, o = oe(u), s = Mn(o), i = e === "entries" || e === Symbol.iterator && s, a = e === "keys" && s, c = u[e](...r), f = n ? os : t ? zu : He;
    return !t && je(
      o,
      "iterate",
      a ? us : Pn
    ), {
      // iterator protocol
      next() {
        const { value: l, done: d } = c.next();
        return d ? { value: l, done: d } : {
          value: i ? [f(l[0]), f(l[1])] : f(l),
          done: d
        };
      },
      // iterable protocol
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function du(e) {
  return function(...t) {
    if (process.env.NODE_ENV !== "production") {
      const n = t[0] ? `on key "${t[0]}" ` : "";
      St(
        `${so(e)} operation ${n}failed: target is readonly.`,
        oe(this)
      );
    }
    return e === "delete" ? !1 : e === "clear" ? void 0 : this;
  };
}
function R0(e, t) {
  const n = {
    get(u) {
      const o = this.__v_raw, s = oe(o), i = oe(u);
      e || (gn(u, i) && je(s, "get", u), je(s, "get", i));
      const { has: a } = fu(s), c = t ? os : e ? zu : He;
      if (a.call(s, u))
        return c(o.get(u));
      if (a.call(s, i))
        return c(o.get(i));
      o !== s && o.get(u);
    },
    get size() {
      const u = this.__v_raw;
      return !e && je(oe(u), "iterate", Pn), u.size;
    },
    has(u) {
      const o = this.__v_raw, s = oe(o), i = oe(u);
      return e || (gn(u, i) && je(s, "has", u), je(s, "has", i)), u === i ? o.has(u) : o.has(u) || o.has(i);
    },
    forEach(u, o) {
      const s = this, i = s.__v_raw, a = oe(i), c = t ? os : e ? zu : He;
      return !e && je(a, "iterate", Pn), i.forEach((f, l) => u.call(o, c(f), c(l), s));
    }
  };
  return Re(
    n,
    e ? {
      add: du("add"),
      set: du("set"),
      delete: du("delete"),
      clear: du("clear")
    } : {
      add(u) {
        !t && !nt(u) && !qt(u) && (u = oe(u));
        const o = oe(this);
        return fu(o).has.call(o, u) || (o.add(u), Lt(o, "add", u, u)), this;
      },
      set(u, o) {
        !t && !nt(o) && !qt(o) && (o = oe(o));
        const s = oe(this), { has: i, get: a } = fu(s);
        let c = i.call(s, u);
        c ? process.env.NODE_ENV !== "production" && $i(s, i, u) : (u = oe(u), c = i.call(s, u));
        const f = a.call(s, u);
        return s.set(u, o), c ? gn(o, f) && Lt(s, "set", u, o, f) : Lt(s, "add", u, o), this;
      },
      delete(u) {
        const o = oe(this), { has: s, get: i } = fu(o);
        let a = s.call(o, u);
        a ? process.env.NODE_ENV !== "production" && $i(o, s, u) : (u = oe(u), a = s.call(o, u));
        const c = i ? i.call(o, u) : void 0, f = o.delete(u);
        return a && Lt(o, "delete", u, void 0, c), f;
      },
      clear() {
        const u = oe(this), o = u.size !== 0, s = process.env.NODE_ENV !== "production" ? Mn(u) ? new Map(u) : new Set(u) : void 0, i = u.clear();
        return o && Lt(
          u,
          "clear",
          void 0,
          void 0,
          s
        ), i;
      }
    }
  ), [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ].forEach((u) => {
    n[u] = P0(u, e, t);
  }), n;
}
function ao(e, t) {
  const n = R0(e, t);
  return (r, u, o) => u === "__v_isReactive" ? !e : u === "__v_isReadonly" ? e : u === "__v_raw" ? r : Reflect.get(
    ae(n, u) && u in r ? n : r,
    u,
    o
  );
}
const j0 = {
  get: /* @__PURE__ */ ao(!1, !1)
}, L0 = {
  get: /* @__PURE__ */ ao(!1, !0)
}, Z0 = {
  get: /* @__PURE__ */ ao(!0, !1)
}, V0 = {
  get: /* @__PURE__ */ ao(!0, !0)
};
function $i(e, t, n) {
  const r = oe(n);
  if (r !== n && t.call(e, r)) {
    const u = zs(e);
    St(
      `Reactive ${u} contains both the raw and reactive versions of the same object${u === "Map" ? " as keys" : ""}, which can lead to inconsistencies. Avoid differentiating between the raw and reactive versions of an object and only use the reactive version if possible.`
    );
  }
}
const nl = /* @__PURE__ */ new WeakMap(), rl = /* @__PURE__ */ new WeakMap(), ul = /* @__PURE__ */ new WeakMap(), ol = /* @__PURE__ */ new WeakMap();
function B0(e) {
  switch (e) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
function U0(e) {
  return e.__v_skip || !Object.isExtensible(e) ? 0 : B0(zs(e));
}
function Vs(e) {
  return qt(e) ? e : co(
    e,
    !1,
    T0,
    j0,
    nl
  );
}
function H0(e) {
  return co(
    e,
    !1,
    z0,
    L0,
    rl
  );
}
function ss(e) {
  return co(
    e,
    !0,
    F0,
    Z0,
    ul
  );
}
function Vt(e) {
  return co(
    e,
    !0,
    M0,
    V0,
    ol
  );
}
function co(e, t, n, r, u) {
  if (!pe(e))
    return process.env.NODE_ENV !== "production" && St(
      `value cannot be made ${t ? "readonly" : "reactive"}: ${String(
        e
      )}`
    ), e;
  if (e.__v_raw && !(t && e.__v_isReactive))
    return e;
  const o = U0(e);
  if (o === 0)
    return e;
  const s = u.get(e);
  if (s)
    return s;
  const i = new Proxy(
    e,
    o === 2 ? r : n
  );
  return u.set(e, i), i;
}
function Rn(e) {
  return qt(e) ? Rn(e.__v_raw) : !!(e && e.__v_isReactive);
}
function qt(e) {
  return !!(e && e.__v_isReadonly);
}
function nt(e) {
  return !!(e && e.__v_isShallow);
}
function Fu(e) {
  return e ? !!e.__v_raw : !1;
}
function oe(e) {
  const t = e && e.__v_raw;
  return t ? oe(t) : e;
}
function q0(e) {
  return !ae(e, "__v_skip") && Object.isExtensible(e) && Iu(e, "__v_skip", !0), e;
}
const He = (e) => pe(e) ? Vs(e) : e, zu = (e) => pe(e) ? ss(e) : e;
function Oe(e) {
  return e ? e.__v_isRef === !0 : !1;
}
function Ve(e) {
  return sl(e, !1);
}
function Yr(e) {
  return sl(e, !0);
}
function sl(e, t) {
  return Oe(e) ? e : new J0(e, t);
}
class J0 {
  constructor(t, n) {
    this.dep = new Zs(), this.__v_isRef = !0, this.__v_isShallow = !1, this._rawValue = n ? t : oe(t), this._value = n ? t : He(t), this.__v_isShallow = n;
  }
  get value() {
    return process.env.NODE_ENV !== "production" ? this.dep.track({
      target: this,
      type: "get",
      key: "value"
    }) : this.dep.track(), this._value;
  }
  set value(t) {
    const n = this._rawValue, r = this.__v_isShallow || nt(t) || qt(t);
    t = r ? t : oe(t), gn(t, n) && (this._rawValue = t, this._value = r ? t : He(t), process.env.NODE_ENV !== "production" ? this.dep.trigger({
      target: this,
      type: "set",
      key: "value",
      newValue: t,
      oldValue: n
    }) : this.dep.trigger());
  }
}
function de(e) {
  return Oe(e) ? e.value : e;
}
const W0 = {
  get: (e, t, n) => t === "__v_raw" ? e : de(Reflect.get(e, t, n)),
  set: (e, t, n, r) => {
    const u = e[t];
    return Oe(u) && !Oe(n) ? (u.value = n, !0) : Reflect.set(e, t, n, r);
  }
};
function il(e) {
  return Rn(e) ? e : new Proxy(e, W0);
}
class G0 {
  constructor(t, n, r) {
    this._object = t, this._key = n, this._defaultValue = r, this.__v_isRef = !0, this._value = void 0;
  }
  get value() {
    const t = this._object[this._key];
    return this._value = t === void 0 ? this._defaultValue : t;
  }
  set value(t) {
    this._object[this._key] = t;
  }
  get dep() {
    return S0(oe(this._object), this._key);
  }
}
class K0 {
  constructor(t) {
    this._getter = t, this.__v_isRef = !0, this.__v_isReadonly = !0, this._value = void 0;
  }
  get value() {
    return this._value = this._getter();
  }
}
function Y0(e, t, n) {
  return Oe(e) ? e : te(e) ? new K0(e) : pe(e) && arguments.length > 1 ? X0(e, t, n) : Ve(e);
}
function X0(e, t, n) {
  const r = e[t];
  return Oe(r) ? r : new G0(e, t, n);
}
class Q0 {
  constructor(t, n, r) {
    this.fn = t, this.setter = n, this._value = void 0, this.dep = new Zs(this), this.__v_isRef = !0, this.deps = void 0, this.depsTail = void 0, this.flags = 16, this.globalVersion = Fr - 1, this.next = void 0, this.effect = this, this.__v_isReadonly = !n, this.isSSR = r;
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags |= 16, !(this.flags & 8) && // avoid infinite self recursion
    he !== this)
      return qc(this, !0), !0;
    process.env.NODE_ENV;
  }
  get value() {
    const t = process.env.NODE_ENV !== "production" ? this.dep.track({
      target: this,
      type: "get",
      key: "value"
    }) : this.dep.track();
    return Gc(this), t && (t.version = this.dep.version), this._value;
  }
  set value(t) {
    this.setter ? this.setter(t) : process.env.NODE_ENV !== "production" && St("Write operation failed: computed value is readonly");
  }
}
function ep(e, t, n = !1) {
  let r, u;
  te(e) ? r = e : (r = e.get, u = e.set);
  const o = new Q0(r, u, n);
  return process.env.NODE_ENV, o;
}
const pu = {}, Mu = /* @__PURE__ */ new WeakMap();
let Fn;
function tp(e, t = !1, n = Fn) {
  if (n) {
    let r = Mu.get(n);
    r || Mu.set(n, r = []), r.push(e);
  } else process.env.NODE_ENV !== "production" && !t && St(
    "onWatcherCleanup() was called when there was no active watcher to associate with."
  );
}
function np(e, t, n = ge) {
  const { immediate: r, deep: u, once: o, scheduler: s, augmentJob: i, call: a } = n, c = (g) => {
    (n.onWarn || St)(
      "Invalid watch source: ",
      g,
      "A watch source can only be a getter/effect function, a ref, a reactive object, or an array of these types."
    );
  }, f = (g) => u ? g : nt(g) || u === !1 || u === 0 ? hn(g, 1) : hn(g);
  let l, d, p, m, v = !1, _ = !1;
  if (Oe(e) ? (d = () => e.value, v = nt(e)) : Rn(e) ? (d = () => f(e), v = !0) : Q(e) ? (_ = !0, v = e.some((g) => Rn(g) || nt(g)), d = () => e.map((g) => {
    if (Oe(g))
      return g.value;
    if (Rn(g))
      return f(g);
    if (te(g))
      return a ? a(g, 2) : g();
    process.env.NODE_ENV !== "production" && c(g);
  })) : te(e) ? t ? d = a ? () => a(e, 2) : e : d = () => {
    if (p) {
      $t();
      try {
        p();
      } finally {
        Nt();
      }
    }
    const g = Fn;
    Fn = l;
    try {
      return a ? a(e, 3, [m]) : e(m);
    } finally {
      Fn = g;
    }
  } : (d = Le, process.env.NODE_ENV !== "production" && c(e)), t && u) {
    const g = d, y = u === !0 ? 1 / 0 : u;
    d = () => hn(g(), y);
  }
  const A = C0(), E = () => {
    l.stop(), A && A.active && Ts(A.effects, l);
  };
  if (o && t) {
    const g = t;
    t = (...y) => {
      g(...y), E();
    };
  }
  let h = _ ? new Array(e.length).fill(pu) : pu;
  const w = (g) => {
    if (!(!(l.flags & 1) || !l.dirty && !g))
      if (t) {
        const y = l.run();
        if (u || v || (_ ? y.some((C, k) => gn(C, h[k])) : gn(y, h))) {
          p && p();
          const C = Fn;
          Fn = l;
          try {
            const k = [
              y,
              // pass undefined as the old value when it's changed for the first time
              h === pu ? void 0 : _ && h[0] === pu ? [] : h,
              m
            ];
            h = y, a ? a(t, 3, k) : (
              // @ts-expect-error
              t(...k)
            );
          } finally {
            Fn = C;
          }
        }
      } else
        l.run();
  };
  return i && i(w), l = new Uc(d), l.scheduler = s ? () => s(w, !1) : w, m = (g) => tp(g, !1, l), p = l.onStop = () => {
    const g = Mu.get(l);
    if (g) {
      if (a)
        a(g, 4);
      else
        for (const y of g) y();
      Mu.delete(l);
    }
  }, process.env.NODE_ENV !== "production" && (l.onTrack = n.onTrack, l.onTrigger = n.onTrigger), t ? r ? w(!0) : h = l.run() : s ? s(w.bind(null, !0), !0) : l.run(), E.pause = l.pause.bind(l), E.resume = l.resume.bind(l), E.stop = E, E;
}
function hn(e, t = 1 / 0, n) {
  if (t <= 0 || !pe(e) || e.__v_skip || (n = n || /* @__PURE__ */ new Map(), (n.get(e) || 0) >= t))
    return e;
  if (n.set(e, t), t--, Oe(e))
    hn(e.value, t, n);
  else if (Q(e))
    for (let r = 0; r < e.length; r++)
      hn(e[r], t, n);
  else if (Rc(e) || Mn(e))
    e.forEach((r) => {
      hn(r, t, n);
    });
  else if (Lc(e)) {
    for (const r in e)
      hn(e[r], t, n);
    for (const r of Object.getOwnPropertySymbols(e))
      Object.prototype.propertyIsEnumerable.call(e, r) && hn(e[r], t, n);
  }
  return e;
}
/**
* @vue/runtime-core v3.5.22
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
const jn = [];
function xu(e) {
  jn.push(e);
}
function Eu() {
  jn.pop();
}
let $o = !1;
function R(e, ...t) {
  if ($o) return;
  $o = !0, $t();
  const n = jn.length ? jn[jn.length - 1].component : null, r = n && n.appContext.config.warnHandler, u = rp();
  if (r)
    dr(
      r,
      n,
      11,
      [
        // eslint-disable-next-line no-restricted-syntax
        e + t.map((o) => {
          var s, i;
          return (i = (s = o.toString) == null ? void 0 : s.call(o)) != null ? i : JSON.stringify(o);
        }).join(""),
        n && n.proxy,
        u.map(
          ({ vnode: o }) => `at <${ho(n, o.type)}>`
        ).join(`
`),
        u
      ]
    );
  else {
    const o = [`[Vue warn]: ${e}`, ...t];
    u.length && o.push(`
`, ...up(u)), console.warn(...o);
  }
  Nt(), $o = !1;
}
function rp() {
  let e = jn[jn.length - 1];
  if (!e)
    return [];
  const t = [];
  for (; e; ) {
    const n = t[0];
    n && n.vnode === e ? n.recurseCount++ : t.push({
      vnode: e,
      recurseCount: 0
    });
    const r = e.component && e.component.parent;
    e = r && r.vnode;
  }
  return t;
}
function up(e) {
  const t = [];
  return e.forEach((n, r) => {
    t.push(...r === 0 ? [] : [`
`], ...op(n));
  }), t;
}
function op({ vnode: e, recurseCount: t }) {
  const n = t > 0 ? `... (${t} recursive calls)` : "", r = e.component ? e.component.parent == null : !1, u = ` at <${ho(
    e.component,
    e.type,
    r
  )}`, o = ">" + n;
  return e.props ? [u, ...sp(e.props), o] : [u + o];
}
function sp(e) {
  const t = [], n = Object.keys(e);
  return n.slice(0, 3).forEach((r) => {
    t.push(...al(r, e[r]));
  }), n.length > 3 && t.push(" ..."), t;
}
function al(e, t, n) {
  return Ie(t) ? (t = JSON.stringify(t), n ? t : [`${e}=${t}`]) : typeof t == "number" || typeof t == "boolean" || t == null ? n ? t : [`${e}=${t}`] : Oe(t) ? (t = al(e, oe(t.value), !0), n ? t : [`${e}=Ref<`, t, ">"]) : te(t) ? [`${e}=fn${t.name ? `<${t.name}>` : ""}`] : (t = oe(t), n ? t : [`${e}=`, t]);
}
const Bs = {
  sp: "serverPrefetch hook",
  bc: "beforeCreate hook",
  c: "created hook",
  bm: "beforeMount hook",
  m: "mounted hook",
  bu: "beforeUpdate hook",
  u: "updated",
  bum: "beforeUnmount hook",
  um: "unmounted hook",
  a: "activated hook",
  da: "deactivated hook",
  ec: "errorCaptured hook",
  rtc: "renderTracked hook",
  rtg: "renderTriggered hook",
  0: "setup function",
  1: "render function",
  2: "watcher getter",
  3: "watcher callback",
  4: "watcher cleanup function",
  5: "native event handler",
  6: "component event handler",
  7: "vnode hook",
  8: "directive hook",
  9: "transition hook",
  10: "app errorHandler",
  11: "app warnHandler",
  12: "ref function",
  13: "async component loader",
  14: "scheduler flush",
  15: "component update",
  16: "app unmount cleanup function"
};
function dr(e, t, n, r) {
  try {
    return r ? e(...r) : e();
  } catch (u) {
    Xr(u, t, n);
  }
}
function Jt(e, t, n, r) {
  if (te(e)) {
    const u = dr(e, t, n, r);
    return u && Fs(u) && u.catch((o) => {
      Xr(o, t, n);
    }), u;
  }
  if (Q(e)) {
    const u = [];
    for (let o = 0; o < e.length; o++)
      u.push(Jt(e[o], t, n, r));
    return u;
  } else process.env.NODE_ENV !== "production" && R(
    `Invalid value type passed to callWithAsyncErrorHandling(): ${typeof e}`
  );
}
function Xr(e, t, n, r = !0) {
  const u = t ? t.vnode : null, { errorHandler: o, throwUnhandledErrorInProduction: s } = t && t.appContext.config || ge;
  if (t) {
    let i = t.parent;
    const a = t.proxy, c = process.env.NODE_ENV !== "production" ? Bs[n] : `https://vuejs.org/error-reference/#runtime-${n}`;
    for (; i; ) {
      const f = i.ec;
      if (f) {
        for (let l = 0; l < f.length; l++)
          if (f[l](e, a, c) === !1)
            return;
      }
      i = i.parent;
    }
    if (o) {
      $t(), dr(o, null, 10, [
        e,
        a,
        c
      ]), Nt();
      return;
    }
  }
  ip(e, n, u, r, s);
}
function ip(e, t, n, r = !0, u = !1) {
  if (process.env.NODE_ENV !== "production") {
    const o = Bs[t];
    if (n && xu(n), R(`Unhandled error${o ? ` during execution of ${o}` : ""}`), n && Eu(), r)
      throw e;
    console.error(e);
  } else {
    if (u)
      throw e;
    console.error(e);
  }
}
const et = [];
let Rt = -1;
const er = [];
let ln = null, Kn = 0;
const cl = /* @__PURE__ */ Promise.resolve();
let Pu = null;
const ap = 100;
function un(e) {
  const t = Pu || cl;
  return e ? t.then(this ? e.bind(this) : e) : t;
}
function cp(e) {
  let t = Rt + 1, n = et.length;
  for (; t < n; ) {
    const r = t + n >>> 1, u = et[r], o = Mr(u);
    o < e || o === e && u.flags & 2 ? t = r + 1 : n = r;
  }
  return t;
}
function lo(e) {
  if (!(e.flags & 1)) {
    const t = Mr(e), n = et[et.length - 1];
    !n || // fast path when the job id is larger than the tail
    !(e.flags & 2) && t >= Mr(n) ? et.push(e) : et.splice(cp(t), 0, e), e.flags |= 1, ll();
  }
}
function ll() {
  Pu || (Pu = cl.then(pl));
}
function fl(e) {
  Q(e) ? er.push(...e) : ln && e.id === -1 ? ln.splice(Kn + 1, 0, e) : e.flags & 1 || (er.push(e), e.flags |= 1), ll();
}
function Ni(e, t, n = Rt + 1) {
  for (process.env.NODE_ENV !== "production" && (t = t || /* @__PURE__ */ new Map()); n < et.length; n++) {
    const r = et[n];
    if (r && r.flags & 2) {
      if (e && r.id !== e.uid || process.env.NODE_ENV !== "production" && Us(t, r))
        continue;
      et.splice(n, 1), n--, r.flags & 4 && (r.flags &= -2), r(), r.flags & 4 || (r.flags &= -2);
    }
  }
}
function dl(e) {
  if (er.length) {
    const t = [...new Set(er)].sort(
      (n, r) => Mr(n) - Mr(r)
    );
    if (er.length = 0, ln) {
      ln.push(...t);
      return;
    }
    for (ln = t, process.env.NODE_ENV !== "production" && (e = e || /* @__PURE__ */ new Map()), Kn = 0; Kn < ln.length; Kn++) {
      const n = ln[Kn];
      process.env.NODE_ENV !== "production" && Us(e, n) || (n.flags & 4 && (n.flags &= -2), n.flags & 8 || n(), n.flags &= -2);
    }
    ln = null, Kn = 0;
  }
}
const Mr = (e) => e.id == null ? e.flags & 2 ? -1 : 1 / 0 : e.id;
function pl(e) {
  process.env.NODE_ENV !== "production" && (e = e || /* @__PURE__ */ new Map());
  const t = process.env.NODE_ENV !== "production" ? (n) => Us(e, n) : Le;
  try {
    for (Rt = 0; Rt < et.length; Rt++) {
      const n = et[Rt];
      if (n && !(n.flags & 8)) {
        if (process.env.NODE_ENV !== "production" && t(n))
          continue;
        n.flags & 4 && (n.flags &= -2), dr(
          n,
          n.i,
          n.i ? 15 : 14
        ), n.flags & 4 || (n.flags &= -2);
      }
    }
  } finally {
    for (; Rt < et.length; Rt++) {
      const n = et[Rt];
      n && (n.flags &= -2);
    }
    Rt = -1, et.length = 0, dl(e), Pu = null, (et.length || er.length) && pl(e);
  }
}
function Us(e, t) {
  const n = e.get(t) || 0;
  if (n > ap) {
    const r = t.i, u = r && ql(r.type);
    return Xr(
      `Maximum recursive updates exceeded${u ? ` in component <${u}>` : ""}. This means you have a reactive effect that is mutating its own dependencies and thus recursively triggering itself. Possible sources include component template, render function, updated hook or watcher source function.`,
      null,
      10
    ), !0;
  }
  return e.set(t, n + 1), !1;
}
let Bt = !1;
const ku = /* @__PURE__ */ new Map();
process.env.NODE_ENV !== "production" && (Kr().__VUE_HMR_RUNTIME__ = {
  createRecord: No(hl),
  rerender: No(dp),
  reload: No(pp)
});
const Zn = /* @__PURE__ */ new Map();
function lp(e) {
  const t = e.type.__hmrId;
  let n = Zn.get(t);
  n || (hl(t, e.type), n = Zn.get(t)), n.instances.add(e);
}
function fp(e) {
  Zn.get(e.type.__hmrId).instances.delete(e);
}
function hl(e, t) {
  return Zn.has(e) ? !1 : (Zn.set(e, {
    initialDef: Ru(t),
    instances: /* @__PURE__ */ new Set()
  }), !0);
}
function Ru(e) {
  return Jl(e) ? e.__vccOpts : e;
}
function dp(e, t) {
  const n = Zn.get(e);
  n && (n.initialDef.render = t, [...n.instances].forEach((r) => {
    t && (r.render = t, Ru(r.type).render = t), r.renderCache = [], Bt = !0, r.job.flags & 8 || r.update(), Bt = !1;
  }));
}
function pp(e, t) {
  const n = Zn.get(e);
  if (!n) return;
  t = Ru(t), Oi(n.initialDef, t);
  const r = [...n.instances];
  for (let u = 0; u < r.length; u++) {
    const o = r[u], s = Ru(o.type);
    let i = ku.get(s);
    i || (s !== n.initialDef && Oi(s, t), ku.set(s, i = /* @__PURE__ */ new Set())), i.add(o), o.appContext.propsCache.delete(o.type), o.appContext.emitsCache.delete(o.type), o.appContext.optionsCache.delete(o.type), o.ceReload ? (i.add(o), o.ceReload(t.styles), i.delete(o)) : o.parent ? lo(() => {
      o.job.flags & 8 || (Bt = !0, o.parent.update(), Bt = !1, i.delete(o));
    }) : o.appContext.reload ? o.appContext.reload() : typeof window < "u" ? window.location.reload() : console.warn(
      "[HMR] Root or manually mounted instance modified. Full reload required."
    ), o.root.ce && o !== o.root && o.root.ce._removeChildStyle(s);
  }
  fl(() => {
    ku.clear();
  });
}
function Oi(e, t) {
  Re(e, t);
  for (const n in e)
    n !== "__file" && !(n in t) && delete e[n];
}
function No(e) {
  return (t, n) => {
    try {
      return e(t, n);
    } catch (r) {
      console.error(r), console.warn(
        "[HMR] Something went wrong during Vue component hot-reload. Full reload required."
      );
    }
  };
}
let wt, wr = [], is = !1;
function Qr(e, ...t) {
  wt ? wt.emit(e, ...t) : is || wr.push({ event: e, args: t });
}
function Hs(e, t) {
  var n, r;
  wt = e, wt ? (wt.enabled = !0, wr.forEach(({ event: u, args: o }) => wt.emit(u, ...o)), wr = []) : /* handle late devtools injection - only do this if we are in an actual */ /* browser environment to avoid the timer handle stalling test runner exit */ /* (#4815) */ typeof window < "u" && // some envs mock window but not fully
  window.HTMLElement && // also exclude jsdom
  // eslint-disable-next-line no-restricted-syntax
  !((r = (n = window.navigator) == null ? void 0 : n.userAgent) != null && r.includes("jsdom")) ? ((t.__VUE_DEVTOOLS_HOOK_REPLAY__ = t.__VUE_DEVTOOLS_HOOK_REPLAY__ || []).push((o) => {
    Hs(o, t);
  }), setTimeout(() => {
    wt || (t.__VUE_DEVTOOLS_HOOK_REPLAY__ = null, is = !0, wr = []);
  }, 3e3)) : (is = !0, wr = []);
}
function hp(e, t) {
  Qr("app:init", e, t, {
    Fragment: tt,
    Text: tu,
    Comment: ht,
    Static: Cu
  });
}
function mp(e) {
  Qr("app:unmount", e);
}
const gp = /* @__PURE__ */ qs(
  "component:added"
  /* COMPONENT_ADDED */
), ml = /* @__PURE__ */ qs(
  "component:updated"
  /* COMPONENT_UPDATED */
), bp = /* @__PURE__ */ qs(
  "component:removed"
  /* COMPONENT_REMOVED */
), vp = (e) => {
  wt && typeof wt.cleanupBuffer == "function" && // remove the component if it wasn't buffered
  !wt.cleanupBuffer(e) && bp(e);
};
// @__NO_SIDE_EFFECTS__
function qs(e) {
  return (t) => {
    Qr(
      e,
      t.appContext.app,
      t.uid,
      t.parent ? t.parent.uid : void 0,
      t
    );
  };
}
const _p = /* @__PURE__ */ gl(
  "perf:start"
  /* PERFORMANCE_START */
), yp = /* @__PURE__ */ gl(
  "perf:end"
  /* PERFORMANCE_END */
);
function gl(e) {
  return (t, n, r) => {
    Qr(e, t.appContext.app, t.uid, t, n, r);
  };
}
function xp(e, t, n) {
  Qr(
    "component:emit",
    e.appContext.app,
    e,
    t,
    n
  );
}
let dt = null, bl = null;
function ju(e) {
  const t = dt;
  return dt = e, bl = e && e.type.__scopeId || null, t;
}
function Ep(e, t = dt, n) {
  if (!t || e._n)
    return e;
  const r = (...u) => {
    r._d && Uu(-1);
    const o = ju(t);
    let s;
    try {
      s = e(...u);
    } finally {
      ju(o), r._d && Uu(1);
    }
    return process.env.NODE_ENV !== "production" && ml(t), s;
  };
  return r._n = !0, r._c = !0, r._d = !0, r;
}
function vl(e) {
  a0(e) && R("Do not use built-in directive ids as custom directive id: " + e);
}
function Dn(e, t, n, r) {
  const u = e.dirs, o = t && t.dirs;
  for (let s = 0; s < u.length; s++) {
    const i = u[s];
    o && (i.oldValue = o[s].value);
    let a = i.dir[r];
    a && ($t(), Jt(a, n, 8, [
      e.el,
      i,
      e,
      t
    ]), Nt());
  }
}
const kp = Symbol("_vte"), wp = (e) => e.__isTeleport, Cp = Symbol("_leaveCb");
function Js(e, t) {
  e.shapeFlag & 6 && e.component ? (e.transition = t, Js(e.component.subTree, t)) : e.shapeFlag & 128 ? (e.ssContent.transition = t.clone(e.ssContent), e.ssFallback.transition = t.clone(e.ssFallback)) : e.transition = t;
}
// @__NO_SIDE_EFFECTS__
function It(e, t) {
  return te(e) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    Re({ name: e.name }, t, { setup: e })
  ) : e;
}
function Ap() {
  const e = ei();
  return e ? (e.appContext.config.idPrefix || "v") + "-" + e.ids[0] + e.ids[1]++ : (process.env.NODE_ENV !== "production" && R(
    "useId() is called when there is no active component instance to be associated with."
  ), "");
}
function _l(e) {
  e.ids = [e.ids[0] + e.ids[2]++ + "-", 0, 0];
}
const Ii = /* @__PURE__ */ new WeakSet(), Lu = /* @__PURE__ */ new WeakMap();
function Or(e, t, n, r, u = !1) {
  if (Q(e)) {
    e.forEach(
      (v, _) => Or(
        v,
        t && (Q(t) ? t[_] : t),
        n,
        r,
        u
      )
    );
    return;
  }
  if (Ir(r) && !u) {
    r.shapeFlag & 512 && r.type.__asyncResolved && r.component.subTree.component && Or(e, t, n, r.component.subTree);
    return;
  }
  const o = r.shapeFlag & 4 ? ti(r.component) : r.el, s = u ? null : o, { i, r: a } = e;
  if (process.env.NODE_ENV !== "production" && !i) {
    R(
      "Missing ref owner context. ref cannot be used on hoisted vnodes. A vnode with ref must be created inside the render function."
    );
    return;
  }
  const c = t && t.r, f = i.refs === ge ? i.refs = {} : i.refs, l = i.setupState, d = oe(l), p = l === ge ? Pc : (v) => process.env.NODE_ENV !== "production" && (ae(d, v) && !Oe(d[v]) && R(
    `Template ref "${v}" used on a non-ref value. It will not work in the production build.`
  ), Ii.has(d[v])) ? !1 : ae(d, v), m = (v) => process.env.NODE_ENV === "production" || !Ii.has(v);
  if (c != null && c !== a) {
    if (Ti(t), Ie(c))
      f[c] = null, p(c) && (l[c] = null);
    else if (Oe(c)) {
      m(c) && (c.value = null);
      const v = t;
      v.k && (f[v.k] = null);
    }
  }
  if (te(a))
    dr(a, i, 12, [s, f]);
  else {
    const v = Ie(a), _ = Oe(a);
    if (v || _) {
      const A = () => {
        if (e.f) {
          const E = v ? p(a) ? l[a] : f[a] : m(a) || !e.k ? a.value : f[e.k];
          if (u)
            Q(E) && Ts(E, o);
          else if (Q(E))
            E.includes(o) || E.push(o);
          else if (v)
            f[a] = [o], p(a) && (l[a] = f[a]);
          else {
            const h = [o];
            m(a) && (a.value = h), e.k && (f[e.k] = h);
          }
        } else v ? (f[a] = s, p(a) && (l[a] = s)) : _ ? (m(a) && (a.value = s), e.k && (f[e.k] = s)) : process.env.NODE_ENV !== "production" && R("Invalid template ref type:", a, `(${typeof a})`);
      };
      if (s) {
        const E = () => {
          A(), Lu.delete(e);
        };
        E.id = -1, Lu.set(e, E), ft(E, n);
      } else
        Ti(e), A();
    } else process.env.NODE_ENV !== "production" && R("Invalid template ref type:", a, `(${typeof a})`);
  }
}
function Ti(e) {
  const t = Lu.get(e);
  t && (t.flags |= 8, Lu.delete(e));
}
Kr().requestIdleCallback;
Kr().cancelIdleCallback;
const Ir = (e) => !!e.type.__asyncLoader, Ws = (e) => e.type.__isKeepAlive;
function Dp(e, t) {
  yl(e, "a", t);
}
function Sp(e, t) {
  yl(e, "da", t);
}
function yl(e, t, n = qe) {
  const r = e.__wdc || (e.__wdc = () => {
    let u = n;
    for (; u; ) {
      if (u.isDeactivated)
        return;
      u = u.parent;
    }
    return e();
  });
  if (fo(t, r, n), n) {
    let u = n.parent;
    for (; u && u.parent; )
      Ws(u.parent.vnode) && $p(r, t, n, u), u = u.parent;
  }
}
function $p(e, t, n, r) {
  const u = fo(
    t,
    e,
    r,
    !0
    /* prepend */
  );
  xl(() => {
    Ts(r[t], u);
  }, n);
}
function fo(e, t, n = qe, r = !1) {
  if (n) {
    const u = n[e] || (n[e] = []), o = t.__weh || (t.__weh = (...s) => {
      $t();
      const i = nu(n), a = Jt(t, n, e, s);
      return i(), Nt(), a;
    });
    return r ? u.unshift(o) : u.push(o), o;
  } else if (process.env.NODE_ENV !== "production") {
    const u = Tn(Bs[e].replace(/ hook$/, ""));
    R(
      `${u} is called when there is no active component instance to be associated with. Lifecycle injection APIs can only be used during execution of setup(). If you are using async setup(), make sure to register lifecycle hooks before the first await statement.`
    );
  }
}
const cn = (e) => (t, n = qe) => {
  (!Rr || e === "sp") && fo(e, (...r) => t(...r), n);
}, Np = cn("bm"), Ot = cn("m"), Op = cn(
  "bu"
), Ip = cn("u"), eu = cn(
  "bum"
), xl = cn("um"), Tp = cn(
  "sp"
), Fp = cn("rtg"), zp = cn("rtc");
function Mp(e, t = qe) {
  fo("ec", e, t);
}
const Pp = Symbol.for("v-ndc");
function as(e, t, n, r) {
  let u;
  const o = n, s = Q(e);
  if (s || Ie(e)) {
    const i = s && Rn(e);
    let a = !1, c = !1;
    i && (a = !nt(e), c = qt(e), e = io(e)), u = new Array(e.length);
    for (let f = 0, l = e.length; f < l; f++)
      u[f] = t(
        a ? c ? zu(He(e[f])) : He(e[f]) : e[f],
        f,
        void 0,
        o
      );
  } else if (typeof e == "number") {
    process.env.NODE_ENV !== "production" && !Number.isInteger(e) && R(`The v-for range expect an integer value but got ${e}.`), u = new Array(e);
    for (let i = 0; i < e; i++)
      u[i] = t(i + 1, i, void 0, o);
  } else if (pe(e))
    if (e[Symbol.iterator])
      u = Array.from(
        e,
        (i, a) => t(i, a, void 0, o)
      );
    else {
      const i = Object.keys(e);
      u = new Array(i.length);
      for (let a = 0, c = i.length; a < c; a++) {
        const f = i[a];
        u[a] = t(e[f], f, a, o);
      }
    }
  else
    u = [];
  return u;
}
const cs = (e) => e ? Ul(e) ? ti(e) : cs(e.parent) : null, Ln = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ Re(/* @__PURE__ */ Object.create(null), {
    $: (e) => e,
    $el: (e) => e.vnode.el,
    $data: (e) => e.data,
    $props: (e) => process.env.NODE_ENV !== "production" ? Vt(e.props) : e.props,
    $attrs: (e) => process.env.NODE_ENV !== "production" ? Vt(e.attrs) : e.attrs,
    $slots: (e) => process.env.NODE_ENV !== "production" ? Vt(e.slots) : e.slots,
    $refs: (e) => process.env.NODE_ENV !== "production" ? Vt(e.refs) : e.refs,
    $parent: (e) => cs(e.parent),
    $root: (e) => cs(e.root),
    $host: (e) => e.ce,
    $emit: (e) => e.emit,
    $options: (e) => wl(e),
    $forceUpdate: (e) => e.f || (e.f = () => {
      lo(e.update);
    }),
    $nextTick: (e) => e.n || (e.n = un.bind(e.proxy)),
    $watch: (e) => mh.bind(e)
  })
), Gs = (e) => e === "_" || e === "$", Oo = (e, t) => e !== ge && !e.__isScriptSetup && ae(e, t), El = {
  get({ _: e }, t) {
    if (t === "__v_skip")
      return !0;
    const { ctx: n, setupState: r, data: u, props: o, accessCache: s, type: i, appContext: a } = e;
    if (process.env.NODE_ENV !== "production" && t === "__isVue")
      return !0;
    let c;
    if (t[0] !== "$") {
      const p = s[t];
      if (p !== void 0)
        switch (p) {
          case 1:
            return r[t];
          case 2:
            return u[t];
          case 4:
            return n[t];
          case 3:
            return o[t];
        }
      else {
        if (Oo(r, t))
          return s[t] = 1, r[t];
        if (u !== ge && ae(u, t))
          return s[t] = 2, u[t];
        if (
          // only cache other properties when instance has declared (thus stable)
          // props
          (c = e.propsOptions[0]) && ae(c, t)
        )
          return s[t] = 3, o[t];
        if (n !== ge && ae(n, t))
          return s[t] = 4, n[t];
        ls && (s[t] = 0);
      }
    }
    const f = Ln[t];
    let l, d;
    if (f)
      return t === "$attrs" ? (je(e.attrs, "get", ""), process.env.NODE_ENV !== "production" && Bu()) : process.env.NODE_ENV !== "production" && t === "$slots" && je(e, "get", t), f(e);
    if (
      // css module (injected by vue-loader)
      (l = i.__cssModules) && (l = l[t])
    )
      return l;
    if (n !== ge && ae(n, t))
      return s[t] = 4, n[t];
    if (
      // global properties
      d = a.config.globalProperties, ae(d, t)
    )
      return d[t];
    process.env.NODE_ENV !== "production" && dt && (!Ie(t) || // #1091 avoid internal isRef/isVNode checks on component instance leading
    // to infinite warning loop
    t.indexOf("__v") !== 0) && (u !== ge && Gs(t[0]) && ae(u, t) ? R(
      `Property ${JSON.stringify(
        t
      )} must be accessed via $data because it starts with a reserved character ("$" or "_") and is not proxied on the render context.`
    ) : e === dt && R(
      `Property ${JSON.stringify(t)} was accessed during render but is not defined on instance.`
    ));
  },
  set({ _: e }, t, n) {
    const { data: r, setupState: u, ctx: o } = e;
    return Oo(u, t) ? (u[t] = n, !0) : process.env.NODE_ENV !== "production" && u.__isScriptSetup && ae(u, t) ? (R(`Cannot mutate <script setup> binding "${t}" from Options API.`), !1) : r !== ge && ae(r, t) ? (r[t] = n, !0) : ae(e.props, t) ? (process.env.NODE_ENV !== "production" && R(`Attempting to mutate prop "${t}". Props are readonly.`), !1) : t[0] === "$" && t.slice(1) in e ? (process.env.NODE_ENV !== "production" && R(
      `Attempting to mutate public property "${t}". Properties starting with $ are reserved and readonly.`
    ), !1) : (process.env.NODE_ENV !== "production" && t in e.appContext.config.globalProperties ? Object.defineProperty(o, t, {
      enumerable: !0,
      configurable: !0,
      value: n
    }) : o[t] = n, !0);
  },
  has({
    _: { data: e, setupState: t, accessCache: n, ctx: r, appContext: u, propsOptions: o, type: s }
  }, i) {
    let a, c;
    return !!(n[i] || e !== ge && i[0] !== "$" && ae(e, i) || Oo(t, i) || (a = o[0]) && ae(a, i) || ae(r, i) || ae(Ln, i) || ae(u.config.globalProperties, i) || (c = s.__cssModules) && c[i]);
  },
  defineProperty(e, t, n) {
    return n.get != null ? e._.accessCache[t] = 0 : ae(n, "value") && this.set(e, t, n.value, null), Reflect.defineProperty(e, t, n);
  }
};
process.env.NODE_ENV !== "production" && (El.ownKeys = (e) => (R(
  "Avoid app logic that relies on enumerating keys on a component instance. The keys will be empty in production mode to avoid performance overhead."
), Reflect.ownKeys(e)));
function Rp(e) {
  const t = {};
  return Object.defineProperty(t, "_", {
    configurable: !0,
    enumerable: !1,
    get: () => e
  }), Object.keys(Ln).forEach((n) => {
    Object.defineProperty(t, n, {
      configurable: !0,
      enumerable: !1,
      get: () => Ln[n](e),
      // intercepted by the proxy so no need for implementation,
      // but needed to prevent set errors
      set: Le
    });
  }), t;
}
function jp(e) {
  const {
    ctx: t,
    propsOptions: [n]
  } = e;
  n && Object.keys(n).forEach((r) => {
    Object.defineProperty(t, r, {
      enumerable: !0,
      configurable: !0,
      get: () => e.props[r],
      set: Le
    });
  });
}
function Lp(e) {
  const { ctx: t, setupState: n } = e;
  Object.keys(oe(n)).forEach((r) => {
    if (!n.__isScriptSetup) {
      if (Gs(r[0])) {
        R(
          `setup() return property ${JSON.stringify(
            r
          )} should not start with "$" or "_" which are reserved prefixes for Vue internals.`
        );
        return;
      }
      Object.defineProperty(t, r, {
        enumerable: !0,
        configurable: !0,
        get: () => n[r],
        set: Le
      });
    }
  });
}
function Fi(e) {
  return Q(e) ? e.reduce(
    (t, n) => (t[n] = null, t),
    {}
  ) : e;
}
function Zp() {
  const e = /* @__PURE__ */ Object.create(null);
  return (t, n) => {
    e[n] ? R(`${t} property "${n}" is already defined in ${e[n]}.`) : e[n] = t;
  };
}
let ls = !0;
function Vp(e) {
  const t = wl(e), n = e.proxy, r = e.ctx;
  ls = !1, t.beforeCreate && zi(t.beforeCreate, e, "bc");
  const {
    // state
    data: u,
    computed: o,
    methods: s,
    watch: i,
    provide: a,
    inject: c,
    // lifecycle
    created: f,
    beforeMount: l,
    mounted: d,
    beforeUpdate: p,
    updated: m,
    activated: v,
    deactivated: _,
    beforeDestroy: A,
    beforeUnmount: E,
    destroyed: h,
    unmounted: w,
    render: g,
    renderTracked: y,
    renderTriggered: C,
    errorCaptured: k,
    serverPrefetch: Z,
    // public API
    expose: W,
    inheritAttrs: K,
    // assets
    components: B,
    directives: G,
    filters: q
  } = t, H = process.env.NODE_ENV !== "production" ? Zp() : null;
  if (process.env.NODE_ENV !== "production") {
    const [z] = e.propsOptions;
    if (z)
      for (const $ in z)
        H("Props", $);
  }
  if (c && Bp(c, r, H), s)
    for (const z in s) {
      const $ = s[z];
      te($) ? (process.env.NODE_ENV !== "production" ? Object.defineProperty(r, z, {
        value: $.bind(n),
        configurable: !0,
        enumerable: !0,
        writable: !0
      }) : r[z] = $.bind(n), process.env.NODE_ENV !== "production" && H("Methods", z)) : process.env.NODE_ENV !== "production" && R(
        `Method "${z}" has type "${typeof $}" in the component definition. Did you reference the function correctly?`
      );
    }
  if (u) {
    process.env.NODE_ENV !== "production" && !te(u) && R(
      "The data option must be a function. Plain object usage is no longer supported."
    );
    const z = u.call(n, n);
    if (process.env.NODE_ENV !== "production" && Fs(z) && R(
      "data() returned a Promise - note data() cannot be async; If you intend to perform data fetching before component renders, use async setup() + <Suspense>."
    ), !pe(z))
      process.env.NODE_ENV !== "production" && R("data() should return an object.");
    else if (e.data = Vs(z), process.env.NODE_ENV !== "production")
      for (const $ in z)
        H("Data", $), Gs($[0]) || Object.defineProperty(r, $, {
          configurable: !0,
          enumerable: !0,
          get: () => z[$],
          set: Le
        });
  }
  if (ls = !0, o)
    for (const z in o) {
      const $ = o[z], ne = te($) ? $.bind(n, n) : te($.get) ? $.get.bind(n, n) : Le;
      process.env.NODE_ENV !== "production" && ne === Le && R(`Computed property "${z}" has no getter.`);
      const fe = !te($) && te($.set) ? $.set.bind(n) : process.env.NODE_ENV !== "production" ? () => {
        R(
          `Write operation failed: computed property "${z}" is readonly.`
        );
      } : Le, ze = Fe({
        get: ne,
        set: fe
      });
      Object.defineProperty(r, z, {
        enumerable: !0,
        configurable: !0,
        get: () => ze.value,
        set: (Se) => ze.value = Se
      }), process.env.NODE_ENV !== "production" && H("Computed", z);
    }
  if (i)
    for (const z in i)
      kl(i[z], r, n, z);
  if (a) {
    const z = te(a) ? a.call(n) : a;
    Reflect.ownKeys(z).forEach(($) => {
      Et($, z[$]);
    });
  }
  f && zi(f, e, "c");
  function N(z, $) {
    Q($) ? $.forEach((ne) => z(ne.bind(n))) : $ && z($.bind(n));
  }
  if (N(Np, l), N(Ot, d), N(Op, p), N(Ip, m), N(Dp, v), N(Sp, _), N(Mp, k), N(zp, y), N(Fp, C), N(eu, E), N(xl, w), N(Tp, Z), Q(W))
    if (W.length) {
      const z = e.exposed || (e.exposed = {});
      W.forEach(($) => {
        Object.defineProperty(z, $, {
          get: () => n[$],
          set: (ne) => n[$] = ne,
          enumerable: !0
        });
      });
    } else e.exposed || (e.exposed = {});
  g && e.render === Le && (e.render = g), K != null && (e.inheritAttrs = K), B && (e.components = B), G && (e.directives = G), Z && _l(e);
}
function Bp(e, t, n = Le) {
  Q(e) && (e = fs(e));
  for (const r in e) {
    const u = e[r];
    let o;
    pe(u) ? "default" in u ? o = le(
      u.from || r,
      u.default,
      !0
    ) : o = le(u.from || r) : o = le(u), Oe(o) ? Object.defineProperty(t, r, {
      enumerable: !0,
      configurable: !0,
      get: () => o.value,
      set: (s) => o.value = s
    }) : t[r] = o, process.env.NODE_ENV !== "production" && n("Inject", r);
  }
}
function zi(e, t, n) {
  Jt(
    Q(e) ? e.map((r) => r.bind(t.proxy)) : e.bind(t.proxy),
    t,
    n
  );
}
function kl(e, t, n, r) {
  let u = r.includes(".") ? Ml(n, r) : () => n[r];
  if (Ie(e)) {
    const o = t[e];
    te(o) ? Pe(u, o) : process.env.NODE_ENV !== "production" && R(`Invalid watch handler specified by key "${e}"`, o);
  } else if (te(e))
    Pe(u, e.bind(n));
  else if (pe(e))
    if (Q(e))
      e.forEach((o) => kl(o, t, n, r));
    else {
      const o = te(e.handler) ? e.handler.bind(n) : t[e.handler];
      te(o) ? Pe(u, o, e) : process.env.NODE_ENV !== "production" && R(`Invalid watch handler specified by key "${e.handler}"`, o);
    }
  else process.env.NODE_ENV !== "production" && R(`Invalid watch option: "${r}"`, e);
}
function wl(e) {
  const t = e.type, { mixins: n, extends: r } = t, {
    mixins: u,
    optionsCache: o,
    config: { optionMergeStrategies: s }
  } = e.appContext, i = o.get(t);
  let a;
  return i ? a = i : !u.length && !n && !r ? a = t : (a = {}, u.length && u.forEach(
    (c) => Zu(a, c, s, !0)
  ), Zu(a, t, s)), pe(t) && o.set(t, a), a;
}
function Zu(e, t, n, r = !1) {
  const { mixins: u, extends: o } = t;
  o && Zu(e, o, n, !0), u && u.forEach(
    (s) => Zu(e, s, n, !0)
  );
  for (const s in t)
    if (r && s === "expose")
      process.env.NODE_ENV !== "production" && R(
        '"expose" option is ignored when declared in mixins or extends. It should only be declared in the base component itself.'
      );
    else {
      const i = Up[s] || n && n[s];
      e[s] = i ? i(e[s], t[s]) : t[s];
    }
  return e;
}
const Up = {
  data: Mi,
  props: Pi,
  emits: Pi,
  // objects
  methods: Cr,
  computed: Cr,
  // lifecycle
  beforeCreate: Ye,
  created: Ye,
  beforeMount: Ye,
  mounted: Ye,
  beforeUpdate: Ye,
  updated: Ye,
  beforeDestroy: Ye,
  beforeUnmount: Ye,
  destroyed: Ye,
  unmounted: Ye,
  activated: Ye,
  deactivated: Ye,
  errorCaptured: Ye,
  serverPrefetch: Ye,
  // assets
  components: Cr,
  directives: Cr,
  // watch
  watch: qp,
  // provide / inject
  provide: Mi,
  inject: Hp
};
function Mi(e, t) {
  return t ? e ? function() {
    return Re(
      te(e) ? e.call(this, this) : e,
      te(t) ? t.call(this, this) : t
    );
  } : t : e;
}
function Hp(e, t) {
  return Cr(fs(e), fs(t));
}
function fs(e) {
  if (Q(e)) {
    const t = {};
    for (let n = 0; n < e.length; n++)
      t[e[n]] = e[n];
    return t;
  }
  return e;
}
function Ye(e, t) {
  return e ? [...new Set([].concat(e, t))] : t;
}
function Cr(e, t) {
  return e ? Re(/* @__PURE__ */ Object.create(null), e, t) : t;
}
function Pi(e, t) {
  return e ? Q(e) && Q(t) ? [.../* @__PURE__ */ new Set([...e, ...t])] : Re(
    /* @__PURE__ */ Object.create(null),
    Fi(e),
    Fi(t ?? {})
  ) : t;
}
function qp(e, t) {
  if (!e) return t;
  if (!t) return e;
  const n = Re(/* @__PURE__ */ Object.create(null), e);
  for (const r in t)
    n[r] = Ye(e[r], t[r]);
  return n;
}
function Cl() {
  return {
    app: null,
    config: {
      isNativeTag: Pc,
      performance: !1,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: /* @__PURE__ */ Object.create(null),
    optionsCache: /* @__PURE__ */ new WeakMap(),
    propsCache: /* @__PURE__ */ new WeakMap(),
    emitsCache: /* @__PURE__ */ new WeakMap()
  };
}
let Jp = 0;
function Wp(e, t) {
  return function(r, u = null) {
    te(r) || (r = Re({}, r)), u != null && !pe(u) && (process.env.NODE_ENV !== "production" && R("root props passed to app.mount() must be an object."), u = null);
    const o = Cl(), s = /* @__PURE__ */ new WeakSet(), i = [];
    let a = !1;
    const c = o.app = {
      _uid: Jp++,
      _component: r,
      _props: u,
      _container: null,
      _context: o,
      _instance: null,
      version: Wi,
      get config() {
        return o.config;
      },
      set config(f) {
        process.env.NODE_ENV !== "production" && R(
          "app.config cannot be replaced. Modify individual options instead."
        );
      },
      use(f, ...l) {
        return s.has(f) ? process.env.NODE_ENV !== "production" && R("Plugin has already been applied to target app.") : f && te(f.install) ? (s.add(f), f.install(c, ...l)) : te(f) ? (s.add(f), f(c, ...l)) : process.env.NODE_ENV !== "production" && R(
          'A plugin must either be a function or an object with an "install" function.'
        ), c;
      },
      mixin(f) {
        return o.mixins.includes(f) ? process.env.NODE_ENV !== "production" && R(
          "Mixin has already been applied to target app" + (f.name ? `: ${f.name}` : "")
        ) : o.mixins.push(f), c;
      },
      component(f, l) {
        return process.env.NODE_ENV !== "production" && gs(f, o.config), l ? (process.env.NODE_ENV !== "production" && o.components[f] && R(`Component "${f}" has already been registered in target app.`), o.components[f] = l, c) : o.components[f];
      },
      directive(f, l) {
        return process.env.NODE_ENV !== "production" && vl(f), l ? (process.env.NODE_ENV !== "production" && o.directives[f] && R(`Directive "${f}" has already been registered in target app.`), o.directives[f] = l, c) : o.directives[f];
      },
      mount(f, l, d) {
        if (a)
          process.env.NODE_ENV !== "production" && R(
            "App has already been mounted.\nIf you want to remount the same app, move your app creation logic into a factory function and create fresh app instances for each mount - e.g. `const createMyApp = () => createApp(App)`"
          );
        else {
          process.env.NODE_ENV !== "production" && f.__vue_app__ && R(
            "There is already an app instance mounted on the host container.\n If you want to mount another app on the same host container, you need to unmount the previous app by calling `app.unmount()` first."
          );
          const p = c._ceVNode || Ee(r, u);
          return p.appContext = o, d === !0 ? d = "svg" : d === !1 && (d = void 0), process.env.NODE_ENV !== "production" && (o.reload = () => {
            const m = yn(p);
            m.el = null, e(m, f, d);
          }), e(p, f, d), a = !0, c._container = f, f.__vue_app__ = c, process.env.NODE_ENV !== "production" && (c._instance = p.component, hp(c, Wi)), ti(p.component);
        }
      },
      onUnmount(f) {
        process.env.NODE_ENV !== "production" && typeof f != "function" && R(
          `Expected function as first argument to app.onUnmount(), but got ${typeof f}`
        ), i.push(f);
      },
      unmount() {
        a ? (Jt(
          i,
          c._instance,
          16
        ), e(null, c._container), process.env.NODE_ENV !== "production" && (c._instance = null, mp(c)), delete c._container.__vue_app__) : process.env.NODE_ENV !== "production" && R("Cannot unmount an app that is not mounted.");
      },
      provide(f, l) {
        return process.env.NODE_ENV !== "production" && f in o.provides && (ae(o.provides, f) ? R(
          `App already provides property with key "${String(f)}". It will be overwritten with the new value.`
        ) : R(
          `App already provides property with key "${String(f)}" inherited from its parent element. It will be overwritten with the new value.`
        )), o.provides[f] = l, c;
      },
      runWithContext(f) {
        const l = tr;
        tr = c;
        try {
          return f();
        } finally {
          tr = l;
        }
      }
    };
    return c;
  };
}
let tr = null;
function Et(e, t) {
  if (!qe)
    process.env.NODE_ENV !== "production" && R("provide() can only be used inside setup().");
  else {
    let n = qe.provides;
    const r = qe.parent && qe.parent.provides;
    r === n && (n = qe.provides = Object.create(r)), n[e] = t;
  }
}
function le(e, t, n = !1) {
  const r = ei();
  if (r || tr) {
    let u = tr ? tr._context.provides : r ? r.parent == null || r.ce ? r.vnode.appContext && r.vnode.appContext.provides : r.parent.provides : void 0;
    if (u && e in u)
      return u[e];
    if (arguments.length > 1)
      return n && te(t) ? t.call(r && r.proxy) : t;
    process.env.NODE_ENV !== "production" && R(`injection "${String(e)}" not found.`);
  } else process.env.NODE_ENV !== "production" && R("inject() can only be used inside setup() or functional components.");
}
const Al = {}, Dl = () => Object.create(Al), Sl = (e) => Object.getPrototypeOf(e) === Al;
function Gp(e, t, n, r = !1) {
  const u = {}, o = Dl();
  e.propsDefaults = /* @__PURE__ */ Object.create(null), $l(e, t, u, o);
  for (const s in e.propsOptions[0])
    s in u || (u[s] = void 0);
  process.env.NODE_ENV !== "production" && Ol(t || {}, u, e), n ? e.props = r ? u : H0(u) : e.type.props ? e.props = u : e.props = o, e.attrs = o;
}
function Kp(e) {
  for (; e; ) {
    if (e.type.__hmrId) return !0;
    e = e.parent;
  }
}
function Yp(e, t, n, r) {
  const {
    props: u,
    attrs: o,
    vnode: { patchFlag: s }
  } = e, i = oe(u), [a] = e.propsOptions;
  let c = !1;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    !(process.env.NODE_ENV !== "production" && Kp(e)) && (r || s > 0) && !(s & 16)
  ) {
    if (s & 8) {
      const f = e.vnode.dynamicProps;
      for (let l = 0; l < f.length; l++) {
        let d = f[l];
        if (po(e.emitsOptions, d))
          continue;
        const p = t[d];
        if (a)
          if (ae(o, d))
            p !== o[d] && (o[d] = p, c = !0);
          else {
            const m = Ct(d);
            u[m] = ds(
              a,
              i,
              m,
              p,
              e,
              !1
            );
          }
        else
          p !== o[d] && (o[d] = p, c = !0);
      }
    }
  } else {
    $l(e, t, u, o) && (c = !0);
    let f;
    for (const l in i)
      (!t || // for camelCase
      !ae(t, l) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((f = _n(l)) === l || !ae(t, f))) && (a ? n && // for camelCase
      (n[l] !== void 0 || // for kebab-case
      n[f] !== void 0) && (u[l] = ds(
        a,
        i,
        l,
        void 0,
        e,
        !0
      )) : delete u[l]);
    if (o !== i)
      for (const l in o)
        (!t || !ae(t, l)) && (delete o[l], c = !0);
  }
  c && Lt(e.attrs, "set", ""), process.env.NODE_ENV !== "production" && Ol(t || {}, u, e);
}
function $l(e, t, n, r) {
  const [u, o] = e.propsOptions;
  let s = !1, i;
  if (t)
    for (let a in t) {
      if (Sr(a))
        continue;
      const c = t[a];
      let f;
      u && ae(u, f = Ct(a)) ? !o || !o.includes(f) ? n[f] = c : (i || (i = {}))[f] = c : po(e.emitsOptions, a) || (!(a in r) || c !== r[a]) && (r[a] = c, s = !0);
    }
  if (o) {
    const a = oe(n), c = i || ge;
    for (let f = 0; f < o.length; f++) {
      const l = o[f];
      n[l] = ds(
        u,
        a,
        l,
        c[l],
        e,
        !ae(c, l)
      );
    }
  }
  return s;
}
function ds(e, t, n, r, u, o) {
  const s = e[n];
  if (s != null) {
    const i = ae(s, "default");
    if (i && r === void 0) {
      const a = s.default;
      if (s.type !== Function && !s.skipFactory && te(a)) {
        const { propsDefaults: c } = u;
        if (n in c)
          r = c[n];
        else {
          const f = nu(u);
          r = c[n] = a.call(
            null,
            t
          ), f();
        }
      } else
        r = a;
      u.ce && u.ce._setProp(n, r);
    }
    s[
      0
      /* shouldCast */
    ] && (o && !i ? r = !1 : s[
      1
      /* shouldCastTrue */
    ] && (r === "" || r === _n(n)) && (r = !0));
  }
  return r;
}
const Xp = /* @__PURE__ */ new WeakMap();
function Nl(e, t, n = !1) {
  const r = n ? Xp : t.propsCache, u = r.get(e);
  if (u)
    return u;
  const o = e.props, s = {}, i = [];
  let a = !1;
  if (!te(e)) {
    const f = (l) => {
      a = !0;
      const [d, p] = Nl(l, t, !0);
      Re(s, d), p && i.push(...p);
    };
    !n && t.mixins.length && t.mixins.forEach(f), e.extends && f(e.extends), e.mixins && e.mixins.forEach(f);
  }
  if (!o && !a)
    return pe(e) && r.set(e, Qn), Qn;
  if (Q(o))
    for (let f = 0; f < o.length; f++) {
      process.env.NODE_ENV !== "production" && !Ie(o[f]) && R("props must be strings when using array syntax.", o[f]);
      const l = Ct(o[f]);
      Ri(l) && (s[l] = ge);
    }
  else if (o) {
    process.env.NODE_ENV !== "production" && !pe(o) && R("invalid props options", o);
    for (const f in o) {
      const l = Ct(f);
      if (Ri(l)) {
        const d = o[f], p = s[l] = Q(d) || te(d) ? { type: d } : Re({}, d), m = p.type;
        let v = !1, _ = !0;
        if (Q(m))
          for (let A = 0; A < m.length; ++A) {
            const E = m[A], h = te(E) && E.name;
            if (h === "Boolean") {
              v = !0;
              break;
            } else h === "String" && (_ = !1);
          }
        else
          v = te(m) && m.name === "Boolean";
        p[
          0
          /* shouldCast */
        ] = v, p[
          1
          /* shouldCastTrue */
        ] = _, (v || ae(p, "default")) && i.push(l);
      }
    }
  }
  const c = [s, i];
  return pe(e) && r.set(e, c), c;
}
function Ri(e) {
  return e[0] !== "$" && !Sr(e) ? !0 : (process.env.NODE_ENV !== "production" && R(`Invalid prop name: "${e}" is a reserved property.`), !1);
}
function Qp(e) {
  return e === null ? "null" : typeof e == "function" ? e.name || "" : typeof e == "object" && e.constructor && e.constructor.name || "";
}
function Ol(e, t, n) {
  const r = oe(t), u = n.propsOptions[0], o = Object.keys(e).map((s) => Ct(s));
  for (const s in u) {
    let i = u[s];
    i != null && eh(
      s,
      r[s],
      i,
      process.env.NODE_ENV !== "production" ? Vt(r) : r,
      !o.includes(s)
    );
  }
}
function eh(e, t, n, r, u) {
  const { type: o, required: s, validator: i, skipCheck: a } = n;
  if (s && u) {
    R('Missing required prop: "' + e + '"');
    return;
  }
  if (!(t == null && !s)) {
    if (o != null && o !== !0 && !a) {
      let c = !1;
      const f = Q(o) ? o : [o], l = [];
      for (let d = 0; d < f.length && !c; d++) {
        const { valid: p, expectedType: m } = nh(t, f[d]);
        l.push(m || ""), c = p;
      }
      if (!c) {
        R(rh(e, t, l));
        return;
      }
    }
    i && !i(t, r) && R('Invalid prop: custom validator check failed for prop "' + e + '".');
  }
}
const th = /* @__PURE__ */ an(
  "String,Number,Boolean,Function,Symbol,BigInt"
);
function nh(e, t) {
  let n;
  const r = Qp(t);
  if (r === "null")
    n = e === null;
  else if (th(r)) {
    const u = typeof e;
    n = u === r.toLowerCase(), !n && u === "object" && (n = e instanceof t);
  } else r === "Object" ? n = pe(e) : r === "Array" ? n = Q(e) : n = e instanceof t;
  return {
    valid: n,
    expectedType: r
  };
}
function rh(e, t, n) {
  if (n.length === 0)
    return `Prop type [] for prop "${e}" won't match anything. Did you mean to use type Array instead?`;
  let r = `Invalid prop: type check failed for prop "${e}". Expected ${n.map(so).join(" | ")}`;
  const u = n[0], o = zs(t), s = ji(t, u), i = ji(t, o);
  return n.length === 1 && Li(u) && !uh(u, o) && (r += ` with value ${s}`), r += `, got ${o} `, Li(o) && (r += `with value ${i}.`), r;
}
function ji(e, t) {
  return t === "String" ? `"${e}"` : t === "Number" ? `${Number(e)}` : `${e}`;
}
function Li(e) {
  return ["string", "number", "boolean"].some((n) => e.toLowerCase() === n);
}
function uh(...e) {
  return e.some((t) => t.toLowerCase() === "boolean");
}
const Ks = (e) => e === "_" || e === "_ctx" || e === "$stable", Ys = (e) => Q(e) ? e.map(kt) : [kt(e)], oh = (e, t, n) => {
  if (t._n)
    return t;
  const r = Ep((...u) => (process.env.NODE_ENV !== "production" && qe && !(n === null && dt) && !(n && n.root !== qe.root) && R(
    `Slot "${e}" invoked outside of the render function: this will not track dependencies used in the slot. Invoke the slot function inside the render function instead.`
  ), Ys(t(...u))), n);
  return r._c = !1, r;
}, Il = (e, t, n) => {
  const r = e._ctx;
  for (const u in e) {
    if (Ks(u)) continue;
    const o = e[u];
    if (te(o))
      t[u] = oh(u, o, r);
    else if (o != null) {
      process.env.NODE_ENV !== "production" && R(
        `Non-function value encountered for slot "${u}". Prefer function slots for better performance.`
      );
      const s = Ys(o);
      t[u] = () => s;
    }
  }
}, Tl = (e, t) => {
  process.env.NODE_ENV !== "production" && !Ws(e.vnode) && R(
    "Non-function value encountered for default slot. Prefer function slots for better performance."
  );
  const n = Ys(t);
  e.slots.default = () => n;
}, ps = (e, t, n) => {
  for (const r in t)
    (n || !Ks(r)) && (e[r] = t[r]);
}, sh = (e, t, n) => {
  const r = e.slots = Dl();
  if (e.vnode.shapeFlag & 32) {
    const u = t._;
    u ? (ps(r, t, n), n && Iu(r, "_", u, !0)) : Il(t, r);
  } else t && Tl(e, t);
}, ih = (e, t, n) => {
  const { vnode: r, slots: u } = e;
  let o = !0, s = ge;
  if (r.shapeFlag & 32) {
    const i = t._;
    i ? process.env.NODE_ENV !== "production" && Bt ? (ps(u, t, n), Lt(e, "set", "$slots")) : n && i === 1 ? o = !1 : ps(u, t, n) : (o = !t.$stable, Il(t, u)), s = t;
  } else t && (Tl(e, t), s = { default: 1 });
  if (o)
    for (const i in u)
      !Ks(i) && s[i] == null && delete u[i];
};
let Er, tn;
function Hn(e, t) {
  e.appContext.config.performance && Vu() && tn.mark(`vue-${t}-${e.uid}`), process.env.NODE_ENV !== "production" && _p(e, t, Vu() ? tn.now() : Date.now());
}
function qn(e, t) {
  if (e.appContext.config.performance && Vu()) {
    const n = `vue-${t}-${e.uid}`, r = n + ":end", u = `<${ho(e, e.type)}> ${t}`;
    tn.mark(r), tn.measure(u, n, r), tn.clearMeasures(u), tn.clearMarks(n), tn.clearMarks(r);
  }
  process.env.NODE_ENV !== "production" && yp(e, t, Vu() ? tn.now() : Date.now());
}
function Vu() {
  return Er !== void 0 || (typeof window < "u" && window.performance ? (Er = !0, tn = window.performance) : Er = !1), Er;
}
function ah() {
  const e = [];
  if (process.env.NODE_ENV !== "production" && e.length) {
    const t = e.length > 1;
    console.warn(
      `Feature flag${t ? "s" : ""} ${e.join(", ")} ${t ? "are" : "is"} not explicitly defined. You are running the esm-bundler build of Vue, which expects these compile-time feature flags to be globally injected via the bundler config in order to get better tree-shaking in the production bundle.

For more details, see https://link.vuejs.org/feature-flags.`
    );
  }
}
const ft = kh;
function ch(e) {
  return lh(e);
}
function lh(e, t) {
  ah();
  const n = Kr();
  n.__VUE__ = !0, process.env.NODE_ENV !== "production" && Hs(n.__VUE_DEVTOOLS_GLOBAL_HOOK__, n);
  const {
    insert: r,
    remove: u,
    patchProp: o,
    createElement: s,
    createText: i,
    createComment: a,
    setText: c,
    setElementText: f,
    parentNode: l,
    nextSibling: d,
    setScopeId: p = Le,
    insertStaticContent: m
  } = e, v = (b, x, D, T = null, I = null, O = null, L = void 0, P = null, M = process.env.NODE_ENV !== "production" && Bt ? !1 : !!x.dynamicChildren) => {
    if (b === x)
      return;
    b && !kr(b, x) && (T = Yt(b), Je(b, I, O, !0), b = null), x.patchFlag === -2 && (M = !1, x.dynamicChildren = null);
    const { type: F, ref: ee, shapeFlag: V } = x;
    switch (F) {
      case tu:
        _(b, x, D, T);
        break;
      case ht:
        A(b, x, D, T);
        break;
      case Cu:
        b == null ? E(x, D, T, L) : process.env.NODE_ENV !== "production" && h(b, x, D, L);
        break;
      case tt:
        G(
          b,
          x,
          D,
          T,
          I,
          O,
          L,
          P,
          M
        );
        break;
      default:
        V & 1 ? y(
          b,
          x,
          D,
          T,
          I,
          O,
          L,
          P,
          M
        ) : V & 6 ? q(
          b,
          x,
          D,
          T,
          I,
          O,
          L,
          P,
          M
        ) : V & 64 || V & 128 ? F.process(
          b,
          x,
          D,
          T,
          I,
          O,
          L,
          P,
          M,
          Xt
        ) : process.env.NODE_ENV !== "production" && R("Invalid VNode type:", F, `(${typeof F})`);
    }
    ee != null && I ? Or(ee, b && b.ref, O, x || b, !x) : ee == null && b && b.ref != null && Or(b.ref, null, O, b, !0);
  }, _ = (b, x, D, T) => {
    if (b == null)
      r(
        x.el = i(x.children),
        D,
        T
      );
    else {
      const I = x.el = b.el;
      x.children !== b.children && c(I, x.children);
    }
  }, A = (b, x, D, T) => {
    b == null ? r(
      x.el = a(x.children || ""),
      D,
      T
    ) : x.el = b.el;
  }, E = (b, x, D, T) => {
    [b.el, b.anchor] = m(
      b.children,
      x,
      D,
      T,
      b.el,
      b.anchor
    );
  }, h = (b, x, D, T) => {
    if (x.children !== b.children) {
      const I = d(b.anchor);
      g(b), [x.el, x.anchor] = m(
        x.children,
        D,
        I,
        T
      );
    } else
      x.el = b.el, x.anchor = b.anchor;
  }, w = ({ el: b, anchor: x }, D, T) => {
    let I;
    for (; b && b !== x; )
      I = d(b), r(b, D, T), b = I;
    r(x, D, T);
  }, g = ({ el: b, anchor: x }) => {
    let D;
    for (; b && b !== x; )
      D = d(b), u(b), b = D;
    u(x);
  }, y = (b, x, D, T, I, O, L, P, M) => {
    x.type === "svg" ? L = "svg" : x.type === "math" && (L = "mathml"), b == null ? C(
      x,
      D,
      T,
      I,
      O,
      L,
      P,
      M
    ) : W(
      b,
      x,
      I,
      O,
      L,
      P,
      M
    );
  }, C = (b, x, D, T, I, O, L, P) => {
    let M, F;
    const { props: ee, shapeFlag: V, transition: Y, dirs: re } = b;
    if (M = b.el = s(
      b.type,
      O,
      ee && ee.is,
      ee
    ), V & 8 ? f(M, b.children) : V & 16 && Z(
      b.children,
      M,
      null,
      T,
      I,
      Io(b, O),
      L,
      P
    ), re && Dn(b, null, T, "created"), k(M, b, b.scopeId, L, T), ee) {
      for (const ve in ee)
        ve !== "value" && !Sr(ve) && o(M, ve, null, ee[ve], O, T);
      "value" in ee && o(M, "value", null, ee.value, O), (F = ee.onVnodeBeforeMount) && Pt(F, T, b);
    }
    process.env.NODE_ENV !== "production" && (Iu(M, "__vnode", b, !0), Iu(M, "__vueParentComponent", T, !0)), re && Dn(b, null, T, "beforeMount");
    const ie = fh(I, Y);
    ie && Y.beforeEnter(M), r(M, x, D), ((F = ee && ee.onVnodeMounted) || ie || re) && ft(() => {
      F && Pt(F, T, b), ie && Y.enter(M), re && Dn(b, null, T, "mounted");
    }, I);
  }, k = (b, x, D, T, I) => {
    if (D && p(b, D), T)
      for (let O = 0; O < T.length; O++)
        p(b, T[O]);
    if (I) {
      let O = I.subTree;
      if (process.env.NODE_ENV !== "production" && O.patchFlag > 0 && O.patchFlag & 2048 && (O = Xs(O.children) || O), x === O || jl(O.type) && (O.ssContent === x || O.ssFallback === x)) {
        const L = I.vnode;
        k(
          b,
          L,
          L.scopeId,
          L.slotScopeIds,
          I.parent
        );
      }
    }
  }, Z = (b, x, D, T, I, O, L, P, M = 0) => {
    for (let F = M; F < b.length; F++) {
      const ee = b[F] = P ? fn(b[F]) : kt(b[F]);
      v(
        null,
        ee,
        x,
        D,
        T,
        I,
        O,
        L,
        P
      );
    }
  }, W = (b, x, D, T, I, O, L) => {
    const P = x.el = b.el;
    process.env.NODE_ENV !== "production" && (P.__vnode = x);
    let { patchFlag: M, dynamicChildren: F, dirs: ee } = x;
    M |= b.patchFlag & 16;
    const V = b.props || ge, Y = x.props || ge;
    let re;
    if (D && Sn(D, !1), (re = Y.onVnodeBeforeUpdate) && Pt(re, D, x, b), ee && Dn(x, b, D, "beforeUpdate"), D && Sn(D, !0), process.env.NODE_ENV !== "production" && Bt && (M = 0, L = !1, F = null), (V.innerHTML && Y.innerHTML == null || V.textContent && Y.textContent == null) && f(P, ""), F ? (K(
      b.dynamicChildren,
      F,
      P,
      D,
      T,
      Io(x, I),
      O
    ), process.env.NODE_ENV !== "production" && wu(b, x)) : L || ne(
      b,
      x,
      P,
      null,
      D,
      T,
      Io(x, I),
      O,
      !1
    ), M > 0) {
      if (M & 16)
        B(P, V, Y, D, I);
      else if (M & 2 && V.class !== Y.class && o(P, "class", null, Y.class, I), M & 4 && o(P, "style", V.style, Y.style, I), M & 8) {
        const ie = x.dynamicProps;
        for (let ve = 0; ve < ie.length; ve++) {
          const me = ie[ve], ut = V[me], ot = Y[me];
          (ot !== ut || me === "value") && o(P, me, ut, ot, I, D);
        }
      }
      M & 1 && b.children !== x.children && f(P, x.children);
    } else !L && F == null && B(P, V, Y, D, I);
    ((re = Y.onVnodeUpdated) || ee) && ft(() => {
      re && Pt(re, D, x, b), ee && Dn(x, b, D, "updated");
    }, T);
  }, K = (b, x, D, T, I, O, L) => {
    for (let P = 0; P < x.length; P++) {
      const M = b[P], F = x[P], ee = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        M.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (M.type === tt || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !kr(M, F) || // - In the case of a component, it could contain anything.
        M.shapeFlag & 198) ? l(M.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          D
        )
      );
      v(
        M,
        F,
        ee,
        null,
        T,
        I,
        O,
        L,
        !0
      );
    }
  }, B = (b, x, D, T, I) => {
    if (x !== D) {
      if (x !== ge)
        for (const O in x)
          !Sr(O) && !(O in D) && o(
            b,
            O,
            x[O],
            null,
            I,
            T
          );
      for (const O in D) {
        if (Sr(O)) continue;
        const L = D[O], P = x[O];
        L !== P && O !== "value" && o(b, O, P, L, I, T);
      }
      "value" in D && o(b, "value", x.value, D.value, I);
    }
  }, G = (b, x, D, T, I, O, L, P, M) => {
    const F = x.el = b ? b.el : i(""), ee = x.anchor = b ? b.anchor : i("");
    let { patchFlag: V, dynamicChildren: Y, slotScopeIds: re } = x;
    process.env.NODE_ENV !== "production" && // #5523 dev root fragment may inherit directives
    (Bt || V & 2048) && (V = 0, M = !1, Y = null), re && (P = P ? P.concat(re) : re), b == null ? (r(F, D, T), r(ee, D, T), Z(
      // #10007
      // such fragment like `<></>` will be compiled into
      // a fragment which doesn't have a children.
      // In this case fallback to an empty array
      x.children || [],
      D,
      ee,
      I,
      O,
      L,
      P,
      M
    )) : V > 0 && V & 64 && Y && // #2715 the previous fragment could've been a BAILed one as a result
    // of renderSlot() with no valid children
    b.dynamicChildren ? (K(
      b.dynamicChildren,
      Y,
      D,
      I,
      O,
      L,
      P
    ), process.env.NODE_ENV !== "production" ? wu(b, x) : (
      // #2080 if the stable fragment has a key, it's a <template v-for> that may
      //  get moved around. Make sure all root level vnodes inherit el.
      // #2134 or if it's a component root, it may also get moved around
      // as the component is being moved.
      (x.key != null || I && x === I.subTree) && wu(
        b,
        x,
        !0
        /* shallow */
      )
    )) : ne(
      b,
      x,
      D,
      ee,
      I,
      O,
      L,
      P,
      M
    );
  }, q = (b, x, D, T, I, O, L, P, M) => {
    x.slotScopeIds = P, b == null ? x.shapeFlag & 512 ? I.ctx.activate(
      x,
      D,
      T,
      L,
      M
    ) : H(
      x,
      D,
      T,
      I,
      O,
      L,
      M
    ) : N(b, x, M);
  }, H = (b, x, D, T, I, O, L) => {
    const P = b.component = Oh(
      b,
      T,
      I
    );
    if (process.env.NODE_ENV !== "production" && P.type.__hmrId && lp(P), process.env.NODE_ENV !== "production" && (xu(b), Hn(P, "mount")), Ws(b) && (P.ctx.renderer = Xt), process.env.NODE_ENV !== "production" && Hn(P, "init"), Th(P, !1, L), process.env.NODE_ENV !== "production" && qn(P, "init"), process.env.NODE_ENV !== "production" && Bt && (b.el = null), P.asyncDep) {
      if (I && I.registerDep(P, z, L), !b.el) {
        const M = P.subTree = Ee(ht);
        A(null, M, x, D), b.placeholder = M.el;
      }
    } else
      z(
        P,
        b,
        x,
        D,
        I,
        O,
        L
      );
    process.env.NODE_ENV !== "production" && (Eu(), qn(P, "mount"));
  }, N = (b, x, D) => {
    const T = x.component = b.component;
    if (xh(b, x, D))
      if (T.asyncDep && !T.asyncResolved) {
        process.env.NODE_ENV !== "production" && xu(x), $(T, x, D), process.env.NODE_ENV !== "production" && Eu();
        return;
      } else
        T.next = x, T.update();
    else
      x.el = b.el, T.vnode = x;
  }, z = (b, x, D, T, I, O, L) => {
    const P = () => {
      if (b.isMounted) {
        let { next: V, bu: Y, u: re, parent: ie, vnode: ve } = b;
        {
          const zt = Fl(b);
          if (zt) {
            V && (V.el = ve.el, $(b, V, L)), zt.asyncDep.then(() => {
              b.isUnmounted || P();
            });
            return;
          }
        }
        let me = V, ut;
        process.env.NODE_ENV !== "production" && xu(V || b.vnode), Sn(b, !1), V ? (V.el = ve.el, $(b, V, L)) : V = ve, Y && yr(Y), (ut = V.props && V.props.onVnodeBeforeUpdate) && Pt(ut, ie, V, ve), Sn(b, !0), process.env.NODE_ENV !== "production" && Hn(b, "render");
        const ot = Vi(b);
        process.env.NODE_ENV !== "production" && qn(b, "render");
        const Ft = b.subTree;
        b.subTree = ot, process.env.NODE_ENV !== "production" && Hn(b, "patch"), v(
          Ft,
          ot,
          // parent may have changed if it's in a teleport
          l(Ft.el),
          // anchor may have changed if it's in a fragment
          Yt(Ft),
          b,
          I,
          O
        ), process.env.NODE_ENV !== "production" && qn(b, "patch"), V.el = ot.el, me === null && Eh(b, ot.el), re && ft(re, I), (ut = V.props && V.props.onVnodeUpdated) && ft(
          () => Pt(ut, ie, V, ve),
          I
        ), process.env.NODE_ENV !== "production" && ml(b), process.env.NODE_ENV !== "production" && Eu();
      } else {
        let V;
        const { el: Y, props: re } = x, { bm: ie, m: ve, parent: me, root: ut, type: ot } = b, Ft = Ir(x);
        Sn(b, !1), ie && yr(ie), !Ft && (V = re && re.onVnodeBeforeMount) && Pt(V, me, x), Sn(b, !0);
        {
          ut.ce && // @ts-expect-error _def is private
          ut.ce._def.shadowRoot !== !1 && ut.ce._injectChildStyle(ot), process.env.NODE_ENV !== "production" && Hn(b, "render");
          const zt = b.subTree = Vi(b);
          process.env.NODE_ENV !== "production" && qn(b, "render"), process.env.NODE_ENV !== "production" && Hn(b, "patch"), v(
            null,
            zt,
            D,
            T,
            b,
            I,
            O
          ), process.env.NODE_ENV !== "production" && qn(b, "patch"), x.el = zt.el;
        }
        if (ve && ft(ve, I), !Ft && (V = re && re.onVnodeMounted)) {
          const zt = x;
          ft(
            () => Pt(V, me, zt),
            I
          );
        }
        (x.shapeFlag & 256 || me && Ir(me.vnode) && me.vnode.shapeFlag & 256) && b.a && ft(b.a, I), b.isMounted = !0, process.env.NODE_ENV !== "production" && gp(b), x = D = T = null;
      }
    };
    b.scope.on();
    const M = b.effect = new Uc(P);
    b.scope.off();
    const F = b.update = M.run.bind(M), ee = b.job = M.runIfDirty.bind(M);
    ee.i = b, ee.id = b.uid, M.scheduler = () => lo(ee), Sn(b, !0), process.env.NODE_ENV !== "production" && (M.onTrack = b.rtc ? (V) => yr(b.rtc, V) : void 0, M.onTrigger = b.rtg ? (V) => yr(b.rtg, V) : void 0), F();
  }, $ = (b, x, D) => {
    x.component = b;
    const T = b.vnode.props;
    b.vnode = x, b.next = null, Yp(b, x.props, T, D), ih(b, x.children, D), $t(), Ni(b), Nt();
  }, ne = (b, x, D, T, I, O, L, P, M = !1) => {
    const F = b && b.children, ee = b ? b.shapeFlag : 0, V = x.children, { patchFlag: Y, shapeFlag: re } = x;
    if (Y > 0) {
      if (Y & 128) {
        ze(
          F,
          V,
          D,
          T,
          I,
          O,
          L,
          P,
          M
        );
        return;
      } else if (Y & 256) {
        fe(
          F,
          V,
          D,
          T,
          I,
          O,
          L,
          P,
          M
        );
        return;
      }
    }
    re & 8 ? (ee & 16 && An(F, I, O), V !== F && f(D, V)) : ee & 16 ? re & 16 ? ze(
      F,
      V,
      D,
      T,
      I,
      O,
      L,
      P,
      M
    ) : An(F, I, O, !0) : (ee & 8 && f(D, ""), re & 16 && Z(
      V,
      D,
      T,
      I,
      O,
      L,
      P,
      M
    ));
  }, fe = (b, x, D, T, I, O, L, P, M) => {
    b = b || Qn, x = x || Qn;
    const F = b.length, ee = x.length, V = Math.min(F, ee);
    let Y;
    for (Y = 0; Y < V; Y++) {
      const re = x[Y] = M ? fn(x[Y]) : kt(x[Y]);
      v(
        b[Y],
        re,
        D,
        null,
        I,
        O,
        L,
        P,
        M
      );
    }
    F > ee ? An(
      b,
      I,
      O,
      !0,
      !1,
      V
    ) : Z(
      x,
      D,
      T,
      I,
      O,
      L,
      P,
      M,
      V
    );
  }, ze = (b, x, D, T, I, O, L, P, M) => {
    let F = 0;
    const ee = x.length;
    let V = b.length - 1, Y = ee - 1;
    for (; F <= V && F <= Y; ) {
      const re = b[F], ie = x[F] = M ? fn(x[F]) : kt(x[F]);
      if (kr(re, ie))
        v(
          re,
          ie,
          D,
          null,
          I,
          O,
          L,
          P,
          M
        );
      else
        break;
      F++;
    }
    for (; F <= V && F <= Y; ) {
      const re = b[V], ie = x[Y] = M ? fn(x[Y]) : kt(x[Y]);
      if (kr(re, ie))
        v(
          re,
          ie,
          D,
          null,
          I,
          O,
          L,
          P,
          M
        );
      else
        break;
      V--, Y--;
    }
    if (F > V) {
      if (F <= Y) {
        const re = Y + 1, ie = re < ee ? x[re].el : T;
        for (; F <= Y; )
          v(
            null,
            x[F] = M ? fn(x[F]) : kt(x[F]),
            D,
            ie,
            I,
            O,
            L,
            P,
            M
          ), F++;
      }
    } else if (F > Y)
      for (; F <= V; )
        Je(b[F], I, O, !0), F++;
    else {
      const re = F, ie = F, ve = /* @__PURE__ */ new Map();
      for (F = ie; F <= Y; F++) {
        const Ge = x[F] = M ? fn(x[F]) : kt(x[F]);
        Ge.key != null && (process.env.NODE_ENV !== "production" && ve.has(Ge.key) && R(
          "Duplicate keys found during update:",
          JSON.stringify(Ge.key),
          "Make sure keys are unique."
        ), ve.set(Ge.key, F));
      }
      let me, ut = 0;
      const ot = Y - ie + 1;
      let Ft = !1, zt = 0;
      const _r = new Array(ot);
      for (F = 0; F < ot; F++) _r[F] = 0;
      for (F = re; F <= V; F++) {
        const Ge = b[F];
        if (ut >= ot) {
          Je(Ge, I, O, !0);
          continue;
        }
        let Mt;
        if (Ge.key != null)
          Mt = ve.get(Ge.key);
        else
          for (me = ie; me <= Y; me++)
            if (_r[me - ie] === 0 && kr(Ge, x[me])) {
              Mt = me;
              break;
            }
        Mt === void 0 ? Je(Ge, I, O, !0) : (_r[Mt - ie] = F + 1, Mt >= zt ? zt = Mt : Ft = !0, v(
          Ge,
          x[Mt],
          D,
          null,
          I,
          O,
          L,
          P,
          M
        ), ut++);
      }
      const ki = Ft ? dh(_r) : Qn;
      for (me = ki.length - 1, F = ot - 1; F >= 0; F--) {
        const Ge = ie + F, Mt = x[Ge], wi = x[Ge + 1], Ci = Ge + 1 < ee ? (
          // #13559, fallback to el placeholder for unresolved async component
          wi.el || wi.placeholder
        ) : T;
        _r[F] === 0 ? v(
          null,
          Mt,
          D,
          Ci,
          I,
          O,
          L,
          P,
          M
        ) : Ft && (me < 0 || F !== ki[me] ? Se(Mt, D, Ci, 2) : me--);
      }
    }
  }, Se = (b, x, D, T, I = null) => {
    const { el: O, type: L, transition: P, children: M, shapeFlag: F } = b;
    if (F & 6) {
      Se(b.component.subTree, x, D, T);
      return;
    }
    if (F & 128) {
      b.suspense.move(x, D, T);
      return;
    }
    if (F & 64) {
      L.move(b, x, D, Xt);
      return;
    }
    if (L === tt) {
      r(O, x, D);
      for (let V = 0; V < M.length; V++)
        Se(M[V], x, D, T);
      r(b.anchor, x, D);
      return;
    }
    if (L === Cu) {
      w(b, x, D);
      return;
    }
    if (T !== 2 && F & 1 && P)
      if (T === 0)
        P.beforeEnter(O), r(O, x, D), ft(() => P.enter(O), I);
      else {
        const { leave: V, delayLeave: Y, afterLeave: re } = P, ie = () => {
          b.ctx.isUnmounted ? u(O) : r(O, x, D);
        }, ve = () => {
          O._isLeaving && O[Cp](
            !0
            /* cancelled */
          ), V(O, () => {
            ie(), re && re();
          });
        };
        Y ? Y(O, ie, ve) : ve();
      }
    else
      r(O, x, D);
  }, Je = (b, x, D, T = !1, I = !1) => {
    const {
      type: O,
      props: L,
      ref: P,
      children: M,
      dynamicChildren: F,
      shapeFlag: ee,
      patchFlag: V,
      dirs: Y,
      cacheIndex: re
    } = b;
    if (V === -2 && (I = !1), P != null && ($t(), Or(P, null, D, b, !0), Nt()), re != null && (x.renderCache[re] = void 0), ee & 256) {
      x.ctx.deactivate(b);
      return;
    }
    const ie = ee & 1 && Y, ve = !Ir(b);
    let me;
    if (ve && (me = L && L.onVnodeBeforeUnmount) && Pt(me, x, b), ee & 6)
      br(b.component, D, T);
    else {
      if (ee & 128) {
        b.suspense.unmount(D, T);
        return;
      }
      ie && Dn(b, null, x, "beforeUnmount"), ee & 64 ? b.type.remove(
        b,
        x,
        D,
        Xt,
        T
      ) : F && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !F.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (O !== tt || V > 0 && V & 64) ? An(
        F,
        x,
        D,
        !1,
        !0
      ) : (O === tt && V & 384 || !I && ee & 16) && An(M, x, D), T && We(b);
    }
    (ve && (me = L && L.onVnodeUnmounted) || ie) && ft(() => {
      me && Pt(me, x, b), ie && Dn(b, null, x, "unmounted");
    }, D);
  }, We = (b) => {
    const { type: x, el: D, anchor: T, transition: I } = b;
    if (x === tt) {
      process.env.NODE_ENV !== "production" && b.patchFlag > 0 && b.patchFlag & 2048 && I && !I.persisted ? b.children.forEach((L) => {
        L.type === ht ? u(L.el) : We(L);
      }) : lt(D, T);
      return;
    }
    if (x === Cu) {
      g(b);
      return;
    }
    const O = () => {
      u(D), I && !I.persisted && I.afterLeave && I.afterLeave();
    };
    if (b.shapeFlag & 1 && I && !I.persisted) {
      const { leave: L, delayLeave: P } = I, M = () => L(D, O);
      P ? P(b.el, O, M) : M();
    } else
      O();
  }, lt = (b, x) => {
    let D;
    for (; b !== x; )
      D = d(b), u(b), b = D;
    u(x);
  }, br = (b, x, D) => {
    process.env.NODE_ENV !== "production" && b.type.__hmrId && fp(b);
    const { bum: T, scope: I, job: O, subTree: L, um: P, m: M, a: F } = b;
    Zi(M), Zi(F), T && yr(T), I.stop(), O && (O.flags |= 8, Je(L, b, x, D)), P && ft(P, x), ft(() => {
      b.isUnmounted = !0;
    }, x), process.env.NODE_ENV !== "production" && vp(b);
  }, An = (b, x, D, T = !1, I = !1, O = 0) => {
    for (let L = O; L < b.length; L++)
      Je(b[L], x, D, T, I);
  }, Yt = (b) => {
    if (b.shapeFlag & 6)
      return Yt(b.component.subTree);
    if (b.shapeFlag & 128)
      return b.suspense.next();
    const x = d(b.anchor || b.el), D = x && x[kp];
    return D ? d(D) : x;
  };
  let vr = !1;
  const cu = (b, x, D) => {
    b == null ? x._vnode && Je(x._vnode, null, null, !0) : v(
      x._vnode || null,
      b,
      x,
      null,
      null,
      null,
      D
    ), x._vnode = b, vr || (vr = !0, Ni(), dl(), vr = !1);
  }, Xt = {
    p: v,
    um: Je,
    m: Se,
    r: We,
    mt: H,
    mc: Z,
    pc: ne,
    pbc: K,
    n: Yt,
    o: e
  };
  return {
    render: cu,
    hydrate: void 0,
    createApp: Wp(cu)
  };
}
function Io({ type: e, props: t }, n) {
  return n === "svg" && e === "foreignObject" || n === "mathml" && e === "annotation-xml" && t && t.encoding && t.encoding.includes("html") ? void 0 : n;
}
function Sn({ effect: e, job: t }, n) {
  n ? (e.flags |= 32, t.flags |= 4) : (e.flags &= -33, t.flags &= -5);
}
function fh(e, t) {
  return (!e || e && !e.pendingBranch) && t && !t.persisted;
}
function wu(e, t, n = !1) {
  const r = e.children, u = t.children;
  if (Q(r) && Q(u))
    for (let o = 0; o < r.length; o++) {
      const s = r[o];
      let i = u[o];
      i.shapeFlag & 1 && !i.dynamicChildren && ((i.patchFlag <= 0 || i.patchFlag === 32) && (i = u[o] = fn(u[o]), i.el = s.el), !n && i.patchFlag !== -2 && wu(s, i)), i.type === tu && // avoid cached text nodes retaining detached dom nodes
      i.patchFlag !== -1 && (i.el = s.el), i.type === ht && !i.el && (i.el = s.el), process.env.NODE_ENV !== "production" && i.el && (i.el.__vnode = i);
    }
}
function dh(e) {
  const t = e.slice(), n = [0];
  let r, u, o, s, i;
  const a = e.length;
  for (r = 0; r < a; r++) {
    const c = e[r];
    if (c !== 0) {
      if (u = n[n.length - 1], e[u] < c) {
        t[r] = u, n.push(r);
        continue;
      }
      for (o = 0, s = n.length - 1; o < s; )
        i = o + s >> 1, e[n[i]] < c ? o = i + 1 : s = i;
      c < e[n[o]] && (o > 0 && (t[r] = n[o - 1]), n[o] = r);
    }
  }
  for (o = n.length, s = n[o - 1]; o-- > 0; )
    n[o] = s, s = t[s];
  return n;
}
function Fl(e) {
  const t = e.subTree.component;
  if (t)
    return t.asyncDep && !t.asyncResolved ? t : Fl(t);
}
function Zi(e) {
  if (e)
    for (let t = 0; t < e.length; t++)
      e[t].flags |= 8;
}
const ph = Symbol.for("v-scx"), hh = () => {
  {
    const e = le(ph);
    return e || process.env.NODE_ENV !== "production" && R(
      "Server rendering context not provided. Make sure to only call useSSRContext() conditionally in the server build."
    ), e;
  }
};
function Pe(e, t, n) {
  return process.env.NODE_ENV !== "production" && !te(t) && R(
    "`watch(fn, options?)` signature has been moved to a separate API. Use `watchEffect(fn, options?)` instead. `watch` now only supports `watch(source, cb, options?) signature."
  ), zl(e, t, n);
}
function zl(e, t, n = ge) {
  const { immediate: r, deep: u, flush: o, once: s } = n;
  process.env.NODE_ENV !== "production" && !t && (r !== void 0 && R(
    'watch() "immediate" option is only respected when using the watch(source, callback, options?) signature.'
  ), u !== void 0 && R(
    'watch() "deep" option is only respected when using the watch(source, callback, options?) signature.'
  ), s !== void 0 && R(
    'watch() "once" option is only respected when using the watch(source, callback, options?) signature.'
  ));
  const i = Re({}, n);
  process.env.NODE_ENV !== "production" && (i.onWarn = R);
  const a = t && r || !t && o !== "post";
  let c;
  if (Rr) {
    if (o === "sync") {
      const p = hh();
      c = p.__watcherHandles || (p.__watcherHandles = []);
    } else if (!a) {
      const p = () => {
      };
      return p.stop = Le, p.resume = Le, p.pause = Le, p;
    }
  }
  const f = qe;
  i.call = (p, m, v) => Jt(p, f, m, v);
  let l = !1;
  o === "post" ? i.scheduler = (p) => {
    ft(p, f && f.suspense);
  } : o !== "sync" && (l = !0, i.scheduler = (p, m) => {
    m ? p() : lo(p);
  }), i.augmentJob = (p) => {
    t && (p.flags |= 4), l && (p.flags |= 2, f && (p.id = f.uid, p.i = f));
  };
  const d = np(e, t, i);
  return Rr && (c ? c.push(d) : a && d()), d;
}
function mh(e, t, n) {
  const r = this.proxy, u = Ie(e) ? e.includes(".") ? Ml(r, e) : () => r[e] : e.bind(r, r);
  let o;
  te(t) ? o = t : (o = t.handler, n = t);
  const s = nu(this), i = zl(u, o.bind(r), n);
  return s(), i;
}
function Ml(e, t) {
  const n = t.split(".");
  return () => {
    let r = e;
    for (let u = 0; u < n.length && r; u++)
      r = r[n[u]];
    return r;
  };
}
const gh = (e, t) => t === "modelValue" || t === "model-value" ? e.modelModifiers : e[`${t}Modifiers`] || e[`${Ct(t)}Modifiers`] || e[`${_n(t)}Modifiers`];
function bh(e, t, ...n) {
  if (e.isUnmounted) return;
  const r = e.vnode.props || ge;
  if (process.env.NODE_ENV !== "production") {
    const {
      emitsOptions: f,
      propsOptions: [l]
    } = e;
    if (f)
      if (!(t in f))
        (!l || !(Tn(Ct(t)) in l)) && R(
          `Component emitted event "${t}" but it is neither declared in the emits option nor as an "${Tn(Ct(t))}" prop.`
        );
      else {
        const d = f[t];
        te(d) && (d(...n) || R(
          `Invalid event arguments: event validation failed for event "${t}".`
        ));
      }
  }
  let u = n;
  const o = t.startsWith("update:"), s = o && gh(r, t.slice(7));
  if (s && (s.trim && (u = n.map((f) => Ie(f) ? f.trim() : f)), s.number && (u = n.map(f0))), process.env.NODE_ENV !== "production" && xp(e, t, u), process.env.NODE_ENV !== "production") {
    const f = t.toLowerCase();
    f !== t && r[Tn(f)] && R(
      `Event "${f}" is emitted in component ${ho(
        e,
        e.type
      )} but the handler is registered for "${t}". Note that HTML attributes are case-insensitive and you cannot use v-on to listen to camelCase events when using in-DOM templates. You should probably use "${_n(
        t
      )}" instead of "${t}".`
    );
  }
  let i, a = r[i = Tn(t)] || // also try camelCase event handler (#2249)
  r[i = Tn(Ct(t))];
  !a && o && (a = r[i = Tn(_n(t))]), a && Jt(
    a,
    e,
    6,
    u
  );
  const c = r[i + "Once"];
  if (c) {
    if (!e.emitted)
      e.emitted = {};
    else if (e.emitted[i])
      return;
    e.emitted[i] = !0, Jt(
      c,
      e,
      6,
      u
    );
  }
}
const vh = /* @__PURE__ */ new WeakMap();
function Pl(e, t, n = !1) {
  const r = n ? vh : t.emitsCache, u = r.get(e);
  if (u !== void 0)
    return u;
  const o = e.emits;
  let s = {}, i = !1;
  if (!te(e)) {
    const a = (c) => {
      const f = Pl(c, t, !0);
      f && (i = !0, Re(s, f));
    };
    !n && t.mixins.length && t.mixins.forEach(a), e.extends && a(e.extends), e.mixins && e.mixins.forEach(a);
  }
  return !o && !i ? (pe(e) && r.set(e, null), null) : (Q(o) ? o.forEach((a) => s[a] = null) : Re(s, o), pe(e) && r.set(e, s), s);
}
function po(e, t) {
  return !e || !Gr(t) ? !1 : (t = t.slice(2).replace(/Once$/, ""), ae(e, t[0].toLowerCase() + t.slice(1)) || ae(e, _n(t)) || ae(e, t));
}
let hs = !1;
function Bu() {
  hs = !0;
}
function Vi(e) {
  const {
    type: t,
    vnode: n,
    proxy: r,
    withProxy: u,
    propsOptions: [o],
    slots: s,
    attrs: i,
    emit: a,
    render: c,
    renderCache: f,
    props: l,
    data: d,
    setupState: p,
    ctx: m,
    inheritAttrs: v
  } = e, _ = ju(e);
  let A, E;
  process.env.NODE_ENV !== "production" && (hs = !1);
  try {
    if (n.shapeFlag & 4) {
      const g = u || r, y = process.env.NODE_ENV !== "production" && p.__isScriptSetup ? new Proxy(g, {
        get(C, k, Z) {
          return R(
            `Property '${String(
              k
            )}' was accessed via 'this'. Avoid using 'this' in templates.`
          ), Reflect.get(C, k, Z);
        }
      }) : g;
      A = kt(
        c.call(
          y,
          g,
          f,
          process.env.NODE_ENV !== "production" ? Vt(l) : l,
          p,
          d,
          m
        )
      ), E = i;
    } else {
      const g = t;
      process.env.NODE_ENV !== "production" && i === l && Bu(), A = kt(
        g.length > 1 ? g(
          process.env.NODE_ENV !== "production" ? Vt(l) : l,
          process.env.NODE_ENV !== "production" ? {
            get attrs() {
              return Bu(), Vt(i);
            },
            slots: s,
            emit: a
          } : { attrs: i, slots: s, emit: a }
        ) : g(
          process.env.NODE_ENV !== "production" ? Vt(l) : l,
          null
        )
      ), E = t.props ? i : _h(i);
    }
  } catch (g) {
    Tr.length = 0, Xr(g, e, 1), A = Ee(ht);
  }
  let h = A, w;
  if (process.env.NODE_ENV !== "production" && A.patchFlag > 0 && A.patchFlag & 2048 && ([h, w] = Rl(A)), E && v !== !1) {
    const g = Object.keys(E), { shapeFlag: y } = h;
    if (g.length) {
      if (y & 7)
        o && g.some(Ou) && (E = yh(
          E,
          o
        )), h = yn(h, E, !1, !0);
      else if (process.env.NODE_ENV !== "production" && !hs && h.type !== ht) {
        const C = Object.keys(i), k = [], Z = [];
        for (let W = 0, K = C.length; W < K; W++) {
          const B = C[W];
          Gr(B) ? Ou(B) || k.push(B[2].toLowerCase() + B.slice(3)) : Z.push(B);
        }
        Z.length && R(
          `Extraneous non-props attributes (${Z.join(", ")}) were passed to component but could not be automatically inherited because component renders fragment or text or teleport root nodes.`
        ), k.length && R(
          `Extraneous non-emits event listeners (${k.join(", ")}) were passed to component but could not be automatically inherited because component renders fragment or text root nodes. If the listener is intended to be a component custom event listener only, declare it using the "emits" option.`
        );
      }
    }
  }
  return n.dirs && (process.env.NODE_ENV !== "production" && !Bi(h) && R(
    "Runtime directive used on component with non-element root node. The directives will not function as intended."
  ), h = yn(h, null, !1, !0), h.dirs = h.dirs ? h.dirs.concat(n.dirs) : n.dirs), n.transition && (process.env.NODE_ENV !== "production" && !Bi(h) && R(
    "Component inside <Transition> renders non-element root node that cannot be animated."
  ), Js(h, n.transition)), process.env.NODE_ENV !== "production" && w ? w(h) : A = h, ju(_), A;
}
const Rl = (e) => {
  const t = e.children, n = e.dynamicChildren, r = Xs(t, !1);
  if (r) {
    if (process.env.NODE_ENV !== "production" && r.patchFlag > 0 && r.patchFlag & 2048)
      return Rl(r);
  } else return [e, void 0];
  const u = t.indexOf(r), o = n ? n.indexOf(r) : -1, s = (i) => {
    t[u] = i, n && (o > -1 ? n[o] = i : i.patchFlag > 0 && (e.dynamicChildren = [...n, i]));
  };
  return [kt(r), s];
};
function Xs(e, t = !0) {
  let n;
  for (let r = 0; r < e.length; r++) {
    const u = e[r];
    if (or(u)) {
      if (u.type !== ht || u.children === "v-if") {
        if (n)
          return;
        if (n = u, process.env.NODE_ENV !== "production" && t && n.patchFlag > 0 && n.patchFlag & 2048)
          return Xs(n.children);
      }
    } else
      return;
  }
  return n;
}
const _h = (e) => {
  let t;
  for (const n in e)
    (n === "class" || n === "style" || Gr(n)) && ((t || (t = {}))[n] = e[n]);
  return t;
}, yh = (e, t) => {
  const n = {};
  for (const r in e)
    (!Ou(r) || !(r.slice(9) in t)) && (n[r] = e[r]);
  return n;
}, Bi = (e) => e.shapeFlag & 7 || e.type === ht;
function xh(e, t, n) {
  const { props: r, children: u, component: o } = e, { props: s, children: i, patchFlag: a } = t, c = o.emitsOptions;
  if (process.env.NODE_ENV !== "production" && (u || i) && Bt || t.dirs || t.transition)
    return !0;
  if (n && a >= 0) {
    if (a & 1024)
      return !0;
    if (a & 16)
      return r ? Ui(r, s, c) : !!s;
    if (a & 8) {
      const f = t.dynamicProps;
      for (let l = 0; l < f.length; l++) {
        const d = f[l];
        if (s[d] !== r[d] && !po(c, d))
          return !0;
      }
    }
  } else
    return (u || i) && (!i || !i.$stable) ? !0 : r === s ? !1 : r ? s ? Ui(r, s, c) : !0 : !!s;
  return !1;
}
function Ui(e, t, n) {
  const r = Object.keys(t);
  if (r.length !== Object.keys(e).length)
    return !0;
  for (let u = 0; u < r.length; u++) {
    const o = r[u];
    if (t[o] !== e[o] && !po(n, o))
      return !0;
  }
  return !1;
}
function Eh({ vnode: e, parent: t }, n) {
  for (; t; ) {
    const r = t.subTree;
    if (r.suspense && r.suspense.activeBranch === e && (r.el = e.el), r === e)
      (e = t.vnode).el = n, t = t.parent;
    else
      break;
  }
}
const jl = (e) => e.__isSuspense;
function kh(e, t) {
  t && t.pendingBranch ? Q(e) ? t.effects.push(...e) : t.effects.push(e) : fl(e);
}
const tt = Symbol.for("v-fgt"), tu = Symbol.for("v-txt"), ht = Symbol.for("v-cmt"), Cu = Symbol.for("v-stc"), Tr = [];
let pt = null;
function Me(e = !1) {
  Tr.push(pt = e ? null : []);
}
function wh() {
  Tr.pop(), pt = Tr[Tr.length - 1] || null;
}
let Pr = 1;
function Uu(e, t = !1) {
  Pr += e, e < 0 && pt && t && (pt.hasOnce = !0);
}
function Ll(e) {
  return e.dynamicChildren = Pr > 0 ? pt || Qn : null, wh(), Pr > 0 && pt && pt.push(e), e;
}
function Ue(e, t, n, r, u, o) {
  return Ll(
    ye(
      e,
      t,
      n,
      r,
      u,
      o,
      !0
    )
  );
}
function Hu(e, t, n, r, u) {
  return Ll(
    Ee(
      e,
      t,
      n,
      r,
      u,
      !0
    )
  );
}
function or(e) {
  return e ? e.__v_isVNode === !0 : !1;
}
function kr(e, t) {
  if (process.env.NODE_ENV !== "production" && t.shapeFlag & 6 && e.component) {
    const n = ku.get(t.type);
    if (n && n.has(e.component))
      return e.shapeFlag &= -257, t.shapeFlag &= -513, !1;
  }
  return e.type === t.type && e.key === t.key;
}
const Ch = (...e) => Vl(
  ...e
), Zl = ({ key: e }) => e ?? null, Au = ({
  ref: e,
  ref_key: t,
  ref_for: n
}) => (typeof e == "number" && (e = "" + e), e != null ? Ie(e) || Oe(e) || te(e) ? { i: dt, r: e, k: t, f: !!n } : e : null);
function ye(e, t = null, n = null, r = 0, u = null, o = e === tt ? 0 : 1, s = !1, i = !1) {
  const a = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e,
    props: t,
    key: t && Zl(t),
    ref: t && Au(t),
    scopeId: bl,
    slotScopeIds: null,
    children: n,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetStart: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag: o,
    patchFlag: r,
    dynamicProps: u,
    dynamicChildren: null,
    appContext: null,
    ctx: dt
  };
  return i ? (Qs(a, n), o & 128 && e.normalize(a)) : n && (a.shapeFlag |= Ie(n) ? 8 : 16), process.env.NODE_ENV !== "production" && a.key !== a.key && R("VNode created with invalid key (NaN). VNode type:", a.type), Pr > 0 && // avoid a block node from tracking itself
  !s && // has current parent block
  pt && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (a.patchFlag > 0 || o & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  a.patchFlag !== 32 && pt.push(a), a;
}
const Ee = process.env.NODE_ENV !== "production" ? Ch : Vl;
function Vl(e, t = null, n = null, r = 0, u = null, o = !1) {
  if ((!e || e === Pp) && (process.env.NODE_ENV !== "production" && !e && R(`Invalid vnode type when creating vnode: ${e}.`), e = ht), or(e)) {
    const i = yn(
      e,
      t,
      !0
      /* mergeRef: true */
    );
    return n && Qs(i, n), Pr > 0 && !o && pt && (i.shapeFlag & 6 ? pt[pt.indexOf(e)] = i : pt.push(i)), i.patchFlag = -2, i;
  }
  if (Jl(e) && (e = e.__vccOpts), t) {
    t = Ah(t);
    let { class: i, style: a } = t;
    i && !Ie(i) && (t.class = fr(i)), pe(a) && (Fu(a) && !Q(a) && (a = Re({}, a)), t.style = Ps(a));
  }
  const s = Ie(e) ? 1 : jl(e) ? 128 : wp(e) ? 64 : pe(e) ? 4 : te(e) ? 2 : 0;
  return process.env.NODE_ENV !== "production" && s & 4 && Fu(e) && (e = oe(e), R(
    "Vue received a Component that was made a reactive object. This can lead to unnecessary performance overhead and should be avoided by marking the component with `markRaw` or using `shallowRef` instead of `ref`.",
    `
Component that was made reactive: `,
    e
  )), ye(
    e,
    t,
    n,
    r,
    u,
    s,
    o,
    !0
  );
}
function Ah(e) {
  return e ? Fu(e) || Sl(e) ? Re({}, e) : e : null;
}
function yn(e, t, n = !1, r = !1) {
  const { props: u, ref: o, patchFlag: s, children: i, transition: a } = e, c = t ? Sh(u || {}, t) : u, f = {
    __v_isVNode: !0,
    __v_skip: !0,
    type: e.type,
    props: c,
    key: c && Zl(c),
    ref: t && t.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      n && o ? Q(o) ? o.concat(Au(t)) : [o, Au(t)] : Au(t)
    ) : o,
    scopeId: e.scopeId,
    slotScopeIds: e.slotScopeIds,
    children: process.env.NODE_ENV !== "production" && s === -1 && Q(i) ? i.map(Bl) : i,
    target: e.target,
    targetStart: e.targetStart,
    targetAnchor: e.targetAnchor,
    staticCount: e.staticCount,
    shapeFlag: e.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: t && e.type !== tt ? s === -1 ? 16 : s | 16 : s,
    dynamicProps: e.dynamicProps,
    dynamicChildren: e.dynamicChildren,
    appContext: e.appContext,
    dirs: e.dirs,
    transition: a,
    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: e.component,
    suspense: e.suspense,
    ssContent: e.ssContent && yn(e.ssContent),
    ssFallback: e.ssFallback && yn(e.ssFallback),
    placeholder: e.placeholder,
    el: e.el,
    anchor: e.anchor,
    ctx: e.ctx,
    ce: e.ce
  };
  return a && r && Js(
    f,
    a.clone(f)
  ), f;
}
function Bl(e) {
  const t = yn(e);
  return Q(e.children) && (t.children = e.children.map(Bl)), t;
}
function Dh(e = " ", t = 0) {
  return Ee(tu, null, e, t);
}
function nr(e = "", t = !1) {
  return t ? (Me(), Hu(ht, null, e)) : Ee(ht, null, e);
}
function kt(e) {
  return e == null || typeof e == "boolean" ? Ee(ht) : Q(e) ? Ee(
    tt,
    null,
    // #3666, avoid reference pollution when reusing vnode
    e.slice()
  ) : or(e) ? fn(e) : Ee(tu, null, String(e));
}
function fn(e) {
  return e.el === null && e.patchFlag !== -1 || e.memo ? e : yn(e);
}
function Qs(e, t) {
  let n = 0;
  const { shapeFlag: r } = e;
  if (t == null)
    t = null;
  else if (Q(t))
    n = 16;
  else if (typeof t == "object")
    if (r & 65) {
      const u = t.default;
      u && (u._c && (u._d = !1), Qs(e, u()), u._c && (u._d = !0));
      return;
    } else {
      n = 32;
      const u = t._;
      !u && !Sl(t) ? t._ctx = dt : u === 3 && dt && (dt.slots._ === 1 ? t._ = 1 : (t._ = 2, e.patchFlag |= 1024));
    }
  else te(t) ? (t = { default: t, _ctx: dt }, n = 32) : (t = String(t), r & 64 ? (n = 16, t = [Dh(t)]) : n = 8);
  e.children = t, e.shapeFlag |= n;
}
function Sh(...e) {
  const t = {};
  for (let n = 0; n < e.length; n++) {
    const r = e[n];
    for (const u in r)
      if (u === "class")
        t.class !== r.class && (t.class = fr([t.class, r.class]));
      else if (u === "style")
        t.style = Ps([t.style, r.style]);
      else if (Gr(u)) {
        const o = t[u], s = r[u];
        s && o !== s && !(Q(o) && o.includes(s)) && (t[u] = o ? [].concat(o, s) : s);
      } else u !== "" && (t[u] = r[u]);
  }
  return t;
}
function Pt(e, t, n, r = null) {
  Jt(e, t, 7, [
    n,
    r
  ]);
}
const $h = Cl();
let Nh = 0;
function Oh(e, t, n) {
  const r = e.type, u = (t ? t.appContext : e.appContext) || $h, o = {
    uid: Nh++,
    vnode: e,
    type: r,
    parent: t,
    appContext: u,
    root: null,
    // to be immediately set
    next: null,
    subTree: null,
    // will be set synchronously right after creation
    effect: null,
    update: null,
    // will be set synchronously right after creation
    job: null,
    scope: new w0(
      !0
      /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: t ? t.provides : Object.create(u.provides),
    ids: t ? t.ids : ["", 0, 0],
    accessCache: null,
    renderCache: [],
    // local resolved assets
    components: null,
    directives: null,
    // resolved props and emits options
    propsOptions: Nl(r, u),
    emitsOptions: Pl(r, u),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: ge,
    // inheritAttrs
    inheritAttrs: r.inheritAttrs,
    // state
    ctx: ge,
    data: ge,
    props: ge,
    attrs: ge,
    slots: ge,
    refs: ge,
    setupState: ge,
    setupContext: null,
    // suspense related
    suspense: n,
    suspenseId: n ? n.pendingId : 0,
    asyncDep: null,
    asyncResolved: !1,
    // lifecycle hooks
    // not using enums here because it results in computed properties
    isMounted: !1,
    isUnmounted: !1,
    isDeactivated: !1,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null
  };
  return process.env.NODE_ENV !== "production" ? o.ctx = Rp(o) : o.ctx = { _: o }, o.root = t ? t.root : o, o.emit = bh.bind(null, o), e.ce && e.ce(o), o;
}
let qe = null;
const ei = () => qe || dt;
let qu, ms;
{
  const e = Kr(), t = (n, r) => {
    let u;
    return (u = e[n]) || (u = e[n] = []), u.push(r), (o) => {
      u.length > 1 ? u.forEach((s) => s(o)) : u[0](o);
    };
  };
  qu = t(
    "__VUE_INSTANCE_SETTERS__",
    (n) => qe = n
  ), ms = t(
    "__VUE_SSR_SETTERS__",
    (n) => Rr = n
  );
}
const nu = (e) => {
  const t = qe;
  return qu(e), e.scope.on(), () => {
    e.scope.off(), qu(t);
  };
}, Hi = () => {
  qe && qe.scope.off(), qu(null);
}, Ih = /* @__PURE__ */ an("slot,component");
function gs(e, { isNativeTag: t }) {
  (Ih(e) || t(e)) && R(
    "Do not use built-in or reserved HTML elements as component id: " + e
  );
}
function Ul(e) {
  return e.vnode.shapeFlag & 4;
}
let Rr = !1;
function Th(e, t = !1, n = !1) {
  t && ms(t);
  const { props: r, children: u } = e.vnode, o = Ul(e);
  Gp(e, r, o, t), sh(e, u, n || t);
  const s = o ? Fh(e, t) : void 0;
  return t && ms(!1), s;
}
function Fh(e, t) {
  var n;
  const r = e.type;
  if (process.env.NODE_ENV !== "production") {
    if (r.name && gs(r.name, e.appContext.config), r.components) {
      const o = Object.keys(r.components);
      for (let s = 0; s < o.length; s++)
        gs(o[s], e.appContext.config);
    }
    if (r.directives) {
      const o = Object.keys(r.directives);
      for (let s = 0; s < o.length; s++)
        vl(o[s]);
    }
    r.compilerOptions && zh() && R(
      '"compilerOptions" is only supported when using a build of Vue that includes the runtime compiler. Since you are using a runtime-only build, the options should be passed via your build tool config instead.'
    );
  }
  e.accessCache = /* @__PURE__ */ Object.create(null), e.proxy = new Proxy(e.ctx, El), process.env.NODE_ENV !== "production" && jp(e);
  const { setup: u } = r;
  if (u) {
    $t();
    const o = e.setupContext = u.length > 1 ? Ph(e) : null, s = nu(e), i = dr(
      u,
      e,
      0,
      [
        process.env.NODE_ENV !== "production" ? Vt(e.props) : e.props,
        o
      ]
    ), a = Fs(i);
    if (Nt(), s(), (a || e.sp) && !Ir(e) && _l(e), a) {
      if (i.then(Hi, Hi), t)
        return i.then((c) => {
          qi(e, c, t);
        }).catch((c) => {
          Xr(c, e, 0);
        });
      if (e.asyncDep = i, process.env.NODE_ENV !== "production" && !e.suspense) {
        const c = (n = r.name) != null ? n : "Anonymous";
        R(
          `Component <${c}>: setup function returned a promise, but no <Suspense> boundary was found in the parent component tree. A component with async setup() must be nested in a <Suspense> in order to be rendered.`
        );
      }
    } else
      qi(e, i, t);
  } else
    Hl(e, t);
}
function qi(e, t, n) {
  te(t) ? e.type.__ssrInlineRender ? e.ssrRender = t : e.render = t : pe(t) ? (process.env.NODE_ENV !== "production" && or(t) && R(
    "setup() should not return VNodes directly - return a render function instead."
  ), process.env.NODE_ENV !== "production" && (e.devtoolsRawSetupState = t), e.setupState = il(t), process.env.NODE_ENV !== "production" && Lp(e)) : process.env.NODE_ENV !== "production" && t !== void 0 && R(
    `setup() should return an object. Received: ${t === null ? "null" : typeof t}`
  ), Hl(e, n);
}
const zh = () => !0;
function Hl(e, t, n) {
  const r = e.type;
  e.render || (e.render = r.render || Le);
  {
    const u = nu(e);
    $t();
    try {
      Vp(e);
    } finally {
      Nt(), u();
    }
  }
  process.env.NODE_ENV !== "production" && !r.render && e.render === Le && !t && (r.template ? R(
    'Component provided template option but runtime compilation is not supported in this build of Vue. Configure your bundler to alias "vue" to "vue/dist/vue.esm-bundler.js".'
  ) : R("Component is missing template or render function: ", r));
}
const Ji = process.env.NODE_ENV !== "production" ? {
  get(e, t) {
    return Bu(), je(e, "get", ""), e[t];
  },
  set() {
    return R("setupContext.attrs is readonly."), !1;
  },
  deleteProperty() {
    return R("setupContext.attrs is readonly."), !1;
  }
} : {
  get(e, t) {
    return je(e, "get", ""), e[t];
  }
};
function Mh(e) {
  return new Proxy(e.slots, {
    get(t, n) {
      return je(e, "get", "$slots"), t[n];
    }
  });
}
function Ph(e) {
  const t = (n) => {
    if (process.env.NODE_ENV !== "production" && (e.exposed && R("expose() should be called only once per setup()."), n != null)) {
      let r = typeof n;
      r === "object" && (Q(n) ? r = "array" : Oe(n) && (r = "ref")), r !== "object" && R(
        `expose() should be passed a plain object, received ${r}.`
      );
    }
    e.exposed = n || {};
  };
  if (process.env.NODE_ENV !== "production") {
    let n, r;
    return Object.freeze({
      get attrs() {
        return n || (n = new Proxy(e.attrs, Ji));
      },
      get slots() {
        return r || (r = Mh(e));
      },
      get emit() {
        return (u, ...o) => e.emit(u, ...o);
      },
      expose: t
    });
  } else
    return {
      attrs: new Proxy(e.attrs, Ji),
      slots: e.slots,
      emit: e.emit,
      expose: t
    };
}
function ti(e) {
  return e.exposed ? e.exposeProxy || (e.exposeProxy = new Proxy(il(q0(e.exposed)), {
    get(t, n) {
      if (n in t)
        return t[n];
      if (n in Ln)
        return Ln[n](e);
    },
    has(t, n) {
      return n in t || n in Ln;
    }
  })) : e.proxy;
}
const Rh = /(?:^|[-_])\w/g, jh = (e) => e.replace(Rh, (t) => t.toUpperCase()).replace(/[-_]/g, "");
function ql(e, t = !0) {
  return te(e) ? e.displayName || e.name : e.name || t && e.__name;
}
function ho(e, t, n = !1) {
  let r = ql(t);
  if (!r && t.__file) {
    const u = t.__file.match(/([^/\\]+)\.\w+$/);
    u && (r = u[1]);
  }
  if (!r && e && e.parent) {
    const u = (o) => {
      for (const s in o)
        if (o[s] === t)
          return s;
    };
    r = u(
      e.components || e.parent.type.components
    ) || u(e.appContext.components);
  }
  return r ? jh(r) : n ? "App" : "Anonymous";
}
function Jl(e) {
  return te(e) && "__vccOpts" in e;
}
const Fe = (e, t) => {
  const n = ep(e, t, Rr);
  if (process.env.NODE_ENV !== "production") {
    const r = ei();
    r && r.appContext.config.warnRecursiveComputed && (n._warnRecursive = !0);
  }
  return n;
};
function Lh(e, t, n) {
  try {
    Uu(-1);
    const r = arguments.length;
    return r === 2 ? pe(t) && !Q(t) ? or(t) ? Ee(e, null, [t]) : Ee(e, t) : Ee(e, null, t) : (r > 3 ? n = Array.prototype.slice.call(arguments, 2) : r === 3 && or(n) && (n = [n]), Ee(e, t, n));
  } finally {
    Uu(1);
  }
}
function Zh() {
  if (process.env.NODE_ENV === "production" || typeof window > "u")
    return;
  const e = { style: "color:#3ba776" }, t = { style: "color:#1677ff" }, n = { style: "color:#f5222d" }, r = { style: "color:#eb2f96" }, u = {
    __vue_custom_formatter: !0,
    header(l) {
      if (!pe(l))
        return null;
      if (l.__isVue)
        return ["div", e, "VueInstance"];
      if (Oe(l)) {
        $t();
        const d = l.value;
        return Nt(), [
          "div",
          {},
          ["span", e, f(l)],
          "<",
          i(d),
          ">"
        ];
      } else {
        if (Rn(l))
          return [
            "div",
            {},
            ["span", e, nt(l) ? "ShallowReactive" : "Reactive"],
            "<",
            i(l),
            `>${qt(l) ? " (readonly)" : ""}`
          ];
        if (qt(l))
          return [
            "div",
            {},
            ["span", e, nt(l) ? "ShallowReadonly" : "Readonly"],
            "<",
            i(l),
            ">"
          ];
      }
      return null;
    },
    hasBody(l) {
      return l && l.__isVue;
    },
    body(l) {
      if (l && l.__isVue)
        return [
          "div",
          {},
          ...o(l.$)
        ];
    }
  };
  function o(l) {
    const d = [];
    l.type.props && l.props && d.push(s("props", oe(l.props))), l.setupState !== ge && d.push(s("setup", l.setupState)), l.data !== ge && d.push(s("data", oe(l.data)));
    const p = a(l, "computed");
    p && d.push(s("computed", p));
    const m = a(l, "inject");
    return m && d.push(s("injected", m)), d.push([
      "div",
      {},
      [
        "span",
        {
          style: r.style + ";opacity:0.66"
        },
        "$ (internal): "
      ],
      ["object", { object: l }]
    ]), d;
  }
  function s(l, d) {
    return d = Re({}, d), Object.keys(d).length ? [
      "div",
      { style: "line-height:1.25em;margin-bottom:0.6em" },
      [
        "div",
        {
          style: "color:#476582"
        },
        l
      ],
      [
        "div",
        {
          style: "padding-left:1.25em"
        },
        ...Object.keys(d).map((p) => [
          "div",
          {},
          ["span", r, p + ": "],
          i(d[p], !1)
        ])
      ]
    ] : ["span", {}];
  }
  function i(l, d = !0) {
    return typeof l == "number" ? ["span", t, l] : typeof l == "string" ? ["span", n, JSON.stringify(l)] : typeof l == "boolean" ? ["span", r, l] : pe(l) ? ["object", { object: d ? oe(l) : l }] : ["span", n, String(l)];
  }
  function a(l, d) {
    const p = l.type;
    if (te(p))
      return;
    const m = {};
    for (const v in l.ctx)
      c(p, v, d) && (m[v] = l.ctx[v]);
    return m;
  }
  function c(l, d, p) {
    const m = l[p];
    if (Q(m) && m.includes(d) || pe(m) && d in m || l.extends && c(l.extends, d, p) || l.mixins && l.mixins.some((v) => c(v, d, p)))
      return !0;
  }
  function f(l) {
    return nt(l) ? "ShallowRef" : l.effect ? "ComputedRef" : "Ref";
  }
  window.devtoolsFormatters ? window.devtoolsFormatters.push(u) : window.devtoolsFormatters = [u];
}
const Wi = "3.5.22", rn = process.env.NODE_ENV !== "production" ? R : Le;
process.env.NODE_ENV;
process.env.NODE_ENV;
/**
* @vue/runtime-dom v3.5.22
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
let bs;
const Gi = typeof window < "u" && window.trustedTypes;
if (Gi)
  try {
    bs = /* @__PURE__ */ Gi.createPolicy("vue", {
      createHTML: (e) => e
    });
  } catch (e) {
    process.env.NODE_ENV !== "production" && rn(`Error creating trusted types policy: ${e}`);
  }
const Wl = bs ? (e) => bs.createHTML(e) : (e) => e, Vh = "http://www.w3.org/2000/svg", Bh = "http://www.w3.org/1998/Math/MathML", en = typeof document < "u" ? document : null, Ki = en && /* @__PURE__ */ en.createElement("template"), Uh = {
  insert: (e, t, n) => {
    t.insertBefore(e, n || null);
  },
  remove: (e) => {
    const t = e.parentNode;
    t && t.removeChild(e);
  },
  createElement: (e, t, n, r) => {
    const u = t === "svg" ? en.createElementNS(Vh, e) : t === "mathml" ? en.createElementNS(Bh, e) : n ? en.createElement(e, { is: n }) : en.createElement(e);
    return e === "select" && r && r.multiple != null && u.setAttribute("multiple", r.multiple), u;
  },
  createText: (e) => en.createTextNode(e),
  createComment: (e) => en.createComment(e),
  setText: (e, t) => {
    e.nodeValue = t;
  },
  setElementText: (e, t) => {
    e.textContent = t;
  },
  parentNode: (e) => e.parentNode,
  nextSibling: (e) => e.nextSibling,
  querySelector: (e) => en.querySelector(e),
  setScopeId(e, t) {
    e.setAttribute(t, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(e, t, n, r, u, o) {
    const s = n ? n.previousSibling : t.lastChild;
    if (u && (u === o || u.nextSibling))
      for (; t.insertBefore(u.cloneNode(!0), n), !(u === o || !(u = u.nextSibling)); )
        ;
    else {
      Ki.innerHTML = Wl(
        r === "svg" ? `<svg>${e}</svg>` : r === "mathml" ? `<math>${e}</math>` : e
      );
      const i = Ki.content;
      if (r === "svg" || r === "mathml") {
        const a = i.firstChild;
        for (; a.firstChild; )
          i.appendChild(a.firstChild);
        i.removeChild(a);
      }
      t.insertBefore(i, n);
    }
    return [
      // first
      s ? s.nextSibling : t.firstChild,
      // last
      n ? n.previousSibling : t.lastChild
    ];
  }
}, Hh = Symbol("_vtc");
function qh(e, t, n) {
  const r = e[Hh];
  r && (t = (t ? [t, ...r] : [...r]).join(" ")), t == null ? e.removeAttribute("class") : n ? e.setAttribute("class", t) : e.className = t;
}
const Yi = Symbol("_vod"), Jh = Symbol("_vsh"), Wh = Symbol(process.env.NODE_ENV !== "production" ? "CSS_VAR_TEXT" : ""), Gh = /(?:^|;)\s*display\s*:/;
function Kh(e, t, n) {
  const r = e.style, u = Ie(n);
  let o = !1;
  if (n && !u) {
    if (t)
      if (Ie(t))
        for (const s of t.split(";")) {
          const i = s.slice(0, s.indexOf(":")).trim();
          n[i] == null && Du(r, i, "");
        }
      else
        for (const s in t)
          n[s] == null && Du(r, s, "");
    for (const s in n)
      s === "display" && (o = !0), Du(r, s, n[s]);
  } else if (u) {
    if (t !== n) {
      const s = r[Wh];
      s && (n += ";" + s), r.cssText = n, o = Gh.test(n);
    }
  } else t && e.removeAttribute("style");
  Yi in e && (e[Yi] = o ? r.display : "", e[Jh] && (r.display = "none"));
}
const Yh = /[^\\];\s*$/, Xi = /\s*!important$/;
function Du(e, t, n) {
  if (Q(n))
    n.forEach((r) => Du(e, t, r));
  else if (n == null && (n = ""), process.env.NODE_ENV !== "production" && Yh.test(n) && rn(
    `Unexpected semicolon at the end of '${t}' style value: '${n}'`
  ), t.startsWith("--"))
    e.setProperty(t, n);
  else {
    const r = Xh(e, t);
    Xi.test(n) ? e.setProperty(
      _n(r),
      n.replace(Xi, ""),
      "important"
    ) : e[r] = n;
  }
}
const Qi = ["Webkit", "Moz", "ms"], To = {};
function Xh(e, t) {
  const n = To[t];
  if (n)
    return n;
  let r = Ct(t);
  if (r !== "filter" && r in e)
    return To[t] = r;
  r = so(r);
  for (let u = 0; u < Qi.length; u++) {
    const o = Qi[u] + r;
    if (o in e)
      return To[t] = o;
  }
  return t;
}
const ea = "http://www.w3.org/1999/xlink";
function ta(e, t, n, r, u, o = k0(t)) {
  r && t.startsWith("xlink:") ? n == null ? e.removeAttributeNS(ea, t.slice(6, t.length)) : e.setAttributeNS(ea, t, n) : n == null || o && !Zc(n) ? e.removeAttribute(t) : e.setAttribute(
    t,
    o ? "" : kn(n) ? String(n) : n
  );
}
function na(e, t, n, r, u) {
  if (t === "innerHTML" || t === "textContent") {
    n != null && (e[t] = t === "innerHTML" ? Wl(n) : n);
    return;
  }
  const o = e.tagName;
  if (t === "value" && o !== "PROGRESS" && // custom elements may use _value internally
  !o.includes("-")) {
    const i = o === "OPTION" ? e.getAttribute("value") || "" : e.value, a = n == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      e.type === "checkbox" ? "on" : ""
    ) : String(n);
    (i !== a || !("_value" in e)) && (e.value = a), n == null && e.removeAttribute(t), e._value = n;
    return;
  }
  let s = !1;
  if (n === "" || n == null) {
    const i = typeof e[t];
    i === "boolean" ? n = Zc(n) : n == null && i === "string" ? (n = "", s = !0) : i === "number" && (n = 0, s = !0);
  }
  try {
    e[t] = n;
  } catch (i) {
    process.env.NODE_ENV !== "production" && !s && rn(
      `Failed setting prop "${t}" on <${o.toLowerCase()}>: value ${n} is invalid.`,
      i
    );
  }
  s && e.removeAttribute(u || t);
}
function Qh(e, t, n, r) {
  e.addEventListener(t, n, r);
}
function em(e, t, n, r) {
  e.removeEventListener(t, n, r);
}
const ra = Symbol("_vei");
function tm(e, t, n, r, u = null) {
  const o = e[ra] || (e[ra] = {}), s = o[t];
  if (r && s)
    s.value = process.env.NODE_ENV !== "production" ? oa(r, t) : r;
  else {
    const [i, a] = nm(t);
    if (r) {
      const c = o[t] = om(
        process.env.NODE_ENV !== "production" ? oa(r, t) : r,
        u
      );
      Qh(e, i, c, a);
    } else s && (em(e, i, s, a), o[t] = void 0);
  }
}
const ua = /(?:Once|Passive|Capture)$/;
function nm(e) {
  let t;
  if (ua.test(e)) {
    t = {};
    let r;
    for (; r = e.match(ua); )
      e = e.slice(0, e.length - r[0].length), t[r[0].toLowerCase()] = !0;
  }
  return [e[2] === ":" ? e.slice(3) : _n(e.slice(2)), t];
}
let Fo = 0;
const rm = /* @__PURE__ */ Promise.resolve(), um = () => Fo || (rm.then(() => Fo = 0), Fo = Date.now());
function om(e, t) {
  const n = (r) => {
    if (!r._vts)
      r._vts = Date.now();
    else if (r._vts <= n.attached)
      return;
    Jt(
      sm(r, n.value),
      t,
      5,
      [r]
    );
  };
  return n.value = e, n.attached = um(), n;
}
function oa(e, t) {
  return te(e) || Q(e) ? e : (rn(
    `Wrong type passed as event handler to ${t} - did you forget @ or : in front of your prop?
Expected function or array of functions, received type ${typeof e}.`
  ), Le);
}
function sm(e, t) {
  if (Q(t)) {
    const n = e.stopImmediatePropagation;
    return e.stopImmediatePropagation = () => {
      n.call(e), e._stopped = !0;
    }, t.map(
      (r) => (u) => !u._stopped && r && r(u)
    );
  } else
    return t;
}
const sa = (e) => e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && // lowercase letter
e.charCodeAt(2) > 96 && e.charCodeAt(2) < 123, im = (e, t, n, r, u, o) => {
  const s = u === "svg";
  t === "class" ? qh(e, r, s) : t === "style" ? Kh(e, n, r) : Gr(t) ? Ou(t) || tm(e, t, n, r, o) : (t[0] === "." ? (t = t.slice(1), !0) : t[0] === "^" ? (t = t.slice(1), !1) : am(e, t, r, s)) ? (na(e, t, r), !e.tagName.includes("-") && (t === "value" || t === "checked" || t === "selected") && ta(e, t, r, s, o, t !== "value")) : /* #11081 force set props for possible async custom element */ e._isVueCE && (/[A-Z]/.test(t) || !Ie(r)) ? na(e, Ct(t), r, o, t) : (t === "true-value" ? e._trueValue = r : t === "false-value" && (e._falseValue = r), ta(e, t, r, s));
};
function am(e, t, n, r) {
  if (r)
    return !!(t === "innerHTML" || t === "textContent" || t in e && sa(t) && te(n));
  if (t === "spellcheck" || t === "draggable" || t === "translate" || t === "autocorrect" || t === "form" || t === "list" && e.tagName === "INPUT" || t === "type" && e.tagName === "TEXTAREA")
    return !1;
  if (t === "width" || t === "height") {
    const u = e.tagName;
    if (u === "IMG" || u === "VIDEO" || u === "CANVAS" || u === "SOURCE")
      return !1;
  }
  return sa(t) && Ie(n) ? !1 : t in e;
}
const cm = ["ctrl", "shift", "alt", "meta"], lm = {
  stop: (e) => e.stopPropagation(),
  prevent: (e) => e.preventDefault(),
  self: (e) => e.target !== e.currentTarget,
  ctrl: (e) => !e.ctrlKey,
  shift: (e) => !e.shiftKey,
  alt: (e) => !e.altKey,
  meta: (e) => !e.metaKey,
  left: (e) => "button" in e && e.button !== 0,
  middle: (e) => "button" in e && e.button !== 1,
  right: (e) => "button" in e && e.button !== 2,
  exact: (e, t) => cm.some((n) => e[`${n}Key`] && !t.includes(n))
}, fm = (e, t) => {
  const n = e._withMods || (e._withMods = {}), r = t.join(".");
  return n[r] || (n[r] = ((u, ...o) => {
    for (let s = 0; s < t.length; s++) {
      const i = lm[t[s]];
      if (i && i(u, t)) return;
    }
    return e(u, ...o);
  }));
}, dm = /* @__PURE__ */ Re({ patchProp: im }, Uh);
let ia;
function pm() {
  return ia || (ia = ch(dm));
}
const hm = ((...e) => {
  const t = pm().createApp(...e);
  process.env.NODE_ENV !== "production" && (gm(t), bm(t));
  const { mount: n } = t;
  return t.mount = (r) => {
    const u = vm(r);
    if (!u) return;
    const o = t._component;
    !te(o) && !o.render && !o.template && (o.template = u.innerHTML), u.nodeType === 1 && (u.textContent = "");
    const s = n(u, !1, mm(u));
    return u instanceof Element && (u.removeAttribute("v-cloak"), u.setAttribute("data-v-app", "")), s;
  }, t;
});
function mm(e) {
  if (e instanceof SVGElement)
    return "svg";
  if (typeof MathMLElement == "function" && e instanceof MathMLElement)
    return "mathml";
}
function gm(e) {
  Object.defineProperty(e.config, "isNativeTag", {
    value: (t) => _0(t) || y0(t) || x0(t),
    writable: !1
  });
}
function bm(e) {
  {
    const t = e.config.isCustomElement;
    Object.defineProperty(e.config, "isCustomElement", {
      get() {
        return t;
      },
      set() {
        rn(
          "The `isCustomElement` config option is deprecated. Use `compilerOptions.isCustomElement` instead."
        );
      }
    });
    const n = e.config.compilerOptions, r = 'The `compilerOptions` config option is only respected when using a build of Vue.js that includes the runtime compiler (aka "full build"). Since you are using the runtime-only build, `compilerOptions` must be passed to `@vue/compiler-dom` in the build setup instead.\n- For vue-loader: pass it via vue-loader\'s `compilerOptions` loader option.\n- For vue-cli: see https://cli.vuejs.org/guide/webpack.html#modifying-options-of-a-loader\n- For vite: pass it via @vitejs/plugin-vue options. See https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue#example-for-passing-options-to-vuecompiler-sfc';
    Object.defineProperty(e.config, "compilerOptions", {
      get() {
        return rn(r), n;
      },
      set() {
        rn(r);
      }
    });
  }
}
function vm(e) {
  if (Ie(e)) {
    const t = document.querySelector(e);
    return process.env.NODE_ENV !== "production" && !t && rn(
      `Failed to mount app: mount target selector "${e}" returned null.`
    ), t;
  }
  return process.env.NODE_ENV !== "production" && window.ShadowRoot && e instanceof window.ShadowRoot && e.mode === "closed" && rn(
    'mounting on a ShadowRoot with `{mode: "closed"}` may lead to unpredictable bugs'
  ), e;
}
/**
* vue v3.5.22
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
function _m() {
  Zh();
}
process.env.NODE_ENV !== "production" && _m();
var Gl = "vercel.ai.error", ym = Symbol.for(Gl), aa, ca, Wt = class Kl extends (ca = Error, aa = ym, ca) {
  /**
   * Creates an AI SDK Error.
   *
   * @param {Object} params - The parameters for creating the error.
   * @param {string} params.name - The name of the error.
   * @param {string} params.message - The error message.
   * @param {unknown} [params.cause] - The underlying cause of the error.
   */
  constructor({
    name: t,
    message: n,
    cause: r
  }) {
    super(n), this[aa] = !0, this.name = t, this.cause = r;
  }
  /**
   * Checks if the given error is an AI SDK Error.
   * @param {unknown} error - The error to check.
   * @returns {boolean} True if the error is an AI SDK Error, false otherwise.
   */
  static isInstance(t) {
    return Kl.hasMarker(t, Gl);
  }
  static hasMarker(t, n) {
    const r = Symbol.for(n);
    return t != null && typeof t == "object" && r in t && typeof t[r] == "boolean" && t[r] === !0;
  }
};
function Yl(e) {
  return e == null ? "unknown error" : typeof e == "string" ? e : e instanceof Error ? e.message : JSON.stringify(e);
}
var Xl = "AI_InvalidArgumentError", Ql = `vercel.ai.error.${Xl}`, xm = Symbol.for(Ql), la, fa, Em = class extends (fa = Wt, la = xm, fa) {
  constructor({
    message: e,
    cause: t,
    argument: n
  }) {
    super({ name: Xl, message: e, cause: t }), this[la] = !0, this.argument = n;
  }
  static isInstance(e) {
    return Wt.hasMarker(e, Ql);
  }
}, ef = "AI_JSONParseError", tf = `vercel.ai.error.${ef}`, km = Symbol.for(tf), da, pa, ha = class extends (pa = Wt, da = km, pa) {
  constructor({ text: e, cause: t }) {
    super({
      name: ef,
      message: `JSON parsing failed: Text: ${e}.
Error message: ${Yl(t)}`,
      cause: t
    }), this[da] = !0, this.text = e;
  }
  static isInstance(e) {
    return Wt.hasMarker(e, tf);
  }
}, nf = "AI_TypeValidationError", rf = `vercel.ai.error.${nf}`, wm = Symbol.for(rf), ma, ga, sr = class vs extends (ga = Wt, ma = wm, ga) {
  constructor({
    value: t,
    cause: n,
    context: r
  }) {
    let u = "Type validation failed";
    if (r?.field && (u += ` for ${r.field}`), r?.entityName || r?.entityId) {
      u += " (";
      const o = [];
      r.entityName && o.push(r.entityName), r.entityId && o.push(`id: "${r.entityId}"`), u += o.join(", "), u += ")";
    }
    super({
      name: nf,
      message: `${u}: Value: ${JSON.stringify(t)}.
Error message: ${Yl(n)}`,
      cause: n
    }), this[ma] = !0, this.value = t, this.context = r;
  }
  static isInstance(t) {
    return Wt.hasMarker(t, rf);
  }
  /**
   * Wraps an error into a TypeValidationError.
   * If the cause is already a TypeValidationError with the same value and context, it returns the cause.
   * Otherwise, it creates a new TypeValidationError.
   *
   * @param {Object} params - The parameters for wrapping the error.
   * @param {unknown} params.value - The value that failed validation.
   * @param {unknown} params.cause - The original error or cause of the validation failure.
   * @param {TypeValidationContext} params.context - Optional context about what is being validated.
   * @returns {TypeValidationError} A TypeValidationError instance.
   */
  static wrap({
    value: t,
    cause: n,
    context: r
  }) {
    var u, o, s;
    return vs.isInstance(n) && n.value === t && ((u = n.context) == null ? void 0 : u.field) === r?.field && ((o = n.context) == null ? void 0 : o.entityName) === r?.entityName && ((s = n.context) == null ? void 0 : s.entityId) === r?.entityId ? n : new vs({ value: t, cause: n, context: r });
  }
}, ba;
function S(e, t, n) {
  function r(i, a) {
    if (i._zod || Object.defineProperty(i, "_zod", {
      value: {
        def: a,
        constr: s,
        traits: /* @__PURE__ */ new Set()
      },
      enumerable: !1
    }), i._zod.traits.has(e))
      return;
    i._zod.traits.add(e), t(i, a);
    const c = s.prototype, f = Object.keys(c);
    for (let l = 0; l < f.length; l++) {
      const d = f[l];
      d in i || (i[d] = c[d].bind(i));
    }
  }
  const u = n?.Parent ?? Object;
  class o extends u {
  }
  Object.defineProperty(o, "name", { value: e });
  function s(i) {
    var a;
    const c = n?.Parent ? new o() : this;
    r(c, i), (a = c._zod).deferred ?? (a.deferred = []);
    for (const f of c._zod.deferred)
      f();
    return c;
  }
  return Object.defineProperty(s, "init", { value: r }), Object.defineProperty(s, Symbol.hasInstance, {
    value: (i) => n?.Parent && i instanceof n.Parent ? !0 : i?._zod?.traits?.has(e)
  }), Object.defineProperty(s, "name", { value: e }), s;
}
class rr extends Error {
  constructor() {
    super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
  }
}
class uf extends Error {
  constructor(t) {
    super(`Encountered unidirectional transform during encode: ${t}`), this.name = "ZodEncodeError";
  }
}
(ba = globalThis).__zod_globalConfig ?? (ba.__zod_globalConfig = {});
const ni = globalThis.__zod_globalConfig;
function on(e) {
  return ni;
}
function of(e) {
  const t = Object.values(e).filter((r) => typeof r == "number");
  return Object.entries(e).filter(([r, u]) => t.indexOf(+r) === -1).map(([r, u]) => u);
}
function _s(e, t) {
  return typeof t == "bigint" ? t.toString() : t;
}
function mo(e) {
  return {
    get value() {
      {
        const t = e();
        return Object.defineProperty(this, "value", { value: t }), t;
      }
    }
  };
}
function ri(e) {
  return e == null;
}
function ui(e) {
  const t = e.startsWith("^") ? 1 : 0, n = e.endsWith("$") ? e.length - 1 : e.length;
  return e.slice(t, n);
}
function Cm(e, t) {
  const n = e / t, r = Math.round(n), u = Number.EPSILON * Math.max(Math.abs(n), 1);
  return Math.abs(n - r) < u ? 0 : n - r;
}
const va = /* @__PURE__ */ Symbol("evaluating");
function ce(e, t, n) {
  let r;
  Object.defineProperty(e, t, {
    get() {
      if (r !== va)
        return r === void 0 && (r = va, r = n()), r;
    },
    set(u) {
      Object.defineProperty(e, t, {
        value: u
        // configurable: true,
      });
    },
    configurable: !0
  });
}
function Bn(e, t, n) {
  Object.defineProperty(e, t, {
    value: n,
    writable: !0,
    enumerable: !0,
    configurable: !0
  });
}
function wn(...e) {
  const t = {};
  for (const n of e) {
    const r = Object.getOwnPropertyDescriptors(n);
    Object.assign(t, r);
  }
  return Object.defineProperties({}, t);
}
function _a(e) {
  return JSON.stringify(e);
}
function Am(e) {
  return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
const sf = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {
};
function jr(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
const Dm = /* @__PURE__ */ mo(() => {
  if (ni.jitless || typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare"))
    return !1;
  try {
    const e = Function;
    return new e(""), !0;
  } catch {
    return !1;
  }
});
function ir(e) {
  if (jr(e) === !1)
    return !1;
  const t = e.constructor;
  if (t === void 0 || typeof t != "function")
    return !0;
  const n = t.prototype;
  return !(jr(n) === !1 || Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") === !1);
}
function af(e) {
  return ir(e) ? { ...e } : Array.isArray(e) ? [...e] : e instanceof Map ? new Map(e) : e instanceof Set ? new Set(e) : e;
}
const Sm = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function ar(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Cn(e, t, n) {
  const r = new e._zod.constr(t ?? e._zod.def);
  return (!t || n?.parent) && (r._zod.parent = e), r;
}
function J(e) {
  const t = e;
  if (!t)
    return {};
  if (typeof t == "string")
    return { error: () => t };
  if (t?.message !== void 0) {
    if (t?.error !== void 0)
      throw new Error("Cannot specify both `message` and `error` params");
    t.error = t.message;
  }
  return delete t.message, typeof t.error == "string" ? { ...t, error: () => t.error } : t;
}
function $m(e) {
  return Object.keys(e).filter((t) => e[t]._zod.optin === "optional" && e[t]._zod.optout === "optional");
}
const Nm = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
};
function Om(e, t) {
  const n = e._zod.def, r = n.checks;
  if (r && r.length > 0)
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  const o = wn(e._zod.def, {
    get shape() {
      const s = {};
      for (const i in t) {
        if (!(i in n.shape))
          throw new Error(`Unrecognized key: "${i}"`);
        t[i] && (s[i] = n.shape[i]);
      }
      return Bn(this, "shape", s), s;
    },
    checks: []
  });
  return Cn(e, o);
}
function Im(e, t) {
  const n = e._zod.def, r = n.checks;
  if (r && r.length > 0)
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  const o = wn(e._zod.def, {
    get shape() {
      const s = { ...e._zod.def.shape };
      for (const i in t) {
        if (!(i in n.shape))
          throw new Error(`Unrecognized key: "${i}"`);
        t[i] && delete s[i];
      }
      return Bn(this, "shape", s), s;
    },
    checks: []
  });
  return Cn(e, o);
}
function Tm(e, t) {
  if (!ir(t))
    throw new Error("Invalid input to extend: expected a plain object");
  const n = e._zod.def.checks;
  if (n && n.length > 0) {
    const o = e._zod.def.shape;
    for (const s in t)
      if (Object.getOwnPropertyDescriptor(o, s) !== void 0)
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
  }
  const u = wn(e._zod.def, {
    get shape() {
      const o = { ...e._zod.def.shape, ...t };
      return Bn(this, "shape", o), o;
    }
  });
  return Cn(e, u);
}
function Fm(e, t) {
  if (!ir(t))
    throw new Error("Invalid input to safeExtend: expected a plain object");
  const n = wn(e._zod.def, {
    get shape() {
      const r = { ...e._zod.def.shape, ...t };
      return Bn(this, "shape", r), r;
    }
  });
  return Cn(e, n);
}
function zm(e, t) {
  if (e._zod.def.checks?.length)
    throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
  const n = wn(e._zod.def, {
    get shape() {
      const r = { ...e._zod.def.shape, ...t._zod.def.shape };
      return Bn(this, "shape", r), r;
    },
    get catchall() {
      return t._zod.def.catchall;
    },
    checks: t._zod.def.checks ?? []
  });
  return Cn(e, n);
}
function Mm(e, t, n) {
  const u = t._zod.def.checks;
  if (u && u.length > 0)
    throw new Error(".partial() cannot be used on object schemas containing refinements");
  const s = wn(t._zod.def, {
    get shape() {
      const i = t._zod.def.shape, a = { ...i };
      if (n)
        for (const c in n) {
          if (!(c in i))
            throw new Error(`Unrecognized key: "${c}"`);
          n[c] && (a[c] = e ? new e({
            type: "optional",
            innerType: i[c]
          }) : i[c]);
        }
      else
        for (const c in i)
          a[c] = e ? new e({
            type: "optional",
            innerType: i[c]
          }) : i[c];
      return Bn(this, "shape", a), a;
    },
    checks: []
  });
  return Cn(t, s);
}
function Pm(e, t, n) {
  const r = wn(t._zod.def, {
    get shape() {
      const u = t._zod.def.shape, o = { ...u };
      if (n)
        for (const s in n) {
          if (!(s in o))
            throw new Error(`Unrecognized key: "${s}"`);
          n[s] && (o[s] = new e({
            type: "nonoptional",
            innerType: u[s]
          }));
        }
      else
        for (const s in u)
          o[s] = new e({
            type: "nonoptional",
            innerType: u[s]
          });
      return Bn(this, "shape", o), o;
    }
  });
  return Cn(t, r);
}
function Yn(e, t = 0) {
  if (e.aborted === !0)
    return !0;
  for (let n = t; n < e.issues.length; n++)
    if (e.issues[n]?.continue !== !0)
      return !0;
  return !1;
}
function Rm(e, t = 0) {
  if (e.aborted === !0)
    return !0;
  for (let n = t; n < e.issues.length; n++)
    if (e.issues[n]?.continue === !1)
      return !0;
  return !1;
}
function Xn(e, t) {
  return t.map((n) => {
    var r;
    return (r = n).path ?? (r.path = []), n.path.unshift(e), n;
  });
}
function hu(e) {
  return typeof e == "string" ? e : e?.message;
}
function sn(e, t, n) {
  const r = e.message ? e.message : hu(e.inst?._zod.def?.error?.(e)) ?? hu(t?.error?.(e)) ?? hu(n.customError?.(e)) ?? hu(n.localeError?.(e)) ?? "Invalid input", { inst: u, continue: o, input: s, ...i } = e;
  return i.path ?? (i.path = []), i.message = r, t?.reportInput && (i.input = s), i;
}
function oi(e) {
  return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function Lr(...e) {
  const [t, n, r] = e;
  return typeof t == "string" ? {
    message: t,
    code: "custom",
    input: n,
    inst: r
  } : { ...t };
}
const cf = (e, t) => {
  e.name = "$ZodError", Object.defineProperty(e, "_zod", {
    value: e._zod,
    enumerable: !1
  }), Object.defineProperty(e, "issues", {
    value: t,
    enumerable: !1
  }), e.message = JSON.stringify(t, _s, 2), Object.defineProperty(e, "toString", {
    value: () => e.message,
    enumerable: !1
  });
}, lf = S("$ZodError", cf), ff = S("$ZodError", cf, { Parent: Error });
function jm(e, t = (n) => n.message) {
  const n = {}, r = [];
  for (const u of e.issues)
    u.path.length > 0 ? (n[u.path[0]] = n[u.path[0]] || [], n[u.path[0]].push(t(u))) : r.push(t(u));
  return { formErrors: r, fieldErrors: n };
}
function Lm(e, t = (n) => n.message) {
  const n = { _errors: [] }, r = (u, o = []) => {
    for (const s of u.issues)
      if (s.code === "invalid_union" && s.errors.length)
        s.errors.map((i) => r({ issues: i }, [...o, ...s.path]));
      else if (s.code === "invalid_key")
        r({ issues: s.issues }, [...o, ...s.path]);
      else if (s.code === "invalid_element")
        r({ issues: s.issues }, [...o, ...s.path]);
      else {
        const i = [...o, ...s.path];
        if (i.length === 0)
          n._errors.push(t(s));
        else {
          let a = n, c = 0;
          for (; c < i.length; ) {
            const f = i[c];
            c === i.length - 1 ? (a[f] = a[f] || { _errors: [] }, a[f]._errors.push(t(s))) : a[f] = a[f] || { _errors: [] }, a = a[f], c++;
          }
        }
      }
  };
  return r(e), n;
}
const si = (e) => (t, n, r, u) => {
  const o = r ? { ...r, async: !1 } : { async: !1 }, s = t._zod.run({ value: n, issues: [] }, o);
  if (s instanceof Promise)
    throw new rr();
  if (s.issues.length) {
    const i = new (u?.Err ?? e)(s.issues.map((a) => sn(a, o, on())));
    throw sf(i, u?.callee), i;
  }
  return s.value;
}, ii = (e) => async (t, n, r, u) => {
  const o = r ? { ...r, async: !0 } : { async: !0 };
  let s = t._zod.run({ value: n, issues: [] }, o);
  if (s instanceof Promise && (s = await s), s.issues.length) {
    const i = new (u?.Err ?? e)(s.issues.map((a) => sn(a, o, on())));
    throw sf(i, u?.callee), i;
  }
  return s.value;
}, go = (e) => (t, n, r) => {
  const u = r ? { ...r, async: !1 } : { async: !1 }, o = t._zod.run({ value: n, issues: [] }, u);
  if (o instanceof Promise)
    throw new rr();
  return o.issues.length ? {
    success: !1,
    error: new (e ?? lf)(o.issues.map((s) => sn(s, u, on())))
  } : { success: !0, data: o.value };
}, Zm = /* @__PURE__ */ go(ff), bo = (e) => async (t, n, r) => {
  const u = r ? { ...r, async: !0 } : { async: !0 };
  let o = t._zod.run({ value: n, issues: [] }, u);
  return o instanceof Promise && (o = await o), o.issues.length ? {
    success: !1,
    error: new e(o.issues.map((s) => sn(s, u, on())))
  } : { success: !0, data: o.value };
}, Vm = /* @__PURE__ */ bo(ff), Bm = (e) => (t, n, r) => {
  const u = r ? { ...r, direction: "backward" } : { direction: "backward" };
  return si(e)(t, n, u);
}, Um = (e) => (t, n, r) => si(e)(t, n, r), Hm = (e) => async (t, n, r) => {
  const u = r ? { ...r, direction: "backward" } : { direction: "backward" };
  return ii(e)(t, n, u);
}, qm = (e) => async (t, n, r) => ii(e)(t, n, r), Jm = (e) => (t, n, r) => {
  const u = r ? { ...r, direction: "backward" } : { direction: "backward" };
  return go(e)(t, n, u);
}, Wm = (e) => (t, n, r) => go(e)(t, n, r), Gm = (e) => async (t, n, r) => {
  const u = r ? { ...r, direction: "backward" } : { direction: "backward" };
  return bo(e)(t, n, u);
}, Km = (e) => async (t, n, r) => bo(e)(t, n, r), Ym = /^[cC][0-9a-z]{6,}$/, Xm = /^[0-9a-z]+$/, Qm = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/, e1 = /^[0-9a-vA-V]{20}$/, t1 = /^[A-Za-z0-9]{27}$/, n1 = /^[a-zA-Z0-9_-]{21}$/, r1 = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, u1 = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, ya = (e) => e ? new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, o1 = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, s1 = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function i1() {
  return new RegExp(s1, "u");
}
const a1 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, c1 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, l1 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, f1 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, d1 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, df = /^[A-Za-z0-9_-]*$/, p1 = /^https?$/, h1 = /^\+[1-9]\d{6,14}$/, pf = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))", m1 = /* @__PURE__ */ new RegExp(`^${pf}$`);
function hf(e) {
  const t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function g1(e) {
  return new RegExp(`^${hf(e)}$`);
}
function b1(e) {
  const t = hf({ precision: e.precision }), n = ["Z"];
  e.local && n.push(""), e.offset && n.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
  const r = `${t}(?:${n.join("|")})`;
  return new RegExp(`^${pf}T(?:${r})$`);
}
const v1 = (e) => {
  const t = e ? `[\\s\\S]{${e?.minimum ?? 0},${e?.maximum ?? ""}}` : "[\\s\\S]*";
  return new RegExp(`^${t}$`);
}, _1 = /^-?\d+$/, mf = /^-?\d+(?:\.\d+)?$/, y1 = /^(?:true|false)$/i, x1 = /^null$/i, E1 = /^[^A-Z]*$/, k1 = /^[^a-z]*$/, ct = /* @__PURE__ */ S("$ZodCheck", (e, t) => {
  var n;
  e._zod ?? (e._zod = {}), e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), gf = {
  number: "number",
  bigint: "bigint",
  object: "date"
}, bf = /* @__PURE__ */ S("$ZodCheckLessThan", (e, t) => {
  ct.init(e, t);
  const n = gf[typeof t.value];
  e._zod.onattach.push((r) => {
    const u = r._zod.bag, o = (t.inclusive ? u.maximum : u.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
    t.value < o && (t.inclusive ? u.maximum = t.value : u.exclusiveMaximum = t.value);
  }), e._zod.check = (r) => {
    (t.inclusive ? r.value <= t.value : r.value < t.value) || r.issues.push({
      origin: n,
      code: "too_big",
      maximum: typeof t.value == "object" ? t.value.getTime() : t.value,
      input: r.value,
      inclusive: t.inclusive,
      inst: e,
      continue: !t.abort
    });
  };
}), vf = /* @__PURE__ */ S("$ZodCheckGreaterThan", (e, t) => {
  ct.init(e, t);
  const n = gf[typeof t.value];
  e._zod.onattach.push((r) => {
    const u = r._zod.bag, o = (t.inclusive ? u.minimum : u.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
    t.value > o && (t.inclusive ? u.minimum = t.value : u.exclusiveMinimum = t.value);
  }), e._zod.check = (r) => {
    (t.inclusive ? r.value >= t.value : r.value > t.value) || r.issues.push({
      origin: n,
      code: "too_small",
      minimum: typeof t.value == "object" ? t.value.getTime() : t.value,
      input: r.value,
      inclusive: t.inclusive,
      inst: e,
      continue: !t.abort
    });
  };
}), w1 = /* @__PURE__ */ S("$ZodCheckMultipleOf", (e, t) => {
  ct.init(e, t), e._zod.onattach.push((n) => {
    var r;
    (r = n._zod.bag).multipleOf ?? (r.multipleOf = t.value);
  }), e._zod.check = (n) => {
    if (typeof n.value != typeof t.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    (typeof n.value == "bigint" ? n.value % t.value === BigInt(0) : Cm(n.value, t.value) === 0) || n.issues.push({
      origin: typeof n.value,
      code: "not_multiple_of",
      divisor: t.value,
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), C1 = /* @__PURE__ */ S("$ZodCheckNumberFormat", (e, t) => {
  ct.init(e, t), t.format = t.format || "float64";
  const n = t.format?.includes("int"), r = n ? "int" : "number", [u, o] = Nm[t.format];
  e._zod.onattach.push((s) => {
    const i = s._zod.bag;
    i.format = t.format, i.minimum = u, i.maximum = o, n && (i.pattern = _1);
  }), e._zod.check = (s) => {
    const i = s.value;
    if (n) {
      if (!Number.isInteger(i)) {
        s.issues.push({
          expected: r,
          format: t.format,
          code: "invalid_type",
          continue: !1,
          input: i,
          inst: e
        });
        return;
      }
      if (!Number.isSafeInteger(i)) {
        i > 0 ? s.issues.push({
          input: i,
          code: "too_big",
          maximum: Number.MAX_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: e,
          origin: r,
          inclusive: !0,
          continue: !t.abort
        }) : s.issues.push({
          input: i,
          code: "too_small",
          minimum: Number.MIN_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: e,
          origin: r,
          inclusive: !0,
          continue: !t.abort
        });
        return;
      }
    }
    i < u && s.issues.push({
      origin: "number",
      input: i,
      code: "too_small",
      minimum: u,
      inclusive: !0,
      inst: e,
      continue: !t.abort
    }), i > o && s.issues.push({
      origin: "number",
      input: i,
      code: "too_big",
      maximum: o,
      inclusive: !0,
      inst: e,
      continue: !t.abort
    });
  };
}), A1 = /* @__PURE__ */ S("$ZodCheckMaxLength", (e, t) => {
  var n;
  ct.init(e, t), (n = e._zod.def).when ?? (n.when = (r) => {
    const u = r.value;
    return !ri(u) && u.length !== void 0;
  }), e._zod.onattach.push((r) => {
    const u = r._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    t.maximum < u && (r._zod.bag.maximum = t.maximum);
  }), e._zod.check = (r) => {
    const u = r.value;
    if (u.length <= t.maximum)
      return;
    const s = oi(u);
    r.issues.push({
      origin: s,
      code: "too_big",
      maximum: t.maximum,
      inclusive: !0,
      input: u,
      inst: e,
      continue: !t.abort
    });
  };
}), D1 = /* @__PURE__ */ S("$ZodCheckMinLength", (e, t) => {
  var n;
  ct.init(e, t), (n = e._zod.def).when ?? (n.when = (r) => {
    const u = r.value;
    return !ri(u) && u.length !== void 0;
  }), e._zod.onattach.push((r) => {
    const u = r._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    t.minimum > u && (r._zod.bag.minimum = t.minimum);
  }), e._zod.check = (r) => {
    const u = r.value;
    if (u.length >= t.minimum)
      return;
    const s = oi(u);
    r.issues.push({
      origin: s,
      code: "too_small",
      minimum: t.minimum,
      inclusive: !0,
      input: u,
      inst: e,
      continue: !t.abort
    });
  };
}), S1 = /* @__PURE__ */ S("$ZodCheckLengthEquals", (e, t) => {
  var n;
  ct.init(e, t), (n = e._zod.def).when ?? (n.when = (r) => {
    const u = r.value;
    return !ri(u) && u.length !== void 0;
  }), e._zod.onattach.push((r) => {
    const u = r._zod.bag;
    u.minimum = t.length, u.maximum = t.length, u.length = t.length;
  }), e._zod.check = (r) => {
    const u = r.value, o = u.length;
    if (o === t.length)
      return;
    const s = oi(u), i = o > t.length;
    r.issues.push({
      origin: s,
      ...i ? { code: "too_big", maximum: t.length } : { code: "too_small", minimum: t.length },
      inclusive: !0,
      exact: !0,
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
}), vo = /* @__PURE__ */ S("$ZodCheckStringFormat", (e, t) => {
  var n, r;
  ct.init(e, t), e._zod.onattach.push((u) => {
    const o = u._zod.bag;
    o.format = t.format, t.pattern && (o.patterns ?? (o.patterns = /* @__PURE__ */ new Set()), o.patterns.add(t.pattern));
  }), t.pattern ? (n = e._zod).check ?? (n.check = (u) => {
    t.pattern.lastIndex = 0, !t.pattern.test(u.value) && u.issues.push({
      origin: "string",
      code: "invalid_format",
      format: t.format,
      input: u.value,
      ...t.pattern ? { pattern: t.pattern.toString() } : {},
      inst: e,
      continue: !t.abort
    });
  }) : (r = e._zod).check ?? (r.check = () => {
  });
}), $1 = /* @__PURE__ */ S("$ZodCheckRegex", (e, t) => {
  vo.init(e, t), e._zod.check = (n) => {
    t.pattern.lastIndex = 0, !t.pattern.test(n.value) && n.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "regex",
      input: n.value,
      pattern: t.pattern.toString(),
      inst: e,
      continue: !t.abort
    });
  };
}), N1 = /* @__PURE__ */ S("$ZodCheckLowerCase", (e, t) => {
  t.pattern ?? (t.pattern = E1), vo.init(e, t);
}), O1 = /* @__PURE__ */ S("$ZodCheckUpperCase", (e, t) => {
  t.pattern ?? (t.pattern = k1), vo.init(e, t);
}), I1 = /* @__PURE__ */ S("$ZodCheckIncludes", (e, t) => {
  ct.init(e, t);
  const n = ar(t.includes), r = new RegExp(typeof t.position == "number" ? `^.{${t.position}}${n}` : n);
  t.pattern = r, e._zod.onattach.push((u) => {
    const o = u._zod.bag;
    o.patterns ?? (o.patterns = /* @__PURE__ */ new Set()), o.patterns.add(r);
  }), e._zod.check = (u) => {
    u.value.includes(t.includes, t.position) || u.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "includes",
      includes: t.includes,
      input: u.value,
      inst: e,
      continue: !t.abort
    });
  };
}), T1 = /* @__PURE__ */ S("$ZodCheckStartsWith", (e, t) => {
  ct.init(e, t);
  const n = new RegExp(`^${ar(t.prefix)}.*`);
  t.pattern ?? (t.pattern = n), e._zod.onattach.push((r) => {
    const u = r._zod.bag;
    u.patterns ?? (u.patterns = /* @__PURE__ */ new Set()), u.patterns.add(n);
  }), e._zod.check = (r) => {
    r.value.startsWith(t.prefix) || r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "starts_with",
      prefix: t.prefix,
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
}), F1 = /* @__PURE__ */ S("$ZodCheckEndsWith", (e, t) => {
  ct.init(e, t);
  const n = new RegExp(`.*${ar(t.suffix)}$`);
  t.pattern ?? (t.pattern = n), e._zod.onattach.push((r) => {
    const u = r._zod.bag;
    u.patterns ?? (u.patterns = /* @__PURE__ */ new Set()), u.patterns.add(n);
  }), e._zod.check = (r) => {
    r.value.endsWith(t.suffix) || r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "ends_with",
      suffix: t.suffix,
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
}), z1 = /* @__PURE__ */ S("$ZodCheckOverwrite", (e, t) => {
  ct.init(e, t), e._zod.check = (n) => {
    n.value = t.tx(n.value);
  };
});
class M1 {
  constructor(t = []) {
    this.content = [], this.indent = 0, this && (this.args = t);
  }
  indented(t) {
    this.indent += 1, t(this), this.indent -= 1;
  }
  write(t) {
    if (typeof t == "function") {
      t(this, { execution: "sync" }), t(this, { execution: "async" });
      return;
    }
    const r = t.split(`
`).filter((s) => s), u = Math.min(...r.map((s) => s.length - s.trimStart().length)), o = r.map((s) => s.slice(u)).map((s) => " ".repeat(this.indent * 2) + s);
    for (const s of o)
      this.content.push(s);
  }
  compile() {
    const t = Function, n = this?.args, u = [...(this?.content ?? [""]).map((o) => `  ${o}`)];
    return new t(...n, u.join(`
`));
  }
}
const P1 = {
  major: 4,
  minor: 4,
  patch: 3
}, Ae = /* @__PURE__ */ S("$ZodType", (e, t) => {
  var n;
  e ?? (e = {}), e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = P1;
  const r = [...e._zod.def.checks ?? []];
  e._zod.traits.has("$ZodCheck") && r.unshift(e);
  for (const u of r)
    for (const o of u._zod.onattach)
      o(e);
  if (r.length === 0)
    (n = e._zod).deferred ?? (n.deferred = []), e._zod.deferred?.push(() => {
      e._zod.run = e._zod.parse;
    });
  else {
    const u = (s, i, a) => {
      let c = Yn(s), f;
      for (const l of i) {
        if (l._zod.def.when) {
          if (Rm(s) || !l._zod.def.when(s))
            continue;
        } else if (c)
          continue;
        const d = s.issues.length, p = l._zod.check(s);
        if (p instanceof Promise && a?.async === !1)
          throw new rr();
        if (f || p instanceof Promise)
          f = (f ?? Promise.resolve()).then(async () => {
            await p, s.issues.length !== d && (c || (c = Yn(s, d)));
          });
        else {
          if (s.issues.length === d)
            continue;
          c || (c = Yn(s, d));
        }
      }
      return f ? f.then(() => s) : s;
    }, o = (s, i, a) => {
      if (Yn(s))
        return s.aborted = !0, s;
      const c = u(i, r, a);
      if (c instanceof Promise) {
        if (a.async === !1)
          throw new rr();
        return c.then((f) => e._zod.parse(f, a));
      }
      return e._zod.parse(c, a);
    };
    e._zod.run = (s, i) => {
      if (i.skipChecks)
        return e._zod.parse(s, i);
      if (i.direction === "backward") {
        const c = e._zod.parse({ value: s.value, issues: [] }, { ...i, skipChecks: !0 });
        return c instanceof Promise ? c.then((f) => o(f, s, i)) : o(c, s, i);
      }
      const a = e._zod.parse(s, i);
      if (a instanceof Promise) {
        if (i.async === !1)
          throw new rr();
        return a.then((c) => u(c, r, i));
      }
      return u(a, r, i);
    };
  }
  ce(e, "~standard", () => ({
    validate: (u) => {
      try {
        const o = Zm(e, u);
        return o.success ? { value: o.data } : { issues: o.error?.issues };
      } catch {
        return Vm(e, u).then((s) => s.success ? { value: s.data } : { issues: s.error?.issues });
      }
    },
    vendor: "zod",
    version: 1
  }));
}), ai = /* @__PURE__ */ S("$ZodString", (e, t) => {
  Ae.init(e, t), e._zod.pattern = [...e?._zod.bag?.patterns ?? []].pop() ?? v1(e._zod.bag), e._zod.parse = (n, r) => {
    if (t.coerce)
      try {
        n.value = String(n.value);
      } catch {
      }
    return typeof n.value == "string" || n.issues.push({
      expected: "string",
      code: "invalid_type",
      input: n.value,
      inst: e
    }), n;
  };
}), Ne = /* @__PURE__ */ S("$ZodStringFormat", (e, t) => {
  vo.init(e, t), ai.init(e, t);
}), R1 = /* @__PURE__ */ S("$ZodGUID", (e, t) => {
  t.pattern ?? (t.pattern = u1), Ne.init(e, t);
}), j1 = /* @__PURE__ */ S("$ZodUUID", (e, t) => {
  if (t.version) {
    const r = {
      v1: 1,
      v2: 2,
      v3: 3,
      v4: 4,
      v5: 5,
      v6: 6,
      v7: 7,
      v8: 8
    }[t.version];
    if (r === void 0)
      throw new Error(`Invalid UUID version: "${t.version}"`);
    t.pattern ?? (t.pattern = ya(r));
  } else
    t.pattern ?? (t.pattern = ya());
  Ne.init(e, t);
}), L1 = /* @__PURE__ */ S("$ZodEmail", (e, t) => {
  t.pattern ?? (t.pattern = o1), Ne.init(e, t);
}), Z1 = /* @__PURE__ */ S("$ZodURL", (e, t) => {
  Ne.init(e, t), e._zod.check = (n) => {
    try {
      const r = n.value.trim();
      if (!t.normalize && t.protocol?.source === p1.source && !/^https?:\/\//i.test(r)) {
        n.issues.push({
          code: "invalid_format",
          format: "url",
          note: "Invalid URL format",
          input: n.value,
          inst: e,
          continue: !t.abort
        });
        return;
      }
      const u = new URL(r);
      t.hostname && (t.hostname.lastIndex = 0, t.hostname.test(u.hostname) || n.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid hostname",
        pattern: t.hostname.source,
        input: n.value,
        inst: e,
        continue: !t.abort
      })), t.protocol && (t.protocol.lastIndex = 0, t.protocol.test(u.protocol.endsWith(":") ? u.protocol.slice(0, -1) : u.protocol) || n.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid protocol",
        pattern: t.protocol.source,
        input: n.value,
        inst: e,
        continue: !t.abort
      })), t.normalize ? n.value = u.href : n.value = r;
      return;
    } catch {
      n.issues.push({
        code: "invalid_format",
        format: "url",
        input: n.value,
        inst: e,
        continue: !t.abort
      });
    }
  };
}), V1 = /* @__PURE__ */ S("$ZodEmoji", (e, t) => {
  t.pattern ?? (t.pattern = i1()), Ne.init(e, t);
}), B1 = /* @__PURE__ */ S("$ZodNanoID", (e, t) => {
  t.pattern ?? (t.pattern = n1), Ne.init(e, t);
}), U1 = /* @__PURE__ */ S("$ZodCUID", (e, t) => {
  t.pattern ?? (t.pattern = Ym), Ne.init(e, t);
}), H1 = /* @__PURE__ */ S("$ZodCUID2", (e, t) => {
  t.pattern ?? (t.pattern = Xm), Ne.init(e, t);
}), q1 = /* @__PURE__ */ S("$ZodULID", (e, t) => {
  t.pattern ?? (t.pattern = Qm), Ne.init(e, t);
}), J1 = /* @__PURE__ */ S("$ZodXID", (e, t) => {
  t.pattern ?? (t.pattern = e1), Ne.init(e, t);
}), W1 = /* @__PURE__ */ S("$ZodKSUID", (e, t) => {
  t.pattern ?? (t.pattern = t1), Ne.init(e, t);
}), G1 = /* @__PURE__ */ S("$ZodISODateTime", (e, t) => {
  t.pattern ?? (t.pattern = b1(t)), Ne.init(e, t);
}), K1 = /* @__PURE__ */ S("$ZodISODate", (e, t) => {
  t.pattern ?? (t.pattern = m1), Ne.init(e, t);
}), Y1 = /* @__PURE__ */ S("$ZodISOTime", (e, t) => {
  t.pattern ?? (t.pattern = g1(t)), Ne.init(e, t);
}), X1 = /* @__PURE__ */ S("$ZodISODuration", (e, t) => {
  t.pattern ?? (t.pattern = r1), Ne.init(e, t);
}), Q1 = /* @__PURE__ */ S("$ZodIPv4", (e, t) => {
  t.pattern ?? (t.pattern = a1), Ne.init(e, t), e._zod.bag.format = "ipv4";
}), eg = /* @__PURE__ */ S("$ZodIPv6", (e, t) => {
  t.pattern ?? (t.pattern = c1), Ne.init(e, t), e._zod.bag.format = "ipv6", e._zod.check = (n) => {
    try {
      new URL(`http://[${n.value}]`);
    } catch {
      n.issues.push({
        code: "invalid_format",
        format: "ipv6",
        input: n.value,
        inst: e,
        continue: !t.abort
      });
    }
  };
}), tg = /* @__PURE__ */ S("$ZodCIDRv4", (e, t) => {
  t.pattern ?? (t.pattern = l1), Ne.init(e, t);
}), ng = /* @__PURE__ */ S("$ZodCIDRv6", (e, t) => {
  t.pattern ?? (t.pattern = f1), Ne.init(e, t), e._zod.check = (n) => {
    const r = n.value.split("/");
    try {
      if (r.length !== 2)
        throw new Error();
      const [u, o] = r;
      if (!o)
        throw new Error();
      const s = Number(o);
      if (`${s}` !== o)
        throw new Error();
      if (s < 0 || s > 128)
        throw new Error();
      new URL(`http://[${u}]`);
    } catch {
      n.issues.push({
        code: "invalid_format",
        format: "cidrv6",
        input: n.value,
        inst: e,
        continue: !t.abort
      });
    }
  };
});
function _f(e) {
  if (e === "")
    return !0;
  if (/\s/.test(e) || e.length % 4 !== 0)
    return !1;
  try {
    return atob(e), !0;
  } catch {
    return !1;
  }
}
const rg = /* @__PURE__ */ S("$ZodBase64", (e, t) => {
  t.pattern ?? (t.pattern = d1), Ne.init(e, t), e._zod.bag.contentEncoding = "base64", e._zod.check = (n) => {
    _f(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
});
function ug(e) {
  if (!df.test(e))
    return !1;
  const t = e.replace(/[-_]/g, (r) => r === "-" ? "+" : "/"), n = t.padEnd(Math.ceil(t.length / 4) * 4, "=");
  return _f(n);
}
const og = /* @__PURE__ */ S("$ZodBase64URL", (e, t) => {
  t.pattern ?? (t.pattern = df), Ne.init(e, t), e._zod.bag.contentEncoding = "base64url", e._zod.check = (n) => {
    ug(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), sg = /* @__PURE__ */ S("$ZodE164", (e, t) => {
  t.pattern ?? (t.pattern = h1), Ne.init(e, t);
});
function ig(e, t = null) {
  try {
    const n = e.split(".");
    if (n.length !== 3)
      return !1;
    const [r] = n;
    if (!r)
      return !1;
    const u = JSON.parse(atob(r));
    return !("typ" in u && u?.typ !== "JWT" || !u.alg || t && (!("alg" in u) || u.alg !== t));
  } catch {
    return !1;
  }
}
const ag = /* @__PURE__ */ S("$ZodJWT", (e, t) => {
  Ne.init(e, t), e._zod.check = (n) => {
    ig(n.value, t.alg) || n.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), yf = /* @__PURE__ */ S("$ZodNumber", (e, t) => {
  Ae.init(e, t), e._zod.pattern = e._zod.bag.pattern ?? mf, e._zod.parse = (n, r) => {
    if (t.coerce)
      try {
        n.value = Number(n.value);
      } catch {
      }
    const u = n.value;
    if (typeof u == "number" && !Number.isNaN(u) && Number.isFinite(u))
      return n;
    const o = typeof u == "number" ? Number.isNaN(u) ? "NaN" : Number.isFinite(u) ? void 0 : "Infinity" : void 0;
    return n.issues.push({
      expected: "number",
      code: "invalid_type",
      input: u,
      inst: e,
      ...o ? { received: o } : {}
    }), n;
  };
}), cg = /* @__PURE__ */ S("$ZodNumberFormat", (e, t) => {
  C1.init(e, t), yf.init(e, t);
}), lg = /* @__PURE__ */ S("$ZodBoolean", (e, t) => {
  Ae.init(e, t), e._zod.pattern = y1, e._zod.parse = (n, r) => {
    if (t.coerce)
      try {
        n.value = !!n.value;
      } catch {
      }
    const u = n.value;
    return typeof u == "boolean" || n.issues.push({
      expected: "boolean",
      code: "invalid_type",
      input: u,
      inst: e
    }), n;
  };
}), fg = /* @__PURE__ */ S("$ZodNull", (e, t) => {
  Ae.init(e, t), e._zod.pattern = x1, e._zod.values = /* @__PURE__ */ new Set([null]), e._zod.parse = (n, r) => {
    const u = n.value;
    return u === null || n.issues.push({
      expected: "null",
      code: "invalid_type",
      input: u,
      inst: e
    }), n;
  };
}), dg = /* @__PURE__ */ S("$ZodUnknown", (e, t) => {
  Ae.init(e, t), e._zod.parse = (n) => n;
}), pg = /* @__PURE__ */ S("$ZodNever", (e, t) => {
  Ae.init(e, t), e._zod.parse = (n, r) => (n.issues.push({
    expected: "never",
    code: "invalid_type",
    input: n.value,
    inst: e
  }), n);
});
function xa(e, t, n) {
  e.issues.length && t.issues.push(...Xn(n, e.issues)), t.value[n] = e.value;
}
const hg = /* @__PURE__ */ S("$ZodArray", (e, t) => {
  Ae.init(e, t), e._zod.parse = (n, r) => {
    const u = n.value;
    if (!Array.isArray(u))
      return n.issues.push({
        expected: "array",
        code: "invalid_type",
        input: u,
        inst: e
      }), n;
    n.value = Array(u.length);
    const o = [];
    for (let s = 0; s < u.length; s++) {
      const i = u[s], a = t.element._zod.run({
        value: i,
        issues: []
      }, r);
      a instanceof Promise ? o.push(a.then((c) => xa(c, n, s))) : xa(a, n, s);
    }
    return o.length ? Promise.all(o).then(() => n) : n;
  };
});
function Ju(e, t, n, r, u, o) {
  const s = n in r;
  if (e.issues.length) {
    if (u && o && !s)
      return;
    t.issues.push(...Xn(n, e.issues));
  }
  if (!s && !u) {
    e.issues.length || t.issues.push({
      code: "invalid_type",
      expected: "nonoptional",
      input: void 0,
      path: [n]
    });
    return;
  }
  e.value === void 0 ? s && (t.value[n] = void 0) : t.value[n] = e.value;
}
function xf(e) {
  const t = Object.keys(e.shape);
  for (const r of t)
    if (!e.shape?.[r]?._zod?.traits?.has("$ZodType"))
      throw new Error(`Invalid element at key "${r}": expected a Zod schema`);
  const n = $m(e.shape);
  return {
    ...e,
    keys: t,
    keySet: new Set(t),
    numKeys: t.length,
    optionalKeys: new Set(n)
  };
}
function Ef(e, t, n, r, u, o) {
  const s = [], i = u.keySet, a = u.catchall._zod, c = a.def.type, f = a.optin === "optional", l = a.optout === "optional";
  for (const d in t) {
    if (d === "__proto__" || i.has(d))
      continue;
    if (c === "never") {
      s.push(d);
      continue;
    }
    const p = a.run({ value: t[d], issues: [] }, r);
    p instanceof Promise ? e.push(p.then((m) => Ju(m, n, d, t, f, l))) : Ju(p, n, d, t, f, l);
  }
  return s.length && n.issues.push({
    code: "unrecognized_keys",
    keys: s,
    input: t,
    inst: o
  }), e.length ? Promise.all(e).then(() => n) : n;
}
const mg = /* @__PURE__ */ S("$ZodObject", (e, t) => {
  if (Ae.init(e, t), !Object.getOwnPropertyDescriptor(t, "shape")?.get) {
    const i = t.shape;
    Object.defineProperty(t, "shape", {
      get: () => {
        const a = { ...i };
        return Object.defineProperty(t, "shape", {
          value: a
        }), a;
      }
    });
  }
  const r = mo(() => xf(t));
  ce(e._zod, "propValues", () => {
    const i = t.shape, a = {};
    for (const c in i) {
      const f = i[c]._zod;
      if (f.values) {
        a[c] ?? (a[c] = /* @__PURE__ */ new Set());
        for (const l of f.values)
          a[c].add(l);
      }
    }
    return a;
  });
  const u = jr, o = t.catchall;
  let s;
  e._zod.parse = (i, a) => {
    s ?? (s = r.value);
    const c = i.value;
    if (!u(c))
      return i.issues.push({
        expected: "object",
        code: "invalid_type",
        input: c,
        inst: e
      }), i;
    i.value = {};
    const f = [], l = s.shape;
    for (const d of s.keys) {
      const p = l[d], m = p._zod.optin === "optional", v = p._zod.optout === "optional", _ = p._zod.run({ value: c[d], issues: [] }, a);
      _ instanceof Promise ? f.push(_.then((A) => Ju(A, i, d, c, m, v))) : Ju(_, i, d, c, m, v);
    }
    return o ? Ef(f, c, i, a, r.value, e) : f.length ? Promise.all(f).then(() => i) : i;
  };
}), gg = /* @__PURE__ */ S("$ZodObjectJIT", (e, t) => {
  mg.init(e, t);
  const n = e._zod.parse, r = mo(() => xf(t)), u = (d) => {
    const p = new M1(["shape", "payload", "ctx"]), m = r.value, v = (h) => {
      const w = _a(h);
      return `shape[${w}]._zod.run({ value: input[${w}], issues: [] }, ctx)`;
    };
    p.write("const input = payload.value;");
    const _ = /* @__PURE__ */ Object.create(null);
    let A = 0;
    for (const h of m.keys)
      _[h] = `key_${A++}`;
    p.write("const newResult = {};");
    for (const h of m.keys) {
      const w = _[h], g = _a(h), y = d[h], C = y?._zod?.optin === "optional", k = y?._zod?.optout === "optional";
      p.write(`const ${w} = ${v(h)};`), C && k ? p.write(`
        if (${w}.issues.length) {
          if (${g} in input) {
            payload.issues = payload.issues.concat(${w}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${g}, ...iss.path] : [${g}]
            })));
          }
        }
        
        if (${w}.value === undefined) {
          if (${g} in input) {
            newResult[${g}] = undefined;
          }
        } else {
          newResult[${g}] = ${w}.value;
        }
        
      `) : C ? p.write(`
        if (${w}.issues.length) {
          payload.issues = payload.issues.concat(${w}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${g}, ...iss.path] : [${g}]
          })));
        }
        
        if (${w}.value === undefined) {
          if (${g} in input) {
            newResult[${g}] = undefined;
          }
        } else {
          newResult[${g}] = ${w}.value;
        }
        
      `) : p.write(`
        const ${w}_present = ${g} in input;
        if (${w}.issues.length) {
          payload.issues = payload.issues.concat(${w}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${g}, ...iss.path] : [${g}]
          })));
        }
        if (!${w}_present && !${w}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${g}]
          });
        }

        if (${w}_present) {
          if (${w}.value === undefined) {
            newResult[${g}] = undefined;
          } else {
            newResult[${g}] = ${w}.value;
          }
        }

      `);
    }
    p.write("payload.value = newResult;"), p.write("return payload;");
    const E = p.compile();
    return (h, w) => E(d, h, w);
  };
  let o;
  const s = jr, i = !ni.jitless, c = i && Dm.value, f = t.catchall;
  let l;
  e._zod.parse = (d, p) => {
    l ?? (l = r.value);
    const m = d.value;
    return s(m) ? i && c && p?.async === !1 && p.jitless !== !0 ? (o || (o = u(t.shape)), d = o(d, p), f ? Ef([], m, d, p, l, e) : d) : n(d, p) : (d.issues.push({
      expected: "object",
      code: "invalid_type",
      input: m,
      inst: e
    }), d);
  };
});
function Ea(e, t, n, r) {
  for (const o of e)
    if (o.issues.length === 0)
      return t.value = o.value, t;
  const u = e.filter((o) => !Yn(o));
  return u.length === 1 ? (t.value = u[0].value, u[0]) : (t.issues.push({
    code: "invalid_union",
    input: t.value,
    inst: n,
    errors: e.map((o) => o.issues.map((s) => sn(s, r, on())))
  }), t);
}
const kf = /* @__PURE__ */ S("$ZodUnion", (e, t) => {
  Ae.init(e, t), ce(e._zod, "optin", () => t.options.some((r) => r._zod.optin === "optional") ? "optional" : void 0), ce(e._zod, "optout", () => t.options.some((r) => r._zod.optout === "optional") ? "optional" : void 0), ce(e._zod, "values", () => {
    if (t.options.every((r) => r._zod.values))
      return new Set(t.options.flatMap((r) => Array.from(r._zod.values)));
  }), ce(e._zod, "pattern", () => {
    if (t.options.every((r) => r._zod.pattern)) {
      const r = t.options.map((u) => u._zod.pattern);
      return new RegExp(`^(${r.map((u) => ui(u.source)).join("|")})$`);
    }
  });
  const n = t.options.length === 1 ? t.options[0]._zod.run : null;
  e._zod.parse = (r, u) => {
    if (n)
      return n(r, u);
    let o = !1;
    const s = [];
    for (const i of t.options) {
      const a = i._zod.run({
        value: r.value,
        issues: []
      }, u);
      if (a instanceof Promise)
        s.push(a), o = !0;
      else {
        if (a.issues.length === 0)
          return a;
        s.push(a);
      }
    }
    return o ? Promise.all(s).then((i) => Ea(i, r, e, u)) : Ea(s, r, e, u);
  };
}), bg = /* @__PURE__ */ S("$ZodDiscriminatedUnion", (e, t) => {
  t.inclusive = !1, kf.init(e, t);
  const n = e._zod.parse;
  ce(e._zod, "propValues", () => {
    const u = {};
    for (const o of t.options) {
      const s = o._zod.propValues;
      if (!s || Object.keys(s).length === 0)
        throw new Error(`Invalid discriminated union option at index "${t.options.indexOf(o)}"`);
      for (const [i, a] of Object.entries(s)) {
        u[i] || (u[i] = /* @__PURE__ */ new Set());
        for (const c of a)
          u[i].add(c);
      }
    }
    return u;
  });
  const r = mo(() => {
    const u = t.options, o = /* @__PURE__ */ new Map();
    for (const s of u) {
      const i = s._zod.propValues?.[t.discriminator];
      if (!i || i.size === 0)
        throw new Error(`Invalid discriminated union option at index "${t.options.indexOf(s)}"`);
      for (const a of i) {
        if (o.has(a))
          throw new Error(`Duplicate discriminator value "${String(a)}"`);
        o.set(a, s);
      }
    }
    return o;
  });
  e._zod.parse = (u, o) => {
    const s = u.value;
    if (!jr(s))
      return u.issues.push({
        code: "invalid_type",
        expected: "object",
        input: s,
        inst: e
      }), u;
    const i = r.value.get(s?.[t.discriminator]);
    return i ? i._zod.run(u, o) : t.unionFallback || o.direction === "backward" ? n(u, o) : (u.issues.push({
      code: "invalid_union",
      errors: [],
      note: "No matching discriminator",
      discriminator: t.discriminator,
      options: Array.from(r.value.keys()),
      input: s,
      path: [t.discriminator],
      inst: e
    }), u);
  };
}), vg = /* @__PURE__ */ S("$ZodIntersection", (e, t) => {
  Ae.init(e, t), e._zod.parse = (n, r) => {
    const u = n.value, o = t.left._zod.run({ value: u, issues: [] }, r), s = t.right._zod.run({ value: u, issues: [] }, r);
    return o instanceof Promise || s instanceof Promise ? Promise.all([o, s]).then(([a, c]) => ka(n, a, c)) : ka(n, o, s);
  };
});
function ys(e, t) {
  if (e === t)
    return { valid: !0, data: e };
  if (e instanceof Date && t instanceof Date && +e == +t)
    return { valid: !0, data: e };
  if (ir(e) && ir(t)) {
    const n = Object.keys(t), r = Object.keys(e).filter((o) => n.indexOf(o) !== -1), u = { ...e, ...t };
    for (const o of r) {
      const s = ys(e[o], t[o]);
      if (!s.valid)
        return {
          valid: !1,
          mergeErrorPath: [o, ...s.mergeErrorPath]
        };
      u[o] = s.data;
    }
    return { valid: !0, data: u };
  }
  if (Array.isArray(e) && Array.isArray(t)) {
    if (e.length !== t.length)
      return { valid: !1, mergeErrorPath: [] };
    const n = [];
    for (let r = 0; r < e.length; r++) {
      const u = e[r], o = t[r], s = ys(u, o);
      if (!s.valid)
        return {
          valid: !1,
          mergeErrorPath: [r, ...s.mergeErrorPath]
        };
      n.push(s.data);
    }
    return { valid: !0, data: n };
  }
  return { valid: !1, mergeErrorPath: [] };
}
function ka(e, t, n) {
  const r = /* @__PURE__ */ new Map();
  let u;
  for (const i of t.issues)
    if (i.code === "unrecognized_keys") {
      u ?? (u = i);
      for (const a of i.keys)
        r.has(a) || r.set(a, {}), r.get(a).l = !0;
    } else
      e.issues.push(i);
  for (const i of n.issues)
    if (i.code === "unrecognized_keys")
      for (const a of i.keys)
        r.has(a) || r.set(a, {}), r.get(a).r = !0;
    else
      e.issues.push(i);
  const o = [...r].filter(([, i]) => i.l && i.r).map(([i]) => i);
  if (o.length && u && e.issues.push({ ...u, keys: o }), Yn(e))
    return e;
  const s = ys(t.value, n.value);
  if (!s.valid)
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(s.mergeErrorPath)}`);
  return e.value = s.data, e;
}
const _g = /* @__PURE__ */ S("$ZodRecord", (e, t) => {
  Ae.init(e, t), e._zod.parse = (n, r) => {
    const u = n.value;
    if (!ir(u))
      return n.issues.push({
        expected: "record",
        code: "invalid_type",
        input: u,
        inst: e
      }), n;
    const o = [], s = t.keyType._zod.values;
    if (s) {
      n.value = {};
      const i = /* @__PURE__ */ new Set();
      for (const c of s)
        if (typeof c == "string" || typeof c == "number" || typeof c == "symbol") {
          i.add(typeof c == "number" ? c.toString() : c);
          const f = t.keyType._zod.run({ value: c, issues: [] }, r);
          if (f instanceof Promise)
            throw new Error("Async schemas not supported in object keys currently");
          if (f.issues.length) {
            n.issues.push({
              code: "invalid_key",
              origin: "record",
              issues: f.issues.map((p) => sn(p, r, on())),
              input: c,
              path: [c],
              inst: e
            });
            continue;
          }
          const l = f.value, d = t.valueType._zod.run({ value: u[c], issues: [] }, r);
          d instanceof Promise ? o.push(d.then((p) => {
            p.issues.length && n.issues.push(...Xn(c, p.issues)), n.value[l] = p.value;
          })) : (d.issues.length && n.issues.push(...Xn(c, d.issues)), n.value[l] = d.value);
        }
      let a;
      for (const c in u)
        i.has(c) || (a = a ?? [], a.push(c));
      a && a.length > 0 && n.issues.push({
        code: "unrecognized_keys",
        input: u,
        inst: e,
        keys: a
      });
    } else {
      n.value = {};
      for (const i of Reflect.ownKeys(u)) {
        if (i === "__proto__" || !Object.prototype.propertyIsEnumerable.call(u, i))
          continue;
        let a = t.keyType._zod.run({ value: i, issues: [] }, r);
        if (a instanceof Promise)
          throw new Error("Async schemas not supported in object keys currently");
        if (typeof i == "string" && mf.test(i) && a.issues.length) {
          const l = t.keyType._zod.run({ value: Number(i), issues: [] }, r);
          if (l instanceof Promise)
            throw new Error("Async schemas not supported in object keys currently");
          l.issues.length === 0 && (a = l);
        }
        if (a.issues.length) {
          t.mode === "loose" ? n.value[i] = u[i] : n.issues.push({
            code: "invalid_key",
            origin: "record",
            issues: a.issues.map((l) => sn(l, r, on())),
            input: i,
            path: [i],
            inst: e
          });
          continue;
        }
        const f = t.valueType._zod.run({ value: u[i], issues: [] }, r);
        f instanceof Promise ? o.push(f.then((l) => {
          l.issues.length && n.issues.push(...Xn(i, l.issues)), n.value[a.value] = l.value;
        })) : (f.issues.length && n.issues.push(...Xn(i, f.issues)), n.value[a.value] = f.value);
      }
    }
    return o.length ? Promise.all(o).then(() => n) : n;
  };
}), yg = /* @__PURE__ */ S("$ZodEnum", (e, t) => {
  Ae.init(e, t);
  const n = of(t.entries), r = new Set(n);
  e._zod.values = r, e._zod.pattern = new RegExp(`^(${n.filter((u) => Sm.has(typeof u)).map((u) => typeof u == "string" ? ar(u) : u.toString()).join("|")})$`), e._zod.parse = (u, o) => {
    const s = u.value;
    return r.has(s) || u.issues.push({
      code: "invalid_value",
      values: n,
      input: s,
      inst: e
    }), u;
  };
}), xg = /* @__PURE__ */ S("$ZodLiteral", (e, t) => {
  if (Ae.init(e, t), t.values.length === 0)
    throw new Error("Cannot create literal schema with no valid values");
  const n = new Set(t.values);
  e._zod.values = n, e._zod.pattern = new RegExp(`^(${t.values.map((r) => typeof r == "string" ? ar(r) : r ? ar(r.toString()) : String(r)).join("|")})$`), e._zod.parse = (r, u) => {
    const o = r.value;
    return n.has(o) || r.issues.push({
      code: "invalid_value",
      values: t.values,
      input: o,
      inst: e
    }), r;
  };
}), Eg = /* @__PURE__ */ S("$ZodTransform", (e, t) => {
  Ae.init(e, t), e._zod.optin = "optional", e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      throw new uf(e.constructor.name);
    const u = t.transform(n.value, n);
    if (r.async)
      return (u instanceof Promise ? u : Promise.resolve(u)).then((s) => (n.value = s, n.fallback = !0, n));
    if (u instanceof Promise)
      throw new rr();
    return n.value = u, n.fallback = !0, n;
  };
});
function wa(e, t) {
  return t === void 0 && (e.issues.length || e.fallback) ? { issues: [], value: void 0 } : e;
}
const wf = /* @__PURE__ */ S("$ZodOptional", (e, t) => {
  Ae.init(e, t), e._zod.optin = "optional", e._zod.optout = "optional", ce(e._zod, "values", () => t.innerType._zod.values ? /* @__PURE__ */ new Set([...t.innerType._zod.values, void 0]) : void 0), ce(e._zod, "pattern", () => {
    const n = t.innerType._zod.pattern;
    return n ? new RegExp(`^(${ui(n.source)})?$`) : void 0;
  }), e._zod.parse = (n, r) => {
    if (t.innerType._zod.optin === "optional") {
      const u = n.value, o = t.innerType._zod.run(n, r);
      return o instanceof Promise ? o.then((s) => wa(s, u)) : wa(o, u);
    }
    return n.value === void 0 ? n : t.innerType._zod.run(n, r);
  };
}), kg = /* @__PURE__ */ S("$ZodExactOptional", (e, t) => {
  wf.init(e, t), ce(e._zod, "values", () => t.innerType._zod.values), ce(e._zod, "pattern", () => t.innerType._zod.pattern), e._zod.parse = (n, r) => t.innerType._zod.run(n, r);
}), wg = /* @__PURE__ */ S("$ZodNullable", (e, t) => {
  Ae.init(e, t), ce(e._zod, "optin", () => t.innerType._zod.optin), ce(e._zod, "optout", () => t.innerType._zod.optout), ce(e._zod, "pattern", () => {
    const n = t.innerType._zod.pattern;
    return n ? new RegExp(`^(${ui(n.source)}|null)$`) : void 0;
  }), ce(e._zod, "values", () => t.innerType._zod.values ? /* @__PURE__ */ new Set([...t.innerType._zod.values, null]) : void 0), e._zod.parse = (n, r) => n.value === null ? n : t.innerType._zod.run(n, r);
}), Cg = /* @__PURE__ */ S("$ZodDefault", (e, t) => {
  Ae.init(e, t), e._zod.optin = "optional", ce(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      return t.innerType._zod.run(n, r);
    if (n.value === void 0)
      return n.value = t.defaultValue, n;
    const u = t.innerType._zod.run(n, r);
    return u instanceof Promise ? u.then((o) => Ca(o, t)) : Ca(u, t);
  };
});
function Ca(e, t) {
  return e.value === void 0 && (e.value = t.defaultValue), e;
}
const Ag = /* @__PURE__ */ S("$ZodPrefault", (e, t) => {
  Ae.init(e, t), e._zod.optin = "optional", ce(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, r) => (r.direction === "backward" || n.value === void 0 && (n.value = t.defaultValue), t.innerType._zod.run(n, r));
}), Dg = /* @__PURE__ */ S("$ZodNonOptional", (e, t) => {
  Ae.init(e, t), ce(e._zod, "values", () => {
    const n = t.innerType._zod.values;
    return n ? new Set([...n].filter((r) => r !== void 0)) : void 0;
  }), e._zod.parse = (n, r) => {
    const u = t.innerType._zod.run(n, r);
    return u instanceof Promise ? u.then((o) => Aa(o, e)) : Aa(u, e);
  };
});
function Aa(e, t) {
  return !e.issues.length && e.value === void 0 && e.issues.push({
    code: "invalid_type",
    expected: "nonoptional",
    input: e.value,
    inst: t
  }), e;
}
const Sg = /* @__PURE__ */ S("$ZodCatch", (e, t) => {
  Ae.init(e, t), e._zod.optin = "optional", ce(e._zod, "optout", () => t.innerType._zod.optout), ce(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      return t.innerType._zod.run(n, r);
    const u = t.innerType._zod.run(n, r);
    return u instanceof Promise ? u.then((o) => (n.value = o.value, o.issues.length && (n.value = t.catchValue({
      ...n,
      error: {
        issues: o.issues.map((s) => sn(s, r, on()))
      },
      input: n.value
    }), n.issues = [], n.fallback = !0), n)) : (n.value = u.value, u.issues.length && (n.value = t.catchValue({
      ...n,
      error: {
        issues: u.issues.map((o) => sn(o, r, on()))
      },
      input: n.value
    }), n.issues = [], n.fallback = !0), n);
  };
}), $g = /* @__PURE__ */ S("$ZodPipe", (e, t) => {
  Ae.init(e, t), ce(e._zod, "values", () => t.in._zod.values), ce(e._zod, "optin", () => t.in._zod.optin), ce(e._zod, "optout", () => t.out._zod.optout), ce(e._zod, "propValues", () => t.in._zod.propValues), e._zod.parse = (n, r) => {
    if (r.direction === "backward") {
      const o = t.out._zod.run(n, r);
      return o instanceof Promise ? o.then((s) => mu(s, t.in, r)) : mu(o, t.in, r);
    }
    const u = t.in._zod.run(n, r);
    return u instanceof Promise ? u.then((o) => mu(o, t.out, r)) : mu(u, t.out, r);
  };
});
function mu(e, t, n) {
  return e.issues.length ? (e.aborted = !0, e) : t._zod.run({ value: e.value, issues: e.issues, fallback: e.fallback }, n);
}
const Ng = /* @__PURE__ */ S("$ZodReadonly", (e, t) => {
  Ae.init(e, t), ce(e._zod, "propValues", () => t.innerType._zod.propValues), ce(e._zod, "values", () => t.innerType._zod.values), ce(e._zod, "optin", () => t.innerType?._zod?.optin), ce(e._zod, "optout", () => t.innerType?._zod?.optout), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      return t.innerType._zod.run(n, r);
    const u = t.innerType._zod.run(n, r);
    return u instanceof Promise ? u.then(Da) : Da(u);
  };
});
function Da(e) {
  return e.value = Object.freeze(e.value), e;
}
const Og = /* @__PURE__ */ S("$ZodLazy", (e, t) => {
  Ae.init(e, t), ce(e._zod, "innerType", () => {
    const n = t;
    return n._cachedInner || (n._cachedInner = t.getter()), n._cachedInner;
  }), ce(e._zod, "pattern", () => e._zod.innerType?._zod?.pattern), ce(e._zod, "propValues", () => e._zod.innerType?._zod?.propValues), ce(e._zod, "optin", () => e._zod.innerType?._zod?.optin ?? void 0), ce(e._zod, "optout", () => e._zod.innerType?._zod?.optout ?? void 0), e._zod.parse = (n, r) => e._zod.innerType._zod.run(n, r);
}), Ig = /* @__PURE__ */ S("$ZodCustom", (e, t) => {
  ct.init(e, t), Ae.init(e, t), e._zod.parse = (n, r) => n, e._zod.check = (n) => {
    const r = n.value, u = t.fn(r);
    if (u instanceof Promise)
      return u.then((o) => Sa(o, n, r, e));
    Sa(u, n, r, e);
  };
});
function Sa(e, t, n, r) {
  if (!e) {
    const u = {
      code: "custom",
      input: n,
      inst: r,
      // incorporates params.error into issue reporting
      path: [...r._zod.def.path ?? []],
      // incorporates params.error into issue reporting
      continue: !r._zod.def.abort
      // params: inst._zod.def.params,
    };
    r._zod.def.params && (u.params = r._zod.def.params), t.issues.push(Lr(u));
  }
}
var $a;
class Tg {
  constructor() {
    this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map();
  }
  add(t, ...n) {
    const r = n[0];
    return this._map.set(t, r), r && typeof r == "object" && "id" in r && this._idmap.set(r.id, t), this;
  }
  clear() {
    return this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map(), this;
  }
  remove(t) {
    const n = this._map.get(t);
    return n && typeof n == "object" && "id" in n && this._idmap.delete(n.id), this._map.delete(t), this;
  }
  get(t) {
    const n = t._zod.parent;
    if (n) {
      const r = { ...this.get(n) ?? {} };
      delete r.id;
      const u = { ...r, ...this._map.get(t) };
      return Object.keys(u).length ? u : void 0;
    }
    return this._map.get(t);
  }
  has(t) {
    return this._map.has(t);
  }
}
function Fg() {
  return new Tg();
}
($a = globalThis).__zod_globalRegistry ?? ($a.__zod_globalRegistry = Fg());
const Ar = globalThis.__zod_globalRegistry;
// @__NO_SIDE_EFFECTS__
function zg(e, t) {
  return new e({
    type: "string",
    ...J(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Mg(e, t) {
  return new e({
    type: "string",
    format: "email",
    check: "string_format",
    abort: !1,
    ...J(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Na(e, t) {
  return new e({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: !1,
    ...J(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Pg(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    ...J(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Rg(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v4",
    ...J(t)
  });
}
// @__NO_SIDE_EFFECTS__
function jg(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v6",
    ...J(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Lg(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v7",
    ...J(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Zg(e, t) {
  return new e({
    type: "string",
    format: "url",
    check: "string_format",
    abort: !1,
    ...J(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Vg(e, t) {
  return new e({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: !1,
    ...J(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Bg(e, t) {
  return new e({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: !1,
    ...J(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ug(e, t) {
  return new e({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: !1,
    ...J(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Hg(e, t) {
  return new e({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: !1,
    ...J(t)
  });
}
// @__NO_SIDE_EFFECTS__
function qg(e, t) {
  return new e({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: !1,
    ...J(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Jg(e, t) {
  return new e({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: !1,
    ...J(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Wg(e, t) {
  return new e({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: !1,
    ...J(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Gg(e, t) {
  return new e({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: !1,
    ...J(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Kg(e, t) {
  return new e({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: !1,
    ...J(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Yg(e, t) {
  return new e({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: !1,
    ...J(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Xg(e, t) {
  return new e({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: !1,
    ...J(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Qg(e, t) {
  return new e({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: !1,
    ...J(t)
  });
}
// @__NO_SIDE_EFFECTS__
function eb(e, t) {
  return new e({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: !1,
    ...J(t)
  });
}
// @__NO_SIDE_EFFECTS__
function tb(e, t) {
  return new e({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: !1,
    ...J(t)
  });
}
// @__NO_SIDE_EFFECTS__
function nb(e, t) {
  return new e({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: !1,
    ...J(t)
  });
}
// @__NO_SIDE_EFFECTS__
function rb(e, t) {
  return new e({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: !1,
    local: !1,
    precision: null,
    ...J(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ub(e, t) {
  return new e({
    type: "string",
    format: "date",
    check: "string_format",
    ...J(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ob(e, t) {
  return new e({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...J(t)
  });
}
// @__NO_SIDE_EFFECTS__
function sb(e, t) {
  return new e({
    type: "string",
    format: "duration",
    check: "string_format",
    ...J(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ib(e, t) {
  return new e({
    type: "number",
    checks: [],
    ...J(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ab(e, t) {
  return new e({
    type: "number",
    check: "number_format",
    abort: !1,
    format: "safeint",
    ...J(t)
  });
}
// @__NO_SIDE_EFFECTS__
function cb(e, t) {
  return new e({
    type: "boolean",
    ...J(t)
  });
}
// @__NO_SIDE_EFFECTS__
function lb(e, t) {
  return new e({
    type: "null",
    ...J(t)
  });
}
// @__NO_SIDE_EFFECTS__
function fb(e) {
  return new e({
    type: "unknown"
  });
}
// @__NO_SIDE_EFFECTS__
function db(e, t) {
  return new e({
    type: "never",
    ...J(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Oa(e, t) {
  return new bf({
    check: "less_than",
    ...J(t),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function zo(e, t) {
  return new bf({
    check: "less_than",
    ...J(t),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function Ia(e, t) {
  return new vf({
    check: "greater_than",
    ...J(t),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function Mo(e, t) {
  return new vf({
    check: "greater_than",
    ...J(t),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function Ta(e, t) {
  return new w1({
    check: "multiple_of",
    ...J(t),
    value: e
  });
}
// @__NO_SIDE_EFFECTS__
function Cf(e, t) {
  return new A1({
    check: "max_length",
    ...J(t),
    maximum: e
  });
}
// @__NO_SIDE_EFFECTS__
function Wu(e, t) {
  return new D1({
    check: "min_length",
    ...J(t),
    minimum: e
  });
}
// @__NO_SIDE_EFFECTS__
function Af(e, t) {
  return new S1({
    check: "length_equals",
    ...J(t),
    length: e
  });
}
// @__NO_SIDE_EFFECTS__
function pb(e, t) {
  return new $1({
    check: "string_format",
    format: "regex",
    ...J(t),
    pattern: e
  });
}
// @__NO_SIDE_EFFECTS__
function hb(e) {
  return new N1({
    check: "string_format",
    format: "lowercase",
    ...J(e)
  });
}
// @__NO_SIDE_EFFECTS__
function mb(e) {
  return new O1({
    check: "string_format",
    format: "uppercase",
    ...J(e)
  });
}
// @__NO_SIDE_EFFECTS__
function gb(e, t) {
  return new I1({
    check: "string_format",
    format: "includes",
    ...J(t),
    includes: e
  });
}
// @__NO_SIDE_EFFECTS__
function bb(e, t) {
  return new T1({
    check: "string_format",
    format: "starts_with",
    ...J(t),
    prefix: e
  });
}
// @__NO_SIDE_EFFECTS__
function vb(e, t) {
  return new F1({
    check: "string_format",
    format: "ends_with",
    ...J(t),
    suffix: e
  });
}
// @__NO_SIDE_EFFECTS__
function pr(e) {
  return new z1({
    check: "overwrite",
    tx: e
  });
}
// @__NO_SIDE_EFFECTS__
function _b(e) {
  return /* @__PURE__ */ pr((t) => t.normalize(e));
}
// @__NO_SIDE_EFFECTS__
function yb() {
  return /* @__PURE__ */ pr((e) => e.trim());
}
// @__NO_SIDE_EFFECTS__
function xb() {
  return /* @__PURE__ */ pr((e) => e.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function Eb() {
  return /* @__PURE__ */ pr((e) => e.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function kb() {
  return /* @__PURE__ */ pr((e) => Am(e));
}
// @__NO_SIDE_EFFECTS__
function wb(e, t, n) {
  return new e({
    type: "array",
    element: t,
    // get element() {
    //   return element;
    // },
    ...J(n)
  });
}
// @__NO_SIDE_EFFECTS__
function Cb(e, t, n) {
  const r = J(n);
  return r.abort ?? (r.abort = !0), new e({
    type: "custom",
    check: "custom",
    fn: t,
    ...r
  });
}
// @__NO_SIDE_EFFECTS__
function Ab(e, t, n) {
  return new e({
    type: "custom",
    check: "custom",
    fn: t,
    ...J(n)
  });
}
// @__NO_SIDE_EFFECTS__
function Db(e, t) {
  const n = /* @__PURE__ */ Sb((r) => (r.addIssue = (u) => {
    if (typeof u == "string")
      r.issues.push(Lr(u, r.value, n._zod.def));
    else {
      const o = u;
      o.fatal && (o.continue = !1), o.code ?? (o.code = "custom"), o.input ?? (o.input = r.value), o.inst ?? (o.inst = n), o.continue ?? (o.continue = !n._zod.def.abort), r.issues.push(Lr(o));
    }
  }, e(r.value, r)), t);
  return n;
}
// @__NO_SIDE_EFFECTS__
function Sb(e, t) {
  const n = new ct({
    check: "custom",
    ...J(t)
  });
  return n._zod.check = e, n;
}
function Gu(e) {
  let t = e?.target ?? "draft-2020-12";
  return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
    processors: e.processors ?? {},
    metadataRegistry: e?.metadata ?? Ar,
    target: t,
    unrepresentable: e?.unrepresentable ?? "throw",
    override: e?.override ?? (() => {
    }),
    io: e?.io ?? "output",
    counter: 0,
    seen: /* @__PURE__ */ new Map(),
    cycles: e?.cycles ?? "ref",
    reused: e?.reused ?? "inline",
    external: e?.external ?? void 0
  };
}
function we(e, t, n = { path: [], schemaPath: [] }) {
  var r;
  const u = e._zod.def, o = t.seen.get(e);
  if (o)
    return o.count++, n.schemaPath.includes(e) && (o.cycle = n.path), o.schema;
  const s = { schema: {}, count: 1, cycle: void 0, path: n.path };
  t.seen.set(e, s);
  const i = e._zod.toJSONSchema?.();
  if (i)
    s.schema = i;
  else {
    const f = {
      ...n,
      schemaPath: [...n.schemaPath, e],
      path: n.path
    };
    if (e._zod.processJSONSchema)
      e._zod.processJSONSchema(t, s.schema, f);
    else {
      const d = s.schema, p = t.processors[u.type];
      if (!p)
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${u.type}`);
      p(e, t, d, f);
    }
    const l = e._zod.parent;
    l && (s.ref || (s.ref = l), we(l, t, f), t.seen.get(l).isParent = !0);
  }
  const a = t.metadataRegistry.get(e);
  return a && Object.assign(s.schema, a), t.io === "input" && Xe(e) && (delete s.schema.examples, delete s.schema.default), t.io === "input" && "_prefault" in s.schema && ((r = s.schema).default ?? (r.default = s.schema._prefault)), delete s.schema._prefault, t.seen.get(e).schema;
}
function Ku(e, t) {
  const n = e.seen.get(t);
  if (!n)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const r = /* @__PURE__ */ new Map();
  for (const s of e.seen.entries()) {
    const i = e.metadataRegistry.get(s[0])?.id;
    if (i) {
      const a = r.get(i);
      if (a && a !== s[0])
        throw new Error(`Duplicate schema id "${i}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
      r.set(i, s[0]);
    }
  }
  const u = (s) => {
    const i = e.target === "draft-2020-12" ? "$defs" : "definitions";
    if (e.external) {
      const l = e.external.registry.get(s[0])?.id, d = e.external.uri ?? ((m) => m);
      if (l)
        return { ref: d(l) };
      const p = s[1].defId ?? s[1].schema.id ?? `schema${e.counter++}`;
      return s[1].defId = p, { defId: p, ref: `${d("__shared")}#/${i}/${p}` };
    }
    if (s[1] === n)
      return { ref: "#" };
    const c = `#/${i}/`, f = s[1].schema.id ?? `__schema${e.counter++}`;
    return { defId: f, ref: c + f };
  }, o = (s) => {
    if (s[1].schema.$ref)
      return;
    const i = s[1], { ref: a, defId: c } = u(s);
    i.def = { ...i.schema }, c && (i.defId = c);
    const f = i.schema;
    for (const l in f)
      delete f[l];
    f.$ref = a;
  };
  if (e.cycles === "throw")
    for (const s of e.seen.entries()) {
      const i = s[1];
      if (i.cycle)
        throw new Error(`Cycle detected: #/${i.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
    }
  for (const s of e.seen.entries()) {
    const i = s[1];
    if (t === s[0]) {
      o(s);
      continue;
    }
    if (e.external) {
      const c = e.external.registry.get(s[0])?.id;
      if (t !== s[0] && c) {
        o(s);
        continue;
      }
    }
    if (e.metadataRegistry.get(s[0])?.id) {
      o(s);
      continue;
    }
    if (i.cycle) {
      o(s);
      continue;
    }
    if (i.count > 1 && e.reused === "ref") {
      o(s);
      continue;
    }
  }
}
function Yu(e, t) {
  const n = e.seen.get(t);
  if (!n)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const r = (i) => {
    const a = e.seen.get(i);
    if (a.ref === null)
      return;
    const c = a.def ?? a.schema, f = { ...c }, l = a.ref;
    if (a.ref = null, l) {
      r(l);
      const p = e.seen.get(l), m = p.schema;
      if (m.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (c.allOf = c.allOf ?? [], c.allOf.push(m)) : Object.assign(c, m), Object.assign(c, f), i._zod.parent === l)
        for (const _ in c)
          _ === "$ref" || _ === "allOf" || _ in f || delete c[_];
      if (m.$ref && p.def)
        for (const _ in c)
          _ === "$ref" || _ === "allOf" || _ in p.def && JSON.stringify(c[_]) === JSON.stringify(p.def[_]) && delete c[_];
    }
    const d = i._zod.parent;
    if (d && d !== l) {
      r(d);
      const p = e.seen.get(d);
      if (p?.schema.$ref && (c.$ref = p.schema.$ref, p.def))
        for (const m in c)
          m === "$ref" || m === "allOf" || m in p.def && JSON.stringify(c[m]) === JSON.stringify(p.def[m]) && delete c[m];
    }
    e.override({
      zodSchema: i,
      jsonSchema: c,
      path: a.path ?? []
    });
  };
  for (const i of [...e.seen.entries()].reverse())
    r(i[0]);
  const u = {};
  if (e.target === "draft-2020-12" ? u.$schema = "https://json-schema.org/draft/2020-12/schema" : e.target === "draft-07" ? u.$schema = "http://json-schema.org/draft-07/schema#" : e.target === "draft-04" ? u.$schema = "http://json-schema.org/draft-04/schema#" : e.target, e.external?.uri) {
    const i = e.external.registry.get(t)?.id;
    if (!i)
      throw new Error("Schema is missing an `id` property");
    u.$id = e.external.uri(i);
  }
  Object.assign(u, n.def ?? n.schema);
  const o = e.metadataRegistry.get(t)?.id;
  o !== void 0 && u.id === o && delete u.id;
  const s = e.external?.defs ?? {};
  for (const i of e.seen.entries()) {
    const a = i[1];
    a.def && a.defId && (a.def.id === a.defId && delete a.def.id, s[a.defId] = a.def);
  }
  e.external || Object.keys(s).length > 0 && (e.target === "draft-2020-12" ? u.$defs = s : u.definitions = s);
  try {
    const i = JSON.parse(JSON.stringify(u));
    return Object.defineProperty(i, "~standard", {
      value: {
        ...t["~standard"],
        jsonSchema: {
          input: Xu(t, "input", e.processors),
          output: Xu(t, "output", e.processors)
        }
      },
      enumerable: !1,
      writable: !1
    }), i;
  } catch {
    throw new Error("Error converting schema to JSON.");
  }
}
function Xe(e, t) {
  const n = t ?? { seen: /* @__PURE__ */ new Set() };
  if (n.seen.has(e))
    return !1;
  n.seen.add(e);
  const r = e._zod.def;
  if (r.type === "transform")
    return !0;
  if (r.type === "array")
    return Xe(r.element, n);
  if (r.type === "set")
    return Xe(r.valueType, n);
  if (r.type === "lazy")
    return Xe(r.getter(), n);
  if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault")
    return Xe(r.innerType, n);
  if (r.type === "intersection")
    return Xe(r.left, n) || Xe(r.right, n);
  if (r.type === "record" || r.type === "map")
    return Xe(r.keyType, n) || Xe(r.valueType, n);
  if (r.type === "pipe")
    return e._zod.traits.has("$ZodCodec") ? !0 : Xe(r.in, n) || Xe(r.out, n);
  if (r.type === "object") {
    for (const u in r.shape)
      if (Xe(r.shape[u], n))
        return !0;
    return !1;
  }
  if (r.type === "union") {
    for (const u of r.options)
      if (Xe(u, n))
        return !0;
    return !1;
  }
  if (r.type === "tuple") {
    for (const u of r.items)
      if (Xe(u, n))
        return !0;
    return !!(r.rest && Xe(r.rest, n));
  }
  return !1;
}
const $b = (e, t = {}) => (n) => {
  const r = Gu({ ...n, processors: t });
  return we(e, r), Ku(r, e), Yu(r, e);
}, Xu = (e, t, n = {}) => (r) => {
  const { libraryOptions: u, target: o } = r ?? {}, s = Gu({ ...u ?? {}, target: o, io: t, processors: n });
  return we(e, s), Ku(s, e), Yu(s, e);
}, Nb = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
  // do not set
}, Df = (e, t, n, r) => {
  const u = n;
  u.type = "string";
  const { minimum: o, maximum: s, format: i, patterns: a, contentEncoding: c } = e._zod.bag;
  if (typeof o == "number" && (u.minLength = o), typeof s == "number" && (u.maxLength = s), i && (u.format = Nb[i] ?? i, u.format === "" && delete u.format, i === "time" && delete u.format), c && (u.contentEncoding = c), a && a.size > 0) {
    const f = [...a];
    f.length === 1 ? u.pattern = f[0].source : f.length > 1 && (u.allOf = [
      ...f.map((l) => ({
        ...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
        pattern: l.source
      }))
    ]);
  }
}, Sf = (e, t, n, r) => {
  const u = n, { minimum: o, maximum: s, format: i, multipleOf: a, exclusiveMaximum: c, exclusiveMinimum: f } = e._zod.bag;
  typeof i == "string" && i.includes("int") ? u.type = "integer" : u.type = "number";
  const l = typeof f == "number" && f >= (o ?? Number.NEGATIVE_INFINITY), d = typeof c == "number" && c <= (s ?? Number.POSITIVE_INFINITY), p = t.target === "draft-04" || t.target === "openapi-3.0";
  l ? p ? (u.minimum = f, u.exclusiveMinimum = !0) : u.exclusiveMinimum = f : typeof o == "number" && (u.minimum = o), d ? p ? (u.maximum = c, u.exclusiveMaximum = !0) : u.exclusiveMaximum = c : typeof s == "number" && (u.maximum = s), typeof a == "number" && (u.multipleOf = a);
}, $f = (e, t, n, r) => {
  n.type = "boolean";
}, Ob = (e, t, n, r) => {
  if (t.unrepresentable === "throw")
    throw new Error("BigInt cannot be represented in JSON Schema");
}, Ib = (e, t, n, r) => {
  if (t.unrepresentable === "throw")
    throw new Error("Symbols cannot be represented in JSON Schema");
}, Nf = (e, t, n, r) => {
  t.target === "openapi-3.0" ? (n.type = "string", n.nullable = !0, n.enum = [null]) : n.type = "null";
}, Tb = (e, t, n, r) => {
  if (t.unrepresentable === "throw")
    throw new Error("Undefined cannot be represented in JSON Schema");
}, Fb = (e, t, n, r) => {
  if (t.unrepresentable === "throw")
    throw new Error("Void cannot be represented in JSON Schema");
}, Of = (e, t, n, r) => {
  n.not = {};
}, zb = (e, t, n, r) => {
}, If = (e, t, n, r) => {
}, Mb = (e, t, n, r) => {
  if (t.unrepresentable === "throw")
    throw new Error("Date cannot be represented in JSON Schema");
}, Tf = (e, t, n, r) => {
  const u = e._zod.def, o = of(u.entries);
  o.every((s) => typeof s == "number") && (n.type = "number"), o.every((s) => typeof s == "string") && (n.type = "string"), n.enum = o;
}, Ff = (e, t, n, r) => {
  const u = e._zod.def, o = [];
  for (const s of u.values)
    if (s === void 0) {
      if (t.unrepresentable === "throw")
        throw new Error("Literal `undefined` cannot be represented in JSON Schema");
    } else if (typeof s == "bigint") {
      if (t.unrepresentable === "throw")
        throw new Error("BigInt literals cannot be represented in JSON Schema");
      o.push(Number(s));
    } else
      o.push(s);
  if (o.length !== 0) if (o.length === 1) {
    const s = o[0];
    n.type = s === null ? "null" : typeof s, t.target === "draft-04" || t.target === "openapi-3.0" ? n.enum = [s] : n.const = s;
  } else
    o.every((s) => typeof s == "number") && (n.type = "number"), o.every((s) => typeof s == "string") && (n.type = "string"), o.every((s) => typeof s == "boolean") && (n.type = "boolean"), o.every((s) => s === null) && (n.type = "null"), n.enum = o;
}, Pb = (e, t, n, r) => {
  if (t.unrepresentable === "throw")
    throw new Error("NaN cannot be represented in JSON Schema");
}, Rb = (e, t, n, r) => {
  const u = n, o = e._zod.pattern;
  if (!o)
    throw new Error("Pattern not found in template literal");
  u.type = "string", u.pattern = o.source;
}, jb = (e, t, n, r) => {
  const u = n, o = {
    type: "string",
    format: "binary",
    contentEncoding: "binary"
  }, { minimum: s, maximum: i, mime: a } = e._zod.bag;
  s !== void 0 && (o.minLength = s), i !== void 0 && (o.maxLength = i), a ? a.length === 1 ? (o.contentMediaType = a[0], Object.assign(u, o)) : (Object.assign(u, o), u.anyOf = a.map((c) => ({ contentMediaType: c }))) : Object.assign(u, o);
}, Lb = (e, t, n, r) => {
  n.type = "boolean";
}, zf = (e, t, n, r) => {
  if (t.unrepresentable === "throw")
    throw new Error("Custom types cannot be represented in JSON Schema");
}, Zb = (e, t, n, r) => {
  if (t.unrepresentable === "throw")
    throw new Error("Function types cannot be represented in JSON Schema");
}, Mf = (e, t, n, r) => {
  if (t.unrepresentable === "throw")
    throw new Error("Transforms cannot be represented in JSON Schema");
}, Vb = (e, t, n, r) => {
  if (t.unrepresentable === "throw")
    throw new Error("Map cannot be represented in JSON Schema");
}, Bb = (e, t, n, r) => {
  if (t.unrepresentable === "throw")
    throw new Error("Set cannot be represented in JSON Schema");
}, Pf = (e, t, n, r) => {
  const u = n, o = e._zod.def, { minimum: s, maximum: i } = e._zod.bag;
  typeof s == "number" && (u.minItems = s), typeof i == "number" && (u.maxItems = i), u.type = "array", u.items = we(o.element, t, {
    ...r,
    path: [...r.path, "items"]
  });
}, Rf = (e, t, n, r) => {
  const u = n, o = e._zod.def;
  u.type = "object", u.properties = {};
  const s = o.shape;
  for (const c in s)
    u.properties[c] = we(s[c], t, {
      ...r,
      path: [...r.path, "properties", c]
    });
  const i = new Set(Object.keys(s)), a = new Set([...i].filter((c) => {
    const f = o.shape[c]._zod;
    return t.io === "input" ? f.optin === void 0 : f.optout === void 0;
  }));
  a.size > 0 && (u.required = Array.from(a)), o.catchall?._zod.def.type === "never" ? u.additionalProperties = !1 : o.catchall ? o.catchall && (u.additionalProperties = we(o.catchall, t, {
    ...r,
    path: [...r.path, "additionalProperties"]
  })) : t.io === "output" && (u.additionalProperties = !1);
}, jf = (e, t, n, r) => {
  const u = e._zod.def, o = u.inclusive === !1, s = u.options.map((i, a) => we(i, t, {
    ...r,
    path: [...r.path, o ? "oneOf" : "anyOf", a]
  }));
  o ? n.oneOf = s : n.anyOf = s;
}, Lf = (e, t, n, r) => {
  const u = e._zod.def, o = we(u.left, t, {
    ...r,
    path: [...r.path, "allOf", 0]
  }), s = we(u.right, t, {
    ...r,
    path: [...r.path, "allOf", 1]
  }), i = (c) => "allOf" in c && Object.keys(c).length === 1, a = [
    ...i(o) ? o.allOf : [o],
    ...i(s) ? s.allOf : [s]
  ];
  n.allOf = a;
}, Ub = (e, t, n, r) => {
  const u = n, o = e._zod.def;
  u.type = "array";
  const s = t.target === "draft-2020-12" ? "prefixItems" : "items", i = t.target === "draft-2020-12" || t.target === "openapi-3.0" ? "items" : "additionalItems", a = o.items.map((d, p) => we(d, t, {
    ...r,
    path: [...r.path, s, p]
  })), c = o.rest ? we(o.rest, t, {
    ...r,
    path: [...r.path, i, ...t.target === "openapi-3.0" ? [o.items.length] : []]
  }) : null;
  t.target === "draft-2020-12" ? (u.prefixItems = a, c && (u.items = c)) : t.target === "openapi-3.0" ? (u.items = {
    anyOf: a
  }, c && u.items.anyOf.push(c), u.minItems = a.length, c || (u.maxItems = a.length)) : (u.items = a, c && (u.additionalItems = c));
  const { minimum: f, maximum: l } = e._zod.bag;
  typeof f == "number" && (u.minItems = f), typeof l == "number" && (u.maxItems = l);
}, Zf = (e, t, n, r) => {
  const u = n, o = e._zod.def;
  u.type = "object";
  const s = o.keyType, a = s._zod.bag?.patterns;
  if (o.mode === "loose" && a && a.size > 0) {
    const f = we(o.valueType, t, {
      ...r,
      path: [...r.path, "patternProperties", "*"]
    });
    u.patternProperties = {};
    for (const l of a)
      u.patternProperties[l.source] = f;
  } else
    (t.target === "draft-07" || t.target === "draft-2020-12") && (u.propertyNames = we(o.keyType, t, {
      ...r,
      path: [...r.path, "propertyNames"]
    })), u.additionalProperties = we(o.valueType, t, {
      ...r,
      path: [...r.path, "additionalProperties"]
    });
  const c = s._zod.values;
  if (c) {
    const f = [...c].filter((l) => typeof l == "string" || typeof l == "number");
    f.length > 0 && (u.required = f);
  }
}, Vf = (e, t, n, r) => {
  const u = e._zod.def, o = we(u.innerType, t, r), s = t.seen.get(e);
  t.target === "openapi-3.0" ? (s.ref = u.innerType, n.nullable = !0) : n.anyOf = [o, { type: "null" }];
}, Bf = (e, t, n, r) => {
  const u = e._zod.def;
  we(u.innerType, t, r);
  const o = t.seen.get(e);
  o.ref = u.innerType;
}, Uf = (e, t, n, r) => {
  const u = e._zod.def;
  we(u.innerType, t, r);
  const o = t.seen.get(e);
  o.ref = u.innerType, n.default = JSON.parse(JSON.stringify(u.defaultValue));
}, Hf = (e, t, n, r) => {
  const u = e._zod.def;
  we(u.innerType, t, r);
  const o = t.seen.get(e);
  o.ref = u.innerType, t.io === "input" && (n._prefault = JSON.parse(JSON.stringify(u.defaultValue)));
}, qf = (e, t, n, r) => {
  const u = e._zod.def;
  we(u.innerType, t, r);
  const o = t.seen.get(e);
  o.ref = u.innerType;
  let s;
  try {
    s = u.catchValue(void 0);
  } catch {
    throw new Error("Dynamic catch values are not supported in JSON Schema");
  }
  n.default = s;
}, Jf = (e, t, n, r) => {
  const u = e._zod.def, o = u.in._zod.traits.has("$ZodTransform"), s = t.io === "input" ? o ? u.out : u.in : u.out;
  we(s, t, r);
  const i = t.seen.get(e);
  i.ref = s;
}, Wf = (e, t, n, r) => {
  const u = e._zod.def;
  we(u.innerType, t, r);
  const o = t.seen.get(e);
  o.ref = u.innerType, n.readOnly = !0;
}, Hb = (e, t, n, r) => {
  const u = e._zod.def;
  we(u.innerType, t, r);
  const o = t.seen.get(e);
  o.ref = u.innerType;
}, ci = (e, t, n, r) => {
  const u = e._zod.def;
  we(u.innerType, t, r);
  const o = t.seen.get(e);
  o.ref = u.innerType;
}, Gf = (e, t, n, r) => {
  const u = e._zod.innerType;
  we(u, t, r);
  const o = t.seen.get(e);
  o.ref = u;
}, Fa = {
  string: Df,
  number: Sf,
  boolean: $f,
  bigint: Ob,
  symbol: Ib,
  null: Nf,
  undefined: Tb,
  void: Fb,
  never: Of,
  any: zb,
  unknown: If,
  date: Mb,
  enum: Tf,
  literal: Ff,
  nan: Pb,
  template_literal: Rb,
  file: jb,
  success: Lb,
  custom: zf,
  function: Zb,
  transform: Mf,
  map: Vb,
  set: Bb,
  array: Pf,
  object: Rf,
  union: jf,
  intersection: Lf,
  tuple: Ub,
  record: Zf,
  nullable: Vf,
  nonoptional: Bf,
  default: Uf,
  prefault: Hf,
  catch: qf,
  pipe: Jf,
  readonly: Wf,
  promise: Hb,
  optional: ci,
  lazy: Gf
};
function qb(e, t) {
  if ("_idmap" in e) {
    const r = e, u = Gu({ ...t, processors: Fa }), o = {};
    for (const a of r._idmap.entries()) {
      const [c, f] = a;
      we(f, u);
    }
    const s = {}, i = {
      registry: r,
      uri: t?.uri,
      defs: o
    };
    u.external = i;
    for (const a of r._idmap.entries()) {
      const [c, f] = a;
      Ku(u, f), s[c] = Yu(u, f);
    }
    if (Object.keys(o).length > 0) {
      const a = u.target === "draft-2020-12" ? "$defs" : "definitions";
      s.__shared = {
        [a]: o
      };
    }
    return { schemas: s };
  }
  const n = Gu({ ...t, processors: Fa });
  return we(e, n), Ku(n, e), Yu(n, e);
}
const Jb = /* @__PURE__ */ S("ZodISODateTime", (e, t) => {
  G1.init(e, t), Te.init(e, t);
});
function Wb(e) {
  return /* @__PURE__ */ rb(Jb, e);
}
const Gb = /* @__PURE__ */ S("ZodISODate", (e, t) => {
  K1.init(e, t), Te.init(e, t);
});
function Kb(e) {
  return /* @__PURE__ */ ub(Gb, e);
}
const Yb = /* @__PURE__ */ S("ZodISOTime", (e, t) => {
  Y1.init(e, t), Te.init(e, t);
});
function Xb(e) {
  return /* @__PURE__ */ ob(Yb, e);
}
const Qb = /* @__PURE__ */ S("ZodISODuration", (e, t) => {
  X1.init(e, t), Te.init(e, t);
});
function e2(e) {
  return /* @__PURE__ */ sb(Qb, e);
}
const t2 = (e, t) => {
  lf.init(e, t), e.name = "ZodError", Object.defineProperties(e, {
    format: {
      value: (n) => Lm(e, n)
      // enumerable: false,
    },
    flatten: {
      value: (n) => jm(e, n)
      // enumerable: false,
    },
    addIssue: {
      value: (n) => {
        e.issues.push(n), e.message = JSON.stringify(e.issues, _s, 2);
      }
      // enumerable: false,
    },
    addIssues: {
      value: (n) => {
        e.issues.push(...n), e.message = JSON.stringify(e.issues, _s, 2);
      }
      // enumerable: false,
    },
    isEmpty: {
      get() {
        return e.issues.length === 0;
      }
      // enumerable: false,
    }
  });
}, _t = /* @__PURE__ */ S("ZodError", t2, {
  Parent: Error
}), n2 = /* @__PURE__ */ si(_t), r2 = /* @__PURE__ */ ii(_t), u2 = /* @__PURE__ */ go(_t), Kf = /* @__PURE__ */ bo(_t), o2 = /* @__PURE__ */ Bm(_t), s2 = /* @__PURE__ */ Um(_t), i2 = /* @__PURE__ */ Hm(_t), a2 = /* @__PURE__ */ qm(_t), c2 = /* @__PURE__ */ Jm(_t), l2 = /* @__PURE__ */ Wm(_t), f2 = /* @__PURE__ */ Gm(_t), d2 = /* @__PURE__ */ Km(_t), za = /* @__PURE__ */ new WeakMap();
function ru(e, t, n) {
  const r = Object.getPrototypeOf(e);
  let u = za.get(r);
  if (u || (u = /* @__PURE__ */ new Set(), za.set(r, u)), !u.has(t)) {
    u.add(t);
    for (const o in n) {
      const s = n[o];
      Object.defineProperty(r, o, {
        configurable: !0,
        enumerable: !1,
        get() {
          const i = s.bind(this);
          return Object.defineProperty(this, o, {
            configurable: !0,
            writable: !0,
            enumerable: !0,
            value: i
          }), i;
        },
        set(i) {
          Object.defineProperty(this, o, {
            configurable: !0,
            writable: !0,
            enumerable: !0,
            value: i
          });
        }
      });
    }
  }
}
const De = /* @__PURE__ */ S("ZodType", (e, t) => (Ae.init(e, t), Object.assign(e["~standard"], {
  jsonSchema: {
    input: Xu(e, "input"),
    output: Xu(e, "output")
  }
}), e.toJSONSchema = $b(e, {}), e.def = t, e.type = t.type, Object.defineProperty(e, "_def", { value: t }), e.parse = (n, r) => n2(e, n, r, { callee: e.parse }), e.safeParse = (n, r) => u2(e, n, r), e.parseAsync = async (n, r) => r2(e, n, r, { callee: e.parseAsync }), e.safeParseAsync = async (n, r) => Kf(e, n, r), e.spa = e.safeParseAsync, e.encode = (n, r) => o2(e, n, r), e.decode = (n, r) => s2(e, n, r), e.encodeAsync = async (n, r) => i2(e, n, r), e.decodeAsync = async (n, r) => a2(e, n, r), e.safeEncode = (n, r) => c2(e, n, r), e.safeDecode = (n, r) => l2(e, n, r), e.safeEncodeAsync = async (n, r) => f2(e, n, r), e.safeDecodeAsync = async (n, r) => d2(e, n, r), ru(e, "ZodType", {
  check(...n) {
    const r = this.def;
    return this.clone(wn(r, {
      checks: [
        ...r.checks ?? [],
        ...n.map((u) => typeof u == "function" ? { _zod: { check: u, def: { check: "custom" }, onattach: [] } } : u)
      ]
    }), { parent: !0 });
  },
  with(...n) {
    return this.check(...n);
  },
  clone(n, r) {
    return Cn(this, n, r);
  },
  brand() {
    return this;
  },
  register(n, r) {
    return n.add(this, r), this;
  },
  refine(n, r) {
    return this.check(iv(n, r));
  },
  superRefine(n, r) {
    return this.check(av(n, r));
  },
  overwrite(n) {
    return this.check(/* @__PURE__ */ pr(n));
  },
  optional() {
    return ja(this);
  },
  exactOptional() {
    return J2(this);
  },
  nullable() {
    return La(this);
  },
  nullish() {
    return ja(La(this));
  },
  nonoptional(n) {
    return Q2(this, n);
  },
  array() {
    return hr(this);
  },
  or(n) {
    return rt([this, n]);
  },
  and(n) {
    return V2(this, n);
  },
  transform(n) {
    return Za(this, H2(n));
  },
  default(n) {
    return K2(this, n);
  },
  prefault(n) {
    return X2(this, n);
  },
  catch(n) {
    return tv(this, n);
  },
  pipe(n) {
    return Za(this, n);
  },
  readonly() {
    return uv(this);
  },
  describe(n) {
    const r = this.clone();
    return Ar.add(r, { description: n }), r;
  },
  meta(...n) {
    if (n.length === 0)
      return Ar.get(this);
    const r = this.clone();
    return Ar.add(r, n[0]), r;
  },
  isOptional() {
    return this.safeParse(void 0).success;
  },
  isNullable() {
    return this.safeParse(null).success;
  },
  apply(n) {
    return n(this);
  }
}), Object.defineProperty(e, "description", {
  get() {
    return Ar.get(e)?.description;
  },
  configurable: !0
}), e)), Yf = /* @__PURE__ */ S("_ZodString", (e, t) => {
  ai.init(e, t), De.init(e, t), e._zod.processJSONSchema = (r, u, o) => Df(e, r, u);
  const n = e._zod.bag;
  e.format = n.format ?? null, e.minLength = n.minimum ?? null, e.maxLength = n.maximum ?? null, ru(e, "_ZodString", {
    regex(...r) {
      return this.check(/* @__PURE__ */ pb(...r));
    },
    includes(...r) {
      return this.check(/* @__PURE__ */ gb(...r));
    },
    startsWith(...r) {
      return this.check(/* @__PURE__ */ bb(...r));
    },
    endsWith(...r) {
      return this.check(/* @__PURE__ */ vb(...r));
    },
    min(...r) {
      return this.check(/* @__PURE__ */ Wu(...r));
    },
    max(...r) {
      return this.check(/* @__PURE__ */ Cf(...r));
    },
    length(...r) {
      return this.check(/* @__PURE__ */ Af(...r));
    },
    nonempty(...r) {
      return this.check(/* @__PURE__ */ Wu(1, ...r));
    },
    lowercase(r) {
      return this.check(/* @__PURE__ */ hb(r));
    },
    uppercase(r) {
      return this.check(/* @__PURE__ */ mb(r));
    },
    trim() {
      return this.check(/* @__PURE__ */ yb());
    },
    normalize(...r) {
      return this.check(/* @__PURE__ */ _b(...r));
    },
    toLowerCase() {
      return this.check(/* @__PURE__ */ xb());
    },
    toUpperCase() {
      return this.check(/* @__PURE__ */ Eb());
    },
    slugify() {
      return this.check(/* @__PURE__ */ kb());
    }
  });
}), p2 = /* @__PURE__ */ S("ZodString", (e, t) => {
  ai.init(e, t), Yf.init(e, t), e.email = (n) => e.check(/* @__PURE__ */ Mg(h2, n)), e.url = (n) => e.check(/* @__PURE__ */ Zg(m2, n)), e.jwt = (n) => e.check(/* @__PURE__ */ nb(N2, n)), e.emoji = (n) => e.check(/* @__PURE__ */ Vg(g2, n)), e.guid = (n) => e.check(/* @__PURE__ */ Na(Ma, n)), e.uuid = (n) => e.check(/* @__PURE__ */ Pg(gu, n)), e.uuidv4 = (n) => e.check(/* @__PURE__ */ Rg(gu, n)), e.uuidv6 = (n) => e.check(/* @__PURE__ */ jg(gu, n)), e.uuidv7 = (n) => e.check(/* @__PURE__ */ Lg(gu, n)), e.nanoid = (n) => e.check(/* @__PURE__ */ Bg(b2, n)), e.guid = (n) => e.check(/* @__PURE__ */ Na(Ma, n)), e.cuid = (n) => e.check(/* @__PURE__ */ Ug(v2, n)), e.cuid2 = (n) => e.check(/* @__PURE__ */ Hg(_2, n)), e.ulid = (n) => e.check(/* @__PURE__ */ qg(y2, n)), e.base64 = (n) => e.check(/* @__PURE__ */ Qg(D2, n)), e.base64url = (n) => e.check(/* @__PURE__ */ eb(S2, n)), e.xid = (n) => e.check(/* @__PURE__ */ Jg(x2, n)), e.ksuid = (n) => e.check(/* @__PURE__ */ Wg(E2, n)), e.ipv4 = (n) => e.check(/* @__PURE__ */ Gg(k2, n)), e.ipv6 = (n) => e.check(/* @__PURE__ */ Kg(w2, n)), e.cidrv4 = (n) => e.check(/* @__PURE__ */ Yg(C2, n)), e.cidrv6 = (n) => e.check(/* @__PURE__ */ Xg(A2, n)), e.e164 = (n) => e.check(/* @__PURE__ */ tb($2, n)), e.datetime = (n) => e.check(Wb(n)), e.date = (n) => e.check(Kb(n)), e.time = (n) => e.check(Xb(n)), e.duration = (n) => e.check(e2(n));
});
function j(e) {
  return /* @__PURE__ */ zg(p2, e);
}
const Te = /* @__PURE__ */ S("ZodStringFormat", (e, t) => {
  Ne.init(e, t), Yf.init(e, t);
}), h2 = /* @__PURE__ */ S("ZodEmail", (e, t) => {
  L1.init(e, t), Te.init(e, t);
}), Ma = /* @__PURE__ */ S("ZodGUID", (e, t) => {
  R1.init(e, t), Te.init(e, t);
}), gu = /* @__PURE__ */ S("ZodUUID", (e, t) => {
  j1.init(e, t), Te.init(e, t);
}), m2 = /* @__PURE__ */ S("ZodURL", (e, t) => {
  Z1.init(e, t), Te.init(e, t);
}), g2 = /* @__PURE__ */ S("ZodEmoji", (e, t) => {
  V1.init(e, t), Te.init(e, t);
}), b2 = /* @__PURE__ */ S("ZodNanoID", (e, t) => {
  B1.init(e, t), Te.init(e, t);
}), v2 = /* @__PURE__ */ S("ZodCUID", (e, t) => {
  U1.init(e, t), Te.init(e, t);
}), _2 = /* @__PURE__ */ S("ZodCUID2", (e, t) => {
  H1.init(e, t), Te.init(e, t);
}), y2 = /* @__PURE__ */ S("ZodULID", (e, t) => {
  q1.init(e, t), Te.init(e, t);
}), x2 = /* @__PURE__ */ S("ZodXID", (e, t) => {
  J1.init(e, t), Te.init(e, t);
}), E2 = /* @__PURE__ */ S("ZodKSUID", (e, t) => {
  W1.init(e, t), Te.init(e, t);
}), k2 = /* @__PURE__ */ S("ZodIPv4", (e, t) => {
  Q1.init(e, t), Te.init(e, t);
}), w2 = /* @__PURE__ */ S("ZodIPv6", (e, t) => {
  eg.init(e, t), Te.init(e, t);
}), C2 = /* @__PURE__ */ S("ZodCIDRv4", (e, t) => {
  tg.init(e, t), Te.init(e, t);
}), A2 = /* @__PURE__ */ S("ZodCIDRv6", (e, t) => {
  ng.init(e, t), Te.init(e, t);
}), D2 = /* @__PURE__ */ S("ZodBase64", (e, t) => {
  rg.init(e, t), Te.init(e, t);
}), S2 = /* @__PURE__ */ S("ZodBase64URL", (e, t) => {
  og.init(e, t), Te.init(e, t);
}), $2 = /* @__PURE__ */ S("ZodE164", (e, t) => {
  sg.init(e, t), Te.init(e, t);
}), N2 = /* @__PURE__ */ S("ZodJWT", (e, t) => {
  ag.init(e, t), Te.init(e, t);
}), Xf = /* @__PURE__ */ S("ZodNumber", (e, t) => {
  yf.init(e, t), De.init(e, t), e._zod.processJSONSchema = (r, u, o) => Sf(e, r, u), ru(e, "ZodNumber", {
    gt(r, u) {
      return this.check(/* @__PURE__ */ Ia(r, u));
    },
    gte(r, u) {
      return this.check(/* @__PURE__ */ Mo(r, u));
    },
    min(r, u) {
      return this.check(/* @__PURE__ */ Mo(r, u));
    },
    lt(r, u) {
      return this.check(/* @__PURE__ */ Oa(r, u));
    },
    lte(r, u) {
      return this.check(/* @__PURE__ */ zo(r, u));
    },
    max(r, u) {
      return this.check(/* @__PURE__ */ zo(r, u));
    },
    int(r) {
      return this.check(Pa(r));
    },
    safe(r) {
      return this.check(Pa(r));
    },
    positive(r) {
      return this.check(/* @__PURE__ */ Ia(0, r));
    },
    nonnegative(r) {
      return this.check(/* @__PURE__ */ Mo(0, r));
    },
    negative(r) {
      return this.check(/* @__PURE__ */ Oa(0, r));
    },
    nonpositive(r) {
      return this.check(/* @__PURE__ */ zo(0, r));
    },
    multipleOf(r, u) {
      return this.check(/* @__PURE__ */ Ta(r, u));
    },
    step(r, u) {
      return this.check(/* @__PURE__ */ Ta(r, u));
    },
    finite() {
      return this;
    }
  });
  const n = e._zod.bag;
  e.minValue = Math.max(n.minimum ?? Number.NEGATIVE_INFINITY, n.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null, e.maxValue = Math.min(n.maximum ?? Number.POSITIVE_INFINITY, n.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null, e.isInt = (n.format ?? "").includes("int") || Number.isSafeInteger(n.multipleOf ?? 0.5), e.isFinite = !0, e.format = n.format ?? null;
});
function O2(e) {
  return /* @__PURE__ */ ib(Xf, e);
}
const I2 = /* @__PURE__ */ S("ZodNumberFormat", (e, t) => {
  cg.init(e, t), Xf.init(e, t);
});
function Pa(e) {
  return /* @__PURE__ */ ab(I2, e);
}
const T2 = /* @__PURE__ */ S("ZodBoolean", (e, t) => {
  lg.init(e, t), De.init(e, t), e._zod.processJSONSchema = (n, r, u) => $f(e, n, r);
});
function Qe(e) {
  return /* @__PURE__ */ cb(T2, e);
}
const F2 = /* @__PURE__ */ S("ZodNull", (e, t) => {
  fg.init(e, t), De.init(e, t), e._zod.processJSONSchema = (n, r, u) => Nf(e, n, r);
});
function z2(e) {
  return /* @__PURE__ */ lb(F2, e);
}
const M2 = /* @__PURE__ */ S("ZodUnknown", (e, t) => {
  dg.init(e, t), De.init(e, t), e._zod.processJSONSchema = (n, r, u) => If();
});
function jt() {
  return /* @__PURE__ */ fb(M2);
}
const P2 = /* @__PURE__ */ S("ZodNever", (e, t) => {
  pg.init(e, t), De.init(e, t), e._zod.processJSONSchema = (n, r, u) => Of(e, n, r);
});
function Qf(e) {
  return /* @__PURE__ */ db(P2, e);
}
const R2 = /* @__PURE__ */ S("ZodArray", (e, t) => {
  hg.init(e, t), De.init(e, t), e._zod.processJSONSchema = (n, r, u) => Pf(e, n, r, u), e.element = t.element, ru(e, "ZodArray", {
    min(n, r) {
      return this.check(/* @__PURE__ */ Wu(n, r));
    },
    nonempty(n) {
      return this.check(/* @__PURE__ */ Wu(1, n));
    },
    max(n, r) {
      return this.check(/* @__PURE__ */ Cf(n, r));
    },
    length(n, r) {
      return this.check(/* @__PURE__ */ Af(n, r));
    },
    unwrap() {
      return this.element;
    }
  });
});
function hr(e, t) {
  return /* @__PURE__ */ wb(R2, e, t);
}
const ed = /* @__PURE__ */ S("ZodObject", (e, t) => {
  gg.init(e, t), De.init(e, t), e._zod.processJSONSchema = (n, r, u) => Rf(e, n, r, u), ce(e, "shape", () => t.shape), ru(e, "ZodObject", {
    keyof() {
      return nd(Object.keys(this._zod.def.shape));
    },
    catchall(n) {
      return this.clone({ ...this._zod.def, catchall: n });
    },
    passthrough() {
      return this.clone({ ...this._zod.def, catchall: jt() });
    },
    loose() {
      return this.clone({ ...this._zod.def, catchall: jt() });
    },
    strict() {
      return this.clone({ ...this._zod.def, catchall: Qf() });
    },
    strip() {
      return this.clone({ ...this._zod.def, catchall: void 0 });
    },
    extend(n) {
      return Tm(this, n);
    },
    safeExtend(n) {
      return Fm(this, n);
    },
    merge(n) {
      return zm(this, n);
    },
    pick(n) {
      return Om(this, n);
    },
    omit(n) {
      return Im(this, n);
    },
    partial(...n) {
      return Mm(rd, this, n[0]);
    },
    required(...n) {
      return Pm(ud, this, n[0]);
    }
  });
});
function _e(e, t) {
  const n = {
    type: "object",
    shape: e ?? {},
    ...J(t)
  };
  return new ed(n);
}
function Ce(e, t) {
  return new ed({
    type: "object",
    shape: e,
    catchall: Qf(),
    ...J(t)
  });
}
const td = /* @__PURE__ */ S("ZodUnion", (e, t) => {
  kf.init(e, t), De.init(e, t), e._zod.processJSONSchema = (n, r, u) => jf(e, n, r, u), e.options = t.options;
});
function rt(e, t) {
  return new td({
    type: "union",
    options: e,
    ...J(t)
  });
}
const j2 = /* @__PURE__ */ S("ZodDiscriminatedUnion", (e, t) => {
  td.init(e, t), bg.init(e, t);
});
function L2(e, t, n) {
  return new j2({
    type: "union",
    options: t,
    discriminator: e,
    ...J(n)
  });
}
const Z2 = /* @__PURE__ */ S("ZodIntersection", (e, t) => {
  vg.init(e, t), De.init(e, t), e._zod.processJSONSchema = (n, r, u) => Lf(e, n, r, u);
});
function V2(e, t) {
  return new Z2({
    type: "intersection",
    left: e,
    right: t
  });
}
const Ra = /* @__PURE__ */ S("ZodRecord", (e, t) => {
  _g.init(e, t), De.init(e, t), e._zod.processJSONSchema = (n, r, u) => Zf(e, n, r, u), e.keyType = t.keyType, e.valueType = t.valueType;
});
function Zr(e, t, n) {
  return !t || !t._zod ? new Ra({
    type: "record",
    keyType: j(),
    valueType: e,
    ...J(t)
  }) : new Ra({
    type: "record",
    keyType: e,
    valueType: t,
    ...J(n)
  });
}
const xs = /* @__PURE__ */ S("ZodEnum", (e, t) => {
  yg.init(e, t), De.init(e, t), e._zod.processJSONSchema = (r, u, o) => Tf(e, r, u), e.enum = t.entries, e.options = Object.values(t.entries);
  const n = new Set(Object.keys(t.entries));
  e.extract = (r, u) => {
    const o = {};
    for (const s of r)
      if (n.has(s))
        o[s] = t.entries[s];
      else
        throw new Error(`Key ${s} not found in enum`);
    return new xs({
      ...t,
      checks: [],
      ...J(u),
      entries: o
    });
  }, e.exclude = (r, u) => {
    const o = { ...t.entries };
    for (const s of r)
      if (n.has(s))
        delete o[s];
      else
        throw new Error(`Key ${s} not found in enum`);
    return new xs({
      ...t,
      checks: [],
      ...J(u),
      entries: o
    });
  };
});
function nd(e, t) {
  const n = Array.isArray(e) ? Object.fromEntries(e.map((r) => [r, r])) : e;
  return new xs({
    type: "enum",
    entries: n,
    ...J(t)
  });
}
const B2 = /* @__PURE__ */ S("ZodLiteral", (e, t) => {
  xg.init(e, t), De.init(e, t), e._zod.processJSONSchema = (n, r, u) => Ff(e, n, r), e.values = new Set(t.values), Object.defineProperty(e, "value", {
    get() {
      if (t.values.length > 1)
        throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
      return t.values[0];
    }
  });
});
function X(e, t) {
  return new B2({
    type: "literal",
    values: Array.isArray(e) ? e : [e],
    ...J(t)
  });
}
const U2 = /* @__PURE__ */ S("ZodTransform", (e, t) => {
  Eg.init(e, t), De.init(e, t), e._zod.processJSONSchema = (n, r, u) => Mf(e, n), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      throw new uf(e.constructor.name);
    n.addIssue = (o) => {
      if (typeof o == "string")
        n.issues.push(Lr(o, n.value, t));
      else {
        const s = o;
        s.fatal && (s.continue = !1), s.code ?? (s.code = "custom"), s.input ?? (s.input = n.value), s.inst ?? (s.inst = e), n.issues.push(Lr(s));
      }
    };
    const u = t.transform(n.value, n);
    return u instanceof Promise ? u.then((o) => (n.value = o, n.fallback = !0, n)) : (n.value = u, n.fallback = !0, n);
  };
});
function H2(e) {
  return new U2({
    type: "transform",
    transform: e
  });
}
const rd = /* @__PURE__ */ S("ZodOptional", (e, t) => {
  wf.init(e, t), De.init(e, t), e._zod.processJSONSchema = (n, r, u) => ci(e, n, r, u), e.unwrap = () => e._zod.def.innerType;
});
function ja(e) {
  return new rd({
    type: "optional",
    innerType: e
  });
}
const q2 = /* @__PURE__ */ S("ZodExactOptional", (e, t) => {
  kg.init(e, t), De.init(e, t), e._zod.processJSONSchema = (n, r, u) => ci(e, n, r, u), e.unwrap = () => e._zod.def.innerType;
});
function J2(e) {
  return new q2({
    type: "optional",
    innerType: e
  });
}
const W2 = /* @__PURE__ */ S("ZodNullable", (e, t) => {
  wg.init(e, t), De.init(e, t), e._zod.processJSONSchema = (n, r, u) => Vf(e, n, r, u), e.unwrap = () => e._zod.def.innerType;
});
function La(e) {
  return new W2({
    type: "nullable",
    innerType: e
  });
}
const G2 = /* @__PURE__ */ S("ZodDefault", (e, t) => {
  Cg.init(e, t), De.init(e, t), e._zod.processJSONSchema = (n, r, u) => Uf(e, n, r, u), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function K2(e, t) {
  return new G2({
    type: "default",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : af(t);
    }
  });
}
const Y2 = /* @__PURE__ */ S("ZodPrefault", (e, t) => {
  Ag.init(e, t), De.init(e, t), e._zod.processJSONSchema = (n, r, u) => Hf(e, n, r, u), e.unwrap = () => e._zod.def.innerType;
});
function X2(e, t) {
  return new Y2({
    type: "prefault",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : af(t);
    }
  });
}
const ud = /* @__PURE__ */ S("ZodNonOptional", (e, t) => {
  Dg.init(e, t), De.init(e, t), e._zod.processJSONSchema = (n, r, u) => Bf(e, n, r, u), e.unwrap = () => e._zod.def.innerType;
});
function Q2(e, t) {
  return new ud({
    type: "nonoptional",
    innerType: e,
    ...J(t)
  });
}
const ev = /* @__PURE__ */ S("ZodCatch", (e, t) => {
  Sg.init(e, t), De.init(e, t), e._zod.processJSONSchema = (n, r, u) => qf(e, n, r, u), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function tv(e, t) {
  return new ev({
    type: "catch",
    innerType: e,
    catchValue: typeof t == "function" ? t : () => t
  });
}
const nv = /* @__PURE__ */ S("ZodPipe", (e, t) => {
  $g.init(e, t), De.init(e, t), e._zod.processJSONSchema = (n, r, u) => Jf(e, n, r, u), e.in = t.in, e.out = t.out;
});
function Za(e, t) {
  return new nv({
    type: "pipe",
    in: e,
    out: t
    // ...util.normalizeParams(params),
  });
}
const rv = /* @__PURE__ */ S("ZodReadonly", (e, t) => {
  Ng.init(e, t), De.init(e, t), e._zod.processJSONSchema = (n, r, u) => Wf(e, n, r, u), e.unwrap = () => e._zod.def.innerType;
});
function uv(e) {
  return new rv({
    type: "readonly",
    innerType: e
  });
}
const ov = /* @__PURE__ */ S("ZodLazy", (e, t) => {
  Og.init(e, t), De.init(e, t), e._zod.processJSONSchema = (n, r, u) => Gf(e, n, r, u), e.unwrap = () => e._zod.def.getter();
});
function sv(e) {
  return new ov({
    type: "lazy",
    getter: e
  });
}
const li = /* @__PURE__ */ S("ZodCustom", (e, t) => {
  Ig.init(e, t), De.init(e, t), e._zod.processJSONSchema = (n, r, u) => zf(e, n);
});
function od(e, t) {
  return /* @__PURE__ */ Cb(li, e ?? (() => !0), t);
}
function iv(e, t = {}) {
  return /* @__PURE__ */ Ab(li, e, t);
}
function av(e, t) {
  return /* @__PURE__ */ Db(e, t);
}
function Qu(e, t = {}) {
  const n = new li({
    type: "custom",
    check: "custom",
    fn: (r) => r instanceof e,
    abort: !0,
    ...J(t)
  });
  return n._zod.bag.Class = e, n._zod.check = (r) => {
    r.value instanceof e || r.issues.push({
      code: "invalid_type",
      expected: e.name,
      input: r.value,
      inst: n,
      path: [...n._zod.def.path ?? []]
    });
  }, n;
}
var ue;
(function(e) {
  e.ZodString = "ZodString", e.ZodNumber = "ZodNumber", e.ZodNaN = "ZodNaN", e.ZodBigInt = "ZodBigInt", e.ZodBoolean = "ZodBoolean", e.ZodDate = "ZodDate", e.ZodSymbol = "ZodSymbol", e.ZodUndefined = "ZodUndefined", e.ZodNull = "ZodNull", e.ZodAny = "ZodAny", e.ZodUnknown = "ZodUnknown", e.ZodNever = "ZodNever", e.ZodVoid = "ZodVoid", e.ZodArray = "ZodArray", e.ZodObject = "ZodObject", e.ZodUnion = "ZodUnion", e.ZodDiscriminatedUnion = "ZodDiscriminatedUnion", e.ZodIntersection = "ZodIntersection", e.ZodTuple = "ZodTuple", e.ZodRecord = "ZodRecord", e.ZodMap = "ZodMap", e.ZodSet = "ZodSet", e.ZodFunction = "ZodFunction", e.ZodLazy = "ZodLazy", e.ZodLiteral = "ZodLiteral", e.ZodEnum = "ZodEnum", e.ZodEffects = "ZodEffects", e.ZodNativeEnum = "ZodNativeEnum", e.ZodOptional = "ZodOptional", e.ZodNullable = "ZodNullable", e.ZodDefault = "ZodDefault", e.ZodCatch = "ZodCatch", e.ZodPromise = "ZodPromise", e.ZodBranded = "ZodBranded", e.ZodPipeline = "ZodPipeline", e.ZodReadonly = "ZodReadonly";
})(ue || (ue = {}));
class Po extends Error {
  constructor(t, n) {
    super(t), this.name = "ParseError", this.type = n.type, this.field = n.field, this.value = n.value, this.line = n.line;
  }
}
const Va = 10, cv = 13, $n = 32;
function Ro(e) {
}
function lv(e) {
  if (typeof e == "function")
    throw new TypeError(
      "`config` must be an object, got a function instead. Did you mean `createParser({onEvent: fn})`?"
    );
  const { onEvent: t = Ro, onError: n = Ro, onRetry: r = Ro, onComment: u, maxBufferSize: o } = e, s = [];
  let i = 0, a = !0, c, f = "", l = 0, d, p = !1;
  function m(g) {
    if (p)
      throw new Error(
        "Cannot feed parser: it was terminated after exceeding the configured max buffer size. Call `reset()` to resume parsing."
      );
    if (a && (a = !1, g.charCodeAt(0) === 239 && g.charCodeAt(1) === 187 && g.charCodeAt(2) === 191 && (g = g.slice(3))), s.length === 0) {
      const k = _(g);
      k !== "" && (s.push(k), i = k.length), v();
      return;
    }
    if (g.indexOf(`
`) === -1 && g.indexOf("\r") === -1) {
      s.push(g), i += g.length, v();
      return;
    }
    s.push(g);
    const y = s.join("");
    s.length = 0, i = 0;
    const C = _(y);
    C !== "" && (s.push(C), i = C.length), v();
  }
  function v() {
    o !== void 0 && (i + f.length <= o || (p = !0, s.length = 0, i = 0, c = void 0, f = "", l = 0, d = void 0, n(
      new Po(`Buffered data exceeded max buffer size of ${o} characters`, {
        type: "max-buffer-size-exceeded"
      })
    )));
  }
  function _(g) {
    let y = 0;
    if (g.indexOf("\r") === -1) {
      let C = g.indexOf(`
`, y);
      for (; C !== -1; ) {
        if (y === C) {
          l > 0 && t({ id: c, event: d, data: f }), c = void 0, f = "", l = 0, d = void 0, y = C + 1, C = g.indexOf(`
`, y);
          continue;
        }
        const k = g.charCodeAt(y);
        if (Ba(g, y, k)) {
          const Z = g.charCodeAt(y + 5) === $n ? y + 6 : y + 5, W = g.slice(Z, C);
          if (l === 0 && g.charCodeAt(C + 1) === Va) {
            t({ id: c, event: d, data: W }), c = void 0, f = "", d = void 0, y = C + 2, C = g.indexOf(`
`, y);
            continue;
          }
          f = l === 0 ? W : `${f}
${W}`, l++;
        } else Ua(g, y, k) ? d = g.slice(
          g.charCodeAt(y + 6) === $n ? y + 7 : y + 6,
          C
        ) || void 0 : A(g, y, C);
        y = C + 1, C = g.indexOf(`
`, y);
      }
      return g.slice(y);
    }
    for (; y < g.length; ) {
      const C = g.indexOf("\r", y), k = g.indexOf(`
`, y);
      let Z = -1;
      if (C !== -1 && k !== -1 ? Z = C < k ? C : k : C !== -1 ? C === g.length - 1 ? Z = -1 : Z = C : k !== -1 && (Z = k), Z === -1)
        break;
      A(g, y, Z), y = Z + 1, g.charCodeAt(y - 1) === cv && g.charCodeAt(y) === Va && y++;
    }
    return g.slice(y);
  }
  function A(g, y, C) {
    if (y === C) {
      h();
      return;
    }
    const k = g.charCodeAt(y);
    if (Ba(g, y, k)) {
      const q = g.charCodeAt(y + 5) === $n ? y + 6 : y + 5, H = g.slice(q, C);
      f = l === 0 ? H : `${f}
${H}`, l++;
      return;
    }
    if (Ua(g, y, k)) {
      d = g.slice(g.charCodeAt(y + 6) === $n ? y + 7 : y + 6, C) || void 0;
      return;
    }
    if (k === 105 && g.charCodeAt(y + 1) === 100 && g.charCodeAt(y + 2) === 58) {
      const q = g.slice(g.charCodeAt(y + 3) === $n ? y + 4 : y + 3, C);
      c = q.includes("\0") ? void 0 : q;
      return;
    }
    if (k === 58) {
      if (u) {
        const q = g.slice(y, C);
        u(q.slice(g.charCodeAt(y + 1) === $n ? 2 : 1));
      }
      return;
    }
    const Z = g.slice(y, C), W = Z.indexOf(":");
    if (W === -1) {
      E(Z, "", Z);
      return;
    }
    const K = Z.slice(0, W), B = Z.charCodeAt(W + 1) === $n ? 2 : 1, G = Z.slice(W + B);
    E(K, G, Z);
  }
  function E(g, y, C) {
    switch (g) {
      case "event":
        d = y || void 0;
        break;
      case "data":
        f = l === 0 ? y : `${f}
${y}`, l++;
        break;
      case "id":
        c = y.includes("\0") ? void 0 : y;
        break;
      case "retry":
        /^\d+$/.test(y) ? r(parseInt(y, 10)) : n(
          new Po(`Invalid \`retry\` value: "${y}"`, {
            type: "invalid-retry",
            value: y,
            line: C
          })
        );
        break;
      default:
        n(
          new Po(
            `Unknown field "${g.length > 20 ? `${g.slice(0, 20)}…` : g}"`,
            { type: "unknown-field", field: g, value: y, line: C }
          )
        );
        break;
    }
  }
  function h() {
    l > 0 && t({
      id: c,
      event: d,
      data: f
    }), c = void 0, f = "", l = 0, d = void 0;
  }
  function w(g = {}) {
    if (g.consume && s.length > 0) {
      const y = s.join("");
      A(y, 0, y.length);
    }
    a = !0, c = void 0, f = "", l = 0, d = void 0, s.length = 0, i = 0, p = !1;
  }
  return { feed: m, reset: w };
}
function Ba(e, t, n) {
  return n === 100 && e.charCodeAt(t + 1) === 97 && e.charCodeAt(t + 2) === 116 && e.charCodeAt(t + 3) === 97 && e.charCodeAt(t + 4) === 58;
}
function Ua(e, t, n) {
  return n === 101 && e.charCodeAt(t + 1) === 118 && e.charCodeAt(t + 2) === 101 && e.charCodeAt(t + 3) === 110 && e.charCodeAt(t + 4) === 116 && e.charCodeAt(t + 5) === 58;
}
class fv extends TransformStream {
  constructor({ onError: t, onRetry: n, onComment: r, maxBufferSize: u } = {}) {
    let o;
    super({
      start(s) {
        o = lv({
          onEvent: (i) => {
            s.enqueue(i);
          },
          onError(i) {
            typeof t == "function" && t(i), (t === "terminate" || i.type === "max-buffer-size-exceeded") && s.error(i);
          },
          onRetry: n,
          onComment: r,
          maxBufferSize: u
        });
      },
      transform(s) {
        o.feed(s);
      }
    });
  }
}
var uu = ({
  prefix: e,
  size: t = 16,
  alphabet: n = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  separator: r = "-"
} = {}) => {
  const u = () => {
    const o = n.length, s = new Array(t);
    for (let i = 0; i < t; i++)
      s[i] = n[Math.random() * o | 0];
    return s.join("");
  };
  if (e == null)
    return u;
  if (n.includes(r))
    throw new Em({
      argument: "separator",
      message: `The separator "${r}" must not be part of the alphabet "${n}".`
    });
  return () => `${e}${r}${u()}`;
}, dv = uu();
function Jn(e) {
  if (e == null)
    return {};
  const t = {};
  if (e instanceof Headers)
    e.forEach((n, r) => {
      t[r.toLowerCase()] = n;
    });
  else {
    Array.isArray(e) || (e = Object.entries(e));
    for (const [n, r] of e)
      r != null && (t[n.toLowerCase()] = r);
  }
  return t;
}
var pv = /"(?:_|\\u005[Ff])(?:_|\\u005[Ff])(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006[Ff])(?:t|\\u0074)(?:o|\\u006[Ff])(?:_|\\u005[Ff])(?:_|\\u005[Ff])"\s*:/, hv = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
function Ha(e) {
  const t = JSON.parse(e);
  return t === null || typeof t != "object" || pv.test(e) === !1 && hv.test(e) === !1 ? t : mv(t);
}
function mv(e) {
  let t = [e];
  for (; t.length; ) {
    const n = t;
    t = [];
    for (const r of n) {
      if (Object.prototype.hasOwnProperty.call(r, "__proto__"))
        throw new SyntaxError("Object contains forbidden prototype property");
      if (Object.prototype.hasOwnProperty.call(r, "constructor") && r.constructor !== null && typeof r.constructor == "object" && Object.prototype.hasOwnProperty.call(r.constructor, "prototype"))
        throw new SyntaxError("Object contains forbidden prototype property");
      for (const u in r) {
        const o = r[u];
        o && typeof o == "object" && t.push(o);
      }
    }
  }
  return e;
}
function gv(e) {
  const { stackTraceLimit: t } = Error;
  try {
    Error.stackTraceLimit = 0;
  } catch {
    return Ha(e);
  }
  try {
    return Ha(e);
  } finally {
    Error.stackTraceLimit = t;
  }
}
function fi(e) {
  if (e.type === "object" || Array.isArray(e.type) && e.type.includes("object")) {
    e.additionalProperties = !1;
    const { properties: n } = e;
    if (n != null)
      for (const r of Object.keys(n))
        n[r] = Nn(n[r]);
  }
  e.items != null && (e.items = Array.isArray(e.items) ? e.items.map(Nn) : Nn(e.items)), e.anyOf != null && (e.anyOf = e.anyOf.map(Nn)), e.allOf != null && (e.allOf = e.allOf.map(Nn)), e.oneOf != null && (e.oneOf = e.oneOf.map(Nn));
  const { definitions: t } = e;
  if (t != null)
    for (const n of Object.keys(t))
      t[n] = Nn(t[n]);
  return e;
}
function Nn(e) {
  return typeof e == "boolean" ? e : fi(e);
}
var bv = /* @__PURE__ */ Symbol(
  "Let zodToJsonSchema decide on which parser to use"
), qa = {
  name: void 0,
  $refStrategy: "root",
  basePath: ["#"],
  effectStrategy: "input",
  pipeStrategy: "all",
  dateStrategy: "format:date-time",
  mapStrategy: "entries",
  removeAdditionalStrategy: "passthrough",
  allowedAdditionalProperties: !0,
  rejectedAdditionalProperties: !1,
  definitionPath: "definitions",
  strictUnions: !1,
  definitions: {},
  errorMessages: !1,
  patternStrategy: "escape",
  applyRegexFlags: !1,
  emailStrategy: "format:email",
  base64Strategy: "contentEncoding:base64",
  nameStrategy: "ref"
}, vv = (e) => typeof e == "string" ? {
  ...qa,
  name: e
} : {
  ...qa,
  ...e
};
function mt() {
  return {};
}
function _v(e, t) {
  var n, r, u;
  const o = {
    type: "array"
  };
  return (n = e.type) != null && n._def && ((u = (r = e.type) == null ? void 0 : r._def) == null ? void 0 : u.typeName) !== ue.ZodAny && (o.items = be(e.type._def, {
    ...t,
    currentPath: [...t.currentPath, "items"]
  })), e.minLength && (o.minItems = e.minLength.value), e.maxLength && (o.maxItems = e.maxLength.value), e.exactLength && (o.minItems = e.exactLength.value, o.maxItems = e.exactLength.value), o;
}
function yv(e) {
  const t = {
    type: "integer",
    format: "int64"
  };
  if (!e.checks) return t;
  for (const n of e.checks)
    switch (n.kind) {
      case "min":
        n.inclusive ? t.minimum = n.value : t.exclusiveMinimum = n.value;
        break;
      case "max":
        n.inclusive ? t.maximum = n.value : t.exclusiveMaximum = n.value;
        break;
      case "multipleOf":
        t.multipleOf = n.value;
        break;
    }
  return t;
}
function xv() {
  return { type: "boolean" };
}
function sd(e, t) {
  return be(e.type._def, t);
}
var Ev = (e, t) => be(e.innerType._def, t);
function id(e, t, n) {
  const r = n ?? t.dateStrategy;
  if (Array.isArray(r))
    return {
      anyOf: r.map((u, o) => id(e, t, u))
    };
  switch (r) {
    case "string":
    case "format:date-time":
      return {
        type: "string",
        format: "date-time"
      };
    case "format:date":
      return {
        type: "string",
        format: "date"
      };
    case "integer":
      return kv(e);
  }
}
var kv = (e) => {
  const t = {
    type: "integer",
    format: "unix-time"
  };
  for (const n of e.checks)
    switch (n.kind) {
      case "min":
        t.minimum = n.value;
        break;
      case "max":
        t.maximum = n.value;
        break;
    }
  return t;
};
function wv(e, t) {
  return {
    ...be(e.innerType._def, t),
    default: e.defaultValue()
  };
}
function Cv(e, t) {
  return t.effectStrategy === "input" ? be(e.schema._def, t) : mt();
}
function Av(e) {
  return {
    type: "string",
    enum: Array.from(e.values)
  };
}
var Dv = (e) => "type" in e && e.type === "string" ? !1 : "allOf" in e;
function Sv(e, t) {
  const n = [
    be(e.left._def, {
      ...t,
      currentPath: [...t.currentPath, "allOf", "0"]
    }),
    be(e.right._def, {
      ...t,
      currentPath: [...t.currentPath, "allOf", "1"]
    })
  ].filter((u) => !!u), r = [];
  return n.forEach((u) => {
    if (Dv(u))
      r.push(...u.allOf);
    else {
      let o = u;
      if ("additionalProperties" in u && u.additionalProperties === !1) {
        const { additionalProperties: s, ...i } = u;
        o = i;
      }
      r.push(o);
    }
  }), r.length ? { allOf: r } : void 0;
}
function $v(e) {
  const t = typeof e.value;
  return t !== "bigint" && t !== "number" && t !== "boolean" && t !== "string" ? {
    type: Array.isArray(e.value) ? "array" : "object"
  } : {
    type: t === "bigint" ? "integer" : t,
    const: e.value
  };
}
var jo = void 0, yt = {
  /**
   * `c` was changed to `[cC]` to replicate /i flag
   */
  cuid: /^[cC][^\s-]{8,}$/,
  cuid2: /^[0-9a-z]+$/,
  ulid: /^[0-9A-HJKMNP-TV-Z]{26}$/,
  /**
   * `a-z` was added to replicate /i flag
   */
  email: /^(?!\.)(?!.*\.\.)([a-zA-Z0-9_'+\-\.]*)[a-zA-Z0-9_+-]@([a-zA-Z0-9][a-zA-Z0-9\-]*\.)+[a-zA-Z]{2,}$/,
  /**
   * Constructed a valid Unicode RegExp
   *
   * Lazily instantiate since this type of regex isn't supported
   * in all envs (e.g. React Native).
   *
   * See:
   * https://github.com/colinhacks/zod/issues/2433
   * Fix in Zod:
   * https://github.com/colinhacks/zod/commit/9340fd51e48576a75adc919bff65dbc4a5d4c99b
   */
  emoji: () => (jo === void 0 && (jo = RegExp(
    "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$",
    "u"
  )), jo),
  /**
   * Unused
   */
  uuid: /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
  /**
   * Unused
   */
  ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
  ipv4Cidr: /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/,
  /**
   * Unused
   */
  ipv6: /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/,
  ipv6Cidr: /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,
  base64: /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/,
  base64url: /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/,
  nanoid: /^[a-zA-Z0-9_-]{21}$/,
  jwt: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/
};
function ad(e, t) {
  const n = {
    type: "string"
  };
  if (e.checks)
    for (const r of e.checks)
      switch (r.kind) {
        case "min":
          n.minLength = typeof n.minLength == "number" ? Math.max(n.minLength, r.value) : r.value;
          break;
        case "max":
          n.maxLength = typeof n.maxLength == "number" ? Math.min(n.maxLength, r.value) : r.value;
          break;
        case "email":
          switch (t.emailStrategy) {
            case "format:email":
              xt(n, "email", r.message, t);
              break;
            case "format:idn-email":
              xt(n, "idn-email", r.message, t);
              break;
            case "pattern:zod":
              Ke(n, yt.email, r.message, t);
              break;
          }
          break;
        case "url":
          xt(n, "uri", r.message, t);
          break;
        case "uuid":
          xt(n, "uuid", r.message, t);
          break;
        case "regex":
          Ke(n, r.regex, r.message, t);
          break;
        case "cuid":
          Ke(n, yt.cuid, r.message, t);
          break;
        case "cuid2":
          Ke(n, yt.cuid2, r.message, t);
          break;
        case "startsWith":
          Ke(
            n,
            RegExp(`^${Lo(r.value, t)}`),
            r.message,
            t
          );
          break;
        case "endsWith":
          Ke(
            n,
            RegExp(`${Lo(r.value, t)}$`),
            r.message,
            t
          );
          break;
        case "datetime":
          xt(n, "date-time", r.message, t);
          break;
        case "date":
          xt(n, "date", r.message, t);
          break;
        case "time":
          xt(n, "time", r.message, t);
          break;
        case "duration":
          xt(n, "duration", r.message, t);
          break;
        case "length":
          n.minLength = typeof n.minLength == "number" ? Math.max(n.minLength, r.value) : r.value, n.maxLength = typeof n.maxLength == "number" ? Math.min(n.maxLength, r.value) : r.value;
          break;
        case "includes": {
          Ke(
            n,
            RegExp(Lo(r.value, t)),
            r.message,
            t
          );
          break;
        }
        case "ip": {
          r.version !== "v6" && xt(n, "ipv4", r.message, t), r.version !== "v4" && xt(n, "ipv6", r.message, t);
          break;
        }
        case "base64url":
          Ke(n, yt.base64url, r.message, t);
          break;
        case "jwt":
          Ke(n, yt.jwt, r.message, t);
          break;
        case "cidr": {
          r.version !== "v6" && Ke(n, yt.ipv4Cidr, r.message, t), r.version !== "v4" && Ke(n, yt.ipv6Cidr, r.message, t);
          break;
        }
        case "emoji":
          Ke(n, yt.emoji(), r.message, t);
          break;
        case "ulid": {
          Ke(n, yt.ulid, r.message, t);
          break;
        }
        case "base64": {
          switch (t.base64Strategy) {
            case "format:binary": {
              xt(n, "binary", r.message, t);
              break;
            }
            case "contentEncoding:base64": {
              n.contentEncoding = "base64";
              break;
            }
            case "pattern:zod": {
              Ke(n, yt.base64, r.message, t);
              break;
            }
          }
          break;
        }
        case "nanoid":
          Ke(n, yt.nanoid, r.message, t);
      }
  return n;
}
function Lo(e, t) {
  return t.patternStrategy === "escape" ? Ov(e) : e;
}
var Nv = new Set(
  "ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz0123456789"
);
function Ov(e) {
  let t = "";
  for (let n = 0; n < e.length; n++)
    Nv.has(e[n]) || (t += "\\"), t += e[n];
  return t;
}
function xt(e, t, n, r) {
  var u;
  e.format || (u = e.anyOf) != null && u.some((o) => o.format) ? (e.anyOf || (e.anyOf = []), e.format && (e.anyOf.push({
    format: e.format
  }), delete e.format), e.anyOf.push({
    format: t,
    ...n && r.errorMessages && { errorMessage: { format: n } }
  })) : e.format = t;
}
function Ke(e, t, n, r) {
  var u;
  e.pattern || (u = e.allOf) != null && u.some((o) => o.pattern) ? (e.allOf || (e.allOf = []), e.pattern && (e.allOf.push({
    pattern: e.pattern
  }), delete e.pattern), e.allOf.push({
    pattern: Ja(t, r),
    ...n && r.errorMessages && { errorMessage: { pattern: n } }
  })) : e.pattern = Ja(t, r);
}
function Ja(e, t) {
  var n;
  if (!t.applyRegexFlags || !e.flags)
    return e.source;
  const r = {
    i: e.flags.includes("i"),
    // Case-insensitive
    m: e.flags.includes("m"),
    // `^` and `$` matches adjacent to newline characters
    s: e.flags.includes("s")
    // `.` matches newlines
  }, u = r.i ? e.source.toLowerCase() : e.source;
  let o = "", s = !1, i = !1, a = !1;
  for (let c = 0; c < u.length; c++) {
    if (s) {
      o += u[c], s = !1;
      continue;
    }
    if (r.i) {
      if (i) {
        if (u[c].match(/[a-z]/)) {
          a ? (o += u[c], o += `${u[c - 2]}-${u[c]}`.toUpperCase(), a = !1) : u[c + 1] === "-" && ((n = u[c + 2]) != null && n.match(/[a-z]/)) ? (o += u[c], a = !0) : o += `${u[c]}${u[c].toUpperCase()}`;
          continue;
        }
      } else if (u[c].match(/[a-z]/)) {
        o += `[${u[c]}${u[c].toUpperCase()}]`;
        continue;
      }
    }
    if (r.m) {
      if (u[c] === "^") {
        o += `(^|(?<=[\r
]))`;
        continue;
      } else if (u[c] === "$") {
        o += `($|(?=[\r
]))`;
        continue;
      }
    }
    if (r.s && u[c] === ".") {
      o += i ? `${u[c]}\r
` : `[${u[c]}\r
]`;
      continue;
    }
    o += u[c], u[c] === "\\" ? s = !0 : i && u[c] === "]" ? i = !1 : !i && u[c] === "[" && (i = !0);
  }
  try {
    new RegExp(o);
  } catch {
    return console.warn(
      `Could not convert regex pattern at ${t.currentPath.join(
        "/"
      )} to a flag-independent form! Falling back to the flag-ignorant source`
    ), e.source;
  }
  return o;
}
function cd(e, t) {
  var n, r, u, o, s, i;
  const a = {
    type: "object",
    additionalProperties: (n = be(e.valueType._def, {
      ...t,
      currentPath: [...t.currentPath, "additionalProperties"]
    })) != null ? n : t.allowedAdditionalProperties
  };
  if (((r = e.keyType) == null ? void 0 : r._def.typeName) === ue.ZodString && ((u = e.keyType._def.checks) != null && u.length)) {
    const { type: c, ...f } = ad(e.keyType._def, t);
    return {
      ...a,
      propertyNames: f
    };
  } else {
    if (((o = e.keyType) == null ? void 0 : o._def.typeName) === ue.ZodEnum)
      return {
        ...a,
        propertyNames: {
          enum: e.keyType._def.values
        }
      };
    if (((s = e.keyType) == null ? void 0 : s._def.typeName) === ue.ZodBranded && e.keyType._def.type._def.typeName === ue.ZodString && ((i = e.keyType._def.type._def.checks) != null && i.length)) {
      const { type: c, ...f } = sd(
        e.keyType._def,
        t
      );
      return {
        ...a,
        propertyNames: f
      };
    }
  }
  return a;
}
function Iv(e, t) {
  if (t.mapStrategy === "record")
    return cd(e, t);
  const n = be(e.keyType._def, {
    ...t,
    currentPath: [...t.currentPath, "items", "items", "0"]
  }) || mt(), r = be(e.valueType._def, {
    ...t,
    currentPath: [...t.currentPath, "items", "items", "1"]
  }) || mt();
  return {
    type: "array",
    maxItems: 125,
    items: {
      type: "array",
      items: [n, r],
      minItems: 2,
      maxItems: 2
    }
  };
}
function Tv(e) {
  const t = e.values, r = Object.keys(e.values).filter((o) => typeof t[t[o]] != "number").map((o) => t[o]), u = Array.from(
    new Set(r.map((o) => typeof o))
  );
  return {
    type: u.length === 1 ? u[0] === "string" ? "string" : "number" : ["string", "number"],
    enum: r
  };
}
function Fv() {
  return { not: mt() };
}
function zv() {
  return {
    type: "null"
  };
}
var Es = {
  ZodString: "string",
  ZodNumber: "number",
  ZodBigInt: "integer",
  ZodBoolean: "boolean",
  ZodNull: "null"
};
function Mv(e, t) {
  const n = e.options instanceof Map ? Array.from(e.options.values()) : e.options;
  if (n.every(
    (r) => r._def.typeName in Es && (!r._def.checks || !r._def.checks.length)
  )) {
    const r = n.reduce((u, o) => {
      const s = Es[o._def.typeName];
      return s && !u.includes(s) ? [...u, s] : u;
    }, []);
    return {
      type: r.length > 1 ? r : r[0]
    };
  } else if (n.every((r) => r._def.typeName === "ZodLiteral" && !r.description)) {
    const r = n.reduce(
      (u, o) => {
        const s = typeof o._def.value;
        switch (s) {
          case "string":
          case "number":
          case "boolean":
            return [...u, s];
          case "bigint":
            return [...u, "integer"];
          case "object":
            if (o._def.value === null) return [...u, "null"];
          case "symbol":
          case "undefined":
          case "function":
          default:
            return u;
        }
      },
      []
    );
    if (r.length === n.length) {
      const u = r.filter((o, s, i) => i.indexOf(o) === s);
      return {
        type: u.length > 1 ? u : u[0],
        enum: n.reduce(
          (o, s) => o.includes(s._def.value) ? o : [...o, s._def.value],
          []
        )
      };
    }
  } else if (n.every((r) => r._def.typeName === "ZodEnum"))
    return {
      type: "string",
      enum: n.reduce(
        (r, u) => [
          ...r,
          ...u._def.values.filter((o) => !r.includes(o))
        ],
        []
      )
    };
  return Pv(e, t);
}
var Pv = (e, t) => {
  const n = (e.options instanceof Map ? Array.from(e.options.values()) : e.options).map(
    (r, u) => be(r._def, {
      ...t,
      currentPath: [...t.currentPath, "anyOf", `${u}`]
    })
  ).filter(
    (r) => !!r && (!t.strictUnions || typeof r == "object" && Object.keys(r).length > 0)
  );
  return n.length ? { anyOf: n } : void 0;
};
function Rv(e, t) {
  if (["ZodString", "ZodNumber", "ZodBigInt", "ZodBoolean", "ZodNull"].includes(
    e.innerType._def.typeName
  ) && (!e.innerType._def.checks || !e.innerType._def.checks.length))
    return {
      type: [
        Es[e.innerType._def.typeName],
        "null"
      ]
    };
  const n = be(e.innerType._def, {
    ...t,
    currentPath: [...t.currentPath, "anyOf", "0"]
  });
  return n && { anyOf: [n, { type: "null" }] };
}
function jv(e) {
  const t = {
    type: "number"
  };
  if (!e.checks) return t;
  for (const n of e.checks)
    switch (n.kind) {
      case "int":
        t.type = "integer";
        break;
      case "min":
        n.inclusive ? t.minimum = n.value : t.exclusiveMinimum = n.value;
        break;
      case "max":
        n.inclusive ? t.maximum = n.value : t.exclusiveMaximum = n.value;
        break;
      case "multipleOf":
        t.multipleOf = n.value;
        break;
    }
  return t;
}
function Lv(e, t) {
  const n = {
    type: "object",
    properties: {}
  }, r = [], u = e.shape();
  for (const s in u) {
    let i = u[s];
    if (i === void 0 || i._def === void 0)
      continue;
    const a = Vv(i), c = be(i._def, {
      ...t,
      currentPath: [...t.currentPath, "properties", s],
      propertyPath: [...t.currentPath, "properties", s]
    });
    c !== void 0 && (n.properties[s] = c, a || r.push(s));
  }
  r.length && (n.required = r);
  const o = Zv(e, t);
  return o !== void 0 && (n.additionalProperties = o), n;
}
function Zv(e, t) {
  if (e.catchall._def.typeName !== "ZodNever")
    return be(e.catchall._def, {
      ...t,
      currentPath: [...t.currentPath, "additionalProperties"]
    });
  switch (e.unknownKeys) {
    case "passthrough":
      return t.allowedAdditionalProperties;
    case "strict":
      return t.rejectedAdditionalProperties;
    case "strip":
      return t.removeAdditionalStrategy === "strict" ? t.allowedAdditionalProperties : t.rejectedAdditionalProperties;
  }
}
function Vv(e) {
  try {
    return e.isOptional();
  } catch {
    return !0;
  }
}
var Bv = (e, t) => {
  var n;
  if (t.currentPath.toString() === ((n = t.propertyPath) == null ? void 0 : n.toString()))
    return be(e.innerType._def, t);
  const r = be(e.innerType._def, {
    ...t,
    currentPath: [...t.currentPath, "anyOf", "1"]
  });
  return r ? { anyOf: [{ not: mt() }, r] } : mt();
}, Uv = (e, t) => {
  if (t.pipeStrategy === "input")
    return be(e.in._def, t);
  if (t.pipeStrategy === "output")
    return be(e.out._def, t);
  const n = be(e.in._def, {
    ...t,
    currentPath: [...t.currentPath, "allOf", "0"]
  }), r = be(e.out._def, {
    ...t,
    currentPath: [...t.currentPath, "allOf", n ? "1" : "0"]
  });
  return {
    allOf: [n, r].filter((u) => u !== void 0)
  };
};
function Hv(e, t) {
  return be(e.type._def, t);
}
function qv(e, t) {
  const r = {
    type: "array",
    uniqueItems: !0,
    items: be(e.valueType._def, {
      ...t,
      currentPath: [...t.currentPath, "items"]
    })
  };
  return e.minSize && (r.minItems = e.minSize.value), e.maxSize && (r.maxItems = e.maxSize.value), r;
}
function Jv(e, t) {
  return e.rest ? {
    type: "array",
    minItems: e.items.length,
    items: e.items.map(
      (n, r) => be(n._def, {
        ...t,
        currentPath: [...t.currentPath, "items", `${r}`]
      })
    ).reduce(
      (n, r) => r === void 0 ? n : [...n, r],
      []
    ),
    additionalItems: be(e.rest._def, {
      ...t,
      currentPath: [...t.currentPath, "additionalItems"]
    })
  } : {
    type: "array",
    minItems: e.items.length,
    maxItems: e.items.length,
    items: e.items.map(
      (n, r) => be(n._def, {
        ...t,
        currentPath: [...t.currentPath, "items", `${r}`]
      })
    ).reduce(
      (n, r) => r === void 0 ? n : [...n, r],
      []
    )
  };
}
function Wv() {
  return {
    not: mt()
  };
}
function Gv() {
  return mt();
}
var Kv = (e, t) => be(e.innerType._def, t), Yv = (e, t, n) => {
  switch (t) {
    case ue.ZodString:
      return ad(e, n);
    case ue.ZodNumber:
      return jv(e);
    case ue.ZodObject:
      return Lv(e, n);
    case ue.ZodBigInt:
      return yv(e);
    case ue.ZodBoolean:
      return xv();
    case ue.ZodDate:
      return id(e, n);
    case ue.ZodUndefined:
      return Wv();
    case ue.ZodNull:
      return zv();
    case ue.ZodArray:
      return _v(e, n);
    case ue.ZodUnion:
    case ue.ZodDiscriminatedUnion:
      return Mv(e, n);
    case ue.ZodIntersection:
      return Sv(e, n);
    case ue.ZodTuple:
      return Jv(e, n);
    case ue.ZodRecord:
      return cd(e, n);
    case ue.ZodLiteral:
      return $v(e);
    case ue.ZodEnum:
      return Av(e);
    case ue.ZodNativeEnum:
      return Tv(e);
    case ue.ZodNullable:
      return Rv(e, n);
    case ue.ZodOptional:
      return Bv(e, n);
    case ue.ZodMap:
      return Iv(e, n);
    case ue.ZodSet:
      return qv(e, n);
    case ue.ZodLazy:
      return () => e.getter()._def;
    case ue.ZodPromise:
      return Hv(e, n);
    case ue.ZodNaN:
    case ue.ZodNever:
      return Fv();
    case ue.ZodEffects:
      return Cv(e, n);
    case ue.ZodAny:
      return mt();
    case ue.ZodUnknown:
      return Gv();
    case ue.ZodDefault:
      return wv(e, n);
    case ue.ZodBranded:
      return sd(e, n);
    case ue.ZodReadonly:
      return Kv(e, n);
    case ue.ZodCatch:
      return Ev(e, n);
    case ue.ZodPipeline:
      return Uv(e, n);
    case ue.ZodFunction:
    case ue.ZodVoid:
    case ue.ZodSymbol:
      return;
    default:
      return /* @__PURE__ */ ((r) => {
      })();
  }
}, Xv = (e, t) => {
  let n = 0;
  for (; n < e.length && n < t.length && e[n] === t[n]; n++)
    ;
  return [(e.length - n).toString(), ...t.slice(n)].join("/");
};
function be(e, t, n = !1) {
  var r;
  const u = t.seen.get(e);
  if (t.override) {
    const a = (r = t.override) == null ? void 0 : r.call(
      t,
      e,
      t,
      u,
      n
    );
    if (a !== bv)
      return a;
  }
  if (u && !n) {
    const a = Qv(u, t);
    if (a !== void 0)
      return a;
  }
  const o = { def: e, path: t.currentPath, jsonSchema: void 0 };
  t.seen.set(e, o);
  const s = Yv(e, e.typeName, t), i = typeof s == "function" ? be(s(), t) : s;
  if (i && e_(e, t, i), t.postProcess) {
    const a = t.postProcess(i, e, t);
    return o.jsonSchema = i, a;
  }
  return o.jsonSchema = i, i;
}
var Qv = (e, t) => {
  switch (t.$refStrategy) {
    case "root":
      return { $ref: e.path.join("/") };
    case "relative":
      return { $ref: Xv(t.currentPath, e.path) };
    case "none":
    case "seen":
      return e.path.length < t.currentPath.length && e.path.every((n, r) => t.currentPath[r] === n) ? (console.warn(
        `Recursive reference detected at ${t.currentPath.join(
          "/"
        )}! Defaulting to any`
      ), mt()) : t.$refStrategy === "seen" ? mt() : void 0;
  }
}, e_ = (e, t, n) => (e.description && (n.description = e.description), n), t_ = (e) => {
  const t = vv(e), n = t.name !== void 0 ? [...t.basePath, t.definitionPath, t.name] : t.basePath;
  return {
    ...t,
    currentPath: n,
    propertyPath: void 0,
    seen: new Map(
      Object.entries(t.definitions).map(([r, u]) => [
        u._def,
        {
          def: u._def,
          path: [...t.basePath, t.definitionPath, r],
          // Resolution of references will be forced even though seen, so it's ok that the schema is undefined here for now.
          jsonSchema: void 0
        }
      ])
    )
  };
}, n_ = (e, t) => {
  var n;
  const r = t_(t);
  let u = typeof t == "object" && t.definitions ? Object.entries(t.definitions).reduce(
    (c, [f, l]) => {
      var d;
      return {
        ...c,
        [f]: (d = be(
          l._def,
          {
            ...r,
            currentPath: [...r.basePath, r.definitionPath, f]
          },
          !0
        )) != null ? d : mt()
      };
    },
    {}
  ) : void 0;
  const o = typeof t == "string" ? t : t?.nameStrategy === "title" ? void 0 : t?.name, s = (n = be(
    e._def,
    o === void 0 ? r : {
      ...r,
      currentPath: [...r.basePath, r.definitionPath, o]
    },
    !1
  )) != null ? n : mt(), i = typeof t == "object" && t.name !== void 0 && t.nameStrategy === "title" ? t.name : void 0;
  i !== void 0 && (s.title = i);
  const a = o === void 0 ? u ? {
    ...s,
    [r.definitionPath]: u
  } : s : {
    $ref: [
      ...r.$refStrategy === "relative" ? [] : r.basePath,
      r.definitionPath,
      o
    ].join("/"),
    [r.definitionPath]: {
      ...u,
      [o]: s
    }
  };
  return a.$schema = "http://json-schema.org/draft-07/schema#", a;
}, ks = /* @__PURE__ */ Symbol.for("vercel.ai.schema");
function r_(e) {
  let t;
  return () => (t == null && (t = e()), t);
}
function _o(e, {
  validate: t
} = {}) {
  return {
    [ks]: !0,
    _type: void 0,
    // should never be used directly
    get jsonSchema() {
      return typeof e == "function" && (e = e()), e;
    },
    validate: t
  };
}
function u_(e) {
  return typeof e == "object" && e !== null && ks in e && e[ks] === !0 && "jsonSchema" in e && "validate" in e;
}
function di(e) {
  return e == null ? _o({ properties: {}, additionalProperties: !1 }) : u_(e) ? e : "~standard" in e ? e["~standard"].vendor === "zod" ? ld(e) : o_(e) : e();
}
function o_(e) {
  return _o(
    () => fi(
      e["~standard"].jsonSchema.input({
        target: "draft-07"
      })
    ),
    {
      validate: async (t) => {
        const n = await e["~standard"].validate(t);
        return "value" in n ? { success: !0, value: n.value } : {
          success: !1,
          error: new sr({
            value: t,
            cause: n.issues
          })
        };
      }
    }
  );
}
function s_(e, t) {
  var n;
  const r = (n = void 0) != null ? n : !1;
  return _o(
    // defer json schema creation to avoid unnecessary computation when only validation is needed
    () => n_(e, {
      $refStrategy: r ? "root" : "none"
    }),
    {
      validate: async (u) => {
        const o = await e.safeParseAsync(u);
        return o.success ? { success: !0, value: o.data } : { success: !1, error: o.error };
      }
    }
  );
}
function i_(e, t) {
  var n;
  const r = (n = void 0) != null ? n : !1;
  return _o(
    // defer json schema creation to avoid unnecessary computation when only validation is needed
    () => fi(
      qb(e, {
        target: "draft-7",
        io: "input",
        reused: r ? "ref" : "inline"
      })
    ),
    {
      validate: async (u) => {
        const o = await Kf(e, u);
        return o.success ? { success: !0, value: o.data } : { success: !1, error: o.error };
      }
    }
  );
}
function a_(e) {
  return "_zod" in e;
}
function ld(e, t) {
  return a_(e) ? i_(e) : s_(e);
}
async function Wa({
  value: e,
  schema: t,
  context: n
}) {
  const r = await Vr({ value: e, schema: t, context: n });
  if (!r.success)
    throw sr.wrap({ value: e, cause: r.error, context: n });
  return r.value;
}
async function Vr({
  value: e,
  schema: t,
  context: n
}) {
  const r = di(t);
  try {
    if (r.validate == null)
      return { success: !0, value: e, rawValue: e };
    const u = await r.validate(e);
    return u.success ? { success: !0, value: u.value, rawValue: e } : {
      success: !1,
      error: sr.wrap({ value: e, cause: u.error, context: n }),
      rawValue: e
    };
  } catch (u) {
    return {
      success: !1,
      error: sr.wrap({ value: e, cause: u, context: n }),
      rawValue: e
    };
  }
}
async function Vn({
  text: e,
  schema: t
}) {
  try {
    const n = gv(e);
    return t == null ? { success: !0, value: n, rawValue: n } : await Vr({ value: n, schema: t });
  } catch (n) {
    return {
      success: !1,
      error: ha.isInstance(n) ? n : new ha({ text: e, cause: n }),
      rawValue: void 0
    };
  }
}
function c_({
  stream: e,
  schema: t
}) {
  return e.pipeThrough(new TextDecoderStream()).pipeThrough(new fv()).pipeThrough(
    new TransformStream({
      async transform({ data: n }, r) {
        n !== "[DONE]" && r.enqueue(await Vn({ text: n, schema: t }));
      }
    })
  );
}
async function dn(e) {
  return typeof e == "function" && (e = e()), Promise.resolve(e);
}
var l_ = Object.defineProperty, f_ = (e, t) => {
  for (var n in t)
    l_(e, n, { get: t[n], enumerable: !0 });
}, fd = "AI_NoObjectGeneratedError", dd = `vercel.ai.error.${fd}`, d_ = Symbol.for(dd), pd, bn = class extends Wt {
  constructor({
    message: e = "No object generated.",
    cause: t,
    text: n,
    response: r,
    usage: u,
    finishReason: o
  }) {
    super({ name: fd, message: e, cause: t }), this[pd] = !0, this.text = n, this.response = r, this.usage = u, this.finishReason = o;
  }
  static isInstance(e) {
    return Wt.hasMarker(e, dd);
  }
};
pd = d_;
var hd = "AI_UIMessageStreamError", md = `vercel.ai.error.${hd}`, p_ = Symbol.for(md), gd, Wn = class extends Wt {
  constructor({
    chunkType: e,
    chunkId: t,
    message: n
  }) {
    super({ name: hd, message: n }), this[gd] = !0, this.chunkType = e, this.chunkId = t;
  }
  static isInstance(e) {
    return Wt.hasMarker(e, md);
  }
};
gd = p_;
var bd = rt([
  j(),
  Qu(Uint8Array),
  Qu(ArrayBuffer),
  od(
    // Buffer might not be available in some environments such as CloudFlare:
    (e) => {
      var t, n;
      return (n = (t = globalThis.Buffer) == null ? void 0 : t.isBuffer(e)) != null ? n : !1;
    },
    { message: "Must be a Buffer" }
  )
]), Br = sv(
  () => rt([
    z2(),
    j(),
    O2(),
    Qe(),
    Zr(j(), Br.optional()),
    hr(Br)
  ])
), se = Zr(
  j(),
  Zr(j(), Br.optional())
), vd = _e({
  type: X("text"),
  text: j(),
  providerOptions: se.optional()
}), h_ = _e({
  type: X("image"),
  image: rt([bd, Qu(URL)]),
  mediaType: j().optional(),
  providerOptions: se.optional()
}), _d = _e({
  type: X("file"),
  data: rt([bd, Qu(URL)]),
  filename: j().optional(),
  mediaType: j(),
  providerOptions: se.optional()
}), m_ = _e({
  type: X("reasoning"),
  text: j(),
  providerOptions: se.optional()
}), g_ = _e({
  type: X("tool-call"),
  toolCallId: j(),
  toolName: j(),
  input: jt(),
  providerOptions: se.optional(),
  providerExecuted: Qe().optional()
}), b_ = L2(
  "type",
  [
    _e({
      type: X("text"),
      value: j(),
      providerOptions: se.optional()
    }),
    _e({
      type: X("json"),
      value: Br,
      providerOptions: se.optional()
    }),
    _e({
      type: X("execution-denied"),
      reason: j().optional(),
      providerOptions: se.optional()
    }),
    _e({
      type: X("error-text"),
      value: j(),
      providerOptions: se.optional()
    }),
    _e({
      type: X("error-json"),
      value: Br,
      providerOptions: se.optional()
    }),
    _e({
      type: X("content"),
      value: hr(
        rt([
          _e({
            type: X("text"),
            text: j(),
            providerOptions: se.optional()
          }),
          _e({
            type: X("media"),
            data: j(),
            mediaType: j()
          }),
          _e({
            type: X("file-data"),
            data: j(),
            mediaType: j(),
            filename: j().optional(),
            providerOptions: se.optional()
          }),
          _e({
            type: X("file-url"),
            url: j(),
            providerOptions: se.optional()
          }),
          _e({
            type: X("file-id"),
            fileId: rt([j(), Zr(j(), j())]),
            providerOptions: se.optional()
          }),
          _e({
            type: X("image-data"),
            data: j(),
            mediaType: j(),
            providerOptions: se.optional()
          }),
          _e({
            type: X("image-url"),
            url: j(),
            providerOptions: se.optional()
          }),
          _e({
            type: X("image-file-id"),
            fileId: rt([j(), Zr(j(), j())]),
            providerOptions: se.optional()
          }),
          _e({
            type: X("custom"),
            providerOptions: se.optional()
          })
        ])
      )
    })
  ]
), yd = _e({
  type: X("tool-result"),
  toolCallId: j(),
  toolName: j(),
  output: b_,
  providerOptions: se.optional()
}), v_ = _e({
  type: X("tool-approval-request"),
  approvalId: j(),
  toolCallId: j()
}), __ = _e({
  type: X("tool-approval-response"),
  approvalId: j(),
  approved: Qe(),
  reason: j().optional()
}), y_ = _e(
  {
    role: X("system"),
    content: j(),
    providerOptions: se.optional()
  }
), x_ = _e({
  role: X("user"),
  content: rt([
    j(),
    hr(rt([vd, h_, _d]))
  ]),
  providerOptions: se.optional()
}), E_ = _e({
  role: X("assistant"),
  content: rt([
    j(),
    hr(
      rt([
        vd,
        _d,
        m_,
        g_,
        yd,
        v_
      ])
    )
  ]),
  providerOptions: se.optional()
}), k_ = _e({
  role: X("tool"),
  content: hr(rt([yd, __])),
  providerOptions: se.optional()
});
rt([
  y_,
  x_,
  E_,
  k_
]);
function xd(e, t) {
  if (e === void 0 && t === void 0)
    return;
  if (e === void 0)
    return t;
  if (t === void 0)
    return e;
  const n = { ...e };
  for (const r in t)
    if (Object.prototype.hasOwnProperty.call(t, r)) {
      const u = t[r];
      if (u === void 0)
        continue;
      const o = r in e ? e[r] : void 0, s = u !== null && typeof u == "object" && !Array.isArray(u) && !(u instanceof Date) && !(u instanceof RegExp), i = o != null && typeof o == "object" && !Array.isArray(o) && !(o instanceof Date) && !(o instanceof RegExp);
      s && i ? n[r] = xd(
        o,
        u
      ) : n[r] = u;
    }
  return n;
}
var w_ = {};
f_(w_, {
  array: () => S_,
  choice: () => $_,
  json: () => N_,
  object: () => D_,
  text: () => A_
});
function C_(e) {
  const t = ["ROOT"];
  let n = -1, r = null;
  function u(a, c, f) {
    switch (a) {
      case '"': {
        n = c, t.pop(), t.push(f), t.push("INSIDE_STRING");
        break;
      }
      case "f":
      case "t":
      case "n": {
        n = c, r = c, t.pop(), t.push(f), t.push("INSIDE_LITERAL");
        break;
      }
      case "-": {
        t.pop(), t.push(f), t.push("INSIDE_NUMBER");
        break;
      }
      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9": {
        n = c, t.pop(), t.push(f), t.push("INSIDE_NUMBER");
        break;
      }
      case "{": {
        n = c, t.pop(), t.push(f), t.push("INSIDE_OBJECT_START");
        break;
      }
      case "[": {
        n = c, t.pop(), t.push(f), t.push("INSIDE_ARRAY_START");
        break;
      }
    }
  }
  function o(a, c) {
    switch (a) {
      case ",": {
        t.pop(), t.push("INSIDE_OBJECT_AFTER_COMMA");
        break;
      }
      case "}": {
        n = c, t.pop();
        break;
      }
    }
  }
  function s(a, c) {
    switch (a) {
      case ",": {
        t.pop(), t.push("INSIDE_ARRAY_AFTER_COMMA");
        break;
      }
      case "]": {
        n = c, t.pop();
        break;
      }
    }
  }
  for (let a = 0; a < e.length; a++) {
    const c = e[a];
    switch (t[t.length - 1]) {
      case "ROOT":
        u(c, a, "FINISH");
        break;
      case "INSIDE_OBJECT_START": {
        switch (c) {
          case '"': {
            t.pop(), t.push("INSIDE_OBJECT_KEY");
            break;
          }
          case "}": {
            n = a, t.pop();
            break;
          }
        }
        break;
      }
      case "INSIDE_OBJECT_AFTER_COMMA": {
        switch (c) {
          case '"': {
            t.pop(), t.push("INSIDE_OBJECT_KEY");
            break;
          }
        }
        break;
      }
      case "INSIDE_OBJECT_KEY": {
        switch (c) {
          case '"': {
            t.pop(), t.push("INSIDE_OBJECT_AFTER_KEY");
            break;
          }
        }
        break;
      }
      case "INSIDE_OBJECT_AFTER_KEY": {
        switch (c) {
          case ":": {
            t.pop(), t.push("INSIDE_OBJECT_BEFORE_VALUE");
            break;
          }
        }
        break;
      }
      case "INSIDE_OBJECT_BEFORE_VALUE": {
        u(c, a, "INSIDE_OBJECT_AFTER_VALUE");
        break;
      }
      case "INSIDE_OBJECT_AFTER_VALUE": {
        o(c, a);
        break;
      }
      case "INSIDE_STRING": {
        switch (c) {
          case '"': {
            t.pop(), n = a;
            break;
          }
          case "\\": {
            t.push("INSIDE_STRING_ESCAPE");
            break;
          }
          default:
            n = a;
        }
        break;
      }
      case "INSIDE_ARRAY_START": {
        switch (c) {
          case "]": {
            n = a, t.pop();
            break;
          }
          default: {
            n = a, u(c, a, "INSIDE_ARRAY_AFTER_VALUE");
            break;
          }
        }
        break;
      }
      case "INSIDE_ARRAY_AFTER_VALUE": {
        switch (c) {
          case ",": {
            t.pop(), t.push("INSIDE_ARRAY_AFTER_COMMA");
            break;
          }
          case "]": {
            n = a, t.pop();
            break;
          }
          default: {
            n = a;
            break;
          }
        }
        break;
      }
      case "INSIDE_ARRAY_AFTER_COMMA": {
        u(c, a, "INSIDE_ARRAY_AFTER_VALUE");
        break;
      }
      case "INSIDE_STRING_ESCAPE": {
        t.pop(), n = a;
        break;
      }
      case "INSIDE_NUMBER": {
        switch (c) {
          case "0":
          case "1":
          case "2":
          case "3":
          case "4":
          case "5":
          case "6":
          case "7":
          case "8":
          case "9": {
            n = a;
            break;
          }
          case "e":
          case "E":
          case "-":
          case ".":
            break;
          case ",": {
            t.pop(), t[t.length - 1] === "INSIDE_ARRAY_AFTER_VALUE" && s(c, a), t[t.length - 1] === "INSIDE_OBJECT_AFTER_VALUE" && o(c, a);
            break;
          }
          case "}": {
            t.pop(), t[t.length - 1] === "INSIDE_OBJECT_AFTER_VALUE" && o(c, a);
            break;
          }
          case "]": {
            t.pop(), t[t.length - 1] === "INSIDE_ARRAY_AFTER_VALUE" && s(c, a);
            break;
          }
          default: {
            t.pop();
            break;
          }
        }
        break;
      }
      case "INSIDE_LITERAL": {
        const l = e.substring(r, a + 1);
        !"false".startsWith(l) && !"true".startsWith(l) && !"null".startsWith(l) ? (t.pop(), t[t.length - 1] === "INSIDE_OBJECT_AFTER_VALUE" ? o(c, a) : t[t.length - 1] === "INSIDE_ARRAY_AFTER_VALUE" && s(c, a)) : n = a;
        break;
      }
    }
  }
  let i = e.slice(0, n + 1);
  for (let a = t.length - 1; a >= 0; a--)
    switch (t[a]) {
      case "INSIDE_STRING": {
        i += '"';
        break;
      }
      case "INSIDE_OBJECT_KEY":
      case "INSIDE_OBJECT_AFTER_KEY":
      case "INSIDE_OBJECT_AFTER_COMMA":
      case "INSIDE_OBJECT_START":
      case "INSIDE_OBJECT_BEFORE_VALUE":
      case "INSIDE_OBJECT_AFTER_VALUE": {
        i += "}";
        break;
      }
      case "INSIDE_ARRAY_START":
      case "INSIDE_ARRAY_AFTER_COMMA":
      case "INSIDE_ARRAY_AFTER_VALUE": {
        i += "]";
        break;
      }
      case "INSIDE_LITERAL": {
        const f = e.substring(r, e.length);
        "true".startsWith(f) ? i += "true".slice(f.length) : "false".startsWith(f) ? i += "false".slice(f.length) : "null".startsWith(f) && (i += "null".slice(f.length));
      }
    }
  return i;
}
async function ou(e) {
  if (e === void 0)
    return { value: void 0, state: "undefined-input" };
  let t = await Vn({ text: e });
  return t.success ? { value: t.value, state: "successful-parse" } : (t = await Vn({ text: C_(e) }), t.success ? { value: t.value, state: "repaired-parse" } : { value: void 0, state: "failed-parse" });
}
var A_ = () => ({
  name: "text",
  responseFormat: Promise.resolve({ type: "text" }),
  async parseCompleteOutput({ text: e }) {
    return e;
  },
  async parsePartialOutput({ text: e }) {
    return { partial: e };
  },
  createElementStreamTransform() {
  }
}), D_ = ({
  schema: e,
  name: t,
  description: n
}) => {
  const r = di(e);
  return {
    name: "object",
    responseFormat: dn(r.jsonSchema).then((u) => ({
      type: "json",
      schema: u,
      ...t != null && { name: t },
      ...n != null && { description: n }
    })),
    async parseCompleteOutput({ text: u }, o) {
      const s = await Vn({ text: u });
      if (!s.success)
        throw new bn({
          message: "No object generated: could not parse the response.",
          cause: s.error,
          text: u,
          response: o.response,
          usage: o.usage,
          finishReason: o.finishReason
        });
      const i = await Vr({
        value: s.value,
        schema: r
      });
      if (!i.success)
        throw new bn({
          message: "No object generated: response did not match schema.",
          cause: i.error,
          text: u,
          response: o.response,
          usage: o.usage,
          finishReason: o.finishReason
        });
      return i.value;
    },
    async parsePartialOutput({ text: u }) {
      const o = await ou(u);
      switch (o.state) {
        case "failed-parse":
        case "undefined-input":
          return;
        case "repaired-parse":
        case "successful-parse":
          return {
            // Note: currently no validation of partial results:
            partial: o.value
          };
      }
    },
    createElementStreamTransform() {
    }
  };
}, S_ = ({
  element: e,
  name: t,
  description: n
}) => {
  const r = di(e);
  return {
    name: "array",
    // JSON schema that describes an array of elements:
    responseFormat: dn(r.jsonSchema).then((u) => {
      const { $schema: o, ...s } = u;
      return {
        type: "json",
        schema: {
          $schema: "http://json-schema.org/draft-07/schema#",
          type: "object",
          properties: {
            elements: { type: "array", items: s }
          },
          required: ["elements"],
          additionalProperties: !1
        },
        ...t != null && { name: t },
        ...n != null && { description: n }
      };
    }),
    async parseCompleteOutput({ text: u }, o) {
      const s = await Vn({ text: u });
      if (!s.success)
        throw new bn({
          message: "No object generated: could not parse the response.",
          cause: s.error,
          text: u,
          response: o.response,
          usage: o.usage,
          finishReason: o.finishReason
        });
      const i = s.value;
      if (i == null || typeof i != "object" || !("elements" in i) || !Array.isArray(i.elements))
        throw new bn({
          message: "No object generated: response did not match schema.",
          cause: new sr({
            value: i,
            cause: "response must be an object with an elements array"
          }),
          text: u,
          response: o.response,
          usage: o.usage,
          finishReason: o.finishReason
        });
      for (const a of i.elements) {
        const c = await Vr({
          value: a,
          schema: r
        });
        if (!c.success)
          throw new bn({
            message: "No object generated: response did not match schema.",
            cause: c.error,
            text: u,
            response: o.response,
            usage: o.usage,
            finishReason: o.finishReason
          });
      }
      return i.elements;
    },
    async parsePartialOutput({ text: u }) {
      const o = await ou(u);
      switch (o.state) {
        case "failed-parse":
        case "undefined-input":
          return;
        case "repaired-parse":
        case "successful-parse": {
          const s = o.value;
          if (s == null || typeof s != "object" || !("elements" in s) || !Array.isArray(s.elements))
            return;
          const i = o.state === "repaired-parse" && s.elements.length > 0 ? s.elements.slice(0, -1) : s.elements, a = [];
          for (const c of i) {
            const f = await Vr({
              value: c,
              schema: r
            });
            f.success && a.push(f.value);
          }
          return { partial: a };
        }
      }
    },
    createElementStreamTransform() {
      let u = 0;
      return new TransformStream({
        transform({ partialOutput: o }, s) {
          if (o != null)
            for (; u < o.length; u++)
              s.enqueue(o[u]);
        }
      });
    }
  };
}, $_ = ({
  options: e,
  name: t,
  description: n
}) => ({
  name: "choice",
  // JSON schema that describes an enumeration:
  responseFormat: Promise.resolve({
    type: "json",
    schema: {
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      properties: {
        result: { type: "string", enum: e }
      },
      required: ["result"],
      additionalProperties: !1
    },
    ...t != null && { name: t },
    ...n != null && { description: n }
  }),
  async parseCompleteOutput({ text: r }, u) {
    const o = await Vn({ text: r });
    if (!o.success)
      throw new bn({
        message: "No object generated: could not parse the response.",
        cause: o.error,
        text: r,
        response: u.response,
        usage: u.usage,
        finishReason: u.finishReason
      });
    const s = o.value;
    if (s == null || typeof s != "object" || !("result" in s) || typeof s.result != "string" || !e.includes(s.result))
      throw new bn({
        message: "No object generated: response did not match schema.",
        cause: new sr({
          value: s,
          cause: "response must be an object that contains a choice value."
        }),
        text: r,
        response: u.response,
        usage: u.usage,
        finishReason: u.finishReason
      });
    return s.result;
  },
  async parsePartialOutput({ text: r }) {
    const u = await ou(r);
    switch (u.state) {
      case "failed-parse":
      case "undefined-input":
        return;
      case "repaired-parse":
      case "successful-parse": {
        const o = u.value;
        if (o == null || typeof o != "object" || !("result" in o) || typeof o.result != "string")
          return;
        const s = e.filter(
          (i) => i.startsWith(o.result)
        );
        return u.state === "successful-parse" ? s.includes(o.result) ? { partial: o.result } : void 0 : s.length === 1 ? { partial: s[0] } : void 0;
      }
    }
  },
  createElementStreamTransform() {
  }
}), N_ = ({
  name: e,
  description: t
} = {}) => ({
  name: "json",
  responseFormat: Promise.resolve({
    type: "json",
    ...e != null && { name: e },
    ...t != null && { description: t }
  }),
  async parseCompleteOutput({ text: n }, r) {
    const u = await Vn({ text: n });
    if (!u.success)
      throw new bn({
        message: "No object generated: could not parse the response.",
        cause: u.error,
        text: n,
        response: r.response,
        usage: r.usage,
        finishReason: r.finishReason
      });
    return u.value;
  },
  async parsePartialOutput({ text: n }) {
    const r = await ou(n);
    switch (r.state) {
      case "failed-parse":
      case "undefined-input":
        return;
      case "repaired-parse":
      case "successful-parse":
        return r.value === void 0 ? void 0 : { partial: r.value };
    }
  },
  createElementStreamTransform() {
  }
});
uu({
  prefix: "aitxt",
  size: 24
});
(class extends TransformStream {
  constructor() {
    super({
      transform(e, t) {
        t.enqueue(`data: ${JSON.stringify(e)}

`);
      },
      flush(e) {
        e.enqueue(`data: [DONE]

`);
      }
    });
  }
});
var O_ = r_(
  () => ld(
    rt([
      Ce({
        type: X("text-start"),
        id: j(),
        providerMetadata: se.optional()
      }),
      Ce({
        type: X("text-delta"),
        id: j(),
        delta: j(),
        providerMetadata: se.optional()
      }),
      Ce({
        type: X("text-end"),
        id: j(),
        providerMetadata: se.optional()
      }),
      Ce({
        type: X("error"),
        errorText: j()
      }),
      Ce({
        type: X("tool-input-start"),
        toolCallId: j(),
        toolName: j(),
        providerExecuted: Qe().optional(),
        providerMetadata: se.optional(),
        dynamic: Qe().optional(),
        title: j().optional()
      }),
      Ce({
        type: X("tool-input-delta"),
        toolCallId: j(),
        inputTextDelta: j()
      }),
      Ce({
        type: X("tool-input-available"),
        toolCallId: j(),
        toolName: j(),
        input: jt(),
        providerExecuted: Qe().optional(),
        providerMetadata: se.optional(),
        dynamic: Qe().optional(),
        title: j().optional()
      }),
      Ce({
        type: X("tool-input-error"),
        toolCallId: j(),
        toolName: j(),
        input: jt(),
        providerExecuted: Qe().optional(),
        providerMetadata: se.optional(),
        dynamic: Qe().optional(),
        errorText: j(),
        title: j().optional()
      }),
      Ce({
        type: X("tool-approval-request"),
        approvalId: j(),
        toolCallId: j()
      }),
      Ce({
        type: X("tool-output-available"),
        toolCallId: j(),
        output: jt(),
        providerExecuted: Qe().optional(),
        providerMetadata: se.optional(),
        dynamic: Qe().optional(),
        preliminary: Qe().optional()
      }),
      Ce({
        type: X("tool-output-error"),
        toolCallId: j(),
        errorText: j(),
        providerExecuted: Qe().optional(),
        providerMetadata: se.optional(),
        dynamic: Qe().optional()
      }),
      Ce({
        type: X("tool-output-denied"),
        toolCallId: j()
      }),
      Ce({
        type: X("reasoning-start"),
        id: j(),
        providerMetadata: se.optional()
      }),
      Ce({
        type: X("reasoning-delta"),
        id: j(),
        delta: j(),
        providerMetadata: se.optional()
      }),
      Ce({
        type: X("reasoning-end"),
        id: j(),
        providerMetadata: se.optional()
      }),
      Ce({
        type: X("source-url"),
        sourceId: j(),
        url: j(),
        title: j().optional(),
        providerMetadata: se.optional()
      }),
      Ce({
        type: X("source-document"),
        sourceId: j(),
        mediaType: j(),
        title: j(),
        filename: j().optional(),
        providerMetadata: se.optional()
      }),
      Ce({
        type: X("file"),
        url: j(),
        mediaType: j(),
        providerMetadata: se.optional()
      }),
      Ce({
        type: od(
          (e) => typeof e == "string" && e.startsWith("data-"),
          { message: 'Type must start with "data-"' }
        ),
        id: j().optional(),
        data: jt(),
        transient: Qe().optional()
      }),
      Ce({
        type: X("start-step")
      }),
      Ce({
        type: X("finish-step")
      }),
      Ce({
        type: X("start"),
        messageId: j().optional(),
        messageMetadata: jt().optional()
      }),
      Ce({
        type: X("finish"),
        finishReason: nd([
          "stop",
          "length",
          "content-filter",
          "tool-calls",
          "error",
          "other"
        ]).optional(),
        messageMetadata: jt().optional()
      }),
      Ce({
        type: X("abort"),
        reason: j().optional()
      }),
      Ce({
        type: X("message-metadata"),
        messageMetadata: jt()
      })
    ])
  )
);
function I_(e) {
  return e.type.startsWith("data-");
}
function ws(e) {
  return e.type.startsWith("tool-");
}
function T_(e) {
  return e.type === "dynamic-tool";
}
function eo(e) {
  return ws(e) || T_(e);
}
function Ga(e) {
  return e.type.split("-").slice(1).join("-");
}
function F_({
  lastMessage: e,
  messageId: t
}) {
  return {
    message: e?.role === "assistant" ? e : {
      id: t,
      metadata: void 0,
      role: "assistant",
      parts: []
    },
    activeTextParts: {},
    activeReasoningParts: {},
    partialToolCalls: {}
  };
}
function z_({
  stream: e,
  messageMetadataSchema: t,
  dataPartSchemas: n,
  runUpdateMessageJob: r,
  onError: u,
  onToolCall: o,
  onData: s
}) {
  return e.pipeThrough(
    new TransformStream({
      async transform(i, a) {
        await r(async ({ state: c, write: f }) => {
          var l, d, p, m;
          function v(h) {
            const g = c.message.parts.filter(eo).find(
              (y) => y.toolCallId === h
            );
            if (g == null)
              throw new Wn({
                chunkType: "tool-invocation",
                chunkId: h,
                message: `No tool invocation found for tool call ID "${h}".`
              });
            return g;
          }
          function _(h) {
            var w;
            const g = c.message.parts.find(
              (k) => ws(k) && k.toolCallId === h.toolCallId
            ), y = h, C = g;
            if (g != null) {
              g.state = h.state, C.input = y.input, C.output = y.output, C.errorText = y.errorText, C.rawInput = y.rawInput, C.preliminary = y.preliminary, h.title !== void 0 && (C.title = h.title), C.providerExecuted = (w = y.providerExecuted) != null ? w : g.providerExecuted;
              const k = y.providerMetadata;
              if (k != null)
                if (h.state === "output-available" || h.state === "output-error") {
                  const Z = g;
                  Z.resultProviderMetadata = k;
                } else
                  g.callProviderMetadata = k;
            } else
              c.message.parts.push({
                type: `tool-${h.toolName}`,
                toolCallId: h.toolCallId,
                state: h.state,
                title: h.title,
                input: y.input,
                output: y.output,
                rawInput: y.rawInput,
                errorText: y.errorText,
                providerExecuted: y.providerExecuted,
                preliminary: y.preliminary,
                ...y.providerMetadata != null && (h.state === "output-available" || h.state === "output-error") ? { resultProviderMetadata: y.providerMetadata } : {},
                ...y.providerMetadata != null && !(h.state === "output-available" || h.state === "output-error") ? { callProviderMetadata: y.providerMetadata } : {}
              });
          }
          function A(h) {
            var w, g;
            const y = c.message.parts.find(
              (Z) => Z.type === "dynamic-tool" && Z.toolCallId === h.toolCallId
            ), C = h, k = y;
            if (y != null) {
              y.state = h.state, k.toolName = h.toolName, k.input = C.input, k.output = C.output, k.errorText = C.errorText, k.rawInput = (w = C.rawInput) != null ? w : k.rawInput, k.preliminary = C.preliminary, h.title !== void 0 && (k.title = h.title), k.providerExecuted = (g = C.providerExecuted) != null ? g : y.providerExecuted;
              const Z = C.providerMetadata;
              if (Z != null)
                if (h.state === "output-available" || h.state === "output-error") {
                  const W = y;
                  W.resultProviderMetadata = Z;
                } else
                  y.callProviderMetadata = Z;
            } else
              c.message.parts.push({
                type: "dynamic-tool",
                toolName: h.toolName,
                toolCallId: h.toolCallId,
                state: h.state,
                input: C.input,
                output: C.output,
                errorText: C.errorText,
                preliminary: C.preliminary,
                providerExecuted: C.providerExecuted,
                title: h.title,
                ...C.providerMetadata != null && (h.state === "output-available" || h.state === "output-error") ? { resultProviderMetadata: C.providerMetadata } : {},
                ...C.providerMetadata != null && !(h.state === "output-available" || h.state === "output-error") ? { callProviderMetadata: C.providerMetadata } : {}
              });
          }
          async function E(h) {
            if (h != null) {
              const w = c.message.metadata != null ? xd(c.message.metadata, h) : h;
              t != null && await Wa({
                value: w,
                schema: t,
                context: {
                  field: "message.metadata",
                  entityId: c.message.id
                }
              }), c.message.metadata = w;
            }
          }
          switch (i.type) {
            case "text-start": {
              const h = {
                type: "text",
                text: "",
                providerMetadata: i.providerMetadata,
                state: "streaming"
              };
              c.activeTextParts[i.id] = h, c.message.parts.push(h), f();
              break;
            }
            case "text-delta": {
              const h = c.activeTextParts[i.id];
              if (h == null)
                throw new Wn({
                  chunkType: "text-delta",
                  chunkId: i.id,
                  message: `Received text-delta for missing text part with ID "${i.id}". Ensure a "text-start" chunk is sent before any "text-delta" chunks.`
                });
              h.text += i.delta, h.providerMetadata = (l = i.providerMetadata) != null ? l : h.providerMetadata, f();
              break;
            }
            case "text-end": {
              const h = c.activeTextParts[i.id];
              if (h == null)
                throw new Wn({
                  chunkType: "text-end",
                  chunkId: i.id,
                  message: `Received text-end for missing text part with ID "${i.id}". Ensure a "text-start" chunk is sent before any "text-end" chunks.`
                });
              h.state = "done", h.providerMetadata = (d = i.providerMetadata) != null ? d : h.providerMetadata, delete c.activeTextParts[i.id], f();
              break;
            }
            case "reasoning-start": {
              const h = {
                type: "reasoning",
                text: "",
                providerMetadata: i.providerMetadata,
                state: "streaming"
              };
              c.activeReasoningParts[i.id] = h, c.message.parts.push(h), f();
              break;
            }
            case "reasoning-delta": {
              const h = c.activeReasoningParts[i.id];
              if (h == null)
                throw new Wn({
                  chunkType: "reasoning-delta",
                  chunkId: i.id,
                  message: `Received reasoning-delta for missing reasoning part with ID "${i.id}". Ensure a "reasoning-start" chunk is sent before any "reasoning-delta" chunks.`
                });
              h.text += i.delta, h.providerMetadata = (p = i.providerMetadata) != null ? p : h.providerMetadata, f();
              break;
            }
            case "reasoning-end": {
              const h = c.activeReasoningParts[i.id];
              if (h == null)
                throw new Wn({
                  chunkType: "reasoning-end",
                  chunkId: i.id,
                  message: `Received reasoning-end for missing reasoning part with ID "${i.id}". Ensure a "reasoning-start" chunk is sent before any "reasoning-end" chunks.`
                });
              h.providerMetadata = (m = i.providerMetadata) != null ? m : h.providerMetadata, h.state = "done", delete c.activeReasoningParts[i.id], f();
              break;
            }
            case "file": {
              c.message.parts.push({
                type: "file",
                mediaType: i.mediaType,
                url: i.url,
                ...i.providerMetadata != null ? { providerMetadata: i.providerMetadata } : {}
              }), f();
              break;
            }
            case "source-url": {
              c.message.parts.push({
                type: "source-url",
                sourceId: i.sourceId,
                url: i.url,
                title: i.title,
                providerMetadata: i.providerMetadata
              }), f();
              break;
            }
            case "source-document": {
              c.message.parts.push({
                type: "source-document",
                sourceId: i.sourceId,
                mediaType: i.mediaType,
                title: i.title,
                filename: i.filename,
                providerMetadata: i.providerMetadata
              }), f();
              break;
            }
            case "tool-input-start": {
              const h = c.message.parts.filter(ws);
              c.partialToolCalls[i.toolCallId] = {
                text: "",
                toolName: i.toolName,
                index: h.length,
                dynamic: i.dynamic,
                title: i.title
              }, i.dynamic ? A({
                toolCallId: i.toolCallId,
                toolName: i.toolName,
                state: "input-streaming",
                input: void 0,
                providerExecuted: i.providerExecuted,
                title: i.title,
                providerMetadata: i.providerMetadata
              }) : _({
                toolCallId: i.toolCallId,
                toolName: i.toolName,
                state: "input-streaming",
                input: void 0,
                providerExecuted: i.providerExecuted,
                title: i.title,
                providerMetadata: i.providerMetadata
              }), f();
              break;
            }
            case "tool-input-delta": {
              const h = c.partialToolCalls[i.toolCallId];
              if (h == null)
                throw new Wn({
                  chunkType: "tool-input-delta",
                  chunkId: i.toolCallId,
                  message: `Received tool-input-delta for missing tool call with ID "${i.toolCallId}". Ensure a "tool-input-start" chunk is sent before any "tool-input-delta" chunks.`
                });
              h.text += i.inputTextDelta;
              const { value: w } = await ou(
                h.text
              );
              h.dynamic ? A({
                toolCallId: i.toolCallId,
                toolName: h.toolName,
                state: "input-streaming",
                input: w,
                title: h.title
              }) : _({
                toolCallId: i.toolCallId,
                toolName: h.toolName,
                state: "input-streaming",
                input: w,
                title: h.title
              }), f();
              break;
            }
            case "tool-input-available": {
              i.dynamic ? A({
                toolCallId: i.toolCallId,
                toolName: i.toolName,
                state: "input-available",
                input: i.input,
                providerExecuted: i.providerExecuted,
                providerMetadata: i.providerMetadata,
                title: i.title
              }) : _({
                toolCallId: i.toolCallId,
                toolName: i.toolName,
                state: "input-available",
                input: i.input,
                providerExecuted: i.providerExecuted,
                providerMetadata: i.providerMetadata,
                title: i.title
              }), f(), o && !i.providerExecuted && await o({
                toolCall: i
              });
              break;
            }
            case "tool-input-error": {
              const h = c.message.parts.filter(eo).find((g) => g.toolCallId === i.toolCallId);
              (h != null ? h.type === "dynamic-tool" : !!i.dynamic) ? A({
                toolCallId: i.toolCallId,
                toolName: i.toolName,
                state: "output-error",
                input: i.input,
                errorText: i.errorText,
                providerExecuted: i.providerExecuted,
                providerMetadata: i.providerMetadata
              }) : _({
                toolCallId: i.toolCallId,
                toolName: i.toolName,
                state: "output-error",
                input: void 0,
                rawInput: i.input,
                errorText: i.errorText,
                providerExecuted: i.providerExecuted,
                providerMetadata: i.providerMetadata
              }), f();
              break;
            }
            case "tool-approval-request": {
              const h = v(i.toolCallId);
              h.state = "approval-requested", h.approval = { id: i.approvalId }, f();
              break;
            }
            case "tool-output-denied": {
              const h = v(i.toolCallId);
              h.state = "output-denied", f();
              break;
            }
            case "tool-output-available": {
              const h = v(i.toolCallId);
              h.type === "dynamic-tool" ? A({
                toolCallId: i.toolCallId,
                toolName: h.toolName,
                state: "output-available",
                input: h.input,
                output: i.output,
                preliminary: i.preliminary,
                providerExecuted: i.providerExecuted,
                providerMetadata: i.providerMetadata,
                title: h.title
              }) : _({
                toolCallId: i.toolCallId,
                toolName: Ga(h),
                state: "output-available",
                input: h.input,
                output: i.output,
                providerExecuted: i.providerExecuted,
                preliminary: i.preliminary,
                providerMetadata: i.providerMetadata,
                title: h.title
              }), f();
              break;
            }
            case "tool-output-error": {
              const h = v(i.toolCallId);
              h.type === "dynamic-tool" ? A({
                toolCallId: i.toolCallId,
                toolName: h.toolName,
                state: "output-error",
                input: h.input,
                errorText: i.errorText,
                providerExecuted: i.providerExecuted,
                providerMetadata: i.providerMetadata,
                title: h.title
              }) : _({
                toolCallId: i.toolCallId,
                toolName: Ga(h),
                state: "output-error",
                input: h.input,
                rawInput: h.rawInput,
                errorText: i.errorText,
                providerExecuted: i.providerExecuted,
                providerMetadata: i.providerMetadata,
                title: h.title
              }), f();
              break;
            }
            case "start-step": {
              c.message.parts.push({ type: "step-start" });
              break;
            }
            case "finish-step": {
              c.activeTextParts = {}, c.activeReasoningParts = {};
              break;
            }
            case "start": {
              i.messageId != null && (c.message.id = i.messageId), await E(i.messageMetadata), (i.messageId != null || i.messageMetadata != null) && f();
              break;
            }
            case "finish": {
              i.finishReason != null && (c.finishReason = i.finishReason), await E(i.messageMetadata), i.messageMetadata != null && f();
              break;
            }
            case "message-metadata": {
              await E(i.messageMetadata), i.messageMetadata != null && f();
              break;
            }
            case "error": {
              u?.(new Error(i.errorText));
              break;
            }
            default:
              if (I_(i)) {
                if (n?.[i.type] != null) {
                  const g = c.message.parts.findIndex(
                    (C) => "id" in C && "data" in C && C.id === i.id && C.type === i.type
                  ), y = g >= 0 ? g : c.message.parts.length;
                  await Wa({
                    value: i.data,
                    schema: n[i.type],
                    context: {
                      field: `message.parts[${y}].data`,
                      entityName: i.type,
                      entityId: i.id
                    }
                  });
                }
                const h = i;
                if (h.transient) {
                  s?.(h);
                  break;
                }
                const w = h.id != null ? c.message.parts.find(
                  (g) => h.type === g.type && h.id === g.id
                ) : void 0;
                w != null ? w.data = h.data : c.message.parts.push(h), s?.(h), f();
              }
          }
          a.enqueue(i);
        });
      }
    })
  );
}
async function M_({
  stream: e,
  onError: t
}) {
  const n = e.getReader();
  try {
    for (; ; ) {
      const { done: r } = await n.read();
      if (r)
        break;
    }
  } catch (r) {
    t?.(r);
  } finally {
    n.releaseLock();
  }
}
uu({
  prefix: "aitxt",
  size: 24
});
uu({ prefix: "aiobj", size: 24 });
var P_ = class {
  constructor() {
    this.queue = [], this.isProcessing = !1;
  }
  async processQueue() {
    if (!this.isProcessing) {
      for (this.isProcessing = !0; this.queue.length > 0; )
        await this.queue[0](), this.queue.shift();
      this.isProcessing = !1;
    }
  }
  async run(e) {
    return new Promise((t, n) => {
      this.queue.push(async () => {
        try {
          await e(), t();
        } catch (r) {
          n(r);
        }
      }), this.processQueue();
    });
  }
};
uu({ prefix: "aiobj", size: 24 });
async function R_(e) {
  if (e == null)
    return [];
  if (!globalThis.FileList || !(e instanceof globalThis.FileList))
    throw new Error("FileList is not supported in the current environment");
  return Promise.all(
    Array.from(e).map(async (t) => {
      const { name: n, type: r } = t, u = await new Promise((o, s) => {
        const i = new FileReader();
        i.onload = (a) => {
          var c;
          o((c = a.target) == null ? void 0 : c.result);
        }, i.onerror = (a) => s(a), i.readAsDataURL(t);
      });
      return {
        type: "file",
        mediaType: r,
        filename: n,
        url: u
      };
    })
  );
}
var j_ = class {
  constructor({
    api: e = "/api/chat",
    credentials: t,
    headers: n,
    body: r,
    fetch: u,
    prepareSendMessagesRequest: o,
    prepareReconnectToStreamRequest: s
  }) {
    this.api = e, this.credentials = t, this.headers = n, this.body = r, this.fetch = u, this.prepareSendMessagesRequest = o, this.prepareReconnectToStreamRequest = s;
  }
  async sendMessages({
    abortSignal: e,
    ...t
  }) {
    var n, r, u, o, s;
    const i = await dn(this.body), a = await dn(this.headers), c = await dn(this.credentials), f = {
      ...Jn(a),
      ...Jn(t.headers)
    }, l = await ((n = this.prepareSendMessagesRequest) == null ? void 0 : n.call(this, {
      api: this.api,
      id: t.chatId,
      messages: t.messages,
      body: { ...i, ...t.body },
      headers: f,
      credentials: c,
      requestMetadata: t.metadata,
      trigger: t.trigger,
      messageId: t.messageId
    })), d = (r = l?.api) != null ? r : this.api, p = l?.headers !== void 0 ? Jn(l.headers) : f, m = l?.body !== void 0 ? l.body : {
      ...i,
      ...t.body,
      id: t.chatId,
      messages: t.messages,
      trigger: t.trigger,
      messageId: t.messageId
    }, v = (u = l?.credentials) != null ? u : c, A = await ((o = this.fetch) != null ? o : globalThis.fetch)(d, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...p
      },
      body: JSON.stringify(m),
      credentials: v,
      signal: e
    });
    if (!A.ok)
      throw new Error(
        (s = await A.text()) != null ? s : "Failed to fetch the chat response."
      );
    if (!A.body)
      throw new Error("The response body is empty.");
    return this.processResponseStream(A.body);
  }
  async reconnectToStream(e) {
    var t, n, r, u, o;
    const s = await dn(this.body), i = await dn(this.headers), a = await dn(this.credentials), c = {
      ...Jn(i),
      ...Jn(e.headers)
    }, f = await ((t = this.prepareReconnectToStreamRequest) == null ? void 0 : t.call(this, {
      api: this.api,
      id: e.chatId,
      body: { ...s, ...e.body },
      headers: c,
      credentials: a,
      requestMetadata: e.metadata
    })), l = (n = f?.api) != null ? n : `${this.api}/${e.chatId}/stream`, d = f?.headers !== void 0 ? Jn(f.headers) : c, p = (r = f?.credentials) != null ? r : a, v = await ((u = this.fetch) != null ? u : globalThis.fetch)(l, {
      method: "GET",
      headers: d,
      credentials: p
    });
    if (v.status === 204)
      return null;
    if (!v.ok)
      throw new Error(
        (o = await v.text()) != null ? o : "Failed to fetch the chat response."
      );
    if (!v.body)
      throw new Error("The response body is empty.");
    return this.processResponseStream(v.body);
  }
}, Ed = class extends j_ {
  constructor(e = {}) {
    super(e);
  }
  processResponseStream(e) {
    return c_({
      stream: e,
      schema: O_
    }).pipeThrough(
      new TransformStream({
        async transform(t, n) {
          if (!t.success)
            throw t.error;
          n.enqueue(t.value);
        }
      })
    );
  }
}, L_ = class {
  constructor({
    generateId: e = dv,
    id: t = e(),
    transport: n = new Ed(),
    messageMetadataSchema: r,
    dataPartSchemas: u,
    state: o,
    onError: s,
    onToolCall: i,
    onFinish: a,
    onData: c,
    sendAutomaticallyWhen: f
  }) {
    this.activeResponse = void 0, this.jobExecutor = new P_(), this.sendMessage = async (l, d) => {
      var p, m, v, _;
      if (l == null) {
        await this.makeRequest({
          trigger: "submit-message",
          messageId: (p = this.lastMessage) == null ? void 0 : p.id,
          ...d
        });
        return;
      }
      let A;
      if ("text" in l || "files" in l ? A = {
        parts: [
          ...Array.isArray(l.files) ? l.files : await R_(l.files),
          ..."text" in l && l.text != null ? [{ type: "text", text: l.text }] : []
        ]
      } : A = l, l.messageId != null) {
        const E = this.state.messages.findIndex(
          (h) => h.id === l.messageId
        );
        if (E === -1)
          throw new Error(`message with id ${l.messageId} not found`);
        if (this.state.messages[E].role !== "user")
          throw new Error(
            `message with id ${l.messageId} is not a user message`
          );
        this.state.messages = this.state.messages.slice(0, E + 1), this.state.replaceMessage(E, {
          ...A,
          id: l.messageId,
          role: (m = A.role) != null ? m : "user",
          metadata: l.metadata
        });
      } else
        this.state.pushMessage({
          ...A,
          id: (v = A.id) != null ? v : this.generateId(),
          role: (_ = A.role) != null ? _ : "user",
          metadata: l.metadata
        });
      await this.makeRequest({
        trigger: "submit-message",
        messageId: l.messageId,
        ...d
      });
    }, this.regenerate = async ({
      messageId: l,
      ...d
    } = {}) => {
      const p = l == null ? this.state.messages.length - 1 : this.state.messages.findIndex((m) => m.id === l);
      if (p === -1)
        throw new Error(`message ${l} not found`);
      this.state.messages = this.state.messages.slice(
        0,
        // if the message is a user message, we need to include it in the request:
        this.messages[p].role === "assistant" ? p : p + 1
      ), await this.makeRequest({
        trigger: "regenerate-message",
        messageId: l,
        ...d
      });
    }, this.resumeStream = async (l = {}) => {
      await this.makeRequest({ trigger: "resume-stream", ...l });
    }, this.clearError = () => {
      this.status === "error" && (this.state.error = void 0, this.setStatus({ status: "ready" }));
    }, this.addToolApprovalResponse = async ({
      id: l,
      approved: d,
      reason: p,
      options: m
    }) => this.jobExecutor.run(async () => {
      const v = this.state.messages, _ = v[v.length - 1], A = (E) => eo(E) && E.state === "approval-requested" && E.approval.id === l ? {
        ...E,
        state: "approval-responded",
        approval: { id: l, approved: d, reason: p }
      } : E;
      this.state.replaceMessage(v.length - 1, {
        ..._,
        parts: _.parts.map(A)
      }), this.activeResponse && (this.activeResponse.state.message.parts = this.activeResponse.state.message.parts.map(A)), this.status !== "streaming" && this.status !== "submitted" && this.sendAutomaticallyWhen && this.shouldSendAutomatically().then((E) => {
        var h;
        E && this.makeRequest({
          trigger: "submit-message",
          messageId: (h = this.lastMessage) == null ? void 0 : h.id,
          ...m
        });
      });
    }), this.addToolOutput = async ({
      state: l = "output-available",
      toolCallId: d,
      output: p,
      errorText: m,
      options: v
    }) => this.jobExecutor.run(async () => {
      const _ = this.state.messages, A = _[_.length - 1], E = (h) => eo(h) && h.toolCallId === d ? { ...h, state: l, output: p, errorText: m } : h;
      this.state.replaceMessage(_.length - 1, {
        ...A,
        parts: A.parts.map(E)
      }), this.activeResponse && (this.activeResponse.state.message.parts = this.activeResponse.state.message.parts.map(E)), this.status !== "streaming" && this.status !== "submitted" && this.sendAutomaticallyWhen && this.shouldSendAutomatically().then((h) => {
        var w;
        h && this.makeRequest({
          trigger: "submit-message",
          messageId: (w = this.lastMessage) == null ? void 0 : w.id,
          ...v
        });
      });
    }), this.addToolResult = this.addToolOutput, this.stop = async () => {
      var l;
      this.status !== "streaming" && this.status !== "submitted" || (l = this.activeResponse) != null && l.abortController && this.activeResponse.abortController.abort();
    }, this.id = t, this.transport = n, this.generateId = e, this.messageMetadataSchema = r, this.dataPartSchemas = u, this.state = o, this.onError = s, this.onToolCall = i, this.onFinish = a, this.onData = c, this.sendAutomaticallyWhen = f;
  }
  /**
   * Hook status:
   *
   * - `submitted`: The message has been sent to the API and we're awaiting the start of the response stream.
   * - `streaming`: The response is actively streaming in from the API, receiving chunks of data.
   * - `ready`: The full response has been received and processed; a new user message can be submitted.
   * - `error`: An error occurred during the API request, preventing successful completion.
   */
  get status() {
    return this.state.status;
  }
  setStatus({
    status: e,
    error: t
  }) {
    this.status !== e && (this.state.status = e, this.state.error = t);
  }
  get error() {
    return this.state.error;
  }
  get messages() {
    return this.state.messages;
  }
  get lastMessage() {
    return this.state.messages[this.state.messages.length - 1];
  }
  set messages(e) {
    this.state.messages = e;
  }
  async shouldSendAutomatically() {
    if (!this.sendAutomaticallyWhen)
      return !1;
    const e = this.sendAutomaticallyWhen({
      messages: this.state.messages
    });
    return e && typeof e == "object" && "then" in e ? await e : e;
  }
  async makeRequest({
    trigger: e,
    metadata: t,
    headers: n,
    body: r,
    messageId: u
  }) {
    var o, s, i;
    let a;
    if (e === "resume-stream")
      try {
        const p = await this.transport.reconnectToStream({
          chatId: this.id,
          metadata: t,
          headers: n,
          body: r
        });
        if (p == null)
          return;
        a = p;
      } catch (p) {
        this.onError && p instanceof Error && this.onError(p), this.setStatus({ status: "error", error: p });
        return;
      }
    this.setStatus({ status: "submitted", error: void 0 });
    const c = this.lastMessage;
    let f = !1, l = !1, d = !1;
    try {
      const p = {
        state: F_({
          lastMessage: this.state.snapshot(c),
          messageId: this.generateId()
        }),
        abortController: new AbortController()
      };
      p.abortController.signal.addEventListener("abort", () => {
        f = !0;
      }), this.activeResponse = p;
      let m;
      e === "resume-stream" ? m = a : m = await this.transport.sendMessages({
        chatId: this.id,
        messages: this.state.messages,
        abortSignal: p.abortController.signal,
        metadata: t,
        headers: n,
        body: r,
        trigger: e,
        messageId: u
      });
      const v = (_) => (
        // serialize the job execution to avoid race conditions:
        this.jobExecutor.run(
          () => _({
            state: p.state,
            write: () => {
              var A;
              this.setStatus({ status: "streaming" }), p.state.message.id === ((A = this.lastMessage) == null ? void 0 : A.id) ? this.state.replaceMessage(
                this.state.messages.length - 1,
                p.state.message
              ) : this.state.pushMessage(p.state.message);
            }
          })
        )
      );
      await M_({
        stream: z_({
          stream: m,
          onToolCall: this.onToolCall,
          onData: this.onData,
          messageMetadataSchema: this.messageMetadataSchema,
          dataPartSchemas: this.dataPartSchemas,
          runUpdateMessageJob: v,
          onError: (_) => {
            throw _;
          }
        }),
        onError: (_) => {
          throw _;
        }
      }), this.setStatus({ status: "ready" });
    } catch (p) {
      if (f || p.name === "AbortError")
        return f = !0, this.setStatus({ status: "ready" }), null;
      d = !0, p instanceof TypeError && (p.message.toLowerCase().includes("fetch") || p.message.toLowerCase().includes("network")) && (l = !0), this.onError && p instanceof Error && this.onError(p), this.setStatus({ status: "error", error: p });
    } finally {
      try {
        (s = this.onFinish) == null || s.call(this, {
          message: this.activeResponse.state.message,
          messages: this.state.messages,
          isAbort: f,
          isDisconnect: l,
          isError: d,
          finishReason: (o = this.activeResponse) == null ? void 0 : o.state.finishReason
        });
      } catch (p) {
        console.error(p);
      }
      this.activeResponse = void 0;
    }
    !d && await this.shouldSendAutomatically() && await this.makeRequest({
      trigger: "submit-message",
      messageId: (i = this.lastMessage) == null ? void 0 : i.id,
      metadata: t,
      headers: n,
      body: r
    });
  }
};
var Z_ = class {
  constructor(e) {
    this.statusRef = Ve("ready"), this.errorRef = Ve(void 0), this.pushMessage = (t) => {
      this.messagesRef.value = [...this.messagesRef.value, t];
    }, this.popMessage = () => {
      this.messagesRef.value = this.messagesRef.value.slice(0, -1);
    }, this.replaceMessage = (t, n) => {
      this.messagesRef.value[t] = { ...n };
    }, this.snapshot = (t) => t, this.messagesRef = Ve(e ?? []);
  }
  get messages() {
    return this.messagesRef.value;
  }
  set messages(e) {
    this.messagesRef.value = e;
  }
  get status() {
    return this.statusRef.value;
  }
  set status(e) {
    this.statusRef.value = e;
  }
  get error() {
    return this.errorRef.value;
  }
  set error(e) {
    this.errorRef.value = e;
  }
}, V_ = class extends L_ {
  constructor({ messages: e, ...t }) {
    super({
      ...t,
      state: new Z_(e)
    });
  }
};
function B_(e) {
  const t = e.baseUrl || "", n = e.chatApi || "/agent/chat", r = e.authType || "secret", u = e.participantId || "anonymous";
  return {
    chatApi: `${t}${n}`,
    channel: e.channel || "agent-web",
    conversationType: e.conversationType || "agent-chat",
    getParticipantId: () => u,
    createSession(o, s) {
      return new V_({
        id: o,
        transport: new Ed({
          api: `${t}${n}`,
          headers: () => Zo(e, r),
          body: () => ({ participantId: s })
        })
      });
    },
    pageSessions: (o) => Ka(`${t}/agent/chat/sessions/page`, {
      method: "POST",
      headers: Zo(e, r),
      body: JSON.stringify(o)
    }),
    listMessages: (o) => Ka(`${t}/agent/chat/sessions/${o}/messages`, {
      method: "GET",
      headers: Zo(e, r)
    }),
    toUiMessages: (o) => U_(o),
    formatStatus: H_,
    formatTime: q_
  };
}
function Zo(e, t) {
  const n = e.getToken?.() ?? e.token ?? "", r = {
    "Content-Type": "application/json",
    "ignore-supplier-check": "true"
  };
  return t === "jwt" && n ? r.Authorization = `Bearer ${n}` : n && (r.Authorization = n), e.supplier && (r.supplier = e.supplier), r;
}
async function Ka(e, t) {
  const n = await fetch(e, t), r = await n.json();
  if (!n.ok)
    throw new Error(
      typeof r == "object" && r !== null && "message" in r && typeof r.message == "string" && r.message || "请求失败"
    );
  return typeof r == "object" && r !== null && "code" in r && "body" in r ? r.body : r;
}
function U_(e) {
  return e.filter(
    (t) => t.role === "user" || t.role === "assistant"
  ).map((t) => ({
    id: String(t.id),
    role: t.role,
    parts: [{ type: "text", text: t.content }]
  }));
}
function H_(e) {
  if (!e || typeof e != "object") return "状态更新";
  const t = e;
  return t.tool ? `调用工具：${t.tool}` : t.chunks != null ? `${t.message || "状态更新"} · ${t.chunks} 个片段` : t.message || t.stage || "状态更新";
}
function q_(e) {
  if (!e) return "-";
  const t = new Date(e);
  if (Number.isNaN(t.getTime())) return "-";
  const n = String(t.getMonth() + 1).padStart(2, "0"), r = String(t.getDate()).padStart(2, "0"), u = String(t.getHours()).padStart(2, "0"), o = String(t.getMinutes()).padStart(2, "0");
  return `${n}-${r} ${u}:${o}`;
}
const J_ = 20;
function W_(e) {
  const t = e.getParticipantId(), n = Ve(), r = Ve(""), u = Ve([]), o = Ve(""), s = Ve(!1), i = Ve(!1), a = Ve(!1), c = Ve(Vo()), f = Yr(
    e.createSession(c.value, t)
  );
  let l = null;
  const d = Fe(() => f.value.messages), p = Fe(() => f.value.status), m = Fe(() => f.value.error), v = Fe(
    () => p.value === "submitted" || p.value === "streaming"
  ), _ = Fe(
    () => p.value === "ready" && !i.value && r.value.trim().length > 0
  ), A = Fe(() => m.value?.message || ""), E = Fe(() => a.value ? "正在中断" : p.value === "submitted" ? "等待响应" : p.value === "streaming" ? "生成中" : p.value === "error" ? "出错" : "就绪"), h = Fe(
    () => i.value ? "加载历史消息" : E.value
  ), w = Fe(() => {
    const q = d.value[d.value.length - 1];
    return q ? String(q.id) : "";
  });
  Ot(() => {
    g();
  });
  async function g() {
    s.value = !0;
    try {
      const q = await e.pageSessions({
        page: 1,
        pageSize: J_,
        channel: e.channel,
        conversationType: e.conversationType,
        userId: t
      });
      u.value = q.list;
    } finally {
      s.value = !1;
    }
  }
  async function y(q) {
    v.value && await k(), o.value = String(q.id), c.value = q.conversationId || Vo();
    const H = e.createSession(c.value, t);
    i.value = !0;
    try {
      const N = await e.listMessages(q.id);
      H.messages = e.toUiMessages(N), f.value = H, r.value = "";
    } finally {
      i.value = !1;
    }
  }
  async function C() {
    const q = r.value.trim();
    if (!(!q || p.value !== "ready" || i.value)) {
      r.value = "";
      try {
        await f.value.sendMessage({ text: q });
      } finally {
        await g(), B();
      }
    }
  }
  async function k() {
    if (v.value) {
      if (l) {
        await l;
        return;
      }
      a.value = !0, l = f.value.stop().finally(() => {
        a.value = !1, l = null;
      }), await l;
    }
  }
  function Z() {
    v.value && k(), f.value.messages = [], f.value.clearError();
  }
  async function W() {
    v.value && await k(), o.value = "", c.value = Vo(), f.value = e.createSession(c.value, t), r.value = "";
  }
  function K() {
    f.value.clearError();
  }
  function B() {
    const q = u.value.find(
      (H) => H.conversationId === c.value
    );
    o.value = q ? String(q.id) : o.value;
  }
  async function G() {
    await un(), n.value && (n.value.scrollTop = n.value.scrollHeight);
  }
  return Pe(d, G, { deep: !0 }), {
    input: r,
    sessions: u,
    selectedSessionId: o,
    historyLoading: s,
    messageLoading: i,
    stopping: a,
    messages: d,
    status: p,
    error: m,
    busy: v,
    canSend: _,
    errorMessage: A,
    statusText: E,
    currentStateText: h,
    autoScrollKey: w,
    messagePaneRef: n,
    loadSessions: g,
    selectSession: y,
    send: C,
    stopChat: k,
    clearChat: Z,
    startNewSession: W,
    clearError: K,
    scrollToBottom: G
  };
}
function Vo() {
  return typeof crypto < "u" && "randomUUID" in crypto ? crypto.randomUUID() : `chat-demo-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
const G_ = ["value", "disabled"], K_ = { class: "chat-demo-composer-footer" }, Y_ = { class: "chat-demo-state" }, X_ = ["disabled"], Q_ = /* @__PURE__ */ It({
  __name: "chat-composer",
  props: {
    modelValue: {},
    busy: { type: Boolean },
    canSend: { type: Boolean },
    messageLoading: { type: Boolean },
    stopping: { type: Boolean },
    stateText: {}
  },
  emits: ["update:modelValue", "send", "stop"],
  setup(e, { emit: t }) {
    const n = e, r = t, u = Fe(() => n.busy ? n.stopping || n.messageLoading : !n.canSend), o = Fe(() => n.stopping ? "中断中" : n.busy ? "停止回答" : "发送");
    function s() {
      if (n.busy) {
        r("stop");
        return;
      }
      r("send");
    }
    function i(c) {
      r("update:modelValue", c.target.value);
    }
    function a(c) {
      c.key !== "Enter" || c.shiftKey || (c.preventDefault(), s());
    }
    return (c, f) => (Me(), Ue("form", {
      class: "chat-demo-composer",
      onSubmit: fm(s, ["prevent"])
    }, [
      ye("textarea", {
        value: e.modelValue,
        class: "chat-demo-input",
        disabled: e.busy || e.messageLoading,
        placeholder: "输入问题，Enter 发送，Shift+Enter 换行",
        rows: "3",
        onInput: i,
        onKeydown: a
      }, null, 40, G_),
      ye("div", K_, [
        ye("span", Y_, it(e.stateText), 1),
        ye("button", {
          type: "submit",
          class: fr(["chat-demo-submit", { "is-danger": e.busy }]),
          disabled: u.value
        }, it(o.value), 11, X_)
      ])
    ], 32));
  }
}), mr = (e, t) => {
  const n = e.__vccOpts || e;
  for (const [r, u] of t)
    n[r] = u;
  return n;
}, ey = /* @__PURE__ */ mr(Q_, [["__scopeId", "data-v-ef5427db"]]), ty = { class: "chat-demo-history" }, ny = { class: "chat-demo-history-head" }, ry = ["disabled"], uy = { class: "chat-demo-history-list" }, oy = ["onClick"], sy = { class: "chat-demo-history-title" }, iy = { class: "chat-demo-history-meta" }, ay = {
  key: 0,
  class: "chat-demo-history-empty"
}, cy = /* @__PURE__ */ It({
  __name: "chat-history-sidebar",
  props: {
    sessions: {},
    selectedId: {},
    loading: { type: Boolean },
    title: {},
    timeFormatter: { type: Function }
  },
  emits: ["refresh", "select"],
  setup(e, { emit: t }) {
    const n = e, r = t;
    function u(s) {
      return n.timeFormatter ? n.timeFormatter(s) : s ? o(s) : "-";
    }
    function o(s) {
      const i = new Date(s);
      if (Number.isNaN(i.getTime())) return "-";
      const a = String(i.getMonth() + 1).padStart(2, "0"), c = String(i.getDate()).padStart(2, "0"), f = String(i.getHours()).padStart(2, "0"), l = String(i.getMinutes()).padStart(2, "0");
      return `${a}-${c} ${f}:${l}`;
    }
    return (s, i) => (Me(), Ue("aside", ty, [
      ye("div", ny, [
        ye("div", null, [
          ye("h2", null, it(e.title), 1),
          ye("p", null, it(e.loading ? "加载中" : `${e.sessions.length} 个会话`), 1)
        ]),
        ye("button", {
          type: "button",
          class: "chat-demo-refresh",
          disabled: e.loading,
          onClick: i[0] || (i[0] = (a) => r("refresh"))
        }, " 刷新 ", 8, ry)
      ]),
      ye("div", uy, [
        (Me(!0), Ue(tt, null, as(e.sessions, (a) => (Me(), Ue("button", {
          key: String(a.id),
          type: "button",
          class: fr(["chat-demo-history-item", { active: String(a.id) === e.selectedId }]),
          onClick: (c) => r("select", a)
        }, [
          ye("span", sy, it(a.latestMessage?.content || a.conversationId || "未命名会话"), 1),
          ye("span", iy, it(a.messageCount) + " 条 · " + it(u(a.lastActiveAt)), 1)
        ], 10, oy))), 128)),
        !e.loading && e.sessions.length === 0 ? (Me(), Ue("div", ay, " 暂无历史会话 ")) : nr("", !0)
      ])
    ]));
  }
}), ly = /* @__PURE__ */ mr(cy, [["__scopeId", "data-v-aed0eaf0"]]), fy = (e) => {
  const t = typeof e;
  return t !== "function" && t !== "object" || e === null;
}, dy = (e) => {
  const t = e.flags === "" ? void 0 : e.flags;
  return new RegExp(e.source, t);
}, Dr = (e, t = /* @__PURE__ */ new WeakMap()) => {
  if (e === null || fy(e))
    return e;
  if (t.has(e))
    return t.get(e);
  if (e instanceof RegExp)
    return dy(e);
  if (e instanceof Date)
    return new Date(e.getTime());
  if (e instanceof Function)
    return e;
  if (e instanceof Map) {
    const r = /* @__PURE__ */ new Map();
    return t.set(e, r), e.forEach((u, o) => {
      r.set(o, Dr(u, t));
    }), r;
  }
  if (e instanceof Set) {
    const r = /* @__PURE__ */ new Set();
    t.set(e, r);
    for (const u of e)
      r.add(Dr(u, t));
    return r;
  }
  if (Array.isArray(e)) {
    const r = [];
    return t.set(e, r), e.forEach((u) => {
      r.push(Dr(u, t));
    }), r;
  }
  const n = {};
  t.set(e, n);
  for (const r in e)
    Object.prototype.hasOwnProperty.call(e, r) && (n[r] = Dr(e[r], t));
  return n;
}, py = (e, t = 200) => {
  let n = 0;
  return (...r) => new Promise((u) => {
    n && (clearTimeout(n), u("cancel")), n = window.setTimeout(() => {
      e.apply(void 0, r), n = 0, u("done");
    }, t);
  });
}, Cs = () => `${Date.now().toString(36)}${Math.random().toString(36).substring(2)}`, to = (e) => e !== null && typeof e == "object" && !Array.isArray(e), hy = /* @__PURE__ */ new Set(["__proto__", "constructor", "prototype"]), my = (e) => !hy.has(e), pi = (e, t, n = {}) => {
  if (Array.isArray(e) && Array.isArray(t))
    return As(e, t, n);
  const { excludeKeys: r } = n, u = e, o = t;
  for (const s of Object.keys(o)) {
    if (!my(s))
      continue;
    const i = o[s], a = u[s];
    r && r(s) ? u[s] = i : Array.isArray(i) && Array.isArray(a) ? u[s] = As(a, i, n) : to(i) && to(a) ? u[s] = pi(
      a,
      i,
      n
    ) : u[s] = i;
  }
  return e;
}, As = (e, t, n) => {
  const r = e.slice();
  return t.forEach((u, o) => {
    const s = r[o];
    Array.isArray(u) && Array.isArray(s) ? r[o] = As(s, u, n) : to(u) && to(s) ? r[o] = pi(
      s,
      u,
      n
    ) : r[o] = u;
  }), r;
}, U = "md-editor", xe = "https://unpkg.com", gy = `${xe}/@highlightjs/cdn-assets@11.11.1/highlight.min.js`, Ya = {
  main: `${xe}/prettier@3.8.1/standalone.js`,
  markdown: `${xe}/prettier@3.8.1/plugins/markdown.js`
}, by = {
  css: `${xe}/cropperjs@1.6.2/dist/cropper.min.css`,
  js: `${xe}/cropperjs@1.6.2/dist/cropper.min.js`
}, vy = `${xe}/screenfull@5.2.0/dist/screenfull.js`, _y = `${xe}/mermaid@11.12.3/dist/mermaid.min.js`, yy = {
  js: `${xe}/katex@0.16.33/dist/katex.min.js`,
  css: `${xe}/katex@0.16.33/dist/katex.min.css`
}, Ds = {
  a11y: {
    light: `${xe}/@highlightjs/cdn-assets@11.11.1/styles/a11y-light.min.css`,
    dark: `${xe}/@highlightjs/cdn-assets@11.11.1/styles/a11y-dark.min.css`
  },
  atom: {
    light: `${xe}/@highlightjs/cdn-assets@11.11.1/styles/atom-one-light.min.css`,
    dark: `${xe}/@highlightjs/cdn-assets@11.11.1/styles/atom-one-dark.min.css`
  },
  github: {
    light: `${xe}/@highlightjs/cdn-assets@11.11.1/styles/github.min.css`,
    dark: `${xe}/@highlightjs/cdn-assets@11.11.1/styles/github-dark.min.css`
  },
  gradient: {
    light: `${xe}/@highlightjs/cdn-assets@11.11.1/styles/gradient-light.min.css`,
    dark: `${xe}/@highlightjs/cdn-assets@11.11.1/styles/gradient-dark.min.css`
  },
  kimbie: {
    light: `${xe}/@highlightjs/cdn-assets@11.11.1/styles/kimbie-light.min.css`,
    dark: `${xe}/@highlightjs/cdn-assets@11.11.1/styles/kimbie-dark.min.css`
  },
  paraiso: {
    light: `${xe}/@highlightjs/cdn-assets@11.11.1/styles/paraiso-light.min.css`,
    dark: `${xe}/@highlightjs/cdn-assets@11.11.1/styles/paraiso-dark.min.css`
  },
  qtcreator: {
    light: `${xe}/@highlightjs/cdn-assets@11.11.1/styles/qtcreator-light.min.css`,
    dark: `${xe}/@highlightjs/cdn-assets@11.11.1/styles/qtcreator-dark.min.css`
  },
  stackoverflow: {
    light: `${xe}/@highlightjs/cdn-assets@11.11.1/styles/stackoverflow-light.min.css`,
    dark: `${xe}/@highlightjs/cdn-assets@11.11.1/styles/stackoverflow-dark.min.css`
  }
}, xy = `${xe}/echarts@6.0.0/dist/echarts.min.js`, Xa = {
  "zh-CN": {
    toolbarTips: {
      bold: "加粗",
      underline: "下划线",
      italic: "斜体",
      strikeThrough: "删除线",
      title: "标题",
      sub: "下标",
      sup: "上标",
      quote: "引用",
      unorderedList: "无序列表",
      orderedList: "有序列表",
      task: "任务列表",
      codeRow: "行内代码",
      code: "块级代码",
      link: "链接",
      image: "图片",
      table: "表格",
      mermaid: "mermaid图",
      katex: "katex公式",
      revoke: "后退",
      next: "前进",
      save: "保存",
      prettier: "美化",
      pageFullscreen: "浏览器全屏",
      fullscreen: "屏幕全屏",
      preview: "预览",
      previewOnly: "仅预览",
      htmlPreview: "html代码预览",
      catalog: "目录",
      github: "源码地址"
    },
    titleItem: {
      h1: "一级标题",
      h2: "二级标题",
      h3: "三级标题",
      h4: "四级标题",
      h5: "五级标题",
      h6: "六级标题"
    },
    imgTitleItem: {
      link: "添加链接",
      upload: "上传图片",
      clip2upload: "裁剪上传"
    },
    linkModalTips: {
      linkTitle: "添加链接",
      imageTitle: "添加图片",
      descLabel: "链接描述：",
      descLabelPlaceHolder: "请输入描述...",
      urlLabel: "链接地址：",
      urlLabelPlaceHolder: "请输入链接...",
      buttonOK: "确定"
    },
    clipModalTips: {
      title: "裁剪图片上传",
      buttonUpload: "上传"
    },
    copyCode: {
      text: "复制代码",
      successTips: "已复制！",
      failTips: "复制失败！"
    },
    mermaid: {
      flow: "流程图",
      sequence: "时序图",
      gantt: "甘特图",
      class: "类图",
      state: "状态图",
      pie: "饼图",
      relationship: "关系图",
      journey: "旅程图"
    },
    katex: {
      inline: "行内公式",
      block: "块级公式"
    },
    footer: {
      markdownTotal: "字数",
      scrollAuto: "同步滚动"
    }
  },
  "en-US": {
    toolbarTips: {
      bold: "bold",
      underline: "underline",
      italic: "italic",
      strikeThrough: "strikeThrough",
      title: "title",
      sub: "subscript",
      sup: "superscript",
      quote: "quote",
      unorderedList: "unordered list",
      orderedList: "ordered list",
      task: "task list",
      codeRow: "inline code",
      code: "block-level code",
      link: "link",
      image: "image",
      table: "table",
      mermaid: "mermaid",
      katex: "formula",
      revoke: "revoke",
      next: "undo revoke",
      save: "save",
      prettier: "prettier",
      pageFullscreen: "fullscreen in page",
      fullscreen: "fullscreen",
      preview: "preview",
      previewOnly: "preview only",
      htmlPreview: "html preview",
      catalog: "catalog",
      github: "source code"
    },
    titleItem: {
      h1: "Lv1 Heading",
      h2: "Lv2 Heading",
      h3: "Lv3 Heading",
      h4: "Lv4 Heading",
      h5: "Lv5 Heading",
      h6: "Lv6 Heading"
    },
    imgTitleItem: {
      link: "Add Image Link",
      upload: "Upload Images",
      clip2upload: "Crop And Upload"
    },
    linkModalTips: {
      linkTitle: "Add Link",
      imageTitle: "Add Image",
      descLabel: "Desc:",
      descLabelPlaceHolder: "Enter a description...",
      urlLabel: "Link:",
      urlLabelPlaceHolder: "Enter a link...",
      buttonOK: "OK"
    },
    clipModalTips: {
      title: "Crop Image",
      buttonUpload: "Upload"
    },
    copyCode: {
      text: "Copy",
      successTips: "Copied!",
      failTips: "Copy failed!"
    },
    mermaid: {
      flow: "flow",
      sequence: "sequence",
      gantt: "gantt",
      class: "class",
      state: "state",
      pie: "pie",
      relationship: "relationship",
      journey: "journey"
    },
    katex: {
      inline: "inline",
      block: "block"
    },
    footer: {
      markdownTotal: "Character Count",
      scrollAuto: "Scroll Auto"
    }
  }
}, Dt = {
  editorExtensions: {
    highlight: {
      js: gy,
      css: Ds
    },
    prettier: {
      standaloneJs: Ya.main,
      parserMarkdownJs: Ya.markdown
    },
    cropper: {
      ...by
    },
    screenfull: {
      js: vy
    },
    mermaid: {
      js: _y,
      enableZoom: !0
    },
    katex: {
      ...yy
    },
    echarts: {
      js: xy,
      parseOption: (e) => new Function(`return ${e}`)()
    }
  },
  editorExtensionsAttrs: {},
  editorConfig: {
    languageUserDefined: {},
    mermaidTemplate: {},
    renderDelay: 500,
    zIndex: 2e4
  },
  codeMirrorExtensions: (e) => e,
  markdownItConfig: () => {
  },
  markdownItPlugins: (e) => e,
  mermaidConfig: (e) => e,
  katexConfig: (e) => e,
  echartsConfig: (e) => e
}, Ey = ({
  instance: e,
  ctx: t,
  props: n = {}
}, r = "default") => {
  const u = e?.$slots[r] || t?.slots[r];
  return (u ? u(e) : "") || n[r];
}, ky = "buildFinished", Ss = "errorCatcher", Bo = "catalogChanged", wy = "pushCatalog", kd = "rerender", Cy = "taskStateChanged";
class Ay {
  // 事件池
  pools = {};
  // 移除事件监听
  remove(t, n, r) {
    const u = this.pools[t] && this.pools[t][n];
    u && (this.pools[t][n] = u.filter((o) => o !== r));
  }
  // 清空全部事件，由于单一实例，多次注册会被共享内容
  clear(t) {
    this.pools[t] = {};
  }
  // 注册事件监听
  on(t, n) {
    return this.pools[t] || (this.pools[t] = {}), this.pools[t][n.name] || (this.pools[t][n.name] = []), this.pools[t][n.name].push(n.callback), this.pools[t][n.name].includes(n.callback);
  }
  // 触发事件
  emit(t, n, ...r) {
    this.pools[t] || (this.pools[t] = {});
    const u = this.pools[t][n];
    u && u.forEach((o) => {
      try {
        o(...r);
      } catch (s) {
        console.error(`${n} monitor event exception！`, s);
      }
    });
  }
}
const bt = new Ay(), Dy = (e, t) => {
  if (!e)
    return e;
  const n = t.split(`
`), r = ['<span rn-wrapper aria-hidden="true">'];
  return n.forEach(() => {
    r.push("<span></span>");
  }), r.push("</span>"), `<span class="${U}-code-block">${e}</span>${r.join("")}`;
};
async function wd(e) {
  if (typeof e == "string") {
    if (window.isSecureContext && navigator.clipboard)
      return await navigator.clipboard.writeText(e);
    {
      const t = document.createElement("textarea");
      let n = !1;
      if (t.value = e, t.style.position = "fixed", t.style.opacity = 0, t.style.zIndex = "-10000", t.style.top = "-10000", document.body.appendChild(t), t.select(), n = document.execCommand("copy"), document.body.removeChild(t), n)
        return;
      throw new Error('Failed to copy content via "execCommand"!');
    }
  }
}
const Sy = {
  copy: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy ${U}-icon"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
  "collapse-tips": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-chevron-left ${U}-icon"><circle cx="12" cy="12" r="10"/><path d="m14 16-4-4 4-4"/></svg>`,
  pin: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pin ${U}-icon"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>`,
  "pin-off": `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pin-off ${U}-icon"><path d="M12 17v5"/><path d="M15 9.34V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H7.89"/><path d="m2 2 20 20"/><path d="M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h11"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check ${U}-icon"><path d="M20 6 9 17l-5-5"/></svg>`
}, Zt = (e, t) => typeof t[e] == "string" ? t[e] : Sy[e], xn = (e, t, n = "") => {
  const r = document.getElementById(t.id);
  if (r)
    n !== "" && (Reflect.get(window, n) ? t.onload?.call(r, new Event("load")) : t.onload && r.addEventListener("load", t.onload));
  else {
    const u = { ...t };
    u.onload = null;
    const o = Ny(e, u);
    t.onload && o.addEventListener("load", t.onload), document.head.appendChild(o);
  }
}, $y = (e, t) => {
  document.getElementById(t.id)?.remove(), xn(e, t);
}, Ny = (e, t) => {
  const n = document.createElement(e);
  return Object.keys(t).forEach((r) => {
    t[r] !== void 0 && (n[r] = t[r]);
  }), n;
}, Oy = (e, t) => {
  const n = /* @__PURE__ */ new Map();
  return e?.forEach((r) => {
    let u = r.querySelector(`.${U}-mermaid-action`);
    u ? u.querySelector(`.${U}-mermaid-copy`) || u.insertAdjacentHTML(
      "beforeend",
      `<span class="${U}-mermaid-copy">${Zt("copy", t.customIcon)}</span>`
    ) : (r.insertAdjacentHTML(
      "beforeend",
      `<div class="${U}-mermaid-action"><span class="${U}-mermaid-copy">${Zt("copy", t.customIcon)}</span></div>`
    ), u = r.querySelector(`.${U}-mermaid-action`));
    const o = u.querySelector(`.${U}-mermaid-copy`);
    let s = -1;
    const i = () => {
      clearTimeout(s), wd(r.dataset.content || "").then(() => {
        o.innerHTML = Zt("check", t.customIcon);
      }).catch(() => {
        o.innerHTML = Zt("copy", t.customIcon);
      }).finally(() => {
        s = window.setTimeout(() => {
          o.innerHTML = Zt("copy", t.customIcon);
        }, 1500);
      });
    };
    o.addEventListener("click", i), n.set(r, {
      removeClick: () => {
        o.removeEventListener("click", i);
      }
    });
  }), () => {
    n.forEach(({ removeClick: r }) => {
      r?.();
    }), n.clear();
  };
}, Iy = /* @__PURE__ */ (() => {
  const e = (t) => {
    if (!t)
      return () => {
      };
    const n = t.firstChild;
    let r = 1, u = 0, o = 0, s = !1, i, a, c, f = 1;
    const l = () => {
      n.style.transform = `translate(${u}px, ${o}px) scale(${r})`;
    }, d = (w) => {
      w.touches.length === 1 ? (s = !0, i = w.touches[0].clientX - u, a = w.touches[0].clientY - o) : w.touches.length === 2 && (c = Math.hypot(
        w.touches[0].clientX - w.touches[1].clientX,
        w.touches[0].clientY - w.touches[1].clientY
      ), f = r);
    }, p = (w) => {
      if (w.preventDefault(), s && w.touches.length === 1)
        u = w.touches[0].clientX - i, o = w.touches[0].clientY - a, l();
      else if (w.touches.length === 2) {
        const g = Math.hypot(
          w.touches[0].clientX - w.touches[1].clientX,
          w.touches[0].clientY - w.touches[1].clientY
        ) / c, y = r;
        r = f * (1 + (g - 1));
        const C = (w.touches[0].clientX + w.touches[1].clientX) / 2, k = (w.touches[0].clientY + w.touches[1].clientY) / 2, Z = n.getBoundingClientRect(), W = (C - Z.left) / y, K = (k - Z.top) / y;
        u -= W * (r - y), o -= K * (r - y), l();
      }
    }, m = () => {
      s = !1;
    }, v = (w) => {
      w.preventDefault();
      const g = 0.02, y = r;
      w.deltaY < 0 ? r += g : r = Math.max(0.1, r - g);
      const C = n.getBoundingClientRect(), k = w.clientX - C.left, Z = w.clientY - C.top;
      u -= k / y * (r - y), o -= Z / y * (r - y), l();
    }, _ = (w) => {
      s = !0, i = w.clientX - u, a = w.clientY - o;
    }, A = (w) => {
      s && (u = w.clientX - i, o = w.clientY - a, l());
    }, E = () => {
      s = !1;
    }, h = () => {
      s = !1;
    };
    return t.addEventListener("touchstart", d, { passive: !1 }), t.addEventListener("touchmove", p, { passive: !1 }), t.addEventListener("touchend", m), t.addEventListener("wheel", v, { passive: !1 }), t.addEventListener("mousedown", _), t.addEventListener("mousemove", A), t.addEventListener("mouseup", E), t.addEventListener("mouseleave", h), () => {
      t.removeEventListener("touchstart", d), t.removeEventListener("touchmove", p), t.removeEventListener("touchend", m), t.removeEventListener("wheel", v), t.removeEventListener("mousedown", _), t.removeEventListener("mousemove", A), t.removeEventListener("mouseup", E), t.removeEventListener("mouseleave", h);
    };
  };
  return (t, n) => {
    const r = /* @__PURE__ */ new Map();
    return t?.forEach((u) => {
      let o = u.querySelector(`.${U}-mermaid-action`);
      o ? o.querySelector(`.${U}-mermaid-zoom`) || o.insertAdjacentHTML(
        "beforeend",
        `<span class="${U}-mermaid-zoom">${Zt("pin-off", n.customIcon)}</span>`
      ) : (u.insertAdjacentHTML(
        "beforeend",
        `<div class="${U}-mermaid-action"><span class="${U}-mermaid-zoom">${Zt("pin-off", n.customIcon)}</span></div>`
      ), o = u.querySelector(`.${U}-mermaid-action`));
      const s = o.querySelector(`.${U}-mermaid-zoom`), i = () => {
        const a = r.get(u);
        if (a?.removeEvent)
          a.removeEvent(), u.removeAttribute("data-grab"), r.set(u, { removeClick: a.removeClick }), s.innerHTML = Zt("pin-off", n.customIcon);
        else {
          const c = e(u);
          u.setAttribute("data-grab", ""), r.set(u, { removeEvent: c, removeClick: a?.removeClick }), s.innerHTML = Zt("pin", n.customIcon);
        }
      };
      s.addEventListener("click", i), r.set(u, {
        removeClick: () => s.removeEventListener("click", i)
      });
    }), () => {
      r.forEach(({ removeEvent: u, removeClick: o }) => {
        u?.(), o?.();
      }), r.clear();
    };
  };
})(), Qa = {};
function Ty(e) {
  let t = Qa[e];
  if (t)
    return t;
  t = Qa[e] = [];
  for (let n = 0; n < 128; n++) {
    const r = String.fromCharCode(n);
    t.push(r);
  }
  for (let n = 0; n < e.length; n++) {
    const r = e.charCodeAt(n);
    t[r] = "%" + ("0" + r.toString(16).toUpperCase()).slice(-2);
  }
  return t;
}
function cr(e, t) {
  typeof t != "string" && (t = cr.defaultChars);
  const n = Ty(t);
  return e.replace(/(%[a-f0-9]{2})+/gi, function(r) {
    let u = "";
    for (let o = 0, s = r.length; o < s; o += 3) {
      const i = parseInt(r.slice(o + 1, o + 3), 16);
      if (i < 128) {
        u += n[i];
        continue;
      }
      if ((i & 224) === 192 && o + 3 < s) {
        const a = parseInt(r.slice(o + 4, o + 6), 16);
        if ((a & 192) === 128) {
          const c = i << 6 & 1984 | a & 63;
          c < 128 ? u += "��" : u += String.fromCharCode(c), o += 3;
          continue;
        }
      }
      if ((i & 240) === 224 && o + 6 < s) {
        const a = parseInt(r.slice(o + 4, o + 6), 16), c = parseInt(r.slice(o + 7, o + 9), 16);
        if ((a & 192) === 128 && (c & 192) === 128) {
          const f = i << 12 & 61440 | a << 6 & 4032 | c & 63;
          f < 2048 || f >= 55296 && f <= 57343 ? u += "���" : u += String.fromCharCode(f), o += 6;
          continue;
        }
      }
      if ((i & 248) === 240 && o + 9 < s) {
        const a = parseInt(r.slice(o + 4, o + 6), 16), c = parseInt(r.slice(o + 7, o + 9), 16), f = parseInt(r.slice(o + 10, o + 12), 16);
        if ((a & 192) === 128 && (c & 192) === 128 && (f & 192) === 128) {
          let l = i << 18 & 1835008 | a << 12 & 258048 | c << 6 & 4032 | f & 63;
          l < 65536 || l > 1114111 ? u += "����" : (l -= 65536, u += String.fromCharCode(55296 + (l >> 10), 56320 + (l & 1023))), o += 9;
          continue;
        }
      }
      u += "�";
    }
    return u;
  });
}
cr.defaultChars = ";/?:@&=+$,#";
cr.componentChars = "";
const ec = {};
function Fy(e) {
  let t = ec[e];
  if (t)
    return t;
  t = ec[e] = [];
  for (let n = 0; n < 128; n++) {
    const r = String.fromCharCode(n);
    /^[0-9a-z]$/i.test(r) ? t.push(r) : t.push("%" + ("0" + n.toString(16).toUpperCase()).slice(-2));
  }
  for (let n = 0; n < e.length; n++)
    t[e.charCodeAt(n)] = e[n];
  return t;
}
function su(e, t, n) {
  typeof t != "string" && (n = t, t = su.defaultChars), typeof n > "u" && (n = !0);
  const r = Fy(t);
  let u = "";
  for (let o = 0, s = e.length; o < s; o++) {
    const i = e.charCodeAt(o);
    if (n && i === 37 && o + 2 < s && /^[0-9a-f]{2}$/i.test(e.slice(o + 1, o + 3))) {
      u += e.slice(o, o + 3), o += 2;
      continue;
    }
    if (i < 128) {
      u += r[i];
      continue;
    }
    if (i >= 55296 && i <= 57343) {
      if (i >= 55296 && i <= 56319 && o + 1 < s) {
        const a = e.charCodeAt(o + 1);
        if (a >= 56320 && a <= 57343) {
          u += encodeURIComponent(e[o] + e[o + 1]), o++;
          continue;
        }
      }
      u += "%EF%BF%BD";
      continue;
    }
    u += encodeURIComponent(e[o]);
  }
  return u;
}
su.defaultChars = ";/?:@&=+$,-_.!~*'()#";
su.componentChars = "-_.!~*'()";
function hi(e) {
  let t = "";
  return t += e.protocol || "", t += e.slashes ? "//" : "", t += e.auth ? e.auth + "@" : "", e.hostname && e.hostname.indexOf(":") !== -1 ? t += "[" + e.hostname + "]" : t += e.hostname || "", t += e.port ? ":" + e.port : "", t += e.pathname || "", t += e.search || "", t += e.hash || "", t;
}
function no() {
  this.protocol = null, this.slashes = null, this.auth = null, this.port = null, this.hostname = null, this.hash = null, this.search = null, this.pathname = null;
}
const zy = /^([a-z0-9.+-]+:)/i, My = /:[0-9]*$/, Py = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/, Ry = ["<", ">", '"', "`", " ", "\r", `
`, "	"], jy = ["{", "}", "|", "\\", "^", "`"].concat(Ry), Ly = ["'"].concat(jy), tc = ["%", "/", "?", ";", "#"].concat(Ly), nc = ["/", "?", "#"], Zy = 255, rc = /^[+a-z0-9A-Z_-]{0,63}$/, Vy = /^([+a-z0-9A-Z_-]{0,63})(.*)$/, uc = {
  javascript: !0,
  "javascript:": !0
}, oc = {
  http: !0,
  https: !0,
  ftp: !0,
  gopher: !0,
  file: !0,
  "http:": !0,
  "https:": !0,
  "ftp:": !0,
  "gopher:": !0,
  "file:": !0
};
function mi(e, t) {
  if (e && e instanceof no) return e;
  const n = new no();
  return n.parse(e, t), n;
}
no.prototype.parse = function(e, t) {
  let n, r, u, o = e;
  if (o = o.trim(), !t && e.split("#").length === 1) {
    const c = Py.exec(o);
    if (c)
      return this.pathname = c[1], c[2] && (this.search = c[2]), this;
  }
  let s = zy.exec(o);
  if (s && (s = s[0], n = s.toLowerCase(), this.protocol = s, o = o.substr(s.length)), (t || s || o.match(/^\/\/[^@\/]+@[^@\/]+/)) && (u = o.substr(0, 2) === "//", u && !(s && uc[s]) && (o = o.substr(2), this.slashes = !0)), !uc[s] && (u || s && !oc[s])) {
    let c = -1;
    for (let m = 0; m < nc.length; m++)
      r = o.indexOf(nc[m]), r !== -1 && (c === -1 || r < c) && (c = r);
    let f, l;
    c === -1 ? l = o.lastIndexOf("@") : l = o.lastIndexOf("@", c), l !== -1 && (f = o.slice(0, l), o = o.slice(l + 1), this.auth = f), c = -1;
    for (let m = 0; m < tc.length; m++)
      r = o.indexOf(tc[m]), r !== -1 && (c === -1 || r < c) && (c = r);
    c === -1 && (c = o.length), o[c - 1] === ":" && c--;
    const d = o.slice(0, c);
    o = o.slice(c), this.parseHost(d), this.hostname = this.hostname || "";
    const p = this.hostname[0] === "[" && this.hostname[this.hostname.length - 1] === "]";
    if (!p) {
      const m = this.hostname.split(/\./);
      for (let v = 0, _ = m.length; v < _; v++) {
        const A = m[v];
        if (A && !A.match(rc)) {
          let E = "";
          for (let h = 0, w = A.length; h < w; h++)
            A.charCodeAt(h) > 127 ? E += "x" : E += A[h];
          if (!E.match(rc)) {
            const h = m.slice(0, v), w = m.slice(v + 1), g = A.match(Vy);
            g && (h.push(g[1]), w.unshift(g[2])), w.length && (o = w.join(".") + o), this.hostname = h.join(".");
            break;
          }
        }
      }
    }
    this.hostname.length > Zy && (this.hostname = ""), p && (this.hostname = this.hostname.substr(1, this.hostname.length - 2));
  }
  const i = o.indexOf("#");
  i !== -1 && (this.hash = o.substr(i), o = o.slice(0, i));
  const a = o.indexOf("?");
  return a !== -1 && (this.search = o.substr(a), o = o.slice(0, a)), o && (this.pathname = o), oc[n] && this.hostname && !this.pathname && (this.pathname = ""), this;
};
no.prototype.parseHost = function(e) {
  let t = My.exec(e);
  t && (t = t[0], t !== ":" && (this.port = t.substr(1)), e = e.substr(0, e.length - t.length)), e && (this.hostname = e);
};
const By = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  decode: cr,
  encode: su,
  format: hi,
  parse: mi
}, Symbol.toStringTag, { value: "Module" })), Cd = /[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, Ad = /[\0-\x1F\x7F-\x9F]/, Uy = /[\xAD\u0600-\u0605\u061C\u06DD\u070F\u0890\u0891\u08E2\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]|\uD804[\uDCBD\uDCCD]|\uD80D[\uDC30-\uDC3F]|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]/, gi = /[!-#%-\*,-\/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061D-\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1B7D\u1B7E\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u2E52-\u2E5D\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDEAD\uDF55-\uDF59\uDF86-\uDF89]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDC4B-\uDC4F\uDC5A\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDEB9\uDF3C-\uDF3E]|\uD806[\uDC3B\uDD44-\uDD46\uDDE2\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2\uDF00-\uDF09]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8\uDF43-\uDF4F\uDFFF]|\uD809[\uDC70-\uDC74]|\uD80B[\uDFF1\uDFF2]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDE97-\uDE9A\uDFE2]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD83A[\uDD5E\uDD5F]/, Dd = /[\$\+<->\^`\|~\xA2-\xA6\xA8\xA9\xAC\xAE-\xB1\xB4\xB8\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0384\u0385\u03F6\u0482\u058D-\u058F\u0606-\u0608\u060B\u060E\u060F\u06DE\u06E9\u06FD\u06FE\u07F6\u07FE\u07FF\u0888\u09F2\u09F3\u09FA\u09FB\u0AF1\u0B70\u0BF3-\u0BFA\u0C7F\u0D4F\u0D79\u0E3F\u0F01-\u0F03\u0F13\u0F15-\u0F17\u0F1A-\u0F1F\u0F34\u0F36\u0F38\u0FBE-\u0FC5\u0FC7-\u0FCC\u0FCE\u0FCF\u0FD5-\u0FD8\u109E\u109F\u1390-\u1399\u166D\u17DB\u1940\u19DE-\u19FF\u1B61-\u1B6A\u1B74-\u1B7C\u1FBD\u1FBF-\u1FC1\u1FCD-\u1FCF\u1FDD-\u1FDF\u1FED-\u1FEF\u1FFD\u1FFE\u2044\u2052\u207A-\u207C\u208A-\u208C\u20A0-\u20C0\u2100\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F\u218A\u218B\u2190-\u2307\u230C-\u2328\u232B-\u2426\u2440-\u244A\u249C-\u24E9\u2500-\u2767\u2794-\u27C4\u27C7-\u27E5\u27F0-\u2982\u2999-\u29D7\u29DC-\u29FB\u29FE-\u2B73\u2B76-\u2B95\u2B97-\u2BFF\u2CE5-\u2CEA\u2E50\u2E51\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFF\u3004\u3012\u3013\u3020\u3036\u3037\u303E\u303F\u309B\u309C\u3190\u3191\u3196-\u319F\u31C0-\u31E3\u31EF\u3200-\u321E\u322A-\u3247\u3250\u3260-\u327F\u328A-\u32B0\u32C0-\u33FF\u4DC0-\u4DFF\uA490-\uA4C6\uA700-\uA716\uA720\uA721\uA789\uA78A\uA828-\uA82B\uA836-\uA839\uAA77-\uAA79\uAB5B\uAB6A\uAB6B\uFB29\uFBB2-\uFBC2\uFD40-\uFD4F\uFDCF\uFDFC-\uFDFF\uFE62\uFE64-\uFE66\uFE69\uFF04\uFF0B\uFF1C-\uFF1E\uFF3E\uFF40\uFF5C\uFF5E\uFFE0-\uFFE6\uFFE8-\uFFEE\uFFFC\uFFFD]|\uD800[\uDD37-\uDD3F\uDD79-\uDD89\uDD8C-\uDD8E\uDD90-\uDD9C\uDDA0\uDDD0-\uDDFC]|\uD802[\uDC77\uDC78\uDEC8]|\uD805\uDF3F|\uD807[\uDFD5-\uDFF1]|\uD81A[\uDF3C-\uDF3F\uDF45]|\uD82F\uDC9C|\uD833[\uDF50-\uDFC3]|\uD834[\uDC00-\uDCF5\uDD00-\uDD26\uDD29-\uDD64\uDD6A-\uDD6C\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDDEA\uDE00-\uDE41\uDE45\uDF00-\uDF56]|\uD835[\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3]|\uD836[\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85\uDE86]|\uD838[\uDD4F\uDEFF]|\uD83B[\uDCAC\uDCB0\uDD2E\uDEF0\uDEF1]|\uD83C[\uDC00-\uDC2B\uDC30-\uDC93\uDCA0-\uDCAE\uDCB1-\uDCBF\uDCC1-\uDCCF\uDCD1-\uDCF5\uDD0D-\uDDAD\uDDE6-\uDE02\uDE10-\uDE3B\uDE40-\uDE48\uDE50\uDE51\uDE60-\uDE65\uDF00-\uDFFF]|\uD83D[\uDC00-\uDED7\uDEDC-\uDEEC\uDEF0-\uDEFC\uDF00-\uDF76\uDF7B-\uDFD9\uDFE0-\uDFEB\uDFF0]|\uD83E[\uDC00-\uDC0B\uDC10-\uDC47\uDC50-\uDC59\uDC60-\uDC87\uDC90-\uDCAD\uDCB0\uDCB1\uDD00-\uDE53\uDE60-\uDE6D\uDE70-\uDE7C\uDE80-\uDE88\uDE90-\uDEBD\uDEBF-\uDEC5\uDECE-\uDEDB\uDEE0-\uDEE8\uDEF0-\uDEF8\uDF00-\uDF92\uDF94-\uDFCA]/, Sd = /[ \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/, Hy = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Any: Cd,
  Cc: Ad,
  Cf: Uy,
  P: gi,
  S: Dd,
  Z: Sd
}, Symbol.toStringTag, { value: "Module" })), qy = new Uint16Array(
  // prettier-ignore
  'ᵁ<Õıʊҝջאٵ۞ޢߖࠏ੊ઑඡ๭༉༦჊ረዡᐕᒝᓃᓟᔥ\0\0\0\0\0\0ᕫᛍᦍᰒᷝ὾⁠↰⊍⏀⏻⑂⠤⤒ⴈ⹈⿎〖㊺㘹㞬㣾㨨㩱㫠㬮ࠀEMabcfglmnoprstu\\bfms¦³¹ÈÏlig耻Æ䃆P耻&䀦cute耻Á䃁reve;䄂Āiyx}rc耻Â䃂;䐐r;쀀𝔄rave耻À䃀pha;䎑acr;䄀d;橓Āgp¡on;䄄f;쀀𝔸plyFunction;恡ing耻Å䃅Ācs¾Ãr;쀀𝒜ign;扔ilde耻Ã䃃ml耻Ä䃄ЀaceforsuåûþėĜĢħĪĀcrêòkslash;或Ŷöø;櫧ed;挆y;䐑ƀcrtąċĔause;戵noullis;愬a;䎒r;쀀𝔅pf;쀀𝔹eve;䋘còēmpeq;扎܀HOacdefhilorsuōőŖƀƞƢƵƷƺǜȕɳɸɾcy;䐧PY耻©䂩ƀcpyŝŢźute;䄆Ā;iŧŨ拒talDifferentialD;慅leys;愭ȀaeioƉƎƔƘron;䄌dil耻Ç䃇rc;䄈nint;戰ot;䄊ĀdnƧƭilla;䂸terDot;䂷òſi;䎧rcleȀDMPTǇǋǑǖot;抙inus;抖lus;投imes;抗oĀcsǢǸkwiseContourIntegral;戲eCurlyĀDQȃȏoubleQuote;思uote;怙ȀlnpuȞȨɇɕonĀ;eȥȦ户;橴ƀgitȯȶȺruent;扡nt;戯ourIntegral;戮ĀfrɌɎ;愂oduct;成nterClockwiseContourIntegral;戳oss;樯cr;쀀𝒞pĀ;Cʄʅ拓ap;才րDJSZacefiosʠʬʰʴʸˋ˗ˡ˦̳ҍĀ;oŹʥtrahd;椑cy;䐂cy;䐅cy;䐏ƀgrsʿ˄ˇger;怡r;憡hv;櫤Āayː˕ron;䄎;䐔lĀ;t˝˞戇a;䎔r;쀀𝔇Āaf˫̧Ācm˰̢riticalȀADGT̖̜̀̆cute;䂴oŴ̋̍;䋙bleAcute;䋝rave;䁠ilde;䋜ond;拄ferentialD;慆Ѱ̽\0\0\0͔͂\0Ѕf;쀀𝔻ƀ;DE͈͉͍䂨ot;惜qual;扐blèCDLRUVͣͲ΂ϏϢϸontourIntegraìȹoɴ͹\0\0ͻ»͉nArrow;懓Āeo·ΤftƀARTΐΖΡrrow;懐ightArrow;懔eåˊngĀLRΫτeftĀARγιrrow;柸ightArrow;柺ightArrow;柹ightĀATϘϞrrow;懒ee;抨pɁϩ\0\0ϯrrow;懑ownArrow;懕erticalBar;戥ǹABLRTaВЪаўѿͼrrowƀ;BUНОТ憓ar;椓pArrow;懵reve;䌑eft˒к\0ц\0ѐightVector;楐eeVector;楞ectorĀ;Bљњ憽ar;楖ightǔѧ\0ѱeeVector;楟ectorĀ;BѺѻ懁ar;楗eeĀ;A҆҇护rrow;憧ĀctҒҗr;쀀𝒟rok;䄐ࠀNTacdfglmopqstuxҽӀӄӋӞӢӧӮӵԡԯԶՒ՝ՠեG;䅊H耻Ð䃐cute耻É䃉ƀaiyӒӗӜron;䄚rc耻Ê䃊;䐭ot;䄖r;쀀𝔈rave耻È䃈ement;戈ĀapӺӾcr;䄒tyɓԆ\0\0ԒmallSquare;旻erySmallSquare;斫ĀgpԦԪon;䄘f;쀀𝔼silon;䎕uĀaiԼՉlĀ;TՂՃ橵ilde;扂librium;懌Āci՗՚r;愰m;橳a;䎗ml耻Ë䃋Āipժկsts;戃onentialE;慇ʀcfiosօֈ֍ֲ׌y;䐤r;쀀𝔉lledɓ֗\0\0֣mallSquare;旼erySmallSquare;斪Ͱֺ\0ֿ\0\0ׄf;쀀𝔽All;戀riertrf;愱cò׋؀JTabcdfgorstר׬ׯ׺؀ؒؖ؛؝أ٬ٲcy;䐃耻>䀾mmaĀ;d׷׸䎓;䏜reve;䄞ƀeiy؇،ؐdil;䄢rc;䄜;䐓ot;䄠r;쀀𝔊;拙pf;쀀𝔾eater̀EFGLSTصلَٖٛ٦qualĀ;Lؾؿ扥ess;招ullEqual;执reater;檢ess;扷lantEqual;橾ilde;扳cr;쀀𝒢;扫ЀAacfiosuڅڋږڛڞڪھۊRDcy;䐪Āctڐڔek;䋇;䁞irc;䄤r;愌lbertSpace;愋ǰگ\0ڲf;愍izontalLine;攀Āctۃۅòکrok;䄦mpńېۘownHumðįqual;扏܀EJOacdfgmnostuۺ۾܃܇܎ܚܞܡܨ݄ݸދޏޕcy;䐕lig;䄲cy;䐁cute耻Í䃍Āiyܓܘrc耻Î䃎;䐘ot;䄰r;愑rave耻Ì䃌ƀ;apܠܯܿĀcgܴܷr;䄪inaryI;慈lieóϝǴ݉\0ݢĀ;eݍݎ戬Āgrݓݘral;戫section;拂isibleĀCTݬݲomma;恣imes;恢ƀgptݿރވon;䄮f;쀀𝕀a;䎙cr;愐ilde;䄨ǫޚ\0ޞcy;䐆l耻Ï䃏ʀcfosuެ޷޼߂ߐĀiyޱ޵rc;䄴;䐙r;쀀𝔍pf;쀀𝕁ǣ߇\0ߌr;쀀𝒥rcy;䐈kcy;䐄΀HJacfosߤߨ߽߬߱ࠂࠈcy;䐥cy;䐌ppa;䎚Āey߶߻dil;䄶;䐚r;쀀𝔎pf;쀀𝕂cr;쀀𝒦րJTaceflmostࠥࠩࠬࡐࡣ঳সে্਷ੇcy;䐉耻<䀼ʀcmnpr࠷࠼ࡁࡄࡍute;䄹bda;䎛g;柪lacetrf;愒r;憞ƀaeyࡗ࡜ࡡron;䄽dil;䄻;䐛Āfsࡨ॰tԀACDFRTUVarࡾࢩࢱࣦ࣠ࣼयज़ΐ४Ānrࢃ࢏gleBracket;柨rowƀ;BR࢙࢚࢞憐ar;懤ightArrow;懆eiling;挈oǵࢷ\0ࣃbleBracket;柦nǔࣈ\0࣒eeVector;楡ectorĀ;Bࣛࣜ懃ar;楙loor;挊ightĀAV࣯ࣵrrow;憔ector;楎Āerँगeƀ;AVउऊऐ抣rrow;憤ector;楚iangleƀ;BEतथऩ抲ar;槏qual;抴pƀDTVषूौownVector;楑eeVector;楠ectorĀ;Bॖॗ憿ar;楘ectorĀ;B॥०憼ar;楒ightáΜs̀EFGLSTॾঋকঝঢভqualGreater;拚ullEqual;扦reater;扶ess;檡lantEqual;橽ilde;扲r;쀀𝔏Ā;eঽা拘ftarrow;懚idot;䄿ƀnpw৔ਖਛgȀLRlr৞৷ਂਐeftĀAR০৬rrow;柵ightArrow;柷ightArrow;柶eftĀarγਊightáοightáϊf;쀀𝕃erĀLRਢਬeftArrow;憙ightArrow;憘ƀchtਾੀੂòࡌ;憰rok;䅁;扪Ѐacefiosuਗ਼੝੠੷੼અઋ઎p;椅y;䐜Ādl੥੯iumSpace;恟lintrf;愳r;쀀𝔐nusPlus;戓pf;쀀𝕄cò੶;䎜ҀJacefostuણધભીଔଙඑ඗ඞcy;䐊cute;䅃ƀaey઴હાron;䅇dil;䅅;䐝ƀgswે૰଎ativeƀMTV૓૟૨ediumSpace;怋hiĀcn૦૘ë૙eryThiî૙tedĀGL૸ଆreaterGreateòٳessLesóੈLine;䀊r;쀀𝔑ȀBnptଢନଷ଺reak;恠BreakingSpace;䂠f;愕ڀ;CDEGHLNPRSTV୕ୖ୪୼஡௫ఄ౞಄ದ೘ൡඅ櫬Āou୛୤ngruent;扢pCap;扭oubleVerticalBar;戦ƀlqxஃஊ஛ement;戉ualĀ;Tஒஓ扠ilde;쀀≂̸ists;戄reater΀;EFGLSTஶஷ஽௉௓௘௥扯qual;扱ullEqual;쀀≧̸reater;쀀≫̸ess;批lantEqual;쀀⩾̸ilde;扵umpń௲௽ownHump;쀀≎̸qual;쀀≏̸eĀfsఊధtTriangleƀ;BEచఛడ拪ar;쀀⧏̸qual;括s̀;EGLSTవశ఼ౄోౘ扮qual;扰reater;扸ess;쀀≪̸lantEqual;쀀⩽̸ilde;扴estedĀGL౨౹reaterGreater;쀀⪢̸essLess;쀀⪡̸recedesƀ;ESಒಓಛ技qual;쀀⪯̸lantEqual;拠ĀeiಫಹverseElement;戌ghtTriangleƀ;BEೋೌ೒拫ar;쀀⧐̸qual;拭ĀquೝഌuareSuĀbp೨೹setĀ;E೰ೳ쀀⊏̸qual;拢ersetĀ;Eഃആ쀀⊐̸qual;拣ƀbcpഓതൎsetĀ;Eഛഞ쀀⊂⃒qual;抈ceedsȀ;ESTലള഻െ抁qual;쀀⪰̸lantEqual;拡ilde;쀀≿̸ersetĀ;E൘൛쀀⊃⃒qual;抉ildeȀ;EFT൮൯൵ൿ扁qual;扄ullEqual;扇ilde;扉erticalBar;戤cr;쀀𝒩ilde耻Ñ䃑;䎝܀Eacdfgmoprstuvලෂ෉෕ෛ෠෧෼ขภยา฿ไlig;䅒cute耻Ó䃓Āiy෎ීrc耻Ô䃔;䐞blac;䅐r;쀀𝔒rave耻Ò䃒ƀaei෮ෲ෶cr;䅌ga;䎩cron;䎟pf;쀀𝕆enCurlyĀDQฎบoubleQuote;怜uote;怘;橔Āclวฬr;쀀𝒪ash耻Ø䃘iŬื฼de耻Õ䃕es;樷ml耻Ö䃖erĀBP๋๠Āar๐๓r;怾acĀek๚๜;揞et;掴arenthesis;揜Ҁacfhilors๿ງຊຏຒດຝະ໼rtialD;戂y;䐟r;쀀𝔓i;䎦;䎠usMinus;䂱Āipຢອncareplanåڝf;愙Ȁ;eio຺ູ໠໤檻cedesȀ;EST່້໏໚扺qual;檯lantEqual;扼ilde;找me;怳Ādp໩໮uct;戏ortionĀ;aȥ໹l;戝Āci༁༆r;쀀𝒫;䎨ȀUfos༑༖༛༟OT耻"䀢r;쀀𝔔pf;愚cr;쀀𝒬؀BEacefhiorsu༾གྷཇའཱིྦྷྪྭ႖ႩႴႾarr;椐G耻®䂮ƀcnrཎནབute;䅔g;柫rĀ;tཛྷཝ憠l;椖ƀaeyཧཬཱron;䅘dil;䅖;䐠Ā;vླྀཹ愜erseĀEUྂྙĀlq྇ྎement;戋uilibrium;懋pEquilibrium;楯r»ཹo;䎡ghtЀACDFTUVa࿁࿫࿳ဢဨၛႇϘĀnr࿆࿒gleBracket;柩rowƀ;BL࿜࿝࿡憒ar;懥eftArrow;懄eiling;按oǵ࿹\0စbleBracket;柧nǔည\0နeeVector;楝ectorĀ;Bဝသ懂ar;楕loor;挋Āerိ၃eƀ;AVဵံြ抢rrow;憦ector;楛iangleƀ;BEၐၑၕ抳ar;槐qual;抵pƀDTVၣၮၸownVector;楏eeVector;楜ectorĀ;Bႂႃ憾ar;楔ectorĀ;B႑႒懀ar;楓Āpuႛ႞f;愝ndImplies;楰ightarrow;懛ĀchႹႼr;愛;憱leDelayed;槴ڀHOacfhimoqstuფჱჷჽᄙᄞᅑᅖᅡᅧᆵᆻᆿĀCcჩხHcy;䐩y;䐨FTcy;䐬cute;䅚ʀ;aeiyᄈᄉᄎᄓᄗ檼ron;䅠dil;䅞rc;䅜;䐡r;쀀𝔖ortȀDLRUᄪᄴᄾᅉownArrow»ОeftArrow»࢚ightArrow»࿝pArrow;憑gma;䎣allCircle;战pf;쀀𝕊ɲᅭ\0\0ᅰt;戚areȀ;ISUᅻᅼᆉᆯ斡ntersection;抓uĀbpᆏᆞsetĀ;Eᆗᆘ抏qual;抑ersetĀ;Eᆨᆩ抐qual;抒nion;抔cr;쀀𝒮ar;拆ȀbcmpᇈᇛሉላĀ;sᇍᇎ拐etĀ;Eᇍᇕqual;抆ĀchᇠህeedsȀ;ESTᇭᇮᇴᇿ扻qual;檰lantEqual;扽ilde;承Tháྌ;我ƀ;esሒሓሣ拑rsetĀ;Eሜም抃qual;抇et»ሓրHRSacfhiorsሾቄ቉ቕ቞ቱቶኟዂወዑORN耻Þ䃞ADE;愢ĀHc቎ቒcy;䐋y;䐦Ābuቚቜ;䀉;䎤ƀaeyብቪቯron;䅤dil;䅢;䐢r;쀀𝔗Āeiቻ኉ǲኀ\0ኇefore;戴a;䎘Ācn኎ኘkSpace;쀀  Space;怉ldeȀ;EFTካኬኲኼ戼qual;扃ullEqual;扅ilde;扈pf;쀀𝕋ipleDot;惛Āctዖዛr;쀀𝒯rok;䅦ૡዷጎጚጦ\0ጬጱ\0\0\0\0\0ጸጽ፷ᎅ\0᏿ᐄᐊᐐĀcrዻጁute耻Ú䃚rĀ;oጇገ憟cir;楉rǣጓ\0጖y;䐎ve;䅬Āiyጞጣrc耻Û䃛;䐣blac;䅰r;쀀𝔘rave耻Ù䃙acr;䅪Ādiፁ፩erĀBPፈ፝Āarፍፐr;䁟acĀekፗፙ;揟et;掵arenthesis;揝onĀ;P፰፱拃lus;抎Āgp፻፿on;䅲f;쀀𝕌ЀADETadps᎕ᎮᎸᏄϨᏒᏗᏳrrowƀ;BDᅐᎠᎤar;椒ownArrow;懅ownArrow;憕quilibrium;楮eeĀ;AᏋᏌ报rrow;憥ownáϳerĀLRᏞᏨeftArrow;憖ightArrow;憗iĀ;lᏹᏺ䏒on;䎥ing;䅮cr;쀀𝒰ilde;䅨ml耻Ü䃜ҀDbcdefosvᐧᐬᐰᐳᐾᒅᒊᒐᒖash;披ar;櫫y;䐒ashĀ;lᐻᐼ抩;櫦Āerᑃᑅ;拁ƀbtyᑌᑐᑺar;怖Ā;iᑏᑕcalȀBLSTᑡᑥᑪᑴar;戣ine;䁼eparator;杘ilde;所ThinSpace;怊r;쀀𝔙pf;쀀𝕍cr;쀀𝒱dash;抪ʀcefosᒧᒬᒱᒶᒼirc;䅴dge;拀r;쀀𝔚pf;쀀𝕎cr;쀀𝒲Ȁfiosᓋᓐᓒᓘr;쀀𝔛;䎞pf;쀀𝕏cr;쀀𝒳ҀAIUacfosuᓱᓵᓹᓽᔄᔏᔔᔚᔠcy;䐯cy;䐇cy;䐮cute耻Ý䃝Āiyᔉᔍrc;䅶;䐫r;쀀𝔜pf;쀀𝕐cr;쀀𝒴ml;䅸ЀHacdefosᔵᔹᔿᕋᕏᕝᕠᕤcy;䐖cute;䅹Āayᕄᕉron;䅽;䐗ot;䅻ǲᕔ\0ᕛoWidtè૙a;䎖r;愨pf;愤cr;쀀𝒵௡ᖃᖊᖐ\0ᖰᖶᖿ\0\0\0\0ᗆᗛᗫᙟ᙭\0ᚕ᚛ᚲᚹ\0ᚾcute耻á䃡reve;䄃̀;Ediuyᖜᖝᖡᖣᖨᖭ戾;쀀∾̳;房rc耻â䃢te肻´̆;䐰lig耻æ䃦Ā;r²ᖺ;쀀𝔞rave耻à䃠ĀepᗊᗖĀfpᗏᗔsym;愵èᗓha;䎱ĀapᗟcĀclᗤᗧr;䄁g;樿ɤᗰ\0\0ᘊʀ;adsvᗺᗻᗿᘁᘇ戧nd;橕;橜lope;橘;橚΀;elmrszᘘᘙᘛᘞᘿᙏᙙ戠;榤e»ᘙsdĀ;aᘥᘦ戡ѡᘰᘲᘴᘶᘸᘺᘼᘾ;榨;榩;榪;榫;榬;榭;榮;榯tĀ;vᙅᙆ戟bĀ;dᙌᙍ抾;榝Āptᙔᙗh;戢»¹arr;捼Āgpᙣᙧon;䄅f;쀀𝕒΀;Eaeiop዁ᙻᙽᚂᚄᚇᚊ;橰cir;橯;扊d;手s;䀧roxĀ;e዁ᚒñᚃing耻å䃥ƀctyᚡᚦᚨr;쀀𝒶;䀪mpĀ;e዁ᚯñʈilde耻ã䃣ml耻ä䃤Āciᛂᛈoninôɲnt;樑ࠀNabcdefiklnoprsu᛭ᛱᜰ᜼ᝃᝈ᝸᝽០៦ᠹᡐᜍ᤽᥈ᥰot;櫭Ācrᛶ᜞kȀcepsᜀᜅᜍᜓong;扌psilon;䏶rime;怵imĀ;e᜚᜛戽q;拍Ŷᜢᜦee;抽edĀ;gᜬᜭ挅e»ᜭrkĀ;t፜᜷brk;掶Āoyᜁᝁ;䐱quo;怞ʀcmprtᝓ᝛ᝡᝤᝨausĀ;eĊĉptyv;榰séᜌnoõēƀahwᝯ᝱ᝳ;䎲;愶een;扬r;쀀𝔟g΀costuvwឍឝឳេ៕៛៞ƀaiuបពរðݠrc;旯p»፱ƀdptឤឨឭot;樀lus;樁imes;樂ɱឹ\0\0ើcup;樆ar;昅riangleĀdu៍្own;施p;斳plus;樄eåᑄåᒭarow;植ƀako៭ᠦᠵĀcn៲ᠣkƀlst៺֫᠂ozenge;槫riangleȀ;dlr᠒᠓᠘᠝斴own;斾eft;旂ight;斸k;搣Ʊᠫ\0ᠳƲᠯ\0ᠱ;斒;斑4;斓ck;斈ĀeoᠾᡍĀ;qᡃᡆ쀀=⃥uiv;쀀≡⃥t;挐Ȁptwxᡙᡞᡧᡬf;쀀𝕓Ā;tᏋᡣom»Ꮜtie;拈؀DHUVbdhmptuvᢅᢖᢪᢻᣗᣛᣬ᣿ᤅᤊᤐᤡȀLRlrᢎᢐᢒᢔ;敗;敔;敖;敓ʀ;DUduᢡᢢᢤᢦᢨ敐;敦;敩;敤;敧ȀLRlrᢳᢵᢷᢹ;敝;敚;敜;教΀;HLRhlrᣊᣋᣍᣏᣑᣓᣕ救;敬;散;敠;敫;敢;敟ox;槉ȀLRlrᣤᣦᣨᣪ;敕;敒;攐;攌ʀ;DUduڽ᣷᣹᣻᣽;敥;敨;攬;攴inus;抟lus;択imes;抠ȀLRlrᤙᤛᤝ᤟;敛;敘;攘;攔΀;HLRhlrᤰᤱᤳᤵᤷ᤻᤹攂;敪;敡;敞;攼;攤;攜Āevģ᥂bar耻¦䂦Ȁceioᥑᥖᥚᥠr;쀀𝒷mi;恏mĀ;e᜚᜜lƀ;bhᥨᥩᥫ䁜;槅sub;柈Ŭᥴ᥾lĀ;e᥹᥺怢t»᥺pƀ;Eeįᦅᦇ;檮Ā;qۜۛೡᦧ\0᧨ᨑᨕᨲ\0ᨷᩐ\0\0᪴\0\0᫁\0\0ᬡᬮ᭍᭒\0᯽\0ᰌƀcpr᦭ᦲ᧝ute;䄇̀;abcdsᦿᧀᧄ᧊᧕᧙戩nd;橄rcup;橉Āau᧏᧒p;橋p;橇ot;橀;쀀∩︀Āeo᧢᧥t;恁îړȀaeiu᧰᧻ᨁᨅǰ᧵\0᧸s;橍on;䄍dil耻ç䃧rc;䄉psĀ;sᨌᨍ橌m;橐ot;䄋ƀdmnᨛᨠᨦil肻¸ƭptyv;榲t脀¢;eᨭᨮ䂢räƲr;쀀𝔠ƀceiᨽᩀᩍy;䑇ckĀ;mᩇᩈ朓ark»ᩈ;䏇r΀;Ecefms᩟᩠ᩢᩫ᪤᪪᪮旋;槃ƀ;elᩩᩪᩭ䋆q;扗eɡᩴ\0\0᪈rrowĀlr᩼᪁eft;憺ight;憻ʀRSacd᪒᪔᪖᪚᪟»ཇ;擈st;抛irc;抚ash;抝nint;樐id;櫯cir;槂ubsĀ;u᪻᪼晣it»᪼ˬ᫇᫔᫺\0ᬊonĀ;eᫍᫎ䀺Ā;qÇÆɭ᫙\0\0᫢aĀ;t᫞᫟䀬;䁀ƀ;fl᫨᫩᫫戁îᅠeĀmx᫱᫶ent»᫩eóɍǧ᫾\0ᬇĀ;dኻᬂot;橭nôɆƀfryᬐᬔᬗ;쀀𝕔oäɔ脀©;sŕᬝr;愗Āaoᬥᬩrr;憵ss;朗Ācuᬲᬷr;쀀𝒸Ābpᬼ᭄Ā;eᭁᭂ櫏;櫑Ā;eᭉᭊ櫐;櫒dot;拯΀delprvw᭠᭬᭷ᮂᮬᯔ᯹arrĀlr᭨᭪;椸;椵ɰ᭲\0\0᭵r;拞c;拟arrĀ;p᭿ᮀ憶;椽̀;bcdosᮏᮐᮖᮡᮥᮨ截rcap;橈Āauᮛᮞp;橆p;橊ot;抍r;橅;쀀∪︀Ȁalrv᮵ᮿᯞᯣrrĀ;mᮼᮽ憷;椼yƀevwᯇᯔᯘqɰᯎ\0\0ᯒreã᭳uã᭵ee;拎edge;拏en耻¤䂤earrowĀlrᯮ᯳eft»ᮀight»ᮽeäᯝĀciᰁᰇoninôǷnt;戱lcty;挭ঀAHabcdefhijlorstuwz᰸᰻᰿ᱝᱩᱵᲊᲞᲬᲷ᳻᳿ᴍᵻᶑᶫᶻ᷆᷍rò΁ar;楥Ȁglrs᱈ᱍ᱒᱔ger;怠eth;愸òᄳhĀ;vᱚᱛ怐»ऊūᱡᱧarow;椏aã̕Āayᱮᱳron;䄏;䐴ƀ;ao̲ᱼᲄĀgrʿᲁr;懊tseq;橷ƀglmᲑᲔᲘ耻°䂰ta;䎴ptyv;榱ĀirᲣᲨsht;楿;쀀𝔡arĀlrᲳᲵ»ࣜ»သʀaegsv᳂͸᳖᳜᳠mƀ;oș᳊᳔ndĀ;ș᳑uit;晦amma;䏝in;拲ƀ;io᳧᳨᳸䃷de脀÷;o᳧ᳰntimes;拇nø᳷cy;䑒cɯᴆ\0\0ᴊrn;挞op;挍ʀlptuwᴘᴝᴢᵉᵕlar;䀤f;쀀𝕕ʀ;emps̋ᴭᴷᴽᵂqĀ;d͒ᴳot;扑inus;戸lus;戔quare;抡blebarwedgåúnƀadhᄮᵝᵧownarrowóᲃarpoonĀlrᵲᵶefôᲴighôᲶŢᵿᶅkaro÷གɯᶊ\0\0ᶎrn;挟op;挌ƀcotᶘᶣᶦĀryᶝᶡ;쀀𝒹;䑕l;槶rok;䄑Ādrᶰᶴot;拱iĀ;fᶺ᠖斿Āah᷀᷃ròЩaòྦangle;榦Āci᷒ᷕy;䑟grarr;柿ऀDacdefglmnopqrstuxḁḉḙḸոḼṉṡṾấắẽỡἪἷὄ὎὚ĀDoḆᴴoôᲉĀcsḎḔute耻é䃩ter;橮ȀaioyḢḧḱḶron;䄛rĀ;cḭḮ扖耻ê䃪lon;払;䑍ot;䄗ĀDrṁṅot;扒;쀀𝔢ƀ;rsṐṑṗ檚ave耻è䃨Ā;dṜṝ檖ot;檘Ȁ;ilsṪṫṲṴ檙nters;揧;愓Ā;dṹṺ檕ot;檗ƀapsẅẉẗcr;䄓tyƀ;svẒẓẕ戅et»ẓpĀ1;ẝẤĳạả;怄;怅怃ĀgsẪẬ;䅋p;怂ĀgpẴẸon;䄙f;쀀𝕖ƀalsỄỎỒrĀ;sỊị拕l;槣us;橱iƀ;lvỚớở䎵on»ớ;䏵ȀcsuvỪỳἋἣĀioữḱrc»Ḯɩỹ\0\0ỻíՈantĀglἂἆtr»ṝess»Ṻƀaeiἒ἖Ἒls;䀽st;扟vĀ;DȵἠD;橸parsl;槥ĀDaἯἳot;打rr;楱ƀcdiἾὁỸr;愯oô͒ĀahὉὋ;䎷耻ð䃰Āmrὓὗl耻ë䃫o;悬ƀcipὡὤὧl;䀡sôծĀeoὬὴctatioîՙnentialåչৡᾒ\0ᾞ\0ᾡᾧ\0\0ῆῌ\0ΐ\0ῦῪ \0 ⁚llingdotseñṄy;䑄male;晀ƀilrᾭᾳ῁lig;耀ﬃɩᾹ\0\0᾽g;耀ﬀig;耀ﬄ;쀀𝔣lig;耀ﬁlig;쀀fjƀaltῙ῜ῡt;晭ig;耀ﬂns;斱of;䆒ǰ΅\0ῳf;쀀𝕗ĀakֿῷĀ;vῼ´拔;櫙artint;樍Āao‌⁕Ācs‑⁒α‚‰‸⁅⁈\0⁐β•‥‧‪‬\0‮耻½䂽;慓耻¼䂼;慕;慙;慛Ƴ‴\0‶;慔;慖ʴ‾⁁\0\0⁃耻¾䂾;慗;慜5;慘ƶ⁌\0⁎;慚;慝8;慞l;恄wn;挢cr;쀀𝒻ࢀEabcdefgijlnorstv₂₉₟₥₰₴⃰⃵⃺⃿℃ℒℸ̗ℾ⅒↞Ā;lٍ₇;檌ƀcmpₐₕ₝ute;䇵maĀ;dₜ᳚䎳;檆reve;䄟Āiy₪₮rc;䄝;䐳ot;䄡Ȁ;lqsؾق₽⃉ƀ;qsؾٌ⃄lanô٥Ȁ;cdl٥⃒⃥⃕c;檩otĀ;o⃜⃝檀Ā;l⃢⃣檂;檄Ā;e⃪⃭쀀⋛︀s;檔r;쀀𝔤Ā;gٳ؛mel;愷cy;䑓Ȁ;Eajٚℌℎℐ;檒;檥;檤ȀEaesℛℝ℩ℴ;扩pĀ;p℣ℤ檊rox»ℤĀ;q℮ℯ檈Ā;q℮ℛim;拧pf;쀀𝕘Āci⅃ⅆr;愊mƀ;el٫ⅎ⅐;檎;檐茀>;cdlqr׮ⅠⅪⅮⅳⅹĀciⅥⅧ;檧r;橺ot;拗Par;榕uest;橼ʀadelsↄⅪ←ٖ↛ǰ↉\0↎proø₞r;楸qĀlqؿ↖lesó₈ií٫Āen↣↭rtneqq;쀀≩︀Å↪ԀAabcefkosy⇄⇇⇱⇵⇺∘∝∯≨≽ròΠȀilmr⇐⇔⇗⇛rsðᒄf»․ilôکĀdr⇠⇤cy;䑊ƀ;cwࣴ⇫⇯ir;楈;憭ar;意irc;䄥ƀalr∁∎∓rtsĀ;u∉∊晥it»∊lip;怦con;抹r;쀀𝔥sĀew∣∩arow;椥arow;椦ʀamopr∺∾≃≞≣rr;懿tht;戻kĀlr≉≓eftarrow;憩ightarrow;憪f;쀀𝕙bar;怕ƀclt≯≴≸r;쀀𝒽asè⇴rok;䄧Ābp⊂⊇ull;恃hen»ᱛૡ⊣\0⊪\0⊸⋅⋎\0⋕⋳\0\0⋸⌢⍧⍢⍿\0⎆⎪⎴cute耻í䃭ƀ;iyݱ⊰⊵rc耻î䃮;䐸Ācx⊼⊿y;䐵cl耻¡䂡ĀfrΟ⋉;쀀𝔦rave耻ì䃬Ȁ;inoܾ⋝⋩⋮Āin⋢⋦nt;樌t;戭fin;槜ta;愩lig;䄳ƀaop⋾⌚⌝ƀcgt⌅⌈⌗r;䄫ƀelpܟ⌏⌓inåގarôܠh;䄱f;抷ed;䆵ʀ;cfotӴ⌬⌱⌽⍁are;愅inĀ;t⌸⌹戞ie;槝doô⌙ʀ;celpݗ⍌⍐⍛⍡al;抺Āgr⍕⍙eróᕣã⍍arhk;樗rod;樼Ȁcgpt⍯⍲⍶⍻y;䑑on;䄯f;쀀𝕚a;䎹uest耻¿䂿Āci⎊⎏r;쀀𝒾nʀ;EdsvӴ⎛⎝⎡ӳ;拹ot;拵Ā;v⎦⎧拴;拳Ā;iݷ⎮lde;䄩ǫ⎸\0⎼cy;䑖l耻ï䃯̀cfmosu⏌⏗⏜⏡⏧⏵Āiy⏑⏕rc;䄵;䐹r;쀀𝔧ath;䈷pf;쀀𝕛ǣ⏬\0⏱r;쀀𝒿rcy;䑘kcy;䑔Ѐacfghjos␋␖␢␧␭␱␵␻ppaĀ;v␓␔䎺;䏰Āey␛␠dil;䄷;䐺r;쀀𝔨reen;䄸cy;䑅cy;䑜pf;쀀𝕜cr;쀀𝓀஀ABEHabcdefghjlmnoprstuv⑰⒁⒆⒍⒑┎┽╚▀♎♞♥♹♽⚚⚲⛘❝❨➋⟀⠁⠒ƀart⑷⑺⑼rò৆òΕail;椛arr;椎Ā;gঔ⒋;檋ar;楢ॣ⒥\0⒪\0⒱\0\0\0\0\0⒵Ⓔ\0ⓆⓈⓍ\0⓹ute;䄺mptyv;榴raîࡌbda;䎻gƀ;dlࢎⓁⓃ;榑åࢎ;檅uo耻«䂫rЀ;bfhlpst࢙ⓞⓦⓩ⓫⓮⓱⓵Ā;f࢝ⓣs;椟s;椝ë≒p;憫l;椹im;楳l;憢ƀ;ae⓿─┄檫il;椙Ā;s┉┊檭;쀀⪭︀ƀabr┕┙┝rr;椌rk;杲Āak┢┬cĀek┨┪;䁻;䁛Āes┱┳;榋lĀdu┹┻;榏;榍Ȁaeuy╆╋╖╘ron;䄾Ādi═╔il;䄼ìࢰâ┩;䐻Ȁcqrs╣╦╭╽a;椶uoĀ;rนᝆĀdu╲╷har;楧shar;楋h;憲ʀ;fgqs▋▌উ◳◿扤tʀahlrt▘▤▷◂◨rrowĀ;t࢙□aé⓶arpoonĀdu▯▴own»њp»०eftarrows;懇ightƀahs◍◖◞rrowĀ;sࣴࢧarpoonó྘quigarro÷⇰hreetimes;拋ƀ;qs▋ও◺lanôবʀ;cdgsব☊☍☝☨c;檨otĀ;o☔☕橿Ā;r☚☛檁;檃Ā;e☢☥쀀⋚︀s;檓ʀadegs☳☹☽♉♋pproøⓆot;拖qĀgq♃♅ôউgtò⒌ôছiíলƀilr♕࣡♚sht;楼;쀀𝔩Ā;Eজ♣;檑š♩♶rĀdu▲♮Ā;l॥♳;楪lk;斄cy;䑙ʀ;achtੈ⚈⚋⚑⚖rò◁orneòᴈard;楫ri;旺Āio⚟⚤dot;䅀ustĀ;a⚬⚭掰che»⚭ȀEaes⚻⚽⛉⛔;扨pĀ;p⛃⛄檉rox»⛄Ā;q⛎⛏檇Ā;q⛎⚻im;拦Ѐabnoptwz⛩⛴⛷✚✯❁❇❐Ānr⛮⛱g;柬r;懽rëࣁgƀlmr⛿✍✔eftĀar০✇ightá৲apsto;柼ightá৽parrowĀlr✥✩efô⓭ight;憬ƀafl✶✹✽r;榅;쀀𝕝us;樭imes;樴š❋❏st;戗áፎƀ;ef❗❘᠀旊nge»❘arĀ;l❤❥䀨t;榓ʀachmt❳❶❼➅➇ròࢨorneòᶌarĀ;d྘➃;業;怎ri;抿̀achiqt➘➝ੀ➢➮➻quo;怹r;쀀𝓁mƀ;egল➪➬;檍;檏Ābu┪➳oĀ;rฟ➹;怚rok;䅂萀<;cdhilqrࠫ⟒☹⟜⟠⟥⟪⟰Āci⟗⟙;檦r;橹reå◲mes;拉arr;楶uest;橻ĀPi⟵⟹ar;榖ƀ;ef⠀भ᠛旃rĀdu⠇⠍shar;楊har;楦Āen⠗⠡rtneqq;쀀≨︀Å⠞܀Dacdefhilnopsu⡀⡅⢂⢎⢓⢠⢥⢨⣚⣢⣤ઃ⣳⤂Dot;戺Ȁclpr⡎⡒⡣⡽r耻¯䂯Āet⡗⡙;時Ā;e⡞⡟朠se»⡟Ā;sျ⡨toȀ;dluျ⡳⡷⡻owîҌefôएðᏑker;斮Āoy⢇⢌mma;権;䐼ash;怔asuredangle»ᘦr;쀀𝔪o;愧ƀcdn⢯⢴⣉ro耻µ䂵Ȁ;acdᑤ⢽⣀⣄sôᚧir;櫰ot肻·Ƶusƀ;bd⣒ᤃ⣓戒Ā;uᴼ⣘;横ţ⣞⣡p;櫛ò−ðઁĀdp⣩⣮els;抧f;쀀𝕞Āct⣸⣽r;쀀𝓂pos»ᖝƀ;lm⤉⤊⤍䎼timap;抸ఀGLRVabcdefghijlmoprstuvw⥂⥓⥾⦉⦘⧚⧩⨕⨚⩘⩝⪃⪕⪤⪨⬄⬇⭄⭿⮮ⰴⱧⱼ⳩Āgt⥇⥋;쀀⋙̸Ā;v⥐௏쀀≫⃒ƀelt⥚⥲⥶ftĀar⥡⥧rrow;懍ightarrow;懎;쀀⋘̸Ā;v⥻ే쀀≪⃒ightarrow;懏ĀDd⦎⦓ash;抯ash;抮ʀbcnpt⦣⦧⦬⦱⧌la»˞ute;䅄g;쀀∠⃒ʀ;Eiop඄⦼⧀⧅⧈;쀀⩰̸d;쀀≋̸s;䅉roø඄urĀ;a⧓⧔普lĀ;s⧓ସǳ⧟\0⧣p肻 ଷmpĀ;e௹ఀʀaeouy⧴⧾⨃⨐⨓ǰ⧹\0⧻;橃on;䅈dil;䅆ngĀ;dൾ⨊ot;쀀⩭̸p;橂;䐽ash;怓΀;Aadqsxஒ⨩⨭⨻⩁⩅⩐rr;懗rĀhr⨳⨶k;椤Ā;oᏲᏰot;쀀≐̸uiöୣĀei⩊⩎ar;椨í஘istĀ;s஠டr;쀀𝔫ȀEest௅⩦⩹⩼ƀ;qs஼⩭௡ƀ;qs஼௅⩴lanô௢ií௪Ā;rஶ⪁»ஷƀAap⪊⪍⪑rò⥱rr;憮ar;櫲ƀ;svྍ⪜ྌĀ;d⪡⪢拼;拺cy;䑚΀AEadest⪷⪺⪾⫂⫅⫶⫹rò⥦;쀀≦̸rr;憚r;急Ȁ;fqs఻⫎⫣⫯tĀar⫔⫙rro÷⫁ightarro÷⪐ƀ;qs఻⪺⫪lanôౕĀ;sౕ⫴»శiíౝĀ;rవ⫾iĀ;eచథiäඐĀpt⬌⬑f;쀀𝕟膀¬;in⬙⬚⬶䂬nȀ;Edvஉ⬤⬨⬮;쀀⋹̸ot;쀀⋵̸ǡஉ⬳⬵;拷;拶iĀ;vಸ⬼ǡಸ⭁⭃;拾;拽ƀaor⭋⭣⭩rȀ;ast୻⭕⭚⭟lleì୻l;쀀⫽⃥;쀀∂̸lint;樔ƀ;ceಒ⭰⭳uåಥĀ;cಘ⭸Ā;eಒ⭽ñಘȀAait⮈⮋⮝⮧rò⦈rrƀ;cw⮔⮕⮙憛;쀀⤳̸;쀀↝̸ghtarrow»⮕riĀ;eೋೖ΀chimpqu⮽⯍⯙⬄୸⯤⯯Ȁ;cerല⯆ഷ⯉uå൅;쀀𝓃ortɭ⬅\0\0⯖ará⭖mĀ;e൮⯟Ā;q൴൳suĀbp⯫⯭å೸åഋƀbcp⯶ⰑⰙȀ;Ees⯿ⰀഢⰄ抄;쀀⫅̸etĀ;eഛⰋqĀ;qണⰀcĀ;eലⰗñസȀ;EesⰢⰣൟⰧ抅;쀀⫆̸etĀ;e൘ⰮqĀ;qൠⰣȀgilrⰽⰿⱅⱇìௗlde耻ñ䃱çృiangleĀlrⱒⱜeftĀ;eచⱚñదightĀ;eೋⱥñ೗Ā;mⱬⱭ䎽ƀ;esⱴⱵⱹ䀣ro;愖p;怇ҀDHadgilrsⲏⲔⲙⲞⲣⲰⲶⳓⳣash;抭arr;椄p;쀀≍⃒ash;抬ĀetⲨⲬ;쀀≥⃒;쀀>⃒nfin;槞ƀAetⲽⳁⳅrr;椂;쀀≤⃒Ā;rⳊⳍ쀀<⃒ie;쀀⊴⃒ĀAtⳘⳜrr;椃rie;쀀⊵⃒im;쀀∼⃒ƀAan⳰⳴ⴂrr;懖rĀhr⳺⳽k;椣Ā;oᏧᏥear;椧ቓ᪕\0\0\0\0\0\0\0\0\0\0\0\0\0ⴭ\0ⴸⵈⵠⵥ⵲ⶄᬇ\0\0ⶍⶫ\0ⷈⷎ\0ⷜ⸙⸫⸾⹃Ācsⴱ᪗ute耻ó䃳ĀiyⴼⵅrĀ;c᪞ⵂ耻ô䃴;䐾ʀabios᪠ⵒⵗǈⵚlac;䅑v;樸old;榼lig;䅓Ācr⵩⵭ir;榿;쀀𝔬ͯ⵹\0\0⵼\0ⶂn;䋛ave耻ò䃲;槁Ābmⶈ෴ar;榵Ȁacitⶕ⶘ⶥⶨrò᪀Āir⶝ⶠr;榾oss;榻nå๒;槀ƀaeiⶱⶵⶹcr;䅍ga;䏉ƀcdnⷀⷅǍron;䎿;榶pf;쀀𝕠ƀaelⷔ⷗ǒr;榷rp;榹΀;adiosvⷪⷫⷮ⸈⸍⸐⸖戨rò᪆Ȁ;efmⷷⷸ⸂⸅橝rĀ;oⷾⷿ愴f»ⷿ耻ª䂪耻º䂺gof;抶r;橖lope;橗;橛ƀclo⸟⸡⸧ò⸁ash耻ø䃸l;折iŬⸯ⸴de耻õ䃵esĀ;aǛ⸺s;樶ml耻ö䃶bar;挽ૡ⹞\0⹽\0⺀⺝\0⺢⺹\0\0⻋ຜ\0⼓\0\0⼫⾼\0⿈rȀ;astЃ⹧⹲຅脀¶;l⹭⹮䂶leìЃɩ⹸\0\0⹻m;櫳;櫽y;䐿rʀcimpt⺋⺏⺓ᡥ⺗nt;䀥od;䀮il;怰enk;怱r;쀀𝔭ƀimo⺨⺰⺴Ā;v⺭⺮䏆;䏕maô੶ne;明ƀ;tv⺿⻀⻈䏀chfork»´;䏖Āau⻏⻟nĀck⻕⻝kĀ;h⇴⻛;愎ö⇴sҀ;abcdemst⻳⻴ᤈ⻹⻽⼄⼆⼊⼎䀫cir;樣ir;樢Āouᵀ⼂;樥;橲n肻±ຝim;樦wo;樧ƀipu⼙⼠⼥ntint;樕f;쀀𝕡nd耻£䂣Ԁ;Eaceinosu່⼿⽁⽄⽇⾁⾉⾒⽾⾶;檳p;檷uå໙Ā;c໎⽌̀;acens່⽙⽟⽦⽨⽾pproø⽃urlyeñ໙ñ໎ƀaes⽯⽶⽺pprox;檹qq;檵im;拨iíໟmeĀ;s⾈ຮ怲ƀEas⽸⾐⽺ð⽵ƀdfp໬⾙⾯ƀals⾠⾥⾪lar;挮ine;挒urf;挓Ā;t໻⾴ï໻rel;抰Āci⿀⿅r;쀀𝓅;䏈ncsp;怈̀fiopsu⿚⋢⿟⿥⿫⿱r;쀀𝔮pf;쀀𝕢rime;恗cr;쀀𝓆ƀaeo⿸〉〓tĀei⿾々rnionóڰnt;樖stĀ;e【】䀿ñἙô༔઀ABHabcdefhilmnoprstux぀けさすムㄎㄫㅇㅢㅲㆎ㈆㈕㈤㈩㉘㉮㉲㊐㊰㊷ƀartぇおがròႳòϝail;検aròᱥar;楤΀cdenqrtとふへみわゔヌĀeuねぱ;쀀∽̱te;䅕iãᅮmptyv;榳gȀ;del࿑らるろ;榒;榥å࿑uo耻»䂻rր;abcfhlpstw࿜ガクシスゼゾダッデナp;極Ā;f࿠ゴs;椠;椳s;椞ë≝ð✮l;楅im;楴l;憣;憝Āaiパフil;椚oĀ;nホボ戶aló༞ƀabrョリヮrò៥rk;杳ĀakンヽcĀekヹ・;䁽;䁝Āes㄂㄄;榌lĀduㄊㄌ;榎;榐Ȁaeuyㄗㄜㄧㄩron;䅙Ādiㄡㄥil;䅗ì࿲âヺ;䑀Ȁclqsㄴㄷㄽㅄa;椷dhar;楩uoĀ;rȎȍh;憳ƀacgㅎㅟངlȀ;ipsླྀㅘㅛႜnåႻarôྩt;断ƀilrㅩဣㅮsht;楽;쀀𝔯ĀaoㅷㆆrĀduㅽㅿ»ѻĀ;l႑ㆄ;楬Ā;vㆋㆌ䏁;䏱ƀgns㆕ㇹㇼht̀ahlrstㆤㆰ㇂㇘㇤㇮rrowĀ;t࿜ㆭaéトarpoonĀduㆻㆿowîㅾp»႒eftĀah㇊㇐rrowó࿪arpoonóՑightarrows;應quigarro÷ニhreetimes;拌g;䋚ingdotseñἲƀahm㈍㈐㈓rò࿪aòՑ;怏oustĀ;a㈞㈟掱che»㈟mid;櫮Ȁabpt㈲㈽㉀㉒Ānr㈷㈺g;柭r;懾rëဃƀafl㉇㉊㉎r;榆;쀀𝕣us;樮imes;樵Āap㉝㉧rĀ;g㉣㉤䀩t;榔olint;樒arò㇣Ȁachq㉻㊀Ⴜ㊅quo;怺r;쀀𝓇Ābu・㊊oĀ;rȔȓƀhir㊗㊛㊠reåㇸmes;拊iȀ;efl㊪ၙᠡ㊫方tri;槎luhar;楨;愞ൡ㋕㋛㋟㌬㌸㍱\0㍺㎤\0\0㏬㏰\0㐨㑈㑚㒭㒱㓊㓱\0㘖\0\0㘳cute;䅛quï➺Ԁ;Eaceinpsyᇭ㋳㋵㋿㌂㌋㌏㌟㌦㌩;檴ǰ㋺\0㋼;檸on;䅡uåᇾĀ;dᇳ㌇il;䅟rc;䅝ƀEas㌖㌘㌛;檶p;檺im;择olint;樓iíሄ;䑁otƀ;be㌴ᵇ㌵担;橦΀Aacmstx㍆㍊㍗㍛㍞㍣㍭rr;懘rĀhr㍐㍒ë∨Ā;oਸ਼਴t耻§䂧i;䀻war;椩mĀin㍩ðnuóñt;朶rĀ;o㍶⁕쀀𝔰Ȁacoy㎂㎆㎑㎠rp;景Āhy㎋㎏cy;䑉;䑈rtɭ㎙\0\0㎜iäᑤaraì⹯耻­䂭Āgm㎨㎴maƀ;fv㎱㎲㎲䏃;䏂Ѐ;deglnprካ㏅㏉㏎㏖㏞㏡㏦ot;橪Ā;q኱ኰĀ;E㏓㏔檞;檠Ā;E㏛㏜檝;檟e;扆lus;樤arr;楲aròᄽȀaeit㏸㐈㐏㐗Āls㏽㐄lsetmé㍪hp;樳parsl;槤Ādlᑣ㐔e;挣Ā;e㐜㐝檪Ā;s㐢㐣檬;쀀⪬︀ƀflp㐮㐳㑂tcy;䑌Ā;b㐸㐹䀯Ā;a㐾㐿槄r;挿f;쀀𝕤aĀdr㑍ЂesĀ;u㑔㑕晠it»㑕ƀcsu㑠㑹㒟Āau㑥㑯pĀ;sᆈ㑫;쀀⊓︀pĀ;sᆴ㑵;쀀⊔︀uĀbp㑿㒏ƀ;esᆗᆜ㒆etĀ;eᆗ㒍ñᆝƀ;esᆨᆭ㒖etĀ;eᆨ㒝ñᆮƀ;afᅻ㒦ְrť㒫ֱ»ᅼaròᅈȀcemt㒹㒾㓂㓅r;쀀𝓈tmîñiì㐕aræᆾĀar㓎㓕rĀ;f㓔ឿ昆Āan㓚㓭ightĀep㓣㓪psiloîỠhé⺯s»⡒ʀbcmnp㓻㕞ሉ㖋㖎Ҁ;Edemnprs㔎㔏㔑㔕㔞㔣㔬㔱㔶抂;櫅ot;檽Ā;dᇚ㔚ot;櫃ult;櫁ĀEe㔨㔪;櫋;把lus;檿arr;楹ƀeiu㔽㕒㕕tƀ;en㔎㕅㕋qĀ;qᇚ㔏eqĀ;q㔫㔨m;櫇Ābp㕚㕜;櫕;櫓c̀;acensᇭ㕬㕲㕹㕻㌦pproø㋺urlyeñᇾñᇳƀaes㖂㖈㌛pproø㌚qñ㌗g;晪ڀ123;Edehlmnps㖩㖬㖯ሜ㖲㖴㗀㗉㗕㗚㗟㗨㗭耻¹䂹耻²䂲耻³䂳;櫆Āos㖹㖼t;檾ub;櫘Ā;dሢ㗅ot;櫄sĀou㗏㗒l;柉b;櫗arr;楻ult;櫂ĀEe㗤㗦;櫌;抋lus;櫀ƀeiu㗴㘉㘌tƀ;enሜ㗼㘂qĀ;qሢ㖲eqĀ;q㗧㗤m;櫈Ābp㘑㘓;櫔;櫖ƀAan㘜㘠㘭rr;懙rĀhr㘦㘨ë∮Ā;oਫ਩war;椪lig耻ß䃟௡㙑㙝㙠ዎ㙳㙹\0㙾㛂\0\0\0\0\0㛛㜃\0㜉㝬\0\0\0㞇ɲ㙖\0\0㙛get;挖;䏄rë๟ƀaey㙦㙫㙰ron;䅥dil;䅣;䑂lrec;挕r;쀀𝔱Ȁeiko㚆㚝㚵㚼ǲ㚋\0㚑eĀ4fኄኁaƀ;sv㚘㚙㚛䎸ym;䏑Ācn㚢㚲kĀas㚨㚮pproø዁im»ኬsðኞĀas㚺㚮ð዁rn耻þ䃾Ǭ̟㛆⋧es膀×;bd㛏㛐㛘䃗Ā;aᤏ㛕r;樱;樰ƀeps㛡㛣㜀á⩍Ȁ;bcf҆㛬㛰㛴ot;挶ir;櫱Ā;o㛹㛼쀀𝕥rk;櫚á㍢rime;怴ƀaip㜏㜒㝤dåቈ΀adempst㜡㝍㝀㝑㝗㝜㝟ngleʀ;dlqr㜰㜱㜶㝀㝂斵own»ᶻeftĀ;e⠀㜾ñम;扜ightĀ;e㊪㝋ñၚot;旬inus;樺lus;樹b;槍ime;樻ezium;揢ƀcht㝲㝽㞁Āry㝷㝻;쀀𝓉;䑆cy;䑛rok;䅧Āio㞋㞎xô᝷headĀlr㞗㞠eftarro÷ࡏightarrow»ཝऀAHabcdfghlmoprstuw㟐㟓㟗㟤㟰㟼㠎㠜㠣㠴㡑㡝㡫㢩㣌㣒㣪㣶ròϭar;楣Ācr㟜㟢ute耻ú䃺òᅐrǣ㟪\0㟭y;䑞ve;䅭Āiy㟵㟺rc耻û䃻;䑃ƀabh㠃㠆㠋ròᎭlac;䅱aòᏃĀir㠓㠘sht;楾;쀀𝔲rave耻ù䃹š㠧㠱rĀlr㠬㠮»ॗ»ႃlk;斀Āct㠹㡍ɯ㠿\0\0㡊rnĀ;e㡅㡆挜r»㡆op;挏ri;旸Āal㡖㡚cr;䅫肻¨͉Āgp㡢㡦on;䅳f;쀀𝕦̀adhlsuᅋ㡸㡽፲㢑㢠ownáᎳarpoonĀlr㢈㢌efô㠭ighô㠯iƀ;hl㢙㢚㢜䏅»ᏺon»㢚parrows;懈ƀcit㢰㣄㣈ɯ㢶\0\0㣁rnĀ;e㢼㢽挝r»㢽op;挎ng;䅯ri;旹cr;쀀𝓊ƀdir㣙㣝㣢ot;拰lde;䅩iĀ;f㜰㣨»᠓Āam㣯㣲rò㢨l耻ü䃼angle;榧ހABDacdeflnoprsz㤜㤟㤩㤭㦵㦸㦽㧟㧤㧨㧳㧹㧽㨁㨠ròϷarĀ;v㤦㤧櫨;櫩asèϡĀnr㤲㤷grt;榜΀eknprst㓣㥆㥋㥒㥝㥤㦖appá␕othinçẖƀhir㓫⻈㥙opô⾵Ā;hᎷ㥢ïㆍĀiu㥩㥭gmá㎳Ābp㥲㦄setneqĀ;q㥽㦀쀀⊊︀;쀀⫋︀setneqĀ;q㦏㦒쀀⊋︀;쀀⫌︀Āhr㦛㦟etá㚜iangleĀlr㦪㦯eft»थight»ၑy;䐲ash»ံƀelr㧄㧒㧗ƀ;beⷪ㧋㧏ar;抻q;扚lip;拮Ābt㧜ᑨaòᑩr;쀀𝔳tré㦮suĀbp㧯㧱»ജ»൙pf;쀀𝕧roð໻tré㦴Ācu㨆㨋r;쀀𝓋Ābp㨐㨘nĀEe㦀㨖»㥾nĀEe㦒㨞»㦐igzag;榚΀cefoprs㨶㨻㩖㩛㩔㩡㩪irc;䅵Ādi㩀㩑Ābg㩅㩉ar;機eĀ;qᗺ㩏;扙erp;愘r;쀀𝔴pf;쀀𝕨Ā;eᑹ㩦atèᑹcr;쀀𝓌ૣណ㪇\0㪋\0㪐㪛\0\0㪝㪨㪫㪯\0\0㫃㫎\0㫘ៜ៟tré៑r;쀀𝔵ĀAa㪔㪗ròσrò৶;䎾ĀAa㪡㪤ròθrò৫að✓is;拻ƀdptឤ㪵㪾Āfl㪺ឩ;쀀𝕩imåឲĀAa㫇㫊ròώròਁĀcq㫒ីr;쀀𝓍Āpt៖㫜ré។Ѐacefiosu㫰㫽㬈㬌㬑㬕㬛㬡cĀuy㫶㫻te耻ý䃽;䑏Āiy㬂㬆rc;䅷;䑋n耻¥䂥r;쀀𝔶cy;䑗pf;쀀𝕪cr;쀀𝓎Ācm㬦㬩y;䑎l耻ÿ䃿Ԁacdefhiosw㭂㭈㭔㭘㭤㭩㭭㭴㭺㮀cute;䅺Āay㭍㭒ron;䅾;䐷ot;䅼Āet㭝㭡træᕟa;䎶r;쀀𝔷cy;䐶grarr;懝pf;쀀𝕫cr;쀀𝓏Ājn㮅㮇;怍j;怌'.split("").map((e) => e.charCodeAt(0))
), Jy = new Uint16Array(
  // prettier-ignore
  "Ȁaglq	\x1Bɭ\0\0p;䀦os;䀧t;䀾t;䀼uot;䀢".split("").map((e) => e.charCodeAt(0))
);
var Uo;
const Wy = /* @__PURE__ */ new Map([
  [0, 65533],
  // C1 Unicode control character reference replacements
  [128, 8364],
  [130, 8218],
  [131, 402],
  [132, 8222],
  [133, 8230],
  [134, 8224],
  [135, 8225],
  [136, 710],
  [137, 8240],
  [138, 352],
  [139, 8249],
  [140, 338],
  [142, 381],
  [145, 8216],
  [146, 8217],
  [147, 8220],
  [148, 8221],
  [149, 8226],
  [150, 8211],
  [151, 8212],
  [152, 732],
  [153, 8482],
  [154, 353],
  [155, 8250],
  [156, 339],
  [158, 382],
  [159, 376]
]), Gy = (
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, node/no-unsupported-features/es-builtins
  (Uo = String.fromCodePoint) !== null && Uo !== void 0 ? Uo : function(e) {
    let t = "";
    return e > 65535 && (e -= 65536, t += String.fromCharCode(e >>> 10 & 1023 | 55296), e = 56320 | e & 1023), t += String.fromCharCode(e), t;
  }
);
function Ky(e) {
  var t;
  return e >= 55296 && e <= 57343 || e > 1114111 ? 65533 : (t = Wy.get(e)) !== null && t !== void 0 ? t : e;
}
var Be;
(function(e) {
  e[e.NUM = 35] = "NUM", e[e.SEMI = 59] = "SEMI", e[e.EQUALS = 61] = "EQUALS", e[e.ZERO = 48] = "ZERO", e[e.NINE = 57] = "NINE", e[e.LOWER_A = 97] = "LOWER_A", e[e.LOWER_F = 102] = "LOWER_F", e[e.LOWER_X = 120] = "LOWER_X", e[e.LOWER_Z = 122] = "LOWER_Z", e[e.UPPER_A = 65] = "UPPER_A", e[e.UPPER_F = 70] = "UPPER_F", e[e.UPPER_Z = 90] = "UPPER_Z";
})(Be || (Be = {}));
const Yy = 32;
var mn;
(function(e) {
  e[e.VALUE_LENGTH = 49152] = "VALUE_LENGTH", e[e.BRANCH_LENGTH = 16256] = "BRANCH_LENGTH", e[e.JUMP_TABLE = 127] = "JUMP_TABLE";
})(mn || (mn = {}));
function $s(e) {
  return e >= Be.ZERO && e <= Be.NINE;
}
function Xy(e) {
  return e >= Be.UPPER_A && e <= Be.UPPER_F || e >= Be.LOWER_A && e <= Be.LOWER_F;
}
function Qy(e) {
  return e >= Be.UPPER_A && e <= Be.UPPER_Z || e >= Be.LOWER_A && e <= Be.LOWER_Z || $s(e);
}
function e3(e) {
  return e === Be.EQUALS || Qy(e);
}
var Ze;
(function(e) {
  e[e.EntityStart = 0] = "EntityStart", e[e.NumericStart = 1] = "NumericStart", e[e.NumericDecimal = 2] = "NumericDecimal", e[e.NumericHex = 3] = "NumericHex", e[e.NamedEntity = 4] = "NamedEntity";
})(Ze || (Ze = {}));
var nn;
(function(e) {
  e[e.Legacy = 0] = "Legacy", e[e.Strict = 1] = "Strict", e[e.Attribute = 2] = "Attribute";
})(nn || (nn = {}));
class t3 {
  constructor(t, n, r) {
    this.decodeTree = t, this.emitCodePoint = n, this.errors = r, this.state = Ze.EntityStart, this.consumed = 1, this.result = 0, this.treeIndex = 0, this.excess = 1, this.decodeMode = nn.Strict;
  }
  /** Resets the instance to make it reusable. */
  startEntity(t) {
    this.decodeMode = t, this.state = Ze.EntityStart, this.result = 0, this.treeIndex = 0, this.excess = 1, this.consumed = 1;
  }
  /**
   * Write an entity to the decoder. This can be called multiple times with partial entities.
   * If the entity is incomplete, the decoder will return -1.
   *
   * Mirrors the implementation of `getDecoder`, but with the ability to stop decoding if the
   * entity is incomplete, and resume when the next string is written.
   *
   * @param string The string containing the entity (or a continuation of the entity).
   * @param offset The offset at which the entity begins. Should be 0 if this is not the first call.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  write(t, n) {
    switch (this.state) {
      case Ze.EntityStart:
        return t.charCodeAt(n) === Be.NUM ? (this.state = Ze.NumericStart, this.consumed += 1, this.stateNumericStart(t, n + 1)) : (this.state = Ze.NamedEntity, this.stateNamedEntity(t, n));
      case Ze.NumericStart:
        return this.stateNumericStart(t, n);
      case Ze.NumericDecimal:
        return this.stateNumericDecimal(t, n);
      case Ze.NumericHex:
        return this.stateNumericHex(t, n);
      case Ze.NamedEntity:
        return this.stateNamedEntity(t, n);
    }
  }
  /**
   * Switches between the numeric decimal and hexadecimal states.
   *
   * Equivalent to the `Numeric character reference state` in the HTML spec.
   *
   * @param str The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNumericStart(t, n) {
    return n >= t.length ? -1 : (t.charCodeAt(n) | Yy) === Be.LOWER_X ? (this.state = Ze.NumericHex, this.consumed += 1, this.stateNumericHex(t, n + 1)) : (this.state = Ze.NumericDecimal, this.stateNumericDecimal(t, n));
  }
  addToNumericResult(t, n, r, u) {
    if (n !== r) {
      const o = r - n;
      this.result = this.result * Math.pow(u, o) + parseInt(t.substr(n, o), u), this.consumed += o;
    }
  }
  /**
   * Parses a hexadecimal numeric entity.
   *
   * Equivalent to the `Hexademical character reference state` in the HTML spec.
   *
   * @param str The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNumericHex(t, n) {
    const r = n;
    for (; n < t.length; ) {
      const u = t.charCodeAt(n);
      if ($s(u) || Xy(u))
        n += 1;
      else
        return this.addToNumericResult(t, r, n, 16), this.emitNumericEntity(u, 3);
    }
    return this.addToNumericResult(t, r, n, 16), -1;
  }
  /**
   * Parses a decimal numeric entity.
   *
   * Equivalent to the `Decimal character reference state` in the HTML spec.
   *
   * @param str The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNumericDecimal(t, n) {
    const r = n;
    for (; n < t.length; ) {
      const u = t.charCodeAt(n);
      if ($s(u))
        n += 1;
      else
        return this.addToNumericResult(t, r, n, 10), this.emitNumericEntity(u, 2);
    }
    return this.addToNumericResult(t, r, n, 10), -1;
  }
  /**
   * Validate and emit a numeric entity.
   *
   * Implements the logic from the `Hexademical character reference start
   * state` and `Numeric character reference end state` in the HTML spec.
   *
   * @param lastCp The last code point of the entity. Used to see if the
   *               entity was terminated with a semicolon.
   * @param expectedLength The minimum number of characters that should be
   *                       consumed. Used to validate that at least one digit
   *                       was consumed.
   * @returns The number of characters that were consumed.
   */
  emitNumericEntity(t, n) {
    var r;
    if (this.consumed <= n)
      return (r = this.errors) === null || r === void 0 || r.absenceOfDigitsInNumericCharacterReference(this.consumed), 0;
    if (t === Be.SEMI)
      this.consumed += 1;
    else if (this.decodeMode === nn.Strict)
      return 0;
    return this.emitCodePoint(Ky(this.result), this.consumed), this.errors && (t !== Be.SEMI && this.errors.missingSemicolonAfterCharacterReference(), this.errors.validateNumericCharacterReference(this.result)), this.consumed;
  }
  /**
   * Parses a named entity.
   *
   * Equivalent to the `Named character reference state` in the HTML spec.
   *
   * @param str The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNamedEntity(t, n) {
    const { decodeTree: r } = this;
    let u = r[this.treeIndex], o = (u & mn.VALUE_LENGTH) >> 14;
    for (; n < t.length; n++, this.excess++) {
      const s = t.charCodeAt(n);
      if (this.treeIndex = n3(r, u, this.treeIndex + Math.max(1, o), s), this.treeIndex < 0)
        return this.result === 0 || // If we are parsing an attribute
        this.decodeMode === nn.Attribute && // We shouldn't have consumed any characters after the entity,
        (o === 0 || // And there should be no invalid characters.
        e3(s)) ? 0 : this.emitNotTerminatedNamedEntity();
      if (u = r[this.treeIndex], o = (u & mn.VALUE_LENGTH) >> 14, o !== 0) {
        if (s === Be.SEMI)
          return this.emitNamedEntityData(this.treeIndex, o, this.consumed + this.excess);
        this.decodeMode !== nn.Strict && (this.result = this.treeIndex, this.consumed += this.excess, this.excess = 0);
      }
    }
    return -1;
  }
  /**
   * Emit a named entity that was not terminated with a semicolon.
   *
   * @returns The number of characters consumed.
   */
  emitNotTerminatedNamedEntity() {
    var t;
    const { result: n, decodeTree: r } = this, u = (r[n] & mn.VALUE_LENGTH) >> 14;
    return this.emitNamedEntityData(n, u, this.consumed), (t = this.errors) === null || t === void 0 || t.missingSemicolonAfterCharacterReference(), this.consumed;
  }
  /**
   * Emit a named entity.
   *
   * @param result The index of the entity in the decode tree.
   * @param valueLength The number of bytes in the entity.
   * @param consumed The number of characters consumed.
   *
   * @returns The number of characters consumed.
   */
  emitNamedEntityData(t, n, r) {
    const { decodeTree: u } = this;
    return this.emitCodePoint(n === 1 ? u[t] & ~mn.VALUE_LENGTH : u[t + 1], r), n === 3 && this.emitCodePoint(u[t + 2], r), r;
  }
  /**
   * Signal to the parser that the end of the input was reached.
   *
   * Remaining data will be emitted and relevant errors will be produced.
   *
   * @returns The number of characters consumed.
   */
  end() {
    var t;
    switch (this.state) {
      case Ze.NamedEntity:
        return this.result !== 0 && (this.decodeMode !== nn.Attribute || this.result === this.treeIndex) ? this.emitNotTerminatedNamedEntity() : 0;
      // Otherwise, emit a numeric entity if we have one.
      case Ze.NumericDecimal:
        return this.emitNumericEntity(0, 2);
      case Ze.NumericHex:
        return this.emitNumericEntity(0, 3);
      case Ze.NumericStart:
        return (t = this.errors) === null || t === void 0 || t.absenceOfDigitsInNumericCharacterReference(this.consumed), 0;
      case Ze.EntityStart:
        return 0;
    }
  }
}
function $d(e) {
  let t = "";
  const n = new t3(e, (r) => t += Gy(r));
  return function(u, o) {
    let s = 0, i = 0;
    for (; (i = u.indexOf("&", i)) >= 0; ) {
      t += u.slice(s, i), n.startEntity(o);
      const c = n.write(
        u,
        // Skip the "&"
        i + 1
      );
      if (c < 0) {
        s = i + n.end();
        break;
      }
      s = i + c, i = c === 0 ? s + 1 : s;
    }
    const a = t + u.slice(s);
    return t = "", a;
  };
}
function n3(e, t, n, r) {
  const u = (t & mn.BRANCH_LENGTH) >> 7, o = t & mn.JUMP_TABLE;
  if (u === 0)
    return o !== 0 && r === o ? n : -1;
  if (o) {
    const a = r - o;
    return a < 0 || a >= u ? -1 : e[n + a] - 1;
  }
  let s = n, i = s + u - 1;
  for (; s <= i; ) {
    const a = s + i >>> 1, c = e[a];
    if (c < r)
      s = a + 1;
    else if (c > r)
      i = a - 1;
    else
      return e[a + u];
  }
  return -1;
}
const Nd = $d(qy);
$d(Jy);
function r3(e, t = nn.Legacy) {
  return Nd(e, t);
}
function u3(e) {
  return Nd(e, nn.Strict);
}
function o3(e) {
  return Object.prototype.toString.call(e);
}
function bi(e) {
  return o3(e) === "[object String]";
}
const s3 = Object.prototype.hasOwnProperty;
function i3(e, t) {
  return s3.call(e, t);
}
function yo(e) {
  return Array.prototype.slice.call(arguments, 1).forEach(function(n) {
    if (n) {
      if (typeof n != "object")
        throw new TypeError(n + "must be object");
      Object.keys(n).forEach(function(r) {
        e[r] = n[r];
      });
    }
  }), e;
}
function Od(e, t, n) {
  return [].concat(e.slice(0, t), n, e.slice(t + 1));
}
function vi(e) {
  return !(e >= 55296 && e <= 57343 || e >= 64976 && e <= 65007 || (e & 65535) === 65535 || (e & 65535) === 65534 || e >= 0 && e <= 8 || e === 11 || e >= 14 && e <= 31 || e >= 127 && e <= 159 || e > 1114111);
}
function Ur(e) {
  if (e > 65535) {
    e -= 65536;
    const t = 55296 + (e >> 10), n = 56320 + (e & 1023);
    return String.fromCharCode(t, n);
  }
  return String.fromCharCode(e);
}
const Id = /\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g, a3 = /&([a-z#][a-z0-9]{1,31});/gi, c3 = new RegExp(Id.source + "|" + a3.source, "gi"), l3 = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))$/i;
function f3(e, t) {
  if (t.charCodeAt(0) === 35 && l3.test(t)) {
    const r = t[1].toLowerCase() === "x" ? parseInt(t.slice(2), 16) : parseInt(t.slice(1), 10);
    return vi(r) ? Ur(r) : e;
  }
  const n = r3(e);
  return n !== e ? n : e;
}
function d3(e) {
  return e.indexOf("\\") < 0 ? e : e.replace(Id, "$1");
}
function lr(e) {
  return e.indexOf("\\") < 0 && e.indexOf("&") < 0 ? e : e.replace(c3, function(t, n, r) {
    return n || f3(t, r);
  });
}
const p3 = /[&<>"]/, h3 = /[&<>"]/g, m3 = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;"
};
function g3(e) {
  return m3[e];
}
function En(e) {
  return p3.test(e) ? e.replace(h3, g3) : e;
}
const b3 = /[.?*+^$[\]\\(){}|-]/g;
function v3(e) {
  return e.replace(b3, "\\$&");
}
function ke(e) {
  switch (e) {
    case 9:
    case 32:
      return !0;
  }
  return !1;
}
function Hr(e) {
  if (e >= 8192 && e <= 8202)
    return !0;
  switch (e) {
    case 9:
    // \t
    case 10:
    // \n
    case 11:
    // \v
    case 12:
    // \f
    case 13:
    // \r
    case 32:
    case 160:
    case 5760:
    case 8239:
    case 8287:
    case 12288:
      return !0;
  }
  return !1;
}
function Td(e) {
  return gi.test(e) || Dd.test(e);
}
function qr(e) {
  return Td(Ur(e));
}
function Jr(e) {
  switch (e) {
    case 33:
    case 34:
    case 35:
    case 36:
    case 37:
    case 38:
    case 39:
    case 40:
    case 41:
    case 42:
    case 43:
    case 44:
    case 45:
    case 46:
    case 47:
    case 58:
    case 59:
    case 60:
    case 61:
    case 62:
    case 63:
    case 64:
    case 91:
    case 92:
    case 93:
    case 94:
    case 95:
    case 96:
    case 123:
    case 124:
    case 125:
    case 126:
      return !0;
    default:
      return !1;
  }
}
function xo(e) {
  return e = e.trim().replace(/\s+/g, " "), "ẞ".toLowerCase() === "Ṿ" && (e = e.replace(/ẞ/g, "ß")), e.toLowerCase().toUpperCase();
}
function sc(e) {
  return e === 32 || e === 9 || e === 10 || e === 13;
}
function Eo(e) {
  let t = 0;
  for (; t < e.length && sc(e.charCodeAt(t)); t++)
    ;
  let n = e.length - 1;
  for (; n >= t && sc(e.charCodeAt(n)); n--)
    ;
  return e.slice(t, n + 1);
}
const _3 = { mdurl: By, ucmicro: Hy }, y3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  arrayReplaceAt: Od,
  asciiTrim: Eo,
  assign: yo,
  escapeHtml: En,
  escapeRE: v3,
  fromCodePoint: Ur,
  has: i3,
  isMdAsciiPunct: Jr,
  isPunctChar: Td,
  isPunctCharCode: qr,
  isSpace: ke,
  isString: bi,
  isValidEntityCode: vi,
  isWhiteSpace: Hr,
  lib: _3,
  normalizeReference: xo,
  unescapeAll: lr,
  unescapeMd: d3
}, Symbol.toStringTag, { value: "Module" }));
function x3(e, t, n) {
  let r, u, o, s;
  const i = e.posMax, a = e.pos;
  for (e.pos = t + 1, r = 1; e.pos < i; ) {
    if (o = e.src.charCodeAt(e.pos), o === 93 && (r--, r === 0)) {
      u = !0;
      break;
    }
    if (s = e.pos, e.md.inline.skipToken(e), o === 91) {
      if (s === e.pos - 1)
        r++;
      else if (n)
        return e.pos = a, -1;
    }
  }
  let c = -1;
  return u && (c = e.pos), e.pos = a, c;
}
function E3(e, t, n) {
  let r, u = t;
  const o = {
    ok: !1,
    pos: 0,
    str: ""
  };
  if (e.charCodeAt(u) === 60) {
    for (u++; u < n; ) {
      if (r = e.charCodeAt(u), r === 10 || r === 60)
        return o;
      if (r === 62)
        return o.pos = u + 1, o.str = lr(e.slice(t + 1, u)), o.ok = !0, o;
      if (r === 92 && u + 1 < n) {
        u += 2;
        continue;
      }
      u++;
    }
    return o;
  }
  let s = 0;
  for (; u < n && (r = e.charCodeAt(u), !(r === 32 || r < 32 || r === 127)); ) {
    if (r === 92 && u + 1 < n) {
      if (e.charCodeAt(u + 1) === 32)
        break;
      u += 2;
      continue;
    }
    if (r === 40 && (s++, s > 32))
      return o;
    if (r === 41) {
      if (s === 0)
        break;
      s--;
    }
    u++;
  }
  return t === u || s !== 0 || (o.str = lr(e.slice(t, u)), o.pos = u, o.ok = !0), o;
}
function k3(e, t, n, r) {
  let u, o = t;
  const s = {
    // if `true`, this is a valid link title
    ok: !1,
    // if `true`, this link can be continued on the next line
    can_continue: !1,
    // if `ok`, it's the position of the first character after the closing marker
    pos: 0,
    // if `ok`, it's the unescaped title
    str: "",
    // expected closing marker character code
    marker: 0
  };
  if (r)
    s.str = r.str, s.marker = r.marker;
  else {
    if (o >= n)
      return s;
    let i = e.charCodeAt(o);
    if (i !== 34 && i !== 39 && i !== 40)
      return s;
    t++, o++, i === 40 && (i = 41), s.marker = i;
  }
  for (; o < n; ) {
    if (u = e.charCodeAt(o), u === s.marker)
      return s.pos = o + 1, s.str += lr(e.slice(t, o)), s.ok = !0, s;
    if (u === 40 && s.marker === 41)
      return s;
    u === 92 && o + 1 < n && o++, o++;
  }
  return s.can_continue = !0, s.str += lr(e.slice(t, o)), s;
}
const w3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  parseLinkDestination: E3,
  parseLinkLabel: x3,
  parseLinkTitle: k3
}, Symbol.toStringTag, { value: "Module" })), Gt = {};
Gt.code_inline = function(e, t, n, r, u) {
  const o = e[t];
  return "<code" + u.renderAttrs(o) + ">" + En(o.content) + "</code>";
};
Gt.code_block = function(e, t, n, r, u) {
  const o = e[t];
  return "<pre" + u.renderAttrs(o) + "><code>" + En(e[t].content) + `</code></pre>
`;
};
Gt.fence = function(e, t, n, r, u) {
  const o = e[t], s = o.info ? lr(o.info).trim() : "";
  let i = "", a = "";
  if (s) {
    const f = s.split(/(\s+)/g);
    i = f[0], a = f.slice(2).join("");
  }
  let c;
  if (n.highlight ? c = n.highlight(o.content, i, a) || En(o.content) : c = En(o.content), c.indexOf("<pre") === 0)
    return c + `
`;
  if (s) {
    const f = o.attrIndex("class"), l = o.attrs ? o.attrs.slice() : [];
    f < 0 ? l.push(["class", n.langPrefix + i]) : (l[f] = l[f].slice(), l[f][1] += " " + n.langPrefix + i);
    const d = {
      attrs: l
    };
    return `<pre><code${u.renderAttrs(d)}>${c}</code></pre>
`;
  }
  return `<pre><code${u.renderAttrs(o)}>${c}</code></pre>
`;
};
Gt.image = function(e, t, n, r, u) {
  const o = e[t];
  return o.attrs[o.attrIndex("alt")][1] = u.renderInlineAsText(o.children, n, r), u.renderToken(e, t, n);
};
Gt.hardbreak = function(e, t, n) {
  return n.xhtmlOut ? `<br />
` : `<br>
`;
};
Gt.softbreak = function(e, t, n) {
  return n.breaks ? n.xhtmlOut ? `<br />
` : `<br>
` : `
`;
};
Gt.text = function(e, t) {
  return En(e[t].content);
};
Gt.html_block = function(e, t) {
  return e[t].content;
};
Gt.html_inline = function(e, t) {
  return e[t].content;
};
function gr() {
  this.rules = yo({}, Gt);
}
gr.prototype.renderAttrs = function(t) {
  let n, r, u;
  if (!t.attrs)
    return "";
  for (u = "", n = 0, r = t.attrs.length; n < r; n++)
    u += " " + En(t.attrs[n][0]) + '="' + En(t.attrs[n][1]) + '"';
  return u;
};
gr.prototype.renderToken = function(t, n, r) {
  const u = t[n];
  let o = "";
  if (u.hidden)
    return "";
  u.block && u.nesting !== -1 && n && t[n - 1].hidden && (o += `
`), o += (u.nesting === -1 ? "</" : "<") + u.tag, o += this.renderAttrs(u), u.nesting === 0 && r.xhtmlOut && (o += " /");
  let s = !1;
  if (u.block && (s = !0, u.nesting === 1 && n + 1 < t.length)) {
    const i = t[n + 1];
    (i.type === "inline" || i.hidden || i.nesting === -1 && i.tag === u.tag) && (s = !1);
  }
  return o += s ? `>
` : ">", o;
};
gr.prototype.renderInline = function(e, t, n) {
  let r = "";
  const u = this.rules;
  for (let o = 0, s = e.length; o < s; o++) {
    const i = e[o].type;
    typeof u[i] < "u" ? r += u[i](e, o, t, n, this) : r += this.renderToken(e, o, t);
  }
  return r;
};
gr.prototype.renderInlineAsText = function(e, t, n) {
  let r = "";
  for (let u = 0, o = e.length; u < o; u++)
    switch (e[u].type) {
      case "text":
        r += e[u].content;
        break;
      case "image":
        r += this.renderInlineAsText(e[u].children, t, n);
        break;
      case "html_inline":
      case "html_block":
        r += e[u].content;
        break;
      case "softbreak":
      case "hardbreak":
        r += `
`;
        break;
    }
  return r;
};
gr.prototype.render = function(e, t, n) {
  let r = "";
  const u = this.rules;
  for (let o = 0, s = e.length; o < s; o++) {
    const i = e[o].type;
    i === "inline" ? r += this.renderInline(e[o].children, t, n) : typeof u[i] < "u" ? r += u[i](e, o, t, n, this) : r += this.renderToken(e, o, t, n);
  }
  return r;
};
function at() {
  this.__rules__ = [], this.__cache__ = null;
}
at.prototype.__find__ = function(e) {
  for (let t = 0; t < this.__rules__.length; t++)
    if (this.__rules__[t].name === e)
      return t;
  return -1;
};
at.prototype.__compile__ = function() {
  const e = this, t = [""];
  e.__rules__.forEach(function(n) {
    n.enabled && n.alt.forEach(function(r) {
      t.indexOf(r) < 0 && t.push(r);
    });
  }), e.__cache__ = {}, t.forEach(function(n) {
    e.__cache__[n] = [], e.__rules__.forEach(function(r) {
      r.enabled && (n && r.alt.indexOf(n) < 0 || e.__cache__[n].push(r.fn));
    });
  });
};
at.prototype.at = function(e, t, n) {
  const r = this.__find__(e), u = n || {};
  if (r === -1)
    throw new Error("Parser rule not found: " + e);
  this.__rules__[r].fn = t, this.__rules__[r].alt = u.alt || [], this.__cache__ = null;
};
at.prototype.before = function(e, t, n, r) {
  const u = this.__find__(e), o = r || {};
  if (u === -1)
    throw new Error("Parser rule not found: " + e);
  this.__rules__.splice(u, 0, {
    name: t,
    enabled: !0,
    fn: n,
    alt: o.alt || []
  }), this.__cache__ = null;
};
at.prototype.after = function(e, t, n, r) {
  const u = this.__find__(e), o = r || {};
  if (u === -1)
    throw new Error("Parser rule not found: " + e);
  this.__rules__.splice(u + 1, 0, {
    name: t,
    enabled: !0,
    fn: n,
    alt: o.alt || []
  }), this.__cache__ = null;
};
at.prototype.push = function(e, t, n) {
  const r = n || {};
  this.__rules__.push({
    name: e,
    enabled: !0,
    fn: t,
    alt: r.alt || []
  }), this.__cache__ = null;
};
at.prototype.enable = function(e, t) {
  Array.isArray(e) || (e = [e]);
  const n = [];
  return e.forEach(function(r) {
    const u = this.__find__(r);
    if (u < 0) {
      if (t)
        return;
      throw new Error("Rules manager: invalid rule name " + r);
    }
    this.__rules__[u].enabled = !0, n.push(r);
  }, this), this.__cache__ = null, n;
};
at.prototype.enableOnly = function(e, t) {
  Array.isArray(e) || (e = [e]), this.__rules__.forEach(function(n) {
    n.enabled = !1;
  }), this.enable(e, t);
};
at.prototype.disable = function(e, t) {
  Array.isArray(e) || (e = [e]);
  const n = [];
  return e.forEach(function(r) {
    const u = this.__find__(r);
    if (u < 0) {
      if (t)
        return;
      throw new Error("Rules manager: invalid rule name " + r);
    }
    this.__rules__[u].enabled = !1, n.push(r);
  }, this), this.__cache__ = null, n;
};
at.prototype.getRules = function(e) {
  return this.__cache__ === null && this.__compile__(), this.__cache__[e] || [];
};
function Tt(e, t, n) {
  this.type = e, this.tag = t, this.attrs = null, this.map = null, this.nesting = n, this.level = 0, this.children = null, this.content = "", this.markup = "", this.info = "", this.meta = null, this.block = !1, this.hidden = !1;
}
Tt.prototype.attrIndex = function(t) {
  if (!this.attrs)
    return -1;
  const n = this.attrs;
  for (let r = 0, u = n.length; r < u; r++)
    if (n[r][0] === t)
      return r;
  return -1;
};
Tt.prototype.attrPush = function(t) {
  this.attrs ? this.attrs.push(t) : this.attrs = [t];
};
Tt.prototype.attrSet = function(t, n) {
  const r = this.attrIndex(t), u = [t, n];
  r < 0 ? this.attrPush(u) : this.attrs[r] = u;
};
Tt.prototype.attrGet = function(t) {
  const n = this.attrIndex(t);
  let r = null;
  return n >= 0 && (r = this.attrs[n][1]), r;
};
Tt.prototype.attrJoin = function(t, n) {
  const r = this.attrIndex(t);
  r < 0 ? this.attrPush([t, n]) : this.attrs[r][1] = this.attrs[r][1] + " " + n;
};
function Fd(e, t, n) {
  this.src = e, this.env = n, this.tokens = [], this.inlineMode = !1, this.md = t;
}
Fd.prototype.Token = Tt;
const C3 = /\r\n?|\n/g, A3 = /\0/g;
function D3(e) {
  let t;
  t = e.src.replace(C3, `
`), t = t.replace(A3, "�"), e.src = t;
}
function S3(e) {
  let t;
  e.inlineMode ? (t = new e.Token("inline", "", 0), t.content = e.src, t.map = [0, 1], t.children = [], e.tokens.push(t)) : e.md.block.parse(e.src, e.md, e.env, e.tokens);
}
function $3(e) {
  const t = e.tokens;
  for (let n = 0, r = t.length; n < r; n++) {
    const u = t[n];
    u.type === "inline" && e.md.inline.parse(u.content, e.md, e.env, u.children);
  }
}
function N3(e) {
  return /^<a[>\s]/i.test(e);
}
function O3(e) {
  return /^<\/a\s*>/i.test(e);
}
function I3(e) {
  const t = e.tokens;
  if (e.md.options.linkify)
    for (let n = 0, r = t.length; n < r; n++) {
      if (t[n].type !== "inline" || !e.md.linkify.pretest(t[n].content))
        continue;
      let u = t[n].children, o = 0;
      for (let s = u.length - 1; s >= 0; s--) {
        const i = u[s];
        if (i.type === "link_close") {
          for (s--; u[s].level !== i.level && u[s].type !== "link_open"; )
            s--;
          continue;
        }
        if (i.type === "html_inline" && (N3(i.content) && o > 0 && o--, O3(i.content) && o++), !(o > 0) && i.type === "text" && e.md.linkify.test(i.content)) {
          const a = i.content;
          let c = e.md.linkify.match(a);
          const f = [];
          let l = i.level, d = 0;
          c.length > 0 && c[0].index === 0 && s > 0 && u[s - 1].type === "text_special" && (c = c.slice(1));
          for (let p = 0; p < c.length; p++) {
            const m = c[p].url, v = e.md.normalizeLink(m);
            if (!e.md.validateLink(v))
              continue;
            let _ = c[p].text;
            c[p].schema ? c[p].schema === "mailto:" && !/^mailto:/i.test(_) ? _ = e.md.normalizeLinkText("mailto:" + _).replace(/^mailto:/, "") : _ = e.md.normalizeLinkText(_) : _ = e.md.normalizeLinkText("http://" + _).replace(/^http:\/\//, "");
            const A = c[p].index;
            if (A > d) {
              const g = new e.Token("text", "", 0);
              g.content = a.slice(d, A), g.level = l, f.push(g);
            }
            const E = new e.Token("link_open", "a", 1);
            E.attrs = [["href", v]], E.level = l++, E.markup = "linkify", E.info = "auto", f.push(E);
            const h = new e.Token("text", "", 0);
            h.content = _, h.level = l, f.push(h);
            const w = new e.Token("link_close", "a", -1);
            w.level = --l, w.markup = "linkify", w.info = "auto", f.push(w), d = c[p].lastIndex;
          }
          if (d < a.length) {
            const p = new e.Token("text", "", 0);
            p.content = a.slice(d), p.level = l, f.push(p);
          }
          t[n].children = u = Od(u, s, f);
        }
      }
    }
}
const zd = /\+-|\.\.|\?\?\?\?|!!!!|,,|--/, T3 = /\((c|tm|r)\)/i, F3 = /\((c|tm|r)\)/ig, z3 = {
  c: "©",
  r: "®",
  tm: "™"
};
function M3(e, t) {
  return z3[t.toLowerCase()];
}
function P3(e) {
  let t = 0;
  for (let n = e.length - 1; n >= 0; n--) {
    const r = e[n];
    r.type === "text" && !t && (r.content = r.content.replace(F3, M3)), r.type === "link_open" && r.info === "auto" && t--, r.type === "link_close" && r.info === "auto" && t++;
  }
}
function R3(e) {
  let t = 0;
  for (let n = e.length - 1; n >= 0; n--) {
    const r = e[n];
    r.type === "text" && !t && zd.test(r.content) && (r.content = r.content.replace(/\+-/g, "±").replace(/\.{2,}/g, "…").replace(/([?!])…/g, "$1..").replace(/([?!]){4,}/g, "$1$1$1").replace(/,{2,}/g, ",").replace(/(^|[^-])---(?=[^-]|$)/mg, "$1—").replace(/(^|\s)--(?=\s|$)/mg, "$1–").replace(/(^|[^-\s])--(?=[^-\s]|$)/mg, "$1–")), r.type === "link_open" && r.info === "auto" && t--, r.type === "link_close" && r.info === "auto" && t++;
  }
}
function j3(e) {
  let t;
  if (e.md.options.typographer)
    for (t = e.tokens.length - 1; t >= 0; t--)
      e.tokens[t].type === "inline" && (T3.test(e.tokens[t].content) && P3(e.tokens[t].children), zd.test(e.tokens[t].content) && R3(e.tokens[t].children));
}
const L3 = /['"]/, ic = /['"]/g, ac = "’";
function bu(e, t, n, r) {
  e[t] || (e[t] = []), e[t].push({ pos: n, ch: r });
}
function Z3(e, t) {
  let n = "", r = 0;
  t.sort((u, o) => u.pos - o.pos);
  for (let u = 0; u < t.length; u++) {
    const o = t[u];
    n += e.slice(r, o.pos) + o.ch, r = o.pos + 1;
  }
  return n + e.slice(r);
}
function V3(e, t) {
  let n;
  const r = [], u = {};
  for (let o = 0; o < e.length; o++) {
    const s = e[o], i = e[o].level;
    for (n = r.length - 1; n >= 0 && !(r[n].level <= i); n--)
      ;
    if (r.length = n + 1, s.type !== "text")
      continue;
    const a = s.content;
    let c = 0;
    const f = a.length;
    e:
      for (; c < f; ) {
        ic.lastIndex = c;
        const l = ic.exec(a);
        if (!l)
          break;
        let d = !0, p = !0;
        c = l.index + 1;
        const m = l[0] === "'";
        let v = 32;
        if (l.index - 1 >= 0)
          v = a.charCodeAt(l.index - 1);
        else
          for (n = o - 1; n >= 0 && !(e[n].type === "softbreak" || e[n].type === "hardbreak"); n--)
            if (e[n].content) {
              v = e[n].content.charCodeAt(e[n].content.length - 1);
              break;
            }
        let _ = 32;
        if (c < f)
          _ = a.charCodeAt(c);
        else
          for (n = o + 1; n < e.length && !(e[n].type === "softbreak" || e[n].type === "hardbreak"); n++)
            if (e[n].content) {
              _ = e[n].content.charCodeAt(0);
              break;
            }
        const A = Jr(v) || qr(v), E = Jr(_) || qr(_), h = Hr(v), w = Hr(_);
        if (w ? d = !1 : E && (h || A || (d = !1)), h ? p = !1 : A && (w || E || (p = !1)), _ === 34 && l[0] === '"' && v >= 48 && v <= 57 && (p = d = !1), d && p && (d = A, p = E), !d && !p) {
          m && bu(u, o, l.index, ac);
          continue;
        }
        if (p)
          for (n = r.length - 1; n >= 0; n--) {
            let g = r[n];
            if (r[n].level < i)
              break;
            if (g.single === m && r[n].level === i) {
              g = r[n];
              let y, C;
              m ? (y = t.md.options.quotes[2], C = t.md.options.quotes[3]) : (y = t.md.options.quotes[0], C = t.md.options.quotes[1]), bu(u, o, l.index, C), bu(u, g.token, g.pos, y), r.length = n;
              continue e;
            }
          }
        d ? r.push({
          token: o,
          pos: l.index,
          single: m,
          level: i
        }) : p && m && bu(u, o, l.index, ac);
      }
  }
  Object.keys(u).forEach(function(o) {
    e[o].content = Z3(e[o].content, u[o]);
  });
}
function B3(e) {
  if (e.md.options.typographer)
    for (let t = e.tokens.length - 1; t >= 0; t--)
      e.tokens[t].type !== "inline" || !L3.test(e.tokens[t].content) || V3(e.tokens[t].children, e);
}
function U3(e) {
  let t, n;
  const r = e.tokens, u = r.length;
  for (let o = 0; o < u; o++) {
    if (r[o].type !== "inline") continue;
    const s = r[o].children, i = s.length;
    for (t = 0; t < i; t++)
      s[t].type === "text_special" && (s[t].type = "text");
    for (t = n = 0; t < i; t++)
      s[t].type === "text" && t + 1 < i && s[t + 1].type === "text" ? s[t + 1].content = s[t].content + s[t + 1].content : (t !== n && (s[n] = s[t]), n++);
    t !== n && (s.length = n);
  }
}
const Ho = [
  ["normalize", D3],
  ["block", S3],
  ["inline", $3],
  ["linkify", I3],
  ["replacements", j3],
  ["smartquotes", B3],
  // `text_join` finds `text_special` tokens (for escape sequences)
  // and joins them with the rest of the text
  ["text_join", U3]
];
function _i() {
  this.ruler = new at();
  for (let e = 0; e < Ho.length; e++)
    this.ruler.push(Ho[e][0], Ho[e][1]);
}
_i.prototype.process = function(e) {
  const t = this.ruler.getRules("");
  for (let n = 0, r = t.length; n < r; n++)
    t[n](e);
};
_i.prototype.State = Fd;
function Kt(e, t, n, r) {
  this.src = e, this.md = t, this.env = n, this.tokens = r, this.bMarks = [], this.eMarks = [], this.tShift = [], this.sCount = [], this.bsCount = [], this.blkIndent = 0, this.line = 0, this.lineMax = 0, this.tight = !1, this.ddIndent = -1, this.listIndent = -1, this.parentType = "root", this.level = 0;
  const u = this.src;
  for (let o = 0, s = 0, i = 0, a = 0, c = u.length, f = !1; s < c; s++) {
    const l = u.charCodeAt(s);
    if (!f)
      if (ke(l)) {
        i++, l === 9 ? a += 4 - a % 4 : a++;
        continue;
      } else
        f = !0;
    (l === 10 || s === c - 1) && (l !== 10 && s++, this.bMarks.push(o), this.eMarks.push(s), this.tShift.push(i), this.sCount.push(a), this.bsCount.push(0), f = !1, i = 0, a = 0, o = s + 1);
  }
  this.bMarks.push(u.length), this.eMarks.push(u.length), this.tShift.push(0), this.sCount.push(0), this.bsCount.push(0), this.lineMax = this.bMarks.length - 1;
}
Kt.prototype.push = function(e, t, n) {
  const r = new Tt(e, t, n);
  return r.block = !0, n < 0 && this.level--, r.level = this.level, n > 0 && this.level++, this.tokens.push(r), r;
};
Kt.prototype.isEmpty = function(t) {
  return this.bMarks[t] + this.tShift[t] >= this.eMarks[t];
};
Kt.prototype.skipEmptyLines = function(t) {
  for (let n = this.lineMax; t < n && !(this.bMarks[t] + this.tShift[t] < this.eMarks[t]); t++)
    ;
  return t;
};
Kt.prototype.skipSpaces = function(t) {
  for (let n = this.src.length; t < n; t++) {
    const r = this.src.charCodeAt(t);
    if (!ke(r))
      break;
  }
  return t;
};
Kt.prototype.skipSpacesBack = function(t, n) {
  if (t <= n)
    return t;
  for (; t > n; )
    if (!ke(this.src.charCodeAt(--t)))
      return t + 1;
  return t;
};
Kt.prototype.skipChars = function(t, n) {
  for (let r = this.src.length; t < r && this.src.charCodeAt(t) === n; t++)
    ;
  return t;
};
Kt.prototype.skipCharsBack = function(t, n, r) {
  if (t <= r)
    return t;
  for (; t > r; )
    if (n !== this.src.charCodeAt(--t))
      return t + 1;
  return t;
};
Kt.prototype.getLines = function(t, n, r, u) {
  if (t >= n)
    return "";
  const o = new Array(n - t);
  for (let s = 0, i = t; i < n; i++, s++) {
    let a = 0;
    const c = this.bMarks[i];
    let f = c, l;
    for (i + 1 < n || u ? l = this.eMarks[i] + 1 : l = this.eMarks[i]; f < l && a < r; ) {
      const d = this.src.charCodeAt(f);
      if (ke(d))
        d === 9 ? a += 4 - (a + this.bsCount[i]) % 4 : a++;
      else if (f - c < this.tShift[i])
        a++;
      else
        break;
      f++;
    }
    a > r ? o[s] = new Array(a - r + 1).join(" ") + this.src.slice(f, l) : o[s] = this.src.slice(f, l);
  }
  return o.join("");
};
Kt.prototype.Token = Tt;
const H3 = 65536;
function qo(e, t) {
  const n = e.bMarks[t] + e.tShift[t], r = e.eMarks[t];
  return e.src.slice(n, r);
}
function cc(e) {
  const t = [], n = e.length;
  let r = 0, u = e.charCodeAt(r), o = !1, s = 0, i = "";
  for (; r < n; )
    u === 124 && (o ? (i += e.substring(s, r - 1), s = r) : (t.push(i + e.substring(s, r)), i = "", s = r + 1)), o = u === 92, r++, u = e.charCodeAt(r);
  return t.push(i + e.substring(s)), t;
}
function q3(e, t, n, r) {
  if (t + 2 > n)
    return !1;
  let u = t + 1;
  if (e.sCount[u] < e.blkIndent || e.sCount[u] - e.blkIndent >= 4)
    return !1;
  let o = e.bMarks[u] + e.tShift[u];
  if (o >= e.eMarks[u])
    return !1;
  const s = e.src.charCodeAt(o++);
  if (s !== 124 && s !== 45 && s !== 58 || o >= e.eMarks[u])
    return !1;
  const i = e.src.charCodeAt(o++);
  if (i !== 124 && i !== 45 && i !== 58 && !ke(i) || s === 45 && ke(i))
    return !1;
  for (; o < e.eMarks[u]; ) {
    const w = e.src.charCodeAt(o);
    if (w !== 124 && w !== 45 && w !== 58 && !ke(w))
      return !1;
    o++;
  }
  let a = qo(e, t + 1), c = a.split("|");
  const f = [];
  for (let w = 0; w < c.length; w++) {
    const g = c[w].trim();
    if (!g) {
      if (w === 0 || w === c.length - 1)
        continue;
      return !1;
    }
    if (!/^:?-+:?$/.test(g))
      return !1;
    g.charCodeAt(g.length - 1) === 58 ? f.push(g.charCodeAt(0) === 58 ? "center" : "right") : g.charCodeAt(0) === 58 ? f.push("left") : f.push("");
  }
  if (a = qo(e, t).trim(), a.indexOf("|") === -1 || e.sCount[t] - e.blkIndent >= 4)
    return !1;
  c = cc(a), c.length && c[0] === "" && c.shift(), c.length && c[c.length - 1] === "" && c.pop();
  const l = c.length;
  if (l === 0 || l !== f.length)
    return !1;
  if (r)
    return !0;
  const d = e.parentType;
  e.parentType = "table";
  const p = e.md.block.ruler.getRules("blockquote"), m = e.push("table_open", "table", 1), v = [t, 0];
  m.map = v;
  const _ = e.push("thead_open", "thead", 1);
  _.map = [t, t + 1];
  const A = e.push("tr_open", "tr", 1);
  A.map = [t, t + 1];
  for (let w = 0; w < c.length; w++) {
    const g = e.push("th_open", "th", 1);
    f[w] && (g.attrs = [["style", "text-align:" + f[w]]]);
    const y = e.push("inline", "", 0);
    y.content = c[w].trim(), y.children = [], e.push("th_close", "th", -1);
  }
  e.push("tr_close", "tr", -1), e.push("thead_close", "thead", -1);
  let E, h = 0;
  for (u = t + 2; u < n && !(e.sCount[u] < e.blkIndent); u++) {
    let w = !1;
    for (let y = 0, C = p.length; y < C; y++)
      if (p[y](e, u, n, !0)) {
        w = !0;
        break;
      }
    if (w || (a = qo(e, u).trim(), !a) || e.sCount[u] - e.blkIndent >= 4 || (c = cc(a), c.length && c[0] === "" && c.shift(), c.length && c[c.length - 1] === "" && c.pop(), h += l - c.length, h > H3))
      break;
    if (u === t + 2) {
      const y = e.push("tbody_open", "tbody", 1);
      y.map = E = [t + 2, 0];
    }
    const g = e.push("tr_open", "tr", 1);
    g.map = [u, u + 1];
    for (let y = 0; y < l; y++) {
      const C = e.push("td_open", "td", 1);
      f[y] && (C.attrs = [["style", "text-align:" + f[y]]]);
      const k = e.push("inline", "", 0);
      k.content = c[y] ? c[y].trim() : "", k.children = [], e.push("td_close", "td", -1);
    }
    e.push("tr_close", "tr", -1);
  }
  return E && (e.push("tbody_close", "tbody", -1), E[1] = u), e.push("table_close", "table", -1), v[1] = u, e.parentType = d, e.line = u, !0;
}
function J3(e, t, n) {
  if (e.sCount[t] - e.blkIndent < 4)
    return !1;
  let r = t + 1, u = r;
  for (; r < n; ) {
    if (e.isEmpty(r)) {
      r++;
      continue;
    }
    if (e.sCount[r] - e.blkIndent >= 4) {
      r++, u = r;
      continue;
    }
    break;
  }
  e.line = u;
  const o = e.push("code_block", "code", 0);
  return o.content = e.getLines(t, u, 4 + e.blkIndent, !1) + `
`, o.map = [t, e.line], !0;
}
function W3(e, t, n, r) {
  let u = e.bMarks[t] + e.tShift[t], o = e.eMarks[t];
  if (e.sCount[t] - e.blkIndent >= 4 || u + 3 > o)
    return !1;
  const s = e.src.charCodeAt(u);
  if (s !== 126 && s !== 96)
    return !1;
  let i = u;
  u = e.skipChars(u, s);
  let a = u - i;
  if (a < 3)
    return !1;
  const c = e.src.slice(i, u), f = e.src.slice(u, o);
  if (s === 96 && f.indexOf(String.fromCharCode(s)) >= 0)
    return !1;
  if (r)
    return !0;
  let l = t, d = !1;
  for (; l++, !(l >= n || (u = i = e.bMarks[l] + e.tShift[l], o = e.eMarks[l], u < o && e.sCount[l] < e.blkIndent)); )
    if (e.src.charCodeAt(u) === s && !(e.sCount[l] - e.blkIndent >= 4) && (u = e.skipChars(u, s), !(u - i < a) && (u = e.skipSpaces(u), !(u < o)))) {
      d = !0;
      break;
    }
  a = e.sCount[t], e.line = l + (d ? 1 : 0);
  const p = e.push("fence", "code", 0);
  return p.info = f, p.content = e.getLines(t + 1, l, a, !0), p.markup = c, p.map = [t, e.line], !0;
}
function G3(e, t, n, r) {
  let u = e.bMarks[t] + e.tShift[t], o = e.eMarks[t];
  const s = e.lineMax;
  if (e.sCount[t] - e.blkIndent >= 4 || e.src.charCodeAt(u) !== 62)
    return !1;
  if (r)
    return !0;
  const i = [], a = [], c = [], f = [], l = e.md.block.ruler.getRules("blockquote"), d = e.parentType;
  e.parentType = "blockquote";
  let p = !1, m;
  for (m = t; m < n; m++) {
    const h = e.sCount[m] < e.blkIndent;
    if (u = e.bMarks[m] + e.tShift[m], o = e.eMarks[m], u >= o)
      break;
    if (e.src.charCodeAt(u++) === 62 && !h) {
      let g = e.sCount[m] + 1, y, C;
      e.src.charCodeAt(u) === 32 ? (u++, g++, C = !1, y = !0) : e.src.charCodeAt(u) === 9 ? (y = !0, (e.bsCount[m] + g) % 4 === 3 ? (u++, g++, C = !1) : C = !0) : y = !1;
      let k = g;
      for (i.push(e.bMarks[m]), e.bMarks[m] = u; u < o; ) {
        const Z = e.src.charCodeAt(u);
        if (ke(Z))
          Z === 9 ? k += 4 - (k + e.bsCount[m] + (C ? 1 : 0)) % 4 : k++;
        else
          break;
        u++;
      }
      p = u >= o, a.push(e.bsCount[m]), e.bsCount[m] = e.sCount[m] + 1 + (y ? 1 : 0), c.push(e.sCount[m]), e.sCount[m] = k - g, f.push(e.tShift[m]), e.tShift[m] = u - e.bMarks[m];
      continue;
    }
    if (p)
      break;
    let w = !1;
    for (let g = 0, y = l.length; g < y; g++)
      if (l[g](e, m, n, !0)) {
        w = !0;
        break;
      }
    if (w) {
      e.lineMax = m, e.blkIndent !== 0 && (i.push(e.bMarks[m]), a.push(e.bsCount[m]), f.push(e.tShift[m]), c.push(e.sCount[m]), e.sCount[m] -= e.blkIndent);
      break;
    }
    i.push(e.bMarks[m]), a.push(e.bsCount[m]), f.push(e.tShift[m]), c.push(e.sCount[m]), e.sCount[m] = -1;
  }
  const v = e.blkIndent;
  e.blkIndent = 0;
  const _ = e.push("blockquote_open", "blockquote", 1);
  _.markup = ">";
  const A = [t, 0];
  _.map = A, e.md.block.tokenize(e, t, m);
  const E = e.push("blockquote_close", "blockquote", -1);
  E.markup = ">", e.lineMax = s, e.parentType = d, A[1] = e.line;
  for (let h = 0; h < f.length; h++)
    e.bMarks[h + t] = i[h], e.tShift[h + t] = f[h], e.sCount[h + t] = c[h], e.bsCount[h + t] = a[h];
  return e.blkIndent = v, !0;
}
function K3(e, t, n, r) {
  const u = e.eMarks[t];
  if (e.sCount[t] - e.blkIndent >= 4)
    return !1;
  let o = e.bMarks[t] + e.tShift[t];
  const s = e.src.charCodeAt(o++);
  if (s !== 42 && s !== 45 && s !== 95)
    return !1;
  let i = 1;
  for (; o < u; ) {
    const c = e.src.charCodeAt(o++);
    if (c !== s && !ke(c))
      return !1;
    c === s && i++;
  }
  if (i < 3)
    return !1;
  if (r)
    return !0;
  e.line = t + 1;
  const a = e.push("hr", "hr", 0);
  return a.map = [t, e.line], a.markup = Array(i + 1).join(String.fromCharCode(s)), !0;
}
function lc(e, t) {
  const n = e.eMarks[t];
  let r = e.bMarks[t] + e.tShift[t];
  const u = e.src.charCodeAt(r++);
  if (u !== 42 && u !== 45 && u !== 43)
    return -1;
  if (r < n) {
    const o = e.src.charCodeAt(r);
    if (!ke(o))
      return -1;
  }
  return r;
}
function fc(e, t) {
  const n = e.bMarks[t] + e.tShift[t], r = e.eMarks[t];
  let u = n;
  if (u + 1 >= r)
    return -1;
  let o = e.src.charCodeAt(u++);
  if (o < 48 || o > 57)
    return -1;
  for (; ; ) {
    if (u >= r)
      return -1;
    if (o = e.src.charCodeAt(u++), o >= 48 && o <= 57) {
      if (u - n >= 10)
        return -1;
      continue;
    }
    if (o === 41 || o === 46)
      break;
    return -1;
  }
  return u < r && (o = e.src.charCodeAt(u), !ke(o)) ? -1 : u;
}
function Y3(e, t) {
  const n = e.level + 2;
  for (let r = t + 2, u = e.tokens.length - 2; r < u; r++)
    e.tokens[r].level === n && e.tokens[r].type === "paragraph_open" && (e.tokens[r + 2].hidden = !0, e.tokens[r].hidden = !0, r += 2);
}
function X3(e, t, n, r) {
  let u, o, s, i, a = t, c = !0;
  if (e.sCount[a] - e.blkIndent >= 4 || e.listIndent >= 0 && e.sCount[a] - e.listIndent >= 4 && e.sCount[a] < e.blkIndent)
    return !1;
  let f = !1;
  r && e.parentType === "paragraph" && e.sCount[a] >= e.blkIndent && (f = !0);
  let l, d, p;
  if ((p = fc(e, a)) >= 0) {
    if (l = !0, s = e.bMarks[a] + e.tShift[a], d = Number(e.src.slice(s, p - 1)), f && d !== 1) return !1;
  } else if ((p = lc(e, a)) >= 0)
    l = !1;
  else
    return !1;
  if (f && e.skipSpaces(p) >= e.eMarks[a])
    return !1;
  if (r)
    return !0;
  const m = e.src.charCodeAt(p - 1), v = e.tokens.length;
  l ? (i = e.push("ordered_list_open", "ol", 1), d !== 1 && (i.attrs = [["start", d]])) : i = e.push("bullet_list_open", "ul", 1);
  const _ = [a, 0];
  i.map = _, i.markup = String.fromCharCode(m);
  let A = !1;
  const E = e.md.block.ruler.getRules("list"), h = e.parentType;
  for (e.parentType = "list"; a < n; ) {
    o = p, u = e.eMarks[a];
    const w = e.sCount[a] + p - (e.bMarks[a] + e.tShift[a]);
    let g = w;
    for (; o < u; ) {
      const H = e.src.charCodeAt(o);
      if (H === 9)
        g += 4 - (g + e.bsCount[a]) % 4;
      else if (H === 32)
        g++;
      else
        break;
      o++;
    }
    const y = o;
    let C;
    y >= u ? C = 1 : C = g - w, C > 4 && (C = 1);
    const k = w + C;
    i = e.push("list_item_open", "li", 1), i.markup = String.fromCharCode(m);
    const Z = [a, 0];
    i.map = Z, l && (i.info = e.src.slice(s, p - 1));
    const W = e.tight, K = e.tShift[a], B = e.sCount[a], G = e.listIndent;
    if (e.listIndent = e.blkIndent, e.blkIndent = k, e.tight = !0, e.tShift[a] = y - e.bMarks[a], e.sCount[a] = g, y >= u && e.isEmpty(a + 1) ? e.line = Math.min(e.line + 2, n) : e.md.block.tokenize(e, a, n, !0), (!e.tight || A) && (c = !1), A = e.line - a > 1 && e.isEmpty(e.line - 1), e.blkIndent = e.listIndent, e.listIndent = G, e.tShift[a] = K, e.sCount[a] = B, e.tight = W, i = e.push("list_item_close", "li", -1), i.markup = String.fromCharCode(m), a = e.line, Z[1] = a, a >= n || e.sCount[a] < e.blkIndent || e.sCount[a] - e.blkIndent >= 4)
      break;
    let q = !1;
    for (let H = 0, N = E.length; H < N; H++)
      if (E[H](e, a, n, !0)) {
        q = !0;
        break;
      }
    if (q)
      break;
    if (l) {
      if (p = fc(e, a), p < 0)
        break;
      s = e.bMarks[a] + e.tShift[a];
    } else if (p = lc(e, a), p < 0)
      break;
    if (m !== e.src.charCodeAt(p - 1))
      break;
  }
  return l ? i = e.push("ordered_list_close", "ol", -1) : i = e.push("bullet_list_close", "ul", -1), i.markup = String.fromCharCode(m), _[1] = a, e.line = a, e.parentType = h, c && Y3(e, v), !0;
}
function Q3(e, t, n, r) {
  let u = e.bMarks[t] + e.tShift[t], o = e.eMarks[t], s = t + 1;
  if (e.sCount[t] - e.blkIndent >= 4 || e.src.charCodeAt(u) !== 91)
    return !1;
  function i(E) {
    const h = e.lineMax;
    if (E >= h || e.isEmpty(E))
      return null;
    let w = !1;
    if (e.sCount[E] - e.blkIndent > 3 && (w = !0), e.sCount[E] < 0 && (w = !0), !w) {
      const C = e.md.block.ruler.getRules("reference"), k = e.parentType;
      e.parentType = "reference";
      let Z = !1;
      for (let W = 0, K = C.length; W < K; W++)
        if (C[W](e, E, h, !0)) {
          Z = !0;
          break;
        }
      if (e.parentType = k, Z)
        return null;
    }
    const g = e.bMarks[E] + e.tShift[E], y = e.eMarks[E];
    return e.src.slice(g, y + 1);
  }
  let a = e.src.slice(u, o + 1);
  o = a.length;
  let c = -1;
  for (u = 1; u < o; u++) {
    const E = a.charCodeAt(u);
    if (E === 91)
      return !1;
    if (E === 93) {
      c = u;
      break;
    } else if (E === 10) {
      const h = i(s);
      h !== null && (a += h, o = a.length, s++);
    } else if (E === 92 && (u++, u < o && a.charCodeAt(u) === 10)) {
      const h = i(s);
      h !== null && (a += h, o = a.length, s++);
    }
  }
  if (c < 0 || a.charCodeAt(c + 1) !== 58)
    return !1;
  for (u = c + 2; u < o; u++) {
    const E = a.charCodeAt(u);
    if (E === 10) {
      const h = i(s);
      h !== null && (a += h, o = a.length, s++);
    } else if (!ke(E)) break;
  }
  const f = e.md.helpers.parseLinkDestination(a, u, o);
  if (!f.ok)
    return !1;
  const l = e.md.normalizeLink(f.str);
  if (!e.md.validateLink(l))
    return !1;
  u = f.pos;
  const d = u, p = s, m = u;
  for (; u < o; u++) {
    const E = a.charCodeAt(u);
    if (E === 10) {
      const h = i(s);
      h !== null && (a += h, o = a.length, s++);
    } else if (!ke(E)) break;
  }
  let v = e.md.helpers.parseLinkTitle(a, u, o);
  for (; v.can_continue; ) {
    const E = i(s);
    if (E === null) break;
    a += E, u = o, o = a.length, s++, v = e.md.helpers.parseLinkTitle(a, u, o, v);
  }
  let _;
  for (u < o && m !== u && v.ok ? (_ = v.str, u = v.pos) : (_ = "", u = d, s = p); u < o; ) {
    const E = a.charCodeAt(u);
    if (!ke(E))
      break;
    u++;
  }
  if (u < o && a.charCodeAt(u) !== 10 && _)
    for (_ = "", u = d, s = p; u < o; ) {
      const E = a.charCodeAt(u);
      if (!ke(E))
        break;
      u++;
    }
  if (u < o && a.charCodeAt(u) !== 10)
    return !1;
  const A = xo(a.slice(1, c));
  return A ? (r || (typeof e.env.references > "u" && (e.env.references = {}), typeof e.env.references[A] > "u" && (e.env.references[A] = { title: _, href: l }), e.line = s), !0) : !1;
}
const e6 = [
  "address",
  "article",
  "aside",
  "base",
  "basefont",
  "blockquote",
  "body",
  "caption",
  "center",
  "col",
  "colgroup",
  "dd",
  "details",
  "dialog",
  "dir",
  "div",
  "dl",
  "dt",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "frame",
  "frameset",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hr",
  "html",
  "iframe",
  "legend",
  "li",
  "link",
  "main",
  "menu",
  "menuitem",
  "nav",
  "noframes",
  "ol",
  "optgroup",
  "option",
  "p",
  "param",
  "search",
  "section",
  "summary",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "title",
  "tr",
  "track",
  "ul"
], t6 = "[a-zA-Z_:][a-zA-Z0-9:._-]*", n6 = "[^\"'=<>`\\x00-\\x20]+", r6 = "'[^']*'", u6 = '"[^"]*"', o6 = "(?:" + n6 + "|" + r6 + "|" + u6 + ")", s6 = "(?:\\s+" + t6 + "(?:\\s*=\\s*" + o6 + ")?)", Md = "<[A-Za-z][A-Za-z0-9\\-]*" + s6 + "*\\s*\\/?>", Pd = "<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>", i6 = "<!---?>|<!--(?:[^-]|-[^-]|--[^>])*-->", a6 = "<[?][\\s\\S]*?[?]>", c6 = "<![A-Za-z][^>]*>", l6 = "<!\\[CDATA\\[[\\s\\S]*?\\]\\]>", f6 = new RegExp("^(?:" + Md + "|" + Pd + "|" + i6 + "|" + a6 + "|" + c6 + "|" + l6 + ")"), d6 = new RegExp("^(?:" + Md + "|" + Pd + ")"), On = [
  [/^<(script|pre|style|textarea)(?=(\s|>|$))/i, /<\/(script|pre|style|textarea)>/i, !0],
  [/^<!--/, /-->/, !0],
  [/^<\?/, /\?>/, !0],
  [/^<![A-Z]/, />/, !0],
  [/^<!\[CDATA\[/, /\]\]>/, !0],
  [new RegExp("^</?(" + e6.join("|") + ")(?=(\\s|/?>|$))", "i"), /^$/, !0],
  [new RegExp(d6.source + "\\s*$"), /^$/, !1]
];
function p6(e, t, n, r) {
  let u = e.bMarks[t] + e.tShift[t], o = e.eMarks[t];
  if (e.sCount[t] - e.blkIndent >= 4 || !e.md.options.html || e.src.charCodeAt(u) !== 60)
    return !1;
  let s = e.src.slice(u, o), i = 0;
  for (; i < On.length && !On[i][0].test(s); i++)
    ;
  if (i === On.length)
    return !1;
  if (r)
    return On[i][2];
  let a = t + 1;
  const c = On[i][1].test("");
  if (!On[i][1].test(s)) {
    for (; a < n && !(e.sCount[a] < e.blkIndent && (c || !e.isEmpty(a))); a++)
      if (u = e.bMarks[a] + e.tShift[a], o = e.eMarks[a], s = e.src.slice(u, o), On[i][1].test(s)) {
        s.length !== 0 && a++;
        break;
      }
  }
  e.line = a;
  const f = e.push("html_block", "", 0);
  return f.map = [t, a], f.content = e.getLines(t, a, e.blkIndent, !0), !0;
}
function h6(e, t, n, r) {
  let u = e.bMarks[t] + e.tShift[t], o = e.eMarks[t];
  if (e.sCount[t] - e.blkIndent >= 4)
    return !1;
  let s = e.src.charCodeAt(u);
  if (s !== 35 || u >= o)
    return !1;
  let i = 1;
  for (s = e.src.charCodeAt(++u); s === 35 && u < o && i <= 6; )
    i++, s = e.src.charCodeAt(++u);
  if (i > 6 || u < o && !ke(s))
    return !1;
  if (r)
    return !0;
  o = e.skipSpacesBack(o, u);
  const a = e.skipCharsBack(o, 35, u);
  a > u && ke(e.src.charCodeAt(a - 1)) && (o = a), e.line = t + 1;
  const c = e.push("heading_open", "h" + String(i), 1);
  c.markup = "########".slice(0, i), c.map = [t, e.line];
  const f = e.push("inline", "", 0);
  f.content = Eo(e.src.slice(u, o)), f.map = [t, e.line], f.children = [];
  const l = e.push("heading_close", "h" + String(i), -1);
  return l.markup = "########".slice(0, i), !0;
}
function m6(e, t, n) {
  const r = e.md.block.ruler.getRules("paragraph");
  if (e.sCount[t] - e.blkIndent >= 4)
    return !1;
  const u = e.parentType;
  e.parentType = "paragraph";
  let o = 0, s, i = t + 1;
  for (; i < n && !e.isEmpty(i); i++) {
    if (e.sCount[i] - e.blkIndent > 3)
      continue;
    if (e.sCount[i] >= e.blkIndent) {
      let p = e.bMarks[i] + e.tShift[i];
      const m = e.eMarks[i];
      if (p < m && (s = e.src.charCodeAt(p), (s === 45 || s === 61) && (p = e.skipChars(p, s), p = e.skipSpaces(p), p >= m))) {
        o = s === 61 ? 1 : 2;
        break;
      }
    }
    if (e.sCount[i] < 0)
      continue;
    let d = !1;
    for (let p = 0, m = r.length; p < m; p++)
      if (r[p](e, i, n, !0)) {
        d = !0;
        break;
      }
    if (d)
      break;
  }
  if (!o)
    return e.parentType = u, !1;
  const a = Eo(e.getLines(t, i, e.blkIndent, !1));
  e.line = i + 1;
  const c = e.push("heading_open", "h" + String(o), 1);
  c.markup = String.fromCharCode(s), c.map = [t, e.line];
  const f = e.push("inline", "", 0);
  f.content = a, f.map = [t, e.line - 1], f.children = [];
  const l = e.push("heading_close", "h" + String(o), -1);
  return l.markup = String.fromCharCode(s), e.parentType = u, !0;
}
function g6(e, t, n) {
  const r = e.md.block.ruler.getRules("paragraph"), u = e.parentType;
  let o = t + 1;
  for (e.parentType = "paragraph"; o < n && !e.isEmpty(o); o++) {
    if (e.sCount[o] - e.blkIndent > 3 || e.sCount[o] < 0)
      continue;
    let c = !1;
    for (let f = 0, l = r.length; f < l; f++)
      if (r[f](e, o, n, !0)) {
        c = !0;
        break;
      }
    if (c)
      break;
  }
  const s = Eo(e.getLines(t, o, e.blkIndent, !1));
  e.line = o;
  const i = e.push("paragraph_open", "p", 1);
  i.map = [t, e.line];
  const a = e.push("inline", "", 0);
  return a.content = s, a.map = [t, e.line], a.children = [], e.push("paragraph_close", "p", -1), e.parentType = u, !0;
}
const vu = [
  // First 2 params - rule name & source. Secondary array - list of rules,
  // which can be terminated by this one.
  ["table", q3, ["paragraph", "reference"]],
  ["code", J3],
  ["fence", W3, ["paragraph", "reference", "blockquote", "list"]],
  ["blockquote", G3, ["paragraph", "reference", "blockquote", "list"]],
  ["hr", K3, ["paragraph", "reference", "blockquote", "list"]],
  ["list", X3, ["paragraph", "reference", "blockquote"]],
  ["reference", Q3],
  ["html_block", p6, ["paragraph", "reference", "blockquote"]],
  ["heading", h6, ["paragraph", "reference", "blockquote"]],
  ["lheading", m6],
  ["paragraph", g6]
];
function ko() {
  this.ruler = new at();
  for (let e = 0; e < vu.length; e++)
    this.ruler.push(vu[e][0], vu[e][1], { alt: (vu[e][2] || []).slice() });
}
ko.prototype.tokenize = function(e, t, n) {
  const r = this.ruler.getRules(""), u = r.length, o = e.md.options.maxNesting;
  let s = t, i = !1;
  for (; s < n && (e.line = s = e.skipEmptyLines(s), !(s >= n || e.sCount[s] < e.blkIndent)); ) {
    if (e.level >= o) {
      e.line = n;
      break;
    }
    const a = e.line;
    let c = !1;
    for (let f = 0; f < u; f++)
      if (c = r[f](e, s, n, !1), c) {
        if (a >= e.line)
          throw new Error("block rule didn't increment state.line");
        break;
      }
    if (!c) throw new Error("none of the block rules matched");
    e.tight = !i, e.isEmpty(e.line - 1) && (i = !0), s = e.line, s < n && e.isEmpty(s) && (i = !0, s++, e.line = s);
  }
};
ko.prototype.parse = function(e, t, n, r) {
  if (!e)
    return;
  const u = new this.State(e, t, n, r);
  this.tokenize(u, u.line, u.lineMax);
};
ko.prototype.State = Kt;
function iu(e, t, n, r) {
  this.src = e, this.env = n, this.md = t, this.tokens = r, this.tokens_meta = Array(r.length), this.pos = 0, this.posMax = this.src.length, this.level = 0, this.pending = "", this.pendingLevel = 0, this.cache = {}, this.delimiters = [], this._prev_delimiters = [], this.backticks = {}, this.backticksScanned = !1, this.linkLevel = 0;
}
iu.prototype.pushPending = function() {
  const e = new Tt("text", "", 0);
  return e.content = this.pending, e.level = this.pendingLevel, this.tokens.push(e), this.pending = "", e;
};
iu.prototype.push = function(e, t, n) {
  this.pending && this.pushPending();
  const r = new Tt(e, t, n);
  let u = null;
  return n < 0 && (this.level--, this.delimiters = this._prev_delimiters.pop()), r.level = this.level, n > 0 && (this.level++, this._prev_delimiters.push(this.delimiters), this.delimiters = [], u = { delimiters: this.delimiters }), this.pendingLevel = this.level, this.tokens.push(r), this.tokens_meta.push(u), r;
};
iu.prototype.scanDelims = function(e, t) {
  const n = this.posMax, r = this.src.charCodeAt(e);
  let u;
  if (e === 0)
    u = 32;
  else if (e === 1)
    u = this.src.charCodeAt(0), (u & 63488) === 55296 && (u = 65533);
  else if (u = this.src.charCodeAt(e - 1), (u & 64512) === 56320) {
    const _ = this.src.charCodeAt(e - 2);
    u = (_ & 64512) === 55296 ? 65536 + (_ - 55296 << 10) + (u - 56320) : 65533;
  } else (u & 64512) === 55296 && (u = 65533);
  let o = e;
  for (; o < n && this.src.charCodeAt(o) === r; )
    o++;
  const s = o - e;
  let i = o < n ? this.src.charCodeAt(o) : 32;
  if ((i & 64512) === 55296) {
    const _ = this.src.charCodeAt(o + 1);
    i = (_ & 64512) === 56320 ? 65536 + (i - 55296 << 10) + (_ - 56320) : 65533;
  } else (i & 64512) === 56320 && (i = 65533);
  const a = Jr(u) || qr(u), c = Jr(i) || qr(i), f = Hr(u), l = Hr(i), d = !l && (!c || f || a), p = !f && (!a || l || c);
  return { can_open: d && (t || !p || a), can_close: p && (t || !d || c), length: s };
};
iu.prototype.Token = Tt;
function b6(e) {
  switch (e) {
    case 10:
    case 33:
    case 35:
    case 36:
    case 37:
    case 38:
    case 42:
    case 43:
    case 45:
    case 58:
    case 60:
    case 61:
    case 62:
    case 64:
    case 91:
    case 92:
    case 93:
    case 94:
    case 95:
    case 96:
    case 123:
    case 125:
    case 126:
      return !0;
    default:
      return !1;
  }
}
function v6(e, t) {
  let n = e.pos;
  for (; n < e.posMax && !b6(e.src.charCodeAt(n)); )
    n++;
  return n === e.pos ? !1 : (t || (e.pending += e.src.slice(e.pos, n)), e.pos = n, !0);
}
const _6 = /(?:^|[^a-z0-9.+-])([a-z][a-z0-9.+-]*)$/i;
function y6(e, t) {
  if (!e.md.options.linkify || e.linkLevel > 0) return !1;
  const n = e.pos, r = e.posMax;
  if (n + 3 > r || e.src.charCodeAt(n) !== 58 || e.src.charCodeAt(n + 1) !== 47 || e.src.charCodeAt(n + 2) !== 47) return !1;
  const u = e.pending.match(_6);
  if (!u) return !1;
  const o = u[1], s = e.md.linkify.matchAtStart(e.src.slice(n - o.length));
  if (!s) return !1;
  let i = s.url;
  if (i.length <= o.length) return !1;
  let a = i.length;
  for (; a > 0 && i.charCodeAt(a - 1) === 42; )
    a--;
  a !== i.length && (i = i.slice(0, a));
  const c = e.md.normalizeLink(i);
  if (!e.md.validateLink(c)) return !1;
  if (!t) {
    e.pending = e.pending.slice(0, -o.length);
    const f = e.push("link_open", "a", 1);
    f.attrs = [["href", c]], f.markup = "linkify", f.info = "auto";
    const l = e.push("text", "", 0);
    l.content = e.md.normalizeLinkText(i);
    const d = e.push("link_close", "a", -1);
    d.markup = "linkify", d.info = "auto";
  }
  return e.pos += i.length - o.length, !0;
}
function x6(e, t) {
  let n = e.pos;
  if (e.src.charCodeAt(n) !== 10)
    return !1;
  const r = e.pending.length - 1, u = e.posMax;
  if (!t)
    if (r >= 0 && e.pending.charCodeAt(r) === 32)
      if (r >= 1 && e.pending.charCodeAt(r - 1) === 32) {
        let o = r - 1;
        for (; o >= 1 && e.pending.charCodeAt(o - 1) === 32; ) o--;
        e.pending = e.pending.slice(0, o), e.push("hardbreak", "br", 0);
      } else
        e.pending = e.pending.slice(0, -1), e.push("softbreak", "br", 0);
    else
      e.push("softbreak", "br", 0);
  for (n++; n < u && ke(e.src.charCodeAt(n)); )
    n++;
  return e.pos = n, !0;
}
const yi = [];
for (let e = 0; e < 256; e++)
  yi.push(0);
"\\!\"#$%&'()*+,./:;<=>?@[]^_`{|}~-".split("").forEach(function(e) {
  yi[e.charCodeAt(0)] = 1;
});
function E6(e, t) {
  let n = e.pos;
  const r = e.posMax;
  if (e.src.charCodeAt(n) !== 92 || (n++, n >= r)) return !1;
  let u = e.src.charCodeAt(n);
  if (u === 10) {
    for (t || e.push("hardbreak", "br", 0), n++; n < r && (u = e.src.charCodeAt(n), !!ke(u)); )
      n++;
    return e.pos = n, !0;
  }
  if (u === 32) {
    if (!t) {
      const i = e.push("text_special", "", 0);
      i.content = "\\", i.markup = "\\", i.info = "escape";
    }
    return e.pos = n, !0;
  }
  let o = e.src[n];
  if (u >= 55296 && u <= 56319 && n + 1 < r) {
    const i = e.src.charCodeAt(n + 1);
    i >= 56320 && i <= 57343 && (o += e.src[n + 1], n++);
  }
  const s = "\\" + o;
  if (!t) {
    const i = e.push("text_special", "", 0);
    u < 256 && yi[u] !== 0 ? i.content = o : i.content = s, i.markup = s, i.info = "escape";
  }
  return e.pos = n + 1, !0;
}
function k6(e, t) {
  let n = e.pos;
  if (e.src.charCodeAt(n) !== 96)
    return !1;
  const u = n;
  n++;
  const o = e.posMax;
  for (; n < o && e.src.charCodeAt(n) === 96; )
    n++;
  const s = e.src.slice(u, n), i = s.length;
  if (e.backticksScanned && (e.backticks[i] || 0) <= u)
    return t || (e.pending += s), e.pos += i, !0;
  let a = n, c;
  for (; (c = e.src.indexOf("`", a)) !== -1; ) {
    for (a = c + 1; a < o && e.src.charCodeAt(a) === 96; )
      a++;
    const f = a - c;
    if (f === i) {
      if (!t) {
        const l = e.push("code_inline", "code", 0);
        l.markup = s, l.content = e.src.slice(n, c).replace(/\n/g, " ").replace(/^ (.+) $/, "$1");
      }
      return e.pos = a, !0;
    }
    e.backticks[f] = c;
  }
  return e.backticksScanned = !0, t || (e.pending += s), e.pos += i, !0;
}
function w6(e, t) {
  const n = e.pos, r = e.src.charCodeAt(n);
  if (t || r !== 126)
    return !1;
  const u = e.scanDelims(e.pos, !0);
  let o = u.length;
  const s = String.fromCharCode(r);
  if (o < 2)
    return !1;
  let i;
  o % 2 && (i = e.push("text", "", 0), i.content = s, o--);
  for (let a = 0; a < o; a += 2)
    i = e.push("text", "", 0), i.content = s + s, e.delimiters.push({
      marker: r,
      length: 0,
      // disable "rule of 3" length checks meant for emphasis
      token: e.tokens.length - 1,
      end: -1,
      open: u.can_open,
      close: u.can_close
    });
  return e.pos += u.length, !0;
}
function dc(e, t) {
  let n;
  const r = [], u = t.length;
  for (let o = 0; o < u; o++) {
    const s = t[o];
    if (s.marker !== 126 || s.end === -1)
      continue;
    const i = t[s.end];
    n = e.tokens[s.token], n.type = "s_open", n.tag = "s", n.nesting = 1, n.markup = "~~", n.content = "", n = e.tokens[i.token], n.type = "s_close", n.tag = "s", n.nesting = -1, n.markup = "~~", n.content = "", e.tokens[i.token - 1].type === "text" && e.tokens[i.token - 1].content === "~" && r.push(i.token - 1);
  }
  for (; r.length; ) {
    const o = r.pop();
    let s = o + 1;
    for (; s < e.tokens.length && e.tokens[s].type === "s_close"; )
      s++;
    s--, o !== s && (n = e.tokens[s], e.tokens[s] = e.tokens[o], e.tokens[o] = n);
  }
}
function C6(e) {
  const t = e.tokens_meta, n = e.tokens_meta.length;
  dc(e, e.delimiters);
  for (let r = 0; r < n; r++)
    t[r] && t[r].delimiters && dc(e, t[r].delimiters);
}
const Rd = {
  tokenize: w6,
  postProcess: C6
};
function A6(e, t) {
  const n = e.pos, r = e.src.charCodeAt(n);
  if (t || r !== 95 && r !== 42)
    return !1;
  const u = e.scanDelims(e.pos, r === 42);
  for (let o = 0; o < u.length; o++) {
    const s = e.push("text", "", 0);
    s.content = String.fromCharCode(r), e.delimiters.push({
      // Char code of the starting marker (number).
      //
      marker: r,
      // Total length of these series of delimiters.
      //
      length: u.length,
      // A position of the token this delimiter corresponds to.
      //
      token: e.tokens.length - 1,
      // If this delimiter is matched as a valid opener, `end` will be
      // equal to its position, otherwise it's `-1`.
      //
      end: -1,
      // Boolean flags that determine if this delimiter could open or close
      // an emphasis.
      //
      open: u.can_open,
      close: u.can_close
    });
  }
  return e.pos += u.length, !0;
}
function pc(e, t) {
  const n = t.length;
  for (let r = n - 1; r >= 0; r--) {
    const u = t[r];
    if (u.marker !== 95 && u.marker !== 42 || u.end === -1)
      continue;
    const o = t[u.end], s = r > 0 && t[r - 1].end === u.end + 1 && // check that first two markers match and adjacent
    t[r - 1].marker === u.marker && t[r - 1].token === u.token - 1 && // check that last two markers are adjacent (we can safely assume they match)
    t[u.end + 1].token === o.token + 1, i = String.fromCharCode(u.marker), a = e.tokens[u.token];
    a.type = s ? "strong_open" : "em_open", a.tag = s ? "strong" : "em", a.nesting = 1, a.markup = s ? i + i : i, a.content = "";
    const c = e.tokens[o.token];
    c.type = s ? "strong_close" : "em_close", c.tag = s ? "strong" : "em", c.nesting = -1, c.markup = s ? i + i : i, c.content = "", s && (e.tokens[t[r - 1].token].content = "", e.tokens[t[u.end + 1].token].content = "", r--);
  }
}
function D6(e) {
  const t = e.tokens_meta, n = e.tokens_meta.length;
  pc(e, e.delimiters);
  for (let r = 0; r < n; r++)
    t[r] && t[r].delimiters && pc(e, t[r].delimiters);
}
const jd = {
  tokenize: A6,
  postProcess: D6
};
function S6(e, t) {
  let n, r, u, o, s = "", i = "", a = e.pos, c = !0;
  if (e.src.charCodeAt(e.pos) !== 91)
    return !1;
  const f = e.pos, l = e.posMax, d = e.pos + 1, p = e.md.helpers.parseLinkLabel(e, e.pos, !0);
  if (p < 0)
    return !1;
  let m = p + 1;
  if (m < l && e.src.charCodeAt(m) === 40) {
    for (c = !1, m++; m < l && (n = e.src.charCodeAt(m), !(!ke(n) && n !== 10)); m++)
      ;
    if (m >= l)
      return !1;
    if (a = m, u = e.md.helpers.parseLinkDestination(e.src, m, e.posMax), u.ok) {
      for (s = e.md.normalizeLink(u.str), e.md.validateLink(s) ? m = u.pos : s = "", a = m; m < l && (n = e.src.charCodeAt(m), !(!ke(n) && n !== 10)); m++)
        ;
      if (u = e.md.helpers.parseLinkTitle(e.src, m, e.posMax), m < l && a !== m && u.ok)
        for (i = u.str, m = u.pos; m < l && (n = e.src.charCodeAt(m), !(!ke(n) && n !== 10)); m++)
          ;
    }
    (m >= l || e.src.charCodeAt(m) !== 41) && (c = !0), m++;
  }
  if (c) {
    if (typeof e.env.references > "u")
      return !1;
    if (m < l && e.src.charCodeAt(m) === 91 ? (a = m + 1, m = e.md.helpers.parseLinkLabel(e, m), m >= 0 ? r = e.src.slice(a, m++) : m = p + 1) : m = p + 1, r || (r = e.src.slice(d, p)), o = e.env.references[xo(r)], !o)
      return e.pos = f, !1;
    s = o.href, i = o.title;
  }
  if (!t) {
    e.pos = d, e.posMax = p;
    const v = e.push("link_open", "a", 1), _ = [["href", s]];
    v.attrs = _, i && _.push(["title", i]), e.linkLevel++, e.md.inline.tokenize(e), e.linkLevel--, e.push("link_close", "a", -1);
  }
  return e.pos = m, e.posMax = l, !0;
}
function $6(e, t) {
  let n, r, u, o, s, i, a, c, f = "";
  const l = e.pos, d = e.posMax;
  if (e.src.charCodeAt(e.pos) !== 33 || e.src.charCodeAt(e.pos + 1) !== 91)
    return !1;
  const p = e.pos + 2, m = e.md.helpers.parseLinkLabel(e, e.pos + 1, !1);
  if (m < 0)
    return !1;
  if (o = m + 1, o < d && e.src.charCodeAt(o) === 40) {
    for (o++; o < d && (n = e.src.charCodeAt(o), !(!ke(n) && n !== 10)); o++)
      ;
    if (o >= d)
      return !1;
    for (c = o, i = e.md.helpers.parseLinkDestination(e.src, o, e.posMax), i.ok && (f = e.md.normalizeLink(i.str), e.md.validateLink(f) ? o = i.pos : f = ""), c = o; o < d && (n = e.src.charCodeAt(o), !(!ke(n) && n !== 10)); o++)
      ;
    if (i = e.md.helpers.parseLinkTitle(e.src, o, e.posMax), o < d && c !== o && i.ok)
      for (a = i.str, o = i.pos; o < d && (n = e.src.charCodeAt(o), !(!ke(n) && n !== 10)); o++)
        ;
    else
      a = "";
    if (o >= d || e.src.charCodeAt(o) !== 41)
      return e.pos = l, !1;
    o++;
  } else {
    if (typeof e.env.references > "u")
      return !1;
    if (o < d && e.src.charCodeAt(o) === 91 ? (c = o + 1, o = e.md.helpers.parseLinkLabel(e, o), o >= 0 ? u = e.src.slice(c, o++) : o = m + 1) : o = m + 1, u || (u = e.src.slice(p, m)), s = e.env.references[xo(u)], !s)
      return e.pos = l, !1;
    f = s.href, a = s.title;
  }
  if (!t) {
    r = e.src.slice(p, m);
    const v = [];
    e.md.inline.parse(
      r,
      e.md,
      e.env,
      v
    );
    const _ = e.push("image", "img", 0), A = [["src", f], ["alt", ""]];
    _.attrs = A, _.children = v, _.content = r, a && A.push(["title", a]);
  }
  return e.pos = o, e.posMax = d, !0;
}
const N6 = /^([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$/, O6 = /^([a-zA-Z][a-zA-Z0-9+.-]{1,31}):([^<>\x00-\x20]*)$/;
function I6(e, t) {
  let n = e.pos;
  if (e.src.charCodeAt(n) !== 60)
    return !1;
  const r = e.pos, u = e.posMax;
  for (; ; ) {
    if (++n >= u) return !1;
    const s = e.src.charCodeAt(n);
    if (s === 60) return !1;
    if (s === 62) break;
  }
  const o = e.src.slice(r + 1, n);
  if (O6.test(o)) {
    const s = e.md.normalizeLink(o);
    if (!e.md.validateLink(s))
      return !1;
    if (!t) {
      const i = e.push("link_open", "a", 1);
      i.attrs = [["href", s]], i.markup = "autolink", i.info = "auto";
      const a = e.push("text", "", 0);
      a.content = e.md.normalizeLinkText(o);
      const c = e.push("link_close", "a", -1);
      c.markup = "autolink", c.info = "auto";
    }
    return e.pos += o.length + 2, !0;
  }
  if (N6.test(o)) {
    const s = e.md.normalizeLink("mailto:" + o);
    if (!e.md.validateLink(s))
      return !1;
    if (!t) {
      const i = e.push("link_open", "a", 1);
      i.attrs = [["href", s]], i.markup = "autolink", i.info = "auto";
      const a = e.push("text", "", 0);
      a.content = e.md.normalizeLinkText(o);
      const c = e.push("link_close", "a", -1);
      c.markup = "autolink", c.info = "auto";
    }
    return e.pos += o.length + 2, !0;
  }
  return !1;
}
function T6(e) {
  return /^<a[>\s]/i.test(e);
}
function F6(e) {
  return /^<\/a\s*>/i.test(e);
}
function z6(e) {
  const t = e | 32;
  return t >= 97 && t <= 122;
}
function M6(e, t) {
  if (!e.md.options.html)
    return !1;
  const n = e.posMax, r = e.pos;
  if (e.src.charCodeAt(r) !== 60 || r + 2 >= n)
    return !1;
  const u = e.src.charCodeAt(r + 1);
  if (u !== 33 && u !== 63 && u !== 47 && !z6(u))
    return !1;
  const o = e.src.slice(r).match(f6);
  if (!o)
    return !1;
  if (!t) {
    const s = e.push("html_inline", "", 0);
    s.content = o[0], T6(s.content) && e.linkLevel++, F6(s.content) && e.linkLevel--;
  }
  return e.pos += o[0].length, !0;
}
const P6 = /^&#((?:x[a-f0-9]{1,6}|[0-9]{1,7}));/i, R6 = /^&([a-z][a-z0-9]{1,31});/i;
function j6(e, t) {
  const n = e.pos, r = e.posMax;
  if (e.src.charCodeAt(n) !== 38 || n + 1 >= r) return !1;
  if (e.src.charCodeAt(n + 1) === 35) {
    const o = e.src.slice(n).match(P6);
    if (o) {
      if (!t) {
        const s = o[1][0].toLowerCase() === "x" ? parseInt(o[1].slice(1), 16) : parseInt(o[1], 10), i = e.push("text_special", "", 0);
        i.content = vi(s) ? Ur(s) : Ur(65533), i.markup = o[0], i.info = "entity";
      }
      return e.pos += o[0].length, !0;
    }
  } else {
    const o = e.src.slice(n).match(R6);
    if (o) {
      const s = u3(o[0]);
      if (s !== o[0]) {
        if (!t) {
          const i = e.push("text_special", "", 0);
          i.content = s, i.markup = o[0], i.info = "entity";
        }
        return e.pos += o[0].length, !0;
      }
    }
  }
  return !1;
}
function hc(e) {
  const t = {}, n = e.length;
  if (!n) return;
  let r = 0, u = -2;
  const o = [];
  for (let s = 0; s < n; s++) {
    const i = e[s];
    if (o.push(0), (e[r].marker !== i.marker || u !== i.token - 1) && (r = s), u = i.token, i.length = i.length || 0, !i.close) continue;
    t.hasOwnProperty(i.marker) || (t[i.marker] = [-1, -1, -1, -1, -1, -1]);
    const a = t[i.marker][(i.open ? 3 : 0) + i.length % 3];
    let c = r - o[r] - 1, f = c;
    for (; c > a; c -= o[c] + 1) {
      const l = e[c];
      if (l.marker === i.marker && l.open && l.end < 0) {
        let d = !1;
        if ((l.close || i.open) && (l.length + i.length) % 3 === 0 && (l.length % 3 !== 0 || i.length % 3 !== 0) && (d = !0), !d) {
          const p = c > 0 && !e[c - 1].open ? o[c - 1] + 1 : 0;
          o[s] = s - c + p, o[c] = p, i.open = !1, l.end = s, l.close = !1, f = -1, u = -2;
          break;
        }
      }
    }
    f !== -1 && (t[i.marker][(i.open ? 3 : 0) + (i.length || 0) % 3] = f);
  }
}
function L6(e) {
  const t = e.tokens_meta, n = e.tokens_meta.length;
  hc(e.delimiters);
  for (let r = 0; r < n; r++)
    t[r] && t[r].delimiters && hc(t[r].delimiters);
}
function Z6(e) {
  let t, n, r = 0;
  const u = e.tokens, o = e.tokens.length;
  for (t = n = 0; t < o; t++)
    u[t].nesting < 0 && r--, u[t].level = r, u[t].nesting > 0 && r++, u[t].type === "text" && t + 1 < o && u[t + 1].type === "text" ? u[t + 1].content = u[t].content + u[t + 1].content : (t !== n && (u[n] = u[t]), n++);
  t !== n && (u.length = n);
}
const Jo = [
  ["text", v6],
  ["linkify", y6],
  ["newline", x6],
  ["escape", E6],
  ["backticks", k6],
  ["strikethrough", Rd.tokenize],
  ["emphasis", jd.tokenize],
  ["link", S6],
  ["image", $6],
  ["autolink", I6],
  ["html_inline", M6],
  ["entity", j6]
], Wo = [
  ["balance_pairs", L6],
  ["strikethrough", Rd.postProcess],
  ["emphasis", jd.postProcess],
  // rules for pairs separate '**' into its own text tokens, which may be left unused,
  // rule below merges unused segments back with the rest of the text
  ["fragments_join", Z6]
];
function au() {
  this.ruler = new at();
  for (let e = 0; e < Jo.length; e++)
    this.ruler.push(Jo[e][0], Jo[e][1]);
  this.ruler2 = new at();
  for (let e = 0; e < Wo.length; e++)
    this.ruler2.push(Wo[e][0], Wo[e][1]);
}
au.prototype.skipToken = function(e) {
  const t = e.pos, n = this.ruler.getRules(""), r = n.length, u = e.md.options.maxNesting, o = e.cache;
  if (typeof o[t] < "u") {
    e.pos = o[t];
    return;
  }
  let s = !1;
  if (e.level < u) {
    for (let i = 0; i < r; i++)
      if (e.level++, s = n[i](e, !0), e.level--, s) {
        if (t >= e.pos)
          throw new Error("inline rule didn't increment state.pos");
        break;
      }
  } else
    e.pos = e.posMax;
  s || e.pos++, o[t] = e.pos;
};
au.prototype.tokenize = function(e) {
  const t = this.ruler.getRules(""), n = t.length, r = e.posMax, u = e.md.options.maxNesting;
  for (; e.pos < r; ) {
    const o = e.pos;
    let s = !1;
    if (e.level < u) {
      for (let i = 0; i < n; i++)
        if (s = t[i](e, !1), s) {
          if (o >= e.pos)
            throw new Error("inline rule didn't increment state.pos");
          break;
        }
    }
    if (s) {
      if (e.pos >= r)
        break;
      continue;
    }
    e.pending += e.src[e.pos++];
  }
  e.pending && e.pushPending();
};
au.prototype.parse = function(e, t, n, r) {
  const u = new this.State(e, t, n, r);
  this.tokenize(u);
  const o = this.ruler2.getRules(""), s = o.length;
  for (let i = 0; i < s; i++)
    o[i](u);
};
au.prototype.State = iu;
function V6(e) {
  const t = {};
  e = e || {}, t.src_Any = Cd.source, t.src_Cc = Ad.source, t.src_Z = Sd.source, t.src_P = gi.source, t.src_ZPCc = [t.src_Z, t.src_P, t.src_Cc].join("|"), t.src_ZCc = [t.src_Z, t.src_Cc].join("|");
  const n = "[><｜]";
  return t.src_pseudo_letter = `(?:(?!${n}|${t.src_ZPCc})${t.src_Any})`, t.src_ip4 = "(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)", t.src_auth = `(?:(?:(?!${t.src_ZCc}|[@/\\[\\]()]).){1,50}@)?`, t.src_port = "(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?", t.src_host_terminator = `(?=$|${n}|${t.src_ZPCc})(?!${e["---"] ? "-(?!--)|" : "-|"}_|:\\d|\\.-|\\.(?!$|${t.src_ZPCc}))`, t.src_path = `(?:[/?#](?:(?!${t.src_ZCc}|${n}|[()[\\]{}.,"'?!\\-;]).|\\[(?:(?!${t.src_ZCc}|\\]).)*\\]|\\((?:(?!${t.src_ZCc}|[)]).)*\\)|\\{(?:(?!${t.src_ZCc}|[}]).)*\\}|\\"(?:(?!${t.src_ZCc}|["]).)+\\"|\\'(?:(?!${t.src_ZCc}|[']).)+\\'|\\'(?=${t.src_pseudo_letter}|[-])|\\.{2,}[a-zA-Z0-9%/&]|\\.(?!${t.src_ZCc}|[.]|$)|` + (e["---"] ? "\\-(?!--(?:[^-]|$))(?:-*)|" : "\\-+|") + // allow `,,,` in paths
  `,(?!${t.src_ZCc}|$)|;(?!${t.src_ZCc}|$)|\\!+(?!${t.src_ZCc}|[!]|$)|\\?(?!${t.src_ZCc}|[?]|$))+|\\/)?`, t.src_email_name = '[\\-;:&=\\+\\$,\\.a-zA-Z0-9_][\\-;:&=\\+\\$,\\"\\.a-zA-Z0-9_]{0,63}', t.src_xn = "xn--[a-z0-9\\-]{1,59}", t.src_domain_root = // Allow letters & digits (http://test1)
  "(?:" + t.src_xn + `|${t.src_pseudo_letter}{1,63})`, t.src_domain = "(?:" + t.src_xn + `|(?:${t.src_pseudo_letter})|(?:${t.src_pseudo_letter}(?:-|${t.src_pseudo_letter}){0,61}${t.src_pseudo_letter}))`, t.src_host = `(?:(?:(?:(?:${t.src_domain})\\.)*${t.src_domain}))`, t.tpl_host_fuzzy = "(?:" + t.src_ip4 + `|(?:(?:(?:${t.src_domain})\\.)+(?:%TLDS%)))`, t.tpl_host_no_ip_fuzzy = `(?:(?:(?:${t.src_domain})\\.)+(?:%TLDS%))`, t.src_host_strict = t.src_host + t.src_host_terminator, t.tpl_host_fuzzy_strict = t.tpl_host_fuzzy + t.src_host_terminator, t.src_host_port_strict = t.src_host + t.src_port + t.src_host_terminator, t.tpl_host_port_fuzzy_strict = t.tpl_host_fuzzy + t.src_port + t.src_host_terminator, t.tpl_host_port_no_ip_fuzzy_strict = t.tpl_host_no_ip_fuzzy + t.src_port + t.src_host_terminator, t.tpl_host_fuzzy_test = `localhost|www\\.|\\.\\d{1,3}\\.|(?:\\.(?:%TLDS%)(?:${t.src_ZPCc}|>|$))`, t.tpl_email_fuzzy = `(^|${n}|"|\\(|${t.src_ZCc})(${t.src_email_name}@${t.tpl_host_fuzzy_strict})`, t.tpl_link_fuzzy = // Fuzzy link can't be prepended with .:/\- and non punctuation.
  // but can start with > (markdown blockquote)
  `(^|(?![.:/\\-_@])(?:[$+<=>^\`|｜]|${t.src_ZPCc}))((?![$+<=>^\`|｜])${t.tpl_host_port_fuzzy_strict}${t.src_path})`, t.tpl_link_no_ip_fuzzy = // Fuzzy link can't be prepended with .:/\- and non punctuation.
  // but can start with > (markdown blockquote)
  `(^|(?![.:/\\-_@])(?:[$+<=>^\`|｜]|${t.src_ZPCc}))((?![$+<=>^\`|｜])${t.tpl_host_port_no_ip_fuzzy_strict}${t.src_path})`, t;
}
function Ns(e) {
  return Array.prototype.slice.call(arguments, 1).forEach(function(n) {
    n && Object.keys(n).forEach(function(r) {
      e[r] = n[r];
    });
  }), e;
}
function wo(e) {
  return Object.prototype.toString.call(e);
}
function B6(e) {
  return wo(e) === "[object String]";
}
function U6(e) {
  return wo(e) === "[object Object]";
}
function H6(e) {
  return wo(e) === "[object RegExp]";
}
function mc(e) {
  return wo(e) === "[object Function]";
}
function q6(e) {
  return e.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
}
const Ld = {
  fuzzyLink: !0,
  fuzzyEmail: !0,
  fuzzyIP: !1
};
function J6(e) {
  return Object.keys(e || {}).reduce(function(t, n) {
    return t || Ld.hasOwnProperty(n);
  }, !1);
}
const W6 = {
  "http:": {
    validate: function(e, t, n) {
      const r = e.slice(t);
      return n.re.http || (n.re.http = new RegExp(
        `^\\/\\/${n.re.src_auth}${n.re.src_host_port_strict}${n.re.src_path}`,
        "i"
      )), n.re.http.test(r) ? r.match(n.re.http)[0].length : 0;
    }
  },
  "https:": "http:",
  "ftp:": "http:",
  "//": {
    validate: function(e, t, n) {
      const r = e.slice(t);
      return n.re.no_http || (n.re.no_http = new RegExp(
        "^" + n.re.src_auth + // Don't allow single-level domains, because of false positives like '//test'
        // with code comments
        `(?:localhost|(?:(?:${n.re.src_domain})\\.)+${n.re.src_domain_root})` + n.re.src_port + n.re.src_host_terminator + n.re.src_path,
        "i"
      )), n.re.no_http.test(r) ? t >= 3 && e[t - 3] === ":" || t >= 3 && e[t - 3] === "/" ? 0 : r.match(n.re.no_http)[0].length : 0;
    }
  },
  "mailto:": {
    validate: function(e, t, n) {
      const r = e.slice(t);
      return n.re.mailto || (n.re.mailto = new RegExp(
        `^${n.re.src_email_name}@${n.re.src_host_strict}`,
        "i"
      )), n.re.mailto.test(r) ? r.match(n.re.mailto)[0].length : 0;
    }
  }
}, G6 = "a[cdefgilmnoqrstuwxz]|b[abdefghijmnorstvwyz]|c[acdfghiklmnoruvwxyz]|d[ejkmoz]|e[cegrstu]|f[ijkmor]|g[abdefghilmnpqrstuwy]|h[kmnrtu]|i[delmnoqrst]|j[emop]|k[eghimnprwyz]|l[abcikrstuvy]|m[acdeghklmnopqrstuvwxyz]|n[acefgilopruz]|om|p[aefghklmnrstwy]|qa|r[eosuw]|s[abcdeghijklmnortuvxyz]|t[cdfghjklmnortvwz]|u[agksyz]|v[aceginu]|w[fs]|y[et]|z[amw]", K6 = "biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф".split("|");
function Y6(e) {
  return function(t, n) {
    const r = t.slice(n);
    return e.test(r) ? r.match(e)[0].length : 0;
  };
}
function gc() {
  return function(e, t) {
    t.normalize(e);
  };
}
function ro(e) {
  const t = e.re = V6(e.__opts__), n = e.__tlds__.slice();
  e.onCompile(), e.__tlds_replaced__ || n.push(G6), n.push(t.src_xn), t.src_tlds = n.join("|");
  function r(i) {
    return i.replace("%TLDS%", t.src_tlds);
  }
  t.email_fuzzy = RegExp(r(t.tpl_email_fuzzy), "i"), t.email_fuzzy_global = RegExp(r(t.tpl_email_fuzzy), "ig"), t.link_fuzzy = RegExp(r(t.tpl_link_fuzzy), "i"), t.link_fuzzy_global = RegExp(r(t.tpl_link_fuzzy), "ig"), t.link_no_ip_fuzzy = RegExp(r(t.tpl_link_no_ip_fuzzy), "i"), t.link_no_ip_fuzzy_global = RegExp(r(t.tpl_link_no_ip_fuzzy), "ig"), t.host_fuzzy_test = RegExp(r(t.tpl_host_fuzzy_test), "i");
  const u = [];
  e.__compiled__ = {};
  function o(i, a) {
    throw new Error(`(LinkifyIt) Invalid schema "${i}": ${a}`);
  }
  Object.keys(e.__schemas__).forEach(function(i) {
    const a = e.__schemas__[i];
    if (a === null)
      return;
    const c = { validate: null, link: null };
    if (e.__compiled__[i] = c, U6(a)) {
      H6(a.validate) ? c.validate = Y6(a.validate) : mc(a.validate) ? c.validate = a.validate : o(i, a), mc(a.normalize) ? c.normalize = a.normalize : a.normalize ? o(i, a) : c.normalize = gc();
      return;
    }
    if (B6(a)) {
      u.push(i);
      return;
    }
    o(i, a);
  }), u.forEach(function(i) {
    e.__compiled__[e.__schemas__[i]] && (e.__compiled__[i].validate = e.__compiled__[e.__schemas__[i]].validate, e.__compiled__[i].normalize = e.__compiled__[e.__schemas__[i]].normalize);
  }), e.__compiled__[""] = { validate: null, normalize: gc() };
  const s = Object.keys(e.__compiled__).filter(function(i) {
    return i.length > 0 && e.__compiled__[i];
  }).map(q6).join("|");
  e.re.schema_test = RegExp(`(^|(?!_)(?:[><｜]|${t.src_ZPCc}))(${s})`, "i"), e.re.schema_search = RegExp(`(^|(?!_)(?:[><｜]|${t.src_ZPCc}))(${s})`, "ig"), e.re.schema_at_start = RegExp(`^${e.re.schema_search.source}`, "i"), e.re.pretest = RegExp(
    `(${e.re.schema_test.source})|(${e.re.host_fuzzy_test.source})|@`,
    "i"
  );
}
function Zd(e, t, n, r) {
  const u = e.slice(n, r);
  this.schema = t.toLowerCase(), this.index = n, this.lastIndex = r, this.raw = u, this.text = u, this.url = u;
}
function gt(e, t) {
  if (!(this instanceof gt))
    return new gt(e, t);
  t || J6(e) && (t = e, e = {}), this.__opts__ = Ns({}, Ld, t), this.__schemas__ = Ns({}, W6, e), this.__compiled__ = {}, this.__tlds__ = K6, this.__tlds_replaced__ = !1, this.re = {}, ro(this);
}
gt.prototype.add = function(t, n) {
  return this.__schemas__[t] = n, ro(this), this;
};
gt.prototype.set = function(t) {
  return this.__opts__ = Ns(this.__opts__, t), this;
};
gt.prototype.test = function(t) {
  if (!t.length)
    return !1;
  let n, r;
  if (this.re.schema_test.test(t)) {
    for (r = this.re.schema_search, r.lastIndex = 0; (n = r.exec(t)) !== null; )
      if (this.testSchemaAt(t, n[2], r.lastIndex))
        return !0;
  }
  return !!(this.__opts__.fuzzyLink && this.__compiled__["http:"] && t.search(this.re.host_fuzzy_test) >= 0 && t.match(this.__opts__.fuzzyIP ? this.re.link_fuzzy : this.re.link_no_ip_fuzzy) !== null || this.__opts__.fuzzyEmail && this.__compiled__["mailto:"] && t.indexOf("@") >= 0 && t.match(this.re.email_fuzzy) !== null);
};
gt.prototype.pretest = function(t) {
  return this.re.pretest.test(t);
};
gt.prototype.testSchemaAt = function(t, n, r) {
  return this.__compiled__[n.toLowerCase()] ? this.__compiled__[n.toLowerCase()].validate(t, r, this) : 0;
};
gt.prototype.match = function(t) {
  const n = [], r = [], u = [], o = [];
  let s, i, a;
  function c(d, p) {
    return d ? p ? d.index !== p.index ? d.index < p.index ? d : p : d.lastIndex >= p.lastIndex ? d : p : d : p;
  }
  if (!t.length)
    return null;
  if (this.re.schema_test.test(t))
    for (a = this.re.schema_search, a.lastIndex = 0; (s = a.exec(t)) !== null; )
      i = this.testSchemaAt(t, s[2], a.lastIndex), i && r.push({
        schema: s[2],
        index: s.index + s[1].length,
        lastIndex: s.index + s[0].length + i
      });
  if (this.__opts__.fuzzyLink && this.__compiled__["http:"])
    for (a = this.__opts__.fuzzyIP ? this.re.link_fuzzy_global : this.re.link_no_ip_fuzzy_global, a.lastIndex = 0; (s = a.exec(t)) !== null; )
      u.push({
        schema: "",
        index: s.index + s[1].length,
        lastIndex: s.index + s[0].length
      });
  if (this.__opts__.fuzzyEmail && this.__compiled__["mailto:"])
    for (a = this.re.email_fuzzy_global, a.lastIndex = 0; (s = a.exec(t)) !== null; )
      o.push({
        schema: "mailto:",
        index: s.index + s[1].length,
        lastIndex: s.index + s[0].length
      });
  const f = [0, 0, 0];
  let l = 0;
  for (; ; ) {
    const d = [
      r[f[0]],
      o[f[1]],
      u[f[2]]
    ], p = c(c(d[0], d[1]), d[2]);
    if (!p)
      break;
    if (p === d[0] ? f[0]++ : p === d[1] ? f[1]++ : f[2]++, p.index < l)
      continue;
    const m = new Zd(t, p.schema, p.index, p.lastIndex);
    this.__compiled__[m.schema].normalize(m, this), n.push(m), l = p.lastIndex;
  }
  return n.length ? n : null;
};
gt.prototype.matchAtStart = function(t) {
  if (!t.length) return null;
  const n = this.re.schema_at_start.exec(t);
  if (!n) return null;
  const r = this.testSchemaAt(t, n[2], n[0].length);
  if (!r) return null;
  const u = new Zd(t, n[2], n.index + n[1].length, n.index + n[0].length + r);
  return this.__compiled__[u.schema].normalize(u, this), u;
};
gt.prototype.tlds = function(t, n) {
  return t = Array.isArray(t) ? t : [t], n ? (this.__tlds__ = this.__tlds__.concat(t).sort().filter(function(r, u, o) {
    return r !== o[u - 1];
  }).reverse(), ro(this), this) : (this.__tlds__ = t.slice(), this.__tlds_replaced__ = !0, ro(this), this);
};
gt.prototype.normalize = function(t) {
  t.schema || (t.url = `http://${t.url}`), t.schema === "mailto:" && !/^mailto:/i.test(t.url) && (t.url = `mailto:${t.url}`);
};
gt.prototype.onCompile = function() {
};
const ur = 2147483647, Ut = 36, xi = 1, Wr = 26, X6 = 38, Q6 = 700, Vd = 72, Bd = 128, Ud = "-", ex = /^xn--/, tx = /[^\0-\x7F]/, nx = /[\x2E\u3002\uFF0E\uFF61]/g, rx = {
  overflow: "Overflow: input needs wider integers to process",
  "not-basic": "Illegal input >= 0x80 (not a basic code point)",
  "invalid-input": "Invalid input"
}, Go = Ut - xi, Ht = Math.floor, Ko = String.fromCharCode;
function pn(e) {
  throw new RangeError(rx[e]);
}
function ux(e, t) {
  const n = [];
  let r = e.length;
  for (; r--; )
    n[r] = t(e[r]);
  return n;
}
function Hd(e, t) {
  const n = e.split("@");
  let r = "";
  n.length > 1 && (r = n[0] + "@", e = n[1]), e = e.replace(nx, ".");
  const u = e.split("."), o = ux(u, t).join(".");
  return r + o;
}
function qd(e) {
  const t = [];
  let n = 0;
  const r = e.length;
  for (; n < r; ) {
    const u = e.charCodeAt(n++);
    if (u >= 55296 && u <= 56319 && n < r) {
      const o = e.charCodeAt(n++);
      (o & 64512) == 56320 ? t.push(((u & 1023) << 10) + (o & 1023) + 65536) : (t.push(u), n--);
    } else
      t.push(u);
  }
  return t;
}
const ox = (e) => String.fromCodePoint(...e), sx = function(e) {
  return e >= 48 && e < 58 ? 26 + (e - 48) : e >= 65 && e < 91 ? e - 65 : e >= 97 && e < 123 ? e - 97 : Ut;
}, bc = function(e, t) {
  return e + 22 + 75 * (e < 26) - ((t != 0) << 5);
}, Jd = function(e, t, n) {
  let r = 0;
  for (e = n ? Ht(e / Q6) : e >> 1, e += Ht(e / t); e > Go * Wr >> 1; r += Ut)
    e = Ht(e / Go);
  return Ht(r + (Go + 1) * e / (e + X6));
}, Wd = function(e) {
  const t = [], n = e.length;
  let r = 0, u = Bd, o = Vd, s = e.lastIndexOf(Ud);
  s < 0 && (s = 0);
  for (let i = 0; i < s; ++i)
    e.charCodeAt(i) >= 128 && pn("not-basic"), t.push(e.charCodeAt(i));
  for (let i = s > 0 ? s + 1 : 0; i < n; ) {
    const a = r;
    for (let f = 1, l = Ut; ; l += Ut) {
      i >= n && pn("invalid-input");
      const d = sx(e.charCodeAt(i++));
      d >= Ut && pn("invalid-input"), d > Ht((ur - r) / f) && pn("overflow"), r += d * f;
      const p = l <= o ? xi : l >= o + Wr ? Wr : l - o;
      if (d < p)
        break;
      const m = Ut - p;
      f > Ht(ur / m) && pn("overflow"), f *= m;
    }
    const c = t.length + 1;
    o = Jd(r - a, c, a == 0), Ht(r / c) > ur - u && pn("overflow"), u += Ht(r / c), r %= c, t.splice(r++, 0, u);
  }
  return String.fromCodePoint(...t);
}, Gd = function(e) {
  const t = [];
  e = qd(e);
  const n = e.length;
  let r = Bd, u = 0, o = Vd;
  for (const a of e)
    a < 128 && t.push(Ko(a));
  const s = t.length;
  let i = s;
  for (s && t.push(Ud); i < n; ) {
    let a = ur;
    for (const f of e)
      f >= r && f < a && (a = f);
    const c = i + 1;
    a - r > Ht((ur - u) / c) && pn("overflow"), u += (a - r) * c, r = a;
    for (const f of e)
      if (f < r && ++u > ur && pn("overflow"), f === r) {
        let l = u;
        for (let d = Ut; ; d += Ut) {
          const p = d <= o ? xi : d >= o + Wr ? Wr : d - o;
          if (l < p)
            break;
          const m = l - p, v = Ut - p;
          t.push(
            Ko(bc(p + m % v, 0))
          ), l = Ht(m / v);
        }
        t.push(Ko(bc(l, 0))), o = Jd(u, c, i === s), u = 0, ++i;
      }
    ++u, ++r;
  }
  return t.join("");
}, ix = function(e) {
  return Hd(e, function(t) {
    return ex.test(t) ? Wd(t.slice(4).toLowerCase()) : t;
  });
}, ax = function(e) {
  return Hd(e, function(t) {
    return tx.test(t) ? "xn--" + Gd(t) : t;
  });
}, Kd = {
  /**
   * A string representing the current Punycode.js version number.
   * @memberOf punycode
   * @type String
   */
  version: "2.3.1",
  /**
   * An object of methods to convert from JavaScript's internal character
   * representation (UCS-2) to Unicode code points, and back.
   * @see <https://mathiasbynens.be/notes/javascript-encoding>
   * @memberOf punycode
   * @type Object
   */
  ucs2: {
    decode: qd,
    encode: ox
  },
  decode: Wd,
  encode: Gd,
  toASCII: ax,
  toUnicode: ix
}, cx = {
  options: {
    // Enable HTML tags in source
    html: !1,
    // Use '/' to close single tags (<br />)
    xhtmlOut: !1,
    // Convert '\n' in paragraphs into <br>
    breaks: !1,
    // CSS language prefix for fenced blocks
    langPrefix: "language-",
    // autoconvert URL-like texts to links
    linkify: !1,
    // Enable some language-neutral replacements + quotes beautification
    typographer: !1,
    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Could be either a String or an Array.
    //
    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
    quotes: "“”‘’",
    /* “”‘’ */
    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed and should be escaped externaly.
    // If result starts with <pre... internal wrapper is skipped.
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,
    // Internal protection, recursion limit
    maxNesting: 100
  },
  components: {
    core: {},
    block: {},
    inline: {}
  }
}, lx = {
  options: {
    // Enable HTML tags in source
    html: !1,
    // Use '/' to close single tags (<br />)
    xhtmlOut: !1,
    // Convert '\n' in paragraphs into <br>
    breaks: !1,
    // CSS language prefix for fenced blocks
    langPrefix: "language-",
    // autoconvert URL-like texts to links
    linkify: !1,
    // Enable some language-neutral replacements + quotes beautification
    typographer: !1,
    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Could be either a String or an Array.
    //
    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
    quotes: "“”‘’",
    /* “”‘’ */
    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed and should be escaped externaly.
    // If result starts with <pre... internal wrapper is skipped.
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,
    // Internal protection, recursion limit
    maxNesting: 20
  },
  components: {
    core: {
      rules: [
        "normalize",
        "block",
        "inline",
        "text_join"
      ]
    },
    block: {
      rules: [
        "paragraph"
      ]
    },
    inline: {
      rules: [
        "text"
      ],
      rules2: [
        "balance_pairs",
        "fragments_join"
      ]
    }
  }
}, fx = {
  options: {
    // Enable HTML tags in source
    html: !0,
    // Use '/' to close single tags (<br />)
    xhtmlOut: !0,
    // Convert '\n' in paragraphs into <br>
    breaks: !1,
    // CSS language prefix for fenced blocks
    langPrefix: "language-",
    // autoconvert URL-like texts to links
    linkify: !1,
    // Enable some language-neutral replacements + quotes beautification
    typographer: !1,
    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Could be either a String or an Array.
    //
    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
    quotes: "“”‘’",
    /* “”‘’ */
    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed and should be escaped externaly.
    // If result starts with <pre... internal wrapper is skipped.
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,
    // Internal protection, recursion limit
    maxNesting: 20
  },
  components: {
    core: {
      rules: [
        "normalize",
        "block",
        "inline",
        "text_join"
      ]
    },
    block: {
      rules: [
        "blockquote",
        "code",
        "fence",
        "heading",
        "hr",
        "html_block",
        "lheading",
        "list",
        "reference",
        "paragraph"
      ]
    },
    inline: {
      rules: [
        "autolink",
        "backticks",
        "emphasis",
        "entity",
        "escape",
        "html_inline",
        "image",
        "link",
        "newline",
        "text"
      ],
      rules2: [
        "balance_pairs",
        "emphasis",
        "fragments_join"
      ]
    }
  }
}, dx = {
  default: cx,
  zero: lx,
  commonmark: fx
}, px = /^(vbscript|javascript|file|data):/, hx = /^data:image\/(gif|png|jpeg|webp);/;
function mx(e) {
  const t = e.trim().toLowerCase();
  return px.test(t) ? hx.test(t) : !0;
}
const Yd = ["http:", "https:", "mailto:"];
function gx(e) {
  const t = mi(e, !0);
  if (t.hostname && (!t.protocol || Yd.indexOf(t.protocol) >= 0))
    try {
      t.hostname = Kd.toASCII(t.hostname);
    } catch {
    }
  return su(hi(t));
}
function bx(e) {
  const t = mi(e, !0);
  if (t.hostname && (!t.protocol || Yd.indexOf(t.protocol) >= 0))
    try {
      t.hostname = Kd.toUnicode(t.hostname);
    } catch {
    }
  return cr(hi(t), cr.defaultChars + "%");
}
function vt(e, t) {
  if (!(this instanceof vt))
    return new vt(e, t);
  t || bi(e) || (t = e || {}, e = "default"), this.inline = new au(), this.block = new ko(), this.core = new _i(), this.renderer = new gr(), this.linkify = new gt(), this.validateLink = mx, this.normalizeLink = gx, this.normalizeLinkText = bx, this.utils = y3, this.helpers = yo({}, w3), this.options = {}, this.configure(e), t && this.set(t);
}
vt.prototype.set = function(e) {
  return yo(this.options, e), this;
};
vt.prototype.configure = function(e) {
  const t = this;
  if (bi(e)) {
    const n = e;
    if (e = dx[n], !e)
      throw new Error('Wrong `markdown-it` preset "' + n + '", check name');
  }
  if (!e)
    throw new Error("Wrong `markdown-it` preset, can't be empty");
  return e.options && t.set(e.options), e.components && Object.keys(e.components).forEach(function(n) {
    e.components[n].rules && t[n].ruler.enableOnly(e.components[n].rules), e.components[n].rules2 && t[n].ruler2.enableOnly(e.components[n].rules2);
  }), this;
};
vt.prototype.enable = function(e, t) {
  let n = [];
  Array.isArray(e) || (e = [e]), ["core", "block", "inline"].forEach(function(u) {
    n = n.concat(this[u].ruler.enable(e, !0));
  }, this), n = n.concat(this.inline.ruler2.enable(e, !0));
  const r = e.filter(function(u) {
    return n.indexOf(u) < 0;
  });
  if (r.length && !t)
    throw new Error("MarkdownIt. Failed to enable unknown rule(s): " + r);
  return this;
};
vt.prototype.disable = function(e, t) {
  let n = [];
  Array.isArray(e) || (e = [e]), ["core", "block", "inline"].forEach(function(u) {
    n = n.concat(this[u].ruler.disable(e, !0));
  }, this), n = n.concat(this.inline.ruler2.disable(e, !0));
  const r = e.filter(function(u) {
    return n.indexOf(u) < 0;
  });
  if (r.length && !t)
    throw new Error("MarkdownIt. Failed to disable unknown rule(s): " + r);
  return this;
};
vt.prototype.use = function(e) {
  const t = [this].concat(Array.prototype.slice.call(arguments, 1));
  return e.apply(e, t), this;
};
vt.prototype.parse = function(e, t) {
  if (typeof e != "string")
    throw new Error("Input data should be a String");
  const n = new this.core.State(e, this, t);
  return this.core.process(n), n.tokens;
};
vt.prototype.render = function(e, t) {
  return t = t || {}, this.renderer.render(this.parse(e, t), this.options, t);
};
vt.prototype.parseInline = function(e, t) {
  const n = new this.core.State(e, this, t);
  return n.inlineMode = !0, this.core.process(n), n.tokens;
};
vt.prototype.renderInline = function(e, t) {
  return t = t || {}, this.renderer.render(this.parseInline(e, t), this.options, t);
};
const vc = /* @__PURE__ */ new Set([!0, !1, "alt", "title"]);
function Xd(e, t) {
  return (Array.isArray(e) ? e : []).filter(([n]) => n !== t);
}
function Qd(e, t) {
  e && e.attrs && (e.attrs = Xd(e.attrs, t));
}
function vx(e, t) {
  if (!vc.has(e)) throw new TypeError(`figcaption must be one of: ${[...vc]}.`);
  if (e === "alt") return t.content;
  const n = t.attrs.find(([r]) => r === "title");
  return Array.isArray(n) && n[1] ? (Qd(t, "title"), n[1]) : void 0;
}
function _x(e, t) {
  t = t || {}, e.core.ruler.before("linkify", "image_figures", function(n) {
    let r = 1;
    for (let u = 1, o = n.tokens.length; u < o - 1; ++u) {
      const s = n.tokens[u];
      if (s.type !== "inline" || !s.children || s.children.length !== 1 && s.children.length !== 3 || s.children.length === 1 && s.children[0].type !== "image") continue;
      if (s.children.length === 3) {
        const [c, f, l] = s.children;
        if (c.type !== "link_open" || f.type !== "image" || l.type !== "link_close") continue;
      }
      if (u !== 0 && n.tokens[u - 1].type !== "paragraph_open" || u !== o - 1 && n.tokens[u + 1].type !== "paragraph_close") continue;
      const i = n.tokens[u - 1];
      let a;
      if (i.type = "figure_open", i.tag = "figure", n.tokens[u + 1].type = "figure_close", n.tokens[u + 1].tag = "figure", t.dataType && n.tokens[u - 1].attrPush(["data-type", "image"]), t.link && s.children.length === 1) {
        [a] = s.children;
        const c = new n.Token("link_open", "a", 1);
        c.attrPush(["href", a.attrGet("src")]), s.children.unshift(c), s.children.push(new n.Token("link_close", "a", -1));
      }
      if (a = s.children.length === 1 ? s.children[0] : s.children[1], t.figcaption) {
        const c = vx(t.figcaption, a);
        if (c) {
          const [f] = e.parseInline(c, n.env);
          s.children.push(new n.Token("figcaption_open", "figcaption", 1)), s.children.push(...f.children), s.children.push(new n.Token("figcaption_close", "figcaption", -1)), a.attrs && (a.attrs = Xd(a.attrs, "title"));
        }
      }
      if (t.copyAttrs && a.attrs) {
        const c = t.copyAttrs === !0 ? "" : t.copyAttrs;
        i.attrs = a.attrs.filter(([f]) => f.match(c)).map((f) => Array.from(f));
      }
      if (t.tabindex && (n.tokens[u - 1].attrPush(["tabindex", r]), r++), t.lazy && (a.attrs.some(([c]) => c === "loading") || a.attrs.push(["loading", "lazy"])), t.async && (a.attrs.some(([c]) => c === "decoding") || a.attrs.push(["decoding", "async"])), t.classes && typeof t.classes == "string") {
        let c = !1;
        for (let f = 0, l = a.attrs.length; f < l && !c; f++) {
          const d = a.attrs[f];
          d[0] === "class" && (d[1] = `${d[1]} ${t.classes}`, c = !0);
        }
        c || a.attrs.push(["class", t.classes]);
      }
      if (t.removeSrc) {
        const c = a.attrs.find(([f]) => f === "src");
        a.attrs.push(["data-src", c[1]]), Qd(a, "src");
      }
    }
  });
}
const yx = /\\([ \\!"#$%&'()*+,./:;<=>?@[\]^_`{|}~-])/g;
function xx(e, t) {
  const n = e.posMax, r = e.pos;
  if (e.src.charCodeAt(r) !== 126 || t || r + 2 >= n)
    return !1;
  e.pos = r + 1;
  let u = !1;
  for (; e.pos < n; ) {
    if (e.src.charCodeAt(e.pos) === 126) {
      u = !0;
      break;
    }
    e.md.inline.skipToken(e);
  }
  if (!u || r + 1 === e.pos)
    return e.pos = r, !1;
  const o = e.src.slice(r + 1, e.pos);
  if (o.match(/(^|[^\\])(\\\\)*\s/))
    return e.pos = r, !1;
  e.posMax = e.pos, e.pos = r + 1;
  const s = e.push("sub_open", "sub", 1);
  s.markup = "~";
  const i = e.push("text", "", 0);
  i.content = o.replace(yx, "$1");
  const a = e.push("sub_close", "sub", -1);
  return a.markup = "~", e.pos = e.posMax + 1, e.posMax = n, !0;
}
function Ex(e) {
  e.inline.ruler.after("emphasis", "sub", xx);
}
const kx = /\\([ \\!"#$%&'()*+,./:;<=>?@[\]^_`{|}~-])/g;
function wx(e, t) {
  const n = e.posMax, r = e.pos;
  if (e.src.charCodeAt(r) !== 94 || t || r + 2 >= n)
    return !1;
  e.pos = r + 1;
  let u = !1;
  for (; e.pos < n; ) {
    if (e.src.charCodeAt(e.pos) === 94) {
      u = !0;
      break;
    }
    e.md.inline.skipToken(e);
  }
  if (!u || r + 1 === e.pos)
    return e.pos = r, !1;
  const o = e.src.slice(r + 1, e.pos);
  if (o.match(/(^|[^\\])(\\\\)*\s/))
    return e.pos = r, !1;
  e.posMax = e.pos, e.pos = r + 1;
  const s = e.push("sup_open", "sup", 1);
  s.markup = "^";
  const i = e.push("text", "", 0);
  i.content = o.replace(kx, "$1");
  const a = e.push("sup_close", "sup", -1);
  return a.markup = "^", e.pos = e.posMax + 1, e.posMax = n, !0;
}
function Cx(e) {
  e.inline.ruler.after("emphasis", "sup", wx);
}
/*! medium-zoom 1.1.0 | MIT License | https://github.com/francoischalifour/medium-zoom */
var zn = Object.assign || function(e) {
  for (var t = 1; t < arguments.length; t++) {
    var n = arguments[t];
    for (var r in n)
      Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
  }
  return e;
}, _u = function(t) {
  return t.tagName === "IMG";
}, Ax = function(t) {
  return NodeList.prototype.isPrototypeOf(t);
}, Su = function(t) {
  return t && t.nodeType === 1;
}, _c = function(t) {
  var n = t.currentSrc || t.src;
  return n.substr(-4).toLowerCase() === ".svg";
}, yc = function(t) {
  try {
    return Array.isArray(t) ? t.filter(_u) : Ax(t) ? [].slice.call(t).filter(_u) : Su(t) ? [t].filter(_u) : typeof t == "string" ? [].slice.call(document.querySelectorAll(t)).filter(_u) : [];
  } catch {
    throw new TypeError(`The provided selector is invalid.
Expects a CSS selector, a Node element, a NodeList or an array.
See: https://github.com/francoischalifour/medium-zoom`);
  }
}, Dx = function(t) {
  var n = document.createElement("div");
  return n.classList.add("medium-zoom-overlay"), n.style.background = t, n;
}, Sx = function(t) {
  var n = t.getBoundingClientRect(), r = n.top, u = n.left, o = n.width, s = n.height, i = t.cloneNode(), a = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0, c = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
  return i.removeAttribute("id"), i.style.position = "absolute", i.style.top = r + a + "px", i.style.left = u + c + "px", i.style.width = o + "px", i.style.height = s + "px", i.style.transform = "", i;
}, Gn = function(t, n) {
  var r = zn({
    bubbles: !1,
    cancelable: !1,
    detail: void 0
  }, n);
  if (typeof window.CustomEvent == "function")
    return new CustomEvent(t, r);
  var u = document.createEvent("CustomEvent");
  return u.initCustomEvent(t, r.bubbles, r.cancelable, r.detail), u;
}, $x = function e(t) {
  var n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, r = window.Promise || function(B) {
    function G() {
    }
    B(G, G);
  }, u = function(B) {
    var G = B.target;
    if (G === Z) {
      m();
      return;
    }
    h.indexOf(G) !== -1 && v({ target: G });
  }, o = function() {
    if (!(g || !k.original)) {
      var B = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      Math.abs(y - B) > C.scrollOffset && setTimeout(m, 150);
    }
  }, s = function(B) {
    var G = B.key || B.keyCode;
    (G === "Escape" || G === "Esc" || G === 27) && m();
  }, i = function() {
    var B = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, G = B;
    if (B.background && (Z.style.background = B.background), B.container && B.container instanceof Object && (G.container = zn({}, C.container, B.container)), B.template) {
      var q = Su(B.template) ? B.template : document.querySelector(B.template);
      G.template = q;
    }
    return C = zn({}, C, G), h.forEach(function(H) {
      H.dispatchEvent(Gn("medium-zoom:update", {
        detail: { zoom: W }
      }));
    }), W;
  }, a = function() {
    var B = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return e(zn({}, C, B));
  }, c = function() {
    for (var B = arguments.length, G = Array(B), q = 0; q < B; q++)
      G[q] = arguments[q];
    var H = G.reduce(function(N, z) {
      return [].concat(N, yc(z));
    }, []);
    return H.filter(function(N) {
      return h.indexOf(N) === -1;
    }).forEach(function(N) {
      h.push(N), N.classList.add("medium-zoom-image");
    }), w.forEach(function(N) {
      var z = N.type, $ = N.listener, ne = N.options;
      H.forEach(function(fe) {
        fe.addEventListener(z, $, ne);
      });
    }), W;
  }, f = function() {
    for (var B = arguments.length, G = Array(B), q = 0; q < B; q++)
      G[q] = arguments[q];
    k.zoomed && m();
    var H = G.length > 0 ? G.reduce(function(N, z) {
      return [].concat(N, yc(z));
    }, []) : h;
    return H.forEach(function(N) {
      N.classList.remove("medium-zoom-image"), N.dispatchEvent(Gn("medium-zoom:detach", {
        detail: { zoom: W }
      }));
    }), h = h.filter(function(N) {
      return H.indexOf(N) === -1;
    }), W;
  }, l = function(B, G) {
    var q = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    return h.forEach(function(H) {
      H.addEventListener("medium-zoom:" + B, G, q);
    }), w.push({ type: "medium-zoom:" + B, listener: G, options: q }), W;
  }, d = function(B, G) {
    var q = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    return h.forEach(function(H) {
      H.removeEventListener("medium-zoom:" + B, G, q);
    }), w = w.filter(function(H) {
      return !(H.type === "medium-zoom:" + B && H.listener.toString() === G.toString());
    }), W;
  }, p = function() {
    var B = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, G = B.target, q = function() {
      var N = {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      }, z = void 0, $ = void 0;
      if (C.container)
        if (C.container instanceof Object)
          N = zn({}, N, C.container), z = N.width - N.left - N.right - C.margin * 2, $ = N.height - N.top - N.bottom - C.margin * 2;
        else {
          var ne = Su(C.container) ? C.container : document.querySelector(C.container), fe = ne.getBoundingClientRect(), ze = fe.width, Se = fe.height, Je = fe.left, We = fe.top;
          N = zn({}, N, {
            width: ze,
            height: Se,
            left: Je,
            top: We
          });
        }
      z = z || N.width - C.margin * 2, $ = $ || N.height - C.margin * 2;
      var lt = k.zoomedHd || k.original, br = _c(lt) ? z : lt.naturalWidth || z, An = _c(lt) ? $ : lt.naturalHeight || $, Yt = lt.getBoundingClientRect(), vr = Yt.top, cu = Yt.left, Xt = Yt.width, lu = Yt.height, b = Math.min(Math.max(Xt, br), z) / Xt, x = Math.min(Math.max(lu, An), $) / lu, D = Math.min(b, x), T = (-cu + (z - Xt) / 2 + C.margin + N.left) / D, I = (-vr + ($ - lu) / 2 + C.margin + N.top) / D, O = "scale(" + D + ") translate3d(" + T + "px, " + I + "px, 0)";
      k.zoomed.style.transform = O, k.zoomedHd && (k.zoomedHd.style.transform = O);
    };
    return new r(function(H) {
      if (G && h.indexOf(G) === -1) {
        H(W);
        return;
      }
      var N = function ze() {
        g = !1, k.zoomed.removeEventListener("transitionend", ze), k.original.dispatchEvent(Gn("medium-zoom:opened", {
          detail: { zoom: W }
        })), H(W);
      };
      if (k.zoomed) {
        H(W);
        return;
      }
      if (G)
        k.original = G;
      else if (h.length > 0) {
        var z = h;
        k.original = z[0];
      } else {
        H(W);
        return;
      }
      if (k.original.dispatchEvent(Gn("medium-zoom:open", {
        detail: { zoom: W }
      })), y = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0, g = !0, k.zoomed = Sx(k.original), document.body.appendChild(Z), C.template) {
        var $ = Su(C.template) ? C.template : document.querySelector(C.template);
        k.template = document.createElement("div"), k.template.appendChild($.content.cloneNode(!0)), document.body.appendChild(k.template);
      }
      if (k.original.parentElement && k.original.parentElement.tagName === "PICTURE" && k.original.currentSrc && (k.zoomed.src = k.original.currentSrc), document.body.appendChild(k.zoomed), window.requestAnimationFrame(function() {
        document.body.classList.add("medium-zoom--opened");
      }), k.original.classList.add("medium-zoom-image--hidden"), k.zoomed.classList.add("medium-zoom-image--opened"), k.zoomed.addEventListener("click", m), k.zoomed.addEventListener("transitionend", N), k.original.getAttribute("data-zoom-src")) {
        k.zoomedHd = k.zoomed.cloneNode(), k.zoomedHd.removeAttribute("srcset"), k.zoomedHd.removeAttribute("sizes"), k.zoomedHd.removeAttribute("loading"), k.zoomedHd.src = k.zoomed.getAttribute("data-zoom-src"), k.zoomedHd.onerror = function() {
          clearInterval(ne), console.warn("Unable to reach the zoom image target " + k.zoomedHd.src), k.zoomedHd = null, q();
        };
        var ne = setInterval(function() {
          k.zoomedHd.complete && (clearInterval(ne), k.zoomedHd.classList.add("medium-zoom-image--opened"), k.zoomedHd.addEventListener("click", m), document.body.appendChild(k.zoomedHd), q());
        }, 10);
      } else if (k.original.hasAttribute("srcset")) {
        k.zoomedHd = k.zoomed.cloneNode(), k.zoomedHd.removeAttribute("sizes"), k.zoomedHd.removeAttribute("loading");
        var fe = k.zoomedHd.addEventListener("load", function() {
          k.zoomedHd.removeEventListener("load", fe), k.zoomedHd.classList.add("medium-zoom-image--opened"), k.zoomedHd.addEventListener("click", m), document.body.appendChild(k.zoomedHd), q();
        });
      } else
        q();
    });
  }, m = function() {
    return new r(function(B) {
      if (g || !k.original) {
        B(W);
        return;
      }
      var G = function q() {
        k.original.classList.remove("medium-zoom-image--hidden"), document.body.removeChild(k.zoomed), k.zoomedHd && document.body.removeChild(k.zoomedHd), document.body.removeChild(Z), k.zoomed.classList.remove("medium-zoom-image--opened"), k.template && document.body.removeChild(k.template), g = !1, k.zoomed.removeEventListener("transitionend", q), k.original.dispatchEvent(Gn("medium-zoom:closed", {
          detail: { zoom: W }
        })), k.original = null, k.zoomed = null, k.zoomedHd = null, k.template = null, B(W);
      };
      g = !0, document.body.classList.remove("medium-zoom--opened"), k.zoomed.style.transform = "", k.zoomedHd && (k.zoomedHd.style.transform = ""), k.template && (k.template.style.transition = "opacity 150ms", k.template.style.opacity = 0), k.original.dispatchEvent(Gn("medium-zoom:close", {
        detail: { zoom: W }
      })), k.zoomed.addEventListener("transitionend", G);
    });
  }, v = function() {
    var B = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {}, G = B.target;
    return k.original ? m() : p({ target: G });
  }, _ = function() {
    return C;
  }, A = function() {
    return h;
  }, E = function() {
    return k.original;
  }, h = [], w = [], g = !1, y = 0, C = n, k = {
    original: null,
    zoomed: null,
    zoomedHd: null,
    template: null
    // If the selector is omitted, it's replaced by the options
  };
  Object.prototype.toString.call(t) === "[object Object]" ? C = t : (t || typeof t == "string") && c(t), C = zn({
    margin: 0,
    background: "#fff",
    scrollOffset: 40,
    container: null,
    template: null
  }, C);
  var Z = Dx(C.background);
  document.addEventListener("click", u), document.addEventListener("keyup", s), document.addEventListener("scroll", o), window.addEventListener("resize", m);
  var W = {
    open: p,
    close: m,
    toggle: v,
    update: i,
    clone: a,
    attach: c,
    detach: f,
    on: l,
    off: d,
    getOptions: _,
    getImages: A,
    getZoomedImage: E
  };
  return W;
};
function Nx(e, t) {
  t === void 0 && (t = {});
  var n = t.insertAt;
  if (!(typeof document > "u")) {
    var r = document.head || document.getElementsByTagName("head")[0], u = document.createElement("style");
    u.type = "text/css", n === "top" && r.firstChild ? r.insertBefore(u, r.firstChild) : r.appendChild(u), u.styleSheet ? u.styleSheet.cssText = e : u.appendChild(document.createTextNode(e));
  }
}
var Ox = ".medium-zoom-overlay{position:fixed;top:0;right:0;bottom:0;left:0;opacity:0;transition:opacity .3s;will-change:opacity}.medium-zoom--opened .medium-zoom-overlay{cursor:pointer;cursor:zoom-out;opacity:1}.medium-zoom-image{cursor:pointer;cursor:zoom-in;transition:transform .3s cubic-bezier(.2,0,.2,1)!important}.medium-zoom-image--hidden{visibility:hidden}.medium-zoom-image--opened{position:relative;cursor:pointer;cursor:zoom-out;will-change:transform}";
Nx(Ox);
const vn = {
  hljs: `${U}-hljs`,
  hlcss: `${U}-hlCss`,
  mermaidM: `${U}-mermaid-m`,
  mermaid: `${U}-mermaid`,
  katexjs: `${U}-katex`,
  katexcss: `${U}-katexCss`,
  echarts: `${U}-echarts`
}, Ix = (e, {
  editorId: t,
  rootRef: n,
  setting: r
}) => {
  const u = Dt.editorExtensions.highlight, o = Dt.editorExtensionsAttrs.highlight;
  Et("editorId", t), Et("rootRef", n), Et(
    "theme",
    Fe(() => e.theme)
  ), Et(
    "language",
    Fe(() => e.language)
  ), Et(
    "highlight",
    Fe(() => {
      const { js: i } = u, a = {
        ...Ds,
        ...u.css
      }, { js: c, css: f = {} } = o || {}, l = e.codeStyleReverse && e.codeStyleReverseList.includes(e.previewTheme) ? "dark" : e.theme, d = a[e.codeTheme] ? a[e.codeTheme][l] : Ds.atom[l], p = a[e.codeTheme] && f[e.codeTheme] ? f[e.codeTheme][l] : f.atom ? f.atom[l] : {};
      return {
        js: {
          src: i,
          ...c
        },
        css: {
          href: d,
          ...p
        }
      };
    })
  ), Et("showCodeRowNumber", e.showCodeRowNumber);
  const s = Fe(() => {
    const i = {
      ...Xa,
      ...Dt.editorConfig.languageUserDefined
    };
    return pi(
      Dr(Xa["en-US"]),
      i[e.language] || {}
    );
  });
  return Et("usedLanguageText", s), Et(
    "previewTheme",
    Fe(() => e.previewTheme)
  ), Et(
    "customIcon",
    Fe(() => e.customIcon)
  ), Et(
    "setting",
    Fe(() => r ? {
      // setting是reactive，不转化是可以直接赋值的
      ...r
    } : {
      preview: !0,
      htmlPreview: !1,
      previewOnly: !1,
      pageFullscreen: !1,
      fullscreen: !1
    })
  ), { editorId: t };
}, Tx = (e) => {
  const t = Ap();
  return e.id || e.editorId || `${U}-${t}`;
}, Fx = (e, t, n) => {
  const r = le("editorId"), u = le("rootRef"), o = le("usedLanguageText"), s = le("setting"), i = () => {
    u.value.querySelectorAll(`#${r} .${U}-preview .${U}-code`).forEach((f) => {
      let l = -1;
      const d = f.querySelector(
        `.${U}-copy-button:not([data-processed])`
      );
      d && (d.onclick = (p) => {
        p.preventDefault(), clearTimeout(l);
        const m = (f.querySelector("input:checked + pre code") || f.querySelector("pre code")).textContent, { text: v, successTips: _, failTips: A } = o.value.copyCode;
        let E = _;
        wd(e.formatCopiedText(m || "")).catch(() => {
          E = A;
        }).finally(() => {
          d.dataset.isIcon ? d.dataset.tips = E : d.innerHTML = E, l = window.setTimeout(() => {
            d.dataset.isIcon ? d.dataset.tips = v : d.innerHTML = v;
          }, 1500);
        });
      }, d.setAttribute("data-processed", "true"));
    });
  }, a = () => {
    un(i);
  }, c = (f) => {
    f && un(i);
  };
  Pe([t, n], a), Pe(() => s.value.preview, c), Pe(() => s.value.htmlPreview, c), Ot(i);
}, zx = (e) => {
  const t = le("editorId"), n = le("theme"), r = le("rootRef"), { editorExtensions: u, editorExtensionsAttrs: o, echartsConfig: s } = Dt;
  let i = u.echarts.instance;
  const a = Yr(-1), c = () => {
    !e.noEcharts && i && (a.value = a.value + 1);
  };
  Pe(
    () => n.value,
    () => {
      c();
    }
  ), Ot(() => {
    if (e.noEcharts || i)
      return;
    const v = u.echarts.js;
    xn(
      "script",
      {
        ...o.echarts?.js,
        src: v,
        id: vn.echarts,
        onload() {
          i = window.echarts, c();
        }
      },
      "echarts"
    );
  });
  let f = [], l = [], d = [];
  const p = (v = !1) => {
    if (!f.length) {
      v && (l.forEach((h) => {
        h.dispose?.();
      }), d.forEach((h) => {
        h.disconnect?.();
      }), l = [], d = []);
      return;
    }
    const _ = [], A = [], E = [];
    f.forEach((h, w) => {
      const g = l[w], y = d[w];
      if (v || !h || !h.isConnected || r?.value && !r.value.contains(h)) {
        g?.dispose?.(), y?.disconnect?.();
        return;
      }
      _.push(h), g && A.push(g), y && E.push(y);
    }), f = _, l = A, d = E;
  }, m = () => {
    p(), !e.noEcharts && i && Array.from(
      r.value.querySelectorAll(
        `#${t} div.${U}-echarts:not([data-processed])`
      )
    ).forEach((v) => {
      if (v.dataset.closed === "false")
        return !1;
      try {
        const _ = u.echarts.parseOption(v.innerText, {
          editorId: t,
          element: v
        }), A = s(_), E = i.init(v, n.value);
        E.setOption(A), v.setAttribute("data-processed", ""), f.push(v), l.push(E);
        const h = new ResizeObserver(() => {
          E.resize();
        });
        h.observe(v), d.push(h);
      } catch (_) {
        bt.emit(t, Ss, {
          name: "echarts",
          message: _?.message,
          error: _
        });
      }
    });
  };
  return eu(() => {
    p(!0);
  }), { reRenderEcharts: a, replaceEcharts: m };
}, Mx = (e) => {
  const t = le("highlight"), n = Yr(Dt.editorExtensions.highlight.instance);
  return Ot(() => {
    e.noHighlight || n.value || (xn("link", {
      ...t.value.css,
      rel: "stylesheet",
      id: vn.hlcss
    }), xn(
      "script",
      {
        ...t.value.js,
        id: vn.hljs,
        onload() {
          n.value = window.hljs;
        }
      },
      "hljs"
    ));
  }), Pe(
    () => t.value.css,
    () => {
      e.noHighlight || Dt.editorExtensions.highlight.instance || $y("link", {
        ...t.value.css,
        rel: "stylesheet",
        id: vn.hlcss
      });
    }
  ), n;
}, Px = (e) => {
  const t = Yr(Dt.editorExtensions.katex.instance);
  return Ot(() => {
    if (e.noKatex || t.value)
      return;
    const { editorExtensions: n, editorExtensionsAttrs: r } = Dt;
    xn(
      "script",
      {
        ...r.katex?.js,
        src: n.katex.js,
        id: vn.katexjs,
        onload() {
          t.value = window.katex;
        }
      },
      "katex"
    ), xn("link", {
      ...r.katex?.css,
      rel: "stylesheet",
      href: n.katex.css,
      id: vn.katexcss
    });
  }), t;
};
class Rx {
  constructor(t) {
    this.options = t;
  }
  options;
  cache = /* @__PURE__ */ new Map();
  isExpired(t) {
    return t.expiresAt <= Date.now();
  }
  deleteExpired(t, n) {
    const r = n ?? this.cache.get(t);
    return !r || !this.isExpired(r) ? !1 : (this.cache.delete(t), !0);
  }
  trim() {
    for (const [t, n] of this.cache)
      if (!this.deleteExpired(t, n))
        break;
    for (; this.cache.size > this.options.max; ) {
      const t = this.cache.keys().next().value;
      if (t === void 0)
        break;
      this.cache.delete(t);
    }
  }
  get(t) {
    const n = this.cache.get(t);
    if (!(!n || this.deleteExpired(t, n)))
      return this.cache.delete(t), this.cache.set(t, n), n.value;
  }
  set(t, n) {
    this.cache.delete(t), this.cache.set(t, {
      value: n,
      expiresAt: Date.now() + this.options.ttl
    }), this.trim();
  }
  clear() {
    this.cache.clear();
  }
}
const $u = new Rx({
  max: 1e3,
  // 缓存10分钟
  ttl: 6e5
}), jx = (e) => {
  const t = le("editorId"), n = le("theme"), r = le("rootRef"), { editorExtensions: u, editorExtensionsAttrs: o, mermaidConfig: s } = Dt;
  let i = u.mermaid.instance;
  const a = Yr(-1), c = () => {
    if (!e.noMermaid && i) {
      const f = n.value === "dark" ? {
        startOnLoad: !1,
        theme: "dark"
      } : {
        startOnLoad: !1,
        theme: "base",
        themeVariables: {
          background: "#ffffff",
          primaryColor: "#ffffff",
          primaryTextColor: "#1f2329",
          primaryBorderColor: "#b7c0cc",
          secondaryColor: "#f7f8fa",
          tertiaryColor: "#f7f8fa",
          lineColor: "#596273",
          edgeLabelBackground: "#ffffff",
          clusterBkg: "#ffffff",
          clusterBorder: "#b7c0cc"
        }
      };
      i.initialize(s(f)), a.value = a.value + 1;
    }
  };
  return Pe(
    () => n.value,
    () => {
      $u.clear(), c();
    }
  ), Ot(() => {
    if (e.noMermaid || i)
      return;
    const f = u.mermaid.js;
    /\.mjs/.test(f) ? (xn("link", {
      ...o.mermaid?.js,
      rel: "modulepreload",
      href: f,
      id: vn.mermaidM
    }), import(
      /* @vite-ignore */
      /* webpackIgnore: true */
      f
    ).then((l) => {
      i = l.default, c();
    }).catch((l) => {
      bt.emit(t, Ss, {
        name: "mermaid",
        message: `Failed to load mermaid module: ${l.message}`,
        error: l
      });
    })) : xn(
      "script",
      {
        ...o.mermaid?.js,
        src: f,
        id: vn.mermaid,
        onload() {
          i = window.mermaid, c();
        }
      },
      "mermaid"
    );
  }), { reRenderRef: a, replaceMermaid: async () => {
    if (!e.noMermaid && i) {
      const f = r.value.querySelectorAll(
        `div.${U}-mermaid`
      ), l = document.createElement("div"), d = document.body.offsetWidth > 1366 ? document.body.offsetWidth : 1366, p = document.body.offsetHeight > 768 ? document.body.offsetHeight : 768;
      l.style.width = d + "px", l.style.height = p + "px", l.style.position = "fixed", l.style.zIndex = "-10000", l.style.top = "-10000";
      let m = f.length;
      m > 0 && document.body.appendChild(l), await Promise.allSettled(
        Array.from(f).map((v) => (async (_) => {
          if (_.dataset.closed === "false")
            return !1;
          const A = _.innerText;
          let E = $u.get(A);
          if (!E) {
            const h = Cs();
            let w = { svg: "" };
            try {
              w = await i.render(h, A, l), E = await e.sanitizeMermaid(w.svg);
              const g = document.createElement("p");
              g.className = `${U}-mermaid`, g.setAttribute("data-processed", ""), g.setAttribute("data-content", A), g.innerHTML = E, g.children[0]?.removeAttribute("height"), $u.set(A, g.innerHTML), _.dataset.line !== void 0 && (g.dataset.line = _.dataset.line), _.replaceWith(g);
            } catch (g) {
              bt.emit(t, Ss, {
                name: "mermaid",
                message: g.message,
                error: g
              });
            }
            --m === 0 && l.remove();
          }
        })(v))
      );
    }
  } };
}, Lx = (e, t) => {
  t = t || {};
  const n = 3, r = t.marker || "!", u = r.charCodeAt(0), o = r.length;
  let s = "", i = "";
  const a = (f, l, d, p, m) => {
    const v = f[l];
    return v.type === "admonition_open" ? f[l].attrPush([
      "class",
      `${U}-admonition ${U}-admonition-${v.info}`
    ]) : v.type === "admonition_title_open" && f[l].attrPush(["class", `${U}-admonition-title`]), m.renderToken(f, l, d);
  }, c = (f) => {
    const l = f.trim().split(" ", 2);
    i = "", s = l[0], l.length > 1 && (i = f.substring(s.length + 2));
  };
  e.block.ruler.before(
    "code",
    "admonition",
    (f, l, d, p) => {
      let m, v, _, A = !1, E = f.bMarks[l] + f.tShift[l], h = f.eMarks[l];
      if (u !== f.src.charCodeAt(E))
        return !1;
      for (m = E + 1; m <= h && r[(m - E) % o] === f.src[m]; m++)
        ;
      const w = Math.floor((m - E) / o);
      if (w !== n)
        return !1;
      m -= (m - E) % o;
      const g = f.src.slice(E, m), y = f.src.slice(m, h);
      if (c(y), p)
        return !0;
      for (v = l; v++, !(v >= d || (E = f.bMarks[v] + f.tShift[v], h = f.eMarks[v], E < h && f.sCount[v] < f.blkIndent)); )
        if (u === f.src.charCodeAt(E) && !(f.sCount[v] - f.blkIndent >= 4)) {
          for (m = E + 1; m <= h && r[(m - E) % o] === f.src[m]; m++)
            ;
          if (!(Math.floor((m - E) / o) < w) && (m -= (m - E) % o, m = f.skipSpaces(m), !(m < h))) {
            A = !0;
            break;
          }
        }
      const C = f.parentType, k = f.lineMax;
      return f.parentType = "root", f.lineMax = v, _ = f.push("admonition_open", "div", 1), _.markup = g, _.block = !0, _.info = s, _.map = [l, v], i && (_ = f.push("admonition_title_open", "p", 1), _.markup = g + " " + s, _.map = [l, v], _ = f.push("inline", "", 0), _.content = i, _.map = [l, f.line - 1], _.children = [], _ = f.push("admonition_title_close", "p", -1), _.markup = g + " " + s), f.md.block.tokenize(f, l + 1, v), _ = f.push("admonition_close", "div", -1), _.markup = f.src.slice(E, m), _.block = !0, f.parentType = C, f.lineMax = k, f.line = v + (A ? 1 : 0), !0;
    },
    {
      alt: ["paragraph", "reference", "blockquote", "list"]
    }
  ), e.renderer.rules.admonition_open = a, e.renderer.rules.admonition_title_open = a, e.renderer.rules.admonition_title_close = a, e.renderer.rules.admonition_close = a;
}, Os = (e, t) => {
  const n = e.attrs ? e.attrs.slice() : [];
  return t.forEach((r) => {
    const u = e.attrIndex(r[0]);
    u < 0 ? n.push(r) : (n[u] = n[u].slice(), n[u][1] += ` ${r[1]}`);
  }), n;
}, Zx = (e, t) => {
  const n = e.renderer.rules.fence, r = e.utils.unescapeAll, u = /\[(\w*)(?::([\w ]*))?\]/, o = /::(open|close)/, s = (l) => l.info ? r(l.info).trim() : "", i = (l) => {
    const d = s(l), [p = null, m = ""] = (u.exec(d) || []).slice(1);
    return [p, m];
  }, a = (l) => {
    const d = s(l);
    return d ? d.split(/(\s+)/g)[0] : "";
  }, c = (l) => {
    const d = l.info.match(o) || [], p = d[1] === "open" || d[1] !== "close" && t.codeFoldable && l.content.trim().split(`
`).length < t.autoFoldThreshold, m = d[1] || t.codeFoldable ? "details" : "div", v = d[1] || t.codeFoldable ? "summary" : "div";
    return { open: p, tagContainer: m, tagHeader: v };
  }, f = (l, d, p, m, v) => {
    if (l[d].hidden)
      return "";
    const _ = t.usedLanguageTextRef.value?.copyCode.text, A = t.customIconRef.value.copy || _, E = !!t.customIconRef.value.copy, h = `<span class="${U}-collapse-tips">${Zt("collapse-tips", t.customIconRef.value)}</span>`, [w] = i(l[d]);
    if (w === null) {
      const { open: z, tagContainer: $, tagHeader: ne } = c(l[d]), fe = [["class", `${U}-code`]];
      z && fe.push(["open", ""]);
      const ze = {
        attrs: Os(l[d], fe)
      };
      l[d].info = l[d].info.replace(o, "");
      const Se = n(l, d, p, m, v);
      return `
        <${$} ${v.renderAttrs(ze)}>
          <${ne} class="${U}-code-head">
            <div class="${U}-code-flag"><span></span><span></span><span></span></div>
            <div class="${U}-code-action">
              <span class="${U}-code-lang">${e.utils.escapeHtml(l[d].info.trim())}</span>
              <span class="${U}-copy-button" data-tips="${_}"${E ? " data-is-icon=true" : ""}>${A}</span>
              ${t.extraTools instanceof Function ? t.extraTools({ lang: l[d].info.trim() }) : t.extraTools || ""}
              ${$ === "details" ? h : ""}
            </div>
          </${ne}>
          ${Se}
        </${$}>
      `;
    }
    let g, y, C, k, Z = "", W = "", K = "";
    const { open: B, tagContainer: G, tagHeader: q } = c(l[d]), H = [["class", `${U}-code`]];
    B && H.push(["open", ""]);
    const N = {
      attrs: Os(l[d], H)
    };
    for (let z = d; z < l.length && (g = l[z], [y, C] = i(g), y === w); z++) {
      g.info = g.info.replace(u, "").replace(o, ""), g.hidden = !0;
      const $ = `${U}-codetab-${t.editorId}-${d}-${z - d}`;
      k = z - d > 0 ? "" : "checked", Z += `
        <li>
          <input
            type="radio"
            id="label-${U}-codetab-label-1-${t.editorId}-${d}-${z - d}"
            name="${U}-codetab-label-${t.editorId}-${d}"
            class="${$}"
            ${k}
          >
          <label
            for="label-${U}-codetab-label-1-${t.editorId}-${d}-${z - d}"
            onclick="this.getRootNode().querySelectorAll('.${$}').forEach(e => e.click())"
          >
            ${e.utils.escapeHtml(C || a(g))}
          </label>
        </li>`, W += `
        <div role="tabpanel">
          <input
            type="radio"
            name="${U}-codetab-pre-${t.editorId}-${d}"
            class="${$}"
            ${k}
            role="presentation">
          ${n(l, z, p, m, v)}
        </div>`, K += `
        <input
          type="radio"
          name="${U}-codetab-lang-${t.editorId}-${d}"
          class="${$}"
          ${k}
          role="presentation">
        <span class=${U}-code-lang role="note">${e.utils.escapeHtml(a(g))}</span>`;
    }
    return `
      <${G} ${v.renderAttrs(N)}>
        <${q} class="${U}-code-head">
          <div class="${U}-code-flag">
            <ul class="${U}-codetab-label" role="tablist">${Z}</ul>
          </div>
          <div class="${U}-code-action">
            <span class="${U}-codetab-lang">${K}</span>
            <span class="${U}-copy-button" data-tips="${_}"${E ? " data-is-icon=true" : ""}>${A}</span>
            ${t.extraTools instanceof Function ? t.extraTools({ lang: l[d].info.trim() }) : t.extraTools || ""}
            ${G === "details" ? h : ""}
          </div>
        </${q}>
        ${W}
      </${G}>
    `;
  };
  e.renderer.rules.fence = f, e.renderer.rules.code_block = f;
}, Vx = (e, t) => {
  const n = e.renderer.rules.fence.bind(e.renderer.rules);
  e.renderer.rules.fence = (r, u, o, s, i) => {
    const a = r[u], c = a.content.trim();
    if (a.info === "echarts") {
      if (a.attrSet("class", `${U}-echarts`), a.attrSet("data-echarts-theme", t.themeRef.value), a.map && a.level === 0) {
        const f = a.map[1] - 1, l = !!s.srcLines[f]?.trim()?.startsWith("```");
        a.attrSet("data-closed", `${l}`), a.attrSet("data-line", String(a.map[0]));
      }
      return `<div ${i.renderAttrs(a)} style="width: 100%; aspect-ratio: 4 / 3;">${e.utils.escapeHtml(c)}</div>`;
    }
    return n(r, u, o, s, i);
  };
}, Bx = (e, t) => {
  e.renderer.rules.heading_open = (n, r) => {
    const u = n[r], o = n[r + 1].children?.reduce((i, a) => i + (["text", "code_inline", "math_inline"].includes(a.type) && a.content || ""), "") || "", s = u.markup.length;
    return t.headsRef.value.push({
      text: o,
      level: s,
      line: u.map[0],
      currentToken: u,
      nextToken: n[r + 1]
    }), u.map && u.level === 0 && u.attrSet(
      "id",
      t.mdHeadingId({
        text: o,
        level: s,
        index: t.headsRef.value.length,
        currentToken: u,
        nextToken: n[r + 1]
      })
    ), e.renderer.renderToken(n, r, t);
  }, e.renderer.rules.heading_close = (n, r, u, o, s) => s.renderToken(n, r, u);
}, xc = {
  block: [
    { open: "$$", close: "$$" },
    { open: "\\[", close: "\\]" }
  ],
  inline: [
    { open: "$$", close: "$$" },
    { open: "$", close: "$" },
    { open: "\\[", close: "\\]" },
    { open: "\\(", close: "\\)" }
  ]
}, Ux = (e) => (t, n) => {
  const r = e.delimiters;
  for (const u of r) {
    if (!t.src.startsWith(u.open, t.pos))
      continue;
    const o = t.pos + u.open.length;
    let s = o;
    for (; (s = t.src.indexOf(u.close, s)) !== -1; ) {
      let i = 0, a = s - 1;
      for (; a >= 0 && t.src[a] === "\\"; )
        i++, a--;
      if (i % 2 === 0)
        break;
      s += u.close.length;
    }
    if (s !== -1) {
      if (s - o === 0)
        return n || (t.pending += u.open + u.close), t.pos = s + u.close.length, !0;
      if (!n) {
        const i = t.push("math_inline", "math", 0);
        i.markup = u.open, i.content = t.src.slice(o, s);
      }
      return t.pos = s + u.close.length, !0;
    }
  }
  return !1;
}, Hx = (e) => (t, n, r, u) => {
  const o = e.delimiters, s = t.bMarks[n] + t.tShift[n], i = t.eMarks[n], a = (c, f, l) => {
    t.line = f;
    const d = t.push("math_block", "math", 0);
    return d.block = !0, d.content = c, d.map = [n, t.line], d.markup = l, !0;
  };
  for (const c of o) {
    const f = s;
    if (t.src.slice(f, f + c.open.length) !== c.open)
      continue;
    const l = f + c.open.length, d = t.src.slice(l, i).trim(), p = d === "", m = d === c.close, v = d.endsWith(c.close);
    if (!p && !m && !v)
      continue;
    if (u)
      return !0;
    if (m)
      return a("", n + 1, c.open);
    if (!p && v) {
      const w = d.slice(0, -c.close.length);
      return a(w, n + 1, c.open);
    }
    let _ = n + 1, A = !1, E = "";
    for (; _ < r; _++) {
      const w = t.bMarks[_] + t.tShift[_], g = t.eMarks[_];
      if (w < g && t.tShift[_] < t.blkIndent)
        break;
      if (t.src.slice(w, g).trim().endsWith(c.close)) {
        const y = t.src.slice(0, g).lastIndexOf(c.close);
        E = t.src.slice(w, y), A = !0;
        break;
      }
    }
    if (!A)
      continue;
    const h = t.getLines(n + 1, _, t.tShift[n], !0) + (E.trim() ? E : "");
    return a(h, _ + 1, c.open);
  }
  return !1;
}, qx = (e, { katexRef: t, inlineDelimiters: n, blockDelimiters: r }) => {
  const u = (i, a, c, f, l = !1) => {
    const d = {
      attrs: Os(i, [["class", a]])
    }, p = f.renderAttrs(d);
    if (!t.value)
      return `<${c} ${p}>${i.content}</${c}>`;
    const m = t.value.renderToString(
      i.content,
      Dt.katexConfig({
        throwOnError: !1,
        displayMode: l
      })
    );
    return `<${c} ${p} data-processed>${m}</${c}>`;
  }, o = (i, a, c, f, l) => u(i[a], `${U}-katex-inline`, "span", l), s = (i, a, c, f, l) => u(i[a], `${U}-katex-block`, "p", l, !0);
  e.inline.ruler.before(
    "escape",
    "math_inline",
    Ux({
      delimiters: n || xc.inline
    })
  ), e.block.ruler.after(
    "blockquote",
    "math_block",
    Hx({
      delimiters: r || xc.block
    }),
    {
      alt: ["paragraph", "reference", "blockquote", "list"]
    }
  ), e.renderer.rules.math_inline = o, e.renderer.rules.math_block = s;
}, Jx = (e, t) => {
  const n = e.renderer.rules.fence.bind(e.renderer.rules);
  e.renderer.rules.fence = (r, u, o, s, i) => {
    const a = r[u], c = a.content.trim();
    if (a.info === "mermaid") {
      if (a.attrSet("class", `${U}-mermaid`), a.attrSet("data-mermaid-theme", t.themeRef.value), a.map && a.level === 0) {
        const l = a.map[1] - 1, d = !!s.srcLines[l]?.trim()?.startsWith("```");
        a.attrSet("data-closed", `${d}`), a.attrSet("data-line", String(a.map[0]));
      }
      const f = $u.get(c);
      return f ? (a.attrSet("data-processed", ""), a.attrSet("data-content", c), `<p ${i.renderAttrs(a)}>${f}</p>`) : `<div ${i.renderAttrs(a)}>${e.utils.escapeHtml(c)}</div>`;
    }
    return n(r, u, o, s, i);
  };
}, Ec = (e, t, n) => {
  const r = e.attrIndex(t), u = [t, n];
  r < 0 ? e.attrPush(u) : (e.attrs = e.attrs || [], e.attrs[r] = u);
}, Wx = (e) => e.type === "inline", Gx = (e) => e.type === "paragraph_open", Kx = (e) => e.type === "list_item_open", Yx = (e) => e.content.indexOf("[ ] ") === 0 || e.content.indexOf("[x] ") === 0 || e.content.indexOf("[X] ") === 0, Xx = (e, t) => Wx(e[t]) && Gx(e[t - 1]) && Kx(e[t - 2]) && Yx(e[t]), Qx = (e, t) => {
  const n = e[t].level - 1;
  for (let r = t - 1; r >= 0; r--)
    if (e[r].level === n)
      return r;
  return -1;
}, e4 = (e) => {
  const t = new e("html_inline", "", 0);
  return t.content = "<label>", t;
}, t4 = (e) => {
  const t = new e("html_inline", "", 0);
  return t.content = "</label>", t;
}, n4 = (e, t, n) => {
  const r = new n("html_inline", "", 0);
  return r.content = '<label class="task-list-item-label" for="' + t + '">' + e + "</label>", r.attrs = [["for", t]], r;
}, r4 = (e, t, n) => {
  const r = new t("html_inline", "", 0), u = n.enabled ? " " : ' disabled="" ';
  return e.content.indexOf("[ ] ") === 0 ? r.content = '<input class="task-list-item-checkbox"' + u + 'type="checkbox">' : (e.content.indexOf("[x] ") === 0 || e.content.indexOf("[X] ") === 0) && (r.content = '<input class="task-list-item-checkbox" checked=""' + u + 'type="checkbox">'), r;
}, u4 = (e, t, n) => {
  if (e.children = e.children || [], e.children.unshift(r4(e, t, n)), e.children[1].content = e.children[1].content.slice(3), e.content = e.content.slice(3), n.label)
    if (n.labelAfter) {
      e.children.pop();
      const r = "task-item-" + Math.ceil(Math.random() * (1e4 * 1e3) - 1e3);
      e.children[0].content = e.children[0].content.slice(0, -1) + ' id="' + r + '">', e.children.push(n4(e.content, r, t));
    } else
      e.children.unshift(e4(t)), e.children.push(t4(t));
}, o4 = (e, t = {}) => {
  e.core.ruler.after("inline", "github-task-lists", (n) => {
    const r = n.tokens;
    for (let u = 2; u < r.length; u++)
      Xx(r, u) && (u4(r[u], n.Token, t), Ec(
        r[u - 2],
        "class",
        "task-list-item" + (t.enabled ? " enabled" : " ")
      ), Ec(r[Qx(r, u - 2)], "class", "contains-task-list"));
  });
}, s4 = (e) => {
  e.core.ruler.push("init-line-number", (t) => (t.tokens.forEach((n) => {
    n.map && (n.attrs || (n.attrs = []), n.attrs.push(["data-line", n.map[0].toString()]));
  }), !0));
}, i4 = (e, t) => {
  const { editorConfig: n, markdownItPlugins: r } = Dt, u = le("editorId"), o = le("language"), s = le(
    "usedLanguageText"
  ), i = le("showCodeRowNumber"), a = le("theme"), c = le("customIcon"), f = le("rootRef"), l = le("setting"), d = Ve([]), p = Mx(e), m = Px(e), { reRenderRef: v, replaceMermaid: _ } = jx(e), { reRenderEcharts: A, replaceEcharts: E } = zx(e), h = vt({
    html: !0,
    breaks: !0,
    linkify: !0
  }), w = [
    {
      type: "image",
      plugin: _x,
      options: { figcaption: !0, classes: "md-zoom" }
    },
    {
      type: "admonition",
      plugin: Lx,
      options: {}
    },
    {
      type: "taskList",
      plugin: o4,
      options: {}
    },
    {
      type: "heading",
      plugin: Bx,
      options: { mdHeadingId: e.mdHeadingId, headsRef: d }
    },
    {
      type: "code",
      plugin: Zx,
      options: {
        editorId: u,
        usedLanguageTextRef: s,
        // showCodeRowNumber,
        codeFoldable: e.codeFoldable,
        autoFoldThreshold: e.autoFoldThreshold,
        customIconRef: c
      }
    },
    {
      type: "sub",
      plugin: Ex,
      options: {}
    },
    {
      type: "sup",
      plugin: Cx,
      options: {}
    }
  ];
  e.noKatex || w.push({
    type: "katex",
    plugin: qx,
    options: { katexRef: m }
  }), e.noMermaid || w.push({
    type: "mermaid",
    plugin: Jx,
    options: { themeRef: a }
  }), e.noEcharts || w.push({
    type: "echarts",
    plugin: Vx,
    options: { themeRef: a }
  }), r(w, {
    editorId: u
  }).forEach((H) => {
    h.use(H.plugin, H.options);
  });
  const g = h.options.highlight;
  h.set({
    highlight: (H, N, z) => {
      if (g) {
        const fe = g(H, N, z);
        if (fe)
          return fe;
      }
      let $;
      !e.noHighlight && p.value ? p.value.getLanguage(N) ? $ = p.value.highlight(H, {
        language: N,
        ignoreIllegals: !0
      }).value : $ = p.value.highlightAuto(H).value : $ = h.utils.escapeHtml(H);
      const ne = i ? Dy(
        $.replace(/^\n+|\n+$/g, ""),
        H.replace(/^\n+|\n+$/g, "")
      ) : `<span class="${U}-code-block">${$.replace(/^\n+|\n+$/g, "")}</span>`;
      return `<pre><code class="language-${N}" language=${N}>${ne}</code></pre>`;
    }
  }), s4(h);
  const y = Ve(`_article-key_${Cs()}`), C = Ve(
    e.sanitize(
      h.render(e.modelValue, {
        srcLines: e.modelValue.split(`
`)
      })
    )
  );
  let k = () => {
  }, Z = () => {
  };
  const W = () => {
    const H = f.value?.querySelectorAll(
      `#${u} p.${U}-mermaid:not([data-closed=false])`
    );
    Z(), Z = Oy(H, {
      customIcon: c.value
    }), k(), k = Iy(H, {
      customIcon: c.value
    });
  }, K = () => {
    bt.emit(u, ky, C.value), e.onHtmlChanged(C.value), e.onGetCatalog(d.value), bt.emit(u, Bo, d.value), un(() => {
      _().then(W), E();
    });
  }, B = () => {
    d.value = [], C.value = e.sanitize(
      h.render(e.modelValue, {
        srcLines: e.modelValue.split(`
`)
      })
    );
  }, G = Fe(() => (e.noKatex || !!m.value) && (e.noHighlight || !!p.value));
  let q = -1;
  return Pe([Y0(e, "modelValue"), G, v, o], () => {
    q = window.setTimeout(
      () => {
        B();
      },
      t ? 0 : n.renderDelay
    );
  }), Pe(
    () => l.value.preview,
    () => {
      l.value.preview && un(() => {
        _().then(W), E(), bt.emit(u, Bo, d.value);
      });
    }
  ), Pe([C, A], () => {
    K();
  }), Ot(K), Ot(() => {
    bt.on(u, {
      name: wy,
      callback() {
        bt.emit(u, Bo, d.value);
      }
    }), bt.on(u, {
      name: kd,
      callback: () => {
        y.value = `_article-key_${Cs()}`, B();
      }
    });
  }), eu(() => {
    k(), Z(), clearTimeout(q);
  }), { html: C, key: y };
}, a4 = (e, t) => {
  const n = le("editorId"), r = le("setting"), { noImgZoomIn: u } = e, o = py(() => {
    const s = document.querySelectorAll(
      `#${n}-preview img:not(.not-zoom):not(.medium-zoom-image)`
    );
    s.length !== 0 && $x(s, {
      background: "#00000073"
    });
  });
  Ot(async () => {
    !u && r.value.preview && await o();
  }), Pe([t, () => r.value.preview], async () => {
    !u && r.value.preview && await o();
  });
}, kc = {
  checked: {
    regexp: /- \[x\]/,
    value: "- [ ]"
  },
  unChecked: {
    regexp: /- \[\s\]/,
    value: "- [x]"
  }
}, c4 = (e, t) => {
  const n = le("editorId"), r = le("rootRef");
  let u = () => {
  };
  const o = () => {
    if (!r.value)
      return !1;
    const s = r.value.querySelectorAll(".task-list-item.enabled"), i = (a) => {
      a.preventDefault();
      const c = a.target.checked ? "unChecked" : "checked", f = a.target.parentElement?.dataset.line;
      if (!f)
        return;
      const l = Number(f), d = e.modelValue.split(`
`), p = d[Number(l)].replace(
        kc[c].regexp,
        kc[c].value
      );
      e.previewOnly ? (d[Number(l)] = p, e.onChange(d.join(`
`))) : bt.emit(n, Cy, l + 1, p);
    };
    s.forEach((a) => {
      a.addEventListener("click", i);
    }), u = () => {
      s.forEach((a) => {
        a.removeEventListener("click", i);
      });
    };
  };
  eu(() => {
    u();
  }), Pe(
    [t],
    () => {
      u(), un(o);
    },
    {
      immediate: !0
    }
  );
}, l4 = (e, t, n) => {
  const r = le("setting"), u = () => {
    un(() => {
      e.onRemount?.();
    });
  }, o = (s) => {
    s && u();
  };
  Pe([t, n], u), Pe(() => r.value.preview, o), Pe(() => r.value.htmlPreview, o), Ot(u);
}, e0 = {
  modelValue: {
    type: String,
    default: ""
  },
  onChange: {
    type: Function,
    default: () => {
    }
  },
  onHtmlChanged: {
    type: Function,
    default: () => {
    }
  },
  onGetCatalog: {
    type: Function,
    default: () => {
    }
  },
  mdHeadingId: {
    type: Function,
    default: () => ""
  },
  noMermaid: {
    type: Boolean,
    default: !1
  },
  sanitize: {
    type: Function,
    default: (e) => e
  },
  // 不使用该函数功能
  noKatex: {
    type: Boolean,
    default: !1
  },
  formatCopiedText: {
    type: Function,
    default: (e) => e
  },
  noHighlight: {
    type: Boolean,
    default: !1
  },
  previewOnly: {
    type: Boolean,
    default: !1
  },
  noImgZoomIn: {
    type: Boolean
  },
  sanitizeMermaid: {
    type: Function
  },
  codeFoldable: {
    type: Boolean
  },
  autoFoldThreshold: {
    type: Number
  },
  onRemount: {
    type: Function
  },
  noEcharts: {
    type: Boolean
  },
  previewComponent: {
    type: [Object, Function],
    default: void 0
  }
};
({
  ...e0
});
const wc = (e) => {
  const t = new DOMParser().parseFromString(e, "text/html");
  return Array.from(t.body.childNodes);
}, f4 = (e, t) => e.nodeType !== t.nodeType ? !1 : e.nodeType === Node.TEXT_NODE || e.nodeType === Node.COMMENT_NODE ? e.textContent === t.textContent : e.nodeType === Node.ELEMENT_NODE ? e.outerHTML === t.outerHTML : e.isEqualNode ? e.isEqualNode(t) : !1, d4 = /* @__PURE__ */ It({
  name: "UpdateOnDemand",
  props: {
    id: {
      type: String,
      required: !0
    },
    class: {
      type: [String, Array, Object],
      required: !0
    },
    html: {
      type: String,
      required: !0
    }
  },
  setup(e) {
    const t = Ve(), n = e.html, r = (u, o) => {
      if (!t.value) return;
      const s = t.value, i = Array.from(s.childNodes), a = Math.min(u.length, o.length);
      let c = -1;
      for (let l = 0; l < a; l++)
        if (!f4(u[l], o[l])) {
          c = l;
          break;
        }
      if (c === -1)
        if (o.length > u.length)
          c = u.length;
        else if (u.length > o.length)
          c = o.length;
        else
          return;
      const f = Math.min(c, i.length);
      for (let l = i.length - 1; l >= f; l--)
        i[l].remove();
      for (let l = c; l < u.length; l++)
        s.appendChild(u[l].cloneNode(!0));
    };
    return Pe(() => e.html, (u, o) => {
      const s = wc(u), i = wc(o || "");
      r(s, i);
    }), () => Ee("div", {
      id: e.id,
      class: e.class,
      innerHTML: n,
      ref: t
    }, null);
  }
}), p4 = /* @__PURE__ */ It({
  name: "ContentPreview",
  props: e0,
  setup(e) {
    const t = le("editorId"), n = le("setting"), r = le("previewTheme"), u = le("showCodeRowNumber"), {
      html: o,
      key: s
    } = i4(e, e.previewOnly);
    Fx(e, o, s), a4(e, o), c4(e, o), l4(e, o, s);
    const i = Fe(() => [`${U}-preview`, `${r?.value}-theme`, u && `${U}-scrn`].filter(Boolean)), a = () => {
      const c = `${t}-preview`;
      return e.previewComponent ? Lh(e.previewComponent, {
        key: s.value,
        html: o.value,
        id: c,
        class: i.value
      }) : Ee(d4, {
        key: s.value,
        html: o.value,
        id: c,
        class: i.value
      }, null);
    };
    return () => Ee(tt, null, [n.value.preview && (e.previewOnly ? a() : Ee("div", {
      id: `${t}-preview-wrapper`,
      class: `${U}-preview-wrapper`,
      key: "content-preview-wrapper"
    }, [a()])), n.value.htmlPreview && Ee("div", {
      id: `${t}-html-wrapper`,
      class: `${U}-preview-wrapper`,
      key: "html-preview-wrapper"
    }, [Ee("div", {
      class: `${U}-html`
    }, [o.value])])]);
  }
}), h4 = ({ text: e }) => e, t0 = {
  /**
   * markdown content.
   *
   * @default ''
   */
  modelValue: {
    type: String,
    default: ""
  },
  /**
   * input回调事件
   */
  onChange: {
    type: Function,
    default: void 0
  },
  /**
   * 主题，支持light和dark
   *
   * @default 'light'
   */
  theme: {
    type: String,
    default: "light"
  },
  /**
   * 外层类名
   *
   * @default ''
   */
  class: {
    type: String,
    default: ""
  },
  /**
   * 预设语言名称
   *
   * @default 'zh-CN'
   */
  language: {
    type: String,
    default: "zh-CN"
  },
  /**
   * html变化事件
   */
  onHtmlChanged: {
    type: Function,
    default: void 0
  },
  /**
   * 获取目录结构
   */
  onGetCatalog: {
    type: Function,
    default: void 0
  },
  /**
   * 编辑器唯一标识
   *
   * @default 'md-editor-v3'
   * @deprecated 5.x版本开始使用 id 替换
   */
  editorId: {
    type: String,
    default: void 0
  },
  /**
   * 5.x版本开始 editorId 的替换
   *
   * @default 'md-editor-v3'
   */
  id: {
    type: String,
    default: void 0
  },
  /**
   * 预览中代码是否显示行号
   *
   * @default true
   */
  showCodeRowNumber: {
    type: Boolean,
    default: !0
  },
  /**
   * 预览内容样式
   *
   * @default 'default'
   */
  previewTheme: {
    type: String,
    default: "default"
  },
  /**
   * 编辑器样式
   */
  style: {
    type: Object,
    default: () => ({})
  },
  /**
   * 标题的id生成方式
   *
   * @default (text: string) => text
   */
  mdHeadingId: {
    type: Function,
    default: h4
  },
  /**
   *
   * 不能保证文本正确的情况，在marked编译md文本后通过该方法处理
   * 推荐DOMPurify、sanitize-html
   *
   * @default (text: string) => text
   */
  sanitize: {
    type: Function,
    default: (e) => e
  },
  /**
   * 不使用该mermaid
   *
   * @default false
   */
  noMermaid: {
    type: Boolean,
    default: !1
  },
  /**
   * 不使用katex
   *
   * @default false
   */
  noKatex: {
    type: Boolean,
    default: !1
  },
  /**
   * 代码主题
   *
   * @default 'atom'
   */
  codeTheme: {
    type: String,
    default: "atom"
  },
  /**
   * 复制代码格式化方法
   *
   * @default (text) => text
   */
  formatCopiedText: {
    type: Function,
    default: (e) => e
  },
  /**
   * 某些预览主题的代码模块背景是暗色系
   * 将这个属性设置为true，会自动在该主题下的light模式下使用暗色系的代码风格
   *
   * @default true
   */
  codeStyleReverse: {
    type: Boolean,
    default: !0
  },
  /**
   * 需要自动调整的预览主题
   *
   * @default ['default', 'mk-cute']
   */
  codeStyleReverseList: {
    type: Array,
    default: ["default", "mk-cute"]
  },
  noHighlight: {
    type: Boolean,
    default: !1
  },
  /**
   * 是否关闭编辑器默认的放大缩小功能
   */
  noImgZoomIn: {
    type: Boolean,
    default: !1
  },
  /**
   * 自定义的图标
   */
  customIcon: {
    type: Object,
    default: {}
  },
  sanitizeMermaid: {
    type: Function,
    default: (e) => Promise.resolve(e)
  },
  /**
   * 是否开启折叠代码功能
   * 不开启会使用div标签替代details标签
   *
   * @default true
   */
  codeFoldable: {
    type: Boolean,
    default: !0
  },
  /**
   * 触发自动折叠代码的行数阈值
   *
   * @default 30
   */
  autoFoldThreshold: {
    type: Number,
    default: 30
  },
  /**
   * 内容重新挂载事件
   *
   * 相比起onHtmlChanged，onRemount会在重新挂载后触发
   */
  onRemount: {
    type: Function,
    default: void 0
  },
  /**
   * 不使用 echarts
   */
  noEcharts: {
    type: Boolean,
    default: !1
  },
  previewComponent: {
    type: [Object, Function],
    default: void 0
  }
};
({
  ...t0
});
const n0 = [
  "onHtmlChanged",
  "onGetCatalog",
  "onChange",
  "onRemount",
  "update:modelValue"
];
[
  ...n0
];
const m4 = (e, t, n) => {
  const { editorId: r } = n, u = {
    rerender() {
      bt.emit(r, kd);
    }
  };
  t.expose(u);
}, Nu = /* @__PURE__ */ It({
  name: "MdPreview",
  props: t0,
  emits: n0,
  setup(e, t) {
    const {
      noKatex: n,
      noMermaid: r,
      noHighlight: u
    } = e, o = Ve(), s = Tx(e);
    Ix(e, {
      rootRef: o,
      editorId: s
    }), m4(e, t, {
      editorId: s
    }), eu(() => {
      bt.clear(s);
    });
    const i = (l) => {
      e.onChange?.(l), t.emit("onChange", l), t.emit("update:modelValue", l);
    }, a = (l) => {
      e.onHtmlChanged?.(l), t.emit("onHtmlChanged", l);
    }, c = (l) => {
      e.onGetCatalog?.(l), t.emit("onGetCatalog", l);
    }, f = () => {
      e.onRemount?.(), t.emit("onRemount");
    };
    return () => Ee("div", {
      id: s,
      class: [U, e.class, e.theme === "dark" && `${U}-dark`, `${U}-previewOnly`],
      style: e.style,
      ref: o
    }, [Ee(p4, {
      modelValue: e.modelValue,
      onChange: i,
      onHtmlChanged: a,
      onGetCatalog: c,
      mdHeadingId: e.mdHeadingId,
      noMermaid: r,
      sanitize: e.sanitize,
      noKatex: n,
      formatCopiedText: e.formatCopiedText,
      noHighlight: u,
      noImgZoomIn: e.noImgZoomIn,
      previewOnly: !0,
      sanitizeMermaid: e.sanitizeMermaid,
      codeFoldable: e.codeFoldable,
      autoFoldThreshold: e.autoFoldThreshold,
      onRemount: f,
      noEcharts: e.noEcharts,
      previewComponent: e.previewComponent
    }, null)]);
  }
});
Nu.install = (e) => (e.component(Nu.name, Nu), e);
const g4 = {
  onClick: {
    type: Function,
    default: void 0
  },
  /**
   * ==没有意义，仅用于规避克隆组件自动嵌入insert方法时，传入的是该组件而产生的waring
   */
  language: {
    type: String,
    default: void 0
  },
  theme: {
    type: String,
    default: void 0
  },
  disabled: {
    type: Boolean,
    default: void 0
  }
  /**
   * ==结束
   */
}, Yo = /* @__PURE__ */ It({
  name: "NormalFooterToolbar",
  props: g4,
  emits: ["onClick"],
  setup(e, t) {
    return () => {
      const n = Ey({
        props: e,
        ctx: t
      });
      return Ee("div", {
        class: [`${U}-footer-item`, e.disabled && `${U}-disabled`],
        onClick: (r) => {
          e.disabled || (e.onClick?.(r), t.emit("onClick", r));
        }
      }, [n]);
    };
  }
});
Yo.install = (e) => (e.component(Yo.name, Yo), e);
var Xo = { exports: {} }, $e = {}, Qo = { exports: {} }, In = {}, Cc;
function r0() {
  if (Cc) return In;
  Cc = 1;
  function e() {
    var o = {};
    return o["align-content"] = !1, o["align-items"] = !1, o["align-self"] = !1, o["alignment-adjust"] = !1, o["alignment-baseline"] = !1, o.all = !1, o["anchor-point"] = !1, o.animation = !1, o["animation-delay"] = !1, o["animation-direction"] = !1, o["animation-duration"] = !1, o["animation-fill-mode"] = !1, o["animation-iteration-count"] = !1, o["animation-name"] = !1, o["animation-play-state"] = !1, o["animation-timing-function"] = !1, o.azimuth = !1, o["backface-visibility"] = !1, o.background = !0, o["background-attachment"] = !0, o["background-clip"] = !0, o["background-color"] = !0, o["background-image"] = !0, o["background-origin"] = !0, o["background-position"] = !0, o["background-repeat"] = !0, o["background-size"] = !0, o["baseline-shift"] = !1, o.binding = !1, o.bleed = !1, o["bookmark-label"] = !1, o["bookmark-level"] = !1, o["bookmark-state"] = !1, o.border = !0, o["border-bottom"] = !0, o["border-bottom-color"] = !0, o["border-bottom-left-radius"] = !0, o["border-bottom-right-radius"] = !0, o["border-bottom-style"] = !0, o["border-bottom-width"] = !0, o["border-collapse"] = !0, o["border-color"] = !0, o["border-image"] = !0, o["border-image-outset"] = !0, o["border-image-repeat"] = !0, o["border-image-slice"] = !0, o["border-image-source"] = !0, o["border-image-width"] = !0, o["border-left"] = !0, o["border-left-color"] = !0, o["border-left-style"] = !0, o["border-left-width"] = !0, o["border-radius"] = !0, o["border-right"] = !0, o["border-right-color"] = !0, o["border-right-style"] = !0, o["border-right-width"] = !0, o["border-spacing"] = !0, o["border-style"] = !0, o["border-top"] = !0, o["border-top-color"] = !0, o["border-top-left-radius"] = !0, o["border-top-right-radius"] = !0, o["border-top-style"] = !0, o["border-top-width"] = !0, o["border-width"] = !0, o.bottom = !1, o["box-decoration-break"] = !0, o["box-shadow"] = !0, o["box-sizing"] = !0, o["box-snap"] = !0, o["box-suppress"] = !0, o["break-after"] = !0, o["break-before"] = !0, o["break-inside"] = !0, o["caption-side"] = !1, o.chains = !1, o.clear = !0, o.clip = !1, o["clip-path"] = !1, o["clip-rule"] = !1, o.color = !0, o["color-interpolation-filters"] = !0, o["column-count"] = !1, o["column-fill"] = !1, o["column-gap"] = !1, o["column-rule"] = !1, o["column-rule-color"] = !1, o["column-rule-style"] = !1, o["column-rule-width"] = !1, o["column-span"] = !1, o["column-width"] = !1, o.columns = !1, o.contain = !1, o.content = !1, o["counter-increment"] = !1, o["counter-reset"] = !1, o["counter-set"] = !1, o.crop = !1, o.cue = !1, o["cue-after"] = !1, o["cue-before"] = !1, o.cursor = !1, o.direction = !1, o.display = !0, o["display-inside"] = !0, o["display-list"] = !0, o["display-outside"] = !0, o["dominant-baseline"] = !1, o.elevation = !1, o["empty-cells"] = !1, o.filter = !1, o.flex = !1, o["flex-basis"] = !1, o["flex-direction"] = !1, o["flex-flow"] = !1, o["flex-grow"] = !1, o["flex-shrink"] = !1, o["flex-wrap"] = !1, o.float = !1, o["float-offset"] = !1, o["flood-color"] = !1, o["flood-opacity"] = !1, o["flow-from"] = !1, o["flow-into"] = !1, o.font = !0, o["font-family"] = !0, o["font-feature-settings"] = !0, o["font-kerning"] = !0, o["font-language-override"] = !0, o["font-size"] = !0, o["font-size-adjust"] = !0, o["font-stretch"] = !0, o["font-style"] = !0, o["font-synthesis"] = !0, o["font-variant"] = !0, o["font-variant-alternates"] = !0, o["font-variant-caps"] = !0, o["font-variant-east-asian"] = !0, o["font-variant-ligatures"] = !0, o["font-variant-numeric"] = !0, o["font-variant-position"] = !0, o["font-weight"] = !0, o.grid = !1, o["grid-area"] = !1, o["grid-auto-columns"] = !1, o["grid-auto-flow"] = !1, o["grid-auto-rows"] = !1, o["grid-column"] = !1, o["grid-column-end"] = !1, o["grid-column-start"] = !1, o["grid-row"] = !1, o["grid-row-end"] = !1, o["grid-row-start"] = !1, o["grid-template"] = !1, o["grid-template-areas"] = !1, o["grid-template-columns"] = !1, o["grid-template-rows"] = !1, o["hanging-punctuation"] = !1, o.height = !0, o.hyphens = !1, o.icon = !1, o["image-orientation"] = !1, o["image-resolution"] = !1, o["ime-mode"] = !1, o["initial-letters"] = !1, o["inline-box-align"] = !1, o["justify-content"] = !1, o["justify-items"] = !1, o["justify-self"] = !1, o.left = !1, o["letter-spacing"] = !0, o["lighting-color"] = !0, o["line-box-contain"] = !1, o["line-break"] = !1, o["line-grid"] = !1, o["line-height"] = !1, o["line-snap"] = !1, o["line-stacking"] = !1, o["line-stacking-ruby"] = !1, o["line-stacking-shift"] = !1, o["line-stacking-strategy"] = !1, o["list-style"] = !0, o["list-style-image"] = !0, o["list-style-position"] = !0, o["list-style-type"] = !0, o.margin = !0, o["margin-bottom"] = !0, o["margin-left"] = !0, o["margin-right"] = !0, o["margin-top"] = !0, o["marker-offset"] = !1, o["marker-side"] = !1, o.marks = !1, o.mask = !1, o["mask-box"] = !1, o["mask-box-outset"] = !1, o["mask-box-repeat"] = !1, o["mask-box-slice"] = !1, o["mask-box-source"] = !1, o["mask-box-width"] = !1, o["mask-clip"] = !1, o["mask-image"] = !1, o["mask-origin"] = !1, o["mask-position"] = !1, o["mask-repeat"] = !1, o["mask-size"] = !1, o["mask-source-type"] = !1, o["mask-type"] = !1, o["max-height"] = !0, o["max-lines"] = !1, o["max-width"] = !0, o["min-height"] = !0, o["min-width"] = !0, o["move-to"] = !1, o["nav-down"] = !1, o["nav-index"] = !1, o["nav-left"] = !1, o["nav-right"] = !1, o["nav-up"] = !1, o["object-fit"] = !1, o["object-position"] = !1, o.opacity = !1, o.order = !1, o.orphans = !1, o.outline = !1, o["outline-color"] = !1, o["outline-offset"] = !1, o["outline-style"] = !1, o["outline-width"] = !1, o.overflow = !1, o["overflow-wrap"] = !1, o["overflow-x"] = !1, o["overflow-y"] = !1, o.padding = !0, o["padding-bottom"] = !0, o["padding-left"] = !0, o["padding-right"] = !0, o["padding-top"] = !0, o.page = !1, o["page-break-after"] = !1, o["page-break-before"] = !1, o["page-break-inside"] = !1, o["page-policy"] = !1, o.pause = !1, o["pause-after"] = !1, o["pause-before"] = !1, o.perspective = !1, o["perspective-origin"] = !1, o.pitch = !1, o["pitch-range"] = !1, o["play-during"] = !1, o.position = !1, o["presentation-level"] = !1, o.quotes = !1, o["region-fragment"] = !1, o.resize = !1, o.rest = !1, o["rest-after"] = !1, o["rest-before"] = !1, o.richness = !1, o.right = !1, o.rotation = !1, o["rotation-point"] = !1, o["ruby-align"] = !1, o["ruby-merge"] = !1, o["ruby-position"] = !1, o["shape-image-threshold"] = !1, o["shape-outside"] = !1, o["shape-margin"] = !1, o.size = !1, o.speak = !1, o["speak-as"] = !1, o["speak-header"] = !1, o["speak-numeral"] = !1, o["speak-punctuation"] = !1, o["speech-rate"] = !1, o.stress = !1, o["string-set"] = !1, o["tab-size"] = !1, o["table-layout"] = !1, o["text-align"] = !0, o["text-align-last"] = !0, o["text-combine-upright"] = !0, o["text-decoration"] = !0, o["text-decoration-color"] = !0, o["text-decoration-line"] = !0, o["text-decoration-skip"] = !0, o["text-decoration-style"] = !0, o["text-emphasis"] = !0, o["text-emphasis-color"] = !0, o["text-emphasis-position"] = !0, o["text-emphasis-style"] = !0, o["text-height"] = !0, o["text-indent"] = !0, o["text-justify"] = !0, o["text-orientation"] = !0, o["text-overflow"] = !0, o["text-shadow"] = !0, o["text-space-collapse"] = !0, o["text-transform"] = !0, o["text-underline-position"] = !0, o["text-wrap"] = !0, o.top = !1, o.transform = !1, o["transform-origin"] = !1, o["transform-style"] = !1, o.transition = !1, o["transition-delay"] = !1, o["transition-duration"] = !1, o["transition-property"] = !1, o["transition-timing-function"] = !1, o["unicode-bidi"] = !1, o["vertical-align"] = !1, o.visibility = !1, o["voice-balance"] = !1, o["voice-duration"] = !1, o["voice-family"] = !1, o["voice-pitch"] = !1, o["voice-range"] = !1, o["voice-rate"] = !1, o["voice-stress"] = !1, o["voice-volume"] = !1, o.volume = !1, o["white-space"] = !1, o.widows = !1, o.width = !0, o["will-change"] = !1, o["word-break"] = !0, o["word-spacing"] = !0, o["word-wrap"] = !0, o["wrap-flow"] = !1, o["wrap-through"] = !1, o["writing-mode"] = !1, o["z-index"] = !1, o;
  }
  function t(o, s, i) {
  }
  function n(o, s, i) {
  }
  var r = /javascript\s*\:/img;
  function u(o, s) {
    return r.test(s) ? "" : s;
  }
  return In.whiteList = e(), In.getDefaultWhiteList = e, In.onAttr = t, In.onIgnoreAttr = n, In.safeAttrValue = u, In;
}
var Ac, Dc;
function u0() {
  return Dc || (Dc = 1, Ac = {
    indexOf: function(e, t) {
      var n, r;
      if (Array.prototype.indexOf)
        return e.indexOf(t);
      for (n = 0, r = e.length; n < r; n++)
        if (e[n] === t)
          return n;
      return -1;
    },
    forEach: function(e, t, n) {
      var r, u;
      if (Array.prototype.forEach)
        return e.forEach(t, n);
      for (r = 0, u = e.length; r < u; r++)
        t.call(n, e[r], r, e);
    },
    trim: function(e) {
      return String.prototype.trim ? e.trim() : e.replace(/(^\s*)|(\s*$)/g, "");
    },
    trimRight: function(e) {
      return String.prototype.trimRight ? e.trimRight() : e.replace(/(\s*$)/g, "");
    }
  }), Ac;
}
var es, Sc;
function b4() {
  if (Sc) return es;
  Sc = 1;
  var e = u0();
  function t(n, r) {
    n = e.trimRight(n), n[n.length - 1] !== ";" && (n += ";");
    var u = n.length, o = !1, s = 0, i = 0, a = "";
    function c() {
      if (!o) {
        var d = e.trim(n.slice(s, i)), p = d.indexOf(":");
        if (p !== -1) {
          var m = e.trim(d.slice(0, p)), v = e.trim(d.slice(p + 1));
          if (m) {
            var _ = r(s, a.length, m, v, d);
            _ && (a += _ + "; ");
          }
        }
      }
      s = i + 1;
    }
    for (; i < u; i++) {
      var f = n[i];
      if (f === "/" && n[i + 1] === "*") {
        var l = n.indexOf("*/", i + 2);
        if (l === -1) break;
        i = l + 1, s = i + 1, o = !1;
      } else f === "(" ? o = !0 : f === ")" ? o = !1 : f === ";" ? o || c() : f === `
` && c();
    }
    return e.trim(a);
  }
  return es = t, es;
}
var ts, $c;
function v4() {
  if ($c) return ts;
  $c = 1;
  var e = r0(), t = b4();
  u0();
  function n(o) {
    return o == null;
  }
  function r(o) {
    var s = {};
    for (var i in o)
      s[i] = o[i];
    return s;
  }
  function u(o) {
    o = r(o || {}), o.whiteList = o.whiteList || e.whiteList, o.onAttr = o.onAttr || e.onAttr, o.onIgnoreAttr = o.onIgnoreAttr || e.onIgnoreAttr, o.safeAttrValue = o.safeAttrValue || e.safeAttrValue, this.options = o;
  }
  return u.prototype.process = function(o) {
    if (o = o || "", o = o.toString(), !o) return "";
    var s = this, i = s.options, a = i.whiteList, c = i.onAttr, f = i.onIgnoreAttr, l = i.safeAttrValue, d = t(o, function(p, m, v, _, A) {
      var E = a[v], h = !1;
      if (E === !0 ? h = E : typeof E == "function" ? h = E(_) : E instanceof RegExp && (h = E.test(_)), h !== !0 && (h = !1), _ = l(v, _), !!_) {
        var w = {
          position: m,
          sourcePosition: p,
          source: A,
          isWhite: h
        };
        if (h) {
          var g = c(v, _, w);
          return n(g) ? v + ":" + _ : g;
        } else {
          var g = f(v, _, w);
          if (!n(g))
            return g;
        }
      }
    });
    return d;
  }, ts = u, ts;
}
var Nc;
function Is() {
  return Nc || (Nc = 1, (function(e, t) {
    var n = r0(), r = v4();
    function u(s, i) {
      var a = new r(i);
      return a.process(s);
    }
    t = e.exports = u, t.FilterCSS = r;
    for (var o in n) t[o] = n[o];
    typeof window < "u" && (window.filterCSS = e.exports);
  })(Qo, Qo.exports)), Qo.exports;
}
var Oc, Ic;
function Ei() {
  return Ic || (Ic = 1, Oc = {
    indexOf: function(e, t) {
      var n, r;
      if (Array.prototype.indexOf)
        return e.indexOf(t);
      for (n = 0, r = e.length; n < r; n++)
        if (e[n] === t)
          return n;
      return -1;
    },
    forEach: function(e, t, n) {
      var r, u;
      if (Array.prototype.forEach)
        return e.forEach(t, n);
      for (r = 0, u = e.length; r < u; r++)
        t.call(n, e[r], r, e);
    },
    trim: function(e) {
      return String.prototype.trim ? e.trim() : e.replace(/(^\s*)|(\s*$)/g, "");
    },
    spaceIndex: function(e) {
      var t = /\s|\n|\t/, n = t.exec(e);
      return n ? n.index : -1;
    }
  }), Oc;
}
var Tc;
function o0() {
  if (Tc) return $e;
  Tc = 1;
  var e = Is().FilterCSS, t = Is().getDefaultWhiteList, n = Ei();
  function r() {
    return {
      a: ["target", "href", "title"],
      abbr: ["title"],
      address: [],
      area: ["shape", "coords", "href", "alt"],
      article: [],
      aside: [],
      audio: [
        "autoplay",
        "controls",
        "crossorigin",
        "loop",
        "muted",
        "preload",
        "src"
      ],
      b: [],
      bdi: ["dir"],
      bdo: ["dir"],
      big: [],
      blockquote: ["cite"],
      br: [],
      caption: [],
      center: [],
      cite: [],
      code: [],
      col: ["align", "valign", "span", "width"],
      colgroup: ["align", "valign", "span", "width"],
      dd: [],
      del: ["datetime"],
      details: ["open"],
      div: [],
      dl: [],
      dt: [],
      em: [],
      figcaption: [],
      figure: [],
      font: ["color", "size", "face"],
      footer: [],
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      h5: [],
      h6: [],
      header: [],
      hr: [],
      i: [],
      img: ["src", "alt", "title", "width", "height", "loading"],
      ins: ["datetime"],
      kbd: [],
      li: [],
      mark: [],
      nav: [],
      ol: [],
      p: [],
      pre: [],
      s: [],
      section: [],
      small: [],
      span: [],
      sub: [],
      summary: [],
      sup: [],
      strong: [],
      strike: [],
      table: ["width", "border", "align", "valign"],
      tbody: ["align", "valign"],
      td: ["width", "rowspan", "colspan", "align", "valign"],
      tfoot: ["align", "valign"],
      th: ["width", "rowspan", "colspan", "align", "valign"],
      thead: ["align", "valign"],
      tr: ["rowspan", "align", "valign"],
      tt: [],
      u: [],
      ul: [],
      video: [
        "autoplay",
        "controls",
        "crossorigin",
        "loop",
        "muted",
        "playsinline",
        "poster",
        "preload",
        "src",
        "height",
        "width"
      ]
    };
  }
  var u = new e();
  function o(N, z, $) {
  }
  function s(N, z, $) {
  }
  function i(N, z, $) {
  }
  function a(N, z, $) {
  }
  function c(N) {
    return N.replace(l, "&lt;").replace(d, "&gt;");
  }
  function f(N, z, $, ne) {
    if ($ = W($), z === "href" || z === "src") {
      if ($ = n.trim($), $ === "#") return "#";
      if (!($.substr(0, 7) === "http://" || $.substr(0, 8) === "https://" || $.substr(0, 7) === "mailto:" || $.substr(0, 4) === "tel:" || $.substr(0, 11) === "data:image/" || $.substr(0, 6) === "ftp://" || $.substr(0, 2) === "./" || $.substr(0, 3) === "../" || $[0] === "#" || $[0] === "/"))
        return "";
    } else if (z === "background") {
      if (E.lastIndex = 0, E.test($))
        return "";
    } else if (z === "style") {
      if (h.lastIndex = 0, h.test($) || (w.lastIndex = 0, w.test($) && (E.lastIndex = 0, E.test($))))
        return "";
      ne !== !1 && (ne = ne || u, $ = ne.process($));
    }
    return $ = K($), $;
  }
  var l = /</g, d = />/g, p = /"/g, m = /&quot;/g, v = /&#([a-zA-Z0-9]*);?/gim, _ = /&colon;?/gim, A = /&newline;?/gim, E = /((j\s*a\s*v\s*a|v\s*b|l\s*i\s*v\s*e)\s*s\s*c\s*r\s*i\s*p\s*t\s*|m\s*o\s*c\s*h\s*a):/gi, h = /e\s*x\s*p\s*r\s*e\s*s\s*s\s*i\s*o\s*n\s*\(.*/gi, w = /u\s*r\s*l\s*\(.*/gi;
  function g(N) {
    return N.replace(p, "&quot;");
  }
  function y(N) {
    return N.replace(m, '"');
  }
  function C(N) {
    return N.replace(v, function(z, $) {
      return $[0] === "x" || $[0] === "X" ? String.fromCharCode(parseInt($.substr(1), 16)) : String.fromCharCode(parseInt($, 10));
    });
  }
  function k(N) {
    return N.replace(_, ":").replace(A, " ");
  }
  function Z(N) {
    for (var z = "", $ = 0, ne = N.length; $ < ne; $++)
      z += N.charCodeAt($) < 32 ? " " : N.charAt($);
    return n.trim(z);
  }
  function W(N) {
    return N = y(N), N = C(N), N = k(N), N = Z(N), N;
  }
  function K(N) {
    return N = g(N), N = c(N), N;
  }
  function B() {
    return "";
  }
  function G(N, z) {
    typeof z != "function" && (z = function() {
    });
    var $ = !Array.isArray(N);
    function ne(Se) {
      return $ ? !0 : n.indexOf(N, Se) !== -1;
    }
    var fe = [], ze = !1;
    return {
      onIgnoreTag: function(Se, Je, We) {
        if (ne(Se))
          if (We.isClosing) {
            var lt = "[/removed]", br = We.position + lt.length;
            return fe.push([
              ze !== !1 ? ze : We.position,
              br
            ]), ze = !1, lt;
          } else
            return ze || (ze = We.position), "[removed]";
        else
          return z(Se, Je, We);
      },
      remove: function(Se) {
        var Je = "", We = 0;
        return n.forEach(fe, function(lt) {
          Je += Se.slice(We, lt[0]), We = lt[1];
        }), Je += Se.slice(We), Je;
      }
    };
  }
  function q(N) {
    for (var z = "", $ = 0; $ < N.length; ) {
      var ne = N.indexOf("<!--", $);
      if (ne === -1) {
        z += N.slice($);
        break;
      }
      z += N.slice($, ne);
      var fe = N.indexOf("-->", ne);
      if (fe === -1)
        break;
      $ = fe + 3;
    }
    return z;
  }
  function H(N) {
    var z = N.split("");
    return z = z.filter(function($) {
      var ne = $.charCodeAt(0);
      return ne === 127 ? !1 : ne <= 31 ? ne === 10 || ne === 13 : !0;
    }), z.join("");
  }
  return $e.whiteList = r(), $e.getDefaultWhiteList = r, $e.onTag = o, $e.onIgnoreTag = s, $e.onTagAttr = i, $e.onIgnoreTagAttr = a, $e.safeAttrValue = f, $e.escapeHtml = c, $e.escapeQuote = g, $e.unescapeQuote = y, $e.escapeHtmlEntities = C, $e.escapeDangerHtml5Entities = k, $e.clearNonPrintableCharacter = Z, $e.friendlyAttrValue = W, $e.escapeAttrValue = K, $e.onIgnoreTagStripAll = B, $e.StripTagBody = G, $e.stripCommentTag = q, $e.stripBlankChar = H, $e.attributeWrapSign = '"', $e.cssFilter = u, $e.getDefaultCSSWhiteList = t, $e;
}
var yu = {}, Fc;
function s0() {
  if (Fc) return yu;
  Fc = 1;
  var e = Ei();
  function t(l) {
    var d = e.spaceIndex(l), p;
    return d === -1 ? p = l.slice(1, -1) : p = l.slice(1, d + 1), p = e.trim(p).toLowerCase(), p.slice(0, 1) === "/" && (p = p.slice(1)), p.slice(-1) === "/" && (p = p.slice(0, -1)), p;
  }
  function n(l) {
    return l.slice(0, 2) === "</";
  }
  function r(l, d, p) {
    var m = "", v = 0, _ = !1, A = !1, E = 0, h = l.length, w = "", g = "";
    e: for (E = 0; E < h; E++) {
      var y = l.charAt(E);
      if (_ === !1) {
        if (y === "<") {
          _ = E;
          continue;
        }
      } else if (A === !1) {
        if (y === "<") {
          m += p(l.slice(v, E)), _ = E, v = E;
          continue;
        }
        if (y === ">" || E === h - 1) {
          m += p(l.slice(v, _)), g = l.slice(_, E + 1), w = t(g), m += d(
            _,
            m.length,
            w,
            g,
            n(g)
          ), v = E + 1, _ = !1;
          continue;
        }
        if (y === '"' || y === "'")
          for (var C = 1, k = l.charAt(E - C); k.trim() === "" || k === "="; ) {
            if (k === "=") {
              A = y;
              continue e;
            }
            k = l.charAt(E - ++C);
          }
      } else if (y === A) {
        A = !1;
        continue;
      }
    }
    return v < h && (m += p(l.substr(v))), m;
  }
  var u = /[^a-zA-Z0-9\\_:.-]/gim;
  function o(l, d) {
    var p = 0, m = 0, v = [], _ = !1, A = l.length;
    function E(C, k) {
      if (C = e.trim(C), C = C.replace(u, "").toLowerCase(), !(C.length < 1)) {
        var Z = d(C, k || "");
        Z && v.push(Z);
      }
    }
    for (var h = 0; h < A; h++) {
      var w = l.charAt(h), g, y;
      if (_ === !1 && w === "=") {
        _ = l.slice(p, h), p = h + 1, m = l.charAt(p) === '"' || l.charAt(p) === "'" ? p : i(l, h + 1);
        continue;
      }
      if (_ !== !1 && h === m) {
        if (y = l.indexOf(w, h + 1), y === -1)
          break;
        g = e.trim(l.slice(m + 1, y)), E(_, g), _ = !1, h = y, p = h + 1;
        continue;
      }
      if (/\s|\n|\t/.test(w))
        if (l = l.replace(/\s|\n|\t/g, " "), _ === !1)
          if (y = s(l, h), y === -1) {
            g = e.trim(l.slice(p, h)), E(g), _ = !1, p = h + 1;
            continue;
          } else {
            h = y - 1;
            continue;
          }
        else if (y = a(l, h - 1), y === -1) {
          g = e.trim(l.slice(p, h)), g = f(g), E(_, g), _ = !1, p = h + 1;
          continue;
        } else
          continue;
    }
    return p < l.length && (_ === !1 ? E(l.slice(p)) : E(_, f(e.trim(l.slice(p))))), e.trim(v.join(" "));
  }
  function s(l, d) {
    for (; d < l.length; d++) {
      var p = l[d];
      if (p !== " ")
        return p === "=" ? d : -1;
    }
  }
  function i(l, d) {
    for (; d < l.length; d++) {
      var p = l[d];
      if (p !== " ")
        return p === "'" || p === '"' ? d : -1;
    }
  }
  function a(l, d) {
    for (; d > 0; d--) {
      var p = l[d];
      if (p !== " ")
        return p === "=" ? d : -1;
    }
  }
  function c(l) {
    return l[0] === '"' && l[l.length - 1] === '"' || l[0] === "'" && l[l.length - 1] === "'";
  }
  function f(l) {
    return c(l) ? l.substr(1, l.length - 2) : l;
  }
  return yu.parseTag = r, yu.parseAttr = o, yu;
}
var ns, zc;
function _4() {
  if (zc) return ns;
  zc = 1;
  var e = Is().FilterCSS, t = o0(), n = s0(), r = n.parseTag, u = n.parseAttr, o = Ei();
  function s(l) {
    return l == null;
  }
  function i(l) {
    var d = o.spaceIndex(l);
    if (d === -1)
      return {
        html: "",
        closing: l[l.length - 2] === "/"
      };
    l = o.trim(l.slice(d + 1, -1));
    var p = l[l.length - 1] === "/";
    return p && (l = o.trim(l.slice(0, -1))), {
      html: l,
      closing: p
    };
  }
  function a(l) {
    var d = {};
    for (var p in l)
      d[p] = l[p];
    return d;
  }
  function c(l) {
    var d = {};
    for (var p in l)
      Array.isArray(l[p]) ? d[p.toLowerCase()] = l[p].map(function(m) {
        return m.toLowerCase();
      }) : d[p.toLowerCase()] = l[p];
    return d;
  }
  function f(l) {
    l = a(l || {}), l.stripIgnoreTag && (l.onIgnoreTag && console.error(
      'Notes: cannot use these two options "stripIgnoreTag" and "onIgnoreTag" at the same time'
    ), l.onIgnoreTag = t.onIgnoreTagStripAll), l.whiteList || l.allowList ? l.whiteList = c(l.whiteList || l.allowList) : l.whiteList = t.whiteList, this.attributeWrapSign = l.singleQuotedAttributeValue === !0 ? "'" : t.attributeWrapSign, l.onTag = l.onTag || t.onTag, l.onTagAttr = l.onTagAttr || t.onTagAttr, l.onIgnoreTag = l.onIgnoreTag || t.onIgnoreTag, l.onIgnoreTagAttr = l.onIgnoreTagAttr || t.onIgnoreTagAttr, l.safeAttrValue = l.safeAttrValue || t.safeAttrValue, l.escapeHtml = l.escapeHtml || t.escapeHtml, this.options = l, l.css === !1 ? this.cssFilter = !1 : (l.css = l.css || {}, this.cssFilter = new e(l.css));
  }
  return f.prototype.process = function(l) {
    if (l = l || "", l = l.toString(), !l) return "";
    var d = this, p = d.options, m = p.whiteList, v = p.onTag, _ = p.onIgnoreTag, A = p.onTagAttr, E = p.onIgnoreTagAttr, h = p.safeAttrValue, w = p.escapeHtml, g = d.attributeWrapSign, y = d.cssFilter;
    p.stripBlankChar && (l = t.stripBlankChar(l)), p.allowCommentTag || (l = t.stripCommentTag(l));
    var C = !1;
    p.stripIgnoreTagBody && (C = t.StripTagBody(
      p.stripIgnoreTagBody,
      _
    ), _ = C.onIgnoreTag);
    var k = r(
      l,
      function(Z, W, K, B, G) {
        var q = {
          sourcePosition: Z,
          position: W,
          isClosing: G,
          isWhite: Object.prototype.hasOwnProperty.call(m, K)
        }, H = v(K, B, q);
        if (!s(H)) return H;
        if (q.isWhite) {
          if (q.isClosing)
            return "</" + K + ">";
          var N = i(B), z = m[K], $ = u(N.html, function(ne, fe) {
            var ze = o.indexOf(z, ne) !== -1, Se = A(K, ne, fe, ze);
            return s(Se) ? ze ? (fe = h(K, ne, fe, y), fe ? ne + "=" + g + fe + g : ne) : (Se = E(K, ne, fe, ze), s(Se) ? void 0 : Se) : Se;
          });
          return B = "<" + K, $ && (B += " " + $), N.closing && (B += " /"), B += ">", B;
        } else
          return H = _(K, B, q), s(H) ? w(B) : H;
      },
      w
    );
    return C && (k = C.remove(k)), k;
  }, ns = f, ns;
}
var Mc;
function y4() {
  return Mc || (Mc = 1, (function(e, t) {
    var n = o0(), r = s0(), u = _4();
    function o(i, a) {
      var c = new u(a);
      return c.process(i);
    }
    t = e.exports = o, t.filterXSS = o, t.FilterXSS = u, (function() {
      for (var i in n)
        t[i] = n[i];
      for (var a in r)
        t[a] = r[a];
    })(), typeof window < "u" && (window.filterXSS = e.exports);
    function s() {
      return typeof self < "u" && typeof DedicatedWorkerGlobalScope < "u" && self instanceof DedicatedWorkerGlobalScope;
    }
    s() && (self.filterXSS = e.exports);
  })(Xo, Xo.exports)), Xo.exports;
}
y4();
const x4 = ["open"], E4 = { class: "chat-demo-reasoning-content" }, k4 = /* @__PURE__ */ It({
  __name: "chat-reasoning-block",
  props: {
    text: {},
    state: {}
  },
  setup(e) {
    return (t, n) => (Me(), Ue("details", {
      class: "chat-demo-reasoning",
      open: e.state === "streaming"
    }, [
      n[0] || (n[0] = ye("summary", null, "思考摘要", -1)),
      ye("div", E4, it(e.text), 1)
    ], 8, x4));
  }
}), w4 = /* @__PURE__ */ mr(k4, [["__scopeId", "data-v-f087c3ca"]]), C4 = { class: "chat-demo-status-card" }, A4 = /* @__PURE__ */ It({
  __name: "chat-status-card",
  props: {
    text: {}
  },
  setup(e) {
    return (t, n) => (Me(), Ue("div", C4, it(e.text), 1));
  }
}), D4 = /* @__PURE__ */ mr(A4, [["__scopeId", "data-v-55ed49c9"]]), S4 = {
  key: 0,
  class: "chat-demo-empty"
}, $4 = { class: "chat-demo-message-role" }, N4 = { class: "chat-demo-message-body" }, O4 = {
  key: 1,
  class: "chat-demo-text"
}, I4 = /* @__PURE__ */ It({
  __name: "chat-message-list",
  props: {
    messages: {},
    formatStatus: { type: Function },
    assistantName: {},
    userLabel: {},
    emptyTitle: {},
    emptyDescription: {},
    autoScrollKey: {},
    onMarkdownClick: { type: Function }
  },
  setup(e) {
    const t = e, n = Ve();
    function r(u) {
      t.onMarkdownClick?.(u);
    }
    return Pe(
      () => t.autoScrollKey,
      async () => {
        await un(), n.value && (n.value.scrollTop = n.value.scrollHeight);
      },
      { deep: !0 }
    ), (u, o) => (Me(), Ue("div", {
      ref_key: "messagePaneRef",
      ref: n,
      class: "chat-demo-messages",
      role: "log",
      "aria-live": "polite"
    }, [
      e.messages.length === 0 ? (Me(), Ue("div", S4, [
        ye("h2", null, it(e.emptyTitle), 1),
        ye("p", null, it(e.emptyDescription), 1)
      ])) : nr("", !0),
      (Me(!0), Ue(tt, null, as(e.messages, (s) => (Me(), Ue("article", {
        key: s.id,
        class: fr(["chat-demo-message", `chat-demo-message--${s.role}`])
      }, [
        ye("div", $4, it(s.role === "user" ? e.userLabel : e.assistantName), 1),
        ye("div", N4, [
          (Me(!0), Ue(tt, null, as(s.parts, (i, a) => (Me(), Ue(tt, {
            key: `${s.id}-${a}`
          }, [
            i.type === "reasoning" ? (Me(), Hu(w4, {
              key: 0,
              state: i.state,
              text: i.text
            }, null, 8, ["state", "text"])) : nr("", !0),
            i.type === "text" ? (Me(), Ue("div", O4, [
              Ee(de(Nu), {
                id: `chat-markdown-${s.id}-${a}`,
                class: "chat-demo-markdown",
                "model-value": i.text,
                theme: "light",
                "preview-theme": "github",
                "no-katex": "",
                onClickCapture: r
              }, null, 8, ["id", "model-value"])
            ])) : i.type === "data-status" ? (Me(), Hu(D4, {
              key: 2,
              text: e.formatStatus(i.data)
            }, null, 8, ["text"])) : nr("", !0)
          ], 64))), 128))
        ])
      ], 2))), 128))
    ], 512));
  }
}), T4 = /* @__PURE__ */ mr(I4, [["__scopeId", "data-v-91b001d8"]]), F4 = { class: "chat-demo-page" }, z4 = { class: "chat-demo-actions" }, M4 = ["disabled"], P4 = { class: "chat-demo-workspace" }, R4 = { class: "chat-demo-shell" }, j4 = {
  key: 0,
  class: "chat-demo-error",
  role: "alert"
}, L4 = /* @__PURE__ */ It({
  __name: "chat-demo-shell",
  props: {
    adapter: {},
    options: { default: () => ({}) }
  },
  setup(e) {
    const t = e, {
      input: n,
      sessions: r,
      selectedSessionId: u,
      historyLoading: o,
      messageLoading: s,
      stopping: i,
      messages: a,
      busy: c,
      canSend: f,
      errorMessage: l,
      currentStateText: d,
      autoScrollKey: p,
      loadSessions: m,
      selectSession: v,
      send: _,
      stopChat: A,
      clearChat: E,
      startNewSession: h,
      clearError: w
    } = W_(t.adapter), g = Fe(() => ({
      assistantName: t.options.assistantName ?? "助手",
      userLabel: t.options.userLabel ?? "你",
      historyTitle: t.options.historyTitle ?? "历史会话",
      emptyTitle: t.options.emptyTitle ?? "输入问题开始演示",
      emptyDescription: t.options.emptyDescription ?? "助手会检索知识库并以流式方式返回答案。"
    }));
    return (y, C) => (Me(), Ue("section", F4, [
      ye("div", z4, [
        ye("button", {
          type: "button",
          class: "chat-demo-action is-primary",
          onClick: C[0] || (C[0] = //@ts-ignore
          (...k) => de(h) && de(h)(...k))
        }, " 新建会话 "),
        de(c) ? (Me(), Ue("button", {
          key: 0,
          type: "button",
          class: "chat-demo-action",
          onClick: C[1] || (C[1] = //@ts-ignore
          (...k) => de(A) && de(A)(...k))
        }, " 停止 ")) : nr("", !0),
        ye("button", {
          type: "button",
          class: "chat-demo-action",
          disabled: de(c) && de(a).length === 0,
          onClick: C[2] || (C[2] = //@ts-ignore
          (...k) => de(E) && de(E)(...k))
        }, " 清空 ", 8, M4)
      ]),
      ye("div", P4, [
        Ee(ly, {
          sessions: de(r),
          "selected-id": de(u),
          loading: de(o),
          title: g.value.historyTitle,
          "time-formatter": e.adapter.formatTime,
          onRefresh: de(m),
          onSelect: de(v)
        }, null, 8, ["sessions", "selected-id", "loading", "title", "time-formatter", "onRefresh", "onSelect"]),
        ye("div", R4, [
          Ee(T4, {
            messages: de(a),
            "format-status": e.adapter.formatStatus,
            "assistant-name": g.value.assistantName,
            "user-label": g.value.userLabel,
            "empty-title": g.value.emptyTitle,
            "empty-description": g.value.emptyDescription,
            "auto-scroll-key": de(p),
            "on-markdown-click": e.adapter.onMarkdownClick
          }, null, 8, ["messages", "format-status", "assistant-name", "user-label", "empty-title", "empty-description", "auto-scroll-key", "on-markdown-click"]),
          de(l) ? (Me(), Ue("div", j4, [
            ye("span", null, it(de(l)), 1),
            ye("button", {
              type: "button",
              class: "chat-demo-close",
              onClick: C[3] || (C[3] = //@ts-ignore
              (...k) => de(w) && de(w)(...k))
            }, " 关闭 ")
          ])) : nr("", !0),
          Ee(ey, {
            modelValue: de(n),
            "onUpdate:modelValue": C[4] || (C[4] = (k) => Oe(n) ? n.value = k : null),
            busy: de(c),
            "can-send": de(f),
            "message-loading": de(s),
            "state-text": de(d),
            stopping: de(i),
            onSend: de(_),
            onStop: de(A)
          }, null, 8, ["modelValue", "busy", "can-send", "message-loading", "state-text", "stopping", "onSend", "onStop"])
        ])
      ])
    ]));
  }
}), Z4 = /* @__PURE__ */ mr(L4, [["__scopeId", "data-v-832995df"]]), V4 = /* @__PURE__ */ It({
  __name: "agent-chat-host",
  props: {
    adapter: {},
    options: {}
  },
  setup(e) {
    return (t, n) => (Me(), Hu(de(Z4), {
      adapter: e.adapter,
      options: e.options
    }, null, 8, ["adapter", "options"]));
  }
}), B4 = [
  "base-url",
  "chat-api",
  "auth-type",
  "token",
  "supplier",
  "participant-id",
  "channel",
  "conversation-type",
  "assistant-name",
  "user-label",
  "history-title",
  "empty-title",
  "empty-description"
];
class U4 extends HTMLElement {
  constructor() {
    super(...arguments), this.app = null;
  }
  static get observedAttributes() {
    return B4;
  }
  connectedCallback() {
    this.mount();
  }
  disconnectedCallback() {
    this.unmount();
  }
  attributeChangedCallback() {
    this.mount();
  }
  /** 动态提供 JWT 或 Secret token，避免硬编码。 */
  setTokenProvider(t) {
    this.tokenProvider = t, this.mount();
  }
  mount() {
    this.unmount();
    const t = {
      baseUrl: this.getAttribute("base-url") || "",
      chatApi: this.getAttribute("chat-api") || "/agent/chat",
      authType: this.getAttribute("auth-type") || "secret",
      token: this.getAttribute("token") || void 0,
      supplier: this.getAttribute("supplier") || void 0,
      participantId: this.getAttribute("participant-id") || void 0,
      channel: this.getAttribute("channel") || "agent-web",
      conversationType: this.getAttribute("conversation-type") || "agent-chat",
      getToken: this.tokenProvider,
      options: {
        assistantName: this.getAttribute("assistant-name") || "Agent",
        userLabel: this.getAttribute("user-label") || "你",
        historyTitle: this.getAttribute("history-title") || "历史会话",
        emptyTitle: this.getAttribute("empty-title") || "开始 Agent 演示",
        emptyDescription: this.getAttribute("empty-description") || "Agent 会调用知识库和通用工具，以流式方式返回答案。"
      }
    };
    this.app = hm(V4, {
      adapter: B_(t),
      options: t.options
    }), this.app.mount(this);
  }
  unmount() {
    this.app && (this.app.unmount(), this.app = null);
  }
}
function H4() {
  customElements.get("aplus-agent-chat") || customElements.define("aplus-agent-chat", U4);
}
defineAplusAgentChatElement();
export {
  U4 as AplusAgentChatElement,
  B_ as createAgentChatAdapter,
  H4 as defineAplusAgentChatElement
};
