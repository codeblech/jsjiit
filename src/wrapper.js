import { NotLoggedIn, SessionExpired, SessionError, AccountAPIError, LoginError, APIError } from "./exceptions.js";
import { RegisteredSubject, Registrations } from "./registration.js";
import { AttendanceMeta, AttendanceHeader, Semester } from "./attendance.js";
import { ExamEvent } from "./exam.js";
import { generate_local_name, serialize_payload } from "./encryption.js";

export const API = "https://webportal.jiit.ac.in:6011/StudentPortalAPI";
export const DEFCAPTCHA = { captcha: "phw5n", hidden: "gmBctEffdSg=" };

export class WebPortalSession {
  constructor(resp) {
    this.raw_response = resp;
    this.regdata = resp["regdata"];

    let institute = this.regdata["institutelist"][0];
    this.institute = institute["label"];
    this.instituteid = institute["value"];
    this.memberid = this.regdata["memberid"];
    this.userid = this.regdata["userid"];

    this.token = this.regdata["token"];
    let expiry_timestamp = JSON.parse(atob(this.token.split(".")[1]))["exp"];
    this.expiry = new Date(expiry_timestamp * 1000);

    this.clientid = this.regdata["clientid"];
    this.membertype = this.regdata["membertype"];
    this.name = this.regdata["name"];
    this.enrollmentno = this.regdata["enrollmentno"];
  }

  async get_headers() {
    const localname = await generate_local_name();
    return {
      Authorization: `Bearer ${this.token}`,
      LocalName: localname,
    };
  }
}

export class WebPortal {
  constructor() {
    this.session = null;
  }

  async __hit(method, url, options = {}) {
    let exception = APIError;
    if (options.exception) {
      exception = options.exception;
      delete options.exception;
    }

    let header;
    if (options.authenticated) {
      header = await this.session.get_headers();
      delete options.authenticated;
    } else {
      let localname = await generate_local_name();
      header = { LocalName: localname };
    }

    options.headers = { ...options.headers, ...header };

    const fetchOptions = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: options.json ? JSON.stringify(options.json) : options.body,
    };

    try {
      const response = await fetch(url, fetchOptions);

      if (response.status === 513) throw new exception("Portal temporarily unavailable (HTTP 513).");
      if (response.status === 401) throw new SessionExpired(response.error);

      const resp = await response.json();

      if (resp.status?.responseStatus !== "Success") {
        throw new exception(`status:\n${JSON.stringify(resp.status, null, 2)}`);
      }

      return resp;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("CORS")) {
        throw new exception("CORS error or portal temporarily unavailable.");
      }
      throw new exception(error.message || "Unknown error");
    }
  }

  async student_login(username, password, captcha = DEFCAPTCHA) {
    const pretoken_endpoint = "/token/pretoken-check";
    const token_endpoint = "/token/generate-token1";

    let payload = { username, usertype: "S", captcha };
    payload = await serialize_payload(payload);

    const resp = await this.__hit("POST", API + pretoken_endpoint, { body: payload, exception: LoginError });

    let payload2 = resp["response"];
    delete payload2["rejectedData"];
    payload2["Modulename"] = "STUDENTMODULE";
    payload2["passwordotpvalue"] = password;
    payload2 = await serialize_payload(payload2);

    const resp2 = await this.__hit("POST", API + token_endpoint, { body: payload2, exception: LoginError });

    this.session = new WebPortalSession(resp2["response"]);
    return this.session;
  }

  async get_personal_info() {
    const ENDPOINT = "/studentpersinfo/getstudent-personalinformation";
    const payload = {
      clinetid: "SOAU",
      instituteid: this.session.instituteid,
    };
    const resp = await this.__hit("POST", API + ENDPOINT, { json: payload, authenticated: true });
    return resp["response"];
  }

  async get_hostel_details() {
    const ENDPOINT = "/myhostelallocationdetail/gethostelallocationdetail";
    const payload = {
      clientid: this.session.clientid,
      instituteid: this.session.instituteid,
      studentid: this.session.memberid,
    };

    const resp = await this.__hit("POST", API + ENDPOINT, { json: payload, authenticated: true });

    if (!resp?.response) {
      throw new Error("Hostel details not found");
    }

    return resp.response;
  }


}


const authenticatedMethods = [
  "get_personal_info",
  "get_student_bank_info",
  "change_password",
  "get_attendance_meta",
  "get_attendance",
  "get_subject_daily_attendance",
  "get_registered_semesters",
  "get_registered_subjects_and_faculties",
  "get_semesters_for_exam_events",
  "get_exam_events",
  "get_exam_schedule",
  "get_semesters_for_marks",
  "download_marks",
  "get_semesters_for_grade_card",
  "__get_program_id",
  "get_grade_card",
  "__get_semester_number",
  "get_sgpa_cgpa",
  "get_hostel_details", // NEWLY ADDED
];

authenticatedMethods.forEach((methodName) => {
  WebPortal.prototype[methodName] = authenticated(WebPortal.prototype[methodName]);
});

function authenticated(method) {
  return function (...args) {
    if (this.session == null) {
      throw new NotLoggedIn();
    }
    return method.apply(this, args);
  };
}
