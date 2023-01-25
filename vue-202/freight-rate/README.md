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

* What is the meaning of "current record"?  ANS: The record with the latest starting date.
* Is 2100 meant to be "until further notice"? ANS: Yes
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

### Feedback

* Display a message about the dates changing – like “The previous time block is going to change from _____ to ______” – do you want this to happen?  (DONE)

* If yes – then go back to main screen and highlight as it is currently doing. (DONE)
If no – stay on the screen and revert. (DONE)

* Same with the delete – if they delete a record – "are you sure – this will change  (fill in the blank)". (DONE)

* Remove the “Shipping zone” option.  (DONE)

* How far back did you load data?  Remove everything before Jan 2020.  The first record is Jan 2020.

## Work Log

### Future

* improve the "alert" experience, "dialog" experience
* need a solution for dev-specific endpoint
* create mock services, use writables
* [Python with Active Directory](https://pypi.org/project/ms-active-directory/)

### 2023-01-25

* 10:00am-10:30am - Modify "more" service to pull back next 12 (not next year)
* 11:00am-12:00pm - User is getting hammered with error alerts, need to fix that (toaster)
* 12:30pm-1:00pm - Apply requested changes (use 'time frame', remove logo placeholders, use "..." for "all future dates")
* 1:00pm-1:30pm - Improve dialog cancellation workflow (do not treat it as an error)

### 2023-01-24

4.25 hours - Adds database/transaction/services and UX improvements

* 07:30am-08:30am - Setup a mock database (sqlite)
* 11:30am-12:30pm - Created unit tests
* 12:30pm-02:00pm - Test, fix, refactor (wrapping up completed POC)
* 2:30pm-03:00pm - Apply feedback from UX review
* 11:30pm-11:45pm - Add mock data reset/injection service

### 2023-01-23

3.0 hours - Applied UX feedback, added mock services

* 08:00am-08:30am - test workflow logic (add, edit, delete)
* 10:30am-11:00am - move data into a mock service
* 4:00pm-6:00pm - apply feedback from UX review

### 2023-01-22

3.0 hours - In-memory POC operational with change feedback

* 01:00am-01:30am - Using [heroicons](https://heroicons.com/) for trash/edit
* 01:00pm-01:15pm - Remove defects, get good UX flow
* 01:15pm-01:30pm - Add kbd shortcuts
* 01:30pm-02:00pm - Working out delta notification UX (blue underline?)
* 09:00pm-09:30pm - Refactor
* 09:30pm-10:00pm - Add "more" button and the mock experience

### 2023-01-21

3.0 hours - Mocked UX (responsive, edit/delete/add hilite changes)

* 8:00am-9:00am - Adds missing mock features (Offload, avg, table -> grid to improve responsiveness)
* 10:00am-11:00am - Mock edit/delete experience
* 10:30pm-11:00pm - Mock edit/delete experience (continued)
* 11:00pm-11:30pm - Added a hilite feature to show the changes (row editor may have been better)

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
