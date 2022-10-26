_RES = [];
//_tdp_id = 7150262422525135646;
_request_type_id = 6803673793030878258; // Тип заявки - Записать в Школу лидерства - Руководитель отдела

_closeDateBeg = { PARAM2 }
  ? "and $elem/close_date >= date('" + StrDate({ PARAM2 }, false) + "')"
  : "";
_closeDateFin = { PARAM3 }
  ? "and $elem/close_date <= date('" + StrDate({ PARAM3 }, false) + "')"
  : "";

_requests = XQuery(
  "for $elem in requests where $elem/request_type_id=" +
    _request_type_id +
    " and $elem/status_id='close' " +
    _closeDateBeg +
    " " +
    _closeDateFin +
    " return $elem"
);

_events = [];

_searchParam = { PARAM1 };

if (_searchParam != "") {
  _typical_program = ArrayOptFirstElem(
    XQuery(
      "for $elem in typical_development_programs where contains ($elem/name, '" +
        _searchParam +
        "') return $elem"
    )
  );

  if (_typical_program != undefined) {
    _typical_program_id = _typical_program.id;
    _typDevProgDoc = OpenDoc(UrlFromDocID(_typical_program_id));
    _typDevProgDoc_te = _typDevProgDoc.TopElem;
    _tasks = _typDevProgDoc_te.tasks;

    _x = 12;
    for (j = 0; j < ArrayCount(_tasks); j++) {
      _task = _tasks[j];
      _cc = columns[_x];
      _cc.flag_formula = true;
      _cc.column_title = "" + _task.name;
      _cc.column_value = "ListElem.entry_" + j + "";
      _cc.datatype = "integer";
      _x++;

      _event_obj = {};
      _event_obj.object_type = _task.object_type;
      _event_obj.object_id = _task.object_id;
      _event_obj.entry_name = "entry_" + j + "";
      _events.push(_event_obj);
    }
  }
} else {
  alert("Выберите типую программу развития");
}

_uniquePerson = [];
_uniquePersons = ArraySelectDistinct(_requests, "person_id");
for (_unPer in _uniquePersons) {
  _person = {};
  _person.id = _unPer.person_id;
  _subdivision =
    _unPer.person_id.OptForeignElem.position_parent_id.OptForeignElem
      .parent_object_id.OptForeignElem;
  _person.market = _subdivision.name;
  _person.region = _subdivision.region_id.OptForeignElem.name;
  _uniquePerson.push(_person);
}

for (_request in _requests) {
  _obj = {};
  _requestDoc = OpenDoc(UrlFromDocID(_request.id));
  if (_requestDoc != undefined) {
    _request_te = _requestDoc.TopElem;
    _obj.PrimaryKey = _request_te.id;

    person_id_str = String(_request_te.person_id);
    _current_person = ArrayOptFind(
      _uniquePerson,
      'String(This.id) =="' + person_id_str + '"'
    );
    _obj.region = _current_person.region;
    _obj.create_date = _request_te.create_date;

    for (workflow_entry in _request_te.workflow_log_entrys) {
      if (workflow_entry.finish_state == "confirmed") {
        _obj.confirm_date = workflow_entry.create_date;
      }
    }

    experience_years = "";
    experience_months = "";
    phone_number = "";
    for (custom_elem in _request_te.custom_elems) {
      if (custom_elem.name == "f_dgkw") {
        experience_years = custom_elem.value;
      }
      if (custom_elem.name == "f_tr5d") {
        experience_months = custom_elem.value;
      }
      if (custom_elem.name == "f_plws") {
        phone_number = custom_elem.value;
      }
    }

    _obj.experience_years = experience_years;
    _obj.experience_months = experience_months;

    _obj.hire_date = _request_te.person_id.OptForeignElem.hire_date;
    // ТАБЕЛЬНЫЙ НОМЕР
    _obj.person_fullname = _request_te.person_fullname;
    _obj.person_position_name = _request_te.person_position_name;
    _obj.person_subdivision_name = _request_te.person_subdivision_name;

    _obj.market = _current_person.market;

    _obj.phone_number = phone_number;

    for (ev in _events) {
      searchActiveResults = "";
      searchFinishedResults = "";
      switch (ev.object_type) {
        case "assessment":
          searchActiveResults =
            "for $elem in active_test_learnings where $elem/assessment_id=" +
            ev.object_id +
            " and $elem/person_id=" +
            _request.person_id +
            " return $elem";
          searchFinishedResults =
            "for $elem in test_learnings where $elem/assessment_id=" +
            ev.object_id +
            " and $elem/person_id=" +
            _request.person_id +
            " return $elem";
          test_results = ArrayUnion(XQuery(searchActiveResults),XQuery(searchFinishedResults));
          _topScoreElem = ArrayOptMax(test_results, "This.score");
          if (_topScoreElem != undefined) {
            _obj[ev.entry_name] = _topScoreElem.score;
          } else {
            _obj[ev.entry_name] = "";
          }
          break;
        case "course":
          searchActiveResults =
            "for $elem in active_learnings where $elem/course_id=" +
            ev.object_id +
            " and $elem/person_id=" +
            _request.person_id +
            " return $elem";
          searchFinishedResults =
            "for $elem in learnings where $elem/course_id=" +
            ev.object_id +
            " and $elem/person_id=" +
            _request.person_id +
            " return $elem";

          course_results = ArrayUnion(
            XQuery(searchActiveResults),
            XQuery(searchFinishedResults)
          );

          _topScoreElem = ArrayOptMax(course_results, "This.score");
          if (_topScoreElem != undefined) {
            _obj[ev.entry_name] = _topScoreElem.score;
          } else {
            _obj[ev.entry_name] = "";
          }
          break;
      }
    }
    _RES.push(_obj);
  }
}

return _RES;
