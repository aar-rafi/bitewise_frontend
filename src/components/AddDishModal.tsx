import React, { useState, useCallback, useEffect } from 'react';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImageUpload } from '@/components/chat/ImageUpload';
import { Plus, X, Search, Clock, Users, ChefHat, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { dishesApi, ingredientsApi, DishCreateRequest, DishIngredientCreate, IngredientListItem } from '@/lib/api';

interface AddDishModalProps {
  trigger: React.ReactNode;
  onDishCreated?: () => void;
}

interface FormData {
  name: string;
  description: string;
  cuisine: string;
  cooking_steps: string[];
  prep_time_minutes: number | '';
  cook_time_minutes: number | '';
  servings: number | '';
  image_urls: string[];
  // Nutritional information
  calories: number | '';
  protein_g: number | '';
  carbs_g: number | '';
  fats_g: number | '';
  fiber_g: number | '';
  sugar_g: number | '';
  sodium_mg: number | '';
  // Selected ingredients
  ingredients: Array<{
    ingredient: IngredientListItem;
    quantity: number;
  }>;
}

const CUISINE_OPTIONS = [
  'Italian', 'Chinese', 'Mexican', 'Indian', 'American', 'French', 'Japanese', 'Thai', 'Mediterranean', 'Korean', 'Greek', 'Other'
];

export function AddDishModal({ trigger, onDishCreated }: AddDishModalProps) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [newCookingStep, setNewCookingStep] = useState('');
  const queryClient = useQueryClient();

  // Form data state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    cuisine: '',
    cooking_steps: [],
    prep_time_minutes: '',
    cook_time_minutes: '',
    servings: '',
    image_urls: [],
    calories: '',
    protein_g: '',
    carbs_g: '',
    fats_g: '',
    fiber_g: '',
    sugar_g: '',
    sodium_mg: '',
    ingredients: []
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setFormData({
        name: '',
        description: '',
        cuisine: '',
        cooking_steps: [],
        prep_time_minutes: '',
        cook_time_minutes: '',
        servings: '',
        image_urls: [],
        calories: '',
        protein_g: '',
        carbs_g: '',
        fats_g: '',
        fiber_g: '',
        sugar_g: '',
        sodium_mg: '',
        ingredients: []
      });
      setCurrentStep(1);
      setIngredientSearch('');
      setNewCookingStep('');
    }
  }, [open]);

  // Search ingredients
  const { data: searchResults } = useQuery({
    queryKey: ['ingredients-search', ingredientSearch],
    queryFn: async () => {
      if (!ingredientSearch.trim()) return { ingredients: [], total_count: 0, page: 1, page_size: 20, total_pages: 1 };
      return await ingredientsApi.searchByName({
        q: ingredientSearch,
        page: 1,
        page_size: 20
      });
    },
    enabled: ingredientSearch.length > 2,
  });

  // Image upload mutation
  const imageUploadMutation = useMutation({
    mutationFn: dishesApi.uploadImage,
    onSuccess: (data) => {
      setFormData(prev => ({
        ...prev,
        image_urls: [...prev.image_urls, data.image_url]
      }));
      toast.success('Image uploaded successfully!');
    },
    onError: (error) => {
      toast.error('Failed to upload image: ' + error.message);
    }
  });

  // Create dish mutation
  const createDishMutation = useMutation({
    mutationFn: dishesApi.create,
    onSuccess: () => {
      toast.success('Dish created successfully!');
      queryClient.invalidateQueries({ queryKey: ['dishes'] });
      setOpen(false);
      onDishCreated?.();
    },
    onError: (error) => {
      toast.error('Failed to create dish: ' + error.message);
    }
  });

  const updateFormData = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleImageUpload = useCallback((files: File[]) => {
    files.forEach(file => {
      imageUploadMutation.mutate(file);
    });
  }, [imageUploadMutation]);

  const addIngredient = useCallback((ingredient: IngredientListItem) => {
    const existingIndex = formData.ingredients.findIndex(item => item.ingredient.id === ingredient.id);
    if (existingIndex >= 0) {
      toast.error('Ingredient already added');
      return;
    }

    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { ingredient, quantity: 100 }]
    }));
    setIngredientSearch('');
  }, [formData.ingredients]);

  const removeIngredient = useCallback((ingredientId: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(item => item.ingredient.id !== ingredientId)
    }));
  }, []);

  const updateIngredientQuantity = useCallback((ingredientId: number, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(item =>
        item.ingredient.id === ingredientId ? { ...item, quantity } : item
      )
    }));
  }, []);

  const addCookingStep = useCallback(() => {
    if (newCookingStep.trim()) {
      setFormData(prev => ({
        ...prev,
        cooking_steps: [...prev.cooking_steps, newCookingStep.trim()]
      }));
      setNewCookingStep('');
    }
  }, [newCookingStep]);

  const removeCookingStep = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      cooking_steps: prev.cooking_steps.filter((_, i) => i !== index)
    }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!formData.name.trim()) {
      toast.error('Please enter a dish name');
      return;
    }

    const dishData: DishCreateRequest = {
      name: formData.name,
      description: formData.description || undefined,
      cuisine: formData.cuisine || undefined,
      cooking_steps: formData.cooking_steps.length > 0 ? formData.cooking_steps : undefined,
      prep_time_minutes: formData.prep_time_minutes ? Number(formData.prep_time_minutes) : undefined,
      cook_time_minutes: formData.cook_time_minutes ? Number(formData.cook_time_minutes) : undefined,
      servings: formData.servings ? Number(formData.servings) : undefined,
      image_urls: formData.image_urls.length > 0 ? formData.image_urls : undefined,
      calories: formData.calories ? Number(formData.calories) : undefined,
      protein_g: formData.protein_g ? Number(formData.protein_g) : undefined,
      carbs_g: formData.carbs_g ? Number(formData.carbs_g) : undefined,
      fats_g: formData.fats_g ? Number(formData.fats_g) : undefined,
      fiber_g: formData.fiber_g ? Number(formData.fiber_g) : undefined,
      sugar_g: formData.sugar_g ? Number(formData.sugar_g) : undefined,
      sodium_mg: formData.sodium_mg ? Number(formData.sodium_mg) : undefined,
      ingredients: formData.ingredients.map(item => ({
        ingredient_id: item.ingredient.id,
        quantity: item.quantity
      }))
    };

    createDishMutation.mutate(dishData);
  }, [formData, createDishMutation]);

  const canProceedToStep2 = formData.name.trim() && formData.description.trim();
  const canProceedToStep3 = canProceedToStep2;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-orange-600" />
            Add Your Own Dish
          </DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep >= step ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-12 h-1 ${
                  currentStep > step ? 'bg-orange-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        <ScrollArea className="max-h-[60vh]">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Dish Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      placeholder="Enter dish name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => updateFormData('description', e.target.value)}
                      placeholder="Describe your dish..."
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cuisine">Cuisine</Label>
                      <Select value={formData.cuisine} onValueChange={(value) => updateFormData('cuisine', value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select cuisine" />
                        </SelectTrigger>
                        <SelectContent>
                          {CUISINE_OPTIONS.map((cuisine) => (
                            <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="servings">Servings</Label>
                      <Input
                        id="servings"
                        type="number"
                        value={formData.servings}
                        onChange={(e) => updateFormData('servings', e.target.value ? Number(e.target.value) : '')}
                        placeholder="e.g., 4"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="prep_time">Prep Time (minutes)</Label>
                      <Input
                        id="prep_time"
                        type="number"
                        value={formData.prep_time_minutes}
                        onChange={(e) => updateFormData('prep_time_minutes', e.target.value ? Number(e.target.value) : '')}
                        placeholder="e.g., 15"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="cook_time">Cook Time (minutes)</Label>
                      <Input
                        id="cook_time"
                        type="number"
                        value={formData.cook_time_minutes}
                        onChange={(e) => updateFormData('cook_time_minutes', e.target.value ? Number(e.target.value) : '')}
                        placeholder="e.g., 30"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Images & Cooking Steps */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageUpload
                    onImagesSelected={handleImageUpload}
                    maxImages={3}
                    disabled={imageUploadMutation.isPending}
                  />
                  {formData.image_urls.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {formData.image_urls.map((url, index) => (
                        <div key={index} className="relative">
                          <img
                            src={url}
                            alt={`Dish image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                image_urls: prev.image_urls.filter((_, i) => i !== index)
                              }));
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cooking Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newCookingStep}
                      onChange={(e) => setNewCookingStep(e.target.value)}
                      placeholder="Add a cooking step..."
                      onKeyPress={(e) => e.key === 'Enter' && addCookingStep()}
                    />
                    <Button onClick={addCookingStep} disabled={!newCookingStep.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {formData.cooking_steps.length > 0 && (
                    <div className="space-y-2">
                      {formData.cooking_steps.map((step, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-600 min-w-[2rem]">
                            {index + 1}.
                          </span>
                          <span className="flex-1 text-sm">{step}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCookingStep(index)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Ingredients & Nutrition */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ingredients</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      value={ingredientSearch}
                      onChange={(e) => setIngredientSearch(e.target.value)}
                      placeholder="Search for ingredients..."
                      className="pl-10"
                    />
                  </div>

                  {/* Search Results */}
                  {searchResults && searchResults.ingredients.length > 0 && ingredientSearch.length > 2 && (
                    <div className="border rounded-lg max-h-40 overflow-y-auto">
                      {searchResults.ingredients.map((ingredient) => (
                        <div
                          key={ingredient.id}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          onClick={() => addIngredient(ingredient)}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{ingredient.name}</span>
                            <Badge variant="secondary">{ingredient.serving_size}g</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Selected Ingredients */}
                  {formData.ingredients.length > 0 && (
                    <div className="space-y-2">
                      <Label>Selected Ingredients ({formData.ingredients.length})</Label>
                      {formData.ingredients.map((item) => (
                        <div key={item.ingredient.id} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                          <span className="flex-1 font-medium">{item.ingredient.name}</span>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateIngredientQuantity(item.ingredient.id, Number(e.target.value))}
                            className="w-20"
                          />
                          <span className="text-sm text-gray-600">g</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeIngredient(item.ingredient.id)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Nutritional Information (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="calories">Calories (per serving)</Label>
                      <Input
                        id="calories"
                        type="number"
                        value={formData.calories}
                        onChange={(e) => updateFormData('calories', e.target.value ? Number(e.target.value) : '')}
                        placeholder="e.g., 350"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="protein">Protein (g)</Label>
                      <Input
                        id="protein"
                        type="number"
                        step="0.1"
                        value={formData.protein_g}
                        onChange={(e) => updateFormData('protein_g', e.target.value ? Number(e.target.value) : '')}
                        placeholder="e.g., 25"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="carbs">Carbs (g)</Label>
                      <Input
                        id="carbs"
                        type="number"
                        step="0.1"
                        value={formData.carbs_g}
                        onChange={(e) => updateFormData('carbs_g', e.target.value ? Number(e.target.value) : '')}
                        placeholder="e.g., 45"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fats">Fats (g)</Label>
                      <Input
                        id="fats"
                        type="number"
                        step="0.1"
                        value={formData.fats_g}
                        onChange={(e) => updateFormData('fats_g', e.target.value ? Number(e.target.value) : '')}
                        placeholder="e.g., 12"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </ScrollArea>

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
          >
            Previous
          </Button>

          <div className="flex gap-2">
            {currentStep < 3 ? (
              <Button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={currentStep === 1 && !canProceedToStep2}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={createDishMutation.isPending || !formData.name.trim()}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {createDishMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Create Dish
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 