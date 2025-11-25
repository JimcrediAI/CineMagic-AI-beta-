
export enum CinematicFilter {
  SCI_FI_NEON = 'SCI_FI_NEON',
  DESERT_EPIC = 'DESERT_EPIC',
  SPACE_OPERA = 'SPACE_OPERA',
  DYSTOPIAN_MATRIX = 'DYSTOPIAN_MATRIX',
  POST_APOCALYPTIC = 'POST_APOCALYPTIC',
  CUSTOM_GRADIENT = 'CUSTOM_GRADIENT',
}

export interface FilterDefinition {
  id: CinematicFilter;
  name: string;
  name_es: string;
  description: string;
  description_es: string;
  promptModifier: string;
  colorFrom: string;
  colorTo: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const FILTERS: FilterDefinition[] = [
  {
    id: CinematicFilter.SCI_FI_NEON,
    name: 'Neon Noir',
    name_es: 'Neón Noir',
    description: 'Tech-Noir aesthetic. Emulates Kodak Vision3 500T film stock with high contrast, anamorphic lens flares, and wet-street reflections. Cyan/Magenta split toning.',
    description_es: 'Estética Tech-Noir. Emula película Kodak Vision3 500T con alto contraste, destellos anamórficos y reflejos en calles mojadas. Tonos Cian/Magenta.',
    promptModifier: 'cinematic lighting, neon noir style, cyberpunk aesthetic, rainy night, vibrant neon blue and pink lights, wet surfaces reflecting light, dramatic shadows, high contrast, 8k resolution, ARRI Alexa Mini LF, Cooke Anamorphic /i lenses, ISO 800 grain structure.',
    colorFrom: 'from-blue-600',
    colorTo: 'to-purple-600',
  },
  {
    id: CinematicFilter.DESERT_EPIC,
    name: 'Dune Sands',
    name_es: 'Arenas de Duna',
    description: 'Large format epic. Features desaturated bleach bypass look, warm golden hour highlights, and atmospheric volumetric dust. Mimics ARRI Rental Alfie lenses.',
    description_es: 'Épica de gran formato. Aspecto desaturado "bleach bypass", luces cálidas de hora dorada y polvo volumétrico atmosférico. Lentes ARRI Rental Alfie.',
    promptModifier: 'epic wide shot, desert planet aesthetic, golden hour lighting, floating dust particles, vast scale, muted earth tones, cinematic composition, Denis Villeneuve style, IMAX quality, sharp details, warm color temperature 5600K, low saturation shadows.',
    colorFrom: 'from-orange-500',
    colorTo: 'to-yellow-600',
  },
  {
    id: CinematicFilter.SPACE_OPERA,
    name: 'Interstellar',
    name_es: 'Interestelar',
    description: 'Deep space realism. Pure black levels (0 IRE), harsh point-source lighting, and 65mm IMAX film resolution. Cold, clinical color temperature.',
    description_es: 'Realismo de espacio profundo. Niveles de negro puro (0 IRE), iluminación dura de punto único y resolución IMAX de 65mm. Temperatura fría y clínica.',
    promptModifier: 'outer space backdrop, realistic sci-fi technology, deep blacks, bright stark starlight, lens flares, anamorphic lens format, Christopher Nolan style, photorealistic, 8k, highly detailed textures, hard lighting, high dynamic range.',
    colorFrom: 'from-slate-800',
    colorTo: 'to-indigo-900',
  },
  {
    id: CinematicFilter.DYSTOPIAN_MATRIX,
    name: 'System Code',
    name_es: 'Código Sistema',
    description: 'Cyber-industrial. Heavy green tint in mid-tones, crushed blacks, and digital noise artifacts. 360-degree shutter angle look.',
    description_es: 'Ciber-industrial. Fuerte tinte verde en medios tonos, negros empastados y artefactos digitales. Aspecto de obturador de 360 grados.',
    promptModifier: 'Matrix aesthetic, green color grading, digital rain atmosphere, gritty urban environment, sleek black leather textures, sharp focus, 35mm film grain, Wachowski style, action movie lighting, fluorescent green bias, high contrast monochrome with tint.',
    colorFrom: 'from-green-700',
    colorTo: 'to-emerald-900',
  },
  {
    id: CinematicFilter.POST_APOCALYPTIC,
    name: 'Wasteland',
    name_es: 'Tierra Baldía',
    description: 'High-octane action. "Blockbuster" Orange & Teal separation. High saturation, high shutter speed look, gritty texture overlay.',
    description_es: 'Acción de alto octanaje. Separación "Blockbuster" Naranja y Turquesa. Alta saturación, aspecto de obturación rápida y texturas rugosas.',
    promptModifier: 'Mad Max Fury Road style, high saturation, rusty metal, orange and teal color grading, rugged textures, intense sunlight, desert wasteland, chaotic energy, dynamic angle, award-winning cinematography, overexposed highlights.',
    colorFrom: 'from-red-700',
    colorTo: 'to-orange-800',
  },
  {
    id: CinematicFilter.CUSTOM_GRADIENT,
    name: 'Reference Match',
    name_es: 'Referencia',
    description: 'Upload a reference image (grade, gradient, or still). The AI will analyze the histogram and apply that specific color palette to your image.',
    description_es: 'Sube una imagen de referencia (gradiente o fotograma). La IA analizará y aplicará esa paleta de colores específica a tu imagen.',
    promptModifier: 'Match the color grading, lighting temperature, and mood of the provided reference image perfectly. Apply the reference color palette to the scene.',
    colorFrom: 'from-gray-700',
    colorTo: 'to-gray-900',
  },
];
