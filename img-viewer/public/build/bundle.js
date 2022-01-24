var app=function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function o(t){t.forEach(e)}function l(t){return"function"==typeof t}function i(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}let r,a;function s(t,e){return r||(r=document.createElement("a")),r.href=e,t===r.href}function c(t,e){t.appendChild(e)}function u(t,e,n){t.insertBefore(e,n||null)}function f(t){t.parentNode.removeChild(t)}function d(t){return document.createElement(t)}function p(t){return document.createTextNode(t)}function m(){return p(" ")}function g(){return p("")}function h(t,e,n,o){return t.addEventListener(e,n,o),()=>t.removeEventListener(e,n,o)}function b(t){return function(e){return e.preventDefault(),t.call(this,e)}}function y(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function w(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}function v(t,e,n){t.classList[n?"add":"remove"](e)}function x(t){a=t}function $(t,e){const n=t.$$.callbacks[e.type];n&&n.slice().forEach((t=>t.call(this,e)))}const k=[],P=[],_=[],q=[],j=Promise.resolve();let C=!1;function F(t){_.push(t)}const E=new Set;let O=0;function M(){const t=a;do{for(;O<k.length;){const t=k[O];O++,x(t),I(t.$$)}for(x(null),k.length=0,O=0;P.length;)P.pop()();for(let t=0;t<_.length;t+=1){const e=_[t];E.has(e)||(E.add(e),e())}_.length=0}while(k.length);for(;q.length;)q.pop()();C=!1,E.clear(),x(t)}function I(t){if(null!==t.fragment){t.update(),o(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(F)}}const S=new Set;let A;function Y(t,e){t&&t.i&&(S.delete(t),t.i(e))}function L(t,e,n,o){if(t&&t.o){if(S.has(t))return;S.add(t),A.c.push((()=>{S.delete(t),o&&(n&&t.d(1),o())})),t.o(e)}}const R="undefined"!=typeof window?window:"undefined"!=typeof globalThis?globalThis:global;function D(t){t&&t.c()}function N(t,n,i,r){const{fragment:a,on_mount:s,on_destroy:c,after_update:u}=t.$$;a&&a.m(n,i),r||F((()=>{const n=s.map(e).filter(l);c?c.push(...n):o(n),t.$$.on_mount=[]})),u.forEach(F)}function z(t,e){const n=t.$$;null!==n.fragment&&(o(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function B(t,e){-1===t.$$.dirty[0]&&(k.push(t),C||(C=!0,j.then(M)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function H(e,l,i,r,s,c,u,d=[-1]){const p=a;x(e);const m=e.$$={fragment:null,ctx:null,props:c,update:t,not_equal:s,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(l.context||(p?p.$$.context:[])),callbacks:n(),dirty:d,skip_bound:!1,root:l.target||p.$$.root};u&&u(m.root);let g=!1;if(m.ctx=i?i(e,l.props||{},((t,n,...o)=>{const l=o.length?o[0]:n;return m.ctx&&s(m.ctx[t],m.ctx[t]=l)&&(!m.skip_bound&&m.bound[t]&&m.bound[t](l),g&&B(e,t)),n})):[],m.update(),g=!0,o(m.before_update),m.fragment=!!r&&r(m.ctx),l.target){if(l.hydrate){const t=function(t){return Array.from(t.childNodes)}(l.target);m.fragment&&m.fragment.l(t),t.forEach(f)}else m.fragment&&m.fragment.c();l.intro&&Y(e.$$.fragment),N(e,l.target,l.anchor,l.customElement),M()}x(p)}class T{$destroy(){z(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}function X(e){let n,l,i,r,a,s,g;return{c(){n=d("div"),l=d("h4"),l.textContent="Install",i=m(),r=d("button"),r.innerHTML="<span>×</span>",a=p("\r\n    Click here to install the app for more features!"),y(l,"class","alert-heading"),y(r,"class","close"),y(r,"type","button"),y(n,"class","alert alert-success filled-dm show svelte-1qjuqpq")},m(t,o){u(t,n,o),c(n,l),c(n,i),c(n,r),c(n,a),s||(g=[h(r,"click",e[2]),h(n,"click",e[1])],s=!0)},p:t,d(t){t&&f(n),s=!1,o(g)}}}function U(e){let n,o=e[0]&&X(e);return{c(){o&&o.c(),n=g()},m(t,e){o&&o.m(t,e),u(t,n,e)},p(t,[e]){t[0]?o?o.p(t,e):(o=X(t),o.c(),o.m(n.parentNode,n)):o&&(o.d(1),o=null)},i:t,o:t,d(t){o&&o.d(t),t&&f(n)}}}function G(t,e,n){let o;return window.addEventListener("beforeinstallprompt",(t=>{t.preventDefault(),n(0,o=t)})),[o,async function(){o.prompt();const{outcome:t}=await o.userChoice;"accepted"===t&&n(0,o=null)},function(){n(0,o=null)}]}class Q extends T{constructor(t){super(),H(this,t,G,U,i,{})}}const V=["3g2","3gp","asf","avi","dv","flv","gxf","m2ts","m4a","m4b","m4p","m4r","m4v","mkv","mov","mp4","mpd","mpeg","mpg","mxf","nut","ogm","ogv","swf","ts","vob","webm","wmv","wtv"],W=new RegExp(`.(${V.join("|")})$`,"i"),K=["srt","vtt","ass","ssa","sub","txt"],J=new RegExp(`.(${K.join("|")})$`,"i"),Z=["3gp","3gpp","3g2","aac","adts","ac3","amr","eac3","flac","mp3","m4a","mp4","mp4a","mpga","mp2","mp2a","mp3","m2a","m3a","oga","ogg","mogg","spx","opus","raw","wav","weba"],tt=new RegExp(`.(${Z.join("|")})$`,"i"),et=["apng","avif","bmp","gif","ico","jpg","jpeg","jfif","pjpeg","pjp","png","svg","tif","tiff","webp"],nt=new RegExp(`.(${et.join("|")})$`,"i"),ot=["epub","cbr","cba","cbt","cbz","cb7","zip"],lt=new RegExp(`.(${ot.join("|")})$`,"i"),it=(new DOMParser).parseFromString.bind(new DOMParser);function rt(t){return new Promise(((e,n)=>{t.oncomplete=t.onsuccess=()=>e(t.result),t.onabort=t.onerror=()=>n(t.error)}))}function at(t,e){const n=(!navigator.userAgentData&&/Safari\//.test(navigator.userAgent)&&!/Chrom(e|ium)\//.test(navigator.userAgent)&&indexedDB.databases?new Promise((function(t){var e=function(){return indexedDB.databases().finally(t)};o=setInterval(e,100),e()})).finally((function(){return clearInterval(o)})):Promise.resolve()).then((()=>{const n=indexedDB.open(t);return n.onupgradeneeded=()=>n.result.createObjectStore(e),rt(n)}));var o;return(t,o)=>n.then((n=>o(n.transaction(e,t).objectStore(e))))}let st;function ct(){return st||(st=at("keyval-store","keyval")),st}function ut(t,e,n){const o=t.slice();return o[4]=e[n],o}function ft(e){let n;return{c(){n=d("div"),n.textContent="Your browser doesn't support recent files."},m(t,e){u(t,n,e)},p:t,d(t){t&&f(n)}}}function dt(e){let n;return{c(){n=d("div"),n.innerHTML='Your browser doesn&#39;t support recent files, but it could! Visit <code class="code">chrome://flags</code> and enable <code class="code">#file-system-access-api!</code>'},m(t,e){u(t,n,e)},p:t,d(t){t&&f(n)}}}function pt(t){let e,n=t[1],o=[];for(let e=0;e<n.length;e+=1)o[e]=gt(ut(t,n,e));let l=null;return n.length||(l=mt()),{c(){for(let t=0;t<o.length;t+=1)o[t].c();e=g(),l&&l.c()},m(t,n){for(let e=0;e<o.length;e+=1)o[e].m(t,n);u(t,e,n),l&&l.m(t,n)},p(t,i){if(6&i){let r;for(n=t[1],r=0;r<n.length;r+=1){const l=ut(t,n,r);o[r]?o[r].p(l,i):(o[r]=gt(l),o[r].c(),o[r].m(e.parentNode,e))}for(;r<o.length;r+=1)o[r].d(1);o.length=n.length,n.length?l&&(l.d(1),l=null):l||(l=mt(),l.c(),l.m(e.parentNode,e))}},d(t){!function(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}(o,t),t&&f(e),l&&l.d(t)}}}function mt(t){let e;return{c(){e=d("div"),e.textContent="Your recent files will show up here!",y(e,"class","ml-5 p-5")},m(t,n){u(t,e,n)},d(t){t&&f(e)}}}function gt(t){let e,n,o,i,r,a,s=t[4].name+"";return{c(){e=d("div"),n=d("div"),o=p(s),i=m(),y(n,"class","ml-5"),y(e,"class","p-5 pointer text-muted hover svelte-1hv3hh2")},m(s,f){u(s,e,f),c(e,n),c(n,o),c(e,i),r||(a=h(e,"click",(function(){l(t[2](t[4]))&&t[2](t[4]).apply(this,arguments)})),r=!0)},p(e,n){t=e,2&n&&s!==(s=t[4].name+"")&&w(o,s)},d(t){t&&f(e),r=!1,a()}}}function ht(e){let n,o,i,r,a,s,p,g,b,w,v,x;let $=(bt?pt:window.chrome?dt:ft)(e);return{c(){n=d("div"),o=d("div"),i=d("div"),r=d("div"),r.textContent="Recent Files",a=m(),s=d("hr"),p=m(),g=d("div"),$.c(),b=m(),w=d("div"),w.textContent="You can also drag-drop or paste files, or click here to select some!",y(r,"class","font-weight-bold font-size-24 p-5"),y(s,"class","w-full my-15"),y(g,"class","overflow-y-auto"),y(w,"class","py-20 pointer text-muted hover mt-auto svelte-1hv3hh2"),y(i,"class","py-20 d-flex flex-column h-full"),y(o,"class","container h-full py-20"),y(n,"class","h-full my-0 bg-very-dark")},m(t,f){u(t,n,f),c(n,o),c(o,i),c(i,r),c(i,a),c(i,s),c(i,p),c(i,g),$.m(g,null),c(i,b),c(i,w),v||(x=h(w,"click",(function(){l(e[0])&&e[0].apply(this,arguments)})),v=!0)},p(t,[n]){e=t,$.p(e,n)},i:t,o:t,d(t){t&&f(n),$.d(),v=!1,x()}}}const bt="FileSystemFileHandle"in window;let yt=null;async function wt(){vt=await function(t,e=ct()){return e("readonly",(e=>rt(e.get(t))))}("recents",yt)||[]}let vt=[];async function xt(t){if(bt&&yt&&t?.length){const e=t.map((t=>t instanceof FileSystemFileHandle?t:t.getAsFileSystemHandle())),n=await Promise.all(e);await wt(),vt=await(async(t,e)=>{const n=await Promise.all(t.map(e));return t.filter(((t,e)=>n[e]))})(vt,(async t=>!await(async(t,e)=>{for(const n of t)if(await e(n))return!0;return!1})(n,(e=>e.isSameEntry(t))))),vt.unshift(...n),vt.length=Math.min(vt.length,15),function(t,e,n=ct()){n("readwrite",(n=>(n.put(e,t),rt(n.transaction))))}("recents",vt,yt)}}function $t(t,e,n){let{files:o=null}=e,l=[];wt().then((()=>{n(1,l=vt)}));let{handlePopup:i=(()=>{})}=e;return t.$$set=t=>{"files"in t&&n(3,o=t.files),"handlePopup"in t&&n(0,i=t.handlePopup)},[i,l,async function(t){xt([t]),await t.requestPermission({mode:"read"}),n(3,o=[await t.getFile()])},o]}class kt extends T{constructor(t){super(),H(this,t,$t,ht,i,{files:3,handlePopup:0})}}async function Pt(t=[],e=[]){const n=await Promise.all([...t].map((t=>async function(t,e){if(!t)return null;if(t.type){if(e.some((e=>0===t.type.indexOf(e))))return xt([t]),t.getAsFile();if("text/plain"===t.type){if("string"===t.kind){const n=await new Promise((e=>t.getAsString(e)));try{const t=new URL(n),o=e.find((t=>n.match(_t[t])));if(t&&o)return{url:n,name:n.substring(n.lastIndexOf("/")+1),type:o}}catch(t){}return null}if("file"===t.kind){xt(t);const n=t.getAsFile();if(e.some((t=>n.name.match(_t[t]))))return n}return null}if("text/html"===t.type){const n=await new Promise((e=>t.getAsString(e))),o=e.map((t=>it(n,"text/html").querySelectorAll(jt[t]||t))).flat();return o.length?o.map((t=>{const e=t.src||t.value;return e?{url:e,name:e.substring(e.lastIndexOf("/")+1)}:null})):null}}const n=t.webkitGetAsEntry();if(n?.isDirectory){const t=(await new Promise((t=>n.createReader().readEntries(t)))).filter((t=>t.isFile&&e.some((e=>t.name.match(_t[e]))))).map((t=>new Promise((e=>t.file(e)))));return Promise.all(t)}if(n?.isFile&&e.some((t=>n.name.match(_t[t]))))return new Promise((t=>n.file(t)))}(t,e))));return n.flat().filter((t=>t))}const _t={audio:tt,video:W,image:nt,subtitle:J,book:lt},qt={audio:Z,video:V,image:et,subtitle:K,book:ot},jt={image:"img",subtitle:"input"};const{window:Ct}=R;function Ft(e){let n,l,i,r,a,g,b,x,$,k,P,_,q,j,C,F,E,O,M,I,S,A,Y,L,R,D,N,z,B,H=e[4]?"blur_off":"blur_on",T=e[0].length>1&&Ot(e);return{c(){n=d("div"),l=d("img"),r=m(),a=d("div"),T&&T.c(),g=m(),b=d("div"),x=d("button"),x.textContent="zoom_out_map",$=m(),k=d("button"),k.textContent="remove",P=m(),_=d("input"),j=m(),C=d("button"),C.textContent="add",F=m(),E=d("div"),O=d("button"),M=p(H),I=m(),S=d("button"),S.textContent="rotate_left",A=m(),Y=d("button"),Y.textContent="rotate_right",L=m(),R=d("button"),R.innerHTML='<div class="flip svelte-1w5qlh3">flip</div>',D=m(),N=d("button"),N.textContent="flip",s(l.src,i=e[2])||y(l,"src",i),y(l,"alt","view"),y(l,"class","w-full h-full position-absolute svelte-1w5qlh3"),v(l,"transition",e[8]),y(n,"class","w-full h-full overflow-hidden position-relative dragarea svelte-1w5qlh3"),y(x,"class","btn btn-lg btn-square material-icons svelte-1w5qlh3"),y(x,"type","button"),y(k,"class","btn btn-lg btn-square material-icons svelte-1w5qlh3"),y(k,"type","button"),y(_,"type","number"),y(_,"step","0.1"),y(_,"min","0.1"),y(_,"class","form-control form-control-lg text-right svelte-1w5qlh3"),y(_,"placeholder","Scale"),_.readOnly=!0,_.value=q=e[1].toFixed(1),y(C,"class","btn btn-lg btn-square material-icons svelte-1w5qlh3"),y(C,"type","button"),y(b,"class","btn-group input-group bg-dark-dm bg-light-lm rounded m-5 w-200 col-auto svelte-1w5qlh3"),y(O,"class","btn btn-lg btn-square material-icons"),y(O,"type","button"),y(S,"class","btn btn-lg btn-square material-icons"),y(S,"type","button"),y(Y,"class","btn btn-lg btn-square material-icons"),y(Y,"type","button"),y(R,"class","btn btn-lg btn-square material-icons"),y(R,"type","button"),y(N,"class","btn btn-lg btn-square material-icons"),y(N,"type","button"),y(E,"class","btn-group bg-dark-dm bg-light-lm rounded m-5 col-auto"),y(a,"class","position-absolute buttons row w-full justify-content-center svelte-1w5qlh3")},m(t,o){u(t,n,o),c(n,l),e[36](l),u(t,r,o),u(t,a,o),T&&T.m(a,null),c(a,g),c(a,b),c(b,x),c(b,$),c(b,k),c(b,P),c(b,_),c(b,j),c(b,C),c(a,F),c(a,E),c(E,O),c(O,M),c(E,I),c(E,S),c(E,A),c(E,Y),c(E,L),c(E,R),c(E,D),c(E,N),z||(B=[h(l,"load",e[21]),h(n,"pointerdown",e[10]),h(n,"pointerup",e[11]),h(n,"wheel",e[16],{passive:!0}),h(n,"touchend",e[11]),h(n,"touchstart",e[14]),h(n,"touchmove",e[15]),h(x,"click",e[20]),h(k,"click",e[37]),h(C,"click",e[38]),h(O,"click",e[19]),h(S,"click",e[22]),h(Y,"click",e[23]),h(R,"click",e[24]),h(N,"click",e[25])],z=!0)},p(t,e){4&e[0]&&!s(l.src,i=t[2])&&y(l,"src",i),256&e[0]&&v(l,"transition",t[8]),t[0].length>1?T?T.p(t,e):(T=Ot(t),T.c(),T.m(a,g)):T&&(T.d(1),T=null),2&e[0]&&q!==(q=t[1].toFixed(1))&&_.value!==q&&(_.value=q),16&e[0]&&H!==(H=t[4]?"blur_off":"blur_on")&&w(M,H)},i:t,o:t,d(t){t&&f(n),e[36](null),t&&f(r),t&&f(a),T&&T.d(),z=!1,o(B)}}}function Et(t){let e,n,o;function l(e){t[35](e)}let i={handlePopup:t[18]};return void 0!==t[0]&&(i.files=t[0]),e=new kt({props:i}),P.push((()=>function(t,e,n){const o=t.$$.props[e];void 0!==o&&(t.$$.bound[o]=n,n(t.$$.ctx[o]))}(e,"files",l))),{c(){D(e.$$.fragment)},m(t,n){N(e,t,n),o=!0},p(t,o){const l={};var i;!n&&1&o[0]&&(n=!0,l.files=t[0],i=()=>n=!1,q.push(i)),e.$set(l)},i(t){o||(Y(e.$$.fragment,t),o=!0)},o(t){L(e.$$.fragment,t),o=!1},d(t){z(e,t)}}}function Ot(e){let n,l,i,r,a,s;return{c(){n=d("div"),l=d("button"),l.textContent="arrow_back",i=m(),r=d("button"),r.textContent="arrow_forward",y(l,"class","btn btn-lg btn-square material-icons"),y(l,"type","button"),y(r,"class","btn btn-lg btn-square material-icons"),y(r,"type","button"),y(n,"class","btn-group bg-dark-dm bg-light-lm rounded m-5 col-auto")},m(t,o){u(t,n,o),c(n,l),c(n,i),c(n,r),a||(s=[h(l,"click",e[13]),h(r,"click",e[12])],a=!0)},p:t,d(t){t&&f(n),a=!1,o(s)}}}function Mt(t){let e,n,l,i,r,a,s,c,p,g;n=new Q({});const w=[Et,Ft],v=[];function x(t,e){return t[0].length?1:0}return i=x(t),r=v[i]=w[i](t),document.title=s=t[5]+" "+(t[7].x&&t[7].y?`(${t[7].x} x ${t[7].y})`:"")+" "+t[9](t[6]),{c(){e=d("div"),D(n.$$.fragment),l=m(),r.c(),a=m(),y(e,"class","sticky-alerts d-flex flex-column-reverse svelte-1w5qlh3")},m(o,r){u(o,e,r),N(n,e,null),u(o,l,r),v[i].m(o,r),u(o,a,r),c=!0,p||(g=[h(Ct,"drop",b(t[17])),h(Ct,"dragenter",b(t[31])),h(Ct,"dragover",b(t[32])),h(Ct,"dragstart",b(t[33])),h(Ct,"dragleave",b(t[34])),h(Ct,"paste",b(t[17]))],p=!0)},p(t,e){let n=i;i=x(t),i===n?v[i].p(t,e):(A={r:0,c:[],p:A},L(v[n],1,1,(()=>{v[n]=null})),A.r||o(A.c),A=A.p,r=v[i],r?r.p(t,e):(r=v[i]=w[i](t),r.c()),Y(r,1),r.m(a.parentNode,a)),(!c||736&e[0])&&s!==(s=t[5]+" "+(t[7].x&&t[7].y?`(${t[7].x} x ${t[7].y})`:"")+" "+t[9](t[6]))&&(document.title=s)},i(t){c||(Y(n.$$.fragment,t),Y(r),c=!0)},o(t){L(n.$$.fragment,t),L(r),c=!1},d(t){t&&f(e),z(n),t&&f(l),v[i].d(t),t&&f(a),p=!1,o(g)}}}function It(t,e,n){yt=at("img-viewer","recents");let o=null,l=null,i=0,r=!0,a="Image Viewer",s=null;const c={x:0,y:0},u={x:0,y:0},f={x:0,y:0};let d=c;const p={x:null,y:null},m=[" B"," KB"," MB"," GB"];let g=[],h=null;navigator.serviceWorker.register("/sw.js");let b=!0;function y(t){w||(f.x=u.x+t.clientX-c.x,f.y=u.y+t.clientY-c.y,n(26,d=f))}let w=!1;let v=0,x=0;let k=1;function _({deltaY:t}){const e=-.01*t;e<0?(i<-4||(i-=.5),u.x/=1.5,u.y/=1.5):e>0&&!(i>11)&&(i+=.5,u.x*=1.5,u.y*=1.5),n(1,k=2**i),n(26,d=u)}function q(t){if(t?.length){for(const e of t)e instanceof File&&(e.url=URL.createObjectURL(e));n(0,g=g.concat(t)),h||n(27,h=g[0])}}"launchQueue"in window&&async function(){return new Promise((t=>{launchQueue.setConsumer((async e=>{if(!e.files.length)return;const n=e.files.map((t=>(xt([t]),t.getFile())));t((await Promise.all(n)).filter(((t,e,n)=>n.findIndex((e=>e.name===t.name&&e.size===t.size&&e.lastModified===t.lastModified))===e)))}))}))}().then(q),q(function(t){const e=[...new URLSearchParams(location.search)];if(!e.length)return null;const n=[];for(const o of e)if(t.find((t=>o[1].match(_t[t])))){const t=o[1].substring(Math.max(o[1].lastIndexOf("\\")+2,o[1].lastIndexOf("/")+1));n.push({name:t,url:o[1]})}return n}(["image"]));let j=0;let C=!1;let F=!1;return t.$$.update=()=>{1&t.$$.dirty[0]&&q(g),1946157058&t.$$.dirty[0]&&function({disPos:t,mirror:e,flip:n,rotation:o,zoom:i}){l?.style.setProperty("transform",`rotate(${o}deg) scaleX(${e?-1:1}) scaleY(${n?-1:1}) scale(${i})`),l?.style.setProperty("--left",t.x+"px"),l?.style.setProperty("--top",t.y+"px")}({disPos:d,mirror:F,flip:C,rotation:j,zoom:k}),134217728&t.$$.dirty[0]&&function(t){if(t)if(t.constructor===String){const e=Math.max(t.lastIndexOf("\\"),t.lastIndexOf("/"))+1;n(5,a=t.substring(e)),n(6,s=null),n(2,o=t)}else{const e=Math.max(t.name.lastIndexOf("\\"),t.name.lastIndexOf("/"))+1;n(5,a=t.name.substring(e)),n(6,s=t.size),n(2,o=t.url)}}(h)},[g,k,o,l,r,a,s,p,b,function(t){if(isNaN(t)||null==t)return"";if(t<1)return t+" B";const e=Math.min(Math.floor(Math.log(t)/Math.log(1e3)),m.length-1);return Number((t/Math.pow(1e3,e)).toFixed(2))+m[e]},function(t){n(8,b=!1),c.x=t.clientX,c.y=t.clientY,n(3,l.onpointermove=y,l),t.pointerId&&l.setPointerCapture(t.pointerId)},function(t){l.onpointermove&&(n(8,b=!0),n(3,l.onpointermove=null,l),t.pointerId&&l.releasePointerCapture(t.pointerId),w?(w=!1,v=0):(u.x+=t.clientX-c.x,u.y+=t.clientY-c.y))},function(){n(27,h=g[(g.indexOf(h)+1)%g.length])},function(){const t=g.indexOf(h);n(27,h=g[0===t?g.length-1:t-1])},function({touches:t}){2===t.length&&(w=!0,n(8,b=!0))},function({touches:t}){if(2===t.length&&!0===w){const e=v;v=Math.hypot(t[0].pageX-t[1].pageX,t[0].pageY-t[1].pageY),x+=e-v,(x>20||x<-20)&&(_({deltaY:x>0?100:-100}),x=0)}},_,async function({dataTransfer:t,clipboardData:e}){const n=e?.items||t?.items;n&&q(await Pt(n,["image"]))},async function(){g.length||q(await async function(t=[]){if("FileSystemFileHandle"in window){const e=await window.showOpenFilePicker({types:[{description:t.join(", "),accept:{"*/*":t.map((t=>qt[t].map((t=>"."+t)))).flat()}}],multiple:!0});return xt(e),await Promise.all(e.map((t=>t.getFile())))}return new Promise((e=>{let n=document.createElement("input");n.type="file",n.multiple="multiple",n.accept=t.map((t=>"."+qt[t].join(",."))).flat(),n.onchange=async({target:t})=>{e([...t.files]),n=null},n.click()}))}(["image"]))},function(){n(4,r=!r),l.style.setProperty("--pixel",r?"crisp-edges":"pixelated")},function(){u.x=0,u.y=0,i=0,n(1,k=1),n(26,d=u)},function(){n(7,p.x=l.naturalWidth,p),n(7,p.y=l.naturalHeight,p)},function(){n(28,j-=90)},function(){n(28,j+=90)},function(){n(29,C=!C)},function(){n(30,F=!F)},d,h,j,C,F,function(e){$.call(this,t,e)},function(e){$.call(this,t,e)},function(e){$.call(this,t,e)},function(e){$.call(this,t,e)},function(t){g=t,n(0,g)},function(t){P[t?"unshift":"push"]((()=>{l=t,n(3,l)}))},()=>_({deltaY:100}),()=>_({deltaY:-100})]}return new class extends T{constructor(t){super(),H(this,t,It,Mt,i,{},null,[-1,-1])}}({target:document.body})}();
//# sourceMappingURL=bundle.js.map
