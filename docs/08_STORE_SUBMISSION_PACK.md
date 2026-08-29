# ApplyMate — Store Submission Pack

## Status

Prepared for ApplyMate's first public Apple App Store and Google Play release.

Repository release:

```text
v1.8.0
```

Previous repository release:

```text
v1.7.0
```

Store marketing version:

```text
1.0.0
```

### Public-release Gmail status

The v1.8.0 release-hardening control is implemented and validated.

```text
production  -> EXPO_PUBLIC_GMAIL_ENABLED=false
preview     -> EXPO_PUBLIC_GMAIL_ENABLED=true
development -> EXPO_PUBLIC_GMAIL_ENABLED=true
```

The initial unrestricted store build must therefore not advertise or expose Gmail while Google restricted-scope verification for `gmail.readonly` remains pending.

Do not advertise Gmail in the public description, screenshots, feature graphics or release notes until Google has approved the required production access and the public feature has been revalidated.

---

# 1. Core Store Metadata

## App name

```text
ApplyMate
```

Length: 9 characters including no additional suffix.

Do not rename the store application to include keyword stuffing such as:

```text
ApplyMate - Job Tracker & Careers
```

The permanent product identity should remain simply:

```text
ApplyMate
```

---

# 2. Apple App Store Metadata

## Name

```text
ApplyMate
```

## Subtitle

```text
Job Application Tracker
```

Length:

```text
23 characters
```

## Primary category

```text
Productivity
```

## Secondary category

```text
Business
```

## Keywords

```text
career,interview,reminders,job search,employment,organizer,opportunities,follow up
```

Length:

```text
82 UTF-8 bytes
```

This remains below Apple's 100-byte keyword limit.

Do not add:

* ApplyMate;
* app;
* free;
* best;
* Apple;
* competitor names;

merely to fill unused keyword space.

## Promotional text

Recommended optional promotional text:

```text
Keep every application, deadline and follow-up organised in one focused job-search tracker.
```

This should remain truthful to the currently released app.

---

# 3. Google Play Metadata

## App name

```text
ApplyMate
```

## Short description

```text
Track job applications, reminders and progress in one simple place.
```

Length:

```text
67 characters
```

## Category

```text
Productivity
```

## Suggested discoverability concepts

Use only tags actually offered by Play Console and genuinely relevant to the app.

Suitable concepts include:

```text
Job search
Career
Productivity
Organisation
Task management
```

Do not select unrelated high-traffic tags merely for discoverability.

---

# 4. Full Store Description

Use the following description for both stores unless a platform-specific edit is required.

ApplyMate keeps your job search organised by giving you one focused place to track applications, deadlines and progress.

TRACK EVERY APPLICATION

Save the details that matter for each opportunity, including company, role, location, salary, job link, recruiter details, deadline, notes, skills, benefits and job description.

Move applications through your job-search pipeline using clear stages such as Saved, Applied, Assessment, Interview, Offer and Rejected.

SEE YOUR PROGRESS

Use the ApplyMate dashboard to understand your application pipeline and quickly see how your job search is progressing.

STAY ON TOP OF FOLLOW-UPS

Create reminders for interviews, deadlines and follow-ups. ApplyMate can schedule local notifications on your device so important dates are easier to remember.

KEEP EVERYTHING ORGANISED

Search, filter and review your applications without relying on spreadsheets, scattered notes or multiple lists.

YOUR ACCOUNT, YOUR DATA

ApplyMate provides secure account access, email verification and password recovery. Your applications and reminders are kept separate from other users' data.

You can permanently delete your ApplyMate account and associated ApplyMate application and reminder data from within the app.

FOCUSED ON THE JOB SEARCH

ApplyMate is designed as a straightforward job-application tracker without advertising or social feeds.

---

# 5. Public URLs

## Support URL

```text
https://shehzadm-muhammad.github.io/ApplyMate/
```

The page provides:

