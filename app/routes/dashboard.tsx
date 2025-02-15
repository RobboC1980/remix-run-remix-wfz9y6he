import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { Plus } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { requireAuth } from '~/lib/auth.server';
import { supabase } from '~/lib/supabase.server';
import { formatDate } from '~/lib/utils';

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await requireAuth(request);

  const { data: projects } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      description,
      status,
      created_at,
      project_members!inner (
        user_id,
        role
      )
    `)
    .eq('project_members.user_id', session.user.id);

  return json({ projects });
}

export default function Dashboard() {
  const { projects } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Projects
            </h1>
            <Link to="/projects/new">
              <Button className="gap-2">
                <Plus size={16} />
                New Project
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects?.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="block rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {project.name}
                  </h2>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      project.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
                {project.description && (
                  <p className="mt-2 text-sm text-gray-600">
                    {project.description}
                  </p>
                )}
                <div className="mt-4 text-xs text-gray-500">
                  Created {formatDate(project.created_at)}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}