/**
 * Evermor Waitlist - Google Apps Script Backend
 * Now with GoHighLevel CRM Integration
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

// ─── GHL Configuration ───
var GHL_API_TOKEN = 'pit-cb778c8f-d85d-42fd-bd10-29aa730b1bd9';
var GHL_LOCATION_ID = 'GC3Q5eqwDKw2MhZQ0KSj';
var GHL_PIPELINE_ID = 'aUj8krPLV7cHOc9lE3gx';          // "Evermor Waitlist" pipeline
var GHL_STAGE_NEW_LEAD = '1fd75c57-966f-4d89-b81d-0d8e18d84831'; // "New Lead" stage
var GHL_API_BASE = 'https://services.leadconnectorhq.com';

var sheetName = 'Waitlist';

function doPost(e) {
    try {
        // ─── 1. Parse incoming data ───
        var data = {};
        if (e.postData && e.postData.contents) {
            try { data = JSON.parse(e.postData.contents); } catch (ex) { /* fallback to parameter */ }
        }
        var email = data.email || e.parameter.email || '';
        var name = data.name || e.parameter.name || '';
        var phone = data.phone || e.parameter.phone || '';
        var source = data.source || e.parameter.source || 'Evermor Waitlist';
        var campaign = data.campaign || e.parameter.campaign || 'evermor';

        if (!email) {
            return ContentService
                .createTextOutput(JSON.stringify({ "result": "error", "error": "No email provided." }))
                .setMimeType(ContentService.MimeType.JSON);
        }

        // ─── 2. Log to Google Sheet ───
        var doc = SpreadsheetApp.getActiveSpreadsheet();
        var sheet = doc.getSheetByName(sheetName);
        if (!sheet) {
            sheet = doc.insertSheet(sheetName);
            sheet.appendRow(['Timestamp', 'Email', 'Name', 'Phone', 'Source', 'Campaign', 'GHL Contact ID']);
            sheet.getRange("A1:G1").setFontWeight("bold");
        }

        var timestamp = new Date();
        var ghlContactId = '';

        // ─── 3. Push to GoHighLevel CRM ───
        try {
            ghlContactId = pushToGHL(email, name, phone, source, campaign);
        } catch (ghlError) {
            Logger.log('GHL push failed: ' + ghlError.message);
            // Don't fail the whole request if GHL is down
        }

        // Append row with GHL contact ID
        sheet.appendRow([timestamp, email, name, phone, source, campaign, ghlContactId]);

        // ─── 4. Send notification email ───
        var myEmail = Session.getActiveUser().getEmail() || "contact@bluejax.ai";
        MailApp.sendEmail({
            to: myEmail,
            subject: "🔮 New " + campaign.toUpperCase() + " Waitlist Signup",
            htmlBody: "<div style='font-family:Inter,sans-serif;background:#0a0a0f;color:#e0e0e0;padding:24px;border-radius:12px;'>" +
                "<h2 style='color:#8b5cf6;'>New Waitlist Signup</h2>" +
                "<table style='border-collapse:collapse;'>" +
                "<tr><td style='padding:6px 12px;color:#888;'>Email:</td><td style='padding:6px 12px;'><b>" + email + "</b></td></tr>" +
                (name ? "<tr><td style='padding:6px 12px;color:#888;'>Name:</td><td style='padding:6px 12px;'>" + name + "</td></tr>" : "") +
                (phone ? "<tr><td style='padding:6px 12px;color:#888;'>Phone:</td><td style='padding:6px 12px;'>" + phone + "</td></tr>" : "") +
                "<tr><td style='padding:6px 12px;color:#888;'>Source:</td><td style='padding:6px 12px;'>" + source + "</td></tr>" +
                "<tr><td style='padding:6px 12px;color:#888;'>Campaign:</td><td style='padding:6px 12px;'>" + campaign + "</td></tr>" +
                "<tr><td style='padding:6px 12px;color:#888;'>GHL ID:</td><td style='padding:6px 12px;'>" + (ghlContactId || 'N/A') + "</td></tr>" +
                "<tr><td style='padding:6px 12px;color:#888;'>Time:</td><td style='padding:6px 12px;'>" + timestamp + "</td></tr>" +
                "</table></div>"
        });

        return ContentService
            .createTextOutput(JSON.stringify({ "result": "success", "email": email, "ghlContactId": ghlContactId }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService
            .createTextOutput(JSON.stringify({ "result": "error", "error": error.message }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

/**
 * Push a lead to GoHighLevel CRM
 * Creates/updates a contact and creates an opportunity in the Website pipeline
 */
function pushToGHL(email, name, phone, source, campaign) {
    var headers = {
        'Authorization': 'Bearer ' + GHL_API_TOKEN,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
    };

    // Parse name into first/last
    var parts = (name || '').trim().split(/\s+/);
    var firstName = parts[0] || email.split('@')[0];
    var lastName = parts.slice(1).join(' ') || '';

    // ─── Step 1: Create or update contact ───
    var contactPayload = {
        locationId: GHL_LOCATION_ID,
        email: email,
        firstName: firstName,
        lastName: lastName,
        tags: [campaign + '-waitlist', campaign, 'waitlist'],
        source: source
    };
    if (phone) contactPayload.phone = phone;

    var contactResp = UrlFetchApp.fetch(GHL_API_BASE + '/contacts/', {
        method: 'post',
        headers: headers,
        payload: JSON.stringify(contactPayload),
        muteHttpExceptions: true
    });

    var contactData = JSON.parse(contactResp.getContentText());
    var contactId = contactData.contact ? contactData.contact.id : null;

    if (!contactId) {
        Logger.log('GHL contact creation response: ' + contactResp.getContentText());
        return '';
    }

    // ─── Step 2: Create opportunity in Website pipeline ───
    var oppPayload = {
        pipelineId: GHL_PIPELINE_ID,
        locationId: GHL_LOCATION_ID,
        name: campaign.charAt(0).toUpperCase() + campaign.slice(1) + ' Waitlist - ' + firstName + (lastName ? ' ' + lastName : ''),
        contactId: contactId,
        status: 'open',
        pipelineStageId: GHL_STAGE_NEW_LEAD
    };

    var oppResp = UrlFetchApp.fetch(GHL_API_BASE + '/opportunities/', {
        method: 'post',
        headers: headers,
        payload: JSON.stringify(oppPayload),
        muteHttpExceptions: true
    });

    var oppData = JSON.parse(oppResp.getContentText());
    Logger.log('GHL opportunity created: ' + (oppData.opportunity ? oppData.opportunity.id : 'FAILED'));

    return contactId;
}

/**
 * Handle GET requests (health check)
 */
function doGet(e) {
    return ContentService
        .createTextOutput(JSON.stringify({
            status: 'ok',
            service: 'Evermor CRM Bridge',
            ghl_pipeline: GHL_PIPELINE_ID,
            ghl_location: GHL_LOCATION_ID,
            timestamp: new Date().toISOString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
}
