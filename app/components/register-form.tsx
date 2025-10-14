"use client"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import type { AuthState } from "~/pages/login"

export function RegisterForm({ setAuthState }: { setAuthState: (state: AuthState) => void }) {
  return (
    <form className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" type="text" placeholder="John Doe" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="me@example.com" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" />
      </div>
      <Button type="submit" className="w-full">
        Create account
      </Button>
        <div className="text-center text-sm">
        Already have an account?{" "}
        <button onClick={() => setAuthState({ state: "login" })} className="underline underline-offset-4 cursor-pointer">
          Sign in
        </button>
      </div>
    </form>
  )
}