* product identification;
* Privacy Policy;
* account deletion;
* support contact.

Support email:

```text
support.applymate@gmail.com
```

## Privacy Policy URL

```text
https://shehzadm-muhammad.github.io/ApplyMate/privacy-policy.html
```

The source-controlled v1.8.0 Privacy Policy has been updated for Gmail/Google access, Limited Use wording, service providers, account deletion and current data handling. After the final documentation merge, verify that GitHub Pages is serving the new version before entering this URL in either store.

## Account deletion URL

```text
https://shehzadm-muhammad.github.io/ApplyMate/delete-account.html
```

## Apple Privacy Choices URL

Recommended:

```text
https://shehzadm-muhammad.github.io/ApplyMate/delete-account.html
```

This field is optional in App Store Connect.

The deletion page is appropriate because it gives users an external route for account/data deletion.

---

# 6. Initial Release Notes

## Apple

For the first App Store release, Apple's normal "What's New" field is not the main first-version marketing field.

Keep this text available for later updates:

```text
Initial release of ApplyMate with secure accounts, job-application tracking, dashboard progress, reminders and local notifications.
```

## Google Play

Recommended initial release notes:

```text
Initial release of ApplyMate.
• Track job applications and their progress
• Organise role details and notes
• View your application pipeline
• Create reminders for deadlines and follow-ups
• Receive optional local reminder notifications
• Securely manage or delete your ApplyMate account
```

Do not mention Gmail in the initial public release notes while restricted-scope verification remains pending.

---

# 7. Pricing and Commercial Model

Initial recommendation:

```text
Free
```

Current app contains:

```text
No in-app purchases
No subscriptions
No advertising
```

Do not create monetisation declarations unless the actual app changes.

---

# 8. Age-Rating Guidance

## Apple

Do not select:

```text
Made for Kids
```

For the current Apple age-rating questionnaire, answer based on actual app behaviour.

Expected answers:

```text
Parental Controls:             No
Age Assurance:                 No
Messaging and Chat:            No
Advertising:                   No
User-Generated Social Content: No
Social Media:                  No
Profanity or Crude Humor:      None
Horror or Fear Themes:         None
Alcohol/Tobacco/Drug Content:  None
Medical/Treatment Information: None
Mature/Suggestive Themes:      None
Sexual Content/Nudity:         None
Cartoon/Fantasy Violence:      None
Realistic Violence:            None
Guns/Weapons:                  None
Contests:                      None
Loot Boxes:                    No
Simulated Gambling:            None
Gambling:                      No
```

ApplyMate stores user-entered job/application information for that user's private account. It is not a public user-generated-content platform.

### Unrestricted web access

Do not mark unrestricted web access merely because an application can contain a job URL that opens the user's external browser.

Reassess this answer only if ApplyMate later embeds unrestricted open-web browsing inside the app itself.

### Expected Apple rating

Based on the inspected functionality, ApplyMate should fall into Apple's lowest general-content tier, expected to be:

```text
4+
```

App Store Connect makes the final calculated decision.

Do not manually override the calculated rating lower.

---

# 9. Google Play Content Rating Guidance

Complete the IARC questionnaire truthfully.

Current functionality should result in:

```text
No violence
No sexual content
No profanity
No gambling
No drugs/alcohol/tobacco content
No horror content
No public user-generated content
No social networking
No advertisements
No in-app purchases
```

Expected outcome:

```text
Low/general-audience content rating
```

The exact regional ratings are generated by IARC and should be accepted as calculated.

## Target audience

ApplyMate is a job-search/productivity application.

Do not enrol it in Google's Designed for Families programme.

The product should be positioned for ordinary job seekers rather than marketed specifically toward children.

---

# 10. Apple Screenshot Asset Plan

Actual final screenshots must be captured from the final store-production build after the Gmail public-release gate is in place.

Do not use Gmail screens in the initial unrestricted release.

Do not use real personal data.

