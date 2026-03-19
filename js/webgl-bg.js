// WebGL Background — Nebula flow (simplex noise + FBM)
(function(){
  var c=document.getElementById('bg3d');if(!c)return;
  var gl=c.getContext('webgl',{alpha:false,premultipliedAlpha:false});if(!gl)return;
  var dpr=Math.min(window.devicePixelRatio||1,2);
  function resize(){c.width=window.innerWidth*dpr;c.height=window.innerHeight*dpr;c.style.width=window.innerWidth+'px';c.style.height=window.innerHeight+'px';gl.viewport(0,0,c.width,c.height);}
  resize();

  var vs='attribute vec2 p;varying vec2 vUv;void main(){vUv=(p+1.0)*0.5;gl_Position=vec4(p,0,1);}';

  var fs=`precision mediump float;
uniform float t;
uniform vec2 r;
varying vec2 vUv;

vec3 permute(vec3 x){return mod(((x*34.0)+1.0)*x,289.0);}
float snoise(vec2 v){
  const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));
  vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1,0):vec2(0,1);
  vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod(i,289.0);
  vec3 p=permute(permute(i.y+vec3(0,i1.y,1))+i.x+vec3(0,i1.x,1));
  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
  m=m*m;m=m*m;
  vec3 x=2.0*fract(p*C.www)-1.0;
  vec3 h=abs(x)-0.5;
  vec3 ox=floor(x+0.5);
  vec3 a0=x-ox;
  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
  vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.0*dot(m,g);
}

float fbm(vec2 x){
  float v=0.0,a=0.5;vec2 shift=vec2(100.0);
  mat2 rot=mat2(cos(0.5),sin(0.5),-sin(0.5),cos(0.5));
  for(int i=0;i<5;++i){v+=a*snoise(x);x=rot*x*2.0+shift;a*=0.5;}
  return v;
}

void main(){
  vec2 st=gl_FragCoord.xy/r;
  st.x*=r.x/r.y;

  vec2 q=vec2(fbm(st+0.00*t),fbm(st+vec2(1.0)));
  vec2 rv=vec2(fbm(st+1.0*q+vec2(1.7,9.2)+0.04*t),fbm(st+1.0*q+vec2(8.3,2.8)+0.03*t));
  float f=fbm(st+rv);

  // Cool purple base
  vec3 color=vec3(0.04,0.0,0.1);
  color=mix(color,vec3(0.35,0.0,0.8),clamp((f*f)*2.5,0.0,1.0));
  color=mix(color,vec3(0.85,0.5,1.0),clamp(length(q)*0.8,0.0,1.0));

  // Warm highlights — orange/red glints (opposite FBM offset)
  vec2 q2=vec2(fbm(st*1.3+vec2(5.2,1.3)+0.02*t),fbm(st*1.3+vec2(3.7,8.1)-0.015*t));
  float warm=fbm(st*0.8+q2*0.7+vec2(0.0,0.05*t));
  float warmMask=smoothstep(0.15,0.65,warm)*smoothstep(0.3,0.0,abs(warm-0.4));
  vec3 warmColor=mix(vec3(0.9,0.25,0.05),vec3(1.0,0.55,0.1),clamp(warm*2.0,0.0,1.0));
  color+=warmColor*warmMask*0.35;

  float vignette=1.0-smoothstep(0.5,1.5,length(vUv-0.5));
  color*=vignette*1.5;

  gl_FragColor=vec4((f*f*f+0.6*f*f+0.5*f)*color,1.0);
}`;

  function cs(type,src){var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){console.error(gl.getShaderInfoLog(s));}return s;}
  var pg=gl.createProgram();gl.attachShader(pg,cs(gl.VERTEX_SHADER,vs));gl.attachShader(pg,cs(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pg);gl.useProgram(pg);
  var buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  var pa=gl.getAttribLocation(pg,'p');gl.enableVertexAttribArray(pa);gl.vertexAttribPointer(pa,2,gl.FLOAT,false,0,0);
  var ut=gl.getUniformLocation(pg,'t'),ur=gl.getUniformLocation(pg,'r');
  var t0=Date.now();
  function draw(){requestAnimationFrame(draw);gl.uniform1f(ut,(Date.now()-t0)*0.001);gl.uniform2f(ur,c.width,c.height);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);}
  draw();
  window.addEventListener('resize',resize);
})();
