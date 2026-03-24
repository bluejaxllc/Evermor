/**
 * Evermor Waitlist - Google Apps Script Backend
 * 
 * INSTRUCTIONS:
 * 1. Go to https://script.google.com/ and create a new project.
 * 2. Paste this code into the editor, replacing any existing code.
 * 3. Save the project and click "Deploy" -> "New deployment" in the top right.
 * 4. Select type: "Web app".
 * 5. Set "Execute as" to "Me" (your email).
 * 6. Set "Who has access" to "Anyone".
 * 7. Click Deploy. Authorize the permissions when prompted.
 * 8. Copy the "Web app URL" provided.
 * 9. Paste that URL into the `GOOGLE_SCRIPT_URL` variable in `script.js`.
 */

var sheetName = 'Waitlist';

function doPost(e) {
    try {
        var doc = SpreadsheetApp.getActiveSpreadsheet();

        // If no spreadsheet is bound, create a new one in Drive (or bind this script to a Google Sheet first)
        // Best practice: Create a blank Google Sheet, go to Extensions -> Apps Script, and paste this code there.
        var sheet = doc.getSheetByName(sheetName);

        if (!sheet) {
            sheet = doc.insertSheet(sheetName);
            sheet.appendRow(['Timestamp', 'Email']);
            // Make header bold
            sheet.getRange("A1:B1").setFontWeight("bold");
        }

        var email = e.parameter.email;
        var timestamp = new Date();

        if (email) {
            // Append waitlist email to Google Sheet
            sheet.appendRow([timestamp, email]);

            // Send an email to yourself via Gmail
            // Replace with your actual email if Session.getActiveUser() doesn't work depending on context
            var myEmail = Session.getActiveUser().getEmail() || "your-email@example.com";

            MailApp.sendEmail({
                to: myEmail,
                subject: "New Evermor Waitlist Signup",
                htmlBody: "<p>Great news! You have a new waitlist signup for <b>Evermor</b>.</p><p><b>Email:</b> " + email + "</p><p><b>Time:</b> " + timestamp + "</p>"
            });

            return ContentService
                .createTextOutput(JSON.stringify({ "result": "success", "email": email }))
                .setMimeType(ContentService.MimeType.JSON);
        } else {
            return ContentService
                .createTextOutput(JSON.stringify({ "result": "error", "error": "No email provided in the POST request." }))
                .setMimeType(ContentService.MimeType.JSON);
        }
    } catch (error) {
        return ContentService
            .createTextOutput(JSON.stringify({ "result": "error", "error": error.message }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}
