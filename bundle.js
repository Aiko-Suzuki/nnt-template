const k=/\{{(.*?)}}/g,p=/{{\/(?<block_close>.*?)}}|{{#else}}|{{#(?<block_start>.*?) (?<block_value>.*?)}}/gms;function u(r){const t=[];let e=r,i,o=0;for(;(i=k.exec(e))!=null&&i;){const s=i.index,l=i.index+i[0].length,c={type:"var",content:i[0],var:i[1],fn:new Function("data","return this."+i[1]),index:s,index_end:o+l},n=e.substring(0,c.index);k.test(n)?t.push({title:"before_block",content:u(n),type:"list",index:o,index_end:o+n.length}):t.push({title:"before_block",content:n,type:"string",index:o,index_end:o+n.length}),c.index=o+s,t.push(c),o=l+o,e=e.substring(l)||""}return t.sort((s,l)=>s.index-l.index),t.push({title:"before_block",content:e,type:"string",index:o,index_end:o+e?.length}),t}function y(r){const t=[],e=[];let i,o=[];function s(c,n){const d={index:n.index,length:n[0].length,type:c,condition:n.groups?.block_value};e.push(d)}const l=r.matchAll(new RegExp(p,"g"));for(const c of l){const n=c.groups?.block_start?c.groups?.block_start:c.groups?.block_close?"ifclose":"else";switch(n){case"if":i?o.push(c):(i=c,s(n,c));break;case"elseif":o.length==0&&s(n,c);break;case"else":o.length==0&&s(n,c);break;case"ifclose":o.length==0?s(n,c):o.pop();break;default:break}}if(e.sort((c,n)=>c.index-n.index),e.length==2&&e[0].type=="if"&&e[1].type=="ifclose"){const c=r.substring(e[0].index+e[0].length,e[1].index).trim();return t.push({type:"if",condition:new Function("data",`return !!(${e[0].condition})`)??void 0,content:h(c),str_condition:e[0].condition}),t}o=[];for(const c of e)switch(c.type){case"if":o.length==0&&o.push(c);break;case"elseif":if(o.length==1){const n=o.pop();if(n){const a=r.substring(n.index+n.length,c.index).trim();t.push({type:n.type,condition:new Function("data",`return !!(${n.condition})`)??void 0,content:h(a),str_condition:n.condition})}}o.push(c);break;case"else":if(o.length==1){const n=o.pop();if(n){const a=r.substring(n.index+n.length,c.index).trim();t.push({type:n.type,condition:n.condition?new Function("data",`return !!(${n.condition})`):void 0,content:h(a),str_condition:n.condition})}o.push(c)}break;case"ifclose":if(o.length==1){const n=o.pop();if(n){const a=n.type=="if"?r.substring(n.index+n.length,c.index+c.length):r.substring(n.index+n.length,c.index).trim();t.push({type:n.type,condition:n.condition?new Function("data",`return !!(${n.condition})`):void 0,content:h(a),str_condition:n.condition})}}break;default:break}return t}function h(r){const t=[],e=[];let i=r;const o=r.matchAll(new RegExp(p,"g"));let s,l,c=[];for(const a of o){const d=a.groups;if(d?.block_start&&!s){s=a;continue}if(d?.block_start&&d?.block_start!=="elseif"){c.push(a);continue}if(d?.block_close&&c.length>0){c.pop();continue}if(d?.block_close&&s&&c.length==0){l=a;continue}}if(s&&l)switch(s.groups?.block_start){case"if":{const a=r.substring(s?.index,l?.index+l.length+s?.length);t.push({block_start:s.groups?.block_start,block_value:s.groups?.block_startblock_value,block_content:y(a),index:s?.index,index_end:l?.index+l.length+s?.length});break}case"each":{const a=r.substring(s?.index+s[0].length,l.index);t.push({block_start:s.groups?.block_start,block_value:s.groups?.block_value,fn:new Function("data","return this."+s.groups?.block_value),block_content:h(a),index:s?.index,index_end:l.index+l?.length+s[0].length})}}for(let a=0;a<t.length;a++){const d=t[a],m=i.substring(0,d.index);if(e.push({title:"before_var",content:u(m),type:"list"}),e.push({title:"block",content:d,type:d.block_start=="each"?"each":"block"}),i=i.substring(d.index_end-1),p.test(i)){e.push({title:"block",content:h(i),type:"item"});continue}a===t.length-1&&e.push({title:"after_var",content:u(i),type:"list"})}return t.length===0&&e.push({title:"content",content:u(i),type:"list"}),{title:"list",childs:e,type:"items"}}const w=/[&<>'"]/g,f={};function b(r,t){f[r]=t}const v={"<":"&lt;",">":"&gt;","&":"&amp;","'":"&#39;",'"':"&#34;"};function E(r){let t="",e=r,i;for(;i=w.exec(e);)t+=e.slice(0,i.index),t+=v[i[0]],e=e.slice(i.index+1);return t+e}const g={escape:!0};class S{options;compiled;data;render_cache;constructor(t,e=g){this.template=t,this.options=g,this.render_cache={},this.options=e,this.compiled=typeof t=="string"?h(t):t}stringCache(t){const e=t.var,i=e.split(" "),o=i[0],s=i[1];return this.render_cache[e]=f[o]?()=>f[o](this.data[s]):()=>{const l=e=="this"?this.data:t?.fn.apply(this.data);return this.options.escape&&typeof l=="string"?E(l):l}}renderString(t){return this.render_cache[t.var]?.()??this.stringCache(t)()}renderBlock(t){switch(t.block_start){case"if":{for(let e=0;e<t.block_content.length;e++){const i=t.block_content[e];switch(i.condition){case void 0:return this.render(i.content);default:if(i.condition.apply(this.data))return this.render(i.content);break}}return""}default:throw new Error("Unknown block type: "+t.block_start)}}renderForeach(t){let e="";const i=this.data,o=t.block_value=="this"?this.data:t.fn.apply(this.data);for(let s=0;s<o.length;s++)this.data=o[s],e+=this.render(t.block_content);return this.data=i,e}render(t){let e="";switch(t.type){case"block":e+=this.renderBlock(t.content);break;case"each":e+=this.renderForeach(t.content);break;case"string":e+=t.content;break;case"var":e+=this.renderString(t);break;case"list":for(const i of t.content)e+=this.render(i);break;case"items":for(const i of t.childs)e+=this.render(i);break;case"item":e+=this.render(t.content);break;default:e+=t.content;break}return e}start(t){return this.data=t,this.render(this.compiled)}template}function x(r,t=g){const e=new S(r,t);return e.start.bind(e)}const _=new Map;function F(r,t,e){if(_.has(r))return _.get(r)(t);const i=x(e);return _.set(r,i),i(t)}b("JSON",r=>JSON.stringify(r)),b("raw",r=>r);export{F as renderTemplate,x as compile,b as registerHelper};
