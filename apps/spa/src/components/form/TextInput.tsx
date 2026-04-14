import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { useFieldContext } from "@/lib/form/form";
import { Activity, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface TextInputProps {
  label: string;
  id: string;
  placeholder: string;
  description?: string;
  type?: React.InputHTMLAttributes<HTMLInputElement>["type"];
}

const TextInput = ({
  label,
  id,
  placeholder,
  description,
  type = "text",
}: TextInputProps) => {
  const field = useFieldContext<string>();
  const displayErrors = field.state.meta.isTouched && !field.state.meta.isValid;

  const [showPassword, setShowPassword] = useState(false);

  const isPasswordField = type === "password";

  const inputType = isPasswordField
    ? showPassword
      ? "text"
      : "password"
    : type;

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>

      <div className="relative">
        <Input
          id={id}
          placeholder={placeholder}
          type={inputType}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          className={cn(isPasswordField && "pr-10")}
        />

        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/80 hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-sm"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="icon-sm" />
            ) : (
              <Eye className="icon-sm" />
            )}
          </button>
        )}
      </div>

      {description && <FieldDescription>{description}</FieldDescription>}

      <Activity mode={!displayErrors ? "hidden" : "visible"}>
        <FieldError>
          {field.state.meta.errors.map((error) => error?.message).join(", ")}
        </FieldError>
      </Activity>
    </Field>
  );
};

export default TextInput;
