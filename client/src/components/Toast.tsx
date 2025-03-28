import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  isVisible: boolean;
  onDismiss: () => void;
}

export default function Toast({ message, type, isVisible, onDismiss }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onDismiss]);

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg animate-in fade-in slide-in-from-bottom-3 duration-300",
        type === "success" ? "bg-success text-white" : "bg-error text-white"
      )}
    >
      <div className="flex items-center">
        {type === "success" ? (
          <CheckCircle2 className="mr-2 h-4 w-4" />
        ) : (
          <AlertCircle className="mr-2 h-4 w-4" />
        )}
        <span>{message}</span>
      </div>
    </div>
  );
}
