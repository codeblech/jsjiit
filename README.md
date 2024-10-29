# 🎓 JSJIIT - JIIT Web Portal Wrapper

because manually checking attendance is destroying my mental health fr fr (and because i'm running out of "why did I even do that" moments)

## what even is this

a javascript wrapper that lets you programmatically interact with JIIT's web portal. one must imagine the developer happy.

god knew i'd be too powerful if I could solve captchas everyday so here we are

## ✨ features (real)

- 🔐 login without the captcha (thanks to da goat [codelif](https://github.com/codelif/))
- 📊 get attendance details (or don't, ignorance is bliss)
- 📝 check exam schedules (trauma incoming)
- 📈 fetch grades (fuck grades)
- 👀 view SGPA/CGPA (this healing shit taking forever)

## how to use this (if you're still here)

first import the `WebPortal` class:

```javascript
import { WebPortal } from './src/wrapper.js';
```

then let's speedrun this depression:

```javascript
// create your portal buddy (they won't leave you like she did)
const portal = new WebPortal();

// login (fingers crossed bestie)
await portal.student_login('your_username', 'your_password');
```

#### everything below needs login:

```javascript
// check grades (don't)
const gradeCardSems = await portal.get_semesters_for_grade_card();
const latestSem = gradeCardSems[0];
const grades = await portal.get_grade_card(latestSem);
```

```javascript
// get attendance (prepare for disappointment)
const meta = await portal.get_attendance_meta();
const sem = meta.latestSemester();
const header = meta.latestHeader();
const attendance = await portal.get_attendance(header, sem);
```
```javascript
// Get attendace for every class of a subject
const subjectIndex = 1;
let subjectid = attendance["studentattendancelist"][subjectIndex]["subjectid"];
let individualsubjectcode = attendance["studentattendancelist"][subjectIndex]["individualsubjectcode"];
const possibleComponentCodes = ["Lsubjectcomponentid", "Psubjectcomponentid", "Tsubjectcomponentid"]
let subjectcomponentids = [];
for (let possibleComponentCode of possibleComponentCodes) {
if (attendance["studentattendancelist"][subjectIndex][possibleComponentCode]) {
    subjectcomponentids.push(attendance["studentattendancelist"][subjectIndex][possibleComponentCode]);
}
}
let subjectAttendance = await w.get_subject_daily_attendance(sem, subjectid, individualsubjectcode, subjectcomponentids);
```
```javascript
// Check SGPA & CGPA
const sgpaCgpa = await w.get_sgpa_cgpa();
```
```javascript
// Download marks for a semester
const marksSems = await w.get_semesters_for_marks();
const previousSem = marksSems[1];
const marks = await w.download_marks(previousSem);
```
```javascript
// Get registered subjects & faculties for a semester
const registerdSems = await w.get_registered_semesters();
const latestSem = registerdSems[0];
const registeredSubjects = await w.get_registered_subjects_and_faculties(latestSem);
```
```javascript
// Get Exam Schedule & Venue
const examSems = await w.get_semesters_for_exam_events();
const latestSem = examSems[0];
const examEvents = await w.get_exam_events(latestSem);
const examSchedule = await w.get_exam_schedule(examEvents[0]);
```
```javascript
// Get Personal info like name, address ...
const personalInfo = await w.get_personal_info();
```

## we're all gonna make it

if this wrapper helped you avoid a mental breakdown, consider starring the repo (parasocial validation appreciated)

## disclaimer

not liable for any emotional damage caused by viewing your attendance. that's between you and god fr

## special thanks
massive shoutout to [codelif](https://github.com/codelif/) for creating [pyjiit](https://pyjiit.codelif.in/introduction.html).\
y'all should check out pyjiit, it's the original goat that made jsjiit possible.

## future
- me: be funny
- repo: be funnier
- both: we're so back