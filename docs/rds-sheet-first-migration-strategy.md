# Original ERD

```mermaid
erDiagram
		EXTERNAL_REGISTERED_NGO ||--o{ PRELIMINARY : maps_ngo_to_donor

		USERDETAILS ||--o{ LAPTOP_USER_MAP : assigned
		LAPTOP_LABELING ||--o{ LAPTOP_USER_MAP : maps

		LAPTOP_LABELING ||--o{ AUDIT_FOR_LAPTOPS : changes_logged

		REPORT }o--|| PRELIMINARY : by_ngoid

		LAPTOP_LABELING {
			text id PK
			timestamp date_committed
			text donor_company_name
			text ram
			text rom
			text manufacturer_model
			text processor
			date manufacturing_date
			text condition_status
			text minor_issues
			text major_issues
			text other_issues
			text inventory_location
			text laptop_weight
			text mac_address
			text status
			text working
			numeric battery_capacity
			text allocated_to
			timestamp last_updated_on
			text last_updated_by
			text assigned_to
			text inspection_files
			text activitywatch_pdf
			timestamp activity_date
			text afk_time
			numeric usage_hours
			integer off_times
			timestamp last_delivery_date
			timestamp refurbishment_date
			text batch
			text comment_for_issues
		}

		USERDETAILS {
			bigint id PK
			text ngo
			text name
			text email
			text contact_number
			text address
			text address_state
			text id_proof_type
			text id_proof_number
			text qualification
			text occupation
			date date_of_birth
			text use_case
			integer family_members_count
			text guardian_occupation
			numeric family_annual_income
			text status
			text laptop_assigned
			text id_link
			text income_certificate_link
			timestamp date_time
			text doner
			timestamp assigned_at
		}

		PICKUP {
			text pickup_id PK
			text donor_company
			text poc_name
			text poc_contact
			text poc_email
			integer number_of_laptops
			text pickup_location
			text pickup_by
			timestamp current_date_time
			text status
			timestamp confirm_pickup_date
			timestamp updated_on
			text updated_by
		}

		AUDIT_FOR_LAPTOPS {
			bigint audit_id PK
			text id FK
			text field
			text from_value
			text to_value
			text updated_by
			timestamp updated_on
		}

		PRELIMINARY {
			bigint id PK
			text ngoid
			integer number_of_school
			integer number_of_teacher
			integer number_of_student
			integer number_of_female_student
			text states
			text course
			text unit
			text doner
			text request_type
			text ngo_prelim_requests
		}

		REPORT {
			bigint id PK
			text ngoid
			text month
			integer number_of_teachers_trained
			integer number_of_school_visits
			integer number_of_sessions_conducted
			integer number_of_modules_completed
			numeric total_students_intent_rating_per_module
			text status
		}

		LAPTOP_USER_MAP {
			bigint map_id PK
			text laptop_id FK
			bigint user_id FK
			date issued_date
		}

		METRICS_BASE {
			bigint metric_id PK
			text field
			text multiplier
			text col_3
			text col_4
			text data_to_be_displayed_on_dashboard
		}

		INFECTION {
			text serial_number PK
			date date
			text summary
			text log
		}

		AVERAGE_DAYS_COUNT {
			text id
			date pickup_requested_date
			date distributed_date
			integer days_difference
			date calculated_on
		}

		EXTERNAL_REGISTERED_NGO {
			text id PK
			text doner
		}
```

# How to Include Changes (without normalization)

1. Keep `LAPTOP_LABELING` as the latest-state table for all existing reads.
2. Add `LAPTOP_EVENT_LOG` as append-only history for every update event.
3. Add `LAPTOP_VERSIONS` as full snapshot per version (one row per laptop change).
4. Add `LAPTOP_STAGE_RUNS` to track process stage execution attempts.
5. Add `LAPTOP_CHECKLIST_RESPONSES` for checklist/gate compliance.
6. Add `QC_CHECKS` to support layered QC.
7. Add `ISSUE_FEEDBACK` for post-dispatch learning and repeated-failure tracking.
8. Write flow for each update:
	 - read current laptop row
	 - update `LAPTOP_LABELING`
	 - insert field-level event into `LAPTOP_EVENT_LOG`
	 - insert row snapshot into `LAPTOP_VERSIONS`
	 - insert/update stage and QC tables if status changed

# New ERD (with Control, Traceability, Learning)

