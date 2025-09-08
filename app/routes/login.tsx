import React from "react";
import { Router, useNavigate } from "react-router";

export function meta() {
	return [
		{ title: "ExamGuard - Login" },
		{ name: "description", content: "Login - ExamGuard" },
	];
}

export default function Login() {
    const navigate = useNavigate();


	return (
		<main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-blue-600 text-white">
			<div className="bg-white bg-opacity-10 rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col items-center">
				<h1 className="text-4xl font-bold mb-2 text-center text-black drop-shadow-lg">ExamGuard</h1>
				<h2 className="text-lg mb-6 text-black">Acesse sua conta</h2>
				<form className="w-full flex flex-col gap-4">
					<input
						type="email"
						placeholder="E-mail"
						className="p-3 rounded bg-white bg-opacity-80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
						required
					/>
					<input
						type="password"
						placeholder="Senha"
						className="p-3 rounded bg-white bg-opacity-80 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
						required
					/>
					<button
						// type="submit"
						className="mt-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded transition-colors"
                        onClick={() => {navigate('/dashboard')}}
					>
						Entrar
					</button>
				</form>
			</div>
			<p className="mt-8 text-blue-100 text-sm">&copy; {new Date().getFullYear()} ExamGuard</p>
		</main>
	);
}
