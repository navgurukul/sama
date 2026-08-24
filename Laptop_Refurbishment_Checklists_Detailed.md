**LAPTOP REFURBISHMENT PROGRAM**

Stage-Wise Standardized Process & Checklists

_Complete Operational Reference Document_

| **Document Type**  | Operational Checklist & SOP                                              |
| ------------------ | ------------------------------------------------------------------------ |
| **Scope**          | End-to-end laptop refurbishment - intake to monthly monitoring           |
| ---                | ---                                                                      |
| **Stages**         | 6 stages covering the full device lifecycle                              |
| ---                | ---                                                                      |
| **Intended Users** | Intake staff, refurbishers, QC team, dispatch coordinators, NGO liaisons |
| ---                | ---                                                                      |
| **Last Reviewed**  | 2025                                                                     |
| ---                | ---                                                                      |

**STAGE 1 - Laptop Received**

_Intake & Registration Stage_

**⏱ SLA**

Device must be fully registered within 24-48 hours of physical receipt.

If volume is high, prioritise same-day serial number verification and batch-upload remaining details within 48 hours.

**PURPOSE & SCOPE**

This stage covers every action required from the moment a device arrives at the facility until it is formally registered, tagged, and cleared to proceed to refurbishment. No device may move to Stage 2 without completing every item below.

**CHECKLIST - SERIAL NUMBER VERIFICATION**

- Locate the serial number on the physical device (underside label, BIOS screen, or original packaging).
- Cross-reference the serial number with the shared intake spreadsheet.

_Confirm the device is expected and not a duplicate entry._

- Check for any blacklist / stolen-device flags against the serial number.
- If serial number is missing or unreadable, escalate to a supervisor before proceeding.

**CHECKLIST - DASHBOARD UPLOAD**

- Open the device management dashboard and create a new device record.
- Enter: serial number, make, model, colour, and estimated year of manufacture.
- Record the source / donor organisation name and donation date.
- Assign and log the intake date and receiving staff member's name.
- Upload any accompanying documentation (donation receipt, prior service history).

**CHECKLIST - PHYSICAL CONDITION ASSESSMENT**

- Inspect and photograph the top lid - note all scratches, dents, cracks.
- Inspect and photograph the bottom panel - note damage, missing screws, stickers.
- Inspect the screen bezel and hinge - note wobble, cracks, or separation.
- Power on (if possible) and check for dead pixels, cracked panel, or backlight bleed.
- Inspect the keyboard - missing keys, sticky keys, visible liquid damage.
- Inspect all external ports - USB, HDMI, 3.5mm audio, charging port for physical damage.
- Record overall cosmetic grade in dashboard:

_Grade A = minimal wear, Grade B = visible wear, Grade C = heavy wear / cracks._

- Upload at least 4 photographs (front, back, left side, right side) to the dashboard.

**CHECKLIST - TAGGING**

- Generate a unique device ID / barcode from the dashboard.
- Print and affix the barcode label to the underside of the device.
- Scan the barcode to confirm the label is readable and linked to the correct record.
- Place device in a designated intake tray / shelf labelled with its unique ID.

**RESPONSIBILITY MATRIX**

| **Task**                               | **Responsible** | **Verified By**   |
| -------------------------------------- | --------------- | ----------------- |
| Serial number verification             | Intake Staff    | Intake Supervisor |
| ---                                    | ---             | ---               |
| Dashboard upload & data entry          | Intake Staff    | Intake Supervisor |
| ---                                    | ---             | ---               |
| Physical condition assessment & photos | Intake Staff    | Intake Supervisor |
| ---                                    | ---             | ---               |
| Barcode generation & tagging           | Intake Staff    | Intake Supervisor |
| ---                                    | ---             | ---               |

**DEFINITION OF DONE**

- Device record fully created and saved in the dashboard.
- Serial number verified - confirmed not a duplicate and not blacklisted.
- Physical condition documented with grade and minimum 4 photographs.
- Barcode label affixed and scanned successfully.
- Device placed in intake queue awaiting Stage 2.

