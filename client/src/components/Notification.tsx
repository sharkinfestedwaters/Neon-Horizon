import React, { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function Notification() {
  return (
    <>
      <Toaster />
      <style jsx global>{`
        .neo-border {
          border: 1px solid rgba(0, 229, 255, 0.3);
          box-shadow: 0 0 10px rgba(0, 163, 255, 0.2);
        }
        .neo-border:hover {
          border: 1px solid rgba(0, 229, 255, 0.6);
          box-shadow: 0 0 15px rgba(0, 163, 255, 0.4);
        }
        .stat-input::-webkit-outer-spin-button,
        .stat-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .stat-input {
          -moz-appearance: textfield;
        }
        .grid-bg {
          background-image: radial-gradient(rgba(0, 229, 255, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </>
  );
}
