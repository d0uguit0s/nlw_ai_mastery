import { FileVideo, Upload } from 'lucide-react';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { getFFmpeg } from '@/lib/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

export function VideoInputForm() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);
  function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.currentTarget

    if(!files){
      return
    }
    
    const selectedFile = files[0]

    setVideoFile(selectedFile)
  }

  async function convertVideoToAudio(video: File) {
    console.log('Convert started')

    const ffmpeg = await getFFmpeg()

    // Permite o ffmpeg pegar esse vídeo para converter
    await ffmpeg.writeFile('input.mp4', await fetchFile(video))

    // Captura de erros
    // ffmpeg.on('log', log => {
    //   console.log(log)
    // })

    ffmpeg.on('progress', progress => {
      console.log('Convert progress' + Math.round(progress.progress * 100))
    })

    // await ffmpeg.exec([
    //   '-i', 'input.mp4', '-map', '0:a', '-b:a', '20k', '-acodec', 'libmp3lame', 'output.mp3',
    // ])

    await ffmpeg.exec([
      '-i', 'input.mp4', '-map', '0:a:0?', '-b:a', '20k', '-acodec', 'libmp3lame', 'output.mp3',
    ])

    const data = await ffmpeg.readFile('output.mp3')

    const audioFileBlob = new Blob([data], { type: 'audio/mpeg' })
    const audioFile = new File([audioFileBlob], 'audio.mp3', {
      type: 'audio/mpeg',
    })

    console.log('Convert finished')

    return audioFile
  }

  async function handleUploadVideo(event: React.FormEvent<HTMLFormElement>){
    // Evita que a tela seja recarregada ao dar submit no formulário
    event.preventDefault()

    const prompt = promptInputRef.current?.value

    if(!videoFile){
      return
    }

    //Converter o vídeo em áudio

    const audioFile = await convertVideoToAudio(videoFile)

    console.log(audioFile, prompt)
  }

  // Impede que o componente de preview seja renderizado toda hora e só renderiza se ele mudar o valor de estado
  const previewURL = useMemo(() => {
    if(!videoFile){
      return null
    }

    // Essa função cria uma URL de pré-visualização de arquivos como imagens ou vídeos
    return URL.createObjectURL(videoFile);
  }, [videoFile])

  return(
    <form onSubmit={handleUploadVideo} className='space-y-6'>
      <label 
        htmlFor="video"
        className='relative border flex rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/5'
      >
        {previewURL ? (
          <video src={previewURL} controls={false} className='pointer-events-none absolute inset-0'/>
        ) : (
        <>
          <FileVideo className='w-4 h-4'/>
          Seleciona um vídeo
        </>
        )}
        </label>

      <input type='file' id='video' accept='video/mp4' className='sr-only' onChange={handleFileSelected}/>

      <Separator />

      <div className='space-y-2'>
        <Label htmlFor='transcription_prompt'>Prompt de transcrição</Label>
        <Textarea
          ref={promptInputRef}
          id='transcription_prompt' 
          className='h-20 leading-relaxed resize-none'
          placeholder='Inclua palavras-chave mencionadas no vídeo separados por vírgula (,)'
        />
      </div>

      <Button type='submit' className='w-full'>
        Carregar vídeo
        <Upload className='w-4 h-4 ml-2' />
      </Button>
    </form>
  )
}