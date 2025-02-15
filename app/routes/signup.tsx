import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData } from '@remix-run/react';
import { Button } from '~/components/ui/button';
import type { ActionFunctionArgs } from '@remix-run/node';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { handleAuthAction } from '~/lib/auth.server';

export async function action({ request }: ActionFunctionArgs) {
  return handleAuthAction(request, 'signup');
}

export default function SignUp() {
  const actionData = useActionData<typeof action>();

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-zinc-900 p-8 shadow-lg border border-zinc-800">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-blue-400 hover:text-blue-300"
            >
              Sign in
            </Link>
          </p>
        </div>

        <Form method="post" className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-zinc-200"
              >
                Full name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-200"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-200"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 [&::-ms-reveal]:hidden"
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white">
            Create account
          </Button>
        </Form>
      </div>
    </div>
  );
}