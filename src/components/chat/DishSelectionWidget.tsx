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
                border rounded-lg p-3 transition-all cursor-pointer relative
                ${isSelected
                    ? wasSelectedInResolved
                        ? "border-green-500 bg-green-50/50" // Different styling for resolved selection
                        : "border-blue-500 bg-blue-50/50" // Active selection
                    : "border-gray-200 hover:border-gray-300"
                }
                ${isResolved && !wasSelectedInResolved ? "opacity-50" : ""}
                ${disabled ? "cursor-not-allowed" : ""}
            `}
            onClick={() => !isResolved && onSelect()}
        >
            {wasSelectedInResolved && (
                <div className="absolute top-2 right-2">
                    <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Selected
                    </Badge>
                </div>
            )}

            <div className="flex gap-3">
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                    {dish.image_url ? (
                        <img
                            src={dish.image_url}
                            alt={dish.name}
                            className="w-12 h-12 rounded-md object-cover"
                            onError={(e) => {
                                e.currentTarget.src = `data:image/svg+xml,${encodeURIComponent(`
                                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="48" height="48" fill="#f3f4f6"/>
                                        <path d="M24 14c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-8 8h16v8l-4-3-4 4-4-3v-6z" fill="#9ca3af"/>
                                    </svg>
                                `)}`;
                            }}
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                                <path d="M12 7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-4 4h8v4l-2-1.5-2 2-2-1.5V11z" fill="currentColor"/>
                            </svg>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-semibold text-gray-900 truncate ${wasSelectedInResolved ? "text-green-700" : ""}`}>
                                {dish.name}
                            </h4>
                            {dish.description && (
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                    {dish.description}
                                </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                                {dish.cuisine && (
                                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                                        {dish.cuisine}
                                    </Badge>
                                )}
                                {dish.calories && (
                                    <span className="text-xs text-gray-500">
                                        {dish.calories} cal
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Portion Control and Action */}
                    {isSelected && (
                        <div className="mt-3 flex items-center gap-2">
                            <div className="flex items-center gap-1">
                                <label className="text-xs text-gray-600">Portion:</label>
                                <Input
                                    type="number"
                                    min="0.1"
                                    max="10"
                                    step="0.1"
                                    value={portionSize}
                                    onChange={(e) => onPortionChange(Number(e.target.value))}
                                    className="w-16 h-7 text-xs"
                                    disabled={isResolved}
                                />
                                <span className="text-xs text-gray-500">×</span>
                            </div>

                            {!isResolved && (
                                <Button
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onConfirm();
                                    }}
                                    disabled={isConfirming}
                                    className="h-7 px-3 text-xs"
                                >
                                    {isConfirming ? (
                                        <>
                                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                            Logging...
                                        </>
                                    ) : (
                                        "Confirm"
                                    )}
                                </Button>
                            )}

                            {wasSelectedInResolved && (
                                <div className="text-xs text-green-600 font-medium">
                                    ✓ Logged {portionSize}× serving
                                </div>
                            )}
                        </div>
                    )}
                </div>
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
            portionSize: portionSize
        }, {
            onSuccess: () => {
                toast({
                    title: "Intake Logged!",
                    description: "Your meal has been successfully recorded.",
                });
            },
            onError: (error) => {
                console.error("Failed to confirm selection:", error);
                toast({
                    title: "Error",
                    description: "Failed to log your intake. Please try again.",
                    variant: "destructive",
                });
            }
        });
    };

    const isResolved = widget.status === "resolved";

    return (
        <Card className="max-w-2xl mx-auto border-primary/20">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Utensils className="h-5 w-5" />
                        {isResolved ? "Dish Selection - Completed" : "Choose Your Dish"}
                    </CardTitle>
                    {isResolved && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                            <Check className="h-3 w-3 mr-1" />
                            Logged
                        </Badge>
                    )}
                </div>
                {!isResolved && (
                    <p className="text-sm text-muted-foreground">
                        Select the dish that best matches what you ate and adjust the portion size if needed.
                    </p>
                )}
                {isResolved && (
                    <p className="text-sm text-muted-foreground">
                        Your intake has been successfully logged. The selected dish is highlighted below.
                    </p>
                )}
            </CardHeader>

            <CardContent>
                <div className="space-y-2">
                    {widget.dishes.length > 0 ? (
                        widget.dishes.map((dish) => {
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
                        })
                    ) : (
                        <div className="text-center py-4 text-muted-foreground">
                            No dishes found for your search.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 