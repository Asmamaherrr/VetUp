const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupStorageBuckets() {
  try {
    console.log('Setting up storage buckets...')

    // Create lesson-videos bucket
    const { data: videoBucket, error: videoError } = await supabase.storage.createBucket('lesson-videos', {
      public: true,
      allowedMimeTypes: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
      fileSizeLimit: 524288000 // 500MB
    })

    if (videoError && !videoError.message.includes('already exists')) {
      console.error('Error creating lesson-videos bucket:', videoError)
    } else {
      console.log('✅ lesson-videos bucket ready')
    }

    // Create lesson-pdfs bucket
    const { data: pdfBucket, error: pdfError } = await supabase.storage.createBucket('lesson-pdfs', {
      public: true,
      allowedMimeTypes: ['application/pdf'],
      fileSizeLimit: 52428800 // 50MB
    })

    if (pdfError && !pdfError.message.includes('already exists')) {
      console.error('Error creating lesson-pdfs bucket:', pdfError)
    } else {
      console.log('✅ lesson-pdfs bucket ready')
    }

    // Set up RLS policies for lesson-videos bucket
    const { error: videoPolicyError } = await supabase.rpc('setup_storage_policies', {
      bucket_name: 'lesson-videos'
    })

    if (videoPolicyError) {
      console.error('Error setting up video policies:', videoPolicyError)
    } else {
      console.log('✅ lesson-videos policies configured')
    }

    // Set up RLS policies for lesson-pdfs bucket
    const { error: pdfPolicyError } = await supabase.rpc('setup_storage_policies', {
      bucket_name: 'lesson-pdfs'
    })

    if (pdfPolicyError) {
      console.error('Error setting up PDF policies:', pdfPolicyError)
    } else {
      console.log('✅ lesson-pdfs policies configured')
    }

    console.log('🎉 Storage setup complete!')

  } catch (error) {
    console.error('Setup failed:', error)
    process.exit(1)
  }
}

setupStorageBuckets()
