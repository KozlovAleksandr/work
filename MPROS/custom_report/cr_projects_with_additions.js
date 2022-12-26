_RES = [];
_planProjects = [];
_restProjects = [];
_selected_group = OptInt(_CRITERIONS[1].value);
_count_estimate_time_from_cf = tools_web.is_true(_CRITERIONS[2].value,false);
_object_data_type_elem = ArrayOptFirstElem(XQuery("for $elem in object_data_types where $elem/code='project_checkpoints_reports' return $elem"));
_object_data_type_id = _object_data_type_elem != undefined ? OptInt(_object_data_type_elem.id) : undefined;
try {
  if (_selected_group != undefined)
  {
	  _team_participants = ArrayExtract(XQuery("for $elem in group_collaborators where $elem/group_id="+_selected_group+" return $elem"),'This.collaborator_id');
	  _group_team_participants = ArrayExtract(XQuery("for $elem in group_collaborators where MatchSome($elem/collaborator_id,("+ArrayMerge(_team_participants,'This',',')+")) return $elem"),'This.group_id');
	  _all_team_participants_ids = ArrayMerge(ArrayUnion(_team_participants,_group_team_participants),'This',',');
	  _project_participants = ArrayMerge(XQuery("for $elem in project_participants where MatchSome($elem/object_id,("+_all_team_participants_ids+")) and ForeignElem($elem/project_id)/org_id!=6698365626107897232  return $elem"),'This.project_id',',');
	  _projects = ArraySelectDistinct(XQuery("for $elem in projects where MatchSome($elem/id,("+_project_participants+")) return $elem"));
	  alert(ArrayOptFind(_projects, "This.id == 7145089413577901025") != undefined)

  }
  else
    _projects = ArraySelectDistinct(XQuery("for $elem in projects where $elem/id!=6698365626107897232 return $elem"));
  

  for (_project in _projects) {
    _tasks = [];
    _time_entries = [];
    _obj = {};

    switch (_project.status) {
      case "plan":
        _obj.status = "Планируется";
        _obj.priority = 4;
        break;
      case "project":
        _obj.status = "Проект";
        _obj.priority = 4;
        break;
      case "cancel":
        continue;
        break;
      case "active":
        _obj.status = "В работе";
        _obj.priority = 1;
        break;
      case "close":
        _obj.status = "Завершен";
        _obj.priority = 0;
        break;
    }

    projectDoc = tools.open_doc(OptInt(_project.id));
    projecTE = projectDoc.TopElem;

    _obj.task_value = 0;
    _obj.time_entry = 0;
    _obj.time_left = 0;
    _obj.PrimaryKey = _project.id;
    _obj.org_name = _project.org_id
      ? _project.org_id.OptForeignElem.disp_name
      : "";
    _obj.year = OptDate(_project.start_date_plan) != undefined ? Year(OptDate(_project.start_date_plan)) : Year(Date());
    _obj.name = _project.name;
    _obj.task_value = OptInt(projecTE.custom_elems.ObtainChildByKey('estimate_of_time').value,0);
    _obj.start_date_plan = DateNewTime(_project.start_date_plan);
    _obj.end_date_plan = DateNewTime(_project.end_date_plan);
    _obj.reason_for_discrepancy = projecTE.custom_elems.ObtainChildByKey('reason_for_discrepancy').value;
    _obj.comments = projecTE.comment;
    _obj.availability_of_akt = projecTE.custom_elems.ObtainChildByKey('availability_of_akt').value=='true' ? "да" : "нет";
    _obj.list_of_objects = OptInt(projecTE.custom_elems.ObtainChildByKey('poll_result_in_project').value)!= undefined?OptInt(projecTE.custom_elems.ObtainChildByKey('poll_result_in_project').value):'';


    contractElem = _project.contract_id.OptForeignElem;

    if (contractElem != undefined) {
      _obj.contract_name = contractElem.name;
      _obj.contract_date = contractElem.date;
    }

    _obj.est_status = projecTE.custom_elems.ObtainChildByKey("estimate_status").value;
	_obj.payment_status = projecTE.custom_elems.ObtainChildByKey("payment_status").value;
	if (Trim(_obj.payment_status) == '' && _project.status == 'close')
		_obj.payment_status = 'Требуется изменение статуса';
		
	_obj.payment_comment = projecTE.custom_elems.ObtainChildByKey("payment_comment").value;
	
    _tasks = ArrayUnion(
      _tasks,
      XQuery(
        "for $elem in tasks where $elem/source_object_type='project' and $elem/source_object_id=" +
          OptInt(_project.id) +
          "  return $elem"
      )
    );
	_count_estimate_time_from_cf_flag = (_count_estimate_time_from_cf && _obj.task_value != 0);
	_obj.count_estimate_time_from_cf_flag = _count_estimate_time_from_cf_flag ? "да" : "нет";
    for (_task in _tasks) 
	{
		  _time_entries = ArrayUnion(
			_time_entries,
			XQuery(
			  "for $elem in time_entrys where $elem/task_id=" +
				OptInt(_task.id) +
				" return $elem"
			)
		  );
		  if (!_count_estimate_time_from_cf_flag)
		  {
			  if (_task.value) {
				if (_task.task_type_id == 7033440429302575508)
				  _obj.task_value += OptInt(_task.value);
			  }
		  }
    }

    for (_time_entry in _time_entries) {
      if (_time_entry.duration) _obj.time_entry += OptInt(_time_entry.duration);
    }
	_obj.time_result = ((OptInt(_obj.time_left,0)+OptInt(_obj.time_entry,0))-OptInt(_obj.task_value,0));
	
    _proj_tasks = XQuery(
      "for $t in tasks where $t/source_object_id=" +
        _project.id +
        " and $t/task_type_id != 7033440429302575508 return $t"
    );
    _proj_task_executes = ArrayMerge(
      XQuery(
        "for $c in collaborators where MatchSome($c/id, (" +
          ArrayMerge(_proj_tasks, "This.executor_id", ",") +
          ")) return $c"
      ),
      "This.fullname",
      ","
    );

    _max_task_exec_name = "";
    _old_count_tasks = 0;

    for (_proj_task in ArraySelectDistinct(_proj_tasks, "executor_id")) {
      _count_tasks = ArrayCount(
        ArraySelectByKey(_proj_tasks, _proj_task.executor_id, "executor_id")
      );
      if (OptInt(_count_tasks, 0) > OptInt(_old_count_tasks, 0)) {
        _old_count_tasks = _count_tasks;

        _project_executors = XQuery(
          "for $c in collaborators where $c/id=" +
            _proj_task.executor_id +
            " return $c"
        );

        _project_executor = ArrayOptFirstElem(_project_executors);

        _max_task_exec_name =
          _project_executor != undefined
            ? _project_executor.fullname
            : _max_task_exec_name;
      }
    }

    _obj.proj_task_executes = _proj_task_executes;
    _obj.max_task_exec_name = _max_task_exec_name;

    _obj.time_left = OptReal(_obj.task_value,0) - OptReal(_obj.time_entry,0);
	
	/*контрольные точки*/
	
	if (_object_data_type_id != undefined)
	{
		_cp_elem = ArrayOptMax(XQuery("for $elem in object_datas where $elem/status_id='active' and $elem/object_id="+_project.id+" return $elem"),'OptDate(This.create_date)');
		if (_cp_elem != undefined)
		{
			_cp_doc = tools.open_doc(_cp_elem.id);
			if (_cp_doc != undefined)
			{
				_cpTE = _cp_doc.TopElem;
				for (_cf in _cpTE.custom_elems)
					_obj.SetProperty(_cf.name, _cf.value);
				
				_obj.cp_date = _cpTE.create_date;
				
			}
		}
	}
	/**/
	
    if (_obj.status == "Планируется") {
      _planProjects.push(_obj);
    } else {
      _restProjects.push(_obj);
    }
  }
} catch (err) {
  alert("REPORT ERROR: " + err);
}

for (project in _planProjects) {
  if (
	OptDate(project.start_date_plan) != undefined &&
    DateDiff(project.start_date_plan, Date()) / 86400 <= 31 &&
    project.est_status == "Согласована"
  ) {
    project.priority = 2;
  } else if (
	OptDate(project.start_date_plan) != undefined &&
    DateDiff(project.start_date_plan, Date()) / 86400 > 31 &&
    project.est_status == "Согласована"
  ) {
    project.priority = 3;
  }
}

_RES = ArraySort(ArrayUnion(_planProjects, _restProjects),'This.org_name','+','This.name','+');

/*leaders_group = XQuery(
  "for $elem in func_managers where $elem/person_id =" +
    OptInt(initiator_person_id) +
    " and $elem/catalog='collaborator' return $elem"
);

for (person in leaders_group) {
  _cc = columns.AddChild();
  _cc.flag_formula = true;
  _cc.column_title = person.object_name;
  _cc.column_value = person.object_name;
  _cc.datatype = "string";
}*/

return _RES;