```mermaid
erDiagram
		USERDETAILS ||--o{ LAPTOP_USER_MAP : assigned
		LAPTOP_LABELING ||--o{ LAPTOP_USER_MAP : maps
		LAPTOP_LABELING ||--o{ AUDIT_FOR_LAPTOPS : legacy_changes

		LAPTOP_LABELING ||--o{ LAPTOP_EVENT_LOG : emits
		LAPTOP_LABELING ||--o{ LAPTOP_VERSIONS : versioned_as
		LAPTOP_LABELING ||--o{ LAPTOP_STAGE_RUNS : progresses_through
		LAPTOP_STAGE_RUNS ||--o{ LAPTOP_CHECKLIST_RESPONSES : has
		LAPTOP_LABELING ||--o{ QC_CHECKS : validated_by
		LAPTOP_LABELING ||--o{ ISSUE_FEEDBACK : receives

		REPORT }o--|| PRELIMINARY : by_ngoid
		EXTERNAL_REGISTERED_NGO ||--o{ PRELIMINARY : maps_ngo_to_donor

		LAPTOP_LABELING {
			text id PK
			timestamp date_committed
			text donor_company_name
			text ram
			text rom
			text manufacturer_model
			text processor
			date manufacturing_date
			text condition_status
			text minor_issues
			text major_issues
			text other_issues
			text inventory_location
			text laptop_weight
			text mac_address
			text status
			text working
			text allocated_to
			timestamp last_updated_on
			text last_updated_by
			text assigned_to
			text inspection_files
			text activitywatch_pdf
			timestamp activity_date
			text afk_time
			numeric usage_hours
			integer off_times
			timestamp last_delivery_date
			timestamp refurbishment_date
			text batch
			text comment_for_issues
		}

		LAPTOP_EVENT_LOG {
			bigint event_id PK
			text laptop_id FK
			text event_type
			text field_name
			text old_value
			text new_value
			text actor
			timestamp event_time
			text reason
		}

		LAPTOP_VERSIONS {
			bigint version_id PK
			text laptop_id FK
			bigint version_no
			jsonb snapshot_json
			text changed_by
			timestamp changed_at
			text change_reason
		}

		LAPTOP_STAGE_RUNS {
			bigint stage_run_id PK
			text laptop_id FK
			text stage_name
			text run_status
			text started_by
			timestamp started_at
			text completed_by
			timestamp completed_at
		}

		LAPTOP_CHECKLIST_RESPONSES {
			bigint response_id PK
			bigint stage_run_id FK
			text checklist_item
			text response_value
			text responded_by
			timestamp responded_at
			text remark
		}

		QC_CHECKS {
			bigint qc_check_id PK
			text laptop_id FK
			text qc_layer
			text qc_result
			text defect_type
			text checked_by
			timestamp checked_at
			text remark
		}

		ISSUE_FEEDBACK {
			bigint issue_id PK
			text laptop_id FK
			text issue_source
			text issue_category
			text severity
			text reported_by
			timestamp reported_at
			text resolution_action
			timestamp resolved_at
		}

		USERDETAILS {
			bigint id PK
			text ngo
			text name
			text email
			text contact_number
			text address
			text address_state
			text id_proof_type
			text id_proof_number
			text qualification
			text occupation
			date date_of_birth
			text use_case
			integer family_members_count
			text guardian_occupation
			numeric family_annual_income
			text status
			text laptop_assigned
			text id_link
			text income_certificate_link
			timestamp date_time
			text doner
		}

		PRELIMINARY {
			bigint id PK
			text ngoid
			integer number_of_school
			integer number_of_teacher
			integer number_of_student
			integer number_of_female_student
			text states
			text course
			text unit
			text doner
			text request_type
			text ngo_prelim_requests
		}

		REPORT {
			bigint id PK
			text ngoid
			text month
			integer number_of_teachers_trained
			integer number_of_school_visits
			integer number_of_sessions_conducted
			integer number_of_modules_completed
			numeric total_students_intent_rating_per_module
			text status
		}

		LAPTOP_USER_MAP {
			bigint map_id PK
			text laptop_id FK
			bigint user_id FK
			date issued_date
		}

		AUDIT_FOR_LAPTOPS {
			bigint audit_id PK
			text id FK
			text field
			text from_value
			text to_value
			text updated_by
			timestamp updated_on
		}

		EXTERNAL_REGISTERED_NGO {
			text id PK
			text doner
		}
```
