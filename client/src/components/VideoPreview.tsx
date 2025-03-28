import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { YoutubeVideo, VideoFormat } from "@shared/schema";
import { Download } from "lucide-react";

interface VideoPreviewProps {
  videoInfo: YoutubeVideo;
  selectedQuality: string;
  onQualityChange: (quality: string) => void;
  onDownload: () => void;
}

export default function VideoPreview({ 
  videoInfo, 
  selectedQuality, 
  onQualityChange, 
  onDownload 
}: VideoPreviewProps) {
  
  // Filter formats to only include mp4 video with common resolutions
  const qualityOptions = videoInfo.formats
    .filter(format => 
      format.container === 'mp4' && 
      format.qualityLabel && 
      ['144p', '240p', '360p', '480p', '720p', '1080p'].includes(format.qualityLabel)
    )
    .sort((a, b) => {
      // Extract resolution number for sorting
      const aRes = parseInt(a.qualityLabel?.replace('p', '') || '0');
      const bRes = parseInt(b.qualityLabel?.replace('p', '') || '0');
      return bRes - aRes;  // Sort high to low
    });

  // Ensure we have at least one option
  if (qualityOptions.length === 0 && videoInfo.formats.length > 0) {
    qualityOptions.push(videoInfo.formats[0]);
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">Video Information</h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:w-2/5">
            <div className="aspect-video bg-gray-200 rounded-md overflow-hidden">
              <img 
                src={videoInfo.thumbnail} 
                alt={`Thumbnail for ${videoInfo.title}`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <div className="md:w-3/5">
            <h3 className="text-lg font-medium mb-2">{videoInfo.title}</h3>
            
            <div className="flex items-center text-gray-600 mb-4">
              <span className="material-icons text-sm mr-1">schedule</span>
              <span>{videoInfo.duration}</span>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">Select Quality</h4>
              <RadioGroup 
                value={selectedQuality} 
                onValueChange={onQualityChange}
                className="space-y-2"
              >
                {qualityOptions.map((format, index) => {
                  const sizeInMB = format.size ? (format.size / 1048576).toFixed(1) : "~";
                  return (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={format.qualityLabel || '360p'} id={`quality-${index}`} />
                      <Label htmlFor={`quality-${index}`} className="cursor-pointer">
                        <span className="ml-2 text-gray-700">{format.qualityLabel || format.quality} (MP4)</span>
                        <span className="ml-1 text-gray-500 text-sm">
                          {sizeInMB !== "~" ? `~${sizeInMB}MB` : ""}
                        </span>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
            
            <Button 
              onClick={onDownload}
              className="flex items-center"
            >
              <Download className="mr-1 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
