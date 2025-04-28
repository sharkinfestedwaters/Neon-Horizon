import React from "react";
import CharacterSheet from "@/components/CharacterSheet";
import CharacterList from "@/components/CharacterList";
import Notification from "@/components/Notification";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, UserCircle, ChevronDown } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function Home() {
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <div className="bg-[#080A14] min-h-screen grid-bg text-white font-sans relative">
      <div className="container mx-auto py-8 px-4">
        <header className="mb-6 relative">
          <div className="absolute right-0 top-0 flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/30 flex items-center gap-1"
                >
                  <UserCircle className="h-4 w-4" />
                  <span className="hidden md:inline">Profile</span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 bg-black/90 border-cyan-900">
                <DropdownMenuLabel className="text-cyan-300">
                  <span className="font-normal">Signed in as</span>
                  <div className="font-medium truncate">{user?.username}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-cyan-900/30" />
                <DropdownMenuItem 
                  className="text-red-400 hover:text-red-300 focus:bg-red-900/30 cursor-pointer"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-cyan-400 tracking-tight">Neon Horizons</h1>
            <p className="text-cyan-300/70">Character Creator</p>
          </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <CharacterList />
          </div>
          <div className="lg:col-span-2">
            <CharacterSheet />
          </div>
        </div>
      </div>
      <Notification />
    </div>
  );
}
