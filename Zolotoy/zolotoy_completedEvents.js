arrResult = []
user_id = SCOPE_WVARS.GetOptProperty('userid');
_completedCourses = ArraySelectAll(XQuery('for $i in learnings where $i/person_id='+user_id+' return $i')); 
_completedTests = ArraySelectAll(XQuery('for $i in test_learnings where $i/person_id='+user_id+' return $i')); 

statusDescr = ["Назначен", "В процессе", "Завершён", "Не пройден", "Пройден", "Просмотрен"]

if (ArrayCount(_completedCourses) > 0) {
	for (_course in _completedCourses) {
		obj = {};
		obj.name = ""+ _course.course_name;
		obj.state = statusDescr[_course.state_id];
		obj.strDate = _course.max_end_date ? ""+ ParseDate(_course.max_end_date) : "Без срока";
		obj.type_name = "Электроный курс";
		arrResult.push(obj)
	}
}

if (ArrayCount(_completedTests) > 0) {
	for (_test in _completedTests) {
		obj = {};
		obj.name = ""+ _test.assessment_name;
		obj.state = statusDescr[_test.state_id];
		obj.strDate = _test.max_end_date ? ""+ ParseDate(_test.max_end_date) : "Без срока";
		obj.type_name = "Тест";
		arrResult.push(obj)
	}
}


RESULT = arrResult;
