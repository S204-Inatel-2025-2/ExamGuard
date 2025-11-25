/* eslint-disable react-refresh/only-export-components */
import api from "~/services/axios-backend-client";
import { Crosshair } from "lucide-react";
import { useState, useEffect } from "react";
import { LoginForm } from "~/components/login-form";
import { RegisterForm } from "~/components/register-form";
import { useActionData, useNavigate } from "react-router";
import { LoginEndpoints } from "~/utils/constants";
import { toast } from "sonner";
import { getLoginErrorMessageFromStatus } from "~/utils/utils";
import { auth } from "~/utils/auth";

export interface AuthState {
  state: "login" | "register";
}

export async function action({ request }: { request: Request }) {
  try {
    const formData = await request.formData();
    const email = formData.get("email");
    const password = formData.get("password");
    const name = formData.get("name");
    const mode = formData.get("mode") as keyof typeof LoginEndpoints;
    const endpoint = LoginEndpoints[mode];

    const apiResponse = await api.post(
      `${import.meta.env.VITE_API_URL}${endpoint}`,
      {
        email,
        password,
        name,
      },
    );

    const token = apiResponse.data?.token || "dev";

    return { token, mode };
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any;
    const status = err.response?.status ?? 500;
    const message =
      err.response?.data?.message ??
      getLoginErrorMessageFromStatus(status) ??
      "Unexpected server error";

    return {
      error: {
        status,
        message: String(message),
      },
    };
  }
}

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const [authState, setAuthState] = useState<AuthState>({ state: "login" });
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!actionData) return;

    if (actionData.error) {
      toast.error(actionData.error.message ?? "Unknown error");
      return;
    }

    if (actionData.mode === "LOGIN" && actionData.token) {
      auth.setToken(actionData.token);
      toast.success("Logged in successfully!");
      navigate("/dashboard", { replace: true });
    }

    if (actionData.mode === "REGISTER") {
      setAuthState({ state: "login" });
      toast.success("Registered successfully!");
    }
  }, [actionData, navigate]);

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
            {authState.state === "login" && (
              <LoginForm setAuthState={setAuthState} actionData={actionData} />
            )}
            {authState.state === "register" && (
              <RegisterForm setAuthState={setAuthState} />
            )}
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/login-mascot.png"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