Use a dedicated demo account containing fictitious companies and job details.

## iPhone set

Prepare six portrait screenshots.

Preferred highest-resolution 6.9-inch iPhone submission canvas:

```text
1320 × 2868
```

Alternative current accepted 6.9-inch sizes may be used if produced by the chosen simulator/device.

### Screenshot 01

Filename:

```text
apple-iphone-01-dashboard.png
```

Screen:

```text
Dashboard
```

Marketing heading:

```text
Your job search at a glance
```

Show:

* realistic application totals;
* status summary;
* clean fictitious data.

### Screenshot 02

Filename:

```text
apple-iphone-02-applications.png
```

Screen:

```text
Applications list
```

Marketing heading:

```text
Track every application
```

Show several applications in different stages.

### Screenshot 03

Filename:

```text
apple-iphone-03-application-details.png
```

Screen:

```text
Application details
```

Marketing heading:

```text
Keep every detail together
```

Show:

* company;
* job title;
* location;
* status;
* deadline;
* notes/details.

### Screenshot 04

Filename:

```text
apple-iphone-04-add-application.png
```

Screen:

```text
Add application
```

Marketing heading:

```text
Save the details that matter
```

Do not display real recruiter or personal information.

### Screenshot 05

Filename:

```text
apple-iphone-05-reminders.png
```

Screen:

```text
Reminders
```

Marketing heading:

```text
Never miss a follow-up
```

Show fictitious future interview/follow-up reminders.

### Screenshot 06

Filename:

```text
apple-iphone-06-profile.png
```

Screen:

```text
Profile / account controls
```

Marketing heading:

```text
Your account, your control
```

Where practical, show account management without exposing a real email address.

---

# 11. Apple iPad Screenshot Plan

The app currently declares:

```text
supportsTablet = true
```

Therefore prepare the required iPad screenshot set rather than discovering the requirement during submission.

Preferred 13-inch portrait canvas:

```text
2064 × 2752
```

Use the same six flows:

```text
apple-ipad-01-dashboard.png
apple-ipad-02-applications.png
apple-ipad-03-application-details.png
apple-ipad-04-add-application.png
apple-ipad-05-reminders.png
apple-ipad-06-profile.png
```

The iPad screenshots must be genuine iPad UI captures.

Do not stretch or upscale an iPhone screenshot to look like an iPad screenshot.

---

# 12. Google Play Screenshot Plan

Prepare six phone screenshots.

Recommended production size:

```text
1080 × 1920
```

Portrait ratio:

```text
9:16
```

Filenames:

```text
play-phone-01-dashboard.png
play-phone-02-applications.png
play-phone-03-application-details.png
play-phone-04-add-application.png
play-phone-05-reminders.png
play-phone-06-profile.png
```

Use the same headline sequence as the Apple screenshots.

Google Play requires at least two screenshots, but the intended ApplyMate listing should use the full six-screen story.

---

# 13. Google Play Graphic Assets

## Play Store icon

Required:

```text
512 × 512 PNG
Maximum 1024 KB
```

Use the actual ApplyMate app icon.

Do not add:

* "Free";
* ranking claims;
* Google Play branding;
* promotional badges.

## Feature graphic

Required:

```text
1024 × 500
JPEG or 24-bit PNG
No alpha transparency
```

Recommended concept:

```text
ApplyMate
Organise your job search
```

Visual structure:

* ApplyMate branding;
* clean uncluttered background;
* subtle application/dashboard visual motif;
* no Gmail branding;
* no Apple/Google logos;
* no price or ranking claims.

Final feature graphic should be created only after final branding/screenshot styling is frozen.

---

# 14. Screenshot Safety Rules

Every store image must:

* come from the final release UI;
* use fictitious demo data;
* avoid real personal emails;
* avoid real Gmail inbox/message data;
* avoid staging/debug screens;
* avoid development menus;
* avoid unsupported functionality;
* accurately reflect the shipping binary.

