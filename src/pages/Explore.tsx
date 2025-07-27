import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Clock,
  Users,
  ChefHat,
  Leaf,
  X,
  Star,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { dishesApi, ingredientsApi, DishListItem, IngredientListItem } from "@/lib/api";
import { toast } from "sonner";

type Dish = DishListItem;
type Ingredient = IngredientListItem;

const Explore = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"dishes" | "ingredients">("dishes");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string>("");
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    maxPrepTime: "",
    maxCookTime: "",
    maxCalories: "",
    minProtein: "",
  });

  // Dishes query
  const { data: dishesData, isLoading: dishesLoading, refetch: refetchDishes } = useQuery({
    queryKey: ["dishes", searchTerm, selectedCuisine, page],
    queryFn: async () => {
      return await dishesApi.getAll({
        search: searchTerm || undefined,
        cuisine: selectedCuisine || undefined,
        page: page,
        page_size: 12,
      });
    },
  });

  // Ingredients query
  const { data: ingredientsData, isLoading: ingredientsLoading } = useQuery({
    queryKey: ["ingredients", searchTerm, page],
    queryFn: async () => {
      return await ingredientsApi.getAll({
        search: searchTerm || undefined,
        page: page,
        page_size: 12,
      });
    },
    enabled: activeTab === "ingredients",
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleCuisineFilter = (cuisine: string) => {
    setSelectedCuisine(cuisine === "all" ? "" : cuisine);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCuisine("");
    setFilters({
      maxPrepTime: "",
      maxCookTime: "",
      maxCalories: "",
      minProtein: "",
    });
    setPage(1);
  };

  const DishCard = ({ dish }: { dish: Dish }) => (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-0 shadow-sm"
      onClick={() => navigate(`/dishes/${dish.id}`)}
    >
      <CardHeader className="p-0">
        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
          {dish.image_urls && dish.image_urls.length > 0 ? (
            <img
              src={dish.image_urls[0]}
              alt={dish.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = "/api/placeholder/300/200";
              }}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
              <ChefHat className="h-12 w-12 text-green-500" />
            </div>
          )}
          {dish.cuisine && (
            <Badge className="absolute top-2 right-2 bg-white/90 text-emerald-700 hover:bg-white">
              {dish.cuisine}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 group-hover:text-emerald-600 transition-colors">
          {dish.name}
        </h3>
        {dish.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {dish.description}
          </p>
        )}
        
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
          {dish.prep_time_minutes && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Prep: {dish.prep_time_minutes}m</span>
            </div>
          )}
          {dish.cook_time_minutes && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Cook: {dish.cook_time_minutes}m</span>
            </div>
          )}
          {dish.servings && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{dish.servings} servings</span>
            </div>
          )}
          {dish.calories && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              <span>{Math.round(dish.calories)} cal</span>
            </div>
          )}
        </div>

        {(dish.protein_g || dish.carbs_g || dish.fats_g) && (
          <div className="flex gap-1">
            {dish.protein_g && (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                {Math.round(dish.protein_g)}g protein
              </Badge>
            )}
            {dish.carbs_g && (
              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                {Math.round(dish.carbs_g)}g carbs
              </Badge>
            )}
            {dish.fats_g && (
              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                {Math.round(dish.fats_g)}g fats
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const IngredientCard = ({ ingredient }: { ingredient: Ingredient }) => (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-0 shadow-sm"
      onClick={() => navigate(`/ingredients/${ingredient.id}`)}
    >
      <CardHeader className="p-0">
        <div className="relative h-32 w-full overflow-hidden rounded-t-lg">
          {ingredient.image_url ? (
            <img
              src={ingredient.image_url}
              alt={ingredient.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = "/api/placeholder/200/150";
              }}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
              <Leaf className="h-8 w-8 text-green-500" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <h3 className="font-semibold text-sm mb-2 group-hover:text-emerald-600 transition-colors capitalize">
          {ingredient.name}
        </h3>
        
        <div className="text-xs text-gray-500 mb-2">
          Serving: {ingredient.serving_size}g
        </div>

        {ingredient.calories && (
          <div className="flex gap-1 flex-wrap">
            <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
              {Math.round(ingredient.calories)} cal
            </Badge>
            {ingredient.protein_g && (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                {Math.round(ingredient.protein_g)}g protein
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Explore Food & Ingredients
          </h1>
          <p className="text-gray-600">
            Discover delicious dishes and nutritious ingredients for your healthy lifestyle
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "dishes" ? "default" : "outline"}
            onClick={() => setActiveTab("dishes")}
            className={activeTab === "dishes" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
          >
            <ChefHat className="h-4 w-4 mr-2" />
            Dishes
          </Button>
          <Button
            variant={activeTab === "ingredients" ? "default" : "outline"}
            onClick={() => setActiveTab("ingredients")}
            className={activeTab === "ingredients" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
          >
            <Leaf className="h-4 w-4 mr-2" />
            Ingredients
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={`Search ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {activeTab === "dishes" && (
                <div className="flex gap-2">
                  <Select value={selectedCuisine} onValueChange={handleCuisineFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Cuisine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cuisines</SelectItem>
                      <SelectItem value="Italian">Italian</SelectItem>
                      <SelectItem value="Asian">Asian</SelectItem>
                      <SelectItem value="Mexican">Mexican</SelectItem>
                      <SelectItem value="Indian">Indian</SelectItem>
                      <SelectItem value="Mediterranean">Mediterranean</SelectItem>
                      <SelectItem value="American">American</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {(searchTerm || selectedCuisine) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {activeTab === "dishes" ? (
          <div>
            {dishesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="bg-white/80">
                    <Skeleton className="h-48 w-full rounded-t-lg" />
                    <CardContent className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : dishesData?.dishes?.length > 0 ? (
              <>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Showing {dishesData.dishes.length} of {dishesData.total_count} dishes
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {dishesData.dishes.map((dish: Dish) => (
                    <DishCard key={dish.id} dish={dish} />
                  ))}
                </div>
                
                {/* Pagination */}
                {dishesData.total_pages > 1 && (
                  <div className="flex justify-center gap-2 pb-8">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4 text-sm text-gray-600">
                      Page {page} of {dishesData.total_pages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={page === dishesData.total_pages}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No dishes found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {ingredientsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="bg-white/80">
                    <Skeleton className="h-32 w-full rounded-t-lg" />
                    <CardContent className="p-3">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-full mb-2" />
                      <Skeleton className="h-3 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : ingredientsData?.ingredients?.length > 0 ? (
              <>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Showing {ingredientsData.ingredients.length} of {ingredientsData.total_count} ingredients
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
                  {ingredientsData.ingredients.map((ingredient: Ingredient) => (
                    <IngredientCard key={ingredient.id} ingredient={ingredient} />
                  ))}
                </div>
                
                {/* Pagination */}
                {ingredientsData.total_pages > 1 && (
                  <div className="flex justify-center gap-2 pb-8">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-4 text-sm text-gray-600">
                      Page {page} of {ingredientsData.total_pages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={page === ingredientsData.total_pages}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Leaf className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No ingredients found</h3>
                <p className="text-gray-600">Try adjusting your search</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore; 