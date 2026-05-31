/**
 * @module Attendance
 */
export class AttendanceHeader {
  /**
   * Class which contains header info in the Attendance API
   * @param {string} branchdesc - Description of the branch
   * @param {string} name - Name of the student or entity
   * @param {string} programdesc - Description of the program
   * @param {string} stynumber - Style number or identifier
   */
  constructor(branchdesc, name, programdesc, stynumber) {
    this.branchdesc = branchdesc;
    this.name = name;
    this.programdesc = programdesc;
    this.stynumber = stynumber;
  }

  /**
   * Static method to create an AttendanceHeader from a JSON object
   * @param {object} resp - JSON object representing AttendanceHeader
   * @returns {AttendanceHeader} A new AttendanceHeader instance
   */
  static from_json(resp) {
    return new AttendanceHeader(resp.branchdesc, resp.name, resp.programdesc, resp.stynumber);
  }
}

export class Semester {
  /**
   * Class which contains Semester info
   * @param {string} registration_code - Registration code of the semester
   * @param {string} registration_id - Registration ID of the semester
   * @param {object} [options={}] - Additional semester metadata
   * @param {boolean} [options.is_grade_card_complete] - Whether the grade card is complete for this semester
   * @param {string} [options.grade_card_source] - Source used to expose the semester for grade cards
   */
  constructor(registration_code, registration_id, options = {}) {
    this.registration_code = registration_code;
    this.registration_id = registration_id;

    if (Object.prototype.hasOwnProperty.call(options, "is_grade_card_complete")) {
      this.is_grade_card_complete = options.is_grade_card_complete;
    }
    if (options.grade_card_source) {
      this.grade_card_source = options.grade_card_source;
    }
  }

  /**
   * Static method to create a Semester from a JSON object
   * @param {object} resp - JSON object representing Semester
   * @param {object} [options={}] - Additional semester metadata
   * @returns {Semester} A new Semester instance
   */
  static from_json(resp, options = {}) {
    return new Semester(resp.registrationcode, resp.registrationid, options);
  }
}

export class AttendanceMeta {
  /**
   * Class which contains metadata for Attendance
   * @param {object} resp - JSON response object with headers and semesters
   */
  constructor(resp) {
    this.raw_response = resp;
    this.headers = resp.headerlist.map(AttendanceHeader.from_json);
    this.semesters = resp.semlist.map(Semester.from_json);
  }

  /**
   * Returns the latest AttendanceHeader
   * @returns {AttendanceHeader} The first header in the list
   */
  latest_header() {
    return this.headers[0];
  }

  /**
   * Returns the latest Semester
   * @returns {Semester} The first semester in the list
   */
  latest_semester() {
    return this.semesters[0];
  }
}
