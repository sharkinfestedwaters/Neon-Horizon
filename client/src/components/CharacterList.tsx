import React from "react";
import { useCharacter } from "@/context/CharacterContext";
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
import { Trash2, Edit, Plus } from "lucide-react";

export default function CharacterList() {
  const { 
    characters, 
    isLoading, 
    loadCharacter, 
    deleteCharacter, 
    resetCharacter,
    activeCharacterId 
  } = useCharacter();

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
            <CardFooter>
              <Button
                variant="ghost"
                size="sm"
                className="text-cyan-300 hover:text-cyan-100 hover:bg-cyan-900/30 mr-2"
                onClick={() => loadCharacter(character.id)}
              >
                <Edit className="mr-1 h-4 w-4" />
                {activeCharacterId === character.id ? 'Editing' : 'Edit'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
                onClick={() => deleteCharacter(character.id)}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );
}