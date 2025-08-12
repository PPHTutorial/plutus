export const BybitDeposit = () => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>USDT Deposit Successful</title>
        <style>
            body { 
                margin: 0; 
                padding: 0; 
                background-color: #efefef; 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; 
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: #ffffff; 
            }
            .header { 
                width: 100%; 
                text-align: center; 
                padding: 30px 0; 
                background-color: #070606;
            }
            .header img { 
                width: 120px; 
                height: auto; 
                display: block; 
                margin: 0 auto; 
            }
            .content { 
                padding: 30px 40px; 
            }
            .title { 
                font-size: 24px; 
                font-weight: 700; 
                color: #1a1a1a; 
                margin-bottom: 20px;
                text-align: center;
            }
            .success-icon {
                text-align: center;
                margin: 20px 0;
            }
            .amount-section {
                background-color: #f8f9fa;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                text-align: center;
            }
            .amount {
                font-size: 28px;
                font-weight: 700;
                color: #1a1a1a;
                margin-bottom: 10px;
            }
            .currency {
                font-size: 16px;
                color: #666;
                margin-bottom: 15px;
            }
            .message { 
                font-size: 14px; 
                line-height: 22px; 
                color: #333; 
                margin-bottom: 20px; 
            }
            .message a { 
                color: #f7931a; 
                text-decoration: none; 
            }
            .info-box {
                background-color: #fff3e0;
                border-left: 4px solid #f7931a;
                padding: 15px 20px;
                margin: 20px 0;
            }
            .info-box strong {
                color: #1a1a1a;
            }
            .dashboard-btn { 
                display: inline-block; 
                background-color: #f7931a; 
                color: #ffffff; 
                padding: 12px 30px; 
                border-radius: 6px; 
                text-decoration: none; 
                font-weight: 600; 
                font-size: 14px; 
                margin: 20px 0; 
                transition: background-color 0.3s;
            }
            .dashboard-btn:hover {
                background-color: #e8840f;
            }
            .footer-divider { 
                border-top: 1px solid #eee; 
                margin: 30px 0; 
            }
            .social-title { 
                text-align: center; 
                color: #f7931a; 
                font-weight: 700; 
                font-size: 16px; 
                margin-bottom: 20px; 
            }
            .social-links { 
                text-align: center; 
                margin: 20px 0; 
            }
            .social-links a { 
                display: inline-block; 
                margin: 0 8px; 
            }
            .social-links img { 
                width: 24px; 
                height: 24px; 
                border-radius: 4px; 
            }
            .small-text { 
                font-size: 12px; 
                line-height: 18px; 
                color: #666; 
            }
            .small-text a { 
                color: #f7931a; 
            }
            .disclaimer { 
                font-size: 11px; 
                line-height: 16px; 
                color: #666; 
                margin: 20px 0; 
                padding: 15px;
                background-color: #f8f9fa;
                border-radius: 6px;
            }
            .disclaimer a { 
                color: #f7931a; 
            }
            .copyright { 
                text-align: center; 
                font-size: 12px; 
                color: #999; 
                margin: 25px 0; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Header -->
            <div class="header">
                <img src="https://static.bybit.com/web/images/common/logo_email.png" alt="Bybit Logo">
            </div>

            <!-- Main Content -->
            <div class="content">
                <div class="title">Deposit Successful</div>
                
                <div class="success-icon">
                    <img src="https://static.bybit.com/web/images/email/success-icon.png" alt="Success" width="60">
                </div>

                <div class="amount-section">
                    <div class="amount">₮ 500.00</div>
                    <div class="currency">USDT (TRC20)</div>
                    <div style="font-size: 14px; color: #666;">has been successfully deposited to your Bybit account</div>
                </div>

                <div class="info-box">
                    <strong>Transaction Details:</strong><br>
                    <strong>Network:</strong> Tron (TRC20)<br>
                    <strong>TxID:</strong> 2a8b4c9d1e3f7a2b8c4d5e6f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b<br>
                    <strong>Deposit Address:</strong> TMz...8f9Q (Your Bybit USDT Address)
                </div>

                <div style="text-align: center;">
                    <a href="https://www.bybit.com/account/overview" class="dashboard-btn">View Account Balance</a>
                </div>

                <div class="message">
                    Your funds are now available for trading. Start exploring our trading pairs and take advantage of market opportunities.
                    <br><br>
                    If you didn't make this deposit, please contact our <a href="https://www.bybit.com/help-center/contact-us/">customer support</a> immediately and secure your account.
                    <br><br>
                    <em>This is an automated message, please do not reply.</em>
                </div>

                <!-- Footer Section -->
                <div class="footer-divider"></div>
                
                <div class="social-title">Connect with Bybit</div>
                
                <div class="social-links">
                    <a href="https://twitter.com/Bybit_Official"><img src="https://static.bybit.com/web/images/email/twitter-icon.png" alt="Twitter"></a>
                    <a href="https://t.me/BybitEnglish"><img src="https://static.bybit.com/web/images/email/telegram-icon.png" alt="Telegram"></a>
                    <a href="https://www.facebook.com/Bybit"><img src="https://static.bybit.com/web/images/email/facebook-icon.png" alt="Facebook"></a>
                    <a href="https://www.linkedin.com/company/bybit/"><img src="https://static.bybit.com/web/images/email/linkedin-icon.png" alt="LinkedIn"></a>
                    <a href="https://www.youtube.com/c/Bybit"><img src="https://static.bybit.com/web/images/email/youtube-icon.png" alt="YouTube"></a>
                    <a href="https://www.instagram.com/bybit_official/"><img src="https://static.bybit.com/web/images/email/instagram-icon.png" alt="Instagram"></a>
                </div>

                <div class="small-text">
                    <p>For your security, always verify that you're visiting the official Bybit website: <a href="https://www.bybit.com">www.bybit.com</a></p>
                    <p>Enable two-factor authentication (2FA) to protect your account: <a href="https://www.bybit.com/account/security">Security Settings</a></p>
                </div>

                <div class="disclaimer">
                    <strong>Risk Warning:</strong> Digital asset trading involves substantial risk and may not be suitable for everyone. The value of digital assets can be extremely volatile and unpredictable, and past performance is not indicative of future results. You should carefully consider whether trading is suitable for you in light of your circumstances, knowledge, and financial resources. You may lose all or more of your initial investment. Opinions, market data, and recommendations are subject to change at any time. This information does not constitute investment advice or an offer or solicitation to buy or sell any securities in any jurisdiction. For more information, please see our <a href="https://www.bybit.com/terms-of-service">Terms of Service</a> and <a href="https://www.bybit.com/privacy-policy">Privacy Policy</a>.<br><br>

                    <strong>Important:</strong> Please verify all communication from Bybit by checking our official channels. Be cautious of phishing attempts and never share your account credentials.<br><br>

                    You are receiving this email because you are a registered user of <a href="https://www.bybit.com">Bybit.com</a>. If you no longer wish to receive these emails, you can <a href="https://www.bybit.com/account/notification">manage your notification preferences</a>.
                </div>

                <div class="copyright">© 2025 Bybit. All Rights Reserved.</div>
            </div>
        </div>
    </body>
    </html>
    `;
}

export const BybitWidthdrawal = () => {
  return `

  `
}
    