import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { DownloadProgress as ProgressType } from "@shared/schema";

interface DownloadProgressProps {
  progress: ProgressType;
  onCancel: () => void;
}

export default function DownloadProgress({ progress, onCancel }: DownloadProgressProps) {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">Downloading...</h2>
        
        <div className="space-y-4">
          <Progress value={progress.percentage} className="h-2.5" />
          
          <div className="flex justify-between text-sm text-gray-600">
            <span>{progress.percentage}%</span>
            <span>{progress.speed}</span>
          </div>
          
          <div className="flex justify-between text-sm text-gray-600">
            <span>{progress.size}</span>
            <span>{progress.eta}</span>
          </div>
          
          <Button 
            variant="outline"
            onClick={onCancel}
            className="mt-2 w-full md:w-auto"
          >
            <span className="material-icons mr-1">cancel</span>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
