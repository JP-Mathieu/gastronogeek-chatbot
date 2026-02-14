import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, RefreshCw, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Redirect } from "wouter";
import { useTranslation, getTranslation } from "@/hooks/useTranslation";

export default function Admin() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const t = useTranslation("fr");

  const syncMutation = trpc.content.syncYouTubeVideos.useMutation();
  const videoCountQuery = trpc.content.getVideoCount.useQuery();
  const storedVideosQuery = trpc.content.getStoredVideos.useQuery({
    limit: 10,
    offset: 0,
  });

  const handleSyncVideos = async () => {
    setIsSyncing(true);
    try {
      const result = await syncMutation.mutateAsync({
        maxResults: 50,
      });

      toast.success(result.message);
      // Refetch video count and stored videos
      videoCountQuery.refetch();
      storedVideosQuery.refetch();
    } catch (error) {
      toast.error(getTranslation(t, "messages.syncError"));
      console.error("Sync error:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="w-64 border-r bg-muted/30 p-4 flex flex-col">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-primary">Gastronogeek</h1>
            <p className="text-sm text-muted-foreground">
              {getTranslation(t, "admin.title")}
            </p>
          </div>

          <div className="space-y-2 flex-1">
            <div className="text-sm font-semibold text-muted-foreground mb-4">
              {getTranslation(t, "admin.menu")}
            </div>
            <Button variant="outline" className="w-full justify-start">
              {getTranslation(t, "admin.dashboard")}
            </Button>
            <Button variant="outline" className="w-full justify-start">
              {getTranslation(t, "admin.contentSync")}
            </Button>
            <Button variant="outline" className="w-full justify-start">
              {getTranslation(t, "admin.videos")}
            </Button>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => logout()}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {getTranslation(t, "common.logout")}
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-background p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-lg font-semibold">
                {getTranslation(t, "admin.title")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {getTranslation(t, "admin.subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="text-sm text-muted-foreground mb-2">
                  {getTranslation(t, "admin.totalVideos")}
                </div>
                <div className="text-3xl font-bold">
                  {videoCountQuery.data?.count || 0}
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-sm text-muted-foreground mb-2">
                  {getTranslation(t, "admin.lastSync")}
                </div>
                <div className="text-lg font-semibold">
                  {new Date().toLocaleDateString("fr-FR")}
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-sm text-muted-foreground mb-2">
                  {getTranslation(t, "admin.status")}
                </div>
                <div className="text-lg font-semibold text-green-600">
                  {isSyncing
                    ? getTranslation(t, "admin.syncing")
                    : getTranslation(t, "admin.ready")}
                </div>
              </Card>
            </div>

            {/* Sync Section */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {getTranslation(t, "admin.youtubeSync")}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {getTranslation(t, "admin.youtubeSyncDesc")}
              </p>
              <Button
                onClick={handleSyncVideos}
                disabled={isSyncing}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {getTranslation(t, "admin.syncingVideos")}
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {getTranslation(t, "admin.syncVideos")}
                  </>
                )}
              </Button>
            </Card>

            {/* Recent Videos */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {getTranslation(t, "admin.recentVideos")}
              </h3>
              {storedVideosQuery.data?.videos &&
              storedVideosQuery.data.videos.length > 0 ? (
                <div className="space-y-3">
                  {storedVideosQuery.data.videos.map((video: any) => (
                    <div
                      key={video.id}
                      className="flex gap-4 pb-3 border-b last:border-0"
                    >
                      {video.thumbnailUrl && (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-24 h-16 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{video.title}</h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {video.description}
                        </p>
                        <div className="text-xs text-muted-foreground mt-1">
                          {video.viewCount?.toLocaleString()} {getTranslation(t, "admin.views")} •{" "}
                          {video.duration
                            ? `${Math.round(video.duration / 60)}m`
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {getTranslation(t, "admin.noVideosSynced")}
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