**⛔ Validation Rule - Stage Gate**

Device CANNOT proceed to Stage 2 if:

• Any dashboard field is left blank or marked 'unknown'.

• Photographs have not been uploaded.

• Serial number could not be verified (escalate first).

• Barcode has not been physically affixed and scanned.

**STAGE 2 - Refurbishment & Testing**

_Hardware, Functional & Software Stage_

**⏱ SLA**

Standard target: 2-3 weeks per device from intake.

Devices with major hardware faults may take longer - status must be updated in dashboard weekly.

Devices idle for more than 5 working days without update must be escalated.

**PURPOSE & SCOPE**

This is the most technically intensive stage. The refurbisher is responsible for physical cleaning, hardware repairs, full functional testing, and software setup. Every item must be tested and the result recorded. Skipping any test is not permitted.

**CHECKLIST - HARDWARE CLEANING & PHYSICAL SETUP**

- Use compressed air to clear dust from vents, keyboard gaps, and fan blades.
- Open the chassis and clean the internal heatsink and fan assembly.
- Apply fresh thermal paste to the CPU (and GPU if applicable).
- Remove RAM sticks, clean contacts with isopropyl alcohol, reseat firmly.
- Remove SSD / HDD, inspect for physical damage, reseat or replace if necessary.
- Inspect the battery connector - reseat if loose; flag for replacement if swollen.
- Check all internal cable connections (display cable, keyboard ribbon, touchpad ribbon).
- Inspect and clean the charging port - remove debris, check for bent pins.
- Replace any missing or stripped screws on the chassis.
- Close chassis and confirm all panels are flush and secure.

**CHECKLIST - STORAGE WIPE & FORMAT**

- Boot from external media and run a full secure erase on the SSD / HDD.

_Use DBAN, Blancco, or manufacturer tool. Record the wipe tool and pass/fail result._

- Verify the wipe completed successfully - no residual partitions.
- If HDD, run a disk health check (CrystalDiskInfo or equivalent) - note health status.
- If SSD, check SMART data - flag drives below 80% health for replacement.
- Create a single primary partition ready for OS installation.

**CHECKLIST - FUNCTIONAL TESTING**

**Power & Display**

- Device powers on without error messages or unusual POST behaviour.
- Screen displays a full, clear image - no dead pixels, lines, or backlight bleed.
- Screen brightness adjusts correctly through all levels.
- No display flickering at any brightness level.
- Lid open / close sensor works - screen sleeps when lid is closed.

**Input Devices**

- Test every key on the keyboard - use a keyboard test tool.
- Confirm no sticky, stuck, or non-responsive keys.
- Touchpad moves cursor smoothly across the full surface.
- Left and right touchpad click buttons respond correctly.
- Multi-finger gestures work (two-finger scroll, pinch-to-zoom if supported).

**Battery**

- Check battery health using manufacturer tool or BatteryInfoView.
- Battery health must be ≥ 60% of original design capacity.

_If below 60%, flag for battery replacement before proceeding._

- Device charges when plugged in - charging indicator activates.
- Device runs on battery power alone - no unexpected shutdowns.

**Ports & Connectivity**

- Test each USB-A port - connect a USB device and confirm detection.
- Test USB-C port (if present) - data transfer and/or charging.
- Test HDMI port - connect to external display and confirm signal.
- Test 3.5mm audio jack - playback and microphone input.
- Test SD card slot (if present).
- Test Wi-Fi - connect to network, verify stable signal and internet access.
- Test Bluetooth - pair with a device and confirm data transfer.

**Camera & Audio**

- Webcam activates and displays a clear image.
- Built-in microphone records audio without distortion.
- Built-in speakers produce clear audio at multiple volume levels.

**CHECKLIST - SOFTWARE SETUP**

- Install operating system from approved clean image.

_Record OS version and edition (e.g., Windows 11 Home 23H2)._

