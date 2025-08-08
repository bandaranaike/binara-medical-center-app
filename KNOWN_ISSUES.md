In the admin table when a filter is applied and deleted one, need to keep the filter when reloading the table. — Done

Cant delete doctor:
message	"SQLSTATE[23000]: Integrity constraint violation: 1451 Cannot delete or update a parent row: a foreign key constraint fails (`binara_db`.`doctor_availabilities`, CONSTRAINT `doctor_availabilities_doctor_id_foreign` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`)) (Connection: mysql, SQL: delete from `doctors` where `id` in (21))"
exception	"Illuminate\\Database\\QueryException" — Done

Pharmacy admin cant see categories. — Done

The minimum stock level should be coming to the drug, not the brand — Done

Services do not have the search functionality. — Done
 
Treatments should be able to be created in the doctor's area. — Done

Total in the doctor's service is not working. — Done

Need a button to send directly to reception from the doctor area. — Done

Doctor medicine adding is not working. — Done

