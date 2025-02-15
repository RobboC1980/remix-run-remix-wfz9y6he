/*
  # Initial Schema for QuantumScribe

  1. New Tables
    - `profiles`
      - User profiles with role information
    - `projects`
      - Project details and metadata
    - `epics`
      - Epic-level items linked to projects
    - `user_stories`
      - User stories linked to epics
    - `tasks`
      - Individual tasks linked to user stories
    - `project_members`
      - Project membership and roles
    - `comments`
      - Comments on any artifact type
    - `activity_log`
      - Audit trail for all actions

  2. Security
    - Enable RLS on all tables
    - Add policies for read/write access based on project membership and roles
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Projects table
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'active',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Project members table
CREATE TABLE project_members (
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (project_id, user_id)
);

-- Epics table
CREATE TABLE epics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'backlog',
  priority text NOT NULL DEFAULT 'medium',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User stories table
CREATE TABLE user_stories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  epic_id uuid REFERENCES epics(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  acceptance_criteria text[],
  status text NOT NULL DEFAULT 'backlog',
  priority text NOT NULL DEFAULT 'medium',
  story_points integer,
  created_by uuid REFERENCES profiles(id),
  assigned_to uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tasks table
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_story_id uuid REFERENCES user_stories(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo',
  priority text NOT NULL DEFAULT 'medium',
  created_by uuid REFERENCES profiles(id),
  assigned_to uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Comments table
CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  content text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activity log table
CREATE TABLE activity_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL,
  details jsonb,
  performed_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE epics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can read all profiles but only update their own
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Projects: Members can view their projects
CREATE POLICY "Members can view their projects"
  ON projects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Project owners can update their projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Project Members: Members can view project membership
CREATE POLICY "Members can view project membership"
  ON project_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_id
      AND pm.user_id = auth.uid()
    )
  );

-- Epics: Project members can view epics
CREATE POLICY "Members can view project epics"
  ON epics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = epics.project_id
      AND user_id = auth.uid()
    )
  );

-- User Stories: Project members can view stories
CREATE POLICY "Members can view project stories"
  ON user_stories FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      JOIN epics e ON e.project_id = pm.project_id
      WHERE e.id = user_stories.epic_id
      AND pm.user_id = auth.uid()
    )
  );

-- Tasks: Project members can view tasks
CREATE POLICY "Members can view project tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      JOIN epics e ON e.project_id = pm.project_id
      JOIN user_stories us ON us.epic_id = e.id
      WHERE us.id = tasks.user_story_id
      AND pm.user_id = auth.uid()
    )
  );

-- Comments: Project members can view comments
CREATE POLICY "Members can view entity comments"
  ON comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = (
        CASE comments.entity_type
          WHEN 'project' THEN comments.entity_id::uuid
          WHEN 'epic' THEN (SELECT project_id FROM epics WHERE id = comments.entity_id)
          WHEN 'user_story' THEN (
            SELECT e.project_id 
            FROM user_stories us
            JOIN epics e ON e.id = us.epic_id
            WHERE us.id = comments.entity_id
          )
          WHEN 'task' THEN (
            SELECT e.project_id
            FROM tasks t
            JOIN user_stories us ON us.id = t.user_story_id
            JOIN epics e ON e.id = us.epic_id
            WHERE t.id = comments.entity_id
          )
        END
      )
      AND pm.user_id = auth.uid()
    )
  );

-- Activity Log: Project members can view activity
CREATE POLICY "Members can view project activity"
  ON activity_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = (
        CASE activity_log.entity_type
          WHEN 'project' THEN activity_log.entity_id::uuid
          WHEN 'epic' THEN (SELECT project_id FROM epics WHERE id = activity_log.entity_id)
          WHEN 'user_story' THEN (
            SELECT e.project_id 
            FROM user_stories us
            JOIN epics e ON e.id = us.epic_id
            WHERE us.id = activity_log.entity_id
          )
          WHEN 'task' THEN (
            SELECT e.project_id
            FROM tasks t
            JOIN user_stories us ON us.id = t.user_story_id
            JOIN epics e ON e.id = us.epic_id
            WHERE t.id = activity_log.entity_id
          )
        END
      )
      AND pm.user_id = auth.uid()
    )
  );