- Complete initial OS setup - region, language, keyboard layout.
- Run Windows Update (or equivalent) - install all critical and security updates.
- Install all hardware drivers:

_Chipset, display, audio, Wi-Fi, Bluetooth, touchpad, webcam._

- Verify Device Manager shows no unknown or error devices.
- Install Remote Management Software (RMS) - confirm agent is active and reporting.
- Install any required standard software as per the approved software list.
- Remove any bloatware, trial software, or manufacturer pre-installs not on approved list.
- Set system time and date correctly.
- Confirm OS is NOT yet activated (licence key applied at Stage 3).

**COMMON ISSUES & ACTIONS**

| **Issue / Failure**                  | **Action Required**                                                              | **Escalate?**       |
| ------------------------------------ | -------------------------------------------------------------------------------- | ------------------- |
| Battery below 60% health             | Replace battery before proceeding - record new battery details in dashboard      | No                  |
| ---                                  | ---                                                                              | ---                 |
| SSD SMART health below 80%           | Replace SSD - re-run wipe and health check on new drive                          | No                  |
| ---                                  | ---                                                                              | ---                 |
| Dead pixel(s) on screen              | Single dead pixel: acceptable. 3+ dead pixels or visible clusters: replace panel | Yes - supervisor    |
| ---                                  | ---                                                                              | ---                 |
| Device fails to POST                 | Reseat RAM, CMOS reset, check display cable. If unresolved, escalate             | Yes - supervisor    |
| ---                                  | ---                                                                              | ---                 |
| Keyboard key(s) unresponsive         | Attempt reseating keyboard ribbon. If unresolved, replace keyboard               | No                  |
| ---                                  | ---                                                                              | ---                 |
| Charging port damaged / not charging | Repair or replace charging board - record in dashboard                           | No                  |
| ---                                  | ---                                                                              | ---                 |
| Wi-Fi card not detected              | Reseat Wi-Fi card, update drivers. If unresolved, replace card                   | No                  |
| ---                                  | ---                                                                              | ---                 |
| Unknown devices in Device Manager    | Identify and install missing driver. If unresolved, escalate                     | Yes - if unresolved |
| ---                                  | ---                                                                              | ---                 |

**RESPONSIBILITY MATRIX**

| **Task**                          | **Responsible** | **Verified By**   |
| --------------------------------- | --------------- | ----------------- |
| Hardware cleaning & thermal paste | Refurbisher     | QC (Stage 3)      |
| ---                               | ---             | ---               |
| Storage wipe & format             | Refurbisher     | QC (Stage 3)      |
| ---                               | ---             | ---               |
| Full functional testing           | Refurbisher     | QC (Stage 3)      |
| ---                               | ---             | ---               |
| OS installation & drivers         | Refurbisher     | QC (Stage 3)      |
| ---                               | ---             | ---               |
| RMS installation & confirmation   | Refurbisher     | QC (Stage 3)      |
| ---                               | ---             | ---               |
| Dashboard test result entry       | Refurbisher     | Intake Supervisor |
| ---                               | ---             | ---               |

**DEFINITION OF DONE**

- All hardware cleaning and component reseating completed.
- Storage securely wiped - wipe certificate or log saved to dashboard.
- All functional tests passed and results recorded in dashboard.
- OS installed, updated, and all drivers confirmed working.
- RMS installed and confirmed active in the management console.
- No outstanding error devices in Device Manager.
- Device status updated to 'Ready for QC' in dashboard.

**⛔ Validation Rule - Stage Gate**

Device CANNOT be marked as 'Refurbished' or proceed to Stage 3 if:

• Any functional test has not been completed.

• Any test result is recorded as FAIL without an approved resolution.

• RMS is not installed and confirmed active.

• Dashboard has not been updated with all test results.

• Device status must remain 'Repair Required' until all issues are resolved.

**STAGE 3 - Quality Check Before Distribution**

_Independent QC & Final Approval Stage_

**⏱ SLA**

