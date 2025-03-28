import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export default function UrlInput({ onSubmit, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);

  const isValidYouTubeUrl = (url: string) => {
    return url.includes('youtube.com/watch') || url.includes('youtu.be/');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidYouTubeUrl(url)) {
      setIsInvalid(true);
      return;
    }
    
    setIsInvalid(false);
    onSubmit(url);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (isInvalid) {
      setIsInvalid(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label htmlFor="video-url" className="block text-sm font-medium text-gray-700 mb-1">
              YouTube Video URL
            </label>
            <div className="flex items-center">
              <div className="relative flex-grow">
                <Input
                  id="video-url"
                  type="text"
                  value={url}
                  onChange={handleUrlChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className={`rounded-r-none ${isInvalid ? 'border-error focus:ring-error' : ''}`}
                />
                {isInvalid && (
                  <div className="text-error text-sm mt-1">
                    Please enter a valid YouTube URL
                  </div>
                )}
              </div>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="rounded-l-none"
              >
                {isLoading ? (
                  <>
                    <span>Fetching</span>
                    <span className="material-icons animate-spin ml-1">sync</span>
                  </>
                ) : (
                  "Fetch"
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
