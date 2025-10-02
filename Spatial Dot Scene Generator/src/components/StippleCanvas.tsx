import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

interface StippleCanvasProps {
  image: HTMLImageElement | null;
  density: number;
  dotSize: number;
  threshold: number;
  randomness: number;
  invert: boolean;
  blacks: number;
  mids: number;
  highlights: number;
}

export interface StippleCanvasRef {
  downloadSVG: () => void;
  copySVG: () => Promise<string>;
}

interface Dot {
  x: number;
  y: number;
  size: number;
}

export const StippleCanvas = forwardRef<StippleCanvasRef, StippleCanvasProps>(
  ({ image, density, dotSize, threshold, randomness, invert, blacks, mids, highlights }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dotsRef = useRef<Dot[]>([]);
    const dimensionsRef = useRef({ width: 0, height: 0 });

  const generateSVG = (): string => {
    const dots = dotsRef.current;
    const { width, height } = dimensionsRef.current;

    const bgColor = invert ? 'black' : 'white';
    const dotColor = invert ? 'white' : 'black';

    let svg = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    svg += `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">\n`;
    svg += `  <rect width="${width}" height="${height}" fill="${bgColor}"/>\n`;
    
    for (const dot of dots) {
      svg += `  <circle cx="${dot.x.toFixed(2)}" cy="${dot.y.toFixed(2)}" r="${dot.size.toFixed(2)}" fill="${dotColor}"/>\n`;
    }
    
    svg += `</svg>`;
    
    return svg;
  };

  useImperativeHandle(ref, () => ({
    downloadSVG: () => {
      const dots = dotsRef.current;
      const { width, height } = dimensionsRef.current;
      
      if (dots.length === 0) {
        console.error('No dots to export');
        return;
      }
      
      if (!width || !height) {
        console.error('Invalid dimensions');
        return;
      }

      const svg = generateSVG();
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'stippled-image.svg';
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    },
    copySVG: async () => {
      const dots = dotsRef.current;
      const { width, height } = dimensionsRef.current;
      
      if (dots.length === 0) {
        throw new Error('No dots to export');
      }
      
      if (!width || !height) {
        throw new Error('Invalid dimensions');
      }

      const svg = generateSVG();
      await navigator.clipboard.writeText(svg);
      return svg;
    },
  }));

  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match image
    const maxWidth = 800;
    const maxHeight = 600;
    let width = image.width;
    let height = image.height;

    // Scale down if image is too large
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width *= ratio;
      height *= ratio;
    }

    canvas.width = width;
    canvas.height = height;
    dimensionsRef.current = { width, height };

    // Fill with background color based on invert setting
    ctx.fillStyle = invert ? 'black' : 'white';
    ctx.fillRect(0, 0, width, height);

    // Draw image to get pixel data
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.drawImage(image, 0, 0, width, height);
    const imageData = tempCtx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    // Calculate grid spacing based on density
    const spacing = Math.max(1, Math.floor(20 / density));

    // Helper function to apply levels adjustment
    const applyLevels = (value: number): number => {
      // Normalize to 0-1 range
      let normalized = value / 255;
      
      // Apply black and highlight clipping
      normalized = (normalized - blacks) / (highlights - blacks);
      normalized = Math.max(0, Math.min(1, normalized));
      
      // Apply midtone adjustment using gamma correction
      // mids at 0.5 means no change, < 0.5 darkens, > 0.5 lightens
      const gamma = Math.log(0.5) / Math.log(mids);
      normalized = Math.pow(normalized, gamma);
      
      // Convert back to 0-255 range
      return normalized * 255;
    };

    // Create stipple effect
    ctx.fillStyle = invert ? 'white' : 'black';
    
    // Clear dots array
    const dots: Dot[] = [];

    for (let y = 0; y < height; y += spacing) {
      for (let x = 0; x < width; x += spacing) {
        // Get pixel color
        const index = (y * width + x) * 4;
        const r = pixels[index];
        const g = pixels[index + 1];
        const b = pixels[index + 2];

        // Convert to grayscale
        let brightness = (r + g + b) / 3;
        
        // Apply levels adjustment
        brightness = applyLevels(brightness);
        
        // Apply invert: if inverted, lighter areas get more dots
        const targetValue = invert ? brightness : 255 - brightness;

        // Add randomness with threshold
        const random = Math.random() * 255;
        
        // Draw dot if condition is met
        if (targetValue > threshold && random < targetValue) {
          // Add position jitter based on randomness parameter
          // Higher randomness = more jitter
          const jitterAmount = spacing * randomness;
          const jitterX = (Math.random() - 0.5) * jitterAmount;
          const jitterY = (Math.random() - 0.5) * jitterAmount;
          
          const dotX = x + jitterX;
          const dotY = y + jitterY;
          
          ctx.beginPath();
          ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
          ctx.fill();
          
          // Store dot for SVG generation
          dots.push({ x: dotX, y: dotY, size: dotSize });
        }
      }
    }
    
    dotsRef.current = dots;
  }, [image, density, dotSize, threshold, randomness, invert, blacks, mids, highlights]);

    return (
      <canvas
        ref={canvasRef}
        className="border border-border rounded-lg max-w-full h-auto"
      />
    );
  }
);

StippleCanvas.displayName = 'StippleCanvas';