QC must be completed at least 48 hours before the scheduled distribution date.

QC must be performed by a different person from the refurbisher who completed Stage 2.

Devices that fail QC must return to Stage 2 - a new QC check is required before re-approval.

**PURPOSE & SCOPE**

Quality Check is an independent, mandatory review of every device before it is distributed. The QC technician must re-verify all Stage 2 work from scratch - not simply accept the refurbisher's record. This stage also includes final security configuration (BIOS password, Windows licence).

**⚠ Important**

The QC technician and the Stage 2 refurbisher MUST be different individuals.

Under no circumstances may a refurbisher approve their own work.

The QC approver's name and date must be logged in the dashboard.

**CHECKLIST - RE-VERIFICATION OF STAGE 2 WORK**

- Confirm all Stage 2 checklist items are marked complete in the dashboard.
- Visually inspect the device chassis - no new damage since Stage 2.
- Confirm barcode label is intact and scannable.
- Power on the device - observe boot process for errors or unusual delays.
- Re-run keyboard test - confirm no faulty keys.
- Re-test touchpad - smooth movement, both click buttons, multi-finger gestures.
- Re-test all USB ports with a test device.
- Re-test HDMI output on an external display.
- Re-test Wi-Fi - connect to network, run a speed test, confirm stable connection.
- Re-test Bluetooth - pair and disconnect a device.
- Re-test webcam - confirm clear image in camera app.
- Re-test audio - speakers and microphone.
- Check battery percentage and that device charges correctly.
- Verify no dead pixels or display anomalies.

**CHECKLIST - SYSTEM PERFORMANCE CHECK**

- Open Task Manager - confirm CPU, RAM, and storage usage are within normal range at idle.
- Run a 5-minute basic performance / stress test - no throttling, shutdowns, or errors.
- Conduct a 10-15 minute live usage session:

_Open a browser, navigate to at least 3 websites, open a document, play a short video. Confirm no lag, freezes, or crashes._

- Check Windows Event Viewer - no critical or error-level events in the last 24 hours.
- Confirm fan spins up under load and cooling is adequate - no excessive heat.
- Verify startup time from power-on to desktop is within acceptable range (under 90 seconds).

**CHECKLIST - OS & SOFTWARE VERIFICATION**

- Confirm OS version and edition match the approved build specification.
- Confirm all Windows / OS updates have been applied.
- Open Device Manager - confirm zero unknown or error devices.
- Verify RMS agent is installed, running, and the device appears in the management console.
- Confirm no unapproved software is installed.
- Confirm no personal data, user accounts, or browser history from previous owners remains.
- Verify OS is clean-booting with no unwanted startup items.

**CHECKLIST - FINAL SECURITY CONFIGURATION**

- Access BIOS / UEFI settings.
- Set a BIOS / UEFI supervisor password.

_Use the standard approved BIOS password for this programme. Record that password has been set - do NOT record the password itself in the dashboard._

- Confirm boot order is set to internal drive first.
- Disable boot from external USB / optical drive (if policy requires).
- Save BIOS settings and reboot - confirm device boots normally.
- Apply the Windows licence key using the approved activation tool.

_Record the last 5 characters of the licence key in the dashboard for tracking._

- Confirm Windows is activated - Settings > Activation must show 'Windows is activated'.

**QC OUTCOME DECISION**

| **Outcome** | **Action**                                                                                                                                                             |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PASS**    | Mark device as 'QC Approved' in dashboard. Record QC technician name and date. Proceed to Stage 4.                                                                     |
| ---         | ---                                                                                                                                                                    |
| **FAIL**    | Mark device as 'QC Failed - Return to Stage 2'. Document all failure reasons in dashboard. Device must complete a full Stage 2 re-work and a new QC before proceeding. |
| ---         | ---                                                                                                                                                                    |

**RESPONSIBILITY MATRIX**

