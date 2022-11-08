_RES = [];
_request_type_id = 6834376740098549468; // Записать в Школу лидерства - Заместитель Директора магазина
_last_clmn_num = 11;

_closeDateBeg = { PARAM2 } ? "and $elem/close_date >= date('" + StrDate({ PARAM2 }, false) + "')" : "";
_closeDateFin = { PARAM3 } ? "and $elem/close_date <= date('" + StrDate({ PARAM3 }, false) + "')" : "";

_requests = XQuery("for $elem in requests where $elem/request_type_id=" + _request_type_id + " and $elem/status_id='close' " + _closeDateBeg + " " + _closeDateFin + " return $elem");

_events = [];

_searchParam = OptInt({ PARAM1 });

if (_searchParam != undefined) {
  _typical_program = ArrayOptFirstElem(XQuery("for $elem in typical_development_programs where $elem/id=" + _searchParam + "  return $elem"));

  if (_typical_program != undefined) {
    _typical_program_id = _typical_program.id;
    _typDevProgDoc = OpenDoc(UrlFromDocID(_typical_program_id));
    _typDevProgDoc_te = _typDevProgDoc.TopElem;
    _tasks = _typDevProgDoc_te.tasks;

    _last_position = 0
    for (j = 0; j < ArrayCount(_tasks); j++) {
      _task = _tasks[j];
      _task_number = OptInt(_task.custom_elems.ObtainChildByKey("f_gepj").value);

      if (_task_number != undefined) {
        _position_number = _last_clmn_num + _task_number;
        _last_position = _last_position < _position_number ? _position_number : _position_number;
        _cc = columns[_position_number];
        _cc.flag_formula = true;
        _cc.column_title = "" + _task.name;
        _cc.column_value = "ListElem.entry_" + _position_number + "";
        _cc.datatype = "string";

        _event_obj = {};
        if (_task.type == 'education_method') {
          _event_obj.object_type = 'event';
          _event_obj.object_id = _task.name;
        } else {
          _event_obj.object_type = _task.object_type;
          _event_obj.object_id = _task.object_id;
        }
        _event_obj.entry_name = "entry_" + _position_number + "";
        _events.push(_event_obj);
      }
    }
  }
} else {
  throw "Не указан ID типовой программы развития";
}

_custom_fields = [
  { title: 'Опыт работы с категориями', field: 'experience_category', elem: 'f_wp8v' },
  { title: 'Готовность к переезду (указать города)', field: 'moving', elem: 'f_td9m' },
  { title: 'Является ли наставником', field: 'mentor', elem: 'f_8wc8' }
];

for (q = 0; q < ArrayCount(_custom_fields); q++) {
  _field = _custom_fields[q];
  _field_number = _last_position + 1;

  if (_field_number != undefined) {
    _cc = columns[_field_number];
    _cc.flag_formula = true;
    _cc.column_title = "" + _field.title;
    _cc.column_value = "ListElem.entry_" + _field_number + "";
    _cc.datatype = "string";

    _custom_obj = {};
    _custom_obj.object_type = 'custom';
    _custom_obj.object_id = _field.elem;
    _custom_obj.entry_name = "entry_" + _field_number + "";
    _events.push(_custom_obj);
    _last_position++;
  }
}

_uniquePerson = [];
_uniquePersons = ArraySelectDistinct(_requests, "person_id");

for (_unPer in _uniquePersons) {
  _person = {};
  _person.id = _unPer.person_id;
  _market_sub = OptInt(tools.call_code_library_method("okeylibTalentPool", "getPersonsMarketPlaceAndBosses", [OptInt(_person.id)]).market_sub_id);
  _sub_div_reg_name = '';
  _market_name = '';
  if (_market_sub != undefined) {
    _subdivision = ArrayOptFirstElem(XQuery("for $elem in subdivisions where $elem/id=" + _market_sub + " return $elem"));
    if (_subdivision != undefined) {
      _market_name = _subdivision.name;
      _sub_div_reg = _subdivision.region_id.OptForeignElem;
      if (_sub_div_reg != undefined)
        _sub_div_reg_name = _sub_div_reg.name;
    }
  }
  _person.market = _market_name;
  _person.region = _sub_div_reg_name;
  _uniquePerson.push(_person);
}

