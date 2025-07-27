import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, ExternalLink, Clock, User } from "lucide-react";

interface VideoData {
    video_id: string;
    title: string;
    description: string;
    channel_title: string;
    thumbnail_url: string;
    video_url: string;
    published_at?: string;
}

interface VideoSelectionWidget {
    widget_type: "video_selection";
    videos: VideoData[];
    query: string;
    total_results?: number;
}

interface VideoSelectionWidgetProps {
    widget: VideoSelectionWidget;
}

interface VideoCardProps {
    video: VideoData;
}

function VideoCardComponent({ video }: VideoCardProps) {
    const handleVideoClick = () => {
        window.open(video.video_url, '_blank', 'noopener,noreferrer');
    };

    // Format duration if available (not provided by current API)
    const formatPublishedDate = (dateString?: string) => {
        if (!dateString) return "";
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - date.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays < 7) return `${diffDays}d ago`;
            if (diffDays < 30) return `${Math.ceil(diffDays/7)}w ago`;
            if (diffDays < 365) return `${Math.ceil(diffDays/30)}mo ago`;
            return `${Math.ceil(diffDays/365)}y ago`;
        } catch {
            return "";
        }
    };

    return (
        <div
            className="flex-shrink-0 w-72 bg-purple-50/60 backdrop-blur-sm rounded-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:-translate-y-1 relative overflow-hidden hover:bg-purple-50/80 border-purple-200/50 hover:border-purple-300/70 group"
            onClick={handleVideoClick}
        >
            {/* Video Thumbnail */}
            <div className="relative aspect-video bg-gradient-to-br from-purple-100 to-purple-200 overflow-hidden rounded-t-xl">
                {video.thumbnail_url ? (
                    <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-200 to-purple-300">
                        <Play className="h-12 w-12 text-purple-600" />
                    </div>
                )}
                
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                        <Play className="h-6 w-6 text-purple-600 fill-purple-600" />
                    </div>
                </div>
                
                {/* External link indicator */}
                <div className="absolute top-2 right-2 bg-purple-600/80 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ExternalLink className="h-3 w-3 text-white" />
                </div>
            </div>

            {/* Video Info */}
            <div className="p-4">
                {/* Title */}
                <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-2 line-clamp-2">
                    {video.title}
                </h4>
                
                {/* Channel and metadata */}
                <div className="flex items-center text-xs text-gray-600 space-x-2 mb-2">
                    <User className="h-3 w-3" />
                    <span className="truncate flex-1">{video.channel_title}</span>
                    {video.published_at && (
                        <>
                            <span>•</span>
                            <span className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatPublishedDate(video.published_at)}</span>
                            </span>
                        </>
                    )}
                </div>
                
                {/* Description preview */}
                {video.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {video.description}
                    </p>
                )}
                
                {/* Click to watch indicator */}
                <div className="mt-3 flex items-center justify-between">
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs px-2 py-1 hover:bg-purple-200 transition-colors">
                        Watch on YouTube
                    </Badge>
                </div>
            </div>
        </div>
    );
}

export function VideoSelectionWidget({ widget }: VideoSelectionWidgetProps) {
    const [scrollPosition, setScrollPosition] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);
    const [scrollWidth, setScrollWidth] = useState(0);

    // Calculate scroll indicators
    const totalDots = Math.max(1, Math.ceil((widget.videos.length - 3) / 2) + 1);
    const activeDot = Math.floor((scrollPosition / Math.max(scrollWidth - containerWidth, 1)) * (totalDots - 1));

    const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
        const target = event.target as HTMLDivElement;
        setScrollPosition(target.scrollLeft);
        setContainerWidth(target.clientWidth);
        setScrollWidth(target.scrollWidth);
    };

    return (
        <div className="w-full">
            {/* Header Section */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Play className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">
                            Cooking Videos
                        </h3>
                    </div>
                    <Badge className="bg-purple-500 text-white border-purple-600 px-3 py-1">
                        {widget.videos.length} video{widget.videos.length !== 1 ? 's' : ''}
                    </Badge>
                </div>
                <p className="text-gray-600 leading-relaxed">
                    Here are some helpful cooking videos for "{widget.query}". Click any video to watch it on YouTube.
                </p>
            </div>

            {/* Video Cards - Horizontal Scroll Container */}
            {widget.videos.length > 0 ? (
                <div className="w-full max-w-full overflow-hidden">
                    {/* Horizontal scroll container with mouse wheel support */}
                    <div 
                        data-scroll-container
                        className="flex gap-4 overflow-x-auto pb-2 pt-2 scroll-smooth [&::-webkit-scrollbar]:hidden"
                        style={{
                            // Calculate width to show exactly 3.5 cards
                            // 288px (w-72) per card + 16px gap * 3.5 = ~1056px max width
                            maxWidth: 'calc(3.5 * 288px + 3 * 16px)',
                            scrollbarWidth: 'none', // Firefox
                            msOverflowStyle: 'none', // IE/Edge
                        }}
                        onWheel={(e) => {
                            // Enable horizontal scrolling with mouse wheel
                            if (e.deltaY !== 0) {
                                e.preventDefault();
                                e.currentTarget.scrollLeft += e.deltaY;
                            }
                        }}
                        onScroll={handleScroll}
                    >
                        {widget.videos.map((video) => (
                            <VideoCardComponent
                                key={video.video_id}
                                video={video}
                            />
                        ))}
                    </div>
                    
                    {/* Custom Dot Scrollbar */}
                    {widget.videos.length > 3 && (
                        <div className="flex justify-center items-center mt-4 space-x-2">
                            {Array.from({ length: totalDots }, (_, index) => (
                                <button
                                    key={index}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                        index === activeDot
                                            ? "bg-purple-600 scale-125"
                                            : index < activeDot
                                            ? "bg-purple-400"
                                            : "bg-gray-300"
                                    }`}
                                    onClick={() => {
                                        const scrollContainer = document.querySelector('[data-scroll-container]') as HTMLDivElement;
                                        if (scrollContainer) {
                                            const targetScroll = (index / (totalDots - 1)) * (scrollContainer.scrollWidth - scrollContainer.clientWidth);
                                            scrollContainer.scrollTo({ left: targetScroll, behavior: 'smooth' });
                                        }
                                    }}
                                    aria-label={`Scroll to section ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Scroll hint */}
                    {widget.videos.length > 3 && (
                        <div className="text-center mt-2">
                            <p className="text-xs text-gray-500">← Scroll horizontally to see more videos →</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <Play className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No videos found for this query.</p>
                </div>
            )}
        </div>
    );
} 