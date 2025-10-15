import { useState, useRef } from "react";
import { Button } from "../components/ui/button";
import { Card, CardAction, CardContent } from "../components/ui/card";
import { X } from "lucide-react";

function UploadVideo() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
    }
  };

  const handleCancel = () => {
    setVideoFile(null);
    setVideoUrl(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleUpload = () => {
    if (videoFile) {
      console.log("Uploading:", videoFile);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-lg shadow-lg rounded-2xl">
        <CardContent className="px-6 space-y-4">
          <h2 className="text-2xl font-semibold text-center">
            Upload de Vídeo
          </h2>

          {!videoFile && (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-10 bg-white">
              <input
                ref={inputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="cursor-pointer text-sm text-gray-600 hover:text-gray-900"
              >
                Clique para selecionar um vídeo
              </label>
            </div>
          )}

          {videoFile && videoUrl && (
            <div className="space-y-4">
              <div className="relative">
                <video
                  controls
                  className="w-full rounded-lg shadow"
                  src={videoUrl}
                />
                <button
                  onClick={handleCancel}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex justify-center">
                <span className="text-sm text-gray-600 truncate max-w-[200px]">
                  {videoFile.name}
                </span>
              </div>
            </div>
          )}
        </CardContent>
        <CardAction className="w-full text-center px-6">
          <Button
            size="lg"
            variant="default"
            className="cursor-pointer"
            onClick={handleUpload}
          >
            Enviar Vídeo
          </Button>
        </CardAction>
      </Card>
    </div>
  );
}

export default UploadVideo;