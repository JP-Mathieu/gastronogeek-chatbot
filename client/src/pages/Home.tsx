import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, ChefHat } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useTranslation, getTranslation } from "@/hooks/useTranslation";

/**
 * Home page - Landing page with login or chatbot access
 */
export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const t = useTranslation("fr");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChefHat className="w-8 h-8 text-orange-600" />
              <h1 className="text-2xl font-bold text-gray-900">Gastronogeek</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.name}</span>
              <Button variant="outline" size="sm" onClick={() => logout()}>
                {getTranslation(t, "common.logout")}
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              {getTranslation(t, "home.title")}
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              {getTranslation(t, "home.subtitle")}
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                className="bg-orange-600 hover:bg-orange-700 text-white"
                onClick={() => setLocation("/chatbot")}
              >
                <ChefHat className="w-5 h-5 mr-2" />
                {getTranslation(t, "home.startChatting")}
              </Button>
              {user?.role === "admin" && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setLocation("/admin")}
                >
                  {getTranslation(t, "home.adminPanel")}
                </Button>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="text-3xl mb-4">👨‍🍳</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {getTranslation(t, "home.features.expertRecipes")}
              </h3>
              <p className="text-gray-600">
                {getTranslation(t, "home.features.expertRecipesDesc")}
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="text-3xl mb-4">🎬</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {getTranslation(t, "home.features.videoReferences")}
              </h3>
              <p className="text-gray-600">
                {getTranslation(t, "home.features.videoReferencesDesc")}
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="text-3xl mb-4">💬</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {getTranslation(t, "home.features.aiAssistant")}
              </h3>
              <p className="text-gray-600">
                {getTranslation(t, "home.features.aiAssistantDesc")}
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Not authenticated - show login page
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <ChefHat className="w-16 h-16 text-orange-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gastronogeek Chatbot
          </h1>
          <p className="text-gray-600 mb-8">
            {getTranslation(t, "home.signInDesc")}
          </p>

          <Button
            size="lg"
            className="w-full bg-orange-600 hover:bg-orange-700 text-white mb-4"
            onClick={() => (window.location.href = getLoginUrl())}
          >
            {getTranslation(t, "home.signIn")}
          </Button>

          <p className="text-sm text-gray-500">
            {getTranslation(t, "home.signInDesc")}
          </p>
        </div>
      </div>
    </div>
  );
}
