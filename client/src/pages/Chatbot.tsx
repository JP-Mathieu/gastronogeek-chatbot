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
      toast.error("Please enter a message");
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
      toast.error("Failed to send message. Please try again.");
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
            <p className="text-sm text-muted-foreground">Cooking Assistant</p>
          </div>

          <Button className="w-full mb-4" variant="outline">
            New Chat
          </Button>

          <div className="flex-1">
            <h3 className="text-sm font-semibold mb-2">Recent Chats</h3>
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
              Logout
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
              <h2 className="text-lg font-semibold">Gastronogeek Chatbot</h2>
              <p className="text-sm text-muted-foreground">
                Ask me anything about cooking!
              </p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-2xl mx-auto space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="text-4xl mb-4">👨‍🍳</div>
                <h3 className="text-xl font-semibold mb-2">Welcome!</h3>
                <p className="text-muted-foreground max-w-sm">
                  Ask me anything about Gastronogeek's recipes and cooking
                  techniques. I'm here to help!
                </p>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className="space-y-2">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <Card className="bg-primary text-primary-foreground max-w-xs lg:max-w-md p-3 rounded-lg">
                      <p className="text-sm">{msg.userMessage}</p>
                    </Card>
                  </div>

                  {/* Bot Response */}
                  {msg.isLoading ? (
                    <div className="flex justify-start">
                      <Card className="bg-muted max-w-xs lg:max-w-md p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">
                            Thinking...
                          </span>
                        </div>
                      </Card>
                    </div>
                  ) : (
                    <div className="flex justify-start">
                      <Card className="bg-muted max-w-xs lg:max-w-md p-3 rounded-lg">
                        <p className="text-sm">{msg.botResponse}</p>
                        {msg.sourceVideos && msg.sourceVideos.length > 0 && (
                          <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                            <p className="font-semibold mb-1">
                              Related Videos: {msg.sourceVideos.length}
                            </p>
                          </div>
                        )}
                      </Card>
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
          <form onSubmit={handleSendMessage} className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <Input
                placeholder="Ask me about cooking..."
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
