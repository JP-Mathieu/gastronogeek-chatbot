import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send, LogOut, Menu } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Redirect } from "wouter";
import { useTranslation, getTranslation } from "@/hooks/useTranslation";
import { VideoCard } from "@/components/VideoCard";
import { ExternalLink } from "lucide-react";

interface Message {
  id?: number;
  userMessage: string;
  botResponse: string;
  sourceVideos: any[];
  sourceRecipes: any[];
  timestamp?: Date;
  isLoading?: boolean;
}

export default function Chatbot() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = useTranslation("fr");

  const sendMessageMutation = trpc.chatbot.sendMessage.useMutation();
  const getChatHistoryQuery = trpc.chatbot.getChatHistory.useQuery({});

  // Load chat history on mount
  useEffect(() => {
    if (getChatHistoryQuery.data) {
      setMessages(getChatHistoryQuery.data);
    }
  }, [getChatHistoryQuery.data]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) {
      toast.error(getTranslation(t, "messages.enterMessage"));
      return;
    }

    // Add user message immediately
    const userMessage: Message = {
      userMessage: inputValue,
      botResponse: "",
      sourceVideos: [],
      sourceRecipes: [],
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await sendMessageMutation.mutateAsync({
        message: inputValue,
      });

      // Replace the loading message with the actual response
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          userMessage: response.userMessage,
          botResponse: response.botResponse,
          sourceVideos: response.sourceVideos,
          sourceRecipes: response.sourceRecipes,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      toast.error(getTranslation(t, "messages.failedToSend"));
      // Remove the loading message
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
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
              {getTranslation(t, "chatbot.title")}
            </p>
          </div>

          <Button className="w-full mb-4" variant="outline">
            {getTranslation(t, "chatbot.newChat")}
          </Button>

          <div className="flex-1">
            <h3 className="text-sm font-semibold mb-2">
              {getTranslation(t, "chatbot.recentChats")}
            </h3>
            {/* TODO: Add chat history list */}
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

      {/* Main Chat Area */}
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
                {getTranslation(t, "chatbot.title")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {getTranslation(t, "chatbot.subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="text-4xl mb-4">👨‍🍳</div>
                <h3 className="text-xl font-semibold mb-2">
                  {getTranslation(t, "chatbot.welcome")}
                </h3>
                <p className="text-muted-foreground max-w-sm">
                  {getTranslation(t, "chatbot.welcomeDesc")}
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className="space-y-3">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <Card className="bg-primary text-primary-foreground max-w-md p-3 rounded-lg">
                      <p className="text-sm">{msg.userMessage}</p>
                    </Card>
                  </div>

                  {/* Bot Response */}
                  {msg.isLoading ? (
                    <div className="flex justify-start">
                      <Card className="bg-muted max-w-md p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">
                            {getTranslation(t, "chatbot.thinking")}
                          </span>
                        </div>
                      </Card>
                    </div>
                  ) : (
                    <div className="flex justify-start">
                      <div className="max-w-2xl space-y-3">
                        {/* Bot text response */}
                        <Card className="bg-muted p-3 rounded-lg">
                          <p className="text-sm">{msg.botResponse}</p>
                          
                          {/* Source links */}
                          {msg.sourceVideos && msg.sourceVideos.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-muted-foreground/20">
                              <p className="text-xs font-semibold text-muted-foreground mb-2">
                                {getTranslation(t, "chatbot.sources")}:
                              </p>
                              <ul className="space-y-1">
                                {msg.sourceVideos.slice(0, 3).map((video: any, idx: number) => (
                                  <li key={idx}>
                                    <a
                                      href={video.videoUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline break-all"
                                    >
                                      {idx + 1}. {video.title}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </Card>

                        {/* Video cards */}
                        {msg.sourceVideos && msg.sourceVideos.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground">
                              {getTranslation(t, "chatbot.relatedVideos")} ({msg.sourceVideos.length})
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {msg.sourceVideos.map((video: any) => (
                                <VideoCard
                                  key={video.id}
                                  id={video.id}
                                  title={video.title}
                                  description={video.description}
                                  thumbnailUrl={video.thumbnailUrl}
                                  videoUrl={video.videoUrl}
                                  duration={video.duration}
                                  viewCount={video.viewCount}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t bg-background p-4">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div className="flex gap-2">
              <Input
                placeholder={getTranslation(t, "chatbot.placeholder")}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
