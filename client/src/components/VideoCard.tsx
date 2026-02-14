import { ExternalLink, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoCardProps {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  videoUrl: string;
  duration?: number;
  viewCount?: number;
}

export function VideoCard({
  id,
  title,
  description,
  thumbnailUrl,
  videoUrl,
  duration,
  viewCount,
}: VideoCardProps) {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatViewCount = (count?: number) => {
    if (!count) return "0";
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      {thumbnailUrl && (
        <div className="relative overflow-hidden bg-gray-900 aspect-video">
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 hover:bg-black/40 transition-colors flex items-center justify-center">
            <Play className="w-12 h-12 text-white fill-white" />
          </div>
          {duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
              {formatDuration(duration)}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-2 mb-1">{title}</h3>

        {description && (
          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
            {description}
          </p>
        )}

        {/* Stats */}
        {(viewCount !== undefined || duration !== undefined) && (
          <div className="flex gap-3 text-xs text-gray-500 mb-3">
            {viewCount !== undefined && (
              <span>{formatViewCount(viewCount)} vues</span>
            )}
            {duration !== undefined && (
              <span>{formatDuration(duration)}</span>
            )}
          </div>
        )}

        {/* Watch Button */}
        <Button
          size="sm"
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          onClick={() => window.open(videoUrl, "_blank")}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Regarder sur YouTube
        </Button>
      </div>
    </div>
  );
}
