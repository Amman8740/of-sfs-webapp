import { createServiceRoleClient } from '../supabase/server';

export interface EmailQueueItem {
  id?: string;
  to: string;
  subject: string;
  html: string;
  fullName?: string;
  email?: string;
  password?: string;
  status?: 'pending' | 'sent' | 'failed';
  created_at?: string;
}

export async function queueEmail(emailData: EmailQueueItem) {
  try {
    const supabase = createServiceRoleClient();
    
    console.log('📧 Queuing email to:', emailData.to);
    
    // Store in database instead of sending immediately
    const { data, error } = await (supabase as any)
      .from('email_queue')
      .insert({
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        full_name: emailData.fullName,
        email: emailData.email,
        password: emailData.password,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error queuing email:', error);
      throw error;
    }

    console.log('✅ Email queued successfully:', data?.id);
    return { success: true, queueId: data?.id };
  } catch (error) {
    console.error('❌ Error in email queue:', error);
    throw error;
  }
}

export async function processEmailQueue() {
  try {
    const supabase = createServiceRoleClient();
    
    console.log('🔄 Processing email queue...');
    
    // Get pending emails
    const { data: pendingEmails, error: fetchError } = await (supabase as any)
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .limit(10)
      .order('created_at', { ascending: true });

    if (fetchError) {
      console.error('❌ Error fetching pending emails:', fetchError);
      return;
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      console.log('ℹ️ No pending emails to process');
      return;
    }

    console.log(`📧 Found ${pendingEmails.length} pending emails to send`);

    // Import sendMail here to avoid circular dependencies
    const { sendMail } = await import('./sendMail');

    for (const email of pendingEmails) {
      try {
        console.log(`📤 Sending email to ${email.to}...`);
        
        await sendMail({
          to: email.to,
          subject: email.subject,
          html: email.html
        });

        // Mark as sent
        await (supabase as any)
          .from('email_queue')
          .update({ status: 'sent' })
          .eq('id', email.id);

        console.log(`✅ Email sent to ${email.to}`);
      } catch (error) {
        console.error(`❌ Failed to send email to ${email.to}:`, error);
        
        // Mark as failed
        await (supabase as any)
          .from('email_queue')
          .update({ status: 'failed' })
          .eq('id', email.id);
      }
    }

    console.log('✅ Email queue processing completed');
  } catch (error) {
    console.error('❌ Error processing email queue:', error);
  }
}
