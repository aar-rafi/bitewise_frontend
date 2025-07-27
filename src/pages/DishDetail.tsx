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
  BookOpen,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { dishesApi, DishIngredientResponse } from "@/lib/api";
import { toast } from "sonner";

const DishDetail = () => {
  const { dishId } = useParams<{ dishId: string }>();
  const navigate = useNavigate();

  // Dish details query
  const { data: dish, isLoading: dishLoading, error: dishError } = useQuery({
    queryKey: ["dish", dishId],
    queryFn: async () => {
      if (!dishId) throw new Error("Dish ID is required");
      return await dishesApi.getById(parseInt(dishId));
    },
    enabled: !!dishId,
  });

  // Dish ingredients query
  const { data: dishIngredients, isLoading: ingredientsLoading } = useQuery({
    queryKey: ["dish-ingredients", dishId],
    queryFn: async () => {
      if (!dishId) return [];
      return await dishesApi.getIngredients(parseInt(dishId));
    },
    enabled: !!dishId,
  });

  if (dishError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 p-4 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Dish not found</h3>
            <p className="text-gray-600 mb-4">The dish you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/explore")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Explore
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (dishLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-64 w-full rounded-lg mb-6" />
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-20 w-full mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!dish) return null;

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
          {dish.image_urls && dish.image_urls.length > 0 && (
            <div className="h-80 w-full overflow-hidden">
              <img
                src={dish.image_urls[0]}
                alt={dish.name}
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
                <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                  {dish.name}
                </CardTitle>
                {dish.description && (
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {dish.description}
                  </p>
                )}
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
              {dish.cuisine && (
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                  {dish.cuisine}
                </Badge>
              )}
              {dish.prep_time_minutes && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Prep: {dish.prep_time_minutes}m
                </Badge>
              )}
              {dish.cook_time_minutes && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Cook: {dish.cook_time_minutes}m
                </Badge>
              )}
              {dish.servings && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {dish.servings} servings
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cooking Steps */}
            {dish.cooking_steps && dish.cooking_steps.length > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-emerald-600" />
                    Cooking Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dish.cooking_steps.map((step, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <p className="text-gray-700 leading-relaxed pt-1">{step}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ingredients */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  Ingredients
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ingredientsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : dishIngredients && dishIngredients.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dishIngredients.map((item: DishIngredientResponse, index: number) => (
                      <Card 
                        key={index} 
                        className="p-3 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer"
                        onClick={() => navigate(`/ingredients/${item.ingredient.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          {item.ingredient.image_url ? (
                            <img
                              src={item.ingredient.image_url}
                              alt={item.ingredient.name}
                              className="w-12 h-12 rounded-lg object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/api/placeholder/50/50";
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                              <Leaf className="h-6 w-6 text-green-600" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium capitalize text-sm">
                              {item.ingredient.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {item.quantity}g
                            </p>
                            {item.ingredient.calories && (
                              <p className="text-xs text-gray-500">
                                {Math.round((item.ingredient.calories * item.quantity) / item.ingredient.serving_size)} cal
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No ingredients data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Nutrition Facts */}
            {(dish.calories || dish.protein_g || dish.carbs_g || dish.fats_g) && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    Nutrition Facts
                  </CardTitle>
                  <p className="text-sm text-gray-600">Per serving</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dish.calories && (
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <span className="font-medium text-gray-700">Calories</span>
                        <span className="text-xl font-bold text-red-600">
                          {Math.round(dish.calories)}
                        </span>
                      </div>
                    )}
                    {dish.protein_g && (
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="font-medium text-gray-700">Protein</span>
                        <span className="text-lg font-semibold text-blue-600">
                          {Math.round(dish.protein_g)}g
                        </span>
                      </div>
                    )}
                    {dish.carbs_g && (
                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <span className="font-medium text-gray-700">Carbs</span>
                        <span className="text-lg font-semibold text-orange-600">
                          {Math.round(dish.carbs_g)}g
                        </span>
                      </div>
                    )}
                    {dish.fats_g && (
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span className="font-medium text-gray-700">Fats</span>
                        <span className="text-lg font-semibold text-purple-600">
                          {Math.round(dish.fats_g)}g
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dish.prep_time_minutes && dish.cook_time_minutes && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Time</span>
                      <span className="font-medium">
                        {dish.prep_time_minutes + dish.cook_time_minutes} minutes
                      </span>
                    </div>
                  )}
                  {dish.servings && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Servings</span>
                      <span className="font-medium">{dish.servings}</span>
                    </div>
                  )}
                  {dish.cuisine && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cuisine</span>
                      <span className="font-medium">{dish.cuisine}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DishDetail; 