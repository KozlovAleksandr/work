// НАСТРАИВАЕМЫЙ ОТЧЁТ

_RES = [];
_objects = ArraySelectAll(XQuery("for $el in object_datas where $el/object_data_type_id=7102399590557586373 return $el"));

for (_object in _objects) {
    _obj = {};

    _objectDoc = OpenDoc(UrlFromDocID(_object.id));
    if (_objectDoc != undefined) {
        _object_te = _objectDoc.TopElem;
        _obj.PrimaryKey = _object_te.id;
        _obj.code = _object_te.code;    // A

        _obj.component_type = _object_te.custom_elems.ObtainChildByKey("f_0ktl").value; // B
        _obj.component_code = _object_te.custom_elems.ObtainChildByKey("f_17l7").value; // C
        _obj.component_mission = _object_te.custom_elems.ObtainChildByKey("f_0gt8").value;  // D
        _obj.component_name = _object_te.custom_elems.ObtainChildByKey("f_pcv8").value; // E
        _obj.edit_type = _object_te.custom_elems.ObtainChildByKey("f_dy4u").value;  // F
        _obj.change_purpose = _object_te.custom_elems.ObtainChildByKey("f_komx").value; // G
        _obj.package_link = _object_te.custom_elems.ObtainChildByKey("f_dixy").value;   // H
        _obj.start_date = StrDate(_object_te.start_date, false);    // I

        _project_id = _object_te.custom_elems.ObtainChildByKey("f_4wq0").value; // J
        if (OptInt(_project_id)) {
            _project = ArrayOptFirstElem(XQuery("for $el in projects where $el/id=" + _project_id + " return $el"));
            if (_project != undefined) {
                _obj.project_name = _project.name;
            }
        } else {
            _obj.project_name = _project_id;
        }

        _client = ArrayOptFirstElem(XQuery("for $el in orgs where $el/id=" + _object_te.sec_object_id + " return $el"));    // K
        _obj.client = _client.disp_name;

        _executor_id = _object_te.custom_elems.ObtainChildByKey("f_qpq4").value;    // L
        _executor = ArrayOptFirstElem(XQuery("for $el in orgs where $el/id=" + _executor_id + " return $el"));
        _obj.executor = _executor.disp_name;

        _obj.executor_collaborator = _object_te.object_name;    // M
    }
    _RES.push(_obj);
}

return _RES;