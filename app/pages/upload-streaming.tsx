import { useState, useRef, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Video, Square, Trash2, Upload } from "lucide-react";

function UploadStreaming() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
          setRecordedChunks(prev => [...prev, event.data]);
          // Envio em tempo real para o backend
          sendChunkToBackend(event.data, chunks.length);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedUrl(URL.createObjectURL(blob));
        
        // Para o stream da câmera
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(2000); // Gera chunks a cada 2 segundos
      setIsRecording(true);
      setRecordedChunks([]);
    } catch (error) {
      console.error("Erro ao acessar câmera:", error);
      alert("Não foi possível acessar a câmera. Verifique as permissões.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const sendChunkToBackend = async (chunk: Blob, chunkIndex: number) => {
    try {
      console.log(`📤 Enviando chunk ${chunkIndex} para backend:`, chunk.size, "bytes");
      
      // Simulação de envio
      // Descomente e adapte para seu backend real:
      /*
      const formData = new FormData();
      formData.append('chunk', chunk);
      formData.append('chunkIndex', chunkIndex.toString());
      formData.append('timestamp', Date.now().toString());
      
      const response = await fetch('https://seu-backend.com/api/upload-chunk', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        console.error('Erro ao enviar chunk:', chunkIndex);
      }
      */
    } catch (error) {
      console.error('Erro no envio do chunk:', error);
    }
  };

  const handleCancel = () => {
    setRecordedChunks([]);
    setRecordedUrl(null);
    setUploadProgress(0);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const handleFinalUpload = async () => {
    if (recordedChunks.length === 0) return;

    setIsUploading(true);
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    
    try {
      console.log("🚀 Fazendo upload final do vídeo completo:", blob.size, "bytes");

      // Simulação de progresso
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Upload real:
      /*
      const formData = new FormData();
      formData.append('video', blob, 'aula.webm');
      formData.append('totalChunks', recordedChunks.length.toString());
      
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(Math.round(progress));
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          alert("Vídeo enviado com sucesso! ✅");
          handleCancel();
        }
      });
      
      xhr.open('POST', 'https://seu-backend.com/api/finalize-upload');
      xhr.send(formData);
      */
      
      alert("Vídeo enviado com sucesso! ✅");
      handleCancel();
    } catch (error) {
      console.error('Erro no upload final:', error);
      alert('Erro ao enviar o vídeo. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }
    };
  }, [recordedUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center light:bg-white">
      <Card className="w-full max-w-3xl shadow-2xl rounded-3xl overflow-hidden">
        <CardContent className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Gravar Aula</h2>
            <p className="text-gray-600 dark:text-gray-300">
              {isRecording && "🔴 Gravando e enviando para o servidor..."}
              {!isRecording && !recordedUrl && "Clique para iniciar a gravação da sua aula"}
              {recordedUrl && "Gravação finalizada! Revise e envie"}
            </p>
          </div>

          {/* Video Preview */}
          <div className="relative bg-black rounded-2xl overflow-hidden aspect-video shadow-lg">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              controls={recordedUrl ? true : false}
              className="w-full h-full object-cover"
              src={recordedUrl || undefined}
            />
            
            {!isRecording && !recordedUrl && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <div className="text-center space-y-4">
                  <Video data-testid="video-icon" className="w-20 h-20 text-gray-500 mx-auto" />
                  <p className="text-gray-400 text-sm">Câmera desligada</p>
                </div>
              </div>
            )}

            {isRecording && (
              <div data-testid="recording-indicator" className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                GRAVANDO
              </div>
            )}

            {recordedChunks.length > 0 && isRecording && (
              <div className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg text-xs backdrop-blur">
                📦 {recordedChunks.length} chunks enviados
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Enviando vídeo final...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  role="progressbar"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Stats */}
          {recordedChunks.length > 0 && !isRecording && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-xl">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{recordedChunks.length}</p>
                <p className="text-xs text-gray-600">Chunks gravados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {(recordedChunks.reduce((acc, chunk) => acc + chunk.size, 0) / 1024 / 1024).toFixed(2)} MB
                </p>
                <p className="text-xs text-gray-600">Tamanho total</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center flex-wrap">
            {!isRecording && !recordedUrl && (
              <Button
                size="lg"
                onClick={startRecording}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg px-8 py-6 text-lg"
              >
                <Video className="w-6 h-6 mr-2" />
                Iniciar Gravação
              </Button>
            )}

            {isRecording && (
              <Button
                size="lg"
                onClick={stopRecording}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg px-8 py-6 text-lg"
              >
                <Square className="w-6 h-6 mr-2" />
                Parar Gravação
              </Button>
            )}

            {recordedUrl && !isUploading && (
              <>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleCancel}
                  className="border-2 border-gray-300 hover:bg-gray-100 px-6 py-6"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Descartar
                </Button>
                <Button
                  size="lg"
                  onClick={handleFinalUpload}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg px-8 py-6 text-lg"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Enviar Vídeo
                </Button>
              </>
            )}
          </div>

          {/* Info Box */}
          <div className="border-blue-200 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300">
            <p className="font-semibold mb-1">💡 Como funciona:</p>
            <ul className="space-y-1 text-xs">
              <li>• A gravação é enviada em chunks de 2 segundos para o servidor</li>
              <li>• Você pode gravar aulas longas sem preocupação</li>
              <li>• O vídeo final pode ser processado por IA após o envio</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default UploadStreaming;