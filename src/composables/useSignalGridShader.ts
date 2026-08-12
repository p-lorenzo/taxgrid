import { onBeforeUnmount } from 'vue'

/**
 * Griglia WebGL animata ispirata ai linguaggi visuali dei sistemi tecnici.
 * Celle blu formano segnali discreti in movimento; accenti oro evidenziano
 * intersezioni sporadiche. Il canvas resta sotto i pannelli glass.
 *
 * Graceful degradation senza WebGL. Rispetta `prefers-reduced-motion` via CSS
 * e sospende il rendering quando la tab non è visibile.
 */
export function useSignalGridShader() {
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

    void main() {
      // Celle da 54 px: misura stabile su desktop, sufficientemente ampia su mobile.
      float cellSize = 54.0;
      vec2 grid = gl_FragCoord.xy / cellSize;
      vec2 cell = floor(grid);
      vec2 local = fract(grid);
      vec2 gridCount = u_res / cellSize;
      float t = u_time * 0.42;

      // Bordo ortogonale sottile, stile blueprint/technical interface.
      float edge = min(min(local.x, 1.0 - local.x), min(local.y, 1.0 - local.y));
      float gridLine = 1.0 - smoothstep(0.012, 0.034, edge);
      float interior = smoothstep(0.055, 0.09, edge);

      // Tre segnali discreti attraversano la griglia come nastri di dati.
      float waveA = gridCount.y * (0.57
        + 0.13 * sin(cell.x * 0.32 + t)
        + 0.045 * sin(cell.x * 0.11 - t * 0.7));
      float waveB = gridCount.y * (0.31
        + 0.09 * sin(cell.x * 0.25 - t * 0.72 + 2.4));
      float waveC = gridCount.y * (0.73
        + 0.055 * sin(cell.x * 0.19 + t * 0.48 + 4.1));

      float bandA = 1.0 - smoothstep(0.55, 1.65, abs(cell.y - waveA));
      float bandB = 1.0 - smoothstep(0.45, 1.25, abs(cell.y - waveB));
      float bandC = 1.0 - smoothstep(0.35, 0.95, abs(cell.y - waveC));

      // Intensità a blocchi: niente gradienti liquidi tra celle.
      float cellSeed = hash(cell);
      float dataPulse = 0.55 + 0.45 * sin(cell.x * 0.52 - t * 1.8 + cellSeed * 6.2831);
      float blueCells = max(bandA, bandB * 0.68) * (0.45 + 0.55 * dataPulse) * interior;
      blueCells = max(blueCells, bandC * 0.42 * interior);

      // Pochi impulsi oro, lenti e localizzati sulle tracce secondarie.
      float goldGate = smoothstep(0.82, 0.96, cellSeed);
      float goldPulse = smoothstep(0.62, 0.98, 0.5 + 0.5 * sin(t * 0.8 + cellSeed * 9.0));
      float goldCells = max(bandB, bandC) * goldGate * goldPulse * interior;

      vec3 color = u_colorC * gridLine;
      color += u_colorA * blueCells;
      color = mix(color, u_colorB, goldCells * 0.78);

      float alpha = gridLine * 0.075;
      alpha += blueCells * 0.34;
      alpha += goldCells * 0.24;

      gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.48));
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
        [0.12, 0.34, 1.00],   // celle blu elettrico
        [0.95, 0.72, 0.10],   // impulsi oro
        [0.32, 0.43, 0.62],   // griglia scura
      ]
    }
    return [
      [0.12, 0.38, 0.96],   // celle blu
      [0.90, 0.63, 0.04],   // impulsi oro
      [0.48, 0.57, 0.72],   // griglia blueprint
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
