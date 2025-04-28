import React, { useRef, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useCharacter } from "@/context/CharacterContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { races, features, statAbbreviations } from "@/utils/characterUtils";
import { Download, ArrowLeft } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { StatName } from "@/types/character";

export default function ExportCharacter() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { characters, loadCharacter } = useCharacter();
  const { character, totalStats } = useCharacter();
  const [loading, setLoading] = useState<boolean>(false);
  const exportRef = useRef<HTMLDivElement>(null);
  
  // Find the character to export
  const id = parseInt(params.id);
  const characterToExport = characters.find(c => c.id === id);
  
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
  
  // Generate PDF from current view
  const exportToPDF = async () => {
    if (!exportRef.current) return;
    
    setLoading(true);
    
    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 2, // Higher scale for better quality
        backgroundColor: "#080A14",
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate PDF dimensions to maintain aspect ratio
      const imgWidth = 210; // A4 width in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      const pdf = new jsPDF({
        orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
        unit: 'mm'
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`neon-horizons-${character.name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
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
          
          <Button 
            variant="default" 
            className="bg-cyan-600 hover:bg-cyan-500"
            onClick={exportToPDF}
            disabled={loading}
          >
            {loading ? (
              <span className="animate-pulse">Generating PDF...</span>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export to PDF
              </>
            )}
          </Button>
        </div>
        
        {/* PDF Export Template */}
        <div ref={exportRef} className="bg-[#080A14] p-6 border border-cyan-900/50 rounded-lg">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-cyan-400">NEON HORIZONS</h1>
            <p className="text-cyan-300/70">CHARACTER SHEET</p>
          </div>
          
          <div className="mb-6">
            <div className="flex flex-wrap gap-4 justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{character.name}</h2>
                <div className="flex gap-2 mt-2">
                  {character.race && (
                    <Badge variant="secondary" className="bg-cyan-900/30 text-cyan-400 border border-cyan-700/50">
                      {races[character.race]?.name || character.race}
                    </Badge>
                  )}
                  {character.feature && (
                    <Badge variant="secondary" className="bg-purple-900/30 text-purple-400 border border-purple-700/50">
                      {features[character.feature]?.name || character.feature}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-cyan-300/70">LEVEL</div>
                <div className="text-3xl font-bold text-cyan-400">{character.level}</div>
              </div>
            </div>
          </div>
          
          <Separator className="bg-cyan-900/50 my-6" />
          
          {/* Stats Section */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-cyan-400 mb-4">STATS</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(totalStats).map(([stat, value]) => (
                <Card key={stat} className="bg-black/40 border-cyan-900/30 p-3 flex flex-col items-center">
                  <div className="text-xs text-cyan-300/70 mb-1">{stat.toUpperCase()}</div>
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="text-xs text-cyan-500">{statAbbreviations[stat as StatName]}</div>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Race & Feature Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {character.race && (
              <div>
                <h3 className="text-lg font-bold text-cyan-400 mb-2">SPECIES: {races[character.race]?.name}</h3>
                <Card className="bg-black/40 border-cyan-900/30 p-4">
                  <p className="text-cyan-100/90">{races[character.race]?.description}</p>
                  <div className="mt-3 pt-3 border-t border-cyan-900/30">
                    <span className="text-xs text-cyan-300/70">SPECIES BONUSES</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {races[character.race]?.bonuses && Object.entries(races[character.race]?.bonuses || {}).map(([stat, bonus]) => (
                        <Badge key={stat} className="bg-cyan-900/20 border border-cyan-800">
                          {stat.toUpperCase()} +{bonus}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            )}
            
            {character.feature && (
              <div>
                <h3 className="text-lg font-bold text-purple-400 mb-2">FEATURE: {features[character.feature]?.name}</h3>
                <Card className="bg-black/40 border-purple-900/30 p-4">
                  <p className="text-purple-100/90">{features[character.feature]?.description}</p>
                  <div className="mt-3 pt-3 border-t border-purple-900/30">
                    <span className="text-xs text-purple-300/70">FEATURE BONUSES</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {features[character.feature]?.bonuses && Object.entries(features[character.feature]?.bonuses || {}).map(([stat, bonus]) => (
                        <Badge key={stat} className="bg-purple-900/20 border border-purple-800">
                          {stat.toUpperCase()} +{bonus}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
          
          {/* Notes Section */}
          {character.notes && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-cyan-400 mb-2">NOTES</h3>
              <Card className="bg-black/40 border-cyan-900/30 p-4">
                <p className="text-cyan-100/90 whitespace-pre-wrap">{character.notes}</p>
              </Card>
            </div>
          )}
          
          <div className="mt-8 text-center text-xs text-cyan-500/50">
            Generated with Neon Horizons Character Creator • {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}