Do not place Gmail in any screenshot until public OAuth approval is complete and Gmail has been enabled in the public build.

---

# 15. Apple Reviewer Notes

Use the following as the base reviewer note:

```text
ApplyMate is a job-application tracking and reminder app.
An ApplyMate account is required to access the main application. A dedicated pre-verified reviewer account is provided in the App Review Information section.
The reviewer account contains fictitious sample applications and reminders so the main functionality can be reviewed immediately.
Suggested review flow:
1. Sign in using the supplied review account.
2. Review the Dashboard.
3. Open Applications and inspect an application.
4. Create or edit a sample application.
5. Open Reminders and create a future reminder.
6. Open Profile to review account controls.
Account deletion is available from Profile > Delete Account.
There are no purchases, subscriptions or advertisements.
The production build submitted for this initial public release does not expose the Gmail connection feature while Google's restricted-scope verification for gmail.readonly is pending. A Google account is therefore not required for App Review.
Support:
support.applymate@gmail.com
Privacy Policy:
https://shehzadm-muhammad.github.io/ApplyMate/privacy-policy.html
Account deletion information:
https://shehzadm-muhammad.github.io/ApplyMate/delete-account.html
```

If Gmail becomes publicly approved before submission, these notes must be revised rather than submitting stale information.

---

# 16. Google Play App Access Instructions

Because ApplyMate requires authentication, declare that:

```text
All or some functionality is restricted
```

Provide the dedicated review credentials under Play Console's App Access section.

Suggested instructions:

```text
Use the supplied ApplyMate reviewer email and password.
The account is already email-verified and contains fictitious sample application/reminder data.
After login:
• Dashboard shows application statistics.
• Applications contains sample job applications.
• Reminders contains sample reminders.
• Profile contains account management and permanent account deletion.
No external organisation, subscription, payment or Google account is required for this review build.
```

---

# 17. Reviewer Account Procedure

Do not place reviewer credentials in:

* Git;
* project documentation;
* screenshots;
* release notes;
* source code.

## Creation

Before submitting either store build:

1. Create a dedicated email inbox/account controlled by the ApplyMate publisher.
2. Register a normal ApplyMate user through the production system.
3. Complete normal email verification.
4. Use a strong unique password.
5. Populate fictitious sample data.
6. Verify production login from a clean device/build.

Suggested fictitious applications:

```text
Northstar Digital — Junior Software Engineer — Applied
Redwood Systems — Support Engineer — Interview
BrightWorks — Graduate Developer — Assessment
Horizon Labs — Software Developer — Saved
```

Suggested reminders:

```text
Prepare for interview
Follow up on application
Complete assessment
```

## Store credential handling

Enter the review email/password only into:

```text
Apple App Review Information
Google Play App Access
```

## Before every submission

Verify:

```text
production API health = UP
review account login works
review account is email verified
sample applications load
sample reminders load
no password reset is required
no expired/revoked account state exists
```

Do not use a personal ApplyMate account as the permanent reviewer account.

---

# 18. Apple App Privacy — Draft Answers

These answers apply to the intended initial production release with public Gmail connection disabled.

## Does the developer or its third-party partners collect data from this app?

```text
YES
```

## Tracking

```text
Data used for tracking: NO
```

ApplyMate contains:

```text
No advertising SDK
No advertising identifier integration
No cross-app tracking
No analytics SDK
No data-broker integration
```

Therefore:

```text
AppTrackingTransparency permission required: NO
```

for the currently inspected behaviour.

---

# 19. Apple Privacy — Contact Info

## Name

Collected:

```text
YES
```

Linked to the user:

```text
YES
```

Purpose:

```text
App Functionality
```

Tracking:

```text
NO
```

Reason:

First and last name are stored as part of the ApplyMate account.

## Email Address

Collected:

```text
YES
```

Linked to the user:

```text
YES
```

Purpose:

```text
App Functionality
```

Tracking:

```text
NO
```

