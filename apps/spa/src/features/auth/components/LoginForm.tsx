import { useAppForm } from "@/lib/form/form";
import { loginSchema } from "../schemas/login.schema";
import { useLogin } from "../hooks/useLogin";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function LoginForm() {
	const loginMutation = useLogin();

	const form = useAppForm({
		defaultValues: {
			username: "",
			password: "",
		},
		validators: {
			onSubmit: loginSchema,
		},
		onSubmit: ({ value }) => {
			loginMutation.mutate(value);
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className="flex flex-col gap-5"
		>
			<form.AppField
				name="username"
				children={(field) => (
					<field.Input
						id="login-username"
						label="Usuario"
						placeholder="Ingresa tu nombre de usuario"
					/>
				)}
			/>

			<form.AppField
				name="password"
				children={(field) => (
					<field.Input
						id="login-password"
						label="Contraseña"
						placeholder="Ingresa tu contraseña"
						type="password"
					/>
				)}
			/>

			<Button
				type="submit"
				size="lg"
				className="mt-2 w-full"
				disabled={loginMutation.isPending}
			>
				{loginMutation.isPending ? (
					<>
						<Loader2 className="animate-spin" />
						Iniciando sesión...
					</>
				) : (
					"Iniciar Sesión"
				)}
			</Button>
		</form>
	);
}
