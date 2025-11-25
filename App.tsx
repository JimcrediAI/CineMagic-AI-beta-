
import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import FilterSelector from './components/FilterSelector';
import ChatWidget from './components/ChatWidget';
import { generateCinematicImage, enhanceCinematicPrompt } from './services/geminiService';
import { CinematicFilter, FILTERS } from './types';

// UI Dictionary
const LABELS = {
  en: {
    title: "Cinematic Reality Engine",
    subtitle: "Transform footage into 16:9 ARRI cinematic shots using professional color grades or custom reference palettes.",
    step1: "Source Footage",
    step1Reset: "Reset All",
    step1Loaded: "Input Loaded",
    step2: "Director's Prompt",
    enhanceBtn: "Enhance with AI",
    enhanceLoading: "Enhancing...",
    charLabel: "Character",
    charPlace: "e.g. Cyborg detective",
    clothLabel: "Clothing",
    clothPlace: "e.g. Leather trenchcoat",
    actLabel: "Action",
    actPlace: "e.g. Running in rain",
    setLabel: "Setting",
    setPlace: "e.g. Neon Tokyo street",
    finalPromptLabel: "Final Prompt (Editable)",
    finalPromptPlace: "The final prompt sent to Gemini will appear here. You can manually edit this or use the Enhance button.",
    enhanceError: "Please fill in at least one field above to use AI enhancement.",
    step3: "Color Grade / Palette",
    stepRef: "Upload Color Reference",
    stepRefDesc: "The final image will adopt the color palette and lighting of this reference.",
    btnGenerate: "Render Cinematic Shot",
    btnProcessing: "Developing...",
    errorRef: "Please upload a reference image for the Custom Reference filter.",
    errorGen: "Failed to generate image. Please try again or check your API key.",
    monitorTitle: "Monitor Output (16:9)",
    monitorWaiting: "Waiting for input signal",
    monitorProcessingQuote: "\"Cinema is a matter of what's in the frame and what's out.\"",
    monitorProcessingSub: "Processing with Gemini...",
    poweredBy: "Powered by Gemini 2.5 Flash Image"
  },
  es: {
    title: "Motor de Realidad Cinemática",
    subtitle: "Transforma imágenes en tomas cinemáticas ARRI 16:9 usando etalonaje profesional o paletas de referencia.",
    step1: "Metraje Original",
    step1Reset: "Reiniciar Todo",
    step1Loaded: "Imagen Cargada",
    step2: "Instrucciones del Director",
    enhanceBtn: "Mejorar con IA",
    enhanceLoading: "Mejorando...",
    charLabel: "Personaje",
    charPlace: "ej. Detective cyborg",
    clothLabel: "Vestimenta",
    clothPlace: "ej. Gabardina de cuero",
    actLabel: "Acción",
    actPlace: "ej. Corriendo bajo la lluvia",
    setLabel: "Escenario",
    setPlace: "ej. Calle de Tokio neón",
    finalPromptLabel: "Prompt Final (Editable)",
    finalPromptPlace: "El prompt final enviado a Gemini aparecerá aquí. Puedes editarlo manualmente o usar el botón Mejorar.",
    enhanceError: "Por favor rellena al menos un campo arriba para usar la mejora IA.",
    step3: "Etalonaje / Paleta",
    stepRef: "Subir Referencia de Color",
    stepRefDesc: "La imagen final adoptará la paleta de colores e iluminación de esta referencia.",
    btnGenerate: "Renderizar Toma Cinemática",
    btnProcessing: "Revelando...",
    errorRef: "Por favor sube una imagen de referencia para el filtro personalizado.",
    errorGen: "Error al generar la imagen. Inténtalo de nuevo o verifica tu API key.",
    monitorTitle: "Monitor de Salida (16:9)",
    monitorWaiting: "Esperando señal de entrada",
    monitorProcessingQuote: "\"El cine es cuestión de lo que está dentro del cuadro y lo que está fuera.\"",
    monitorProcessingSub: "Procesando con Gemini...",
    poweredBy: "Impulsado por Gemini 2.5 Flash Image"
  }
};