Uses include:

* account creation;
* authentication/account identity;
* verification emails;
* password recovery;
* account security.

Transactional email delivery through Resend remains part of providing ApplyMate functionality and is not marketing.

---

# 20. Apple Privacy — Identifiers

## User ID

Collected:

```text
YES
```

Linked to the user:

```text
YES
```

Purpose:

```text
App Functionality
```

Tracking:

```text
NO
```

ApplyMate assigns an account identifier used to isolate data between users.

---

# 21. Apple Privacy — User Content

## Other User Content

Collected:

```text
YES
```

Linked to the user:

```text
YES
```

Purpose:

```text
App Functionality
```

Tracking:

```text
NO
```

Includes user-created ApplyMate content such as:

* job applications;
* company/role details;
* notes;
* job descriptions;
* recruiter details;
* skills/benefits;
* application deadlines;
* reminder information.

---

# 22. Apple Privacy — Financial Information

## Other Financial Info

Conservative initial declaration:

```text
YES
```

Linked to the user:

```text
YES
```

Purpose:

```text
App Functionality
```

Tracking:

```text
NO
```

Reason:

ApplyMate contains a dedicated salary field for a job opportunity.

The value normally represents compensation associated with the job/application rather than banking/payment information, but Apple's taxonomy explicitly includes salary within Other Financial Info.

Do not declare:

```text
Payment Info
Credit Info
Purchase History
```

because ApplyMate does not collect those data types.

---

# 23. Apple Privacy — Other Data

## Other Data Types

Conservative declaration:

```text
YES
```

Linked to the user:

```text
YES
```

Purpose:

```text
App Functionality
```

Tracking:

```text
NO
```

Scope:

* authentication/security records;
* session state retained by the backend;
* password credential stored only as a secure hash;
* hashed refresh-session token information.

A transient authentication token that is merely used to service a request and not retained separately does not need an additional privacy category.

---

# 24. Apple Privacy — Data Not Collected

Based on the current app and dependency review, do not declare collection of:

```text
Phone Number
Physical Address
Contacts
Health
Fitness
Precise Location
Coarse Location
Sensitive Info
Photos
Videos
Audio
Browsing History
Search History
Device ID
Purchases
Product Interaction / analytics
Advertising Data
Crash analytics
Performance analytics
Environment Scanning
Hands
Head
```

No analytics or crash-reporting SDK is currently included.

If such an SDK is added in a genuine future maintenance release, this declaration must be re-audited.

---

# 25. Gmail and Apple App Privacy

The source implementation can access:

```text
Gmail message IDs
thread IDs
sender
subject
date
snippet
selected message body text
Google account ID
Google email address
```

However the Gmail message access path is designed to process Gmail directly on the device.

Gmail access tokens are transient and are not persisted by ApplyMate.

Apple states that information processed only on-device is not considered collected for the App Privacy label.

Therefore, if the architecture remains unchanged when Gmail is eventually enabled publicly:

```text
Emails or Text Messages should not automatically be declared as collected merely because ApplyMate processes Gmail locally.
```

Before Gmail is publicly enabled, re-audit:

* Google SDK behaviour;
* native privacy manifests;
* whether any Gmail-derived data has begun leaving the device;
* whether any server/logging behaviour changed.

The public Privacy Policy must still disclose Gmail access even when store-label definitions do not classify the messages as collected.

---

# 26. Google Play Data Safety — Top-Level Answers

These answers apply to the initial Gmail-gated public release.

## Does your app collect or share required user data types?

```text
YES — collects data
```

## Does the app share user data with third parties?

Draft answer:

```text
NO
```

Reason:

Render, Neon and Resend operate as service providers processing ApplyMate data on behalf of the developer.

Google Play's Data Safety rules exclude qualifying service-provider transfers from the definition of "sharing".

This does not remove the requirement to disclose providers and processing in the Privacy Policy.

## Is all collected user data encrypted in transit?

