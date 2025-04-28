import React, { useRef, useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useCharacter } from "@/context/CharacterContext";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { races, features, statAbbreviations } from "@/utils/characterUtils";
import { Download, ArrowLeft, Camera, Upload } from "lucide-react";
import html2canvas from "html2canvas";
import { StatName, Character, RaceName, FeatureName } from "@/types/character";
import { useToast } from "@/hooks/use-toast";

export default function ExportCharacter() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { characters, loadCharacter, updateCharacter, setPortraitImage: setContextPortraitImage } = useCharacter();
  const { character, totalStats } = useCharacter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadingPortrait, setUploadingPortrait] = useState<boolean>(false);
  const [portraitImage, setPortraitImage] = useState<string | null>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Find the character to export
  const id = parseInt(params.id);
  const characterToExport = characters.find(c => c.id === id);
  
  // Load portrait image if available
  useEffect(() => {
    if (characterToExport?.portraitImage) {
      setPortraitImage(characterToExport.portraitImage);
    }
  }, [characterToExport]);
  
  // If character is not found, go back to home
  if (!characterToExport) {
    return (
      <div className="bg-[#080A14] min-h-screen p-8 text-white flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold text-cyan-400 mb-4">Character Not Found</h1>
        <p className="text-cyan-200 mb-6">The character you're trying to export could not be found.</p>
        <Button 
          variant="outline" 
          className="border-cyan-500 text-cyan-400 hover:bg-cyan-900/30"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>
    );
  }
  
  // Handle portrait image upload
  const handlePortraitUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    setUploadingPortrait(true);
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      if (event.target?.result) {
        const imageDataUrl = event.target.result.toString();
        
        try {
          // Save the portrait to the character
          await updateCharacter(id, {
            name: characterToExport.name,
            level: characterToExport.level,
            race: characterToExport.race as RaceName | null,
            feature: characterToExport.feature as FeatureName | null,
            notes: characterToExport.notes,
            pointsAvailable: characterToExport.pointsAvailable,
            baseStats: characterToExport.baseStats,
            portraitImage: imageDataUrl
          });
          
          setPortraitImage(imageDataUrl);
          toast({
            title: "Portrait updated",
            description: "Your character portrait has been set",
            variant: "default"
          });
        } catch (error) {
          toast({
            title: "Failed to update portrait",
            description: "There was an error saving your portrait",
            variant: "destructive"
          });
          console.error('Error updating portrait:', error);
        } finally {
          setUploadingPortrait(false);
        }
      }
    };
    
    reader.onerror = () => {
      setUploadingPortrait(false);
      toast({
        title: "Failed to read file",
        description: "There was an error reading the image file",
        variant: "destructive"
      });
    };
    
    reader.readAsDataURL(file);
  };
  
  // Generate ID card image from current view
  const exportToImage = async () => {
    if (!exportRef.current) return;
    
    setLoading(true);
    
    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 3, // Higher scale for better quality
        backgroundColor: "#080A14",
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Create a temporary link element to download the image
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `neon-horizons-id-${character.name.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.click();
      
      toast({
        title: "ID Card exported",
        description: "Your character ID card has been downloaded",
        variant: "default"
      });
    } catch (error) {
      console.error('Failed to generate image:', error);
      toast({
        title: "Export failed",
        description: "Failed to generate the ID card image",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-[#080A14] min-h-screen p-4 md:p-8 text-white">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="ghost" 
            className="text-cyan-400 hover:bg-cyan-900/30"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handlePortraitUpload}
            />
            
            <Button 
              variant="outline" 
              className="border-cyan-500 text-cyan-400 hover:bg-cyan-900/30"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPortrait}
            >
              {uploadingPortrait ? (
                <span className="animate-pulse">Uploading...</span>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Set Portrait
                </>
              )}
            </Button>
            
            <Button 
              variant="default" 
              className="bg-cyan-600 hover:bg-cyan-500"
              onClick={exportToImage}
              disabled={loading}
            >
              {loading ? (
                <span className="animate-pulse">Generating...</span>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export ID Card
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* ID Card Export Template */}
        <div ref={exportRef} className="bg-gradient-to-r from-[#081420] to-[#0A1A2C] p-6 border border-cyan-900/60 rounded-lg shadow-lg max-w-md mx-auto">
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-cyan-400">NEON HORIZONS</h1>
            <p className="text-cyan-300/70 text-sm">IDENTIFICATION CARD</p>
          </div>
          
          <div className="flex gap-4 mb-4">
            <div className="flex-shrink-0">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-cyan-600 bg-black/40">
                {portraitImage ? (
                  <img 
                    src={portraitImage} 
                    alt={`${character.name} portrait`} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full bg-cyan-900/20 text-cyan-300/50">
                    <Camera size={24} />
                    <span className="text-xs mt-1">No Image</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-1 leading-tight">{character.name}</h2>
              <div className="flex flex-wrap gap-1 mb-2">
                {character.race && (
                  <Badge variant="secondary" className="bg-cyan-900/30 text-cyan-400 border border-cyan-700/50 text-xs">
                    {races[character.race]?.name || character.race}
                  </Badge>
                )}
                {character.feature && (
                  <Badge variant="secondary" className="bg-purple-900/30 text-purple-400 border border-purple-700/50 text-xs">
                    {features[character.feature]?.name || character.feature}
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-black/40 p-1 rounded border border-cyan-900/30 text-center">
                  <div className="text-xs text-cyan-300/70">LEVEL</div>
                  <div className="text-xl font-bold text-cyan-400">{character.level}</div>
                </div>
                <div className="bg-black/40 p-1 rounded border border-purple-900/30 text-center">
                  <div className="text-xs text-purple-300/70">ID</div>
                  <div className="text-xl font-bold text-purple-400">#{id.toString().padStart(4, '0')}</div>
                </div>
              </div>
            </div>
          </div>
          
          <Separator className="bg-cyan-900/50 my-3" />
          
          {/* Stats Section */}
          <div className="mb-3">
            <h3 className="text-sm font-bold text-cyan-400 mb-2">ATTRIBUTES</h3>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(totalStats).slice(0, 8).map(([stat, value]) => (
                <div key={stat} className="bg-black/40 border border-cyan-900/30 p-1 rounded text-center">
                  <div className="text-xs text-cyan-300/70">{statAbbreviations[stat as StatName]}</div>
                  <div className="text-lg font-bold text-white">{value}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Encoded Data Block (decorative) */}
          <div className="bg-black/50 border border-cyan-900/40 p-2 rounded text-xs font-mono text-cyan-500/80 mb-3">
            <div>AUTH: {user?.username?.toUpperCase() || 'UNKNOWN'}</div>
            <div>ISSUED: {new Date().toLocaleDateString()}</div>
            <div>SIG: {Array.from({length: 8}, () => 
              Math.floor(Math.random() * 16).toString(16)
            ).join('').toUpperCase()}</div>
          </div>
          
          {/* Barcode/QR-like Effect */}
          <div className="flex justify-center mb-2">
            <div className="h-8 w-48 bg-gradient-to-r from-cyan-900/80 to-purple-900/80 rounded-sm flex items-center justify-center overflow-hidden">
              {Array.from({length: 15}).map((_, i) => (
                <div key={i} className="h-full w-1 bg-black/60 mx-px" style={{
                  opacity: Math.random() > 0.5 ? 0.8 : 0.2,
                  height: `${70 + Math.random() * 30}%`
                }}></div>
              ))}
            </div>
          </div>
          
          <div className="text-center text-xs text-cyan-500/60">
            NEON HORIZONS SECURITY CLEARANCE
          </div>
        </div>
        
        <div className="mt-6 text-center text-sm text-cyan-400/70">
          Upload a character portrait and click "Export ID Card" to download your character's identification card as an image.
        </div>
      </div>
    </div>
  );
}