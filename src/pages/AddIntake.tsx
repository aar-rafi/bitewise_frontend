import { useEffect, useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { dishesApi } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { intakesApi } from "@/lib/api";

export default function AddIntake() {
  const [portionSize, setPortionSize] = useState("");
  const [waterAmount, setWaterAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dishQuery, setDishQuery] = useState("");
  const [selectedDish, setSelectedDish] = useState<{id: number; name: string} | null>(null);

  const navigate = useNavigate();

  const {data : dishResults, isLoading: isSearching} = useQuery({
        queryKey : ["dishes", dishQuery],
        queryFn: () => dishesApi.search(dishQuery),
        enabled: dishQuery.length > 1,
  });
  
  const mutation = useMutation({
    mutationFn: (data: { dish_id: number; intake_time: string; portion_size: number; water_ml: number }) => intakesApi.create(data),
    onSuccess: () => {
      toast.success("Intake added!");
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add intake");
    },
  });

  const handleSubmit = async (e : React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if(!selectedDish){
      setError("Please fill in all fields");
      return;
    }

    mutation.mutate({
        dish_id: selectedDish?.id,
        intake_time: new Date().toISOString(),
        portion_size: portionSize ? Number(portionSize) : 1,
        water_ml: waterAmount ? Number(waterAmount) : 0,
    });
    
  };

  return (
    <div className = "min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <Card className = "w-full max-w-md p-6">
            <CardHeader>
                <CardTitle>
                    Add Intake
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit = {handleSubmit} className = "space-y-4">
                    <div>
                        <Label htmlFor = "dishQuery">
                            Dish Name
                        </Label>
                        <Input
                            id="dishQuery"
                            value={dishQuery}
                            onChange={(e)=> {
                                    setDishQuery(e.target.value);
                                    setSelectedDish(null);
                                }
                            }
                            placeholder="Search for a dish"
                            required
                        />
                        {dishResults?.dishes && selectedDish?.name !== dishQuery && (
                            <ul className = "border rounded bg-white max-h-40 overflow-y-auto">
                                {dishResults.dishes.map((dish) =>(
                                    <li
                                        key = {dish.id}
                                        className = {`p-2 cursor-pointer hover:bg-green-100 ${selectedDish?.id === dish.id ? "bg-green-200" : ""}`}
                                        onClick={()=> {
                                            setSelectedDish(dish)
                                            setDishQuery(dish.name)
                                        }}
                                    >
                                        {dish.name}
                                    </li>
                                ))

                                }
                            </ul>
                        )

                        }

                        {selectedDish && (
                            <div className = "mt-2 text-green-700">
                                Selected: {selectedDish.name}
                            </div>
                        )}
                    </div>
                    <div>
                        <Label htmlFor = "portionSize">
                            Portion Size
                        </Label>
                        <Input
                            id="portionSize"
                            type="number"
                            value={portionSize}
                            onChange={(e)=> setPortionSize(e.target.value)}
                            placeholder="Enter Portion Size"
                        />
                    </div>
                    <div>
                        <Label htmlFor = "waterAmount">
                            Water Amount (ml)
                        </Label>
                        <Input
                            id="waterAmount"
                            type="number"
                            value={waterAmount}
                            onChange={(e)=> setWaterAmount(e.target.value)}
                            placeholder="Enter Water Amount"
                        />
                    </div>
                    {error && <div className="text-red-600">{error}</div>}
                    <Button type="submit" className = "w-full text-lg font-bold shadow-md bg-gradient-to-r from-nutrition-green to-nutrition-emerald text-white hover:scale-105 transition-transform" disabled={!selectedDish || mutation.isPending}>
                        {mutation.isPending ? "Adding..." : "Add Intake"}
                    </Button>
                </form>
            </CardContent>
        </Card>

    </div>
  )
  
} 