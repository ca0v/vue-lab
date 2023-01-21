# Freight Rate Proof of Concept

This is a proof of concept for a freight rate editor. It is a simple web app that allows a user to enter a shipment origin and destination, and then update the rates.

## Requirements

3 input fields:

* begin date
* ending date (determine it based on new begin)
* current record should have an end date of year 2100
* LB port cost
* NY port cost

### Vision as Proposed

* My vision is to have a form that shows the data in a list, the previous 12 months.
* Then an add button that pops up allowing you to select a new date.
* Then two fields to enter the prices.
* Does that make sense?

### My Understanding of that Vision

* The user should be able to see the previous 12 months of data.
* The user should be able to add a new date.
* The user should be able to enter two prices for the new date, one for LB and one for NY.

### Questions

* What is the meaning of "current record"?  Is 2100 meant to be "until further notice"?
* Does the user need to be able to edit the end date, or is that a calculated value?
* Is the data sortable? ANS: No, already sorted by date
* Is the data filterable? ANS: No, already filtered by date (last 12 months)
* Is the data searchable? ANS: No, just care about last 12 months
* Is the data exportable? ANS: No
* Is the data importable? ANS: No
* Is the data printable? Answer not provided, reporting likely done elsewhere
* Is the data shareable? Answer not provided but seems unlikely
* Is the user authenticated? ANS: Active Directory
* Is the user authorized? ANS: Active Directory
* Is the user audited? ANS: Active Directory, log updates and deletes.

### Assumptions (NOT confirmed)

* The price will be stored as a decimal number out to 2 decimal places.
* Let's discuss delete -- can anyone delete?  can historic data be deleted?
* Let's discuss edit -- can anyone edit?  can historic data be edited?

![My thought is we can delete anything that is not historical, for example, if the date is 1/20/2023 then only dates on or after can be deleted.](./assets/Screenshot%202023-01-20%20204844.png)

### Assumptions (confirmed)

They will be stored as UNC dates (numbers) and displayed with no time component.

As I currently understand the requirements, there will be a grid that lists some historic data, only one record will not have an ending data.  All other records will have an ending date and it will be in the past (before that latest starting date).

When the user adds a new record, that date must be greater than the latest starting date.  The user will be able to enter two prices, one for LB and one for NY.  The user will not be able to edit the ending date.  The prior "current" record will have the ending date updated to one day before the new starting date.

## Work Log

### 2023-01-20

2.75 hours - Initial Setup and Partially Mocked UX (responsive)

* 2:15pm-2:30pm - Setup scaffolding, deploy to Digital Ocean
* 2:45-3:00pm - Document requirements
* 3:00-3:15pm - Discuss requirements and future vision (UX layout)
* 3:15-3:30pm - Generate mock UX layout
* 5:00pm-5:30pm - Generate mock UX for Freight Rates Editor
* 5:30pm-6:00pm - Adds some basic form validation rules
* 6:00pm-6:15pm - Add "add" button for discussion
* 7:45pm-8:00pm - Add "delete" button (should historic data be deletable?)
* 8:30pm-8:45pm - Add "edit" and continue mocking "delete" functionality to confirm assumptions
* 8:45pm-9:00pm - mobile betterment

### 2023-01-21

* 8:00am-9:00am - Adds missing mock features (Offload, avg, table -> grid to improve responsiveness)
* 10:00am-11:00am - Mock edit/delete experience
* 10:30pm-11:00pm - Mock edit/delete experience

### Future

Inline editing would have been better but trying some animation so indicate where the new data is went