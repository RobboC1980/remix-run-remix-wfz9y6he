import { json, redirect, type ActionFunctionArgs } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { Button } from '~/components/ui/button';
import { requireAuth } from '~/lib/auth.server';
import { supabase } from '~/lib/supabase.server';

export async function action({ request }: ActionFunctionArgs) {
  const session = await requireAuth(request);
  const formData = await request.formData();
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  // Create project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      name,
      description,
      created_by: session.user.id,
    })
    .select()
    .single();

  if (projectError) {
    return json({ error: projectError.message });
  }

  // Add creator as project member with owner role
  const { error: memberError } = await supabase.from('project_members').insert({
    project_id: project.id,
    user_id: session.user.id,
    role: 'owner',
  });

  if (memberError) {
    return json({ error: memberError.message });
  }

  return redirect(`/projects/${project.id}`);
}

export default function NewProject() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-8 shadow">
          <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>

          <Form method="post" className="mt-6 space-y-6">
            {actionData?.error && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                {actionData.error}
              </div>
            )}

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Project Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" type="button" onClick={() => window.history.back()}>
                Cancel
              </Button>
              <Button type="submit">Create Project</Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}