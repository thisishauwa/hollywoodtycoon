// Supabase Edge Function: advance-clock
// This function should be called via a cron job to automatically advance the game clock
// Set up a cron job in Supabase to call this function every hour

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Call the advance_global_clock function
    const { data, error } = await supabase.rpc('advance_global_clock')

    if (error) {
      console.error('Error advancing clock:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const result = data?.[0]

    if (result?.advanced) {
      console.log(`Clock advanced to ${result.new_month}/${result.new_year}`)

      // TODO: Trigger game events for month advancement
      // - Process film productions
      // - Check for award ceremonies
      // - Generate news events

      return new Response(
        JSON.stringify({
          success: true,
          advanced: true,
          month: result.new_month,
          year: result.new_year,
          message: `Clock advanced to ${result.new_month}/${result.new_year}`
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    } else {
      return new Response(
        JSON.stringify({
          success: true,
          advanced: false,
          month: result?.new_month,
          year: result?.new_year,
          message: 'Clock not ready to advance yet'
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
