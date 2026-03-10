# Plan: Switch from Brevo to MailerLite
## Goal
Replace the current Brevo integration with MailerLite API integration while maintaining the same functionality for contact forms, download requests, and assessment completions.

## General plan
The migration involves creating a new MailerLite service that replaces the Brevo functionality. The key aspects are:

1. **Create MailerLite Service**: Develop a new service that integrates directly with MailerLite API
2. **Update Existing Services**: Modify contactService, downloadRequestService, and assessmentService to use MailerLite instead of Brevo
3. **Maintain Data Flow**: Ensure all the same data fields are captured and sent to MailerLite
4. **Handle Groups/Lists**: Map the different sources (contact, download, assessment) to appropriate MailerLite groups

## Steps
1. **Create mailerliteService.ts** -> `lib/services/mailerliteService.ts`
   - Implement MailerLite API client with proper authentication
   - Create methods for adding/updating subscribers
   - Map source types to MailerLite groups
   - Handle all the data fields currently sent to Brevo

2. **Update contactService.ts** -> `lib/services/contactService.ts`
   - Replace brevoService import with mailerliteService
   - Update processContactMessage to use mailerliteService

3. **Update downloadRequestService.ts** -> `lib/services/downloadRequestService.ts`
   - Replace brevoService import with mailerliteService
   - Update saveDownloadRequest to use mailerliteService

4. **Update assessmentService.ts** -> `lib/services/assessmentService.ts`
   - Replace brevoService import with mailerliteService
   - Update saveAssessment to use mailerliteService

5. **Update config.ts** -> `lib/config.ts` (if needed)
   - Add MailerLite API key configuration

## Risks/Doubts
- Need to confirm MailerLite API key and group IDs
- Need to understand if MailerLite has rate limits that might affect the current flow
- Need to verify if all Brevo data fields can be mapped to MailerLite subscriber fields

## Verification
- Check that all imports are correctly updated
- Verify that the data mapping from Brevo format to MailerLite format is correct
- Ensure error handling is properly implemented
- Test that the services can be instantiated without errors

# Additional user provided details
