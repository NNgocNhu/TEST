"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("abc@gmail.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Login success");
      router.push(callbackUrl);
    }
  };
  return (
    <main>
      <div className="container">
        <div className="row d-flex justify-content-center align-items-center vh-100">
          <div className="col-lg-5 shadow bg-light p-5">
            <h2 className="mb-4 text-center">Login</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control mb-4"
                placeholder="Enter your email"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control mb-4"
                placeholder="Enter your password"
              />
              <button
                className="btn btn-primary btn-raised"
                disabled={loading || !email || !password}
              >
                {loading ? "Loading..." : "Submit"}
              </button>
            </form>
            <div className="d-flex justify-content-between">
              <button
                className="btn btn-danger btn-raised mb-4"
                onClick={() => signIn("google", { callbackUrl })}
              >
                Sign in with Google
              </button>

              <Link className="btn mb-4" href="/forgot-password">
                <small>Forgot Password</small>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
