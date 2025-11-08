// joyit-bot.js
const puppeteer = require('puppeteer');
const express = require('express');

// YOUR JOYIT INVITE CODE - REPLACE WITH YOUR ACTUAL CODE
const INVITE_CODE = 'vpBulEU';
const JOYIT_URL = 'https://www.joyit.ai';
const PORT = process.env.PORT || 3000;

async function enterJoyitInviteCode() {
  let browser;
  try {
    console.log('Starting Joyit invite code entry...');
    console.log(`Using invite code: ${INVITE_CODE}`);
    
    // Launch browser with appropriate settings
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36');
    
    // Navigate to Joyit homepage
    console.log(`Navigating to ${JOYIT_URL}`);
    await page.goto(JOYIT_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Try multiple selectors for invite input
    const inviteInputSelectors = [
      'input[name="inviteCode"]',
      'input[id*="invite"]',
      'input[placeholder*="invite"]',
      'input[placeholder*="code"]',
      '#invite-code',
      '.invite-code-input',
      'input[type="text"]'
    ];
    
    let foundInviteField = false;
    for (const selector of inviteInputSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        console.log(`Found invite input with selector: ${selector}`);
        await page.focus(selector);
        await page.click(selector); // Ensure focus
        await page.keyboard.type(INVITE_CODE);
        foundInviteField = true;
        break;
      } catch (err) {
        // Continue trying other selectors
      }
    }
    
    if (!foundInviteField) {
      // Try alternative approach - look for any text input
      console.log('Trying generic text input approach...');
      try {
        await page.waitForSelector('input[type="text"]', { timeout: 5000 });
        const inputs = await page.$$('input[type="text"]');
        if (inputs.length > 0) {
          await inputs[0].focus();
          await inputs[0].click();
          await inputs[0].type(INVITE_CODE);
          foundInviteField = true;
        }
      } catch (err) {
        console.log('Could not find any text input fields');
      }
    }
    
    if (!foundInviteField) {
      throw new Error('Could not locate invite code input field. Please check the website structure.');
    }
    
    // Try to find and click submit button
    const submitButtonSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button[id*="submit"]',
      'button[class*="submit"]',
      '.submit-button',
      'button:has-text("Submit")',
      'button:has-text("Enter")',
      'button:has-text("Go")'
    ];
    
    let submitted = false;
    for (const selector of submitButtonSelectors) {
      try {
        const button = await page.$(selector);
        if (button) {
          console.log(`Submitting with button: ${selector}`);
          await button.click();
          submitted = true;
          break;
        }
      } catch (err) {
        // Continue trying other selectors
      }
    }
    
    if (!submitted) {
      // Try pressing Enter in the invite field
      console.log('Attempting submission with Enter key');
      await page.keyboard.press('Enter');
    }
    
    // Wait for response
    await page.waitForTimeout(5000);
    
    // Check for success/error indicators
    const successSelectors = [
      '[class*="success"]',
      '[class*="thank"]',
      '[id*="success"]',
      'div:contains("Success")',
      'div:contains("Thank you")',
      'div:contains("congrat")'
    ];
    
    const errorSelectors = [
      '[class*="error"]',
      '[class*="invalid"]',
      '[id*="error"]',
      'div:contains("Error")',
      'div:contains("Invalid")',
      'div:contains("Wrong")'
    ];
    
    let successMessage = null;
    let errorMessage = null;
    
    // Check for success messages
    for (const selector of successSelectors) {
      try {
        const elements = await page.$$(selector);
        for (const element of elements) {
          const text = await page.evaluate(el => el.textContent, element);
          if (text && text.length > 0) {
            successMessage = text;
            break;
          }
        }
        if (successMessage) break;
      } catch (err) {
        // Continue checking
      }
    }
    
    // Check for error messages
    if (!successMessage) {
      for (const selector of errorSelectors) {
        try {
          const elements = await page.$$(selector);
          for (const element of elements) {
            const text = await page.evaluate(el => el.textContent, element);
            if (text && text.length > 0) {
              errorMessage = text;
              break;
            }
          }
          if (errorMessage) break;
        } catch (err) {
          // Continue checking
        }
      }
    }
    
    if (successMessage) {
      console.log('SUCCESS:', successMessage.trim());
      return { success: true, message: successMessage.trim() };
    } else if (errorMessage) {
      console.log('ERROR:', errorMessage.trim());
      return { success: false, error: errorMessage.trim() };
    } else {
      console.log('Submission completed - check website to verify result');
      return { success: true, message: 'Code submitted - please verify manually on the website' };
    }

  } catch (error) {
    console.error('Error during Joyit invite processing:', error);
    return { success: false, error: error.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Express server setup for deployment
const app = express();

app.get('/', (req, res) => {
  res.json({ 
    message: 'Joyit Invite Code Bot is ready!',
    usage: 'GET /enter-code to submit your invite code'
  });
});

app.get('/enter-code', async (req, res) => {
  const result = await enterJoyitInviteCode();
  res.status(result.success ? 200 : 400).json(result);
});

// Run immediately if executed directly
if (require.main === module) {
  enterJoyitInviteCode().then(result => {
    console.log('Bot execution finished:', result);
    process.exit(result.success ? 0 : 1);
  }).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

// Export for deployment
module.exports = app;
