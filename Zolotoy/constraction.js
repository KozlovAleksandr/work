function experience (_hireDate) {
    exp = "";
    today = Date();
    diffYears = Year(today) - Year(_hireDate);
    if (diffYears > 0) {
        exp += diffYears + " г. "
    }
    diffMonths = Month(today) - Month(_hireDate);
    if (diffMonths > 0) {
        exp += diffMonths + " м. "
    }
    diffDays = Day(today) - Day(_hireDate);
    if (diffDays > 0) {
        exp += diffDays + " д. "
    }
    return exp;
}


user_id = SCOPE_WVARS.GetOptProperty("userid")
_avatar = tools_web.get_object_source_url("person", OptInt(user_id), {"type" : "150x150"});
personDOC = tools.open_doc(user_id);
personTE = personDOC.TopElem;
_name = ""+ personTE.firstname +" "+personTE.lastname;
_sex = ""+ personTE.sex;
_position = ""+ personTE.position_name;
_experience = experience(personTE.hire_date);



_newCourses = ArraySelectAll(XQuery("for $elem in courses where doc-contains($elem/id,'wt_data','[showCU=true]') return $elem"));

_courses = [];
for (course in _newCourses) {
    _course = {};
    _courseDOC = tools.open_doc(course.id);
    _courseTE = _courseDOC.TopElem;
    _course.name = ""+ _courseTE.name;
    _course.url = "_wt/" + _courseTE.id;
    _course.descr = ""+ _courseTE.desc;
    _course.imgURL = _courseTE.resource_id ? "/download_file.html?file_id=" + _courseTE.resource_id : "";
    _courses.push(_course)
}

RESULT = [{
    error: 0,
    avatar: _avatar,
    name: _name,
    sex: _sex,
    position: _position,
    experience: _experience,
    newCourses: _courses,
}]  
