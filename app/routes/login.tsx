import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData } from '@remix-run/react';
import { Button } from '~/components/ui/button';
import type { ActionFunctionArgs } from '@remix-run/node';
import { useEffect, useTransition, useState } from 'react';
import { toast } from 'sonner';
import { getSupabaseClient } from '~/lib/supabase.server';
import { useHydrated } from '~/hooks/use-hydrated';
import { handleAuthAction } from '~/lib/auth.server';

export async function action({ request }: ActionFunctionArgs) {
  return handleAuthAction(request, 'login');
}

export default function Login() {
  const actionData = useActionData<typeof action>();
  const isHydrated = useHydrated();
  const transition = useTransition(); 
  const [toastShown, setToastShown] = useState(false);

  useEffect(() => {
    if (isHydrated && actionData?.error && !toastShown) {
      toast.error(actionData.error);
      setToastShown(true);
    }
  }, [actionData, isHydrated, toastShown]);

  // Reset toast state on new form submission
  useEffect(() => {
    if (transition.state === 'submitting') {
      setToastShown(false);
    }
  }, [transition.state]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-zinc-900 p-8 shadow-lg border border-zinc-800">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-white">
            Sign in to QuantumScribe
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-400">
            Or{' '}
            <Link
              to="/signup"
              className="font-medium text-blue-400 hover:text-blue-300"
            >
              create a new account
            </Link>
          </p>
        </div>

        <Form method="post" className="mt-8 space-y-6">
          <div className="space-y-4 rounded-md shadow-sm">
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
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white">
            {transition.state === 'submitting' ? 'Signing in...' : 'Sign in'}
          </Button>
        </Form>
      </div>
    </div>
  );
}