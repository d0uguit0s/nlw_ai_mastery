import { FFmpeg } from '@ffmpeg/ffmpeg'

import coreURL from '../ffmpeg/ffmpeg-core.js?url'
import wasmURL from '../ffmpeg/ffmpeg-core.wasm?url'
import workerURL from '../ffmpeg/ffmpeg-worker.js?url'

// Previne que o FFmpeg seja carregado sem necessidade pq é uma biblioteca bem pesada (WebAssembly)
let ffmpeg: FFmpeg | null

export async function getFFmpeg() {
  // Caso já exista um ffmpeg anterior ele apenas retorna oq já existe
  if (ffmpeg){
    return ffmpeg
  }

  // Caso não exista ele instância um novo ffmpeg
  ffmpeg = new FFmpeg()

  // Caso não esteja carregado ele força um carregamento
  if (!ffmpeg.loaded){
    await ffmpeg.load({
      coreURL,
      wasmURL,
      workerURL
    })
  }

  return ffmpeg
}