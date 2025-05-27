import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, Leaf } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl shadow-black/10 animate-fade-in">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-nutrition-orange/20 flex items-center justify-center animate-float">
              <Leaf className="w-10 h-10 text-nutrition-orange" />
            </div>
          </div>
          <CardTitle className="text-6xl font-bold bg-gradient-to-r from-nutrition-green to-nutrition-emerald bg-clip-text text-transparent">
            404
          </CardTitle>
          <p className="text-xl text-green-700/80 font-medium">
            Oops! Page not found
          </p>
          <p className="text-green-600/70">
            The page you're looking for seems to have wandered off like a lost
            vegetable in the garden.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate("/")}
              className="w-full bg-gradient-to-r from-nutrition-green to-nutrition-emerald hover:from-nutrition-emerald hover:to-nutrition-green transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </Button>

            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-full bg-white/10 border-white/30 hover:bg-white/20 text-green-800 hover:text-green-900 transition-all duration-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
