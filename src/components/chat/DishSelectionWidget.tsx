import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Utensils, Clock, Loader2, Check, X } from "lucide-react";
import { DishSelectionWidget as DishSelectionWidgetType, DishCard } from "@/types/chat";
import { useConfirmDishSelection } from "@/hooks/useChat";
import { useToast } from "@/hooks/use-toast";

interface DishSelectionWidgetProps {
    widget: DishSelectionWidgetType;
}

interface DishCardProps {
    dish: DishCard;
    isSelected: boolean;
    portionSize: number;
    onPortionChange: (portion: number) => void;
    onSelect: () => void;
    onConfirm: () => void;
    isConfirming: boolean;
    disabled: boolean;
}

function DishCardComponent({ 
    dish, 
    isSelected, 
    portionSize, 
    onPortionChange, 
    onSelect, 
    onConfirm,
    isConfirming,
    disabled 
}: DishCardProps) {
    const formatNutrition = (value?: number) => {
        if (value === undefined || value === null) return "N/A";
        return value.toFixed(1);
    };

    const getTotalNutrition = (baseValue?: number) => {
        if (baseValue === undefined || baseValue === null) return "N/A";
        return (baseValue * portionSize).toFixed(1);
    };

    return (
        <Card 
            className={`cursor-pointer transition-all duration-200 ${
                isSelected 
                    ? "ring-2 ring-primary border-primary shadow-md" 
                    : "hover:shadow-sm hover:border-primary/50"
            } ${disabled ? "opacity-50" : ""}`}
            onClick={disabled ? undefined : onSelect}
        >
            <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                    {/* Dish Image */}
                    <div className="flex-shrink-0">
                        {dish.image_url ? (
                            <img 
                                src={dish.image_url} 
                                alt={dish.name}
                                className="w-16 h-16 rounded-lg object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/placeholder-dish.svg";
                                }}
                            />
                        ) : (
                            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                                <Utensils className="h-6 w-6 text-muted-foreground" />
                            </div>
                        )}
                    </div>

                    {/* Dish Details */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h4 className="font-semibold text-sm leading-tight">{dish.name}</h4>
                                {dish.cuisine && (
                                    <Badge variant="outline" className="text-xs mt-1">
                                        {dish.cuisine}
                                    </Badge>
                                )}
                                {dish.description && (
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                        {dish.description.length > 60 
                                            ? `${dish.description.substring(0, 60)}...` 
                                            : dish.description
                                        }
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Nutritional Info */}
                        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                            <div className="text-center bg-muted/50 rounded p-1">
                                <div className="font-medium text-orange-600">
                                    {getTotalNutrition(dish.calories)}
                                </div>
                                <div className="text-muted-foreground">cal</div>
                            </div>
                            <div className="text-center bg-muted/50 rounded p-1">
                                <div className="font-medium text-blue-600">
                                    {getTotalNutrition(dish.protein_g)}g
                                </div>
                                <div className="text-muted-foreground">protein</div>
                            </div>
                            <div className="text-center bg-muted/50 rounded p-1">
                                <div className="font-medium text-green-600">
                                    {getTotalNutrition(dish.carbs_g)}g
                                </div>
                                <div className="text-muted-foreground">carbs</div>
                            </div>
                            <div className="text-center bg-muted/50 rounded p-1">
                                <div className="font-medium text-purple-600">
                                    {getTotalNutrition(dish.fats_g)}g
                                </div>
                                <div className="text-muted-foreground">fats</div>
                            </div>
                        </div>

                        {/* Portion Size & Confirm Button - Only show when selected */}
                        {isSelected && (
                            <div className="mt-3 pt-3 border-t space-y-2">
                                <div className="flex items-center space-x-2">
                                    <label className="text-xs font-medium">Portion:</label>
                                    <Input
                                        type="number"
                                        value={portionSize}
                                        onChange={(e) => onPortionChange(parseFloat(e.target.value) || 1)}
                                        min="0.1"
                                        step="0.1"
                                        className="w-20 h-7 text-xs"
                                        disabled={disabled}
                                    />
                                    <span className="text-xs text-muted-foreground">
                                        × serving{portionSize !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <Button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onConfirm();
                                    }}
                                    size="sm" 
                                    className="w-full"
                                    disabled={disabled || isConfirming}
                                >
                                    {isConfirming ? (
                                        <>
                                            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                            Confirming...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="h-3 w-3 mr-2" />
                                            Confirm & Log Intake
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function DishSelectionWidget({ widget }: DishSelectionWidgetProps) {
    const [selectedDishId, setSelectedDishId] = useState<number | null>(null);
    const [portionSizes, setPortionSizes] = useState<Record<number, number>>(() => {
        // Initialize portion sizes with extracted portion or 1.0
        const initial: Record<number, number> = {};
        widget.dishes.forEach(dish => {
            initial[dish.id] = widget.extracted_portion || 1.0;
        });
        return initial;
    });

    const confirmDishMutation = useConfirmDishSelection();
    const { toast } = useToast();

    const handleDishSelect = (dishId: number) => {
        if (widget.status === "resolved") return;
        setSelectedDishId(dishId);
    };

    const handlePortionChange = (dishId: number, portion: number) => {
        setPortionSizes(prev => ({
            ...prev,
            [dishId]: portion
        }));
    };

    const handleConfirm = async (dishId: number) => {
        try {
            await confirmDishMutation.mutateAsync({
                widgetId: widget.widget_id,
                dishId: dishId,
                portionSize: portionSizes[dishId]
            });
            
            toast({
                title: "Intake logged successfully!",
                description: "Your food intake has been recorded.",
            });
        } catch (error) {
            console.error("Failed to confirm dish selection:", error);
            toast({
                title: "Failed to log intake",
                description: "Please try again.",
                variant: "destructive",
            });
        }
    };

    const isResolved = widget.status === "resolved";

    return (
        <Card className={`mt-3 ${isResolved ? "opacity-75" : ""}`}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Utensils className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm">{widget.title}</CardTitle>
                    </div>
                    <Badge variant={isResolved ? "secondary" : "default"}>
                        {isResolved ? (
                            <>
                                <Check className="h-3 w-3 mr-1" />
                                Completed
                            </>
                        ) : (
                            <>
                                <Clock className="h-3 w-3 mr-1" />
                                Choose dish
                            </>
                        )}
                    </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{widget.description}</p>
                {widget.search_term && (
                    <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Search:</span> "{widget.search_term}"
                    </p>
                )}
            </CardHeader>
            <CardContent className="pt-0">
                {isResolved && widget.selected_dish_id ? (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                        <div className="flex items-center justify-center space-x-2">
                            <Check className="h-4 w-4 text-green-600" />
                            <span>
                                Logged {widget.selected_portion}× serving of{" "}
                                {widget.dishes.find(d => d.id === widget.selected_dish_id)?.name}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {widget.dishes.length > 0 ? (
                            widget.dishes.map((dish) => (
                                <DishCardComponent
                                    key={dish.id}
                                    dish={dish}
                                    isSelected={selectedDishId === dish.id}
                                    portionSize={portionSizes[dish.id] || 1.0}
                                    onPortionChange={(portion) => handlePortionChange(dish.id, portion)}
                                    onSelect={() => handleDishSelect(dish.id)}
                                    onConfirm={() => handleConfirm(dish.id)}
                                    isConfirming={confirmDishMutation.isPending}
                                    disabled={isResolved || confirmDishMutation.isPending}
                                />
                            ))
                        ) : (
                            <div className="text-center py-6 text-muted-foreground">
                                <X className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No dishes found for "{widget.search_term}"</p>
                                <p className="text-xs">Try a different search term</p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 