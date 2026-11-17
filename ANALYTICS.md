# Website Analytics

How thesama.in measures who it reaches, what interests them, and whether that
interest becomes an inquiry or contribution. It covers the five metrics in the
monthly website report.

## What the site sends

The Google Analytics 4 property `G-JZ6WVNV9D6` is loaded in `public/index.html`.
The Google Tag Manager container `GTM-WJ73ZGCH` is loaded beside it.

**Recorded automatically by GA4** (enhanced measurement). This needs no code:
- page views, including in-app navigation;
- traffic source;
- engagement time;
- scrolls, outbound clicks and PDF downloads.

**Added by `src/analytics/index.js`:**

| Event | When it fires | Parameters |
|---|---|---|
| `corporate_donation_submit` | /donate, Corporate Fleet form accepted by the server | `form_name` |
| `individual_donation_submit` | /donate, Individual form, or Contact with topic "Donating laptops" | `form_name`, `inquiry_topic` |
| `partnership_inquiry_submit` | "Book 30 minutes with us", or Contact with topic Corporate partnership, Renew Desk, or Saathi model in my community | `form_name`, `inquiry_topic` |
| `support_inquiry_submit` | /donate, Financial / Volunteer form, or Contact with topic Sama Saathi or Mentoring | `form_name`, `inquiry_topic` |
| `laptop_request_submit` | /donate, laptop request from a learner | `form_name` |
| `ngo_registration_submit` | /ngoregistration accepted by the server | `form_name` |
| `newsletter_signup` | Build for Good newsletter | `form_name` |
| `contact_submit` | Contact with topic "Something else" | `form_name`, `inquiry_topic` |
| `cta_click` | Click on a link to /donate, /contact, /ngoregistration or /giving; an email, phone, WhatsApp, LinkedIn or Instagram link; "Book 30 minutes"; or a /donate option tab | `cta_type`, `link_text`, `link_destination` |
| `lead_form_start` | First click or typing into a lead form field | `form_name` |
| `lead_form_error` | The server rejected a submission, or it failed to send | `form_name` |

**How the events are kept clean:**
- Submit events fire only after the server confirms the submission. Button presses are counted separately as `cta_click`, never as submissions.
- No names, emails, phone numbers or message text are sent. Email addresses in link text are replaced with `[email]`.
- Staff devices are tagged `traffic_type=internal`: after an admin or ops login, that browser stays tagged even after logout. Local development builds are tagged the same way.
- Logged-in NGO, donor and school users get a `sama_role` user property, so their dashboard use can be separated from public visits.
- If GA is blocked or fails to load, every call does nothing. Pages and forms behave exactly as before.

## One-time GA4 setup

Do this in GA4 Admin, logged in with an Editor account on the property.

1. **Data retention.** Data collection and modification > Data retention > set event data to **14 months**. The default of 2 months stops month-on-month comparisons in Explore.
2. **Key events.** Data display > Events. Mark these as key events:
   - `corporate_donation_submit`
   - `individual_donation_submit`
   - `partnership_inquiry_submit`
   - `support_inquiry_submit`

   Mark `ngo_registration_submit` and `laptop_request_submit` too if they are being campaigned for. Events appear in this list about 24 hours after they first fire.
3. **Custom dimensions.** Data display > Custom definitions:
   - event scope: `form_name`, `inquiry_topic`, `cta_type`, `link_destination`;
   - user scope: `sama_role`.
4. **Internal traffic.** This keeps staff out of the numbers.
   1. Data streams > web stream > Configure tag settings > Define internal traffic. Add the office IP address with `traffic_type` value `internal`.
   2. Data collection and modification > Data filters > Internal Traffic. Leave it on *Testing* for a week, then set it to *Active*. Active filtering cannot be undone for that data.
   3. Optional, in GTM: the GTM copy of the GA tag sends the first page view of each visit, and that page view cannot see the website code's tag. To exclude that page view as well, add a Custom JavaScript variable to the Google tag `G-JZ6WVNV9D6` as parameter `traffic_type`:
      ```js
      function () {
        try {
          if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) || localStorage.getItem('_SamaStaffDevice_')) return 'internal';
        } catch (e) {}
        return undefined;
      }
      ```
5. **Enhanced measurement.** Data streams > web stream > Enhanced measurement:
   - Keep "Page changes based on browser history events" **on**. The site relies on it for page views.
   - Turn **Form interactions off**. Its `form_submit` counts submit button presses, failed ones included, which would muddy the report.
