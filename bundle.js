const k=/\{{(.*?)}}/g,p=/{{\/(?<block_close>.*?)}}|{{#else}}|{{#(?<block_start>.*?) (?<block_value>.*?)}}/gms;function u(r){const t=[];let e=r,i,o=0;for(;(i=k.exec(e))!=null&&i;){const c=i.index,l=i.index+i[0].length,s={type:"var",content:i[0],var:i[1],index:c,index_end:o+l},n=e.substring(0,s.index);k.test(n)?t.push({title:"before_block",content:u(n),type:"list",index:o,index_end:o+n.length}):t.push({title:"before_block",content:n,type:"string",index:o,index_end:o+n.length}),s.index=o+c,t.push(s),o=l+o,e=e.substring(l)||""}return t.sort((c,l)=>c.index-l.index),t.push({title:"before_block",content:e,type:"string",index:o,index_end:o+e?.length}),t}function y(r){const t=[],e=[];let i,o=[];function c(s,n){const d={index:n.index,length:n[0].length,type:s,condition:n.groups?.block_value};e.push(d)}const l=r.matchAll(new RegExp(p,"g"));for(const s of l){const n=s.groups?.block_start?s.groups?.block_start:s.groups?.block_close?"ifclose":"else";switch(n){case"if":i?o.push(s):(i=s,c(n,s));break;case"elseif":o.length==0&&c(n,s);break;case"else":o.length==0&&c(n,s);break;case"ifclose":o.length==0?c(n,s):o.pop();break;default:break}}if(e.sort((s,n)=>s.index-n.index),e.length==2&&e[0].type=="if"&&e[1].type=="ifclose"){const s=r.substring(e[0].index+e[0].length,e[1].index).trim();return t.push({type:"if",condition:new Function("data",`return !!(${e[0].condition})`)??void 0,content:h(s),str_condition:e[0].condition}),t}o=[];for(const s of e)switch(s.type){case"if":o.length==0&&o.push(s);break;case"elseif":if(o.length==1){const n=o.pop();if(n){const a=r.substring(n.index+n.length,s.index).trim();t.push({type:n.type,condition:new Function("data",`return !!(${n.condition})`)??void 0,content:h(a),str_condition:n.condition})}}o.push(s);break;case"else":if(o.length==1){const n=o.pop();if(n){const a=r.substring(n.index+n.length,s.index).trim();t.push({type:n.type,condition:n.condition?new Function("data",`return !!(${n.condition})`):void 0,content:h(a),str_condition:n.condition})}o.push(s)}break;case"ifclose":if(o.length==1){const n=o.pop();if(n){const a=n.type=="if"?r.substring(n.index+n.length,s.index+s.length):r.substring(n.index+n.length,s.index).trim();t.push({type:n.type,condition:n.condition?new Function("data",`return !!(${n.condition})`):void 0,content:h(a),str_condition:n.condition})}}break;default:break}return t}function h(r){const t=[],e=[];let i=r;const o=r.matchAll(new RegExp(p,"g"));let c,l,s=[];for(const a of o){const d=a.groups;if(d?.block_start&&!c){c=a;continue}if(d?.block_start&&d?.block_start!=="elseif"){s.push(a);continue}if(d?.block_close&&s.length>0){s.pop();continue}if(d?.block_close&&c&&s.length==0){l=a;continue}}if(console.log(c,l),c&&l)switch(c.groups?.block_start){case"if":{const a=r.substring(c?.index,l?.index+l.length+c?.length);t.push({block_start:c.groups?.block_start,block_value:c.groups?.block_startblock_value,block_content:y(a),index:c?.index,index_end:l?.index+l.length+c?.length});break}case"each":{const a=r.substring(c?.index+c[0].length,l.index);t.push({block_start:c.groups?.block_start,block_value:c.groups?.block_value,block_content:h(a),index:c?.index,index_end:l.index+l?.length+c[0].length})}}for(let a=0;a<t.length;a++){const d=t[a],m=i.substring(0,d.index);if(e.push({title:"before_var",content:u(m),type:"list"}),e.push({title:"block",content:d,type:d.block_start=="each"?"each":"block"}),i=i.substring(d.index_end),p.test(i)){e.push({title:"block",content:h(i),type:"item"});continue}a===t.length-1&&e.push({title:"after_var",content:u(i),type:"list"})}return t.length===0&&e.push({title:"content",content:u(i),type:"list"}),{title:"list",childs:e,type:"items"}}const v=/[&<>'"]/g,f={};function b(r,t){f[r]=t}const w={"<":"&lt;",">":"&gt;","&":"&amp;","'":"&#39;",'"':"&#34;"};function E(r){let t="",e=r,i;for(;i=v.exec(e);)t+=e.slice(0,i.index),t+=w[i[0]],e=e.slice(i.index+1);return t+e}const g={escape:!0};class S{options;compiled;data;render_cache;var_cache;constructor(t,e=g){this.template=t,this.options=g,this.render_cache={},this.var_cache={},this.options=e,this.compiled=typeof t=="string"?h(t):t}stringCache(t){const e=t.split(" "),i=e[0],o=e[1];return this.render_cache[t]=f[i]?()=>f[i](this.data[o]):()=>this.options.escape&&typeof this.data[t]=="string"?E(this.data[t]):this.data[t]}renderString(t){return this.render_cache[t.var]?.()??this.stringCache(t.var)()}renderBlock(t){switch(t.block_start){case"if":{for(let e=0;e<t.block_content.length;e++){const i=t.block_content[e];switch(i.condition){case void 0:return this.render(i.content);default:if(i.condition.apply(this.data))return this.render(i.content);break}}break}default:throw new Error("Unknown block type: "+t.block_start)}}renderForeach(t){let e="";const i=this.data,o=this.var_cache,c=t.block_value=="this"?this.data:this.data[t.block_value];for(let l=0;l<c.length;l++)this.data=c[l],this.var_cache={},e+=this.render(t.block_content);return this.data=i,this.var_cache=o,e}render(t){let e="";switch(t.type){case"block":e+=this.renderBlock(t.content);break;case"each":e+=this.renderForeach(t.content);break;case"string":e+=t.content;break;case"var":e+=this.renderString(t);break;case"list":for(const i of t.content)e+=this.render(i);break;case"items":for(const i of t.childs)e+=this.render(i);break;case"item":e+=this.render(t.content);break;default:e+=t.content;break}return e}start(t){return this.data=t,this.render(this.compiled)}template}function x(r,t=g){const e=new S(r,t);return Deno.writeTextFileSync("template.json",JSON.stringify(e.compiled,null,2)),function(o){return e.start(o)}}const _=new Map;function O(r,t,e){if(_.has(r))return _.get(r)(t);const i=x(e);return _.set(r,i),i(t)}b("JSON",r=>JSON.stringify(r)),b("raw",r=>r);export{O as renderTemplate,x as compile,b as registerHelper};