function App() {
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const text = LABELS[language];

  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<CinematicFilter>(CinematicFilter.SCI_FI_NEON);
  
  // Structured Prompt State
  const [promptDetails, setPromptDetails] = useState({
    character: '',
    clothing: '',
    action: '',
    setting: ''
  });
  const [finalPrompt, setFinalPrompt] = useState('');
  
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setSourceImage(null);
    setReferenceImage(null);
    setPromptDetails({ character: '', clothing: '', action: '', setting: '' });
    setFinalPrompt('');
    setGeneratedImage(null);
    setError(null);
  };

  const handleEnhancePrompt = async () => {
    const { character, clothing, action, setting } = promptDetails;
    if (!character && !clothing && !action && !setting) {
      setFinalPrompt(text.enhanceError);
      return;
    }

    setIsEnhancing(true);
    try {
      const enhanced = await enhanceCinematicPrompt(promptDetails);
      setFinalPrompt(enhanced);
    } catch (e) {
      setError("Failed to enhance prompt.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!sourceImage) return;
    
    // Validation for Custom Reference
    if (selectedFilter === CinematicFilter.CUSTOM_GRADIENT && !referenceImage) {
      setError(text.errorRef);
      return;
    }

    setIsProcessing(true);
    setError(null);
    setGeneratedImage(null); // Clear previous result to show loading

    // Construct prompt if finalPrompt is empty, otherwise use finalPrompt
    let instructionToUse = finalPrompt;
    if (!instructionToUse.trim()) {
       const parts = [];
       if (promptDetails.character) parts.push(`Character: ${promptDetails.character}`);
       if (promptDetails.clothing) parts.push(`Clothing: ${promptDetails.clothing}`);
       if (promptDetails.action) parts.push(`Action: ${promptDetails.action}`);
       if (promptDetails.setting) parts.push(`Setting: ${promptDetails.setting}`);
       instructionToUse = parts.join('. ');
    }

    try {
      const result = await generateCinematicImage(
        sourceImage, 
        selectedFilter, 
        instructionToUse, 
        referenceImage
      );
      setGeneratedImage(result);
    } catch (err) {
      setError(text.errorGen);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = (format: 'png' | 'jpg') => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    const timestamp = Date.now();
    const filterName = FILTERS.find(f => f.id === selectedFilter)?.name.toLowerCase().replace(/\s/g, '-') || 'cinematic';
    const filename = `cinemagic-${filterName}-${timestamp}.${format}`;

    if (format === 'png') {
      link.href = generatedImage;
      link.download = filename;
      link.click();
    } else {
      // Convert PNG base64 to JPG using a temporary canvas
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Fill black background for JPG (no transparency)
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          
          const jpgUrl = canvas.toDataURL('image/jpeg', 0.95);
          link.href = jpgUrl;
          link.download = filename;
          link.click();
        }
      };
      img.src = generatedImage;
    }
  };

  return (
    <div className="min-h-screen bg-arri-black text-white font-sans selection:bg-arri-gold selection:text-black">
      {/* Header */}
      <header className="border-b border-gray-800 bg-arri-black/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 relative flex items-center justify-between">
          
          {/* Left: Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-arri-gold rounded flex items-center justify-center">
              <span className="font-serif font-bold text-2xl text-black">C</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
              <h1 className="text-xl font-bold tracking-tight">CineMagic <span className="text-arri-gold">AI</span></h1>
              <span className="text-[10px] text-gray-400 font-normal whitespace-nowrap">created by Jim B.</span>
            </div>
          </div>

          {/* Center: Language Switch */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
             <div className="bg-gray-800 p-1 rounded-full flex items-center shadow-inner">
               <button 
                 onClick={() => setLanguage('en')}
                 className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${language === 'en' ? 'bg-arri-gold text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
               >
                 ENG
               </button>
               <button 
                 onClick={() => setLanguage('es')}
                 className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${language === 'es' ? 'bg-arri-gold text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
               >
                 ESP
               </button>
             </div>
          </div>

          {/* Right: Info */}
          <div className="hidden md:block text-xs text-gray-500">
            {text.poweredBy}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Intro */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">
            {text.title}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg font-light">
            {text.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN: Controls & Input */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Step 1: Upload Source */}
            <section>
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full border border-arri-gold text-arri-gold flex items-center justify-center text-xs font-bold">1</span>
                    <h3 className="font-medium text-lg">{text.step1}</h3>
                 </div>
                 {sourceImage && (
                    <button onClick={handleReset} className="text-xs text-red-400 hover:text-red-300">{text.step1Reset}</button>
                 )}
              </div>
              
              {!sourceImage ? (
                <ImageUploader onImageSelected={setSourceImage} language={language} />
              ) : (
                <div className="relative group rounded-xl overflow-hidden border border-gray-700">
                  <img src={sourceImage} alt="Source" className="w-full h-64 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-center text-xs text-gray-300">
                    {text.step1Loaded}
                  </div>
                </div>
              )}
            </section>

            {/* Step 2: Director's Instructions */}
            {sourceImage && (
              <section className="animate-fade-in space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full border border-arri-gold text-arri-gold flex items-center justify-center text-xs font-bold">2</span>
                      <h3 className="font-medium text-lg">{text.step2}</h3>
                    </div>
                    <button 
                      onClick={handleEnhancePrompt}
                      disabled={isEnhancing}
                      className="text-xs bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white px-3 py-1.5 rounded-full flex items-center space-x-1 transition-all"
                    >
                      {isEnhancing ? (
                         <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                           <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                        </svg>
                      )}
                      <span>{text.enhanceBtn}</span>
                    </button>
                 </div>

                 {/* Structured Inputs */}
                 <div className="grid grid-cols-2 gap-3">
                   <div>
                     <label className="block text-[10px] text-gray-500 uppercase mb-1">{text.charLabel}</label>
                     <input 
                        type="text" 
                        value={promptDetails.character}
                        onChange={(e) => setPromptDetails({...promptDetails, character: e.target.value})}
                        className="w-full bg-arri-dark border border-gray-700 rounded-lg p-2.5 text-sm text-gray-200 focus:border-arri-gold focus:outline-none"
                        placeholder={text.charPlace}
                     />
                   </div>
                   <div>
                     <label className="block text-[10px] text-gray-500 uppercase mb-1">{text.clothLabel}</label>
                     <input 
                        type="text" 
                        value={promptDetails.clothing}
                        onChange={(e) => setPromptDetails({...promptDetails, clothing: e.target.value})}
                        className="w-full bg-arri-dark border border-gray-700 rounded-lg p-2.5 text-sm text-gray-200 focus:border-arri-gold focus:outline-none"
                        placeholder={text.clothPlace}
                     />
                   </div>
                   <div>
                     <label className="block text-[10px] text-gray-500 uppercase mb-1">{text.actLabel}</label>
                     <input 
                        type="text" 
                        value={promptDetails.action}
                        onChange={(e) => setPromptDetails({...promptDetails, action: e.target.value})}
                        className="w-full bg-arri-dark border border-gray-700 rounded-lg p-2.5 text-sm text-gray-200 focus:border-arri-gold focus:outline-none"
                        placeholder={text.actPlace}
                     />
                   </div>
                   <div>
                     <label className="block text-[10px] text-gray-500 uppercase mb-1">{text.setLabel}</label>
                     <input 
                        type="text" 
                        value={promptDetails.setting}
                        onChange={(e) => setPromptDetails({...promptDetails, setting: e.target.value})}
                        className="w-full bg-arri-dark border border-gray-700 rounded-lg p-2.5 text-sm text-gray-200 focus:border-arri-gold focus:outline-none"
                        placeholder={text.setPlace}
                     />
                   </div>
                 </div>

                 {/* Final Compiled Prompt */}
                 <div className="relative">
                    <label className="block text-[10px] text-arri-gold/70 uppercase mb-1">{text.finalPromptLabel}</label>
                    <textarea
                      value={finalPrompt}
                      onChange={(e) => setFinalPrompt(e.target.value)}
                      placeholder={text.finalPromptPlace}
                      className="w-full bg-black/40 border border-gray-800 rounded-xl p-3 text-sm text-gray-300 focus:outline-none focus:border-arri-gold h-24 resize-none"
                    />
                 </div>
              </section>
            )}

            {/* Step 3: Filter Selection */}
            {sourceImage && (
              <section className="animate-fade-in">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="w-6 h-6 rounded-full border border-arri-gold text-arri-gold flex items-center justify-center text-xs font-bold">3</span>
                  <h3 className="font-medium text-lg">{text.step3}</h3>
                </div>
                <FilterSelector selectedFilter={selectedFilter} onSelect={setSelectedFilter} language={language} />
              </section>
            )}

            {/* Conditional Step: Reference Image Upload */}
            {sourceImage && selectedFilter === CinematicFilter.CUSTOM_GRADIENT && (
               <section className="animate-fade-in bg-arri-gray/30 p-4 rounded-xl border border-dashed border-gray-600">
                  <div className="flex items-center space-x-2 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-arri-gold">
                       <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clipRule="evenodd" />
                    </svg>
                    <h3 className="font-medium text-sm text-gray-300">{text.stepRef}</h3>
                  </div>
                  
                  {!referenceImage ? (
                    <ImageUploader onImageSelected={setReferenceImage} language={language} />
                  ) : (
                    <div className="relative group rounded-lg overflow-hidden border border-gray-600">
                      <img src={referenceImage} alt="Reference" className="w-full h-32 object-cover" />
                      <button 
                        onClick={() => setReferenceImage(null)}
                        className="absolute top-2 right-2 bg-black/70 hover:bg-red-900/80 text-white p-1.5 rounded-full backdrop-blur-sm transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <p className="text-[10px] text-gray-500 mt-2 text-center">
                    {text.stepRefDesc}
                  </p>
               </section>
            )}

            {/* Step 4: Action */}
            {sourceImage && (
              <section className="pt-4 pb-12">
                <button
                  onClick={handleGenerate}
                  disabled={isProcessing}
                  className={`w-full py-4 rounded-xl font-bold tracking-widest uppercase transition-all duration-300 relative overflow-hidden group
                    ${isProcessing 
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                      : 'bg-arri-gold text-black hover:bg-white hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                    }
                  `}
                >
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>{text.btnProcessing}</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                        </svg>
                        <span>{text.btnGenerate}</span>
                      </>
                    )}
                  </span>
                </button>
                {error && (
                  <div className="mt-4 p-4 bg-red-900/30 border border-red-800 text-red-200 rounded text-sm text-center">
                    {error}
                  </div>
                )}
              </section>
            )}
          </div>

          {/* RIGHT COLUMN: Output */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <h3 className="font-medium text-lg uppercase tracking-wide">{text.monitorTitle}</h3>
            </div>

            <div className="flex-1 bg-black rounded-xl border border-gray-800 relative overflow-hidden flex items-center justify-center min-h-[400px] shadow-2xl">
              {/* Grid Overlay for cinematic feel */}
              <div className="absolute inset-0 pointer-events-none opacity-20 z-10" 
                style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '25% 25%'}}>
              </div>
              
              {/* Content */}
              {generatedImage ? (
                <div className="relative w-full h-full flex flex-col animate-fade-in">
                  <img src={generatedImage} alt="Generated Cinematic" className="w-full h-auto max-h-full object-contain shadow-2xl" />
                  
                  {/* Overlay Controls */}
                  <div className="absolute bottom-4 right-4 flex space-x-2 z-20">
                     <button 
                       onClick={() => downloadImage('png')}
                       className="bg-arri-gold text-black px-4 py-2 rounded font-bold text-xs hover:bg-white transition-colors shadow-lg flex items-center space-x-1"
                     >
                       <span>PNG</span>
                     </button>
                     <button 
                       onClick={() => downloadImage('jpg')}
                       className="bg-gray-800 text-white border border-gray-600 px-4 py-2 rounded font-bold text-xs hover:bg-gray-700 transition-colors shadow-lg flex items-center space-x-1"
                     >
                       <span>JPG</span>
                     </button>
                  </div>

                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-3 py-1 text-xs text-arri-gold border border-arri-gold/30 rounded uppercase tracking-widest">
                    {language === 'en' ? FILTERS.find(f => f.id === selectedFilter)?.name : FILTERS.find(f => f.id === selectedFilter)?.name_es} // ARRI RAW // x2 Upscale
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-600 p-10">
                  {isProcessing ? (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 border-4 border-arri-gray border-t-arri-gold rounded-full animate-spin"></div>
                      <p className="font-serif italic text-xl text-gray-400">{text.monitorProcessingQuote}</p>
                      <p className="text-xs uppercase tracking-widest text-arri-gold">{text.monitorProcessingSub}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor" className="w-24 h-24 mb-4 opacity-20">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 19.914 6 20.25v.75C6 21.596 5.496 22 4.875 22H3.375v-2.5ZM19.5 19.5h-1.5c-.621 0-1.125.404-1.125 1.125v.75c0 .621.504 1.125 1.125 1.125h1.5v-2.5ZM4.875 2H19.125C19.746 2 20.25 2.504 20.25 3.125v1.5c0 .621-.504 1.125-1.125 1.125h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a1.125 1.125 0 0 1 1.125-1.125h1.5V2Z" />
                         <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12c0 2.071-1.679 3.75-3.75 3.75a3.75 3.75 0 0 1-3.75-3.75c0-2.071 1.679-3.75 3.75-3.75 2.071 0 3.75 1.679 3.75 3.75Z" />
                         <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75a3.75 3.75 0 0 1-3.75-3.75V6h7.5v6a3.75 3.75 0 0 1-3.75 3.75Z" />
                       </svg>
                       <p className="uppercase tracking-widest text-sm">{text.monitorWaiting}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <ChatWidget language={language} />
    </div>
  );
}

export default App;
