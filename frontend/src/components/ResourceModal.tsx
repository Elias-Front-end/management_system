import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Maximize, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: {
    id: number;
    nome_recurso: string;
    descricao_recurso?: string;
    tipo_recurso: 'video' | 'arquivo_pdf' | 'arquivo_zip';
    arquivo_url: string;
    turma_nome: string;
    treinamento_nome?: string;
  } | null;
}

export const ResourceModal: React.FC<ResourceModalProps> = ({ isOpen, onClose, resource }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfZoom, setPdfZoom] = useState(1);
  const [pdfPage, setPdfPage] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Fechar modal com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Controles de vídeo
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      modalRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Download do arquivo
  const handleDownload = () => {
    if (resource?.arquivo_url) {
      const link = document.createElement('a');
      link.href = resource.arquivo_url;
      link.download = resource.nome_recurso;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Controles de zoom do PDF
  const zoomIn = () => setPdfZoom(prev => Math.min(prev + 0.25, 3));
  const zoomOut = () => setPdfZoom(prev => Math.max(prev - 0.25, 0.5));

  if (!isOpen || !resource) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div 
        ref={modalRef}
        className={`relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden focus-ring ${
          isFullscreen ? 'max-w-none max-h-none w-screen h-screen rounded-none' : ''
        }`}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1">
            <h2 
              id="modal-title"
              className="text-xl font-semibold text-gray-900 dark:text-gray-100 truncate"
            >
              {resource.nome_recurso}
            </h2>
            <p 
              id="modal-description"
              className="text-sm text-gray-600 dark:text-gray-400"
            >
              {resource.treinamento_nome && `${resource.treinamento_nome} • `}{resource.turma_nome}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus-ring"
              title="Download do arquivo"
              aria-label="Fazer download do arquivo"
            >
              <Download size={20} />
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus-ring"
              title="Alternar tela cheia"
              aria-label="Alternar modo tela cheia"
            >
              <Maximize size={20} />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus-ring"
              title="Fechar modal"
              aria-label="Fechar modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`overflow-auto ${isFullscreen ? 'h-[calc(100vh-80px)]' : 'max-h-[calc(90vh-120px)]'} p-4`}>
          {resource.tipo_recurso === 'video' && (
            <div className="space-y-4">
              {/* Video Player */}
              <div className="relative bg-black rounded-lg overflow-hidden video-container">
                <video
                  ref={videoRef}
                  className={`w-full mx-auto ${isFullscreen ? 'h-[calc(100vh-200px)]' : 'max-w-[640px] h-auto'}`}
                  style={isFullscreen ? {} : { aspectRatio: '16/9', maxHeight: '360px' }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onVolumeChange={(e) => {
                    const video = e.target as HTMLVideoElement;
                    setVolume(video.volume);
                    setIsMuted(video.muted);
                  }}
                  aria-label={`Vídeo: ${resource.nome_recurso}`}
                  controls
                >
                  <source src={resource.arquivo_url} type="video/mp4" />
                  <track kind="captions" />
                  Seu navegador não suporta o elemento de vídeo.
                </video>
                
                {/* Custom Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={togglePlay}
                      className="text-white hover:text-gray-300 transition-colors focus-ring"
                      aria-label={isPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo'}
                    >
                      {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={toggleMute}
                        className="text-white hover:text-gray-300 transition-colors focus-ring"
                        aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
                      >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer focus-ring"
                        aria-label="Controle de volume"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {resource.descricao_recurso && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Descrição</h3>
                  <p className="text-gray-700 dark:text-gray-300">{resource.descricao_recurso}</p>
                </div>
              )}
            </div>
          )}

          {resource.tipo_recurso === 'arquivo_pdf' && (
            <div className="space-y-4">
              {/* PDF Controls */}
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={zoomOut}
                    className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors focus-ring"
                    title="Diminuir zoom"
                    aria-label="Diminuir zoom do PDF"
                  >
                    <ZoomOut size={16} />
                  </button>
                  <span 
                    className="text-sm text-gray-700 dark:text-gray-300 min-w-[60px] text-center"
                    aria-live="polite"
                    aria-label={`Zoom atual: ${Math.round(pdfZoom * 100)} por cento`}
                  >
                    {Math.round(pdfZoom * 100)}%
                  </span>
                  <button
                    onClick={zoomIn}
                    className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors focus-ring"
                    title="Aumentar zoom"
                    aria-label="Aumentar zoom do PDF"
                  >
                    <ZoomIn size={16} />
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPdfPage(prev => Math.max(prev - 1, 1))}
                    className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors focus-ring"
                    title="Página anterior"
                    aria-label="Ir para página anterior"
                    disabled={pdfPage <= 1}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span 
                    className="text-sm text-gray-700 dark:text-gray-300 min-w-[80px] text-center"
                    aria-live="polite"
                    aria-label={`Página atual: ${pdfPage}`}
                  >
                    Página {pdfPage}
                  </span>
                  <button
                    onClick={() => setPdfPage(prev => prev + 1)}
                    className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors focus-ring"
                    title="Próxima página"
                    aria-label="Ir para próxima página"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
              
              {/* PDF Viewer */}
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
                <iframe
                  src={`${resource.arquivo_url}#page=${pdfPage}&zoom=${pdfZoom * 100}`}
                  className={`w-full border-0 rounded-lg focus-ring ${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-96'}`}
                  title={`PDF: ${resource.nome_recurso}`}
                  aria-label={`Visualizador de PDF para ${resource.nome_recurso}`}
                  onError={() => {
                    console.error('Erro ao carregar PDF:', resource.arquivo_url);
                  }}
                />
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Se o PDF não carregar, <a 
                    href={resource.arquivo_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    clique aqui para abrir em nova aba
                  </a>
                </div>
              </div>
              
              {resource.descricao_recurso && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Descrição</h3>
                  <p className="text-gray-700 dark:text-gray-300">{resource.descricao_recurso}</p>
                </div>
              )}
            </div>
          )}

          {resource.tipo_recurso === 'arquivo_zip' && (
            <div className="text-center py-8">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
                <Download size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Arquivo ZIP
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {resource.descricao_recurso || 'Clique no botão abaixo para fazer o download do arquivo.'}
                </p>
                <button
                  onClick={handleDownload}
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <Download size={16} />
                  <span>Download</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceModal;