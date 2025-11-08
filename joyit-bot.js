// joyit-app-bot.js
const wdio = require('webdriverio');
const INVITE_CODE = "vpBulEU";

async function joyitAppBot() {
    console.log("🤖 Joyit App AutoBot Starting...");
    console.log(`🎫 Invite Code: ${INVITE_CODE}`);
    
    // Appium configuration for Android
    const opts = {
        port: 4723,
        capabilities: {
            platformName: "Android",
            "appium:automationName": "UiAutomator2",
            "appium:appPackage": "ai.joyit.app", // Adjust if different
            "appium:appActivity": "ai.joyit.app.MainActivity", // Adjust if different
            "appium:noReset": true,
            "appium:newCommandTimeout": 300
        }
    };

    let client;
    
    try {
        console.log("📱 Connecting to Appium...");
        client = await wdio.remote(opts);
        
        console.log("⏳ Waiting for app to load...");
        await client.pause(5000);
        
        // Try multiple strategies to find invite input
        console.log("🔍 Looking for invite code input...");
        
        const elementStrategies = [
            '//*[@resource-id="invite_code_input"]',
            '//*[@resource-id="inviteCodeInput"]',
            '//*[@content-desc="invite code input"]',
            '//*[@text="Enter invite code"]',
            '//android.widget.EditText',
            '//*[@class="android.widget.EditText"]'
        ];
        
        let inviteInput = null;
        
        for (const strategy of elementStrategies) {
            try {
                console.log(`Trying strategy: ${strategy}`);
                inviteInput = await client.$(strategy);
                const isDisplayed = await inviteInput.isDisplayed();
                if (isDisplayed) {
                    console.log("✅ Found invite input field!");
                    break;
                }
            } catch (e) {
                console.log(`Strategy failed: ${e.message}`);
            }
        }
        
        if (!inviteInput) {
            // Try to find any text input field
            console.log("🔍 Trying generic text input detection...");
            const textFields = await client.$$('android.widget.EditText');
            if (textFields.length > 0) {
                inviteInput = textFields[0];
                console.log("✅ Found text input field!");
            }
        }
        
        if (!inviteInput) {
            throw new Error("Could not locate invite code input field");
        }
        
        // Enter invite code
        console.log("⌨️ Entering invite code...");
        await inviteInput.click();
        await inviteInput.setValue(INVITE_CODE);
        
        // Try to find submit button
        console.log("🔍 Looking for submit button...");
        
        const buttonStrategies = [
            '//*[@resource-id="submit_button"]',
            '//*[@resource-id="submitButton"]',
            '//*[@text="Submit"]',
            '//*[@text="Enter"]',
            '//*[@text="Continue"]',
            '//android.widget.Button'
        ];
        
        let submitButton = null;
        
        for (const strategy of buttonStrategies) {
            try {
                submitButton = await client.$(strategy);
                const isDisplayed = await submitButton.isDisplayed();
                if (isDisplayed) {
                    console.log("✅ Found submit button!");
                    break;
                }
            } catch (e) {
                // Continue trying
            }
        }
        
        if (submitButton) {
            console.log("🖱️ Clicking submit button...");
            await submitButton.click();
        } else {
            // Try pressing Enter
            console.log("↩️ Pressing Enter key...");
            await client.keys(['Enter']);
        }
        
        console.log("⏳ Waiting for response...");
        await client.pause(5000);
        
        // Check for success/error messages
        try {
            const successElement = await client.$('//*[@text[contains(., "Success")] or @text[contains(., "Thank you")]]');
            const isErrorDisplayed = await successElement.isDisplayed();
            if (isErrorDisplayed) {
                console.log("🎉 Invite code submitted successfully!");
            }
        } catch (e) {
            console.log("✅ Code submitted. Please check app for confirmation.");
        }
        
        console.log("🤖 Bot completed. Keeping app open for 30 seconds...");
        await client.pause(30000);
        
    } catch (error) {
        console.error("💥 Error:", error.message);
        console.log("\n🔧 Setup Instructions:");
        console.log("1. Install Appium: npm install -g appium");
        console.log("2. Install WebDriverIO: npm install webdriverio");
        console.log("3. Start Appium server: appium");
        console.log("4. Connect your Android device with USB debugging enabled");
        console.log("5. Run: node joyit-app-bot.js");
    } finally {
        if (client) {
            try {
                await client.deleteSession();
            } catch (e) {
                // Ignore cleanup errors
            }
        }
    }
}

joyitAppBot();      'input[id*="invite"]',
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
