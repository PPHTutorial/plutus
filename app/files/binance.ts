export const BinanceDeposit = () => {
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
                font-family: 'BinancePlex', Arial, sans-serif; 
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: #ffffff; 
            }
            .header { 
                width: 100%; 
                text-align: center; 
                padding: 0; 
            }
            .header img { 
                width: 100%; 
                height: auto; 
                display: block; 
                margin: 0 auto; 
            }
            .content { 
                padding: 20px; 
            }
            .title { 
                font-size: 20px; 
                font-weight: 900; 
                color: #000000; 
                margin-bottom: 15px; 
            }
            .message { 
                font-size: 14px; 
                line-height: 20px; 
                color: #000000; 
                margin-bottom: 20px; 
            }
            .message a { 
                color: #f0b90b; 
                text-decoration: none; 
            }
            .dashboard-btn { 
                display: inline-block; 
                background-color: #fcd535; 
                color: #000000; 
                padding: 10px 25px; 
                border-radius: 3px; 
                text-decoration: none; 
                font-weight: 900; 
                font-size: 14px; 
                margin: 15px 0; 
            }
            .footer-divider { 
                border-top: 1px solid #f0b90b; 
                margin: 20px 0; 
            }
            .social-title { 
                text-align: center; 
                color: #f0b90b; 
                font-weight: 900; 
                font-size: 14px; 
                margin-bottom: 15px; 
            }
            .social-links { 
                text-align: center; 
                margin: 15px 0; 
            }
            .social-links a { 
                display: inline-block; 
                margin: 0 4px; 
            }
            .social-links img { 
                width: 20px; 
                height: 20px; 
                border-radius: 3px; 
            }
            .small-text { 
                font-size: 11px; 
                line-height: 15px; 
                color: #000000; 
            }
            .small-text a { 
                color: #f0b90b; 
            }
            .disclaimer { 
                font-size: 11px; 
                line-height: 15px; 
                color: #000000; 
                margin: 15px 0; 
            }
            .disclaimer a { 
                color: #f1c40f; 
            }
            .copyright { 
                text-align: center; 
                font-size: 11px; 
                color: #000000; 
                margin: 20px 0; 
            }
            .two-column { 
                display: flex; 
                gap: 10px; 
            }
            .column { 
                flex: 1; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Header -->
            <div class="header">
                <img src="https://public.bnbstatic.com/image/ufo/20210831/1e00bd49-0695-4eaa-8ab0-6dd89a7087fb.png" alt="Binance Logo">
            </div>

            <!-- Main Content -->
            <div class="content">
                <div class="title">BTC Deposit Successful</div>
                
                <div class="message">
                    Your deposit of 0.1099928 BTC is now available in your Binance account. Log in to check your balance.
                    Read our <a href="https://www.binance.com/en/support/faq">FAQs</a> if you are running into problems.
                </div>

                <div style="text-align: center;">
                    <a href="https://app.binance.com/en/my/dashboard" class="dashboard-btn">Visit Your Dashboard</a>
                </div>

                <div class="message">
                    Don't recognize this activity? Please <a href="https://accounts.binance.com/en/user/reset-password/">reset your password</a> 
                    and contact <a href="https://www.binance.com/en/support">customer support</a> immediately.
                    <br><br>
                    <em>This is an automated message, please do not reply.</em>
                </div>

                <!-- Footer Section -->
                <div class="footer-divider"></div>
                
                <div class="social-title">Stay connected!</div>
                
                <div class="social-links">
                    <a href="https://twitter.com/binance"><img src="https://public.bnbstatic.com/image/social/twitter-dark.png" alt="Twitter"></a>
                    <a href="https://telegram.me/BinanceExchange"><img src="https://public.bnbstatic.com/image/social/telegram-dark.png" alt="Telegram"></a>
                    <a href="https://www.facebook.com/binance"><img src="https://public.bnbstatic.com/image/social/facebook-dark.png" alt="Facebook"></a>
                    <a href="https://www.linkedin.com/company/binance"><img src="https://public.bnbstatic.com/image/social/linkedin-dark.png" alt="LinkedIn"></a>
                    <a href="https://www.youtube.com/c/BinanceYoutube"><img src="https://public.bnbstatic.com/image/social/youtube-dark.png" alt="YouTube"></a>
                    <a href="https://www.reddit.com/r/binance/"><img src="https://public.bnbstatic.com/image/social/reddit-dark.png" alt="Reddit"></a>
                    <a href="https://instagram.com/binance"><img src="https://public.bnbstatic.com/image/social/instagram-dark.png" alt="Instagram"></a>
                </div>

                <div class="two-column">
                    <div class="column">
                        <div class="small-text">
                            To stay secure, setup your anti-phishing code <a href="https://www.binance.com/en/my/security/anti-phishing-code">here</a>
                        </div>
                    </div>
                    <div class="column"></div>
                </div>

                <div class="disclaimer">
                    <strong>Disclaimer:</strong> Digital asset prices are subject to high market risk and price volatility. 
                    The value of your investment may go down or up, and you may not get back the amount invested. 
                    You are solely responsible for your investment decisions and Binance is not liable for any losses you may incur. 
                    For more information, see our <a href="https://www.binance.com/en/terms">Terms of Use</a> and 
                    <a href="https://www.binance.com/en/risk-warning">Risk Warning</a>.<br><br>

                    <strong>Kindly note:</strong> Please be aware of phishing sites and always make sure you are visiting 
                    the official Binance.com website when entering sensitive data.<br><br>

                    You have received this email as a registered user of <a href="https://www.binance.com/en">binance.com</a><br>
                    For more information about how we process data, please see our <a href="https://www.binance.com/en/privacy">Privacy policy</a>
                </div>

                <div class="copyright">© ${new Date().getFullYear()} Binance.com, All Rights Reserved.</div>
            </div>
        </div>
    </body>
    </html>
    `;
};

export const BinanceWithdrawal = () => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BNB Withdrawal Successful</title>
        <style>
            body { 
                margin: 0; 
                padding: 0; 
                background-color: #efefef; 
                font-family: 'BinancePlex', Arial, sans-serif; 
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background-color: #ffffff; 
            }
            .header { 
                width: 100%; 
                text-align: center; 
                padding: 0; 
            }
            .header img { 
                width: 100%; 
                height: auto; 
                display: block; 
                margin: 0 auto; 
            }
            .content { 
                padding: 20px; 
            }
            .title { 
                font-size: 20px; 
                font-weight: 900; 
                color: #000000; 
                margin-bottom: 15px; 
            }
            .message { 
                font-size: 14px; 
                line-height: 20px; 
                color: #000000; 
                margin-bottom: 20px; 
            }
            .message a { 
                color: #f0b90b; 
                text-decoration: none; 
            }
            .dashboard-btn { 
                display: inline-block; 
                background-color: #fcd535; 
                color: #000000; 
                padding: 10px 25px; 
                border-radius: 3px; 
                text-decoration: none; 
                font-weight: 900; 
                font-size: 14px; 
                margin: 15px 0; 
            }
            .ii a[href] {
                color: #000000 !important;
            }
            .footer-divider { 
                border-top: 1px solid #f0b90b; 
                margin: 20px 0; 
            }
            .social-title { 
                text-align: center; 
                color: #f0b90b; 
                font-weight: 900; 
                font-size: 14px; 
                margin-bottom: 15px; 
            }
            .social-links { 
                text-align: center; 
                margin: 15px 0; 
            }
            .social-links a { 
                display: inline-block; 
                margin: 0 4px; 
            }
            .social-links img { 
                width: 20px; 
                height: 20px; 
                border-radius: 3px; 
            }
            .small-text { 
                font-size: 11px; 
                line-height: 15px; 
                color: #000000; 
            }
            .small-text a { 
                color: #f0b90b; 
            }
            .disclaimer { 
                font-size: 11px; 
                line-height: 15px; 
                color: #000000; 
                margin: 15px 0; 
            }
            .disclaimer a { 
                color: #f1c40f; 
            }
            .copyright { 
                text-align: center; 
                font-size: 11px; 
                color: #000000; 
                margin: 20px 0; 
            }
            .two-column { 
                display: flex; 
                gap: 10px; 
            }
            .column { 
                flex: 1; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Header -->
            <div class="header">
                <img src="https://public.bnbstatic.com/image/ufo/20210831/1e00bd49-0695-4eaa-8ab0-6dd89a7087fb.png" alt="Binance Logo">
            </div>

            <!-- Main Content -->
            <div class="content">
                <div class="title">BNB Withdrawal Successful</div>
                
                <div class="message">
                    You've successfully withdrawn 0.02329785 BNB from your account.
                    <br><br>
                    <strong>Withdrawal Address</strong>: 0x191580Ca09E4f1505a5F426D5F804f7A80dcf48F<br>
                    <strong>Transaction ID</strong>: 0x2e49d008c137df1d23697bed4f15261d160ccf585a9eff71ec07a471eb4a06e4
                </div>

                <div style="text-align: center;">
                    <a href="https://app.binance.com/en/my/dashboard" class="dashboard-btn">Visit Your Dashboard</a>
                </div>

                <div class="message">
                    Don't recognize this activity? Please <a href="https://accounts.binance.com/en/user/reset-password/">reset your password</a> 
                    and contact <a href="https://www.binance.com/en/support">customer support</a> immediately.
                    <br><br>
                    Please check with the receiving platform or wallet as the transaction is already confirmed on the blockchain explorer.
                    <br><br>
                    <em>This is an automated message, please do not reply.</em>
                </div>

                <!-- Footer Section -->
                <div class="footer-divider"></div>
                
                <div class="social-title">Stay connected!</div>
                
                <div class="social-links">
                    <a href="https://twitter.com/binance"><img src="https://public.bnbstatic.com/image/social/twitter-dark.png" alt="Twitter"></a>
                    <a href="https://telegram.me/BinanceExchange"><img src="https://public.bnbstatic.com/image/social/telegram-dark.png" alt="Telegram"></a>
                    <a href="https://www.facebook.com/binance"><img src="https://public.bnbstatic.com/image/social/facebook-dark.png" alt="Facebook"></a>
                    <a href="https://www.linkedin.com/company/binance"><img src="https://public.bnbstatic.com/image/social/linkedin-dark.png" alt="LinkedIn"></a>
                    <a href="https://www.youtube.com/c/BinanceYoutube"><img src="https://public.bnbstatic.com/image/social/youtube-dark.png" alt="YouTube"></a>
                    <a href="https://www.reddit.com/r/binance/"><img src="https://public.bnbstatic.com/image/social/reddit-dark.png" alt="Reddit"></a>
                    <a href="https://instagram.com/binance"><img src="https://public.bnbstatic.com/image/social/instagram-dark.png" alt="Instagram"></a>
                </div>

                <div class="two-column">
                    <div class="column">
                        <div class="small-text">
                            To stay secure, setup your anti-phishing code <a href="https://www.binance.com/en/my/security/anti-phishing-code">here</a>
                        </div>
                    </div>
                    <div class="column"></div>
                </div>

                <div class="disclaimer">
                    <strong>Disclaimer:</strong> Digital asset prices are subject to high market risk and price volatility. 
                    The value of your investment may go down or up, and you may not get back the amount invested. 
                    You are solely responsible for your investment decisions and Binance is not liable for any losses you may incur. 
                    Past performance is not a reliable predictor of future performance. You should only invest in products you are familiar with and where you understand the risks. 
                    You should carefully consider your investment experience, financial situation, investment objectives and risk tolerance and consult an independent financial adviser prior to making any investment. 
                    This material should not be construed as financial advice. For more information, see our <a href="https://www.binance.com/en/terms">Terms of Use</a> and 
                    <a href="https://www.binance.com/en/risk-warning">Risk Warning</a>.<br><br>

                    <strong>Kindly note:</strong> Please be aware of phishing sites and always make sure you are visiting 
                    the official Binance.com website when entering sensitive data.<br><br>

                    You have received this email as a registered user of <a href="https://www.binance.com/en">binance.com</a><br>
                    For more information about how we process data, please see our <a href="https://www.binance.com/en/privacy">Privacy policy</a>
                </div>

                <div class="copyright">© ${new Date().getFullYear()} Binance.com, All Rights Reserved.</div>
            </div>
        </div>
    </body>
    </html>
    `;
}

