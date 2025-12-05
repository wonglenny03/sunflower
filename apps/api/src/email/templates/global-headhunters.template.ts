/**
 * Global Headhunters 邮件模板
 * 基于用户提供的邮件内容格式化
 */
export const GLOBAL_HEADHUNTERS_TEMPLATE = {
  name: 'Global Headhunters - 招聘服务介绍',
  subject: '商务合作咨询 - {{companyName}}',
  content: `
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, 'Microsoft YaHei', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            margin-bottom: 30px;
          }
          .content {
            margin-bottom: 30px;
          }
          .signature {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }
          .divider {
            border: none;
            border-top: 2px dashed #ccc;
            margin: 30px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <p>Dear Sir/Mdm,</p>
        </div>

        <div class="content">
          <p>
            Global Headhunters is delighted to have the opportunity to introduce the company as a premier recruitment specialist, 
            offering <strong>Executive Talent Acquisition</strong>, <strong>International Workforce Solutions</strong> and 
            <strong>Staff Contract Management Services</strong> across various industries since 2007, originating in Singapore.
          </p>

          <p>
            We are committed to assist your company to source for candidates who fit your requirements. 
            I have attached our Company profile as our proposal, as well as the Job Query Form to understand the requirements 
            of the positions required.
          </p>

          <p>
            Please endorse and fill in accordingly, email it back to us. Nevertheless, we will be happy to discuss further, 
            should you have any concerns regarding the terms stated. Look forward to hearing from you soon.
          </p>

          <p>Thank you.</p>
        </div>

        <hr class="divider">

        <div class="signature">
          <p><strong>Best regards,</strong></p>
          <p><strong>Kelvin Lim</strong></p>
          <p>Mobile: (60) 11333 99278</p>
          <br>
          <p>
            <strong>Agensi Pekerjaan Global Headhunters Sdn Bhd</strong><br>
            11-2, Jalan Cempaka SD 12/1,<br>
            Bandar Sri Damansara,<br>
            52200 Kuala Lumpur
          </p>
        </div>
      </body>
    </html>
  `,
}