```text
YES
```

Production client/backend communications use HTTPS/TLS.

## Can users request data deletion?

```text
YES
```

Mechanisms:

```text
In-app:
Profile > Delete Account
External:
https://shehzadm-muhammad.github.io/ApplyMate/delete-account.html
```

## Independent security review badge

```text
NO
```

Do not claim an independent MASA/security certification unless one is actually completed.

## Families-policy badge

```text
NO
```

ApplyMate is not a Designed for Families application.

---

# 27. Google Data Safety — Personal Info

## Name

Collected:

```text
YES
```

Shared:

```text
NO
```

Required:

```text
YES
```

Stored ephemerally only:

```text
NO
```

Purposes:

```text
App functionality
Account management
```

## Email Address

Collected:

```text
YES
```

Shared:

```text
NO
```

Required:

```text
YES
```

Stored ephemerally only:

```text
NO
```

Purposes:

```text
App functionality
Account management
```

Email verification and password-reset messages are transactional account functionality, not advertising/marketing.

## User IDs

Collected:

```text
YES
```

Shared:

```text
NO
```

Required:

```text
YES
```

Purposes:

```text
App functionality
Account management
```

---

# 28. Google Data Safety — Other Personal Info

Conservative declaration for authentication/security credential information:

```text
Collected: YES
Shared: NO
Required: YES
Ephemeral: NO
```

Purposes:

```text
App functionality
Account management
Security / fraud prevention where presented as an available purpose
```

ApplyMate does not retain plain-text passwords.

---

# 29. Google Data Safety — Other User-Generated Content

Collected:

```text
YES
```

Shared:

```text
NO
```

Required:

```text
OPTIONAL
```

Purpose:

```text
App functionality
```

Includes:

* application records;
* notes;
* job details;
* recruiter details;
* job descriptions;
* skills;
* benefits;
* deadlines;
* reminders.

Users choose whether and what application/reminder content to create.

---

# 30. Google Data Safety — Other Financial Info

Conservative declaration:

```text
Collected: YES
Shared: NO
Required: OPTIONAL
Ephemeral: NO
```

Purpose:

```text
App functionality
```

Reason:

The application form contains a dedicated salary field.

Do not declare:

```text
User payment information
Purchase history
Credit score
```

because ApplyMate does not collect them.

---

# 31. Google Data Safety — Data Not Collected

Based on the current implementation, do not select:

```text
Approximate location
Precise location
Address
Phone number
Race and ethnicity
Political or religious beliefs
Sexual orientation
Health information
Fitness information
SMS/MMS
Other in-app messages
Photos
Videos
Audio
Files/documents
Calendar
Contacts
Installed apps
Web browsing history
App interaction analytics
In-app search analytics
Crash logs
Performance diagnostics
Device or other IDs
Payment information
Purchase history
Credit score
```

This assessment must be repeated if a new SDK is ever introduced.

---

# 32. Gmail and Google Play Data Safety

Google Play defines collection as transmitting user data off the user's device.

Its guidance explicitly excludes data that is only accessed/processed locally on-device.

Therefore, under the current Gmail architecture:

```text
Gmail message content is not declared as "collected" by ApplyMate in Data Safety solely because ApplyMate reads/processes it locally.
```

This is conditional on Gmail content remaining:

```text
device -> Google Gmail API -> device
```

and not being transmitted to:

```text
ApplyMate backend
Render
Neon
Resend
analytics
logs
other third parties
```

If Gmail-derived content is later sent off-device by ApplyMate, the Data Safety form must be updated before that build is released.

The Google OAuth Privacy Policy disclosure requirement remains separate from the Play Data Safety definition of "collected".

---

# 33. Google Play Account Deletion Declaration

Answer:

```text
Users can request account deletion: YES
```

Provide:

```text
https://shehzadm-muhammad.github.io/ApplyMate/delete-account.html
```

The app also contains an in-app deletion control.

