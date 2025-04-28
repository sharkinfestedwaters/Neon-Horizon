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
import { Trash2, Edit, Plus, Download, Share2, MoreHorizontal, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Character } from "@shared/schema";

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
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // Initialize WebSocket connection for real-time character sharing
  useEffect(() => {
    // Only initialize WebSocket if the user is logged in
    if (!user) return;
    
    // Connection management variables
    let socket: WebSocket | null = null;
    let reconnectAttempts = 0;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    const MAX_RECONNECT_ATTEMPTS = 5;
    
    // Create WebSocket connection function
    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        socket = new WebSocket(wsUrl);
        
        socket.addEventListener('open', () => {
          reconnectAttempts = 0; // Reset reconnect attempts on successful connection
          setWsConnection(socket);
        });
        
        // Define WebSocket received message interface
        interface WebSocketReceivedMessage {
          type: string;
          sharedBy?: string;
          character?: Character;
          message?: string;
          details?: any;
          users?: string[];
          action?: 'join' | 'leave';
          username?: string;
        }
        
        socket.addEventListener('message', (event) => {
          try {
            const data = JSON.parse(event.data) as WebSocketReceivedMessage;
            
            switch (data.type) {
              case 'shared-character':
                if (data.sharedBy && data.character) {
                  toast({
                    title: "Character Shared",
                    description: `${data.sharedBy} shared character "${data.character.name}"`,
                  });
                  
                  // You could potentially add UI to import the shared character
                  // or auto-import it to the user's collection
                }
                break;
                
              case 'connection-established':
                console.log('WebSocket service message:', data.message);
                
                // Register user with the WebSocket server
                if (user?.username && socket) {
                  socket.send(JSON.stringify({
                    type: 'register-user',
                    username: user.username
                  }));
                }
                break;
                
              case 'register-confirmed':
                console.log('Registration confirmed:', data.message);
                break;
                
              case 'online-users':
                if (data.users) {
                  setOnlineUsers(data.users);
                }
                break;
                
              case 'user-status':
                if (data.action && data.username) {
                  // Handle user joining or leaving
                  if (data.action === 'join') {
                    toast({
                      title: "User Joined",
                      description: `${data.username} is now online`,
                      variant: "default",
                    });
                  } else if (data.action === 'leave') {
                    toast({
                      title: "User Left",
                      description: `${data.username} has gone offline`,
                      variant: "default",
                    });
                  }
                }
                break;
                
              case 'share-confirmed':
                // Optional: show a more detailed confirmation if needed
                console.log('Share confirmed:', data.message);
                break;
                
              case 'error':
                console.error('WebSocket error from server:', data.message, data.details);
                toast({
                  title: "Sharing Error",
                  description: data.message || "Error occurred while sharing",
                  variant: "destructive",
                });
                break;
                
              default:
                console.log('Unknown message type received:', data.type);
            }
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        });
        
        socket.addEventListener('close', (event) => {
          setWsConnection(null);
          
          // Only attempt to reconnect if not a normal closure and user is still logged in
          if (event.code !== 1000 && user) {
            handleReconnect();
          }
        });
        
        socket.addEventListener('error', () => {
          // Error handling is done in the close event
          if (socket) socket.close();
        });
      } catch (error) {
        console.error('Error initializing WebSocket:', error);
        handleReconnect();
      }
    };
    
    // Handle reconnection with exponential backoff
    const handleReconnect = () => {
      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        toast({
          title: "Connection Error",
          description: "Unable to connect to sharing service after multiple attempts",
          variant: "destructive",
        });
        return;
      }
      
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      
      const delay = Math.min(1000 * (2 ** reconnectAttempts), 30000); // Exponential backoff with max 30s
      reconnectAttempts++;
      
      reconnectTimeout = setTimeout(connectWebSocket, delay);
    };
    
    // Initial connection
    connectWebSocket();
    
    // Cleanup function
    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        socket.close(1000, "Component unmounting");
      }
    };
  }, [toast, user]);

  // Function to export character as PDF
  const exportCharacter = (characterId: number) => {
    navigate(`/export-character/${characterId}`);
  };

  // Define an interface for WebSocket messages
  interface WebSocketShareMessage {
    type: 'share-character';
    character: Character;
    username: string | undefined;
  }
  
  // Function to share character via WebSocket
  const shareCharacter = (character: Character) => {
    if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to the sharing service. Please try again later.",
        variant: "destructive",
      });
      return;
    }
    
    const message: WebSocketShareMessage = {
      type: 'share-character',
      character,
      username: user?.username
    };
    
    wsConnection.send(JSON.stringify(message));
    
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
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Skeleton className="h-5 w-36 bg-cyan-900/30" />
                  <Skeleton className="h-4 w-24 bg-cyan-900/20 mt-1" />
                </div>
                <div className="flex flex-col items-end">
                  <Skeleton className="h-5 w-16 bg-cyan-900/30 mb-2" />
                  <Skeleton className="h-12 w-12 rounded-full bg-cyan-900/20" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <Skeleton className="h-4 w-full bg-cyan-900/20" />
              <Skeleton className="h-3 w-32 bg-cyan-900/10 mt-2" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-8 w-16 mr-2 bg-cyan-900/30" />
              <div className="flex space-x-1">
                <Skeleton className="h-8 w-16 bg-cyan-900/30" />
                <Skeleton className="h-8 w-16 bg-cyan-900/30" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">Your Characters</h2>
          {onlineUsers.length > 0 && (
            <div className="text-sm text-cyan-500 flex items-center mt-1">
              <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
              <span>{onlineUsers.length} user{onlineUsers.length !== 1 ? 's' : ''} online</span>
              <div className="ml-2 relative group">
                <span className="cursor-help text-cyan-400">(view)</span>
                <div className="absolute left-0 top-full hidden group-hover:block z-10 bg-black/90 border border-cyan-900 rounded p-2 min-w-48 shadow-lg">
                  <p className="text-xs text-cyan-400 mb-1 font-semibold">Online Users:</p>
                  <ul className="text-xs">
                    {onlineUsers.map((username, index) => (
                      <li key={index} className="text-cyan-300">
                        {username === user?.username ? `${username} (you)` : username}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
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
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-cyan-400">{character.name}</CardTitle>
                  <CardDescription>
                    {character.race ? races[character.race as keyof typeof races]?.name : 'No Species'} 
                    {character.feature ? ' • ' + character.feature.replace('-', ' ') : ''}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end">
                  <Badge variant="outline" className="text-cyan-300 border-cyan-700 bg-cyan-950/50 mb-2">
                    Level {character.level}
                  </Badge>
                  
                  {/* Character Portrait */}
                  <div className="w-12 h-12 rounded-full bg-cyan-900/20 flex items-center justify-center border border-cyan-800/40 overflow-hidden">
                    {character.portraitImage ? (
                      <img 
                        src={character.portraitImage} 
                        alt={`${character.name} portrait`} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full w-full">
                        <Camera size={16} className="text-cyan-500/70" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
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