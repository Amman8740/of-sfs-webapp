import nodemailer from 'nodemailer';

let transporter: any = null;

async function getTransporter() {
  if (transporter) {
    return transporter;
  }

  console.log('Creating new NodeMailer transporter...');
  
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    connectionTimeout: 10000,  // Increased to 10 seconds
    socketTimeout: 10000,      // Increased to 10 seconds
    greetingTimeout: 10000,
    pool: {
      maxConnections: 1,       // Single connection to avoid conflicts
      maxMessages: Infinity,
      rateDelta: 500,          // Less aggressive rate limiting
      rateLimit: 10            // 10 messages per rateDelta
    }
  } as any);

  // Don't verify connection - just return transporter
  // Verification often times out but sending might still work
  console.log('✅ NodeMailer transporter created');

  return transporter;
}

export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    console.log('📧 Starting email send to:', to);
    
    const mailTransporter = await getTransporter();
    
    // Send with timeout
    const sendPromise = new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Email send timeout - will retry via queue'));
      }, 15000); // 15 second timeout

      mailTransporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to,
        subject,
        html,
        replyTo: process.env.SMTP_USER
      }, (err: any, info: any) => {
        clearTimeout(timeoutId);
        if (err) {
          reject(err);
        } else {
          resolve(info);
        }
      });
    });

    const result = await sendPromise;
    console.log('✅ Email sent successfully:', (result as any).messageId);
    return { success: true, messageId: (result as any).messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}

export async function sendModelCreationEmail({
  to,
  fullName,
  email,
  password
}: {
  to: string;
  fullName: string;
  email: string;
  password: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 8px;
        }
        .header {
          background-color: #2563eb;
          color: white;
          padding: 20px;
          border-radius: 8px 8px 0 0;
          text-align: center;
        }
        .content {
          background-color: white;
          padding: 30px;
          border-radius: 0 0 8px 8px;
        }
        .credentials-box {
          background-color: #f0f4f8;
          padding: 20px;
          border-left: 4px solid #2563eb;
          margin: 20px 0;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
        }
        .credential-item {
          margin: 10px 0;
          padding: 8px;
          background-color: white;
          border-radius: 4px;
        }
        .label {
          font-weight: bold;
          color: #2563eb;
          display: inline-block;
          width: 100px;
        }
        .value {
          word-break: break-all;
          display: inline-block;
          width: calc(100% - 110px);
        }
        .login-url {
          text-align: center;
          margin: 20px 0;
        }
        .login-btn {
          display: inline-block;
          padding: 12px 30px;
          background-color: #2563eb;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
        }
        .warning {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
          color: #92400e;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to OF Assist!</h1>
          <p>Your Creator Account has been created</p>
        </div>
        
        <div class="content">
          <p>Hello <strong>${fullName}</strong>,</p>
          
          <p>Your creator account has been successfully created on OF Assist. Below are your login credentials:</p>
          
          <div class="credentials-box">
            <div class="credential-item">
              <span class="label">📧 Email:</span>
              <span class="value"><strong>${email}</strong></span>
            </div>
            <div class="credential-item">
              <span class="label">🔐 Password:</span>
              <span class="value"><strong>${password}</strong></span>
            </div>
          </div>
          
          <div class="login-url">
            <p>Click the button below to log in:</p>
            <a href="https://ofassist.com/signin" class="login-btn">Login to OF Assist</a>
          </div>
          
          <p style="text-align: center; margin-top: 20px;">Or visit: <a href="https://ofassist.com/signin">https://ofassist.com/signin</a></p>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong>
            <p>Please keep these credentials safe and secure. We recommend changing your password after your first login.</p>
          </div>
          
          <p>If you have any questions or need assistance, please contact our support team.</p>
          
          <div class="footer">
            <p>Best regards,<br><strong>OF Assist Team</strong></p>
            <p>© ${new Date().getFullYear()} OF Assist. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendMail({
    to,
    subject: `Welcome to OF Assist! Your Creator Account - ${fullName}`,
    html
  });
}
