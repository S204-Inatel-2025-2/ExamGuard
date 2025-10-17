import api from "~/services/axios-backend-client"
import { Crosshair } from "lucide-react"
import { useState, useEffect } from "react"
import { LoginForm } from "~/components/login-form"
import { RegisterForm } from "~/components/register-form"
import { useActionData, useNavigate } from "react-router"
import { LoginEndpoints } from "~/utils/constants"
export interface AuthState {
	state: "login" | "register"
}

export async function action({ request }: { request: Request }) {
  try {
    const formData = await request.formData();
    const email = formData.get("email");
    const password = formData.get("password");
    const name = formData.get("name");
    const mode = formData.get("mode") as keyof typeof LoginEndpoints;
    const endpoint = LoginEndpoints[mode];

    const apiResponse = await api.post(`${import.meta.env.VITE_API_URL}${endpoint}`, {
      email,
      password,
      name
    });

    const token = apiResponse.data?.token;

    return { token };
  } catch (error) { // TODO: improve error handling
    console.error("Error during login:", error);
  }
}

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
	const [authState, setAuthState] = useState<AuthState>({ state: "login" })
  let navigate = useNavigate();

  useEffect(() => {
    if (actionData?.token) {
      localStorage.setItem("token", actionData.token);
      navigate('/dashboard');
    }
  }, [actionData]);

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <Crosshair className="size-4" />
            </div>
            ExamGuard
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            {  authState.state === 'login' && <LoginForm setAuthState={setAuthState} actionData={actionData} /> }
            {  authState.state === 'register' && <RegisterForm setAuthState={setAuthState} /> }
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/login-mascot.png"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
