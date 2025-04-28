import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useCharacter } from "@/context/CharacterContext";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { races } from "@/utils/characterUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2, Edit, Plus, Download, Share2, MoreHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CharacterList() {
  const { 
    characters, 
    isLoading, 
    loadCharacter, 
    deleteCharacter, 
    resetCharacter,
    activeCharacterId 
  } = useCharacter();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);

  // Initialize WebSocket connection for real-time character sharing
  useEffect(() => {
    // Only initialize WebSocket if the user is logged in
    if (!user) return;
    
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const socket = new WebSocket(wsUrl);
      
      socket.addEventListener('open', () => {
        console.log('WebSocket connection established');
        setWsConnection(socket);
      });
      
      socket.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'shared-character') {
            toast({
              title: "Character Shared",
              description: `${data.sharedBy} shared character "${data.character.name}"`,
            });
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      });
      
      socket.addEventListener('close', () => {
        console.log('WebSocket connection closed');
        setWsConnection(null);
      });
      
      socket.addEventListener('error', (error) => {
        console.error('WebSocket error:', error);
      });
      
      return () => {
        if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
          socket.close();
        }
      };
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
    }
  }, [toast, user]);

  // Function to export character as PDF
  const exportCharacter = (characterId: number) => {
    navigate(`/export-character/${characterId}`);
  };

  // Function to share character via WebSocket
  const shareCharacter = (character: any) => {
    if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to the sharing service. Please try again later.",
        variant: "destructive",
      });
      return;
    }
    
    wsConnection.send(JSON.stringify({
      type: 'share-character',
      character,
      username: user?.username
    }));
    
    toast({
      title: "Character Shared",
      description: `You shared "${character.name}" with other online users`,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center mb-4">Your Characters</h2>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-black/20 border-cyan-800/50">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-36 bg-cyan-900/30" />
              <Skeleton className="h-4 w-24 bg-cyan-900/20" />
            </CardHeader>
            <CardContent className="pb-2">
              <Skeleton className="h-4 w-full bg-cyan-900/20" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-8 w-16 mr-2 bg-cyan-900/30" />
              <Skeleton className="h-8 w-16 bg-cyan-900/30" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Your Characters</h2>
        <Button 
          variant="outline" 
          className="bg-cyan-900/20 border-cyan-500/50 hover:bg-cyan-900/40 text-cyan-300"
          onClick={resetCharacter}
        >
          <Plus className="mr-1 h-4 w-4" /> New Character
        </Button>
      </div>

      {characters.length === 0 ? (
        <Card className="bg-black/20 border-cyan-800/50">
          <CardHeader>
            <CardTitle className="text-cyan-400">No Characters Yet</CardTitle>
            <CardDescription>Create your first character to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-cyan-300/70">
              Fill out the character details, choose a species and features, and save your character.
            </p>
          </CardContent>
        </Card>
      ) : (
        characters.map((character) => (
          <Card 
            key={character.id} 
            className={`
              bg-black/20 border-cyan-800/50 
              ${activeCharacterId === character.id ? 'ring-1 ring-cyan-400' : ''}
              hover:bg-black/30 transition-colors
            `}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle className="text-cyan-400">{character.name}</CardTitle>
                <Badge variant="outline" className="text-cyan-300 border-cyan-700 bg-cyan-950/50">
                  Level {character.level}
                </Badge>
              </div>
              <CardDescription>
                {character.race ? races[character.race as keyof typeof races]?.name : 'No Species'} 
                {character.feature ? ' • ' + character.feature.replace('-', ' ') : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-cyan-300/70 line-clamp-1">
                {character.notes || 'No notes added'}
              </p>
              <p className="text-xs text-cyan-500/50 mt-1">
                Last updated: {new Date(character.updatedAt).toLocaleDateString()}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-cyan-300 hover:text-cyan-100 hover:bg-cyan-900/30 mr-2"
                  onClick={() => loadCharacter(character.id)}
                >
                  <Edit className="mr-1 h-4 w-4" />
                  {activeCharacterId === character.id ? 'Editing' : 'Edit'}
                </Button>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/30"
                  onClick={() => exportCharacter(character.id)}
                >
                  <Download className="mr-1 h-4 w-4" />
                  PDF
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/30"
                  onClick={() => shareCharacter(character)}
                >
                  <Share2 className="mr-1 h-4 w-4" />
                  Share
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-gray-300 hover:bg-gray-900/30"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-black/90 border-cyan-900">
                    <DropdownMenuItem 
                      className="text-red-400 hover:text-red-300 focus:bg-red-900/30 cursor-pointer"
                      onClick={() => deleteCharacter(character.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );
}