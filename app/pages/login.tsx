import { Crosshair } from "lucide-react"
import { useState } from "react"
import { LoginForm } from "~/components/login-form"
import { RegisterForm } from "~/components/register-form"
export interface AuthState {
	state: "login" | "register"
}

export default function LoginPage() {
	const [authState, setAuthState] = useState<AuthState>({ state: "login" })
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
            {  authState.state === 'login' && <LoginForm setAuthState={setAuthState} /> }
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
