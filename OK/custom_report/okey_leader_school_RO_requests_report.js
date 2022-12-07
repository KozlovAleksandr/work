_RES = [];
_request_type_id = 6803673793030878258; // Тип заявки - Записать в Школу лидерства - Руководитель отдела
_last_clmn_num = 10;

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
  { title: 'Дата интервью_магазин', field: 'interview_shop_date', elem: 'f_ys6p', forCount: false },
  { title: 'Статус сотрудника по итогам интервью_магазин', field: 'interview_result_shop', elem: 'f_m3b5', forCount: false },
  { title: 'Дата интервью', field: 'interview_date', elem: 'f_n30n', forCount: false },

  { title: 'Оценка  Нацеленность на достижение результата', field: 'achieving_results', elem: 'f_dugo', forCount: true },
  { title: 'Оценка Создание благоприятной атмосферы в команде', field: 'favorable_atmosphere', elem: 'f_0fmp', forCount: true },
  { title: 'Оценка Клиентоориентированность', field: 'customer_focus', elem: 'f_o0na', forCount: true },
  { title: 'Оценка  Эффективная организация работы', field: 'efficient_organization', elem: 'f_24q9', forCount: true },
  { title: 'Оценка Анализ информации и принятие решений', field: 'analysis_decision', elem: 'f_pfsj', forCount: true },
  { title: 'Оценка  Обучение и развитие персонала', field: 'staff_training', elem: 'f_hf77', forCount: true },

  { title: 'Средний балл', field: 'average_score', elem: 'average_score', forCount: true },

  { title: 'Статус сотрудника по итогам интервью_регион', field: 'interview_result_region', elem: 'f_2p9l', forCount: false },
  { title: 'Ответственный ЗДГМ_наставник для статуса "Рекомендован на ЗРО/РО"', field: 'responsible_ZDGM_mentor', elem: 'f_388l', forCount: false },
  { title: 'Наставник_другой ГМ', field: 'another_mentor', elem: 'f_tu06', forCount: false },

  { title: 'Опыт работы с категориями', field: 'experience_category', elem: 'f_nf6v', forCount: false },
  { title: 'Готовность к переезду (указать города)', field: 'moving', elem: 'f_9ibs', forCount: false },
  { title: 'Является ли наставником', field: 'mentor', elem: 'f_fgoa', forCount: false },

  { title: 'Карьерный путь в ОКЕЙ (рост в должности) - при наличии', field: 'f_9kzy', elem: 'f_9kzy', forCount: false },
  { title: 'История успеха (отметка, в случае назначения на РО/ЗРО)', field: 'f_bfcl', elem: 'f_bfcl', forCount: false },
  { title: 'Новая должность', field: 'new_position', elem: 'new_position', forCount: false },
  { title: 'Дата назначения', field: 'appointment_date', elem: 'f_pzpo', forCount: false },
  { title: 'Новый отдел', field: 'new_department', elem: 'new_department', forCount: false },
  { title: 'Новый магазин', field: 'new_shop', elem: 'new_shop', forCount: false },
  { title: 'группа Карьера в ОКЕЙ (Вконтакте)', field: 'f_4ky8', elem: 'f_4ky8', forCount: false }
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
    if (StrContains(_field.field, '_date', true)) {
      _custom_obj.object_type = 'custom_date';
    } else if (StrContains(_field.field, 'new_', true)) {
      _custom_obj.object_type = 'custom_new';
    }
    else {
      _custom_obj.object_type = 'custom';
    }
    _custom_obj.object_id = _field.elem;
    _custom_obj.entry_name = "entry_" + _field_number + "";
    _custom_obj.forCount = _field.forCount;
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
  _person.market = _market_name;  // текущий магазин
  _person.region = _sub_div_reg_name;
  _person_member = _unPer.person_id.OptForeignElem;
  _person.current_state = _person_member != undefined ? _person_member.current_state : '';
  //!!
  _person.current_position_name = _person_member != undefined ? _person_member.position_name : '';  // текущая позиция
  _person.current_subdivision_name = _person_member != undefined ? _person_member.position_parent_name : '';  // текущий отдел
  //!!
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

    //    _obj.market = _current_person != undefined ? String(_current_person.market) : '';

    _obj.current_state = _current_person != undefined ? String(_current_person.current_state) : '';
    _obj.create_date = OptDate(_request_te.create_date, '');
    _obj.confirm_date = OptDate(_request_te.close_date, '');

    _obj.experience_months = OptInt(_request_te.custom_elems.ObtainChildByKey("f_tr5d").value, "-");
    _obj.experience_years = OptInt(_request_te.custom_elems.ObtainChildByKey("f_dgkw").value, "-");
    _obj.phone_number = String(_request_te.custom_elems.ObtainChildByKey("f_plws").value);
    _obj.workflow_state = _request_te.workflow_state_name;

    _person_elem = _request_te.person_id.OptForeignElem;
    _obj.hire_date = _person_elem != undefined ? _person_elem.hire_date : "";
    _obj.tab_num = _person_elem != undefined ? _person_elem.code : "";
    _obj.person_fullname = _request_te.person_fullname;
    _obj.person_position_name = _request_te.person_position_name; // первоначальная позиция
    _obj.person_subdivision_name = _request_te.person_subdivision_name; // первоначальный отдел

    _top_sub = _request_te.person_subdivision_id;
    _top_sub = ArrayOptFirstElem(XQuery("for $elem in subdivisions where $elem/id=" + _top_sub + " return $elem"));

    max_cycle_counter = 0;
    if (!StrBegins(Trim(_top_sub.name), 'ГМ ', true) && !StrBegins(Trim(_top_sub.name), 'СМ ', true)) {
      while (!StrBegins(Trim(_top_sub.name), 'ГМ ', true) || !StrBegins(Trim(_top_sub.name), 'СМ ', true) || OptInt(_top_sub.parent_object_id) != undefined) {
        if (_top_sub != undefined && _top_sub.parent_object_id != undefined) {
          _top_sub = ArrayOptFirstElem(XQuery("for $elem in subdivisions where $elem/id=" + _top_sub.parent_object_id + " return $elem"));
        } else {
          break;
        }

        max_cycle_counter++;
        if (max_cycle_counter > 6 || _top_sub == undefined || (_top_sub != undefined && (StrBegins(Trim(_top_sub.name), 'ГМ ', true) || StrBegins(Trim(_top_sub.name), 'СМ ', true)))) {
          max_cycle_counter = 0;
          break;
        }
      }
    }

    _person_subs = [];
    _person_subs = tools.get_sub_hierarchy(OptInt(_top_sub.id), 'subdivision', 'parent_object_id');
    if (ArrayCount(_person_subs) > 0) {
      _market_sub = _person_subs[0];
      _obj.market = _market_sub.name; // первоначальный магазин
    } else {
      _obj.market = '';
    }

    _marks_for_avarage = []
    for (ev in _events) {
      if (ev.object_type != 'event' && ev.object_type != 'custom' && ev.object_type != 'custom_date' && ev.object_type != 'custom_new') {
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
        _sort_results = ArraySort(_learning_results, 'This.start_usage_date', '+');

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
                //                if (_result.score == _topScoreElem.score) continue;
                _last_results.push(_result.score)
              }

              _ent = OptInt(ev.entry_name.split('_')[1]);

              if (ArrayCount(_last_results) > 0) {
                _obj["entry_" + (_ent - 1)] = _last_results[0] * 100 / _maxScore + "%";
                if (ArrayCount(_last_results) > 1) {
                  _obj["entry_" + (_ent)] = _last_results[1] * 100 / _maxScore + "%"
                } else {
                  _obj["entry_" + (_ent)] = "";
                }
              } else {
                _obj["entry_" + (_ent - 1)] = "";
                _obj["entry_" + (_ent)] = "";
              }
            }
            _obj["entry_" + (_ent - 2)] = _start_date;
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
        } else if (ev.forCount) {
          if (ev.object_id != 'average_score') {
            _marks_for_avarage.push(_custom_field_value)
            _obj[ev.entry_name] = _custom_field_value;
          } else {
            _marsArr = ArraySelect(_marks_for_avarage, "This != ''")
            _mark = 0;
            for (m in _marsArr) {
              _mark += OptInt(m);
            }
            if (_mark != 0) {
              _obj[ev.entry_name] = StrRealFixed(Real(_mark) / _marsArr.length, 2);
            } else {
              _obj[ev.entry_name] = ''
            }
          }
        } else {
          _obj[ev.entry_name] = _custom_field_value;
        }
      } else if (ev.object_type == 'custom_date') {
        _obj[ev.entry_name] = ParseDate(_request_te.custom_elems.ObtainChildByKey(ev.object_id).value);
      } else if (ev.object_type == 'custom_new') {
        switch (ev.object_id) {
          case 'new_position':
            _obj[ev.entry_name] = _current_person != undefined ? String(_current_person.current_position_name) : '';
            break;
          case 'new_department':
            _obj[ev.entry_name] = _current_person != undefined ? String(_current_person.current_subdivision_name) : '';
            break;
          case 'new_shop':
            _obj[ev.entry_name] = _current_person != undefined ? String(_current_person.market) : '';
            break;
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