import { onBeforeUnmount } from 'vue'

/**
 * Layer WebGL di distorsione liquida (look "liquid metal") dietro i pannelli.
 *
 * Renderizza un fluido animato (perlin flow) a bassa risoluzione su un canvas
 * fixed, con colori legati al tema (blu+oro in light, tonalità più scure in
 * dark). I pannelli glass (backdrop-filter) sfocano e saturano questo layer,
 * simulando la rifrazione ai bordi stile macOS.
 *
 * Graceful degradation: se WebGL non è disponibile, il canvas resta vuoto e
 * l'app funziona normalmente. Rispetta `prefers-reduced-motion` (il CSS nasconde
 * il canvas) e si disattiva quando la tab non è visibile (visibilitychange).
 */
export function useLiquidShader() {
  let canvas: HTMLCanvasElement | null = null
  let gl: WebGLRenderingContext | null = null
  let program: WebGLProgram | null = null
  let positionBuffer: WebGLBuffer | null = null
  let rafId = 0
  let startTime = 0
  let width = 0
  let height = 0
  let dark = false
  let disposed = false

  const vertSrc = `
    attribute vec2 a_pos;
    void main() {
      gl_Position = vec4(a_pos, 0.0, 1.0);
    }
  `

  const fragSrc = `
    precision mediump float;
    uniform vec2 u_res;
    uniform float u_time;
    uniform vec3 u_colorA;
    uniform vec3 u_colorB;
    uniform vec3 u_colorC;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }
    float fbm(vec2 p) {
      float v = 0.0;
      float amp = 0.5;
      for (int i = 0; i < 5; i++) {
        v += amp * noise(p);
        p = p * 2.03 + vec2(11.0, 7.0);
        amp *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      vec2 p = uv * 2.0 - 1.0;
      p.x *= u_res.x / u_res.y;

      // Domain warping: il campo di flusso "seta" si avvolge su se stesso
      float t = u_time * 0.06;
      vec2 q = vec2(
        fbm(p * 1.4 + vec2(t, -t * 0.8)),
        fbm(p * 1.4 + vec2(5.2, 1.3) + vec2(-t * 0.7, t))
      );
      vec2 r = vec2(
        fbm(p * 1.4 + 2.2 * q + vec2(1.7, 9.2) + t * 0.35),
        fbm(p * 1.4 + 2.2 * q + vec2(8.3, 2.8) - t * 0.3)
      );
      float f = fbm(p * 1.4 + 2.5 * r);

      vec3 col = mix(u_colorA, u_colorB, clamp(f * f * 1.6, 0.0, 1.0));
      col = mix(col, u_colorC, clamp(dot(r, q) * 0.6, 0.0, 1.0));

      // Vignettatura dolce: sfuma verso il centro
      float vig = smoothstep(1.5, 0.25, length(p));
      col *= 0.62 + 0.38 * vig;

      // Dithering per eliminare il banding dei gradienti morbidi
      col += (hash(gl_FragCoord.xy) - 0.5) * (2.0 / 255.0);

      gl_FragColor = vec4(col, 0.62);
    }
  `

  const compileShader = (type: number, src: string) => {
    const shader = gl!.createShader(type)
    if (!shader) return null
    gl!.shaderSource(shader, src)
    gl!.compileShader(shader)
    if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl!.getShaderInfoLog(shader))
      gl!.deleteShader(shader)
      return null
    }
    return shader
  }

  const resize = () => {
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    width = Math.max(1, Math.floor(window.innerWidth * dpr))
    height = Math.max(1, Math.floor(window.innerHeight * dpr))
    // Impostiamo le dimensioni del buffer: se il context è già attivo, il resize
    // azzera il framebuffer; chiamiamo quindi gl.viewport subito dopo nel draw.
    canvas.width = width
    canvas.height = height
    canvas.style.width = `${window.innerWidth}px`
    canvas.style.height = `${window.innerHeight}px`
    if (gl) gl.viewport(0, 0, width, height)
  }

  const colorsFor = (isDark: boolean): [number[], number[], number[]] => {
    if (isDark) {
      return [
        [0.10, 0.20, 0.45],   // blu profondo
        [0.38, 0.29, 0.07],   // oro scuro
        [0.14, 0.30, 0.62],   // blu medio
      ]
    }
    return [
      [0.28, 0.50, 0.96],   // blu
      [0.97, 0.75, 0.16],   // oro
      [0.55, 0.70, 1.00],   // azzurro chiaro
    ]
  }

  const draw = (now: number) => {
    if (!gl || !program) return
    if (disposed) return
    const elapsed = (now - startTime) / 1000
    dark = document.documentElement.classList.contains('dark')
    const [cA, cB, cC] = colorsFor(dark)
    gl.useProgram(program)
    gl.uniform2f(gl.getUniformLocation(program, 'u_res'), width, height)
    gl.uniform1f(gl.getUniformLocation(program, 'u_time'), elapsed)
    gl.uniform3fv(gl.getUniformLocation(program, 'u_colorA'), cA)
    gl.uniform3fv(gl.getUniformLocation(program, 'u_colorB'), cB)
    gl.uniform3fv(gl.getUniformLocation(program, 'u_colorC'), cC)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    rafId = requestAnimationFrame(draw)
  }

  const onVisibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId)
    } else if (gl && program && !disposed) {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(draw)
    }
  }

  const onResize = () => resize()

  const mount = (el: HTMLCanvasElement) => {
    if (!el) return
    canvas = el
    // Dimensioni prima del context: evita il reset del buffer dopo getContext
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    width = Math.max(1, Math.floor(window.innerWidth * dpr))
    height = Math.max(1, Math.floor(window.innerHeight * dpr))
    el.width = width
    el.height = height
    el.style.width = `${window.innerWidth}px`
    el.style.height = `${window.innerHeight}px`

    gl = el.getContext('webgl', { antialias: false, alpha: true, preserveDrawingBuffer: true })
    if (!gl) return

    el.addEventListener('webglcontextlost', (e) => { e.preventDefault() })
    el.addEventListener('webglcontextrestored', () => {
      if (canvas && !disposed) rebuild()
    })

    rebuild()
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibility)
    rafId = requestAnimationFrame(draw)
  }

  const rebuild = () => {
    if (!gl) return
    const vs = compileShader(gl.VERTEX_SHADER, vertSrc)
    const fs = compileShader(gl.FRAGMENT_SHADER, fragSrc)
    if (!vs || !fs) { gl = null; return }

    program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program))
      gl = null
      return
    }
    gl.useProgram(program)

    positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)

    const aPos = gl.getAttribLocation(program, 'a_pos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    gl.disable(gl.DEPTH_TEST)
    gl.clearColor(0, 0, 0, 0)
    gl.viewport(0, 0, width, height)
    startTime = performance.now()
  }

  const dispose = () => {
    disposed = true
    cancelAnimationFrame(rafId)
    window.removeEventListener('resize', onResize)
    document.removeEventListener('visibilitychange', onVisibility)
    if (gl) {
      gl.useProgram(null)
      gl.deleteProgram(program)
      gl.deleteBuffer(positionBuffer)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      gl = null
    }
  }

  onBeforeUnmount(dispose)

  return { mount, dispose }
}