for (_request in _requests) {
  _obj = {};
  _requestDoc = OpenDoc(UrlFromDocID(_request.id));
  if (_requestDoc != undefined) {
    _request_te = _requestDoc.TopElem;
    _obj.PrimaryKey = _requestDoc.DocID;

    person_id_str = String(_request_te.person_id);
    _current_person = ArrayOptFind(
      _uniquePerson,
      'String(This.id) =="' + person_id_str + '"'
    );

    _obj.region = _current_person.region;
    _obj.market = _current_person.market;
    _obj.create_date = OptDate(_request_te.create_date, '');
    _obj.confirm_date = OptDate(_request_te.close_date, '');

    _obj.phone_number = _request_te.custom_elems.ObtainChildByKey("f_6jvd").value;
    _obj.experience_years = _request_te.custom_elems.ObtainChildByKey("f_q86v").value;
    _obj.experience_months = _request_te.custom_elems.ObtainChildByKey("f_v5y5").value;


    //    _obj.experience_category = _request_te.custom_elems.ObtainChildByKey("f_wp8v").value;
    //    _obj.moving = _request_te.custom_elems.ObtainChildByKey("f_td9m").value == 'true' ? "Да" : "";
    //    _obj.mentor = _request_te.custom_elems.ObtainChildByKey("f_8wc8").value == 'true' ? "Да" : "";


    _person_elem = _request_te.person_id.OptForeignElem;
    _obj.hire_date = _person_elem != undefined ? _person_elem.hire_date : "";
    _obj.tab_num = _person_elem != undefined ? _person_elem.code : "";
    _obj.person_fullname = _request_te.person_fullname;
    _obj.person_position_name = _request_te.person_position_name;
    _obj.person_subdivision_name = _request_te.person_subdivision_name;

    for (ev in _events) {
      if (ev.object_type != 'event' && ev.object_type != 'custom') {
        _fld_result = '';
        _search_catalog = '';
        if (ev.object_type == 'assessment') {
          _search_catalog = 'test_';
        }

        searchActiveResults = "for $elem in active_" + _search_catalog + "learnings where $elem/" + ev.object_type + "_id=" + ev.object_id + " and $elem/person_id=" + _request.person_id + " return $elem";
        searchFinishedResults = "for $elem in " + _search_catalog + "learnings where $elem/" + ev.object_type + "_id=" + ev.object_id + " and $elem/person_id=" + _request.person_id + " return $elem";
        _learning_results = ArrayUnion(XQuery(searchActiveResults), XQuery(searchFinishedResults));

        _soloTest = ArrayOptFirstElem(XQuery("for $elem in assessments where $elem/id= " + ev.object_id + " return $elem"));

        if (_soloTest != undefined) {
          _soloTestDOC = OpenDoc(UrlFromDocID(_soloTest.id));
          _soloTestDOC_te = _soloTestDOC.TopElem;
          _sections = _soloTestDOC_te.sections;
          _maxScore = 0
          for (_section in _sections) {
            _maxScore += _section.selection_ordering.select_num;
          }
        }

        _topScoreElem = ArrayOptMax(_learning_results, "This.score");

        if (ev.object_type == 'assessment') {
          _date = ArrayOptMin(_learning_results, "This.start_usage_date");
          if (_date != undefined) {
            _start_date = StrDate(_date.start_usage_date, false);
            _topScoreElem != undefined ? _obj[ev.entry_name] = _topScoreElem.score * 100 / _maxScore + "% (" + _start_date + ")" : _obj[ev.entry_name] = _start_date;
          } else {
            _topScoreElem != undefined ? _obj[ev.entry_name] = _topScoreElem.score * 100 / _maxScore + "%" : _obj[ev.entry_name] = "";

          }
        } else {
          _topScoreElem != undefined ? _obj[ev.entry_name] = _topScoreElem.score : _obj[ev.entry_name] = "";
        }

      } else if (ev.object_type == 'custom') {
        _custom_field_value = _request_te.custom_elems.ObtainChildByKey(ev.object_id).value;
        if (_custom_field_value == 'true' || _custom_field_value == 'false') {
          _obj[ev.entry_name] = _custom_field_value == 'true' ? 'Да' : ''
        } else {
          _obj[ev.entry_name] = _request_te.custom_elems.ObtainChildByKey(ev.object_id).value;
        }
      } else {
        _event_res = ArrayOptFirstElem(XQuery('for $elem in event_results where $elem/event_name="' + ev.object_id + '" and $elem/person_id=' + _request_te.person_id + ' and $elem/is_assist=true() return $elem'));
        _obj[ev.entry_name] = _event_res != undefined ? "+" : "-";
      }
    }
    _RES.push(_obj);
  }
}

return _RES;