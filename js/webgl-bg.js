// WebGL Background — vanilla GL, no libs
(function(){
  var c=document.getElementById('bg3d');if(!c)return;
  var gl=c.getContext('webgl',{alpha:true,premultipliedAlpha:false});if(!gl)return;
  var dpr=Math.min(window.devicePixelRatio||1,2);
  function resize(){c.width=window.innerWidth*dpr;c.height=window.innerHeight*dpr;c.style.width=window.innerWidth+'px';c.style.height=window.innerHeight+'px';gl.viewport(0,0,c.width,c.height);}
  resize();
  var vs='attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}';
  var fs='precision mediump float;uniform float t;uniform vec2 r;'
    +'vec2 h2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return -1.0+2.0*fract(sin(p)*43758.5453);}'
    +'float ns(vec2 p){float K1=0.366025404,K2=0.211324865;vec2 i=floor(p+(p.x+p.y)*K1),a=p-i+(i.x+i.y)*K2,o=step(a.yx,a.xy),b=a-o+K2,cc=a-1.0+2.0*K2;vec3 hh=max(0.5-vec3(dot(a,a),dot(b,b),dot(cc,cc)),0.0);vec3 n=hh*hh*hh*hh*vec3(dot(a,h2(i)),dot(b,h2(i+o)),dot(cc,h2(i+1.0)));return dot(n,vec3(70.0));}'
    +'float arc(vec2 p,vec2 c,float rad,float w,float warp){p.y+=sin(p.x*3.0+t*0.5)*warp;p.x+=ns(p*2.0+t*0.2)*(warp*0.5);return abs(length(p-c)-rad)-w;}'
    +'void main(){vec2 uv=gl_FragCoord.xy/r;vec2 st=uv;st.x*=r.x/r.y;vec2 ce=vec2(0.2,0.5);'
    +'float d1=arc(st,ce,0.8,0.01,0.1),d2=arc(st,ce,0.82,0.04,0.15);'
    +'float cg=exp(-d1*40.0),fg=exp(-d2*15.0),w=smoothstep(1.0,-0.2,st.x)*0.3;'
    +'vec3 col=vec3(1)*cg+vec3(0.42,0.29,1.0)*(fg+w*(sin(t)*0.1+0.9));'
    +'float a=clamp(cg+fg+w,0.0,1.0);col=vec3(1)-exp(-col*2.0);gl_FragColor=vec4(col,a);}';
  function cs(type,src){var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s;}
  var pg=gl.createProgram();gl.attachShader(pg,cs(gl.VERTEX_SHADER,vs));gl.attachShader(pg,cs(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pg);gl.useProgram(pg);
  var buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  var pa=gl.getAttribLocation(pg,'p');gl.enableVertexAttribArray(pa);gl.vertexAttribPointer(pa,2,gl.FLOAT,false,0,0);
  var ut=gl.getUniformLocation(pg,'t'),ur=gl.getUniformLocation(pg,'r');
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  var t0=Date.now();
  function draw(){requestAnimationFrame(draw);gl.uniform1f(ut,(Date.now()-t0)*0.001);gl.uniform2f(ur,c.width,c.height);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);}
  draw();
  window.addEventListener('resize',resize);
})();
