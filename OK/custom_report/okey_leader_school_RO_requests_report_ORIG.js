_RES = [];
// 7150955768155877216
//_tdp_id = 7150262422525135646;
_request_type_id = 6803673793030878258; // Тип заявки - Записать в Школу лидерства - Руководитель отдела
_last_clmn_num = 9;

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

        if (_task.type == 'test_learning') {
          _date_col_num = OptInt(_position_number) + 1
          for (i = 0; i < 3; i++) {
            _cc = columns[_date_col_num];
            _cc.flag_formula = true;
            i == 0 ? _cc.column_title = "Дата назначения" : _cc.column_title = "Результат " + i;
            _cc.column_value = "ListElem.entry_" + _date_col_num + "";
            _cc.datatype = "string";
            _date_col_num++;
          }

          _position_number += 3;

        }
        _last_position = _last_position < _position_number ? _position_number : _position_number;

        _event_obj.entry_name = "entry_" + _position_number + "";
        _events.push(_event_obj);
      }
    }
  }
} else {
  throw "Не указан ID типовой программы развития";
}

_custom_fields = [
  { title: 'Опыт работы с категориями', field: 'experience_category', elem: 'f_nf6v' },
  { title: 'Готовность к переезду (указать города)', field: 'moving', elem: 'f_9ibs' },
  { title: 'Является ли наставником', field: 'mentor', elem: 'f_fgoa' }
];

//alert(ArrayCount(_custom_fields))
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
_uniquePersons = ArraySelectDistinct(_requests, "This.person_id");

//alert("_uniquePersons: " + ArrayCount(_uniquePersons));
for (_unPer in _uniquePersons) {
  _person = {};
  _person.id = _unPer.person_id;
  _market_sub = OptInt(tools.call_code_library_method("okeylibTalentPool", "getPersonsMarketPlaceAndBosses", [OptInt(_person.id)]).GetOptProperty("market_sub_id"));

  //alert("Market sub for " + _unPer.person_fullname + ": " + _market_sub); 
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
  _person.current_state = _unPer.person_id.OptForeignElem != undefined ? _unPer.person_id.OptForeignElem.current_state : '';
  _uniquePerson.push(_person);
}



for (_request in _requests) {
  _obj = {};
  _requestDoc = OpenDoc(UrlFromDocID(_request.id));
  if (_requestDoc != undefined) {
    _request_te = _requestDoc.TopElem;
    _obj.PrimaryKey = _requestDoc.DocID;
    _current_person = ArrayOptFind(_uniquePerson, 'OptInt(This.id) == OptInt(' + _request_te.person_id + ')');
    _obj.region = _current_person != undefined ? String(_current_person.region) : '';
    _obj.market = _current_person != undefined ? String(_current_person.market) : '';
    _obj.current_state = _current_person != undefined ? String(_current_person.current_state) : '';
    _obj.create_date = OptDate(_request_te.create_date, '');
    _obj.confirm_date = OptDate(_request_te.close_date, '');

    _obj.experience_months = OptInt(_request_te.custom_elems.ObtainChildByKey("f_tr5d").value, "-");
    _obj.experience_years = OptInt(_request_te.custom_elems.ObtainChildByKey("f_dgkw").value, "-");
    _obj.phone_number = String(_request_te.custom_elems.ObtainChildByKey("f_plws").value);

    //_obj.experience_category = String(_request_te.custom_elems.ObtainChildByKey("f_nf6v").value);
    //_obj.moving = tools_web.is_true(_request_te.custom_elems.ObtainChildByKey("f_9ibs").value,false)? "Да" : "Нет";
    //_obj.mentor = tools_web.is_true(_request_te.custom_elems.ObtainChildByKey("f_fgoa").value,false) ? "Да" : "Нет";

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
        _sort_results = ArraySort(_learning_results, 'This.start_usage_date', '-')
        if (ev.object_type == 'assessment') {
          _date = ArrayOptMin(_learning_results, "This.start_usage_date");
          if (_date != undefined) {
            _start_date = StrDate(_date.start_usage_date, false);
            if (_topScoreElem != undefined) {
              _obj[ev.entry_name] = _topScoreElem.score * 100 / _maxScore + "%"
            } else {
              _obj[ev.entry_name] = "";
            }

            if (_sort_results != undefined) {
              _last_results = [];

              for (_result in _sort_results) {
                if (_result.score == _topScoreElem.score) continue;
                _last_results.push(_result.score)
              }

              if (ArrayCount(_last_results) > 1) {
                _obj["entry_" + OptInt(ev.entry_name.split('_')[1]) + 2] = _last_results[0] * 100 / _maxScore + "%"
                if (ArrayCount(_last_results) > 2) {
                  _obj["entry_" + OptInt(ev.entry_name.split('_')[1]) + 3] = _last_results[1] * 100 / _maxScore + "%"
                } else {
                  _obj["entry_" + OptInt(ev.entry_name.split('_')[1]) + 3] = "";
                }
              } else {
                _obj["entry_" + OptInt(ev.entry_name.split('_')[1]) + 2] = "";
                _obj["entry_" + OptInt(ev.entry_name.split('_')[1]) + 3] = "";
              }
            }

            _obj["entry_" + (OptInt(ev.entry_name.split('_')[1]) + 1)] = _start_date
          } else {
            _topScoreElem != undefined ? _obj[ev.entry_name] = _topScoreElem.score * 100 / _maxScore + "%" : _obj[ev.entry_name] = "";

          }
        } else {
          _topScoreElem != undefined ? _obj[ev.entry_name] = _topScoreElem.score : _obj[ev.entry_name] = "";
        }

      } else if (ev.object_type == 'custom') {
        _custom_field_value = _request_te.custom_elems.ObtainChildByKey(ev.object_id).value;
        if (_custom_field_value == 'true' || _custom_field_value == 'false') {
          _obj[ev.entry_name] = tools_web.is_true(_custom_field_value, false) ? 'Да' : 'Нет'
        } else {
          _obj[ev.entry_name] = _request_te.custom_elems.ObtainChildByKey(ev.object_id).value;
        }

      } else {
        _event_res = ArrayOptFirstElem(XQuery('for $elem in event_results where $elem/event_name="' + ev.object_id + '" and $elem/person_id=' + _request_te.person_id + ' and $elem/is_assist=true() return $elem')); //contains($elem/event_name,'"+ev.object_id+"')
        _obj[ev.entry_name] = _event_res != undefined ? "+" : "-";
      }
    }
    _RES.push(_obj);
  }
}

return _RES;