| **Task**                             | **Responsible**             | **Verified By** |
| ------------------------------------ | --------------------------- | --------------- |
| Re-verification of all Stage 2 items | QC Technician (independent) | QC Supervisor   |
| ---                                  | ---                         | ---             |
| Performance & live usage test        | QC Technician               | QC Supervisor   |
| ---                                  | ---                         | ---             |
| BIOS password configuration          | QC Technician               | QC Supervisor   |
| ---                                  | ---                         | ---             |
| Windows licence key activation       | QC Technician               | QC Supervisor   |
| ---                                  | ---                         | ---             |
| QC outcome recording in dashboard    | QC Technician               | QC Supervisor   |
| ---                                  | ---                         | ---             |

**DEFINITION OF DONE**

- All re-verification checks completed and passed.
- Performance test completed with no issues observed.
- OS verified activated - 'Windows is activated' confirmed.
- BIOS password set and boot confirmed.
- RMS confirmed active in the management console.
- Device status updated to 'QC Approved' in dashboard.
- QC technician name, date, and outcome recorded in dashboard.

**⛔ Validation Rule - Stage Gate**

Device CANNOT proceed to Stage 4 if:

• QC was performed by the same person who completed Stage 2.

• Any QC check item is incomplete or unresolved.

• Windows is not activated.

• BIOS password has not been set.

• RMS is not confirmed active.

• QC outcome is not recorded in the dashboard with approver name and date.

**STAGE 4 - Distribution / Dispatch**

_Device Handover & Tracking Stage_

**⏱ SLA**

Dispatch must be completed within 48 hours of QC approval (unless a scheduled batch date applies).

Dashboard must be updated on the day of dispatch - not retrospectively.

**PURPOSE & SCOPE**

This stage covers the physical handover of the device to the NGO or partner organisation and the full updating of dispatch records in the dashboard. Accurate dispatch records are critical for warranty, post-deployment follow-up, and impact reporting.

**CHECKLIST - PRE-DISPATCH VERIFICATION**

- Confirm device status is 'QC Approved' in the dashboard before packing.
- Scan barcode to bring up the device record - confirm it matches the physical device.
- Confirm the correct NGO / partner name is associated with this dispatch batch.
- Check that any special requirements from the NGO partner have been met (e.g., specific OS language, accessibility software).

**CHECKLIST - PACKAGING**

- Wrap device in bubble wrap or anti-static packaging.
- Include any accessories (charger, bag if applicable) - record what is included.
- Seal the box and label with: Device ID, NGO name, destination address, and dispatch date.
- If dispatching multiple devices, number each package (e.g., Box 1 of 5).

**CHECKLIST - DASHBOARD & DOCUMENTATION**

- Update device record in dashboard:

_Set status to 'Dispatched'. Enter dispatch date, courier / transport method, tracking number (if applicable)._

- Tag the NGO / partner organisation name and contact person in the device record.
- Record the name of the staff member who carried out the dispatch.
- Generate and save a dispatch note / handover document in the dashboard.
- If courier used - attach proof of collection / tracking confirmation to the device record.
- If direct handover - obtain a signed acknowledgement from the NGO representative and upload to dashboard.

**CHECKLIST - NGO PARTNER NOTIFICATION**

- Notify the NGO partner that the device has been dispatched.

_Include: Device ID, estimated delivery date, and support contact details._

- Share the post-deployment follow-up schedule with the NGO partner.

_Remind them of the 15-day check-in requirement (Stage 5)._

- Provide the NGO with the device's unique ID and how to reference it when reporting issues.

**DISPATCH RECORD - REQUIRED FIELDS**

