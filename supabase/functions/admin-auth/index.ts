import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { login, password } = await req.json();

    console.log('Auth attempt for login:', login);

    // Validate admin credentials
    if (login === 'admin' && password === 'root') {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Check if admin user exists in auth.users
      const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) {
        console.error('Error listing users:', usersError);
        throw usersError;
      }

      let adminUser = users.users.find(u => u.email === 'admin@admin.com');

      // Create admin user if doesn't exist
      if (!adminUser) {
        console.log('Creating admin user...');
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: 'admin@admin.com',
          password: 'root',
          email_confirm: true,
        });

        if (createError) {
          console.error('Error creating admin user:', createError);
          throw createError;
        }

        adminUser = newUser.user;
      }

      // Check if admin role exists
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', adminUser.id)
        .eq('role', 'admin')
        .single();

      // Create admin role if doesn't exist
      if (!roleData && roleError) {
        console.log('Creating admin role...');
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: adminUser.id, role: 'admin' });

        if (insertError) {
          console.error('Error creating admin role:', insertError);
        }
      }

      // Generate session for admin user
      const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: 'admin@admin.com',
      });

      if (sessionError) {
        console.error('Error generating session:', sessionError);
        throw sessionError;
      }

      console.log('Admin authenticated successfully');

      return new Response(
        JSON.stringify({ 
          success: true, 
          user: adminUser,
          session: sessionData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.log('Invalid credentials');
      return new Response(
        JSON.stringify({ success: false, error: 'Неверный логин или пароль' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error('Auth error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
