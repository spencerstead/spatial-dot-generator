import { useState, useRef } from 'react';
import { StippleCanvas, StippleCanvasRef } from './components/StippleCanvas';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Label } from './components/ui/label';
import { Slider } from './components/ui/slider';
import { Checkbox } from './components/ui/checkbox';
import { Upload, Download, Copy } from 'lucide-react';
import { toast, Toaster } from 'sonner@2.0.3';

export default function App() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [density, setDensity] = useState(5);
  const [dotSize, setDotSize] = useState(1.2);
  const [threshold, setThreshold] = useState(50);
  const [randomness, setRandomness] = useState(1);
  const [invert, setInvert] = useState(false);
  // Levels adjustments
  const [blacks, setBlacks] = useState(0);
  const [mids, setMids] = useState(0.5);
  const [highlights, setHighlights] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stippleCanvasRef = useRef<StippleCanvasRef>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadSVG = () => {
    stippleCanvasRef.current?.downloadSVG();
  };

  const handleCopySVG = async () => {
    try {
      await stippleCanvasRef.current?.copySVG();
      toast.success('SVG code copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy SVG code');
      console.error(error);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1>Spatial Dot Scene Creator</h1>
          <p className="text-muted-foreground">
            Transform images into spatial vector dot scenes for brand application.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_350px] gap-8">
          {/* Canvas Area */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  Your stippled image will appear here
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center min-h-[400px]">
                {image ? (
                  <StippleCanvas
                    ref={stippleCanvasRef}
                    image={image}
                    density={density}
                    dotSize={dotSize}
                    threshold={threshold}
                    randomness={randomness}
                    invert={invert}
                    blacks={blacks}
                    mids={mids}
                    highlights={highlights}
                  />
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center">
                      <Upload className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        Upload an image to get started
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {image && (
              <div className="space-y-2">
                <Button onClick={handleDownloadSVG} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download SVG
                </Button>
                <Button onClick={handleCopySVG} variant="outline" className="w-full">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy SVG Code
                </Button>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload Image</CardTitle>
                <CardDescription>
                  Choose an image to convert to stipple art
                </CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Image
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Levels Adjustment</CardTitle>
                <CardDescription>
                  Fine-tune the tonal range of your image
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Blacks</Label>
                    <span className="text-muted-foreground">{blacks.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[blacks]}
                    onValueChange={(value) => setBlacks(value[0])}
                    min={0}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                  <p className="text-muted-foreground">
                    Adjust the darkest tones
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Midtones</Label>
                    <span className="text-muted-foreground">{mids.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[mids]}
                    onValueChange={(value) => setMids(value[0])}
                    min={0}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                  <p className="text-muted-foreground">
                    Adjust the middle tones
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Highlights</Label>
                    <span className="text-muted-foreground">{highlights.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[highlights]}
                    onValueChange={(value) => setHighlights(value[0])}
                    min={0}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                  <p className="text-muted-foreground">
                    Adjust the brightest tones
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stipple Settings</CardTitle>
                <CardDescription>
                  Adjust the density and appearance of the stipple effect
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Density</Label>
                    <span className="text-muted-foreground">{density.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[density]}
                    onValueChange={(value) => setDensity(value[0])}
                    min={1}
                    max={10}
                    step={0.5}
                    className="w-full"
                  />
                  <p className="text-muted-foreground">
                    Higher density creates more dots
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Dot Size</Label>
                    <span className="text-muted-foreground">{dotSize.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[dotSize]}
                    onValueChange={(value) => setDotSize(value[0])}
                    min={0.5}
                    max={3}
                    step={0.1}
                    className="w-full"
                  />
                  <p className="text-muted-foreground">
                    Size of individual stipple dots
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Threshold</Label>
                    <span className="text-muted-foreground">{threshold}</span>
                  </div>
                  <Slider
                    value={[threshold]}
                    onValueChange={(value) => setThreshold(value[0])}
                    min={0}
                    max={150}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-muted-foreground">
                    Minimum darkness level for placing dots
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Randomness</Label>
                    <span className="text-muted-foreground">{randomness.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[randomness]}
                    onValueChange={(value) => setRandomness(value[0])}
                    min={0}
                    max={1}
                    step={0.05}
                    className="w-full"
                  />
                  <p className="text-muted-foreground">
                    Control position randomness of dots
                  </p>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="invert"
                    checked={invert}
                    onCheckedChange={(checked) => setInvert(checked as boolean)}
                  />
                  <Label htmlFor="invert" className="cursor-pointer">
                    Invert image (light areas get more dots)
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}