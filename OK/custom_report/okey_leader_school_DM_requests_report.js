_RES = [];
_request_type_id = 6834376740098549468; // Записать в Школу лидерства - Заместитель Директора магазина
_last_clmn_num = 14;
// _webinars = [
//   {name: "Вебинар \"Искусство приводить дела в порядок\"", id:15},
//   {name: "Вебинар \"Эффективная коммуникация\"", id: 18},
//   {name: "Вебинар \"Обратная связь\"", id: 19},
//   {name: "Мастер-класс \"Эффективные совещания\"", id: 22},
//   {name: "Вебинар \"Эмоциональный интеллект\"", id: 24},
//   {name: "Вебинар \"Управление изменениями\"", id: 25}
//   ]

_closeDateBeg = {PARAM2} ? "and $elem/close_date >= date('" + StrDate({PARAM2}, false) + "')" : "";
_closeDateFin = {PARAM3} ? "and $elem/close_date <= date('" + StrDate({PARAM3}, false) + "')" : "";

_requests = XQuery("for $elem in requests where $elem/request_type_id=" +_request_type_id +" and $elem/status_id='close' " +_closeDateBeg +" " +_closeDateFin +" return $elem");

_events = [];

_searchParam = OptInt({PARAM1});

if (_searchParam != undefined) {
  _typical_program = ArrayOptFirstElem(XQuery("for $elem in typical_development_programs where $elem/id="+_searchParam+"  return $elem"));
  
  if (_typical_program != undefined) {
    _typical_program_id = _typical_program.id;
    _typDevProgDoc = OpenDoc(UrlFromDocID(_typical_program_id));
    _typDevProgDoc_te = _typDevProgDoc.TopElem;
    _tasks = _typDevProgDoc_te.tasks;
//    ids = [16, 17, 20, 21, 23, 26, 27, 28, 29, 30,]
    for (j = 0; j < ArrayCount(_tasks); j++) {
//      _last_clmn_num = ids[j]

        _task = _tasks[j];
        _task_number = _task.custom_elems.ObtainChildByKey("f_gepj").value;    

        if (_task_number != 0) {
          _podition_number = _last_clmn_num + OptInt(_task_number);
          _cc = columns[_podition_number];
          _cc.flag_formula = true;
          _cc.column_title = "" + _task.name;
          _cc.column_value = "ListElem.entry_" + _podition_number + "";
          _cc.datatype = "string";

          _event_obj = {};
          _event_obj.object_type = _task.object_type;
          _event_obj.object_id = _task.object_id;
          _event_obj.entry_name = "entry_" + _podition_number + "";
          _events.push(_event_obj);
//          _last_clmn_num++;
      }
    }
  }
} else 
{
  throw "Не указан ID типовой программы развития";
}

// for (i = 0; i < ArrayCount(_webinars); i++) {
//   _webinar = _webinars[i];
//   _cc = columns[_webinar.id];
//   _cc.flag_formula = true;
//   _cc.column_title = "" + _webinar.name;
//   _cc.column_value = "ListElem.entry_" + _webinar.id + "";
//   _cc.datatype = "string";
//   _event_obj = {};
//   _event_obj.object_type = "event";
//   _event_obj.object_id = _webinar.name;
//   _event_obj.entry_name = "entry_" + _webinar.id + "";
//   _events.push(_event_obj);
// //  _last_clmn_num++;
// }

_uniquePerson = [];
_uniquePersons = ArraySelectDistinct(_requests, "person_id");

for (_unPer in _uniquePersons) {
  _person = {};
  _person.id = _unPer.person_id;
  _market_sub = OptInt(tools.call_code_library_method( "okeylibTalentPool", "getPersonsMarketPlaceAndBosses", [ OptInt(_person.id)]).market_sub_id);
  _sub_div_reg_name = '';
  _market_name = '';
  if (_market_sub != undefined)
  {
	_subdivision = ArrayOptFirstElem(XQuery("for $elem in subdivisions where $elem/id="+_market_sub+" return $elem"));
	if (_subdivision != undefined)
	{
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
      _obj.create_date = OptDate(_request_te.create_date,'');
    _obj.confirm_date = OptDate(_request_te.close_date,'');
    
    _obj.phone_number = _request_te.custom_elems.ObtainChildByKey("f_6jvd").value;
    _obj.experience_years = _request_te.custom_elems.ObtainChildByKey("f_q86v").value; 
    _obj.experience_months = _request_te.custom_elems.ObtainChildByKey("f_v5y5").value;

    _obj.experience_category = _request_te.custom_elems.ObtainChildByKey("f_wp8v").value;
    _obj.moving = _request_te.custom_elems.ObtainChildByKey("f_td9m").value == 'true' ? "Да" : "";
    _obj.mentor = _request_te.custom_elems.ObtainChildByKey("f_8wc8").value == 'true' ? "Да" : "";

    _person_elem = _request_te.person_id.OptForeignElem;
    _obj.hire_date = _person_elem != undefined ? _person_elem.hire_date : "";
    _obj.tab_num = _person_elem != undefined ? _person_elem.code : "";
    _obj.person_fullname = _request_te.person_fullname;
    _obj.person_position_name = _request_te.person_position_name;
    _obj.person_subdivision_name = _request_te.person_subdivision_name;

    for (ev in _events) {
      if (ev.object_type != 'event') {   
        _fld_result = '';
        _search_catalog = '';
        if (ev.object_type == 'assessment') {
                _search_catalog = 'test_';
        }

        searchActiveResults = "for $elem in active_"+_search_catalog+"learnings where $elem/"+ev.object_type+"_id=" +ev.object_id +" and $elem/person_id=" +_request.person_id +" return $elem";
        searchFinishedResults = "for $elem in "+_search_catalog+"learnings where $elem/"+ev.object_type+"_id=" +ev.object_id + " and $elem/person_id=" + _request.person_id +" return $elem";
        _learning_results = ArrayUnion(XQuery(searchActiveResults), XQuery(searchFinishedResults));

        _topScoreElem = ArrayOptMax(_learning_results, "This.score");
        if (ev.object_type == 'assessment') {
          _topScoreElem != undefined ? _obj[ev.entry_name] = _topScoreElem.score * 100 / _maxScore + "%" : _obj[ev.entry_name] = "";
        } else {
          _topScoreElem != undefined ? _obj[ev.entry_name] = _topScoreElem.score : _obj[ev.entry_name] = "";
        }
      } else {
        _event_res = ArrayOptFirstElem(XQuery("for $elem in event_results where $elem/event_name='"+ev.object_id+"' and $elem/person_id="+_request_te.person_id+" and $elem/is_assist=true() return $elem"));
        _obj[ev.entry_name] = _event_res != undefined ? "+" : "-";
      }

    }
    _RES.push(_obj);
  }
}

return _RES;