import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type FormValue = string | number | boolean | string[] | undefined;
export type FormValues = Record<string, FormValue>;

export type FieldConfig = {
  name: string;
  label: string;
  type?: "text" | "email" | "number" | "date" | "time" | "textarea" | "select";
  placeholder?: string;
  options?: { label: string; value: string }[];
  colSpan?: "full" | "half";
};

type EntityFormDialogProps = {
  open: boolean;
  title: string;
  description: string;
  fields: FieldConfig[];
  schema: z.ZodType;
  defaultValues: FormValues;
  submitLabel: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: FormValues) => Promise<void> | void;
};

export function EntityFormDialog({
  open,
  title,
  description,
  fields,
  schema,
  defaultValues,
  submitLabel,
  onOpenChange,
  onSubmit,
}: EntityFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  async function submit(values: FormValues) {
    clearErrors();
    const parsed = schema.safeParse(values);

    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        if (typeof fieldName === "string") {
          setError(fieldName, { message: issue.message });
        }
      });
      return;
    }

    await onSubmit(parsed.data as FormValues);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border bg-muted/25 p-5 pr-12">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form className="grid gap-5 p-5" onSubmit={handleSubmit(submit)}>
          <div className="grid gap-5 sm:grid-cols-2">
            {fields.map((field) => {
              const errorMessage = errors[field.name]?.message;
              const common = {
                id: field.name,
                placeholder: field.placeholder,
                ...register(field.name, {
                  valueAsNumber: field.type === "number",
                }),
              };

              return (
                <div
                  key={field.name}
                  className={
                    field.colSpan === "full"
                      ? "space-y-2 sm:col-span-2"
                      : "space-y-2"
                  }
                >
                  <Label
                    htmlFor={field.name}
                    className="text-xs font-bold uppercase text-muted-foreground"
                  >
                    {field.label}
                  </Label>
                  {field.type === "textarea" ? (
                    <Textarea {...common} />
                  ) : field.type === "select" ? (
                    <Select {...common}>
                      <option value="">Selecione</option>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Input type={field.type ?? "text"} {...common} />
                  )}
                  {errorMessage ? (
                    <p className="rounded-md bg-destructive/10 px-2 py-1 text-xs text-destructive">
                      {String(errorMessage)}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>

          <DialogFooter className="-mx-5 -mb-5 border-t border-border bg-muted/20 p-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
