
iTaskID = OptInt( iTaskID, OptInt(sTaskID) );
_cur_task = ArrayOptFirstElem(XQuery("for $tsk in tasks where $tsk/id="+iTaskID+" return $tsk"));
_cur_task_name = _cur_task != undefined ? _cur_task.name : "";

switch (command) {	
	case "eval": {
		RESULT = {
			command: "display_form",
			title: "Внесение трудозатрат",
			form_fields:
			[
				{name: "task_name", label: "Название задачи", type: "string", value: _cur_task_name, disabled: true},
				{name: "col_id", label: "Сотрудник", type: "foreign_elem", catalog: "collaborator", mandatory: true},
				{name: "hours_spent", label: "Затрачено часов", type: "integer", mandatory: true, validation: "number"},
				{name: "date", label: "Дата", type: "date", value: Date(), mandatory: true, validation: "nonempty"},
				{name: "comment", label: "Комментарий", type: "text", value: "", richtext: true}
			],
			buttons:
			[
				{name: "save", label: "Сохранить", type: "submit"},
				{name: "cancel", label: "Отмена", type: "cancel"},
			]
		}
		break;
	}
	case "submit_form": {
		cur_form_fields = ParseJson(SCOPE_WVARS.form_fields);
		_task_name = ArrayOptFind(cur_form_fields, "This.name == 'task_name' ").value;
		_coll_id = ArrayOptFind(cur_form_fields, "This.name == 'col_id' ").value;
		_hours_spent = ArrayOptFind(cur_form_fields, "This.name == 'hours_spent' ").value;
		_date = ArrayOptFind(cur_form_fields, "This.name == 'date' ").value;
		_comment = ArrayOptFind(cur_form_fields, "This.name == 'comment' ").value;
		
		_doc_new_time_entry = tools.new_doc_by_name("time_entry", false);
		
		_te_new_time_entry = _doc_new_time_entry.TopElem;
		_te_new_time_entry.code = "time_entry";
		_te_new_time_entry.name = curObject.name;
		_te_new_time_entry.task_id = iTaskID;
		_te_new_time_entry.task_name = _task_name;
		_te_new_time_entry.person_id = _coll_id;
		
		_coll = ArrayOptFirstElem(XQuery("for $coll in collaborators where $coll/id="+_coll_id+" return $coll"));
		_te_new_time_entry.org_id = _coll.org_id;
		_te_new_time_entry.person_fullname = _coll.fullname;
		
		_te_new_time_entry.duration = _hours_spent;
		_te_new_time_entry.start_date = _date;
		_te_new_time_entry.description = _comment;
		_doc_new_time_entry.BindToDb(DefaultDb);
		_doc_new_time_entry.Save();

		RESULT = {
			command: "close_form",
			msg: "Трудозатраты внесены"
		}
		break;
	}
}