| **Device ID**             | Unique barcode / dashboard ID                         |
| ------------------------- | ----------------------------------------------------- |
| **Serial Number**         | From device and dashboard record                      |
| ---                       | ---                                                   |
| **NGO / Partner Name**    | Full legal name of receiving organisation             |
| ---                       | ---                                                   |
| **NGO Contact Person**    | Name and phone number of receiving individual         |
| ---                       | ---                                                   |
| **Dispatch Date**         | DD/MM/YYYY                                            |
| ---                       | ---                                                   |
| **Dispatch Method**       | Courier name / direct delivery / collected by partner |
| ---                       | ---                                                   |
| **Tracking Number**       | Courier tracking number (if applicable)               |
| ---                       | ---                                                   |
| **Accessories Included**  | Charger, bag, other - or 'None'                       |
| ---                       | ---                                                   |
| **Dispatched By (Staff)** | Name of staff member completing dispatch              |
| ---                       | ---                                                   |
| **Acknowledgement Doc**   | Signed document uploaded: Yes / No                    |
| ---                       | ---                                                   |

**RESPONSIBILITY MATRIX**

| **Task**                         | **Responsible**                          | **Verified By**     |
| -------------------------------- | ---------------------------------------- | ------------------- |
| Pre-dispatch device verification | Dispatch Coordinator                     | Dispatch Supervisor |
| ---                              | ---                                      | ---                 |
| Packaging                        | Dispatch Coordinator                     | Dispatch Supervisor |
| ---                              | ---                                      | ---                 |
| Dashboard update & documentation | Dispatch Coordinator                     | Dispatch Supervisor |
| ---                              | ---                                      | ---                 |
| NGO partner notification         | Dispatch Coordinator / Programme Manager | Programme Manager   |
| ---                              | ---                                      | ---                 |

**DEFINITION OF DONE**

- Device physically dispatched to NGO / partner.
- All dispatch fields completed in dashboard on the day of dispatch.
- Signed acknowledgement or courier tracking confirmation uploaded.
- NGO partner notified with device details and follow-up schedule.
- Device status in dashboard updated to 'Dispatched'.

**⛔ Validation Rule - Stage Gate**

NO device may be dispatched if:

• Device status in dashboard is not 'QC Approved'.

• Any required dispatch field in the dashboard is incomplete.

• No acknowledgement or tracking confirmation has been obtained.

**STAGE 5 - Post-Deployment Follow-Up**

_15-Day Verification Stage_

**⏱ SLA**

First follow-up must occur within 15 days of the dispatch date.

If the NGO partner does not respond within 10 days, the coordinator must proactively contact them.

All issues reported must be logged in the dashboard within 24 hours of being reported.

**PURPOSE & SCOPE**

The post-deployment follow-up confirms the device has arrived safely, is operational, and any initial issues are captured and actioned. This stage closes the initial deployment loop and establishes a relationship with the NGO partner for ongoing monitoring (Stage 6).

**CHECKLIST - NGO PARTNER CONTACT**

- Contact the NGO partner by phone or email within 10 days of dispatch.

_Do not wait for the partner to reach out - initiate proactively._

- Confirm the device was received and the packaging was undamaged.
- Confirm the device powers on and is usable.
- Ask if any setup assistance was needed and whether it was resolved.
- Ask specifically about:

_Screen display, keyboard, touchpad, Wi-Fi, battery life, overall speed._

- Ask whether RMS has been accessed or if there are any questions about remote management.

**CHECKLIST - ISSUE IDENTIFICATION & LOGGING**

- If any hardware issue is reported - log in dashboard with:

_Device ID, issue description, date reported, NGO contact name._

- If any software issue is reported - log in dashboard with the same details.
- Assign a severity level to each issue:

_P1 = device unusable, P2 = major function impaired, P3 = minor issue / cosmetic._

- For P1 and P2 issues - initiate a resolution or collection process within 5 working days.
- For P3 issues - log for review at next monthly check-in (Stage 6).
- If no issues are reported - log 'No issues reported' with date in dashboard.

**CHECKLIST - REMOTE MANAGEMENT VERIFICATION**

- Log into the RMS console and confirm the device is showing as online.
- Confirm the last seen / heartbeat timestamp is within the last 48 hours.
- Run a remote health check if available - confirm no alerts flagged.
- If device is offline or not reporting - contact NGO partner to investigate.

