import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Clock,
  Users,
  ChefHat,
  Leaf,
  Info,
  Heart,
  Share2,
  Scale,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ingredientsApi, DishListItem } from "@/lib/api";
import { toast } from "sonner";

const IngredientDetail = () => {
  const { ingredientId } = useParams<{ ingredientId: string }>();
  const navigate = useNavigate();

  // Ingredient details query
  const { data: ingredient, isLoading: ingredientLoading, error: ingredientError } = useQuery({
    queryKey: ["ingredient", ingredientId],
    queryFn: async () => {
      if (!ingredientId) throw new Error("Ingredient ID is required");
      return await ingredientsApi.getById(parseInt(ingredientId));
    },
    enabled: !!ingredientId,
  });

  // Ingredient dishes query
  const { data: ingredientDishes, isLoading: dishesLoading } = useQuery({
    queryKey: ["ingredient-dishes", ingredientId],
    queryFn: async () => {
      if (!ingredientId) return { dishes: [], total_count: 0, page: 1, page_size: 12, total_pages: 1 };
      return await ingredientsApi.getDishes({
        ingredientId: parseInt(ingredientId),
        page: 1,
        page_size: 12,
      });
    },
    enabled: !!ingredientId,
  });

  if (ingredientError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 p-4 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <Leaf className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ingredient not found</h3>
            <p className="text-gray-600 mb-4">The ingredient you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/explore")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Explore
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (ingredientLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-64 w-full rounded-lg mb-6" />
          <Skeleton className="h-8 w-3/4 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!ingredient) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            onClick={() => navigate(-1)} 
            variant="ghost" 
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Hero Section */}
        <Card className="mb-8 overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          {ingredient.image_url && (
            <div className="h-80 w-full overflow-hidden">
              <img
                src={ingredient.image_url}
                alt={ingredient.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/api/placeholder/800/400";
                }}
              />
            </div>
          )}
          
          <CardHeader className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2 capitalize">
                  {ingredient.name}
                </CardTitle>
                <p className="text-lg text-gray-600 leading-relaxed">
                  A nutritious ingredient perfect for healthy cooking and meal preparation.
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tags and Info */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Scale className="h-3 w-3" />
                Serving: {ingredient.serving_size}g
              </Badge>
              {ingredient.calories && (
                <Badge className="bg-red-100 text-red-700 hover:bg-red-200">
                  {Math.round(ingredient.calories)} cal per serving
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Dishes Using This Ingredient */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-emerald-600" />
                  Dishes Using This Ingredient
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Discover delicious recipes that feature {ingredient.name}
                </p>
              </CardHeader>
              <CardContent>
                {dishesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : ingredientDishes && ingredientDishes.dishes?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ingredientDishes.dishes.map((dish: DishListItem) => (
                      <Card 
                        key={dish.id} 
                        className="group cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 bg-green-50 hover:bg-green-100"
                        onClick={() => navigate(`/dishes/${dish.id}`)}
                      >
                        <div className="flex gap-4 p-4">
                          {dish.image_urls && dish.image_urls.length > 0 ? (
                            <img
                              src={dish.image_urls[0]}
                              alt={dish.name}
                              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.src = "/api/placeholder/80/80";
                              }}
                            />
                          ) : (
                            <div className="w-20 h-20 bg-green-200 rounded-lg flex items-center justify-center flex-shrink-0">
                              <ChefHat className="h-8 w-8 text-green-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">
                              {dish.name}
                            </h3>
                            {dish.description && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {dish.description}
                              </p>
                            )}
                            <div className="flex gap-2 text-xs text-gray-500">
                              {dish.prep_time_minutes && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {dish.prep_time_minutes}m prep
                                </span>
                              )}
                              {dish.servings && (
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {dish.servings} servings
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 italic">No dishes found using this ingredient</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Nutritional Benefits */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  Nutritional Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-gray-700">
                  <p>
                    {ingredient.name} is a nutritious ingredient that can be a valuable addition to your diet. 
                    It provides essential nutrients that support overall health and wellness.
                  </p>
                  {ingredient.protein_g && ingredient.protein_g > 5 && (
                    <p>
                      <strong>High in Protein:</strong> With {Math.round(ingredient.protein_g)}g of protein per serving, 
                      this ingredient is excellent for muscle building and maintenance.
                    </p>
                  )}
                  {ingredient.calories && ingredient.calories < 50 && (
                    <p>
                      <strong>Low Calorie:</strong> At only {Math.round(ingredient.calories)} calories per serving, 
                      this is a great choice for weight management.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Nutrition Facts */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  Nutrition Facts
                </CardTitle>
                <p className="text-sm text-gray-600">Per {ingredient.serving_size}g serving</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ingredient.calories && (
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="font-medium text-gray-700">Calories</span>
                      <span className="text-xl font-bold text-red-600">
                        {Math.round(ingredient.calories)}
                      </span>
                    </div>
                  )}
                  {ingredient.protein_g && (
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium text-gray-700">Protein</span>
                      <span className="text-lg font-semibold text-blue-600">
                        {Math.round(ingredient.protein_g)}g
                      </span>
                    </div>
                  )}
                  {ingredient.carbs_g && (
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="font-medium text-gray-700">Carbs</span>
                      <span className="text-lg font-semibold text-orange-600">
                        {Math.round(ingredient.carbs_g)}g
                      </span>
                    </div>
                  )}
                  {ingredient.fats_g && (
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium text-gray-700">Fats</span>
                      <span className="text-lg font-semibold text-purple-600">
                        {Math.round(ingredient.fats_g)}g
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Facts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Serving Size</span>
                    <span className="font-medium">{ingredient.serving_size}g</span>
                  </div>
                  {ingredient.calories && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Calories per 100g</span>
                      <span className="font-medium">
                        {Math.round((ingredient.calories / ingredient.serving_size) * 100)}
                      </span>
                    </div>
                  )}
                  {ingredientDishes && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Used in Dishes</span>
                      <span className="font-medium">{ingredientDishes.total_count}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Usage Tips */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Usage Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Store in a cool, dry place for optimal freshness</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Great for adding nutrition and flavor to various dishes</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Can be used in both cooking and raw preparations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IngredientDetail; 