import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { intakesApi, type CreateIntakeRequest, type ApiError } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Plus, Loader2 } from "lucide-react";

const intakeSchema = z
  .object({
    dish_id: z.number().min(1, "Please select a dish"),
    portion_size: z.number().min(0.1, "Portion size must be greater than 0"),
    water_ml: z.number().min(0, "Water intake cannot be negative"),
    intake_time: z.string().min(1, "Please select intake time"),
  })
  .required();

type IntakeFormValues = z.infer<typeof intakeSchema>;

export default function LogIntakeDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<IntakeFormValues>({
    resolver: zodResolver(intakeSchema),
    defaultValues: {
      dish_id: 0,
      portion_size: 1,
      water_ml: 0,
      intake_time: new Date().toISOString(),
    },
  });

  const { mutate: createIntake, isPending } = useMutation({
    mutationFn: (data: CreateIntakeRequest) => intakesApi.create(data),
    onSuccess: () => {
      toast.success("Food intake logged successfully!");
      queryClient.invalidateQueries({ queryKey: ["intakes"] });
      setOpen(false);
      form.reset();
    },
    onError: (error: ApiError) => {
      toast.error("Failed to log intake", {
        description: error.message,
      });
    },
  });

  const onSubmit = (data: IntakeFormValues) => {
    createIntake(data as CreateIntakeRequest);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Log Intake
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Food Intake</DialogTitle>
          <DialogDescription>
            Record what you ate and when you ate it.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="dish_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dish</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter dish ID"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="portion_size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portion Size</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Enter portion size"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="water_ml"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Water (ml)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter water intake in ml"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="intake_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="gap-2">
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isPending ? "Logging..." : "Log Intake"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