**CHECKLIST - SATISFACTION & IMPACT CHECK**

- Ask the NGO coordinator: How many people / students have used the device?
- Ask: Is the device being used for its intended purpose?
- Record initial impact data in dashboard:

_Number of users, use case (education / admin / other)._

- Note any feedback or suggestions from the NGO partner.

**ISSUE SEVERITY & RESPONSE GUIDE**

| **Priority** | **Definition** | **Example** | **Response Time** |
| ------------ | -------------- | ----------- | ----------------- |

| P1  | Device completely unusable | Won't power on, broken screen | 5 working days | P2  | Major function impaired | No Wi-Fi, keyboard failure | 5 working days | P3  | Minor / cosmetic issue | Single key stiff, cosmetic scratch | Next monthly review |
| --- | -------------------------- | ----------------------------- | -------------- | --- | ----------------------- | -------------------------- | -------------- | --- | ---------------------- | ---------------------------------- | ------------------- |

**RESPONSIBILITY MATRIX**

| **Task**                            | **Responsible**                 | **Verified By**   |
| ----------------------------------- | ------------------------------- | ----------------- |
| Proactive NGO partner contact       | Programme Coordinator           | Programme Manager |
| ---                                 | ---                             | ---               |
| Issue logging & severity assignment | Programme Coordinator           | Programme Manager |
| ---                                 | ---                             | ---               |
| RMS remote verification             | Technical Support / Coordinator | Technical Lead    |
| ---                                 | ---                             | ---               |
| Impact data collection              | Programme Coordinator           | Programme Manager |
| ---                                 | ---                             | ---               |
| P1/P2 resolution initiation         | Technical Support               | Programme Manager |
| ---                                 | ---                             | ---               |

**DEFINITION OF DONE**

- NGO partner contacted and confirmed device receipt and working condition.
- All reported issues logged with severity level in dashboard.
- P1 / P2 issues escalated and resolution process initiated.
- RMS online status verified.
- Initial impact data (number of users, use case) recorded in dashboard.
- Follow-up status updated to 'Complete' in dashboard with date.

**STAGE 6 - Monthly Monitoring**

_Ongoing Tracking & Impact Measurement Stage_

**⏱ SLA**

Monthly check-in must occur within the first 10 days of each calendar month.

Dashboard must be updated within 24 hours of each check-in.

If an NGO partner is unresponsive for 2 consecutive months, escalate to the Programme Manager.

**PURPOSE & SCOPE**

Monthly monitoring ensures devices remain operational and continue to generate impact throughout their lifecycle. It also provides the programme with data to measure outcomes, identify systemic issues, and plan future refurbishment batches. This is a recurring stage with no end date.

**CHECKLIST - MONTHLY PARTNER CHECK-IN**

- Schedule and complete a monthly call or email check-in with the NGO partner.
- Confirm all previously dispatched devices are still in use at the organisation.
- Ask whether any devices have been lost, stolen, or decommissioned.

_If yes - update device status in dashboard immediately._

- Ask whether any new hardware or software issues have emerged since last check-in.
- Ask whether any accessories (chargers, bags) need to be replaced.
- Confirm the NGO partner's primary contact person is still the same - update if changed.

**CHECKLIST - USAGE & IMPACT TRACKING**

- Record the number of active users on the device this month.
- Record the primary use case:

_Education (student), education (teacher), administrative, vocational training, other._

- Note any change in use case from the previous month.
- Record the number of sessions / hours used per week (estimated by NGO coordinator).
- Ask for any impact stories, testimonials, or case studies - note in dashboard.
- Record total cumulative users and sessions in the dashboard for this device.

**CHECKLIST - TECHNICAL HEALTH REVIEW**

- Log into the RMS console and check the device's online status and last-seen timestamp.
- Review any RMS alerts or flags raised since the last check-in.
- Confirm OS and software are up to date - push updates remotely if possible.
- Check battery health trend - flag if deteriorating significantly month-on-month.
- Run a remote health diagnostic if available - record results.
- If device has been offline for more than 7 days - investigate and log reason.