6. **Search Console.** Product links > Search Console links. Link `thesama.in` so the Google search queries behind organic visits appear in GA4.
7. **Partner referrals.** Data display > Channel groups > create "Sama channels" from the default group, then add a "Partner referral" channel:
   - Session source matches the partner domains; or
   - Session medium exactly matches `partner`.

## Tag every link you share (UTM)

LinkedIn and Instagram apps often hide where a visitor came from, so those
visits show up as "Direct". Add these tags to every link posted or sent:

| Where | Example |
|---|---|
| LinkedIn post | `https://thesama.in/donate?utm_source=linkedin&utm_medium=social&utm_campaign=2026-12-renew-desk` |
| Instagram bio or story | `https://thesama.in/?utm_source=instagram&utm_medium=social&utm_campaign=bio` |
| Partner newsletter or site | `https://thesama.in/giving?utm_source=<partner-name>&utm_medium=partner&utm_campaign=<campaign>` |
| Email signature or mailer | `...?utm_source=newsletter&utm_medium=email&utm_campaign=<month>` |

Use lowercase and hyphens, and keep one `utm_campaign` name per campaign.

## Monthly report (one page, about 30 minutes)

Set the date range to last month and compare it with the previous period.

| # | Metric | Where in GA4 |
|---|---|---|
| 1 | Visits by source | Reports > Acquisition > Traffic acquisition. Sessions by *Session default channel group* (or "Sama channels"). Switch to *Session source / medium* to see LinkedIn, Instagram and partners. |
| 2 | Engagement rate by source and entry page | The same report gives Engagement rate by channel. Reports > Engagement > Landing page gives Engagement rate by entry page. |
| 3 | Average engagement time on key pages | Reports > Engagement > Pages and screens. Search by page path, metric *Average engagement time per active user*. Key pages: `/`, `/initiatives`, `/our-approach`, `/sama-saathi`, `/giving`, `/first-laptop`, `/labs`, `/communications`, `/donate`, `/contact`, `/ngo-information`. Read it next to metric 4: more time alone is not better. |
| 4 | Completed inquiries and contributions | Reports > Engagement > Key events (or Events). Report one count per submit event above. Report button clicks separately from `cta_click`, broken down by `cta_type`. |
| 5 | Form completion rate (later) | Explore > Funnel exploration. Step 1 is `lead_form_start` with `form_name` set to the form. Step 2 is that form's submit event. Leave "Make open funnel" off, and break down by *Device category* to see mobile friction. Add `lead_form_error` counts to spot technical failures. |

Report layout: one row per metric with this month, last month and the change.
Close with two or three recommended actions.

**Cross-check against the database.** GA misses visitors who block analytics,
so the database is the true submission count. These read-only queries give
last month's numbers:

```sql
-- /donate submissions by form, plus "How did you hear about us"
SELECT form_type, hear_about, COUNT(*)
FROM sama_ops.public_contributions
WHERE created_at >= date_trunc('month', now()) - interval '1 month'
  AND created_at <  date_trunc('month', now())
GROUP BY 1, 2 ORDER BY 1, 3 DESC;

-- Contact, book-a-call and newsletter submissions
SELECT form_type, payload->>'topic' AS topic, COUNT(*)
FROM sama_ops.public_inquiries
WHERE created_at >= date_trunc('month', now()) - interval '1 month'
  AND created_at <  date_trunc('month', now())
GROUP BY 1, 2 ORDER BY 1, 3 DESC;
```

## Checking that events work

1. Open thesama.in with `?debug_mode=true`. Alternatively, use the Tag Assistant browser extension.
2. In GA4, open Admin > DebugView.
3. Click a Donate link, start typing in a form, and submit a test inquiry. `cta_click`, `lead_form_start` and the submit event should appear within seconds.
4. Delete the test inquiry from the database afterwards.

A browser that has logged in as admin or ops is tagged internal. Once the
Internal Traffic filter is active, its events disappear from the reports, so
test in a private window.

## Adding a new form

- Add `data-analytics-form="<name>"` to its `<form>`.
- After the server confirms the submission, call `trackFormSubmit('<name>')`.
- In the catch block, call `trackFormError('<name>')`.
- Add the name and its event to `SUBMIT_EVENTS` in `src/analytics/index.js`.
- For a button that opens a form, add `data-analytics-cta="<type>"`.
