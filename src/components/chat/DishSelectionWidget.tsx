import { useState, useEffect } from "react";
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
    isResolved: boolean;
    wasSelectedInResolved: boolean;
}

function DishCardComponent({
    dish,
    isSelected,
    portionSize,
    onPortionChange,
    onSelect,
    onConfirm,
    isConfirming,
    disabled,
    isResolved,
    wasSelectedInResolved
}: DishCardProps) {
    return (
        <div
            className={`
                flex-shrink-0 w-72 bg-white rounded-xl border-2 transition-all duration-300 cursor-pointer
                hover:shadow-lg hover:-translate-y-1 relative overflow-hidden
                ${isSelected
                    ? wasSelectedInResolved
                        ? "border-green-500 shadow-green-100 shadow-lg" // Resolved selection
                        : "border-blue-500 shadow-blue-100 shadow-lg" // Active selection
                    : "border-gray-200 hover:border-gray-300"
                }
                ${isResolved && !wasSelectedInResolved ? "opacity-60" : ""}
                ${disabled ? "cursor-not-allowed" : ""}
            `}
            onClick={() => !isResolved && onSelect()}
        >
            {/* Selection Badge */}
            {wasSelectedInResolved && (
                <div className="absolute top-3 right-3 z-10">
                    <Badge className="bg-green-500 text-white border-green-600 shadow-md">
                        <Check className="h-3 w-3 mr-1" />
                        Selected
                    </Badge>
                </div>
            )}

            {/* Image Container */}
            <div className="relative h-40 overflow-hidden">
                {dish.image_url ? (
                    <img
                        src={dish.image_url}
                        alt={dish.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                            e.currentTarget.src = `data:image/svg+xml,${encodeURIComponent(`
                                <svg width="288" height="160" viewBox="0 0 288 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="288" height="160" fill="#f8fafc"/>
                                    <circle cx="144" cy="80" r="24" fill="#e2e8f0"/>
                                    <path d="M132 68c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm12 8h-24v12l6-4.5 6 6 6-4.5 6 1v-10z" fill="#94a3b8"/>
                                </svg>
                            `)}`;
                        }}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <div className="text-center">
                            <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                            <span className="text-sm text-gray-500">No image</span>
                        </div>
                    </div>
                )}
                
                {/* Calories Badge */}
                {dish.calories && (
                    <div className="absolute bottom-3 left-3">
                        <Badge variant="secondary" className="bg-black/70 text-white border-none backdrop-blur-sm">
                            {dish.calories} cal
                        </Badge>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="mb-3">
                    <h4 className={`text-lg font-bold text-gray-900 mb-1 line-clamp-1 ${wasSelectedInResolved ? "text-green-700" : ""}`}>
                        {dish.name}
                    </h4>
                    {dish.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {dish.description}
                        </p>
                    )}
                </div>

                {/* Cuisine Badge */}
                {dish.cuisine && (
                    <div className="mb-4">
                        <Badge variant="outline" className="text-xs font-medium border-blue-200 text-blue-700 bg-blue-50">
                            {dish.cuisine}
                        </Badge>
                    </div>
                )}

                {/* Portion Control and Action */}
                {isSelected && (
                    <div className="border-t pt-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-700">Portion Size</label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    min="0.1"
                                    max="10"
                                    step="0.1"
                                    value={portionSize}
                                    onChange={(e) => onPortionChange(Number(e.target.value))}
                                    className="w-20 h-8 text-sm text-center"
                                    disabled={isResolved}
                                />
                                <span className="text-sm text-gray-500">× serving</span>
                            </div>
                        </div>

                        {!isResolved && (
                            <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onConfirm();
                                }}
                                disabled={isConfirming}
                                className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                            >
                                {isConfirming ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Logging intake...
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Confirm Selection
                                    </>
                                )}
                            </Button>
                        )}

                        {wasSelectedInResolved && (
                            <div className="text-center py-2">
                                <div className="inline-flex items-center gap-2 text-sm text-green-600 font-medium bg-green-50 px-3 py-1.5 rounded-full">
                                    <Check className="h-4 w-4" />
                                    Logged {portionSize}× serving
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Call to Action for unselected items */}
                {!isSelected && !isResolved && (
                    <div className="border-t pt-4">
                        <Button 
                            variant="outline" 
                            className="w-full h-10 border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect();
                            }}
                        >
                            Select This Dish
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export function DishSelectionWidget({ widget }: DishSelectionWidgetProps) {
    const [selectedDishId, setSelectedDishId] = useState<number | null>(null);
    const [portionSizes, setPortionSizes] = useState<Record<number, number>>({});
    const { mutate: confirmSelection, isPending: isConfirming } = useConfirmDishSelection();
    const { toast } = useToast();

    // Initialize portion sizes for all dishes
    useEffect(() => {
        const initialPortions: Record<number, number> = {};
        widget.dishes.forEach(dish => {
            initialPortions[dish.id] = widget.portion_size || 1.0;
        });
        setPortionSizes(initialPortions);
    }, [widget.dishes, widget.portion_size]);

    // Set selected dish if widget is resolved
    useEffect(() => {
        if (widget.status === "resolved" && widget.selected_dish_id) {
            setSelectedDishId(widget.selected_dish_id);
        }
    }, [widget.status, widget.selected_dish_id]);

    const handleDishSelect = (dishId: number) => {
        if (widget.status === "resolved") return; // Don't allow selection if resolved
        setSelectedDishId(dishId);
    };

    const handlePortionChange = (dishId: number, portion: number) => {
        if (widget.status === "resolved") return; // Don't allow changes if resolved
        setPortionSizes(prev => ({
            ...prev,
            [dishId]: portion
        }));
    };

    const handleConfirm = (dishId: number) => {
        if (widget.status === "resolved") return; // Don't allow confirmation if resolved
        
        const portionSize = portionSizes[dishId] || 1.0;

        confirmSelection({
            widgetId: widget.widget_id,
            dishId: dishId,
            portionSize: portionSize,
        }, {
            onSuccess: () => {
                toast({
                    title: "Intake logged successfully!",
                    description: "Your meal has been added to your nutrition tracking.",
                });
            },
            onError: (error) => {
                console.error('Confirmation error:', error);
                toast({
                    title: "Error logging intake",
                    description: "Failed to log your meal. Please try again.",
                    variant: "destructive",
                });
            },
        });
    };

    const isResolved = widget.status === "resolved";

    return (
        <Card className="max-w-full mx-auto border-primary/20 bg-gradient-to-br from-blue-50/30 to-purple-50/30">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Utensils className="h-6 w-6 text-blue-600" />
                        </div>
                        <span>
                            {isResolved ? "Dish Selection - Completed" : "Choose Your Dish"}
                        </span>
                    </CardTitle>
                    {isResolved && (
                        <Badge className="bg-green-500 text-white border-green-600 px-3 py-1">
                            <Check className="h-4 w-4 mr-1" />
                            Completed
                        </Badge>
                    )}
                </div>
                <div className="mt-2">
                    {!isResolved ? (
                        <p className="text-gray-600 leading-relaxed">
                            Select the dish that best matches what you ate and adjust the portion size if needed.
                        </p>
                    ) : (
                        <p className="text-gray-600 leading-relaxed">
                            Your intake has been successfully logged. The selected dish is highlighted below.
                        </p>
                    )}
                </div>
            </CardHeader>

            <CardContent>
                {widget.dishes.length > 0 ? (
                    <div className="relative">
                        {/* Horizontal scroll container */}
                        <div className="flex gap-4 overflow-x-auto pb-4 pt-2 px-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                            {widget.dishes.map((dish) => {
                                const isSelected = selectedDishId === dish.id;
                                const wasSelectedInResolved = isResolved && widget.selected_dish_id === dish.id;

                                return (
                                    <DishCardComponent
                                        key={dish.id}
                                        dish={dish}
                                        isSelected={isSelected || wasSelectedInResolved}
                                        isResolved={isResolved}
                                        wasSelectedInResolved={wasSelectedInResolved}
                                        portionSize={
                                            wasSelectedInResolved 
                                                ? (widget.selected_portion || 1.0)
                                                : (portionSizes[dish.id] || 1.0)
                                        }
                                        onPortionChange={(portion) => handlePortionChange(dish.id, portion)}
                                        onSelect={() => handleDishSelect(dish.id)}
                                        onConfirm={() => handleConfirm(dish.id)}
                                        isConfirming={isConfirming}
                                        disabled={isResolved || isConfirming}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="max-w-sm mx-auto">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Utensils className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No dishes found</h3>
                            <p className="text-gray-500">No dishes were found for your search. Try describing your meal differently.</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 