**CHECKLIST - ISSUE MANAGEMENT**

- Review all open P3 issues from Stage 5 or prior months - update status.
- Log any new issues reported by the NGO partner this month with severity level.
- For any P1 / P2 issue identified - initiate resolution within 5 working days.
- If a device requires physical collection for repair - arrange logistics and update dashboard.
- Confirm resolution of any issues that were in progress from the previous month.

**CHECKLIST - END-OF-LIFE ASSESSMENT (12+ MONTHS POST-DEPLOYMENT)**

- For devices deployed over 12 months ago - conduct an annual health review.
- Assess whether the device still meets the minimum usability standard:

_Battery ≥ 40%, no critical hardware faults, OS still supported._

- If device is below minimum standard - initiate collection and assess for re-refurbishment or recycling.
- Record the end-of-life decision in the dashboard: Re-refurbish / Recycle / Extended use.
- Update the total useful life of the device in the dashboard (months in service).

**MONTHLY DASHBOARD UPDATE - REQUIRED FIELDS**

| **Check-in Date**           | DD/MM/YYYY                                             |
| --------------------------- | ------------------------------------------------------ |
| **NGO Contact Person**      | Name of person spoken to                               |
| ---                         | ---                                                    |
| **Device Status**           | In use / Lost / Stolen / Decommissioned / Under repair |
| ---                         | ---                                                    |
| **Active Users This Month** | Number                                                 |
| ---                         | ---                                                    |
| **Primary Use Case**        | Education / Admin / Vocational / Other                 |
| ---                         | ---                                                    |
| **New Issues Reported**     | Description and severity, or 'None'                    |
| ---                         | ---                                                    |
| **Open Issues Status**      | Updated status of any ongoing issues                   |
| ---                         | ---                                                    |
| **RMS Status**              | Online / Offline / Not reporting - with last-seen date |
| ---                         | ---                                                    |
| **Impact Notes**            | Any stories, testimonials, or notable outcomes         |
| ---                         | ---                                                    |
| **Action Items**            | Any follow-up actions required before next check-in    |
| ---                         | ---                                                    |
| **Updated By (Staff)**      | Name of staff member completing the update             |
| ---                         | ---                                                    |

**ESCALATION TRIGGERS**

**⚠ Escalate to Programme Manager if:**

NGO partner is unresponsive for 2 or more consecutive monthly check-ins.

More than 20% of devices at an NGO are reported as non-functional in any single month.

A device has been reported lost or stolen.

An NGO partner requests to transfer a device to a different organisation.

RMS shows a device has been offline for more than 30 days with no explanation.

**RESPONSIBILITY MATRIX**

| **Task**                              | **Responsible**                           | **Verified By**   |
| ------------------------------------- | ----------------------------------------- | ----------------- |
| Monthly partner check-in call / email | Programme Coordinator                     | Programme Manager |
| ---                                   | ---                                       | ---               |
| Usage & impact data collection        | Programme Coordinator                     | Programme Manager |
| ---                                   | ---                                       | ---               |
| RMS technical health review           | Technical Support                         | Technical Lead    |
| ---                                   | ---                                       | ---               |
| Issue logging & management            | Programme Coordinator / Tech Support      | Programme Manager |
| ---                                   | ---                                       | ---               |
| End-of-life assessment (annual)       | Technical Support + Programme Coordinator | Programme Manager |
| ---                                   | ---                                       | ---               |
| Dashboard monthly update              | Programme Coordinator                     | Programme Manager |
| ---                                   | ---                                       | ---               |

**DEFINITION OF DONE**

- Monthly check-in completed and NGO partner engaged.
- All usage and impact data recorded in dashboard.
- RMS health check completed and results logged.
- All open issues reviewed and statuses updated.
- Any new issues logged with severity level.
- End-of-life assessment completed for devices over 12 months old.
- Dashboard monthly update fully completed and saved.