Current deletion flow removes the ApplyMate account and associated application/reminder data and clears local account state.

The final Privacy Policy must state any legitimate retention exception if one ever applies.

---

# 34. Third-Party Service / SDK Inventory

The store declarations were prepared against the following actual dependencies and services.

## Mobile SDK/runtime

```text
Expo / React Native
React Navigation
Expo SecureStore
Expo Notifications
AsyncStorage
react-native-nitro-google-signin
```

## Backend/infrastructure providers

```text
Render
Neon
Resend
```

## External API

```text
Google Gmail API
```

## Not present in current application dependency review

```text
Google Analytics
Firebase Analytics
Facebook/Meta SDK
advertising SDKs
AppsFlyer
Adjust
Mixpanel
Amplitude
Sentry
Crashlytics
payment SDKs
```

Do not carry this "not present" list forward automatically if package dependencies change.

---

# 35. Store Submission Checklist

Before entering this pack into either store, confirm:

```text
[x] Gmail public-production gating implemented
[x] Privacy Policy source updated for Gmail/Google and service providers
[x] Account-deletion page source updated
[x] Support landing-page URL defined
[x] Production API health endpoint defined
[x] Store metadata/reviewer guidance drafted
[x] Apple App Privacy draft prepared from actual code/services
[x] Google Play Data Safety draft prepared from actual code/services
[ ] Final v1.8.0 documentation merged/published on GitHub Pages
[ ] Confirm live privacy/deletion pages show the v1.8.0 wording
[ ] Dedicated reviewer account created/tested
[ ] Final screenshots captured from final Gmail-gated store build
[ ] No real user/Gmail data appears in screenshots
[ ] Final Android AAB rebuilt from exact frozen v1.8.0 commit
[ ] Google Play developer account/application configured before submission
[ ] Apple production IPA built only after paid Developer Program enrolment
[ ] Store privacy answers rechecked against exact final binary
```

---

# 36. Screenshot Asset Completion Gate

The screenshot plan is complete.

The final bitmap assets are intentionally not frozen yet because they should be captured from the exact final v1.8.0 store binary after merge/tag validation. Gmail production gating itself is already implemented and validated.

Capture the actual final screenshots only after the Gmail-release-hardening checkpoint succeeds.

This prevents store assets from advertising or displaying functionality that is intentionally disabled in the shipping release.

---

# 37. Final Store Metadata Summary

```text
Repository release: v1.8.0
Store version:       1.0.0
Public Gmail:        disabled pending Google approval
```

## Apple

```text
Name:
ApplyMate
Subtitle:
Job Application Tracker
Primary Category:
Productivity
Secondary Category:
Business
Keywords:
career,interview,reminders,job search,employment,organizer,opportunities,follow up
Support URL:
https://shehzadm-muhammad.github.io/ApplyMate/
Privacy Policy:
https://shehzadm-muhammad.github.io/ApplyMate/privacy-policy.html
Privacy Choices:
https://shehzadm-muhammad.github.io/ApplyMate/delete-account.html
Expected Age Rating:
4+ subject to App Store Connect calculation
```

## Google Play

```text
Name:
ApplyMate
Short Description:
Track job applications, reminders and progress in one simple place.
Category:
Productivity
Privacy Policy:
https://shehzadm-muhammad.github.io/ApplyMate/privacy-policy.html
Account Deletion:
https://shehzadm-muhammad.github.io/ApplyMate/delete-account.html
Ads:
No
In-app purchases:
No
Public Gmail functionality:
Disabled pending restricted-scope approval
```

---

# 38. Freeze Rule

This file must be reviewed against the exact final tagged source before either store submission.

If the implementation changes in a way that affects:

* collected data;
* transmitted data;
* SDKs;
* Gmail behaviour;
* advertising;
* analytics;
* payments;
* permissions;
* account deletion;

the corresponding Apple App Privacy and Google Play Data Safety declarations must be updated before release.
